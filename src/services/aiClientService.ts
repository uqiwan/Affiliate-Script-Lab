/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiUrl, safeParseJsonResponse } from '../utils/api';
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
 * Calls server proxy endpoint /api/extract-product.
 */
export async function executeExtractProduct(
  params: AnalyzeInputParams
): Promise<ExtractProductResponse> {
  const apiKey = params.apiKey?.trim();

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
 * Calls server proxy endpoint /api/generate-scripts.
 */
export async function executeGenerateScripts(params: {
  productBrief: ProductBrief;
  config: GenerationConfig;
  apiKey?: string;
}): Promise<GenerateScriptsResponse> {
  const apiKey = params.apiKey?.trim();

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
 * Calls server proxy endpoint /api/refine-script.
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
