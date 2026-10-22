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

interface FloatingTeleprompterProps {
  isOpen: boolean;
  onClose: () => void;
  onExpandToFull: () => void;
  scripts: ScriptItem[];
  conceptIndex?: number;
  productBrief?: ProductBrief;
  onOpenPermissionGuide?: () => void;
  theme?: TeleprompterTheme;
  onSelectTheme?: (themeId: TeleprompterThemeId) => void;
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
  // Posisi dan ukuran widget melayang
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 16, y: 32 });
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 340, height: 440 });
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const savedScrollTopRef = useRef<number>(0);

  const handleMinimize = useCallback(() => {
    if (scrollContainerRef.current) {
      savedScrollTopRef.current = scrollContainerRef.current.scrollTop;
    }
    setIsMinimized(true);
  }, []);

  const handleRestoreFromMinimize = useCallback(() => {
    setIsMinimized(false);
  }, []);

  useEffect(() => {
    if (!isMinimized && isOpen && savedScrollTopRef.current > 0) {
      const raf = requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = savedScrollTopRef.current;
        }
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isMinimized, isOpen]);

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

  // Skala otomatis rotasi agar teleprompter mengecil otomatis dan tidak melebihi area layar hp
  const rotScale = React.useMemo(() => {
    if (rotation === 90 || rotation === 270) {
      const vw = typeof window !== 'undefined' ? window.innerWidth : 360;
      const vh = typeof window !== 'undefined' ? window.innerHeight : 640;
      const maxAllowedW = Math.max(200, vw - 16);
      const maxAllowedH = Math.max(160, vh - 16);
      const scaleW = size.height > maxAllowedW ? maxAllowedW / size.height : 1;
      const scaleH = size.width > maxAllowedH ? maxAllowedH / size.width : 1;
      return Math.min(scaleW, scaleH, 1);
    }
    return 1;
  }, [rotation, size]);

  // Ukuran tombol & ikon dinamis agar menu-menu mengecil saat teleprompter dikecilkan
  const dynamicBtnSize = Math.max(20, Math.min(32, Math.floor((size.width - 24) / 10.2)));
  const dynamicIconSize = Math.max(10, Math.min(16, Math.floor(dynamicBtnSize * 0.46)));

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
  const handlePointerDownDrag = (e: React.PointerEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('button, input, select')) return;
    isDraggingRef.current = true;
    dragStartOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Dragging khusus dari tombol geser (posisi paling kiri)
  const handlePointerDownMoveButton = (e: React.PointerEvent<HTMLButtonElement>) => {
    isDraggingRef.current = true;
    dragStartOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMoveDrag = (e: React.PointerEvent<HTMLElement>) => {
    if (!isDraggingRef.current) return;
    const maxX = Math.max(5, window.innerWidth - (isMinimized ? 290 : size.width) - 5);
    const maxY = Math.max(5, window.innerHeight - (isMinimized ? 44 : size.height) - 5);
    const newX = Math.min(Math.max(5, e.clientX - dragStartOffsetRef.current.x), maxX);
    const newY = Math.min(Math.max(5, e.clientY - dragStartOffsetRef.current.y), maxY);
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUpDrag = (e: React.PointerEvent<HTMLElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Pengatur posisi cepat saat tombol geser diklik
  const handleCyclePosition = () => {
    const maxX = Math.max(5, window.innerWidth - size.width - 10);
    const maxY = Math.max(5, window.innerHeight - size.height - 10);
    const presets = [
      { x: Math.max(10, Math.floor((window.innerWidth - size.width) / 2)), y: 40 }, // Atas Tengah
      { x: Math.max(10, maxX - 10), y: 80 }, // Kanan Atas
      { x: 15, y: Math.max(20, Math.floor((window.innerHeight - size.height) / 2)) }, // Kiri Tengah
      { x: Math.max(10, Math.floor((window.innerWidth - size.width) / 2)), y: Math.max(40, maxY - 50) }, // Bawah Tengah
    ];
    setPosition((prev) => {
      const idx = presets.findIndex((p) => Math.abs(p.x - prev.x) < 40 && Math.abs(p.y - prev.y) < 40);
      const nextIdx = (idx + 1) % presets.length;
      return presets[nextIdx];
    });
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
        themeId: activeTheme.id,
        backgroundColorHex: activeTheme.backgroundColor,
        highlightColorHex: activeTheme.highlightColor,
        rotation,
        isMirrored,
        showFocusGuide,
        focusGuidePercent: focusGuidePosition,
        countdownSec: countdownEnabled ? countdownDuration : 0,
      }, activeConcepts);
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

  return (
    <>
      {/* Mode Minimized: Bentuk kotak tipis dengan lengkungan pojok gaya iOS & tombol geser di paling kiri */}
      {isMinimized && (
        <div
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            touchAction: 'none',
            transform: rotation !== 0 ? `rotate(${rotation}deg)` : undefined,
            transformOrigin: 'center center',
          }}
          className="fixed z-[9999] flex items-center gap-2 px-2.5 py-1.5 rounded-[16px] bg-[#1C1C1E]/95 dark:bg-[#1C1C1E]/95 text-white border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl select-none"
        >
          {/* 1. Tombol Geser di paling kiri sebelum teks "teleprompter Gagaswara" */}
          <button
            type="button"
            onPointerDown={handlePointerDownMoveButton}
            onPointerMove={handlePointerMoveDrag}
            onPointerUp={handlePointerUpDrag}
            className="p-1.5 rounded-[10px] bg-white/10 hover:bg-white/20 active:bg-white/30 text-white cursor-grab active:cursor-grabbing touch-none select-none transition-all flex items-center justify-center shrink-0"
            title="Tahan dan geser untuk memindahkan posisi teleprompter"
            aria-label="Geser posisi teleprompter"
          >
            <Move className="w-3.5 h-3.5 text-white/90" />
          </button>

          {/* 2. Indikator Hijau & Teks (Klik untuk membuka kembali) */}
          <div
            role="button"
            tabIndex={0}
            onClick={handleRestoreFromMinimize}
            className="flex items-center gap-2 cursor-pointer group pr-1 select-none"
            title="Klik untuk membuka kembali ukuran semula"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-xs font-bold text-amber-300 tracking-wide group-hover:text-amber-200 transition-colors whitespace-nowrap">
              teleprompter Gagaswara
            </span>
          </div>

          {/* 3. Tombol Buka / Maksimalkan (Kembali ke setingan akhir sebelum di-minimize) */}
          <button
            type="button"
            onClick={handleRestoreFromMinimize}
            className="p-1.5 rounded-[10px] bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer shrink-0"
            title="Buka kembali ukuran semula (pengaturan tersimpan penuh)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* 4. Tombol Putar / Jeda */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isPlaying) {
                setIsPlaying(false);
              } else {
                triggerPlay();
              }
            }}
            className="p-1.5 rounded-[10px] bg-amber-500 hover:bg-amber-400 active:scale-95 text-black transition-all cursor-pointer shrink-0"
            title={isPlaying ? 'Jeda' : 'Mulai'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black ml-0.5" />}
          </button>

          {/* 5. Tombol Tutup */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 rounded-[10px] bg-red-500/20 hover:bg-red-500 active:scale-95 text-red-300 hover:text-white transition-all cursor-pointer shrink-0"
            title="Tutup Teleprompter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Widget Container (Tetap terjaga dalam DOM agar posisi scroll dan setingan 100% utuh) */}
      <div
        ref={widgetRef}
        style={{
          display: isMinimized ? 'none' : 'flex',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
        backgroundColor:
          activeTheme.id === 'light_clean'
            ? `rgba(255, 255, 255, ${opacity / 100})`
            : activeTheme.id === 'soft_comfort'
            ? `rgba(24, 24, 27, ${opacity / 100})`
            : `rgba(0, 0, 0, ${opacity / 100})`,
        color: activeTheme.textColor,
        touchAction: 'none',
        transform: rotation !== 0 ? `rotate(${rotation}deg) scale(${rotScale})` : undefined,
        transformOrigin: 'center center',
      }}
      className="fixed z-[9999] flex flex-col rounded-2xl border border-zinc-700/80 shadow-2xl select-none overflow-hidden transition-all duration-200"
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
            <div
              style={{
                background: `linear-gradient(90deg, ${activeTheme.highlightColor}aa, ${activeTheme.highlightColor}, ${activeTheme.highlightColor}aa)`,
                boxShadow: `0 0 8px ${activeTheme.highlightColor}88`,
              }}
              className="flex-1 h-0.5"
            />
            <span
              style={{ color: activeTheme.highlightColor }}
              className="text-[10px] font-mono font-bold pl-1.5 drop-shadow-md"
            >
              {focusGuidePosition}%
            </span>
          </div>
        )}

        {/* Feedback visual animasi Tap Mulai / Jeda */}
        {tapFeedback && (
          <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center animate-out fade-out zoom-out duration-400">
            <div
              style={{
                borderColor: activeTheme.highlightColor,
                color: activeTheme.highlightColor,
              }}
              className="p-4 rounded-full bg-black/80 border shadow-2xl backdrop-blur-md"
            >
              {tapFeedback === 'play' ? (
                <Play className="w-7 h-7 fill-current" />
              ) : (
                <Pause className="w-7 h-7 fill-current" />
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
            <div
              style={{ color: activeTheme.highlightColor }}
              className="text-7xl font-black animate-bounce drop-shadow-[0_0_25px_rgba(251,191,36,0.6)]"
            >
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
              transform: isMirrored ? 'scaleX(-1)' : undefined,
              transformOrigin: 'center center',
            }}
            className="transition-transform duration-200"
          >
            {activeConcepts.map((concept, cIdx) => (
              <div key={concept.id || cIdx} className="space-y-4 mb-8">
                {/* Header Pemisah Konsep Sesuai Tema */}
                <div
                  style={{
                    backgroundColor: activeTheme.cardBg,
                    borderColor: activeTheme.cardBorder,
                    color: activeTheme.cardTextColor,
                  }}
                  className="w-full my-2.5 p-2.5 rounded-xl border-2 shadow-md flex items-center justify-between gap-2 select-none"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      style={{ backgroundColor: activeTheme.highlightColor }}
                      className="w-2.5 h-2.5 rounded-full ring-2 ring-black/10 shrink-0"
                    />
                    <h2
                      style={{ color: activeTheme.cardTextColor }}
                      className="text-xs sm:text-sm font-black tracking-tight uppercase truncate"
                    >
                      {formatConceptDisplayTitle(concept.conceptNumber, concept.title, concept.angle)}
                    </h2>
                  </div>
                  <span
                    style={{
                      color: activeTheme.secondaryTextColor,
                      backgroundColor: activeTheme.id === 'light_clean' ? '#E4E4E7' : '#27272A',
                      borderColor: activeTheme.cardBorder,
                    }}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0"
                  >
                    ±{concept.estimatedDuration}s
                  </span>
                </div>

                {/* Baris Dialog dengan Spasi Antar-Bagian Lebih Luas */}
                <div className="space-y-4 sm:space-y-5">
                  {concept.lines.map((line, lIdx) => (
                    <div
                      key={line.id || lIdx}
                      style={{
                        fontSize: `${fontSize}px`,
                        lineHeight: '1.45',
                        color: activeTheme.textColor,
                        textShadow: activeTheme.id === 'light_clean' ? 'none' : activePreset.textShadow,
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
                                color: activeTheme.highlightColor,
                              }}
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
                              className="font-bold mx-1 opacity-80 select-none"
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
        - Diatur 3/4 layar dan ditaruh di sebelah kanan agar sebelah kiri tetap melihat preview teks
        - Background abu-abu bergaya iOS dengan tombol sub-tab yang tampak aktif secara visual (tactile)
      */}
      {isSettingsOpen && !isPlaying && (
        <div className="no-tap-toggle absolute bottom-16 right-2 z-40 w-[75vw] max-w-[340px] bg-zinc-800/95 border border-zinc-600/70 rounded-2xl p-3 shadow-2xl space-y-2.5 text-xs text-zinc-200 animate-in slide-in-from-right-2 duration-150 backdrop-blur-xl max-h-[75%] overflow-y-auto">
          {/* Header Panel */}
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-700/80">
            <span className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Pengaturan Teleprompter</span>
            </span>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/70 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sub-tabs Bergaya iOS: Teks, Countdown, Layar (Tampak Bisa Dipencet Walau Tidak Aktif) */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-900/90 rounded-xl border border-zinc-700/80">
            <button
              type="button"
              onClick={() => setSettingsTab('teks')}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-xs ${
                settingsTab === 'teks'
                  ? 'bg-amber-500 text-black shadow-md ring-2 ring-amber-400/40'
                  : 'bg-zinc-700/90 hover:bg-zinc-600 text-zinc-100 border border-zinc-500/60 shadow-sm active:scale-95'
              }`}
            >
              <Type className="w-3 h-3" />
              <span>Teks</span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsTab('countdown')}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-xs ${
                settingsTab === 'countdown'
                  ? 'bg-amber-500 text-black shadow-md ring-2 ring-amber-400/40'
                  : 'bg-zinc-700/90 hover:bg-zinc-600 text-zinc-100 border border-zinc-500/60 shadow-sm active:scale-95'
              }`}
            >
              <Timer className="w-3 h-3" />
              <span>Countdown</span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsTab('layar')}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-xs ${
                settingsTab === 'layar'
                  ? 'bg-amber-500 text-black shadow-md ring-2 ring-amber-400/40'
                  : 'bg-zinc-700/90 hover:bg-zinc-600 text-zinc-100 border border-zinc-500/60 shadow-sm active:scale-95'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Layar</span>
            </button>
          </div>

          {/* TAB 1: TEKS & SUBTITLE */}
          {settingsTab === 'teks' && (
            <div className="space-y-3">
              {/* 3 PRESET TEMA UTAMA TELEPROMPTER */}
              <div className="space-y-1 bg-zinc-900/60 p-2 rounded-xl border border-zinc-800">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-300 font-semibold">Tema Teleprompter:</span>
                  <span className="font-bold text-amber-400">{activeTheme.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 mt-1">
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
                        className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-zinc-800 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                            : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div
                          style={{ backgroundColor: t.previewSwatch.bg }}
                          className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center relative shadow-xs"
                        >
                          <span style={{ color: t.previewSwatch.text }} className="text-[9px] font-black">
                            T
                          </span>
                          <span
                            style={{ backgroundColor: t.previewSwatch.highlight }}
                            className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-1 ring-black"
                          />
                        </div>
                        <span className={`text-[10px] font-bold truncate max-w-full ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                          {t.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

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
        style={{
          backgroundColor: activeTheme.dockBg,
          borderTopColor: activeTheme.dockBorder,
          color: activeTheme.textColor,
        }}
        className={`no-tap-toggle w-full px-2 py-1.5 border-t shrink-0 transition-all duration-200 cursor-grab active:cursor-grabbing ${
          isPlaying
            ? 'opacity-35 hover:opacity-100'
            : 'opacity-100'
        }`}
      >
        <div className="flex items-center justify-between gap-1 w-full overflow-hidden">
          {/* SISI KIRI: TOMBOL GESER (PALING KIRI), ROTASI, RESET */}
          <div className="flex items-center gap-1 shrink-0">
            {/* 1. Tombol Pengatur Posisi (Geser) - PALING KIRI */}
            <button
              type="button"
              onPointerDown={handlePointerDownMoveButton}
              onPointerMove={handlePointerMoveDrag}
              onPointerUp={handlePointerUpDrag}
              onClick={handleCyclePosition}
              style={{ width: `${dynamicBtnSize}px`, height: `${dynamicBtnSize}px` }}
              className="flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-grab active:cursor-grabbing shrink-0 shadow-2xs"
              title="Pengatur Posisi (Geser Teleprompter: Tekan & Geser, atau Ketuk untuk Pindah Posisi)"
            >
              <Move style={{ width: `${dynamicIconSize}px`, height: `${dynamicIconSize}px` }} className="text-amber-400" />
            </button>

            {/* 2. Tombol Rotasi Orientasi Teleprompter */}
            <button
              type="button"
              onClick={() => setRotation((prev) => ((prev + 90) % 360) as 0 | 90 | 180 | 270)}
              style={{ width: `${dynamicBtnSize}px`, height: `${dynamicBtnSize}px` }}
              className="flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer shrink-0 relative shadow-2xs"
              title={`Ubah Orientasi Rotasi Teleprompter (${rotation}°)`}
            >
              <RotateCw style={{ width: `${dynamicIconSize}px`, height: `${dynamicIconSize}px` }} className="text-amber-400" />
              {rotation !== 0 && (
                <span className="absolute -top-1 -right-1 text-[7px] font-bold bg-amber-500 text-black px-1 rounded-full leading-tight">
                  {rotation}°
                </span>
              )}
            </button>

            {/* Tombol Reset */}
            <button
              type="button"
              onClick={handleReset}
              style={{ width: `${dynamicBtnSize}px`, height: `${dynamicBtnSize}px` }}
              className="flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer shrink-0 shadow-2xs"
              title="Kembalikan Teks ke Paling Atas (Reset)"
            >
              <RotateCcw style={{ width: `${dynamicIconSize}px`, height: `${dynamicIconSize}px` }} />
            </button>
          </div>

          {/* TENGAH: SPEED (+ -), MULAI / JEDA & FULL */}
          <div className="flex items-center gap-1 shrink-1 min-w-0 justify-center">
            {/* Stepper Speed (+ -) */}
            <div
              style={{ height: `${dynamicBtnSize}px` }}
              className="flex items-center bg-zinc-900 rounded-xl border border-zinc-700 p-0.5 shadow-2xs shrink-0"
            >
              <button
                type="button"
                onClick={() => setSpeed((prev) => Math.max(1, prev - 1))}
                disabled={speed <= 1}
                style={{ width: `${Math.round(dynamicBtnSize * 0.72)}px` }}
                className="h-full flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                title="Perlambat Kecepatan"
              >
                <Minus style={{ width: `${Math.max(9, Math.round(dynamicIconSize * 0.85))}px`, height: `${Math.max(9, Math.round(dynamicIconSize * 0.85))}px` }} />
              </button>
              <span
                style={{ fontSize: `${Math.max(9, Math.round(dynamicBtnSize * 0.38))}px` }}
                className="font-mono font-bold px-1 text-amber-400 min-w-[18px] text-center"
                title="Kecepatan Gulir"
              >
                {speed}x
              </span>
              <button
                type="button"
                onClick={() => setSpeed((prev) => Math.min(10, prev + 1))}
                disabled={speed >= 10}
                style={{ width: `${Math.round(dynamicBtnSize * 0.72)}px` }}
                className="h-full flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                title="Percepat Kecepatan"
              >
                <Plus style={{ width: `${Math.max(9, Math.round(dynamicIconSize * 0.85))}px`, height: `${Math.max(9, Math.round(dynamicIconSize * 0.85))}px` }} />
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
              style={{ width: `${Math.round(dynamicBtnSize * 1.15)}px`, height: `${dynamicBtnSize}px` }}
              className="flex items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold shadow-md shadow-amber-500/25 transition-all cursor-pointer active:scale-95 shrink-0"
              title={isPlaying ? 'Jeda Teks' : 'Mulai Jalankan Teks'}
            >
              {isPlaying ? (
                <Pause style={{ width: `${dynamicIconSize}px`, height: `${dynamicIconSize}px` }} className="fill-black" />
              ) : (
                <Play style={{ width: `${dynamicIconSize}px`, height: `${dynamicIconSize}px` }} className="fill-black ml-0.5" />
              )}
            </button>

            {/* TOMBOL FULL (ICON ONLY) */}
            <button
              type="button"
              onClick={onExpandToFull}
              style={{ width: `${dynamicBtnSize}px`, height: `${dynamicBtnSize}px` }}
              className="flex items-center justify-center rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold transition-all cursor-pointer shadow-2xs shrink-0"
              title="Kembali ke Mode Teleprompter Layar Penuh (Full)"
            >
              <Maximize2 style={{ width: `${dynamicIconSize}px`, height: `${dynamicIconSize}px` }} className="text-amber-400" />
            </button>
          </div>

          {/* SISI KANAN: MENU PENGATURAN & TOMBOL MINIMIZE (-) SEJAJAR DENGAN TOMBOL TUTUP (X) */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Ikon Menu Pengaturan (Teks, Hitung Mundur, Layar) */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              style={{ width: `${dynamicBtnSize}px`, height: `${dynamicBtnSize}px` }}
              className={`flex items-center justify-center rounded-xl border transition-all cursor-pointer shadow-2xs ${
                isSettingsOpen
                  ? 'bg-amber-500 text-black border-amber-500'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700'
              }`}
              title="Menu Pengaturan (Teks, Hitung Mundur, Layar)"
            >
              <SlidersHorizontal style={{ width: `${dynamicIconSize}px`, height: `${dynamicIconSize}px` }} />
            </button>

            {/* Tombol Minimize (-) sejajar dengan tombol tutup */}
            <button
              type="button"
              onClick={handleMinimize}
              style={{ width: `${dynamicBtnSize}px`, height: `${dynamicBtnSize}px` }}
              className="flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-2xs"
              title="Minimize Teleprompter (-)"
            >
              <Minus style={{ width: `${dynamicIconSize}px`, height: `${dynamicIconSize}px` }} />
            </button>

            {/* Tombol Tutup - Kontras tinggi, warna merah tegas, selalu terlihat jelas */}
            <button
              type="button"
              onClick={onClose}
              style={{ width: `${dynamicBtnSize}px`, height: `${dynamicBtnSize}px` }}
              className="flex items-center justify-center rounded-xl bg-red-500/25 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/60 shadow-2xs transition-all cursor-pointer shrink-0"
              title="Tutup Teleprompter"
            >
              <X style={{ width: `${dynamicIconSize}px`, height: `${dynamicIconSize}px` }} className="stroke-[2.5]" />
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
    </>
  );
};
