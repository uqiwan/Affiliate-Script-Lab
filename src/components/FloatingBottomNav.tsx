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
        className="pointer-events-auto w-full bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-800 shadow-xl rounded-2xl p-1.5 flex items-stretch gap-1.5 select-none"
      >
        {/* ========================================================= */}
        {/* 1. TOMBOL ANALISIS (Tahap Sumber Info)                    */}
        {/* ========================================================= */}
        <button
          type="button"
          onClick={handleStep1}
          style={getChevronStyle(0)}
          className={`flex-1 h-12 py-1 pl-2.5 pr-3.5 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-150 cursor-pointer rounded-l-xl ${
            currentStep === 1
              ? isAnalyzing
                ? 'bg-indigo-600 text-white shadow-xs cursor-wait'
                : !isInputValid
                ? 'bg-indigo-600/70 text-white/90 shadow-xs'
                : 'bg-indigo-600 text-white shadow-xs active:scale-95'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200/80 dark:hover:bg-zinc-700 active:scale-95'
          }`}
          title={
            currentStep === 1
              ? isInputValid
                ? 'Klik untuk menganalisis dan menyiapkan brief'
                : 'Harap isi sumber informasi produk terlebih dahulu'
              : 'Kembali ke tahap Sumber Info Produk'
          }
        >
          {isAnalyzing && currentStep === 1 ? (
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mb-0.5" />
          ) : (
            <Sparkles
              className={`w-4 h-4 mb-0.5 ${
                currentStep === 1 && isInputValid ? 'text-amber-300' : ''
              }`}
            />
          )}
          <span className="text-[11px] font-bold tracking-tight">
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
          className={`flex-1 h-12 py-1 px-3.5 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-150 ${
            !isBriefUnlocked
              ? 'bg-slate-50 dark:bg-zinc-900/50 text-slate-400 dark:text-zinc-600 cursor-not-allowed'
              : currentStep === 2
              ? 'bg-emerald-600 text-white shadow-xs cursor-pointer active:scale-95'
              : isBriefApproved
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 cursor-pointer active:scale-95'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200/80 dark:hover:bg-zinc-700 cursor-pointer active:scale-95'
          }`}
          title={
            !isBriefUnlocked
              ? 'Brief terkunci. Lakukan analisis sumber terlebih dahulu.'
              : currentStep === 2
              ? 'Klik untuk menyetujui brief dan lanjut ke setelan'
              : 'Lihat Product Brief'
          }
        >
          {isBriefApproved ? (
            <Check className="w-4 h-4 mb-0.5 text-emerald-300 stroke-[2.5]" />
          ) : (
            <FileText className="w-4 h-4 mb-0.5" />
          )}
          <span className="text-[11px] font-bold tracking-tight">
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
          className={`flex-1 h-12 py-1 px-3 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-150 ${
            !isConfigUnlocked
              ? 'bg-slate-50 dark:bg-zinc-900/50 text-slate-400 dark:text-zinc-600 cursor-not-allowed'
              : currentStep === 3
              ? isGenerating
                ? 'bg-blue-600 text-white shadow-xs cursor-wait'
                : isAuthLocked
                ? 'bg-amber-600 text-white shadow-xs cursor-pointer active:scale-95'
                : 'bg-blue-600 text-white shadow-xs cursor-pointer active:scale-95'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200/80 dark:hover:bg-zinc-700 cursor-pointer active:scale-95'
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
          {isGenerating && currentStep === 3 ? (
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mb-0.5" />
          ) : isAuthLocked && currentStep === 3 ? (
            <Lock className="w-4 h-4 mb-0.5 text-white" />
          ) : (
            <Wand2 className="w-4 h-4 mb-0.5" />
          )}
          <span className="text-[11px] font-bold tracking-tight truncate max-w-full">
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
          className={`flex-1 h-12 py-1 pl-3.5 pr-2.5 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-150 rounded-r-xl ${
            !isScriptsUnlocked
              ? 'bg-slate-50 dark:bg-zinc-900/50 text-slate-400 dark:text-zinc-600 cursor-not-allowed'
              : currentStep === 4
              ? 'bg-amber-600 text-white shadow-xs cursor-pointer active:scale-95'
              : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200/80 dark:hover:bg-zinc-700 cursor-pointer active:scale-95'
          }`}
          title={
            !isScriptsUnlocked
              ? 'Skrip belum dibuat. Selesaikan tahap buat skrip terlebih dahulu.'
              : currentStep === 4
              ? 'Buka teleprompter layar penuh'
              : 'Lihat Hasil Skrip'
          }
        >
          <MonitorPlay className="w-4 h-4 mb-0.5" />
          <span className="text-[11px] font-bold tracking-tight">
            Prompter
          </span>
          {scriptsCount > 0 && (
            <span className="absolute top-1 right-2 text-[9px] font-bold bg-white text-amber-700 rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1 shadow-xs">
              {scriptsCount}
            </span>
          )}
        </button>
      </nav>
    </div>
  );
};

export const FloatingBottomNav = React.memo(FloatingBottomNavComponent);

