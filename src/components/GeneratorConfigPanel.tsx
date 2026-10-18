/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sliders,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  ShieldCheck,
  Check,
  Info,
  Layers,
  Wand2,
} from 'lucide-react';
import {
  GenerationConfig,
  ScriptDuration,
  DeliveryStyle,
  AudiencePersona,
  HookType,
  DemoMethod,
  CtaType,
  SellingIntensity,
  PronounType,
  ProductBrief,
} from '../types';
import { CONTENT_ANGLES, DURATION_WORD_TARGETS } from '../utils/constants';

interface GeneratorConfigPanelProps {
  config: GenerationConfig;
  onChange: (updatedConfig: GenerationConfig) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  disabled?: boolean;
  productBrief: ProductBrief;
}

const DELIVERY_STYLES: DeliveryStyle[] = [
  'Natural conversational',
  'Soft selling',
  'Persuasif langsung tetapi etis',
  'Storytelling/pengalaman',
  'UGC review/demo',
  'Edukatif/tutorial',
  'Humor ringan/relatable',
  'POV/rutinitas',
  'Unboxing/first impression',
  'Komparasi/value',
];

const AUDIENCE_PERSONAS: AudiencePersona[] = [
  'Auto',
  'Mahasiswa/anak kost',
  'Pekerja kantor/Gen-Z',
  'Orang tua/rumah tangga',
  'Profesional',
  'Pengguna pemula',
  'Custom',
];

