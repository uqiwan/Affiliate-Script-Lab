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
  ArrowLeft,
  Lock,
  Sparkles,
  Sliders,
  Clock,
  User as UserIcon,
  MessageCircle,
  HeartHandshake,
  TrendingUp,
  BookOpen,
  GraduationCap,
  Smile,
  Compass,
  PackageCheck,
  Scale,
  Zap,
  Flame,
  Layers,
  Rocket,
  FileText,
  Briefcase,
  Home,
  Award,
  PlusCircle,
  Target,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ArrowRightLeft,
  ZoomIn,
  PackageOpen,
  ListOrdered,
  Sun,
  SplitSquareVertical,
  ShoppingBag,
  Eye,
  Bookmark,
  Tag,
  AlertCircle,
  Calendar,
  Users,
  UserMinus,
  SlidersHorizontal,
  Feather,
  Megaphone,
  Timer,
  Hash,
  LayoutGrid,
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

/* ===================================================================== */
/* 1. iOS-Style Delivery Style Configuration with Icons & Distinct Colors */
/* ===================================================================== */
interface StyleMeta {
  value: DeliveryStyle;
  labelId: string;
  badge: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  colorBg: string;
  colorText: string;
  colorBorder: string;
  colorActiveBg: string;
}

const STYLE_OPTIONS: StyleMeta[] = [
  {
    value: 'Natural conversational',
    labelId: 'Santai & Mengalir Alami',
    badge: 'Paling Disukai',
    desc: 'Ngobrol akrab seperti cerita ke teman dekat, tanpa terkesan menjual',
    icon: MessageCircle,
    colorBg: 'bg-blue-50 dark:bg-blue-950/30',
    colorText: 'text-blue-600 dark:text-blue-400',
    colorBorder: 'border-blue-200 dark:border-blue-800/40',
    colorActiveBg: 'bg-blue-600 text-white',
  },
  {
    value: 'Soft selling',
    labelId: 'Edukasi & Soft Selling Ramah',
    badge: 'Ramah Pembeli',
    desc: 'Fokus berbagi tips bermanfaat dan solusi masalah secara tulus',
    icon: HeartHandshake,
    colorBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    colorText: 'text-emerald-600 dark:text-emerald-400',
    colorBorder: 'border-emerald-200 dark:border-emerald-800/40',
    colorActiveBg: 'bg-emerald-600 text-white',
  },
  {
    value: 'Persuasif langsung tetapi etis',
    labelId: 'Persuasif Langsung & Tegas',
    badge: 'Tinggi Konversi',
    desc: 'Langsung ke penawaran promo dan ajakan checkout yang meyakinkan',
    icon: TrendingUp,
    colorBg: 'bg-amber-50 dark:bg-amber-950/30',
    colorText: 'text-amber-600 dark:text-amber-400',
    colorBorder: 'border-amber-200 dark:border-amber-800/40',
    colorActiveBg: 'bg-amber-600 text-white',
  },
  {
    value: 'Storytelling/pengalaman',
    labelId: 'Kisah Pribadi / Storytelling',
    badge: 'Sentuhan Emosi',
    desc: 'Bercerita masalah nyata yang pernah dialami hingga ketemu produk ini',
    icon: BookOpen,
    colorBg: 'bg-purple-50 dark:bg-purple-950/30',
    colorText: 'text-purple-600 dark:text-purple-400',
    colorBorder: 'border-purple-200 dark:border-purple-800/40',
    colorActiveBg: 'bg-purple-600 text-white',
  },
  {
    value: 'UGC review/demo',
    labelId: 'Review Jujur Kreator (UGC)',
    badge: 'Format Populer',
    desc: 'Gaya kreator unboxing paket dan mencoba produk apa adanya',
    icon: Sparkles,
    colorBg: 'bg-cyan-50 dark:bg-cyan-950/30',
    colorText: 'text-cyan-600 dark:text-cyan-400',
    colorBorder: 'border-cyan-200 dark:border-cyan-800/40',
    colorActiveBg: 'bg-cyan-600 text-white',
  },
  {
    value: 'Edukatif/tutorial',
    labelId: 'Tutorial & Tips Langkah Praktis',
    badge: 'Banyak Disimpan',
    desc: 'Menjelaskan cara pakai step-by-step yang mudah ditiru penonton',
    icon: GraduationCap,
    colorBg: 'bg-teal-50 dark:bg-teal-950/30',
    colorText: 'text-teal-600 dark:text-teal-400',
    colorBorder: 'border-teal-200 dark:border-teal-800/40',
    colorActiveBg: 'bg-teal-600 text-white',
  },
  {
    value: 'Humor ringan/relatable',
    labelId: 'Humor Ringan & Keseharian',
    badge: 'Menghibur',
    desc: 'Menyelipkan komedi ringan atau situasi kocak seputar masalah produk',
    icon: Smile,
    colorBg: 'bg-yellow-50 dark:bg-yellow-950/30',
    colorText: 'text-yellow-600 dark:text-yellow-400',
    colorBorder: 'border-yellow-200 dark:border-yellow-800/40',
    colorActiveBg: 'bg-yellow-600 text-white',
  },
  {
    value: 'POV/rutinitas',
    labelId: 'POV Rutinitas Keseharian',
    badge: 'Gaya Hidup',
    desc: 'Sudut pandang kegiatan harian (anak kost, pekerja kantor, bunda)',
    icon: Compass,
    colorBg: 'bg-pink-50 dark:bg-pink-950/30',
    colorText: 'text-pink-600 dark:text-pink-400',
    colorBorder: 'border-pink-200 dark:border-pink-800/40',
    colorActiveBg: 'bg-pink-600 text-white',
  },
  {
    value: 'Unboxing/first impression',
    labelId: 'Buka Paket & Kesan Pertama',
    badge: 'Visual Menarik',
    desc: 'Fokus pada sensasi unboxing, packing rapi, dan sentuhan material pertama',
    icon: PackageCheck,
    colorBg: 'bg-rose-50 dark:bg-rose-950/30',
    colorText: 'text-rose-600 dark:text-rose-400',
    colorBorder: 'border-rose-200 dark:border-rose-800/40',
    colorActiveBg: 'bg-rose-600 text-white',
  },
  {
    value: 'Komparasi/value',
    labelId: 'Bandingkan Nilai & Hemat (Value)',
    badge: 'Bukti Hemat',
    desc: 'Menghitung hematnya belanja produk ini dibanding alternatif lain',
    icon: Scale,
    colorBg: 'bg-indigo-50 dark:bg-indigo-950/30',
    colorText: 'text-indigo-600 dark:text-indigo-400',
    colorBorder: 'border-indigo-200 dark:border-indigo-800/40',
    colorActiveBg: 'bg-indigo-600 text-white',
  },
];

