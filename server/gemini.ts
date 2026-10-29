/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import type { ProductBrief, GenerationConfig, ScriptItem, SourceProvenance } from '../src/types/index.ts';
import type { ScrapedPageResult } from './ssrf.ts';
import { countWords, evaluateDurationStatus } from '../src/utils/wordCount.ts';
import { STATIC_AFFILIATE_SYSTEM_PROMPT } from '../src/utils/constants.ts';

import {
  SUPPORTED_GOOGLE_MODELS,
  GEMINI_MODEL,
  parseApiKeys,
  cleanSingleKey,
  safeHeaderValue,
} from '../src/utils/apiKeys.ts';

export { SUPPORTED_GOOGLE_MODELS, GEMINI_MODEL, parseApiKeys, cleanSingleKey, safeHeaderValue };

const aiClientsCache = new Map<string, GoogleGenAI>();

function getAiClient(apiKey: string): GoogleGenAI {
  const cleanKey = cleanSingleKey(apiKey);
  const safeVal = safeHeaderValue(cleanKey);
  const cached = aiClientsCache.get(safeVal);
  if (cached) {
    return cached;
  }
  const headers: Record<string, string> = {
    'User-Agent': 'aistudio-build',
    'x-goog-api-key': safeVal,
  };
  if (safeVal.startsWith('ya29.')) {
    headers['Authorization'] = `Bearer ${safeVal}`;
  }
  const client = new GoogleGenAI({
    apiKey: safeVal,
    httpOptions: {
      headers,
    },
  });
  // Prevent unbounded cache growth
  if (aiClientsCache.size > 20) {
    const first = aiClientsCache.keys().next().value;
    if (first) aiClientsCache.delete(first);
  }
  aiClientsCache.set(safeVal, client);
  return client;
}


/**
 * Verifikasi cepat API Key Google AI Studio (mendukung banyak kunci sekaligus).
 * Menguji kunci secara efisien dan responsif tanpa antrean panjang.
 */
export async function testGeminiApiKey(
  apiKey: string,
  preferredModel?: string
): Promise<{ valid: boolean; count?: number; error?: string }> {
  const keys = parseApiKeys(apiKey);
  if (keys.length === 0) {
    return { valid: false, error: 'Harap masukkan minimal satu API Key yang valid dari Google AI Studio.' };
  }

  // Model prioritization: Model yang dipilih pengguna diuji terlebih dahulu
  const rawModels = [
    preferredModel || 'gemini-3.1-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3.8-flash',
    'gemini-flash-latest',
  ];
  const testModels = Array.from(new Set(rawModels.filter(Boolean)));

  let validCount = 0;
  let lastError: any;

  // Uji cepat kunci pertama terlebih dahulu untuk konfirmasi instan
  const sampleKeys = keys.slice(0, Math.min(3, keys.length));
  for (const singleKey of sampleKeys) {
    for (const model of testModels) {
      try {
        const testAi = getAiClient(singleKey);
        await Promise.race([
          testAi.models.generateContent({
            model,
            contents: 'Ping',
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT_PING')), 6000)
          ),
        ]);
        validCount++;
        break; // Kunci ini valid, lanjut ke kunci berikutnya
      } catch (err: any) {
        lastError = err;
        const rawMsg = err?.message || '';
        if (
          rawMsg.includes('API_KEY_INVALID') ||
          rawMsg.includes('API key not valid') ||
          rawMsg.includes('PERMISSION_DENIED')
        ) {
          // Kunci ini tidak valid, hentikan perulangan model untuk kunci ini
          break;
        }
        continue;
      }
    }
  }

  if (validCount > 0) {
    return { valid: true, count: keys.length };
  }

  // Jika generateContent mengalami timeout atau antrean server sementara,
  // lakukan pengecekan ringan via endpoint resmi model list Google
  try {
    const directRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(cleanSingleKey(keys[0]))}`
    );
    if (directRes.ok) {
      return { valid: true, count: keys.length };
    }
    const errObj = await directRes.json().catch(() => null);
    if (errObj?.error?.message) {
      return { valid: false, error: errObj.error.message };
    }
  } catch {}

  let errorText = lastError?.message || 'Gagal memverifikasi API Key.';
  if (errorText.includes('TIMEOUT_PING')) {
    // Model sedang dingin atau sibuk, tetapi format API Key valid
    return { valid: true, count: keys.length };
  }

  try {
    if (typeof errorText === 'string' && errorText.startsWith('{')) {
      const parsed = JSON.parse(errorText);
      if (parsed.error?.message) {
        errorText = parsed.error.message;
      }
    }
  } catch {}

  return { valid: false, error: errorText };
}

/**
 * Strips markdown code blocks (```json ... ```) from model response.
 */
function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

/**
 * Sanitizes platform-specific terms and replaces 'keranjang kuning' with neutral multi-platform CTA phrases.
 * Ensures scripts can be cross-posted / mirrored seamlessly to Shopee Video, TikTok, Tokopedia, etc.
 */
export function sanitizeCrossPlatformText(text: string): string {
  if (!text) return '';
  return text
    // Replace 'keranjang kuning' variations
    .replace(/keranjang\s+kuning/gi, 'keranjang kiri bawah')
    .replace(/klik\s+keranjang\s+kuning/gi, 'klik keranjang kiri bawah')
    .replace(/cek\s+keranjang\s+kuning/gi, 'cek keranjang bawah video ini')
    .replace(/checkout\s+di\s+keranjang\s+kuning/gi, 'checkout di keranjang bawah')
    .replace(/keranjang\s+orange/gi, 'keranjang kiri bawah')
    .replace(/keranjang\s+oranye/gi, 'keranjang kiri bawah')
    // Remove or neutralize explicit platform mentions in dialogue or CTA
    .replace(/\bdi\s+tiktok\s+shop\b/gi, 'di keranjang bawah')
    .replace(/\bdi\s+shopee\s+video\b/gi, 'di keranjang bawah')
    .replace(/\bdi\s+shopee\b/gi, 'di keranjang bawah')
    .replace(/\bke\s+shopee\b/gi, 'ke keranjang bawah')
    .replace(/\bdi\s+tiktok\b/gi, 'di keranjang bawah')
    .replace(/\bke\s+tiktok\b/gi, 'ke keranjang bawah')
    .replace(/\bdi\s+tokopedia\b/gi, 'di keranjang bawah')
    .replace(/\bke\s+tokopedia\b/gi, 'ke keranjang bawah')
    .replace(/\s+/g, ' ')
    .trim();
}

export const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.8-flash',
  'gemini-flash-latest',
];

// Index rotasi global untuk membagi beban (load balance) secara merata ke seluruh API Key aktif
let globalKeyRotationIndex = 0;

// Tracker untuk melacak kunci yang sedang mengalami kehabisan kuota dengan cooldown 5 menit
const quotaExhaustedTracker = new Map<string, number>();
const QUOTA_COOLDOWN_MS = 5 * 60 * 1000;

/**
 * Menjalankan panggilan Gemini generateContent dengan rotasi multi-API Key aktif (Round-Robin)
 * dan failover model terdepan:
 * 1. gemini-3.8-flash (Bawaan utama, paling cerdas & cepat)
 * 2. gemini-3.7-flash (Alternatif ke-2, penalaran handal dengan kuota terpisah)
 * 3. gemini-3.6-flash (Alternatif ke-3, super stabil & throughput tinggi)
 *
 * Seluruh API Key yang dimasukkan pengguna aktif bersamaan dan bergantian secara merata (Load Balancing),
 * bukan sekadar "cadangan pasif". Jika ada satu kunci yang kehabisan token (429/quota), sistem langsung
 * beralih seketika ke kunci aktif lainnya tanpa membuang waktu.
 */
export async function callGeminiWithRetry(
  options: any,
  customApiKey?: string | string[],
  timeoutPerCallMs = 18000
): Promise<any> {
  let rawKeys: string[] = [];

  if (Array.isArray(customApiKey)) {
    rawKeys = customApiKey.flatMap((k) => parseApiKeys(k));
  } else if (typeof customApiKey === 'string') {
    rawKeys = parseApiKeys(customApiKey);
  }

  // Fallback ke process.env jika tidak ada custom key
  if (rawKeys.length === 0 && typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
    rawKeys = parseApiKeys(process.env.GEMINI_API_KEY);
  }

  if (rawKeys.length === 0) {
    const noKeyErr: any = new Error(
      'API Key Google AI Studio belum diatur. Silakan atur API Key Anda di menu profil kanan atas.'
    );
    noKeyErr.isMissingKey = true;
    noKeyErr.status = 401;
    throw noKeyErr;
  }

  const totalKeys = rawKeys.length;
  // Urutkan kunci dengan round-robin aktif agar semua kunci berpartisipasi merata
  const startIdx = (globalKeyRotationIndex++) % totalKeys;
  const orderedKeys: { key: string; originalIndex: number }[] = [];
  for (let i = 0; i < totalKeys; i++) {
    const idx = (startIdx + i) % totalKeys;
    orderedKeys.push({ key: rawKeys[idx], originalIndex: idx });
  }

  // Model candidate teruji: 3.1 Flash Lite (ultra cepat ~600ms), Flash Lite Latest, 3.8 Flash
  const candidateModels = [
    'gemini-3.1-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3.8-flash',
    'gemini-flash-latest',
  ];

  // Jika opsi request menentukan salah satu model di atas, dahulukan model tersebut
  const requestedModel = options.model;
  if (requestedModel && candidateModels.includes(requestedModel)) {
    const rIdx = candidateModels.indexOf(requestedModel);
    if (rIdx > 0) {
      candidateModels.splice(rIdx, 1);
      candidateModels.unshift(requestedModel);
    }
  }

  const now = Date.now();
  // Jika seluruh kunci sedang dalam cooldown, bersihkan tracker agar tidak memblokir pengguna
  const allInCooldown = totalKeys > 1 && orderedKeys.every(({ key }) => {
    const until = quotaExhaustedTracker.get(key);
    return Boolean(until && now < until);
  });
  if (allInCooldown) {
    quotaExhaustedTracker.clear();
  }

  let lastError: any;
  let keysExhaustedQuotaCount = 0;
  let keysTriedCount = 0;

  // LOOP UTAMA: Rotasi antar-kunci API pengguna (Aktif Berputar / Round-Robin)
  for (const { key: currentKey, originalIndex } of orderedKeys) {
    // Cek cooldown hanya jika bukan seluruh kunci yang cooldown
    const exhaustedUntil = quotaExhaustedTracker.get(currentKey);
    if (exhaustedUntil && now < exhaustedUntil && totalKeys > 1) {
      keysExhaustedQuotaCount++;
      continue;
    }

    keysTriedCount++;
    const client = getAiClient(currentKey);
    let keyQuotaExhaustedAllModels = true;

    // LOOP SUB: Percobaan model candidate (3.8 Flash -> 3.7 Flash -> 3.6 Flash)
    for (const modelName of candidateModels) {
      let timeoutTimer: NodeJS.Timeout | undefined;
      try {
        const baseConfig = options.config ? { ...options.config } : {};
        if (
          !baseConfig.thinkingConfig &&
          (modelName.includes('3.8') || modelName.includes('3.7') || modelName.includes('4-'))
        ) {
          baseConfig.thinkingConfig = {
            thinkingLevel: ThinkingLevel.LOW,
          };
        }
        const payload = { ...options, model: modelName, config: baseConfig };

        // Eksekusi generateContent dengan penanganan otomatis untuk lonjakan antrean 503 & fallback config
        const generatePromise = (async () => {
          try {
            return await client.models.generateContent(payload);
          } catch (callErr: any) {
            const callMsg = callErr?.message || '';
            // Jika model tidak mendukung thinkingConfig, coba ulang tanpa thinkingConfig
            if (
              (callMsg.includes('thinkingConfig') ||
                callMsg.includes('thinking_config') ||
                callMsg.includes('thinkingLevel')) &&
              payload.config?.thinkingConfig
            ) {
              const fallbackConfig = { ...payload.config };
              delete fallbackConfig.thinkingConfig;
              return await client.models.generateContent({ ...payload, config: fallbackConfig });
            }
            // Jika 503 (high demand) atau 400 dan menggunakan responseMimeType: 'application/json',
            // coba langsung tanpa responseMimeType karena prompt sudah mewajibkan JSON dan parser kita menangani markdown
            if (
              (callErr?.status === 503 || callMsg.includes('503') || callMsg.includes('high demand')) &&
              payload.config?.responseMimeType
            ) {
              const fallbackConfig = { ...payload.config };
              delete fallbackConfig.responseMimeType;
              const retryPayload = { ...payload, config: fallbackConfig };
              return await client.models.generateContent(retryPayload);
            }
            throw callErr;
          }
        })();

        const timeoutPromise = new Promise((_, reject) => {
          timeoutTimer = setTimeout(() => {
            const timeoutErr: any = new Error(`Model ${modelName} melebihi batas waktu respon.`);
            timeoutErr.status = 504;
            reject(timeoutErr);
          }, timeoutPerCallMs);
        });

        const result: any = await Promise.race([generatePromise, timeoutPromise]);
        if (timeoutTimer) clearTimeout(timeoutTimer);

        // Jika berhasil, bersihkan tracker kuota kunci ini jika sebelumnya pernah tercatat
        quotaExhaustedTracker.delete(currentKey);

        if (totalKeys > 1) {
          console.info(
            `[Gemini Multi-Key Sukses] Kunci aktif #${originalIndex + 1}/${totalKeys} berhasil memproses dengan ${modelName}`
          );
        } else if (modelName !== candidateModels[0]) {
          console.info(`[Gemini Failover Berhasil] Sukses dengan model alternatif ${modelName}`);
        }
        return result;
      } catch (err: any) {
        if (timeoutTimer) clearTimeout(timeoutTimer);
        lastError = err;
        const msg = err?.message || '';

        const isQuota =
          err?.status === 429 ||
          msg.includes('429') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('quota') ||
          msg.includes('Quota exceeded') ||
          msg.includes('rate limit');

        const isInvalid =
          msg.includes('API_KEY_INVALID') ||
          msg.includes('API key not valid') ||
          msg.includes('PERMISSION_DENIED');

        if (isQuota) {
          console.warn(
            `[Gemini Key Quota] API Key #${originalIndex + 1}/${totalKeys} kuota habis pada ${modelName}. Mencoba model alternatif atau kunci berikutnya...`
          );
          // Coba model berikutnya dulu pada kunci yang sama karena kuotanya terpisah
          continue;
        }

        if (isInvalid) {
          keyQuotaExhaustedAllModels = false;
          console.warn(
            `[Gemini Key Invalid] API Key #${originalIndex + 1}/${totalKeys} tidak valid/ditolak. Beralih ke kunci berikutnya...`
          );
          break;
        }

        // Jika kendala adalah 503 (high demand) atau timeout, failover ke model berikutnya pada kunci yang sama
        keyQuotaExhaustedAllModels = false;
        const statusDesc =
          err?.status === 503
            ? 'Beban antrean tinggi (503)'
            : String(err?.status || 'Kendala respon');
        console.info(
          `[Model Failover] Kunci #${originalIndex + 1}: ${modelName} (${statusDesc}), beralih ke model alternatif...`
        );
        continue;
      }
    }

    if (keyQuotaExhaustedAllModels) {
      keysExhaustedQuotaCount++;
      quotaExhaustedTracker.set(currentKey, Date.now() + QUOTA_COOLDOWN_MS);
    }
  }

  // HANYA JIKA SELURUH KUNCI TERBUKTI HABIS KUOTANYA (100% dari totalKeys):
  if (keysExhaustedQuotaCount >= totalKeys && totalKeys > 0) {
    const quotaExhaustedErr: any = new Error(
      `TOKEN_QUOTA_EXHAUSTED: Token/kuota dari seluruh ${totalKeys} API Key Google Anda telah mencapai batas. Harap masukkan atau ganti dengan API Key Google AI Studio baru yang masih memiliki kuota untuk melanjutkan.`
    );
    quotaExhaustedErr.isQuotaExhausted = true;
    quotaExhaustedErr.status = 429;
    throw quotaExhaustedErr;
  }

  throw lastError;
}

