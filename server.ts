/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { safeFetchProductPage, ScrapedPageResult } from './server/ssrf';
import { extractProductBrief, generateScripts, refineSingleScript } from './server/gemini';
import {
  ExtractProductRequest,
  ExtractProductResponse,
  GenerateScriptsRequest,
  GenerateScriptsResponse,
  RefineScriptRequest,
  RefineScriptResponse,
  ProductBrief,
} from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

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

// 1. EXTRACT PRODUCT INFO
app.post('/api/extract-product', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { inputMode = 'mixed', textDescription, productUrl, images } = req.body as ExtractProductRequest;

    // Filter active inputs strictly according to the active tab chosen by the user
    const isImageMode = inputMode === 'images';
    const isUrlMode = inputMode === 'url';
    const isTextMode = inputMode === 'text';

    const rawText = isTextMode || inputMode === 'mixed' ? textDescription?.trim() : undefined;
    const targetUrl = isUrlMode || inputMode === 'mixed' ? productUrl?.trim() : undefined;
    const candidateImages = isImageMode || inputMode === 'mixed' ? images : undefined;

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

    // Call Gemini for multimodal & text extraction
    const { brief, notes, conflicts } = await extractProductBrief({
      textDescription: rawText,
      urlData,
      images: validatedImages,
    });

    // Zero out conflicts if user explicitly ran extraction from a single-source tab
    const finalConflicts = inputMode === 'mixed' ? conflicts : [];
    brief.conflicts = finalConflicts;

    const responseData: ExtractProductResponse = {
      productBrief: brief,
      platform: urlData?.platform || brief.platform,
      extractedFromUrl: !!(urlData && (urlData.success || urlData.extractedProductTitle)),
      extractedFromImages: validatedImages.length,
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

    // Clamp scriptCount between 1 and 10
    config.scriptCount = Math.max(1, Math.min(10, Math.floor(config.scriptCount)));

    // Generate scripts using Gemini
    const scripts = await generateScripts({ productBrief, config });

    const responseData: GenerateScriptsResponse = {
      productBrief,
      scripts,
    };

    res.json(responseData);
  } catch (error: any) {
    next(error);
  }
});

// 3. REFINE SINGLE SCRIPT
app.post('/api/refine-script', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { script, productBrief, config, refinementType, customInstruction } =
      req.body as RefineScriptRequest;

    if (!script || !productBrief || !config || !refinementType) {
      return res.status(400).json({
        error: 'Parameter perbaikan skrip tidak lengkap.',
      });
    }

    const refinedScript = await refineSingleScript({
      script,
      productBrief,
      config,
      refinementType,
      customInstruction,
    });

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
  console.error('[Server Error]', err.message || err);
  const status = err.status || 500;
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

  let message = 'Terjadi kesalahan saat memproses permintaan AI. Silakan coba kembali.';
  if (rawMsg.includes('503') || rawMsg.includes('high demand') || rawMsg.includes('UNAVAILABLE')) {
    message = 'Layanan AI sedang mengalami lonjakan antrean sementara (503). Sistem telah mencoba kembali otomatis. Silakan klik tombol sekali lagi dalam beberapa detik.';
  } else if (rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED')) {
    message = 'Batas permintaan API tercapai (429). Harap tunggu beberapa detik sebelum mencoba lagi.';
  } else if (rawMsg && !rawMsg.includes('API_KEY')) {
    message = rawMsg;
  }

  res.status(status).json({
    error: message,
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Affiliate Script Lab] Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
