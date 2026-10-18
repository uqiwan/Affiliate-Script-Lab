/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Smartphone, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { SAFE_ZONE_GUIDE } from '../utils/constants';

interface SafeZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafeZoneModal: React.FC<SafeZoneModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200 p-5 sm:p-6">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base sm:text-lg font-bold text-zinc-900">
              Panduan Visual Safe Zone TikTok (9:16)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs sm:text-sm text-zinc-600">
          <p>
            Saat merekam dan mengedit video TikTok Affiliate (1080×1920 px), teks overlay penting
            harus ditempatkan di dalam <strong>Safe Zone</strong> agar tidak tertutup oleh tombol antarmuka TikTok:
          </p>

          {/* Visual diagram representation */}
          <div className="p-4 bg-zinc-900 rounded-xl text-white flex flex-col items-center">
            <div className="w-48 sm:w-56 aspect-[9/16] bg-zinc-800 rounded-lg relative border border-zinc-700 overflow-hidden flex flex-col justify-between p-2 shadow-inner">
              {/* Top danger zone */}
              <div className="h-6 bg-rose-500/30 border-b border-rose-500/50 rounded flex items-center justify-center text-[10px] text-rose-200">
                Atas 130px (Tab / Live)
              </div>

              {/* Middle safe area */}
              <div className="my-auto h-28 border-2 border-dashed border-emerald-400 bg-emerald-500/10 rounded flex flex-col items-center justify-center p-1 text-center">
                <span className="text-[11px] font-bold text-emerald-300">SAFE ZONE</span>
                <span className="text-[9px] text-emerald-200">Area Tengah Ideal untuk Teks Overlay</span>
              </div>

              {/* Right side icons */}
              <div className="absolute right-1 top-16 bottom-20 w-8 bg-rose-500/25 border-l border-rose-500/40 rounded flex flex-col items-center justify-center gap-1 text-[8px] text-rose-200">
                <span>Like</span>
                <span>Komen</span>
                <span>Share</span>
              </div>

              {/* Bottom danger zone */}
              <div className="h-16 bg-rose-500/30 border-t border-rose-500/50 rounded flex flex-col items-center justify-center text-[9px] text-rose-200 p-1 text-center">
                <span>Bawah 484px</span>
                <span className="text-[8px] text-amber-200 font-medium">Caption & Keranjang Kuning</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80">
              <span className="font-semibold text-zinc-900 block mb-1">Ukuran Margin:</span>
              <ul className="space-y-1 text-zinc-600">
                <li>• <strong>Atas:</strong> 130 px</li>
                <li>• <strong>Kanan:</strong> 140 px (avatar & interaksi)</li>
                <li>• <strong>Bawah:</strong> 484 px (keranjang & teks)</li>
                <li>• <strong>Kiri:</strong> 44 px</li>
              </ul>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80">
              <span className="font-semibold text-emerald-900 block mb-1">Prinsip Teks Overlay:</span>
              <ul className="space-y-1 text-emerald-800">
                <li className="flex items-start gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  Maksimal 3–6 kata per overlay
                </li>
                <li className="flex items-start gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  Gunakan background kontras tinggi
                </li>
                <li className="flex items-start gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  Membantu penonton mode hening (sound-off)
                </li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Catatan:</strong> Posisi elemen UI TikTok dapat bervariasi tergantung ukuran layar ponsel dan versi aplikasi. Selalu uji preview video Anda sebelum dipublikasikan.
            </p>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-zinc-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
