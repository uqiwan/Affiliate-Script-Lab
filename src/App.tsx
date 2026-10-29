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
import { ApiKeyModal } from './components/ApiKeyModal';
import { QuotaExhaustedModal } from './components/QuotaExhaustedModal';
import { AuthWarningModal } from './components/AuthWarningModal';
import { UnauthorizedDomainModal } from './components/UnauthorizedDomainModal';
import { parseApiKeys, cleanSingleKey } from './utils/apiKeys';
import { InfoTooltip } from './components/InfoTooltip';
import { TeleprompterModal } from './components/TeleprompterModal';
import { FloatingTeleprompter } from './components/FloatingTeleprompter';
import { AndroidOverlayModal } from './components/AndroidOverlayModal';
import { OverlayPermissionModal } from './components/OverlayPermissionModal';
import { FloatingBottomNav } from './components/FloatingBottomNav';
import {
  auth,
  loginWithGoogle,
  checkRedirectLogin,
  logoutUser,
  loadUserApiKey,
  saveUserApiKey,
  deleteUserApiKey,
  loadUserHistoryFromFirestore,
  saveSessionToFirestore,
  deleteSessionFromFirestore,
} from './firebase';
import { apiUrl, safeParseJsonResponse } from './utils/api';
import {
  executeExtractProduct,
  executeGenerateScripts,
  executeGenerateScriptsStream,
  executeRefineScript,
} from './services/aiClientService';
import {
  launchAndroidFloatingPrompter,
  stopAndroidFloatingPrompter,
} from './utils/androidPrompterSettings';
import {
  buildPrompterConcept,
  extractProductKeywords,
} from './utils/prompterFormatter';
import {
  getStoredPrompterTheme,
  saveStoredPrompterTheme,
  TeleprompterTheme,
  TeleprompterThemeId,
  TELEPROMPTER_THEMES,
} from './utils/teleprompterThemes';
import { onAuthStateChanged, User } from 'firebase/auth';
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
  Eye,
  MonitorPlay,
  PictureInPicture2,
  Film,
  Loader2,
  PenLine,
  ChevronDown,
  ChevronUp,
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

async function parseResponseError(response: Response, defaultMessage: string): Promise<string> {
  try {
    const data = await response.json();
    return data.error || defaultMessage;
  } catch {
    try {
      const text = await response.text();
      if (text && text.length < 250 && !text.includes('<!doctype') && !text.includes('<html')) {
        return text;
      }
    } catch {}
    return defaultMessage;
  }
}

function getFriendlyErrorMessage(err: any, fallbackMessage: string): string {
  const msg = err?.message || '';
  if (err?.name === 'AbortError' || msg.includes('timeout') || msg.includes('504')) {
    return 'Permintaan ke layanan AI melebihi batas waktu (timeout). Silakan periksa koneksi internet Anda atau coba kembali.';
  }
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 'Koneksi ke internet terputus. Pastikan perangkat Anda terhubung ke internet.';
  }
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
    return 'Koneksi ke server terputus. Pastikan perangkat Anda terhubung ke internet dan coba kembali.';
  }
  return msg || fallbackMessage;
}



