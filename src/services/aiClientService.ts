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

  // Jika berjalan di APK Android dan memiliki API Key mandiri, eksekusi langsung via client Gemini SDK
  if (isMobile && apiKey) {
    try {
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
    } catch (clientErr: any) {
      console.warn('Direct mobile SDK extraction failed, falling back to server backend:', clientErr);
    }
  }

  // Mode Web / Server Proxy (atau fallback jika di mobile APK)
  const response = await fetch(apiUrl('/api/extract-product'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'x-gemini-api-key': apiKey.replace(/[\r\n]+/g, ',') } : {}),
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
 * In Android APK: Runs Gemini SDK directly on device using user's API Key or falls back to backend proxy.
 * In Web Browser: Calls backend Express /api/generate-scripts.
 */
export async function executeGenerateScripts(params: {
  productBrief: ProductBrief;
  config: GenerationConfig;
  apiKey?: string;
}): Promise<GenerateScriptsResponse> {
  const isMobile = isMobileApp();
  const apiKey = params.apiKey?.trim();

  if (isMobile && apiKey) {
    try {
      const scripts = await generateScripts({
        productBrief: params.productBrief,
        config: params.config,
        customApiKey: apiKey,
      });

      return {
        productBrief: params.productBrief,
        scripts,
      };
    } catch (clientErr: any) {
      console.warn('Direct mobile SDK script generation failed, falling back to server backend:', clientErr);
    }
  }

  // Mode Web / Server Proxy (atau fallback jika di mobile APK)
  const response = await fetch(apiUrl('/api/generate-scripts'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'x-gemini-api-key': apiKey.replace(/[\r\n]+/g, ',') } : {}),
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
 * In Android APK: Runs Gemini SDK directly on device or falls back to backend proxy.
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

  if (isMobile && apiKey) {
    try {
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
    } catch (clientErr: any) {
      console.warn('Direct mobile SDK refinement failed, falling back to server backend:', clientErr);
    }
  }

  // Mode Web / Server Proxy (atau fallback jika di mobile APK)
  const response = await fetch(apiUrl('/api/refine-script'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'x-gemini-api-key': apiKey.replace(/[\r\n]+/g, ',') } : {}),
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