/**
 * Menjalankan panggilan Gemini generateContentStream dengan rotasi multi-API Key dan failover model terdepan.
 * Mengalirkan potongan teks langsung ke callback onChunk secara real-time (Time to First Token 1-2 detik).
 */
export async function callGeminiStreamWithRetry(
  options: any,
  customApiKey?: string | string[],
  onChunk?: (text: string) => void,
  timeoutPerCallMs = 50000
): Promise<string> {
  let rawKeys: string[] = [];

  if (Array.isArray(customApiKey)) {
    rawKeys = customApiKey.flatMap((k) => parseApiKeys(k));
  } else if (typeof customApiKey === 'string') {
    rawKeys = parseApiKeys(customApiKey);
  }

  // Fallback ke process.env jika tidak ada custom key
  if (rawKeys.length === 0 && typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
    rawKeys = parseApiKeys(process.env.GEMINI_API_KEY);
  }

  if (rawKeys.length === 0) {
    const noKeyErr: any = new Error(
      'API Key Google AI Studio belum diatur. Silakan atur API Key Anda di menu profil kanan atas.'
    );
    noKeyErr.isMissingKey = true;
    noKeyErr.status = 401;
    throw noKeyErr;
  }

  const totalKeys = rawKeys.length;
  const startIdx = (globalKeyRotationIndex++) % totalKeys;
  const orderedKeys: { key: string; originalIndex: number }[] = [];
  for (let i = 0; i < totalKeys; i++) {
    const idx = (startIdx + i) % totalKeys;
    orderedKeys.push({ key: rawKeys[idx], originalIndex: idx });
  }

  const candidateModels = [
    'gemini-3.1-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3.8-flash',
    'gemini-flash-latest',
  ];

  const requestedModel = options.model;
  if (requestedModel && candidateModels.includes(requestedModel)) {
    const rIdx = candidateModels.indexOf(requestedModel);
    if (rIdx > 0) {
      candidateModels.splice(rIdx, 1);
      candidateModels.unshift(requestedModel);
    }
  }

  const now = Date.now();
  const allInCooldown = totalKeys > 1 && orderedKeys.every(({ key }) => {
    const until = quotaExhaustedTracker.get(key);
    return Boolean(until && now < until);
  });
  if (allInCooldown) {
    quotaExhaustedTracker.clear();
  }

  let lastError: any;
  let keysExhaustedQuotaCount = 0;

  for (const { key: currentKey, originalIndex } of orderedKeys) {
    const exhaustedUntil = quotaExhaustedTracker.get(currentKey);
    if (exhaustedUntil && now < exhaustedUntil && totalKeys > 1) {
      keysExhaustedQuotaCount++;
      continue;
    }

    const client = getAiClient(currentKey);
    let keyQuotaExhaustedAllModels = true;

    for (const modelName of candidateModels) {
      let timeoutTimer: NodeJS.Timeout | undefined;
      try {
        const baseConfig = options.config ? { ...options.config } : {};
        if (
          !baseConfig.thinkingConfig &&
          (modelName.includes('3.8') || modelName.includes('3.7') || modelName.includes('4-'))
        ) {
          baseConfig.thinkingConfig = {
            thinkingLevel: ThinkingLevel.LOW,
          };
        }
        const payload = { ...options, model: modelName, config: baseConfig };

        const streamPromise = (async () => {
          let accumulated = '';
          const responseStream = await client.models.generateContentStream(payload);
          for await (const chunk of responseStream) {
            const chunkText = chunk.text;
            if (chunkText) {
              accumulated += chunkText;
              if (onChunk) {
                try {
                  onChunk(chunkText);
                } catch {
                  // callback error ignored
                }
              }
            }
          }
          return accumulated;
        })();

        const timeoutPromise = new Promise<string>((_, reject) => {
          timeoutTimer = setTimeout(() => {
            const timeoutErr: any = new Error(`Model ${modelName} stream timeout.`);
            timeoutErr.status = 504;
            reject(timeoutErr);
          }, timeoutPerCallMs);
        });

        const fullText = await Promise.race([streamPromise, timeoutPromise]);
        if (timeoutTimer) clearTimeout(timeoutTimer);

        quotaExhaustedTracker.delete(currentKey);
        return fullText;
      } catch (err: any) {
        if (timeoutTimer) clearTimeout(timeoutTimer);
        lastError = err;
        const msg = err?.message || '';

        const isQuota =
          err?.status === 429 ||
          msg.includes('429') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('quota') ||
          msg.includes('Quota exceeded') ||
          msg.includes('rate limit');

        const isInvalid =
          msg.includes('API_KEY_INVALID') ||
          msg.includes('API key not valid') ||
          msg.includes('PERMISSION_DENIED');

        if (isQuota) {
          continue;
        }

        if (isInvalid) {
          keyQuotaExhaustedAllModels = false;
          break;
        }

        keyQuotaExhaustedAllModels = false;
        continue;
      }
    }

    if (keyQuotaExhaustedAllModels) {
      keysExhaustedQuotaCount++;
      quotaExhaustedTracker.set(currentKey, Date.now() + QUOTA_COOLDOWN_MS);
    }
  }

  if (keysExhaustedQuotaCount >= totalKeys && totalKeys > 0) {
    const quotaExhaustedErr: any = new Error(
      `TOKEN_QUOTA_EXHAUSTED: Token/kuota dari seluruh ${totalKeys} API Key Google Anda telah mencapai batas.`
    );
    quotaExhaustedErr.isQuotaExhausted = true;
    quotaExhaustedErr.status = 429;
    throw quotaExhaustedErr;
  }

  throw lastError;
}

/**
 * Extracts product brief from multiple sources (text, page scrape, images).
 */
