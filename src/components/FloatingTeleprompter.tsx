/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Maximize2,
  X,
  FlipHorizontal,
  Move,
  ChevronUp,
  PictureInPicture2,
  Eye,
  Type,
  Gauge,
  SlidersHorizontal,
  Check,
  Smartphone,
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

interface FloatingTeleprompterProps {
  isOpen: boolean;
  onClose: () => void;
  onExpandToFull: () => void;
  scripts: ScriptItem[];
  conceptIndex?: number;
  productBrief?: ProductBrief;
  onOpenPermissionGuide?: () => void;
}

export type SettingsTabId = 'teks' | 'countdown' | 'layar';

// Kurva kecepatan yang jauh lebih lambat (Speed 1 sangat santai: 2.5 px/detik)
const SPEED_CURVE = [2.5, 4.5, 7.5, 11, 16, 23, 32, 43, 56, 72];

export const FloatingTeleprompter: React.FC<FloatingTeleprompterProps> = ({
  isOpen,
  onClose,
  onExpandToFull,
  scripts,
  conceptIndex = -1,
  productBrief,
  onOpenPermissionGuide,
}) => {
  // Posisi dan ukuran widget melayang
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 16, y: 32 });
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 340, height: 440 });
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [opacity, setOpacity] = useState<number>(85); // 10% - 100% (Berlaku untuk seluruh tampilan)

  // Menu setelan terbuka & sub-tab aktif
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTabId>('teks');

  // Kontrol pembacaan prompter
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);
  const [countdownValue, setCountdownValue] = useState<number>(3);
  const [countdownEnabled, setCountdownEnabled] = useState<boolean>(true); // Setting countdown aktif/nonaktif
  const [countdownDuration, setCountdownDuration] = useState<3 | 5 | 10>(3); // 3, 5, atau 10 detik

  const [speed, setSpeed] = useState<number>(3); // Range 1 - 10 (Speed 1 sangat lambat)
  const [fontSize, setFontSize] = useState<number>(18); // Range 7 - 48 px (Mulai dari 7)
  const [isMirrored, setIsMirrored] = useState<boolean>(false);
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0); // Rotasi manual 0, 90, 180, 270 derajat
  const [selectedConceptIdx, setSelectedConceptIdx] = useState<number>(conceptIndex);

  // Preset Subtitle (#1 Standard Read sebagai DEFAULT)
  const [activePresetId, setActivePresetId] = useState<SubtitlePresetId>('standard_read');

  // Fokus Tatap Mata (Hanya garis & angka persen, teks 'fokus mata' dihapus)
  const [showFocusGuide, setShowFocusGuide] = useState<boolean>(true);
  const [focusGuidePosition, setFocusGuidePosition] = useState<number>(12); // % dari atas

  // Feedback animasi tap layar
  const [tapFeedback, setTapFeedback] = useState<'play' | 'pause' | null>(null);

  // References
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const isResizingRef = useRef<boolean>(false);
  const dragStartOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const resizeStartRef = useRef<{ startX: number; startY: number; startW: number; startH: number }>({
    startX: 0,
    startY: 0,
    startW: 0,
    startH: 0,
  });

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const scrollAccumulatorRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(isPlaying);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    setSelectedConceptIdx(conceptIndex);
  }, [conceptIndex]);

  // Selalu pastikan posisi & ukuran teleprompter berada di area layar hp (baik mode portrait maupun landscape)
  useEffect(() => {
    if (!isOpen) return;

    const clampToScreen = () => {
      const vw = typeof window !== 'undefined' ? window.innerWidth : 360;
      const vh = typeof window !== 'undefined' ? window.innerHeight : 640;

      const maxW = Math.max(200, vw - 16);
      const maxH = Math.max(160, vh - 16);

      setSize((prevSize) => {
        const clampedW = Math.min(Math.max(200, prevSize.width), maxW);
        const clampedH = Math.min(Math.max(160, prevSize.height), maxH);
        return { width: clampedW, height: clampedH };
      });

      setPosition((prevPos) => {
        const curW = isMinimized ? 160 : Math.min(340, maxW);
        const curH = isMinimized ? 50 : Math.min(440, maxH);
        const maxX = Math.max(8, vw - curW - 8);
        const maxY = Math.max(8, vh - curH - 8);
        return {
          x: Math.min(Math.max(8, prevPos.x), maxX),
          y: Math.min(Math.max(8, prevPos.y), maxY),
        };
      });
    };

    window.addEventListener('resize', clampToScreen);
    window.addEventListener('orientationchange', clampToScreen);
    clampToScreen();

    return () => {
      window.removeEventListener('resize', clampToScreen);
      window.removeEventListener('orientationchange', clampToScreen);
    };
  }, [isOpen, isMinimized]);

  // Format skrip
  const productKeywords = React.useMemo(() => {
    return extractProductKeywords(productBrief?.name);
  }, [productBrief?.name]);

  const prompterConcepts: PrompterConcept[] = React.useMemo(() => {
    return scripts.map((script, idx) =>
      buildPrompterConcept(script, idx + 1, productKeywords)
    );
  }, [scripts, productKeywords]);

  const activeConcepts = React.useMemo(() => {
    if (selectedConceptIdx >= 0 && selectedConceptIdx < prompterConcepts.length) {
      return [prompterConcepts[selectedConceptIdx]];
    }
    return prompterConcepts;
  }, [prompterConcepts, selectedConceptIdx]);

  const activePreset = React.useMemo(() => {
    return SUBTITLE_PRESETS.find((p) => p.id === activePresetId) || SUBTITLE_PRESETS[0];
  }, [activePresetId]);

  // Kecepatan piksel per detik (Speed 1 = 2.5px/s sangat tenang & santai)
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

  // Dragging logic (Bisa digeser via strip atas ATAU bilah setelan bawah)
  const handlePointerDownDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, input, select')) return;
    isDraggingRef.current = true;
    dragStartOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const maxX = Math.max(5, window.innerWidth - (isMinimized ? 160 : size.width) - 5);
    const maxY = Math.max(5, window.innerHeight - (isMinimized ? 50 : size.height) - 5);
    const newX = Math.min(Math.max(5, e.clientX - dragStartOffsetRef.current.x), maxX);
    const newY = Math.min(Math.max(5, e.clientY - dragStartOffsetRef.current.y), maxY);
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUpDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Resize logic (Bisa diubah ukuran besar/kecil dengan drag sudut)
  const handlePointerDownResize = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    isResizingRef.current = true;
    resizeStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: size.width,
      startH: size.height,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveResize = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizingRef.current) return;
    const dx = e.clientX - resizeStartRef.current.startX;
    const dy = e.clientY - resizeStartRef.current.startY;
    const maxAvailableW = Math.max(200, window.innerWidth - position.x - 8);
    const maxAvailableH = Math.max(160, window.innerHeight - position.y - 8);
    const newW = Math.min(Math.max(200, resizeStartRef.current.startW + dx), maxAvailableW);
    const newH = Math.min(Math.max(160, resizeStartRef.current.startH + dy), maxAvailableH);
    setSize({ width: newW, height: newH });
  };

  const handlePointerUpResize = (e: React.PointerEvent<HTMLDivElement>) => {
    isResizingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Mulai dengan Countdown jika aktif
  const triggerPlay = () => {
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
  };

  // Tap layar untuk Mulai / Jeda
  const handleScreenTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, input, select, .no-tap-toggle')) {
      return;
    }
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
  };

  // Reset scroll ke baris paling atas
  const handleReset = () => {
    setIsPlaying(false);
    setIsCountingDown(false);
    scrollAccumulatorRef.current = 0;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Tombol Fitur Melayang (PiP OS / Android Native) - DI TEMPATKAN DI DEPAN (UTAMA)
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
        showFocusGuide,
        focusGuidePercent: focusGuidePosition,
        countdownSec: countdownEnabled ? countdownDuration : 0,
      });
      if (launched) return;
    }

    // 2. Jika di Web Browser: gunakan Document Picture-in-Picture
    if (isDocumentPipSupported()) {
      try {
        const containerClone = document.createElement('div');
        containerClone.style.padding = '12px';
        containerClone.style.color = activePreset.textColor;
        containerClone.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        containerClone.style.fontSize = `${fontSize}px`;
        containerClone.style.lineHeight = '1.45';
        containerClone.style.textShadow = activePreset.textShadow;
        containerClone.style.whiteSpace = 'pre-wrap';

        const fullText = activeConcepts
          .map((c) => `=== ${c.title} ===\n\n` + c.lines.map((l) => l.rawText).join('\n'))
          .join('\n\n------------------------\n\n');
        containerClone.innerText = fullText;

        const pipWin = await openDocumentPip(containerClone, {
          width: size.width,
          height: size.height,
          title: 'Manuskrip Teleprompter Melayang',
        });
        if (pipWin) {
          return;
        }
      } catch (err) {
        console.warn('PiP notice, fallback to permission guide:', err);
      }
    }
    onOpenPermissionGuide?.();
  };

  if (!isOpen) return null;

  // Mode Minimized Bubble
  if (isMinimized) {
    return (
      <div
        ref={widgetRef}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          touchAction: 'none',
        }}
        onPointerDown={handlePointerDownDrag}
        onPointerMove={handlePointerMoveDrag}
        onPointerUp={handlePointerUpDrag}
        className="fixed z-[9999] flex items-center gap-2 px-3 py-2 rounded-full bg-black/95 text-white border border-amber-500/70 shadow-2xl backdrop-blur-md cursor-grab active:cursor-grabbing select-none"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-bold text-amber-300">Prompter</span>
        <button
          type="button"
          onClick={() => {
            if (isPlaying) {
              setIsPlaying(false);
            } else {
              triggerPlay();
            }
          }}
          className="p-1 rounded-full bg-amber-500 hover:bg-amber-400 text-black transition-all cursor-pointer"
          title={isPlaying ? 'Jeda' : 'Mulai'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-black" />}
        </button>
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="p-1 rounded-full hover:bg-zinc-800 text-zinc-300 transition-all cursor-pointer"
          title="Buka Ukuran Normal"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full hover:bg-zinc-800 text-red-400 transition-all cursor-pointer"
          title="Tutup"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={widgetRef}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        backgroundColor: `rgba(0, 0, 0, ${opacity / 100})`, // Opasitas murni untuk seluruh tampilan widget (tanpa blur buram)
        touchAction: 'none',
      }}
      className="fixed z-[9999] flex flex-col rounded-2xl border border-zinc-700/80 shadow-2xl select-none overflow-hidden transition-colors"
    >
      {/* 
        BAGIAN ATAS: STRIP TIPIS DRAG HANDLE (TANPA TOMBOL BESAR / PENGHAMBAT)
        Teks langsung menempel di bawah garis ini tepat dekat kamera.
      */}
      <div
        onPointerDown={handlePointerDownDrag}
        onPointerMove={handlePointerMoveDrag}
        onPointerUp={handlePointerUpDrag}
        className="w-full h-2 bg-zinc-800/40 hover:bg-amber-500/40 cursor-grab active:cursor-grabbing transition-colors shrink-0 flex items-center justify-center group"
        title="Pegang strip ini untuk menggeser posisi teleprompter di layar"
      >
        <div className="w-8 h-1 rounded-full bg-zinc-600 group-hover:bg-amber-400 transition-colors" />
      </div>

      {/* 
        AREA MEMBACA TELEPROMPTER UTAMA
        Teks flush tepat di atas dekat kamera. Tap layar untuk Mulai / Jeda.
      */}
      <div
        onClick={handleScreenTap}
        className="relative flex-1 overflow-hidden cursor-pointer"
      >
        {/* Garis Panduan Tatap Mata (HANYA GARIS & KETERANGAN PERSEN SAJA, teks dihapus) */}
        {showFocusGuide && (
          <div
            style={{ top: `${focusGuidePosition}%` }}
            className="pointer-events-none absolute left-0 right-0 z-20 -translate-y-1/2 flex items-center justify-between px-2"
          >
            <div className="flex-1 h-0.5 bg-gradient-to-r from-amber-500/80 via-amber-300 to-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            <span className="text-[10px] text-amber-300 font-mono font-bold pl-1.5 drop-shadow-md">
              {focusGuidePosition}%
            </span>
          </div>
        )}

        {/* Feedback visual animasi Tap Mulai / Jeda */}
        {tapFeedback && (
          <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center animate-out fade-out zoom-out duration-400">
            <div className="p-4 rounded-full bg-black/80 border border-amber-400 text-amber-400 shadow-2xl backdrop-blur-md">
              {tapFeedback === 'play' ? (
                <Play className="w-7 h-7 fill-amber-400" />
              ) : (
                <Pause className="w-7 h-7 fill-amber-400" />
              )}
            </div>
          </div>
        )}

        {/* Hitung Mundur Overlay */}
        {isCountingDown && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsCountingDown(false);
              setIsPlaying(true);
            }}
            className="absolute inset-0 z-40 bg-black/85 flex flex-col items-center justify-center cursor-pointer animate-in fade-in duration-150"
          >
            <div className="text-7xl font-black text-amber-400 animate-bounce drop-shadow-[0_0_25px_rgba(251,191,36,0.6)]">
              {countdownValue}
            </div>
            <p className="mt-2 text-[11px] text-zinc-300">
              Ketuk untuk langsung mulai
            </p>
          </div>
        )}

        {/* Kontainer Teks Bergulir */}
        <div
          ref={scrollContainerRef}
          className="w-full h-full overflow-y-auto px-3 pt-1 pb-16 scroll-smooth select-none"
        >
          <div
            style={{
              transform: `${rotation !== 0 ? `rotate(${rotation}deg)` : ''} ${isMirrored ? 'scaleX(-1)' : ''}`.trim() || undefined,
              transformOrigin: 'center center',
            }}
            className="transition-transform duration-200"
          >
            {activeConcepts.map((concept, cIdx) => (
              <div key={concept.id || cIdx} className="space-y-2.5 mb-6">
                {/* Badge Judul Konsep Ringkas */}
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700/80 text-[10px] font-bold text-amber-400">
                  <span>Konsep {concept.conceptNumber}:</span>
                  <span className="text-zinc-200">{concept.title}</span>
                </div>

                {/* Baris Dialog dengan Gaya Subtitle Aktif */}
                <div className="space-y-2">
                  {concept.lines.map((line, lIdx) => (
                    <div
                      key={line.id || lIdx}
                      style={{
                        fontSize: `${fontSize}px`,
                        lineHeight: '1.45',
                        color: activePreset.textColor,
                        textShadow: activePreset.textShadow,
                        fontWeight: activePreset.fontWeight,
                        backgroundColor: activePreset.pillBg || 'transparent',
                      }}
                      className={`transition-all duration-150 ${
                        activePreset.pillBg ? 'px-2.5 py-1 rounded-xl ' + (activePreset.borderClass || '') : ''
                      }`}
                    >
                      {line.tokens.map((token, tIdx) => {
                        if (token.type === 'emphasis' || token.type === 'promo' || token.type === 'cta') {
                          return (
                            <span
                              key={tIdx}
                              style={{
                                color: activePreset.highlightColor,
                              }}
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
              </div>
            ))}

            {/* Buffer bawah */}
            <div className="h-44 flex items-center justify-center text-[10px] text-zinc-500 font-medium">
              - Selesai Membaca -
            </div>
          </div>
        </div>
      </div>

      {/* 
        PANEL PENGATURAN TERPADU TELEPROMPTER MENGAMBANG (TEKS & SUBTITLE, HITUNG MUNDUR, LAYAR)
      */}
      {isSettingsOpen && !isPlaying && (
        <div className="no-tap-toggle absolute bottom-16 left-2 right-2 z-40 bg-zinc-950/95 border border-zinc-700/80 rounded-2xl p-3 shadow-2xl space-y-2.5 text-xs text-zinc-300 animate-in slide-in-from-bottom-2 duration-150 backdrop-blur-md max-h-[75%] overflow-y-auto">
          {/* Header Panel */}
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
            <span className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Pengaturan Teleprompter</span>
            </span>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sub-tabs Minimalis: Teks, Hitung Mundur, Layar */}
          <div className="flex items-center gap-1 p-0.5 bg-zinc-900 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setSettingsTab('teks')}
              className={`flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                settingsTab === 'teks'
                  ? 'bg-amber-500 text-black font-bold shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Type className="w-3 h-3" />
              <span>Teks</span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsTab('countdown')}
              className={`flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                settingsTab === 'countdown'
                  ? 'bg-amber-500 text-black font-bold shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Timer className="w-3 h-3" />
              <span>Countdown</span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsTab('layar')}
              className={`flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                settingsTab === 'layar'
                  ? 'bg-amber-500 text-black font-bold shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Layar</span>
            </button>
          </div>

          {/* TAB 1: TEKS & SUBTITLE */}
          {settingsTab === 'teks' && (
            <div className="space-y-3">
              {/* Ukuran Font (Mulai dari 7px!) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">Ukuran Font (Mulai dari 7px):</span>
                  <span className="font-mono font-bold text-amber-400">{fontSize}px</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="7"
                    max="48"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* 10 Preset Subtitle */}
              <div className="space-y-1">
                <span className="text-[11px] text-zinc-400 block font-medium">Pilih 10 Gaya Subtitle Siap Rekam:</span>
                <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto pr-1">
                  {SUBTITLE_PRESETS.map((preset) => {
                    const isSelected = preset.id === activePresetId;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setActivePresetId(preset.id)}
                        className={`flex items-center justify-between p-1.5 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 border border-amber-500/60'
                            : 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            style={{
                              color: preset.textColor,
                              textShadow: preset.textShadow,
                              fontWeight: preset.fontWeight,
                            }}
                            className="text-xs px-1.5 py-0.5 rounded bg-black/70 border border-zinc-700 font-bold shrink-0"
                          >
                            Aa
                          </span>
                          <span className="text-xs font-semibold text-white truncate">{preset.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HITUNG MUNDUR (COUNTDOWN) */}
          {settingsTab === 'countdown' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] text-zinc-300 font-semibold">Hitung Mundur (Countdown):</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCountdownEnabled((e) => !e)}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                    countdownEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {countdownEnabled ? 'Aktif' : 'Nonaktif'}
                </button>
              </div>

              {countdownEnabled && (
                <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                  <span className="text-[10px] text-zinc-400 block font-medium">Pilih Durasi:</span>
                  <div className="flex items-center gap-1.5">
                    {([3, 5, 10] as const).map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setCountdownDuration(sec)}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
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
            <div className="space-y-3">
              {/* Slider Transparansi Menyeluruh */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">Transparansi Latar Belakang:</span>
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

              {/* Posisi Garis Fokus Mata */}
              <div className="space-y-1 pt-1.5 border-t border-zinc-800">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">Garis Panduan Kamera:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowFocusGuide((g) => !g)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                        showFocusGuide
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      {showFocusGuide ? 'Aktif' : 'Off'}
                    </button>
                    <span className="font-mono font-bold text-amber-400">{focusGuidePosition}%</span>
                  </div>
                </div>
                {showFocusGuide && (
                  <input
                    type="range"
                    min="5"
                    max="75"
                    value={focusGuidePosition}
                    onChange={(e) => setFocusGuidePosition(Number(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg accent-amber-500 cursor-pointer"
                  />
                )}
              </div>

              {/* Opsi Mirror Kaca */}
              <div className="pt-1.5 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">Mirror Kaca Teleprompter:</span>
                <button
                  type="button"
                  onClick={() => setIsMirrored((m) => !m)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isMirrored
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
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
        BAGIAN BAWAH: NAVIGASI UTAMA TELEPROMPTER MENGAMBANG (SINGLE CLEAN DOCK)
        - Speed Stepper (+ -) ditempatkan sejajar langsung dengan Mulai dan tombol Full
        - Countdown dan Teks digabungkan di Menu Pengaturan sebelah kanan
        - Menu dibuat dalam bentuk ikon minimalis, konsisten, dan mudah dikenali
      */}
      <div
        onPointerDown={handlePointerDownDrag}
        onPointerMove={handlePointerMoveDrag}
        onPointerUp={handlePointerUpDrag}
        className={`no-tap-toggle w-full px-2 py-1.5 bg-zinc-950/80 border-t border-zinc-800/80 text-white shrink-0 transition-all duration-300 cursor-grab active:cursor-grabbing ${
          isPlaying
            ? 'opacity-0 translate-y-12 pointer-events-none'
            : 'opacity-100 translate-y-0 pointer-events-auto'
        }`}
      >
        <div className="flex items-center justify-between gap-1.5">
          {/* Tombol Rotasi Manual di sebelah kiri tombol Reset */}
          <button
            type="button"
            onClick={() => setRotation((prev) => ((prev + 90) % 360) as 0 | 90 | 180 | 270)}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer shrink-0 relative"
            title={`Rotasi Manual Teks (${rotation}°)`}
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-400" />
            {rotation !== 0 && (
              <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-amber-500 text-black px-1 rounded-full leading-tight">
                {rotation}°
              </span>
            )}
          </button>

          {/* Tombol Reset */}
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer shrink-0"
            title="Kembalikan Teks ke Paling Atas (Reset)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Stepper Speed (+ -) Sejajar dengan Mulai & Full */}
          <div className="flex items-center bg-zinc-900 rounded-xl border border-zinc-800 p-0.5 shadow-xs shrink-0">
            <button
              type="button"
              onClick={() => setSpeed((prev) => Math.max(1, prev - 1))}
              disabled={speed <= 1}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
              title="Perlambat Kecepatan"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-mono font-bold text-xs px-1 text-amber-400 min-w-[24px] text-center" title="Kecepatan Gulir">
              {speed}x
            </span>
            <button
              type="button"
              onClick={() => setSpeed((prev) => Math.min(10, prev + 1))}
              disabled={speed >= 10}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
              title="Percepat Kecepatan"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* TOMBOL HERO: PLAY / PAUSE (ICON ONLY) */}
          <button
            type="button"
            onClick={() => {
              if (isPlaying) {
                setIsPlaying(false);
              } else {
                triggerPlay();
              }
            }}
            className="p-1.5 sm:p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95 shrink-0"
            title={isPlaying ? 'Jeda Teks' : 'Mulai Jalankan Teks'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-black" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
            )}
          </button>

          {/* TOMBOL FULL (ICON ONLY) */}
          <button
            type="button"
            onClick={onExpandToFull}
            className="p-1.5 sm:p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold transition-all cursor-pointer shadow-xs shrink-0"
            title="Kembali ke Mode Teleprompter Layar Penuh (Full)"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* SISI KANAN: MENU PENGATURAN & TUTUP (IKON MINIMALIS & KONSISTEN) */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Ikon Menu Pengaturan (Teks, Hitung Mundur, Layar) */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                isSettingsOpen
                  ? 'bg-amber-500 text-black border-amber-500 shadow-xs'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
              }`}
              title="Menu Pengaturan (Teks, Hitung Mundur, Layar)"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>

            {/* Tombol Tutup */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-zinc-900 hover:bg-red-500/20 border border-zinc-800 text-zinc-400 hover:text-red-400 transition-all cursor-pointer"
              title="Tutup Teleprompter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Handle Resize di Sudut Kanan Bawah (Requirement 3: Ubah Ukuran Layar HP) */}
      <div
        onPointerDown={handlePointerDownResize}
        onPointerMove={handlePointerMoveResize}
        onPointerUp={handlePointerUpResize}
        className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize z-50 flex items-end justify-end p-1 text-zinc-500 hover:text-amber-400 touch-none"
        title="Geser sudut ini untuk memperbesar / memperkecil ukuran jendela"
      >
        <svg viewBox="0 0 6 6" className="w-3 h-3 fill-current">
          <circle cx="5" cy="5" r="0.8" />
          <circle cx="3" cy="5" r="0.8" />
          <circle cx="5" cy="3" r="0.8" />
          <circle cx="1" cy="5" r="0.8" />
          <circle cx="3" cy="3" r="0.8" />
          <circle cx="5" cy="1" r="0.8" />
        </svg>
      </div>
    </div>
  );
};
