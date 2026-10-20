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
  Sparkles,
  Sliders,
  Minus,
  Plus,
  Clock,
  User as UserIcon,
  MessageSquare,
  Flame,
  ChevronRight,
  SlidersHorizontal,
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
  badge: string;
}

const DELIVERY_STYLES: DeliveryStyleOption[] = [
  { value: 'Natural conversational', label: 'Natural conversational (Santai & Mengalir)', badge: 'Rekomendasi' },
  { value: 'Soft selling', label: 'Soft selling (Halus, Ramah & Berbagi)', badge: 'Edukasi' },
  { value: 'Persuasif langsung tetapi etis', label: 'Persuasif langsung (Direct CTA & Meyakinkan)', badge: 'Konversi' },
  { value: 'Storytelling/pengalaman', label: 'Storytelling / Pengalaman Pribadi Nyata', badge: 'Emosi' },
  { value: 'UGC review/demo', label: 'UGC Review / Demo Pemakaian Jujur', badge: 'Populer' },
  { value: 'Edukatif/tutorial', label: 'Edukatif / Mini Tutorial Langkah Demi Langkah', badge: 'Tutorial' },
  { value: 'Humor ringan/relatable', label: 'Humor ringan / Relatable', badge: 'Hiburan' },
  { value: 'POV/rutinitas', label: 'POV / Rutinitas Keseharian', badge: 'Lifestyle' },
  { value: 'Unboxing/first impression', label: 'Unboxing & First Impression Saat Paket Tiba', badge: 'Unboxing' },
  { value: 'Komparasi/value', label: 'Komparasi / Value for Money', badge: 'Perbandingan' },
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

  const handleScriptCountChange = (val: number) => {
    const clamped = Math.max(1, Math.min(30, val));
    onChange({ ...config, scriptCount: clamped });
  };

  const toggleAngle = (angleLabel: string) => {
    const current = config.selectedAngles || [];
    const exists = current.includes(angleLabel);
    const updated = exists ? current.filter((a) => a !== angleLabel) : [...current, angleLabel];
    onChange({
      ...config,
      angleMode: updated.length > 0 ? 'manual' : 'auto',
      selectedAngles: updated,
    });
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-10">
      {/* ========================================================= */}
      {/* 1. KELOMPOK UTAMA (FITUR PALING PENTING)                  */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-[22px] border border-[#E5E5EA] dark:border-[#38383A] shadow-xs overflow-hidden">
        {/* Section Header */}
        <div className="px-5 py-4 border-b border-[#F2F2F7] dark:border-[#2C2C2E] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[10px] bg-[#5856D6]/10 text-[#5856D6] flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#1C1C1E] dark:text-white flex items-center gap-1.5 tracking-tight">
                <span>Parameter Inti Skrip</span>
                <InfoTooltip
                  title="Konfigurasi Generator"
                  content="Gagaswara menyesuaikan rasio kata per detik secara otomatis agar pas dengan durasi rekaman."
                />
              </h2>
              <p className="text-[11px] text-[#8E8E93] font-medium">
                Tentukan format utama sebelum membuat skrip video
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Item 1: Target Durasi Video (iOS Segmented Control) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#1C1C1E] dark:text-white">
                Target Durasi Video
              </label>
              <span className="text-[11px] text-[#8E8E93] tabular-nums">
                {config.durationSeconds === 20 && '~45-55 kata (Hook Cepat)'}
                {config.durationSeconds === 30 && '~65-80 kata (Standar Affiliate)'}
                {config.durationSeconds === 60 && '~130-160 kata (Deep Review)'}
                {config.durationSeconds === 90 && '~200-240 kata (Tutorial / Story)'}
                {config.durationSeconds === 120 && '~280-320 kata (Long Form)'}
              </span>
            </div>

            <div className="bg-[#767680]/12 dark:bg-[#767680]/24 p-[3px] rounded-[12px] flex items-center gap-1 overflow-x-auto">
              {([20, 30, 60, 90, 120] as ScriptDuration[]).map((dur) => {
                const isSelected = config.durationSeconds === dur;
                return (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => handleDurationSelect(dur)}
                    className={`flex-1 py-2 px-2 sm:px-3 rounded-[9px] text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-white dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-white shadow-[0_2px_4px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.04)] font-bold'
                        : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{dur}d</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Item 2: Jumlah Skrip Konsep (Pilihan Segmented Tunggal 2, 5, 10, 20, 30) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#1C1C1E] dark:text-white">
                Jumlah Skrip yang Dibuat
              </label>
              <span className="text-[11px] text-[#007AFF] font-bold tabular-nums">
                {config.scriptCount} Variasi Konsep
              </span>
            </div>

            <div className="bg-[#767680]/12 dark:bg-[#767680]/24 p-[3px] rounded-[12px] flex items-center gap-1">
              {[2, 5, 10, 20, 30].map((cnt) => {
                const isSelected = config.scriptCount === cnt;
                return (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => handleScriptCountChange(cnt)}
                    className={`flex-1 py-2 px-2 rounded-[9px] text-xs font-semibold transition-all duration-150 flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'bg-[#007AFF] text-white shadow-xs font-bold'
                        : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
                    }`}
                  >
                    {cnt} Skrip
                  </button>
                );
              })}
            </div>
          </div>

          {/* Item 3: Gaya Pembawaan (iOS Grouped Dropdown Picker) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#1C1C1E] dark:text-white">
                Gaya Pembawaan Narasi
              </label>
              <span className="text-[11px] text-[#8E8E93]">Tone & Vibe</span>
            </div>

            <div className="relative">
              <select
                value={config.style}
                onChange={(e) => onChange({ ...config, style: e.target.value as DeliveryStyle })}
                className="w-full h-11 px-3.5 rounded-[12px] bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-transparent focus:border-[#007AFF] focus:bg-white dark:focus:bg-[#1C1C1E] text-xs font-medium text-[#1C1C1E] dark:text-white appearance-none cursor-pointer transition-all pr-10 focus:outline-none"
              >
                {DELIVERY_STYLES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8E8E93]">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. KELOMPOK TARGET AUDIENS & SUDUT PANDANG                */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-[22px] border border-[#E5E5EA] dark:border-[#38383A] shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F2F2F7] dark:border-[#2C2C2E] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#5856D6]/15 text-[#5856D6] flex items-center justify-center font-bold text-xs">
              <UserIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#1C1C1E] dark:text-white">
                Target Persona Audiens
              </h3>
              <p className="text-[11px] text-[#8E8E93]">
                Bahasa disesuaikan dengan sasaran penonton
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-3">
          {/* Persona Selection Pills */}
          <div className="flex flex-wrap gap-1.5">
            {STANDARD_PERSONAS.map((p) => {
              const isSelected = config.audiencePersona === p && !isCustomSelected;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onChange({ ...config, audiencePersona: p })}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#5856D6] text-white shadow-xs'
                      : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#8E8E93] hover:text-[#1C1C1E]'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => {
                onChange({ ...config, audiencePersona: 'Custom' });
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isCustomSelected
                  ? 'bg-[#5856D6] text-white shadow-xs'
                  : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#8E8E93] hover:text-[#1C1C1E]'
              }`}
            >
              + Kustom
            </button>
          </div>

          {/* Custom Persona Text Input */}
          {isCustomSelected && (
            <div className="pt-1">
              <input
                type="text"
                value={customPersonaValue}
                onChange={(e) => {
                  setCustomPersonaValue(e.target.value);
                  onChange({ ...config, audiencePersona: e.target.value || 'Custom' });
                }}
                placeholder="Misal: Fotografer pemula, pecinta kucing, atlet lari..."
                className="w-full h-10 px-3.5 rounded-[12px] bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-transparent focus:border-[#5856D6] focus:bg-white dark:focus:bg-[#1C1C1E] text-xs text-[#1C1C1E] dark:text-white focus:outline-none transition-all"
              />
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. PENGATURAN LANJUTAN (COLLAPSIBLE ADVANCED MENU)        */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-[22px] border border-[#E5E5EA] dark:border-[#38383A] shadow-xs overflow-hidden">
        {/* Collapsible Accordion Header */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#F2F2F7]/50 active:bg-[#F2F2F7] transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#FF9500]/15 text-[#FF9500] flex items-center justify-center">
              <Sliders className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-[#1C1C1E] dark:text-white">
                Pengaturan Lanjutan & Formula (Advanced)
              </div>
              <div className="text-[11px] text-[#8E8E93]">
                {showAdvanced ? 'Sembunyikan opsi lanjutan' : 'Pustaka 20 angle, hook, demo, CTA, & switch promo'}
              </div>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#F2F2F7] dark:bg-[#2C2C2E] flex items-center justify-center text-[#8E8E93]">
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showAdvanced && (
          <div className="p-5 border-t border-[#F2F2F7] dark:border-[#2C2C2E] space-y-5 animate-in fade-in duration-200">
            {/* Pustaka 20 Angle Konten */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1C1C1E] dark:text-white">
                  Formula Sudut Pandang (Angle)
                </span>
                <button
                  type="button"
                  onClick={() => setShowAngleLibrary(!showAngleLibrary)}
                  className="text-[#007AFF] font-semibold hover:underline cursor-pointer text-[11px]"
                >
                  {showAngleLibrary ? 'Tutup Pustaka' : 'Pilih dari 20 Pustaka Angle'}
                </button>
              </div>

              {showAngleLibrary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-56 overflow-y-auto p-2 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[16px]">
                  {CONTENT_ANGLES.map((ang) => {
                    const isSelected =
                      config.selectedAngles.includes(ang.label) ||
                      config.selectedAngles.includes(ang.name);

                    return (
                      <button
                        key={ang.id}
                        type="button"
                        onClick={() => toggleAngle(ang.label)}
                        className={`text-left p-2.5 rounded-[12px] text-[11px] transition-all flex items-center justify-between cursor-pointer border ${
                          isSelected
                            ? 'bg-[#007AFF] text-white font-semibold border-transparent shadow-xs'
                            : 'bg-white dark:bg-[#1C1C1E] text-[#1C1C1E] dark:text-white hover:bg-[#E5E5EA]/70 border-black/5 dark:border-white/5'
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

            {/* Intensitas Jualan (iOS Segmented Control) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#1C1C1E] dark:text-white block">
                Intensitas Jualan (Selling Intensity)
              </label>
              <div className="bg-[#767680]/12 dark:bg-[#767680]/24 p-[3px] rounded-[12px] flex items-center gap-1">
                {INTENSITY_OPTIONS.map((intOpt) => {
                  const isSelected = config.sellingIntensity === intOpt;
                  return (
                    <button
                      key={intOpt}
                      type="button"
                      onClick={() => onChange({ ...config, sellingIntensity: intOpt })}
                      className={`flex-1 py-1.5 px-3 rounded-[9px] text-xs font-semibold transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-white dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-white shadow-sm'
                          : 'text-[#8E8E93] hover:text-[#1C1C1E]'
                      }`}
                    >
                      {intOpt === 'Soft' && 'Soft (Halus)'}
                      {intOpt === 'Balanced' && 'Balanced (Seimbang)'}
                      {intOpt === 'Direct' && 'Direct (Tegas)'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hook & Demo Dropdowns in 2-column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1C1C1E] dark:text-white block">
                  Tipe Hook 3 Detik Awal
                </label>
                <div className="relative">
                  <select
                    value={config.hookType}
                    onChange={(e) => onChange({ ...config, hookType: e.target.value as HookType })}
                    className="w-full h-10 px-3 rounded-[12px] bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-transparent text-xs font-medium text-[#1C1C1E] dark:text-white appearance-none cursor-pointer focus:outline-none pr-8"
                  >
                    {HOOK_OPTIONS.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1C1C1E] dark:text-white block">
                  Metode Demo Produk (B-Roll)
                </label>
                <div className="relative">
                  <select
                    value={config.demoMethod}
                    onChange={(e) => onChange({ ...config, demoMethod: e.target.value as DemoMethod })}
                    className="w-full h-10 px-3 rounded-[12px] bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-transparent text-xs font-medium text-[#1C1C1E] dark:text-white appearance-none cursor-pointer focus:outline-none pr-8"
                  >
                    {DEMO_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* CTA & Kata Ganti in 2-column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1C1C1E] dark:text-white block">
                  Ajakan Bertindak (CTA)
                </label>
                <div className="relative">
                  <select
                    value={config.ctaType}
                    onChange={(e) => onChange({ ...config, ctaType: e.target.value as CtaType })}
                    className="w-full h-10 px-3 rounded-[12px] bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-transparent text-xs font-medium text-[#1C1C1E] dark:text-white appearance-none cursor-pointer focus:outline-none pr-8"
                  >
                    {CTA_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1C1C1E] dark:text-white block">
                  Kata Ganti (Pronoun)
                </label>
                <div className="relative">
                  <select
                    value={config.pronouns}
                    onChange={(e) => onChange({ ...config, pronouns: e.target.value as PronounType })}
                    className="w-full h-10 px-3 rounded-[12px] bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-transparent text-xs font-medium text-[#1C1C1E] dark:text-white appearance-none cursor-pointer focus:outline-none pr-8"
                  >
                    {PRONOUN_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* iOS Grouped List with Authentic iOS Toggle Switches */}
            <div className="bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[16px] overflow-hidden divide-y divide-[#E5E5EA] dark:divide-[#38383A]">
              {/* Switch 1: Price Anchoring */}
              <div className="p-3.5 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-[#1C1C1E] dark:text-white">
                    Sorot Perbandingan Harga (Price Anchoring)
                  </div>
                  <div className="text-[11px] text-[#8E8E93]">
                    Bandingkan harga coret vs promo untuk menegaskan hemat
                  </div>
                </div>

                {/* Authentic iOS Switch */}
                <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                  <input
                    type="checkbox"
                    checked={Boolean(config.priceAnchoringEnabled)}
                    onChange={(e) => onChange({ ...config, priceAnchoringEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-[51px] h-[31px] bg-[#E9E9EA] dark:bg-[#39393D] peer-checked:bg-[#34C759] rounded-full transition-colors duration-200 relative">
                    <div className="w-[27px] h-[27px] bg-white rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.15),0_1px_1px_rgba(0,0,0,0.06)] absolute top-[2px] left-[2px] transition-transform duration-200 peer-checked:translate-x-[20px]" />
                  </div>
                </label>
              </div>

              {/* Switch 2: Urgensi & Batas Promo */}
              <div className="p-3.5 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-[#1C1C1E] dark:text-white">
                    Urgensi & Batas Promo (Scarcity)
                  </div>
                  <div className="text-[11px] text-[#8E8E93]">
                    Menekankan batas waktu promo hanya jika ada data valid
                  </div>
                </div>

                {/* Authentic iOS Switch */}
                <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                  <input
                    type="checkbox"
                    checked={Boolean(config.urgencyEnabled)}
                    onChange={(e) => onChange({ ...config, urgencyEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-[51px] h-[31px] bg-[#E9E9EA] dark:bg-[#39393D] peer-checked:bg-[#34C759] rounded-full transition-colors duration-200 relative">
                    <div className="w-[27px] h-[27px] bg-white rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.15),0_1px_1px_rgba(0,0,0,0.06)] absolute top-[2px] left-[2px] transition-transform duration-200 peer-checked:translate-x-[20px]" />
                  </div>
                </label>
              </div>
            </div>

            {/* Instruksi Khusus untuk AI */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1C1C1E] dark:text-white block">
                Instruksi Khusus Tambahan (Opsional)
              </label>
              <textarea
                rows={2}
                value={config.extraInstructions || ''}
                onChange={(e) => onChange({ ...config, extraInstructions: e.target.value })}
                placeholder="Contoh: Fokus pada variasi warna pastel, sebutkan promo gajian..."
                className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-transparent focus:border-[#007AFF] text-xs text-[#1C1C1E] dark:text-white focus:outline-none transition-all"
              />
            </div>
          </div>
        )}
      </div>

      {/* Compliance Badge */}
      <div className="px-4 py-3 bg-[#34C759]/10 rounded-[16px] flex items-center justify-between gap-3 text-xs text-[#34C759]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#34C759] shrink-0" />
          <span className="font-semibold text-[11px] text-[#1C1C1E] dark:text-white">
            Kepatuhan Multi-Platform & Etika Aktif (Shopee Video, TikTok, Tokopedia, Reels)
          </span>
        </div>
      </div>

      {/* Script Generator Protection Warning Box */}
      {isAuthLocked && (
        <div className="p-4 bg-[#FF9500]/10 border border-[#FF9500]/30 rounded-[18px] text-xs flex items-start gap-3">
          <Lock className="w-4 h-4 text-[#FF9500] shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1.5">
            <div className="font-bold text-[#1C1C1E] dark:text-white">Proteksi Generator Skrip</div>
            <p className="text-[#8E8E93] leading-relaxed text-[11px]">
              Harap masuk akun Google atau masukkan API Key Google AI Studio Anda terlebih dahulu untuk memulai pembuatan skrip.
            </p>
            <button
              type="button"
              onClick={onRequireAuthOrKey}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FF9500] text-white hover:bg-[#F28B00] active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              <Lock className="w-3 h-3" />
              <span>Masuk / Atur API Key</span>
            </button>
          </div>
        </div>
      )}

      {/* Action Bar: Navigasi Kembali */}
      {onBackToBrief && (
        <div className="pt-2 flex items-center justify-start">
          <button
            type="button"
            onClick={onBackToBrief}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[12px] text-xs font-semibold text-[#8E8E93] hover:text-[#1C1C1E] bg-[#E5E5EA]/70 dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] transition-all cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Brief</span>
          </button>
        </div>
      )}
    </div>
  );
};
