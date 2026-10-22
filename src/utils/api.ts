/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// URL backend cloud utama untuk koneksi dari APK Android / perangkat mobile
export const DEFAULT_CLOUD_BACKEND =
  'https://ais-pre-6txwcqzwg7ooehg4ralynv-12666155654.asia-southeast1.run.app';

export const FALLBACK_CLOUD_BACKENDS = [
  'https://ais-pre-6txwcqzwg7ooehg4ralynv-12666155654.asia-southeast1.run.app',
  'https://ais-dev-6txwcqzwg7ooehg4ralynv-12666155654.asia-southeast1.run.app',
];

/**
 * Verifikasi API Key Google AI Studio langsung ke endpoint Google.
 * Berfungsi sebagai fallback mandiri jika backend cloud sedang cold-start atau unreachable.
 */
export async function verifyGeminiKeyDirectly(
  key: string,
  model?: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const cleanKey = key.trim();
    if (!cleanKey || cleanKey.length < 10) {
      return { valid: false, error: 'Format API Key terlalu pendek atau tidak valid.' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(cleanKey)}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      return { valid: true };
    }

    const errData = await res.json().catch(() => null);
    const msg = errData?.error?.message || `HTTP ${res.status}`;
    if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
      return { valid: false, error: 'API Key Google AI Studio tidak valid atau salah ketik.' };
    }
    if (msg.includes('PERMISSION_DENIED')) {
      return { valid: false, error: 'API Key tidak memiliki izin akses ke Google AI Studio.' };
    }
    return { valid: false, error: `Google AI Studio menolak kunci: ${msg}` };
  } catch (err: any) {
    // Jika format kunci standar Google (AIzaSy...), izinkan simpan sebagai toleransi jaringan offline
    if (key.trim().startsWith('AIzaSy') && key.trim().length >= 35) {
      return { valid: true };
    }
    return {
      valid: false,
      error: err?.message || 'Gagal memverifikasi API Key ke server Google AI Studio.',
    };
  }
}

/**
 * Mendeteksi apakah aplikasi sedang berjalan di dalam Android APK / Capacitor Native WebView.
 * HANYA bernilai true jika benar-benar berjalan di runtime native Android / bridge.
 */
export function isMobileApp(): boolean {
  if (typeof window === 'undefined') return false;
  const cap = (window as any).Capacitor;
  const isCapacitorNative = Boolean(cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform());
  const isAndroidBridge = Boolean((window as any).AndroidFloatingBridge);
  const isCapacitorScheme = window.location.protocol === 'capacitor:' || window.location.protocol === 'file:';
  return isCapacitorNative || isAndroidBridge || isCapacitorScheme;
}

/**
 * Mengambil Base URL untuk panggilan API /api/*.
 * Di Web browser biasa (desktop/mobile web/localhost), menggunakan relative path ''.
 * Di APK Android native, mengarah ke server backend cloud AI Studio.
 */
export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return '';

  // 1. Cek jika pengguna mengonfigurasi custom backend URL di setelan
  try {
    const customUrl = localStorage.getItem('affiliate_script_lab_backend_url');
    if (customUrl && customUrl.trim()) {
      return customUrl.trim().replace(/\/+$/, '');
    }
  } catch {
    // ignore
  }

  // 2. Jika di APK Android native, gunakan server cloud backend
  if (isMobileApp()) {
    return DEFAULT_CLOUD_BACKEND.replace(/\/+$/, '');
  }

  // 3. Di Web browser desktop & mobile browser, gunakan relative path agar selalu terhubung ke host server saat ini
  return '';
}

/**
 * Menghasilkan URL lengkap untuk pemanggilan API.
 */
export function apiUrl(endpoint: string): string {
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return base ? `${base}${cleanEndpoint}` : cleanEndpoint;
}

/**
 * Mem-parse respons JSON dengan aman. Mencegah error "Unexpected token < in JSON at position 0"
 * apabila server mengembalikan halaman HTML (misalnya saat 404/500/offline).
 */
export async function safeParseJsonResponse<T = any>(
  response: Response,
  actionLabel = 'memproses permintaan'
): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!response.ok) {
    if (isJson) {
      try {
        const errorData = await response.json();
        const err: any = new Error(errorData.error || `Gagal ${actionLabel} (Kode status: ${response.status})`);
        err.status = response.status;
        err.isQuotaExhausted =
          response.status === 429 ||
          Boolean(errorData.isQuotaExhausted) ||
          Boolean(errorData.error && (errorData.error.includes('TOKEN_QUOTA_EXHAUSTED') || errorData.error.includes('429')));
        throw err;
      } catch (e: any) {
        if (e.message && !e.message.includes('JSON')) throw e;
      }
    }
    const text = await response.text();
    if (text.includes('<!doctype html') || text.includes('<html')) {
      throw new Error(
        `Server backend mengembalikan halaman HTML (${response.status}) alih-alih data JSON. Pastikan endpoint server backend aktif.`
      );
    }
    const err: any = new Error(text || `Gagal ${actionLabel} (${response.status})`);
    err.status = response.status;
    err.isQuotaExhausted = response.status === 429;
    throw err;
  }

  // Jika response.ok bernilai true tetapi tipe konten adalah HTML (terjadi pada fallback SPA routing)
  if (!isJson) {
    const text = await response.text();
    if (text.includes('<!doctype html') || text.includes('<html')) {
      throw new Error(
        'Server backend mengembalikan respons HTML. Pastikan server backend sedang aktif dan dapat menerima permintaan API.'
      );
    }
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error(`Format data dari server tidak valid saat ${actionLabel}.`);
    }
  }

  return (await response.json()) as T;
}