export const GeneratorConfigPanel: React.FC<GeneratorConfigPanelProps> = ({
  config,
  onChange,
  onGenerate,
  isGenerating,
  disabled = false,
  productBrief,
}) => {
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [showAngleLibrary, setShowAngleLibrary] = useState<boolean>(false);
  const [customPersona, setCustomPersona] = useState<string>('');

  const hasPrice = !!productBrief.currentPrice;
  const hasUrgencyData = !!productBrief.stockOrDeadline;

  const handleDurationSelect = (dur: ScriptDuration) => {
    onChange({ ...config, durationSeconds: dur });
  };

  const handleScriptCountChange = (count: number) => {
    onChange({ ...config, scriptCount: Math.max(1, Math.min(10, count)) });
  };

  const toggleAngle = (angleName: string) => {
    let next: string[];
    if (config.selectedAngles.includes(angleName)) {
      next = config.selectedAngles.filter((a) => a !== angleName);
    } else {
      next = [...config.selectedAngles, angleName];
    }
    onChange({
      ...config,
      angleMode: next.length > 0 ? 'manual' : 'auto',
      selectedAngles: next,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-4 sm:p-5 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-zinc-900">
            3. Pengaturan Generator
          </h2>
          <p className="text-xs text-zinc-500">
            Sesuaikan jumlah, durasi, gaya, dan angle skrip
          </p>
        </div>
      </div>

      {/* 1. JUMLAH SKRIP & DURASI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Jumlah Skrip */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
            <span>Jumlah Skrip (1–10)</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
              {config.scriptCount} konsep
            </span>
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 5, 10].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleScriptCountChange(num)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
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

        {/* Durasi Video */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" /> Durasi Video
            </span>
            <span className="text-[11px] text-zinc-400">
              {DURATION_WORD_TARGETS[config.durationSeconds]?.min}–{DURATION_WORD_TARGETS[config.durationSeconds]?.max} kata
            </span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {([15, 30, 60, 90] as ScriptDuration[]).map((dur) => (
              <button
                key={dur}
                type="button"
                onClick={() => handleDurationSelect(dur)}
                className={`py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
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

      {/* 2. GAYA PENYAMPAIAN & PERSONA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Gaya Penyampaian */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 block">
            Gaya Penyampaian Narasi
          </label>
          <select
            value={config.style}
            onChange={(e) => onChange({ ...config, style: e.target.value as DeliveryStyle })}
            className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            {DELIVERY_STYLES.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
        </div>

        {/* Persona Audiens */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 block">
            Persona Target Audiens
          </label>
          <select
            value={
              AUDIENCE_PERSONAS.includes(config.audiencePersona as AudiencePersona)
                ? config.audiencePersona
                : 'Custom'
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'Custom') {
                onChange({ ...config, audiencePersona: customPersona || 'Mahasiswa' });
              } else {
                onChange({ ...config, audiencePersona: val });
              }
            }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            {AUDIENCE_PERSONAS.map((persona) => (
              <option key={persona} value={persona}>
                {persona}
              </option>
            ))}
          </select>

          {config.audiencePersona !== 'Auto' &&
            !(AUDIENCE_PERSONAS as readonly string[]).includes(config.audiencePersona) && (
              <input
                type="text"
                value={config.audiencePersona}
                onChange={(e) => {
                  setCustomPersona(e.target.value);
                  onChange({ ...config, audiencePersona: e.target.value });
                }}
                placeholder="Tulis persona custom (cth: Guru muda, pecinta kopi)..."
                className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-200"
              />
            )}
        </div>
      </div>

      {/* 3. PUSTAKA 20 ANGLE KONTEN */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            Angle Konten Video (20 Pustaka Angle)
          </span>
          <button
            type="button"
            onClick={() => setShowAngleLibrary(!showAngleLibrary)}
            className="text-[11px] text-emerald-600 hover:text-emerald-700 underline font-medium cursor-pointer"
          >
            {showAngleLibrary ? 'Tutup Pustaka' : 'Pilih Angle Spesifik'}
          </button>
        </div>

        {/* Selected badge status */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onChange({ ...config, angleMode: 'auto', selectedAngles: [] })}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              config.angleMode === 'auto'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
            }`}
          >
            ✨ Auto (AI memilihkan angle paling relevan & variatif)
          </button>

          {config.selectedAngles.length > 0 && (
            <span className="text-[11px] text-zinc-500 font-medium">
              ({config.selectedAngles.length} angle terpilih)
            </span>
          )}
        </div>

        {/* Expandable 20 Angles List */}
        {showAngleLibrary && (
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 max-h-56 overflow-y-auto space-y-1.5 mt-2">
            <p className="text-[11px] text-zinc-500 pb-1 border-b border-zinc-200">
              Pilih satu atau lebih angle untuk membatasi variasi konsep:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
              {CONTENT_ANGLES.map((angle) => {
                const isSelected = config.selectedAngles.includes(angle.name);
                return (
                  <button
                    key={angle.id}
                    type="button"
                    onClick={() => toggleAngle(angle.name)}
                    className={`flex items-start gap-2 p-2 rounded-lg text-left text-xs transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-emerald-100/70 border-emerald-400 text-emerald-950 font-medium'
                        : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 mt-0.5 rounded flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-emerald-600 text-white' : 'border border-zinc-300'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <div>
                      <span className="font-semibold block text-[11px]">{angle.name}</span>
                      <span className="text-[10px] text-zinc-500 leading-tight block">
                        {angle.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. OPSI LANJUTAN (COLLAPSIBLE) */}
      <div className="border border-zinc-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full px-4 py-2.5 bg-zinc-50 hover:bg-zinc-100 flex items-center justify-between text-xs font-semibold text-zinc-700 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-zinc-500" /> Opsi Lanjutan (Hook, Demo, CTA, Intensitas)
          </span>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="p-4 space-y-4 bg-white border-t border-zinc-200 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Tipe Hook */}
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 block">Tipe Hook 3 Detik</label>
                <select
                  value={config.hookType}
                  onChange={(e) => onChange({ ...config, hookType: e.target.value as HookType })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200"
                >
                  <option value="Auto">Auto (Sesuaikan dengan angle)</option>
                  <option value="Bold claim berbukti">Bold claim berbukti nyata</option>
                  <option value="Pain-point callout">Pain-point callout</option>
                  <option value="Outcome-first">Outcome-first / Transformasi</option>
                  <option value="Question/information gap">Question / Curious gap</option>
                  <option value="Myth-busting">Myth-busting (Mitos vs Fakta)</option>
                </select>
              </div>

              {/* Metode Demo */}
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 block">Metode Visual Demo</label>
                <select
                  value={config.demoMethod}
                  onChange={(e) => onChange({ ...config, demoMethod: e.target.value as DemoMethod })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200"
                >
                  <option value="Auto">Auto (Pilihan terbaik kreator)</option>
                  <option value="Real-time / side-by-side">Real-time / side-by-side</option>
                  <option value="Close-up / macro">Close-up / macro tekstur</option>
                  <option value="Unboxing & first touch">Unboxing & sentuhan pertama</option>
                  <option value="Mini tutorial langkah demi langkah">Mini tutorial langkah-langkah</option>
                  <option value="Day-in-the-life rutinitas">Day-in-the-life rutinitas</option>
                  <option value="Proof / test aman">Proof / test aman</option>
                  <option value="Before-after dengan bukti nyata">Before-after nyata</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Pendekatan CTA */}
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 block">Pendekatan CTA</label>
                <select
                  value={config.ctaType}
                  onChange={(e) => onChange({ ...config, ctaType: e.target.value as CtaType })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200"
                >
                  <option value="Auto">Auto</option>
                  <option value="Direct instruction (klik keranjang kuning)">Klik keranjang kuning</option>
                  <option value="Cek detail / pilihan variasi">Cek detail & variasi</option>
                  <option value="Soft CTA (simpan video ini)">Soft CTA (simpan video)</option>
                  <option value="Price / value CTA">Price / value CTA</option>
                  <option value="Scarcity (hanya jika stok valid)" disabled={!hasUrgencyData}>
                    Scarcity (Perlu data stok)
                  </option>
                  <option value="Deadline (hanya jika batas waktu valid)" disabled={!hasUrgencyData}>
                    Deadline (Perlu data promo)
                  </option>
                </select>
              </div>

              {/* Intensitas Penjualan */}
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 block">Intensitas Jualan</label>
                <select
                  value={config.sellingIntensity}
                  onChange={(e) =>
                    onChange({ ...config, sellingIntensity: e.target.value as SellingIntensity })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200"
                >
                  <option value="Soft">Soft Selling</option>
                  <option value="Balanced">Balanced (Seimbang)</option>
                  <option value="Direct">Direct Selling (Langsung)</option>
                </select>
              </div>

              {/* Sapaan / Pronoun */}
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 block">Sapaan Kreator</label>
                <select
                  value={config.pronouns}
                  onChange={(e) => onChange({ ...config, pronouns: e.target.value as PronounType })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200"
                >
                  <option value="aku/saya">aku / saya</option>
                  <option value="kamu">kamu / kalian</option>
                  <option value="netral">Netral (tanpa kata ganti)</option>
                </select>
              </div>
            </div>

            {/* Price Anchoring & Urgency checkboxes */}
            <div className="p-2.5 bg-zinc-50 rounded-lg space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.priceAnchoringEnabled && hasPrice}
                  disabled={!hasPrice}
                  onChange={(e) => onChange({ ...config, priceAnchoringEnabled: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className={hasPrice ? 'text-zinc-700' : 'text-zinc-400'}>
                  Gunakan Price Anchoring (Bandingkan harga normal vs diskon)
                  {!hasPrice && ' — (Memerlukan data harga di brief)'}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.urgencyEnabled && hasUrgencyData}
                  disabled={!hasUrgencyData}
                  onChange={(e) => onChange({ ...config, urgencyEnabled: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className={hasUrgencyData ? 'text-zinc-700' : 'text-zinc-400'}>
                  Gunakan Urgency / Batas Waktu
                  {!hasUrgencyData && ' — (Hanya aktif bila batas promo/stok terverifikasi)'}
                </span>
              </label>
            </div>

            {/* Catatan Tambahan */}
            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 block">
                Instruksi Tambahan (Opsional)
              </label>
              <input
                type="text"
                value={config.extraInstructions || ''}
                onChange={(e) => onChange({ ...config, extraInstructions: e.target.value })}
                placeholder="Contoh: Fokuskan pada portabilitas saat traveling, jangan pakai kata 'gays'..."
                className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* MANDATORY FACTUAL & ETHICAL CHECKLIST (LOCKED) */}
      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">
            Kepatuhan Etika & Faktualitas (Selalu Aktif)
          </span>
          <p className="text-[11px] text-emerald-800 leading-relaxed mt-0.5">
            Sistem tidak akan mengarang harga, batas waktu promo, stok fiktif, testimoni palsu, atau klaim medis yang tidak terbukti.
          </p>
        </div>
      </div>

      {/* PRIMARY GENERATE BUTTON */}
      <button
        type="button"
        onClick={onGenerate}
        disabled={disabled || isGenerating || !productBrief.name}
        className={`w-full min-h-[48px] py-3 px-4 rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
          disabled || isGenerating || !productBrief.name
            ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-md hover:shadow-lg'
        }`}
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Menulis {config.scriptCount} Skrip TikTok Affiliate...</span>
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5" />
            <span>Buat {config.scriptCount} Skrip Siap Rekam ({config.durationSeconds}s)</span>
          </>
        )}
      </button>
    </div>
  );
};
