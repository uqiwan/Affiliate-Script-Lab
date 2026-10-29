/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Sparkles,
  Video,
  CheckCircle2,
  Loader2,
  Lightbulb,
  ChevronRight,
  ChevronLeft,
  Circle,
  Clock,
  Sparkle,
  Check,
} from 'lucide-react';
import { GenerationConfig, InputMode } from '../types';

interface ProcessingModalProps {
  isAnalyzing: boolean;
  isGenerating: boolean;
  activeInputMode?: InputMode;
  config?: GenerationConfig;
  productName?: string;
}

// Creator tips carousel for TikTok / Reels / Shorts affiliators
const CREATOR_TIPS = [
  {
    tag: 'Hook 3 Detik',
    title: 'Kunci Retensi Audiens FYP',
    text: '80% penonton scroll jika pembukaan membosankan. Skrip Anda diracik dengan hook kontras visual atau pertanyaan penasaran di 3 detik pertama.',
    accent: 'from-amber-500 to-orange-500',
  },
  {
    tag: 'B-Roll & Gestur',
    title: 'Konversi Naik Hingga 2.4x',
    text: 'Tunjukkan produk sedekat mungkin ke kamera saat menyebutkan masalah atau manfaat utama. Penonton ingin melihat detail nyata sebelum membeli.',
    accent: 'from-blue-500 to-indigo-500',
  },
  {
    tag: 'Safe Zone 9:16',
    title: 'Teks Aman dari Tombol UI',
    text: 'Semua arahan visual otomatis disesuaikan agar tidak tertutup tombol Love, Komentar di kanan, atau caption & keranjang di bagian bawah.',
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    tag: 'Call to Action Natural',
    title: 'Dorong Klik Keranjang Bawah',
    text: 'CTA terbaik adalah yang memberikan alasan mendesak: promo kilat, stok menipis, atau tips klaim voucher gratis di keranjang kiri bawah.',
    accent: 'from-purple-500 to-pink-500',
  },
  {
    tag: 'Tempo Teleprompter',
    title: 'Artikulasi Jelas & Mengalir',
    text: 'Gunakan kecepatan 120–140 kata/menit pada Teleprompter bawaan agar suara terdengar santai, natural, dan mudah dipahami penonton.',
    accent: 'from-teal-500 to-cyan-500',
  },
  {
    tag: 'Formula Storytelling',
    title: 'Formula Masalah - Solusi',
    text: 'Mulai dari keluhan sehari-hari yang relatable, lalu perkenalkan produk sebagai penyelamat. Review autentik 3x lebih dipercaya daripada hard selling.',
    accent: 'from-rose-500 to-red-500',
  },
];

