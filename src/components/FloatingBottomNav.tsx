/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Sparkles,
  FileText,
  Wand2,
  MonitorPlay,
  Check,
  Lock,
} from 'lucide-react';
import { StepNumber } from '../App';

interface FloatingBottomNavProps {
  currentStep: StepNumber;
  onStepChange: (step: StepNumber) => void;
  isBriefUnlocked: boolean;
  isBriefApproved: boolean;
  isConfigUnlocked: boolean;
  isScriptsUnlocked: boolean;
  scriptsCount: number;

  // Step 1
  onAnalyze: () => void;
  isAnalyzing: boolean;
  isInputValid: boolean;

  // Step 2
  onApproveBrief: () => void;
  isBriefValid: boolean;
  onBackToSource?: () => void;

  // Step 3
  onGenerate: () => void;
  isGenerating: boolean;
  scriptCount?: number;
  durationSeconds?: number;
  isAuthLocked?: boolean;
  onRequireAuthOrKey?: () => void;
  onBackToBrief?: () => void;

  // Step 4
  onOpenTeleprompter: () => void;
  onOpenFloatingPrompter?: () => void;
  onCopyAllScripts?: () => void;

  // Global settings modal trigger (optional)
  onOpenSettings?: () => void;
}

const FloatingBottomNavComponent: React.FC<FloatingBottomNavProps> = ({
  currentStep,
  onStepChange,
  isBriefUnlocked,
  isBriefApproved,
  isConfigUnlocked,
  isScriptsUnlocked,
  scriptsCount,

  onAnalyze,
  isAnalyzing,
  isInputValid,

  onApproveBrief,
  isBriefValid,

  onGenerate,
  isGenerating,
  isAuthLocked = false,
  onRequireAuthOrKey,

  onOpenTeleprompter,
}) => {
  // Chevron clip-path lembut (tidak terlalu lancip) dengan nuansa tahap berikutnya yang elegan
  const getChevronStyle = (index: number) => {
    const slant = '5px'; // Lembut, modern, tidak tajam/terlalu lancip
    if (index === 0) {
      // Tombol pertama: sisi kiri datar/lurus, sisi kanan melancip sangat lembut ke kanan
      return {
        clipPath: `polygon(0% 0%, calc(100% - ${slant}) 0%, 100% 50%, calc(100% - ${slant}) 100%, 0% 100%)`,
      };
    }
    if (index === 3) {
      // Tombol terakhir: sisi kiri cekung lembut mengikuti tombol 3, sisi kanan lurus rapi
      return {
        clipPath: `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, ${slant} 50%)`,
      };
    }
    // Tombol tengah (1 & 2): sisi kiri cekung lembut, sisi kanan melancip sangat lembut
    return {
      clipPath: `polygon(0% 0%, calc(100% - ${slant}) 0%, 100% 50%, calc(100% - ${slant}) 100%, 0% 100%, ${slant} 50%)`,
    };
  };

  const handleStep1 = () => {
    if (currentStep === 1) {
      if (!isAnalyzing && isInputValid) {
        onAnalyze();
      }
    } else {
      onStepChange(1);
    }
  };

  const handleStep2 = () => {
    if (!isBriefUnlocked) return;
    if (currentStep === 2) {
      if (isBriefValid) {
        onApproveBrief();
      }
    } else {
      onStepChange(2);
    }
  };

  const handleStep3 = () => {
    if (!isConfigUnlocked) return;
    if (currentStep === 3) {
      if (isAuthLocked && onRequireAuthOrKey) {
        onRequireAuthOrKey();
        return;
      }
      if (!isGenerating) {
        onGenerate();
      }
    } else {
      onStepChange(3);
    }
  };

  const handleStep4 = () => {
    if (!isScriptsUnlocked) return;
    if (currentStep === 4) {
      onOpenTeleprompter();
    } else {
      onStepChange(4);
    }
  };

  return (
    <div className="fixed bottom-3 sm:bottom-4 inset-x-0 mx-auto max-w-lg px-3 sm:px-4 z-40 pointer-events-none">
      <nav
        aria-label="Tahapan Alur Gagaswara"
        className="pointer-events-auto w-full bg-white/75 dark:bg-[#1C1C1E]/80 backdrop-blur-2xl border border-white/60 dark:border-white/15 shadow-[0_16px_44px_rgba(0,0,0,0.18),_inset_0_1px_1px_rgba(255,255,255,0.7)] rounded-[22px] p-1.5 flex items-stretch gap-1.5 select-none"
      >
        {/* ========================================================= */}
        {/* 1. TOMBOL ANALISIS (Tahap Sumber Info)                    */}
        {/* ========================================================= */}
        <button
          type="button"
          onClick={handleStep1}
          style={getChevronStyle(0)}
          className={`group flex-1 h-13 py-1.5 pl-2.5 pr-3.5 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-200 cursor-pointer rounded-l-[14px] ${
            currentStep === 1
              ? isAnalyzing
                ? 'bg-gradient-to-b from-[#6366F1]/90 via-[#4F46E5]/85 to-[#3B82F6]/90 text-white backdrop-blur-md shadow-[0_6px_18px_rgba(79,70,229,0.35),_inset_0_1px_1px_rgba(255,255,255,0.7),_inset_0_-3px_0px_rgba(30,27,75,0.35)] cursor-wait'
                : !isInputValid
                ? 'bg-gradient-to-b from-[#6366F1]/75 via-[#4F46E5]/70 to-[#3B82F6]/75 text-white/90 backdrop-blur-md shadow-[0_4px_12px_rgba(79,70,229,0.25),_inset_0_1px_1px_rgba(255,255,255,0.5),_inset_0_-2px_0px_rgba(30,27,75,0.3)]'
                : 'bg-gradient-to-b from-[#6366F1]/95 via-[#4F46E5]/90 to-[#3B82F6]/95 text-white backdrop-blur-md shadow-[0_6px_20px_rgba(79,70,229,0.4),_inset_0_1px_1px_rgba(255,255,255,0.7),_inset_0_-3px_0px_rgba(30,27,75,0.4)] active:translate-y-[2px] active:shadow-[0_2px_6px_rgba(79,70,229,0.3),_inset_0_2px_4px_rgba(0,0,0,0.3)]'
              : 'bg-gradient-to-b from-white/85 via-white/60 to-white/40 dark:from-white/12 dark:via-white/8 dark:to-white/4 text-zinc-800 dark:text-zinc-200 backdrop-blur-md shadow-[0_2px_6px_rgba(0,0,0,0.05),_inset_0_1px_1px_rgba(255,255,255,0.85),_inset_0_-2px_0px_rgba(0,0,0,0.08)] hover:from-white/95 hover:via-white/70 hover:to-white/50 dark:hover:from-white/18 dark:hover:to-white/8 active:translate-y-[1px]'
          }`}
          title={
            currentStep === 1
              ? isInputValid
                ? 'Klik untuk menganalisis dan menyiapkan brief'
                : 'Harap isi sumber informasi produk terlebih dahulu'
              : 'Kembali ke tahap Sumber Info Produk'
          }
        >
          {/* 3D Gloss / Sheen Highlight */}
          <span className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none rounded-t-lg" />

          {isAnalyzing && currentStep === 1 ? (
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mb-0.5 relative z-10" />
          ) : (
            <Sparkles
              className={`w-4 h-4 mb-0.5 relative z-10 filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)] ${
                currentStep === 1 && isInputValid ? 'text-amber-200' : ''
              }`}
            />
          )}
          <span className="text-[11px] font-bold tracking-tight relative z-10 filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]">
            {isAnalyzing && currentStep === 1 ? 'Menganalisis' : 'Analisis'}
          </span>
        </button>

        {/* ========================================================= */}
        {/* 2. TOMBOL BRIEF (Tahap Verifikasi Product Brief)          */}
        {/* ========================================================= */}
        <button
          type="button"
          onClick={handleStep2}
          disabled={!isBriefUnlocked}
          style={getChevronStyle(1)}
          className={`group flex-1 h-13 py-1.5 px-3.5 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-200 ${
            !isBriefUnlocked
              ? 'bg-gradient-to-b from-black/[0.04] to-black/[0.01] dark:from-white/[0.04] dark:to-white/[0.01] text-[#8E8E93]/40 cursor-not-allowed shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
              : currentStep === 2
              ? 'bg-gradient-to-b from-teal-500/95 via-emerald-600/90 to-teal-700/95 text-white backdrop-blur-md shadow-[0_6px_20px_rgba(16,185,129,0.4),_inset_0_1px_1px_rgba(255,255,255,0.7),_inset_0_-3px_0px_rgba(6,78,59,0.4)] cursor-pointer active:translate-y-[2px] active:shadow-[0_2px_6px_rgba(16,185,129,0.3),_inset_0_2px_4px_rgba(0,0,0,0.3)]'
              : isBriefApproved
              ? 'bg-gradient-to-b from-emerald-50/85 via-emerald-100/50 to-emerald-200/35 dark:from-emerald-950/40 dark:via-emerald-900/25 dark:to-emerald-950/15 text-emerald-800 dark:text-emerald-300 backdrop-blur-md shadow-[0_2px_6px_rgba(16,185,129,0.08),_inset_0_1px_1px_rgba(255,255,255,0.85),_inset_0_-2px_0px_rgba(0,0,0,0.08)] hover:from-emerald-100/90 hover:via-emerald-100/60 hover:to-emerald-200/45 dark:hover:from-emerald-900/40 cursor-pointer active:translate-y-[1px]'
              : 'bg-gradient-to-b from-white/85 via-white/60 to-white/40 dark:from-white/12 dark:via-white/8 dark:to-white/4 text-zinc-800 dark:text-zinc-200 backdrop-blur-md shadow-[0_2px_6px_rgba(0,0,0,0.05),_inset_0_1px_1px_rgba(255,255,255,0.85),_inset_0_-2px_0px_rgba(0,0,0,0.08)] hover:from-white/95 hover:via-white/70 hover:to-white/50 dark:hover:from-white/18 dark:hover:to-white/8 cursor-pointer active:translate-y-[1px]'
          }`}
          title={
            !isBriefUnlocked
              ? 'Brief terkunci. Lakukan analisis sumber terlebih dahulu.'
              : currentStep === 2
              ? 'Klik untuk menyetujui brief dan lanjut ke setelan'
              : 'Lihat Product Brief'
          }
        >
          {/* 3D Gloss / Sheen Highlight */}
          <span className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none" />

          {isBriefApproved ? (
            <Check className="w-4 h-4 mb-0.5 text-emerald-300 stroke-[2.5] relative z-10 filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" />
          ) : (
            <FileText className="w-4 h-4 mb-0.5 relative z-10 filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" />
          )}
          <span className="text-[11px] font-bold tracking-tight relative z-10 filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]">
            Brief
          </span>
        </button>

        {/* ========================================================= */}
        {/* 3. TOMBOL BUAT SKRIP (Tahap Parameter & Generate)         */}
        {/* ========================================================= */}
        <button
          type="button"
          onClick={handleStep3}
          disabled={!isConfigUnlocked}
          style={getChevronStyle(2)}
          className={`group flex-1 h-13 py-1.5 px-3 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-200 ${
            !isConfigUnlocked
              ? 'bg-gradient-to-b from-black/[0.04] to-black/[0.01] dark:from-white/[0.04] dark:to-white/[0.01] text-[#8E8E93]/40 cursor-not-allowed shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
              : currentStep === 3
              ? isGenerating
                ? 'bg-gradient-to-b from-[#7C3AED]/90 via-[#6366F1]/85 to-[#3B82F6]/90 text-white backdrop-blur-md shadow-[0_6px_18px_rgba(124,58,237,0.35),_inset_0_1px_1px_rgba(255,255,255,0.7),_inset_0_-3px_0px_rgba(46,16,101,0.35)] cursor-wait'
                : isAuthLocked
                ? 'bg-gradient-to-b from-amber-500/95 via-orange-500/90 to-amber-600/95 text-white backdrop-blur-md shadow-[0_6px_18px_rgba(249,115,22,0.35),_inset_0_1px_1px_rgba(255,255,255,0.7),_inset_0_-3px_0px_rgba(124,45,18,0.35)] cursor-pointer active:translate-y-[2px]'
                : 'bg-gradient-to-b from-[#7C3AED]/95 via-[#6366F1]/90 to-[#3B82F6]/95 text-white backdrop-blur-md shadow-[0_6px_20px_rgba(124,58,237,0.4),_inset_0_1px_1px_rgba(255,255,255,0.7),_inset_0_-3px_0px_rgba(46,16,101,0.4)] cursor-pointer active:translate-y-[2px] active:shadow-[0_2px_6px_rgba(124,58,237,0.3),_inset_0_2px_4px_rgba(0,0,0,0.3)]'
              : 'bg-gradient-to-b from-white/85 via-white/60 to-white/40 dark:from-white/12 dark:via-white/8 dark:to-white/4 text-zinc-800 dark:text-zinc-200 backdrop-blur-md shadow-[0_2px_6px_rgba(0,0,0,0.05),_inset_0_1px_1px_rgba(255,255,255,0.85),_inset_0_-2px_0px_rgba(0,0,0,0.08)] hover:from-white/95 hover:via-white/70 hover:to-white/50 dark:hover:from-white/18 dark:hover:to-white/8 cursor-pointer active:translate-y-[1px]'
          }`}
          title={
            !isConfigUnlocked
              ? 'Setelan terkunci. Selesaikan brief terlebih dahulu.'
              : currentStep === 3
              ? isAuthLocked
                ? 'Login atau pasang API Key untuk membuat skrip'
                : 'Klik untuk membuat konsep skrip video'
              : 'Lihat Setelan Skrip'
          }
        >
          {/* 3D Gloss / Sheen Highlight */}
          <span className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none" />

          {isGenerating && currentStep === 3 ? (
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mb-0.5 relative z-10" />
          ) : isAuthLocked && currentStep === 3 ? (
            <Lock className="w-4 h-4 mb-0.5 text-white relative z-10 filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" />
          ) : (
            <Wand2 className="w-4 h-4 mb-0.5 relative z-10 filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" />
          )}
          <span className="text-[11px] font-bold tracking-tight truncate max-w-full relative z-10 filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]">
            {isGenerating && currentStep === 3 ? 'Membuat...' : 'Buat Skrip'}
          </span>
        </button>

        {/* ========================================================= */}
        {/* 4. TOMBOL PROMPTER (Tahap Naskah Skrip & Teleprompter)     */}
        {/* ========================================================= */}
        <button
          type="button"
          onClick={handleStep4}
          disabled={!isScriptsUnlocked}
          style={getChevronStyle(3)}
          className={`group flex-1 h-13 py-1.5 pl-3.5 pr-2.5 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-200 rounded-r-[14px] ${
            !isScriptsUnlocked
              ? 'bg-gradient-to-b from-black/[0.04] to-black/[0.01] dark:from-white/[0.04] dark:to-white/[0.01] text-[#8E8E93]/40 cursor-not-allowed shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
              : currentStep === 4
              ? 'bg-gradient-to-b from-amber-500/95 via-orange-500/90 to-amber-600/95 text-white backdrop-blur-md shadow-[0_6px_20px_rgba(249,115,22,0.4),_inset_0_1px_1px_rgba(255,255,255,0.7),_inset_0_-3px_0px_rgba(124,45,18,0.4)] cursor-pointer active:translate-y-[2px] active:shadow-[0_2px_6px_rgba(249,115,22,0.3),_inset_0_2px_4px_rgba(0,0,0,0.3)]'
              : 'bg-gradient-to-b from-white/85 via-white/60 to-white/40 dark:from-white/12 dark:via-white/8 dark:to-white/4 text-zinc-800 dark:text-zinc-200 backdrop-blur-md shadow-[0_2px_6px_rgba(0,0,0,0.05),_inset_0_1px_1px_rgba(255,255,255,0.85),_inset_0_-2px_0px_rgba(0,0,0,0.08)] hover:from-white/95 hover:via-white/70 hover:to-white/50 dark:hover:from-white/18 dark:hover:to-white/8 cursor-pointer active:translate-y-[1px]'
          }`}
          title={
            !isScriptsUnlocked
              ? 'Skrip belum dibuat. Selesaikan tahap buat skrip terlebih dahulu.'
              : currentStep === 4
              ? 'Buka teleprompter layar penuh'
              : 'Lihat Hasil Skrip'
          }
        >
          {/* 3D Gloss / Sheen Highlight */}
          <span className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none rounded-t-lg" />

          <MonitorPlay className="w-4 h-4 mb-0.5 relative z-10 filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]" />
          <span className="text-[11px] font-bold tracking-tight relative z-10 filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]">
            Prompter
          </span>
          {scriptsCount > 0 && (
            <span className="absolute top-1.5 right-2 text-[9px] font-extrabold bg-gradient-to-b from-white to-amber-100 text-[#FF9500] rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1 shadow-[0_2px_5px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.9)] z-20">
              {scriptsCount}
            </span>
          )}
        </button>
      </nav>
    </div>
  );
};

export const FloatingBottomNav = React.memo(FloatingBottomNavComponent);