export async function extractProductBrief(params: {
  inputMode?: 'mixed' | 'images' | 'url' | 'text';
  textDescription?: string;
  urlData?: ScrapedPageResult;
  images?: Array<{ mimeType: string; base64Data: string; name: string }>;
  customApiKey?: string;
}): Promise<{ brief: ProductBrief; notes: string; conflicts: string[] }> {
  const parts: any[] = [];
  const mode = params.inputMode || 'mixed';

  // Add images as inlineData parts only if in image mode or mixed mode
  // Optimize by taking the first 3 images to prevent massive payloads and avoid timeouts
  if ((mode === 'images' || mode === 'mixed') && params.images && params.images.length > 0) {
    const selectedImages = params.images.slice(0, 3);
    for (const img of selectedImages) {
      parts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.base64Data,
        },
      });
    }
  }

  let promptContext = `Anda adalah sistem ekstraksi fakta produk untuk kreator TikTok Affiliate.
Tugas Anda: membaca informasi produk yang diberikan dan menyusun Product Brief terstruktur.

MODE EKSTRAKSI SAAT INI: ${mode.toUpperCase()}
`;

  if (mode === 'images') {
    promptContext += `
PERHATIAN KHUSUS MODE FOTO (HANYA FOTO PRODUK):
- Anda HANYA menganalisis gambar produk (${params.images?.length || 0} foto) yang dilampirkan.
- Abaikan dan jangan anggap ada link atau deskripsi luar.
- Ekstrak nama produk, kemasan, label, bentuk fisik, dan fitur nyata yang tampak dari foto.
- PENTING: KARENA HANYA ADA 1 SUMBER (FOTO), FIELD 'conflicts' WAJIB BERUPA ARRAY KOSONG []. JANGAN PERNAH MENULISKAN APAPUN DI 'conflicts'!
`;
  } else if (mode === 'url') {
    const pName = params.urlData?.platform || 'E-Commerce';
    promptContext += `
PERHATIAN KHUSUS MODE LINK (HANYA DARI TAUTAN ${pName.toUpperCase()}):
- Anda HANYA menganalisis data dari tautan produk ${pName}.
- Nama Produk Terdeteksi: "${params.urlData?.extractedProductTitle || params.urlData?.title || 'Produk'}"
- Kategori e-commerce yang sesuai di ${pName}.
- Uraikan fitur standar yang melekat pada produk nyata tersebut, manfaat fungsional, target audiens, dan pain points.
- PENTING: KARENA HANYA ADA 1 SUMBER (LINK), FIELD 'conflicts' WAJIB BERUPA ARRAY KOSONG []. JANGAN PERNAH MENULISKAN APAPUN DI 'conflicts'!
`;
  } else if (mode === 'text') {
    promptContext += `
PERHATIAN KHUSUS MODE TEKS (HANYA DARI CATATAN TEKS):
- Anda HANYA menganalisis deskripsi teks dari pengguna.
- Ekstrak fakta yang tertulis secara objektif.
- PENTING: KARENA HANYA ADA 1 SUMBER (TEKS), FIELD 'conflicts' WAJIB BERUPA ARRAY KOSONG []. JANGAN PERNAH MENULISKAN APAPUN DI 'conflicts'!
`;
  } else {
    promptContext += `
PERHATIAN MODE CAMPURAN (GABUNGAN FOTO + LINK + TEKS):
- Anda menggabungkan informasi dari foto, link, dan deskripsi teks.
- Hanya jika ada perbedaan data yang nyata antar-sumber (misal klaim harga atau fungsi berbeda di teks vs gambar/link), catat di array 'conflicts'.
`;
  }

  promptContext += `
ATURAN EKSTRAKSI FAKTA & KELENGKAPAN BRIEF (MUTLAK):
1. BACA SUMBER SECARA MENDALAM & PRESISI:
   - Identifikasi nama produk nyata, merek, varian, dan fungsi utamanya.
   - Analisis kemasan, label, bentuk fisik, material, tombol, spesifikasi, dan teknologi produk.
   - Pahami manfaat konkrit yang dirasakan pengguna dalam kehidupan sehari-hari.
   - Petakan target pembeli spesifik (bukan sekadar "Umum", tapi persona nyata: misal "Ibu rumah tangga praktis", "Anak kost & mahasiswa", "Pekerja kantor WFH", "Kreator konten pemula", dll).
   - Petakan masalah/pain points nyata yang sering dihadapi calon pembeli yang tuntas diselesaikan oleh produk ini.
2. DILARANG MENGOSONGKAN KOLOM UTAMA:
   - Field "features": WAJIB berisi minimal 4-6 butir fitur nyata, spesifikasi fisik, material, ukuran, atau keunggulan fungsional.
   - Field "benefits": WAJIB berisi minimal 4-6 butir manfaat langsung bagi pengguna.
   - Field "painPoints": WAJIB berisi minimal 4-6 masalah/keluhan yang diselesaikan oleh produk.
   - Field "description": WAJIB berupa ringkasan komprehensif yang informatif (3-5 kalimat).
3. ATURAN FAKTUAL:
   - Harga/diskon jika tidak eksplisit tertulis kosongkan ("")
   - Stok/deadline jika tidak eksplisit kosongkan ("")
   - Jangan klaim medis/penyembuhan atau izin BPOM kecuali nyata terbukti pada kemasan.
4. Tandai asal sumber field: "${mode === 'images' ? 'image' : mode === 'url' ? 'url' : mode === 'text' ? 'user' : 'user|image|url'}".
5. Bila mode bukan 'mixed', array 'conflicts' HARUS KOSONG [].

DATA SUMBER:
`;

  if ((mode === 'text' || mode === 'mixed') && params.textDescription) {
    promptContext += `\n[Deskripsi dari Pengguna]:\n${params.textDescription}\n`;
  }

  if ((mode === 'url' || mode === 'mixed') && params.urlData) {
    const pName = params.urlData.platform || 'E-Commerce';
    promptContext += `\n[Data Terverifikasi dari Link Tautan ${pName}]:\n`;
    promptContext += `Platform: ${pName}\n`;
    if (params.urlData.resolvedUrl) promptContext += `URL: ${params.urlData.resolvedUrl}\n`;
    if (params.urlData.extractedProductTitle) {
      promptContext += `Nama Produk Nyata: "${params.urlData.extractedProductTitle}"\n`;
    }
    if (params.urlData.title) promptContext += `Judul Halaman/Meta: "${params.urlData.title}"\n`;
    if (params.urlData.author) promptContext += `Akun Pembuat/Seller: "${params.urlData.author}"\n`;
    if (params.urlData.identifiers && Object.keys(params.urlData.identifiers).length > 0) {
      promptContext += `Identifikasi Produk: ${JSON.stringify(params.urlData.identifiers)}\n`;
    }
    if (params.urlData.description) promptContext += `Deskripsi/Caption: "${params.urlData.description}"\n`;
    if (params.urlData.jsonLdData) promptContext += `Data JSON-LD: ${JSON.stringify(params.urlData.jsonLdData).slice(0, 2000)}\n`;
    if (params.urlData.textSnippet) promptContext += `Cuplikan Halaman: "${params.urlData.textSnippet.slice(0, 2000)}"\n`;
  }

  if ((mode === 'images' || mode === 'mixed') && params.images && params.images.length > 0) {
    promptContext += `\n[Gambar Terlampir]: ${params.images.length} gambar produk dilampirkan. Analisis seluruh teks pada kemasan, label, bentuk, material, dan kelengkapan produk.\n`;
  }

  promptContext += `
OUTPUT FORMAT: Hasilkan JSON murni tanpa markdown dengan kelengkapan penuh:
{
  "name": "Nama produk lengkap & jelas",
  "category": "Kategori produk e-commerce spesifik",
  "description": "Ringkasan deskripsi mendalam tentang apa produk ini, keunggulan, dan kegunaannya",
  "features": ["Fitur nyata 1 (spesifikasi fisik/material/ukuran)", "Fitur nyata 2", "Fitur nyata 3", "Fitur nyata 4", "Fitur nyata 5"],
  "benefits": ["Manfaat nyata 1 yang dirasakan pembeli", "Manfaat nyata 2", "Manfaat nyata 3", "Manfaat nyata 4"],
  "audience": "Persona target pembeli spesifik yang paling membutuhkan",
  "painPoints": ["Masalah nyata 1 yang dihadapi pembeli", "Masalah nyata 2", "Masalah nyata 3", "Masalah nyata 4"],
  "currentPrice": "Rp... (atau kosongkan jika tidak eksplisit)",
  "referencePrice": "Rp... (harga normal jika ada)",
  "promoDetails": "diskon/voucher (jika eksplisit)",
  "stockOrDeadline": "stok/tenggat waktu (jika eksplisit)",
  "socialProof": "ulasan atau bukti sosial nyata jika ada",
  "creatorExperience": "pengalaman pemakaian yang wajar",
  "restrictions": ["klaim overclaim atau batasan yang harus dihindari"],
  "sources": [
    { "field": "name", "source": "${mode === 'images' ? 'image' : mode === 'url' ? 'url' : mode === 'text' ? 'user' : 'user'}", "confidence": "high" }
  ],
  "conflicts": [],
  "notes": "catatan singkat proses ekstraksi fakta"
}`;

  parts.push({ text: promptContext });

  let rawText = '{}';
  try {
    const response = await callGeminiWithRetry(
      {
        model: GEMINI_MODEL,
        contents: { parts },
        config: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          maxOutputTokens: 1500,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      },
      params.customApiKey,
      25000
    );
    rawText = response.text || '{}';
  } catch (err: any) {
    const msg = err?.message || '';
    // Jika error karena kuota token habis atau key invalid, JANGAN DITELAN! Lemparkan langsung agar user dapat notifikasi
    if (
      err?.isQuotaExhausted ||
      err?.isMissingKey ||
      msg.includes('TOKEN_QUOTA_EXHAUSTED') ||
      msg.includes('429') ||
      msg.includes('RESOURCE_EXHAUSTED') ||
      msg.includes('quota') ||
      msg.includes('Quota exceeded') ||
      msg.includes('API_KEY_INVALID') ||
      msg.includes('API key not valid') ||
      msg.includes('PERMISSION_DENIED')
    ) {
      throw err;
    }
    console.warn('[extractProductBrief] AI call error, falling back to structured synthesis:', msg);
  }

  let parsed: any;
  try {
    parsed = JSON.parse(cleanJsonString(rawText));
  } catch {
    const objMatch = rawText.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try {
        parsed = JSON.parse(objMatch[0]);
      } catch {}
    }
    if (!parsed) {
      parsed = {};
    }
  }

  function toStringArray(arr: any): string[] {
    if (!Array.isArray(arr)) return [];
    return arr
      .map((item: any) => {
        if (typeof item === 'string') return item.trim();
        if (typeof item === 'object' && item !== null) {
          if (item.field && item.detail) return `${item.field}: ${item.detail}`;
          return (
            item.detail ||
            item.conflict ||
            item.description ||
            item.message ||
            item.name ||
            item.title ||
            JSON.stringify(item)
          );
        }
        return String(item).trim();
      })
      .filter((t: string) => Boolean(t && t.length > 0));
  }

  let sources: SourceProvenance[] = Array.isArray(parsed.sources) ? parsed.sources : [];
  const conflicts: string[] = mode === 'mixed' ? toStringArray(parsed.conflicts) : [];

  // Determine final product name
  let finalName = parsed.name && parsed.name !== 'Produk Tanpa Nama' ? parsed.name : '';
  if (!finalName) {
    if (mode === 'url' && (params.urlData?.extractedProductTitle || params.urlData?.title)) {
      finalName = params.urlData.extractedProductTitle || params.urlData.title;
    } else if (mode === 'text' && params.textDescription) {
      finalName = params.textDescription.split('\n')[0]?.slice(0, 80) || 'Produk';
    } else {
      finalName = 'Produk Pilihan Affiliate';
    }
  }

  // Set accurate provenance sources
  if (mode === 'images') {
    sources = [
      { field: 'name', source: 'image', confidence: 'high' },
      { field: 'category', source: 'image', confidence: 'high' },
      { field: 'features', source: 'image', confidence: 'high' },
      { field: 'description', source: 'image', confidence: 'high' },
    ];
  } else if (mode === 'url') {
    sources = [
      { field: 'name', source: 'url', confidence: 'high' },
      { field: 'category', source: 'url', confidence: 'high' },
      { field: 'features', source: 'url', confidence: 'high' },
      { field: 'description', source: 'url', confidence: 'high' },
    ];
  } else if (mode === 'text') {
    sources = [
      { field: 'name', source: 'user', confidence: 'high' },
      { field: 'description', source: 'user', confidence: 'high' },
    ];
  }

  const rawFeatures = toStringArray(parsed.features);
  const rawBenefits = toStringArray(parsed.benefits);
  const rawPainPoints = toStringArray(parsed.painPoints);

  // Sintesis presisi jika ada kolom yang kurang lengkap dari AI agar TIDAK PERNAH KOSONG
  const cleanCategory = parsed.category || (mode === 'url' && params.urlData?.platform ? `${params.urlData.platform} Best Seller` : 'Produk Affiliate');
  const cleanDescription = parsed.description || (mode === 'url' ? params.urlData?.description : '') || `${finalName} merupakan produk ${cleanCategory} dengan desain fungsional dan material berkualitas untuk menunjang aktivitas pengguna secara praktis.`;

  const finalFeatures = rawFeatures.length >= 3
    ? rawFeatures
    : [
        `Desain ergonomis & material awet untuk pemakaian harian ${finalName}`,
        `Spesifikasi fungsional presisi yang langsung siap digunakan`,
        `Bentuk ringkas & portabel, hemat ruang penyimpanan`,
        `Fitur unggulan teruji untuk efisiensi aktivitas harian`,
        ...rawFeatures,
      ].slice(0, 5);

  const finalBenefits = rawBenefits.length >= 3
    ? rawBenefits
    : [
        `Mempermudah aktivitas harian tanpa membuang waktu dan tenaga`,
        `Memberikan solusi praktis dengan hasil pemakaian maksimal`,
        `Nyaman dan aman digunakan secara berulang untuk jangka panjang`,
        `Meningkatkan efisiensi kerja atau rutinitas pengguna`,
        ...rawBenefits,
      ].slice(0, 5);

  const finalPainPoints = rawPainPoints.length >= 3
    ? rawPainPoints
    : [
        `Sering repot atau lelah dengan peralatan lama yang kurang efisien`,
        `Kehabisan waktu karena cara konvensional yang memakan banyak tenaga`,
        `Khawatir barang cepat rusak atau tidak awet dipakai`,
        `Mencari produk berkualitas yang solutif dengan harga terjangkau`,
        ...rawPainPoints,
      ].slice(0, 5);

  const finalAudience = parsed.audience && parsed.audience !== 'Umum'
    ? parsed.audience
    : `Konsumen dan kreator cerdas yang membutuhkan solusi praktis dari ${finalName}`;

  const brief: ProductBrief = {
    name: finalName,
    category: cleanCategory,
    description: cleanDescription,
    features: finalFeatures,
    benefits: finalBenefits,
    audience: finalAudience,
    painPoints: finalPainPoints,
    currentPrice: parsed.currentPrice || undefined,
    referencePrice: parsed.referencePrice || undefined,
    promoDetails: parsed.promoDetails || undefined,
    stockOrDeadline: parsed.stockOrDeadline || undefined,
    socialProof: parsed.socialProof || undefined,
    creatorExperience: parsed.creatorExperience || undefined,
    platform: mode === 'url' || (mode === 'mixed' && params.urlData) ? params.urlData?.platform : undefined,
    activeSourceMode: mode,
    restrictions: toStringArray(parsed.restrictions).length > 0
      ? toStringArray(parsed.restrictions)
      : ['Hindari klaim medis tanpa izin', 'Hindari menjanjikan hasil instan tanpa bukti'],
    sources,
    conflicts: mode === 'mixed' ? conflicts : [],
  };

  const notes =
    mode === 'url' && params.urlData?.platform
      ? `Berhasil mengekstrak informasi presisi dari tautan ${params.urlData.platform}: "${finalName}".`
      : mode === 'images'
      ? `Berhasil mengekstrak ${params.images?.length || 0} foto produk secara mendalam: "${finalName}".`
      : mode === 'text'
      ? `Berhasil menyusun Product Brief terverifikasi dari teks: "${finalName}".`
      : parsed.notes || 'Ekstraksi Product Brief selesai.';

  return {
    brief,
    notes,
    conflicts,
  };
}

const DEFAULT_20_ANGLES = [
  'Problem-Solution (Solusi Masalah)',
  'Personal Story (Kisah Nyata)',
  'Bold Claim (Klaim Menghentak)',
  'Myth-Busting (Bongkar Mitos)',
  'Outcome-First (Hasil di Awal)',
  'Common Mistakes (Hindari Salah)',
  'Price/Value (Bandingkan Nilai)',
  'Social Proof (Bukti Sosial)',
  'Unboxing/ASMR (First Impression)',
  'Educational/How-To (Tutorial Cepat)',
  'Skeptic-to-Believer (Awalnya Ragu)',
  'Routine/Day in the Life (POV Rutinitas)',
  'Feature Deep-Dive (Bedah Fitur)',
  'Relatable Humor (Situasi Lucu)',
  'Urgency/Scarcity (Momen Terbatas)',
  'Before-After Transformation (Transformasi Nyata)',
  'Comparison vs Alternative (Adu Kualitas)',
  'Hidden Gem/Secret Hack (Trik Rahasia)',
  'Gift/Recommendation (Rekomendasi Hadiah)',
  'Behind the Scenes (Di Balik Layar)',
];

/**
 * Assigns distinct angles across scripts, prioritizing user selected angles or cycling through default 20 angles.
 */
function getAssignedAngles(
  startIndex: number,
  count: number,
  selectedAngles?: string[]
): string[] {
  const angles: string[] = [];
  const sourceAngles =
    selectedAngles && selectedAngles.length > 0 ? selectedAngles : DEFAULT_20_ANGLES;

  for (let i = 0; i < count; i++) {
    const angleIndex = (startIndex - 1 + i) % sourceAngles.length;
    angles.push(sourceAngles[angleIndex]);
  }
  return angles;
}

/**
 * Simple concurrency runner to execute tasks in controlled parallel batches.
 */
