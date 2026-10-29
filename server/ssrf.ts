/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import dns from 'dns/promises';
import * as cheerio from 'cheerio';

export interface ScrapedPageResult {
  success: boolean;
  platform?: 'Shopee' | 'TikTok' | 'Tokopedia' | 'Lazada' | 'Umum';
  title?: string;
  extractedProductTitle?: string;
  description?: string;
  textSnippet?: string;
  jsonLdData?: any;
  identifiers?: Record<string, string>;
  resolvedUrl?: string;
  author?: string;
  error?: string;
}

/**
 * Checks if an IP address belongs to private, loopback, link-local, or cloud metadata ranges.
 */
function isPrivateOrRestrictedIp(ip: string): boolean {
  if (ip.startsWith('127.')) return true;
  if (ip === '0.0.0.0') return true;
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('169.254.')) return true;
  if (ip.startsWith('192.168.')) return true;
  if (ip.startsWith('172.')) {
    const parts = ip.split('.');
    if (parts.length >= 2) {
      const secondOctet = parseInt(parts[1], 10);
      if (secondOctet >= 16 && secondOctet <= 31) return true;
    }
  }

  const lower = ip.toLowerCase();
  if (
    lower === '::1' ||
    lower === '::' ||
    lower.startsWith('fc') ||
    lower.startsWith('fd') ||
    lower.startsWith('fe80:')
  ) {
    return true;
  }

  return false;
}

/**
 * Extracts a valid URL and accompanying text from raw input string.
 * Handles cases where mobile users paste share text with URL (e.g. from Shopee or TikTok share buttons).
 */
export function extractUrlFromRawInput(raw: string): { url: string; accompanyingText: string } {
  if (!raw) return { url: '', accompanyingText: '' };
  const trimmed = raw.trim();

  // Find http:// or https:// url pattern
  const urlMatch = trimmed.match(/https?:\/\/[^\s"'<>]+/i);
  if (urlMatch) {
    const url = urlMatch[0];
    const accompanyingText = trimmed.replace(url, '').replace(/\s+/g, ' ').trim();
    return { url, accompanyingText };
  }

  return { url: trimmed, accompanyingText: '' };
}

/**
 * Cleans user accompanying share text to extract a clean candidate product title.
 * e.g. "Beli Lampu Meja Belajar Lipat LED Portable di Shopee sekarang!" -> "Lampu Meja Belajar Lipat LED Portable"
 */
export function extractProductTitleFromAccompanyingText(text: string): string {
  if (!text) return '';
  let cleaned = text.trim();
  // Remove common Indonesian / English affiliate share prefixes
  cleaned = cleaned.replace(/^(Beli|Dapatkan|Lihat|Temukan|Cek|Promo|Diskon|Check out|Spill)\s+/i, '');
  // Remove common affiliate share suffixes
  cleaned = cleaned.replace(/\s+(di Shopee|di TikTok|di TikTok Shop|di Tokopedia|sekarang|murah|diskon|promo)[\s!.]*$/i, '');
  cleaned = cleaned.replace(/\s*\|\s*Shopee.*$/i, '');
  cleaned = cleaned.replace(/\s*\|\s*TikTok.*$/i, '');
  cleaned = cleaned.replace(/\s*\|\s*Tokopedia.*$/i, '');
  cleaned = cleaned.replace(/[!.]+$/g, '').trim();

  if (cleaned.length >= 3 && cleaned.length <= 150) {
    return cleaned;
  }
  return '';
}

/**
 * Validates a target URL against SSRF attacks.
 */
export async function validateSafeUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Format URL tidak valid. Gunakan format lengkap seperti https://shopee.co.id/... atau https://vt.tiktok.com/...');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Hanya protokol HTTP dan HTTPS yang diizinkan');
  }

  const hostname = parsed.hostname.toLowerCase();

  // Deny explicit localhost or loopback strings
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0' || hostname === '[::1]') {
    throw new Error('Akses ke host lokal atau private tidak diizinkan');
  }

  // Check cloud metadata hosts
  if (hostname.includes('metadata.google.internal') || hostname.includes('169.254.169.254')) {
    throw new Error('Akses ke alamat metadata cloud diblokir');
  }

  // DNS resolution check
  try {
    const lookup = await dns.lookup(hostname, { all: true });
    for (const record of lookup) {
      if (isPrivateOrRestrictedIp(record.address)) {
        throw new Error(`Host mengarah ke IP internal/privat (${record.address}) yang diblokir`);
      }
    }
  } catch (err: any) {
    if (err.message && err.message.includes('diblokir')) {
      throw err;
    }
    throw new Error(`Gagal memverifikasi domain ${hostname}: ${err.message || 'Domain tidak ditemukan'}`);
  }

  return parsed;
}

