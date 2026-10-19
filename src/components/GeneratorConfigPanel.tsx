/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Check,
  Wand2,
  ArrowLeft,
  ArrowRight,
  Lock,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  GenerationConfig,
  ScriptDuration,
  DeliveryStyle,
  AudiencePersona,
  ProductBrief,
} from '../types';
import { CONTENT_ANGLES } from '../utils/constants';
import { InfoTooltip } from './InfoTooltip';

interface GeneratorConfigPanelProps {
  config: GenerationConfig;
  onChange: (updatedConfig: GenerationConfig) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  disabled?: boolean;
  productBrief: ProductBrief;
  onBackToBrief?: () => void;
  user: User | null;
  hasApiKey: boolean;
  onRequireAuthOrKey: () => void;
}

// Gaya Penyampaian dengan simbol berwarna-warni
interface DeliveryStyleOption {
  value: DeliveryStyle;
  label: string;
  symbol: string;
}

const DELIVERY_STYLES_WITH_SYMBOLS: DeliveryStyleOption[] = [
  { value: 'Natural conversational', symbol: '💬', label: 'Natural conversational (Santai)' },
  { value: 'Soft selling', symbol: '🍃', label: 'Soft selling (Halus & Edukasi)' },
  { value: 'Persuasif langsung tetapi etis', symbol: '🎯', label: 'Persuasif langsung tetapi etis (Direct CTA)' },
  { value: 'Storytelling/pengalaman', symbol: '📖', label: 'Storytelling / Pengalaman Pribadi' },
  { value: 'UGC review/demo', symbol: '📱', label: 'UGC Review / Demo Pemakaian' },
  { value: 'Edukatif/tutorial', symbol: '🎓', label: 'Edukatif / Mini Tutorial' },
  { value: 'Humor ringan/relatable', symbol: '😄', label: 'Humor ringan / Relatable' },
  { value: 'POV/rutinitas', symbol: '👤', label: 'POV / Rutinitas Harian' },
  { value: 'Unboxing/first impression', symbol: '📦', label: 'Unboxing & First Impression' },
  { value: 'Komparasi/value', symbol: '⚖️', label: 'Komparasi / Value for Money' },
];

const STANDARD_PERSONAS: AudiencePersona[] = [
  'Auto',
  'Mahasiswa/anak kost',
  'Pekerja kantor/Gen-Z',
  'Orang tua/rumah tangga',
  'Profesional',
  'Pengguna pemula',
];

