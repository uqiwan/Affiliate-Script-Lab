/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScriptItem } from '../types';

export interface PrompterLine {
  id: string;
  rawText: string;
  tokens: PrompterToken[];
}

export interface PrompterToken {
  text: string;
  type: 'normal' | 'emphasis' | 'pause-short' | 'pause-long' | 'cta' | 'promo';
}

export interface PrompterConcept {
  id: string;
  conceptNumber: number;
  title: string;
  angle: string;
  estimatedDuration: number;
  wordCount: number;
  lines: PrompterLine[];
}

// Daftar kata-kata kunci penekanan (Power words, benefit, urgensi, promo, CTA)
const BENEFIT_EMPHASIS_WORDS = new Set([
  'GRATIS', 'HEMAT', 'ASLI', 'ORIGINAL', 'TERBUKTI', 'PRAKTIS', 'PREMIUM',
  'TERBAIK', 'REKOMENDASI', 'SOLUSI', 'AMPUH', 'WAJIB', 'JUARA', 'RAHASIA',
  'GAMPANG', 'VIRAL', 'FAVORIT', 'AWET', 'RINGAN', 'NYAMAN', 'CEPAT',
  'BERSIH', 'MUDAH', 'LANGSUNG', 'BEDA', 'KEREN', 'MANTAP', 'BAGUS',
  'OTENTIK', 'GARANSI', 'BERGARANSI', 'AMAN', 'BPOM', 'HALAL'
]);

const PROMO_WORDS = new Set([
  'DISKON', 'PROMO', 'MURAH', 'CASHBACK', 'POTONGAN', 'ONGKIR',
  'VOUCHER', 'FLASH', 'SALE', 'CUMA', 'HANYA', 'RP', 'RIBU',
  'TERJANGKAU', 'SPESIAL', 'BONUS'
]);

const CTA_PHRASES = [
  'KLIK KERANJANG KUNING',
  'KERANJANG KUNING',
  'KERANJANG KIRI BAWAH',
  'CHECKOUT SEKARANG',
  'KLIK LINK DI BIO',
  'AMBIL PROMONYA',
  'JANGAN SAMPAI KEHABISAN',
  'STOK TERBATAS',
  'CO SEKARANG',
  'KLIK DI BAWAH',
  'BELI SEKARANG',
  'AMBIL SEKARANG'
];

/**
 * Membersihkan elemen non-skrip seperti arahan visual, petunjuk kamera, dan label bagian.
 */
