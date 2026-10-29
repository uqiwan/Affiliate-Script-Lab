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
  SlidersHorizontal,
} from 'lucide-react';
import { ScriptItem, ScriptSegment } from '../types';
import { formatScriptAsText } from '../utils/exportTxt';
import { countWords, evaluateDurationStatus } from '../utils/wordCount';
import { sanitizeCrossPlatformText } from '../services/directGeminiService';

export function getConceptDisplayTitle(index: number, script: ScriptItem): string {
  let angle = (script.angle || '').trim();
  // Bersihkan penomoran awal seperti "1. " atau "1) " jika ada
  angle = angle.replace(/^\d+[\.\)\-]\s*/, '').trim();

  if (!angle) {
    if (script.title && !script.title.toLowerCase().startsWith('konsep #')) {
      angle = script.title.trim();
    } else {
      const fallbackAngles = [
        'Problem-Solution (Solusi Masalah)',
        'Personal Story (Kisah Nyata)',
        'Bold Claim (Klaim Menghentak)',
        'Myth-Busting (Bongkar Mitos)',
        'Outcome-First (Hasil di Awal)',
        'Common Mistakes (Hindari Salah)',
        'Price/Value (Bandingkan Nilai)',
      ];
      angle = fallbackAngles[index % fallbackAngles.length];
    }
  }

  return `Konsep #${index + 1}: ${angle}`;
}

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