export default function App() {
  const [productBrief, setProductBrief] = useState<ProductBrief>(INITIAL_BRIEF);
  const [config, setConfig] = useState<GenerationConfig>(INITIAL_CONFIG);
  const [scripts, setScripts] = useState<ScriptItem[]>([]);
  const [resetKey, setResetKey] = useState<number>(0);

  // Workflow Stage State
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [isBriefApproved, setIsBriefApproved] = useState<boolean>(false);
  const [showBulkActions, setShowBulkActions] = useState<boolean>(false);

  // Loading & In-flight request deduplication states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const inFlightRequestRef = React.useRef<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [activeInputMode, setActiveInputMode] = useState<InputMode>('images');

  // Dedicated Teleprompter Theme State (Dark Pro, Soft Comfort, Light Clean)
  const [prompterTheme, setPrompterTheme] = useState<TeleprompterTheme>(() => getStoredPrompterTheme());

  const handleSelectPrompterTheme = (themeId: TeleprompterThemeId) => {
    const saved = saveStoredPrompterTheme(themeId);
    setPrompterTheme(saved);
    showToast(`Tema teleprompter diubah ke "${saved.name}"`, 'info');
  };

  // Real-time linear progress tracking states
  const [processingProgress, setProcessingProgress] = useState<number>(15);
  const [processingStepIndex, setProcessingStepIndex] = useState<number>(0);

  // Auth & API Key State
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState<boolean>(false);
  const [quotaModalOpen, setQuotaModalOpen] = useState<boolean>(false);
  const [isQuotaExhausted, setIsQuotaExhausted] = useState<boolean>(false);
  const [authWarningModalOpen, setAuthWarningModalOpen] = useState<boolean>(false);
  const [unauthorizedDomainModalOpen, setUnauthorizedDomainModalOpen] = useState<boolean>(false);
  const [settingsSheetOpen, setSettingsSheetOpen] = useState<boolean>(false);
  const [serverHasKey, setServerHasKey] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('affiliate_script_lab_api_key') || '';
    } catch {
      return '';
    }
  });

  const [selectedModel, setSelectedModel] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('affiliate_script_lab_model');
      if (stored && ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash'].includes(stored)) {
        return stored;
      }
      return 'gemini-3.8-flash';
    } catch {
      return 'gemini-3.8-flash';
    }
  });

  // Active user representation: either Firebase User, custom API key user, or guest user
  const activeUser = user || (apiKey ? ({
    uid: 'local-session',
    displayName: 'Pengguna Mandiri',
    email: 'Sesi API Key Lokal',
    photoURL: '',
  } as unknown as User) : ({
    uid: 'guest-session',
    displayName: 'Pengguna Tamu',
    email: 'Sesi Tamu (Lokal)',
    photoURL: '',
  } as unknown as User));

  // Check server API key status and redirect login on boot
  useEffect(() => {
    fetch(apiUrl('/api/health'))
      .then((res) => res.json())
      .then((data) => {
        if (data && data.hasApiKey) {
          setServerHasKey(true);
        }
      })
      .catch(() => {});

    // Periksa hasil login redirect Google jika baru kembali dari browser
    checkRedirectLogin()
      .then((redirectUser) => {
        if (redirectUser) {
          setUser(redirectUser);
          showToast(`Selamat datang kembali, ${redirectUser.displayName || 'Pengguna'}!`, 'success');
        }
      })
      .catch(() => {});
  }, []);

  // Sync auth and Firestore settings/history
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const cloudKey = await loadUserApiKey(currentUser.uid);
          if (cloudKey) {
            setApiKey(cloudKey);
            localStorage.setItem('affiliate_script_lab_api_key', cloudKey);
          }
          const cloudHistory = await loadUserHistoryFromFirestore(currentUser.uid);
          if (cloudHistory && cloudHistory.length > 0) {
            setHistory((prev) => {
              const merged = [...cloudHistory];
              prev.forEach((item) => {
                if (!merged.some((m) => m.id === item.id)) {
                  merged.push(item);
                }
              });
              merged.sort((a, b) => b.timestamp - a.timestamp);
              return merged.slice(0, 30);
            });
          }
        } catch (err) {
          console.warn('Error loading user data from Firestore:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const loggedUser = await loginWithGoogle();
      showToast(`Selamat datang, ${loggedUser.displayName || 'Pengguna'}!`, 'success');
    } catch (err: any) {
      const errMsg = err?.message || '';
      const errCode = err?.code || '';
      if (errMsg.includes('Membuka autentikasi Google')) {
        showToast('Membuka autentikasi akun Google...', 'info');
      } else if (errCode === 'auth/unauthorized-domain' || errMsg.includes('unauthorized-domain')) {
        setUnauthorizedDomainModalOpen(true);
      } else if (!errMsg.includes('popup-closed-by-user')) {
        showToast('Gagal masuk dengan Google: ' + (errMsg || 'Coba lagi'), 'error');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      if (user) {
        await logoutUser();
      }
      setUser(null);
      setApiKey('');
      localStorage.removeItem('affiliate_script_lab_api_key');
      showToast('Berhasil keluar dari akun.', 'info');
    } catch {
      showToast('Gagal keluar dari akun.', 'error');
    }
  };

  const handleSaveApiKey = async (newKey: string, model?: string): Promise<boolean> => {
    const keys = parseApiKeys(newKey);
    const cleaned = keys.map(cleanSingleKey).filter(Boolean).join('\n');
    setApiKey(cleaned);
    setIsQuotaExhausted(false);
    localStorage.setItem('affiliate_script_lab_api_key', cleaned);
    if (model) {
      setSelectedModel(model);
      localStorage.setItem('affiliate_script_lab_model', model);
    }
    if (user) {
      try {
        await saveUserApiKey(user.uid, cleaned);
      } catch (err) {
        console.error('Failed to sync api key to Firestore:', err);
      }
    }
    showToast('API Key & Model Google berhasil disimpan!', 'success');
    return true;
  };

  const handleDeleteApiKey = async (): Promise<void> => {
    setApiKey('');
    localStorage.removeItem('affiliate_script_lab_api_key');
    if (user) {
      try {
        await deleteUserApiKey(user.uid);
      } catch (err) {
        console.error('Failed to delete api key from Firestore:', err);
      }
    }
    showToast('API Key dihapus.', 'info');
  };

  // Modals & Feedback
  const [safeZoneOpen, setSafeZoneOpen] = useState<boolean>(false);
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState<boolean>(false);
  const [teleprompterState, setTeleprompterState] = useState<{
    isOpen: boolean;
    initialConceptIndex: number;
    openToken: number;
  }>({
    isOpen: false,
    initialConceptIndex: -1,
    openToken: 0,
  });

  const handleOpenAllTeleprompter = () => {
    setFloatingPrompterState((prev) => ({ ...prev, isOpen: false, conceptIndex: -1 }));
    stopAndroidFloatingPrompter();
    setTeleprompterState((prev) => ({
      isOpen: true,
      initialConceptIndex: -1,
      openToken: prev.openToken + 1,
    }));
  };

  const handleOpenSingleTeleprompter = (_script: ScriptItem, index: number) => {
    setFloatingPrompterState((prev) => ({ ...prev, isOpen: false, conceptIndex: -1 }));
    stopAndroidFloatingPrompter();
    setTeleprompterState((prev) => ({
      isOpen: true,
      initialConceptIndex: index,
      openToken: prev.openToken + 1,
    }));
  };

  // Listener saat user klik tombol Full di Floating Teleprompter native Android
  useEffect(() => {
    (window as any).__openFullPrompterFromNative = () => {
      setFloatingPrompterState((prev) => ({ ...prev, isOpen: false, conceptIndex: -1 }));
      stopAndroidFloatingPrompter();
      setTeleprompterState((prev) => ({
        isOpen: true,
        initialConceptIndex: -1,
        openToken: prev.openToken + 1,
      }));
    };
    return () => {
      delete (window as any).__openFullPrompterFromNative;
    };
  }, []);

  // State untuk Teleprompter Melayang (Floating Widget) & Dialog Izin/APK Android
  const [floatingPrompterState, setFloatingPrompterState] = useState<{
    isOpen: boolean;
    conceptIndex: number;
    openToken: number;
  }>({
    isOpen: false,
    conceptIndex: -1,
    openToken: 0,
  });

  const [androidOverlayModalOpen, setAndroidOverlayModalOpen] = useState<boolean>(false);
  const [overlayPermissionModalOpen, setOverlayPermissionModalOpen] = useState<boolean>(false);
  const [pendingFloatingData, setPendingFloatingData] = useState<{
    conceptIndex?: number;
    script?: ScriptItem;
  } | null>(null);

  const isAndroidBridge = typeof window !== 'undefined' && Boolean((window as any).AndroidFloatingBridge);

  const checkAndroidOverlayPermission = (): boolean => {
    if (typeof window !== 'undefined' && (window as any).AndroidFloatingBridge?.checkOverlayPermission) {
      try {
        return Boolean((window as any).AndroidFloatingBridge.checkOverlayPermission());
      } catch {
        return false;
      }
    }
    return false;
  };

  const [hasAndroidOverlayPerm, setHasAndroidOverlayPerm] = useState<boolean>(() => {
    return checkAndroidOverlayPermission();
  });

  const handleRequestOverlayPermission = () => {
    if (typeof window !== 'undefined' && (window as any).AndroidFloatingBridge?.requestOverlayPermission) {
      try {
        (window as any).AndroidFloatingBridge.requestOverlayPermission();
      } catch (e) {
        console.warn('Failed to call requestOverlayPermission:', e);
      }
    }
  };

  const doLaunchNativeFloatingPrompter = (conceptIndex?: number, scriptItem?: ScriptItem) => {
    const productKeywords = extractProductKeywords(productBrief?.name);
    if (conceptIndex !== undefined && conceptIndex >= 0) {
      const targetScript = scripts[conceptIndex] || scriptItem;
      if (!targetScript) return;
      const targetConcept = buildPrompterConcept(targetScript, conceptIndex + 1, productKeywords);
      launchAndroidFloatingPrompter(
        `=== ${targetConcept.title} ===\n\n` +
          targetConcept.lines.map((l) => l.tokens.map((t) => t.text).join(' ')).join('\n'),
        {
          themeId: prompterTheme.id,
          backgroundColorHex: prompterTheme.backgroundColor,
          highlightColorHex: prompterTheme.highlightColor,
        },
        [targetConcept]
      );
    } else {
      const allConcepts = scripts.map((s, idx) => buildPrompterConcept(s, idx + 1, productKeywords));
      if (allConcepts.length > 0) {
        launchAndroidFloatingPrompter(
          allConcepts
            .map((c) => `=== ${c.title} ===\n\n` + c.lines.map((l) => l.tokens.map((t) => t.text).join(' ')).join('\n'))
            .join('\n\n---\n\n'),
          {
            themeId: prompterTheme.id,
            backgroundColorHex: prompterTheme.backgroundColor,
            highlightColorHex: prompterTheme.highlightColor,
          },
          allConcepts
        );
      }
    }
  };

  const doLaunchWebFloatingPrompter = (conceptIndex?: number) => {
    setFloatingPrompterState((prev) => ({
      isOpen: true,
      conceptIndex: conceptIndex !== undefined ? conceptIndex : -1,
      openToken: prev.openToken + 1,
    }));
  };

  const handleTriggerFloatingPrompter = (conceptIndex?: number, scriptItem?: ScriptItem) => {
    // Tutup mode teleprompter modal jika sedang terbuka
    setTeleprompterState((prev) => ({ ...prev, isOpen: false, initialConceptIndex: -1 }));

    if (isAndroidBridge) {
      const hasPerm = checkAndroidOverlayPermission();
      setHasAndroidOverlayPerm(hasPerm);
      if (!hasPerm) {
        // Alur otomatisasi: jika izin belum ada, munculkan dialog panduan dan tombol redirect ke pengaturan Android
        setPendingFloatingData({ conceptIndex, script: scriptItem });
        setOverlayPermissionModalOpen(true);
        return;
      }
      // Izin sudah aktif: langsung jalankan floating prompter native
      doLaunchNativeFloatingPrompter(conceptIndex, scriptItem);
      return;
    }

    // Alur Web:
    const isGuided = localStorage.getItem('gagaswara_overlay_web_guided') === 'true';
    if (!isGuided) {
      setPendingFloatingData({ conceptIndex, script: scriptItem });
      setOverlayPermissionModalOpen(true);
      return;
    }

    doLaunchWebFloatingPrompter(conceptIndex);
  };

  // Deteksi otomatis saat pengguna kembali ke aplikasi setelah mengaktifkan izin di Pengaturan Android
  useEffect(() => {
    const handleCheckPermOnResume = () => {
      if (isAndroidBridge) {
        const perm = checkAndroidOverlayPermission();
        setHasAndroidOverlayPerm(perm);
        if (perm && overlayPermissionModalOpen) {
          setOverlayPermissionModalOpen(false);
          doLaunchNativeFloatingPrompter(pendingFloatingData?.conceptIndex, pendingFloatingData?.script);
          setPendingFloatingData(null);
          showToast('Izin melayang aktif! Teleprompter siap.', 'success');
        }
      }
    };

    window.addEventListener('focus', handleCheckPermOnResume);
    const handleVisChange = () => {
      if (document.visibilityState === 'visible') {
        handleCheckPermOnResume();
      }
    };
    document.addEventListener('visibilitychange', handleVisChange);

    return () => {
      window.removeEventListener('focus', handleCheckPermOnResume);
      document.removeEventListener('visibilitychange', handleVisChange);
    };
  }, [isAndroidBridge, overlayPermissionModalOpen, pendingFloatingData, scripts, productBrief, prompterTheme]);

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

  // Synchronization state for Floating Action Bar (Step 1 Analyze trigger)
  const [isInputValid, setIsInputValid] = useState<boolean>(false);
  const analyzeTriggerRef = React.useRef<(() => void) | null>(null);

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

  // Save history to localStorage & Firestore if logged in
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
    if (user) {
      saveSessionToFirestore(user.uid, newSession).catch((err) =>
        console.warn('Failed to save session to Firestore:', err)
      );
    }
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
    if (user) {
      deleteSessionFromFirestore(user.uid, id).catch((err) =>
        console.warn('Failed to delete session from Firestore:', err)
      );
    }
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

  const [visualModes, setVisualModes] = useState<Record<number, boolean>>({});

  const handleLoadSession = (session: HistorySession) => {
    setProductBrief(session.productBrief);
    setConfig(session.config);
    setScripts(session.scripts);
    setVisualModes({});
    setIsBriefApproved(true);
    setCurrentStep(4); // Advance directly to Step 4: Skrip
    setGlobalError(null);
    showToast(`Skrip "${session.productName}" berhasil dimuat dari riwayat!`, 'success');
  };

  const isAllVisuals =
    scripts.length > 0 && scripts.every((_, idx) => Boolean(visualModes[idx]));

  const handleToggleAllVisuals = () => {
    const nextMode = !isAllVisuals;
    const updated: Record<number, boolean> = {};
    scripts.forEach((_, idx) => {
      updated[idx] = nextMode;
    });
    setVisualModes(updated);
    showToast(
      nextMode
        ? 'Arahan visual ditampilkan untuk semua konsep'
        : 'Arahan visual disembunyikan untuk semua konsep',
      'info'
    );
  };

  const handleToggleSingleVisual = (index: number) => {
    setVisualModes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Progressive Unlocking Logic:
  // Step 2 unlocks ONLY after analysis succeeds
  const isBriefUnlocked = Boolean(productBrief.name || productBrief.description);
  // Step 3 unlocks ONLY after user clicks "Setujui Brief"
  const isConfigUnlocked = isBriefApproved;
  // Step 4 unlocks when scripts exist or while actively generating
  const isScriptsUnlocked = scripts.length > 0 || isGenerating;

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
    if (inFlightRequestRef.current) return;
    inFlightRequestRef.current = true;
    setActiveInputMode(data.inputMode);
    setIsAnalyzing(true);
    setGlobalError(null);
    setExtractWarning(undefined);
    setConflictsFound([]);

    try {
      const resData = await executeExtractProduct({
        ...data,
        apiKey,
      });

      const isSingle = data.inputMode !== 'mixed';
      const rawConflicts = resData.conflictsFound || [];
      const finalConflicts: string[] = isSingle
        ? []
        : rawConflicts.map((c: any) => {
            if (typeof c === 'string') return c;
            if (typeof c === 'object' && c !== null) {
              if (c.field && c.detail) return `${c.field}: ${c.detail}`;
              return c.detail || c.conflict || c.description || c.message || JSON.stringify(c);
            }
            return String(c);
          });

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
      const msg = err?.message || '';
      const isQuota =
        Boolean(err?.isQuotaExhausted) ||
        err?.status === 429 ||
        msg.includes('TOKEN_QUOTA_EXHAUSTED') ||
        msg.includes('429') ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('quota') ||
        msg.includes('Quota exceeded');

      if (isQuota) {
        setIsQuotaExhausted(true);
        setQuotaModalOpen(true);
        showToast('Token API Key Google habis. Silakan ganti atau masukkan kunci baru.', 'error');
      } else if (err?.message?.includes('MISSING_MOBILE_API_KEY')) {
        setApiKeyModalOpen(true);
        showToast('Harap masukkan API Key Google AI Studio Anda terlebih dahulu di APK.', 'info');
      } else {
        setGlobalError(getFriendlyErrorMessage(err, 'Gagal memproses informasi produk.'));
      }
    } finally {
      setIsAnalyzing(false);
      inFlightRequestRef.current = false;
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

  // 3. Generate scripts: Real-time token streaming with 1-2s TTFT & Progressive Render
  const handleGenerateScripts = async () => {
    if (inFlightRequestRef.current) return;

    // Check if an AI key is available either from server backend or custom API key
    const canGenerate = serverHasKey || Boolean(apiKey && apiKey.trim());
    if (!canGenerate) {
      setApiKeyModalOpen(true);
      showToast(
        'Harap atur API Key Google AI Studio Anda terlebih dahulu untuk membuat skrip.',
        'info'
      );
      return;
    }

    if (!productBrief.name && !productBrief.description) {
      setGlobalError('Harap lengkapi minimal Nama Produk sebelum membuat skrip.');
      return;
    }

    inFlightRequestRef.current = true;
    setIsGenerating(true);
    setGlobalError(null);
    setScripts([]); // Reset previous scripts so user sees new concepts streaming in
    setCurrentStep(4); // Advance immediately to Step 4 so user experiences live generation

    try {
      const resData = await executeGenerateScriptsStream({
        productBrief,
        config,
        apiKey,
        onChunk: () => {
          // Token chunks stream progressively without causing expensive root-level re-renders
        },
        onScriptReady: (newScript) => {
          setScripts((prev) => {
            const exists = prev.some((s) => s.id === newScript.id || s.title === newScript.title);
            if (exists) return prev;
            return [...prev, newScript];
          });
        },
      });

      const generatedScripts = resData.scripts && resData.scripts.length > 0 ? resData.scripts : [];
      setScripts(generatedScripts);
      setVisualModes({});

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
      const msg = err?.message || '';
      const isQuota =
        Boolean(err?.isQuotaExhausted) ||
        err?.status === 429 ||
        msg.includes('TOKEN_QUOTA_EXHAUSTED') ||
        msg.includes('429') ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('quota') ||
        msg.includes('Quota exceeded');

      if (isQuota) {
        setIsQuotaExhausted(true);
        setQuotaModalOpen(true);
        showToast('Token API Key Google habis. Silakan ganti atau masukkan kunci baru.', 'error');
      } else if (err?.message?.includes('MISSING_MOBILE_API_KEY')) {
        setApiKeyModalOpen(true);
        showToast('Harap masukkan API Key Google AI Studio Anda terlebih dahulu di APK.', 'info');
      } else {
        setGlobalError(getFriendlyErrorMessage(err, 'Terjadi kesalahan saat memproduksi skrip.'));
      }
    } finally {
      setIsGenerating(false);
      inFlightRequestRef.current = false;
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
      const resData = await executeRefineScript({
        script: targetScript,
        productBrief,
        config,
        refinementType,
        customInstruction,
        apiKey,
      });

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
      const msg = err?.message || '';
      const isQuota =
        Boolean(err?.isQuotaExhausted) ||
        err?.status === 429 ||
        msg.includes('TOKEN_QUOTA_EXHAUSTED') ||
        msg.includes('429') ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('quota') ||
        msg.includes('Quota exceeded');
      if (isQuota) {
        setIsQuotaExhausted(true);
        setQuotaModalOpen(true);
        showToast('Token API Key Google habis. Silakan ganti atau masukkan kunci baru.', 'error');
      } else {
        showToast(getFriendlyErrorMessage(err, 'Gagal memproses perbaikan'), 'error');
      }
    } finally {
      setIsRefining(false);
    }
  };

  // 6. Update single script after manual user editing
  const handleUpdateScript = (updatedScript: ScriptItem) => {
    setScripts((prev) => {
      const next = prev.map((s) => (s.id === updatedScript.id ? updatedScript : s));

      // Also persist to history so changes aren't lost
      saveSessionToHistory({
        id: `session-${Date.now()}`,
        timestamp: Date.now(),
        productName: productBrief.name || 'Produk',
        category: productBrief.category || 'Umum',
        scriptCount: next.length,
        durationSeconds: config.durationSeconds,
        productBrief,
        config,
        scripts: next,
      });

      return next;
    });

    showToast(`Perubahan pada skrip "${updatedScript.title}" berhasil disimpan!`, 'success');
  };

  // Execute full reset reliably without window.confirm
  const handleConfirmReset = () => {
    setProductBrief(INITIAL_BRIEF);
    setConfig(INITIAL_CONFIG);
    setScripts([]);
    setVisualModes({});
    setCurrentStep(1);
    setIsBriefApproved(false);
    setGlobalError(null);
    setConflictsFound([]);
    setExtractWarning(undefined);
    setIsInputValid(false);
    analyzeTriggerRef.current = null;
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
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] text-[#1C1C1E] dark:text-white flex flex-col font-sans transition-colors">
      {/* Top Processing Ambient Indicator */}
      {(isAnalyzing || isGenerating) && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-[#007AFF] via-[#5856D6] to-[#34C759] animate-pulse shadow-xs" />
      )}

      {/* App Header with user auth and profile popover */}
      <Header
        user={activeUser}
        onLogin={handleGoogleLogin}
        onLogout={handleGoogleLogout}
        onOpenApiKey={() => setApiKeyModalOpen(true)}
        onOpenSafeZone={() => setSafeZoneOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenApkModal={() => setAndroidOverlayModalOpen(true)}
        onReset={() => setResetConfirmOpen(true)}
        historyCount={history.length}
        hasApiKey={Boolean(apiKey || serverHasKey)}
        isLoggingIn={isLoggingIn}
        currentThemeId={prompterTheme.id}
        onSelectTheme={handleSelectPrompterTheme}
        settingsSheetOpen={settingsSheetOpen}
        onToggleSettingsSheet={setSettingsSheetOpen}
      />

      {/* Toast Notification (Solid Pill Style) */}
      {toastMessage && (
        <div className="fixed top-16 sm:top-20 inset-x-0 mx-auto max-w-sm z-50 flex items-center justify-center pointer-events-none px-4">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-xl border border-slate-200 dark:border-zinc-800 text-xs sm:text-sm font-semibold bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-white pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-200">
            {toastMessage.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
            {toastMessage.type === 'info' && <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Container - Optimized for Mobile & Desktop Single Viewport */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3.5 sm:p-5 pb-36 sm:pb-40">
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
        {/* TAHAP AKTIF: Tampil Utuh 1 Halaman Sesuai Tahap           */}
        {/* ========================================================= */}

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
                onValidityChange={(valid, trigger) => {
                  setIsInputValid(valid);
                  analyzeTriggerRef.current = trigger;
                }}
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
                user={activeUser}
                hasApiKey={Boolean(apiKey)}
                onRequireAuthOrKey={() => setAuthWarningModalOpen(true)}
              />
            </div>
          )}

          {/* TAHAP 4: SKRIP (Muncul saat streaming atau skrip sudah siap) */}
          {currentStep === 4 && isScriptsUnlocked && (
            <div className="animate-in fade-in duration-150 space-y-3.5">
              {/* INDIKATOR STREAMING AKTIF MELAYANG (SOLID MODERN PILL) */}
              {isGenerating && (
                <div className="sticky top-14 sm:top-16 z-30 py-1 transition-all duration-300">
                  <div className="mx-auto max-w-lg w-full bg-white dark:bg-[#1C1C1E] border border-blue-500/40 shadow-lg rounded-full px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2.5 text-xs">
                    {/* Animasi sederhana menulis skrip & keterangan pengerjaan */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                      </span>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                        <PenLine className="w-3.5 h-3.5 text-blue-600 animate-bounce shrink-0" style={{ animationDuration: '1.2s' }} />
                        <span className="text-xs">
                          {scripts.length === 0
                            ? 'Sedang menulis konsep skrip pertama...'
                            : `Sedang menulis skrip ke-${scripts.length + 1}...`}
                        </span>
                      </div>
                    </div>

                    {/* Keterangan jumlah sudah dibuat & sisa skrip */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 tabular-nums">
                        {scripts.length} selesai • Sisa {Math.max(0, config.scriptCount - scripts.length)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tampilan awal saat skrip pertama sedang dirancang (0 skrip siap) */}
              {isGenerating && scripts.length === 0 && (
                <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-dashed border-blue-300 dark:border-blue-700/50 p-8 text-center space-y-3 shadow-xs animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                    <PenLine className="w-6 h-6 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Memulai Penulisan Skrip Affiliate
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                      Gemini sedang merancang konsep video dengan hook scroll-stopper dan arahan visual B-roll. Setiap konsep yang selesai langsung tampil di bawah dan siap diedit manual!
                    </p>
                  </div>
                </div>
              )}

              {/* Live Streaming Progress Banner while concepts are generating */}
              {isGenerating && scripts.length > 0 && (
                <div className="bg-white dark:bg-[#1C1C1E] border border-blue-200 dark:border-blue-800 rounded-xl p-3.5 flex items-center justify-between text-xs text-blue-700 dark:text-blue-300 font-medium shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                    <span>
                      Sedang meracik konsep berikutnya... (<strong>{scripts.length}</strong> dari <strong>{config.scriptCount}</strong> konsep siap)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase bg-blue-600 text-white px-2.5 py-0.5 rounded-full shadow-xs shrink-0">
                    Live Stream
                  </span>
                </div>
              )}

              {/* Toolbar Aksi Skrip (Tampil saat minimal 1 konsep sudah selesai) */}
              {scripts.length > 0 && (
              <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs p-4 sm:p-5 space-y-3">
                {/* Header Info dengan Toggle Opsi Tersembunyi */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Film className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-[#1C1C1E] dark:text-white flex items-center gap-1.5 tracking-tight">
                        <span>{scripts.length} Konsep Skrip Siap Rekam</span>
                        <InfoTooltip
                          title="Hasil Skrip Siap Rekam"
                          content="Daftar konsep skrip video tersusun vertikal ke bawah dengan hook 3 detik, arahan visual B-roll, batas kata aman, dan ajakan bertindak (CTA) netral multi-platform."
                        />
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                        Fokus pada skrip atau buka menu untuk opsi ekspor
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[10px] text-xs font-semibold bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] dark:hover:bg-[#38383A] text-[#1C1C1E] dark:text-white transition-all cursor-pointer border border-black/5 dark:border-white/10 shrink-0 active:scale-95"
                    title={showBulkActions ? 'Sembunyikan menu opsi massal' : 'Buka menu opsi massal'}
                  >
                    <span>{showBulkActions ? 'Tutup Opsi' : 'Opsi Massal'}</span>
                    {showBulkActions ? (
                      <ChevronUp className="w-3.5 h-3.5 text-[#8E8E93]" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-[#8E8E93]" />
                    )}
                  </button>
                </div>

                {/* Menu-menu opsi yang terbuka ketika diklik saja */}
                {showBulkActions && (
                  <div className="space-y-3 pt-2 border-t border-[#F2F2F7] dark:border-[#2C2C2E] animate-in fade-in duration-200">
                    {/* 1. Tombol Arahan Visual Seluruh Konsep: Memanjang Penuh Rata Kiri-Kanan */}
                    <button
                      type="button"
                      onClick={handleToggleAllVisuals}
                      className={`w-full flex items-center justify-between h-10 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        isAllVisuals
                          ? 'bg-[#34C759] text-white border-[#34C759] shadow-xs hover:bg-[#30B753]'
                          : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] dark:hover:bg-[#38383A] text-[#1C1C1E] dark:text-white border-[#E5E5EA] dark:border-[#38383A]'
                      }`}
                      title={isAllVisuals ? 'Sembunyikan arahan visual semua konsep' : 'Tampilkan arahan visual semua konsep'}
                    >
                      <span className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-[#34C759] dark:text-[#30D158]" />
                        <span>Arahan visual untuk semua konsep</span>
                      </span>
                      <span className="text-[11px] font-medium opacity-80">
                        {isAllVisuals ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </button>

                    {/* 2. Tombol Salin: Memanjang Penuh Rata Kiri-Kanan (Semua Narasi & Semua Skrip) */}
                    <div className="grid grid-cols-2 gap-2.5 w-full">
                      <button
                        type="button"
                        onClick={handleCopyAllVoiceovers}
                        className="w-full flex items-center justify-center gap-2 h-10 px-3 rounded-xl text-xs font-semibold bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] dark:hover:bg-[#38383A] text-[#1C1C1E] dark:text-white border border-[#E5E5EA] dark:border-[#38383A] transition-all cursor-pointer active:scale-[0.99]"
                        title="Salin seluruh teks narasi suara saja"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#007AFF]" />
                        <span>Semua Narasi</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyAllScripts}
                        className="w-full flex items-center justify-center gap-2 h-10 px-3 rounded-xl text-xs font-semibold bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] dark:hover:bg-[#38383A] text-[#1C1C1E] dark:text-white border border-[#E5E5EA] dark:border-[#38383A] transition-all cursor-pointer active:scale-[0.99]"
                        title="Salin seluruh skrip lengkap (visual + dialog + overlay)"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#34C759]" />
                        <span>Semua Skrip</span>
                      </button>
                    </div>

                    {/* 3. Tombol Unduh: Memanjang Penuh Rata Kiri-Kanan (Semua Narasi & Semua Skrip) */}
                    <div className="grid grid-cols-2 gap-2.5 w-full">
                      <button
                        type="button"
                        onClick={handleDownloadVoiceoversTxt}
                        className="w-full flex items-center justify-center gap-2 h-10 px-3 rounded-xl text-xs font-semibold bg-[#1C1C1E] dark:bg-[#2C2C2E] text-white hover:bg-black dark:hover:bg-[#38383A] border border-black/10 dark:border-white/10 transition-all cursor-pointer active:scale-[0.99] shadow-xs"
                        title="Unduh file .txt teks narasi suara saja"
                      >
                        <Download className="w-3.5 h-3.5 text-[#34C759]" />
                        <span>Unduh Narasi</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadScriptsTxt}
                        className="w-full flex items-center justify-center gap-2 h-10 px-3 rounded-xl text-xs font-semibold bg-[#1C1C1E] dark:bg-[#2C2C2E] text-white hover:bg-black dark:hover:bg-[#38383A] border border-black/10 dark:border-white/10 transition-all cursor-pointer active:scale-[0.99] shadow-xs"
                        title="Unduh file .txt naskah skrip lengkap"
                      >
                        <Download className="w-3.5 h-3.5 text-[#007AFF]" />
                        <span>Unduh Skrip</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              )}

              {/* Tampilan Konsep Vertikal: Konsep 1, 2, 3, dst langsung berurutan ke bawah */}
              <div className="space-y-4">
                {scripts.map((script, idx) => (
                  <ScriptCard
                    key={script.id || idx}
                    script={script}
                    index={idx}
                    totalScripts={scripts.length}
                    showVisualDetails={Boolean(visualModes[idx])}
                    onToggleVisualDetails={() => handleToggleSingleVisual(idx)}
                    onCopyText={handleCopyText}
                    onRegenerate={handleRegenerateScript}
                    onRefine={handleRefineScript}
                    isRefining={isRefining}
                    onOpenPrompter={handleOpenSingleTeleprompter}
                    onOpenFloatingPrompter={(_script, index) => {
                      handleTriggerFloatingPrompter(index, _script);
                    }}
                    onUpdateScript={handleUpdateScript}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Bar & iOS Bottom Navigation Dock */}
      <FloatingBottomNav
        currentStep={currentStep}
        onStepChange={(step) => setCurrentStep(step)}
        isBriefUnlocked={isBriefUnlocked}
        isBriefApproved={isBriefApproved}
        isConfigUnlocked={isConfigUnlocked}
        isScriptsUnlocked={isScriptsUnlocked}
        scriptsCount={scripts.length}
        onAnalyze={() => {
          if (analyzeTriggerRef.current) {
            analyzeTriggerRef.current();
          }
        }}
        isAnalyzing={isAnalyzing}
        isInputValid={isInputValid}
        onApproveBrief={handleApproveBrief}
        isBriefValid={Boolean(productBrief.name)}
        onBackToSource={() => setCurrentStep(1)}
        onGenerate={handleGenerateScripts}
        isGenerating={isGenerating}
        scriptCount={config.scriptCount}
        durationSeconds={config.durationSeconds}
        isAuthLocked={!activeUser || !apiKey}
        onRequireAuthOrKey={() => setAuthWarningModalOpen(true)}
        onBackToBrief={() => setCurrentStep(2)}
        onOpenTeleprompter={handleOpenAllTeleprompter}
        onOpenFloatingPrompter={() => {
          handleTriggerFloatingPrompter();
        }}
        onCopyAllScripts={handleCopyAllScripts}
        onOpenSettings={() => setSettingsSheetOpen(true)}
      />

      {/* Safe Zone Modal */}
      <SafeZoneModal
        isOpen={safeZoneOpen}
        onClose={() => setSafeZoneOpen(false)}
      />

      {/* Teleprompter Modal Khusus Affiliator */}
      <TeleprompterModal
        isOpen={teleprompterState.isOpen}
        onClose={() => setTeleprompterState((prev) => ({ ...prev, isOpen: false }))}
        scripts={scripts}
        initialConceptIndex={teleprompterState.initialConceptIndex}
        openToken={teleprompterState.openToken}
        productBrief={productBrief}
        theme={prompterTheme}
        onSelectTheme={handleSelectPrompterTheme}
        onOpenFloatingPrompter={(idx) => {
          handleTriggerFloatingPrompter(idx);
        }}
      />

      {/* Dialog Panduan & Otomatisasi Izin Overlay Melayang (Android & Web) */}
      <OverlayPermissionModal
        isOpen={overlayPermissionModalOpen}
        onClose={() => {
          setOverlayPermissionModalOpen(false);
          setPendingFloatingData(null);
        }}
        isAndroid={isAndroidBridge}
        hasPermission={hasAndroidOverlayPerm}
        onRequestAndroidPermission={handleRequestOverlayPermission}
        onLaunchPrompter={() => {
          setOverlayPermissionModalOpen(false);
          if (isAndroidBridge) {
            doLaunchNativeFloatingPrompter(pendingFloatingData?.conceptIndex, pendingFloatingData?.script);
          } else {
            localStorage.setItem('gagaswara_overlay_web_guided', 'true');
            doLaunchWebFloatingPrompter(pendingFloatingData?.conceptIndex);
          }
          setPendingFloatingData(null);
        }}
      />

      {/* Floating Teleprompter (Draggable, Resizable, Always-on-top Widget) */}
      <FloatingTeleprompter
        isOpen={floatingPrompterState.isOpen}
        onClose={() => setFloatingPrompterState((prev) => ({ ...prev, isOpen: false, conceptIndex: -1 }))}
        onExpandToFull={() => {
          const idx = floatingPrompterState.conceptIndex;
          setFloatingPrompterState((prev) => ({ ...prev, isOpen: false, conceptIndex: -1 }));
          stopAndroidFloatingPrompter();
          setTeleprompterState((prev) => ({
            isOpen: true,
            initialConceptIndex: idx,
            openToken: prev.openToken + 1,
          }));
        }}
        scripts={scripts}
        conceptIndex={floatingPrompterState.conceptIndex}
        openToken={floatingPrompterState.openToken}
        productBrief={productBrief}
        theme={prompterTheme}
        onSelectTheme={handleSelectPrompterTheme}
        onOpenPermissionGuide={() => setAndroidOverlayModalOpen(true)}
      />

      {/* Android Overlay Permission & APK Wrapper Modal */}
      <AndroidOverlayModal
        isOpen={androidOverlayModalOpen}
        onClose={() => setAndroidOverlayModalOpen(false)}
        sampleScriptText={
          scripts.length > 0
            ? scripts.map((s) => `=== ${s.title} ===\n\n` + (s.voiceoverOnly || s.segments.map((sg) => sg.spokenDialogue).join(' '))).join('\n\n---\n\n')
            : undefined
        }
        onStartFloatingWidget={() => {
          setAndroidOverlayModalOpen(false);
          setFloatingPrompterState((prev) => ({
            isOpen: true,
            conceptIndex: teleprompterState.initialConceptIndex ?? -1,
            openToken: prev.openToken + 1,
          }));
        }}
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

      {/* Active Processing Modal / Progress Indicator (Active during input analysis) */}
      <ProcessingModal
        isAnalyzing={isAnalyzing}
        isGenerating={false}
        activeInputMode={activeInputMode}
        config={config}
        productName={productBrief.name}
      />

      {/* Quota Exhausted Notification Modal */}
      <QuotaExhaustedModal
        isOpen={quotaModalOpen}
        onClose={() => setQuotaModalOpen(false)}
        onOpenApiKeyModal={() => {
          setQuotaModalOpen(false);
          setApiKeyModalOpen(true);
        }}
        keyCount={parseApiKeys(apiKey).length || 1}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => {
          setApiKeyModalOpen(false);
          setIsQuotaExhausted(false);
        }}
        currentApiKey={apiKey}
        onSave={handleSaveApiKey}
        onDelete={handleDeleteApiKey}
        selectedModel={selectedModel}
        onSelectModel={(m) => {
          setSelectedModel(m);
          localStorage.setItem('affiliate_script_lab_model', m);
        }}
        isQuotaExhaustedAlert={isQuotaExhausted}
      />

      {/* Script Generator Protection Warning Modal */}
      <AuthWarningModal
        isOpen={authWarningModalOpen}
        onClose={() => setAuthWarningModalOpen(false)}
        user={activeUser}
        hasApiKey={Boolean(apiKey)}
        onLogin={handleGoogleLogin}
        onOpenApiKey={() => setApiKeyModalOpen(true)}
      />

      {/* Unauthorized Domain Guide & Fallback Modal */}
      <UnauthorizedDomainModal
        isOpen={unauthorizedDomainModalOpen}
        onClose={() => setUnauthorizedDomainModalOpen(false)}
        onUseLocalApiKey={() => {
          setUnauthorizedDomainModalOpen(false);
          setApiKeyModalOpen(true);
        }}
      />
    </div>
  );
}
