/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SubtitlePresetId =
  | 'tiktok_yellow'
  | 'clean_white'
  | 'capcut_pill'
  | 'broadcast_gold'
  | 'neon_green';

export interface SubtitlePreset {
  id: SubtitlePresetId;
  name: string;
  shortLabel: string;
  description: string;
  textColor: string;
  highlightColor: string;
  textShadow: string;
  pillBg?: string;
  fontWeight: string;
  borderClass?: string;
}

export const SUBTITLE_PRESETS: SubtitlePreset[] = [
  {
    id: 'tiktok_yellow',
    name: 'TikTok Bold Yellow',
    shortLabel: 'TikTok',
    description: 'Teks kuning cerah dengan outline hitam tebal klasik FYP',
    textColor: '#FACC15',
    highlightColor: '#FEF08A',
    textShadow:
      '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.95)',
    fontWeight: '800',
  },
  {
    id: 'clean_white',
    name: 'Clean White Shadow',
    shortLabel: 'Putih Bersih',
    description: 'Putih elegan dengan bayangan lembut, kontras tinggi & rapi',
    textColor: '#FFFFFF',
    highlightColor: '#38BDF8',
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.95), 0 0 4px rgba(0,0,0,0.85)',
    fontWeight: '700',
  },
  {
    id: 'capcut_pill',
    name: 'CapCut Boxed Pill',
    shortLabel: 'CapCut Box',
    description: 'Badge kotak kapsul semi-transparan modern per kalimat',
    textColor: '#F8FAFC',
    highlightColor: '#C084FC',
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)',
    pillBg: 'rgba(15, 23, 42, 0.85)',
    fontWeight: '700',
    borderClass: 'border border-zinc-700/60 shadow-lg',
  },
  {
    id: 'broadcast_gold',
    name: 'Broadcast Studio Gold',
    shortLabel: 'Studio Emas',
    description: 'Gaya teleprompter presenter TV / studio berita premium',
    textColor: '#F59E0B',
    highlightColor: '#FDE047',
    textShadow: '0 2px 8px rgba(0,0,0,0.9), 1px 1px 0 #78350F',
    fontWeight: '800',
  },
  {
    id: 'neon_green',
    name: 'High-Contrast Neon',
    shortLabel: 'Hijau Neon',
    description: 'Hijau elektrik kontras tinggi, sangat jelas di outdoor',
    textColor: '#4ADE80',
    highlightColor: '#86EFAC',
    textShadow:
      '2px 2px 0 #052E16, -2px -2px 0 #052E16, 2px -2px 0 #052E16, -2px 2px 0 #052E16, 0 4px 10px rgba(0,0,0,0.95)',
    fontWeight: '800',
  },
];
