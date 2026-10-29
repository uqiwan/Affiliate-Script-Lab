/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiUrl, safeParseJsonResponse, isMobileApp } from '../utils/api';
import { safeHeaderValue, cleanSingleKey, parseApiKeys } from '../utils/apiKeys';
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
  directGenerateScriptsStream,
  directRefineScript,
} from './directGeminiService';

function buildSafeApiKeyHeader(apiKey?: string): Record<string, string> {
  if (!apiKey) return {};
  const keys = parseApiKeys(apiKey);
  if (keys.length === 0) return {};
  const cleaned = keys.map(cleanSingleKey).filter(Boolean).join(',');
  const safeVal = safeHeaderValue(cleaned);
  return safeVal ? { 'x-gemini-api-key': safeVal } : {};
}

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
        ...buildSafeApiKeyHeader(apiKey),
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
        ...buildSafeApiKeyHeader(apiKey),
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
 * Universal Real-Time Script Generation with Live Token Streaming:
 * In standalone Android APK (isMobileApp), connects directly to Google AI Studio REST API (?alt=sse).
 * In Web, connects to /api/generate-scripts-stream via SSE fetch reader with automatic client-side fallback.
 */
export async function executeGenerateScriptsStream(params: {
  productBrief: ProductBrief;
  config: GenerationConfig;
  apiKey?: string;
  onChunk: (chunk: string) => void;
  onScriptReady: (script: ScriptItem) => void;
}): Promise<GenerateScriptsResponse> {
  const apiKey = params.apiKey?.trim();

  // In native Android APK, execute directly with Google AI Studio streaming
  if (isMobileApp()) {
    return await directGenerateScriptsStream({
      productBrief: params.productBrief,
      config: params.config,
      apiKey,
      onChunk: params.onChunk,
      onScriptReady: params.onScriptReady,
    });
  }

  // In Web environment, try SSE proxy endpoint first
  try {
    const response = await fetch(apiUrl('/api/generate-scripts-stream'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        ...buildSafeApiKeyHeader(apiKey),
      },
      body: JSON.stringify({
        productBrief: params.productBrief,
        config: params.config,
        apiKey,
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      throw new Error(errJson?.error || `HTTP ${response.status}`);
    }

    if (!response.body) {
      throw new Error('ReadableStream tidak tersedia.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let finalScripts: ScriptItem[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';

      for (const ev of events) {
        const lines = ev.split('\n');
        let eventType = 'message';
        let dataStr = '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventType = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            dataStr = line.slice(5).trim();
          }
        }

        if (!dataStr) continue;

        try {
          const parsed = JSON.parse(dataStr);
          if (eventType === 'chunk' && parsed.text) {
            params.onChunk(parsed.text);
          } else if (eventType === 'script' && parsed.script) {
            params.onScriptReady(parsed.script);
          } else if (eventType === 'done' && parsed.scripts) {
            finalScripts = parsed.scripts;
          } else if (eventType === 'error') {
            const err: any = new Error(parsed.error || 'Kendala saat streaming skrip');
            if (parsed.isQuota) err.isQuotaExhausted = true;
            throw err;
          }
        } catch (e: any) {
          if (eventType === 'error') throw e;
        }
      }
    }

    return {
      productBrief: params.productBrief,
      scripts: finalScripts,
    };
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
      console.info(
        '[aiClientService] Proxy streaming returned HTML/404, falling back to direct Google AI Studio API.'
      );
      return await directGenerateScriptsStream({
        productBrief: params.productBrief,
        config: params.config,
        apiKey,
        onChunk: params.onChunk,
        onScriptReady: params.onScriptReady,
      });
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
        ...buildSafeApiKeyHeader(apiKey),
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
