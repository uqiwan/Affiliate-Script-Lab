/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { SafeZoneModal } from './components/SafeZoneModal';
import { InputPanel } from './components/InputPanel';
import { ProductBriefEditor } from './components/ProductBriefEditor';
import { GeneratorConfigPanel } from './components/GeneratorConfigPanel';
import { ScriptCard } from './components/ScriptCard';
import { ManualCopyModal } from './components/ManualCopyModal';
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
} from 'lucide-react';

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

  // Loading States
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);

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
      // Fallback to modal with selectable textarea
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
    } catch (err: any) {
      showToast('Gagal mengunduh file teks', 'error');
    }
  };

  // 1. Analyze product input
  const handleAnalyzeInput = async (data: {
    textDescription?: string;
    productUrl?: string;
    images?: Array<{ name: string; mimeType: string; base64Data: string; size: number }>;
  }) => {
    setIsAnalyzing(true);
    setGlobalError(null);
    setExtractWarning(undefined);

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
      setProductBrief(resData.productBrief);
      setConflictsFound(resData.conflictsFound || []);
      setExtractWarning(resData.warning);

      const platformName = resData.platform || (resData.extractedFromUrl ? 'link' : '');
      const toastMsg = platformName
        ? `Informasi ${platformName} "${resData.productBrief.name}" berhasil dipetakan ke brief!`
        : 'Brief produk berhasil diekstrak dan disiapkan!';
      showToast(toastMsg, 'success');
    } catch (err: any) {
      setGlobalError(err.message || 'Gagal memproses informasi produk.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 2. Generate full scripts batch
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
      showToast(`${resData.scripts.length} skrip siap rekam berhasil dibuat!`, 'success');
    } catch (err: any) {
      setGlobalError(err.message || 'Terjadi kesalahan saat memproduksi skrip.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. Regenerate single script
  const handleRegenerateScript = async (targetScript: ScriptItem) => {
    await handleRefineScript(targetScript, 'change_angle');
  };

  // 4. Refine single script
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
      setGlobalError(null);
      setConflictsFound([]);
      setExtractWarning(undefined);
      showToast('Formulir berhasil di-reset.', 'info');
    }
  };

  const hasData = !!(productBrief.name || scripts.length > 0);

  return (
    <div className="min-h-screen bg-zinc-100/70 text-zinc-900 flex flex-col font-sans">
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
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Global Error Banner */}
        {globalError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3 text-rose-900 text-xs sm:text-sm">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-0.5">Perhatian:</strong>
                <span>{globalError}</span>
              </div>
            </div>
            <button
              onClick={() => setGlobalError(null)}
              className="text-xs font-semibold text-rose-700 hover:underline shrink-0"
            >
              Tutup
            </button>
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Input & Configuration (~40% desktop) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Step 1: Input Source */}
            <InputPanel
              onAnalyze={handleAnalyzeInput}
              isAnalyzing={isAnalyzing}
              disabled={isGenerating || isRefining}
            />

            {/* Step 2: Editable Product Brief */}
            {(productBrief.name || productBrief.description || isAnalyzing) && (
              <ProductBriefEditor
                brief={productBrief}
                onChange={setProductBrief}
                conflicts={conflictsFound}
                warning={extractWarning}
              />
            )}

            {/* Step 3: Generator Configuration */}
            <GeneratorConfigPanel
              config={config}
              onChange={setConfig}
              onGenerate={handleGenerateScripts}
              isGenerating={isGenerating}
              disabled={isAnalyzing}
              productBrief={productBrief}
            />
          </div>

          {/* RIGHT COLUMN: Results & Scripts (~60% desktop) */}
          <div className="lg:col-span-7 space-y-5">
            {scripts.length === 0 ? (
              /* EMPTY STATE */
              <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-8 sm:p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                  <Video className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-zinc-900">
                    Belum Ada Skrip Dibuat
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                    Masukkan gambar produk, link e-commerce, atau deskripsi teks di panel kiri, lalu klik{' '}
                    <strong>"Buat Skrip"</strong> untuk memproduksi konsep video TikTok Affiliate siap rekam.
                  </p>
                </div>

                {/* Feature highlight badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 max-w-lg mx-auto text-left text-xs">
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60">
                    <span className="font-bold text-zinc-900 block mb-1">⚡ Hook 3 Detik</span>
                    <span className="text-zinc-500 text-[11px] leading-tight block">
                      Scroll-stopper variatif & pattern interrupt.
                    </span>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60">
                    <span className="font-bold text-zinc-900 block mb-1">🛡️ Faktual 100%</span>
                    <span className="text-zinc-500 text-[11px] leading-tight block">
                      Tanpa overclaim harga, stok, atau testimoni palsu.
                    </span>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/60">
                    <span className="font-bold text-zinc-900 block mb-1">📱 Safe Zone 9:16</span>
                    <span className="text-zinc-500 text-[11px] leading-tight block">
                      Overlay terhindar dari tombol keranjang & like.
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* SCRIPTS RESULTS VIEW */
              <div className="space-y-4">
                {/* Result Actions Toolbar */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-zinc-900 flex items-center gap-2">
                      <span>Hasil: {scripts.length} Konsep Skrip</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {config.durationSeconds} Detik
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Tiap konsep memakai angle, persona, dan hook berbeda
                    </p>
                  </div>

                  {/* Batch Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyAll}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                      title="Salin seluruh paket skrip ke clipboard"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Semua</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadTxt}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white transition-colors cursor-pointer shadow-xs"
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
                        className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
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

                {/* All Scripts quick overview accordion / list if user wants to see all */}
                {scripts.length > 1 && (
                  <div className="pt-2 text-center">
                    <p className="text-xs text-zinc-400">
                      Gunakan tombol tab di atas atau klik "Unduh TXT" untuk menyimpan keseluruhan {scripts.length} konsep video.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
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
    </div>
  );
}
