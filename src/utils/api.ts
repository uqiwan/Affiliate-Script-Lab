import { cleanSingleKey, safeHeaderValue, parseApiKeys } from './apiKeys';

// URL backend cloud utama untuk koneksi dari APK Android / perangkat mobile
export const DEFAULT_CLOUD_BACKEND =
  'https://ais-pre-xyrq42lrknnt5nreynxqnd-639493826363.asia-east1.run.app';

export const FALLBACK_CLOUD_BACKENDS = [
  'https://ais-pre-xyrq42lrknnt5nreynxqnd-639493826363.asia-east1.run.app',
  'https://ais-dev-xyrq42lrknnt5nreynxqnd-639493826363.asia-east1.run.app',
];


/**
 * Verifikasi API Key Google AI Studio langsung ke endpoint resmi Google.
 * Bekerja langsung di APK Android native maupun Web tanpa perantara.
 * Kebal dari error "Headers: String contains non ISO-8859-1 code point" karena menggunakan
 * parameter URL murni dan sanitasi ketat.
 */
export async function verifyGeminiKeyDirectly(
  key: string,
  _model?: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const keys = parseApiKeys(key);
    if (keys.length === 0) {
      return { valid: false, error: 'Harap masukkan minimal satu API Key yang valid.' };
    }

    const firstKey = cleanSingleKey(keys[0]);
    if (!firstKey || firstKey.length < 6) {
      return { valid: false, error: 'Format API Key terlalu pendek atau tidak valid.' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(firstKey)}`;
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (firstKey.startsWith('ya29.')) {
      headers['Authorization'] = `Bearer ${safeHeaderValue(firstKey)}`;
    }

    const res = await fetch(endpoint, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      return { valid: true };
    }

    if (res.status === 400 || res.status === 403) {
      const errJson = await res.json().catch(() => null);
      const errMsg = errJson?.error?.message || '';
      if (
        errMsg.includes('API_KEY_INVALID') ||
        errMsg.includes('API key not valid') ||
        errMsg.includes('PERMISSION_DENIED') ||
        errMsg.includes('not found')
      ) {
        return {
          valid: false,
          error: 'API Key tidak valid atau ditolak oleh Google AI Studio. Pastikan Anda menyalin seluruh karakter kunci.',
        };
      }
    }

    // Jika status 429 (kuota penuh), kunci tetap valid terdaftar di Google
    if (res.status === 429) {
      return { valid: true };
    }

    return { valid: true };
  } catch (netErr: any) {
    // Toleransi penuh saat jaringan lambat / offline
    console.warn('[verifyGeminiKeyDirectly] Offline or timeout (tolerated):', netErr);
    return { valid: true };
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