export const GeneratorConfigPanel: React.FC<GeneratorConfigPanelProps> = ({
  config,
  onChange,
  onGenerate,
  isGenerating,
  disabled = false,
  productBrief,
  onBackToBrief,
  user,
  hasApiKey,
  onRequireAuthOrKey,
}) => {
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [showAngleLibrary, setShowAngleLibrary] = useState<boolean>(false);

  const isAuthLocked = !user || !hasApiKey;

  // Custom persona handling
  const isCustomSelected =
    config.audiencePersona === 'Custom' ||
    (!STANDARD_PERSONAS.includes(config.audiencePersona as AudiencePersona) && Boolean(config.audiencePersona));

  const [customPersonaValue, setCustomPersonaValue] = useState<string>(
    isCustomSelected && config.audiencePersona !== 'Custom' ? config.audiencePersona : ''
  );

  useEffect(() => {
    if (isCustomSelected && config.audiencePersona !== 'Custom') {
      setCustomPersonaValue(config.audiencePersona);
    }
  }, [config.audiencePersona, isCustomSelected]);

  const handleDurationSelect = (dur: ScriptDuration) => {
    onChange({ ...config, durationSeconds: dur });
  };

  const handleScriptCountChange = (count: number) => {
    onChange({ ...config, scriptCount: Math.max(1, Math.min(30, count)) });
  };

  const handlePersonaSelect = (selected: string) => {
    if (selected === 'Custom') {
      onChange({ ...config, audiencePersona: customPersonaValue.trim() || 'Custom' });
    } else {
      onChange({ ...config, audiencePersona: selected });
    }
  };

  const handleCustomPersonaChange = (val: string) => {
    setCustomPersonaValue(val);
    onChange({ ...config, audiencePersona: val.trim() || 'Custom' });
  };

  const toggleAngle = (angleLabel: string) => {
    let next: string[];
    if (config.selectedAngles.includes(angleLabel)) {
      next = config.selectedAngles.filter((a) => a !== angleLabel);
    } else {
      next = [...config.selectedAngles, angleLabel];
    }
    onChange({
      ...config,
      angleMode: next.length > 0 ? 'manual' : 'auto',
      selectedAngles: next,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-3.5 sm:p-5 space-y-3.5">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
            3
          </div>
          <h2 className="text-sm sm:text-base font-bold text-zinc-900 flex items-center">
            <span>Pengaturan Generator</span>
            <InfoTooltip
              title="Pengaturan Generator"
              content="Tentukan jumlah konsep skrip (1, 5, 10, 20, 30), durasi video, dan gaya penyampaian. Setiap skrip yang dihasilkan memiliki hook 3 detik, alur visual B-roll, dan narasi siap rekam."
            />
          </h2>
        </div>
        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
          Tahap 3
        </span>
      </div>

      {/* Row 1: Jumlah Skrip (1, 5, 10, 20, 30) & Durasi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Jumlah Skrip: 1, 5, 10, 20, 30 */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
            <span className="flex items-center">
              <span>Jumlah Skrip</span>
              <InfoTooltip
                title="Jumlah Skrip"
                content="Pilih jumlah konsep skrip yang ingin dibuat sekaligus (1, 5, 10, 20, atau 30 variasi)."
              />
            </span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
              {config.scriptCount} konsep
            </span>
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 5, 10, 20, 30].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleScriptCountChange(num)}
                className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  config.scriptCount === num
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Durasi Skrip */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
            <span className="flex items-center">
              <span>Durasi Video</span>
              <InfoTooltip
                title="Durasi Video"
                content="30 detik adalah durasi optimal affiliate. 15 detik untuk hook kilat, 60-90 detik untuk review mendalam."
              />
            </span>
            <span className="text-zinc-500 text-[11px] font-normal">
              {config.durationSeconds === 15 && '40–55 kata'}
              {config.durationSeconds === 30 && '75–100 kata'}
              {config.durationSeconds === 60 && '140–180 kata'}
              {config.durationSeconds === 90 && '200–250 kata'}
            </span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {([15, 30, 60, 90] as ScriptDuration[]).map((dur) => (
              <button
                key={dur}
                type="button"
                onClick={() => handleDurationSelect(dur)}
                className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  config.durationSeconds === dur
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                {dur}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Gaya Penyampaian (Simbol Berwarna-warni) & Target Persona */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Gaya Penyampaian with Colorful Symbols */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700 flex items-center">
            <span>Gaya Penyampaian</span>
            <InfoTooltip
              title="Gaya Penyampaian"
              content="Pilih nada dan gaya bicara narasi yang diawali simbol berwarna-warni agar mudah dibedakan."
            />
          </label>
          <select
            value={config.style}
            onChange={(e) => onChange({ ...config, style: e.target.value as DeliveryStyle })}
            className="w-full px-2.5 py-2 text-xs rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
          >
            {DELIVERY_STYLES_WITH_SYMBOLS.map((st) => (
              <option key={st.value} value={st.value}>
                {st.symbol} {st.label}
              </option>
            ))}
          </select>
        </div>

        {/* Target Persona with Custom Textbox */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
            <span className="flex items-center">
              <span>Target Persona</span>
              <InfoTooltip
                title="Target Persona"
                content="Pilih profil audiens atau pilih 'Custom' untuk mengisi target audiens spesifik Anda sendiri."
              />
            </span>
            {isCustomSelected && (
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                Kustom Aktif
              </span>
            )}
          </label>
          <select
            value={isCustomSelected ? 'Custom' : config.audiencePersona}
            onChange={(e) => handlePersonaSelect(e.target.value)}
            className="w-full px-2.5 py-2 text-xs rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            {STANDARD_PERSONAS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
            <option value="Custom">✏️ Custom (Tulis Manual Sendiri)</option>
          </select>

          {/* Kotak Teks Manual ketika user memilih Custom */}
          {isCustomSelected && (
            <div className="pt-1.5 animate-in fade-in duration-150">
              <input
                type="text"
                value={customPersonaValue}
                onChange={(e) => handleCustomPersonaChange(e.target.value)}
                placeholder="Tuliskan target audiens Anda (misal: Ibu baru melahirkan, Atlet lari, Gamer PC)..."
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-emerald-300 bg-emerald-50/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 placeholder:text-zinc-400 font-medium"
                autoFocus
              />
            </div>
          )}
        </div>
      </div>

      {/* Collapsible Advanced Settings (Angle & CTA) */}
      <div className="border border-zinc-200 rounded-xl overflow-hidden">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setShowAdvanced(!showAdvanced)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setShowAdvanced(!showAdvanced);
            }
          }}
          className="w-full flex items-center justify-between p-2.5 bg-zinc-50 hover:bg-zinc-100 transition-colors text-xs font-semibold text-zinc-800 cursor-pointer select-none"
        >
          <div className="flex items-center">
            <span>Opsi Tambahan (Angle & CTA)</span>
            <InfoTooltip
              title="Opsi Tambahan"
              content="Pilih angle spesifik dengan penjelasan bahasa Indonesia dalam kurung, atau tuliskan instruksi khusus."
            />
            {config.selectedAngles.length > 0 && (
              <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full font-semibold">
                {config.selectedAngles.length} Angle Dipilih
              </span>
            )}
          </div>
          <div className="text-zinc-500">
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {showAdvanced && (
          <div className="p-3 border-t border-zinc-200 bg-white space-y-3">
            {/* Angle Selection dengan penjelasan Bahasa Indonesia dalam kurung */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-700">Pilihan Angle Konten:</span>
                <button
                  type="button"
                  onClick={() => setShowAngleLibrary(!showAngleLibrary)}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer text-[11px]"
                >
                  {showAngleLibrary ? 'Tutup Pustaka' : 'Pilih dari 20 Angle'}
                </button>
              </div>

              {showAngleLibrary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-56 overflow-y-auto p-2 bg-zinc-50 rounded-lg border border-zinc-200">
                  {CONTENT_ANGLES.map((ang) => {
                    const isSelected =
                      config.selectedAngles.includes(ang.label) ||
                      config.selectedAngles.includes(ang.name);

                    return (
                      <button
                        key={ang.id}
                        type="button"
                        onClick={() => toggleAngle(ang.label)}
                        className={`text-left p-1.5 px-2 rounded-lg text-[11px] transition-all flex items-center justify-between cursor-pointer border ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-semibold border-emerald-600 shadow-xs'
                            : 'bg-white text-zinc-700 hover:bg-zinc-100 border-zinc-200'
                        }`}
                        title={ang.description}
                      >
                        <span className="truncate pr-1">{ang.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Extra instruction input */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-700 block">
                Instruksi Khusus (Opsional)
              </label>
              <input
                type="text"
                value={config.extraInstructions || ''}
                onChange={(e) => onChange({ ...config, extraInstructions: e.target.value })}
                placeholder="Contoh: Fokus pada variasi warna pastel..."
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Compliance Notice */}
      <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between gap-2 text-xs text-emerald-900">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold text-[11px]">
            Kepatuhan Multi-Platform & Etika Aktif
          </span>
        </div>
        <InfoTooltip
          title="Kepatuhan Multi-Platform & Etika"
          content="Skrip otomatis netral tanpa sebutan satu platform tertentu, siap di-mirror ke Shopee Video, TikTok, dan Tokopedia dengan CTA netral (keranjang kiri bawah)."
        />
      </div>

      {/* Script Generator Protection Warning Box */}
      {isAuthLocked && (
        <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1.5">
            <div className="font-bold text-amber-950 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Proteksi Fitur Generator Skrip</span>
            </div>
            <p className="text-amber-800 leading-relaxed font-medium">
              Harap login dan atur API Key Google AI Studio Anda terlebih dahulu di menu profil (kanan atas).
            </p>
            <div className="pt-0.5 flex flex-wrap items-center gap-2">
              {!user ? (
                <button
                  type="button"
                  onClick={onRequireAuthOrKey}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-2xs transition-all cursor-pointer"
                >
                  <Lock className="w-3 h-3" />
                  <span>Masuk dengan Google</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onRequireAuthOrKey}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-2xs transition-all cursor-pointer"
                >
                  <Lock className="w-3 h-3" />
                  <span>Atur API Key Sekarang</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons: Kembali & Tombol 'Buat Skrip' */}
      <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {onBackToBrief && (
          <button
            type="button"
            onClick={onBackToBrief}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Brief</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            if (isAuthLocked) {
              onRequireAuthOrKey();
              return;
            }
            onGenerate();
          }}
          disabled={disabled || isGenerating || !productBrief.name || isAuthLocked}
          className={`flex-1 min-h-[46px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            disabled || isGenerating || !productBrief.name || isAuthLocked
              ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200/80'
              : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-md hover:shadow-lg ring-4 ring-emerald-500/20 active:scale-[0.99] cursor-pointer'
          }`}
          title={
            isAuthLocked
              ? 'Harap login dan atur API Key Google AI Studio Anda terlebih dahulu di menu profil (kanan atas).'
              : undefined
          }
        >
          {isAuthLocked ? (
            <>
              <Lock className="w-4 h-4 text-amber-500" />
              <span>Generator Terkunci (Perlu Login & API Key)</span>
            </>
          ) : isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Membuat {config.scriptCount} Skrip...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>Buat Skrip ({config.scriptCount} Konsep · {config.durationSeconds}s)</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
