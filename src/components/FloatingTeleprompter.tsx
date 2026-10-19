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
  SlidersHorizontal,
  FlipHorizontal,
  Move,
  ChevronDown,
  ChevronUp,
  PictureInPicture2,
  Smartphone,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { ScriptItem, ProductBrief } from '../types';
import {
  buildPrompterConcept,
  extractProductKeywords,
  PrompterConcept,
} from '../utils/prompterFormatter';

interface FloatingTeleprompterProps {
  isOpen: boolean;
  onClose: () => void;
  onExpandToFull: () => void;
  scripts: ScriptItem[];
  conceptIndex?: number;
  productBrief?: ProductBrief;
  onOpenPermissionGuide?: () => void;
}

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
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 24, y: 72 });
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 340, height: 380 });
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [opacity, setOpacity] = useState<number>(85); // 20 - 100%
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Kontrol pembacaan prompter
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(4); // Range 1 - 10
  const [fontSize, setFontSize] = useState<number>(20); // Range 14 - 36 px
  const [isMirrored, setIsMirrored] = useState<boolean>(false);
  const [selectedConceptIdx, setSelectedConceptIdx] = useState<number>(conceptIndex);

  // Support Document Picture-in-Picture (OS level Always-On-Top)
  const [supportsPip, setSupportsPip] = useState<boolean>(false);
  const [isPipActive, setIsPipActive] = useState<boolean>(false);

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

  // Deteksi Document Picture-in-Picture
  useEffect(() => {
    if (typeof window !== 'undefined' && 'documentPictureInPicture' in window) {
      setSupportsPip(true);
    }
  }, []);

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

  // Perhitungan scroll
  const pixelsPerSecond = Math.max(10, speed * 11);

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

  // Dragging logic (Touch + Mouse)
  const handlePointerDownHeader = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, input, select')) return;
    isDraggingRef.current = true;
    dragStartOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveHeader = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const maxX = Math.max(10, window.innerWidth - (isMinimized ? 160 : size.width) - 10);
    const maxY = Math.max(10, window.innerHeight - (isMinimized ? 50 : size.height) - 10);
    const newX = Math.min(Math.max(10, e.clientX - dragStartOffsetRef.current.x), maxX);
    const newY = Math.min(Math.max(10, e.clientY - dragStartOffsetRef.current.y), maxY);
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUpHeader = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Resize logic
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
    const newW = Math.min(Math.max(260, resizeStartRef.current.startW + dx), window.innerWidth - 20);
    const newH = Math.min(Math.max(220, resizeStartRef.current.startH + dy), window.innerHeight - 40);
    setSize({ width: newW, height: newH });
  };

  const handlePointerUpResize = (e: React.PointerEvent<HTMLDivElement>) => {
    isResizingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Reset scroll
  const handleReset = () => {
    setIsPlaying(false);
    scrollAccumulatorRef.current = 0;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Document Picture-in-Picture handler (Real OS level Always-on-Top)
  const handleOpenPip = async () => {
    if (!('documentPictureInPicture' in window)) {
      onOpenPermissionGuide?.();
      return;
    }

    try {
      // @ts-ignore
      const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: size.width,
        height: size.height,
      });

      // Salin stylesheet
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
          const style = document.createElement('style');
          style.textContent = cssRules;
          pipWindow.document.head.appendChild(style);
        } catch {
          if (styleSheet.href) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = styleSheet.href;
            pipWindow.document.head.appendChild(link);
          }
        }
      });

      setIsPipActive(true);
      pipWindow.addEventListener('pagehide', () => {
        setIsPipActive(false);
      });
    } catch (err) {
      console.warn('Gagal membuka Picture-in-Picture:', err);
      onOpenPermissionGuide?.();
    }
  };

  // Kirim ke Android Native Overlay jika tersedia di Android wrapper
  const handleStartAndroidOverlay = () => {
    if (typeof window !== 'undefined' && (window as any).AndroidFloatingBridge) {
      const fullText = activeConcepts
        .map((c) => c.title + '\n\n' + c.lines.map((l) => l.rawText).join('\n'))
        .join('\n\n---\n\n');
      (window as any).AndroidFloatingBridge.startFloatingService(fullText, speed, Math.round(fontSize * 0.9));
    } else {
      onOpenPermissionGuide?.();
    }
  };

  if (!isOpen) return null;

  // Tampilan Minimized (Pill mengambang kecil di sudut layar)
  if (isMinimized) {
    return (
      <div
        ref={widgetRef}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          touchAction: 'none',
        }}
        onPointerDown={handlePointerDownHeader}
        onPointerMove={handlePointerMoveHeader}
        onPointerUp={handlePointerUpHeader}
        className="fixed z-[9999] flex items-center gap-2 px-3 py-2 rounded-full bg-black/90 text-white border border-amber-500/60 shadow-2xl backdrop-blur-md cursor-grab active:cursor-grabbing select-none"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-bold text-amber-300">Prompter Melayang</span>
        <button
          type="button"
          onClick={() => setIsPlaying((p) => !p)}
          className="p-1 rounded-full bg-amber-500 hover:bg-amber-400 text-black"
          title={isPlaying ? 'Jeda' : 'Mulai'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-black" />}
        </button>
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="p-1 rounded-full hover:bg-zinc-800 text-zinc-300"
          title="Buka Penuh"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full hover:bg-zinc-800 text-red-400"
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
        backgroundColor: `rgba(0, 0, 0, ${opacity / 100})`,
        touchAction: 'none',
      }}
      className="fixed z-[9999] flex flex-col rounded-2xl border border-zinc-700/80 shadow-2xl backdrop-blur-md select-none overflow-hidden transition-colors"
    >
      {/* Header Bar - Drag Handle */}
      <div
        onPointerDown={handlePointerDownHeader}
        onPointerMove={handlePointerMoveHeader}
        onPointerUp={handlePointerUpHeader}
        className="flex items-center justify-between px-3 py-2 bg-zinc-900/90 border-b border-zinc-800 text-white cursor-grab active:cursor-grabbing shrink-0"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <Move className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-xs font-bold text-zinc-200 truncate">
            {selectedConceptIdx >= 0 ? `Konsep ${selectedConceptIdx + 1}` : 'Semua Skrip'}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
            {opacity}%
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Tombol OS PiP / Android Overlay */}
          <button
            type="button"
            onClick={supportsPip ? handleOpenPip : handleStartAndroidOverlay}
            className="p-1 rounded-lg hover:bg-zinc-800 text-amber-400 hover:text-amber-300 transition-colors"
            title="Always-on-Top (PiP / Di Atas Aplikasi Lain)"
          >
            <PictureInPicture2 className="w-3.5 h-3.5" />
          </button>

          {/* Quick Settings Drawer Toggle */}
          <button
            type="button"
            onClick={() => setShowSettings((p) => !p)}
            className={`p-1 rounded-lg transition-colors ${
              showSettings ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-zinc-800 text-zinc-400'
            }`}
            title="Setelan Transparansi & Kecepatan"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Minimize */}
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
            title="Perkecil ke Floating Bubble"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {/* Maximize to Full Teleprompter */}
          <button
            type="button"
            onClick={onExpandToFull}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
            title="Buka Layar Penuh"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-red-500/20 text-zinc-400 hover:text-red-400"
            title="Tutup Prompter Melayang"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Settings Panel (Jika di-expand) */}
      {showSettings && (
        <div className="bg-zinc-950/95 border-b border-zinc-800 p-2.5 space-y-2 text-xs text-zinc-300 shrink-0">
          {/* Opacity Slider (20% - 100%) */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-zinc-400">Transparansi:</span>
            <div className="flex items-center gap-2 flex-1 max-w-[170px]">
              <input
                type="range"
                min="20"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-700 rounded-lg accent-amber-500 cursor-pointer"
              />
              <span className="text-[10px] font-mono text-amber-400 w-8 text-right">{opacity}%</span>
            </div>
          </div>

          {/* Speed & Mirror */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-zinc-400">Kecepatan:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSpeed((s) => Math.max(1, s - 1))}
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-bold text-amber-400 font-mono">{speed}</span>
              <button
                type="button"
                onClick={() => setSpeed((s) => Math.min(10, s + 1))}
                className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsMirrored((m) => !m)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border ${
                isMirrored
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400'
              }`}
            >
              <FlipHorizontal className="w-3 h-3" />
              <span>Mirror</span>
            </button>
          </div>

          {/* Android Wrapper / Permission shortcut */}
          <div className="pt-1 flex items-center justify-between border-t border-zinc-800 text-[10px]">
            <button
              type="button"
              onClick={onOpenPermissionGuide}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Izin Melayang Android</span>
            </button>
            <span className="text-zinc-500">Geser header untuk pindah</span>
          </div>
        </div>
      )}

      {/* Prompter Scrolling Area */}
      <div
        ref={scrollContainerRef}
        style={{
          transform: isMirrored ? 'scaleX(-1)' : 'none',
        }}
        className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth select-none relative"
      >
        {/* Eye Line / Reading Focus Indicator */}
        <div className="sticky top-[40%] pointer-events-none z-10 w-full flex items-center justify-center my-[-10px] opacity-35">
          <div className="w-full border-t border-dashed border-amber-400" />
        </div>

        <div className="space-y-4 pb-20">
          {activeConcepts.map((concept) => (
            <div key={concept.id} className="space-y-3">
              {activeConcepts.length > 1 && (
                <div className="text-[11px] font-bold text-amber-400/80 uppercase tracking-widest border-b border-amber-500/20 pb-1">
                  {concept.title}
                </div>
              )}

              {concept.lines.map((line) => (
                <div
                  key={line.id}
                  style={{ fontSize: `${fontSize}px`, lineHeight: '1.45' }}
                  className="font-bold text-white tracking-wide"
                >
                  {line.tokens.map((token, tIdx) => {
                    if (token.type === 'pause-short') {
                      return (
                        <span key={tIdx} className="text-amber-400 font-black mx-1 opacity-90">
                          /
                        </span>
                      );
                    }
                    if (token.type === 'pause-long') {
                      return (
                        <span key={tIdx} className="text-emerald-400 font-black mx-1 opacity-95">
                          //
                        </span>
                      );
                    }
                    if (token.type === 'emphasis') {
                      return (
                        <span
                          key={tIdx}
                          className="bg-amber-400 text-black px-1 py-0.5 rounded font-black tracking-normal uppercase shadow-sm"
                        >
                          {token.text}
                        </span>
                      );
                    }
                    return <span key={tIdx}>{token.text} </span>;
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-950/90 border-t border-zinc-800 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-md ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-black'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Jeda</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Mulai</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            title="Reset ke Atas"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Font Size controls */}
        <div className="flex items-center gap-1 bg-zinc-900 px-1.5 py-0.5 rounded-lg border border-zinc-800">
          <button
            type="button"
            onClick={() => setFontSize((f) => Math.max(14, f - 2))}
            className="p-1 hover:text-amber-400 text-zinc-400"
            title="Kecilkan Teks"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-[10px] font-mono font-bold text-zinc-300 w-5 text-center">
            {fontSize}
          </span>
          <button
            type="button"
            onClick={() => setFontSize((f) => Math.min(36, f + 2))}
            className="p-1 hover:text-amber-400 text-zinc-400"
            title="Besarkan Teks"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Resize Grip (Pojok Kanan Bawah) */}
        <div
          onPointerDown={handlePointerDownResize}
          onPointerMove={handlePointerMoveResize}
          onPointerUp={handlePointerUpResize}
          className="cursor-nwse-resize p-1 text-zinc-500 hover:text-amber-400 select-none"
          title="Tarik untuk mengubah ukuran widget"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="19" cy="19" r="2" />
            <circle cx="13" cy="19" r="2" />
            <circle cx="19" cy="13" r="2" />
          </svg>
        </div>
      </div>
    </div>
  );
};