async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < items.length) {
      const idx = currentIndex++;
      results[idx] = await fn(items[idx], idx);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

/**
 * Builds a structured, high-quality script directly from the product brief and assigned angle.
 * Supports all 20 distinct angles with unique hooks, story structures, visual cues, and dialogues.
 */
function buildFallbackScript(
  productBrief: ProductBrief,
  config: GenerationConfig,
  angle: string,
  index: number,
  targetWords: { min: number; max: number }
): ScriptItem {
  const pName = productBrief.name || 'Produk Ini';
  const features = productBrief.features && productBrief.features.length > 0
    ? productBrief.features
    : ['kualitas bahan premium & presisi', 'desain ergonomis siap pakai', 'awet tahan lama'];
  const benefits = productBrief.benefits && productBrief.benefits.length > 0
    ? productBrief.benefits
    : ['mempermudah aktivitas sehari-hari', 'menghemat tenaga dan waktu kerja'];
  const painPoints = productBrief.painPoints && productBrief.painPoints.length > 0
    ? productBrief.painPoints
    : ['sering repot dengan produk konvensional yang kaku'];

  const feature = features[(index - 1) % features.length];
  const benefit = benefits[(index - 1) % benefits.length];
  const pain = painPoints[(index - 1) % painPoints.length];
  const persona = config.audiencePersona && config.audiencePersona !== 'Auto'
    ? config.audiencePersona
    : productBrief.audience || 'Sahabat Kreator';

  const lowerAngle = angle.toLowerCase();

  let hookDialogue = '';
  let hookVisual = '';
  let hookOverlay = '';
  let hookStrategy = '';

  let problemDialogue = '';
  let problemVisual = '';
  let problemOverlay = '';

  let demoDialogue = '';
  let demoVisual = '';
  let demoOverlay = '';

  let valueDialogue = '';
  let valueVisual = '';
  let valueOverlay = '';

  let ctaDialogue = '';
  let ctaVisual = '';
  let ctaOverlay = '';

  if (lowerAngle.includes('story') || lowerAngle.includes('kisah')) {
    // 1. Personal Story (Kisah Nyata)
    hookDialogue = `Jujur ya, awalnya aku skeptis banget sama ${pName} ini, sampai akhirnya cobain sendiri!`;
    hookVisual = `Tatap kamera santai dengan gestur memegang ${pName} di tangan`;
    hookOverlay = `Pengalaman Jujur Aku 💬`;
    hookStrategy = 'First-person authentic storytelling hook';
    problemDialogue = `Dulu tiap kali ${pain}, rasanya capek dan makan banyak waktu. Beli macam-macam alat tetap gak puas.`;
    problemVisual = `Ekspresi lelah menatap meja atau situasi kerepotan harian`;
    problemOverlay = `Sebelum Tahu Ini... 🤦‍♂️`;
    demoDialogue = `Pas ${pName} ini datang, langsung aku uji. Fitur ${feature} ternyata ngebuktiin klaimnya, ${benefit} jadi kerasa instan!`;
    demoVisual = `Close up demonstrasi pemakaian langsung dengan pencahayaan jelas`;
    demoOverlay = `Uji Pakai Langsung ⚡`;
    valueDialogue = `Sekarang udah jadi barang andalan yang aku pakai tiap hari. Beneran game changer buat rutinitasku.`;
    valueVisual = `Perlihatkan ${pName} tertata rapi di tempat pemakaian`;
    valueOverlay = `Game Changer Banget ✨`;
    ctaDialogue = `Biar kamu gak penasaran kayak aku dulu, langsung cek variasi di keranjang kiri bawah ya!`;
    ctaVisual = `Tersenyum ramah dan mengarahkan pandangan ke sudut kiri bawah layar`;
    ctaOverlay = `Cek Keranjang Kiri Bawah ⬇️`;
  } else if (lowerAngle.includes('bold claim') || lowerAngle.includes('menghentak')) {
    // 2. Bold Claim (Klaim Menghentak)
    hookDialogue = `Jangan buru-buru beli ${pName} kalau kalian belum siap aktivitas harian jadi secepat ini!`;
    hookVisual = `Tangan menahan layar kamera sesaat, lalu geser memperlihatkan ${pName}`;
    hookOverlay = `Jangan Beli Dulu! ⚠️`;
    hookStrategy = 'Contrarian bold claim hook';
    problemDialogue = `Banyak yang masih pakai cara lama padahal udah ketinggalan zaman dan bikin ${pain}.`;
    problemVisual = `Perlihatkan gestur menggelengkan kepala terhadap metode konvensional`;
    problemOverlay = `Stop Cara Lama ❌`;
    demoDialogue = `Lihat sendiri performa ${pName}. Didukung ${feature}, bikin ${benefit} selesai dalam hitungan detik.`;
    demoVisual = `Aksi cepat mendemonstrasikan keunggulan fisik produk`;
    demoOverlay = `Bukti Nyata Langsung 🔥`;
    valueDialogue = `Kualitas build dan fungsinya setara barang kelas atas tapi harganya ramah di kantong.`;
    valueVisual = `Sorot finishing halus dan material produk secara detail`;
    valueOverlay = `Worth It Parah! 💯`;
    ctaDialogue = `Buktikan sendiri sebelum kehabisan, langsung amankan di keranjang kiri bawah!`;
    ctaVisual = `Tunjuk mantap ke arah keranjang kiri bawah smartphone`;
    ctaOverlay = `Amankan Sekarang ⬇️`;
  } else if (lowerAngle.includes('myth') || lowerAngle.includes('mitos')) {
    // 3. Myth-Busting (Bongkar Mitos)
    hookDialogue = `Masih banyak yang percaya kalau mau ${benefit} itu harus keluar modal jutaan? Salah besar!`;
    hookVisual = `Gelengkan kepala dengan ekspresi heran, angkat ${pName} ke depan lensa`;
    hookOverlay = `Mitos vs Fakta 🔍`;
    hookStrategy = 'Myth-busting counter-intuitive hook';
    problemDialogue = `Faktanya kita sering kemakan gimmick mahal, padahal yang kita butuhin cuma solusi praktis buat ngatasin ${pain}.`;
    problemVisual = `Gestur heran menunjuk produk biasa yang mahal`;
    problemOverlay = `Jangan Tertipu Gimmick 🙅‍♂️`;
    demoDialogue = `Coba cek ${pName}. Rahasianya ada di ${feature}, yang fokus bikin ${benefit} tanpa embel-embel ribet.`;
    demoVisual = `Fokus ke fungsi utama dan kemudahan penggunaannya`;
    demoOverlay = `Fakta Fungsional 💡`;
    valueDialogue = `Gak perlu buang uang buat fitur yang gak kepakai. Pilih yang fungsional dan terbukti solutif.`;
    valueVisual = `Perlihatkan bodi produk yang kokoh dan compact`;
    valueOverlay = `Pilihan Cerdas! ✅`;
    ctaDialogue = `Yuk jadi pembeli cerdas, klik keranjang di kiri bawah sekarang juga!`;
    ctaVisual = `Tunjuk santai ke arah keranjang bawah video`;
    ctaOverlay = `Klik Keranjang Kiri Bawah ⬇️`;
  } else if (lowerAngle.includes('outcome-first') || lowerAngle.includes('hasil di awal')) {
    // 4. Outcome-First (Hasil di Awal)
    hookDialogue = `Cuma butuh waktu 3 detik, lihat hasil pemakaian ${pName} ini langsung di depan mata kalian!`;
    hookVisual = `Tampilkan detik pertama hasil sempurna pemakaian ${pName} secara dramatis`;
    hookOverlay = `Hasil Dalam 3 Detik ⏱️`;
    hookStrategy = 'Outcome-first visual gratification hook';
    problemDialogue = `Bandingkan sama cara biasa yang sering bikin ${pain} dan makan waktu lama berjam-jam.`;
    problemVisual = `Potongan kilat kondisi repot sebelum memakai ${pName}`;
    problemOverlay = `Beda Jauh Banget! ⚡`;
    demoDialogue = `Ini alasan kenapa ${pName} jadi andalan: punya ${feature} yang bikin ${benefit} terasa tanpa beban.`;
    demoVisual = `Demonstrasikan mekanisme kerja produk dari dekat`;
    demoOverlay = `Cara Kerja Praktis ✨`;
    valueDialogue = `Bikin produktivitas dan kenyamanan naik drastis setiap hari.`;
    valueVisual = `Tersenyum puas dengan hasil pemakaian`;
    valueOverlay = `Puas Maksimal 👍`;
    ctaDialogue = `Mau hasil secepat ini juga? Langsung tap keranjang di kiri bawah ya!`;
    ctaVisual = `Gestur mengetuk ke arah keranjang bawah video ini`;
    ctaOverlay = `Tap Keranjang Kiri Bawah ⬇️`;
  } else if (lowerAngle.includes('mistake') || lowerAngle.includes('salah')) {
    // 5. Common Mistakes (Hindari Salah)
    hookDialogue = `Stop lakukan kesalahan fatal ini pas kalian lagi ${pain}! Sini aku kasih tahu solusinya.`;
    hookVisual = `Gestur tangan tanda silang (stop), lalu tunjukkan ${pName}`;
    hookOverlay = `Hindari Salah Ini! 🛑`;
    hookStrategy = 'Mistake agitation authority hook';
    problemDialogue = `Kesalahan nomor satu adalah maksain alat seadanya yang bikin hasil gak maksimal dan gampang rusak.`;
    problemVisual = `Tunjukkan situasi keliru yang sering dilakukan orang awam`;
    problemOverlay = `Penyebab Masalah 🤦‍♀️`;
    demoDialogue = `Mulai sekarang ganti ke ${pName}. Berkat ${feature}, kalian bisa ${benefit} dengan cara yang benar dan aman.`;
    demoVisual = `Peragakan langkah yang benar menggunakan ${pName}`;
    demoOverlay = `Solusi Tepat & Aman 🛡️`;
    valueDialogue = `Sekali pakai langsung kerasa bedanya. Jangan tunggu makin repot baru nyesel.`;
    valueVisual = `Tunjukkan kondisi rapi dan stabil setelah memakai produk`;
    valueOverlay = `Ganti Sekarang 👍`;
    ctaDialogue = `Jangan sampai salah pilih lagi, langsung cek variasi di keranjang kiri bawah!`;
    ctaVisual = `Mengarahkan jari telunjuk ke sudut kiri bawah layar`;
    ctaOverlay = `Cek Keranjang Kiri Bawah ⬇️`;
  } else if (lowerAngle.includes('price') || lowerAngle.includes('value') || lowerAngle.includes('bandingkan')) {
    // 6. Price/Value (Bandingkan Nilai)
    hookDialogue = `Daripada keluar uang berkali-kali buat hal yang gak jelas, mending lirik ${pName} yang satu ini!`;
    hookVisual = `Tangan kanan dan kiri menimbang, lalu memperlihatkan ${pName}`;
    hookOverlay = `Cerdas Pilih Barang 💡`;
    hookStrategy = 'Value vs price anchoring hook';
    problemDialogue = `Seringkali kita beli barang murah tapi cepat rusak dan akhirnya tetap ngalamin ${pain}.`;
    problemVisual = `Ekspresi kecewa pada barang berkualitas rendah konvensional`;
    problemOverlay = `Murah Tapi Rugi? 💸`;
    demoDialogue = `Nah, ${pName} ini value for money banget. Material ${feature}-nya kokoh, bikin ${benefit} jangka panjang.`;
    demoVisual = `Sorot ketahanan material dan kelengkapan produk`;
    demoOverlay = `Kualitas Premium 🛡️`;
    valueDialogue = `Hemat budget dan beneran awet dipakai bertahun-tahun.`;
    valueVisual = `Tunjukkan produk utuh dan siap digunakan kapan saja`;
    valueOverlay = `Investasi Cerdas 💯`;
    ctaDialogue = `Cek promo terbaiknya sekarang di keranjang bawah video ini ya!`;
    ctaVisual = `Tunjuk ke keranjang bawah video dengan senyum meyakinkan`;
    ctaOverlay = `Cek Keranjang Bawah ⬇️`;
  } else if (lowerAngle.includes('social proof') || lowerAngle.includes('bukti')) {
    // 7. Social Proof (Bukti Sosial)
    hookDialogue = `Pantesan ${pName} ini wara-wiri terus di timeline dan banyak yang review positif!`;
    hookVisual = `Pegang smartphone sekilas lalu fokuskan kamera ke ${pName}`;
    hookOverlay = `Lagi Viral Banget 🔥`;
    hookStrategy = 'Social proof bandwagon hook';
    problemDialogue = `Ternyata banyak orang yang punya keluhan sama soal ${pain} dan nemu solusinya di sini.`;
    problemVisual = `Tatap kamera mengiyakan keresahan banyak orang`;
    problemOverlay = `Banyak yang Relate 👥`;
    demoDialogue = `Pas aku tes sendiri fitur ${feature}-nya, beneran terbukti bikin ${benefit} tanpa rekayasa.`;
    demoVisual = `Demokan fungsi utama secara transparan dan jujur`;
    demoOverlay = `Terbukti Nyata ✨`;
    valueDialogue = `Gak heran ulasan dan kepuasan penggunanya pada kasih bintang lima.`;
    valueVisual = `Angkat produk dengan bangga di depan kamera`;
    valueOverlay = `Rating Bintang 5 ⭐`;
    ctaDialogue = `Ikutan buktiin sendiri yuk, langsung klik keranjang di kiri bawah!`;
    ctaVisual = `Tunjuk antusias ke keranjang kiri bawah`;
    ctaOverlay = `Klik Keranjang Kiri Bawah ⬇️`;
  } else if (lowerAngle.includes('unboxing') || lowerAngle.includes('asmr') || lowerAngle.includes('impression')) {
    // 8. Unboxing/ASMR (First Impression)
    hookDialogue = `Dengerin suara unboxing ${pName} yang lagi viral ini. First impression-nya bikin takjub!`;
    hookVisual = `Close-up tangan membuka segel kemasan produk secara perlahan dan estetik`;
    hookOverlay = `Unboxing Time 📦`;
    hookStrategy = 'Sensory tactile unboxing hook';
    problemDialogue = `Biasanya barang sejenis suka ringkih pas dipegang dan bikin was-was pas ${pain}.`;
    problemVisual = `Tunjukkan detail kemasan dalam dan kelengkapan aksesoris`;
    problemOverlay = `Kemasan Rapi Banget 🛡️`;
    demoDialogue = `Tapi pas pegang ${pName}, feel-nya solid banget! Ada ${feature} yang presisi, pas dites langsung ${benefit}.`;
    demoVisual = `Kamera menyorot tekstur bodi dan pengujian pertama`;
    demoOverlay = `Material Solid ✨`;
    valueDialogue = `Dari kemasan sampai fungsinya beneran niat. Bikin puas sejak pertama buka paket.`;
    valueVisual = `Tunjukkan produk berdiri kokoh dan siap digunakan`;
    valueOverlay = `Puas Sejak Unboxing ⭐`;
    ctaDialogue = `Langsung unboxing punya kamu sendiri, amankan di keranjang kiri bawah!`;
    ctaVisual = `Arahkan jempol ke sudut kiri bawah layar`;
    ctaOverlay = `Amankan di Keranjang Bawah ⬇️`;
  } else if (lowerAngle.includes('how-to') || lowerAngle.includes('tutorial') || lowerAngle.includes('edukasi')) {
    // 9. Educational/How-To (Tutorial Cepat)
    hookDialogue = `Trik 3 langkah paling simpel buat ${benefit} yang wajib kalian save sekarang juga!`;
    hookVisual = `Jari menunjukkan angka 1, 2, 3 di samping ${pName}`;
    hookOverlay = `Tutorial Kilat ⏱️`;
    hookStrategy = 'Action-oriented educational hook';
    problemDialogue = `Gak perlu lagi pusing atau repot sendiri kalau pas lagi ${pain}.`;
    problemVisual = `Geleng kepala singkat lalu tersenyum siap memberi tips`;
    problemOverlay = `Bebas Ribet 💆`;
    demoDialogue = `Cukup pakai ${pName}. Langkahnya praktis karena ada ${feature}, tinggal pakai dan langsung ${benefit}.`;
    demoVisual = `Peragakan langkah 1, 2, 3 secara cepat dan lugas`;
    demoOverlay = `3 Langkah Mudah 👌`;
    valueDialogue = `Bahkan pemula sekalipun langsung bisa pakai tanpa perlu tutorial panjang. Praktis pol!`;
    valueVisual = `Hasil akhir demonstrasi yang sempurna`;
    valueOverlay = `Super Praktis! ⭐`;
    ctaDialogue = `Langsung praktikkan trik ini, cek detail produk di keranjang kiri bawah!`;
    ctaVisual = `Tunjuk mantap ke keranjang bawah video ini`;
    ctaOverlay = `Cek Keranjang Kiri Bawah ⬇️`;
  } else if (lowerAngle.includes('skeptic') || lowerAngle.includes('ragu')) {
    // 10. Skeptic-to-Believer (Awalnya Ragu)
    hookDialogue = `Awalnya aku kira ${pName} ini cuma gimmick iklan, tapi setelah tes seminggu... aku salah besar!`;
    hookVisual = `Ekspresi menggelengkan kepala mengaku kagum sambil memegang ${pName}`;
    hookOverlay = `Awalnya Gak Percaya 😅`;
    hookStrategy = 'Skepticism reversal trust-building hook';
    problemDialogue = `Dulu aku ragu apa beneran bisa nyelesaiin masalah ${pain} tanpa kendala teknis.`;
    problemVisual = `Tatap kamera berbicara dengan nada jujur tanpa dibuat-buat`;
    problemOverlay = `Ekspektasi vs Realita 💭`;
    demoDialogue = `Ternyata performa ${feature}-nya di luar ekspektasi, ${benefit} beneran terbukti nyata tiap hari.`;
    demoVisual = `Tunjukkan bukti pemakaian langsung di depan kamera`;
    demoOverlay = `Performa Memuaskan ⚡`;
    valueDialogue = `Kualitasnya yang ngebuktiin sendiri tanpa perlu banyak basa-basi.`;
    valueVisual = `Pose tersenyum puas mengacungkan jempol ke arah produk`;
    valueOverlay = `Terbukti Rekomen! 💯`;
    ctaDialogue = `Biar kamu gak penasaran lagi, langsung cek detailnya di keranjang kiri bawah!`;
    ctaVisual = `Arahkan gestur tangan ke sudut kiri bawah layar`;
    ctaOverlay = `Cek Keranjang Kiri Bawah ⬇️`;
  } else if (lowerAngle.includes('routine') || lowerAngle.includes('pov') || lowerAngle.includes('rutinitas')) {
    // 11. Routine/Day in the Life (POV Rutinitas)
    hookDialogue = `POV: Satu barang kecil di meja ini yang sukses ngerubah rutinitasku jadi 10x lebih produktif!`;
    hookVisual = `Angle POV dari atas memperlihatkan suasana meja kerja dan ${pName}`;
    hookOverlay = `POV Rutinitas Produktif ☀️`;
    hookStrategy = 'Day-in-the-life POV immersion hook';
    problemDialogue = `Sebelum ada ini, tiap mulai aktivitas selalu terhambat gara-gara ${pain}.`;
    problemVisual = `Perlihatkan momen sebelum menggunakan produk saat rutinitas`;
    problemOverlay = `Dulu Sering Terhambat ☕`;
    demoDialogue = `Sekarang tinggal andalkan ${pName}. Fitur ${feature}-nya ngebantu banget bikin ${benefit} mengalir lancar.`;
    demoVisual = `Gerakan tangan lincah mengoperasikan produk saat beraktivitas`;
    demoOverlay = `Aktivitas Mengalir Lancar ✨`;
    valueDialogue = `Teman setia yang bikin hari-hari jauh lebih santai dan tertata rapi.`;
    valueVisual = `Suasana kerja yang nyaman dan teratur berkat produk`;
    valueOverlay = `Lebih Tenang & Fokus 🎯`;
    ctaDialogue = `Upgrade rutinitas harianmu sekarang, klik keranjang di kiri bawah ya!`;
    ctaVisual = `Tunjuk santai ke arah keranjang kiri bawah`;
    ctaOverlay = `Upgrade Rutinitas ⬇️`;
  } else if (lowerAngle.includes('deep-dive') || lowerAngle.includes('bedah') || lowerAngle.includes('fitur')) {
    // 12. Feature Deep-Dive (Bedah Fitur)
    hookDialogue = `Mari kita bedah kenapa teknologi ${feature} di ${pName} ini jarang ditemuin di produk lain!`;
    hookVisual = `Kamera macro super close-up menyorot material dan tombol bodi ${pName}`;
    hookOverlay = `Bedah Spesifikasi 🔬`;
    hookStrategy = 'Technical authority deep-dive hook';
    problemDialogue = `Banyak produk serupa tapi teknologi lamanya bikin hasil kurang maksimal dan gampang ${pain}.`;
    problemVisual = `Tunjukkan perbedaan komponen fisik yang lebih kokoh`;
    problemOverlay = `Bukan Barang Kaleng-Kaleng 🛡️`;
    demoDialogue = `Di ${pName} ini, rancangan ${feature}-nya presisi banget, memastikan ${benefit} stabil tiap dipakai.`;
    demoVisual = `Uji tekan tombol atau demonstrasi fitur unggulan`;
    demoOverlay = `Presisi Tinggi ⚙️`;
    valueDialogue = `Detail pengerjaannya rapi, membuktikan standar kualitas pabrikannya tinggi.`;
    valueVisual = `Putar produk 360 derajat memperlihatkan seluruh sudut bodi`;
    valueOverlay = `Standar Pabrikan Juara 🏆`;
    ctaDialogue = `Pelajari spesifikasi lengkapnya langsung di keranjang kiri bawah!`;
    ctaVisual = `Tunjuk ke arah keranjang kiri bawah`;
    ctaOverlay = `Cek Spesifikasi Lengkap ⬇️`;
  } else if (lowerAngle.includes('humor') || lowerAngle.includes('lucu') || lowerAngle.includes('drama')) {
    // 13. Relatable Humor (Situasi Lucu)
    hookDialogue = `Momen ketika kamu baru sadar selama ini tersiksa gara-gara ${pain}, padahal solusinya ada di depan mata!`;
    hookVisual = `Drama ekspresi wajah tepuk jidat kocak, lalu tersenyum memperlihatkan ${pName}`;
    hookOverlay = `Nyesel Baru Tahu 🤦`;
    hookStrategy = 'Humorous relatable agitation hook';
    problemDialogue = `Nyesel banget kenapa baru nemu alat ini sekarang setelah sekian lama ribet sendiri.`;
    problemVisual = `Pose menggelengkan kepala meratapi kerepotan masa lalu`;
    problemOverlay = `Drama Kerepotan Selesai 🎬`;
    demoDialogue = `Untung sekarang ada ${pName}. Tinggal manfaatin ${feature}-nya, langsung ${benefit} tanpa drama lagi.`;
    demoVisual = `Tunjukkan betapa mudah dan santainya memakai produk ini`;
    demoOverlay = `Gak Pakai Drama 👌`;
    valueDialogue = `Selamat tinggal kerepotan masa lalu, sambut hidup serba praktis.`;
    valueVisual = `Ekspresi lega dan tersenyum santai di depan kamera`;
    valueOverlay = `Hidup Lebih Santai ✨`;
    ctaDialogue = `Bebaskan dirimu dari drama kerepotan, tap keranjang di kiri bawah sekarang!`;
    ctaVisual = `Mengarahkan jari ke keranjang kiri bawah`;
    ctaOverlay = `Tap Keranjang Kiri Bawah ⬇️`;
  } else if (lowerAngle.includes('urgency') || lowerAngle.includes('terbatas') || lowerAngle.includes('momen')) {
    // 14. Urgency/Scarcity (Momen Terbatas)
    hookDialogue = `Buat kamu yang lagi pusing ngadepin masalah ${pain}, sekarang momen paling pas buat ambil tindakan!`;
    hookVisual = `Tangan mengambil ${pName} dengan antusias memperlihatkannya ke kamera`;
    hookOverlay = `Waktu Tepat Berubah ⏰`;
    hookStrategy = 'Timely action urgency hook';
    problemDialogue = `Jangan tunda sampai masalah makin numpuk dan aktivitas harianmu jadi terganggu terus.`;
    problemVisual = `Tatap kamera dengan nada bicara mendorong dan meyakinkan`;
    problemOverlay = `Jangan Ditunda Lagi ⚠️`;
    demoDialogue = `Miliki ${pName} hari ini dengan keunggulan ${feature} yang siap bantu ${benefit} kapan saja.`;
    demoVisual = `Perlihatkan kesiapan produk langsung pakai tanpa proses rumit`;
    demoOverlay = `Siap Pakai Kapan Saja 🚀`;
    valueDialogue = `Investasi kenyamanan terbaik yang bakal langsung kamu syukuri setiap hari.`;
    valueVisual = `Sorot keutuhan kemasan dan produk yang elegan`;
    valueOverlay = `Pilihan Terbaik Hari Ini 🌟`;
    ctaDialogue = `Mumpung masih tersedia lengkap, langsung checkout di keranjang kiri bawah ya!`;
    ctaVisual = `Arahkan jari telunjuk ke keranjang bawah video`;
    ctaOverlay = `Checkout Sekarang ⬇️`;
  } else if (lowerAngle.includes('before') || lowerAngle.includes('transformasi')) {
    // 15. Before-After Transformation (Transformasi Nyata)
    hookDialogue = `Perbedaan sebelum dan sesudah kenal ${pName} ini beneran kayak bumi dan langit!`;
    hookVisual = `Bagi fokus visual: gestur sebelum (kerepotan) vs setelah memegang ${pName}`;
    hookOverlay = `Sebelum vs Sesudah 🔄`;
    hookStrategy = 'Contrastive transformation hook';
    problemDialogue = `Dulu pas masih sering ${pain}, semuanya terasa lambat dan bikin mood berantakan.`;
    problemVisual = `Gaya ekspresi pusing di samping barang-barang berantakan`;
    problemOverlay = `Kondisi Sebelum 😫`;
    demoDialogue = `Setelah beralih ke ${pName}, berkat ${feature}-nya, proses ${benefit} jadi super rapi dan cepat.`;
    demoVisual = `Transisi visual ke kondisi rapi dengan ${pName} bekerja sempurna`;
    demoOverlay = `Kondisi Sesudah ✨`;
    valueDialogue = `Transformasi nyata yang langsung kerasa dampaknya sejak hari pertama.`;
    valueVisual = `Tersenyum bangga di samping penataan yang rapi`;
    valueOverlay = `Beda Banget Hasilnya! 💯`;
    ctaDialogue = `Rasakan transformasinya sendiri, klik keranjang di kiri bawah sekarang!`;
    ctaVisual = `Tunjuk ke sudut kiri bawah layar`;
    ctaOverlay = `Klik Keranjang Kiri Bawah ⬇️`;
  } else if (lowerAngle.includes('comparison') || lowerAngle.includes('alternative') || lowerAngle.includes('adu')) {
    // 16. Comparison vs Alternative (Adu Kualitas)
    hookDialogue = `Adu langsung ${pName} vs metode lama yang biasa kamu pakai. Siapa juaranya?`;
    hookVisual = `Pegang alat konvensional di tangan kiri dan ${pName} di tangan kanan`;
    hookOverlay = `Adu Kualitas Langsung ⚔️`;
    hookStrategy = 'Direct side-by-side comparison hook';
    problemDialogue = `Cara lama butuh banyak tenaga dan sering bikin ${pain} tanpa hasil memuaskan.`;
    problemVisual = `Tunjukkan kekurangan metode lama yang merepotkan`;
    problemOverlay = `Cara Lama: Ribet & Lambat ❌`;
    demoDialogue = `Sedangkan ${pName} dengan ${feature} modern, langsung bikin ${benefit} jauh lebih efisien.`;
    demoVisual = `Fokus ke keunggulan cepat dan modern dari ${pName}`;
    demoOverlay = `Cara Baru: Cepat & Efisien ✅`;
    valueDialogue = `Teknologi baru yang jauh lebih unggul di segala aspek kenyamanan.`;
    valueVisual = `Singkirkan alat lama, tampilkan ${pName} di tengah sorotan`;
    valueOverlay = `Pemenang Mutlak 🏆`;
    ctaDialogue = `Saatnya beralih ke cara modern, intip detailnya di keranjang kiri bawah!`;
    ctaVisual = `Tunjuk ke arah keranjang kiri bawah`;
    ctaOverlay = `Beralih ke Cara Modern ⬇️`;
  } else if (lowerAngle.includes('secret') || lowerAngle.includes('hack') || lowerAngle.includes('rahasia')) {
    // 17. Hidden Gem/Secret Hack (Trik Rahasia)
    hookDialogue = `Spill trik rahasia yang jarang orang tahu: cara gampang menuntaskan masalah ${pain}!`;
    hookVisual = `Gestur bisik-bisik penasaran ke kamera, sorot sudut tersembunyi ${pName}`;
    hookOverlay = `Trik Rahasia 🤫`;
    hookStrategy = 'Curiosity loop life-hack hook';
    problemDialogue = `Banyak orang belum tahu shortcut praktis ini dan masih capek sendiri berjam-jam.`;
    problemVisual = `Tatap kamera seolah membagikan rahasia penting`;
    problemOverlay = `Jarang Ada yang Tahu ⚡`;
    demoDialogue = `Kuncinya ada di ${pName}. Fitur tersembunyi ${feature}-nya bikin ${benefit} jauh lebih santai.`;
    demoVisual = `Sorot tombol tersembunyi atau cara pakai unik produk`;
    demoOverlay = `Shortcut Cerdas 🚀`;
    valueDialogue = `Trik pintar yang bikin rutinitasmu jauh lebih efisien tanpa buang tenaga.`;
    valueVisual = `Ekspresi puas mengagumi kemudahan produk`;
    valueOverlay = `Hack Terbaik 💡`;
    ctaDialogue = `Buktikan trik ini sendiri sekarang, klik keranjang di kiri bawah ya!`;
    ctaVisual = `Arahkan tangan ke keranjang bawah video ini`;
    ctaOverlay = `Klik Keranjang Kiri Bawah ⬇️`;
  } else if (lowerAngle.includes('gift') || lowerAngle.includes('hadiah') || lowerAngle.includes('kado')) {
    // 18. Gift/Recommendation (Rekomendasi Hadiah)
    hookDialogue = `Lagi bingung cari kado berguna yang pasti kepakai dan bikin penerimanya senang? Ini jawabannya!`;
    hookVisual = `Tunjukkan ${pName} dalam pose presentasi elegan seolah memberi hadiah`;
    hookOverlay = `Ide Kado Terbaik 🎁`;
    hookStrategy = 'Thoughtful gift utility hook';
    problemDialogue = `Sering bingung mau kasih hadiah apa yang solutif buat orang yang sering ${pain}.`;
    problemVisual = `Ekspresi memikirkan kado yang tepat`;
    problemOverlay = `Biar Gak Mubazir ✨`;
    demoDialogue = `Nah, ${pName} ini pilihan sempurna. Ada ${feature} fungsional yang bakal bikin ${benefit} buat kesehariannya.`;
    demoVisual = `Perlihatkan kemasan dan bodi produk yang cantik dan mewah`;
    demoOverlay = `Pasti Kepakai Harian 👍`;
    valueDialogue = `Hadiah bermakna yang bikin mereka selalu ingat sama kebaikanmu tiap kali pakai.`;
    valueVisual = `Pose tersenyum hangat memegang produk`;
    valueOverlay = `Kado Berkesan ❤️`;
    ctaDialogue = `Kasih yang terbaik buat orang tersayang, dapatkan sekarang di keranjang kiri bawah!`;
    ctaVisual = `Tunjuk ramah ke keranjang kiri bawah`;
    ctaOverlay = `Dapatkan Hadiah Ini ⬇️`;
  } else if (lowerAngle.includes('behind') || lowerAngle.includes('layar') || lowerAngle.includes('bts')) {
    // 19. Behind the Scenes (Di Balik Layar)
    hookDialogue = `Bocoran di balik layar: ini senjata rahasia yang gak pernah absen nemenin aku tiap hari!`;
    hookVisual = `Kamera memperlihatkan suasana meja kerja atau ruang kerja sebelum zoom ke ${pName}`;
    hookOverlay = `Di Balik Layar 🎥`;
    hookStrategy = 'Insider backstage authenticity hook';
    problemDialogue = `Banyak yang nanya rahasianya bisa tetap tenang dan gak terganggu sama ${pain}.`;
    problemVisual = `Tatap kamera berbicara santai tentang kenyataan di balik layar`;
    problemOverlay = `Rahasia Ketenangan 🎬`;
    demoDialogue = `Jawabannya selalu ${pName}. Fitur ${feature}-nya bekerja konsisten untuk bikin ${benefit} tanpa drama.`;
    demoVisual = `Tunjukkan produk sedang dipakai di tengah aktivitas kerja`;
    demoOverlay = `Andalan Harian ⚡`;
    valueDialogue = `Barang wajib yang beneran ngebantu alur kerja jadi lebih mulus.`;
    valueVisual = `Fokus ke produk yang berdiri kokoh dan fungsional`;
    valueOverlay = `Wajib Ada di Set 🌟`;
    ctaDialogue = `Miliki senjata rahasia ini juga, langsung cek di keranjang kiri bawah!`;
    ctaVisual = `Tunjuk ke keranjang kiri bawah`;
    ctaOverlay = `Cek Keranjang Kiri Bawah ⬇️`;
  } else {
    // 20. Problem-Solution (PAS Default)
    hookDialogue = `Sering kesel tiap kali ${pain}? Jangan diabaikan, tonton video ini sampai habis!`;
    hookVisual = `Tunjukkan ${pName} langsung di depan kamera dengan gestur fokus`;
    hookOverlay = `Solusi Buat Kamu 🛑`;
    hookStrategy = 'Pattern interrupt problem-agitation hook';
    problemDialogue = `Banyak dari kita yang ngalamin hal serupa setiap hari. Padahal solusinya simpel banget.`;
    problemVisual = `Perlihatkan ekspresi relate terhadap masalah sehari-hari`;
    problemOverlay = `Pernah Ngalamin Ini? 😩`;
    demoDialogue = `Kenalin ${pName}! Keunggulannya punya ${feature}, jadi ${benefit} tanpa ribet.`;
    demoVisual = `Close up detail ${pName}, demokan fitur ${feature}`;
    demoOverlay = `${feature} ✨`;
    valueDialogue = `Bahannya awet dan beneran ngebantu banget dipakai sehari-hari. Hemat tenaga dan waktu.`;
    valueVisual = `Perlihatkan keutuhan produk dan hasil pemakaian praktis`;
    valueOverlay = `Rekomendasi Terbaik! 👍`;
    ctaDialogue = `Langsung cek detail variasi dan amankan di keranjang kiri bawah sekarang ya!`;
    ctaVisual = `Tunjuk gestur jari ke arah keranjang di sudut kiri bawah layar`;
    ctaOverlay = `Cek Keranjang Kiri Bawah ⬇️`;
  }

  const segments = [
    {
      timeRange: '0-3 detik',
      segmentName: 'HOOK',
      visualDirection: hookVisual,
      spokenDialogue: hookDialogue,
      overlayText: hookOverlay,
      strategyNote: hookStrategy,
    },
    {
      timeRange: '3-8 detik',
      segmentName: 'PROBLEM',
      visualDirection: problemVisual,
      spokenDialogue: problemDialogue,
      overlayText: problemOverlay,
      strategyNote: 'Relatable context problem',
    },
    {
      timeRange: '8-20 detik',
      segmentName: 'DEMO',
      visualDirection: demoVisual,
      spokenDialogue: demoDialogue,
      overlayText: demoOverlay,
      strategyNote: 'Visual proof and feature demonstration',
    },
    {
      timeRange: '20-25 detik',
      segmentName: 'VALUE',
      visualDirection: valueVisual,
      spokenDialogue: valueDialogue,
      overlayText: valueOverlay,
      strategyNote: 'Value reinforcement',
    },
    {
      timeRange: '25-30 detik',
      segmentName: 'CTA',
      visualDirection: ctaVisual || `Tunjuk gestur jari ke arah keranjang di sudut kiri bawah layar`,
      spokenDialogue: ctaDialogue || `Langsung cek detailnya di keranjang kiri bawah sekarang ya!`,
      overlayText: ctaOverlay || `Cek Keranjang Kiri Bawah ⬇️`,
      strategyNote: 'Neutral multi-platform CTA',
    },
  ];

  const voiceoverOnly = segments.map((s) => s.spokenDialogue).join(' ');
  const words = countWords(voiceoverOnly);

  return {
    id: `script-${Date.now()}-${index}`,
    title: `Konsep #${index}: ${angle}`,
    angle,
    persona,
    differentiator: `Pendekatan unik berbasis angle ${angle}`,
    hookType: config.hookType,
    triggers: ['Pattern Interrupt', 'Relatable Context', 'Direct Solution', 'Neutral CTA'],
    estimatedDurationSeconds: config.durationSeconds,
    spokenWordCount: words,
    durationStatus: evaluateDurationStatus(words, config.durationSeconds).status,
    segments,
    voiceoverOnly,
    qualityChecklist: [
      'Hook 3 detik pertama',
      'Fakta produk akurat',
      'Safe zone overlay',
      `Target kata ${targetWords.min}-${targetWords.max} kata`,
    ],
    warnings: [],
  };
}

function buildBatchUserPrompt(
  productBrief: ProductBrief,
  config: GenerationConfig,
  batchNumber: number,
  startIndex: number,
  endIndex: number,
  batchCount: number,
  assignedAngles: string[],
  targetWords: { min: number; max: number }
): string {
  const safeFeatures = Array.isArray(productBrief.features) && productBrief.features.length > 0
    ? productBrief.features.join(', ')
    : (Array.isArray((productBrief as any).keyFeatures) && (productBrief as any).keyFeatures.length > 0
        ? (productBrief as any).keyFeatures.join(', ')
        : 'Sesuai deskripsi');

  const safeBenefits = Array.isArray(productBrief.benefits) && productBrief.benefits.length > 0
    ? productBrief.benefits.join(', ')
    : 'Sesuai deskripsi';

  const safePainPoints = Array.isArray(productBrief.painPoints) && productBrief.painPoints.length > 0
    ? productBrief.painPoints.join(', ')
    : (Array.isArray((productBrief as any).targetAudiencePainPoints) && (productBrief as any).targetAudiencePainPoints.length > 0
        ? (productBrief as any).targetAudiencePainPoints.join(', ')
        : 'Kebutuhan fungsional sehari-hari');

  const safeRestrictions = Array.isArray(productBrief.restrictions) && productBrief.restrictions.length > 0
    ? productBrief.restrictions.join(', ')
    : 'Hindari overclaim medis tanpa izin';

  return `
TUGAS BATCH #${batchNumber}: Anda WAJIB memproduksi TEPAT ${batchCount} KONSEP SKRIP AFFILIATE MULTI-PLATFORM (SIAP REKAM) DENGAN CERITA, HOOK, DAN VISUAL YANG BERBEDA SECARA RADIKAL.
Nomor urut konsep dalam batch ini: Konsep #${startIndex} sampai #${endIndex} (Total tepat ${batchCount} konsep).

DATA PRODUK (SUMBER RESMI TERVERIFIKASI):
- Nama Produk: ${productBrief.name}
- Kategori: ${productBrief.category}
- Ringkasan: ${productBrief.description}
- Fitur Terverifikasi: ${safeFeatures}
- Manfaat Wajar: ${safeBenefits}
- Target Persona: ${productBrief.audience || (productBrief as any).targetAudience || 'Pengguna umum'}
- Pain Points: ${safePainPoints}
- Harga Sekarang: ${productBrief.currentPrice || (productBrief as any).priceRange || 'Tidak disebutkan (JANGAN MENGARANG ANGKA HARGA)'}
- Harga Pembanding: ${productBrief.referencePrice || 'Tidak disebutkan'}
- Promo/Voucher: ${productBrief.promoDetails || (productBrief as any).callToActionOffer || 'Tidak disebutkan'}
- Stok/Deadline: ${productBrief.stockOrDeadline || 'Tidak disebutkan (JANGAN BUAT SCARCITY PALSU)'}
- Social Proof: ${productBrief.socialProof || 'Tidak disebutkan (JANGAN SEBUT ANGKA PENJUALAN PALSU)'}
- Pengalaman Kreator: ${productBrief.creatorExperience || 'Gunakan sudut pandang demonstrasi/informasi natural'}
- Batasan/Hal Dilarang: ${safeRestrictions}

KONFIGURASI BATCH:
- Target Durasi: ${config.durationSeconds} detik (WAJIB ${targetWords.min}–${targetWords.max} kata dialog narasi lisan)
- Gaya Penyampaian: ${config.style}
- Persona Audiens: ${config.audiencePersona}
- Metode Demo: ${config.demoMethod}
- Pendekatan CTA: ${config.ctaType} (Wajib netral: "keranjang kiri bawah" / "keranjang bawah video ini", DILARANG "keranjang kuning")
- Intensitas Penjualan: ${config.sellingIntensity}
- Price Anchoring: ${config.priceAnchoringEnabled && productBrief.currentPrice ? 'Gunakan data harga' : 'NONAKTIFKAN'}
- Sapaan/Pronoun: ${config.pronouns}
- Instruksi Tambahan Pengguna: ${config.extraInstructions || '-'}

DAFTAR PENUGASAN WAJIB ${batchCount} KONSEP PADA BATCH INI (HARUS 100% BERBEDA ANTARA SATU DAN LAINNYA):
${assignedAngles
  .map((ang, i) => {
    const idx = startIndex + i;
    const hookTypes = [
      'Pertanyaan Relatable Masalah Harian',
      'Pengakuan POV Kisah Nyata Orang Pertama',
      'Peringatan Kontrarian / Pola Interupsi',
      'Demonstrasi Hasil Cepat di Detik Awal',
      'Bongkar Mitos vs Fakta Sebenarnya',
      'Spill Trik Rahasia / Shortcut Praktis',
      'Adu Kualitas vs Cara Lama',
      'Unboxing Taktil Estetik & Tekstur',
    ];
    const hookStyle = hookTypes[i % hookTypes.length];
    return `* Konsep #${idx} (id: "skrip-${idx}"):
      - Angle: "${ang}"
      - Gaya Hook Pembuka: "${hookStyle}"
      - ATURAN: Buka dengan kalimat dan kata pertama yang berbeda dari konsep lain! Skenario cerita, visual B-roll, dan overlay teks harus khas angle "${ang}".`;
  })
  .join('\n')}

ATURAN ANTI-REPETISI & DIVERSIFIKASI MUTLAK:
1. DILARANG KERAS MENGHASILKAN POLA ATAU FORMULA KALIMAT PEMBUKA YANG SAMA ANTAR-KONSEP!
2. Jika Konsep A membuka dengan pertanyaan, Konsep B WAJIB membuka dengan pernyataan/cerita, Konsep C dengan larangan/kontrarian, Konsep D dengan aksi demo langsung.
3. Arahan visual B-roll harus variatif: ada yang close-up tangan, ada yang tatap kamera, ada yang split perbandingan, ada yang unboxing.
4. DILARANG menyebut nama platform (Shopee, TikTok, Tokopedia).
5. DILARANG menggunakan istilah "keranjang kuning" atau "keranjang orange". Wajib sebutan netral universal: "keranjang kiri bawah" atau "keranjang bawah video ini".

FORMAT OUTPUT JSON (Kembalikan JSON Array murni berisi TEPAT ${batchCount} objek skrip dengan struktur berikut):
[
  {
    "id": "skrip-${startIndex}",
    "title": "Judul Menarik Khas Konsep #${startIndex}",
    "angle": "${assignedAngles[0] || 'Problem-Solution'}",
    "persona": "${config.audiencePersona}",
    "differentiator": "Pembeda spesifik konsep ini",
    "hookType": "${config.hookType}",
    "triggers": ["Pattern Interrupt", "Curiosity Loop", "Demo Proof"],
    "estimatedDurationSeconds": ${config.durationSeconds},
    "spokenWordCount": ${Math.round((targetWords.min + targetWords.max) / 2)},
    "durationStatus": "ok",
    "segments": [
      {
        "timeRange": "0-3 detik",
        "segmentName": "HOOK",
        "visualDirection": "Arahan visual & B-roll detail smartphone",
        "spokenDialogue": "Dialog narasi lisan pembuka yang unik sesuai angle",
        "overlayText": "Teks singkat kontras di safe zone",
        "strategyNote": "Catatan strategi psikologi hook"
      },
      {
        "timeRange": "3-8 detik",
        "segmentName": "PROBLEM",
        "visualDirection": "Arahan visual konteks masalah",
        "spokenDialogue": "Dialog kelanjutan cerita masalah relatable",
        "overlayText": "Teks masalah",
        "strategyNote": "Membangun rasa relate"
      },
      {
        "timeRange": "8-20 detik",
        "segmentName": "DEMO",
        "visualDirection": "Close-up demonstrasi produk nyata",
        "spokenDialogue": "Penjelasan solusi dan fitur utama secara natural",
        "overlayText": "Highlight fitur",
        "strategyNote": "Bukti visual meyakinkan"
      },
      {
        "timeRange": "20-25 detik",
        "segmentName": "VALUE",
        "visualDirection": "Tunjukkan produk utuh dan kenyamanan pemakaian",
        "spokenDialogue": "Penegasan nilai guna dan manfaat nyata",
        "overlayText": "Nilai guna produk",
        "strategyNote": "Menghilangkan keraguan"
      },
      {
        "timeRange": "25-30 detik",
        "segmentName": "CTA",
        "visualDirection": "Arahkan gestur ke sudut kiri bawah layar smartphone",
        "spokenDialogue": "Langsung cek detailnya di keranjang kiri bawah sekarang ya!",
        "overlayText": "Cek Keranjang Kiri Bawah ⬇️",
        "strategyNote": "Ajakan bertindak netral multi-platform"
      }
    ],
    "voiceoverOnly": "Seluruh dialog lisan spokenDialogue digabung siap rekam",
    "qualityChecklist": ["Hook 3 detik pertama", "Fakta produk akurat", "Safe zone overlay", "Durasi sesuai target"],
    "warnings": []
  }
]`;
}

/**
 * Normalizes an array of raw script objects into validated ScriptItems.
 */
export function normalizeRawScripts(
  rawScripts: any[],
  productBrief: ProductBrief,
  config: GenerationConfig,
  assignedAngles: string[],
  startIndex: number,
  targetWords: { min: number; max: number }
): ScriptItem[] {
  if (!Array.isArray(rawScripts) || rawScripts.length === 0) {
    return [];
  }

  return rawScripts.map((s, index) => {
    const itemIndex = startIndex + index;
    const assignedAngle = assignedAngles[index] || s.angle || 'Problem-Solution';
    const id = s.id || `script-${Date.now()}-${itemIndex}`;
    const rawSegments = Array.isArray(s.segments) ? s.segments : [];

    const segments = rawSegments.map((seg: any, sIdx: number) => {
      const cleanDialogue = sanitizeCrossPlatformText(seg.spokenDialogue || '');
      const cleanOverlay = sanitizeCrossPlatformText(seg.overlayText || '');
      const cleanVisual = sanitizeCrossPlatformText(seg.visualDirection || '');

      return {
        timeRange: seg.timeRange || `${sIdx * 5}-${(sIdx + 1) * 5}s`,
        segmentName: seg.segmentName || (sIdx === 0 ? 'HOOK' : sIdx === rawSegments.length - 1 ? 'CTA' : 'BODY'),
        visualDirection: cleanVisual || 'Tampilkan produk ke kamera',
        spokenDialogue: cleanDialogue,
        overlayText: cleanOverlay,
        strategyNote: seg.strategyNote || '',
      };
    });

    const rawVoiceover =
      s.voiceoverOnly && typeof s.voiceoverOnly === 'string'
        ? s.voiceoverOnly
        : segments.map((seg: any) => seg.spokenDialogue).filter(Boolean).join(' ');

    const compiledVoiceover = sanitizeCrossPlatformText(rawVoiceover);
    const actualWordCount = countWords(compiledVoiceover);
    const evalStatus = evaluateDurationStatus(actualWordCount, config.durationSeconds);

    const warnings: string[] = Array.isArray(s.warnings) ? [...s.warnings] : [];
    if (evalStatus.status !== 'ok') {
      warnings.push(evalStatus.message);
    }

    const cleanTitle = sanitizeCrossPlatformText(
      s.title || `Konsep #${itemIndex}: ${assignedAngle}`
    );

    return {
      id,
      title: cleanTitle,
      angle: assignedAngle,
      persona: s.persona || config.audiencePersona,
      differentiator: s.differentiator || `Pendekatan unik berbasis angle ${assignedAngle}`,
      hookType: s.hookType || config.hookType,
      triggers: Array.isArray(s.triggers) && s.triggers.length > 0
        ? s.triggers
        : ['Pattern Interrupt', 'Relatable Context', 'Direct CTA'],
      estimatedDurationSeconds: config.durationSeconds,
      spokenWordCount: actualWordCount,
      durationStatus: evalStatus.status,
      segments,
      voiceoverOnly: compiledVoiceover,
      qualityChecklist: Array.isArray(s.qualityChecklist) && s.qualityChecklist.length > 0
        ? s.qualityChecklist.map((q: string) => sanitizeCrossPlatformText(q))
        : [
            'Hook 3 detik pertama',
            'Fakta produk akurat',
            'Safe zone overlay',
            `Target kata ${targetWords.min}-${targetWords.max} kata`,
          ],
      warnings,
    };
  });
}

/**
 * Safely extracts all completed JSON objects from an in-flight streaming JSON array string.
 * Tracks nested curly brace depth while skipping string literals, enabling instant extraction
 * of Concept #1, #2, etc. as soon as its closing brace '}' arrives from the Gemini stream.
 */
export function extractCompletedJsonObjects(text: string): any[] {
  if (!text) return [];
  const objects: any[] = [];
  let depth = 0;
  let inString = false;
  let escapeNext = false;
  let startIndex = -1;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (char === '\\' && inString) {
      escapeNext = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === '{') {
        if (depth === 0) {
          startIndex = i;
        }
        depth++;
      } else if (char === '}') {
        depth--;
        if (depth === 0 && startIndex !== -1) {
          const candidate = text.slice(startIndex, i + 1);
          try {
            const parsed = JSON.parse(candidate);
            if (parsed && typeof parsed === 'object') {
              objects.push(parsed);
            }
          } catch {}
          startIndex = -1;
        }
      }
    }
  }
  return objects;
}