/**
 * Cleans boilerplate branding from titles.
 */
function cleanBrandingNoise(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/^Jual\s+/i, '')
    .replace(/^Beli\s+/i, '')
    .replace(/\s*\|\s*Shopee\s+Indonesia.*$/i, '')
    .replace(/\s*\|\s*Shopee.*$/i, '')
    .replace(/\s*\|\s*TikTok.*$/i, '')
    .replace(/\s*\|\s*Tokopedia.*$/i, '')
    .replace(/^TikTok\s*·\s*/i, '')
    .replace(/^Kunjungi\s+TikTok.*$/i, '')
    .trim();
}

/**
 * Cleans hashtags and mentions from TikTok video captions to get the clean product topic.
 */
function cleanTikTokCaption(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/#[\w\u0590-\u05ff]+/gi, '')
    .replace(/@[\w.]+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if a domain is a known shortlink service where pathnames are random hash codes, not product titles.
 */
function isShortlinkDomain(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host.includes('shp.ee') ||
    host.includes('s.shopee') ||
    host.includes('shope.ee') ||
    host.includes('vt.tiktok.com') ||
    host.includes('vm.tiktok.com') ||
    host.includes('tokopedia.link')
  );
}

/**
 * Extracts platform, title, and identifiers directly from e-commerce URLs (Shopee, TikTok, Tokopedia).
 */
export function extractEcommerceFromUrl(urlObj: URL): {
  platform: 'Shopee' | 'TikTok' | 'Tokopedia' | 'Lazada' | 'Umum';
  productTitle: string;
  identifiers: Record<string, string>;
} {
  const host = urlObj.hostname.toLowerCase();
  const pathname = decodeURIComponent(urlObj.pathname);

  // 1. SHOPEE (shopee.co.id, shope.ee, id.shp.ee, shp.ee, s.shopee.co.id)
  if (host.includes('shopee') || host.includes('shp.ee')) {
    const identifiers: Record<string, string> = {};

    // Pattern: /Nama-Produk-Keren-Lengkap-i.123456.7890123
    const matchSlug = pathname.match(/\/([^\/]+)-i\.(\d+)\.(\d+)/i);
    if (matchSlug) {
      identifiers.shopId = matchSlug[2];
      identifiers.itemId = matchSlug[3];
      const cleanSlug = matchSlug[1].replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
      return {
        platform: 'Shopee',
        productTitle: cleanSlug,
        identifiers,
      };
    }

    // Pattern: /product/12345/67890
    const matchProd = pathname.match(/\/product\/(\d+)\/(\d+)/i);
    if (matchProd) {
      identifiers.shopId = matchProd[1];
      identifiers.itemId = matchProd[2];
    }

    // Only inspect slug if NOT a shortlink domain (shortlink pathnames are random codes like /8pX123)
    if (!isShortlinkDomain(host)) {
      const parts = pathname.split('/').filter(Boolean);
      if (
        parts.length > 0 &&
        !parts[0].includes('product') &&
        !parts[0].includes('cart') &&
        !parts[0].includes('buyer') &&
        !parts[0].includes('universal-link')
      ) {
        // Slug must have hyphens or spaces to be a meaningful title
        if (parts[0].includes('-')) {
          const slugTitle = parts[0].replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
          if (slugTitle.length > 4) {
            return {
              platform: 'Shopee',
              productTitle: slugTitle,
              identifiers,
            };
          }
        }
      }
    }

    return {
      platform: 'Shopee',
      productTitle: '',
      identifiers,
    };
  }

  // 2. TIKTOK & TIKTOK SHOP (tiktok.com, shop.tiktok.com, vt.tiktok.com, vm.tiktok.com)
  if (host.includes('tiktok')) {
    const identifiers: Record<string, string> = {};

    // Check query params for product titles
    const qTitle =
      urlObj.searchParams.get('title') ||
      urlObj.searchParams.get('product_name') ||
      urlObj.searchParams.get('keyword') ||
      urlObj.searchParams.get('q');

    let titleCandidate = qTitle ? qTitle.replace(/[-_+]/g, ' ').trim() : '';

    // Pattern: /view/product/123456 or /product/123456
    const matchProduct = pathname.match(/\/(?:view\/)?product\/([^\/?#]+)/i);
    if (matchProduct) {
      identifiers.productId = matchProduct[1];
    }

    // Pattern: /@creator/video/123456
    const matchVideo = pathname.match(/@([^\/]+)\/video\/(\d+)/i);
    if (matchVideo) {
      identifiers.creator = matchVideo[1];
      identifiers.videoId = matchVideo[2];
    }

    // Slug in path fallback: /product/nama-produk-disini-1234
    if (!titleCandidate && !isShortlinkDomain(host)) {
      const parts = pathname.split('/').filter(Boolean);
      for (const part of parts) {
        if (part.includes('-') && !part.startsWith('@') && isNaN(Number(part))) {
          const decoded = part.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
          if (decoded.length > 5) {
            titleCandidate = decoded;
            break;
          }
        }
      }
    }

    return {
      platform: 'TikTok',
      productTitle: titleCandidate,
      identifiers,
    };
  }

  // 3. TOKOPEDIA
  if (host.includes('tokopedia')) {
    const identifiers: Record<string, string> = {};
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length >= 2 && !isShortlinkDomain(host)) {
      identifiers.shop = parts[0];
      const prodSlug = parts[1].replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
      return {
        platform: 'Tokopedia',
        productTitle: prodSlug,
        identifiers,
      };
    }
    return { platform: 'Tokopedia', productTitle: '', identifiers };
  }

  return { platform: 'Umum', productTitle: '', identifiers: {} };
}

/**
 * Follows redirects safely step-by-step to avoid redirect-based SSRF,
 * resolving shortlinks (e.g. s.shopee.co.id or vt.tiktok.com) to their real destination.
 */
async function followRedirectsSafely(
  initialUrl: URL,
  maxRedirects = 3
): Promise<{ finalUrl: URL; redirected: boolean }> {
  let currentUrl = initialUrl;
  let redirected = false;

  for (let i = 0; i < maxRedirects; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(currentUrl.toString(), {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      clearTimeout(timeout);

      // Check if redirect status (301, 302, 303, 307, 308)
      if ([301, 302, 303, 307, 308].includes(res.status)) {
        const location = res.headers.get('location');
        if (location) {
          const nextUrl = new URL(location, currentUrl.toString());
          const validatedNext = await validateSafeUrl(nextUrl.toString());
          currentUrl = validatedNext;
          redirected = true;
          continue;
        }
      }

      // If not redirecting, stop
      break;
    } catch {
      break;
    }
  }

  return { finalUrl: currentUrl, redirected };
}

/**
 * Tries fetching TikTok official oEmbed API.
 * Returns verified title/caption and author info without getting blocked by bot protections.
 */
async function fetchTikTokOembed(videoUrl: string): Promise<{
  title?: string;
  cleanTitle?: string;
  authorName?: string;
} | null> {
  try {
    const oembedEndpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(oembedEndpoint, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AffiliateScriptLabBot/1.0)',
      },
    });

    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.title) {
        const cleanTitle = cleanTikTokCaption(data.title);
        return {
          title: data.title,
          cleanTitle: cleanTitle || data.title,
          authorName: data.author_name || data.author_unique_id,
        };
      }
    }
  } catch {
    // oEmbed fallback silently
  }
  return null;
}

