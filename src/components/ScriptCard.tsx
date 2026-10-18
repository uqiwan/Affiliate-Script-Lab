/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Copy,
  RotateCcw,
  Sparkles,
  Layers,
  Eye,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Info,
  Check,
} from 'lucide-react';
import { ScriptItem } from '../types';
import { formatScriptAsText } from '../utils/exportTxt';

interface ScriptCardProps {
  script: ScriptItem;
  index: number;
  totalScripts: number;
  isVoiceoverOnly?: boolean;
  onToggleVoiceoverOnly?: () => void;
  onCopyText: (text: string, label: string) => void;
  onRegenerate: (script: ScriptItem) => void;
  onRefine: (script: ScriptItem, refinementType: any, customInstruction?: string) => void;
  isRefining: boolean;
}

export const ScriptCard: React.FC<ScriptCardProps> = ({
  script,
  index,
  totalScripts,
  isVoiceoverOnly,
  onToggleVoiceoverOnly,
  onCopyText,
  onRegenerate,
  onRefine,
  isRefining,
}) => {
  const [showConceptInfo, setShowConceptInfo] = useState<boolean>(false);
  const [internalVoiceoverOnly, setInternalVoiceoverOnly] = useState<boolean>(false);
  const [showRefineMenu, setShowRefineMenu] = useState<boolean>(false);
  const [selectedRefinement, setSelectedRefinement] = useState<string | null>(null);
  const [customRefineText, setCustomRefineText] = useState<string>('');

  const currentIsVoiceover =
    isVoiceoverOnly !== undefined ? isVoiceoverOnly : internalVoiceoverOnly;

  const handleToggleVoiceover = () => {
    if (onToggleVoiceoverOnly) {
      onToggleVoiceoverOnly();
    } else {
      setInternalVoiceoverOnly(!internalVoiceoverOnly);
    }
  };

  const handleCopyFull = () => {
    const text = formatScriptAsText(script, index);
    onCopyText(text, `Skrip Konsep #${index + 1}`);
  };

  const handleCopyVoiceover = () => {
    onCopyText(script.voiceoverOnly, `Narasi Konsep #${index + 1}`);
  };

  const handleApplyRefine = () => {
    if (!selectedRefinement && !customRefineText.trim()) return;
    const refType = selectedRefinement || 'custom';
    onRefine(script, refType, customRefineText.trim() || undefined);
    setSelectedRefinement(null);
    setCustomRefineText('');
  };

  const canApplyRefine = Boolean(selectedRefinement || customRefineText.trim());

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden transition-all hover:border-emerald-200">
      {/* Header Bar: Rata Kiri Konsep + Info Button, Rata Kanan Tombol Narasi & Skrip */}
      <div className="p-3.5 sm:p-4 border-b border-zinc-100 bg-zinc-50/60 flex flex-wrap items-center justify-between gap-2.5">
        {/* Rata Kiri: Judul Konsep + Tombol Info */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-zinc-900 text-white shrink-0">
            Konsep #{index + 1}
          </span>

          <button
            type="button"
            onClick={() => setShowConceptInfo(!showConceptInfo)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              showConceptInfo
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border-zinc-200'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-emerald-600" />
            <span>Info tentang Konsep {index + 1}</span>
            {showConceptInfo ? (
              <ChevronUp className="w-3 h-3 text-zinc-400" />
            ) : (
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            )}
          </button>
        </div>

        {/* Rata Kanan Sejajar: Tombol "Icon Salin + Narasi" & "Icon Salin + Skrip" (Warna Sama) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyVoiceover}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer shadow-2xs"
            title="Salin teks narasi suara saja"
          >
            <Copy className="w-3.5 h-3.5 text-zinc-500" />
            <span>Narasi</span>
          </button>

          <button
            type="button"
            onClick={handleCopyFull}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer shadow-2xs"
            title="Salin skrip visual + narasi lengkap"
          >
            <Copy className="w-3.5 h-3.5 text-zinc-500" />
            <span>Skrip</span>
          </button>
        </div>
      </div>

      {/* Tersembunyi: Informasi Metadata Konsep (Hanya Muncul jika Tombol Info Diklik) */}
      {showConceptInfo && (
        <div className="p-3.5 sm:p-4 bg-emerald-50/30 border-b border-emerald-100/60 space-y-2 animate-in fade-in duration-150 text-xs text-zinc-700">
          <div className="flex flex-wrap items-center gap-2 pb-1.5 border-b border-emerald-100">
            <span className="font-bold text-zinc-900 text-sm">{script.title}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
              <Layers className="w-3 h-3" />
              {script.angle}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              {script.spokenWordCount} kata ({script.durationStatus === 'ok' ? 'Optimal' : script.durationStatus})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-600">
            <div><strong>🎯 Target Persona:</strong> {script.persona}</div>
            <div><strong>⚡ Tipe Hook:</strong> {script.hookType}</div>
            <div><strong>⏱️ Estimasi Durasi:</strong> {script.estimatedDurationSeconds} detik</div>
            <div><strong>💡 Pembeda Konsep:</strong> {script.differentiator}</div>
          </div>

          {script.triggers && script.triggers.length > 0 && (
            <div className="pt-1 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">Pemicu Konten:</span>
              {script.triggers.map((trig, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-white text-zinc-700 border border-zinc-200 font-medium"
                >
                  {trig}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Konten Utama: Struktur Siap Rekam (Langsung Tampil di Bawah Menu Konsep) */}
      <div className="p-3.5 sm:p-5 space-y-3.5">
        {/* Toggle Mode: Segmen Visual vs Narasi Saja */}
        <div className="flex items-center justify-between pb-1">
          <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            STRUKTUR SIAP REKAM
          </h4>

          <button
            type="button"
            onClick={handleToggleVoiceover}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold underline cursor-pointer"
          >
            {currentIsVoiceover ? 'Tampilkan Visual Lengkap' : 'Lihat Narasi Saja'}
          </button>
        </div>

        {/* View Mode 1: Narasi Suara Saja */}
        {currentIsVoiceover ? (
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-700">Teks Naskah Suara (Siap Dibaca):</span>
              <span className="text-xs font-mono text-zinc-500">{script.spokenWordCount} kata</span>
            </div>
            <p className="text-sm font-medium text-zinc-900 leading-relaxed italic bg-white p-3 rounded-lg border border-zinc-200">
              "{script.voiceoverOnly}"
            </p>
          </div>
        ) : (
          /* View Mode 2: Segmen B-Roll + Dialog Lengkap */
          <div className="space-y-2.5">
            {script.segments.map((seg, sIdx) => (
              <div
                key={sIdx}
                className="p-3 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 transition-colors space-y-2"
              >
                {/* Segment Header */}
                <div className="flex items-center justify-between text-xs pb-1.5 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-zinc-100 text-zinc-700">
                      {seg.timeRange}
                    </span>
                    <span className="font-bold text-zinc-900 text-xs">
                      {seg.segmentName}
                    </span>
                  </div>
                  {seg.strategyNote && (
                    <span className="text-[10px] text-zinc-400 italic hidden sm:inline">
                      {seg.strategyNote}
                    </span>
                  )}
                </div>

                {/* Dialog Narasi Lisan */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Dialog Narasi:
                  </span>
                  <p className="font-semibold text-zinc-900 text-xs sm:text-sm leading-relaxed">
                    "{seg.spokenDialogue}"
                  </p>
                </div>

                {/* Visual / B-Roll */}
                <div className="space-y-0.5 text-xs">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Visual / B-Roll:
                  </span>
                  <p className="text-zinc-600 leading-relaxed flex items-start gap-1.5 text-xs">
                    <Eye className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <span>{seg.visualDirection}</span>
                  </p>
                </div>

                {/* Overlay Text Safe Zone if any */}
                {seg.overlayText && (
                  <div className="pt-1 flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider shrink-0">
                      Overlay:
                    </span>
                    <span className="inline-block px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-bold">
                      {seg.overlayText}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer Area: Sempurnakan Skrip Ini */}
        <div className="pt-2 flex items-center justify-between border-t border-zinc-100">
          <button
            type="button"
            onClick={() => setShowRefineMenu(!showRefineMenu)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-700 hover:text-emerald-700 bg-zinc-100 hover:bg-emerald-50 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sempurnakan Skrip Ini</span>
            {showRefineMenu ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Panel Sempurnakan Skrip: Tidak langsung memproses sebelum tombol Terapkan diklik */}
        {showRefineMenu && (
          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-800">
                Pilih Jenis Penyesuaian (Klik salah satu, lalu tekan Terapkan):
              </span>
              <button
                type="button"
                onClick={() => onRegenerate(script)}
                disabled={isRefining}
                className="text-xs font-semibold text-zinc-500 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Buat Ulang Konsep Ini
              </button>
            </div>

            {/* Pilihan Refinement: Saat diklik hanya memilih (highlight), tidak langsung mengeksekusi */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'hook_stronger', label: '⚡ Hook Lebih Kuat' },
                { id: 'more_natural', label: '🌿 Lebih Natural' },
                { id: 'softer_selling', label: '🍃 Lebih Soft Selling' },
                { id: 'more_concise', label: '✂️ Lebih Ringkas' },
                { id: 'clearer_cta', label: '🎯 CTA Lebih Jelas' },
                { id: 'change_angle', label: '🔄 Ganti Angle' },
              ].map((opt) => {
                const isSelected = selectedRefinement === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isRefining}
                    onClick={() =>
                      setSelectedRefinement(isSelected ? null : opt.id)
                    }
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-zinc-700 hover:bg-zinc-100 border-zinc-200'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3 h-3 ml-1 inline" />}
                  </button>
                );
              })}
            </div>

            {/* Input Instruksi Kustom + Tombol Terapkan */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={customRefineText}
                onChange={(e) => setCustomRefineText(e.target.value)}
                placeholder="Atau tuliskan instruksi khusus (misal: tekankan harga hemat)..."
                disabled={isRefining}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />

              <button
                type="button"
                disabled={isRefining || !canApplyRefine}
                onClick={handleApplyRefine}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  isRefining || !canApplyRefine
                    ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed border border-zinc-300/60'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer ring-2 ring-emerald-500/30'
                }`}
              >
                {isRefining ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Menerapkan...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Terapkan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
