/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GoogleModelOption {
  id: string;
  name: string;
  tag: string;
  desc: string;
}

/**
 * Daftar Model Keluarga Google yang didukung (Gemini, Google AI Studio)
 * dengan rekomendasi utama model v3.8 Flash.
 */
export const SUPPORTED_GOOGLE_MODELS: GoogleModelOption[] = [
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    tag: 'Bawaan Utama (Ultra Cepat ~600ms)',
    desc: 'Model Google generasi terbaru tercepat, responsif, dan optimal untuk ekstraksi brief serta skrip video affiliate.',
  },
  {
    id: 'gemini-flash-lite-latest',
    name: 'Gemini Flash Lite Latest',
    tag: 'Alternatif Ke-2 (Stabil & Ringan)',
    desc: 'Model berkecepatan tinggi dengan ketersediaan tinggi dan performa stabil tanpa antrean.',
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    tag: 'Alternatif Ke-3 (Kapasitas Besar)',
    desc: 'Model multimodal generasi terbaru dengan penalaran mendalam dan pemahaman visual yang kuat.',
  },
];

export const GEMINI_MODEL = 'gemini-3.1-flash-lite';

/**
 * Membersihkan string dari karakter tersembunyi Unicode, smart quotes,
 * zero-width space, atau karakter non-ISO-8859-1 yang sering ikut ter-copy
 * saat menyalin teks dari smartphone Android / keyboard clipboard.
 */
export function sanitizeApiKeyString(raw?: string): string {
  if (!raw) return '';
  return raw
    // Hapus zero-width spaces, BOM, directional marks, dsb
    .replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E\u00A0\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    // Ganti smart quotes Android/iOS dengan quote standar atau hapus
    .replace(/[\u201C\u201D\u2018\u2019`"']/g, '')
    // Hapus simbol kurung atau label teks non-ASCII
    .replace(/[^\x20-\x7E\r\n\t]/g, '')
    .trim();
}

/**
 * Menjamin nilai header HTTP hanya berisi karakter ASCII printable murni (code point <= 127).
 * Mencegah error fatal browser: "Failed to construct 'Headers': String contains non ISO-8859-1 code point."
 */
export function safeHeaderValue(val?: string): string {
  if (!val) return '';
  return val
    .replace(/[\r\n\t]/g, ' ')
    .replace(/[^\x20-\x7E]/g, '')
    .trim();
}

/**
 * Membersihkan satu kunci Google secara presisi.
 * Kunci Google hanya tersusun dari karakter alfanumerik, titik, strip, atau underscore.
 */
export function cleanSingleKey(rawPart: string): string {
  const sanitized = sanitizeApiKeyString(rawPart);
  // Jika pengguna menyalin format dengan label (misal: "API Key: AIzaSy..."),
  // ekstrak token kuncinya yang cocok dengan pola format Google
  const match = sanitized.match(/\b(AQ[a-zA-Z0-9._-]+|AIzaSy[a-zA-Z0-9_-]+|ya29\.[a-zA-Z0-9_-]+|[a-zA-Z0-9._-]{16,})\b/);
  if (match) {
    return match[1].trim();
  }
  // Fallback: hapus semua spasi dan karakter selain [a-zA-Z0-9._-]
  return sanitized.replace(/[^a-zA-Z0-9._-]/g, '').trim();
}

/**
 * Parsing multi API Key dari string teks (pemisah baris baru, koma, titik koma, atau spasi).
 * Mendukung seluruh varian format keluarga Google saat ini maupun pembaruan masa depan:
 * - Kunci Google AI Studio terbaru: AQ... / AQ.Ab8RN6... (titik, strip, alfanumerik)
 * - Kunci standar Google Cloud: AIzaSy...
 * - Token OAuth / Bearer: ya29...
 * - Kunci kustom / format pembaruan Google masa depan
 */
export function parseApiKeys(input?: string): string[] {
  if (!input) return [];
  const cleanInput = sanitizeApiKeyString(input);
  const rawParts = cleanInput.split(/[\r\n,;|]+/);
  const keys: string[] = [];
  const seen = new Set<string>();

  for (const part of rawParts) {
    const cleaned = cleanSingleKey(part);
    if (cleaned.length >= 6 && !seen.has(cleaned)) {
      seen.add(cleaned);
      keys.push(cleaned);
    }
  }
  return keys;
}

