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
  EyeOff,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Timer,
  Volume2,
  PictureInPicture2,
} from 'lucide-react';
import { ScriptItem, ProductBrief } from '../types';
import {
  buildPrompterConcept,
  extractProductKeywords,
  PrompterConcept,
} from '../utils/prompterFormatter';

interface TeleprompterModalProps {
  isOpen: boolean;
  onClose: () => void;
  scripts: ScriptItem[];
  initialConceptIndex?: number; // 0-based index or -1 for "all concepts"
  productBrief?: ProductBrief;
  onOpenFloatingPrompter?: (conceptIdx?: number) => void;
}

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
  const [speed, setSpeed] = useState<number>(4); // Range 1 - 10 (default 4 = ~40px/s)
  const [fontSize, setFontSize] = useState<number>(36); // px (range 22 - 64)
  const [isMirrored, setIsMirrored] = useState<boolean>(false);
  const [showFocusZone, setShowFocusZone] = useState<boolean>(true);
  const [focusZonePosition, setFocusZonePosition] = useState<number>(35); // % from top (default 35% eye line)
  const [useCountdown, setUseCountdown] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedConceptIndex, setSelectedConceptIndex] = useState<number>(initialConceptIndex);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);

  // References untuk smooth requestAnimationFrame scroll
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const scrollAccumulatorRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(isPlaying);

  // Sinkronisasi ref isPlaying
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Sinkronisasi selectedConceptIndex saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setSelectedConceptIndex(initialConceptIndex);
      setIsPlaying(false);
      setIsCountingDown(false);
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

  // Perhitungan kecepatan pixel per detik (Speed 1: 15px/s, Speed 10: 135px/s)
  const pixelsPerSecond = Math.max(12, speed * 13);

  // Animasi auto-scroll menggunakan requestAnimationFrame
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

        // Cek jika sudah mencapai dasar teks
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

  // Start / Stop scroll loop
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

  // Hitung mundur sebelum mulai
  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      setIsCountingDown(false);
      return;
    }

    if (useCountdown) {
      setIsCountingDown(true);
      setCountdownValue(3);
    } else {
      setIsPlaying(true);
    }
  }, [isPlaying, useCountdown]);

  // Efek interval countdown
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isCountingDown) {
      if (countdownValue > 1) {
        timer = setTimeout(() => {
          setCountdownValue((prev) => prev - 1);
        }, 800);
      } else if (countdownValue === 1) {
        timer = setTimeout(() => {
          setIsCountingDown(false);
          setIsPlaying(true);
        }, 800);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isCountingDown, countdownValue]);

  // Reset teks ke posisi paling atas
  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setIsCountingDown(false);
    scrollAccumulatorRef.current = 0;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Toggle fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalContainerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Abaikan jika sedang mengetik di input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleReset();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsMirrored((prev) => !prev);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleToggleFullscreen();
      } else if (e.key === 'Escape') {
        if (isCountingDown) {
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

  if (!isOpen) return null;

  return (
    <div
      ref={modalContainerRef}
      className="fixed inset-0 z-50 flex flex-col bg-black text-white font-sans select-none overflow-hidden"
      style={{ backgroundColor: '#000000' }}
    >
      {/* TOP HEADER CONTROLS */}
      <header className="relative z-30 flex items-center justify-between px-3 sm:px-6 py-2.5 bg-zinc-950/90 border-b border-zinc-800/80 backdrop-blur-md shrink-0">
        {/* Kiri: Judul & Konsep Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-1 scrollbar-none">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Teleprompter Affiliator</span>
          </div>

          {/* Konsep Selector Pill Buttons */}
          <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-xl border border-zinc-800 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSelectedConceptIndex(-1);
                handleReset();
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedConceptIndex === -1
                  ? 'bg-amber-500 text-black shadow-xs font-bold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Semua ({prompterConcepts.length})
            </button>
            {prompterConcepts.map((c, idx) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelectedConceptIndex(idx);
                  handleReset();
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedConceptIndex === idx
                    ? 'bg-amber-500 text-black shadow-xs font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                #{idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Kanan: Quick Toggles & Tombol Tutup */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mirror Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsMirrored(!isMirrored)}
            className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isMirrored
                ? 'bg-amber-500 text-black border-amber-500 font-bold'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
            }`}
            title="Mirror Mode: Balik teks horizontal (Kaca Teleprompter / Kamera Depan)"
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>

          {/* Focus Zone Toggle */}
          <button
            type="button"
            onClick={() => setShowFocusZone(!showFocusZone)}
            className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              showFocusZone
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-500 border-zinc-800'
            }`}
            title="Garis Bantu Fokus Mata (Reading Focus Zone)"
          >
            {showFocusZone ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Mode Melayang (Floating Prompter) Button */}
          {onOpenFloatingPrompter && (
            <button
              type="button"
              onClick={() => {
                onOpenFloatingPrompter(selectedConceptIndex);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow-sm transition-all cursor-pointer"
              title="Mode Melayang: Ubah jendela teleprompter menjadi widget kecil yang bisa digeser dan tembus pandang di atas layar"
            >
              <PictureInPicture2 className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Mode Melayang</span>
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="hidden sm:inline-flex p-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer"
            title="Layar Penuh (F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Tutup Modal */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/40 border border-zinc-800 transition-all cursor-pointer"
            title="Tutup (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* READING FOCUS ZONE GUIDE BAND (TRANSLUCENT EYE-LINE GUIDELINE) */}
      {showFocusZone && (
        <div
          className="pointer-events-none absolute left-0 right-0 z-20 transition-all duration-200"
          style={{ top: `${focusZonePosition}%`, transform: 'translateY(-50%)' }}
        >
          <div className="relative mx-auto max-w-4xl h-16 sm:h-20 border-y border-emerald-500/30 bg-emerald-500/10 backdrop-blur-2xs flex items-center justify-between px-3 sm:px-6">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-emerald-400 tracking-wider uppercase opacity-80">
              <span>▶</span>
              <span className="hidden sm:inline">GARIS BANTU MATA KE KAMERA</span>
              <span className="sm:hidden">MATA SEJAJAR KAMERA</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-emerald-400 tracking-wider uppercase opacity-80">
              <span className="hidden sm:inline">BACA PADA AREA INI</span>
              <span>◀</span>
            </div>
          </div>
        </div>
      )}

      {/* COUNTDOWN OVERLAY */}
      {isCountingDown && (
        <div
          onClick={() => {
            setIsCountingDown(false);
            setIsPlaying(true);
          }}
          className="absolute inset-0 z-40 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center cursor-pointer animate-in fade-in duration-150"
        >
          <div className="text-8xl sm:text-9xl font-black text-amber-400 tracking-tight animate-bounce drop-shadow-[0_0_35px_rgba(251,191,36,0.6)]">
            {countdownValue}
          </div>
          <p className="mt-4 text-sm sm:text-base font-semibold text-zinc-300">
            Teks segera bergulir... (Klik di mana saja untuk langsung mulai)
          </p>
        </div>
      )}

      {/* MAIN TELEPROMPTER SCROLL CONTAINER */}
      <main
        ref={scrollContainerRef}
        className={`flex-1 overflow-y-auto px-4 sm:px-8 md:px-16 pt-24 pb-48 scrollbar-none transition-transform duration-150 ${
          isMirrored ? 'scale-x-[-1]' : ''
        }`}
        style={{ scrollBehavior: 'auto' }}
      >
        <div className="max-w-4xl mx-auto space-y-12">
          {activeConcepts.map((concept, cIdx) => (
            <section
              key={concept.id}
              className="space-y-6 border-b border-zinc-900 pb-12 last:border-b-0"
            >
              {/* Header Penanda Konsep */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-white font-bold">KONSEP #{concept.conceptNumber}:</span>
                <span className="text-zinc-300">{concept.title}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-amber-400 font-medium">{concept.angle}</span>
                <span className="text-zinc-600">·</span>
                <span>±{concept.estimatedDuration}s</span>
              </div>

              {/* Teks Per Kalimat: Satu Kalimat Satu Baris dengan Jeda & Penekanan */}
              <div className="space-y-6 sm:space-y-8">
                {concept.lines.map((line) => (
                  <div
                    key={line.id}
                    className="leading-snug tracking-wide transition-all font-bold text-zinc-100 selection:bg-amber-400 selection:text-black"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {line.tokens.map((token, tIdx) => {
                      if (token.type === 'pause-short') {
                        return (
                          <span
                            key={tIdx}
                            className="inline-block mx-2 text-emerald-400 font-black opacity-85 select-none"
                            title="Jeda Pendek (Koma)"
                          >
                            /
                          </span>
                        );
                      }

                      if (token.type === 'pause-long') {
                        return (
                          <span
                            key={tIdx}
                            className="inline-block ml-2 text-teal-400 font-black opacity-90 select-none"
                            title="Jeda Panjang & Penekanan (Titik)"
                          >
                            {token.text}
                          </span>
                        );
                      }

                      if (token.type === 'emphasis') {
                        return (
                          <span
                            key={tIdx}
                            className="text-amber-300 font-black uppercase tracking-wider drop-shadow-[0_0_8px_rgba(252,211,77,0.35)]"
                          >
                            {token.text}{' '}
                          </span>
                        );
                      }

                      if (token.type === 'promo') {
                        return (
                          <span
                            key={tIdx}
                            className="text-emerald-300 font-black uppercase tracking-wider underline decoration-emerald-500/50 underline-offset-4"
                          >
                            {token.text}{' '}
                          </span>
                        );
                      }

                      if (token.type === 'cta') {
                        return (
                          <span
                            key={tIdx}
                            className="text-yellow-400 font-black uppercase tracking-wider bg-yellow-400/10 px-1 rounded-sm"
                          >
                            {token.text}{' '}
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

          {/* Bottom Buffer agar teks terakhir dapat bergulir ke garis baca tengah */}
          <div className="h-96 flex flex-col items-center justify-center text-zinc-700 text-xs font-semibold gap-2 border-t border-zinc-900 pt-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60"></span>
            <span>--- AKHIR SKRIP AFFILIATE ---</span>
            <button
              type="button"
              onClick={handleReset}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Kembali ke Awal</span>
            </button>
          </div>
        </div>
      </main>

      {/* FLOATING BOTTOM CONTROL BAR */}
      <footer className="relative z-30 px-3 sm:px-6 py-3 bg-zinc-950/95 border-t border-zinc-800/80 backdrop-blur-md shrink-0">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Kelompok Kontrol Utama: Play/Pause & Reset */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTogglePlay}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer ${
                isPlaying
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/30'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-900/30'
              }`}
              title="Mulai / Jeda (Tombol Spasi)"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Jeda</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Mulai Baca</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors cursor-pointer"
              title="Reset ke Baris Paling Atas (R)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* Hint shortcut */}
            <span className="hidden lg:inline text-[11px] text-zinc-500 font-mono ml-1">
              [Spasi: Jeda | R: Reset]
            </span>
          </div>

          {/* Kelompok Speed & Font Controls */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Speed Control */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-400 shrink-0">Kecepatan:</span>
              <button
                type="button"
                onClick={() => setSpeed((prev) => Math.max(1, prev - 1))}
                className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center justify-center cursor-pointer"
                title="Perlambat (Panah Bawah)"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="w-16 sm:w-20">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                />
              </div>

              <button
                type="button"
                onClick={() => setSpeed((prev) => Math.min(10, prev + 1))}
                className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center justify-center cursor-pointer"
                title="Percepat (Panah Atas)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold text-amber-400 w-6 text-center">{speed}x</span>
            </div>

            {/* Font Size Control */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-zinc-400 shrink-0">Font:</span>
              <button
                type="button"
                onClick={() => setFontSize((prev) => Math.max(22, prev - 4))}
                className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center justify-center cursor-pointer text-xs font-bold"
                title="Perkecil Font"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontSize((prev) => Math.min(64, prev + 4))}
                className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center justify-center cursor-pointer text-xs font-bold"
                title="Perbesar Font"
              >
                A+
              </button>
              <span className="text-xs text-zinc-400 w-7 text-center font-mono">{fontSize}</span>
            </div>

            {/* Settings Drawer Toggle (Countdown & Guide position) */}
            <button
              type="button"
              onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
              className={`p-2 rounded-xl text-xs border transition-all cursor-pointer ${
                showSettingsDrawer
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
              title="Opsi Lanjutan"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SETTINGS DRAWER OVERLAY */}
        {showSettingsDrawer && (
          <div className="max-w-4xl mx-auto mt-3 pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-300 animate-in slide-in-from-bottom-2 duration-150">
            <div className="flex flex-wrap items-center gap-4">
              {/* Hitung Mundur Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCountdown}
                  onChange={(e) => setUseCountdown(e.target.checked)}
                  className="rounded accent-amber-500"
                />
                <span>Hitung Mundur 3 Detik Sebelum Mulai</span>
              </label>

              {/* Posisi Garis Fokus */}
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">Posisi Garis Mata:</span>
                <button
                  type="button"
                  onClick={() => setFocusZonePosition(25)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    focusZonePosition === 25 ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400'
                  }`}
                >
                  Atas (25%)
                </button>
                <button
                  type="button"
                  onClick={() => setFocusZonePosition(35)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    focusZonePosition === 35 ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400'
                  }`}
                >
                  Ideal Kamera (35%)
                </button>
                <button
                  type="button"
                  onClick={() => setFocusZonePosition(50)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    focusZonePosition === 50 ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400'
                  }`}
                >
                  Tengah (50%)
                </button>
              </div>
            </div>

            <div className="text-[11px] text-zinc-500 font-mono">
              Petunjuk: <span className="text-emerald-400 font-bold">/</span> = Jeda Pendek ·{' '}
              <span className="text-teal-400 font-bold">//</span> = Jeda Titik ·{' '}
              <span className="text-amber-300 font-bold">KAPITAL</span> = Penekanan Suara
            </div>
          </div>
        )}
      </footer>
    </div>
  );
};
