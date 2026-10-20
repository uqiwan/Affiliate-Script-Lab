/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Wand2,
  Lock,
  MonitorPlay,
  PictureInPicture2,
  Copy,
  Layers,
  FileText,
  SlidersHorizontal,
  Film,
  Settings2,
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
  onBackToSource: () => void;

  // Step 3
  onGenerate: () => void;
  isGenerating: boolean;
  scriptCount: number;
  durationSeconds: number;
  isAuthLocked: boolean;
  onRequireAuthOrKey: () => void;
  onBackToBrief: () => void;

  // Step 4
  onOpenTeleprompter: () => void;
  onOpenFloatingPrompter: () => void;
  onCopyAllScripts: () => void;

  // Global settings modal trigger
  onOpenSettings: () => void;
}

export const FloatingBottomNav: React.FC<FloatingBottomNavProps> = ({
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
  onBackToSource,

  onGenerate,
  isGenerating,
  scriptCount,
  durationSeconds,
  isAuthLocked,
  onRequireAuthOrKey,
  onBackToBrief,

  onOpenTeleprompter,
  onOpenFloatingPrompter,
  onCopyAllScripts,

  onOpenSettings,
}) => {
  return (
    <div className="fixed bottom-2 sm:bottom-4 inset-x-0 mx-auto max-w-xl px-3 z-40 pointer-events-none">
      <div className="pointer-events-auto flex flex-col gap-2">
        {/* ========================================================= */}
        {/* 1. FLOATING PRIMARY ACTION BAR (Tengah Bawah)             */}
        {/* ========================================================= */}
        <div className="flex items-center justify-center">
          {/* STEP 1: Analisis & Siapkan Brief */}
          {currentStep === 1 && (
            <button
              type="button"
              onClick={onAnalyze}
              disabled={isAnalyzing || !isInputValid}
              className={`w-full max-w-md min-h-[48px] py-3 px-5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all duration-200 select-none shadow-xl ${
                isAnalyzing || !isInputValid
                  ? 'bg-zinc-900/40 backdrop-blur-md text-zinc-300 border border-white/20 cursor-not-allowed opacity-75'
                  : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-700 hover:to-teal-700 text-white ring-4 ring-emerald-500/25 active:scale-[0.98] cursor-pointer shadow-emerald-950/20'
              }`}
              title={
                !isInputValid
                  ? 'Harap lengkapi sumber info produk di atas terlebih dahulu'
                  : 'Klik untuk menganalisis dan menyiapkan Product Brief terverifikasi'
              }
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="tracking-wide">Menganalisis & Menyiapkan Brief...</span>
                </>
              ) : (
                <>
                  <Sparkles
                    className={`w-4 h-4 ${
                      isInputValid ? 'text-amber-200 animate-pulse' : 'text-zinc-400'
                    }`}
                  />
                  <span>Analisis & Siapkan Brief</span>
                  {isInputValid ? (
                    <ArrowRight className="w-4 h-4 ml-0.5 animate-pulse" />
                  ) : (
                    <span className="text-[11px] opacity-70 font-normal">(Isi sumber dulu)</span>
                  )}
                </>
              )}
            </button>
          )}

          {/* STEP 2: Setujui Brief */}
          {currentStep === 2 && (
            <div className="w-full max-w-md flex items-center gap-2">
              <button
                type="button"
                onClick={onBackToSource}
                className="min-h-[48px] px-3.5 rounded-2xl text-xs font-semibold bg-white/90 hover:bg-white text-zinc-700 border border-zinc-200/80 shadow-lg backdrop-blur-md flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] cursor-pointer shrink-0"
                title="Kembali ke Sumber Info"
              >
                <ArrowLeft className="w-4 h-4 text-zinc-500" />
                <span className="hidden sm:inline">Sumber</span>
              </button>

              <button
                type="button"
                onClick={onApproveBrief}
                disabled={!isBriefValid}
                className={`flex-1 min-h-[48px] py-3 px-5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all duration-200 select-none shadow-xl ${
                  !isBriefValid
                    ? 'bg-zinc-800/60 backdrop-blur-md text-zinc-400 border border-white/20 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-500/25 active:scale-[0.98] cursor-pointer shadow-emerald-950/20'
                }`}
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Setujui Brief</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          )}

          {/* STEP 3: Buat Skrip */}
          {currentStep === 3 && (
            <div className="w-full max-w-md flex items-center gap-2">
              <button
                type="button"
                onClick={onBackToBrief}
                className="min-h-[48px] px-3.5 rounded-2xl text-xs font-semibold bg-white/90 hover:bg-white text-zinc-700 border border-zinc-200/80 shadow-lg backdrop-blur-md flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] cursor-pointer shrink-0"
                title="Kembali ke Product Brief"
              >
                <ArrowLeft className="w-4 h-4 text-zinc-500" />
                <span className="hidden sm:inline">Brief</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isAuthLocked) {
                    onRequireAuthOrKey();
                    return;
                  }
                  onGenerate();
                }}
                disabled={isGenerating}
                className={`flex-1 min-h-[48px] py-3 px-5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all duration-200 select-none shadow-xl ${
                  isAuthLocked
                    ? 'bg-amber-600 hover:bg-amber-700 text-white ring-4 ring-amber-500/25 active:scale-[0.98] cursor-pointer shadow-amber-950/20'
                    : isGenerating
                    ? 'bg-zinc-800/80 backdrop-blur-md text-zinc-300 border border-white/20 cursor-wait'
                    : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-700 hover:to-teal-700 text-white ring-4 ring-emerald-500/25 active:scale-[0.98] cursor-pointer shadow-emerald-950/20'
                }`}
              >
                {isAuthLocked ? (
                  <>
                    <Lock className="w-4 h-4 text-amber-200" />
                    <span>Masuk / Atur API Key Dulu</span>
                  </>
                ) : isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Membuat {scriptCount} Skrip...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-amber-200" />
                    <span>
                      Buat Skrip ({scriptCount} Konsep · {durationSeconds}s)
                    </span>
                    <ArrowRight className="w-4 h-4 ml-0.5" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 4: Aksi Cepat Skrip Siap Rekam & Teleprompter */}
          {currentStep === 4 && (
            <div className="w-full max-w-md flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenTeleprompter}
                className="flex-1 min-h-[48px] py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-xl ring-4 ring-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                title="Buka Teleprompter Layar Penuh"
              >
                <MonitorPlay className="w-4 h-4 fill-black/20 text-black shrink-0" />
                <span className="truncate">Teleprompter</span>
              </button>

              <button
                type="button"
                onClick={onOpenFloatingPrompter}
                className="min-h-[48px] px-3.5 rounded-2xl text-xs font-bold bg-white/95 hover:bg-white text-zinc-800 border border-zinc-200/80 shadow-lg backdrop-blur-md flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] cursor-pointer shrink-0"
                title="Mode Melayang (Always on Top)"
              >
                <PictureInPicture2 className="w-4 h-4 text-amber-600" />
                <span className="hidden xs:inline">Melayang</span>
              </button>

              <button
                type="button"
                onClick={onCopyAllScripts}
                className="min-h-[48px] px-3.5 rounded-2xl text-xs font-semibold bg-white/95 hover:bg-white text-zinc-700 border border-zinc-200/80 shadow-lg backdrop-blur-md flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] cursor-pointer shrink-0"
                title="Salin Seluruh Naskah"
              >
                <Copy className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Salin</span>
              </button>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 2. iOS BOTTOM TAB BAR (Dermaga Navigasi)                   */}
        {/* ========================================================= */}
        <nav
          aria-label="Navigasi Utama Gagaswara"
          className="w-full bg-white/85 backdrop-blur-2xl border border-zinc-200/80 shadow-2xl rounded-2xl sm:rounded-3xl p-1.5 flex items-center justify-around"
        >
          {/* Tab 1: Sumber */}
          <button
            type="button"
            onClick={() => onStepChange(1)}
            className={`flex-1 py-1.5 sm:py-2 px-1 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all duration-150 cursor-pointer ${
              currentStep === 1
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/70'
            }`}
          >
            <Layers className="w-4 h-4 sm:w-4.5 sm:h-4.5 mb-0.5" />
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-tight">Sumber</span>
          </button>

          {/* Tab 2: Brief */}
          <button
            type="button"
            onClick={() => {
              if (isBriefUnlocked) onStepChange(2);
            }}
            disabled={!isBriefUnlocked}
            className={`flex-1 py-1.5 sm:py-2 px-1 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all duration-150 relative ${
              !isBriefUnlocked
                ? 'opacity-40 text-zinc-400 cursor-not-allowed'
                : currentStep === 2
                ? 'bg-zinc-900 text-white shadow-xs cursor-pointer'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/70 cursor-pointer'
            }`}
          >
            <FileText className="w-4 h-4 sm:w-4.5 sm:h-4.5 mb-0.5" />
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-tight">Brief</span>
            {isBriefApproved && (
              <span className="absolute top-1 right-2 sm:right-3 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            )}
          </button>

          {/* Tab 3: Generator */}
          <button
            type="button"
            onClick={() => {
              if (isConfigUnlocked) onStepChange(3);
            }}
            disabled={!isConfigUnlocked}
            className={`flex-1 py-1.5 sm:py-2 px-1 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all duration-150 ${
              !isConfigUnlocked
                ? 'opacity-40 text-zinc-400 cursor-not-allowed'
                : currentStep === 3
                ? 'bg-zinc-900 text-white shadow-xs cursor-pointer'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/70 cursor-pointer'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 sm:w-4.5 sm:h-4.5 mb-0.5" />
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-tight">Setelan</span>
          </button>

          {/* Tab 4: Skrip */}
          <button
            type="button"
            onClick={() => {
              if (isScriptsUnlocked) onStepChange(4);
            }}
            disabled={!isScriptsUnlocked}
            className={`flex-1 py-1.5 sm:py-2 px-1 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all duration-150 relative ${
              !isScriptsUnlocked
                ? 'opacity-40 text-zinc-400 cursor-not-allowed'
                : currentStep === 4
                ? 'bg-zinc-900 text-white shadow-xs cursor-pointer'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/70 cursor-pointer'
            }`}
          >
            <Film className="w-4 h-4 sm:w-4.5 sm:h-4.5 mb-0.5" />
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-tight">Skrip</span>
            {scriptsCount > 0 && (
              <span className="absolute top-1 right-2 sm:right-3 text-[9px] font-bold bg-emerald-600 text-white rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
                {scriptsCount}
              </span>
            )}
          </button>

          {/* Tab 5: Menu Setelan Aplikasi (Safe Zone, Riwayat, API Key, Reset) */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex-1 py-1.5 sm:py-2 px-1 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/70 transition-all duration-150 cursor-pointer"
            title="Buka Menu & Pengaturan Aplikasi"
          >
            <Settings2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 mb-0.5 text-zinc-600" />
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-tight">Menu</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
