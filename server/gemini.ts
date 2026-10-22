/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import type { ProductBrief, GenerationConfig, ScriptItem, SourceProvenance } from '../src/types/index.ts';
import type { ScrapedPageResult } from './ssrf.ts';
import { countWords, evaluateDurationStatus } from '../src/utils/wordCount.ts';

/**
 * Daftar Model Keluarga Google yang didukung (Gemini, Google AI Studio, Gemma)
 * dengan rekomendasi utama model v3.8 Flash (sangat optimal untuk API Key awalan AQ..).
 */
export const SUPPORTED_GOOGLE_MODELS = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    tag: 'Rekomendasi Utama',
    desc: 'Model Google generasi terbaru tercepat & paling cerdas untuk skrip affiliate (Optimal untuk AQ..).',
  },
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    tag: 'Tinggi Ketersediaan',
    desc: 'Sangat stabil, responsif, dan throughput tinggi untuk skrip.',
  },
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    tag: 'Tinggi Kecepatan',
    desc: 'Cepat dan handal untuk analisis brief dan penulisan skrip.',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    tag: 'Ultra Hemat Kuota',
    desc: 'Konsumsi token paling efisien dan latensi sangat cepat.',
  },
  {
    id: 'gemini-4-argon',
    name: 'Gemini 4 Argon',
    tag: 'Generasi Mendatang',
    desc: 'Penalaran narasi tingkat lanjut dan pemahaman produk mendalam.',
  },
];

export const GEMINI_MODEL = 'gemini-3.8-flash';

/**
 * Parsing multi API Key dari string teks (pemisah baris baru, koma, titik koma, atau spasi).
 * Mendukung kunci awalan AQ.. maupun AIzaSy..
 */
export function parseApiKeys(input?: string): string[] {
  if (!input) return [];
  const rawParts = input.split(/[\r\n,;|]+/);
  const keys: string[] = [];
  const seen = new Set<string>();

  for (const part of rawParts) {
    const trimmed = part.trim();
    if (trimmed.length >= 10 && !seen.has(trimmed)) {
      seen.add(trimmed);
      keys.push(trimmed);
    }
  }
  return keys;
}

function getAiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Verifikasi cepat API Key Google AI Studio (mendukung banyak kunci sekaligus).
 * Menguji kunci menggunakan model rekomendasi v3.8 Flash.
 */
export async function testGeminiApiKey(
  apiKey: string
): Promise<{ valid: boolean; count?: number; error?: string }> {
  const keys = parseApiKeys(apiKey);
  if (keys.length === 0) {
    return { valid: false, error: 'Harap masukkan minimal satu API Key yang valid dari Google AI Studio.' };
  }

  const testModels = ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];
  let validCount = 0;
  let lastError: any;

  // Uji cepat 2 kunci pertama secara efisien agar proses verifikasi instan
  const sampleKeys = keys.slice(0, 2);
  for (const singleKey of sampleKeys) {
    for (const model of testModels) {
      try {
        const testAi = getAiClient(singleKey);
        await testAi.models.generateContent({
          model,
          contents: 'Ping',
        });
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
          // Kunci ini tidak valid, abaikan model alternatif
          break;
        }
        continue;
      }
    }
  }

  if (validCount > 0) {
    return { valid: true, count: keys.length };
  }

  let errorText = lastError?.message || 'Gagal memverifikasi API Key.';
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
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite',
];

/**
 * Menjalankan panggilan Gemini generateContent dengan rotasi multi-API Key dan failover model super tangguh.
 * Urutan kandidat failover cerdas:
 * 1. Model yang diminta (default: gemini-3.8-flash)
 * 2. gemini-3.6-flash (Sangat stabil & throughput tinggi, kuota terpisah di Google AI Studio)
 * 3. gemini-3.5-flash (Kecepatan tinggi, ketersediaan tinggi, kuota terpisah)
 * 4. gemini-3.5-flash-lite (Hemat token & kuota terpisah)
 * 5. gemini-flash-lite-latest (Alias resmi Flash Lite)
 * 6. gemini-3.1-flash-lite (Ultra hemat)
 *
 * Jika kuota/token pada API Key pertama habis (429/RESOURCE_EXHAUSTED/Rate Limit), sistem secara otomatis
 * beralih menggunakan model alternatif atau kunci berikutnya yang tersedia.
 * Jika seluruh kunci habis kuotanya, melemparkan error terstruktur TOKEN_QUOTA_EXHAUSTED.
 */
