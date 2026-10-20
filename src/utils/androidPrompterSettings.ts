/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AndroidPrompterConfig {
  speed: number; // 1 - 10
  fontSize: number; // 7 - 48
  opacity: number; // 10 - 100
  textColorHex: string; // Hex color code
  presetId?: string; // SubtitlePresetId (standard_read, large_text, etc)
  rotation?: number; // 0, 90, 180, 270
  isMirrored: boolean;
  showFocusGuide: boolean;
  focusGuidePercent: number; // 5 - 50%
  countdownSec: number; // 0 (langsung), 3, 5, 10
  windowWidth: number; // default 650
  windowHeight: number; // default 720
}

export const DEFAULT_ANDROID_PROMPTER_CONFIG: AndroidPrompterConfig = {
  speed: 3,
  fontSize: 18,
  opacity: 85,
  textColorHex: '#FEF08A',
  presetId: 'standard_read',
  rotation: 0,
  isMirrored: false,
  showFocusGuide: true,
  focusGuidePercent: 12,
  countdownSec: 3,
  windowWidth: 650,
  windowHeight: 720,
};

const STORAGE_KEY = 'gagaswara_android_prompter_settings';

export function loadAndroidPrompterConfig(): AndroidPrompterConfig {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_ANDROID_PROMPTER_CONFIG,
          ...parsed,
        };
      }
    }
  } catch (e) {
    console.warn('Failed to load Android prompter settings:', e);
  }
  return { ...DEFAULT_ANDROID_PROMPTER_CONFIG };
}

export function saveAndroidPrompterConfig(config: AndroidPrompterConfig): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }
  } catch (e) {
    console.warn('Failed to save Android prompter settings:', e);
  }
}

/**
 * Memulai Teleprompter Melayang di Android native via AndroidFloatingBridge.
 * Mengirimkan seluruh konfigurasi lengkap (kecepatan, font, opasitas, warna, preset, cermin, rotasi, fokus tatap mata, countdown).
 */
export function launchAndroidFloatingPrompter(
  scriptText: string,
  overrides?: Partial<AndroidPrompterConfig>
): boolean {
  if (typeof window === 'undefined') return false;

  const bridge = (window as any).AndroidFloatingBridge;
  if (!bridge) return false;

  const config = {
    ...loadAndroidPrompterConfig(),
    ...overrides,
  };

  // Simpan setelan terakhir agar konsisten
  saveAndroidPrompterConfig(config);

  try {
    const payload = {
      scriptText,
      speed: config.speed,
      fontSize: config.fontSize,
      opacity: config.opacity,
      textColorHex: config.textColorHex,
      presetId: config.presetId || 'standard_read',
      rotation: config.rotation || 0,
      isMirrored: Boolean(config.isMirrored),
      showFocusGuide: Boolean(config.showFocusGuide),
      focusGuidePercent: config.focusGuidePercent,
      countdownSec: config.countdownSec,
      windowWidth: config.windowWidth,
      windowHeight: config.windowHeight,
    };

    if (typeof bridge.startFloatingServiceWithJson === 'function') {
      bridge.startFloatingServiceWithJson(JSON.stringify(payload));
      return true;
    } else if (typeof bridge.startFloatingServiceDetailed === 'function') {
      bridge.startFloatingServiceDetailed(
        scriptText,
        config.speed,
        config.fontSize,
        config.opacity,
        config.textColorHex,
        config.isMirrored,
        config.showFocusGuide,
        config.focusGuidePercent,
        config.countdownSec,
        config.windowWidth,
        config.windowHeight
      );
      return true;
    } else if (typeof bridge.startFloatingService === 'function') {
      bridge.startFloatingService(scriptText, config.speed, config.fontSize);
      return true;
    }
  } catch (err) {
    console.error('Failed to launch Android floating prompter:', err);
  }

  return false;
}
