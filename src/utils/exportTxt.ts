/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProductBrief, GenerationConfig, ScriptItem } from '../types';

export function formatScriptAsText(script: ScriptItem, index?: number): string {
  const numStr = index !== undefined ? `KONSEP #${index + 1}: ` : '';
  let txt = `============================================================\n`;
  txt += `${numStr}${script.title.toUpperCase()}\n`;
  txt += `============================================================\n`;
  txt += `• Angle: ${script.angle}\n`;
  txt += `• Target Persona: ${script.persona}\n`;
  txt += `• Tipe Hook: ${script.hookType}\n`;
  txt += `• Differentiator: ${script.differentiator}\n`;
  txt += `• Estimasi Durasi: ${script.estimatedDurationSeconds} detik\n`;
  txt += `• Jumlah Kata Narasi: ${script.spokenWordCount} kata (${script.durationStatus.toUpperCase()})\n`;
  if (script.triggers && script.triggers.length > 0) {
    txt += `• Pemicu Psikologis: ${script.triggers.join(', ')}\n`;
  }
  txt += `\n--- STRUKTUR DETAIL SEGMEN ---\n\n`;

  script.segments.forEach((seg, i) => {
    txt += `[${seg.timeRange}] - ${seg.segmentName}\n`;
    txt += `  Aksi Visual & B-roll : ${seg.visualDirection}\n`;
    txt += `  Dialog Narasi        : "${seg.spokenDialogue}"\n`;
    txt += `  Teks Overlay         : ${seg.overlayText || '-'}\n`;
    txt += `  Catatan Strategi     : ${seg.strategyNote || '-'}\n\n`;
  });

  txt += `--- NARASI / VOICEOVER SAJA (SIAP DIBACA) ---\n`;
  txt += `${script.voiceoverOnly}\n\n`;

  if (script.qualityChecklist && script.qualityChecklist.length > 0) {
    txt += `Checklist Kualitas:\n`;
    script.qualityChecklist.forEach((c) => {
      txt += `  [✓] ${c}\n`;
    });
    txt += `\n`;
  }

  if (script.warnings && script.warnings.length > 0) {
    txt += `Catatan Penting:\n`;
    script.warnings.forEach((w) => {
      txt += `  [!] ${w}\n`;
    });
    txt += `\n`;
  }

  return txt;
}

export function generateAllScriptsTxt(
  productBrief: ProductBrief,
  config: GenerationConfig,
  scripts: ScriptItem[]
): string {
  const dateStr = new Date().toISOString().split('T')[0];
  let full = `AFFILIATE SCRIPT LAB - PAKET SKRIP VIDEO AFFILIATE (MULTI-PLATFORM)\n`;
  full += `Dibuat pada: ${dateStr}\n`;
  full += `============================================================\n\n`;

  full += `RINGKASAN PRODUK:\n`;
  full += `• Nama Produk : ${productBrief.name || '-'}\n`;
  full += `• Kategori    : ${productBrief.category || '-'}\n`;
  full += `• Ringkasan   : ${productBrief.description || '-'}\n`;
  if (productBrief.currentPrice) {
    full += `• Harga Saat Ini: ${productBrief.currentPrice}\n`;
  }
  if (productBrief.referencePrice) {
    full += `• Harga Pembanding: ${productBrief.referencePrice}\n`;
  }
  if (productBrief.promoDetails) {
    full += `• Promo/Diskon : ${productBrief.promoDetails}\n`;
  }
  if (productBrief.stockOrDeadline) {
    full += `• Stok/Deadline: ${productBrief.stockOrDeadline}\n`;
  }
  if (productBrief.features && productBrief.features.length > 0) {
    full += `• Fitur Utama  : ${productBrief.features.join(' | ')}\n`;
  }
  if (productBrief.restrictions && productBrief.restrictions.length > 0) {
    full += `• Batasan Klaim: ${productBrief.restrictions.join(' | ')}\n`;
  }
  full += `\n`;

  full += `PENGATURAN GENERASI:\n`;
  full += `• Durasi Target   : ${config.durationSeconds} detik\n`;
  full += `• Gaya Penyampaian: ${config.style}\n`;
  full += `• Persona Audiens : ${config.audiencePersona}\n`;
  full += `• Intensitas Jual : ${config.sellingIntensity}\n`;
  full += `• Jumlah Konsep   : ${scripts.length} skrip\n`;
  full += `• Kepatuhan Fakta : Aktif (Tanpa klaim palsu)\n\n`;

  scripts.forEach((script, idx) => {
    full += formatScriptAsText(script, idx);
    full += `\n\n`;
  });

  full += `Catatan Produksi Video Safe Zone (1080x1920 9:16):\n`;
  full += `Top margin: 130px | Right margin: 140px | Bottom margin: 484px | Left margin: 44px\n`;
  full += `Pastikan teks overlay berada di area tengah, kontras tinggi, dan tidak tertutup ikon antarmuka platform (keranjang kiri bawah, like, komentar).\n`;
  full += `============================================================\n`;

  return full;
}

export function downloadScriptsTxtFile(
  productBrief: ProductBrief,
  config: GenerationConfig,
  scripts: ScriptItem[]
): void {
  const content = generateAllScriptsTxt(productBrief, config, scripts);
  const dateStr = new Date().toISOString().split('T')[0];
  const safeName = (productBrief.name || 'produk')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 30);
  const filename = `skrip-affiliate-${safeName || 'produk'}-${dateStr}.txt`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
