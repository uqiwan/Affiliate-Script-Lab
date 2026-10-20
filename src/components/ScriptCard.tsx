/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Copy,
  RotateCcw,
  Sparkles,
  Layers,
  Eye,
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  MonitorPlay,
  PictureInPicture2,
  Zap,
  Feather,
  Scissors,
  Target,
  RefreshCw,
} from 'lucide-react';
import { ScriptItem } from '../types';
import { formatScriptAsText } from '../utils/exportTxt';

interface ScriptCardProps {
  script: ScriptItem;
  index: number;
  totalScripts: number;
  showVisualDetails?: boolean;
  onToggleVisualDetails?: () => void;
  // Backwards compatibility
  isVoiceoverOnly?: boolean;
  onToggleVoiceoverOnly?: () => void;
  onCopyText: (text: string, label: string) => void;
  onRegenerate: (script: ScriptItem) => void;
  onRefine: (script: ScriptItem, refinementType: any, customInstruction?: string) => void;
  isRefining: boolean;
  onOpenPrompter?: (script: ScriptItem, index: number) => void;
  onOpenFloatingPrompter?: (script: ScriptItem, index: number) => void;
}

function cleanDialogueText(text: string): string {
  let cleaned = text.trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith('“') && cleaned.endsWith('”'))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

