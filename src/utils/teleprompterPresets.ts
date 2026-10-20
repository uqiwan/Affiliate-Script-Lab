/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SubtitlePresetId =
  | 'standard_read'
  | 'large_text'
  | 'high_contrast'
  | 'daylight_read'
  | 'eye_comfort'
  | 'wide_spacing'
  | 'distance_max'
  | 'line_focus'
  | 'speaker_mode'
  | 'studio_pro';

export interface SubtitlePreset {
  id: SubtitlePresetId;
  name: string;
  shortLabel: string;
  description: string;
  textColor: string;
  highlightColor: string;
  textShadow: string;
  fontWeight: string;
  letterSpacing?: string;
  lineHeight?: string;
  pillBg?: string;
  borderClass?: string;
}

export const SUBTITLE_PRESETS: SubtitlePreset[] = [
  {
    id: 'standard_read',
    name: '1. Standard Read (Normal)',
    shortLabel: 'Standard',
    description: 'Preset standar harian. Teks putih bersih, kata CAPITAL kuning cerah ber-outline hitam.',
    textColor: '#FFFFFF',
    highlightColor: '#FACC15', // Kuning cerah
    textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 2px 4px rgba(0,0,0,0.95)',
    fontWeight: '400', // Sans-serif Regular
    lineHeight: '1.5',
  },
  {
    id: 'large_text',
    name: '2. Large Text (Teks Besar)',
    shortLabel: 'Teks Besar',
    description: 'Keterbacaan tinggi jarak jauh. Huruf tebal putih dengan penekanan CAPITAL kuning terang.',
    textColor: '#FFFFFF',
    highlightColor: '#FEF08A', // Kuning terang
    textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.95)',
    fontWeight: '700', // Sans-serif Bold
    lineHeight: '1.45',
  },
  {
    id: 'high_contrast',
    name: '3. High Contrast (Kontras Tinggi)',
    shortLabel: 'Kontras Tinggi',
    description: 'Perbedaan visual tajam. Teks utama putih, kata penekanan CAPITAL cyan terang mencolok.',
    textColor: '#FFFFFF',
    highlightColor: '#22D3EE', // Cyan terang
    textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.95)',
    fontWeight: '700', // Sans-serif Bold
    lineHeight: '1.45',
  },
  {
    id: 'daylight_read',
    name: '4. Daylight Read (Mode Terang)',
    shortLabel: 'Mode Terang',
    description: 'Huruf tebal berpenekanan kuat. Kata CAPITAL oranye terang membedakan instruksi penting.',
    textColor: '#FFFFFF',
    highlightColor: '#FB923C', // Oranye terang
    textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.95)',
    fontWeight: '700', // Sans-serif Bold
    lineHeight: '1.45',
  },
  {
    id: 'eye_comfort',
    name: '5. Eye Comfort (Nyaman di Mata)',
    shortLabel: 'Nyaman Mata',
    description: 'Minimalis & sejuk untuk naskah panjang. Teks putih dengan aksen kata CAPITAL hijau mint lembut.',
    textColor: '#FFFFFF',
    highlightColor: '#6EE7B7', // Hijau mint
    textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0 2px 4px rgba(0,0,0,0.9)',
    fontWeight: '400', // Sans-serif Regular
    lineHeight: '1.5',
  },
  {
    id: 'wide_spacing',
    name: '6. Wide Spacing (Spasi Lebar)',
    shortLabel: 'Spasi Lebar',
    description: 'Jarak antarhuruf & baris lebih lega. Teks CAPITAL magenta terang penanda visual fokus.',
    textColor: '#FFFFFF',
    highlightColor: '#F472B6', // Magenta terang
    textShadow: '1.5px 1.5px 0 #000, -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 0 3px 6px rgba(0,0,0,0.95)',
    fontWeight: '600', // Sans-serif Semibold
    letterSpacing: '0.06em',
    lineHeight: '1.65',
  },
  {
    id: 'distance_max',
    name: '7. Distance Max (Jarak Jauh)',
    shortLabel: 'Jarak Jauh',
    description: 'Maksimal untuk membaca beberapa meter dari kamera. Huruf ekstra tebal & CAPITAL kuning tajam.',
    textColor: '#FFFFFF',
    highlightColor: '#FDE047', // Kuning terang ekstra
    textShadow: '2.5px 2.5px 0 #000, -2.5px -2.5px 0 #000, 2.5px -2.5px 0 #000, -2.5px 2.5px 0 #000, 0 4px 8px rgba(0,0,0,1)',
    fontWeight: '800', // Sans-serif Extra Bold
    lineHeight: '1.4',
  },
  {
    id: 'line_focus',
    name: '8. Line Focus (Fokus Baris)',
    shortLabel: 'Fokus Baris',
    description: 'Membantu menjaga posisi bacaan naskah dengan highlight baris tenang & CAPITAL cyan terang.',
    textColor: '#FFFFFF',
    highlightColor: '#38BDF8', // Cyan terang
    textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.95)',
    fontWeight: '600', // Sans-serif Semibold
    lineHeight: '1.5',
    pillBg: 'rgba(15, 23, 42, 0.65)',
    borderClass: 'border-l-4 border-cyan-400 pl-3 py-1 rounded-r-xl shadow-lg',
  },
  {
    id: 'speaker_mode',
    name: '9. Speaker Mode (Mode Pembicara)',
    shortLabel: 'Pembicara',
    description: 'Untuk presenter & kreator konten. Teks konsisten dengan penekanan CAPITAL oranye terang.',
    textColor: '#FFFFFF',
    highlightColor: '#FB923C', // Oranye terang
    textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 6px rgba(0,0,0,0.95)',
    fontWeight: '600', // Sans-serif Semibold
    lineHeight: '1.5',
  },
  {
    id: 'studio_pro',
    name: '10. Studio Pro (Profesional)',
    shortLabel: 'Studio Pro',
    description: 'Standar produksi video profesional & studio. Teks putih konsisten dengan CAPITAL emas premium.',
    textColor: '#FFFFFF',
    highlightColor: '#EAB308', // Emas
    textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 3px 8px rgba(0,0,0,0.95)',
    fontWeight: '700', // Sans-serif Bold
    lineHeight: '1.5',
  },
];
