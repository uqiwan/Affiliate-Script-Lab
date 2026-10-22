/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  ProductBrief,
  GenerationConfig,
  ScriptItem,
  ExtractProductResponse,
  GenerateScriptsResponse,
  RefineScriptResponse,
  InputMode,
  SourceProvenance,
} from '../types';
import { parseApiKeys, cleanSingleKey, safeHeaderValue } from '../utils/apiKeys';
import { countWords, evaluateDurationStatus } from '../utils/wordCount';

// Candidate models prioritized for speed, reasoning, and throughput
export const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
];

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

let directRotationIndex = 0;
const directQuotaTracker = new Map<string, number>();
const DIRECT_COOLDOWN_MS = 5 * 60 * 1000;

/**
 * Sanitizes markdown JSON delimiters
 */
export function cleanJsonString(raw: string): string {
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
 * Sanitizes platform-specific terms and neutralizes CTAs.
 * Replaces 'keranjang kuning' with 'keranjang kiri bawah' or 'keranjang bawah video ini'.
 */
export function sanitizeCrossPlatformText(text: string): string {
  if (!text) return '';
  return text
    .replace(/keranjang\s+kuning/gi, 'keranjang kiri bawah')
    .replace(/klik\s+keranjang\s+kuning/gi, 'klik keranjang kiri bawah')
    .replace(/cek\s+keranjang\s+kuning/gi, 'cek keranjang bawah video ini')
    .replace(/checkout\s+di\s+keranjang\s+kuning/gi, 'checkout di keranjang bawah')
    .replace(/keranjang\s+orange/gi, 'keranjang kiri bawah')
    .replace(/keranjang\s+oranye/gi, 'keranjang kiri bawah')
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

/**
 * Executes a Gemini generateContent request directly against Google's public REST API.
 * Completely client-side, zero backend server requirement, supports all Google AI Studio keys.
 */
export async function callGeminiDirect(params: {
  contents: any;
  systemInstruction?: string;
  preferredModel?: string;
  responseMimeType?: string;
  temperature?: number;
  maxOutputTokens?: number;
  apiKey?: string;
  timeoutMs?: number;
}): Promise<string> {
  const {
    contents,
    systemInstruction,
    preferredModel,
    responseMimeType = 'application/json',
    temperature = 0.7,
    maxOutputTokens = 8192,
    apiKey,
    timeoutMs = 45000,
  } = params;

  let rawKeys: string[] = [];
  if (apiKey) {
    rawKeys = parseApiKeys(apiKey);
  }
  if (rawKeys.length === 0 && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('affiliate_script_lab_api_key');
      if (stored) rawKeys = parseApiKeys(stored);
    } catch {}
  }

  if (rawKeys.length === 0) {
    const err: any = new Error(
      'MISSING_MOBILE_API_KEY: API Key Google AI Studio belum diatur. Harap masukkan API Key Anda di menu profil/kunci kanan atas.'
    );
    err.isMissingKey = true;
    err.status = 401;
    throw err;
  }

  const totalKeys = rawKeys.length;
  const startIdx = (directRotationIndex++) % totalKeys;
  const orderedKeys: { key: string; index: number }[] = [];
  for (let i = 0; i < totalKeys; i++) {
    const idx = (startIdx + i) % totalKeys;
    orderedKeys.push({ key: rawKeys[idx], index: idx });
  }

  const models = [...CANDIDATE_MODELS];
  if (preferredModel && models.includes(preferredModel)) {
    const pIdx = models.indexOf(preferredModel);
    if (pIdx > 0) {
      models.splice(pIdx, 1);
      models.unshift(preferredModel);
    }
  }

  const now = Date.now();
  let lastError: any;
  let exhaustedCount = 0;

  for (const { key: rawKey } of orderedKeys) {
    const cleanKey = cleanSingleKey(rawKey);
    if (!cleanKey || cleanKey.length < 6) continue;

    const cooldownUntil = directQuotaTracker.get(cleanKey);
    if (cooldownUntil && now < cooldownUntil && totalKeys > 1) {
      exhaustedCount++;
      continue;
    }

    for (const model of models) {
      let controller: AbortController | null = null;
      let timer: any = null;

      try {
        controller = new AbortController();
        timer = setTimeout(() => controller?.abort(), timeoutMs);

        // Standard Google Generative Language REST API
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          model
        )}:generateContent?key=${encodeURIComponent(cleanKey)}`;

        // Build Google REST API payload
        const reqBody: any = {
          generationConfig: {
            temperature,
            maxOutputTokens,
          },
        };

        if (responseMimeType) {
          reqBody.generationConfig.responseMimeType = responseMimeType;
        }

        if (systemInstruction) {
          reqBody.systemInstruction = {
            parts: [{ text: systemInstruction }],
          };
        }

        // Format contents
        if (typeof contents === 'string') {
          reqBody.contents = [{ parts: [{ text: contents }] }];
        } else if (Array.isArray(contents)) {
          // If array of parts
          reqBody.contents = [{ parts: contents }];
        } else if (contents && contents.parts) {
          reqBody.contents = [contents];
        } else {
          reqBody.contents = [{ parts: [{ text: JSON.stringify(contents) }] }];
        }

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        };
        if (cleanKey.startsWith('ya29.')) {
          headers['Authorization'] = `Bearer ${safeHeaderValue(cleanKey)}`;
        } else {
          headers['x-goog-api-key'] = safeHeaderValue(cleanKey);
        }

        const res = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(reqBody),
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (!res.ok) {
          const errorJson = await res.json().catch(() => null);
          const errorMsg =
            errorJson?.error?.message ||
            `HTTP ${res.status} ${res.statusText || 'Gagal memproses'}`;
          const err: any = new Error(errorMsg);
          err.status = res.status;
          throw err;
        }

        const data = await res.json();
        const candidate = data?.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text || '';

        // Success: clear quota cooldown
        directQuotaTracker.delete(cleanKey);
        return text;
      } catch (err: any) {
        if (timer) clearTimeout(timer);
        lastError = err;
        const msg = err?.message || '';

        const isQuota =
          err?.status === 429 ||
          msg.includes('429') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('quota') ||
          msg.includes('Quota exceeded');

        const isKeyInvalid =
          err?.status === 400 &&
          (msg.includes('API_KEY_INVALID') ||
            msg.includes('API key not valid') ||
            msg.includes('PERMISSION_DENIED'));

        if (isQuota) {
          console.warn(`[DirectGemini] Kuota habis untuk model ${model}, mencoba model/kunci berikutnya`);
          continue; // Try next model on same key, or next key
        }

        if (isKeyInvalid) {
          console.warn(`[DirectGemini] Kunci tidak valid, beralih ke kunci berikutnya`);
          break; // Stop testing models on this invalid key
        }

        // High demand 503 or model not found -> try next model
        continue;
      }
    }
  }

  if (exhaustedCount >= totalKeys && totalKeys > 0) {
    const quotaErr: any = new Error(
      'TOKEN_QUOTA_EXHAUSTED: Token/kuota dari seluruh API Key Google Anda telah mencapai batas. Harap ganti dengan API Key Google AI Studio baru yang masih memiliki kuota untuk melanjutkan.'
    );
    quotaErr.isQuotaExhausted = true;
    quotaErr.status = 429;
    throw quotaErr;
  }

  throw lastError || new Error('Gagal menghubungi Google AI Studio. Pastikan koneksi internet aktif.');
}

/**
 * Builds structured fallback script when network fails
 */
function buildDirectFallbackScript(
  productBrief: ProductBrief,
  config: GenerationConfig,
  angle: string,
  index: number,
  targetWords: { min: number; max: number }
): ScriptItem {
  const pName = productBrief.name || 'Produk Ini';
  const features = productBrief.features?.length
    ? productBrief.features
    : ['material awet & kokoh', 'desain ergonomis siap pakai', 'kualitas teruji'];
  const benefits = productBrief.benefits?.length
    ? productBrief.benefits
    : ['mempermudah rutinitas harian', 'menghemat waktu dan tenaga'];
  const painPoints = productBrief.painPoints?.length
    ? productBrief.painPoints
    : ['sering repot dengan cara konvensional'];

  const feature = features[(index - 1) % features.length];
  const benefit = benefits[(index - 1) % benefits.length];
  const pain = painPoints[(index - 1) % painPoints.length];
  const persona = config.audiencePersona && config.audiencePersona !== 'Auto'
    ? config.audiencePersona
    : productBrief.audience || 'Sahabat Kreator';

  const segments = [
    {
      timeRange: '0-3 detik',
      segmentName: 'HOOK',
      visualDirection: `Tatap kamera mantap dengan gestur memegang ${pName} di depan lensa`,
      spokenDialogue: `Siapa di sini yang masih sering pusing pas ${pain}? Sini aku kasih tahu solusinya!`,
      overlayText: `Solusi Masalah Kamu 🛑`,
      strategyNote: 'Pattern interrupt problem-agitation hook',
    },
    {
      timeRange: '3-8 detik',
      segmentName: 'PROBLEM',
      visualDirection: `Perlihatkan gestur relate terhadap kerepotan saat ${pain}`,
      spokenDialogue: `Banyak yang belum sadar kalau cara lama itu makan banyak waktu dan tenaga.`,
      overlayText: `Stop Cara Lama ❌`,
      strategyNote: 'Relatable context',
    },
    {
      timeRange: '8-20 detik',
      segmentName: 'DEMO',
      visualDirection: `Close-up demonstrasi ${pName}, sorot fitur ${feature}`,
      spokenDialogue: `Kenalin ${pName}! Fitur ${feature}-nya ngebantu banget biar ${benefit} jadi cepat dan praktis.`,
      overlayText: `${feature} ✨`,
      strategyNote: 'Visual proof',
    },
    {
      timeRange: '20-25 detik',
      segmentName: 'VALUE',
      visualDirection: `Tunjukkan produk utuh dan hasil pemakaian yang memuaskan`,
      spokenDialogue: `Build quality-nya bagus dan awet dipakai harian. Beneran investasi kepraktisan buat kamu.`,
      overlayText: `Worth It Banget! 💯`,
      strategyNote: 'Value reinforcement',
    },
    {
      timeRange: '25-30 detik',
      segmentName: 'CTA',
      visualDirection: `Tunjuk santai ke sudut kiri bawah layar smartphone`,
      spokenDialogue: `Biar gak makin repot, langsung cek variasi di keranjang kiri bawah sekarang ya!`,
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
    differentiator: `Pendekatan berbasis angle ${angle}`,
    hookType: config.hookType || 'Auto',
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
 * Direct Client-Side Product Extraction:
 * Runs completely inside Android APK WebView / Browser directly with Google AI Studio.
 */
export async function directExtractProduct(params: {
  inputMode: InputMode;
  textDescription?: string;
  productUrl?: string;
  images?: Array<{ name: string; mimeType: string; base64Data: string; size: number }>;
  apiKey?: string;
}): Promise<ExtractProductResponse> {
  const mode = params.inputMode || 'mixed';
  const parts: any[] = [];

  // Add images as inlineData
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

  let prompt = `Anda adalah sistem ekstraksi fakta produk untuk kreator TikTok & Affiliate e-commerce di Indonesia.
Tugas Anda: membaca informasi produk yang diberikan dan menyusun Product Brief terstruktur mendalam.

MODE EKSTRAKSI: ${mode.toUpperCase()}
`;

  if (mode === 'images') {
    prompt += `
PERHATIAN MODE FOTO (HANYA DARI GAMBAR PRODUK):
- Analisis gambar produk (${params.images?.length || 0} foto) secara menyeluruh.
- Ekstrak nama produk lengkap, merek/varian, kemasan, label, bentuk fisik, tombol, material, dan fitur nyata yang tampak.
- KARENA HANYA ADA 1 SUMBER (FOTO), FIELD 'conflicts' WAJIB BERUPA ARRAY KOSONG [].
`;
  } else if (mode === 'url') {
    prompt += `
PERHATIAN MODE LINK / TAUTAN:
- Tautan produk: "${params.productUrl || ''}"
- Analisis produk berdasarkan tautan dan konteks nama/kategori e-commerce yang relevan.
- Uraikan fitur standar produk nyata tersebut, manfaat fungsional, persona audiens, dan pain points.
- KARENA HANYA ADA 1 SUMBER (LINK), FIELD 'conflicts' WAJIB BERUPA ARRAY KOSONG [].
`;
  } else if (mode === 'text') {
    prompt += `
PERHATIAN MODE TEKS:
- Analisis deskripsi produk yang dimasukkan pengguna.
- KARENA HANYA ADA 1 SUMBER (TEKS), FIELD 'conflicts' WAJIB BERUPA ARRAY KOSONG [].
`;
  } else {
    prompt += `
PERHATIAN MODE CAMPURAN:
- Gabungkan informasi dari foto, link, dan teks. Catat perbedaan data di 'conflicts' jika ada.
`;
  }

  prompt += `
ATURAN EKSTRAKSI FAKTA:
1. BACA SUMBER SECARA MENDALAM:
   - Identifikasi nama produk nyata, kategori spesifik, fungsi utama.
   - Field "features": WAJIB berisi minimal 4-6 butir fitur spesifik, material, ukuran, atau keunggulan fungsional.
   - Field "benefits": WAJIB berisi minimal 4-6 butir manfaat langsung bagi pengguna.
   - Field "painPoints": WAJIB berisi minimal 4-6 masalah/keluhan yang tuntas diselesaikan oleh produk.
   - Field "description": Ringkasan komprehensif informatif (3-5 kalimat).
2. FAKTUAL & ETIS:
   - Jangan karang angka harga jika tidak tertulis.
   - Jangan klaim medis/kesembuhan atau BPOM kecuali terbukti pada kemasan.

DATA SUMBER:
`;

  if (params.textDescription) {
    prompt += `\n[Deskripsi Teks]:\n${params.textDescription}\n`;
  }
  if (params.productUrl) {
    prompt += `\n[Tautan Produk]: ${params.productUrl}\n`;
  }
  if (params.images && params.images.length > 0) {
    prompt += `\n[Foto Produk]: ${params.images.length} foto dilampirkan.\n`;
  }

  prompt += `
FORMAT OUTPUT JSON (Kembalikan JSON murni tanpa markdown):
{
  "name": "Nama produk lengkap & jelas",
  "category": "Kategori produk e-commerce spesifik",
  "description": "Ringkasan deskripsi mendalam tentang produk, keunggulan, dan kegunaannya",
  "features": ["Fitur nyata 1 (spesifikasi fisik/material/ukuran)", "Fitur nyata 2", "Fitur nyata 3", "Fitur nyata 4", "Fitur nyata 5"],
  "benefits": ["Manfaat nyata 1 yang dirasakan pembeli", "Manfaat nyata 2", "Manfaat nyata 3", "Manfaat nyata 4"],
  "audience": "Persona target pembeli spesifik yang paling membutuhkan",
  "painPoints": ["Masalah nyata 1 yang dihadapi pembeli", "Masalah nyata 2", "Masalah nyata 3", "Masalah nyata 4"],
  "currentPrice": "Rp... (atau kosongkan jika tidak eksplisit)",
  "referencePrice": "Rp... (harga normal jika ada)",
  "promoDetails": "diskon/voucher (jika eksplisit)",
  "stockOrDeadline": "stok/tenggat waktu (jika eksplisit)",
  "socialProof": "ulasan atau bukti sosial nyata jika ada",
  "creatorExperience": "pengalaman pemakaian wajar",
  "restrictions": ["klaim overclaim atau batasan yang harus dihindari"],
  "conflicts": [],
  "notes": "catatan singkat proses ekstraksi fakta"
}`;

  parts.push({ text: prompt });

  const rawText = await callGeminiDirect({
    contents: parts,
    apiKey: params.apiKey,
    temperature: 0.2,
    responseMimeType: 'application/json',
  });

  let parsed: any;
  try {
    parsed = JSON.parse(cleanJsonString(rawText));
  } catch {
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch {}
    }
    if (!parsed) parsed = {};
  }

  function toStringArray(arr: any): string[] {
    if (!Array.isArray(arr)) return [];
    return arr
      .map((item: any) => {
        if (typeof item === 'string') return item.trim();
        if (typeof item === 'object' && item !== null) {
          if (item.field && item.detail) return `${item.field}: ${item.detail}`;
          return item.detail || item.description || item.message || JSON.stringify(item);
        }
        return String(item).trim();
      })
      .filter(Boolean);
  }

  let finalName = parsed.name && parsed.name !== 'Produk Tanpa Nama' ? parsed.name : '';
  if (!finalName) {
    if (mode === 'text' && params.textDescription) {
      finalName = params.textDescription.split('\n')[0]?.slice(0, 80) || 'Produk Pilihan Affiliate';
    } else {
      finalName = 'Produk Pilihan Affiliate';
    }
  }

  const rawFeatures = toStringArray(parsed.features);
  const rawBenefits = toStringArray(parsed.benefits);
  const rawPainPoints = toStringArray(parsed.painPoints);

  const cleanCategory = parsed.category || 'Produk Affiliate';
  const cleanDescription =
    parsed.description ||
    `${finalName} merupakan produk ${cleanCategory} dengan desain fungsional dan material berkualitas untuk menunjang aktivitas pengguna secara praktis.`;

  const finalFeatures =
    rawFeatures.length >= 3
      ? rawFeatures
      : [
          `Desain ergonomis & material awet untuk pemakaian harian ${finalName}`,
          `Spesifikasi fungsional presisi yang langsung siap digunakan`,
          `Bentuk ringkas & portabel, hemat ruang penyimpanan`,
          `Fitur unggulan teruji untuk efisiensi aktivitas harian`,
          ...rawFeatures,
        ].slice(0, 5);

  const finalBenefits =
    rawBenefits.length >= 3
      ? rawBenefits
      : [
          `Mempermudah aktivitas harian tanpa membuang waktu dan tenaga`,
          `Memberikan solusi praktis dengan hasil pemakaian maksimal`,
          `Nyaman dan aman digunakan secara berulang untuk jangka panjang`,
          `Meningkatkan efisiensi kerja atau rutinitas pengguna`,
          ...rawBenefits,
        ].slice(0, 5);

  const finalPainPoints =
    rawPainPoints.length >= 3
      ? rawPainPoints
      : [
          `Sering repot atau lelah dengan peralatan konvensional`,
          `Kehabisan waktu karena cara lama yang memakan banyak tenaga`,
          `Khawatir barang cepat rusak atau tidak awet dipakai`,
          `Mencari produk berkualitas yang solutif dengan harga bersahabat`,
          ...rawPainPoints,
        ].slice(0, 5);

  const finalAudience =
    parsed.audience && parsed.audience !== 'Umum'
      ? parsed.audience
      : `Konsumen dan kreator cerdas yang membutuhkan solusi praktis dari ${finalName}`;

  const sources: SourceProvenance[] = [
    {
      field: 'name',
      source: mode === 'images' ? 'image' : mode === 'url' ? 'url' : 'user',
      confidence: 'high',
    },
    {
      field: 'features',
      source: mode === 'images' ? 'image' : mode === 'url' ? 'url' : 'user',
      confidence: 'high',
    },
  ];

  const conflicts: string[] = mode === 'mixed' ? toStringArray(parsed.conflicts) : [];

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
    activeSourceMode: mode,
    restrictions: toStringArray(parsed.restrictions).length > 0
      ? toStringArray(parsed.restrictions)
      : ['Hindari klaim medis tanpa izin', 'Hindari menjanjikan hasil instan tanpa bukti'],
    sources,
    conflicts,
  };

  return {
    productBrief: brief,
    conflictsFound: conflicts,
    warning: undefined,
  };
}

/**
 * Direct Client-Side Script Generation:
 * Generates 1 to 30 high-converting affiliate scripts directly with Google AI Studio.
 */
export async function directGenerateScripts(params: {
  productBrief: ProductBrief;
  config: GenerationConfig;
  apiKey?: string;
}): Promise<GenerateScriptsResponse> {
  const { productBrief, config, apiKey } = params;

  const targetWordsMap: Record<number, { min: number; max: number }> = {
    15: { min: 30, max: 40 },
    20: { min: 45, max: 55 },
    30: { min: 60, max: 75 },
    60: { min: 125, max: 150 },
    90: { min: 200, max: 225 },
    120: { min: 275, max: 320 },
  };
  const targetWords = targetWordsMap[config.durationSeconds] || targetWordsMap[30];

  const systemPrompt = `Anda adalah Master Copywriter & Content Strategist Video Affiliate Short Video nomor satu di Indonesia.
Anda memproduksi skrip video affiliate yang siap rekam, multi-platform, memikat perhatian di detik awal, dan memiliki kepatuhan faktual 100%.

ATURAN KRUSIAL MULTI-PLATFORM:
1. DILARANG KERAS menyebut nama platform (Shopee, TikTok, Tokopedia).
2. DILARANG KERAS menggunakan istilah "keranjang kuning" atau "keranjang orange".
3. Wajib sebutan netral: "keranjang kiri bawah" atau "keranjang bawah video ini".
4. DILARANG mengarang angka harga, promo, atau klaim medis yang tidak tercantum di brief.
5. Durasi ${config.durationSeconds} detik: WAJIB berkisar antara ${targetWords.min} sampai ${targetWords.max} KATA lisan.
6. Format JSON Array murni tanpa markdown.`;

  const totalCount = Math.max(1, Math.min(30, config.scriptCount));
  const maxBatchSize = 5;
  const batchCounts: number[] = [];
  let remaining = totalCount;
  while (remaining > 0) {
    const size = Math.min(remaining, maxBatchSize);
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

  const sourceAngles =
    config.selectedAngles && config.selectedAngles.length > 0
      ? config.selectedAngles
      : DEFAULT_20_ANGLES;

  for (let b = 0; b < batchCounts.length; b++) {
    const bCount = batchCounts[b];
    const assignedAngles: string[] = [];
    for (let i = 0; i < bCount; i++) {
      const aIdx = (currentStart - 1 + i) % sourceAngles.length;
      assignedAngles.push(sourceAngles[aIdx]);
    }
    batchTasks.push({
      batchNumber: b + 1,
      startIndex: currentStart,
      batchCount: bCount,
      assignedAngles,
    });
    currentStart += bCount;
  }

  const generatedScripts: ScriptItem[] = [];

  for (const task of batchTasks) {
    const endIndex = task.startIndex + task.batchCount - 1;
    const userPrompt = `TUGAS BATCH #${task.batchNumber}: Buat TEPAT ${task.batchCount} KONSEP SKRIP AFFILIATE SIAP REKAM.
Nomor konsep: Konsep #${task.startIndex} sampai #${endIndex}.

DATA PRODUK:
- Nama Produk: ${productBrief.name}
- Kategori: ${productBrief.category}
- Ringkasan: ${productBrief.description}
- Fitur: ${productBrief.features.join(', ')}
- Manfaat: ${productBrief.benefits.join(', ')}
- Target Persona: ${productBrief.audience}
- Pain Points: ${productBrief.painPoints.join(', ')}
- Harga: ${productBrief.currentPrice || 'Tidak disebutkan'}

KONFIGURASI:
- Durasi: ${config.durationSeconds} detik (${targetWords.min}-${targetWords.max} kata lisan)
- Gaya: ${config.style}
- Pronoun: ${config.pronouns}
- Instruksi Tambahan: ${config.extraInstructions || '-'}

PENUGASAN ANGLE WAJIB:
${task.assignedAngles
  .map((ang, i) => `* Konsep #${task.startIndex + i}: Angle "${ang}"`)
  .join('\n')}

FORMAT OUTPUT JSON (Array murni ${task.batchCount} objek):
[
  {
    "id": "skrip-${task.startIndex}",
    "title": "Konsep #${task.startIndex}: ${task.assignedAngles[0]}",
    "angle": "${task.assignedAngles[0]}",
    "persona": "${config.audiencePersona}",
    "differentiator": "Pembeda konsep",
    "hookType": "${config.hookType}",
    "triggers": ["Pattern Interrupt", "Relatable Problem", "Direct Solution"],
    "estimatedDurationSeconds": ${config.durationSeconds},
    "spokenWordCount": ${Math.round((targetWords.min + targetWords.max) / 2)},
    "durationStatus": "ok",
    "segments": [
      {
        "timeRange": "0-3 detik",
        "segmentName": "HOOK",
        "visualDirection": "Arahan visual kamera HP",
        "spokenDialogue": "Dialog pembuka memikat",
        "overlayText": "Teks safe zone",
        "strategyNote": "Catatan psikologi hook"
      },
      {
        "timeRange": "3-8 detik",
        "segmentName": "PROBLEM",
        "visualDirection": "Konteks masalah",
        "spokenDialogue": "Dialog relate masalah",
        "overlayText": "Teks masalah",
        "strategyNote": "Relatability"
      },
      {
        "timeRange": "8-20 detik",
        "segmentName": "DEMO",
        "visualDirection": "Demonstrasi produk",
        "spokenDialogue": "Penjelasan solusi natural",
        "overlayText": "Fitur produk",
        "strategyNote": "Bukti visual"
      },
      {
        "timeRange": "20-25 detik",
        "segmentName": "VALUE",
        "visualDirection": "Tunjukkan produk utuh",
        "spokenDialogue": "Penegasan nilai kegunaan",
        "overlayText": "Nilai guna",
        "strategyNote": "Value"
      },
      {
        "timeRange": "25-30 detik",
        "segmentName": "CTA",
        "visualDirection": "Tunjuk ke sudut kiri bawah",
        "spokenDialogue": "Langsung cek detailnya di keranjang kiri bawah sekarang ya!",
        "overlayText": "Cek Keranjang Kiri Bawah ⬇️",
        "strategyNote": "Neutral CTA"
      }
    ],
    "voiceoverOnly": "Gabungan dialog lisan",
    "qualityChecklist": ["Hook 3 detik pertama", "Safe zone overlay", "Durasi sesuai target"],
    "warnings": []
  }
]`;

    try {
      const rawText = await callGeminiDirect({
        contents: userPrompt,
        systemInstruction: systemPrompt,
        apiKey,
        temperature: 0.8,
        responseMimeType: 'application/json',
      });

      let rawScripts: any[] = [];
      try {
        rawScripts = JSON.parse(cleanJsonString(rawText));
      } catch {
        const match = rawText.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (match) {
          try {
            rawScripts = JSON.parse(match[0]);
          } catch {}
        }
      }

      if (!Array.isArray(rawScripts) || rawScripts.length === 0) {
        // Fallback for this batch
        const fallbacks = task.assignedAngles.map((ang, idx) =>
          buildDirectFallbackScript(
            productBrief,
            config,
            ang,
            task.startIndex + idx,
            targetWords
          )
        );
        generatedScripts.push(...fallbacks);
      } else {
        const processed = rawScripts.map((s, idx) => {
          const itemIdx = task.startIndex + idx;
          const assignedAngle = task.assignedAngles[idx] || s.angle || 'Problem-Solution';
          const rawSegments = Array.isArray(s.segments) ? s.segments : [];

          const segments = rawSegments.map((seg: any, sIdx: number) => ({
            timeRange: seg.timeRange || `${sIdx * 5}-${(sIdx + 1) * 5}s`,
            segmentName:
              seg.segmentName ||
              (sIdx === 0 ? 'HOOK' : sIdx === rawSegments.length - 1 ? 'CTA' : 'BODY'),
            visualDirection:
              sanitizeCrossPlatformText(seg.visualDirection) || 'Tunjukkan produk ke kamera',
            spokenDialogue: sanitizeCrossPlatformText(seg.spokenDialogue) || '',
            overlayText: sanitizeCrossPlatformText(seg.overlayText) || '',
            strategyNote: seg.strategyNote || '',
          }));

          const rawVo =
            s.voiceoverOnly ||
            segments.map((seg: any) => seg.spokenDialogue).filter(Boolean).join(' ');
          const compiledVoiceover = sanitizeCrossPlatformText(rawVo);
          const actualWords = countWords(compiledVoiceover);
          const evalStatus = evaluateDurationStatus(actualWords, config.durationSeconds);

          return {
            id: s.id || `script-${Date.now()}-${itemIdx}`,
            title: sanitizeCrossPlatformText(
              s.title || `Konsep #${itemIdx}: ${assignedAngle}`
            ),
            angle: assignedAngle,
            persona: s.persona || config.audiencePersona,
            differentiator:
              s.differentiator || `Pendekatan unik berbasis angle ${assignedAngle}`,
            hookType: s.hookType || config.hookType,
            triggers:
              Array.isArray(s.triggers) && s.triggers.length > 0
                ? s.triggers
                : ['Pattern Interrupt', 'Relatable Context', 'Direct CTA'],
            estimatedDurationSeconds: config.durationSeconds,
            spokenWordCount: actualWords,
            durationStatus: evalStatus.status,
            segments,
            voiceoverOnly: compiledVoiceover,
            qualityChecklist: [
              'Hook 3 detik pertama',
              'Fakta produk akurat',
              'Safe zone overlay',
              `Target kata ${targetWords.min}-${targetWords.max} kata`,
            ],
            warnings: evalStatus.status !== 'ok' ? [evalStatus.message] : [],
          };
        });
        generatedScripts.push(...processed);
      }
    } catch (batchErr: any) {
      const msg = batchErr?.message || '';
      if (
        batchErr?.isQuotaExhausted ||
        batchErr?.isMissingKey ||
        msg.includes('TOKEN_QUOTA_EXHAUSTED') ||
        msg.includes('429') ||
        msg.includes('MISSING_MOBILE_API_KEY')
      ) {
        throw batchErr;
      }

      console.warn(`[DirectGemini Batch Error] Using fallback synthesis:`, msg);
      const fallbacks = task.assignedAngles.map((ang, idx) =>
        buildDirectFallbackScript(
          productBrief,
          config,
          ang,
          task.startIndex + idx,
          targetWords
        )
      );
      generatedScripts.push(...fallbacks);
    }
  }

  // Final trim to totalCount
  const trimmed = generatedScripts.slice(0, totalCount);

  return {
    productBrief,
    scripts: trimmed,
  };
}

