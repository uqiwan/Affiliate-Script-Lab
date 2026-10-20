/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { isMobileApp, apiUrl, safeParseJsonResponse } from '../utils/api';
import {
  extractProductBrief,
  generateScripts,
  refineSingleScript,
} from '../../server/gemini';
import type {
  ProductBrief,
  GenerationConfig,
  ScriptItem,
  ExtractProductResponse,
  GenerateScriptsResponse,
  RefineScriptResponse,
  InputMode,
} from '../types';

export interface AnalyzeInputParams {
  inputMode: InputMode;
  textDescription?: string;
  productUrl?: string;
  images?: Array<{ name: string; mimeType: string; base64Data: string; size: number }>;
  apiKey?: string;
}

/**
 * Universal Extraction:
 * In Android APK: Runs Gemini SDK directly on device using user's API Key.
 * In Web Browser: Calls backend Express /api/extract-product.
 */
export async function executeExtractProduct(
  params: AnalyzeInputParams
): Promise<ExtractProductResponse> {
  const isMobile = isMobileApp();
  const apiKey = params.apiKey?.trim();

  // Jika di APK Android tanpa API key, minta pengguna mengisi API key
  if (isMobile && !apiKey) {
    throw new Error(
      'MISSING_MOBILE_API_KEY: Versi APK Android membutuhkan API Key Google AI Studio Anda. Silakan masukkan API Key Anda (Gratis).'
    );
  }

  // Jika berjalan di APK Android dan memiliki API Key, eksekusi langsung via client Gemini SDK
  if (isMobile && apiKey) {
    const rawImages = (params.images || []).map((img) => ({
      name: img.name,
      mimeType: img.mimeType,
      base64Data: img.base64Data,
    }));

    const { brief, notes, conflicts } = await extractProductBrief({
      inputMode: params.inputMode,
      textDescription: params.textDescription,
      images: rawImages,
      customApiKey: apiKey,
    });

    const isSingleSource =
      params.inputMode === 'images' ||
      params.inputMode === 'url' ||
      params.inputMode === 'text';

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
    brief.activeSourceMode = params.inputMode;

    return {
      productBrief: brief,
      inputMode: params.inputMode,
      extractedFromUrl: Boolean(params.productUrl),
      extractedFromImages: rawImages.length,
      sourceNotes: notes,
      conflictsFound: finalConflicts,
    };
  }

  // Mode Web / Server Proxy
  const response = await fetch(apiUrl('/api/extract-product'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'x-gemini-api-key': apiKey } : {}),
    },
    body: JSON.stringify({
      inputMode: params.inputMode,
      textDescription: params.textDescription,
      productUrl: params.productUrl,
      images: params.images,
      apiKey,
    }),
  });

  return await safeParseJsonResponse<ExtractProductResponse>(
    response,
    'mengekstrak informasi produk'
  );
}

/**
 * Universal Script Generation:
 * In Android APK: Runs Gemini SDK directly on device using user's API Key.
 * In Web Browser: Calls backend Express /api/generate-scripts.
 */
export async function executeGenerateScripts(params: {
  productBrief: ProductBrief;
  config: GenerationConfig;
  apiKey?: string;
}): Promise<GenerateScriptsResponse> {
  const isMobile = isMobileApp();
  const apiKey = params.apiKey?.trim();

  if (isMobile && !apiKey) {
    throw new Error(
      'MISSING_MOBILE_API_KEY: Versi APK Android membutuhkan API Key Google AI Studio Anda. Silakan masukkan API Key Anda (Gratis).'
    );
  }

  if (isMobile && apiKey) {
    const scripts = await generateScripts({
      productBrief: params.productBrief,
      config: params.config,
      customApiKey: apiKey,
    });

    return {
      productBrief: params.productBrief,
      scripts,
    };
  }

  // Mode Web / Server Proxy
  const response = await fetch(apiUrl('/api/generate-scripts'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'x-gemini-api-key': apiKey } : {}),
    },
    body: JSON.stringify({
      productBrief: params.productBrief,
      config: params.config,
      apiKey,
    }),
  });

  return await safeParseJsonResponse<GenerateScriptsResponse>(
    response,
    'membuat skrip video'
  );
}

/**
 * Universal Script Refinement:
 * In Android APK: Runs Gemini SDK directly on device.
 * In Web Browser: Calls backend Express /api/refine-script.
 */
export async function executeRefineScript(params: {
  script: ScriptItem;
  productBrief: ProductBrief;
  config: GenerationConfig;
  refinementType: any;
  customInstruction?: string;
  apiKey?: string;
}): Promise<RefineScriptResponse> {
  const isMobile = isMobileApp();
  const apiKey = params.apiKey?.trim();

  if (isMobile && !apiKey) {
    throw new Error(
      'MISSING_MOBILE_API_KEY: Versi APK Android membutuhkan API Key Google AI Studio Anda. Silakan masukkan API Key Anda (Gratis).'
    );
  }

  if (isMobile && apiKey) {
    const refined = await refineSingleScript({
      script: params.script,
      productBrief: params.productBrief,
      config: params.config,
      refinementType: params.refinementType,
      customInstruction: params.customInstruction,
      customApiKey: apiKey,
    });

    return {
      script: refined,
    };
  }

  // Mode Web / Server Proxy
  const response = await fetch(apiUrl('/api/refine-script'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'x-gemini-api-key': apiKey } : {}),
    },
    body: JSON.stringify({
      script: params.script,
      productBrief: params.productBrief,
      config: params.config,
      refinementType: params.refinementType,
      customInstruction: params.customInstruction,
      apiKey,
    }),
  });

  return await safeParseJsonResponse<RefineScriptResponse>(
    response,
    'memperbaiki skrip'
  );
}
