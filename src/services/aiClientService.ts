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
  preferredModel?: string;
}

/**
 * Universal Extraction:
 * Prioritizes backend proxy to support SSRF protection, URL scraping, and server-side keys.
 * If offline or backend proxy is unreachable, gracefully falls back to client-side direct Gemini call.
 */
export async function executeExtractProduct(
  params: AnalyzeInputParams
): Promise<ExtractProductResponse> {
  const apiKey = params.apiKey?.trim();

  // 1. Try backend proxy first (Web and Android both supported via cloud backend)
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
        preferredModel: params.preferredModel,
      }),
    });

    return await safeParseJsonResponse<ExtractProductResponse>(
      response,
      'mengekstrak informasi produk'
    );
  } catch (proxyErr: any) {
    const msg = proxyErr?.message || '';
    const isNetworkOrProxyFailure =
      msg.includes('halaman HTML') ||
      msg.includes('404') ||
      msg.includes('Failed to fetch') ||
      msg.includes('NetworkError') ||
      proxyErr?.status === 404 ||
      proxyErr?.status === 502 ||
      proxyErr?.status === 503 ||
      proxyErr?.status === 504;

    // If proxy failed due to network / sleeping backend and user has API key, run directly
    if (isNetworkOrProxyFailure && apiKey) {
      console.info('[aiClientService] Proxy offline/unavailable, falling back to direct Google AI Studio API.');
      return await directExtractProduct(params);
    }

    throw proxyErr;
  }
}

/**
 * Universal Script Generation:
 * Calls server proxy with automatic client-side fallback if backend is unreachable.
 */
export async function executeGenerateScripts(params: {
  productBrief: ProductBrief;
  config: GenerationConfig;
  apiKey?: string;
  preferredModel?: string;
}): Promise<GenerateScriptsResponse> {
  const apiKey = params.apiKey?.trim();

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
        preferredModel: params.preferredModel,
      }),
    });

    return await safeParseJsonResponse<GenerateScriptsResponse>(
      response,
      'membuat skrip video'
    );
  } catch (proxyErr: any) {
    const msg = proxyErr?.message || '';
    const isNetworkOrProxyFailure =
      msg.includes('halaman HTML') ||
      msg.includes('404') ||
      msg.includes('Failed to fetch') ||
      msg.includes('NetworkError') ||
      proxyErr?.status === 404 ||
      proxyErr?.status === 502 ||
      proxyErr?.status === 503 ||
      proxyErr?.status === 504;

    if (isNetworkOrProxyFailure && apiKey) {
      console.info('[aiClientService] Proxy unavailable, falling back to direct Google AI Studio API.');
      return await directGenerateScripts(params);
    }

    throw proxyErr;
  }
}

/**
 * Universal Real-Time Script Generation with Live Token Streaming:
 * In Web & Android APK, connects to /api/generate-scripts-stream via SSE fetch reader
 * with automatic client-side fallback if backend proxy is offline.
 */
export async function executeGenerateScriptsStream(params: {
  productBrief: ProductBrief;
  config: GenerationConfig;
  apiKey?: string;
  preferredModel?: string;
  onChunk: (chunk: string) => void;
  onScriptReady: (script: ScriptItem) => void;
}): Promise<GenerateScriptsResponse> {
  const apiKey = params.apiKey?.trim();


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
        preferredModel: params.preferredModel,
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
    const isNetworkOrProxyFailure =
      msg.includes('halaman HTML') ||
      msg.includes('404') ||
      msg.includes('Failed to fetch') ||
      msg.includes('NetworkError') ||
      proxyErr?.status === 404 ||
      proxyErr?.status === 502 ||
      proxyErr?.status === 503 ||
      proxyErr?.status === 504;

    if (isNetworkOrProxyFailure && apiKey) {
      console.info(
        '[aiClientService] Proxy streaming unavailable, falling back to direct Google AI Studio API.'
      );
      return await directGenerateScriptsStream({
        productBrief: params.productBrief,
        config: params.config,
        apiKey,
        preferredModel: params.preferredModel,
        onChunk: params.onChunk,
        onScriptReady: params.onScriptReady,
      });
    }

    throw proxyErr;
  }
}

/**
 * Universal Script Refinement:
 * Calls server proxy with automatic client-side fallback if backend is unreachable.
 */
export async function executeRefineScript(params: {
  script: ScriptItem;
  productBrief: ProductBrief;
  config: GenerationConfig;
  refinementType: any;
  customInstruction?: string;
  apiKey?: string;
  preferredModel?: string;
}): Promise<RefineScriptResponse> {
  const apiKey = params.apiKey?.trim();

  // Try proxy first
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
        preferredModel: params.preferredModel,
      }),
    });

    return await safeParseJsonResponse<RefineScriptResponse>(
      response,
      'memperbaiki skrip'
    );
  } catch (proxyErr: any) {
    const msg = proxyErr?.message || '';
    const isNetworkOrProxyFailure =
      msg.includes('halaman HTML') ||
      msg.includes('404') ||
      msg.includes('Failed to fetch') ||
      msg.includes('NetworkError') ||
      proxyErr?.status === 404 ||
      proxyErr?.status === 502 ||
      proxyErr?.status === 503 ||
      proxyErr?.status === 504;

    if (isNetworkOrProxyFailure && apiKey) {
      console.info('[aiClientService] Proxy endpoint offline/unavailable, falling back to direct Google AI Studio API.');
      return await directRefineScript(params);
    }

    throw proxyErr;
  }
}