/* ===================================================================== */
/* 2. Target Durasi Video Configuration                                  */
/* ===================================================================== */
interface DurationMeta {
  duration: ScriptDuration;
  label: string;
  words: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  activeColor: string;
}

const DURATION_OPTIONS: DurationMeta[] = [
  {
    duration: 20,
    label: '20 Detik',
    words: '~45-55 kata',
    icon: Timer,
    color: 'text-amber-500',
    activeColor: 'bg-amber-500 text-white shadow-amber-500/25',
  },
  {
    duration: 30,
    label: '30 Detik',
    words: '~65-80 kata (Standar)',
    icon: Clock,
    color: 'text-blue-500',
    activeColor: 'bg-blue-600 text-white shadow-blue-500/25',
  },
  {
    duration: 60,
    label: '60 Detik',
    words: '~130-160 kata',
    icon: Clock,
    color: 'text-emerald-500',
    activeColor: 'bg-emerald-600 text-white shadow-emerald-500/25',
  },
  {
    duration: 90,
    label: '90 Detik',
    words: '~200-240 kata',
    icon: Timer,
    color: 'text-purple-500',
    activeColor: 'bg-purple-600 text-white shadow-purple-500/25',
  },
  {
    duration: 120,
    label: '120 Detik',
    words: '~280-320 kata',
    icon: Clock,
    color: 'text-indigo-500',
    activeColor: 'bg-indigo-600 text-white shadow-indigo-500/25',
  },
];

