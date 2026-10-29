/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
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
  Pencil,
  X,
  Plus,
  Trash2,
  FileText,
  Clock,
  Wand2,
} from 'lucide-react';
import { ScriptItem, ScriptSegment } from '../types';
import { formatScriptAsText } from '../utils/exportTxt';
import { countWords, evaluateDurationStatus } from '../utils/wordCount';
import { sanitizeCrossPlatformText } from '../services/directGeminiService';

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
  onUpdateScript?: (updatedScript: ScriptItem) => void;
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
  onUpdateScript,
}) => {
  const [showConceptInfo, setShowConceptInfo] = useState<boolean>(false);
  const [internalShowVisual, setInternalShowVisual] = useState<boolean>(false);
  const [showRefineMenu, setShowRefineMenu] = useState<boolean>(false);
  const [selectedRefinement, setSelectedRefinement] = useState<string | null>(null);
  const [customRefineText, setCustomRefineText] = useState<string>('');

  // Manual Edit State
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTab, setEditTab] = useState<'voiceover' | 'segments'>('voiceover');
  const [editTitle, setEditTitle] = useState<string>(script.title);
  const [editPersona, setEditPersona] = useState<string>(script.persona || '');
  const [editVoiceover, setEditVoiceover] = useState<string>('');
  const [editSegments, setEditSegments] = useState<ScriptSegment[]>([]);

  // Sync edit buffers when script changes or edit mode opens
  useEffect(() => {
    setEditTitle(script.title);
    setEditPersona(script.persona || '');
    const initialVo =
      script.voiceoverOnly ||
      (script.segments && script.segments.length > 0
        ? script.segments.map((s) => s.spokenDialogue).filter(Boolean).join('\n\n')
        : '');
    setEditVoiceover(initialVo);
    setEditSegments(
      script.segments && script.segments.length > 0
        ? script.segments.map((s) => ({ ...s }))
        : [
            {
              timeRange: '0-3 detik',
              segmentName: 'HOOK',
              visualDirection: 'Tatap kamera santai memegang produk',
              spokenDialogue: initialVo,
              overlayText: 'Solusi Praktis',
              strategyNote: 'Scroll-stopping opening',
            },
          ]
    );
  }, [script, isEditing]);

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

  // Live word count and duration feedback during manual editing
  const currentEditWords = useMemo(() => {
    if (editTab === 'voiceover') {
      return countWords(editVoiceover);
    }
    const combined = editSegments.map((s) => s.spokenDialogue).filter(Boolean).join(' ');
    return countWords(combined);
  }, [editTab, editVoiceover, editSegments]);

  const liveDurationStatus = useMemo(() => {
    const durSec = (script.estimatedDurationSeconds || 30) as any;
    return evaluateDurationStatus(currentEditWords, durSec);
  }, [currentEditWords, script.estimatedDurationSeconds]);

  // Dialog paragraphs for normal view
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

  // Save manual edits
  const handleSaveEdit = () => {
    let finalVoiceover = '';
    let finalSegments: ScriptSegment[] = [];

    if (editTab === 'voiceover') {
      finalVoiceover = sanitizeCrossPlatformText(editVoiceover.trim());
      // Split into paragraphs for natural segment representation
      const paragraphs = finalVoiceover
        .split(/\n\s*\n|\n/)
        .map((p) => p.trim())
        .filter(Boolean);

      if (editSegments && editSegments.length > 0) {
        finalSegments = editSegments.map((seg, sIdx) => ({
          ...seg,
          spokenDialogue:
            paragraphs[sIdx] || (sIdx === 0 && paragraphs.length === 1 ? finalVoiceover : seg.spokenDialogue),
        }));
      } else {
        finalSegments = [
          {
            timeRange: `0-${script.estimatedDurationSeconds || 30}s`,
            segmentName: 'DIALOG',
            visualDirection: 'Tampilkan produk ke kamera smartphone',
            spokenDialogue: finalVoiceover,
            overlayText: '',
            strategyNote: 'Dialog hasil edit manual',
          },
        ];
      }
    } else {
      finalSegments = editSegments.map((s) => ({
        ...s,
        visualDirection: sanitizeCrossPlatformText(s.visualDirection),
        spokenDialogue: sanitizeCrossPlatformText(s.spokenDialogue),
        overlayText: sanitizeCrossPlatformText(s.overlayText),
        strategyNote: s.strategyNote || '',
      }));
      finalVoiceover = finalSegments.map((s) => s.spokenDialogue).filter(Boolean).join(' ');
    }

    const words = countWords(finalVoiceover);
    const evalStatus = evaluateDurationStatus(words, (script.estimatedDurationSeconds || 30) as any);

    const updatedScript: ScriptItem = {
      ...script,
      title: editTitle.trim() || script.title,
      persona: editPersona.trim() || script.persona,
      segments: finalSegments,
      voiceoverOnly: finalVoiceover,
      spokenWordCount: words,
      durationStatus: evalStatus.status,
    };

    if (onUpdateScript) {
      onUpdateScript(updatedScript);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(script.title);
    setEditPersona(script.persona || '');
    setEditVoiceover(
      script.voiceoverOnly ||
        (script.segments && script.segments.length > 0
          ? script.segments.map((s) => s.spokenDialogue).filter(Boolean).join('\n\n')
          : '')
    );
    setEditSegments(script.segments?.map((s) => ({ ...s })) || []);
    setIsEditing(false);
  };

  // Helper to add a new segment in edit mode
  const handleAddSegment = () => {
    setEditSegments((prev) => [
      ...prev,
      {
        timeRange: `${prev.length * 5}-${(prev.length + 1) * 5}s`,
        segmentName: prev.length === 0 ? 'HOOK' : 'BODY',
        visualDirection: 'Tunjukkan detail produk ke kamera',
        spokenDialogue: '',
        overlayText: '',
        strategyNote: '',
      },
    ]);
  };

  const handleRemoveSegment = (idx: number) => {
    if (editSegments.length <= 1) return;
    setEditSegments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateSegmentField = (
    idx: number,
    field: keyof ScriptSegment,
    value: string
  ) => {
    setEditSegments((prev) =>
      prev.map((seg, i) => (i === idx ? { ...seg, [field]: value } : seg))
    );
  };

  // Helper to auto-sanitize "keranjang kuning" into neutral CTA
  const handleSanitizeEditCta = () => {
    if (editTab === 'voiceover') {
      setEditVoiceover((prev) => sanitizeCrossPlatformText(prev));
    } else {
      setEditSegments((prev) =>
        prev.map((s) => ({
          ...s,
          spokenDialogue: sanitizeCrossPlatformText(s.spokenDialogue),
          overlayText: sanitizeCrossPlatformText(s.overlayText),
        }))
      );
    }
  };

  return (
    <div className={`bg-white dark:bg-[#1C1C1E] rounded-[22px] border transition-all overflow-hidden ${
      isEditing
        ? 'border-[#007AFF] shadow-md ring-2 ring-[#007AFF]/20'
        : 'border-[#E5E5EA] dark:border-[#38383A] shadow-xs'
    }`}>
      {/* Header Bar */}
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

        {/* Rata Kanan Sejajar: Tombol Edit Manual, Narasi, Skrip, Prompter & Melayang */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Tombol Edit Manual - Sangat Mudah Diakses di Pojok Atas */}
          <button
            type="button"
            onClick={() => {
              if (isEditing) {
                handleCancelEdit();
              } else {
                setIsEditing(true);
              }
            }}
            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-[10px] text-xs font-semibold transition-all cursor-pointer active:scale-95 border ${
              isEditing
                ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-xs'
                : 'bg-[#007AFF]/10 hover:bg-[#007AFF]/20 text-[#007AFF] border-[#007AFF]/30'
            }`}
            title="Edit manual hasil skrip ini"
          >
            {isEditing ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>Batal Edit</span>
              </>
            ) : (
              <>
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit</span>
              </>
            )}
          </button>

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

      {/* Tersembunyi: Informasi Metadata Konsep */}
      {showConceptInfo && (
        <div className="p-3.5 sm:p-4 bg-emerald-50/30 dark:bg-emerald-950/20 border-b border-emerald-100/60 dark:border-emerald-900/40 space-y-2 animate-in fade-in duration-150 text-xs text-zinc-700 dark:text-zinc-300">
          <div className="flex flex-wrap items-center gap-2 pb-1.5 border-b border-emerald-100 dark:border-emerald-900/40">
            <span className="font-bold text-zinc-900 dark:text-white text-sm">{script.title}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              <Layers className="w-3 h-3" />
              {script.angle}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
              {script.spokenWordCount} kata ({script.durationStatus === 'ok' ? 'Optimal' : script.durationStatus})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
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
                  className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-[#2C2C2E] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 font-medium"
                >
                  {trig}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Konten Area: Mode Edit Manual ATAU Mode Tampilan Normal */}
      {isEditing ? (
        /* MODE EDIT MANUAL */
        <div className="p-4 sm:p-5 bg-gradient-to-b from-[#007AFF]/[0.02] to-transparent space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E5E5EA] dark:border-[#2C2C2E]">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#007AFF] text-white text-xs font-bold shadow-xs">
                <Pencil className="w-3.5 h-3.5" />
                <span>Mode Edit Skrip #{index + 1}</span>
              </span>
              <span className="text-xs text-[#8E8E93] hidden sm:inline">
                Sesuaikan narasi dan arahan visual langsung
              </span>
            </div>

            {/* Tab Mode Edit: Narasi Cepat vs Per Segmen */}
            <div className="flex items-center bg-black/5 dark:bg-white/10 p-0.5 rounded-[10px]">
              <button
                type="button"
                onClick={() => setEditTab('voiceover')}
                className={`px-3 py-1 text-xs font-semibold rounded-[8px] transition-all cursor-pointer ${
                  editTab === 'voiceover'
                    ? 'bg-white dark:bg-[#2C2C2E] text-[#007AFF] shadow-xs'
                    : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                }`}
              >
                Narasi Lengkap
              </button>
              <button
                type="button"
                onClick={() => setEditTab('segments')}
                className={`px-3 py-1 text-xs font-semibold rounded-[8px] transition-all cursor-pointer ${
                  editTab === 'segments'
                    ? 'bg-white dark:bg-[#2C2C2E] text-[#007AFF] shadow-xs'
                    : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                }`}
              >
                Per Segmen Visual
              </button>
            </div>
          </div>

          {/* Form Judul Skrip */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Judul Konsep Skrip
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Contoh: Solusi Meja Sempit Tetap Terang..."
              className="w-full h-10 px-3 text-sm rounded-[10px] border border-[#E5E5EA] dark:border-[#38383A] bg-white dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
            />
          </div>

          {/* TAB 1: EDIT NARASI LENGKAP (CEPAT & FLEKSIBEL) */}
          {editTab === 'voiceover' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#007AFF]" />
                  <span>Teks Dialog & Narasi Suara (Bisa Diedit Bebas)</span>
                </label>
                <button
                  type="button"
                  onClick={handleSanitizeEditCta}
                  className="text-[11px] font-semibold text-[#007AFF] hover:underline flex items-center gap-1 cursor-pointer"
                  title="Otomatis ganti sebutan keranjang kuning menjadi netral multi-platform"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>Netralkan CTA</span>
                </button>
              </div>

              <textarea
                value={editVoiceover}
                onChange={(e) => setEditVoiceover(e.target.value)}
                rows={7}
                placeholder="Tuliskan dialog narasi yang diucapkan langsung oleh kreator ke kamera..."
                className="w-full p-3.5 text-sm sm:text-base leading-relaxed rounded-[14px] border border-[#E5E5EA] dark:border-[#38383A] bg-white dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 resize-y"
              />

              <p className="text-[11px] text-[#8E8E93]">
                💡 Tip: Pisahkan paragraf dengan baris kosong (Enter) untuk membagi segmen hook, demo, dan ajakan bertindak (CTA).
              </p>
            </div>
          )}

          {/* TAB 2: EDIT PER SEGMEN (DETAIL DENGAN ARAHAN B-ROLL & OVERLAY) */}
          {editTab === 'segments' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Rincian Segmen Waktu, Dialog & Arahan Visual
                </label>
                <button
                  type="button"
                  onClick={handleAddSegment}
                  className="inline-flex items-center gap-1 h-7 px-2.5 rounded-[8px] bg-[#007AFF]/10 hover:bg-[#007AFF]/20 text-[#007AFF] text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah Segmen</span>
                </button>
              </div>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {editSegments.map((seg, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-3.5 rounded-[14px] border border-[#E5E5EA] dark:border-[#38383A] bg-white dark:bg-[#2C2C2E] space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#007AFF]/15 text-[#007AFF] text-xs font-bold flex items-center justify-center">
                          {sIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={seg.segmentName}
                          onChange={(e) =>
                            handleUpdateSegmentField(sIdx, 'segmentName', e.target.value)
                          }
                          placeholder="Nama (e.g. HOOK, DEMO)"
                          className="h-7 px-2 text-xs font-bold rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-white border-0 w-24 uppercase"
                        />
                        <input
                          type="text"
                          value={seg.timeRange}
                          onChange={(e) =>
                            handleUpdateSegmentField(sIdx, 'timeRange', e.target.value)
                          }
                          placeholder="Waktu (e.g. 0-3s)"
                          className="h-7 px-2 text-xs font-mono rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-0 w-20"
                        />
                      </div>

                      {editSegments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSegment(sIdx)}
                          className="p-1 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                          title="Hapus segmen ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                        Dialog Narasi Lisan:
                      </label>
                      <textarea
                        value={seg.spokenDialogue}
                        onChange={(e) =>
                          handleUpdateSegmentField(sIdx, 'spokenDialogue', e.target.value)
                        }
                        rows={2}
                        placeholder="Kalimat yang diucapkan kreator..."
                        className="w-full p-2 text-xs sm:text-sm rounded-[8px] border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                          Arahan Visual & B-Roll:
                        </label>
                        <input
                          type="text"
                          value={seg.visualDirection}
                          onChange={(e) =>
                            handleUpdateSegmentField(sIdx, 'visualDirection', e.target.value)
                          }
                          placeholder="Contoh: Close-up saat produk dinyalakan..."
                          className="w-full h-8 px-2 text-xs rounded-[8px] border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                          Teks Overlay (Safe Zone):
                        </label>
                        <input
                          type="text"
                          value={seg.overlayText}
                          onChange={(e) =>
                            handleUpdateSegmentField(sIdx, 'overlayText', e.target.value)
                          }
                          placeholder="Teks singkat di layar..."
                          className="w-full h-8 px-2 text-xs rounded-[8px] border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-800 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Indikator Hitungan Kata & Durasi Real-Time */}
          <div className="p-3 rounded-[12px] bg-white dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-900 dark:text-white">
                {currentEditWords} kata
              </span>
              <span className="text-[#8E8E93]">•</span>
              <span
                className={`font-semibold ${
                  liveDurationStatus.status === 'ok'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : liveDurationStatus.status === 'long'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}
              >
                {liveDurationStatus.message}
              </span>
            </div>

            <div className="text-[11px] text-[#8E8E93]">
              Durasi target: {script.estimatedDurationSeconds || 30} detik
            </div>
          </div>

          {/* Tombol Aksi Simpan & Batal */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E5E5EA] dark:border-[#2C2C2E]">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="h-9 px-4 rounded-[10px] text-xs font-semibold text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white bg-black/5 dark:bg-white/10 hover:bg-black/10 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              className="h-9 px-5 rounded-[10px] text-xs font-bold text-white bg-[#007AFF] hover:bg-[#0066D6] shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>
      ) : (
        /* MODE TAMPILAN NORMAL */
        <div className="p-4 sm:p-6 space-y-5">
          {/* Paragraf Skrip: Setiap bagian ditulis pada paragraf berbeda tanpa keterangan label */}
          <div className="space-y-4 sm:space-y-5">
            {scriptParagraphs.map((paragraph, pIdx) => (
              <p
                key={pIdx}
                className="text-zinc-800 dark:text-zinc-200 text-base sm:text-[17px] leading-relaxed sm:leading-loose font-normal selection:bg-emerald-100 dark:selection:bg-emerald-950"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Panel Arahan Visual B-Roll & Safe Zone (Bila Diaktifkan Pengguna) */}
          {currentShowVisual && (
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
              <h5 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>Arahan Visual B-Roll & Safe Zone per Bagian</span>
              </h5>
              <div className="space-y-2.5">
                {script.segments.map((seg, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                      <span className="font-mono bg-zinc-200/80 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-300">
                        Bagian {sIdx + 1} ({seg.timeRange})
                      </span>
                      {seg.overlayText && (
                        <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold">
                          Overlay: {seg.overlayText}
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-normal">
                      {seg.visualDirection}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Area: Toggle Arahan Visual + Tombol Edit Manual + Sempurnakan Skrip */}
          <div className="pt-3.5 flex flex-wrap items-center justify-between gap-2.5 border-t border-[#F2F2F7] dark:border-[#2C2C2E]">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleToggleVisual}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[10px] text-xs font-semibold text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#8E8E93]" />
                <span>{currentShowVisual ? 'Sembunyikan Visual' : 'Lihat Arahan Visual'}</span>
                {currentShowVisual ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {/* Tombol Edit Manual di Area Bawah Kotak Skrip */}
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[10px] text-xs font-semibold text-[#007AFF] bg-[#007AFF]/10 hover:bg-[#007AFF]/20 transition-colors cursor-pointer active:scale-95"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Manual Skrip</span>
              </button>
            </div>

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
              <span>Sempurnakan AI</span>
              {showRefineMenu ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Panel Sempurnakan Skrip AI */}
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
      )}
    </div>
  );
};
