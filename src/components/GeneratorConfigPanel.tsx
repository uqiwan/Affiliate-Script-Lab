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
  Sliders,
  Sparkles,
  Tag,
  Clock,
  User as UserIcon,
  MessageSquare,
  Flame,
  Volume2,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  GenerationConfig,
  ScriptDuration,
  DeliveryStyle,
  AudiencePersona,
  ProductBrief,
  HookType,
  DemoMethod,
  CtaType,
  SellingIntensity,
  PronounType,
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

interface DeliveryStyleOption {
  value: DeliveryStyle;
  label: string;
  symbol: string;
}

const DELIVERY_STYLES_WITH_SYMBOLS: DeliveryStyleOption[] = [
  { value: 'Natural conversational', symbol: '💬', label: 'Natural conversational (Santai)' },
  { value: 'Soft selling', symbol: '🍃', label: 'Soft selling (Halus & Edukasi)' },
  { value: 'Persuasif langsung tetapi etis', symbol: '🎯', label: 'Persuasif langsung (Direct CTA)' },
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

const HOOK_OPTIONS: HookType[] = [
  'Auto',
  'Bold claim berbukti',
  'Pain-point callout',
  'Outcome-first',
  'Question/information gap',
  'Myth-busting',
];

const DEMO_OPTIONS: DemoMethod[] = [
  'Auto',
  'Real-time / side-by-side',
  'Close-up / macro',
  'Unboxing & first touch',
  'Mini tutorial langkah demi langkah',
  'Day-in-the-life rutinitas',
  'Proof / test aman',
  'Before-after dengan bukti nyata',
];

const CTA_OPTIONS: CtaType[] = [
  'Auto',
  'Direct instruction (keranjang kiri bawah)',
  'Cek detail / pilihan variasi',
  'Soft CTA (simpan video ini)',
  'Price / value CTA',
  'Scarcity (hanya jika stok valid)',
  'Deadline (hanya jika batas waktu valid)',
];

const INTENSITY_OPTIONS: SellingIntensity[] = ['Soft', 'Balanced', 'Direct'];
const PRONOUN_OPTIONS: PronounType[] = ['aku/saya', 'kamu', 'netral'];

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
    <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs p-4 sm:p-5 space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
            3
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 flex items-center tracking-tight">
              <span>Pengaturan Generator Skrip</span>
              <InfoTooltip
                title="Pengaturan Generator"
                content="Tentukan jumlah variasi konsep, durasi rekaman, dan gaya penyampaian. Setiap skrip memiliki hook 3 detik, arahan B-roll visual, dan safe-zone teleprompter."
              />
            </h2>
            <p className="text-[11px] text-zinc-400 font-medium">Konfigurasi formula konten video affiliate</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
          Tahap 3
        </span>
      </div>

      {/* ========================================================= */}
      {/* KELOMPOK 1: PENGATURAN UTAMA (Prioritas Teratas)           */}
      {/* ========================================================= */}
      <div className="space-y-3.5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1">
          Pengaturan Utama
        </div>

        {/* Baris 1: Jumlah Skrip & Durasi Video (iOS Segmented Controls) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Jumlah Skrip */}
          <div className="p-3 bg-zinc-50/70 border border-zinc-200/70 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-800">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Jumlah Konsep Skrip</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                {config.scriptCount} konsep
              </span>
            </div>

            {/* iOS Segmented Selector */}
            <div className="grid grid-cols-5 gap-1 p-1 bg-zinc-200/60 rounded-xl shadow-inner">
              {[1, 3, 5, 10, 20].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleScriptCountChange(num)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer active:scale-95 ${
                    config.scriptCount === num
                      ? 'bg-white text-zinc-950 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Durasi Video */}
          <div className="p-3 bg-zinc-50/70 border border-zinc-200/70 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-800">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Durasi Target</span>
              </span>
              <span className="text-[11px] text-zinc-500 font-medium">
                {config.durationSeconds === 15 && '40–55 kata'}
                {config.durationSeconds === 30 && '75–100 kata'}
                {config.durationSeconds === 60 && '140–180 kata'}
                {config.durationSeconds === 90 && '200–250 kata'}
              </span>
            </div>

            {/* iOS Segmented Selector */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-200/60 rounded-xl shadow-inner">
              {([15, 30, 60, 90] as ScriptDuration[]).map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => handleDurationSelect(dur)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer active:scale-95 ${
                    config.durationSeconds === dur
                      ? 'bg-white text-zinc-950 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {dur}s
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Baris 2: Gaya Penyampaian & Target Persona */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Gaya Penyampaian */}
          <div className="p-3 bg-zinc-50/70 border border-zinc-200/70 rounded-2xl space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
              <span>Gaya Penyampaian Narasi</span>
            </label>
            <select
              value={config.style}
              onChange={(e) => onChange({ ...config, style: e.target.value as DeliveryStyle })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold text-zinc-800 shadow-2xs"
            >
              {DELIVERY_STYLES_WITH_SYMBOLS.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.symbol} {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target Persona */}
          <div className="p-3 bg-zinc-50/70 border border-zinc-200/70 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Target Persona Audiens</span>
              </label>
              {isCustomSelected && (
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200/60">
                  Kustom
                </span>
              )}
            </div>
            <select
              value={isCustomSelected ? 'Custom' : config.audiencePersona}
              onChange={(e) => handlePersonaSelect(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold text-zinc-800 shadow-2xs"
            >
              {STANDARD_PERSONAS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
              <option value="Custom">✏️ Custom (Tulis Target Sendiri)</option>
            </select>

            {isCustomSelected && (
              <div className="pt-1 animate-in fade-in duration-150">
                <input
                  type="text"
                  value={customPersonaValue}
                  onChange={(e) => handleCustomPersonaChange(e.target.value)}
                  placeholder="Tuliskan target audiens (misal: Ibu baru melahirkan, Atlet lari)..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 placeholder:text-zinc-400 font-medium"
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* KELOMPOK 2: PENGATURAN LANJUTAN (Advanced Options Submenu) */}
      {/* ========================================================= */}
      <div className="border border-zinc-200/80 rounded-2xl overflow-hidden bg-white shadow-2xs">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-3.5 bg-zinc-50/60 hover:bg-zinc-100/60 transition-colors text-xs font-bold text-zinc-800 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-zinc-500" />
            <span>Pengaturan Lanjutan (Advanced)</span>
            <span className="text-[10px] text-zinc-400 font-normal">
              Hook, Demo, CTA, Scarcity & Angles
            </span>
            {config.selectedAngles.length > 0 && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                {config.selectedAngles.length} Angle
              </span>
            )}
          </div>
          <div className="text-zinc-400">
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showAdvanced && (
          <div className="p-4 border-t border-zinc-200/70 space-y-4 bg-white animate-in fade-in duration-150">
            {/* Grid Opsi Lanjutan: Formula Hook & Demo Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-700 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-500" />
                  <span>Formula Hook 3 Detik</span>
                </label>
                <select
                  value={config.hookType || 'Auto'}
                  onChange={(e) => onChange({ ...config, hookType: e.target.value as HookType })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-zinc-200 bg-white"
                >
                  {HOOK_OPTIONS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-700 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-emerald-500" />
                  <span>Metode Demo Visual</span>
                </label>
                <select
                  value={config.demoMethod || 'Auto'}
                  onChange={(e) => onChange({ ...config, demoMethod: e.target.value as DemoMethod })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-zinc-200 bg-white"
                >
                  {DEMO_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid: CTA & Selling Intensity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-700 flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-teal-500" />
                  <span>Format Call to Action (CTA)</span>
                </label>
                <select
                  value={config.ctaType || 'Auto'}
                  onChange={(e) => onChange({ ...config, ctaType: e.target.value as CtaType })}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-zinc-200 bg-white"
                >
                  {CTA_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-700 block">
                  Intensitas Penjualan & Kata Ganti
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={config.sellingIntensity || 'Balanced'}
                    onChange={(e) =>
                      onChange({ ...config, sellingIntensity: e.target.value as SellingIntensity })
                    }
                    className="px-2 py-1.5 text-xs rounded-xl border border-zinc-200 bg-white"
                    title="Intensitas Penjualan"
                  >
                    {INTENSITY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  <select
                    value={config.pronouns || 'aku/saya'}
                    onChange={(e) => onChange({ ...config, pronouns: e.target.value as PronounType })}
                    className="px-2 py-1.5 text-xs rounded-xl border border-zinc-200 bg-white"
                    title="Kata Ganti Narator"
                  >
                    {PRONOUN_OPTIONS.map((pr) => (
                      <option key={pr} value={pr}>
                        {pr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* iOS Sakelar / Toggle Switch: Anchoring Harga & Urgensi */}
            <div className="pt-1 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Fitur Penjualan Cerdas (iOS Switches)
              </div>

              {/* iOS Switch 1: Anchoring Harga */}
              <div className="p-3 bg-zinc-50/80 rounded-2xl border border-zinc-200/60 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-zinc-900">
                    Anchoring Perbandingan Harga
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Menonjolkan nilai hemat / perbandingan worth-it secara transparan
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                  <input
                    type="checkbox"
                    checked={Boolean(config.priceAnchoringEnabled)}
                    onChange={(e) => onChange({ ...config, priceAnchoringEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner" />
                </label>
              </div>

              {/* iOS Switch 2: Urgensi & Kelangkaan */}
              <div className="p-3 bg-zinc-50/80 rounded-2xl border border-zinc-200/60 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-zinc-900">
                    Urgensi & Batas Promo (Scarcity)
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Menekankan batas waktu flash sale atau stok hanya jika ada data valid
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                  <input
                    type="checkbox"
                    checked={Boolean(config.urgencyEnabled)}
                    onChange={(e) => onChange({ ...config, urgencyEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner" />
                </label>
              </div>
            </div>

            {/* Pustaka 20 Angle Konten */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-800">Pustaka 20 Angle Konten:</span>
                <button
                  type="button"
                  onClick={() => setShowAngleLibrary(!showAngleLibrary)}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer text-[11px]"
                >
                  {showAngleLibrary ? 'Tutup Pustaka' : 'Pilih Angle Spesifik'}
                </button>
              </div>

              {showAngleLibrary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-56 overflow-y-auto p-2 bg-zinc-50 rounded-2xl border border-zinc-200">
                  {CONTENT_ANGLES.map((ang) => {
                    const isSelected =
                      config.selectedAngles.includes(ang.label) ||
                      config.selectedAngles.includes(ang.name);

                    return (
                      <button
                        key={ang.id}
                        type="button"
                        onClick={() => toggleAngle(ang.label)}
                        className={`text-left p-2 rounded-xl text-[11px] transition-all flex items-center justify-between cursor-pointer border ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-semibold border-emerald-600 shadow-xs'
                            : 'bg-white text-zinc-700 hover:bg-zinc-100 border-zinc-200/80'
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

            {/* Instruksi Khusus */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold text-zinc-700 block">
                Instruksi Khusus untuk AI (Opsional)
              </label>
              <textarea
                rows={2}
                value={config.extraInstructions || ''}
                onChange={(e) => onChange({ ...config, extraInstructions: e.target.value })}
                placeholder="Contoh: Fokus pada variasi warna pastel, sebutkan garansi 1 tahun..."
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Compliance Notice */}
      <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-2 text-xs text-emerald-900">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold text-[11px]">
            Kepatuhan Multi-Platform & Etika Aktif (Shopee Video, TikTok, Tokopedia)
          </span>
        </div>
        <InfoTooltip
          title="Kepatuhan Multi-Platform & Etika"
          content="Skrip otomatis netral tanpa sebutan satu platform tertentu, siap direkam untuk TikTok, Shopee Video, maupun Reels."
        />
      </div>

      {/* Script Generator Protection Warning Box */}
      {isAuthLocked && (
        <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5 shadow-2xs">
          <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1.5">
            <div className="font-bold text-amber-950">Proteksi Fitur Generator Skrip</div>
            <p className="text-amber-800 leading-relaxed font-medium text-[11px]">
              Harap login akun Google atau masukkan API Key Google AI Studio Anda terlebih dahulu.
            </p>
            <button
              type="button"
              onClick={onRequireAuthOrKey}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-2xs transition-all cursor-pointer active:scale-95"
            >
              <Lock className="w-3 h-3" />
              <span>Masuk / Atur API Key Sekarang</span>
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons: Kembali & Tombol 'Buat Skrip' */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {onBackToBrief && (
          <button
            type="button"
            onClick={onBackToBrief}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer active:scale-95"
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
              : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg ring-4 ring-emerald-500/20 active:scale-[0.99] cursor-pointer'
          }`}
        >
          {isAuthLocked ? (
            <>
              <Lock className="w-4 h-4 text-amber-500" />
              <span>Generator Terkunci (Perlu Login / API Key)</span>
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