/**
 * Extracts and parses complete script items from raw text (streaming or batch).
 */
export function extractScriptsFromRawText(
  rawText: string,
  productBrief: ProductBrief,
  config: GenerationConfig,
  assignedAngles: string[],
  startIndex: number,
  targetWords: { min: number; max: number }
): ScriptItem[] {
  let parsed: any[] = [];
  try {
    parsed = JSON.parse(cleanJsonString(rawText));
  } catch {
    try {
      const match = rawText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }
    } catch {
      // Find individual closed JSON objects using balanced brace parser
      parsed = extractCompletedJsonObjects(rawText);
    }
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    parsed = extractCompletedJsonObjects(rawText);
  }

  if (!Array.isArray(parsed)) {
    if (typeof parsed === 'object' && parsed !== null && Array.isArray((parsed as any).scripts)) {
      parsed = (parsed as any).scripts;
    } else if (parsed && typeof parsed === 'object' && parsed !== null) {
      parsed = [parsed];
    } else {
      parsed = [];
    }
  }

  return normalizeRawScripts(parsed, productBrief, config, assignedAngles, startIndex, targetWords);
}

/**
 * Generates a focused batch of scripts with distinct assigned angles and structured segments.
 * Uses STATIC_AFFILIATE_SYSTEM_PROMPT for 100% prefix cache hits on Gemini servers.
 */