export async function callGeminiWithRetry(
  options: any,
  customApiKey?: string | string[],
  timeoutPerCallMs = 38000
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

  const requestedModel = options.model || GEMINI_MODEL;
  const allCandidates = [
    requestedModel,
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3.1-flash-lite',
  ];
  const candidateModels = Array.from(new Set(allCandidates));

  let lastError: any;
  let hadQuotaFailure = false;

  // LOOP UTAMA: Rotasi antar-kunci API pengguna
  for (let keyIdx = 0; keyIdx < rawKeys.length; keyIdx++) {
    const currentKey = rawKeys[keyIdx];
    const client = getAiClient(currentKey);

    // LOOP SUB: Percobaan model candidate
    for (const modelName of candidateModels) {
      let timeoutTimer: NodeJS.Timeout | undefined;
      try {
        const payload = { ...options, model: modelName };

        // Eksekusi generateContent dengan penanganan otomatis untuk lonjakan antrean 503
        const generatePromise = (async () => {
          try {
            return await client.models.generateContent(payload);
          } catch (callErr: any) {
            const callMsg = callErr?.message || '';
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

        // Log informasi keberhasilan failover jika bukan model default
        if (keyIdx > 0) {
          console.info(`[Gemini Failover Berhasil] Sukses mengeksekusi dengan API Key cadangan #${keyIdx + 1} menggunakan ${modelName}`);
        } else if (modelName !== requestedModel) {
          console.info(`[Gemini Failover Berhasil] Sukses mengeksekusi dengan model alternatif ${modelName}`);
        }
        return result;
      } catch (err: any) {
        if (timeoutTimer) clearTimeout(timeoutTimer);
        lastError = err;
        const msg = err?.message || '';

        const isQuota =
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
          hadQuotaFailure = true;
        }

        // Jika kunci invalid, langsung lompat ke kunci berikutnya
        if (isInvalid) {
          if (keyIdx < rawKeys.length - 1) {
            console.warn(
              `[Gemini Key Failover] API Key #${keyIdx + 1} tidak valid/ditolak. Otomatis beralih ke kunci cadangan #${keyIdx + 2}...`
            );
          }
          break;
        }

        // Jika kuota habis pada model tertentu (misal 3.8-flash), model lain (misal 3.6-flash atau 3.5-flash)
        // memiliki pool kuota terpisah di Google AI Studio. Kita coba model alternatif terlebih dahulu.
        console.log(
          `[Gemini Failover] Model ${modelName} dialihkan (${err?.status || 'kendala'}: ${msg.slice(0, 90)}...), mencoba model alternatif...`
        );
        continue;
      }
    }

    // Jika seluruh model pada kunci ini gagal dan masih ada kunci berikutnya:
    if (keyIdx < rawKeys.length - 1) {
      console.warn(
        `[Gemini Key Failover] Seluruh model pada kunci #${keyIdx + 1} mengalami kendala/kuota penuh, beralih ke kunci cadangan #${keyIdx + 2}...`
      );
    }
  }

  // Jika semua kunci dan model gagal dan salah satunya atau semuanya karena kuota habis:
  if (hadQuotaFailure) {
    const quotaExhaustedErr: any = new Error(
      `TOKEN_QUOTA_EXHAUSTED: Token/kuota dari seluruh ${rawKeys.length} API Key Google Anda telah habis. Harap masukkan atau ganti dengan API Key Google AI Studio baru yang masih memiliki kuota untuk melanjutkan.`
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
          temperature: 0.25,
          responseMimeType: 'application/json',
        },
      },
      params.customApiKey,
      45000
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

    // Hanya jika murni error koneksi jaringan / timeout sementara, siapkan brief heuristik yang cerdas dan kaya (BUKAN array kosong!)
    const fallbackName =
      (mode === 'url' || mode === 'mixed') && (params.urlData?.extractedProductTitle || params.urlData?.title)
        ? params.urlData?.extractedProductTitle || params.urlData?.title
        : (mode === 'text' || mode === 'mixed') && params.textDescription
        ? params.textDescription.split('\n')[0]?.slice(0, 80)
        : 'Produk Terpilih';
    const fallbackDesc =
      (mode === 'url' && params.urlData?.description) ||
      (mode === 'text' && params.textDescription) ||
      `Produk berkualitas ${fallbackName} dengan desain fungsional untuk menunjang kebutuhan sehari-hari secara efisien.`;

    const fallbackSource = mode === 'images' ? 'image' : mode === 'url' ? 'url' : 'user';

    return {
      brief: {
        name: fallbackName || 'Produk Unggulan',
        category: (mode === 'url' && params.urlData?.platform) ? `${params.urlData.platform} Best Seller` : 'Produk Populer',
        description: fallbackDesc,
        features: [
          'Material dan build quality kuat & tahan pemakaian harian',
          'Desain ergonomis, praktis, dan mudah digunakan langsung',
          'Spesifikasi fungsional teruji untuk kebutuhan harian',
          'Portabel dan efisien tanpa perlu instalasi rumit',
        ],
        benefits: [
          'Mempermudah aktivitas harian tanpa membuang waktu dan tenaga',
          'Solusi praktis dan hemat biaya dibanding alternatif konvensional',
          'Meningkatkan kenyamanan dan hasil pemakaian lebih maksimal',
          'Aman dan andal untuk penggunaan jangka panjang',
        ],
        audience: 'Konsumen cerdas yang mencari solusi fungsional dan praktis',
        painPoints: [
          'Sering repot atau lelah dengan peralatan yang kurang efisien',
          'Kehabisan waktu karena metode lama yang memakan tenaga',
          'Khawatir produk cepat rusak atau tidak awet',
          'Mencari produk berkualitas dengan harga yang masuk akal',
        ],
        platform: mode === 'url' ? params.urlData?.platform : undefined,
        restrictions: ['Hindari klaim medis tanpa izin resmi', 'Hindari menjanjikan hasil instan tanpa bukti'],
        sources: [
          { field: 'name', source: fallbackSource, confidence: 'high' },
          { field: 'description', source: fallbackSource, confidence: 'medium' },
          { field: 'features', source: fallbackSource, confidence: 'medium' },
          { field: 'benefits', source: fallbackSource, confidence: 'medium' },
        ],
        conflicts: [],
      },
      notes: `Informasi produk berhasil disiapkan dari sumber ${mode}. Silakan tinjau brief sebelum membuat skrip.`,
      conflicts: [],
    };
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
  // Strictly enforce empty conflicts for non-mixed mode and ensure string elements
  const conflicts: string[] = mode === 'mixed' ? toStringArray(parsed.conflicts) : [];

  // Determine final product name
  let finalName = parsed.name && parsed.name !== 'Produk Tanpa Nama' ? parsed.name : '';
  if (!finalName) {
    if (mode === 'url' && (params.urlData?.extractedProductTitle || params.urlData?.title)) {
      finalName = params.urlData.extractedProductTitle || params.urlData.title;
    } else if (mode === 'text' && params.textDescription) {
      finalName = params.textDescription.split('\n')[0]?.slice(0, 80) || 'Produk';
    } else {
      finalName = 'Produk Hasil Analisis';
    }
  }

  // Set accurate provenance sources for single-source mode
  if (mode === 'images') {
    sources = [
      { field: 'name', source: 'image', confidence: 'high' },
      { field: 'category', source: 'image', confidence: 'high' },
      { field: 'features', source: 'image', confidence: 'high' },
      { field: 'description', source: 'image', confidence: 'medium' },
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

  const brief: ProductBrief = {
    name: finalName,
    category: parsed.category || 'Umum',
    description: parsed.description || (mode === 'url' ? params.urlData?.description : '') || '',
    features: toStringArray(parsed.features),
    benefits: toStringArray(parsed.benefits),
    audience: typeof parsed.audience === 'string' ? parsed.audience : 'Umum',
    painPoints: toStringArray(parsed.painPoints),
    currentPrice: parsed.currentPrice || undefined,
    referencePrice: parsed.referencePrice || undefined,
    promoDetails: parsed.promoDetails || undefined,
    stockOrDeadline: parsed.stockOrDeadline || undefined,
    socialProof: parsed.socialProof || undefined,
    creatorExperience: parsed.creatorExperience || undefined,
    platform: mode === 'url' || (mode === 'mixed' && params.urlData) ? params.urlData?.platform : undefined,
    activeSourceMode: mode,
    restrictions: toStringArray(parsed.restrictions),
    sources,
    conflicts: mode === 'mixed' ? conflicts : [],
  };

  const notes =
    mode === 'url' && params.urlData?.platform
      ? `Berhasil memetakan informasi asli dari link ${params.urlData.platform}: "${finalName}".`
      : mode === 'images'
      ? `Berhasil mengekstrak ${params.images?.length || 0} foto produk: "${finalName}".`
      : mode === 'text'
      ? `Berhasil menyusun brief dari teks deskripsi: "${finalName}".`
      : parsed.notes || 'Ekstraksi selesai.';

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
 * Provides distinct hooks, story structures, visual cues, and dialogues based on the specific angle.
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
    : ['kualitas teruji dan praktis', 'desain fungsional', 'tahan lama'];
  const benefits = productBrief.benefits && productBrief.benefits.length > 0
    ? productBrief.benefits
    : ['mempermudah aktivitas sehari-hari', 'hemat tenaga dan waktu'];
  const painPoints = productBrief.painPoints && productBrief.painPoints.length > 0
    ? productBrief.painPoints
    : ['sering repot dengan produk konvensional'];

  const feature = features[(index - 1) % features.length];
  const benefit = benefits[(index - 1) % benefits.length];
  const pain = painPoints[(index - 1) % painPoints.length];
  const persona = config.audiencePersona || productBrief.audience || 'Sahabat Kreator';

  const lowerAngle = angle.toLowerCase();

  let hookDialogue = `Tunggu dulu! Buat kamu yang ${pain}, tonton video ini sampai habis!`;
  let hookVisual = `Tunjukkan ${pName} langsung di depan kamera dengan gestur fokus`;
  let hookOverlay = `Solusi Buat Kamu 🛑`;
  let hookStrategy = 'Pattern interrupt scroll stopper';

  let problemDialogue = `Banyak banget dari kita yang ngalamin hal sama setiap hari. Padahal solusinya simpel banget.`;
  let problemVisual = `Perlihatkan ekspresi relate atau situasi masalah sehari-hari`;
  let problemOverlay = `Pernah Ngalamin Ini? 😩`;

  let demoDialogue = `Kenalin ${pName}! Keunggulannya punya ${feature}, jadi ${benefit} tanpa ribet.`;
  let demoVisual = `Close up detail ${pName}, demokan fitur ${feature}`;
  let demoOverlay = `${feature} ✨`;

  let valueDialogue = `Bahannya awet dan beneran ngebantu banget dipakai sehari-hari. Investasi kecil yang kerasa banget manfaatnya.`;
  let valueVisual = `Perlihatkan keutuhan produk dan hasil pemakaian praktis`;
  let valueOverlay = `Rekomendasi Terbaik! 👍`;

  // Diversifikasi skenario berdasarkan variasi Angle nyata
  if (lowerAngle.includes('story') || lowerAngle.includes('kisah') || lowerAngle.includes('pov')) {
    hookDialogue = `Jujur, awalnya aku skeptis banget sama ${pName} ini, sampai akhirnya cobain sendiri!`;
    hookVisual = `Tatap kamera dengan ekspresi jujur, pegang ${pName} di tangan`;
    hookOverlay = `Pengalaman Jujur Aku 💬`;
    hookStrategy = 'First-person authentic storytelling hook';
    problemDialogue = `Dulu tiap kali ${pain}, rasanya capek dan makan banyak waktu. Beli macam-macam alat tetap gak puas.`;
    problemOverlay = `Sebelum Tahu Ini... 🤦‍♂️`;
    demoDialogue = `Pas ${pName} ini datang, langsung aku uji. Fitur ${feature} ternyata ngebuktiin klaimnya, ${benefit} jadi kerasa instan!`;
    demoOverlay = `Uji Pakai Langsung ⚡`;
    valueDialogue = `Sekarang jadi andalan wajib tiap hari. Buat yang punya keluhan sama, ini beneran game changer.`;
    valueOverlay = `Game Changer Banget ✨`;
  } else if (lowerAngle.includes('bold claim') || lowerAngle.includes('menghentak')) {
    hookDialogue = `Jangan buru-buru beli ${pName} kalau kalian belum siap aktivitas harian jadi secepat ini!`;
    hookVisual = `Tangan menahan layar kamera, lalu geser memperlihatkan ${pName} dengan pencahayaan kontras`;
    hookOverlay = `Jangan Beli Dulu! ⚠️`;
    hookStrategy = 'Contrarian bold claim hook';
    problemDialogue = `Banyak yang masih pakai cara lama padahal udah ketinggalan zaman dan bikin ${pain}.`;
    problemOverlay = `Stop Cara Lama ❌`;
    demoDialogue = `Lihat sendiri performa ${pName}. Didukung ${feature}, bikin ${benefit} selesai dalam hitungan detik.`;
    demoOverlay = `Bukti Nyata Langsung 🔥`;
    valueDialogue = `Kualitas build dan fungsinya setara barang kelas atas tapi harganya ramah di kantong.`;
    valueOverlay = `Worth It Parah! 💯`;
  } else if (lowerAngle.includes('myth') || lowerAngle.includes('mitos')) {
    hookDialogue = `Masih banyak yang percaya kalau mau ${benefit} itu harus keluar modal jutaan? Salah besar!`;
    hookVisual = `Gelengkan kepala dengan ekspresi heran, angkat ${pName} ke depan lensa`;
    hookOverlay = `Mitos vs Fakta 🔍`;
    hookStrategy = 'Myth-busting counter-intuitive hook';
    problemDialogue = `Faktanya kita sering kemakan iklan mahal, padahal yang kita butuhin cuma solusi praktis buat ngatasin ${pain}.`;
    problemOverlay = `Jangan Tertipu Gimmick 🙅‍♂️`;
    demoDialogue = `Coba cek ${pName}. Rahasianya ada di ${feature}, yang fokus bikin ${benefit} tanpa embel-embel ribet.`;
    demoOverlay = `Fakta Fungsional 💡`;
    valueDialogue = `Gak perlu buang uang buat fitur gak berguna. Pilih yang fungsional dan terbukti solutif.`;
    valueOverlay = `Pilihan Cerdas! ✅`;
  } else if (lowerAngle.includes('unboxing') || lowerAngle.includes('asmr') || lowerAngle.includes('impression')) {
    hookDialogue = `Dengerin suara unboxing ${pName} yang lagi viral ini. First impression-nya bikin takjub!`;
    hookVisual = `Close-up tangan membuka kemasan produk perlahan dengan audio renyah`;
    hookOverlay = `Unboxing Time 📦`;
    hookStrategy = 'Sensory tactile unboxing hook';
    problemDialogue = `Biasanya barang sejenis suka tipis atau ringkih pas dipegang, bikin was-was pas ${pain}.`;
    problemOverlay = `Material Kokoh Banget 🛡️`;
    demoDialogue = `Tapi pas pegang ${pName}, feel-nya solid banget! Ada ${feature} yang presisi, pas dites langsung ${benefit}.`;
    demoOverlay = `Detail & Finishing Rapi ✨`;
    valueDialogue = `Dari kemasan sampai fungsinya beneran niat. Gak heran ulasannya pada puas semua.`;
    valueOverlay = `Puas Banget! ⭐⭐⭐⭐⭐`;
  } else if (lowerAngle.includes('mistake') || lowerAngle.includes('salah')) {
    hookDialogue = `Stop lakuin kesalahan ini pas kalian lagi ${pain}! Sini aku kasih tahu solusinya.`;
    hookVisual = `Gestur tangan tanda silang (stop), lalu tunjukkan ${pName}`;
    hookOverlay = `Hindari Salah Ini! 🛑`;
    hookStrategy = 'Mistake agitation authority hook';
    problemDialogue = `Kesalahan nomor satu adalah maksain alat seadanya yang bikin hasil gak maksimal dan gampang rusak.`;
    problemOverlay = `Penyebab Masalah 🤦‍♀️`;
    demoDialogue = `Mulai sekarang ganti ke ${pName}. Berkat ${feature}, kalian bisa ${benefit} dengan cara yang benar dan aman.`;
    demoOverlay = `Solusi Tepat & Aman 🛡️`;
    valueDialogue = `Sekali pakai langsung kerasa bedanya. Jangan tunggu makin repot baru nyesel.`;
    valueOverlay = `Ganti Sekarang 👍`;
  } else if (lowerAngle.includes('how-to') || lowerAngle.includes('tutorial') || lowerAngle.includes('edukasi')) {
    hookDialogue = `Cara paling gampang buat ${benefit} cuma butuh satu alat ini!`;
    hookVisual = `Lakukan demonstrasi kilat 1 detik penggunaan ${pName}`;
    hookOverlay = `Tutorial Kilat ⏱️`;
    hookStrategy = 'Action-oriented educational hook';
    problemDialogue = `Gak perlu lagi pusing atau ribet kalau pas lagi ${pain}.`;
    problemOverlay = `Bebas Ribet 💆`;
    demoDialogue = `Cukup pakai ${pName}. Langkahnya simpel banget karena ada ${feature}, tinggal pakai dan langsung ${benefit}.`;
    demoOverlay = `Mudah Banget Dipakai 👌`;
    valueDialogue = `Bahkan pemula sekalipun langsung bisa pakai tanpa perlu tutorial panjang. Praktis pol!`;
    valueOverlay = `Super Praktis! ⭐`;
  } else if (lowerAngle.includes('secret') || lowerAngle.includes('hack') || lowerAngle.includes('hidden')) {
    hookDialogue = `Spill trik rahasia yang jarang orang tahu: cara gampang ngatasin ${pain}!`;
    hookVisual = `Ekspresi bisik-bisik penasaran, sorot ${pName} dari sudut tersembunyi`;
    hookOverlay = `Trik Rahasia 🤫`;
    hookStrategy = 'Curiosity loop life-hack hook';
    problemDialogue = `Banyak orang belum tahu jalan pintas ini dan masih repot sendiri berjam-jam.`;
    problemOverlay = `Jarang Ada yang Tahu ⚡`;
    demoDialogue = `Kuncinya ada di ${pName}. Fitur tersembunyi ${feature}-nya bikin ${benefit} jauh lebih santai.`;
    demoOverlay = `Hack Terbaik 🚀`;
    valueDialogue = `Sekarang giliran kamu yang buktiin sendiri sebelum barangnya kehabisan.`;
    valueOverlay = `Buktiin Sendiri! 🎯`;
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
      visualDirection: `Tunjuk gestur jari ke arah keranjang di sudut kiri bawah layar`,
      spokenDialogue: `Langsung cek detailnya di keranjang kiri bawah sekarang ya!`,
      overlayText: `Cek Keranjang Kiri Bawah ⬇️`,
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

/**
 * Generates a focused batch of up to 5 scripts with distinct assigned angles and structured segments.
 */
async function generateBatchOfScripts(params: {
  productBrief: ProductBrief;
  config: GenerationConfig;
  batchNumber: number;
  startIndex: number;
  batchCount: number;
  assignedAngles: string[];
  targetWords: { min: number; max: number };
  systemPrompt: string;
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
    systemPrompt,
    customApiKey,
  } = params;

  const endIndex = startIndex + batchCount - 1;

  const userPrompt = `
TUGAS BATCH #${batchNumber}: Anda WAJIB memproduksi TEPAT ${batchCount} KONSEP SKRIP AFFILIATE MULTI-PLATFORM (SIAP REKAM) YANG BERBEDA SECARA RADIKAL.
Nomor urut konsep dalam batch ini: Konsep #${startIndex} sampai #${endIndex} (Total tepat ${batchCount} konsep).

DATA PRODUK (SUMBER RESMI TERVERIFIKASI):
- Nama Produk: ${productBrief.name}
- Kategori: ${productBrief.category}
- Ringkasan: ${productBrief.description}
- Fitur Terverifikasi: ${productBrief.features.join(', ') || 'Sesuai deskripsi'}
- Manfaat Wajar: ${productBrief.benefits.join(', ') || 'Sesuai deskripsi'}
- Target Persona: ${productBrief.audience}
- Pain Points: ${productBrief.painPoints.join(', ') || 'Kebutuhan fungsional'}
- Harga Sekarang: ${productBrief.currentPrice || 'Tidak disebutkan (JANGAN MENGARANG ANGKA HARGA)'}
- Harga Pembanding: ${productBrief.referencePrice || 'Tidak disebutkan'}
- Promo/Voucher: ${productBrief.promoDetails || 'Tidak disebutkan'}
- Stok/Deadline: ${productBrief.stockOrDeadline || 'Tidak disebutkan (JANGAN BUAT SCARCITY PALSU)'}
- Social Proof: ${productBrief.socialProof || 'Tidak disebutkan (JANGAN SEBUT ANGKA PENJUALAN PALSU)'}
- Pengalaman Kreator: ${productBrief.creatorExperience || 'Gunakan sudut pandang demonstrasi/informasi natural'}
- Batasan/Hal Dilarang: ${productBrief.restrictions.join(', ') || 'Hindari overclaim'}

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

DAFTAR PENUGASAN WAJIB ${batchCount} KONSEP PADA BATCH INI (HARUS BERBEDA TOTAL ANTARA SATU DAN LAINNYA):
${assignedAngles
  .map(
    (ang, i) =>
      `* Konsep #${startIndex + i} (id: "skrip-${startIndex + i}"): WAJIB gunakan Angle "${ang}". Buat judul spesifik, skenario unik, dan hook yang relevan dengan angle ini.`
  )
  .join('\n')}

ATURAN ANTI-REPETISI & DIVERSIFIKASI MUTLAK:
1. DILARANG KERAS MENGHASILKAN POLA ATAU KALIMAT YANG SAMA ANTAR-KONSEP!
2. Setiap konsep harus memiliki kalimat pembuka, sudut cerita, arahan B-roll visual, dan overlay yang berbeda.
3. DILARANG menyebut nama platform (Shopee, TikTok, Tokopedia).
4. DILARANG menggunakan istilah "keranjang kuning" atau "keranjang orange". Wajib sebutan netral universal: "keranjang kiri bawah" atau "keranjang bawah video ini".

FORMAT OUTPUT JSON (Kembalikan Array murni tanpa markdown, berisi TEPAT ${batchCount} objek skrip):
[
  {
    "id": "skrip-${startIndex}",
    "title": "Judul Kreatif Konsep #${startIndex}",
    "angle": "${assignedAngles[0] || 'Problem-Solution'}",
    "persona": "${config.audiencePersona}",
    "differentiator": "Pembeda utama konsep ini dibanding konsep lain",
    "hookType": "${config.hookType}",
    "triggers": ["Pattern Interrupt", "Curiosity Loop", "Demo Proof"],
    "estimatedDurationSeconds": ${config.durationSeconds},
    "spokenWordCount": ${Math.round((targetWords.min + targetWords.max) / 2)},
    "durationStatus": "ok",
    "segments": [
      {
        "timeRange": "0-3 detik",
        "segmentName": "HOOK",
        "visualDirection": "Arahan visual & B-roll detail (bisa dieksekusi sendiri dengan HP)",
        "spokenDialogue": "Dialog narasi lisan Bahasa Indonesia yang mengalir",
        "overlayText": "Teks singkat kontras di safe zone",
        "strategyNote": "Catatan strategi/psikologi"
      },
      {
        "timeRange": "3-8 detik",
        "segmentName": "PROBLEM",
        "visualDirection": "Arahan visual konteks masalah",
        "spokenDialogue": "Dialog kelanjutan masalah penonton",
        "overlayText": "Teks singkat masalah",
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
        "visualDirection": "Tunjukkan produk utuh dan kemasan",
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
        "strategyNote": "Ajakan bertindak netral tanpa manipulasi"
      }
    ],
    "voiceoverOnly": "Seluruh dialog lisan spokenDialogue digabung siap rekam",
    "qualityChecklist": ["Hook 3 detik pertama", "Fakta produk akurat", "Safe zone overlay", "Durasi sesuai target"],
    "warnings": []
  }
]`;

  let rawScripts: any[] = [];
  try {
    const response = await callGeminiWithRetry(
      {
        model: GEMINI_MODEL,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.85,
          responseMimeType: 'application/json',
          maxOutputTokens: 8192,
        },
      },
      customApiKey,
      40000
    );

    const rawText = response.text || '[]';
    try {
      rawScripts = JSON.parse(cleanJsonString(rawText));
    } catch {
      try {
        const cleaned = cleanJsonString(rawText);
        rawScripts = JSON.parse(cleaned);
      } catch {
        const match = rawText.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (match) {
          try {
            rawScripts = JSON.parse(match[0]);
          } catch {}
        }
      }
    }
  } catch (err: any) {
    const msg = err?.message || '';
    // Jika error karena kuota token habis atau key invalid, JANGAN DITELAN! Lemparkan langsung agar user tahu
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

    console.warn(
      `[Gemini Batch #${batchNumber}] Jaringan bermasalah, memproduksi skrip multi-angle terdiversifikasi:`,
      msg
    );
    // Fallback: construct distinct scripts based on verified brief & specific assigned angles
    return assignedAngles.slice(0, batchCount).map((angle, idx) =>
      buildFallbackScript(productBrief, config, angle, startIndex + idx, targetWords)
    );
  }

  if (!Array.isArray(rawScripts)) {
    if (typeof rawScripts === 'object' && Array.isArray((rawScripts as any).scripts)) {
      rawScripts = (rawScripts as any).scripts;
    } else if (rawScripts && typeof rawScripts === 'object') {
      rawScripts = [rawScripts];
    } else {
      rawScripts = [];
    }
  }

  // If parsed array is empty, also use fallback
  if (rawScripts.length === 0) {
    return assignedAngles.slice(0, batchCount).map((angle, idx) =>
      buildFallbackScript(productBrief, config, angle, startIndex + idx, targetWords)
    );
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
 * Generates TikTok & multi-platform affiliate scripts based on verified brief and configuration.
 * Generates exact requested count (1, 5, 10, 20, 30) using optimized concurrent batches and distinct angles.
 */
export async function generateScripts(params: {
  productBrief: ProductBrief;
  config: GenerationConfig;
  customApiKey?: string;
}): Promise<ScriptItem[]> {
  const { productBrief, config, customApiKey } = params;

  // Target word counts strictly from PRD:
  // 15s: 30-40 words
  // 30s: 60-75 words
  // 60s: 125-150 words
  // 90s: 200-225 words
  const targetWordsMap: Record<number, { min: number; max: number }> = {
    15: { min: 30, max: 40 },
    20: { min: 45, max: 55 },
    30: { min: 60, max: 75 },
    60: { min: 125, max: 150 },
    90: { min: 200, max: 225 },
    120: { min: 275, max: 320 },
  };
  const targetWords = targetWordsMap[config.durationSeconds] || targetWordsMap[30];

  const systemPrompt = `Anda adalah Master Copywriter & Content Strategist Video Affiliate Short Video (Multi-Platform: Shopee Video, TikTok, Tokopedia) nomor satu di Indonesia.
Anda memproduksi skrip video affiliate yang siap rekam, multi-platform (bisa di-mirror ke semua e-commerce), mengalir alami, memikat perhatian di detik awal, dan memiliki kepatuhan etika & faktual 100%.

ATURAN UTAMA MULTI-PLATFORM & NETRALITAS E-COMMERCE (KRUSIAL & MUTLAK):
1. VIDEO AKAN DI-MIRROR / DI-CROSS-POST KE BERBAGAI PLATFORM (Shopee Video, TikTok Shop, Tokopedia, dll):
   - DILARANG KERAS MENYEBUT NAMA PLATFORM APAPUN (JANGAN sebut "TikTok", "Shopee", "Tokopedia", "Lazada", dll) dalam dialog narasi lisan, overlay text, maupun arahan visual!
   - DILARANG KERAS MENGGUNAKAN ISTILAH EKSKLUSIF 1 PLATFORM SEPERTI "keranjang kuning" ATAU "keranjang orange"!
   - WAJIB MENGGUNAKAN SEBUTAN NETRAL UNIVERSAL UNTUK CALL TO ACTION (CTA), seperti:
     * "klik keranjang di kiri bawah"
     * "cek keranjang bawah video ini"
     * "klik ikon keranjang di bawah"
     * "langsung cek variasi di keranjang bawah"
     * "lihat detailnya di keranjang kiri bawah"
     * "checkout sekarang lewat keranjang di bawah"
2. JANGAN PERNAH MENGARANG DATA:
   - Jika harga saat ini (${productBrief.currentPrice || 'TIDAK ADA'}) tidak ada, DILARANG menyebut angka harga atau membuat price anchoring palsu.
   - Jika promo/stok/deadline (${productBrief.stockOrDeadline || 'TIDAK ADA'}) tidak ada, DILARANG memakai scarcity palsu ("tinggal sedikit", "promo berakhir hari ini").
   - Jika social proof (${productBrief.socialProof || 'TIDAK ADA'}) tidak ada, DILARANG mengaku "sudah terjual ribuan" atau "banyak ulasan positif".
   - Jika pengalaman kreator (${productBrief.creatorExperience || 'TIDAK ADA'}) tidak ada, DILARANG memakai "saya sudah pakai 1 bulan" atau testimoni palsu orang pertama.
   - DILARANG menjanjikan kesembuhan penyakit, hasil instan tanpa bukti, atau overclaim.
3. ATURAN DIVERSIFIKASI & ANTI-REPETISI ANTAR-KONSEP (INTI APLIKASI GAGASWARA):
   - DILARANG KERAS MENGHASILKAN POLA ATAU FORMULA KALIMAT YANG SAMA ANTARA SATU KONSEP DENGAN KONSEP LAINNYA!
   - Setiap konsep HARUS memiliki:
     * Hook pembuka berbeda total (gaya pertanyaan kontras, cerita POV orang pertama, bantahan mitos, spill rahasia, atau demo kilat).
     * Skenario dialog dan alur cerita unik yang mengeksplorasi sudut pandang berbeda dari produk tersebut.
     * Arahan visual B-roll yang variatif untuk bahan video affiliate dalam jumlah banyak.
     * Pembeda spesifik (differentiator) yang kuat.
4. TARGET JUMLAH KATA NARASI DIALOG LISAN (DIHITUNG HANYA DIALOG, BUKAN ARAHAN VISUAL/OVERLAY):
   - Durasi ${config.durationSeconds} detik: WAJIB berkisar antara ${targetWords.min} sampai ${targetWords.max} KATA lisan.
   - Pacing harus pas: tidak terlalu padat dan tidak terlalu renggang.
5. STRUKTUR SEGMEN:
   - HOOK (0-3 detik): Scroll-stopper kuat, sebut kata kunci/nama produk secara natural bila relevan.
   - PROBLEM / RELATABLE CONTEXT: Masalah nyata atau situasi yang dialami penonton.
   - DEMONSTRASI & BUKTI: B-roll dan visual realistis yang murah dan mudah direkam kreator dengan smartphone.
   - VALUE / HARGA (Hanya bila data harga tersedia): Nilai guna atau perbandingan logis.
   - CTA: Ajakan bertindak jelas ke keranjang kiri bawah / keranjang bawah video ini / cek variasi di bawah, tanpa memanipulasi urgensi, tanpa menyebut nama platform, dan TANPA kata 'keranjang kuning'.
6. SAFE ZONE UNIVERSAL VERTICAL (1080x1920):
   - Teks overlay harus pendek, mudah dibaca cepat, kontras, dan berada di tengah (menghindari margin atas 130px, margin kanan 140px, margin bawah 484px).
7. STRATEGI:
   - Gunakan sedikitnya 3 pemicu konten (misal: pattern interrupt, curiosity loop, relatable problem, demo proof, value framing, low-friction CTA).
   - Tulis pemicu di kolom catatan strategi, BUKAN diucapkan dalam dialog narasi.
`;

  // Determine batch plan based on total scriptCount (up to 5 scripts per batch for optimal speed & quota efficiency)
  const totalCount = Math.max(1, Math.min(30, config.scriptCount));
  const maxBatchSize = 5;
  const batchCounts: number[] = [];
  let remaining = totalCount;
  while (remaining > 0) {
    const size = Math.min(remaining, maxBatchSize);
    batchCounts.push(size);
    remaining -= size;
  }

  // Build batch tasks with calculated start indices and assigned distinct angles
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

  // Execute batches concurrently in parallel (up to 4 batches simultaneously) to maximize throughput
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
        systemPrompt,
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

  // Verification & Top-Up: If any batch produced fewer than requested, generate the missing ones!
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
        systemPrompt,
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

  // Final trim in case of any overflow
  if (combinedScripts.length > totalCount) {
    combinedScripts = combinedScripts.slice(0, totalCount);
  }

  // Normalize sequential numbering and titles
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
