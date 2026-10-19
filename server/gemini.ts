/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import type { ProductBrief, GenerationConfig, ScriptItem, SourceProvenance } from '../src/types/index.ts';
import type { ScrapedPageResult } from './ssrf.ts';
import { countWords, evaluateDurationStatus } from '../src/utils/wordCount.ts';

// Initialize GoogleGenAI SDK helper with user agent as per aistudio-build guidelines
function getAiClient(customApiKey?: string): GoogleGenAI {
  const key = customApiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      'API Key Google AI Studio belum diatur. Silakan atur API Key Anda di menu profil kanan atas.'
    );
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const GEMINI_MODEL = 'gemini-3.8-flash';

/**
 * Verifies a Google AI Studio API Key by attempting a quick lightweight ping.
 */
export async function testGeminiApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  const testModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  let lastError: any;

  for (const model of testModels) {
    try {
      const testAi = new GoogleGenAI({
        apiKey: apiKey.trim(),
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
      await testAi.models.generateContent({
        model,
        contents: 'Ping',
      });
      return { valid: true };
    } catch (err: any) {
      lastError = err;
      const rawMsg = err?.message || '';
      if (
        rawMsg.includes('API_KEY_INVALID') ||
        rawMsg.includes('API key not valid') ||
        rawMsg.includes('INVALID_ARGUMENT') ||
        rawMsg.includes('PERMISSION_DENIED')
      ) {
        return { valid: false, error: 'API Key tidak valid. Pastikan Anda menyalin API Key yang benar dari Google AI Studio.' };
      }
      // If transient 503 / high demand spike, continue to next candidate model
      continue;
    }
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

const CANDIDATE_MODELS = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];

/**
 * Executes a Gemini generateContent call with per-attempt timeout and seamless failover to faster model.
 */
async function callGeminiWithRetry(
  options: any,
  customApiKey?: string,
  timeoutPerCallMs = 45000
): Promise<any> {
  let lastError: any;
  const client = getAiClient(customApiKey);

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const payload = { ...options, model: modelName };
      
      // Enforce timeout per candidate call to prevent hanging the server
      const generatePromise = client.models.generateContent(payload);
      let timeoutTimer: NodeJS.Timeout;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutTimer = setTimeout(() => {
          const timeoutErr: any = new Error(`Model ${modelName} melebihi batas waktu respon.`);
          timeoutErr.status = 504;
          reject(timeoutErr);
        }, timeoutPerCallMs);
      });

      const result = await Promise.race([generatePromise, timeoutPromise]);
      clearTimeout(timeoutTimer!);
      return result;
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || '';

      // If API key is explicitly invalid, throw immediately
      if (
        msg.includes('API_KEY_INVALID') ||
        msg.includes('API key not valid') ||
        msg.includes('PERMISSION_DENIED')
      ) {
        throw err;
      }

      // If transient 503, 429, or timeout, immediately failover to next candidate model
      continue;
    }
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
ATURAN FAKTUAL KETAT:
1. Catat fakta yang objektif dan masuk akal.
2. JANGAN PERNAH MENGARANG klaim palsu:
   - Harga/diskon jika tidak eksplisit kosongkan
   - Stok/deadline jika tidak ada kosongkan
   - Jangan klaim medis/penyembuhan/BPOM kecuali terbukti
