/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  FlipHorizontal,
  Eye,
  PictureInPicture2,
  Type,
  Gauge,
  SlidersHorizontal,
  Check,
  Timer,
  RotateCw,
} from 'lucide-react';
import { ScriptItem, ProductBrief } from '../types';
import {
  buildPrompterConcept,
  extractProductKeywords,
  PrompterConcept,
} from '../utils/prompterFormatter';
import { SUBTITLE_PRESETS, SubtitlePresetId } from '../utils/teleprompterPresets';
import { openDocumentPip, isDocumentPipSupported } from '../utils/teleprompterPip';
import { launchAndroidFloatingPrompter } from '../utils/androidPrompterSettings';

interface TeleprompterModalProps {
  isOpen: boolean;
  onClose: () => void;
  scripts: ScriptItem[];
  initialConceptIndex?: number;
  productBrief?: ProductBrief;
  onOpenFloatingPrompter?: (conceptIdx?: number) => void;
}

export type SettingsTabId = 'teks' | 'countdown' | 'layar';

// Kurva kecepatan ultra-lambat (Speed 1 sangat santai: 2.5 px/detik)
const SPEED_CURVE = [2.5, 4.5, 7.5, 11, 16, 23, 32, 43, 56, 72];

export const TeleprompterModal: React.FC<TeleprompterModalProps> = ({
  isOpen,
  onClose,
  scripts,
  initialConceptIndex = -1,
  productBrief,
  onOpenFloatingPrompter,
}) => {
  // State manajemen kontrol prompter
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [countdownValue, setCountdownValue] = useState<number>(3);
  const [countdownEnabled, setCountdownEnabled] = useState<boolean>(true); // Setting countdown aktif/nonaktif
  const [countdownDuration, setCountdownDuration] = useState<3 | 5 | 10>(3); // 3, 5, atau 10 detik

  const [speed, setSpeed] = useState<number>(3); // Range 1 - 10 (Speed 1 sangat lambat)
  const [fontSize, setFontSize] = useState<number>(24); // Range 7 - 64 px (Mulai dari 7)
  const [opacity, setOpacity] = useState<number>(95); // 5% - 100%
  const [isMirrored, setIsMirrored] = useState<boolean>(false);
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0); // Rotasi manual 0, 90, 180, 270 derajat
  const [showFocusZone, setShowFocusZone] = useState<boolean>(true);
  const [focusZonePosition, setFocusZonePosition] = useState<number>(14); // % dari atas
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedConceptIndex, setSelectedConceptIndex] = useState<number>(initialConceptIndex);

  // Menu pengaturan kanan terbuka & sub-tab aktif
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTabId>('teks');

  // Preset Subtitle Aktif (#1. Standard Read sebagai DEFAULT)
  const [activePresetId, setActivePresetId] = useState<SubtitlePresetId>('standard_read');

  // Animasi tap feedback
  const [tapFeedback, setTapFeedback] = useState<'play' | 'pause' | null>(null);

  // References
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const scrollAccumulatorRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(isPlaying);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    if (isOpen) {
      setSelectedConceptIndex(initialConceptIndex);
      setIsPlaying(false);
      setIsCountingDown(false);
      setIsSettingsOpen(false);
      scrollAccumulatorRef.current = 0;
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [isOpen, initialConceptIndex]);

  // Ekstrak keyword nama produk untuk penekanan prompter
  const productKeywords = React.useMemo(() => {
    return extractProductKeywords(productBrief?.name);
  }, [productBrief?.name]);

  // Format seluruh skrip menjadi PrompterConcept
  const prompterConcepts: PrompterConcept[] = React.useMemo(() => {
    return scripts.map((script, idx) =>
      buildPrompterConcept(script, idx + 1, productKeywords)
    );
  }, [scripts, productKeywords]);

  // Konsep yang aktif ditampilkan
  const activeConcepts = React.useMemo(() => {
    if (selectedConceptIndex >= 0 && selectedConceptIndex < prompterConcepts.length) {
      return [prompterConcepts[selectedConceptIndex]];
    }
    return prompterConcepts;
  }, [prompterConcepts, selectedConceptIndex]);

  const activePreset = React.useMemo(() => {
    return SUBTITLE_PRESETS.find((p) => p.id === activePresetId) || SUBTITLE_PRESETS[0];
  }, [activePresetId]);

  // Kecepatan piksel per detik (Speed 1 = 2.5px/detik)
  const pixelsPerSecond = SPEED_CURVE[Math.min(Math.max(1, speed), 10) - 1];

  const scrollStep = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    if (isPlayingRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const moveDistance = (pixelsPerSecond * deltaTime) / 1000;
      scrollAccumulatorRef.current += moveDistance;

      if (scrollAccumulatorRef.current >= 0.5) {
        const delta = Math.floor(scrollAccumulatorRef.current);
        container.scrollTop += delta;
        scrollAccumulatorRef.current -= delta;

        const maxScroll = container.scrollHeight - container.clientHeight;
        if (container.scrollTop >= maxScroll - 2) {
          setIsPlaying(false);
          lastTimeRef.current = null;
          return;
        }
      }
    }

    if (isPlayingRef.current) {
      animationFrameRef.current = requestAnimationFrame(scrollStep);
    }
  }, [pixelsPerSecond]);

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = null;
      animationFrameRef.current = requestAnimationFrame(scrollStep);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      lastTimeRef.current = null;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPlaying, scrollStep]);

  // Trigger Play dengan Countdown jika aktif
  const triggerPlay = useCallback(() => {
    if (countdownEnabled) {
      setIsCountingDown(true);
      setCountdownValue(countdownDuration);
      const timer = setInterval(() => {
        setCountdownValue((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsCountingDown(false);
            setIsPlaying(true);
            setTapFeedback('play');
            setTimeout(() => setTapFeedback(null), 500);
            return countdownDuration;
          }
          return prev - 1;
        });
      }, 900);
    } else {
      setIsPlaying(true);
      setTapFeedback('play');
      setTimeout(() => setTapFeedback(null), 500);
    }
  }, [countdownEnabled, countdownDuration]);

  // Mulai atau Jeda
  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      setTapFeedback('pause');
      setTimeout(() => setTapFeedback(null), 500);
    } else if (isCountingDown) {
      setIsCountingDown(false);
      setIsPlaying(true);
      setTapFeedback('play');
      setTimeout(() => setTapFeedback(null), 500);
    } else {
      triggerPlay();
      setIsSettingsOpen(false);
    }
  }, [isPlaying, isCountingDown, triggerPlay]);

  // Tap layar untuk Mulai / Jeda
  const handleScreenTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, input, select, .no-tap-toggle')) {
      return;
    }
    handleTogglePlay();
  };

  // Reset scroll ke atas kamera
  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setIsCountingDown(false);
    scrollAccumulatorRef.current = 0;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleReset();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else if (isCountingDown) {
          setIsCountingDown(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSpeed((prev) => Math.min(10, prev + 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSpeed((prev) => Math.max(1, prev - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleTogglePlay, handleReset, isCountingDown, onClose]);

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalContainerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Fitur Melayang (PiP OS / Buka Floating Widget) - DITARUH DI DEPAN
  const handleActivateFloating = async () => {
    const fullText = activeConcepts
      .map((c) => c.title + '\n\n' + c.lines.map((l) => l.rawText).join('\n'))
      .join('\n\n---\n\n');

    // 1. Jika di Android native APK: luncurkan Floating Service dengan setelan lengkap
    if (typeof window !== 'undefined' && (window as any).AndroidFloatingBridge) {
      const launched = launchAndroidFloatingPrompter(fullText, {
        speed,
        fontSize,
        opacity,
        textColorHex: activePreset.textColor || '#FEF08A',
        presetId: activePresetId,
        rotation,
        isMirrored,
        showFocusGuide: showFocusZone,
        focusGuidePercent: focusZonePosition,
        countdownSec: countdownEnabled ? countdownDuration : 0,
      });
      if (launched) return;
    }

    // 2. Jika di Web Browser & top-level: coba Document Picture-in-Picture
    if (isDocumentPipSupported()) {
      try {
        const containerClone = document.createElement('div');
        containerClone.style.padding = '14px';
        containerClone.style.color = activePreset.textColor;
        containerClone.style.fontSize = `${Math.max(12, fontSize)}px`;
        containerClone.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        containerClone.style.lineHeight = '1.45';
        containerClone.style.textShadow = activePreset.textShadow;
        containerClone.style.whiteSpace = 'pre-wrap';

        const fullText = activeConcepts
          .map((c) => `=== ${c.title} ===\n\n` + c.lines.map((l) => l.rawText).join('\n'))
          .join('\n\n------------------------\n\n');
        containerClone.innerText = fullText;

        const pipWin = await openDocumentPip(containerClone, {
          width: 400,
          height: 480,
          title: 'Manuskrip Teleprompter',
        });

        if (pipWin) {
          return;
        }
      } catch (err) {
        console.warn('PiP notice, falling back to in-app floating prompter:', err);
      }
    }

    // 3. Fallback cerdas: Buka in-app FloatingTeleprompter widget
    if (onOpenFloatingPrompter) {
      onOpenFloatingPrompter(selectedConceptIndex);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalContainerRef}
      style={{
        backgroundColor: `rgba(0, 0, 0, ${opacity / 100})`, // Opasitas untuk seluruh tampilan layar
      }}
      className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] z-50 flex flex-col text-white font-sans select-none overflow-hidden transition-colors"
    >
      {/* 
        BAGIAN ATAS: STRIP TIPIS 2px TANPA JEDA/GAP (Teks langsung menempel di kamera depan)
      */}
      <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent shrink-0" />

      {/* 
        GARIS BANTU FOKUS MATA KE KAMERA (HANYA GARIS & PERSEN, TEKS DIHAPUS)
      */}
      {showFocusZone && (
        <div
          style={{ top: `${focusZonePosition}%` }}
          className="pointer-events-none absolute left-0 right-0 z-20 -translate-y-1/2 flex items-center justify-between px-4 sm:px-12 transition-all duration-150"
        >
          <div className="flex-1 h-0.5 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.7)]" />
          <span className="text-xs font-mono font-bold text-amber-300 bg-black/60 px-2 py-0.5 rounded border border-amber-500/40 ml-2 drop-shadow-md">
            {focusZonePosition}%
          </span>
        </div>
      )}

      {/* HITUNG MUNDUR 3/5/10 DETIK OVERLAY */}
      {isCountingDown && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsCountingDown(false);
            setIsPlaying(true);
          }}
          className="absolute inset-0 z-40 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center cursor-pointer animate-in fade-in duration-150"
        >
          <div className="text-8xl sm:text-9xl font-black text-amber-400 tracking-tight animate-bounce drop-shadow-[0_0_35px_rgba(251,191,36,0.6)]">
            {countdownValue}
          </div>
          <p className="mt-4 text-sm sm:text-base font-semibold text-zinc-300">
            Teks segera bergulir... (Ketuk layar untuk langsung mulai)
          </p>
        </div>
      )}

      {/* FEEDBACK ANIMASI TAP MULAI / JEDA */}
      {tapFeedback && (
        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center animate-out fade-out zoom-out duration-400">
          <div className="p-5 rounded-full bg-black/80 border border-amber-400 text-amber-400 shadow-2xl backdrop-blur-md">
            {tapFeedback === 'play' ? (
              <Play className="w-10 h-10 fill-amber-400" />
            ) : (
              <Pause className="w-10 h-10 fill-amber-400" />
            )}
          </div>
        </div>
      )}

      {/* 
        AREA MEMBACA TELEPROMPTER UTAMA
        Teks langsung dimulai di tepi atas dekat kamera (pt-2).
        Tap layar untuk Mulai / Jeda.
      */}
      <main
        onClick={handleScreenTap}
        ref={scrollContainerRef}
        style={{ scrollBehavior: 'auto' }}
        className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 md:px-16 pt-2 pb-36 scrollbar-none transition-transform duration-150 cursor-pointer"
      >
        <div
          style={{
            transform: `${rotation !== 0 ? `rotate(${rotation}deg)` : ''} ${isMirrored ? 'scaleX(-1)' : ''}`.trim() || undefined,
            transformOrigin: 'center center',
          }}
          className="max-w-4xl mx-auto space-y-10 transition-transform duration-200"
        >
          {activeConcepts.map((concept) => (
            <section
              key={concept.id}
              className="space-y-4 border-b border-zinc-900 pb-10 last:border-b-0"
            >
              {/* Header Penanda Konsep Ringkas */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 font-semibold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white font-bold">KONSEP #{concept.conceptNumber}:</span>
                <span className="text-amber-400">{concept.title}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-400">{concept.angle}</span>
                <span className="text-zinc-600">·</span>
                <span>±{concept.estimatedDuration}s</span>
              </div>

              {/* Teks Dialog dengan Gaya Subtitle Aktif */}
              <div className="space-y-4 sm:space-y-5">
                {concept.lines.map((line) => (
                  <div
                    key={line.id}
                    style={{
                      fontSize: `${fontSize}px`,
                      lineHeight: activePreset.lineHeight || '1.45',
                      letterSpacing: activePreset.letterSpacing || 'normal',
                      color: activePreset.textColor,
                      textShadow: activePreset.textShadow,
                      fontWeight: activePreset.fontWeight,
                      backgroundColor: activePreset.pillBg || 'transparent',
                    }}
                    className={`transition-all duration-150 tracking-wide ${
                      activePreset.pillBg
                        ? 'p-3 rounded-2xl ' + (activePreset.borderClass || '')
                        : ''
                    }`}
                  >
                    {line.tokens.map((token, tIdx) => {
                      if (token.type === 'emphasis' || token.type === 'promo' || token.type === 'cta') {
                        return (
                          <span
                            key={tIdx}
                            style={{ color: activePreset.highlightColor }}
                            className="font-black uppercase tracking-wider"
                          >
                            {token.text}{' '}
                          </span>
                        );
                      }
                      if (token.type === 'pause-short') {
                        return (
                          <span key={tIdx} className="opacity-60 mx-1">
                            /
                          </span>
                        );
                      }
                      if (token.type === 'pause-long') {
                        return (
                          <span key={tIdx} className="opacity-75 mx-1 font-bold">
                            //
                          </span>
                        );
                      }
                      return <span key={tIdx}>{token.text} </span>;
                    })}
                  </div>
                ))}
              </div>
            </section>
          ))}

          {/* Buffer dasar agar baris terakhir tetap terbaca pada garis fokus kamera */}
          <div className="h-96 flex flex-col items-center justify-center text-zinc-600 text-xs font-semibold gap-2 border-t border-zinc-900 pt-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>--- AKHIR SKRIP AFFILIATE ---</span>
            <button
              type="button"
              onClick={handleReset}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Kembali ke Atas</span>
            </button>
          </div>
        </div>
      </main>

      {/* 
        PANEL PENGATURAN TERPADU TELEPROMPTER (TEKS & SUBTITLE, HITUNG MUNDUR, LAYAR)
      */}
      {isSettingsOpen && !isPlaying && (
        <div className="no-tap-toggle absolute bottom-20 left-4 right-4 sm:left-12 sm:right-12 max-w-2xl sm:mx-auto z-40 bg-zinc-950/95 border border-zinc-700/80 rounded-2xl p-4 shadow-2xl space-y-3.5 text-xs text-zinc-300 animate-in slide-in-from-bottom-2 duration-150 backdrop-blur-md max-h-[calc(100dvh-6rem)] overflow-y-auto">
          {/* Header Panel */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Pengaturan Teleprompter</span>
            </span>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub-tabs Minimalis: Teks, Hitung Mundur, Layar */}
          <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setSettingsTab('teks')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                settingsTab === 'teks'
                  ? 'bg-amber-500 text-black font-bold shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Teks & Subtitle</span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsTab('countdown')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                settingsTab === 'countdown'
                  ? 'bg-amber-500 text-black font-bold shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Hitung Mundur</span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsTab('layar')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                settingsTab === 'layar'
                  ? 'bg-amber-500 text-black font-bold shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Layar & Fokus</span>
            </button>
          </div>

          {/* TAB 1: TEKS & SUBTITLE */}
          {settingsTab === 'teks' && (
            <div className="space-y-3.5">
              {/* Ukuran Font (Mulai dari 7px hingga 64px) */}
              <div className="space-y-1.5 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300">Ukuran Font (Mulai dari 7px):</span>
                  <span className="font-mono font-bold text-amber-400">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="7"
                  max="64"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg accent-amber-500 cursor-pointer"
                />
              </div>

              {/* 10 Preset Subtitle */}
              <div className="space-y-1.5">
                <span className="font-semibold text-zinc-300 text-xs block">Pilih 10 Gaya Subtitle Siap Rekam:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                  {SUBTITLE_PRESETS.map((preset) => {
                    const isSelected = preset.id === activePresetId;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setActivePresetId(preset.id)}
                        className={`flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 border border-amber-500/60'
                            : 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            style={{
                              color: preset.textColor,
                              textShadow: preset.textShadow,
                              fontWeight: preset.fontWeight,
                            }}
                            className="text-sm px-2 py-0.5 rounded bg-black/70 border border-zinc-700 font-bold shrink-0"
                          >
                            Aa
                          </span>
                          <div>
                            <div className="text-xs font-bold text-white truncate">{preset.name}</div>
                            <div className="text-[10px] text-zinc-400">{preset.description}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HITUNG MUNDUR (COUNTDOWN) */}
          {settingsTab === 'countdown' && (
            <div className="space-y-3 bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-zinc-200 text-xs">Hitung Mundur Sebelum Teks Jalan:</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCountdownEnabled((e) => !e)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    countdownEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {countdownEnabled ? 'Aktif' : 'Nonaktif'}
                </button>
              </div>

              {countdownEnabled && (
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <span className="text-xs text-zinc-400 block font-medium">Pilih Durasi Hitung Mundur:</span>
                  <div className="flex items-center gap-2">
                    {([3, 5, 10] as const).map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setCountdownDuration(sec)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          countdownDuration === sec
                            ? 'bg-amber-500 text-black border-amber-500 shadow-xs'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                        }`}
                      >
                        {sec} Detik
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TAMPILAN & FOKUS MATA */}
          {settingsTab === 'layar' && (
            <div className="space-y-3.5">
              {/* Slider Transparansi Menyeluruh */}
              <div className="space-y-1.5 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300">Transparansi Latar Belakang:</span>
                  <span className="font-mono font-bold text-amber-400">{opacity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Posisi Garis Fokus Mata (Hanya Garis & Persen) */}
              <div className="space-y-1.5 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300">Garis Panduan Kamera:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowFocusZone((z) => !z)}
                      className={`text-xs font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        showFocusZone
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      {showFocusZone ? 'Aktif' : 'Off'}
                    </button>
                    <span className="font-mono font-bold text-amber-400">{focusZonePosition}%</span>
                  </div>
                </div>
                {showFocusZone && (
                  <input
                    type="range"
                    min="5"
                    max="75"
                    value={focusZonePosition}
                    onChange={(e) => setFocusZonePosition(Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg accent-amber-500 cursor-pointer"
                  />
                )}
              </div>

              {/* Opsi Mirror Kaca */}
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-300 font-semibold">Mirror Kaca Teleprompter:</span>
                <button
                  type="button"
                  onClick={() => setIsMirrored((m) => !m)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isMirrored
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>{isMirrored ? 'Aktif' : 'Nonaktif'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 
        BAGIAN BAWAH: NAVIGASI UTAMA TELEPROMPTER (SINGLE CLEAN DOCK)
        - Speed Stepper (+ -) ditempatkan sejajar langsung dengan Mulai dan Melayang
        - Countdown dan Teks digabungkan di Menu Pengaturan sebelah kanan
        - Menu dibuat dalam bentuk ikon minimalis, konsisten, dan mudah dikenali
      */}
      <footer
        className={`no-tap-toggle relative z-30 px-3 sm:px-6 py-2.5 bg-zinc-950/95 border-t border-zinc-800/80 backdrop-blur-md shrink-0 transition-all duration-300 ${
          isPlaying
            ? 'opacity-0 translate-y-16 pointer-events-none'
            : 'opacity-100 translate-y-0 pointer-events-auto'
        }`}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* SISI KIRI: Rotasi Manual, Reset & Pemilih Konsep */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Tombol Rotasi Manual di sebelah kiri tombol Reset */}
            <button
              type="button"
              onClick={() => {
                setRotation((prev) => ((prev + 90) % 360) as 0 | 90 | 180 | 270);
              }}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors cursor-pointer relative"
              title={`Rotasi Manual Teks (${rotation}°)`}
            >
              <RotateCw className="w-4 h-4 text-amber-400" />
              {rotation !== 0 && (
                <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-amber-500 text-black px-1 rounded-full leading-tight">
                  {rotation}°
                </span>
              )}
            </button>

            {/* Tombol Reset ke Paling Atas */}
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors cursor-pointer"
              title="Kembalikan Teks ke Posisi Awal (Reset / R)"
            >
              <RotateCcw className="w-4 h-4 text-zinc-400" />
            </button>

            {/* Konsep Selector Pill Buttons */}
            <div className="hidden sm:flex items-center gap-1 bg-zinc-900 p-0.5 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setSelectedConceptIndex(-1);
                  handleReset();
                }}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedConceptIndex === -1
                    ? 'bg-amber-500 text-black font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Semua
              </button>
              {prompterConcepts.slice(0, 5).map((c, idx) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedConceptIndex(idx);
                    handleReset();
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedConceptIndex === idx
                      ? 'bg-amber-500 text-black font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  #{idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* TENGAH: TOMBOL SPEED (+ -) SEJAJAR DENGAN MULAI & MELAYANG */}
          <div className="flex items-center gap-2 sm:gap-2.5 justify-center flex-1">
            {/* Speed Stepper (+ -) */}
            <div className="flex items-center bg-zinc-900 rounded-xl border border-zinc-800 p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => setSpeed((prev) => Math.max(1, prev - 1))}
                disabled={speed <= 1}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                title="Perlambat Kecepatan (Panah Bawah)"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-xs px-2 text-amber-400 min-w-[30px] text-center" title="Kecepatan Gulir">
                {speed}x
              </span>
              <button
                type="button"
                onClick={() => setSpeed((prev) => Math.min(10, prev + 1))}
                disabled={speed >= 10}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                title="Percepat Kecepatan (Panah Atas)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tombol Hero Mulai / Jeda (Icon Only) */}
            <button
              type="button"
              onClick={handleTogglePlay}
              className="p-2 sm:p-2.5 rounded-xl font-extrabold bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/25 transition-all cursor-pointer active:scale-95 shrink-0"
              title={isPlaying ? "Jeda Teks (Spasi atau Ketuk Layar)" : "Mulai Teks (Spasi atau Ketuk Layar)"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-black" />
              ) : (
                <Play className="w-4 h-4 fill-black ml-0.5" />
              )}
            </button>

            {/* Tombol Melayang Sejajar (Icon Only) */}
            <button
              type="button"
              onClick={handleActivateFloating}
              className="p-2 sm:p-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold transition-all cursor-pointer shadow-xs shrink-0"
              title="Buka Mode Melayang (PiP OS / Di Atas Aplikasi Lain)"
            >
              <PictureInPicture2 className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          {/* SISI KANAN: MENU PENGATURAN (IKON MINIMALIS), FULLSCREEN & TUTUP */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Ikon Menu Setting Gabungan (Teks, Hitung Mundur, Layar) */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isSettingsOpen
                  ? 'bg-amber-500 text-black border-amber-500 shadow-xs'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
              }`}
              title="Menu Pengaturan (Teks, Hitung Mundur, Layar)"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="hidden sm:inline-flex p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors cursor-pointer"
              title="Layar Penuh"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Tutup */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-rose-500/20 border border-zinc-800 transition-all cursor-pointer"
              title="Tutup Teleprompter (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
