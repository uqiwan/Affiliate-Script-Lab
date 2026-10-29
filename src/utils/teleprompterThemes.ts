/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TeleprompterThemeId = 'dark_pro' | 'soft_comfort' | 'light_clean';

export interface TeleprompterTheme {
  id: TeleprompterThemeId;
  name: string;
  tagline: string;
  backgroundColor: string; // Background canvas prompter
  textColor: string; // Teks narasi utama
  highlightColor: string; // Penanda teks aktif / penekanan / kapital
  secondaryTextColor: string; // Keterangan waktu / kata / label
  cardBg: string; // Background kotak judul konsep
  cardBorder: string; // Border kotak judul konsep
  cardTextColor: string; // Warna teks judul konsep
  focusLineColor: string; // Garis panduan tatap mata
  dockBg: string; // Background bottom bar menu
  dockBorder: string; // Border bottom bar
  dockBtnBg: string; // Tombol menu
  dockBtnText: string; // Ikon menu
  previewSwatch: {
    bg: string;
    text: string;
    highlight: string;
  };
}

export const TELEPROMPTER_THEMES: Record<TeleprompterThemeId, TeleprompterTheme> = {
  dark_pro: {
    id: 'dark_pro',
    name: 'Dark Pro',
    tagline: 'Latar hitam, teks putih, penanda teks aktif kuning',
    backgroundColor: '#000000',
    textColor: '#FFFFFF',
    highlightColor: '#FACC15', // Kuning kontras tinggi
    secondaryTextColor: '#A1A1AA',
    cardBg: '#18181B',
    cardBorder: '#27272A',
    cardTextColor: '#FFFFFF',
    focusLineColor: '#FACC15',
    dockBg: 'rgba(9, 9, 11, 0.96)',
    dockBorder: '#27272A',
    dockBtnBg: '#18181B',
    dockBtnText: '#E4E4E7',
    previewSwatch: {
      bg: '#000000',
      text: '#FFFFFF',
      highlight: '#FACC15',
    },
  },
  soft_comfort: {
    id: 'soft_comfort',
    name: 'Soft Comfort',
    tagline: 'Latar hitam pekat kontras, kontrol tombol hijau segar',
    backgroundColor: '#000000', // Hitam pekat agar teks kontras dan terang
    textColor: '#FAF9F6', // Putih gading / ivory
    highlightColor: '#22C55E', // Aksen tombol / kontrol hijau
    secondaryTextColor: '#9CA3AF',
    cardBg: '#0F172A',
    cardBorder: '#166534',
    cardTextColor: '#FAF9F6',
    focusLineColor: '#22C55E',
    dockBg: 'rgba(0, 0, 0, 0.95)',
    dockBorder: '#15803D',
    dockBtnBg: '#14532D',
    dockBtnText: '#4ADE80',
    previewSwatch: {
      bg: '#000000',
      text: '#FAF9F6',
      highlight: '#22C55E',
    },
  },
  light_clean: {
    id: 'light_clean',
    name: 'Light Clean',
    tagline: 'Latar putih, teks hitam, penanda teks aktif biru',
    backgroundColor: '#FFFFFF', // Putih bersih
    textColor: '#18181B', // Hitam tajam
    highlightColor: '#2563EB', // Biru cerah & jelas
    secondaryTextColor: '#52525B',
    cardBg: '#F4F4F5',
    cardBorder: '#E4E4E7',
    cardTextColor: '#18181B',
    focusLineColor: '#2563EB',
    dockBg: 'rgba(244, 244, 245, 0.96)',
    dockBorder: '#E4E4E7',
    dockBtnBg: '#FFFFFF',
    dockBtnText: '#18181B',
    previewSwatch: {
      bg: '#FFFFFF',
      text: '#18181B',
      highlight: '#2563EB',
    },
  },
};

const THEME_STORAGE_KEY = 'gagaswara_prompter_theme';

export function getStoredPrompterTheme(): TeleprompterTheme {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as TeleprompterThemeId | null;
      if (stored && TELEPROMPTER_THEMES[stored]) {
        return TELEPROMPTER_THEMES[stored];
      }
    }
  } catch {
    // fallback
  }
  return TELEPROMPTER_THEMES.dark_pro;
}

export function saveStoredPrompterTheme(themeId: TeleprompterThemeId): TeleprompterTheme {
  const selected = TELEPROMPTER_THEMES[themeId] || TELEPROMPTER_THEMES.dark_pro;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, selected.id);
    }
  } catch {
    // fallback
  }
  return selected;
}
