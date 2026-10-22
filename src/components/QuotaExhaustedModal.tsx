/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  AlertTriangle,
  Key,
  ExternalLink,
  X,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface QuotaExhaustedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApiKeyModal: () => void;
  keyCount?: number;
}

export const QuotaExhaustedModal: React.FC<QuotaExhaustedModalProps> = ({
  isOpen,
  onClose,
  onOpenApiKeyModal,
  keyCount = 1,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-md rounded-3xl shadow-2xl border border-rose-200 dark:border-rose-900/50 overflow-hidden text-left relative animate-in zoom-in-95 duration-200">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600" />

        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/60">
                Batas Kuota Tercapai (Error 429)
              </span>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white mt-1 leading-tight">
                Token API Key Google Habis
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <p>
            Token atau kuota pemakaian harian gratis dari{' '}
            <strong className="text-zinc-900 dark:text-white font-semibold">
              {keyCount > 1 ? `seluruh ${keyCount} API Key Google` : 'API Key Google'}
            </strong>{' '}
            Anda saat ini telah habis dari Google AI Studio.
          </p>

          <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-900/40 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300 text-xs">
              <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Solusi Otomatis Multi-Key Gagaswara</span>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-normal">
              Aplikasi mendukung rotasi multi-kunci otomatis. Anda dapat memasukkan beberapa API Key Google sekaligus. Jika satu kunci kehabisan token, sistem akan otomatis beralih menggunakan token kunci cadangan tanpa menghentikan pekerjaan Anda.
            </p>
          </div>

          <div className="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="font-semibold text-zinc-700 dark:text-zinc-300">Langkah untuk melanjutkan:</div>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>Masukkan API Key baru atau cadangan di menu Pengaturan Kunci.</li>
              <li>Atau buat API Key baru secara gratis di Google AI Studio (instan 1 menit).</li>
            </ul>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 sm:p-5 bg-zinc-50 dark:bg-zinc-900/70 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenApiKeyModal();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Key className="w-4 h-4" />
            <span>Ganti / Tambah Kunci Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Buat Kunci Gratis</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </a>
        </div>
      </div>
    </div>
  );
};
