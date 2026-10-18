/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  ShieldCheck,
  Check,
  Wand2,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
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
  onBackToBrief,
}) => {
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [showAngleLibrary, setShowAngleLibrary] = useState<boolean>(false);
  const [customPersona, setCustomPersona] = useState<string>('');

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
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-4 sm:p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
            3
          </div>
          <h2 className="text-sm sm:text-base font-bold text-zinc-900 flex items-center gap-1.5">
            <span>Pengaturan Generator Skrip</span>
            <InfoTooltip
              title="Pengaturan Generator"
              content="Tentukan jumlah skrip yang diinginkan, target durasi video, serta gaya penyampaian. Tiap skrip akan memiliki angle, hook, dan alur visual B-roll yang unik."
            />
          </h2>
        </div>
        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
          Tahap 3
        </span>
      </div>

      {/* 1. JUMLAH SKRIP & DURASI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Jumlah Skrip */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
            <span className="flex items-center gap-1">
              Jumlah Skrip
              <InfoTooltip
                title="Jumlah Konsep Skrip"
                content="Berapa banyak variasi konsep video yang ingin dibuat sekaligus dalam 1 kali proses."
              />
            </span>
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

        {/* Durasi Skrip */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-700 flex items-center justify-between">
            <span className="flex items-center gap-1">
              Durasi Video
              <InfoTooltip
                title="Target Durasi Video"
                content="30 detik adalah sweet-spot ideal algoritma affiliate. 15 detik untuk hook kilat, 60 detik untuk edukasi/review mendalam."
              />
            </span>
            <span className="text-zinc-500 text-[11px] font-normal flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-400" />
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

      {/* 2. GAYA & TARGET AUDIENS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Gaya Penyampaian */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1">
            Gaya Penyampaian
            <InfoTooltip
              title="Gaya Penyampaian"
              content="Nada bicara voiceover narator saat menyampaikan pesan produk (misal: natural santai, review jujur, bercerita, atau unboxing)."
            />
          </label>
          <select
            value={config.style}
            onChange={(e) => onChange({ ...config, style: e.target.value as DeliveryStyle })}
            className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 text-xs text-zinc-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
          >
            {DELIVERY_STYLES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Target Persona */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1">
            Target Persona
            <InfoTooltip
              title="Target Persona"
              content="Pilih profil penonton utama agar pemilihan kosakata, masalah yang diangkat, dan analogi terasa sangat relevan bagi mereka."
            />
          </label>
          <select
            value={config.audiencePersona}
            onChange={(e) =>
              onChange({ ...config, audiencePersona: e.target.value as AudiencePersona })
            }
            className="w-full px-2.5 py-1.5 rounded-xl border border-zinc-200 text-xs text-zinc-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
          >
            {AUDIENCE_PERSONAS.map((per) => (
              <option key={per} value={per}>
                {per === 'Auto' ? 'Auto (Berdasarkan Brief Produk)' : per}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Custom Persona Field */}
      {config.audiencePersona === 'Custom' && (
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700 block">
            Jelaskan Persona Audiens Khusus
          </label>
          <input
            type="text"
            value={customPersona}
            onChange={(e) => {
              setCustomPersona(e.target.value);
              onChange({ ...config, audiencePersona: `Custom: ${e.target.value}` });
            }}
            placeholder="Cth: Gamer yang sering begadang, pembuat konten pemula..."
            className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 text-xs"
          />
        </div>
      )}

      {/* 3. ANGLE CONTENT (COLLAPSIBLE) */}
      <div className="border border-zinc-200/80 rounded-xl overflow-hidden bg-zinc-50/50">
        <button
          type="button"
          onClick={() => setShowAngleLibrary(!showAngleLibrary)}
          className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-zinc-100/60 transition-colors cursor-pointer text-xs font-semibold text-zinc-800"
        >
          <div className="flex items-center gap-1.5">
            <span>Pilihan Sudut Pandang / Angle Video</span>
            <span className="text-[10px] bg-zinc-200/70 text-zinc-700 px-1.5 py-0.2 rounded-full font-bold">
              {config.selectedAngles.length === 0
                ? 'Auto (AI Variatif)'
                : `${config.selectedAngles.length} Dipilih`}
            </span>
          </div>
          <div className="text-zinc-400">
            {showAngleLibrary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showAngleLibrary && (
          <div className="p-3 pt-1 border-t border-zinc-200/60 mt-1 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span>Klik untuk memilih angle spesifik:</span>
              {config.selectedAngles.length > 0 && (
                <button
                  type="button"
                  onClick={() => onChange({ ...config, angleMode: 'auto', selectedAngles: [] })}
                  className="text-emerald-600 hover:underline font-medium cursor-pointer"
                >
                  Reset ke Auto
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {CONTENT_ANGLES.map((angle) => {
                const isSelected = config.selectedAngles.includes(angle.name);
                return (
                  <button
                    key={angle.name}
                    type="button"
                    onClick={() => toggleAngle(angle.name)}
                    className={`p-2 rounded-lg text-left text-xs transition-all flex items-start justify-between gap-1.5 border cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium'
                        : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="block truncate font-semibold">{angle.name}</span>
                      <span className="text-[10px] text-zinc-500 block truncate">
                        {angle.description}
                      </span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. PENGATURAN LANJUTAN (COLLAPSIBLE) */}
      <div className="border border-zinc-200/80 rounded-xl overflow-hidden bg-zinc-50/50">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-zinc-100/60 transition-colors cursor-pointer text-xs font-semibold text-zinc-800"
        >
          <span>Pengaturan Tambahan (Kata Ganti & Instruksi)</span>
          <div className="text-zinc-400">
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showAdvanced && (
          <div className="p-3 pt-1 border-t border-zinc-200/60 mt-1 space-y-2.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 block">Kata Ganti Narator</label>
                <select
                  value={config.pronouns}
                  onChange={(e) => onChange({ ...config, pronouns: e.target.value as any })}
                  className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white"
                >
                  <option value="aku/saya">aku / saya</option>
                  <option value="gue/lo">gue / lo</option>
                  <option value="kita/kami">kita / kami</option>
                  <option value="netral">netral (tanpa kata ganti)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700 block">Intensitas Jualan</label>
                <select
                  value={config.sellingIntensity}
                  onChange={(e) => onChange({ ...config, sellingIntensity: e.target.value as any })}
                  className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white"
                >
                  <option value="Balanced">Seimbang (Fokus Manfaat)</option>
                  <option value="Subtle">Halus (Soft-selling)</option>
                  <option value="Direct">Langsung (Direct conversion)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-zinc-700 block">
                Instruksi Khusus Tambahan (Opsional)
              </label>
              <input
                type="text"
                value={config.extraInstructions || ''}
                onChange={(e) => onChange({ ...config, extraInstructions: e.target.value })}
                placeholder="Contoh: Tekankan ukuran hemat tempat, jangan pakai kata 'gays'..."
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
            Kepatuhan Multi-Platform & Etika Faktual Aktif
          </span>
        </div>
        <InfoTooltip
          title="Kepatuhan Multi-Platform & Etika"
          content="Skrip video otomatis netral platform (dapat di-mirror ke Shopee Video, TikTok, dan Reels). Dilarang keras menyebut 'keranjang kuning' atau 'keranjang orange', serta wajib menggunakan ajakan bertindak netral seperti 'keranjang kiri bawah' atau 'keranjang bawah video ini'."
        />
      </div>

      {/* Action Buttons: Kembali & Buat Skrip */}
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
          onClick={onGenerate}
          disabled={disabled || isGenerating || !productBrief.name}
          className={`flex-1 min-h-[46px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            disabled || isGenerating || !productBrief.name
              ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200/80'
              : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-md hover:shadow-lg ring-4 ring-emerald-500/20'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Menulis {config.scriptCount} Skrip Siap Rekam...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>Buat {config.scriptCount} Skrip Siap Rekam ({config.durationSeconds}s)</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