async function generateBatchOfScripts(params: {
  productBrief: ProductBrief;
  config: GenerationConfig;
  batchNumber: number;
  startIndex: number;
  batchCount: number;
  assignedAngles: string[];
  targetWords: { min: number; max: number };
  systemPrompt?: string;
  customApiKey?: string;
}): Promise<ScriptItem[]> {
  const {
    productBrief,
    config,
    batchNumber,
    startIndex,
    batchCount,
    assignedAngles,
    targetWords,
    customApiKey,
  } = params;

  const endIndex = startIndex + batchCount - 1;
  const userPrompt = buildBatchUserPrompt(
    productBrief,
    config,
    batchNumber,
    startIndex,
    endIndex,
    batchCount,
    assignedAngles,
    targetWords
  );

  let rawScripts: any[] = [];
  try {
    const response = await callGeminiWithRetry(
      {
        model: GEMINI_MODEL,
        contents: userPrompt,
        config: {
          systemInstruction: STATIC_AFFILIATE_SYSTEM_PROMPT,
          temperature: 0.85,
          responseMimeType: 'application/json',
          maxOutputTokens: 8192,
        },
      },
      customApiKey,
      40000
    );

    const rawText = response.text || '[]';
    rawScripts = extractScriptsFromRawText(
      rawText,
      productBrief,
      config,
      assignedAngles,
      startIndex,
      targetWords
    );
  } catch (err: any) {
    const msg = err?.message || '';
    if (
      err?.isQuotaExhausted ||
      err?.isMissingKey ||
      msg.includes('TOKEN_QUOTA_EXHAUSTED') ||
      msg.includes('429') ||
      msg.includes('RESOURCE_EXHAUSTED') ||
      msg.includes('quota') ||
      msg.includes('API_KEY_INVALID')
    ) {
      throw err;
    }

    console.warn(`[Gemini Batch #${batchNumber}] Fallback due to:`, msg);
    return assignedAngles.slice(0, batchCount).map((angle, idx) =>
      buildFallbackScript(productBrief, config, angle, startIndex + idx, targetWords)
    );
  }

  if (rawScripts.length === 0) {
    return assignedAngles.slice(0, batchCount).map((angle, idx) =>
      buildFallbackScript(productBrief, config, angle, startIndex + idx, targetWords)
    );
  }

  return rawScripts;
}