export const ProcessingModal: React.FC<ProcessingModalProps> = ({
  isAnalyzing,
  isGenerating,
  activeInputMode = 'images',
  config,
  productName,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [activeTipIndex, setActiveTipIndex] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(10);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);

  // Persistent refs to avoid resetting state on parent re-renders
  const startTimeRef = useRef<number>(0);
  const activeTaskKeyRef = useRef<string | null>(null);
  const finishTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isVisible = isAnalyzing || isGenerating || isFinishing;

  // Analysis steps (Tahap 1 -> 2)
  const analyzingSteps = useMemo(
    () => [
      'Membaca & memindai sumber informasi produk...',
      'Mengekstrak spesifikasi, fitur nyata & material...',
      'Menganalisis target pembeli & masalah relevan...',
      'Menyusun Product Brief terverifikasi bebas klaim palsu...',
    ],
    []
  );

  // Script generation steps (Tahap 3 -> 4)
  const generatingSteps = useMemo(
    () => [
      'Meracik Hook 3 detik pertama dengan scroll-stopper kuat...',
      'Menyusun dialog narasi persuasif & arahan visual B-roll...',
      'Menguji batas kata & kesesuaian Safe Zone 9:16 multi-platform...',
      'Memvalidasi diversifikasi angle & memfinalisasi skrip siap rekam...',
    ],
    []
  );

  const steps = isAnalyzing ? analyzingSteps : generatingSteps;

  // Stable Progress Engine: 0% -> 95% -> 100%
  // Eliminates pausing at 10% and avoids sudden erratic jumps
  useEffect(() => {
    const currentTask = isAnalyzing ? 'analyzing' : isGenerating ? 'generating' : null;

    if (!currentTask) {
      if (activeTaskKeyRef.current && !isFinishing) {
        // Task completed on parent: glide quickly to 100% and show checkmark
        setIsFinishing(true);
        setProgressPercent(100);
        setCurrentStepIndex(steps.length - 1);
        setRemainingSeconds(0);

        finishTimeoutRef.current = setTimeout(() => {
          setIsFinishing(false);
          activeTaskKeyRef.current = null;
          setProgressPercent(0);
          setCurrentStepIndex(0);
        }, 550);
      }
      return;
    }

    // New operation started
    if (activeTaskKeyRef.current !== currentTask) {
      activeTaskKeyRef.current = currentTask;
      startTimeRef.current = Date.now();
      setProgressPercent(2);
      setCurrentStepIndex(0);
      setIsFinishing(false);
    }

    const scriptCount = config?.scriptCount || 5;
    // Expected durations:
    // Analysis ~8-12 seconds
    // Script Generation ~10-25 seconds (scales with requested scriptCount)
    const expectedDurationMs = isAnalyzing
      ? 10000
      : Math.max(12000, scriptCount * 2800 + 4000);

    const ticker = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;

      let pct = 0;
      if (elapsed < expectedDurationMs * 0.85) {
        // Phase 1: Smooth, stable linear progression from 2% to 85%
        const ratio = elapsed / (expectedDurationMs * 0.85);
        pct = Math.floor(2 + ratio * 83);
      } else if (elapsed < expectedDurationMs * 1.3) {
        // Phase 2: Gentle ease into 85% - 94%
        const overtime = elapsed - expectedDurationMs * 0.85;
        const subRatio = Math.min(1, overtime / (expectedDurationMs * 0.45));
        pct = Math.floor(85 + subRatio * 9);
      } else {
        // Phase 3: High-activity crawling 94% -> 98% (never freezes)
        const creep = Math.min(4, Math.floor((elapsed - expectedDurationMs * 1.3) / 1000));
        pct = Math.min(98, 94 + creep);
      }

      setProgressPercent(pct);

      // Step synchronization:
      // Step 0: 0 - 24%
      // Step 1: 25 - 49%
      // Step 2: 50 - 74%
      // Step 3: 75% - 99%
      if (pct >= 75) {
        setCurrentStepIndex(3);
      } else if (pct >= 50) {
        setCurrentStepIndex(2);
      } else if (pct >= 25) {
        setCurrentStepIndex(1);
      } else {
        setCurrentStepIndex(0);
      }

      const left = Math.max(1, Math.ceil((expectedDurationMs - elapsed) / 1000));
      setRemainingSeconds(left);
    }, 200);

    return () => {
      clearInterval(ticker);
      if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
    };
  }, [isAnalyzing, isGenerating, config?.scriptCount, steps.length, isFinishing]);

  // Tip carousel rotation every 4 seconds
  useEffect(() => {
    if (!isVisible) return;
    const tipTimer = setInterval(() => {
      setActiveTipIndex((prev) => (prev + 1) % CREATOR_TIPS.length);
    }, 4000);
    return () => clearInterval(tipTimer);
  }, [isVisible]);

  if (!isVisible) return null;

  const currentTip = CREATOR_TIPS[activeTipIndex];

  const modeLabel =
    activeInputMode === 'images'
      ? 'Foto Produk'
      : activeInputMode === 'url'
      ? 'Tautan E-Commerce'
      : activeInputMode === 'text'
      ? 'Deskripsi Teks'
      : 'Campuran Sumber';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-5 bg-black/45 dark:bg-black/70 backdrop-blur-2xl animate-in fade-in duration-200"
      aria-modal="true"
      role="dialog"
    >
      {/* Outer Card with iOS Frosted Glass */}
      <div className="bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-3xl border border-white/70 dark:border-white/15 shadow-[0_32px_80px_rgba(0,0,0,0.35),_inset_0_1px_1px_rgba(255,255,255,0.85)] rounded-[32px] max-w-lg w-full p-5 sm:p-7 text-center relative overflow-hidden transition-all animate-in zoom-in-95 duration-200">
        {/* Animated Aurora Mesh Glow */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-gradient-to-tr from-[#007AFF]/25 via-[#AF52DE]/20 to-[#34C759]/20 rounded-full blur-3xl animate-ios-glow pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-gradient-to-tr from-[#FF9500]/20 via-[#AF52DE]/20 to-[#007AFF]/20 rounded-full blur-3xl animate-ios-glow pointer-events-none" />

        {/* Top Shimmer Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#007AFF] via-[#AF52DE] to-[#34C759] overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shimmer" />
        </div>

        {/* Central Hero Badge */}
        <div className="relative mx-auto w-20 h-20 sm:w-22 sm:h-22 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#007AFF]/20 via-[#AF52DE]/20 to-[#34C759]/20 blur-md animate-pulse" />
          <div
            className="absolute inset-0 rounded-full border-2 border-dashed border-[#007AFF]/40 dark:border-[#007AFF]/50 animate-spin"
            style={{ animationDuration: '8s' }}
          />
          <div
            className="absolute inset-2 rounded-full border border-dashed border-[#AF52DE]/35 dark:border-[#AF52DE]/45 animate-spin"
            style={{ animationDuration: '12s', animationDirection: 'reverse' }}
          />

          <div
            className={`relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-[22px] flex flex-col items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.2),_inset_0_1px_1px_rgba(255,255,255,0.7)] text-white animate-ios-float ${
              progressPercent >= 100
                ? 'bg-gradient-to-b from-[#34C759] to-[#28A745]'
                : isAnalyzing
                ? 'bg-gradient-to-b from-[#5B4DF8] via-[#4F46E5] to-[#007AFF]'
                : 'bg-gradient-to-b from-[#007AFF] via-[#AF52DE] to-[#5856D6]'
            }`}
          >
            <span className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/40 to-transparent rounded-t-[20px] pointer-events-none" />

            {progressPercent >= 100 ? (
              <Check className="w-8 h-8 filter drop-shadow stroke-[3]" />
            ) : isAnalyzing ? (
              <Sparkles className="w-7 h-7 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]" />
            ) : (
              <Video className="w-7 h-7 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]" />
            )}

            {progressPercent < 100 && (
              <div className="flex items-center gap-0.5 mt-1">
                <span className="w-1 h-1.5 bg-white/90 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-2 bg-white/90 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1.5 bg-white/90 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>
        </div>

        {/* Title & Context */}
        <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-1">
          {progressPercent >= 100
            ? 'Selesai! Menyiapkan Tampilan...'
            : isAnalyzing
            ? 'Menganalisis Sumber Produk'
            : 'Membuat Konsep Skrip Siap Rekam'}
        </h3>

        <p className="text-xs text-zinc-600 dark:text-zinc-300 mb-4 font-normal">
          {isAnalyzing ? (
            <span>
              Mengekstrak fakta akurat dari <strong>{modeLabel}</strong> {productName ? `(${productName})` : ''}
            </span>
          ) : (
            <span>
              Meracik <strong>{config?.scriptCount || 5} Konsep Video</strong> durasi{' '}
              <strong>{config?.durationSeconds || 30}s</strong> ({config?.style || 'Natural'})
            </span>
          )}
        </p>

        {/* Milestone Checkpoints & Progress Bar */}
        <div className="bg-white/60 dark:bg-black/30 backdrop-blur-md rounded-2xl border border-white/80 dark:border-white/10 p-3 sm:p-3.5 mb-4 text-left shadow-xs space-y-2">
          {/* Header Progress Tracker */}
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="flex items-center gap-1.5 text-[#007AFF] dark:text-[#0A84FF]">
              {progressPercent >= 100 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              {progressPercent >= 100 ? 'Proses Selesai' : 'Progress Berjalan Stabil'}
            </span>
            <span className="text-zinc-700 dark:text-zinc-300 font-extrabold tabular-nums">
              {progressPercent}%
            </span>
          </div>

          {/* Smooth Linear Progress Bar */}
          <div className="w-full bg-zinc-200/80 dark:bg-zinc-700/60 rounded-full h-2.5 overflow-hidden relative shadow-inner">
            <div
              className="bg-gradient-to-r from-[#007AFF] via-[#AF52DE] to-[#34C759] h-full rounded-full transition-[width] duration-150 ease-linear relative"
              style={{ width: `${Math.min(100, Math.max(2, progressPercent))}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
            </div>
          </div>

          {/* Steps Timeline Checklist */}
          <div className="pt-1.5 space-y-1.5">
            {steps.map((stepText, idx) => {
              const isCompleted = idx < currentStepIndex || progressPercent >= 100;
              const isCurrent = idx === currentStepIndex && progressPercent < 100;

              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2 text-xs transition-all duration-200 rounded-lg p-1.5 ${
                    isCurrent
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 font-semibold shadow-2xs'
                      : isCompleted
                      ? 'text-zinc-500 dark:text-zinc-400 font-medium'
                      : 'text-zinc-400/70 dark:text-zinc-600 font-normal'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
                    ) : isCurrent ? (
                      <div className="relative w-4 h-4 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-[#007AFF] animate-ping opacity-60" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#007AFF]" />
                      </div>
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600" />
                    )}
                  </div>
                  <span className="leading-tight flex-1">{stepText}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Educational Creator Tips Carousel */}
        <div className="bg-gradient-to-b from-white/70 to-white/40 dark:from-white/8 dark:to-white/4 backdrop-blur-md rounded-2xl border border-white/90 dark:border-white/10 p-3 sm:p-3.5 mb-4 text-left shadow-xs relative overflow-hidden transition-all duration-300">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
              <span>Tips Kreator FYP #{activeTipIndex + 1}</span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">
                ({currentTip.tag})
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setActiveTipIndex((prev) => (prev - 1 + CREATOR_TIPS.length) % CREATOR_TIPS.length)
                }
                className="w-5 h-5 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-black/10 transition-colors"
                title="Tips sebelumnya"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveTipIndex((prev) => (prev + 1) % CREATOR_TIPS.length)
                }
                className="w-5 h-5 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-black/10 transition-colors"
                title="Tips berikutnya"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5">
            {currentTip.title}
          </p>
          <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300 line-clamp-2">
            {currentTip.text}
          </p>

          <div className="flex items-center justify-center gap-1 mt-2">
            {CREATOR_TIPS.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === activeTipIndex
                    ? 'w-4 bg-amber-500'
                    : 'w-1 bg-zinc-300 dark:bg-zinc-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer Real-Time Time Estimator */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-300 font-medium">
          {progressPercent >= 100 ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          )}
          <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span>
            {progressPercent >= 100
              ? 'Konsep siap ditampilkan!'
              : `Estimasi selesai: ~${remainingSeconds} detik lagi. Berjalan lancar & stabil.`}
          </span>
        </div>
      </div>
    </div>
  );
};