/* ===================================================================== */
/* 3. Jumlah Skrip Configuration                                         */
/* ===================================================================== */
interface ScriptCountMeta {
  count: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const SCRIPT_COUNT_OPTIONS: ScriptCountMeta[] = [
  { count: 2, label: '2 Skrip', icon: FileText, color: 'text-sky-500' },
  { count: 5, label: '5 Skrip', icon: ListOrdered, color: 'text-blue-600' },
  { count: 10, label: '10 Skrip', icon: Hash, color: 'text-amber-500' },
  { count: 20, label: '20 Skrip', icon: LayoutGrid, color: 'text-purple-600' },
  { count: 30, label: '30 Skrip', icon: Rocket, color: 'text-rose-600' },
];

/* ===================================================================== */
/* 4. Target Persona Configuration                                       */
/* ===================================================================== */
interface PersonaMeta {
  value: AudiencePersona;
  labelId: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  activeBg: string;
}

const PERSONA_OPTIONS: PersonaMeta[] = [
  {
    value: 'Auto',
    labelId: 'Otomatis (Sesuai Produk)',
    icon: Sparkles,
    color: 'text-blue-500',
    activeBg: 'bg-blue-600 text-white',
  },
  {
    value: 'Mahasiswa/anak kost',
    labelId: 'Mahasiswa & Anak Kost',
    icon: GraduationCap,
    color: 'text-emerald-500',
    activeBg: 'bg-emerald-600 text-white',
  },
  {
    value: 'Pekerja kantor/Gen-Z',
    labelId: 'Pekerja Kantor & Gen-Z',
    icon: Briefcase,
    color: 'text-indigo-500',
    activeBg: 'bg-indigo-600 text-white',
  },
  {
    value: 'Orang tua/rumah tangga',
    labelId: 'Keluarga & Rumah Tangga',
    icon: Home,
    color: 'text-amber-500',
    activeBg: 'bg-amber-600 text-white',
  },
  {
    value: 'Profesional',
    labelId: 'Profesional & Bisnis',
    icon: Award,
    color: 'text-purple-500',
    activeBg: 'bg-purple-600 text-white',
  },
  {
    value: 'Pengguna pemula',
    labelId: 'Pengguna Pemula (Awam)',
    icon: Smile,
    color: 'text-cyan-500',
    activeBg: 'bg-cyan-600 text-white',
  },
];

/* ===================================================================== */
/* 5. Intensitas Jualan Configuration                                    */
/* ===================================================================== */
interface IntensityMeta {
  value: SellingIntensity;
  labelId: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  activeBg: string;
}

const INTENSITY_OPTIONS_META: IntensityMeta[] = [
  {
    value: 'Soft',
    labelId: 'Halus (Soft Selling)',
    desc: 'Tidak memaksa, mengedepankan edukasi & sharing',
    icon: Feather,
    color: 'text-emerald-600',
    activeBg: 'bg-emerald-600 text-white',
  },
  {
    value: 'Balanced',
    labelId: 'Seimbang (Rekomendasi)',
    desc: 'Kombinasi pas antara manfaat dan ajakan beli',
    icon: Scale,
    color: 'text-blue-600',
    activeBg: 'bg-blue-600 text-white',
  },
  {
    value: 'Direct',
    labelId: 'Tegas & Langsung (Direct CTA)',
    desc: 'Menekankan promo spesial dan ajakan pesan sekarang',
    icon: Megaphone,
    color: 'text-amber-600',
    activeBg: 'bg-amber-600 text-white',
  },
];

/* ===================================================================== */
/* 6. Hook 3 Detik Awal Configuration                                    */
/* ===================================================================== */
interface HookMeta {
  value: HookType;
  labelId: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const HOOK_META_OPTIONS: HookMeta[] = [
  {
    value: 'Auto',
    labelId: 'Otomatis (Dipilihkan AI Terbaik)',
    icon: Sparkles,
    color: 'text-blue-500',
  },
  {
    value: 'Bold claim berbukti',
    labelId: 'Klaim Berani & Berbukti Nyata',
    icon: Flame,
    color: 'text-amber-500',
  },
  {
    value: 'Pain-point callout',
    labelId: 'Sorot Masalah & Keluhan Audiens',
    icon: Target,
    color: 'text-rose-500',
  },
  {
    value: 'Outcome-first',
    labelId: 'Tunjukkan Hasil Akhir di Awal Video',
    icon: CheckCircle2,
    color: 'text-emerald-500',
  },
  {
    value: 'Question/information gap',
    labelId: 'Pertanyaan Pemicu Rasa Ingin Tahu',
    icon: HelpCircle,
    color: 'text-indigo-500',
  },
  {
    value: 'Myth-busting',
    labelId: 'Bongkar Mitos & Salah Kaprah',
    icon: Lightbulb,
    color: 'text-yellow-500',
  },
];

/* ===================================================================== */
/* 7. Metode Demo Produk Configuration                                   */
/* ===================================================================== */
interface DemoMeta {
  value: DemoMethod;
  labelId: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const DEMO_META_OPTIONS: DemoMeta[] = [
  {
    value: 'Auto',
    labelId: 'Otomatis (Sesuai Produk)',
    icon: Sparkles,
    color: 'text-blue-500',
  },
  {
    value: 'Real-time / side-by-side',
    labelId: 'Bandingkan Berdampingan (Side-by-Side)',
    icon: ArrowRightLeft,
    color: 'text-indigo-500',
  },
  {
    value: 'Close-up / macro',
    labelId: 'Sorot Detail Jarak Dekat (Close-up Macro)',
    icon: ZoomIn,
    color: 'text-emerald-500',
  },
  {
    value: 'Unboxing & first touch',
    labelId: 'Buka Kotak & Sentuhan Pertama (Unboxing)',
    icon: PackageOpen,
    color: 'text-amber-500',
  },
  {
    value: 'Mini tutorial langkah demi langkah',
    labelId: 'Tutorial Praktis Langkah demi Langkah',
    icon: ListOrdered,
    color: 'text-purple-500',
  },
  {
    value: 'Day-in-the-life rutinitas',
    labelId: 'Dipakai di Keseharian (Day in the Life)',
    icon: Sun,
    color: 'text-orange-500',
  },
  {
    value: 'Proof / test aman',
    labelId: 'Uji Bukti & Tes Ketahanan Nyata',
    icon: ShieldCheck,
    color: 'text-teal-500',
  },
  {
    value: 'Before-after dengan bukti nyata',
    labelId: 'Perubahan Sebelum vs Sesudah (Before-After)',
    icon: SplitSquareVertical,
    color: 'text-rose-500',
  },
];

/* ===================================================================== */
/* 8. Ajakan Bertindak (CTA) Configuration                              */
/* ===================================================================== */
interface CtaMeta {
  value: CtaType;
  labelId: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const CTA_META_OPTIONS: CtaMeta[] = [
  {
    value: 'Auto',
    labelId: 'Otomatis (Menyesuaikan Gaya Skrip)',
    icon: Sparkles,
    color: 'text-blue-500',
  },
  {
    value: 'Direct instruction (keranjang kiri bawah)',
    labelId: 'Arahkan ke Keranjang Kuning / Kiri Bawah',
    icon: ShoppingBag,
    color: 'text-amber-500',
  },
  {
    value: 'Cek detail / pilihan variasi',
    labelId: 'Ajak Cek Etalase & Pilihan Variasi',
    icon: Eye,
    color: 'text-emerald-500',
  },
  {
    value: 'Soft CTA (simpan video ini)',
    labelId: 'Ajakan Santai (Simpan & Bagikan Video)',
    icon: Bookmark,
    color: 'text-indigo-500',
  },
  {
    value: 'Price / value CTA',
    labelId: 'Sorot Harga Promo & Nilai Hemat',
    icon: Tag,
    color: 'text-purple-500',
  },
  {
    value: 'Scarcity (hanya jika stok valid)',
    labelId: 'Informasikan Stok Terbatas (Jika Valid)',
    icon: AlertCircle,
    color: 'text-rose-500',
  },
  {
    value: 'Deadline (hanya jika batas waktu valid)',
    labelId: 'Informasikan Batas Waktu Promo (Jika Valid)',
    icon: Calendar,
    color: 'text-orange-500',
  },
];

/* ===================================================================== */
/* 9. Kata Ganti (Pronouns) Configuration                               */
/* ===================================================================== */
interface PronounMeta {
  value: PronounType;
  labelId: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const PRONOUN_META_OPTIONS: PronounMeta[] = [
  {
    value: 'aku/saya',
    labelId: 'Aku / Saya',
    desc: 'Personal & akrab dengan penonton',
    icon: UserIcon,
    color: 'text-blue-500',
  },
  {
    value: 'kamu',
    labelId: 'Kamu / Kalian',
    desc: 'Menyapa langsung penonton',
    icon: Users,
    color: 'text-indigo-500',
  },
  {
    value: 'netral',
    labelId: 'Netral',
    desc: 'Fokus pada produk tanpa sebutan diri',
    icon: UserMinus,
    color: 'text-zinc-500',
  },
];

/* ===================================================================== */
/* 10. Genuine iOS Animated Switch Component                             */
/* ===================================================================== */
interface IosAnimatedSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  label?: string;
}

const IosAnimatedSwitch: React.FC<IosAnimatedSwitchProps> = ({
  checked,
  onChange,
  id,
  label,
}) => {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center h-[32px] w-[54px] shrink-0 cursor-pointer rounded-full p-[2px] transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#34C759] active:scale-95 select-none ${
        checked ? 'bg-[#34C759]' : 'bg-[#E5E5EA] dark:bg-[#39393D]'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-[28px] w-[28px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.18),0_1px_2px_rgba(0,0,0,0.08)] transform transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          checked ? 'translate-x-[22px]' : 'translate-x-[0px]'
        }`}
      />
    </button>
  );
};

const GeneratorConfigPanelComponent: React.FC<GeneratorConfigPanelProps> = ({
  config,
  onChange,
  onGenerate,
  isGenerating,
  disabled,
  productBrief,
  onBackToBrief,
  user,
  hasApiKey,
  onRequireAuthOrKey,
}) => {
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [showAngleLibrary, setShowAngleLibrary] = useState<boolean>(false);
  const [showAllStyles, setShowAllStyles] = useState<boolean>(false);

  const isAuthLocked = !user || !hasApiKey;

  // Custom persona handling
  const standardPersonaValues = PERSONA_OPTIONS.map((p) => p.value);
  const isCustomSelected =
    config.audiencePersona === 'Custom' ||
    (!standardPersonaValues.includes(config.audiencePersona as AudiencePersona) &&
      Boolean(config.audiencePersona));

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

  // Find active style metadata
  const currentStyleMeta =
    STYLE_OPTIONS.find((s) => s.value === config.style) || STYLE_OPTIONS[0];

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-10">
      {/* ========================================================= */}
      {/* 1. KELOMPOK UTAMA (PARAMETER INTI SKRIP)                  */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        {/* Section Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 tracking-tight">
                <span>Parameter Inti Skrip</span>
                <InfoTooltip
                  title="Konfigurasi Generator"
                  content="Pilih durasi, jumlah variasi, dan gaya narasi untuk pembuatan skrip video pendek affiliate yang optimal."
                />
              </h2>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Item 1: Durasi Video */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Durasi Video</span>
              </label>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 tabular-nums">
                {config.durationSeconds} Detik
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {DURATION_OPTIONS.map((durOpt) => {
                const isSelected = config.durationSeconds === durOpt.duration;
                const IconComponent = durOpt.icon;
                return (
                  <button
                    key={durOpt.duration}
                    type="button"
                    onClick={() => handleDurationSelect(durOpt.duration)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-150 flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 border ${
                      isSelected
                        ? `${durOpt.activeColor} border-transparent shadow-xs`
                        : 'bg-slate-50 dark:bg-zinc-800/80 border-slate-200/80 dark:border-zinc-700/60 text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700/80'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <IconComponent
                        className={`w-4 h-4 ${isSelected ? 'text-white' : durOpt.color}`}
                      />
                      <span className="font-bold">{durOpt.label}</span>
                    </div>
                    <span
                      className={`text-[10px] ${
                        isSelected ? 'text-white/80' : 'text-slate-500 dark:text-zinc-400'
                      }`}
                    >
                      {durOpt.words.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Item 2: Jumlah Skrip */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Jumlah Skrip</span>
              </label>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                {config.scriptCount} Konsep
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-zinc-700/50">
              {SCRIPT_COUNT_OPTIONS.map((cnt) => {
                const isSelected = config.scriptCount === cnt.count;
                const IconComponent = cnt.icon;
                return (
                  <button
                    key={cnt.count}
                    type="button"
                    onClick={() => handleScriptCountChange(cnt.count)}
                    className={`py-2 px-1 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <IconComponent
                      className={`w-3.5 h-3.5 ${isSelected ? cnt.color : 'text-slate-400 dark:text-zinc-500'}`}
                    />
                    <span>{cnt.count} Skrip</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Item 3: Gaya Narasi */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Gaya Narasi</span>
                <InfoTooltip
                  title="Gaya Narasi"
                  content="Pilih karakter penyampaian audio/video untuk mempermudah identifikasi nuansa konten."
                />
              </label>
              <button
                type="button"
                onClick={() => setShowAllStyles(!showAllStyles)}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
              >
                {showAllStyles ? 'Tutup Pilihan' : 'Lihat Semua 10 Gaya'}
              </button>
            </div>

