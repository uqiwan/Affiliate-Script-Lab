/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  Clock,
  Mic,
  Eye,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sliders,
} from 'lucide-react';
import { ScriptItem, ScriptSegment } from '../types';
import { formatScriptAsText } from '../utils/exportTxt';

interface ScriptCardProps {
  script: ScriptItem;
  index: number;
  totalScripts: number;
  onCopyText: (text: string, label: string) => void;
  onRegenerate: (script: ScriptItem) => void;
  onRefine: (script: ScriptItem, refinementType: any, customInstruction?: string) => void;
  isRefining: boolean;
}

export const ScriptCard: React.FC<ScriptCardProps> = ({
  script,
  index,
  totalScripts,
  onCopyText,
  onRegenerate,
  onRefine,
  isRefining,
}) => {
  const [showVoiceoverOnly, setShowVoiceoverOnly] = useState<boolean>(false);
  const [showRefineMenu, setShowRefineMenu] = useState<boolean>(false);
  const [customRefineText, setCustomRefineText] = useState<string>('');

  const handleCopyFull = () => {
    const text = formatScriptAsText(script, index);
    onCopyText(text, `Skrip Konsep #${index + 1}`);
  };

  const handleCopyVoiceover = () => {
    onCopyText(script.voiceoverOnly, `Narasi Konsep #${index + 1}`);
  };

  const getStatusBadge = () => {
    if (script.durationStatus === 'ok') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
          <CheckCircle2 className="w-3 h-3" />
          {script.spokenWordCount} kata (Optimal)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
        <AlertCircle className="w-3 h-3" />
        {script.spokenWordCount} kata ({script.durationStatus === 'short' ? 'Kurang panjang' : 'Terlalu panjang'})
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden transition-all hover:shadow-md">
      {/* Top Banner & Title */}
      <div className="p-4 sm:p-5 border-b border-zinc-100 bg-zinc-50/40">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1 min-w-[240px]">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-900 text-white">
                Konsep #{index + 1} of {totalScripts}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                <Layers className="w-3 h-3" />
                {script.angle}
              </span>
              {getStatusBadge()}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
              {script.title}
            </h3>

            <p className="text-xs text-zinc-500 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>🎯 <strong>Persona:</strong> {script.persona}</span>
              <span>⚡ <strong>Hook:</strong> {script.hookType}</span>
              <span>⏱️ <strong>Target:</strong> {script.estimatedDurationSeconds} detik</span>
            </p>

            <p className="text-xs text-emerald-800 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
              💡 <strong>Pembeda Konsep:</strong> {script.differentiator}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyVoiceover}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Salin narasi dialog saja untuk dibaca"
            >
              <Mic className="w-3.5 h-3.5 text-emerald-600" />
              <span>Salin Narasi</span>
            </button>

            <button
              type="button"
              onClick={handleCopyFull}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="Salin seluruh skrip lengkap (arahan visual, dialog, overlay)"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin Skrip</span>
            </button>
          </div>
        </div>

        {/* Triggers Bar */}
        {script.triggers && script.triggers.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-zinc-400 font-semibold uppercase">Pemicu Konten:</span>
            {script.triggers.map((trig, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-medium"
              >
                {trig}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Content: Segments */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Toggle Voiceover vs Full Table */}
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            Struktur Segmen Siap Rekam
          </h4>

          <button
            type="button"
            onClick={() => setShowVoiceoverOnly(!showVoiceoverOnly)}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium underline cursor-pointer"
          >
            {showVoiceoverOnly ? 'Tampilkan Rincian B-Roll' : 'Tampilkan Narasi Saja'}
          </button>
        </div>

        {showVoiceoverOnly ? (
          /* Narasi Saja View */
          <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-500 font-medium pb-2 border-b border-zinc-200">
              <span className="flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-emerald-600" />
                Naskah Suara (Voiceover / Baca Langsung)
              </span>
              <span>{script.spokenWordCount} kata</span>
            </div>
            <p className="text-sm font-medium text-zinc-800 leading-relaxed whitespace-pre-line">
              {script.voiceoverOnly}
            </p>
          </div>
        ) : (
          /* Structured Segments List */
          <div className="space-y-2.5">
            {/* Desktop Table View (hidden on small screens) */}
            <div className="hidden md:block overflow-x-auto border border-zinc-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold">
                    <th className="py-2.5 px-3 w-28">Detik / Segmen</th>
                    <th className="py-2.5 px-3 w-1/3">Aksi Visual & B-Roll</th>
                    <th className="py-2.5 px-3 w-1/3">Dialog Narasi Verbal</th>
                    <th className="py-2.5 px-3">Teks Overlay (Safe Zone)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {script.segments.map((seg, sIdx) => (
                    <tr key={sIdx} className="hover:bg-zinc-50/50">
                      <td className="py-2.5 px-3 align-top font-medium">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-800 mb-1">
                          {seg.timeRange}
                        </span>
                        <div className="text-[11px] font-bold text-emerald-700">
                          {seg.segmentName}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 align-top text-zinc-700 leading-relaxed">
                        <div className="flex items-start gap-1">
                          <Eye className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                          <span>{seg.visualDirection}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 align-top font-medium text-zinc-900 leading-relaxed">
                        "{seg.spokenDialogue}"
                        {seg.strategyNote && (
                          <p className="text-[10px] text-zinc-400 mt-1 italic">
                            Strategi: {seg.strategyNote}
                          </p>
                        )}
                      </td>
                      <td className="py-2.5 px-3 align-top">
                        {seg.overlayText ? (
                          <span className="inline-block px-2 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-semibold leading-tight">
                            {seg.overlayText}
                          </span>
                        ) : (
                          <span className="text-zinc-400 text-[11px]">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (displayed on < md screens) */}
            <div className="md:hidden space-y-2">
              {script.segments.map((seg, sIdx) => (
                <div
                  key={sIdx}
                  className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-zinc-200/60 pb-1.5">
                    <span className="font-bold text-emerald-800">{seg.segmentName}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-200 text-zinc-700">
                      {seg.timeRange}
                    </span>
                  </div>

                  {/* Narasi */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase">
                      Dialog Narasi:
                    </span>
                    <p className="font-medium text-zinc-900 leading-relaxed">
                      "{seg.spokenDialogue}"
                    </p>
                  </div>

                  {/* B-Roll */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase">
                      Visual / B-Roll:
                    </span>
                    <p className="text-zinc-600 leading-relaxed flex items-start gap-1">
                      <Eye className="w-3 h-3 text-zinc-400 shrink-0 mt-0.5" />
                      <span>{seg.visualDirection}</span>
                    </p>
                  </div>

                  {/* Overlay */}
                  {seg.overlayText && (
                    <div className="space-y-0.5 pt-0.5">
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase">
                        Overlay Safe Zone:
                      </span>
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[11px] font-bold">
                          {seg.overlayText}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quality Checklist & Warnings */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
            {script.qualityChecklist?.map((checkItem, cIdx) => (
              <span key={cIdx} className="inline-flex items-center gap-1 text-emerald-700">
                <Check className="w-3 h-3" /> {checkItem}
              </span>
            ))}
          </div>

          {/* Quick Refine Toggle */}
          <button
            type="button"
            onClick={() => setShowRefineMenu(!showRefineMenu)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-zinc-700 hover:text-emerald-700 bg-zinc-100 hover:bg-emerald-50 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Sempurnakan Skrip Ini</span>
            {showRefineMenu ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Expandable Refinement Panel */}
        {showRefineMenu && (
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-800">
                Pilih Refinement Cepat (Fakta Produk Tetap Terjaga):
              </span>
              <button
                type="button"
                onClick={() => onRegenerate(script)}
                disabled={isRefining}
                className="text-xs font-semibold text-zinc-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Buat Ulang Konsep Ini
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                disabled={isRefining}
                onClick={() => onRefine(script, 'hook_stronger')}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-zinc-200 hover:border-emerald-500 hover:bg-emerald-50 text-zinc-700 cursor-pointer"
              >
                ⚡ Hook Lebih Kuat
              </button>
              <button
                type="button"
                disabled={isRefining}
                onClick={() => onRefine(script, 'more_natural')}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-zinc-200 hover:border-emerald-500 hover:bg-emerald-50 text-zinc-700 cursor-pointer"
              >
                🌿 Lebih Natural
              </button>
              <button
                type="button"
                disabled={isRefining}
                onClick={() => onRefine(script, 'softer_selling')}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-zinc-200 hover:border-emerald-500 hover:bg-emerald-50 text-zinc-700 cursor-pointer"
              >
                🍃 Lebih Soft Selling
              </button>
              <button
                type="button"
                disabled={isRefining}
                onClick={() => onRefine(script, 'more_concise')}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-zinc-200 hover:border-emerald-500 hover:bg-emerald-50 text-zinc-700 cursor-pointer"
              >
                ✂️ Lebih Ringkas
              </button>
              <button
                type="button"
                disabled={isRefining}
                onClick={() => onRefine(script, 'clearer_cta')}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-zinc-200 hover:border-emerald-500 hover:bg-emerald-50 text-zinc-700 cursor-pointer"
              >
                🎯 CTA Lebih Jelas
              </button>
              <button
                type="button"
                disabled={isRefining}
                onClick={() => onRefine(script, 'change_angle')}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-zinc-200 hover:border-emerald-500 hover:bg-emerald-50 text-zinc-700 cursor-pointer"
              >
                🔄 Ganti Angle
              </button>
            </div>

            {/* Custom Instruction Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customRefineText}
                onChange={(e) => setCustomRefineText(e.target.value)}
                placeholder="Instruksi spesifik (cth: Tambahkan penekanan pada ketahanan baterai)..."
                disabled={isRefining}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white"
              />
              <button
                type="button"
                disabled={isRefining || !customRefineText.trim()}
                onClick={() => {
                  onRefine(script, 'custom', customRefineText.trim());
                  setCustomRefineText('');
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-zinc-200 disabled:text-zinc-400 cursor-pointer shrink-0"
              >
                {isRefining ? 'Memproses...' : 'Terapkan'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
