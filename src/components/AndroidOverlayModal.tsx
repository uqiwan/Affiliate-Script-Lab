/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  ShieldCheck,
  Sliders,
  FileCode2,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Eye,
  Type,
  Timer,
  FlipHorizontal,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  AndroidPrompterConfig,
  loadAndroidPrompterConfig,
  saveAndroidPrompterConfig,
  launchAndroidFloatingPrompter,
} from '../utils/androidPrompterSettings';

interface AndroidOverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartFloatingWidget: () => void;
  sampleScriptText?: string;
}

export const AndroidOverlayModal: React.FC<AndroidOverlayModalProps> = ({
  isOpen,
  onClose,
  onStartFloatingWidget,
  sampleScriptText = 'Halo sahabat kreator! Ini adalah tampilan teleprompter melayang di atas aplikasi lain (Kamera, TikTok, atau CapCut). Naskah akan bergulir otomatis sesuai kecepatan yang Anda tentukan di setelan.',
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'permission' | 'apkGuide'>('settings');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isAndroidBridgeAvailable, setIsAndroidBridgeAvailable] = useState<boolean>(false);
  const [hasOverlayPermission, setHasOverlayPermission] = useState<boolean>(false);

  // Android prompter settings
  const [config, setConfig] = useState<AndroidPrompterConfig>(() => loadAndroidPrompterConfig());

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).AndroidFloatingBridge) {
      setIsAndroidBridgeAvailable(true);
      try {
        const hasPerm = (window as any).AndroidFloatingBridge.checkOverlayPermission?.();
        setHasOverlayPermission(Boolean(hasPerm));
      } catch {}
    }
  }, [isOpen]);

  const handleUpdateConfig = (newCfg: Partial<AndroidPrompterConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newCfg };
      saveAndroidPrompterConfig(updated);
      return updated;
    });
  };

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
      onStartFloatingWidget();
      onClose();
    }
  };

  const handleStartFloating = () => {
    if (isAndroidBridgeAvailable) {
      const launched = launchAndroidFloatingPrompter(sampleScriptText, config);
      if (launched) {
        onClose();
        return;
      }
    }
    // Fallback: start web floating widget
    onStartFloatingWidget();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl text-white overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-zinc-800 bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Setelan Teleprompter Melayang Android
              </h2>
              <p className="text-[11px] text-zinc-400">
                Konfigurasi tampilan prompter di atas aplikasi kamera & TikTok
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/50 px-4 sm:px-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>1. Setelan Prompter</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('permission')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'permission'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>2. Izin Layar Sistem</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('apkGuide')}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'apkGuide'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>3. Panduan Build APK</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs text-zinc-300">
          {/* TAB 1: SETELAN TELEPROMPTER MELAYANG */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Preview Card */}
              <div
                style={{
                  backgroundColor: `rgba(0, 0, 0, ${config.opacity / 100})`,
                }}
                className="relative rounded-2xl p-4 border border-zinc-700/80 shadow-lg space-y-2 overflow-hidden transition-all"
              >
                {/* Drag handle header preview */}
                <div className="w-full flex items-center justify-between pb-1 border-b border-white/10">
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Pratinjau Prompter Melayang Android</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {config.speed}x | {config.fontSize}sp | {config.opacity}%
                  </span>
                </div>

                {/* Focus Eye Guide Line Preview */}
                {config.showFocusGuide && (
                  <div className="relative py-1 flex items-center gap-2">
                    <div className="flex-1 h-0.5 bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                    <span className="text-[9px] font-bold text-amber-300 font-mono">
                      {config.focusGuidePercent}% Lensa Kamera
                    </span>
                  </div>
                )}

                {/* Text dialogue preview */}
                <p
                  style={{
                    color: config.textColorHex,
                    fontSize: `${config.fontSize}px`,
                    transform: config.isMirrored ? 'scaleX(-1)' : 'none',
                  }}
                  className="leading-snug font-medium font-sans drop-shadow-sm transition-all"
                >
                  "Ini lampu meja lipat LED portable yang praktis banget. Desainnya ringkas dan adem di mata..."
                </p>

                <div className="pt-2 flex items-center justify-between text-[10px] text-zinc-400 border-t border-white/10">
                  <span>Kontrol Lengkap (Speed +/-, Font, Play/Pause, ⚙️ Setelan)</span>
                  <span className="text-amber-400">Siap Rekam</span>
                </div>
              </div>

              {/* Setelan 1: Kecepatan Gulir (Speed) */}
              <div className="p-3.5 rounded-xl bg-zinc-800/60 border border-zinc-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <span>Kecepatan Gulir Otomatis:</span>
                  </span>
                  <span className="font-mono font-bold text-amber-400 text-sm">{config.speed}x</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleUpdateConfig({ speed: Math.max(1, config.speed - 1) })}
                    className="w-8 h-8 rounded-lg bg-zinc-700 hover:bg-zinc-600 font-bold text-white text-sm flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={config.speed}
                    onChange={(e) => handleUpdateConfig({ speed: Number(e.target.value) })}
                    className="flex-1 accent-amber-500 cursor-pointer h-1.5 bg-zinc-700 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdateConfig({ speed: Math.min(10, config.speed + 1) })}
                    className="w-8 h-8 rounded-lg bg-zinc-700 hover:bg-zinc-600 font-bold text-white text-sm flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <p className="text-[10px] text-zinc-400">
                  Speed 1-3 sangat tenang & pas untuk rekaman natural. Speed 4-7 untuk tempo cepat.
                </p>
              </div>

              {/* Setelan 2: Ukuran Font & Transparansi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Font Size */}
                <div className="p-3.5 rounded-xl bg-zinc-800/60 border border-zinc-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white flex items-center gap-1">
                      <Type className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ukuran Huruf:</span>
                    </span>
                    <span className="font-mono font-bold text-amber-400">{config.fontSize}sp</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="34"
                    value={config.fontSize}
                    onChange={(e) => handleUpdateConfig({ fontSize: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-700 rounded-lg"
                  />
                </div>

                {/* Opacity */}
                <div className="p-3.5 rounded-xl bg-zinc-800/60 border border-zinc-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>Transparansi Latar:</span>
                    </span>
                    <span className="font-mono font-bold text-amber-400">{config.opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={config.opacity}
                    onChange={(e) => handleUpdateConfig({ opacity: Number(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-700 rounded-lg"
                  />
                </div>
              </div>

              {/* Setelan 3: Warna Subtitle Teks */}
              <div className="p-3.5 rounded-xl bg-zinc-800/60 border border-zinc-700/60 space-y-2">
                <span className="font-semibold text-white block">Pilihan Warna Subtitle:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Kuning Subtitle', hex: '#FEF08A' },
                    { label: 'Putih Kontras', hex: '#FFFFFF' },
                    { label: 'Hijau Neon', hex: '#34D399' },
                    { label: 'Cyan Cerah', hex: '#38BDF8' },
                  ].map((color) => {
                    const isSelected = config.textColorHex === color.hex;
                    return (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => handleUpdateConfig({ textColorHex: color.hex })}
                        className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-750'
                        }`}
                      >
                        <span
                          style={{ backgroundColor: color.hex }}
                          className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                        />
                        <span className="text-[11px] truncate">{color.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Setelan 4: Fitur Pendukung (Garis Tatap Mata, Mirror, Countdown) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Garis Fokus */}
                <button
                  type="button"
                  onClick={() => handleUpdateConfig({ showFocusGuide: !config.showFocusGuide })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer space-y-1 ${
                    config.showFocusGuide
                      ? 'bg-amber-500/20 border-amber-500/80 text-white'
                      : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span>Garis Tatap Mata</span>
                    <span>{config.showFocusGuide ? 'On' : 'Off'}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400">Menjaga tatapan fokus ke kamera</p>
                </button>

                {/* Mirror Kaca */}
                <button
                  type="button"
                  onClick={() => handleUpdateConfig({ isMirrored: !config.isMirrored })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer space-y-1 ${
                    config.isMirrored
                      ? 'bg-amber-500/20 border-amber-500/80 text-white'
                      : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span>Mode Cermin (Mirror)</span>
                    <span>{config.isMirrored ? 'On' : 'Off'}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400">Untuk teleprompter kaca rig</p>
                </button>

                {/* Countdown */}
                <button
                  type="button"
                  onClick={() => {
                    const nextSec = config.countdownSec === 3 ? 5 : config.countdownSec === 5 ? 0 : 3;
                    handleUpdateConfig({ countdownSec: nextSec });
                  }}
                  className="p-3 rounded-xl border border-zinc-700/60 bg-zinc-800/60 hover:bg-zinc-750 text-left transition-all cursor-pointer space-y-1 text-white"
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span>Countdown</span>
                    <span className="text-amber-400 font-mono">
                      {config.countdownSec > 0 ? `${config.countdownSec}s` : 'Langsung'}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400">Hitung mundur sebelum naskah jalan</p>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IZIN SISTEM MELAYANG */}
          {activeTab === 'permission' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Izin: Menampilkan di Atas Aplikasi Lain (SYSTEM_ALERT_WINDOW)</span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  Pada Android, aplikasi teleprompter membutuhkan izin khusus agar jendelanya bisa
                  tetap terlihat melayang saat Anda membuka kamera bawaan ponsel, aplikasi TikTok, Shopee Video, atau CapCut.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-800/60 border border-zinc-700/60 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Status Izin di Perangkat Anda:
                </h4>
                {isAndroidBridgeAvailable ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`w-2.5 h-2.5 rounded-full ${hasOverlayPermission ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      <span>
                        Status: <b>{hasOverlayPermission ? 'Izin Sudah Aktif ✓' : 'Belum Diberikan'}</b>
                      </span>
                    </div>
                    {!hasOverlayPermission && (
                      <button
                        type="button"
                        onClick={handleRequestAndroidPermission}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all cursor-pointer"
                      >
                        Buka Pengaturan Izin Android Sekarang
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-zinc-400 leading-relaxed">
                    Aplikasi saat ini diakses via peramban web. Di mode web, Anda dapat langsung menggunakan <b>Widget Melayang Web</b> atau Picture-in-Picture.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PANDUAN BUILD APK */}
          {activeTab === 'apkGuide' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-800/60 border border-zinc-700 space-y-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <FileCode2 className="w-4 h-4" />
                  Berkas Wrapper Android Lengkap:
                </span>
                <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside">
                  <li><code>FloatingPrompterService.java</code>: Layanan melayang native Android di atas semua aplikasi</li>
                  <li><code>MainActivity.java</code>: Bridge izin sistem, clipboard otomatis, dan peluncur widget</li>
                  <li><code>AndroidManifest.xml</code>: Konfigurasi izin <code>SYSTEM_ALERT_WINDOW</code></li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300">
                    Perintah Kompilasi APK (Terminal):
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCommand}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Tersalin' : 'Salin Perintah'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-black border border-zinc-800 font-mono text-xs text-amber-400 overflow-x-auto leading-relaxed">
                  {buildCommand}
                </pre>
                <p className="text-[11px] text-zinc-400">
                  File APK Debug akan tersimpan di:<br />
                  <code className="text-zinc-300">android/app/build/outputs/apk/debug/app-debug.apk</code>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handleStartFloating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Mulai Teleprompter Melayang</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