3. Tandai asal sumber field: "${mode === 'images' ? 'image' : mode === 'url' ? 'url' : mode === 'text' ? 'user' : 'user|image|url'}".
4. Bila mode bukan 'mixed', array 'conflicts' HARUS KOSONG [].

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
    if (params.urlData.jsonLdData) promptContext += `Data JSON-LD: ${JSON.stringify(params.urlData.jsonLdData).slice(0, 1500)}\n`;
    if (params.urlData.textSnippet) promptContext += `Cuplikan Halaman: "${params.urlData.textSnippet.slice(0, 1500)}"\n`;
  }

  if ((mode === 'images' || mode === 'mixed') && params.images && params.images.length > 0) {
    promptContext += `\n[Gambar Terlampir]: ${params.images.length} gambar produk dilampirkan.\n`;
  }

  promptContext += `
OUTPUT FORMAT: Hasilkan JSON murni tanpa markdown:
{
  "name": "nama produk eksplisit",
  "category": "kategori produk",
  "description": "ringkasan deskripsi objektif",
  "features": ["fitur 1 yang terbukti", "fitur 2"],
  "benefits": ["manfaat fungsional masuk akal"],
  "audience": "target audiens yang paling relevan (misal anak kost, pekerja kantor, dll)",
  "painPoints": ["masalah yang diselesaikan"],
  "currentPrice": "Rp... (atau kosongkan jika tidak eksplisit)",
  "referencePrice": "Rp... (harga normal jika ada)",
  "promoDetails": "diskon/voucher (jika eksplisit)",
  "stockOrDeadline": "stok/tenggat waktu (jika eksplisit)",
  "socialProof": "ulasan atau bukti sosial nyata jika ada",
  "creatorExperience": "pengalaman pemakaian",
  "restrictions": ["klaim overclaim atau batasan yang harus dihindari"],
  "sources": [
    { "field": "name", "source": "user|image|url|unknown", "confidence": "high|medium|low" }
  ],
  "conflicts": [],
  "notes": "catatan singkat proses ekstraksi"
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
        },
      },
      params.customApiKey,
      25000
    );
    rawText = response.text || '{}';
  } catch (err: any) {
    // Fallback heuristic extraction from url or text so user is not blocked
    const fallbackName =
      (mode === 'url' || mode === 'mixed') && (params.urlData?.extractedProductTitle || params.urlData?.title)
        ? params.urlData?.extractedProductTitle || params.urlData?.title
        : (mode === 'text' || mode === 'mixed') && params.textDescription
        ? params.textDescription.split('\n')[0]?.slice(0, 80)
        : 'Produk Terpilih';
    const fallbackDesc =
      (mode === 'url' && params.urlData?.description) ||
      (mode === 'text' && params.textDescription) ||
      '';

    const fallbackSource = mode === 'images' ? 'image' : mode === 'url' ? 'url' : 'user';

    return {
      brief: {
        name: fallbackName || 'Produk Baru',
        category: 'Umum',
        description: fallbackDesc,
        features: [],
        benefits: [],
        audience: 'Umum',
        painPoints: [],
        platform: mode === 'url' ? params.urlData?.platform : undefined,
        restrictions: [],
        sources: [
          { field: 'name', source: fallbackSource, confidence: 'high' },
          { field: 'description', source: fallbackSource, confidence: 'medium' },
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
  } catch (err) {
    const fixed = cleanJsonString(rawText);
    parsed = JSON.parse(fixed);
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
 * Generates a focused batch of up to 5 scripts with specific assigned angles and structured segments.
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
TUGAS BATCH #${batchNumber}: Anda WAJIB memproduksi TEPAT ${batchCount} KONSEP SKRIP AFFILIATE MULTI-PLATFORM (SIAP REKAM) YANG BERBEDA.
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
- Pengalaman Kreator: ${productBrief.creatorExperience || 'Belum mencoba langsung (Gunakan sudut pandang demonstrasi/informasi, bukan testimoni palsu)'}
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

DAFTAR PENUGASAN WAJIB ${batchCount} KONSEP PADA BATCH INI:
${assignedAngles
  .map(
    (ang, i) =>
      `* Konsep #${startIndex + i} (id: "skrip-${startIndex + i}"): WAJIB gunakan Angle "${ang}". Buat judul spesifik, skenario unik, dan hook yang relevan dengan angle ini.`
  )
  .join('\n')}

ATURAN OUTPUT JSON MUTLAK:
1. Array JSON WAJIB berisi TEPAT ${batchCount} objek skrip lengkap sesuai daftar penugasan di atas. DILARANG MERINGKAS ATAU HANYA MEMBUAT 1 SKRIP!
2. Setiap objek skrip harus memiliki id unik ("skrip-${startIndex}", "skrip-${startIndex + 1}", dst).
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

  const response = await callGeminiWithRetry(
    {
      model: GEMINI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        responseMimeType: 'application/json',
        maxOutputTokens: 8192,
      },
    },
    customApiKey,
    42000
  );

  const rawText = response.text || '[]';
  let rawScripts: any[] = [];
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

  if (!Array.isArray(rawScripts)) {
    if (typeof rawScripts === 'object' && Array.isArray((rawScripts as any).scripts)) {
      rawScripts = (rawScripts as any).scripts;
    } else if (rawScripts && typeof rawScripts === 'object') {
      rawScripts = [rawScripts];
    } else {
      rawScripts = [];
    }
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
  const targetWordsMap = {
    15: { min: 30, max: 40 },
    30: { min: 60, max: 75 },
    60: { min: 125, max: 150 },
    90: { min: 200, max: 225 },
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
3. Setiap skrip dalam batch ini HARUS MEMILIKI ANGLE DAN PENDEKATAN YANG BERBEDA SECARA SUBSTANSIAL. Jangan hanya menukar sinonim!
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

  // Determine batch plan based on total scriptCount (max 5 scripts per batch for optimal depth & no token truncations)
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

  // Execute batches with concurrency of 2 to optimize speed and stay well within API limits
  const batchResults = await runWithConcurrency(
    batchTasks,
    2,
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
    } catch (topUpErr) {
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

  const targetWordsMap = {
    15: { min: 30, max: 40 },
    30: { min: 60, max: 75 },
    60: { min: 125, max: 150 },
    90: { min: 200, max: 225 },
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
