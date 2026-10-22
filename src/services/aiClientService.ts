/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiUrl, safeParseJsonResponse, isMobileApp } from '../utils/api';
import type {
  ProductBrief,
  GenerationConfig,
  ScriptItem,
  ExtractProductResponse,
  GenerateScriptsResponse,
  RefineScriptResponse,
  InputMode,
} from '../types';
import {
  directExtractProduct,
  directGenerateScripts,
  directRefineScript,
} from './directGeminiService';

export interface AnalyzeInputParams {
  inputMode: InputMode;
  textDescription?: string;
  productUrl?: string;
  images?: Array<{ name: string; mimeType: string; base64Data: string; size: number }>;
  apiKey?: string;
}

/**
 * Universal Extraction:
 * In standalone Android APK (isMobileApp), connects directly to Google AI Studio REST API.
 * In Web, calls server proxy with automatic client-side fallback if backend returns HTML (404/500).
 */
export async function executeExtractProduct(
  params: AnalyzeInputParams
): Promise<ExtractProductResponse> {
  const apiKey = params.apiKey?.trim();

  // In native Android APK, execute directly with Google AI Studio to avoid dead cloud proxies
  if (isMobileApp()) {
    return await directExtractProduct(params);
  }

  // In Web environment, try proxy first with direct Gemini fallback
  try {
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
  } catch (proxyErr: any) {
    const msg = proxyErr?.message || '';
    const isHtmlOr404 =
      msg.includes('halaman HTML') ||
      msg.includes('404') ||
      msg.includes('Failed to fetch') ||
      proxyErr?.status === 404 ||
      proxyErr?.status === 502 ||
      proxyErr?.status === 503;

    // If proxy failed due to 404 HTML or network and user has API key, run directly
    if (isHtmlOr404) {
      console.info('[aiClientService] Proxy endpoint returned HTML/404, falling back to direct Google AI Studio API.');
      return await directExtractProduct(params);
    }

    throw proxyErr;
  }
}

/**
 * Universal Script Generation:
 * In standalone Android APK (isMobileApp), connects directly to Google AI Studio REST API.
 * In Web, calls server proxy with automatic client-side fallback.
 */
export async function executeGenerateScripts(params: {
  productBrief: ProductBrief;
  config: GenerationConfig;
  apiKey?: string;
}): Promise<GenerateScriptsResponse> {
  const apiKey = params.apiKey?.trim();

  // In native Android APK, execute directly with Google AI Studio
  if (isMobileApp()) {
    return await directGenerateScripts(params);
  }

  // In Web environment, try proxy first with direct Gemini fallback
  try {
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
  } catch (proxyErr: any) {
    const msg = proxyErr?.message || '';
    const isHtmlOr404 =
      msg.includes('halaman HTML') ||
      msg.includes('404') ||
      msg.includes('Failed to fetch') ||
      proxyErr?.status === 404 ||
      proxyErr?.status === 502 ||
      proxyErr?.status === 503;

    if (isHtmlOr404) {
      console.info('[aiClientService] Proxy endpoint returned HTML/404, falling back to direct Google AI Studio API.');
      return await directGenerateScripts(params);
    }

    throw proxyErr;
  }
}

/**
 * Universal Script Refinement:
 * In standalone Android APK (isMobileApp), connects directly to Google AI Studio REST API.
 * In Web, calls server proxy with automatic client-side fallback.
 */
export async function executeRefineScript(params: {
  script: ScriptItem;
  productBrief: ProductBrief;
  config: GenerationConfig;
  refinementType: any;
  customInstruction?: string;
  apiKey?: string;
}): Promise<RefineScriptResponse> {
  const apiKey = params.apiKey?.trim();

  // In native Android APK, execute directly with Google AI Studio
  if (isMobileApp()) {
    return await directRefineScript(params);
  }

  // In Web environment, try proxy first with direct Gemini fallback
  try {
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
  } catch (proxyErr: any) {
    const msg = proxyErr?.message || '';
    const isHtmlOr404 =
      msg.includes('halaman HTML') ||
      msg.includes('404') ||
      msg.includes('Failed to fetch') ||
      proxyErr?.status === 404 ||
      proxyErr?.status === 502 ||
      proxyErr?.status === 503;

    if (isHtmlOr404) {
      console.info('[aiClientService] Proxy endpoint returned HTML/404, falling back to direct Google AI Studio API.');
      return await directRefineScript(params);
    }

    throw proxyErr;
  }
}
