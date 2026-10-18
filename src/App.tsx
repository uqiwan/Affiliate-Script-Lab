/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { SafeZoneModal } from './components/SafeZoneModal';
import { InputPanel, InputMode } from './components/InputPanel';
import { ProductBriefEditor } from './components/ProductBriefEditor';
import { GeneratorConfigPanel } from './components/GeneratorConfigPanel';
import { ScriptCard } from './components/ScriptCard';
import { ManualCopyModal } from './components/ManualCopyModal';
import { ProcessingModal } from './components/ProcessingModal';
import { InfoTooltip } from './components/InfoTooltip';
import {
  ProductBrief,
  GenerationConfig,
  ScriptItem,
  ExtractProductResponse,
  GenerateScriptsResponse,
  RefineScriptResponse,
} from './types';
import { generateAllScriptsTxt, downloadScriptsTxtFile } from './utils/exportTxt';
import {
  Sparkles,
  Download,
  Copy,
  Layers,
  AlertCircle,
  CheckCircle,
  Video,
  FileCheck,
  ChevronRight,
  Check,
  Lock,
  ArrowLeft,
  ArrowRight,
  Sliders,
  FileText,
} from 'lucide-react';

export type StepNumber = 1 | 2 | 3 | 4;

const INITIAL_BRIEF: ProductBrief = {
  name: '',
  category: '',
  description: '',
  features: [],
  benefits: [],
  audience: 'Umum',
  painPoints: [],
  restrictions: [],
  sources: [],
  conflicts: [],
};

const INITIAL_CONFIG: GenerationConfig = {
  scriptCount: 3,
  durationSeconds: 30,
  style: 'Natural conversational',
  audiencePersona: 'Auto',
  angleMode: 'auto',
  selectedAngles: [],
  hookType: 'Auto',
  demoMethod: 'Auto',
  ctaType: 'Auto',
  sellingIntensity: 'Balanced',
  priceAnchoringEnabled: false,
  urgencyEnabled: false,
  pronouns: 'aku/saya',
};

