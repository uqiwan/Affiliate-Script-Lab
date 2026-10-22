/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Key,
  Eye,
  EyeOff,
  Check,
  Trash2,
  ExternalLink,
  X,
  ShieldAlert,
  Sparkles,
  Clipboard,
  ClipboardCheck,
  Cpu,
  Layers,
  Zap,
} from 'lucide-react';
import { apiUrl, safeParseJsonResponse, isMobileApp } from '../utils/api';
import {
  testGeminiApiKey,
  parseApiKeys,
  SUPPORTED_GOOGLE_MODELS,
  GEMINI_MODEL,
} from '../../server/gemini';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentApiKey: string;
  onSave: (newKey: string, model?: string) => Promise<boolean>;
  onDelete: () => Promise<void>;
  selectedModel?: string;
  onSelectModel?: (modelId: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  currentApiKey,
  onSave,
  onDelete,
  selectedModel = GEMINI_MODEL,
  onSelectModel,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [modelChoice, setModelChoice] = useState<string>(selectedModel);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [justPasted, setJustPasted] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: 'success' | 'error' | null;
  }>({ text: '', type: null });

  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(currentApiKey);
      setModelChoice(selectedModel || GEMINI_MODEL);
      setStatusMessage({ text: '', type: null });
    }
  }, [isOpen, currentApiKey, selectedModel]);

  // Hitung jumlah kunci yang terdeteksi
  const detectedKeys = useMemo(() => {
    return parseApiKeys(apiKeyInput);
  }, [apiKeyInput]);

  if (!isOpen) return null;

  const handlePasteFromClipboard = async () => {
    try {
      let clipText = '';
      // 1. Coba bridge native Android jika di dalam APK
      if (typeof window !== 'undefined' && (window as any).AndroidFloatingBridge?.getClipboardText) {
        clipText = (window as any).AndroidFloatingBridge.getClipboardText();
      }
      // 2. Fallback ke Web Clipboard API
      if (!clipText && typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
        clipText = await navigator.clipboard.readText();
      }

      if (clipText && clipText.trim()) {
        const cleanKey = clipText.trim();
        // Jika sudah ada teks di input, tambahkan di baris baru
        setApiKeyInput((prev) => {
          if (!prev.trim()) return cleanKey;
          if (prev.includes(cleanKey)) return prev;
          return `${prev.trim()}\n${cleanKey}`;
        });
        setJustPasted(true);
        setTimeout(() => setJustPasted(false), 2000);
        setStatusMessage({
          text: '✓ Berhasil menempel API Key dari papan klip (clipboard)!',
          type: 'success',
        });
      } else {
        setStatusMessage({
          text: 'Papan klip (clipboard) Anda saat ini kosong. Salin API Key dari Google AI Studio terlebih dahulu.',
          type: 'error',
        });
      }
    } catch {
      setStatusMessage({
        text: 'Tidak dapat membaca clipboard otomatis. Anda dapat mengetuk kolom input dan menempel secara manual.',
        type: 'error',
      });
    }
  };

  const handleTestAndSave = async () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed || detectedKeys.length === 0) {
      setStatusMessage({ text: 'Harap masukkan minimal satu API Key terlebih dahulu.', type: 'error' });
      return;
    }

    setIsTesting(true);
    setStatusMessage({
      text: `Menguji koneksi ${detectedKeys.length} API Key ke Google AI Studio...`,
      type: null,
    });

    try {
      if (isMobileApp()) {
        const testRes = await testGeminiApiKey(trimmed);
        if (!testRes.valid) {
          throw new Error(testRes.error || 'API Key tidak valid atau tidak memiliki akses.');
        }
      } else {
        const res = await fetch(apiUrl('/api/test-key'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: trimmed, model: modelChoice }),
        });

        const data = await safeParseJsonResponse<{ success: boolean; count?: number; error?: string }>(
          res,
          'menguji koneksi API Key'
        );
        if (!data.success) {
          throw new Error(data.error || 'API Key tidak valid atau tidak memiliki akses.');
        }
      }

      // Update model callback jika ada
      if (onSelectModel) {
        onSelectModel(modelChoice);
      }

      // Simpan kunci ke penyimpanan persisten
      const saved = await onSave(trimmed, modelChoice);
      if (saved) {
        const keyInfo =
          detectedKeys.length > 1
            ? `${detectedKeys.length} API Key aktif dengan sistem rotasi otomatis (Auto-Failover).`
            : `1 API Key tersimpan dan siap digunakan.`;
        setStatusMessage({
          text: `✓ Koneksi berhasil! ${keyInfo}`,
          type: 'success',
        });
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setStatusMessage({
        text: err.message || 'Gagal menguji koneksi API Key.',
        type: 'error',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
      setApiKeyInput('');
      setStatusMessage({ text: 'API Key berhasil dihapus dari akun.', type: 'success' });
    } catch {
      setStatusMessage({ text: 'Gagal menghapus API Key.', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden space-y-0 max-h-[92dvh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Key className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Pengaturan API Key & Model Google</h3>
              <p className="text-[11px] text-zinc-500">Mendukung Multi-Key Auto-Failover & Keluarga Google</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Scrollable */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Section 1: Pilihan Model AI Google */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                <span>Pilih Model AI (Keluarga Google)</span>
              </span>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                v3.8 Flash Rekomendasi
              </span>
            </label>

            <div className="grid grid-cols-1 gap-1.5">
              {SUPPORTED_GOOGLE_MODELS.map((m) => {
                const isSelected = modelChoice === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setModelChoice(m.id)}
                    className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-400/20 shadow-xs'
                        : 'bg-zinc-50/60 hover:bg-zinc-100/80 border-zinc-200'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-zinc-900">{m.name}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                            m.id === 'gemini-3.8-flash'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-zinc-200 text-zinc-700'
                          }`}
                        >
                          {m.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">{m.desc}</p>
                    </div>
                    <div className="shrink-0 mt-0.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-zinc-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Input Multi API Key */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-zinc-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>API Key Google AI Studio (Bisa Lebih Dari Satu)</span>
              </label>
              {detectedKeys.length > 0 ? (
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {detectedKeys.length} Kunci Terdeteksi
                </span>
              ) : (
                <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Belum Diisi
                </span>
              )}
            </div>

            <p className="text-[11px] text-zinc-500">
              Masukkan satu atau beberapa API Key (pisahkan dengan baris baru atau koma). Jika token kuota pada kunci pertama habis (429), aplikasi otomatis beralih ke kunci berikutnya tanpa macet!
            </p>

            <div className="space-y-2">
              <div className="relative">
                <textarea
                  rows={3}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Tempel satu atau beberapa kunci AIzaSy... / AQ... di sini (pisahkan baris baru untuk multi-kunci)"
                  disabled={isTesting || isDeleting}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#18181B',
                    caretColor: '#059669',
                    WebkitUserSelect: 'text',
                    userSelect: 'text',
                  }}
                  className="w-full pr-12 pl-3 py-2 text-xs font-mono rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs resize-none"
                />

                <div className="absolute right-2 top-2 flex flex-col items-center gap-1">
                  {apiKeyInput && (
                    <button
                      type="button"
                      onClick={() => setApiKeyInput('')}
                      className="p-1 text-zinc-400 hover:text-zinc-700 rounded-md cursor-pointer transition-colors"
                      title="Bersihkan teks"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-zinc-400 hover:text-zinc-700 rounded-md cursor-pointer transition-colors"
                    title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Indikator Failover Cerdas */}
              {detectedKeys.length > 1 && (
                <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-[11px] flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Auto-Failover Aktif:</strong> {detectedKeys.length} API Key siap bergantian otomatis saat kuota harian habis.
                  </span>
                </div>
              )}

              {/* 1-Tap Paste Button */}
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                disabled={isTesting || isDeleting}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99] ${
                  justPasted
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}
                title="Tempel langsung teks API Key dari clipboard tanpa perlu menekan lama"
              >
                {justPasted ? (
                  <>
                    <ClipboardCheck className="w-4 h-4 text-white" />
                    <span>Tersalin dari Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="w-4 h-4 text-emerald-700" />
                    <span>Tempel Kunci dari Clipboard (1-Klik Cepat)</span>
                  </>
                )}
              </button>
            </div>

            {/* Helper link */}
            <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Belum punya API Key Google?</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-semibold"
              >
                <span>Dapatkan gratis di Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Status feedback message */}
          {statusMessage.text && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 text-rose-900 border border-rose-200'
                  : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
              }`}
            >
              {statusMessage.type === 'error' && (
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              {statusMessage.type === 'success' && (
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Security & Sync Note */}
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-[11px] text-zinc-600 space-y-1">
            <div className="font-semibold text-zinc-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sinkronisasi Otomatis Antar Perangkat & Sesi</span>
            </div>
            <p className="leading-relaxed">
              API Key Anda disimpan secara privat di akun Anda. Di APK Android maupun web browser, kunci akan otomatis digunakan untuk pembuatan skrip tanpa batas token.
            </p>
          </div>
        </div>

        {/* Action buttons (Shrink 0) */}
        <div className="p-4 border-t border-zinc-100 flex items-center justify-between gap-2 bg-zinc-50/70 shrink-0">
          {currentApiKey ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isTesting}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>{isDeleting ? 'Menghapus...' : 'Hapus Kunci'}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleTestAndSave}
              disabled={isTesting || isDeleting || !apiKeyInput.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTesting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menguji Koneksi...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Simpan & Terapkan Model</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