export function cleanNonScriptDirectives(text: string): string {
  let cleaned = text;

  // Lindungi arahan jeda [JEDA...] atau (JEDA...) sebelum menghapus bracket lain
  cleaned = cleaned.replace(/\[\s*(jeda|pause)[^\]]*\]/gi, (match) => {
    const content = match.replace(/[\[\]]/g, '').trim();
    return ` __PAUSE_DIRECTIVE_${content}__ `;
  });
  cleaned = cleaned.replace(/\(\s*(jeda|pause)[^)]*\)/gi, (match) => {
    const content = match.replace(/[()]/g, '').trim();
    return ` __PAUSE_DIRECTIVE_${content}__ `;
  });

  // Hapus arahan [Visual: ...] atau (Visual: ...) atau [Audio: ...] dsb
  cleaned = cleaned.replace(/\[\s*(visual|audio|musik|sfx|b-roll|scene|arahan|kamera|tampilan)[^\]]*\]/gi, ' ');
  cleaned = cleaned.replace(/\(\s*(visual|audio|musik|sfx|b-roll|scene|arahan|kamera|tampilan)[^)]*\)/gi, ' ');

  // Hapus tag bracket umum seperti [Visual] atau [B-roll]
  cleaned = cleaned.replace(/\[[^\]]{3,50}\]/g, ' ');

  // Hapus label segmen seperti "Hook:", "Problem:", "Demo:", "CTA:", "Voiceover:"
  cleaned = cleaned.replace(/^(hook|problem|masalah|demo|solusi|value|nilai|cta|call to action|voiceover|narasi|dialog|skrip):\s*/gim, ' ');
  cleaned = cleaned.replace(/\b(hook|problem|masalah|demo|solusi|value|cta|voiceover|narasi):\s*/gi, ' ');

  // Hapus tanda kutip luar
  cleaned = cleaned.replace(/^["'“‘]+|["'”’]+$/g, '').trim();

  // Bersihkan spasi ganda
  cleaned = cleaned.replace(/[ \t]+/g, ' ').trim();

  return cleaned;
}

/**
 * Ekstrak kata-kata kunci produk untuk di-highlight
 */
export function extractProductKeywords(productName?: string): string[] {
  if (!productName) return [];
  // Bersihkan dan ambil kata bermakna (panjang >= 3 huruf)
  const stopWords = new Set(['dan', 'atau', 'yang', 'untuk', 'dengan', 'dari', 'bisa', 'buat', 'pada', 'ini', 'itu']);
  return productName
    .replace(/[^\w\s]/gi, ' ')
    .split(/\s+/)
    .map(w => w.trim().toUpperCase())
    .filter(w => w.length >= 3 && !stopWords.has(w.toLowerCase()));
}

/**
 * Memecah teks narasi menjadi baris-baris per kalimat secara cerdas.
 */
export function splitIntoSentences(text: string): string[] {
  const cleaned = cleanNonScriptDirectives(text);
  if (!cleaned) return [];

  // Lindungi singkatan umum dan format harga agar tidak terpotong sembarangan
  const protectedText = cleaned
    .replace(/Rp\.\s*/gi, 'Rp_')
    .replace(/\bdll\./gi, 'dll_')
    .replace(/\bdsb\./gi, 'dsb_')
    .replace(/\bs\/d\b/gi, 's_d')
    .replace(/\bno\./gi, 'no_');

  // Pisahkan berdasarkan titik, tanda seru, tanda tanya, atau baris baru
  const rawParts = protectedText.split(/(?<=[.!?\n])\s+/);

  const sentences: string[] = [];

  for (const part of rawParts) {
    // Kembalikan token terproteksi
    const restored = part
      .replace(/Rp_/g, 'Rp. ')
      .replace(/dll_/g, 'dll.')
      .replace(/dsb_/g, 'dsb.')
      .replace(/s_d/g, 's/d')
      .replace(/no_/g, 'no.')
      .trim();

    if (restored.length > 0) {
      sentences.push(restored);
    }
  }

  return sentences;
}

/**
 * Memformat kalimat tunggal dengan jeda intonasi (/ dan //) dan penekanan kata (UPPERCASE/Bold).
 */
export function formatSentenceTokens(sentence: string, productKeywords: string[] = []): PrompterToken[] {
  let text = cleanNonScriptDirectives(sentence);

  // Jika kalimat berakhiran tanda baca, lepaskan untuk diganti dengan jeda double slash (//)
  const endsWithExclamation = text.endsWith('!');
  const endsWithQuestion = text.endsWith('?');

  // Bersihkan tanda baca akhir untuk diproses
  text = text.replace(/[.!?]+$/, '').trim();

  // Ganti koma (,) menjadi marker jeda pendek /
  text = text.replace(/\s*,\s*/g, ' / ');

  // Periksa apakah ada CTA phrase dalam teks
  const upperSentence = text.toUpperCase();
  for (const cta of CTA_PHRASES) {
    if (upperSentence.includes(cta)) {
      const regex = new RegExp(cta.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      text = text.replace(regex, cta);
    }
  }

  // Pecah berdasarkan spasi
  const rawWords = text.split(/\s+/);
  const tokens: PrompterToken[] = [];

  for (let i = 0; i < rawWords.length; i++) {
    const rawWord = rawWords[i];
    if (!rawWord) continue;

    if (rawWord.startsWith('__PAUSE_DIRECTIVE_') && rawWord.endsWith('__')) {
      tokens.push({ text: '', type: 'pause-long' });
      continue;
    }

    if (rawWord === '/') {
      tokens.push({ text: '/', type: 'pause-short' });
      continue;
    }

    if (rawWord.includes('/')) {
      const subParts = rawWord.split('/');
      for (let sIdx = 0; sIdx < subParts.length; sIdx++) {
        const sub = subParts[sIdx].trim();
        if (sub) {
          tokens.push(classifyWordToken(sub, productKeywords));
        }
        if (sIdx < subParts.length - 1) {
          tokens.push({ text: '/', type: 'pause-short' });
        }
      }
      continue;
    }

    tokens.push(classifyWordToken(rawWord, productKeywords));
  }

  // Tambahkan tanda baca asli di akhir kalimat jika ada
  if (tokens.length > 0) {
    const lastToken = tokens[tokens.length - 1];
    if (endsWithExclamation) {
      lastToken.text = `${lastToken.text}!`;
    } else if (endsWithQuestion) {
      lastToken.text = `${lastToken.text}?`;
    } else if (!/[.,!?]$/.test(lastToken.text)) {
      lastToken.text = `${lastToken.text}.`;
    }
  }

  return tokens;
}

/**
 * Membersihkan dan memformat judul konsep agar jelas dan tidak terulang dua kali.
 * Contoh input: conceptNumber: 2, title: "Konsep #2: Personal Story (Kisah Nyata)", angle: "Personal Story"
 * Output: "Konsep #2: Personal Story (Kisah Nyata)"
 */
export function formatConceptDisplayTitle(
  conceptNumber: number,
  title?: string,
  angle?: string
): string {
  let cleanTitle = (title || '').trim();
  const cleanAngle = (angle || '').trim();

  // Bersihkan duplikasi prefix seperti "Konsep #2:", "Konsep 2 -", "Konsep 2:"
  cleanTitle = cleanTitle.replace(new RegExp(`^konsep\\s*(?:#?\\s*${conceptNumber})?\\s*[:\\-–—]?\\s*`, 'i'), '').trim();
  cleanTitle = cleanTitle.replace(/^konsep\s*#?\d+\s*[:\\-–—]?\s*/i, '').trim();

  // Jika title kosong, gunakan angle atau default
  if (!cleanTitle && cleanAngle) {
    cleanTitle = cleanAngle;
  }
  if (!cleanTitle) {
    cleanTitle = `Skrip Affiliate`;
  }

  // Jika angle ada dan tidak redundan dengan judul, gabungkan dalam tanda kurung
  if (
    cleanAngle &&
    cleanAngle.toLowerCase() !== cleanTitle.toLowerCase() &&
    !cleanTitle.toLowerCase().includes(cleanAngle.toLowerCase())
  ) {
    return `Konsep #${conceptNumber}: ${cleanTitle} (${cleanAngle})`;
  }

  return `Konsep #${conceptNumber}: ${cleanTitle}`;
}

function classifyWordToken(word: string, productKeywords: string[]): PrompterToken {
  // Bersihkan simbol untuk pengecekan kata
  const strippedWord = word.replace(/[^\w]/g, '').toUpperCase();

  // Cek apakah merupakan CTA phrase kata tunggal
  if (['CHECKOUT', 'KERANJANG', 'KUNING'].includes(strippedWord)) {
    return { text: word.toUpperCase(), type: 'cta' };
  }

  // Cek promo
  if (PROMO_WORDS.has(strippedWord) || strippedWord.startsWith('DISKON') || strippedWord.startsWith('PROMO')) {
    return { text: word.toUpperCase(), type: 'promo' };
  }

  // Cek kata kunci penekanan benefit
  if (BENEFIT_EMPHASIS_WORDS.has(strippedWord)) {
    return { text: word.toUpperCase(), type: 'emphasis' };
  }

  // Cek kata kunci nama produk
  if (productKeywords.includes(strippedWord) && strippedWord.length >= 3) {
    return { text: word.toUpperCase(), type: 'emphasis' };
  }

  return { text: word, type: 'normal' };
}

/**
 * Mengubah ScriptItem menjadi struktur PrompterConcept siap tayang di teleprompter
 */
export function buildPrompterConcept(
  script: ScriptItem,
  conceptNumber: number,
  productKeywords: string[] = []
): PrompterConcept {
  // Ambil teks dialog/narasi
  let dialogueBlocks: string[] = [];

  if (script.segments && script.segments.length > 0) {
    for (const seg of script.segments) {
      if (seg.spokenDialogue && seg.spokenDialogue.trim()) {
        dialogueBlocks.push(seg.spokenDialogue.trim());
      }
    }
  }

  if (dialogueBlocks.length === 0 && script.voiceoverOnly) {
    dialogueBlocks = script.voiceoverOnly
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
  }

  const rawFullText = dialogueBlocks.join(' ');
  const rawSentences = splitIntoSentences(rawFullText);

  const lines: PrompterLine[] = rawSentences.map((sentence, sIdx) => ({
    id: `${script.id || conceptNumber}-line-${sIdx}`,
    rawText: sentence,
    tokens: formatSentenceTokens(sentence, productKeywords),
  }));

  return {
    id: script.id || `concept-${conceptNumber}`,
    conceptNumber,
    title: script.title || `Konsep #${conceptNumber}`,
    angle: script.angle || 'Affiliate Script',
    estimatedDuration: script.estimatedDurationSeconds || 30,
    wordCount: script.spokenWordCount || 0,
    lines,
  };
}
