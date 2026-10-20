/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Check, Trash2, ExternalLink, X, ShieldAlert, Sparkles, Clipboard, ClipboardCheck } from 'lucide-react';
import { apiUrl, safeParseJsonResponse, isMobileApp } from '../utils/api';
import { testGeminiApiKey } from '../../server/gemini';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentApiKey: string;
  onSave: (newKey: string) => Promise<boolean>;
  onDelete: () => Promise<void>;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  currentApiKey,
  onSave,
  onDelete,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
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
      setStatusMessage({ text: '', type: null });
    }
  }, [isOpen, currentApiKey]);

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
        setApiKeyInput(cleanKey);
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
    } catch (err: any) {
      setStatusMessage({
        text: 'Tidak dapat membaca clipboard otomatis. Anda dapat mengetuk kolom input dan menempel secara manual.',
        type: 'error',
      });
    }
  };

  const handleTestAndSave = async () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed) {
      setStatusMessage({ text: 'Harap masukkan API Key terlebih dahulu.', type: 'error' });
      return;
    }

    setIsTesting(true);
    setStatusMessage({ text: 'Menguji koneksi ke Google AI Studio...', type: null });

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
          body: JSON.stringify({ apiKey: trimmed }),
        });

        const data = await safeParseJsonResponse<{ success: boolean; error?: string }>(
          res,
          'menguji koneksi API Key'
        );
        if (!data.success) {
          throw new Error(data.error || 'API Key tidak valid atau tidak memiliki akses.');
        }
      }

      // Save key to persistent storage
      const saved = await onSave(trimmed);
      if (saved) {
        setStatusMessage({
          text: 'Koneksi berhasil! API Key telah disimpan dan siap digunakan.',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-zinc-200 overflow-hidden space-y-0">
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Key className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Pengaturan API Key</h3>
              <p className="text-[11px] text-zinc-500">Google AI Studio API Key</p>
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

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
              <span>Google AI Studio API Key</span>
              {currentApiKey ? (
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Tersimpan di Akun
                </span>
              ) : (
                <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Belum Diatur
                </span>
              )}
            </label>

            {/* Input with dedicated Paste button & visibility toggle */}
            <div className="space-y-2">
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Tempel kunci AIzaSy... di sini"
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
                  className="w-full pr-16 pl-3 py-2.5 text-xs font-mono rounded-xl border border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs"
                />
                
                <div className="absolute right-2 flex items-center gap-1">
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

              {/* 1-Tap Paste Button (Eliminates Android WebView black box popup) */}
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
                    <span>Tempel dari Clipboard (1-Klik Tanpa Tekan Lama)</span>
                  </>
                )}
              </button>
            </div>

            {/* Helper link */}
            <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Belum punya API Key?</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-semibold"
              >
                <span>Dapatkan secara gratis di Google AI Studio</span>
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
              <span>Sinkronisasi Otomatis Antar Perangkat</span>
            </div>
            <p className="leading-relaxed">
              API Key Anda disimpan secara privat di akun Anda. Saat login di browser atau perangkat lain, API Key akan otomatis tersinkronisasi.
            </p>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between gap-2 border-t border-zinc-100">
            {currentApiKey ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isTesting}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>{isDeleting ? 'Menghapus...' : 'Hapus API Key'}</span>
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
                    <span>Menguji...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Simpan & Uji Koneksi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