            {/* Featured Active Style Card */}
            <div
              className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 flex items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${currentStyleMeta.colorActiveBg}`}
                >
                  <currentStyleMeta.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {currentStyleMeta.labelId}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                      {currentStyleMeta.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">
                    {currentStyleMeta.desc}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAllStyles(!showAllStyles)}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-700 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-slate-50 border border-slate-200 dark:border-zinc-600 shadow-2xs shrink-0 cursor-pointer"
              >
                Ganti
              </button>
            </div>

            {/* Expandable 10-Style Grid */}
            {showAllStyles && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 animate-in fade-in duration-200">
                {STYLE_OPTIONS.map((st) => {
                  const isSelected = config.style === st.value;
                  const IconComp = st.icon;
                  return (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => {
                        onChange({ ...config, style: st.value });
                        setShowAllStyles(false);
                      }}
                      className={`text-left p-3 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer active:scale-[0.98] ${
                        isSelected
                          ? `bg-white dark:bg-[#1C1C1E] ring-2 ring-blue-600 border-transparent shadow-xs`
                          : `bg-slate-50 dark:bg-zinc-800/60 border-slate-200/80 dark:border-zinc-700/60 hover:bg-white dark:hover:bg-zinc-800`
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? st.colorActiveBg : `${st.colorBg} ${st.colorText}`
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {st.labelId}
                          </span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                          {st.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TARGET AUDIENS                                         */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Target Audiens
              </h3>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PERSONA_OPTIONS.map((p) => {
              const isSelected = config.audiencePersona === p.value && !isCustomSelected;
              const IconComp = p.icon;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => onChange({ ...config, audiencePersona: p.value })}
                  className={`p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 border active:scale-95 ${
                    isSelected
                      ? `${p.activeBg} border-transparent shadow-xs font-bold`
                      : 'bg-slate-50 dark:bg-zinc-800/80 border-slate-200/80 dark:border-zinc-700/60 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700'
                  }`}
                >
                  <IconComp
                    className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : p.color}`}
                  />
                  <span className="truncate">{p.labelId}</span>
                </button>
              );
            })}

            {/* Custom Persona Option */}
            <button
              type="button"
              onClick={() => {
                onChange({ ...config, audiencePersona: 'Custom' });
              }}
              className={`p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 border active:scale-95 ${
                isCustomSelected
                  ? 'bg-rose-600 text-white border-transparent shadow-xs font-bold'
                  : 'bg-slate-50 dark:bg-zinc-800/80 border-slate-200/80 dark:border-zinc-700/60 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700'
              }`}
            >
              <PlusCircle
                className={`w-4 h-4 shrink-0 ${isCustomSelected ? 'text-white' : 'text-rose-500'}`}
              />
              <span>+ Kustom Mandiri</span>
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
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Contoh: Pecinta tanaman hias, fotografer pemula, atlet gym..."
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:border-blue-600 focus:bg-white dark:focus:bg-[#1C1C1E] text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none transition-all"
              />
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. PENGATURAN LANJUTAN                                    */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        {/* Collapsible Accordion Header */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Pengaturan Lanjutan
              </div>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 border border-slate-200/80 dark:border-zinc-700">
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showAdvanced && (
          <div className="p-5 border-t border-slate-100 dark:border-zinc-800 space-y-6 animate-in fade-in duration-200">
            {/* 3.1 Pustaka 20 Formula Sudut Pandang (Angle) */}
            <div className="bg-slate-50/70 dark:bg-zinc-900/60 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold text-xs sm:text-sm">
                  <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Sudut Pandang (Angle)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAngleLibrary(!showAngleLibrary)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
                >
                  {showAngleLibrary ? 'Tutup Pustaka' : 'Buka 20 Pustaka Angle'}
                </button>
              </div>

              {showAngleLibrary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2.5 bg-white dark:bg-zinc-800/80 rounded-xl border border-slate-200 dark:border-zinc-700">
                  {CONTENT_ANGLES.map((ang) => {
                    const isSelected =
                      config.selectedAngles.includes(ang.label) ||
                      config.selectedAngles.includes(ang.name);

                    return (
                      <button
                        key={ang.id}
                        type="button"
                        onClick={() => toggleAngle(ang.label)}
                        className={`text-left p-2.5 rounded-lg text-xs transition-all flex items-start justify-between cursor-pointer border active:scale-95 ${
                          isSelected
                            ? 'bg-blue-600 text-white font-semibold border-transparent shadow-xs'
                            : 'bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-700 border-slate-200 dark:border-zinc-700'
                        }`}
                        title={ang.description}
                      >
                        <div className="min-w-0 pr-1">
                          <div className="font-bold truncate">{ang.label}</div>
                          <div
                            className={`text-[10px] line-clamp-1 ${
                              isSelected ? 'text-white/80' : 'text-slate-500 dark:text-zinc-400'
                            }`}
                          >
                            {ang.description}
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 shrink-0 mt-0.5 ml-1 text-white" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3.2 Intensitas Promosi */}
            <div className="bg-slate-50/70 dark:bg-zinc-900/60 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold text-xs sm:text-sm">
                  <Scale className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Intensitas Promosi</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {INTENSITY_OPTIONS_META.map((intOpt) => {
                  const isSelected = config.sellingIntensity === intOpt.value;
                  const IconComp = intOpt.icon;
                  return (
                    <button
                      key={intOpt.value}
                      type="button"
                      onClick={() => onChange({ ...config, sellingIntensity: intOpt.value })}
                      className={`p-3 rounded-xl text-xs font-semibold transition-all flex flex-col items-start gap-1 cursor-pointer border active:scale-95 ${
                        isSelected
                          ? `${intOpt.activeBg} border-transparent shadow-xs font-bold`
                          : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <IconComp
                          className={`w-4 h-4 ${isSelected ? 'text-white' : intOpt.color}`}
                        />
                        <span>{intOpt.labelId}</span>
                      </div>
                      <span
                        className={`text-[10px] text-left leading-tight ${
                          isSelected ? 'text-white/80' : 'text-slate-500 dark:text-zinc-400'
                        }`}
                      >
                        {intOpt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3.3 Hook Pembuka & Metode Demo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Hook Type */}
              <div className="bg-slate-50/70 dark:bg-zinc-900/60 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold text-xs sm:text-sm">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Tipe Hook Pembuka</span>
                </span>
                <div className="relative">
                  <select
                    value={config.hookType}
                    onChange={(e) => onChange({ ...config, hookType: e.target.value as HookType })}
                    className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none pr-10 focus:ring-2 focus:ring-blue-600/30"
                  >
                    {HOOK_META_OPTIONS.map((h) => (
                      <option key={h.value} value={h.value}>
                        {h.labelId}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Demo Method */}
              <div className="bg-slate-50/70 dark:bg-zinc-900/60 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 font-bold text-xs sm:text-sm">
                  <Eye className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Metode Demo Visual</span>
                </span>
                <div className="relative">
                  <select
                    value={config.demoMethod}
                    onChange={(e) =>
                      onChange({ ...config, demoMethod: e.target.value as DemoMethod })
                    }
                    className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none pr-10 focus:ring-2 focus:ring-blue-600/30"
                  >
                    {DEMO_META_OPTIONS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.labelId}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* 3.4 Ajakan Bertindak (CTA) & Kata Ganti */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* CTA Type */}
              <div className="bg-slate-50/70 dark:bg-zinc-900/60 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-xs sm:text-sm">
                  <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Ajakan Bertindak (CTA)</span>
                </span>
                <div className="relative">
                  <select
                    value={config.ctaType}
                    onChange={(e) => onChange({ ...config, ctaType: e.target.value as CtaType })}
                    className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none pr-10 focus:ring-2 focus:ring-blue-600/30"
                  >
                    {CTA_META_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.labelId}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Kata Ganti */}
              <div className="bg-slate-50/70 dark:bg-zinc-900/60 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 font-bold text-xs sm:text-sm">
                  <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Kata Ganti Kreator</span>
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {PRONOUN_META_OPTIONS.map((p) => {
                    const isSelected = config.pronouns === p.value;
                    const IconComp = p.icon;
                    return (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => onChange({ ...config, pronouns: p.value })}
                        className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer border active:scale-95 ${
                          isSelected
                            ? 'bg-blue-600 text-white border-transparent shadow-xs font-bold'
                            : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700'
                        }`}
                      >
                        <IconComp
                          className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : p.color}`}
                        />
                        <span>{p.labelId}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 3.5 Price Anchoring & Urgensi */}
            <div className="bg-slate-50/70 dark:bg-zinc-900/60 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-bold text-xs sm:text-sm">
                <Tag className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Perbandingan Harga & Batas Promo</span>
              </span>

              <div className="bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700 overflow-hidden divide-y divide-slate-100 dark:divide-zinc-700/60 shadow-xs">
                {/* Switch 1: Price Anchoring */}
                <div className="p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Perbandingan Harga Coret
                    </div>
                  </div>

                  <IosAnimatedSwitch
                    checked={Boolean(config.priceAnchoringEnabled)}
                    onChange={(checked) => onChange({ ...config, priceAnchoringEnabled: checked })}
                    label="Sorot Perbandingan Harga"
                  />
                </div>

                {/* Switch 2: Urgensi */}
                <div className="p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Batas Waktu & Kuota Promo
                    </div>
                  </div>

                  <IosAnimatedSwitch
                    checked={Boolean(config.urgencyEnabled)}
                    onChange={(checked) => onChange({ ...config, urgencyEnabled: checked })}
                    label="Urgensi & Batas Promo"
                  />
                </div>
              </div>
            </div>

            {/* 3.6 Instruksi Khusus */}
            <div className="bg-slate-50/70 dark:bg-zinc-900/60 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-bold text-xs sm:text-sm">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Instruksi Khusus AI</span>
              </span>
              <textarea
                rows={2}
                value={config.extraInstructions || ''}
                onChange={(e) => onChange({ ...config, extraInstructions: e.target.value })}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Contoh: Fokus pada varian warna sage green, sebutkan voucher gajian akhir bulan..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:border-blue-600 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none transition-all resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Script Generator Protection Warning Box */}
      {isAuthLocked && (
        <div className="p-4 bg-[#FF9500]/10 border border-[#FF9500]/30 rounded-[20px] text-xs flex items-start gap-3">
          <Lock className="w-4 h-4 text-[#FF9500] shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1.5">
            <div className="font-bold text-[#1C1C1E] dark:text-white">
              Proteksi Generator Skrip Aktif
            </div>
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
        <div className="pt-1 flex items-center justify-start">
          <button
            type="button"
            onClick={onBackToBrief}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[12px] text-xs font-semibold text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white bg-[#E5E5EA]/70 dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] transition-all cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Brief Produk</span>
          </button>
        </div>
      )}
    </div>
  );
};

export const GeneratorConfigPanel = React.memo(GeneratorConfigPanelComponent);
