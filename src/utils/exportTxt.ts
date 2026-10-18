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

  script.segments.forEach((seg) => {
    txt += `[${seg.timeRange}] - ${seg.segmentName}\n`;
    txt += `  Aksi Visual & B-roll : ${seg.visualDirection}\n`;
    txt += `  Dialog Narasi        : "${seg.spokenDialogue}"\n`;
    txt += `  Teks Overlay         : ${seg.overlayText || '-'}\n`;
    txt += `  Catatan Strategi     : ${seg.strategyNote || '-'}\n\n`;
  });

  txt += `--- NARASI / VOICEOVER SAJA (SIAP DIBACA) ---\n`;
  txt += `${script.voiceoverOnly}\n\n`;

  return txt;
}

export function generateAllScriptsTxt(
  productBrief: ProductBrief,
  config: GenerationConfig,
  scripts: ScriptItem[]
): string {
  const dateStr = new Date().toISOString().split('T')[0];
  let full = `AFFILIATE SCRIPT LAB - PAKET SKRIP LENGKAP (MULTI-PLATFORM)\n`;
  full += `Produk: ${productBrief.name || 'Produk'}\n`;
  full += `Dibuat pada: ${dateStr}\n`;
  full += `============================================================\n\n`;

  scripts.forEach((script, idx) => {
    full += formatScriptAsText(script, idx);
    full += `\n\n`;
  });

  return full;
}

export function generateAllVoiceoversTxt(
  productBrief: ProductBrief,
  scripts: ScriptItem[]
): string {
  const dateStr = new Date().toISOString().split('T')[0];
  let full = `AFFILIATE SCRIPT LAB - KUMPULAN NARASI SUARA SAJA (VOICEOVER)\n`;
  full += `Produk: ${productBrief.name || 'Produk'}\n`;
  full += `Tanggal: ${dateStr}\n`;
  full += `============================================================\n\n`;

  scripts.forEach((script, idx) => {
    full += `[KONSEP #${idx + 1}] ${script.title}\n`;
    full += `Angle: ${script.angle} | Durasi: ${script.estimatedDurationSeconds} detik (${script.spokenWordCount} kata)\n`;
    full += `------------------------------------------------------------\n`;
    full += `"${script.voiceoverOnly}"\n\n`;
  });

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
  const filename = `skrip-lengkap-${safeName || 'produk'}-${dateStr}.txt`;

  downloadBlob(content, filename);
}

export function downloadVoiceoversTxtFile(
  productBrief: ProductBrief,
  scripts: ScriptItem[]
): void {
  const content = generateAllVoiceoversTxt(productBrief, scripts);
  const dateStr = new Date().toISOString().split('T')[0];
  const safeName = (productBrief.name || 'produk')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 30);
  const filename = `narasi-saja-${safeName || 'produk'}-${dateStr}.txt`;

  downloadBlob(content, filename);
}

function downloadBlob(content: string, filename: string) {
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
