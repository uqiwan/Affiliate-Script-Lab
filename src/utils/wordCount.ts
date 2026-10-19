/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DURATION_WORD_TARGETS } from './constants.ts';
import type { ScriptDuration } from '../types/index.ts';

/**
 * Counts spoken words in a narrative dialogue string.
 * Filters out punctuation and whitespace. Only dialogue words are counted.
 */
export function countWords(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  // Remove markdown tags, stage directions in brackets [B-Roll], (pause), etc.
  const cleaned = text
    .replace(/\[.*?\]/g, ' ')
    .replace(/\(.*?\)/g, ' ')
    .replace(/[\r\n\t]/g, ' ')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'–—]/g, ' ')
    .trim();

  if (!cleaned) return 0;
  const words = cleaned.split(/\s+/).filter((w) => w.length > 0);
  return words.length;
}

/**
 * Evaluates duration status against target word count.
 */
export function evaluateDurationStatus(
  wordCount: number,
  duration: ScriptDuration
): {
  status: 'ok' | 'short' | 'long';
  targetMin: number;
  targetMax: number;
  message: string;
} {
  const target = DURATION_WORD_TARGETS[duration] || DURATION_WORD_TARGETS[30];
  const toleranceLower = Math.floor(target.min * 0.9);
  const toleranceUpper = Math.ceil(target.max * 1.1);

  if (wordCount < toleranceLower) {
    return {
      status: 'short',
      targetMin: target.min,
      targetMax: target.max,
      message: `Perlu diperpanjang (${wordCount} kata vs target ${target.min}–${target.max} kata)`,
    };
  }

  if (wordCount > toleranceUpper) {
    return {
      status: 'long',
      targetMin: target.min,
      targetMax: target.max,
      message: `Perlu dipersingkat (${wordCount} kata vs target ${target.min}–${target.max} kata)`,
    };
  }

  return {
    status: 'ok',
    targetMin: target.min,
    targetMax: target.max,
    message: `Optimal (${wordCount} kata, target ${target.min}–${target.max} kata)`,
  };
}
