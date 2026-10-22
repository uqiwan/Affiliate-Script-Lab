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
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    tag: 'Bawaan Utama (Teknologi Terbaru)',
    desc: 'Model Google generasi terbaru tercepat, paling cerdas, dan optimal untuk pembuatan skrip video affiliate.',
  },
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    tag: 'Alternatif Ke-2 (Handal)',
    desc: 'Model penalaran cepat dengan akurasi tinggi dan kuota terpisah di Google AI Studio.',
  },
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    tag: 'Alternatif Ke-3 (Super Stabil)',
    desc: 'Throughput tinggi, latensi super rendah, dan performa stabil tanpa kendala antrean.',
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