const ScriptCardComponent: React.FC<ScriptCardProps> = ({
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
  const [showCardActions, setShowCardActions] = useState<boolean>(false);
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

  // Textarea auto-height ref
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  // Sync edit buffers when script changes or edit mode opens
  useEffect(() => {
    setEditTitle(script.title);
    setEditPersona(script.persona || '');
    const initialVo =
      (script.voiceoverOnly && script.voiceoverOnly.trim()) ||
      (script.segments && script.segments.length > 0
        ? script.segments.map((s) => cleanDialogueText(s.spokenDialogue)).filter(Boolean).join('\n\n')
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

  // Auto-resize textarea to open fully without inner scrolling
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(160, textareaRef.current.scrollHeight)}px`;
    }
  }, [isEditing, editVoiceover, editTab]);

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

  // Dialog paragraphs for normal view - preserve paragraph separation
  const scriptParagraphs: string[] = useMemo(() => {
    if (script.voiceoverOnly && script.voiceoverOnly.trim()) {
      return script.voiceoverOnly
        .split(/\n\s*\n+/)
        .map((p) => cleanDialogueText(p))
        .filter(Boolean);
    }
    if (script.segments && script.segments.length > 0) {
      const segDialogues = script.segments
        .map((seg) => (seg.spokenDialogue ? cleanDialogueText(seg.spokenDialogue) : ''))
        .filter(Boolean);
      if (segDialogues.length > 0) {
        return segDialogues;
      }
    }
    return [];
  }, [script]);

  const handleCopyFull = () => {
    const text = formatScriptAsText(script, index);
    onCopyText(text, getConceptDisplayTitle(index, script));
  };

  const handleCopyVoiceover = () => {
    const textToCopy = scriptParagraphs.join('\n\n');
    onCopyText(textToCopy, `Narasi ${getConceptDisplayTitle(index, script)}`);
  };

  const handleApplyRefine = () => {
    if (!selectedRefinement && !customRefineText.trim()) return;
    const refType = selectedRefinement || 'custom';
    onRefine(script, refType, customRefineText.trim() || undefined);
    setSelectedRefinement(null);
    setCustomRefineText('');
  };

  const canApplyRefine = Boolean(selectedRefinement || customRefineText.trim());

  // Save manual edits preserving paragraphs and full text
  const handleSaveEdit = () => {
    let finalVoiceover = '';
    let finalSegments: ScriptSegment[] = [];

    if (editTab === 'voiceover') {
      finalVoiceover = sanitizeCrossPlatformText(editVoiceover.trim());
      // Split into paragraphs for natural segment representation (double newlines)
      const paragraphs = finalVoiceover
        .split(/\n\s*\n+/)
        .map((p) => p.trim())
        .filter(Boolean);

      if (paragraphs.length > 0) {
        finalSegments = paragraphs.map((para, pIdx) => {
          const prevSeg = editSegments[pIdx] || editSegments[editSegments.length - 1];
          return {
            timeRange: prevSeg?.timeRange || `${pIdx * 8}-${(pIdx + 1) * 8}s`,
            segmentName:
              prevSeg?.segmentName ||
              (pIdx === 0 ? 'HOOK' : pIdx === paragraphs.length - 1 ? 'CTA' : 'BODY'),
            visualDirection:
              prevSeg?.visualDirection || 'Tatap kamera santai memegang produk',
            spokenDialogue: para,
            overlayText: prevSeg?.overlayText || '',
            strategyNote: prevSeg?.strategyNote || 'Dialog hasil edit manual',
          };
        });
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
      finalVoiceover = finalSegments.map((s) => s.spokenDialogue).filter(Boolean).join('\n\n');
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
      (script.voiceoverOnly && script.voiceoverOnly.trim()) ||
        (script.segments && script.segments.length > 0
          ? script.segments.map((s) => cleanDialogueText(s.spokenDialogue)).filter(Boolean).join('\n\n')
          : '')
    );
    setEditSegments(script.segments?.map((s) => ({ ...s })) || []);
    setIsEditing(false);
  };

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
    <div className={`bg-white dark:bg-[#1C1C1E] rounded-2xl border transition-all overflow-hidden ${
      isEditing
        ? 'border-blue-600 shadow-sm ring-1 ring-blue-600/30'
        : 'border-slate-200 dark:border-zinc-800 shadow-xs'
    }`}>
      {/* Header Bar - Simpel & Bersih: Judul Lengkap di Kiri + Toggle Opsi di Kanan */}
      <div className="p-3.5 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1C1C1E] flex items-center justify-between gap-2.5">
        {/* Rata Kiri: Judul Lengkap 'Konsep #1: Problem-Solution' */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-8 px-3 rounded-lg text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center shrink-0 shadow-2xs tracking-tight">
            {getConceptDisplayTitle(index, script)}
          </span>
        </div>

        {/* Rata Kanan: Tombol Opsi Skrip */}
        <button
          type="button"
          onClick={() => setShowCardActions(!showCardActions)}
          className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer border shrink-0 ${
            showCardActions
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-white dark:bg-[#1C1C1E] text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-zinc-700 hover:border-slate-300 active:scale-95'
          }`}
          title={showCardActions ? 'Tutup menu opsi konsep ini' : 'Buka menu opsi konsep ini'}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{showCardActions ? 'Tutup Menu' : 'Menu Skrip'}</span>
          {showCardActions ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Menu Tersembunyi: Panel Putih Solid Bersih */}
      {showCardActions && (
        <div className="p-3.5 bg-white dark:bg-[#1C1C1E] border-b border-slate-200 dark:border-zinc-800 space-y-3 animate-in fade-in duration-150">
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Tombol Info */}
            <button
              type="button"
              onClick={() => setShowConceptInfo(!showConceptInfo)}
              className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                showConceptInfo
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white dark:bg-[#1C1C1E] text-slate-800 dark:text-zinc-200 border-slate-200 dark:border-zinc-700 hover:border-slate-300 active:scale-95'
              }`}
            >
              <Info className={`w-3.5 h-3.5 ${showConceptInfo ? 'text-white' : 'text-blue-600'}`} />
              <span>Info Konsep</span>
              {showConceptInfo ? <ChevronUp className="w-3 h-3 text-white" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
            </button>

            {/* 2. Tombol Salin Narasi */}
            <button
              type="button"
              onClick={handleCopyVoiceover}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-white dark:bg-[#1C1C1E] hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 transition-all cursor-pointer border border-slate-200 dark:border-zinc-700 hover:border-slate-300 active:scale-95"
              title="Salin teks dialog narasi suara"
            >
              <Copy className="w-3.5 h-3.5 text-blue-600" />
              <span>Salin Narasi</span>
            </button>

            {/* 3. Tombol Salin Skrip Lengkap */}
            <button
              type="button"
              onClick={handleCopyFull}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-white dark:bg-[#1C1C1E] hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 transition-all cursor-pointer border border-slate-200 dark:border-zinc-700 hover:border-slate-300 active:scale-95"
              title="Salin skrip visual + narasi lengkap"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Salin Skrip</span>
            </button>

            {/* 4. Tombol Teleprompter */}
            {onOpenPrompter && (
              <button
                type="button"
                onClick={() => onOpenPrompter(script, index)}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all cursor-pointer active:scale-95"
                title={`Buka Layar Teleprompter khusus ${getConceptDisplayTitle(index, script)}`}
              >
                <MonitorPlay className="w-3.5 h-3.5 text-white" />
                <span>Teleprompter</span>
              </button>
            )}

            {/* 5. Tombol Melayang */}
            {onOpenFloatingPrompter && (
              <button
                type="button"
                onClick={() => onOpenFloatingPrompter(script, index)}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 transition-all cursor-pointer active:scale-95"
                title={`Buka Mode Melayang khusus ${getConceptDisplayTitle(index, script)}`}
              >
                <PictureInPicture2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Prompter Melayang</span>
              </button>
            )}

            {/* 6. Tombol Lihat Arahan Visual */}
            <button
              type="button"
              onClick={handleToggleVisual}
              className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                currentShowVisual
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white dark:bg-[#1C1C1E] text-slate-800 dark:text-zinc-200 border-slate-200 dark:border-zinc-700 hover:border-slate-300 active:scale-95'
              }`}
            >
              <Eye className={`w-3.5 h-3.5 ${currentShowVisual ? 'text-white' : 'text-emerald-600'}`} />
              <span>{currentShowVisual ? 'Tutup Visual' : 'Arahan Visual'}</span>
              {currentShowVisual ? <ChevronUp className="w-3 h-3 text-white" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
            </button>

            {/* 7. Tombol Sempurnakan AI */}
            <button
              type="button"
              onClick={() => setShowRefineMenu(!showRefineMenu)}
              className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                showRefineMenu
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-white dark:bg-[#1C1C1E] text-slate-800 dark:text-zinc-200 border-slate-200 dark:border-zinc-700 hover:border-slate-300 active:scale-95'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${showRefineMenu ? 'text-white' : 'text-purple-600'}`} />
              <span>Sempurnakan AI</span>
              {showRefineMenu ? <ChevronUp className="w-3 h-3 text-white" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
            </button>
          </div>

          {/* Metadata Detail Konsep - Solid White Panel */}
          {showConceptInfo && (
            <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-800 space-y-2.5 animate-in fade-in duration-150 text-xs text-slate-700 dark:text-zinc-300 shadow-xs">
              <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
                <span className="font-bold text-slate-900 dark:text-white text-sm">{script.title}</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  <Target className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  {script.angle}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {script.spokenWordCount} kata ({script.durationStatus === 'ok' ? 'Optimal' : script.durationStatus})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-zinc-400">
                <div><strong className="text-slate-900 dark:text-zinc-200">Target Persona:</strong> {script.persona}</div>
                <div><strong className="text-slate-900 dark:text-zinc-200">Tipe Hook:</strong> {script.hookType}</div>
                <div><strong className="text-slate-900 dark:text-zinc-200">Durasi:</strong> {script.estimatedDurationSeconds} detik</div>
                <div><strong className="text-slate-900 dark:text-zinc-200">Pembeda:</strong> {script.differentiator}</div>
              </div>
            </div>
          )}

          {/* Panel Sempurnakan AI - Solid White Panel */}
          {showRefineMenu && (
            <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-800 space-y-3 animate-in fade-in duration-150 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Penyesuaian AI Cepat:
                </span>
                <button
                  type="button"
                  onClick={() => onRegenerate(script)}
                  disabled={isRefining}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Buat Ulang
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'hook_stronger', label: 'Hook Lebih Kuat', icon: Clock },
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
                      onClick={() => setSelectedRefinement(isSelected ? null : opt.id)}
                      className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 border-slate-200 dark:border-zinc-700'
                      }`}
                    >
                      <IconComp className="w-3 h-3" />
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={customRefineText}
                  onChange={(e) => setCustomRefineText(e.target.value)}
                  placeholder="Instruksi khusus (misal: tekankan harga diskon)..."
                  disabled={isRefining}
                  className="flex-1 h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                />
                <button
                  type="button"
                  disabled={isRefining || !canApplyRefine}
                  onClick={handleApplyRefine}
                  className={`h-9 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    isRefining || !canApplyRefine
                      ? 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs cursor-pointer active:scale-95'
                  }`}
                >
                  {isRefining ? 'Menerapkan...' : 'Terapkan'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Konten Area: Mode Edit Manual ATAU Mode Tampilan Normal */}
      {isEditing ? (
        /* MODE EDIT MANUAL - Ketinggian Terbuka Penuh & Tipografi Identik dengan Mode Baca */
        <div className="p-4 sm:p-6 space-y-4 bg-white dark:bg-[#1C1C1E]">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-zinc-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-600 text-white text-xs font-bold shadow-xs">
                <Pencil className="w-3 h-3" />
                <span>Mode Edit</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {currentEditWords} kata • {liveDurationStatus.message}
              </span>
              <button
                type="button"
                onClick={handleSanitizeEditCta}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer ml-1"
                title="Otomatis ganti sebutan keranjang kuning menjadi netral multi-platform"
              >
                <Wand2 className="w-3 h-3" />
                <span>Netralkan CTA</span>
              </button>
            </div>
          </div>

          {/* Auto-growing Textarea: Ketinggian Terbuka Full, Tipografi & Paragraf Identik dengan Tampilan Normal */}
          <textarea
            ref={textareaRef}
            value={editVoiceover}
            onChange={(e) => setEditVoiceover(e.target.value)}
            placeholder="Tuliskan dialog narasi yang diucapkan langsung oleh kreator ke kamera..."
            className="w-full text-zinc-800 dark:text-zinc-200 text-base sm:text-[17px] leading-relaxed sm:leading-loose font-normal bg-transparent border-0 focus:ring-0 focus:outline-none resize-none overflow-hidden p-0 selection:bg-emerald-100 dark:selection:bg-emerald-950"
          />

          {/* Tombol Aksi Simpan & Batal Edit */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E5E5EA] dark:border-[#2C2C2E]">
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
        /* MODE TAMPILAN NORMAL - Bersih, Fokus ke Skrip, Ikon Edit di Akhir Teks */
        <div className="p-4 sm:p-6 space-y-4">
          <div className="space-y-4 sm:space-y-5">
            {scriptParagraphs.map((paragraph, pIdx) => {
              const isLast = pIdx === scriptParagraphs.length - 1;
              return (
                <p
                  key={pIdx}
                  className="text-zinc-800 dark:text-zinc-200 text-base sm:text-[17px] leading-relaxed sm:leading-loose font-normal selection:bg-emerald-100 dark:selection:bg-emerald-950"
                >
                  {paragraph}
                  {isLast && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#007AFF]/10 hover:bg-[#007AFF]/20 text-[#007AFF] transition-all cursor-pointer active:scale-90 ml-2.5 align-middle shadow-2xs border border-[#007AFF]/20"
                      title="Edit manual skrip ini"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                </p>
              );
            })}
            {scriptParagraphs.length === 0 && (
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 italic text-sm">Skrip belum berisi dialog...</span>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#007AFF]/10 hover:bg-[#007AFF]/20 text-[#007AFF] transition-all cursor-pointer active:scale-90 shadow-2xs border border-[#007AFF]/20"
                  title="Tulis skrip manual"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Panel Arahan Visual B-Roll (Hanya muncul jika diaktifkan dari menu Opsi Skrip di atas) */}
          {currentShowVisual && (
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3 animate-in fade-in duration-150">
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
        </div>
      )}
    </div>
  );
};

export const ScriptCard = React.memo(ScriptCardComponent);
