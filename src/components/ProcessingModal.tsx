/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Sparkles, Wand2, Video, CheckCircle2, Loader2, ShieldCheck, Layers } from 'lucide-react';
import { GenerationConfig, InputMode } from '../types';

interface ProcessingModalProps {
  isAnalyzing: boolean;
  isGenerating: boolean;
  activeInputMode?: InputMode;
  config?: GenerationConfig;
  productName?: string;
}

export const ProcessingModal: React.FC<ProcessingModalProps> = ({
  isAnalyzing,
  isGenerating,
  activeInputMode = 'images',
  config,
  productName,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const isVisible = isAnalyzing || isGenerating;

  // Analysis steps
  const analyzingSteps = [
    'Membaca & mengekstrak data dari sumber produk...',
    'Mengidentifikasi fitur nyata, manfaat fungsional & kemasan...',
    'Menentukan persona audiens & problem yang relevan...',
    'Menyusun Product Brief terverifikasi bebas klaim palsu...',
  ];

  // Script generation steps
  const generatingSteps = [
    'Menganalisis persona audiens & pain points utama...',
    'Meracik Hook 3 detik pertama dengan scroll-stopper kuat...',
    'Menyusun dialog narasi mengalir & arahan visual B-roll...',
    'Menguji batas kata & kesesuaian Safe Zone 9:16 multi-platform...',
    'Memvalidasi kepatuhan etika & memfinalisasi skrip siap rekam...',
  ];

  const steps = isAnalyzing ? analyzingSteps : generatingSteps;

  // Cycle through step animations smoothly every 2.4 seconds
  useEffect(() => {
    if (!isVisible) {
      setCurrentStepIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % steps.length);
    }, 2400);

    return () => clearInterval(timer);
  }, [isVisible, steps.length]);

  if (!isVisible) return null;

  const modeLabel =
    activeInputMode === 'images'
      ? 'Foto Produk'
      : activeInputMode === 'url'
      ? 'Link E-Commerce'
      : activeInputMode === 'text'
      ? 'Deskripsi Teks'
      : 'Campuran';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs animate-in fade-in duration-200"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-2xl max-w-md w-full p-6 sm:p-7 text-center relative overflow-hidden">
        {/* Top ambient color bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-purple-500 animate-pulse" />

        {/* Center Animated Icon Badge */}
        <div className="relative mx-auto w-20 h-20 mb-5 flex items-center justify-center">
          {/* Pulsing glow ring */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/15 animate-ping" />
          <div className="absolute inset-1 rounded-full bg-emerald-500/20 animate-pulse" />

          {/* Rotating outer ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/40 animate-spin" style={{ animationDuration: '6s' }} />

          {/* Central Icon */}
          <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
            {isAnalyzing ? (
              <Sparkles className="w-7 h-7 animate-bounce" style={{ animationDuration: '2s' }} />
            ) : (
              <Video className="w-7 h-7 animate-bounce" style={{ animationDuration: '2s' }} />
            )}
          </div>
        </div>

        {/* Header Text */}
        <h3 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight mb-1.5">
          {isAnalyzing ? 'Sedang Menganalisis Sumber Produk' : 'Sedang Memproduksi Skrip Siap Rekam'}
        </h3>

        {/* Subtitle / Context Pills */}
        <p className="text-xs text-zinc-500 mb-5">
          {isAnalyzing ? (
            <span>
              Mengekstrak fakta dari <strong>{modeLabel}</strong> menggunakan AI Gemini.
            </span>
          ) : (
            <span>
              Membuat <strong>{config?.scriptCount || 3} Konsep</strong> video durasi{' '}
              <strong>{config?.durationSeconds || 30}s</strong> ({config?.style || 'Natural'}).
            </span>
          )}
        </p>

        {/* Dynamic Step Notification Card */}
        <div className="bg-zinc-50 rounded-2xl border border-zinc-200/80 p-3.5 mb-5 text-left space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Progress Berjalan
            </span>
            <span className="text-zinc-400">
              Tahap {currentStepIndex + 1} dari {steps.length}
            </span>
          </div>

          <div className="text-xs font-medium text-zinc-800 transition-all duration-300 min-h-[36px] flex items-center">
            {steps[currentStepIndex]}
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full bg-zinc-200/80 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.min(95, Math.max(15, ((currentStepIndex + 1) / steps.length) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* Do-not-click Reminder Banner */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-amber-800 bg-amber-50/80 border border-amber-200/70 py-2 px-3 rounded-xl font-medium">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Mohon tunggu sebentar & jangan menekan tombol lainnya.</span>
        </div>
      </div>
    </div>
  );
};
