/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// URL backend cloud utama untuk koneksi dari APK Android / perangkat mobile
export const DEFAULT_CLOUD_BACKEND =
  'https://ais-dev-5r5bitfebesnik7w3djprs-164136808770.asia-southeast1.run.app';

/**
 * Mendeteksi apakah aplikasi sedang berjalan di dalam Android APK / Capacitor WebView.
 */
export function isMobileApp(): boolean {
  if (typeof window === 'undefined') return false;
  const isCapacitor = Boolean((window as any).Capacitor?.isNativePlatform?.());
  const isAndroidBridge = Boolean((window as any).AndroidFloatingBridge);
  const isCapacitorScheme = window.location.protocol === 'capacitor:' || window.location.protocol === 'file:';
  const isLocalhostNoPort = window.location.hostname === 'localhost' && (!window.location.port || window.location.port === '80' || window.location.port === '443');
  return isCapacitor || isAndroidBridge || isCapacitorScheme || isLocalhostNoPort;
}

/**
 * Mengambil Base URL untuk panggilan API /api/*.
 * Di Web browser biasa, menggunakan relative path ''.
 * Di APK Android, mengarah ke server backend cloud AI Studio.
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

  // 2. Jika di APK / Mobile WebView, gunakan server cloud backend
  if (isMobileApp()) {
    return DEFAULT_CLOUD_BACKEND.replace(/\/+$/, '');
  }

  // 3. Di Web browser desktop (localhost:3000 atau domain web AI Studio), gunakan relative path
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
        throw new Error(errorData.error || `Gagal ${actionLabel} (Kode status: ${response.status})`);
      } catch (e: any) {
        if (e.message && !e.message.includes('JSON')) throw e;
      }
    }
    const text = await response.text();
    if (text.includes('<!doctype html') || text.includes('<html')) {
      throw new Error(
        `Server backend belum merespons API dengan benar (${response.status}). Pastikan perangkat Anda terhubung ke internet.`
      );
    }
    throw new Error(text || `Gagal ${actionLabel} (${response.status})`);
  }

  // Jika response.ok bernilai true tetapi tipe konten adalah HTML (terjadi pada WebView routing fallback)
  if (!isJson) {
    const text = await response.text();
    if (text.includes('<!doctype html') || text.includes('<html')) {
      throw new Error(
        'Aplikasi tidak dapat menghubungi server backend AI. Pastikan perangkat Anda terhubung ke internet dan server aktif.'
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
