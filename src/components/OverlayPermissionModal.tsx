/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ShieldAlert,
  Smartphone,
  ExternalLink,
  CheckCircle2,
  X,
  Play,
  MonitorPlay,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface OverlayPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAndroid: boolean;
  hasPermission: boolean;
  onRequestAndroidPermission: () => void;
  onLaunchPrompter: () => void;
}

export const OverlayPermissionModal: React.FC<OverlayPermissionModalProps> = ({
  isOpen,
  onClose,
  isAndroid,
  hasPermission,
  onRequestAndroidPermission,
  onLaunchPrompter,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-800 shadow-2xl text-slate-900 dark:text-white overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/80 dark:border-amber-800/60">
              {isAndroid ? <Smartphone className="w-5 h-5" /> : <MonitorPlay className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                {isAndroid ? 'Izin Tampil di Atas Aplikasi Lain' : 'Mode Teleprompter Melayang'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {isAndroid ? 'Diperlukan untuk merekam dengan kamera/TikTok' : 'Fitur siap digunakan'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 text-xs leading-relaxed text-slate-600 dark:text-zinc-300">
          {isAndroid ? (
            <>
              {/* Android Alert & Guide */}
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200 text-xs">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Izin Akses Khusus Android</span>
                </div>
                <p className="text-[11px] text-amber-900/80 dark:text-amber-200/90 leading-relaxed">
                  Agar jendela teleprompter Gagaswara dapat tetap melayang saat Anda membuka kamera HP, aplikasi TikTok, Shopee, atau CapCut, Android mewajibkan izin <strong>"Tampil di atas aplikasi lain"</strong>.
                </p>
              </div>

              {/* 3 Steps Guide */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Langkah Mudah Mengaktifkan:
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/60 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      1
                    </span>
                    <div className="text-[11px]">
                      Tekan tombol <strong>Buka Pengaturan Android</strong> di bawah ini.
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/60 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      2
                    </span>
                    <div className="text-[11px]">
                      Temukan aplikasi <strong>Gagaswara</strong> dan aktifkan sakelar izin.
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/60 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      3
                    </span>
                    <div className="text-[11px]">
                      Kembali ke aplikasi ini, dan teleprompter melayang akan langsung aktif!
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Web App Mode Guide */}
              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-200 text-xs">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Mode Teleprompter Melayang Aktif</span>
                </div>
                <p className="text-[11px] text-blue-900/80 dark:text-blue-200/90 leading-relaxed">
                  Pada versi peramban Web, jendela teleprompter dapat Anda geser (drag), perkecil/perbesar ukuran, atau gunakan tombol Picture-in-Picture (PiP).
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/60 space-y-1 text-[11px]">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-amber-500" />
                    <span>Untuk Aplikasi Native Android:</span>
                  </div>
                  <p className="text-slate-500 dark:text-zinc-400">
                    Pada file APK di smartphone Android, teleprompter dapat melayang secara permanen di atas aplikasi kamera atau TikTok saat merekam video.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#1C1C1E] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Tutup
          </button>

          {isAndroid ? (
            hasPermission ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLaunchPrompter();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mulai Teleprompter Melayang</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onRequestAndroidPermission}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka Pengaturan Android</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLaunchPrompter();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Mulai Mode Melayang</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
