/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  ShieldCheck,
  Layers,
  Terminal,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  AlertCircle,
  FileCode2,
} from 'lucide-react';

interface AndroidOverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartFloatingWidget: () => void;
}

export const AndroidOverlayModal: React.FC<AndroidOverlayModalProps> = ({
  isOpen,
  onClose,
  onStartFloatingWidget,
}) => {
  const [activeTab, setActiveTab] = useState<'permission' | 'apkGuide'>('permission');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isAndroidBridgeAvailable, setIsAndroidBridgeAvailable] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).AndroidFloatingBridge) {
      setIsAndroidBridgeAvailable(true);
    }
  }, []);

  const buildCommand = `npm run build\nnpx cap sync android\ncd android && ./gradlew assembleDebug`;

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(buildCommand);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRequestAndroidPermission = () => {
    if (typeof window !== 'undefined' && (window as any).AndroidFloatingBridge) {
      (window as any).AndroidFloatingBridge.requestOverlayPermission();
    } else {
      // Buka widget floating langsung di web
      onStartFloatingWidget();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl text-white overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Mode Melayang & Wrapper Android (.APK)</h2>
              <p className="text-xs text-zinc-400">
                Fitur Teleprompter di atas aplikasi lain (Kamera, TikTok, CapCut)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/40 px-6">
          <button
            type="button"
            onClick={() => setActiveTab('permission')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'permission'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>1. Izin Sistem Melayang</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('apkGuide')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'apkGuide'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>2. Panduan Kompilasi APK (.APK)</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'permission' ? (
            <div className="space-y-4 text-sm">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Izin: Menampilkan di Atas Aplikasi Lain (SYSTEM_ALERT_WINDOW)</span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  Pada sistem operasi Android, aplikasi teleprompter membutuhkan izin khusus agar jendelanya bisa
                  tetap terlihat melayang saat Anda membuka kamera bawaan, aplikasi TikTok, Instagram Reels, atau CapCut.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Cara Kerja di Perangkat Anda:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-zinc-800/60 border border-zinc-700/60 space-y-1.5">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Mode Web / Browser
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Menggunakan widget interaktif yang dapat <b>digeser (draggable)</b>, <b>diubah ukurannya (resizable)</b>,
                      serta <b>pengatur transparansi (opacity 20%-100%)</b> dan Picture-in-Picture.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-800/60 border border-zinc-700/60 space-y-1.5">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4" />
                      Aplikasi Android (.APK)
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Menggunakan layanan native <code>FloatingPrompterService</code> berbasis <code>WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY</code>.
                    </p>
                  </div>
                </div>
              </div>

              {isAndroidBridgeAvailable ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                  ✓ Terdeteksi berjalan di dalam Android Wrapper. Anda dapat langsung mengaktifkan izin sistem.
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/60 text-zinc-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Saat ini Anda mengakses versi web. Anda bisa langsung menikmati <b>Widget Floating Web</b> sekarang,
                    atau mengkompilasi file <b>.APK Android</b> dengan instruksi di tab sebelah.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="p-4 rounded-xl bg-zinc-800/60 border border-zinc-700 space-y-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4" />
                  Berkas Wrapper Android Telah Lengkap:
                </span>
                <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside">
                  <li><code>capacitor.config.ts</code>: ID aplikasi <code>com.manuskrip.affiliatescript</code></li>
                  <li><code>AndroidManifest.xml</code>: Mendaftarkan izin <code>SYSTEM_ALERT_WINDOW</code></li>
                  <li><code>FloatingPrompterService.java</code>: Layanan melayang native Android di atas semua aplikasi</li>
                  <li><code>MainActivity.java</code>: Bridge izin otomatis dan peluncur widget native</li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300">
                    Perintah Build APK (1-Klik via Terminal):
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCommand}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Tersalin' : 'Salin Perintah'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-black border border-zinc-800 font-mono text-xs text-amber-400 overflow-x-auto leading-relaxed">
                  {buildCommand}
                </pre>
                <p className="text-[11px] text-zinc-400">
                  Hasil output APK Debug akan otomatis tersimpan di:<br />
                  <code className="text-zinc-300">android/app/build/outputs/apk/debug/app-debug.apk</code>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handleRequestAndroidPermission}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Aktifkan Mode Melayang Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