/**
 * Safely fetches product page HTML and parses metadata (Shopee & TikTok optimized).
 */
export async function safeFetchProductPage(rawInput: string): Promise<ScrapedPageResult> {
  const { url: cleanedUrl, accompanyingText } = extractUrlFromRawInput(rawInput);
  if (!cleanedUrl) {
    return { success: false, error: 'Tautan URL tidak ditemukan' };
  }

  let safeUrl: URL;
  try {
    safeUrl = await validateSafeUrl(cleanedUrl);
  } catch (err: any) {
    return { success: false, error: err.message || 'Format URL tidak valid' };
  }

  // Follow shortlink redirects safely
  let targetUrl = safeUrl;
  if (isShortlinkDomain(safeUrl.hostname)) {
    const { finalUrl } = await followRedirectsSafely(safeUrl);
    targetUrl = finalUrl;
  }

  // Extract e-commerce info from resolved URL
  let ecomInfo = extractEcommerceFromUrl(targetUrl);
  let finalUrlStr = targetUrl.toString();

  // Check if accompanying text had a candidate product title (e.g. from mobile app share)
  const candidateFromAccompanying = extractProductTitleFromAccompanyingText(accompanyingText);
  if (!ecomInfo.productTitle && candidateFromAccompanying) {
    ecomInfo.productTitle = candidateFromAccompanying;
  }

  // Special handler: If platform is TikTok and URL is a video or creator link, use official oEmbed
  let oembedData: { title?: string; cleanTitle?: string; authorName?: string } | null = null;
  if (ecomInfo.platform === 'TikTok' || targetUrl.hostname.includes('tiktok')) {
    oembedData = await fetchTikTokOembed(finalUrlStr);
    if (oembedData?.cleanTitle) {
      ecomInfo.platform = 'TikTok';
      if (!ecomInfo.productTitle) {
        ecomInfo.productTitle = oembedData.cleanTitle;
      }
    }
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500); // 3.5s timeout for fast response

    // Fetch the target URL HTML
    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
      },
    });

    clearTimeout(timeout);

    // If redirected further during GET, re-evaluate
    if (response.url && response.url !== targetUrl.toString()) {
      try {
        const redirectedSafe = await validateSafeUrl(response.url);
        finalUrlStr = redirectedSafe.toString();
        const redirectedEcom = extractEcommerceFromUrl(redirectedSafe);
        if (redirectedEcom.productTitle) {
          ecomInfo.productTitle = redirectedEcom.productTitle;
        }
        if (redirectedEcom.platform !== 'Umum') {
          ecomInfo.platform = redirectedEcom.platform;
        }
      } catch {
        // ignore SSRF on redirect if blocked
      }
    }

    let pageTitle = '';
    let pageDesc = oembedData?.title || accompanyingText || '';
    let pageText = accompanyingText || '';
    let jsonLdData: any = null;

    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html') || contentType.includes('application/xhtml+xml')) {
        const fullBuffer = await response.text();
        const $ = cheerio.load(fullBuffer);

        const ogTitle = $('meta[property="og:title"]').attr('content')?.trim();
        const twitterTitle = $('meta[name="twitter:title"]').attr('content')?.trim();
        const docTitle = $('title').text()?.trim();
        const h1 = $('h1').first().text()?.trim();
        pageTitle = cleanBrandingNoise(ogTitle || twitterTitle || h1 || docTitle || '');

        const ogDesc = $('meta[property="og:description"]').attr('content')?.trim();
        const metaDesc = $('meta[name="description"]').attr('content')?.trim();
        const twitterDesc = $('meta[name="twitter:description"]').attr('content')?.trim();
        const metaSummary = cleanBrandingNoise(ogDesc || metaDesc || twitterDesc || '');
        if (metaSummary) {
          pageDesc = metaSummary;
        }

        // JSON-LD Product search
        $('script[type="application/ld+json"]').each((_, el) => {
          try {
            const text = $(el).html();
            if (text) {
              const parsed = JSON.parse(text);
              if (
                parsed['@type'] === 'Product' ||
                (Array.isArray(parsed) && parsed.some((p) => p['@type'] === 'Product'))
              ) {
                jsonLdData = parsed;
              }
            }
          } catch {
            // ignore
          }
        });

        // Body text snippet
        $('script, style, noscript, nav, footer, header, svg').remove();
        let body = $('body').text() || '';
        body = body.replace(/\s+/g, ' ').trim().slice(0, 3000);
        if (body && !pageText) {
          pageText = body;
        }
      }
    }

    // Determine final best title
    const resolvedTitle =
      ecomInfo.productTitle ||
      oembedData?.cleanTitle ||
      pageTitle ||
      candidateFromAccompanying ||
      '';

    if (resolvedTitle || ecomInfo.platform !== 'Umum' || pageDesc) {
      return {
        success: true,
        platform: ecomInfo.platform,
        title: resolvedTitle || pageTitle,
        extractedProductTitle: resolvedTitle,
        description: pageDesc,
        textSnippet: pageText,
        jsonLdData,
        identifiers: ecomInfo.identifiers,
        resolvedUrl: finalUrlStr,
        author: oembedData?.authorName,
      };
    }

    return {
      success: false,
      error: 'Halaman dapat diakses namun informasi produk tidak ditemukan secara otomatis.',
    };
  } catch (err: any) {
    // Fallback: If network fetch was blocked by anti-bot, but we extracted title from slug or oEmbed or share text:
    const fallbackTitle =
      ecomInfo.productTitle ||
      oembedData?.cleanTitle ||
      candidateFromAccompanying ||
      '';

    if (fallbackTitle || ecomInfo.platform !== 'Umum') {
      return {
        success: true,
        platform: ecomInfo.platform,
        title: fallbackTitle,
        extractedProductTitle: fallbackTitle,
        description: oembedData?.title || accompanyingText || '',
        textSnippet: accompanyingText || '',
        identifiers: ecomInfo.identifiers,
        resolvedUrl: finalUrlStr,
        author: oembedData?.authorName,
      };
    }

    return {
      success: false,
      error:
        err.name === 'AbortError'
          ? 'Koneksi ke halaman timeout (melebihi 6 detik)'
          : err.message || 'Gagal membaca URL produk',
    };
  }
}
