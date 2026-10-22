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
  Move,
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
  formatConceptDisplayTitle,
  PrompterConcept,
} from '../utils/prompterFormatter';
import { SUBTITLE_PRESETS, SubtitlePresetId } from '../utils/teleprompterPresets';
import { openDocumentPip, isDocumentPipSupported } from '../utils/teleprompterPip';
import { launchAndroidFloatingPrompter } from '../utils/androidPrompterSettings';
import {
  TeleprompterTheme,
  TeleprompterThemeId,
  TELEPROMPTER_THEMES,
  getStoredPrompterTheme,
  saveStoredPrompterTheme,
} from '../utils/teleprompterThemes';

interface TeleprompterModalProps {
  isOpen: boolean;
  onClose: () => void;
  scripts: ScriptItem[];
  initialConceptIndex?: number;
  productBrief?: ProductBrief;
  onOpenFloatingPrompter?: (conceptIdx?: number) => void;
  theme?: TeleprompterTheme;
  onSelectTheme?: (themeId: TeleprompterThemeId) => void;
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
  theme: propTheme,
  onSelectTheme,
}) => {
  // Tema teleprompter aktif
  const [internalTheme, setInternalTheme] = useState<TeleprompterTheme>(() => getStoredPrompterTheme());
  const activeTheme = propTheme || internalTheme;

  useEffect(() => {
    if (propTheme) {
      setInternalTheme(propTheme);
    } else {
      setInternalTheme(getStoredPrompterTheme());
    }
  }, [propTheme, isOpen]);
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
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [horizontalAlignment, setHorizontalAlignment] = useState<'center' | 'left' | 'right'>('center');
  const [selectedConceptIndex, setSelectedConceptIndex] = useState<number>(initialConceptIndex);

  // Menu pengaturan kanan terbuka & sub-tab aktif
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTabId>('teks');

  // Preset Subtitle Aktif (#1. Standard Read sebagai DEFAULT)
  const [activePresetId, setActivePresetId] = useState<SubtitlePresetId>('standard_read');

  // Animasi tap feedback
  const [tapFeedback, setTapFeedback] = useState<'play' | 'pause' | null>(null);

  // Dimensi layar untuk auto-scale rotasi agar canvas tidak keluar dari layar hp
  const [screenSize, setScreenSize] = useState<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 360,
    height: typeof window !== 'undefined' ? window.innerHeight : 640,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Skala otomatis saat dirotasi (90° / 270°) agar canvas mengecil dan tetap 100% di dalam layar
  const rotationScale = React.useMemo(() => {
    if (rotation === 90 || rotation === 270) {
      const minDim = Math.min(screenSize.width, screenSize.height);
      const maxDim = Math.max(screenSize.width, screenSize.height);
      return Math.min(minDim / maxDim, 1);
    }
    return 1;
  }, [rotation, screenSize]);

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
        themeId: activeTheme.id,
        backgroundColorHex: activeTheme.backgroundColor,
        highlightColorHex: activeTheme.highlightColor,
        rotation,
        isMirrored,
        showFocusGuide: showFocusZone,
        focusGuidePercent: focusZonePosition,
        countdownSec: countdownEnabled ? countdownDuration : 0,
      }, activeConcepts);
      if (launched) {
        onClose();
        return;
      }
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

  // Mode Minimized: Baris teks "teleprompter Gagaswara" (klik kembali untuk membuka ukuran semula)
  if (isMinimized) {
    return (
      <div
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-zinc-900/95 text-white border-2 border-amber-400 shadow-2xl backdrop-blur-md cursor-pointer select-none active:scale-95 transition-all group"
        title="Klik untuk membuka kembali ukuran semula"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <span className="text-xs sm:text-sm font-bold text-amber-300 tracking-wide group-hover:text-amber-200">
          teleprompter Gagaswara
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleTogglePlay();
          }}
          className="p-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black transition-all cursor-pointer ml-1"
          title={isPlaying ? 'Jeda' : 'Mulai'}
        >
          {isPlaying ? <Pause className="w-3 h-3 fill-black" /> : <Play className="w-3 h-3 fill-black ml-0.5" />}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-all cursor-pointer"
          title="Tutup"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={modalContainerRef}
      style={{
        backgroundColor:
          activeTheme.id === 'light_clean'
            ? `rgba(255, 255, 255, ${opacity / 100})`
            : activeTheme.id === 'soft_comfort'
            ? `rgba(24, 24, 27, ${opacity / 100})`
            : `rgba(0, 0, 0, ${opacity / 100})`,
        color: activeTheme.textColor,
      }}
      className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] z-50 flex flex-col font-sans select-none overflow-hidden transition-colors duration-200"
    >
      {/* Tombol Tutup Utama Mengambang di Pojok Kanan Atas (Selalu Terlihat & Mudah Ditekan) */}
      <button
        type="button"
        onClick={onClose}
        className="fixed top-3 right-3 sm:top-5 sm:right-5 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-2xl border-2 border-white/30 backdrop-blur-md transition-all active:scale-90 cursor-pointer"
        title="Tutup Teleprompter (Esc)"
        aria-label="Tutup Teleprompter"
      >
        <X className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* 
        BAGIAN ATAS: STRIP TIPIS 2px TANPA JEDA/GAP (Teks langsung menempel di kamera depan)
      */}
      <div
        style={{
          background: `linear-gradient(90deg, transparent, ${activeTheme.highlightColor}44, transparent)`,
        }}
        className="w-full h-1 shrink-0"
      />

      {/* 
        GARIS BANTU FOKUS MATA KE KAMERA (HANYA GARIS & PERSEN, TEKS DIHAPUS)
      */}
      {showFocusZone && (
        <div
          style={{ top: `${focusZonePosition}%` }}
          className="pointer-events-none absolute left-0 right-0 z-20 -translate-y-1/2 flex items-center justify-between px-4 sm:px-12 transition-all duration-150"
        >
          <div
            style={{
              background: `linear-gradient(90deg, ${activeTheme.highlightColor}aa, ${activeTheme.highlightColor}, ${activeTheme.highlightColor}aa)`,
              boxShadow: `0 0 10px ${activeTheme.highlightColor}88`,
            }}
            className="flex-1 h-0.5"
          />
          <span
            style={{
              color: activeTheme.highlightColor,
              borderColor: `${activeTheme.highlightColor}66`,
            }}
            className="text-xs font-mono font-bold bg-black/60 px-2 py-0.5 rounded border ml-2 drop-shadow-md"
          >
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
          <div
            style={{ color: activeTheme.highlightColor }}
            className="text-8xl sm:text-9xl font-black tracking-tight animate-bounce drop-shadow-[0_0_35px_rgba(251,191,36,0.6)]"
          >
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
          <div
            style={{
              borderColor: activeTheme.highlightColor,
              color: activeTheme.highlightColor,
            }}
            className="p-5 rounded-full bg-black/80 border shadow-2xl backdrop-blur-md"
          >
            {tapFeedback === 'play' ? (
              <Play className="w-10 h-10 fill-current" />
            ) : (
              <Pause className="w-10 h-10 fill-current" />
            )}
          </div>
        </div>
      )}

      {/* 
        AREA MEMBACA TELEPROMPTER UTAMA
        Teks langsung dimulai di tepi atas dekat kamera (pt-2).
        Rotasi otomatis mengecil (auto-scale) saat dirotasi agar tidak melebihi area layar hp.
        Tap layar untuk Mulai / Jeda.
      */}
      <main
        onClick={handleScreenTap}
        ref={scrollContainerRef}
        style={{
          scrollBehavior: 'auto',
          transform: rotation !== 0 ? `rotate(${rotation}deg) scale(${rotationScale})` : undefined,
          transformOrigin: 'center center',
        }}
        className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 md:px-16 pt-2 pb-36 scrollbar-none transition-transform duration-200 cursor-pointer"
      >
        <div
          style={{
            transform: isMirrored ? 'scaleX(-1)' : undefined,
            transformOrigin: 'center center',
          }}
          className={`space-y-10 transition-all duration-200 ${
            horizontalAlignment === 'left'
              ? 'max-w-3xl ml-4 sm:ml-12'
              : horizontalAlignment === 'right'
              ? 'max-w-3xl mr-4 sm:mr-12 ml-auto'
              : 'max-w-4xl mx-auto'
          }`}
        >
          {activeConcepts.map((concept) => (
            <section
              key={concept.id}
              className="space-y-6 border-b border-zinc-800/40 pb-12 last:border-b-0"
            >
              {/* Pemisah Antar-Konsep Sesuai Tema */}
              <div
                style={{
                  backgroundColor: activeTheme.cardBg,
                  borderColor: activeTheme.cardBorder,
                  color: activeTheme.cardTextColor,
                }}
                className="w-full my-4 p-4 sm:p-5 rounded-2xl border-2 shadow-xl flex flex-wrap items-center justify-between gap-3 select-none"
              >
                <div className="flex items-center gap-3">
                  <span
                    style={{ backgroundColor: activeTheme.highlightColor }}
                    className="w-3.5 h-3.5 rounded-full ring-4 ring-black/10 shrink-0"
                  />
                  <h2
                    style={{ color: activeTheme.cardTextColor }}
                    className="text-base sm:text-lg md:text-xl font-black tracking-tight uppercase"
                  >
                    {formatConceptDisplayTitle(concept.conceptNumber, concept.title, concept.angle)}
                  </h2>
                </div>
                <div
                  style={{
                    color: activeTheme.secondaryTextColor,
                    backgroundColor: activeTheme.id === 'light_clean' ? '#E4E4E7' : '#27272A',
                    borderColor: activeTheme.cardBorder,
                  }}
                  className="flex items-center gap-2 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl border shrink-0"
                >
                  <span>±{concept.estimatedDuration}s</span>
                  <span className="opacity-50">·</span>
                  <span>{concept.wordCount || 0} kata</span>
                </div>
              </div>

              {/* Teks Dialog dengan Spasi Antar-Bagian Lebih Lebar & Subtitle Jelas */}
              <div className="space-y-6 sm:space-y-8">
                {concept.lines.map((line) => (
                  <div
                    key={line.id}
                    style={{
                      fontSize: `${fontSize}px`,
                      lineHeight: activePreset.lineHeight || '1.45',
                      letterSpacing: activePreset.letterSpacing || 'normal',
                      color: activeTheme.textColor,
                      textShadow: activeTheme.id === 'light_clean' ? 'none' : activePreset.textShadow,
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
                            style={{ color: activeTheme.highlightColor }}
                            className="font-black uppercase tracking-wider"
                          >
                            {token.text}{' '}
                          </span>
                        );
                      }
                      if (token.type === 'pause-short') {
                        return (
                          <span
                            key={tIdx}
                            style={{ color: activeTheme.highlightColor }}
                            className="font-bold mx-1.5 opacity-80 select-none"
                            title="Jeda Intonasi"
                          >
                            /{' '}
                          </span>
                        );
                      }
                      if (token.type === 'pause-long') {
                        return (
                          <span
                            key={tIdx}
                            style={{ color: activeTheme.highlightColor }}
                            className="font-black mx-1.5 opacity-90 select-none"
                            title="Jeda Intonasi Panjang"
                          >
                            //{' '}
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
        - Diatur 3/4 layar dan diletakkan di sebelah kanan layar saja agar sebelah kiri dapat melihat perubahan teks secara langsung
        - Background abu-abu bergaya iOS dengan tombol sub-tab yang tampak aktif secara visual (tactile)
      */}
      {isSettingsOpen && !isPlaying && (
        <div className="no-tap-toggle fixed right-3 sm:right-6 bottom-20 z-50 w-[75vw] max-w-[360px] sm:max-w-[400px] bg-zinc-800/95 border border-zinc-600/70 rounded-2xl p-4 shadow-2xl space-y-3.5 text-xs text-zinc-200 animate-in slide-in-from-right-2 duration-150 backdrop-blur-xl max-h-[calc(100dvh-6.5rem)] overflow-y-auto">
          {/* Header Panel */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-700/80">
            <span className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Pengaturan Teleprompter</span>
            </span>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/70 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub-tabs Bergaya iOS: Teks, Countdown, Layar (Tampak Bisa Dipencet Walau Tidak Aktif) */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-900/90 rounded-xl border border-zinc-700/80">
            <button
              type="button"
              onClick={() => setSettingsTab('teks')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                settingsTab === 'teks'
                  ? 'bg-amber-500 text-black shadow-md ring-2 ring-amber-400/40'
                  : 'bg-zinc-700/90 hover:bg-zinc-600 text-zinc-100 border border-zinc-500/60 shadow-sm active:scale-95'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Teks</span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsTab('countdown')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                settingsTab === 'countdown'
                  ? 'bg-amber-500 text-black shadow-md ring-2 ring-amber-400/40'
                  : 'bg-zinc-700/90 hover:bg-zinc-600 text-zinc-100 border border-zinc-500/60 shadow-sm active:scale-95'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Countdown</span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsTab('layar')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                settingsTab === 'layar'
                  ? 'bg-amber-500 text-black shadow-md ring-2 ring-amber-400/40'
                  : 'bg-zinc-700/90 hover:bg-zinc-600 text-zinc-100 border border-zinc-500/60 shadow-sm active:scale-95'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Layar</span>
            </button>
          </div>

          {/* TAB 1: TEKS & SUBTITLE */}
          {settingsTab === 'teks' && (
            <div className="space-y-3.5">
              {/* 3 PRESET TEMA UTAMA TELEPROMPTER */}
              <div className="space-y-1.5 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-300">Tema Warna Teleprompter:</span>
                  <span className="font-bold text-amber-400">{activeTheme.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {(Object.values(TELEPROMPTER_THEMES)).map((t) => {
                    const isSelected = activeTheme.id === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          const updated = saveStoredPrompterTheme(t.id);
                          setInternalTheme(updated);
                          if (onSelectTheme) onSelectTheme(t.id);
                        }}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          isSelected
                            ? 'bg-zinc-800 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                            : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div
                          style={{ backgroundColor: t.previewSwatch.bg }}
                          className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center relative shadow-xs"
                        >
                          <span style={{ color: t.previewSwatch.text }} className="text-[10px] font-black">
                            T
                          </span>
                          <span
                            style={{ backgroundColor: t.previewSwatch.highlight }}
                            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-1 ring-black"
                          />
                        </div>
                        <span className={`text-[11px] font-bold truncate max-w-full ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                          {t.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

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
        style={{
          backgroundColor: activeTheme.dockBg,
          borderTopColor: activeTheme.dockBorder,
        }}
        className={`no-tap-toggle relative z-30 px-2 sm:px-4 py-2 border-t backdrop-blur-md shrink-0 pb-[max(env(safe-area-inset-bottom),8px)] transition-all duration-200 ${
          isPlaying
            ? 'opacity-35 hover:opacity-100 focus-within:opacity-100'
            : 'opacity-100'
        }`}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-1 sm:gap-2.5 w-full">
          {/* SISI KIRI: TOMBOL GESER (PALING KIRI), ROTASI (SEBELAH KANANNYA), RESET */}
          <div className="flex items-center gap-[clamp(2px,0.8vw,6px)] shrink-0">
            {/* 1. Tombol Pengatur Posisi (Geser) - PALING KIRI */}
            <button
              type="button"
              onClick={() => {
                setHorizontalAlignment((prev) =>
                  prev === 'center' ? 'left' : prev === 'left' ? 'right' : 'center'
                );
              }}
              className="w-[clamp(24px,6.8vw,34px)] h-[clamp(24px,6.8vw,34px)] flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer shrink-0 shadow-2xs"
              title={`Pengatur Posisi Geser Teleprompter (${horizontalAlignment === 'center' ? 'Tengah' : horizontalAlignment === 'left' ? 'Kiri' : 'Kanan'})`}
            >
              <Move className="w-[clamp(12px,3.5vw,16px)] h-[clamp(12px,3.5vw,16px)] text-amber-400" />
            </button>

            {/* 2. Tombol Rotasi Orientasi Teleprompter - SEBELAH KANAN TOMBOL GESER */}
            <button
              type="button"
              onClick={() => {
                setRotation((prev) => ((prev + 90) % 360) as 0 | 90 | 180 | 270);
              }}
              className="w-[clamp(24px,6.8vw,34px)] h-[clamp(24px,6.8vw,34px)] flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer relative shadow-2xs shrink-0"
              title={`Ubah Orientasi Rotasi Teleprompter (${rotation}°)`}
            >
              <RotateCw className="w-[clamp(12px,3.5vw,16px)] h-[clamp(12px,3.5vw,16px)] text-amber-400" />
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
              className="w-[clamp(24px,6.8vw,34px)] h-[clamp(24px,6.8vw,34px)] flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer shrink-0"
              title="Kembalikan Teks ke Posisi Awal (Reset / R)"
            >
              <RotateCcw className="w-[clamp(12px,3.5vw,16px)] h-[clamp(12px,3.5vw,16px)] text-zinc-400" />
            </button>

            {/* Konsep Selector Pill Buttons */}
            <div className="hidden md:flex items-center gap-1 bg-zinc-900 p-0.5 rounded-xl border border-zinc-700">
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
              {prompterConcepts.slice(0, 4).map((c, idx) => (
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
          <div className="flex items-center gap-[clamp(2px,0.8vw,6px)] justify-center shrink-1 min-w-0">
            {/* Speed Stepper (+ -) */}
            <div className="flex items-center h-[clamp(24px,6.8vw,34px)] bg-zinc-900 rounded-xl border border-zinc-700 p-0.5 shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => setSpeed((prev) => Math.max(1, prev - 1))}
                disabled={speed <= 1}
                className="w-[clamp(16px,4.5vw,22px)] h-full flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                title="Perlambat Kecepatan"
              >
                <Minus className="w-[clamp(10px,3vw,14px)] h-[clamp(10px,3vw,14px)]" />
              </button>
              <span className="font-mono font-bold text-[clamp(9px,2.6vw,12px)] px-1 text-amber-400 min-w-[20px] text-center" title="Kecepatan Gulir">
                {speed}x
              </span>
              <button
                type="button"
                onClick={() => setSpeed((prev) => Math.min(10, prev + 1))}
                disabled={speed >= 10}
                className="w-[clamp(16px,4.5vw,22px)] h-full flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                title="Percepat Kecepatan"
              >
                <Plus className="w-[clamp(10px,3vw,14px)] h-[clamp(10px,3vw,14px)]" />
              </button>
            </div>

            {/* Tombol Hero Mulai / Jeda (Icon Only) */}
            <button
              type="button"
              onClick={handleTogglePlay}
              className="w-[clamp(28px,8vw,38px)] h-[clamp(24px,6.8vw,34px)] flex items-center justify-center rounded-xl font-extrabold bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/25 transition-all cursor-pointer active:scale-95 shrink-0"
              title={isPlaying ? "Jeda Teks" : "Mulai Teks"}
            >
              {isPlaying ? (
                <Pause className="w-[clamp(12px,3.5vw,16px)] h-[clamp(12px,3.5vw,16px)] fill-black" />
              ) : (
                <Play className="w-[clamp(12px,3.5vw,16px)] h-[clamp(12px,3.5vw,16px)] fill-black ml-0.5" />
              )}
            </button>

            {/* Tombol Melayang Sejajar (Icon Only) */}
            <button
              type="button"
              onClick={handleActivateFloating}
              className="w-[clamp(24px,6.8vw,34px)] h-[clamp(24px,6.8vw,34px)] flex items-center justify-center rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold transition-all cursor-pointer shadow-2xs shrink-0"
              title="Buka Mode Melayang (PiP OS / Di Atas Aplikasi Lain)"
            >
              <PictureInPicture2 className="w-[clamp(12px,3.5vw,16px)] h-[clamp(12px,3.5vw,16px)] text-amber-400" />
            </button>
          </div>

          {/* SISI KANAN: MENU PENGATURAN, FULLSCREEN & TOMBOL MINIMIZE (-) SEJAJAR DENGAN TUTUP */}
          <div className="flex items-center gap-[clamp(2px,0.8vw,6px)] shrink-0">
            {/* Ikon Menu Setting Gabungan (Teks, Hitung Mundur, Layar) */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              className={`w-[clamp(24px,6.8vw,34px)] h-[clamp(24px,6.8vw,34px)] flex items-center justify-center rounded-xl border transition-all cursor-pointer shadow-2xs ${
                isSettingsOpen
                  ? 'bg-amber-500 text-black border-amber-500'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700'
              }`}
              title="Menu Pengaturan (Teks, Hitung Mundur, Layar)"
            >
              <SlidersHorizontal className="w-[clamp(12px,3.5vw,16px)] h-[clamp(12px,3.5vw,16px)]" />
            </button>

            {/* Fullscreen (Hanya layar medium+) */}
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="hidden md:flex w-[clamp(24px,6.8vw,34px)] h-[clamp(24px,6.8vw,34px)] items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer"
              title="Layar Penuh"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Tombol Minimize (-) */}
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="w-[clamp(24px,6.8vw,34px)] h-[clamp(24px,6.8vw,34px)] flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-2xs"
              title="Minimize Teleprompter (-)"
            >
              <Minus className="w-[clamp(12px,3.5vw,16px)] h-[clamp(12px,3.5vw,16px)]" />
            </button>

            {/* Tombol Tutup - Merah Kontras Tinggi, Selalu Terlihat Jelas */}
            <button
              type="button"
              onClick={onClose}
              className="w-[clamp(24px,6.8vw,34px)] h-[clamp(24px,6.8vw,34px)] flex items-center justify-center rounded-xl bg-red-500/25 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/60 shadow-2xs transition-all cursor-pointer shrink-0"
              title="Tutup Teleprompter (Esc)"
            >
              <X className="w-[clamp(12px,3.5vw,16px)] h-[clamp(12px,3.5vw,16px)] stroke-[2.5]" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
