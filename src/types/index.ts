/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type InputMode = 'images' | 'url' | 'text' | 'mixed';
export type SourceType = 'user' | 'image' | 'url' | 'unknown';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface SourceProvenance {
  field: string;
  source: SourceType;
  confidence?: ConfidenceLevel;
}

export interface ProductBrief {
  name: string;
  category: string;
  description: string;
  features: string[];
  benefits: string[];
  audience: string;
  painPoints: string[];
  currentPrice?: string;
  referencePrice?: string;
  promoDetails?: string;
  stockOrDeadline?: string;
  socialProof?: string;
  creatorExperience?: string;
  platform?: string;
  activeSourceMode?: 'images' | 'url' | 'text' | 'mixed';
  restrictions: string[];
  additionalNotes?: string;
  sources: SourceProvenance[];
  conflicts: string[];
  verifiedFacts?: string[];
  unknowns?: string[];
}

export type ScriptDuration = 15 | 30 | 60 | 90;

export type DeliveryStyle =
  | 'Natural conversational'
  | 'Soft selling'
  | 'Persuasif langsung tetapi etis'
  | 'Storytelling/pengalaman'
  | 'UGC review/demo'
  | 'Edukatif/tutorial'
  | 'Humor ringan/relatable'
  | 'POV/rutinitas'
  | 'Unboxing/first impression'
  | 'Komparasi/value';

export type AudiencePersona =
  | 'Auto'
  | 'Mahasiswa/anak kost'
  | 'Pekerja kantor/Gen-Z'
  | 'Orang tua/rumah tangga'
  | 'Profesional'
  | 'Pengguna pemula'
  | 'Custom';

export type HookType =
  | 'Auto'
  | 'Bold claim berbukti'
  | 'Pain-point callout'
  | 'Outcome-first'
  | 'Question/information gap'
  | 'Myth-busting';

export type DemoMethod =
  | 'Auto'
  | 'Real-time / side-by-side'
  | 'Close-up / macro'
  | 'Unboxing & first touch'
  | 'Mini tutorial langkah demi langkah'
  | 'Day-in-the-life rutinitas'
  | 'Proof / test aman'
  | 'Before-after dengan bukti nyata';

export type CtaType =
  | 'Auto'
  | 'Direct instruction (keranjang kiri bawah)'
  | 'Cek detail / pilihan variasi'
  | 'Soft CTA (simpan video ini)'
  | 'Price / value CTA'
  | 'Scarcity (hanya jika stok valid)'
  | 'Deadline (hanya jika batas waktu valid)';

export type SellingIntensity = 'Soft' | 'Balanced' | 'Direct';

export type PronounType = 'aku/saya' | 'kamu' | 'netral';

export interface GenerationConfig {
  scriptCount: number; // 1-10, default 3
  durationSeconds: ScriptDuration; // default 30
  style: DeliveryStyle;
  audiencePersona: string;
  angleMode: 'auto' | 'manual';
  selectedAngles: string[];
  hookType: HookType;
  demoMethod: DemoMethod;
  ctaType: CtaType;
  sellingIntensity: SellingIntensity;
  priceAnchoringEnabled: boolean;
  urgencyEnabled: boolean;
  pronouns: PronounType;
  extraInstructions?: string;
}

export interface ScriptSegment {
  timeRange: string; // e.g. "0-3 detik"
  segmentName: 'HOOK' | 'PROBLEM' | 'DEMO' | 'VALUE' | 'CTA' | string;
  visualDirection: string;
  spokenDialogue: string;
  overlayText: string;
  strategyNote: string;
}

export interface ScriptItem {
  id: string;
  title: string;
  angle: string;
  persona: string;
  differentiator: string;
  hookType: string;
  triggers: string[];
  estimatedDurationSeconds: number;
  spokenWordCount: number;
  durationStatus: 'ok' | 'short' | 'long';
  segments: ScriptSegment[];
  voiceoverOnly: string;
  qualityChecklist: string[];
  warnings: string[];
}

export interface ExtractProductRequest {
  inputMode?: 'mixed' | 'images' | 'url' | 'text';
  textDescription?: string;
  productUrl?: string;
  images?: Array<{
    name: string;
    mimeType: string;
    base64Data: string;
    size: number;
  }>;
}

export interface ExtractProductResponse {
  productBrief: ProductBrief;
  platform?: string;
  inputMode?: 'mixed' | 'images' | 'url' | 'text';
  extractedFromUrl?: boolean;
  extractedFromImages?: number;
  sourceNotes?: string;
  conflictsFound?: string[];
  warning?: string;
}

export interface GenerateScriptsRequest {
  productBrief: ProductBrief;
  config: GenerationConfig;
}

export interface GenerateScriptsResponse {
  productBrief: ProductBrief;
  scripts: ScriptItem[];
}

export interface RefineScriptRequest {
  script: ScriptItem;
  productBrief: ProductBrief;
  config: GenerationConfig;
  refinementType:
    | 'hook_stronger'
    | 'more_natural'
    | 'softer_selling'
    | 'more_concise'
    | 'clearer_cta'
    | 'change_angle'
    | 'custom';
  customInstruction?: string;
}

export interface RefineScriptResponse {
  script: ScriptItem;
}

export interface HistorySession {
  id: string;
  timestamp: number;
  productName: string;
  category: string;
  scriptCount: number;
  durationSeconds: number;
  productBrief: ProductBrief;
  config: GenerationConfig;
  scripts: ScriptItem[];
}

