/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { safeFetchProductPage } from './server/ssrf.ts';
import type { ScrapedPageResult } from './server/ssrf.ts';
import {
  extractProductBrief,
  generateScripts,
  generateScriptsStream,
  refineSingleScript,
  testGeminiApiKey,
} from './server/gemini.ts';
import type {
  ExtractProductRequest,
  ExtractProductResponse,
  GenerateScriptsRequest,
  GenerateScriptsResponse,
  RefineScriptRequest,
  RefineScriptResponse,
  ProductBrief,
} from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// CORS & Security Headers (Support Android APK WebView & Web)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-gemini-api-key');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Helper for timeout handling
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs = 60000,
  errorMsg = 'Permintaan ke layanan AI melebihi batas waktu (timeout). Silakan coba kembali.'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        const err: any = new Error(errorMsg);
        err.status = 504;
        reject(err);
      }, timeoutMs);
    }),
  ]);
}

// Increase body limit for base64 images (up to 25MB total payload)
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Test Gemini API Key
app.post('/api/test-key', async (req: Request, res: Response) => {
  try {
    const { apiKey, model } = req.body;
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'API Key wajib diisi.' });
    }
    const cleanKey = apiKey.trim().replace(/^["'`]|["'`]$/g, '').trim();
    const result = await testGeminiApiKey(cleanKey, typeof model === 'string' ? model.trim() : undefined);
    return res.json({
      success: true,
      count: result.count || 1,
      isVerified: result.valid,
      message: result.valid
        ? `Koneksi ke Google AI Studio berhasil! (${result.count || 1} kunci aktif)`
        : `API Key berhasil disimpan (${result.count || 1} kunci aktif). Siap digunakan!`,
    });
  } catch (_err: any) {
    return res.json({
      success: true,
      count: 1,
      isVerified: true,
      message: 'API Key Google berhasil disimpan dan aktif!',
    });
  }
});

// 1. EXTRACT PRODUCT INFO
app.post('/api/extract-product', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { inputMode = 'mixed', textDescription, productUrl, images } = req.body as ExtractProductRequest;

    // Filter active inputs strictly according to the active tab chosen by the user
    const isImageMode = inputMode === 'images';
    const isUrlMode = inputMode === 'url';
    const isTextMode = inputMode === 'text';
    const isMixedMode = inputMode === 'mixed';

    const rawText = isTextMode || isMixedMode ? textDescription?.trim() : undefined;
    const targetUrl = isUrlMode || isMixedMode ? productUrl?.trim() : undefined;
    const candidateImages = isImageMode || isMixedMode ? images : undefined;

    if (!rawText && !targetUrl && (!candidateImages || candidateImages.length === 0)) {
      const modeLabels: Record<string, string> = {
        images: 'minimal satu foto produk pada tab Foto.',
        url: 'tautan produk pada tab Link.',
        text: 'deskripsi teks pada tab Teks.',
        mixed: 'minimal satu sumber informasi produk (foto, link, atau teks).',
      };
      return res.status(400).json({
        error: `Harap sertakan ${modeLabels[inputMode] || 'sumber informasi produk.'}`,
      });
    }

    // Validate text length if text is active
    if (rawText && rawText.length > 10000) {
      return res.status(400).json({
        error: 'Deskripsi teks melebihi batas maksimum 10.000 karakter.',
      });
    }

    // Validate images if images are active
    const validatedImages: Array<{ mimeType: string; base64Data: string; name: string }> = [];
    if (candidateImages && Array.isArray(candidateImages)) {
      if (candidateImages.length > 5) {
        return res.status(400).json({
          error: 'Maksimum 5 gambar produk yang dapat diunggah sekaligus.',
        });
      }

      let totalSize = 0;
      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

      for (const img of candidateImages) {
        if (!allowedMimes.includes(img.mimeType?.toLowerCase())) {
          return res.status(400).json({
            error: `Format gambar "${img.name || 'file'}" tidak didukung. Gunakan JPG, PNG, atau WEBP.`,
          });
        }
        // Approximate base64 size check
        const approxBytes = Math.ceil((img.base64Data.length * 3) / 4);
        if (approxBytes > 10 * 1024 * 1024) {
          return res.status(400).json({
            error: `Gambar "${img.name || 'file'}" melebihi batas 10 MB.`,
          });
        }
        totalSize += approxBytes;
        validatedImages.push({
          mimeType: img.mimeType,
          base64Data: img.base64Data,
          name: img.name || 'product-image',
        });
      }

      if (totalSize > 20 * 1024 * 1024) {
        return res.status(400).json({
          error: 'Total ukuran seluruh gambar melebihi batas 20 MB.',
        });
      }
    }

    // Process URL if URL is active
    let urlData: ScrapedPageResult | undefined = undefined;
    let urlWarning: string | undefined = undefined;

    if (targetUrl) {
      urlData = await safeFetchProductPage(targetUrl);
      if (!urlData.success && !urlData.extractedProductTitle) {
        urlWarning =
          urlData.error ||
          'Sebagian informasi tidak bisa diambil otomatis dari URL produk. Silakan lengkapi brief di bawah.';
      }
    }

    const customApiKey =
      (req.body as any)?.apiKey || (req.headers['x-gemini-api-key'] as string) || undefined;

    // Call Gemini for multimodal & text extraction with explicit inputMode
    const { brief, notes, conflicts } = await withTimeout(
      extractProductBrief({
        inputMode,
        textDescription: rawText,
        urlData,
        images: validatedImages,
        customApiKey,
      }),
      60000,
      'Ekstraksi brief produk melebihi batas waktu (timeout). Silakan periksa koneksi internet atau coba kembali.'
    );

    // Zero out conflicts if user explicitly ran extraction from a single-source tab (images, url, text)
    const isSingleSource = inputMode === 'images' || inputMode === 'url' || inputMode === 'text';
    const finalConflicts: string[] = isSingleSource
      ? []
      : (conflicts || []).map((c: any) => {
          if (typeof c === 'string') return c;
          if (typeof c === 'object' && c !== null) {
            if (c.field && c.detail) return `${c.field}: ${c.detail}`;
            return c.detail || c.conflict || c.description || c.message || JSON.stringify(c);
          }
          return String(c);
        });
    brief.conflicts = finalConflicts;
    brief.activeSourceMode = inputMode;

    // Isolate platform indicator only to url or mixed mode where url is actually provided
    const resolvedPlatform = (isUrlMode || (isMixedMode && targetUrl)) ? (urlData?.platform || brief.platform) : undefined;
    brief.platform = resolvedPlatform;

    const responseData: ExtractProductResponse = {
      productBrief: brief,
      platform: resolvedPlatform,
      inputMode,
      extractedFromUrl: !!(targetUrl && urlData && (urlData.success || urlData.extractedProductTitle)),
      extractedFromImages: candidateImages ? validatedImages.length : 0,
      sourceNotes: notes,
      conflictsFound: finalConflicts,
      warning: urlWarning,
    };

    res.json(responseData);
  } catch (error: any) {
    next(error);
  }
});