export default function App() {
  const [productBrief, setProductBrief] = useState<ProductBrief>(INITIAL_BRIEF);
  const [config, setConfig] = useState<GenerationConfig>(INITIAL_CONFIG);
  const [scripts, setScripts] = useState<ScriptItem[]>([]);
  const [activeScriptIndex, setActiveScriptIndex] = useState<number>(0);

  // Workflow Stage State
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [isBriefApproved, setIsBriefApproved] = useState<boolean>(false);

  // Loading States
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [activeInputMode, setActiveInputMode] = useState<InputMode>('images');

  // Modals & Feedback
  const [safeZoneOpen, setSafeZoneOpen] = useState<boolean>(false);
  const [manualCopy, setManualCopy] = useState<{ isOpen: boolean; text: string; title: string }>({
    isOpen: false,
    text: '',
    title: '',
  });
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(
    null
  );
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [conflictsFound, setConflictsFound] = useState<string[]>([]);
  const [extractWarning, setExtractWarning] = useState<string | undefined>(undefined);

  // Unlocked Status checks
  const isBriefUnlocked = Boolean(productBrief.name || productBrief.description);
  const isConfigUnlocked = isBriefApproved;
  const isScriptsUnlocked = scripts.length > 0;

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleCopyText = async (text: string, label: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        showToast(`${label} berhasil disalin ke clipboard!`, 'success');
      } else {
        throw new Error('Clipboard API tidak tersedia');
      }
    } catch {
      setManualCopy({
        isOpen: true,
        text,
        title: `Salin ${label}`,
      });
    }
  };

  const handleCopyAll = () => {
    if (scripts.length === 0) return;
    const fullText = generateAllScriptsTxt(productBrief, config, scripts);
    handleCopyText(fullText, 'Seluruh Paket Skrip');
  };

  const handleDownloadTxt = () => {
    if (scripts.length === 0) return;
    try {
      downloadScriptsTxtFile(productBrief, config, scripts);
      showToast('File skrip .txt berhasil diunduh!', 'success');
    } catch {
      showToast('Gagal mengunduh file teks', 'error');
    }
  };

  // 1. Analyze product input
  const handleAnalyzeInput = async (data: {
    inputMode: InputMode;
    textDescription?: string;
    productUrl?: string;
    images?: Array<{ name: string; mimeType: string; base64Data: string; size: number }>;
  }) => {
    setActiveInputMode(data.inputMode);
    setIsAnalyzing(true);
    setGlobalError(null);
    setExtractWarning(undefined);
    setConflictsFound([]);

    try {
      const response = await fetch('/api/extract-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || `HTTP error ${response.status}`);
      }

      const resData = (await response.json()) as ExtractProductResponse;
      const isSingle = data.inputMode !== 'mixed';
      const finalConflicts = isSingle ? [] : (resData.conflictsFound || []);
      const cleanBrief: ProductBrief = {
        ...resData.productBrief,
        conflicts: finalConflicts,
        activeSourceMode: data.inputMode,
        platform:
          data.inputMode === 'url' || (data.inputMode === 'mixed' && Boolean(data.productUrl))
            ? resData.platform
            : undefined,
      };

      setProductBrief(cleanBrief);
      setConflictsFound(finalConflicts);
      setExtractWarning(resData.warning);

      // Advance directly to Step 2: Product Brief
      setCurrentStep(2);
      setIsBriefApproved(false); // require user to approve this fresh brief

      let toastMsg = 'Brief produk berhasil diekstrak dan disiapkan!';
      if (data.inputMode === 'images') {
        toastMsg = `Foto "${cleanBrief.name}" selesai dianalisis (khusus foto, tanpa konflik)!`;
      } else if (data.inputMode === 'url') {
        toastMsg = `Informasi link "${cleanBrief.name}" selesai dipetakan (khusus link saja)!`;
      } else if (data.inputMode === 'text') {
        toastMsg = `Deskripsi "${cleanBrief.name}" selesai disusun (khusus teks saja)!`;
      } else {
        toastMsg = `Informasi gabungan "${cleanBrief.name}" selesai disiapkan!`;
      }
      showToast(toastMsg, 'success');
    } catch (err: any) {
      setGlobalError(err.message || 'Gagal memproses informasi produk.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 2. Approve Brief
  const handleApproveBrief = () => {
    if (!productBrief.name) {
      setGlobalError('Harap isi Nama Produk sebelum menyetujui brief.');
      return;
    }
    setIsBriefApproved(true);
    setCurrentStep(3); // Advance to Step 3: Pengaturan Generator
    showToast('Brief produk disetujui! Lanjut mengatur skrip.', 'success');
  };

  // 3. Generate full scripts batch
  const handleGenerateScripts = async () => {
    if (!productBrief.name && !productBrief.description) {
      setGlobalError('Harap lengkapi minimal Nama dan Deskripsi produk sebelum membuat skrip.');
      return;
    }

    setIsGenerating(true);
    setGlobalError(null);

    try {
      const response = await fetch('/api/generate-scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productBrief,
          config,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || `HTTP error ${response.status}`);
      }

      const resData = (await response.json()) as GenerateScriptsResponse;
      setScripts(resData.scripts || []);
      setActiveScriptIndex(0);
      setCurrentStep(4); // Advance to Step 4: Skrip
      showToast(`${resData.scripts.length} skrip siap rekam berhasil dibuat!`, 'success');
    } catch (err: any) {
      setGlobalError(err.message || 'Terjadi kesalahan saat memproduksi skrip.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 4. Regenerate single script
  const handleRegenerateScript = async (targetScript: ScriptItem) => {
    await handleRefineScript(targetScript, 'change_angle');
  };

  // 5. Refine single script
  const handleRefineScript = async (
    targetScript: ScriptItem,
    refinementType: any,
    customInstruction?: string
  ) => {
    setIsRefining(true);
    try {
      const response = await fetch('/api/refine-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: targetScript,
          productBrief,
          config,
          refinementType,
          customInstruction,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Gagal memperbaiki skrip');
      }

      const resData = (await response.json()) as RefineScriptResponse;
      setScripts((prev) =>
        prev.map((s) => (s.id === targetScript.id ? resData.script : s))
      );
      showToast('Skrip berhasil disempurnakan!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal memproses perbaikan', 'error');
    } finally {
      setIsRefining(false);
    }
  };

  // Reset entire form
  const handleReset = () => {
    if (window.confirm('Reset seluruh informasi produk dan skrip yang telah dibuat?')) {
      setProductBrief(INITIAL_BRIEF);
      setConfig(INITIAL_CONFIG);
      setScripts([]);
      setCurrentStep(1);
      setIsBriefApproved(false);
      setGlobalError(null);
      setConflictsFound([]);
      setExtractWarning(undefined);
      showToast('Formulir berhasil di-reset.', 'info');
    }
  };

  const hasData = Boolean(productBrief.name || scripts.length > 0);

  // Stepper items definition
  const stepsConfig = [
    {
      num: 1 as StepNumber,
      label: 'Sumber Info',
      unlocked: true,
      completed: isBriefUnlocked,
    },
    {
      num: 2 as StepNumber,
      label: 'Brief Produk',
      unlocked: isBriefUnlocked,
      completed: isBriefApproved,
    },
    {
      num: 3 as StepNumber,
      label: 'Pengaturan',
      unlocked: isConfigUnlocked,
      completed: isScriptsUnlocked,
    },
    {
      num: 4 as StepNumber,
      label: 'Hasil Skrip',
      unlocked: isScriptsUnlocked,
      completed: isScriptsUnlocked,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-100/70 text-zinc-900 flex flex-col font-sans">
      {/* Top Processing Ambient Indicator */}
      {(isAnalyzing || isGenerating) && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-purple-500 animate-pulse shadow-xs" />
      )}

      {/* App Header */}
      <Header
        onReset={handleReset}
        onOpenSafeZone={() => setSafeZoneOpen(true)}
        hasData={hasData}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg border text-xs sm:text-sm font-semibold transition-all transform animate-bounce bg-white border-zinc-200 text-zinc-900">
          {toastMessage.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600" />}
          {toastMessage.type === 'info' && <Sparkles className="w-4 h-4 text-teal-600" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-5 lg:p-6">
        {/* Global Error Banner */}
        {globalError && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3 text-rose-900 text-xs sm:text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-0.5">Perhatian:</strong>
                <span>{globalError}</span>
              </div>
            </div>
            <button
              onClick={() => setGlobalError(null)}
              className="text-xs font-semibold text-rose-700 hover:underline shrink-0 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* INTERACTIVE WORKFLOW STEPPER BAR                          */}
        {/* ========================================================= */}
        <div className="mb-4 bg-white rounded-2xl border border-zinc-200 shadow-xs p-2 sm:p-3">
          <div className="grid grid-cols-4 gap-1 sm:gap-2">
            {stepsConfig.map((s) => {
              const isActive = currentStep === s.num;
              const isClickable = s.unlocked;

              return (
                <button
                  key={s.num}
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && setCurrentStep(s.num)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-1 sm:px-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : s.completed
                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80 cursor-pointer'
                      : s.unlocked
                      ? 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100 cursor-pointer'
                      : 'bg-zinc-100/60 text-zinc-400 cursor-not-allowed opacity-60'
                  }`}
                  title={
                    !s.unlocked
                      ? 'Selesaikan tahap sebelumnya terlebih dahulu'
                      : `Buka ${s.label}`
                  }
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                      isActive
                        ? 'bg-white text-emerald-700 font-extrabold'
                        : s.completed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-200 text-zinc-600'
                    }`}
                  >
                    {s.completed && !isActive ? <Check className="w-2.5 h-2.5" /> : s.num}
                  </span>
                  <span className="truncate">{s.label}</span>
                  {!s.unlocked && <Lock className="w-2.5 h-2.5 hidden sm:inline shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* WORKFLOW CONTENT: Tampil Utuh Per Tahap Sesuai Urutan      */}
        {/* ========================================================= */}
        <div className="space-y-4">
          {/* TAHAP 1: SUMBER INFO PRODUK */}
          {currentStep === 1 && (
            <div className="animate-in fade-in duration-200">
              <InputPanel
                onAnalyze={handleAnalyzeInput}
                isAnalyzing={isAnalyzing}
                disabled={isGenerating || isRefining}
              />
            </div>
          )}

          {/* TAHAP 2: PRODUCT BRIEF TERVERIFIKASI */}
          {currentStep === 2 && isBriefUnlocked && (
            <div className="animate-in fade-in duration-200">
              <ProductBriefEditor
                brief={productBrief}
                onChange={setProductBrief}
                conflicts={conflictsFound}
                onDismissConflict={() => setConflictsFound([])}
                warning={extractWarning}
                onApprove={handleApproveBrief}
                onBackToSource={() => setCurrentStep(1)}
              />
            </div>
          )}

          {/* TAHAP 3: PENGATURAN GENERATOR */}
          {currentStep === 3 && isConfigUnlocked && (
            <div className="animate-in fade-in duration-200">
              <GeneratorConfigPanel
                config={config}
                onChange={setConfig}
                onGenerate={handleGenerateScripts}
                isGenerating={isGenerating}
                disabled={isAnalyzing}
                productBrief={productBrief}
                onBackToBrief={() => setCurrentStep(2)}
              />
            </div>
          )}

          {/* TAHAP 4: HASIL SKRIP SIAP REKAM */}
          {currentStep === 4 && isScriptsUnlocked && (
            <div className="animate-in fade-in duration-200 space-y-4">
              {/* Result Actions Toolbar */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-zinc-900 flex items-center gap-1.5">
                      <span>Hasil: {scripts.length} Konsep Skrip</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {config.durationSeconds} Detik
                      </span>
                      <InfoTooltip
                        title="Hasil Skrip Siap Rekam"
                        content="Setiap konsep memiliki variasi angle, hook 3 detik, alur visual B-roll, naskah suara yang diuji batas kata aman, dan ajakan bertindak netral tanpa sebutan satu platform tertentu."
                      />
                    </h3>
                  </div>
                </div>

                {/* Batch Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                    title="Ubah durasi atau gaya dan buat lagi"
                  >
                    <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Ubah Setelan</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyAll}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                    title="Salin seluruh paket skrip ke clipboard"
                  >
                    <Copy className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Salin Semua</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadTxt}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white transition-colors cursor-pointer shadow-xs"
                    title="Unduh seluruh skrip sebagai file .txt UTF-8"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh TXT</span>
                  </button>
                </div>
              </div>

              {/* Concept Tabs Selector */}
              {scripts.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {scripts.map((sc, i) => (
                    <button
                      key={sc.id || i}
                      type="button"
                      onClick={() => setActiveScriptIndex(i)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                        activeScriptIndex === i
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                      }`}
                    >
                      <span>Konsep #{i + 1}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded ${
                          activeScriptIndex === i
                            ? 'bg-emerald-700 text-white'
                            : 'bg-zinc-100 text-zinc-500'
                        }`}
                      >
                        {sc.angle.split('/')[0].replace(/^\d+\.\s*/, '')}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Active Script Card */}
              {scripts[activeScriptIndex] && (
                <ScriptCard
                  key={scripts[activeScriptIndex].id}
                  script={scripts[activeScriptIndex]}
                  index={activeScriptIndex}
                  totalScripts={scripts.length}
                  onCopyText={handleCopyText}
                  onRegenerate={handleRegenerateScript}
                  onRefine={handleRefineScript}
                  isRefining={isRefining}
                />
              )}
            </div>
          )}
        </div>
      </main>

      {/* Safe Zone Modal */}
      <SafeZoneModal
        isOpen={safeZoneOpen}
        onClose={() => setSafeZoneOpen(false)}
      />

      {/* Manual Clipboard Fallback Modal */}
      <ManualCopyModal
        isOpen={manualCopy.isOpen}
        onClose={() => setManualCopy({ isOpen: false, text: '', title: '' })}
        text={manualCopy.text}
        title={manualCopy.title}
      />

      {/* Active Processing Modal / Progress Indicator */}
      <ProcessingModal
        isAnalyzing={isAnalyzing}
        isGenerating={isGenerating}
        activeInputMode={activeInputMode}
        config={config}
        productName={productBrief.name}
      />
    </div>
  );
}
