/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface ManualCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  title?: string;
}

export const ManualCopyModal: React.FC<ManualCopyModalProps> = ({
  isOpen,
  onClose,
  text,
  title = 'Salin Teks Skrip',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleSelectAndCopy = () => {
    if (textareaRef.current) {
      textareaRef.current.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // user can still press Ctrl+C / Cmd+C
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-zinc-200 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h3 className="text-sm sm:text-base font-bold text-zinc-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-zinc-500">
          Izin clipboard otomatis tidak diizinkan oleh peramban. Silakan tekan tombol di bawah atau tekan{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 border text-[10px] font-mono">Ctrl+C</kbd> /{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 border text-[10px] font-mono">Cmd+C</kbd> manual.
        </p>

        <textarea
          ref={textareaRef}
          readOnly
          value={text}
          rows={10}
          onClick={(e) => (e.target as HTMLTextAreaElement).select()}
          className="w-full p-3 text-xs font-mono rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
          <button
            type="button"
            onClick={handleSelectAndCopy}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin!' : 'Pilih & Salin Semua'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