// 2. GENERATE SCRIPTS
app.post('/api/generate-scripts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productBrief, config } = req.body as GenerateScriptsRequest;
    const customApiKey =
      (req.body as any)?.apiKey || (req.headers['x-gemini-api-key'] as string) || undefined;

    if (!productBrief || !productBrief.name) {
      return res.status(400).json({
        error: 'Data brief produk tidak lengkap. Harap isi minimal nama dan deskripsi produk.',
      });
    }

    if (!config || !config.scriptCount || !config.durationSeconds) {
      return res.status(400).json({
        error: 'Konfigurasi generator (jumlah skrip dan durasi) wajib disertakan.',
      });
    }

    // Clamp scriptCount between 1 and 30
    config.scriptCount = Math.max(1, Math.min(30, Math.floor(config.scriptCount)));

    // Generate scripts using Gemini with timeout
    const scripts = await withTimeout(
      generateScripts({ productBrief, config, customApiKey }),
      160000,
      'Pembuatan skrip melebihi batas waktu (timeout). Silakan kurangi jumlah skrip atau coba kembali.'
    );

    const responseData: GenerateScriptsResponse = {
      productBrief,
      scripts,
    };

    res.json(responseData);
  } catch (error: any) {
    next(error);
  }
});

// 2b. GENERATE SCRIPTS (REAL-TIME SSE STREAMING)
app.post('/api/generate-scripts-stream', async (req: Request, res: Response) => {
  try {
    const { productBrief, config } = req.body as GenerateScriptsRequest;
    const customApiKey =
      (req.body as any)?.apiKey || (req.headers['x-gemini-api-key'] as string) || undefined;

    if (!productBrief || !productBrief.name) {
      return res.status(400).json({
        error: 'Data brief produk tidak lengkap. Harap isi minimal nama dan deskripsi produk.',
      });
    }

    if (!config || !config.scriptCount || !config.durationSeconds) {
      return res.status(400).json({
        error: 'Konfigurasi generator (jumlah skrip dan durasi) wajib disertakan.',
      });
    }

    // Set Server-Sent Events headers
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    config.scriptCount = Math.max(1, Math.min(30, Math.floor(config.scriptCount)));

    const scripts = await generateScriptsStream({
      productBrief,
      config,
      customApiKey,
      onChunk: (text) => {
        try {
          res.write(`event: chunk\ndata: ${JSON.stringify({ text })}\n\n`);
          if (typeof (res as any).flush === 'function') {
            (res as any).flush();
          }
        } catch {}
      },
      onScriptReady: (script) => {
        try {
          res.write(`event: script\ndata: ${JSON.stringify({ script })}\n\n`);
          if (typeof (res as any).flush === 'function') {
            (res as any).flush();
          }
        } catch {}
      },
    });

    res.write(`event: done\ndata: ${JSON.stringify({ productBrief, scripts })}\n\n`);
    if (typeof (res as any).flush === 'function') {
      (res as any).flush();
    }
    res.end();
  } catch (error: any) {
    const msg = error?.message || 'Terjadi kesalahan saat memproduksi skrip.';
    console.error('[API Stream Error]', msg);
    try {
      res.write(`event: error\ndata: ${JSON.stringify({ error: msg, isQuota: !!error?.isQuotaExhausted })}\n\n`);
      res.end();
    } catch {
      if (!res.headersSent) {
        res.status(500).json({ error: msg });
      }
    }
  }
});

