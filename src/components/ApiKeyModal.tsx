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
  Clipboard,
  ClipboardCheck,
  Cpu,
  ChevronDown,
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

  const detectedKeys = useMemo(() => {
    return parseApiKeys(apiKeyInput);
  }, [apiKeyInput]);

  if (!isOpen) return null;

  const handlePasteFromClipboard = async () => {
    try {
      let clipText = '';
      if (typeof window !== 'undefined' && (window as any).AndroidFloatingBridge?.getClipboardText) {
        clipText = (window as any).AndroidFloatingBridge.getClipboardText();
      }
      if (!clipText && typeof navigator !== 'undefined' && navigator.clipboard?.readText) {
        clipText = await navigator.clipboard.readText();
      }

      if (clipText && clipText.trim()) {
        const cleanKey = clipText.trim();
        setApiKeyInput((prev) => {
          if (!prev.trim()) return cleanKey;
          if (prev.includes(cleanKey)) return prev;
          return `${prev.trim()}\n${cleanKey}`;
        });
        setJustPasted(true);
        setTimeout(() => setJustPasted(false), 2000);
        setStatusMessage({
          text: '✓ Kunci berhasil ditempel dari clipboard.',
          type: 'success',
        });
      } else {
        setStatusMessage({
          text: 'Clipboard kosong. Salin API Key terlebih dahulu.',
          type: 'error',
        });
      }
    } catch {
      setStatusMessage({
        text: 'Tidak dapat mengakses clipboard otomatis. Silakan tempel manual.',
        type: 'error',
      });
    }
  };

  const handleTestAndSave = async () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed || detectedKeys.length === 0) {
      setStatusMessage({ text: 'Harap masukkan API Key terlebih dahulu.', type: 'error' });
      return;
    }

    setIsTesting(true);
    setStatusMessage({
      text: 'Menguji koneksi API Key...',
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

      if (onSelectModel) {
        onSelectModel(modelChoice);
      }

      const saved = await onSave(trimmed, modelChoice);
      if (saved) {
        setStatusMessage({
          text: '✓ API Key & Model berhasil disimpan dan aktif!',
          type: 'success',
        });
        setTimeout(() => {
          onClose();
        }, 900);
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
      setStatusMessage({ text: 'API Key berhasil dihapus.', type: 'success' });
    } catch {
      setStatusMessage({ text: 'Gagal menghapus API Key.', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col">
        {/* Header Ringkas */}
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 leading-tight">Pengaturan API Key & Model</h3>
              <p className="text-[11px] text-zinc-400">Google AI Studio</p>
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

        {/* Body 1 Halaman Tanpa Teks Berlebihan */}
        <div className="p-5 space-y-4 text-xs">
          {/* Dropdown Pilihan Model AI Google */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                <span>Model AI Google</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {SUPPORTED_GOOGLE_MODELS.find((m) => m.id === modelChoice)?.tag || ''}
              </span>
            </label>
            <div className="relative">
              <select
                value={modelChoice}
                onChange={(e) => setModelChoice(e.target.value)}
                className="w-full appearance-none pl-3 pr-9 py-2.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border border-zinc-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 cursor-pointer shadow-2xs transition-colors"
              >
                {SUPPORTED_GOOGLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.tag})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Input API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-zinc-700 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                <span>API Key</span>
              </label>
              {detectedKeys.length > 0 && (
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {detectedKeys.length} Kunci Terdeteksi
                </span>
              )}
            </div>

            <div className="relative">
              <textarea
                rows={2}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Tempel kunci AIzaSy... atau AQ... di sini"
                disabled={isTesting || isDeleting}
                autoComplete="off"
                spellCheck={false}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#18181B',
                  caretColor: '#D97706',
                }}
                className="w-full pr-14 pl-3 py-2 text-xs font-mono rounded-xl border border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs resize-none"
              />

              <div className="absolute right-2 top-2 flex items-center gap-0.5">
                {apiKeyInput && (
                  <button
                    type="button"
                    onClick={() => setApiKeyInput('')}
                    className="p-1 text-zinc-400 hover:text-zinc-700 rounded-md cursor-pointer transition-colors"
                    title="Hapus teks"
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

            {/* Quick Actions (Paste & Link) */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                disabled={isTesting || isDeleting}
                className={`py-1.5 px-2.5 rounded-lg border text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ${
                  justPasted
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                }`}
              >
                {justPasted ? (
                  <>
                    <ClipboardCheck className="w-3 h-3 text-white" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3 h-3 text-zinc-500" />
                    <span>Tempel Clipboard</span>
                  </>
                )}
              </button>

              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-amber-600 transition-colors font-medium"
              >
                <span>Dapatkan API Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage.text && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 text-rose-900 border border-rose-200'
                  : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
              }`}
            >
              {statusMessage.type === 'error' && (
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              )}
              {statusMessage.type === 'success' && (
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              )}
              <span className="truncate">{statusMessage.text}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-zinc-100 flex items-center justify-between gap-2 bg-zinc-50/70 shrink-0">
          {currentApiKey ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isTesting}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleting ? 'Menghapus...' : 'Hapus'}</span>
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
              disabled={isTesting || !apiKeyInput.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {isTesting ? (
                <>
                  <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Menguji...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Simpan & Aktifkan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