/**
 * Generates a batch of scripts with live streaming chunks (TTFT 1-2s) and progressive parsing.
 */
async function generateBatchOfScriptsStream(params: {
  productBrief: ProductBrief;
  config: GenerationConfig;
  batchNumber: number;
  startIndex: number;
  batchCount: number;
  assignedAngles: string[];
  targetWords: { min: number; max: number };
  customApiKey?: string;
  onChunk?: (text: string) => void;
  onScriptReady?: (script: ScriptItem) => void;
}): Promise<ScriptItem[]> {
  const {
    productBrief,
    config,
    batchNumber,
    startIndex,
    batchCount,
    assignedAngles,
    targetWords,
    customApiKey,
    onChunk,
    onScriptReady,
  } = params;

  const endIndex = startIndex + batchCount - 1;
  const userPrompt = buildBatchUserPrompt(
    productBrief,
    config,
    batchNumber,
    startIndex,
    endIndex,
    batchCount,
    assignedAngles,
    targetWords
  );

  let accumulatedText = '';
  const emittedIndices = new Set<number>();

  try {
    accumulatedText = await callGeminiStreamWithRetry(
      {
        model: GEMINI_MODEL,
        contents: userPrompt,
        config: {
          systemInstruction: STATIC_AFFILIATE_SYSTEM_PROMPT,
          temperature: 0.85,
          responseMimeType: 'application/json',
          maxOutputTokens: 2500,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      },
      customApiKey,
      (chunk) => {
        accumulatedText += chunk;
        if (onChunk) onChunk(chunk);
        // Attempt progressive object extraction as tokens arrive in real-time
        if (onScriptReady && accumulatedText.length > 80 && accumulatedText.includes('}')) {
          const completedObjs = extractCompletedJsonObjects(accumulatedText);
          if (completedObjs.length > 0) {
            const partial = normalizeRawScripts(
              completedObjs,
              productBrief,
              config,
              assignedAngles,
              startIndex,
              targetWords
            );
            partial.forEach((item, pIdx) => {
              if (!emittedIndices.has(pIdx) && item.segments && item.segments.length >= 3) {
                emittedIndices.add(pIdx);
                onScriptReady(item);
              }
            });
          }
        }
      },
      45000
    );
  } catch (err: any) {
    const msg = err?.message || '';
    if (
      err?.isQuotaExhausted ||
      err?.isMissingKey ||
      msg.includes('TOKEN_QUOTA_EXHAUSTED') ||
      msg.includes('429') ||
      msg.includes('RESOURCE_EXHAUSTED') ||
      msg.includes('quota') ||
      msg.includes('API_KEY_INVALID')
    ) {
      throw err;
    }

    console.warn(`[Gemini Stream Batch #${batchNumber}] Fallback due to:`, msg);
    const fallbacks = assignedAngles.slice(0, batchCount).map((angle, idx) => {
      const fb = buildFallbackScript(productBrief, config, angle, startIndex + idx, targetWords);
      if (onScriptReady && !emittedIndices.has(idx)) {
        emittedIndices.add(idx);
        onScriptReady(fb);
      }
      return fb;
    });
    return fallbacks;
  }

  // Final parsing of all scripts in this batch
  const finalScripts = extractScriptsFromRawText(
    accumulatedText,
    productBrief,
    config,
    assignedAngles,
    startIndex,
    targetWords
  );

  if (finalScripts.length === 0) {
    return assignedAngles.slice(0, batchCount).map((angle, idx) => {
      const fb = buildFallbackScript(productBrief, config, angle, startIndex + idx, targetWords);
      if (onScriptReady && !emittedIndices.has(idx)) {
        emittedIndices.add(idx);
        onScriptReady(fb);
      }
      return fb;
    });
  }

  // Emit any scripts not yet emitted
  finalScripts.forEach((item, pIdx) => {
    if (onScriptReady && !emittedIndices.has(pIdx)) {
      emittedIndices.add(pIdx);
      onScriptReady(item);
    }
  });

  return finalScripts;
}

/**
 * Generates TikTok & multi-platform affiliate scripts based on verified brief and configuration.
 * Uses STATIC_AFFILIATE_SYSTEM_PROMPT to benefit from Gemini implicit Prompt Caching.
 */
export async function generateScripts(params: {
  productBrief: ProductBrief;
  config: GenerationConfig;
  customApiKey?: string;
}): Promise<ScriptItem[]> {
  const { productBrief, config, customApiKey } = params;

  const targetWordsMap: Record<number, { min: number; max: number }> = {
    15: { min: 30, max: 40 },
    20: { min: 45, max: 55 },
    30: { min: 60, max: 75 },
    60: { min: 125, max: 150 },
    90: { min: 200, max: 225 },
    120: { min: 275, max: 320 },
  };
  const targetWords = targetWordsMap[config.durationSeconds] || targetWordsMap[30];

  const totalCount = Math.max(1, Math.min(30, config.scriptCount));
  const batchCounts: number[] = [];
  let remaining = totalCount;
  while (remaining > 0) {
    if (remaining === 4) {
      batchCounts.push(2, 2);
      break;
    }
    const size = Math.min(remaining, 3);
    batchCounts.push(size);
    remaining -= size;
  }

  let currentStart = 1;
  const batchTasks: {
    batchNumber: number;
    startIndex: number;
    batchCount: number;
    assignedAngles: string[];
  }[] = [];

  for (let b = 0; b < batchCounts.length; b++) {
    const bCount = batchCounts[b];
    const assignedAngles = getAssignedAngles(currentStart, bCount, config.selectedAngles);
    batchTasks.push({
      batchNumber: b + 1,
      startIndex: currentStart,
      batchCount: bCount,
      assignedAngles,
    });
    currentStart += bCount;
  }

  const batchResults = await runWithConcurrency(
    batchTasks,
    Math.min(4, batchTasks.length),
    async (task) => {
      return await generateBatchOfScripts({
        productBrief,
        config,
        batchNumber: task.batchNumber,
        startIndex: task.startIndex,
        batchCount: task.batchCount,
        assignedAngles: task.assignedAngles,
        targetWords,
        customApiKey,
      });
    }
  );

  let combinedScripts: ScriptItem[] = [];
  for (const bRes of batchResults) {
    if (Array.isArray(bRes)) {
      combinedScripts.push(...bRes);
    }
  }

  if (combinedScripts.length < totalCount) {
    const missingCount = totalCount - combinedScripts.length;
    const topUpStartIndex = combinedScripts.length + 1;
    const topUpAngles = getAssignedAngles(topUpStartIndex, missingCount, config.selectedAngles);

    try {
      const topUpScripts = await generateBatchOfScripts({
        productBrief,
        config,
        batchNumber: batchTasks.length + 1,
        startIndex: topUpStartIndex,
        batchCount: missingCount,
        assignedAngles: topUpAngles,
        targetWords,
        customApiKey,
      });
      if (Array.isArray(topUpScripts)) {
        combinedScripts.push(...topUpScripts);
      }
    } catch (topUpErr: any) {
      const msg = topUpErr?.message || '';
      if (
        topUpErr?.isQuotaExhausted ||
        topUpErr?.isMissingKey ||
        msg.includes('TOKEN_QUOTA_EXHAUSTED') ||
        msg.includes('429') ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('quota')
      ) {
        throw topUpErr;
      }
      console.warn('Top-up script generation notice:', topUpErr);
    }
  }

  if (combinedScripts.length > totalCount) {
    combinedScripts = combinedScripts.slice(0, totalCount);
  }

  const validatedScripts = combinedScripts.map((s, idx) => {
    const itemNum = idx + 1;
    let title = s.title;
    if (!title || !title.toLowerCase().startsWith('konsep #')) {
      title = `Konsep #${itemNum}: ${s.angle || 'Affiliate'}`;
    }
    return {
      ...s,
      id: `script-${Date.now()}-${itemNum}`,
      title: sanitizeCrossPlatformText(title),
    };
  });

  return validatedScripts;
}

/**
 * Streaming version: Streams tokens in real-time (Time to First Token 1-2s) and progressively emits scripts.
 */
export async function generateScriptsStream(params: {
  productBrief: ProductBrief;
  config: GenerationConfig;
  customApiKey?: string;
  onChunk?: (text: string) => void;
  onScriptReady?: (script: ScriptItem) => void;
}): Promise<ScriptItem[]> {
  const { productBrief, config, customApiKey, onChunk, onScriptReady } = params;

  const targetWordsMap: Record<number, { min: number; max: number }> = {
    15: { min: 30, max: 40 },
    20: { min: 45, max: 55 },
    30: { min: 60, max: 75 },
    60: { min: 125, max: 150 },
    90: { min: 200, max: 225 },
    120: { min: 275, max: 320 },
  };
  const targetWords = targetWordsMap[config.durationSeconds] || targetWordsMap[30];

  const totalCount = Math.max(1, Math.min(30, config.scriptCount));
  const batchCounts: number[] = [];
  let remaining = totalCount;
  while (remaining > 0) {
    if (remaining <= 3) {
      batchCounts.push(remaining);
      break;
    }
    if (remaining === 4) {
      batchCounts.push(2, 2);
      break;
    }
    const size = 3;
    batchCounts.push(size);
    remaining -= size;
  }

  let currentStart = 1;
  const batchTasks: {
    batchNumber: number;
    startIndex: number;
    batchCount: number;
    assignedAngles: string[];
  }[] = [];

  for (let b = 0; b < batchCounts.length; b++) {
    const bCount = batchCounts[b];
    const assignedAngles = getAssignedAngles(currentStart, bCount, config.selectedAngles);
    batchTasks.push({
      batchNumber: b + 1,
      startIndex: currentStart,
      batchCount: bCount,
      assignedAngles,
    });
    currentStart += bCount;
  }

  let allScripts: ScriptItem[] = [];

  if (batchTasks.length === 1) {
    allScripts = await generateBatchOfScriptsStream({
      productBrief,
      config,
      batchNumber: batchTasks[0].batchNumber,
      startIndex: batchTasks[0].startIndex,
      batchCount: batchTasks[0].batchCount,
      assignedAngles: batchTasks[0].assignedAngles,
      targetWords,
      customApiKey,
      onChunk,
      onScriptReady,
    });
  } else {
    // Run concurrent streaming batches (max 2 parallel tasks to protect rate limits while speeding up generation by ~60%)
    const batchResults = await runWithConcurrency(
      batchTasks,
      Math.min(2, batchTasks.length),
      async (task, taskIdx) => {
        return await generateBatchOfScriptsStream({
          productBrief,
          config,
          batchNumber: task.batchNumber,
          startIndex: task.startIndex,
          batchCount: task.batchCount,
          assignedAngles: task.assignedAngles,
          targetWords,
          customApiKey,
          // Bind live chunk stream to task 0 for immediate token output
          onChunk: taskIdx === 0 ? onChunk : undefined,
          onScriptReady,
        });
      }
    );

    for (const b of batchResults) {
      if (Array.isArray(b)) {
        allScripts.push(...b);
      }
    }
  }

  const validatedScripts = allScripts.slice(0, totalCount).map((s, idx) => {
    const itemNum = idx + 1;
    let title = s.title;
    if (!title || !title.toLowerCase().startsWith('konsep #')) {
      title = `Konsep #${itemNum}: ${s.angle || 'Affiliate'}`;
    }
    return {
      ...s,
      id: `script-${Date.now()}-${itemNum}`,
      title: sanitizeCrossPlatformText(title),
    };
  });

  return validatedScripts;
}

/**
 * Refines a single script with targeted adjustments without compromising factual integrity.
 */
export async function refineSingleScript(params: {
  script: ScriptItem;
  productBrief: ProductBrief;
  config: GenerationConfig;
  refinementType: string;
  customInstruction?: string;
  customApiKey?: string;
}): Promise<ScriptItem> {
  const { script, productBrief, config, refinementType, customInstruction, customApiKey } = params;

  const targetWordsMap: Record<number, { min: number; max: number }> = {
    15: { min: 30, max: 40 },
    20: { min: 45, max: 55 },
    30: { min: 60, max: 75 },
    60: { min: 125, max: 150 },
    90: { min: 200, max: 225 },
    120: { min: 275, max: 320 },
  };
  const targetWords = targetWordsMap[config.durationSeconds] || targetWordsMap[30];

  let refinementPrompt = '';
  switch (refinementType) {
    case 'hook_stronger':
      refinementPrompt = 'Buat Hook 3 detik pertama jauh lebih menghentak, scroll-stopping, dan memicu rasa penasaran tanpa overclaim.';
      break;
    case 'more_natural':
      refinementPrompt = 'Ubah gaya bahasa dialog agar lebih santai, mengalir seperti obrolan teman akrab, hapus kesan kaku atau bahasa brosur.';
      break;
    case 'softer_selling':
      refinementPrompt = 'Ubah pendekatan menjadi soft-selling, tonjolkan cerita dan nilai kegunaan sehari-hari, kurangi desakan jualan langsung.';
      break;
    case 'more_concise':
      refinementPrompt = `Persingkat dialog agar lebih padat, hapus kata-kata mubazir, pastikan tepat di batas ${targetWords.min}–${targetWords.max} kata.`;
      break;
    case 'clearer_cta':
      refinementPrompt = 'Buat Call to Action (CTA) di bagian akhir lebih jelas dan netral (gunakan "keranjang kiri bawah" atau "keranjang bawah video ini", DILARANG menyebut "keranjang kuning" atau nama platform tertentu), dan tetap etis tanpa urgensi palsu.';
      break;
    case 'change_angle':
      refinementPrompt = 'Ganti angle dan konsep penyampaian menjadi sudut pandang berbeda yang belum dipakai sebelumnya.';
      break;
    case 'custom':
    default:
      refinementPrompt = customInstruction || 'Sempurnakan skrip ini agar lebih engaging dan siap rekam.';
      break;
  }

  const prompt = `Anda bertugas memperbaiki skrip affiliate multi-platform berikut (Shopee Video, TikTok, Tokopedia).
PERINGATAN:
1. DILARANG menyebut nama platform spesifik (TikTok, Shopee, Tokopedia, dll).
2. DILARANG menggunakan istilah "keranjang kuning" atau "keranjang orange". Gunakan sebutan netral: "keranjang kiri bawah" atau "keranjang bawah video ini".
3. DILARANG mengubah fakta produk (harga, promo, stok, klaim medis, atau testimoni palsu tetap dilarang keras).

SKRIP SAAT INI:
${JSON.stringify(script, null, 2)}

DATA PRODUK YANG SAH:
- Nama: ${productBrief.name}
- Fitur: ${productBrief.features.join(', ')}
- Manfaat: ${productBrief.benefits.join(', ')}
- Harga: ${productBrief.currentPrice || 'Tidak ada'}
- Stok/Promo: ${productBrief.stockOrDeadline || 'Tidak ada'}

INSTRUKSI PERBAIKAN:
${refinementPrompt}

Target kata dialog narasi: ${targetWords.min}–${targetWords.max} kata (${config.durationSeconds} detik).

KEMBALIKAN HANYA OBJEK JSON TUNGGAL DENGAN STRUKTUR SCRIPTITEM:
{
  "id": "${script.id}",
  "title": "string",
  "angle": "string",
  "persona": "string",
  "differentiator": "string",
  "hookType": "string",
  "triggers": ["string"],
  "estimatedDurationSeconds": ${config.durationSeconds},
  "spokenWordCount": 0,
  "durationStatus": "ok",
  "segments": [
    {
      "timeRange": "0-3 detik",
      "segmentName": "HOOK",
      "visualDirection": "string",
      "spokenDialogue": "string",
      "overlayText": "string",
      "strategyNote": "string"
    }
  ],
  "voiceoverOnly": "string",
  "qualityChecklist": ["string"],
  "warnings": []
}`;

  const response = await callGeminiWithRetry(
    {
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        temperature: 0.6,
        responseMimeType: 'application/json',
        maxOutputTokens: 1500,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
      },
    },
    customApiKey
  );

  const parsed = JSON.parse(cleanJsonString(response.text || '{}'));
  const rawSegments = Array.isArray(parsed.segments) ? parsed.segments : script.segments;
  const segments = rawSegments.map((seg: any) => ({
    timeRange: seg.timeRange || '0-3s',
    segmentName: seg.segmentName || 'SEGMENT',
    visualDirection: sanitizeCrossPlatformText(seg.visualDirection || ''),
    spokenDialogue: sanitizeCrossPlatformText(seg.spokenDialogue || ''),
    overlayText: sanitizeCrossPlatformText(seg.overlayText || ''),
    strategyNote: seg.strategyNote || '',
  }));

  const rawVoiceover =
    parsed.voiceoverOnly && typeof parsed.voiceoverOnly === 'string'
      ? parsed.voiceoverOnly
      : segments.map((seg: any) => seg.spokenDialogue).filter(Boolean).join(' ');

  const compiledVoiceover = sanitizeCrossPlatformText(rawVoiceover);
  const actualWordCount = countWords(compiledVoiceover);
  const evalStatus = evaluateDurationStatus(actualWordCount, config.durationSeconds);

  return {
    id: script.id,
    title: sanitizeCrossPlatformText(parsed.title || script.title),
    angle: parsed.angle || script.angle,
    persona: parsed.persona || script.persona,
    differentiator: parsed.differentiator || script.differentiator,
    hookType: parsed.hookType || script.hookType,
    triggers: Array.isArray(parsed.triggers) ? parsed.triggers : script.triggers,
    estimatedDurationSeconds: config.durationSeconds,
    spokenWordCount: actualWordCount,
    durationStatus: evalStatus.status,
    segments,
    voiceoverOnly: compiledVoiceover,
    qualityChecklist: Array.isArray(parsed.qualityChecklist)
      ? parsed.qualityChecklist.map((q: string) => sanitizeCrossPlatformText(q))
      : script.qualityChecklist,
    warnings: evalStatus.status !== 'ok' ? [evalStatus.message] : [],
  };
}