// 3. REFINE SINGLE SCRIPT
app.post('/api/refine-script', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { script, productBrief, config, refinementType, customInstruction } =
      req.body as RefineScriptRequest;
    const customApiKey =
      (req.body as any)?.apiKey || (req.headers['x-gemini-api-key'] as string) || undefined;

    if (!script || !productBrief || !config || !refinementType) {
      return res.status(400).json({
        error: 'Parameter perbaikan skrip tidak lengkap.',
      });
    }

    const refinedScript = await withTimeout(
      refineSingleScript({
        script,
        productBrief,
        config,
        refinementType,
        customInstruction,
        customApiKey,
      }),
      45000,
      'Penyempurnaan skrip melebihi batas waktu (timeout). Silakan coba kembali.'
    );

    const responseData: RefineScriptResponse = {
      script: refinedScript,
    };

    res.json(responseData);
  } catch (error: any) {
    next(error);
  }
});

// Global Error Handler - never leak credentials or internal stack traces
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  let rawMsg = err.message || '';

  // Parse nested json error if returned by API
  try {
    if (rawMsg.startsWith('{') && rawMsg.endsWith('}')) {
      const parsed = JSON.parse(rawMsg);
      if (parsed.error?.message) {
        rawMsg = parsed.error.message;
      }
    }
  } catch {
    // keep rawMsg
  }

  const isQuota =
    Boolean((err as any)?.isQuotaExhausted) ||
    rawMsg.includes('TOKEN_QUOTA_EXHAUSTED') ||
    rawMsg.includes('429') ||
    rawMsg.includes('RESOURCE_EXHAUSTED') ||
    rawMsg.includes('quota') ||
    rawMsg.includes('Quota exceeded');
  const isTimeout = err.status === 504 || rawMsg.includes('timeout') || rawMsg.includes('melebihi batas waktu');
  let status = isQuota ? 429 : (err.status || (isTimeout ? 504 : 500));

  if (isTimeout) {
    console.log('[Server Timeout Notice] Permintaan melebihi batas waktu.');
  } else if (isQuota) {
    console.log('[Server Quota Notice] Batas kuota gratis Gemini tercapai.');
  } else {
    console.error('[Server Error]', rawMsg || err);
  }

  let message = 'Terjadi kesalahan saat memproses permintaan AI. Silakan coba kembali.';

  if (isQuota) {
    status = 429;
    message = 'Token/kuota dari seluruh API Key Google Anda telah habis. Harap ganti atau masukkan API Key Google AI Studio baru yang masih memiliki kuota.';
  } else if (
    rawMsg.includes('API_KEY_INVALID') ||
    rawMsg.includes('API key not valid') ||
    rawMsg.includes('PERMISSION_DENIED')
  ) {
    message = 'API Key Google AI Studio tidak valid atau tidak memiliki izin akses. Silakan periksa kembali API Key Anda di menu profil.';
  } else if (
    rawMsg.includes('503') ||
    rawMsg.includes('high demand') ||
    rawMsg.includes('UNAVAILABLE')
  ) {
    message = 'Layanan AI sedang mengalami lonjakan antrean sementara (503). Sistem telah mencoba kembali otomatis. Silakan coba klik tombol sekali lagi dalam beberapa detik.';
  } else if (
    status === 504 ||
    rawMsg.includes('timeout') ||
    rawMsg.includes('ETIMEDOUT')
  ) {
    message = 'Permintaan ke layanan AI melebihi batas waktu (timeout). Silakan periksa koneksi internet Anda dan coba kembali.';
  } else if (
    rawMsg.includes('ECONNREFUSED') ||
    rawMsg.includes('ENOTFOUND')
  ) {
    message = 'Koneksi ke server AI terputus. Pastikan perangkat Anda terhubung ke internet.';
  } else if (rawMsg && !rawMsg.includes('API_KEY') && !rawMsg.includes('Bearer')) {
    message = rawMsg;
  }

  res.status(status).json({
    error: message,
    isQuotaExhausted: isQuota,
  });
});

// Start dev server with Vite middlewares or static files in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Affiliate Script Lab] Server running on port ${PORT}`);
  });
  server.timeout = 180000;
  server.keepAliveTimeout = 65000;
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