/**
 * Direct Client-Side Script Refinement:
 * Refines a single script directly with Google AI Studio.
 */
export async function directRefineScript(params: {
  script: ScriptItem;
  productBrief: ProductBrief;
  config: GenerationConfig;
  refinementType: string;
  customInstruction?: string;
  apiKey?: string;
}): Promise<RefineScriptResponse> {
  const { script, productBrief, config, refinementType, customInstruction, apiKey } = params;

  let refinementPrompt = '';
  switch (refinementType) {
    case 'hook_stronger':
      refinementPrompt =
        'Buat Hook 3 detik pertama jauh lebih menghentak, scroll-stopping, dan memicu rasa penasaran tanpa overclaim.';
      break;
    case 'more_natural':
      refinementPrompt =
        'Ubah gaya bahasa dialog agar lebih santai, mengalir seperti obrolan teman akrab, hapus kesan kaku atau bahasa brosur.';
      break;
    case 'softer_selling':
      refinementPrompt =
        'Ubah pendekatan menjadi soft-selling, tonjolkan cerita dan nilai kegunaan sehari-hari, kurangi desakan jualan langsung.';
      break;
    case 'more_concise':
      refinementPrompt =
        'Persingkat dialog agar lebih padat, hapus kata-kata mubazir, pastikan durasi tepat sasaran.';
      break;
    case 'clearer_cta':
      refinementPrompt =
        'Buat Call to Action (CTA) di bagian akhir lebih jelas dan netral (gunakan "keranjang kiri bawah" atau "keranjang bawah video ini", DILARANG menyebut "keranjang kuning" atau nama platform).';
      break;
    case 'change_angle':
      refinementPrompt =
        'Ganti angle dan konsep penyampaian menjadi sudut pandang berbeda yang belum dipakai sebelumnya.';
      break;
    default:
      refinementPrompt = customInstruction || 'Sempurnakan skrip ini agar lebih engaging dan siap rekam.';
      break;
  }

  const userPrompt = `Anda adalah Master Copywriter TikTok Affiliate. Sempurnakan skrip berikut:
Instruksi Penyempurnaan: "${refinementPrompt}"

SKRIP SAAT INI:
${JSON.stringify(script, null, 2)}

DATA PRODUK:
- Nama: ${productBrief.name}
- Fitur: ${productBrief.features.join(', ')}
- Manfaat: ${productBrief.benefits.join(', ')}

ATURAN:
1. Tetap patuhi fakta produk.
2. DILARANG sebut nama platform atau kata "keranjang kuning". Wajib "keranjang kiri bawah".
3. Kembalikan SATU objek JSON skrip murni dengan format yang sama.`;

  try {
    const rawText = await callGeminiDirect({
      contents: userPrompt,
      apiKey,
      temperature: 0.7,
      responseMimeType: 'application/json',
    });

    let parsed: any;
    try {
      parsed = JSON.parse(cleanJsonString(rawText));
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    }

    if (parsed && Array.isArray(parsed.segments)) {
      const segments = parsed.segments.map((seg: any) => ({
        ...seg,
        visualDirection: sanitizeCrossPlatformText(seg.visualDirection),
        spokenDialogue: sanitizeCrossPlatformText(seg.spokenDialogue),
        overlayText: sanitizeCrossPlatformText(seg.overlayText),
      }));
      const voiceoverOnly = sanitizeCrossPlatformText(
        parsed.voiceoverOnly || segments.map((s: any) => s.spokenDialogue).join(' ')
      );
      const actualWords = countWords(voiceoverOnly);
      const evalStatus = evaluateDurationStatus(actualWords, config.durationSeconds);

      return {
        script: {
          ...script,
          ...parsed,
          id: script.id,
          title: sanitizeCrossPlatformText(parsed.title || script.title),
          segments,
          voiceoverOnly,
          spokenWordCount: actualWords,
          durationStatus: evalStatus.status,
        },
      };
    }
  } catch (err: any) {
    const msg = err?.message || '';
    if (
      err?.isQuotaExhausted ||
      err?.isMissingKey ||
      msg.includes('TOKEN_QUOTA_EXHAUSTED') ||
      msg.includes('429')
    ) {
      throw err;
    }
    console.warn('[DirectRefine] Refinement failed, returning original script:', msg);
  }

  return { script };
}
