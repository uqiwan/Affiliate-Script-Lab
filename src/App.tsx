/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SafeZoneModal } from './components/SafeZoneModal';
import { InputPanel, InputMode } from './components/InputPanel';
import { ProductBriefEditor } from './components/ProductBriefEditor';
import { GeneratorConfigPanel } from './components/GeneratorConfigPanel';
import { ScriptCard } from './components/ScriptCard';
import { ManualCopyModal } from './components/ManualCopyModal';
import { ProcessingModal } from './components/ProcessingModal';
import { HistoryModal } from './components/HistoryModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { InfoTooltip } from './components/InfoTooltip';
import {
  ProductBrief,
  GenerationConfig,
  ScriptItem,
  ExtractProductResponse,
  GenerateScriptsResponse,
  RefineScriptResponse,
  HistorySession,
} from './types';
import {
  generateAllScriptsTxt,
  generateAllVoiceoversTxt,
  downloadScriptsTxtFile,
  downloadVoiceoversTxtFile,
} from './utils/exportTxt';
import {
  Sparkles,
  Download,
  Copy,
  AlertCircle,
  CheckCircle,
  Check,
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
  scriptCount: 5,
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

const HISTORY_STORAGE_KEY = 'affiliate_script_lab_history';

// Pre-seeded example history session so user can immediately test Riwayat
const SAMPLE_HISTORY: HistorySession[] = [
  {
    id: 'sample-session-1',
    timestamp: Date.now() - 3600000 * 2,
    productName: 'Lampu Belajar Lipat LED Portable',
    category: 'Elektronik & Rumah Tangga',
    scriptCount: 3,
    durationSeconds: 30,
    productBrief: {
      name: 'Lampu Belajar Lipat LED Portable',
      category: 'Elektronik & Rumah Tangga',
      description: 'Lampu belajar meja lipat multifungsi dengan 3 mode pencahayaan dan baterai isi ulang USB-C.',
      features: ['3 tingkat kecerahan', 'Baterai rechargeable 2000mAh', 'Desain lipat 180 derajat', 'Port USB Type-C'],
      benefits: ['Mata tidak cepat lelah saat membaca malam', 'Hemat tempat di meja kost sempit', 'Bisa dibawa bepergian'],
      audience: 'Mahasiswa kost & pekerja WFH',
      painPoints: ['Lampu kamar terlalu remang', 'Meja sempit butuh lampu ringkas'],
      currentPrice: 'Rp49.000',
      referencePrice: 'Rp99.000',
      promoDetails: 'Diskon 50% + Voucher Toko',
      restrictions: ['Jangan klaim tahan air'],
      sources: [{ field: 'name', source: 'user', confidence: 'high' }],
      conflicts: [],
    },
    config: {
      scriptCount: 3,
      durationSeconds: 30,
      style: 'Natural conversational',
      audiencePersona: 'Mahasiswa/anak kost',
      angleMode: 'auto',
      selectedAngles: [],
      hookType: 'Auto',
      demoMethod: 'Auto',
      ctaType: 'Auto',
      sellingIntensity: 'Balanced',
      priceAnchoringEnabled: true,
      urgencyEnabled: false,
      pronouns: 'aku/saya',
    },
    scripts: [
      {
        id: 'sample-script-1',
        title: 'Solusi Meja Kost Sempit Tetap Terang',
        angle: 'Problem-Solution (PAS)',
        persona: 'Mahasiswa kost',
        differentiator: 'Menyorot kepraktisan lipat dan hemat tempat',
        hookType: 'Pain-point callout',
        triggers: ['Pattern Interrupt', 'Relatable Context', 'Direct CTA'],
        estimatedDurationSeconds: 30,
        spokenWordCount: 68,
        durationStatus: 'ok',
        segments: [
          {
            timeRange: '0-3 detik',
            segmentName: 'HOOK',
            visualDirection: 'Kamera menyorot meja belajar yang remang lalu lampu dinyalakan sentuh satu jari',
            spokenDialogue: 'Siapa di sini yang kalau belajar malam di kost sering pusing gara-gara lampu kamar kurang terang?',
            overlayText: 'Lampu Meja Lipat Anti Pusing',
            strategyNote: 'Menangkap perhatian anak kost yang sering mengeluh mata lelah',
          },
          {
            timeRange: '4-12 detik',
            segmentName: 'PROBLEM & DEMO',
            visualDirection: 'Perlihatkan lampu dilipat rata lalu dibuka berdiri kokoh',
            spokenDialogue: 'Ini lampu meja lipat LED yang praktis banget. Desainnya ringkas, ada 3 tingkat kecerahan yang adem di mata.',
            overlayText: '3 Tingkat Kecerahan',
            strategyNote: 'Membuktikan portabilitas produk',
          },
          {
            timeRange: '13-22 detik',
            segmentName: 'VALUE',
            visualDirection: 'Perlihatkan port kabel USB-C sedang dicolok ke powerbank',
            spokenDialogue: 'Baterainya isi ulang pakai USB-C, jadi aman pas mati lampu. Nggak perlu kabel melintang di meja sempit.',
            overlayText: 'Baterai Isi Ulang USB-C',
            strategyNote: 'Menghilangkan keberatan kabel berantakan',
          },
          {
            timeRange: '23-30 detik',
            segmentName: 'CTA',
            visualDirection: 'Tunjuk ke arah kiri bawah layar sambil memperlihatkan lampu menyala hangat',
            spokenDialogue: 'Varian warna dan promonya langsung cek di keranjang kiri bawah sekarang ya.',
            overlayText: 'Cek Keranjang Kiri Bawah',
            strategyNote: 'CTA netral multi-platform',
          },
        ],
        voiceoverOnly: 'Siapa di sini yang kalau belajar malam di kost sering pusing gara-gara lampu kamar kurang terang? Ini lampu meja lipat LED yang praktis banget. Desainnya ringkas, ada 3 tingkat kecerahan yang adem di mata. Baterainya isi ulang pakai USB-C, jadi aman pas mati lampu. Nggak perlu kabel melintang di meja sempit. Varian warna dan promonya langsung cek di keranjang kiri bawah sekarang ya.',
        qualityChecklist: ['Hook kuat', 'Batas kata sesuai', 'CTA netral multi-platform'],
        warnings: [],
      },
      {
        id: 'sample-script-2',
        title: 'Review Jujur Lampu LED 40 Ribuan',
        angle: 'UGC Honest Review',
        persona: 'Pekerja WFH & Pelajar',
        differentiator: 'Sudut pandang unboxing dan pembuktian baterai',
        hookType: 'Bold claim',
        triggers: ['Curiosity Loop', 'Demonstration Proof', 'Soft CTA'],
        estimatedDurationSeconds: 30,
        spokenWordCount: 65,
        durationStatus: 'ok',
        segments: [
          {
            timeRange: '0-3 detik',
            segmentName: 'HOOK',
            visualDirection: 'Pegang produk setinggi dada menghadap kamera',
            spokenDialogue: 'Awalnya ragu ada lampu meja 40 ribuan yang beneran awet kayak gini.',
            overlayText: 'Lampu LED Rp40 Ribuan?',
            strategyNote: 'Pemicu rasa ingin tahu dengan angka harga',
          },
          {
            timeRange: '4-15 detik',
            segmentName: 'BODY',
            visualDirection: 'Sentuh tombol switch untuk mengganti warna putih hangat dan dingin',
            spokenDialogue: 'Pas dicoba, cahayanya nggak bikin silau dan leher lampunya lentur bisa ditekuk sesuka kita.',
            overlayText: 'Lentur & Fleksibel',
            strategyNote: 'Demonstrasi fitur fisik',
          },
          {
            timeRange: '16-30 detik',
            segmentName: 'CTA',
            visualDirection: 'Arahkan telunjuk ke keranjang bawah',
            spokenDialogue: 'Buat yang cari lampu meja awet buat kerja atau belajar, detailnya ada di keranjang kiri bawah.',
            overlayText: 'Klik Keranjang Kiri Bawah',
            strategyNote: 'Direct CTA',
          },
        ],
        voiceoverOnly: 'Awalnya ragu ada lampu meja 40 ribuan yang beneran awet kayak gini. Pas dicoba, cahayanya nggak bikin silau dan leher lampunya lentur bisa ditekuk sesuka kita. Buat yang cari lampu meja awet buat kerja atau belajar, detailnya ada di keranjang kiri bawah.',
        qualityChecklist: ['Hook kuat', 'Batas kata sesuai', 'CTA netral'],
        warnings: [],
      },
    ],
  },
];

export default function App() {
  const [productBrief, setProductBrief] = useState<ProductBrief>(INITIAL_BRIEF);
  const [config, setConfig] = useState<GenerationConfig>(INITIAL_CONFIG);
  const [scripts, setScripts] = useState<ScriptItem[]>([]);
  const [resetKey, setResetKey] = useState<number>(0);

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
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState<boolean>(false);
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

  // History State
  const [history, setHistory] = useState<HistorySession[]>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return SAMPLE_HISTORY;
  });

  // Save history to localStorage
  const saveSessionToHistory = (newSession: HistorySession) => {
    setHistory((prev) => {
      const filtered = prev.filter((s) => s.id !== newSession.id);
      const updated = [newSession, ...filtered].slice(0, 30);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // quota exceeded fallback
      }
      return updated;
    });
  };

  const handleDeleteHistorySession = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    showToast('Sesi riwayat berhasil dihapus.', 'info');
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      // ignore
    }
    showToast('Seluruh riwayat berhasil dikosongkan.', 'info');
  };

  const [voiceoverModes, setVoiceoverModes] = useState<Record<number, boolean>>({});

  const handleLoadSession = (session: HistorySession) => {
    setProductBrief(session.productBrief);
    setConfig(session.config);
    setScripts(session.scripts);
    setVoiceoverModes({});
    setIsBriefApproved(true);
    setCurrentStep(4); // Advance directly to Step 4: Skrip
    setGlobalError(null);
    showToast(`Skrip "${session.productName}" berhasil dimuat dari riwayat!`, 'success');
  };

  const isAllVoiceover =
    scripts.length > 0 && scripts.every((_, idx) => Boolean(voiceoverModes[idx]));

  const handleToggleAllVoiceover = () => {
    const nextMode = !isAllVoiceover;
    const updated: Record<number, boolean> = {};
    scripts.forEach((_, idx) => {
      updated[idx] = nextMode;
    });
    setVoiceoverModes(updated);
    showToast(
      nextMode
        ? 'Semua konsep dialihkan ke versi Narasi Saja'
        : 'Semua konsep dialihkan ke versi Visual Lengkap',
      'info'
    );
  };

  const handleToggleSingleVoiceover = (index: number) => {
    setVoiceoverModes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Progressive Unlocking Logic:
  // Step 2 unlocks ONLY after analysis succeeds
  const isBriefUnlocked = Boolean(productBrief.name || productBrief.description);
  // Step 3 unlocks ONLY after user clicks "Setujui Brief"
  const isConfigUnlocked = isBriefApproved;
  // Step 4 unlocks ONLY after scripts are generated
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
        showToast(`${label} disalin ke clipboard!`, 'success');
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

  const handleCopyAllVoiceovers = () => {
    if (scripts.length === 0) return;
    const fullText = generateAllVoiceoversTxt(productBrief, scripts);
    handleCopyText(fullText, 'Seluruh Narasi Suara');
  };

  const handleCopyAllScripts = () => {
    if (scripts.length === 0) return;
    const fullText = generateAllScriptsTxt(productBrief, config, scripts);
    handleCopyText(fullText, 'Seluruh Paket Skrip Lengkap');
  };

  const handleDownloadVoiceoversTxt = () => {
    if (scripts.length === 0) return;
    try {
      downloadVoiceoversTxtFile(productBrief, scripts);
      showToast('File narasi .txt berhasil diunduh!', 'success');
    } catch {
      showToast('Gagal mengunduh file narasi', 'error');
    }
  };

  const handleDownloadScriptsTxt = () => {
    if (scripts.length === 0) return;
    try {
      downloadScriptsTxtFile(productBrief, config, scripts);
      showToast('File skrip lengkap .txt berhasil diunduh!', 'success');
    } catch {
      showToast('Gagal mengunduh file skrip', 'error');
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

      // Advance directly to Step 2: Product Brief Terverifikasi
      setCurrentStep(2);
      setIsBriefApproved(false); // require user to click 'Setujui Brief'

      showToast(`Brief "${cleanBrief.name}" berhasil disiapkan!`, 'success');
    } catch (err: any) {
      setGlobalError(err.message || 'Gagal memproses informasi produk.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 2. Approve Brief: Unlocks Step 3 (Pengaturan Generator)
  const handleApproveBrief = () => {
    if (!productBrief.name) {
      setGlobalError('Harap lengkapi Nama Produk sebelum menyetujui brief.');
      return;
    }
    setIsBriefApproved(true);
    setCurrentStep(3); // Advance to Step 3: Pengaturan Generator
    showToast('Brief disetujui! Lanjut mengatur skrip.', 'success');
  };

  // 3. Generate scripts: Unlocks Step 4 (Skrip) & Archives to History
  const handleGenerateScripts = async () => {
    if (!productBrief.name && !productBrief.description) {
      setGlobalError('Harap lengkapi minimal Nama Produk sebelum membuat skrip.');
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
      const generatedScripts = resData.scripts || [];
      setScripts(generatedScripts);
      setVoiceoverModes({});
      setCurrentStep(4); // Advance to Step 4: Skrip

      // Automatically archive this generation session to History
      const newSession: HistorySession = {
        id: `session-${Date.now()}`,
        timestamp: Date.now(),
        productName: productBrief.name || 'Produk',
        category: productBrief.category || 'Umum',
        scriptCount: generatedScripts.length,
        durationSeconds: config.durationSeconds,
        productBrief,
        config,
        scripts: generatedScripts,
      };
      saveSessionToHistory(newSession);

      showToast(`${generatedScripts.length} skrip berhasil dibuat & disimpan ke riwayat!`, 'success');
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
      const updatedList = scripts.map((s) => (s.id === targetScript.id ? resData.script : s));
      setScripts(updatedList);

      // Update current session in history as well
      saveSessionToHistory({
        id: `session-${Date.now()}`,
        timestamp: Date.now(),
        productName: productBrief.name || 'Produk',
        category: productBrief.category || 'Umum',
        scriptCount: updatedList.length,
        durationSeconds: config.durationSeconds,
        productBrief,
        config,
        scripts: updatedList,
      });

      showToast('Skrip berhasil disempurnakan!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Gagal memproses perbaikan', 'error');
    } finally {
      setIsRefining(false);
    }
  };

  // Execute full reset reliably without window.confirm
  const handleConfirmReset = () => {
    setProductBrief(INITIAL_BRIEF);
    setConfig(INITIAL_CONFIG);
    setScripts([]);
    setVoiceoverModes({});
    setCurrentStep(1);
    setIsBriefApproved(false);
    setGlobalError(null);
    setConflictsFound([]);
    setExtractWarning(undefined);
    setResetKey((prev) => prev + 1); // unmount & re-mount InputPanel to wipe its internal fields
    showToast('Aplikasi berhasil di-reset ke awal.', 'info');
  };

  const hasData = Boolean(productBrief.name || scripts.length > 0);

  // Progressive Stepper List:
  // Skenario: ketika user belum memasukan apapun, hanya menu 'Sumber Info Produk' yang tampil.
  const allStepsDefinitions = [
    {
      num: 1 as StepNumber,
      label: 'Sumber Info',
      fullLabel: 'Sumber Info Produk',
      visible: true,
      completed: isBriefUnlocked,
    },
    {
      num: 2 as StepNumber,
      label: 'Product Brief',
      fullLabel: 'Product Brief Terverifikasi',
      visible: isBriefUnlocked,
      completed: isBriefApproved,
    },
    {
      num: 3 as StepNumber,
      label: 'Pengaturan',
      fullLabel: 'Pengaturan Generator',
      visible: isConfigUnlocked,
      completed: isScriptsUnlocked,
    },
    {
      num: 4 as StepNumber,
      label: 'Skrip',
      fullLabel: 'Skrip Siap Rekam',
      visible: isScriptsUnlocked,
      completed: isScriptsUnlocked,
    },
  ];

  const visibleSteps = allStepsDefinitions.filter((s) => s.visible);

  return (
    <div className="min-h-screen bg-zinc-100/70 text-zinc-900 flex flex-col font-sans">
      {/* Top Processing Ambient Indicator */}
      {(isAnalyzing || isGenerating) && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-purple-500 animate-pulse shadow-xs" />
      )}

      {/* App Header with always-active Reset and new Riwayat button */}
      <Header
        onReset={() => setResetConfirmOpen(true)}
        onOpenSafeZone={() => setSafeZoneOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
        historyCount={history.length}
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

      {/* Main Container - Optimized for Mobile & Desktop Single Viewport */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-5">
        {/* Global Error Banner */}
        {globalError && (
          <div className="mb-3.5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start justify-between gap-3 text-rose-900 text-xs">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{globalError}</span>
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
        {/* PROGRESSIVE STAGE NAVIGATION (Hanya Menu Terbuka yg Tampil) */}
        {/* ========================================================= */}
        <div className="mb-3.5 bg-white rounded-2xl border border-zinc-200 shadow-xs p-1.5 sm:p-2">
          <div
            className={`grid gap-1 sm:gap-2 ${
              visibleSteps.length === 1
                ? 'grid-cols-1'
                : visibleSteps.length === 2
                ? 'grid-cols-2'
                : visibleSteps.length === 3
                ? 'grid-cols-3'
                : 'grid-cols-4'
            }`}
          >
            {visibleSteps.map((s) => {
              const isActive = currentStep === s.num;

              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setCurrentStep(s.num)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : s.completed
                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80'
                      : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                  }`}
                  title={`Buka ${s.fullLabel}`}
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
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAHAP AKTIF: Tampil Utuh 1 Halaman Sesuai Tahap           */}
        {/* ========================================================= */}
        <div className="space-y-4">
          {/* TAHAP 1: SUMBER INFO PRODUK (Satu-satunya yang tampil di awal) */}
          {currentStep === 1 && (
            <div className="animate-in fade-in duration-150">
              <InputPanel
                key={`input-panel-${resetKey}`}
                onAnalyze={handleAnalyzeInput}
                isAnalyzing={isAnalyzing}
                disabled={isGenerating || isRefining}
              />
            </div>
          )}

          {/* TAHAP 2: PRODUCT BRIEF TERVERIFIKASI (Muncul setelah analisis) */}
          {currentStep === 2 && isBriefUnlocked && (
            <div className="animate-in fade-in duration-150">
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

          {/* TAHAP 3: PENGATURAN GENERATOR (Muncul setelah user klik 'Setujui Brief') */}
          {currentStep === 3 && isConfigUnlocked && (
            <div className="animate-in fade-in duration-150">
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

          {/* TAHAP 4: SKRIP (Muncul setelah proses buat skrip selesai) */}
          {currentStep === 4 && isScriptsUnlocked && (
            <div className="animate-in fade-in duration-150 space-y-3.5">
              {/* Toolbar Aksi Skrip */}
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      4
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-zinc-900 flex items-center">
                      <span>{scripts.length} Konsep Skrip Siap Rekam</span>
                      <InfoTooltip
                        title="Hasil Skrip Siap Rekam"
                        content="Daftar konsep skrip video tersusun vertikal ke bawah dengan hook 3 detik, arahan visual B-roll, batas kata aman, dan ajakan bertindak (CTA) netral multi-platform."
                      />
                    </h3>
                  </div>

                  {/* Tombol 'Lihat Narasi Saja' yang mengubah seluruh konsep secara otomatis */}
                  <button
                    type="button"
                    onClick={handleToggleAllVoiceover}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isAllVoiceover
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs hover:bg-emerald-700'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}
                    title={
                      isAllVoiceover
                        ? 'Klik untuk kembalikan seluruh konsep ke tampilan visual lengkap'
                        : 'Klik untuk ubah seluruh konsep tampil versi narasi saja sekaligus'
                    }
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isAllVoiceover ? 'Tampilkan Visual Lengkap' : 'Lihat Narasi Saja'}</span>
                  </button>
                </div>

                {/* Batch Action Buttons: Salin Semua & Unduh TXT Terpisah */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer border border-zinc-200"
                    title="Ubah pengaturan durasi atau gaya"
                  >
                    <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Ubah Setelan</span>
                  </button>

                  {/* Salin Options: Narasi vs Skrip */}
                  <div className="inline-flex items-center rounded-xl bg-zinc-100 p-0.5 border border-zinc-200">
                    <button
                      type="button"
                      onClick={handleCopyAllVoiceovers}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 hover:text-emerald-700 hover:bg-white transition-all cursor-pointer"
                      title="Salin seluruh teks narasi suara saja dari semua konsep"
                    >
                      <Copy className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Salin Semua Narasi</span>
                    </button>
                    <span className="text-zinc-300">|</span>
                    <button
                      type="button"
                      onClick={handleCopyAllScripts}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 hover:text-emerald-700 hover:bg-white transition-all cursor-pointer"
                      title="Salin seluruh naskah lengkap (visual + dialog + overlay) dari semua konsep"
                    >
                      <Copy className="w-3.5 h-3.5 text-teal-600" />
                      <span>Salin Semua Skrip</span>
                    </button>
                  </div>

                  {/* Unduh Options: Narasi vs Skrip */}
                  <div className="inline-flex items-center rounded-xl bg-zinc-900 p-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={handleDownloadVoiceoversTxt}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
                      title="Unduh file .txt teks narasi suara saja"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Unduh Narasi</span>
                    </button>
                    <span className="text-zinc-700">|</span>
                    <button
                      type="button"
                      onClick={handleDownloadScriptsTxt}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:bg-zinc-800 transition-all cursor-pointer"
                      title="Unduh file .txt naskah skrip visual & dialog lengkap"
                    >
                      <Download className="w-3.5 h-3.5 text-teal-400" />
                      <span>Unduh Skrip</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tampilan Konsep Vertikal: Konsep 1, 2, 3, dst langsung berurutan ke bawah */}
              <div className="space-y-4">
                {scripts.map((script, idx) => (
                  <ScriptCard
                    key={script.id || idx}
                    script={script}
                    index={idx}
                    totalScripts={scripts.length}
                    isVoiceoverOnly={Boolean(voiceoverModes[idx])}
                    onToggleVoiceoverOnly={() => handleToggleSingleVoiceover(idx)}
                    onCopyText={handleCopyText}
                    onRegenerate={handleRegenerateScript}
                    onRefine={handleRefineScript}
                    isRefining={isRefining}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Safe Zone Modal */}
      <SafeZoneModal
        isOpen={safeZoneOpen}
        onClose={() => setSafeZoneOpen(false)}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onLoadSession={handleLoadSession}
        onDeleteSession={handleDeleteHistorySession}
        onClearHistory={handleClearAllHistory}
      />

      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
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