export const ScriptCard: React.FC<ScriptCardProps> = ({
  script,
  index,
  totalScripts,
  showVisualDetails,
  onToggleVisualDetails,
  isVoiceoverOnly,
  onToggleVoiceoverOnly,
  onCopyText,
  onRegenerate,
  onRefine,
  isRefining,
  onOpenPrompter,
  onOpenFloatingPrompter,
}) => {
  const [showConceptInfo, setShowConceptInfo] = useState<boolean>(false);
  const [internalShowVisual, setInternalShowVisual] = useState<boolean>(false);
  const [showRefineMenu, setShowRefineMenu] = useState<boolean>(false);
  const [selectedRefinement, setSelectedRefinement] = useState<string | null>(null);
  const [customRefineText, setCustomRefineText] = useState<string>('');

  // Determine whether visual details are expanded
  const currentShowVisual =
    showVisualDetails !== undefined
      ? showVisualDetails
      : isVoiceoverOnly !== undefined
      ? !isVoiceoverOnly
      : internalShowVisual;

  const handleToggleVisual = () => {
    if (onToggleVisualDetails) {
      onToggleVisualDetails();
    } else if (onToggleVoiceoverOnly) {
      onToggleVoiceoverOnly();
    } else {
      setInternalShowVisual(!internalShowVisual);
    }
  };

  // Ambil setiap bagian dialog dari segmen skrip agar tampil pada paragraf berbeda tanpa label keterangan
  const scriptParagraphs: string[] = useMemo(() => {
    if (script.segments && script.segments.length > 0) {
      const segDialogues = script.segments
        .map((seg) => (seg.spokenDialogue ? cleanDialogueText(seg.spokenDialogue) : ''))
        .filter(Boolean);
      if (segDialogues.length > 0) {
        return segDialogues;
      }
    }
    if (script.voiceoverOnly) {
      return script.voiceoverOnly
        .split('\n')
        .map((p) => cleanDialogueText(p))
        .filter(Boolean);
    }
    return [];
  }, [script]);

  const handleCopyFull = () => {
    const text = formatScriptAsText(script, index);
    onCopyText(text, `Skrip Konsep #${index + 1}`);
  };

  const handleCopyVoiceover = () => {
    const textToCopy = scriptParagraphs.join('\n\n');
    onCopyText(textToCopy, `Narasi Konsep #${index + 1}`);
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
    <div className="bg-white dark:bg-[#1C1C1E] rounded-[22px] border border-[#E5E5EA] dark:border-[#38383A] shadow-xs overflow-hidden transition-all">
      {/* Header Bar: Rata Kiri Konsep + Info Button, Rata Kanan Tombol Narasi & Skrip */}
      <div className="p-3 sm:p-3.5 border-b border-[#F2F2F7] dark:border-[#2C2C2E] bg-[#F2F2F7]/50 dark:bg-[#2C2C2E]/30 flex flex-wrap items-center justify-between gap-2.5">
        {/* Rata Kiri: Judul Konsep + Tombol Info */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="h-8 px-3 rounded-[10px] text-xs font-bold bg-[#1C1C1E] dark:bg-white text-white dark:text-[#1C1C1E] flex items-center shrink-0">
            Konsep #{index + 1}
          </span>

          <button
            type="button"
            onClick={() => setShowConceptInfo(!showConceptInfo)}
            className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-[10px] text-xs font-semibold transition-all cursor-pointer ${
              showConceptInfo
                ? 'bg-[#007AFF] text-white shadow-xs'
                : 'bg-white dark:bg-[#2C2C2E] text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white border border-black/5 dark:border-white/10'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Info</span>
            {showConceptInfo ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Rata Kanan Sejajar: Tombol Narasi, Skrip, Prompter & Melayang */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyVoiceover}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2C2C2E] hover:bg-[#F2F2F7] dark:hover:bg-[#38383A] text-[#1C1C1E] dark:text-white transition-all cursor-pointer border border-black/5 dark:border-white/10 active:scale-95"
            title="Salin teks narasi suara saja"
          >
            <Copy className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>Narasi</span>
          </button>

          <button
            type="button"
            onClick={handleCopyFull}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-[10px] text-xs font-semibold bg-white dark:bg-[#2C2C2E] hover:bg-[#F2F2F7] dark:hover:bg-[#38383A] text-[#1C1C1E] dark:text-white transition-all cursor-pointer border border-black/5 dark:border-white/10 active:scale-95"
            title="Salin skrip visual + narasi lengkap"
          >
            <Copy className="w-3.5 h-3.5 text-[#5856D6]" />
            <span>Skrip</span>
          </button>

          {onOpenPrompter && (
            <button
              type="button"
              onClick={() => onOpenPrompter(script, index)}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-[10px] text-xs font-semibold bg-[#FF9500] hover:bg-[#F28B00] text-white shadow-xs transition-all cursor-pointer active:scale-95"
              title={`Buka Layar Teleprompter khusus Konsep #${index + 1}`}
            >
              <MonitorPlay className="w-3.5 h-3.5" />
              <span>Prompter</span>
            </button>
          )}

          {onOpenFloatingPrompter && (
            <button
              type="button"
              onClick={() => onOpenFloatingPrompter(script, index)}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-[10px] text-xs font-semibold bg-[#FF9500]/15 hover:bg-[#FF9500]/25 text-[#FF9500] transition-all cursor-pointer active:scale-95"
              title={`Buka Mode Melayang (Floating Widget) khusus Konsep #${index + 1}`}
            >
              <PictureInPicture2 className="w-3.5 h-3.5 text-[#FF9500]" />
              <span className="hidden sm:inline">Melayang</span>
            </button>
          )}
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

      {/* Konten Utama Skrip: Ditulis langsung pada kotak luar, tanpa kotak dalam, teks lebih lega */}
      <div className="p-4 sm:p-6 space-y-5">
        {/* Paragraf Skrip: Setiap bagian ditulis pada paragraf berbeda tanpa keterangan label */}
        <div className="space-y-4 sm:space-y-5">
          {scriptParagraphs.map((paragraph, pIdx) => (
            <p
              key={pIdx}
              className="text-zinc-800 text-base sm:text-[17px] leading-relaxed sm:leading-loose font-normal selection:bg-emerald-100"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Panel Arahan Visual B-Roll & Safe Zone (Bila Diaktifkan Pengguna) */}
        {currentShowVisual && (
          <div className="pt-4 border-t border-zinc-100 space-y-3">
            <h5 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>Arahan Visual B-Roll & Safe Zone per Bagian</span>
            </h5>
            <div className="space-y-2.5">
              {script.segments.map((seg, sIdx) => (
                <div
                  key={sIdx}
                  className="p-3 rounded-xl bg-zinc-50/80 border border-zinc-200 text-xs text-zinc-700 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-600">
                    <span className="font-mono bg-zinc-200/80 px-2 py-0.5 rounded text-zinc-700">
                      Bagian {sIdx + 1} ({seg.timeRange})
                    </span>
                    {seg.overlayText && (
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-semibold">
                        Overlay: {seg.overlayText}
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-600 text-xs leading-normal">
                    {seg.visualDirection}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Area: Toggle Arahan Visual + Sempurnakan Skrip */}
        <div className="pt-3.5 flex flex-wrap items-center justify-between gap-2.5 border-t border-[#F2F2F7] dark:border-[#2C2C2E]">
          <button
            type="button"
            onClick={handleToggleVisual}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[10px] text-xs font-semibold text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#8E8E93]" />
            <span>{currentShowVisual ? 'Sembunyikan Visual' : 'Lihat Arahan Visual'}</span>
            {currentShowVisual ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            type="button"
            onClick={() => setShowRefineMenu(!showRefineMenu)}
            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-[10px] text-xs font-semibold transition-colors cursor-pointer ${
              showRefineMenu
                ? 'bg-[#34C759] text-white shadow-xs'
                : 'text-[#1C1C1E] dark:text-white bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sempurnakan Skrip</span>
            {showRefineMenu ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Panel Sempurnakan Skrip */}
        {showRefineMenu && (
          <div className="p-3.5 sm:p-4 bg-[#F2F2F7]/60 dark:bg-[#2C2C2E]/40 rounded-[16px] border border-[#E5E5EA] dark:border-[#38383A] space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#1C1C1E] dark:text-white">
                Pilih opsi penyesuaian:
              </span>
              <button
                type="button"
                onClick={() => onRegenerate(script)}
                disabled={isRefining}
                className="text-xs font-semibold text-[#007AFF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Buat Ulang
              </button>
            </div>

            {/* Pilihan Refinement dengan Ikon Minimalis */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'hook_stronger', label: 'Hook Lebih Kuat', icon: Zap },
                { id: 'more_natural', label: 'Lebih Natural', icon: Feather },
                { id: 'softer_selling', label: 'Lebih Soft Selling', icon: Sparkles },
                { id: 'more_concise', label: 'Lebih Ringkas', icon: Scissors },
                { id: 'clearer_cta', label: 'CTA Lebih Jelas', icon: Target },
                { id: 'change_angle', label: 'Ganti Angle', icon: RefreshCw },
              ].map((opt) => {
                const isSelected = selectedRefinement === opt.id;
                const IconComp = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isRefining}
                    onClick={() =>
                      setSelectedRefinement(isSelected ? null : opt.id)
                    }
                    className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-[8px] text-xs font-semibold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#34C759] text-white border-[#34C759] shadow-xs'
                        : 'bg-white dark:bg-[#1C1C1E] text-[#1C1C1E] dark:text-white hover:bg-[#F2F2F7] dark:hover:bg-[#38383A] border-black/5 dark:border-white/10'
                    }`}
                  >
                    <IconComp className="w-3 h-3" />
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                  </button>
                );
              })}
            </div>

            {/* Input Instruksi Kustom + Tombol Terapkan */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={customRefineText}
                onChange={(e) => setCustomRefineText(e.target.value)}
                placeholder="Atau tuliskan instruksi khusus (misal: tekankan harga promo)..."
                disabled={isRefining}
                className="flex-1 h-9 px-3 text-xs rounded-[10px] border border-[#E5E5EA] dark:border-[#38383A] bg-white dark:bg-[#1C1C1E] text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
              />

              <button
                type="button"
                disabled={isRefining || !canApplyRefine}
                onClick={handleApplyRefine}
                className={`h-9 px-3.5 rounded-[10px] text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                  isRefining || !canApplyRefine
                    ? 'bg-black/5 dark:bg-white/10 text-[#8E8E93] cursor-not-allowed'
                    : 'bg-[#34C759] hover:bg-[#30B753] text-white shadow-xs cursor-pointer active:scale-95'
                }`}
              >
                {isRefining ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Menerapkan...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
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
