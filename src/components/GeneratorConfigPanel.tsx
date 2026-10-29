/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
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
  Target,
  Flame,
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
  Rocket,
  X,
  PlusCircle,
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
import { DropdownSelect, DropdownOption } from './DropdownSelect';

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
/* 1. Definisi Gaya Narasi Lengkap Tanpa Potongan Teks                   */
/* ===================================================================== */
export interface StyleMeta {
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

export const STYLE_OPTIONS: StyleMeta[] = [
  {
    value: 'Natural conversational',
    labelId: 'Santai & Mengalir Alami',
    badge: 'Paling Disukai',
    desc: 'Ngobrol akrab seperti cerita ke teman dekat, tanpa kesan memaksa menjual.',
    icon: MessageCircle,
    colorBg: 'bg-blue-50 dark:bg-blue-950/40',
    colorText: 'text-blue-600 dark:text-blue-400',
    colorBorder: 'border-blue-200 dark:border-blue-800/50',
    colorActiveBg: 'bg-blue-600 text-white',
  },
  {
    value: 'Soft selling',
    labelId: 'Edukasi & Soft Selling Ramah',
    badge: 'Ramah Pembeli',
    desc: 'Fokus berbagi tips bermanfaat dan solusi masalah secara tulus.',
    icon: HeartHandshake,
    colorBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    colorText: 'text-emerald-600 dark:text-emerald-400',
    colorBorder: 'border-emerald-200 dark:border-emerald-800/50',
    colorActiveBg: 'bg-emerald-600 text-white',
  },
  {
    value: 'Persuasif langsung tetapi etis',
    labelId: 'Persuasif Langsung & Tegas',
    badge: 'Tinggi Konversi',
    desc: 'Langsung ke penawaran promo dan ajakan checkout yang meyakinkan.',
    icon: TrendingUp,
    colorBg: 'bg-amber-50 dark:bg-amber-950/40',
    colorText: 'text-amber-600 dark:text-amber-400',
    colorBorder: 'border-amber-200 dark:border-amber-800/50',
    colorActiveBg: 'bg-amber-600 text-white',
  },
  {
    value: 'Storytelling/pengalaman',
    labelId: 'Kisah Pribadi & Storytelling',
    badge: 'Sentuhan Emosi',
    desc: 'Bercerita masalah nyata yang pernah dialami hingga menemukan solusi produk.',
    icon: BookOpen,
    colorBg: 'bg-purple-50 dark:bg-purple-950/40',
    colorText: 'text-purple-600 dark:text-purple-400',
    colorBorder: 'border-purple-200 dark:border-purple-800/50',
    colorActiveBg: 'bg-purple-600 text-white',
  },
  {
    value: 'UGC review/demo',
    labelId: 'Review Jujur Kreator (UGC)',
    badge: 'Format Populer',
    desc: 'Gaya kreator unboxing paket dan mencoba produk apa adanya secara autentik.',
    icon: Sparkles,
    colorBg: 'bg-cyan-50 dark:bg-cyan-950/40',
    colorText: 'text-cyan-600 dark:text-cyan-400',
    colorBorder: 'border-cyan-200 dark:border-cyan-800/50',
    colorActiveBg: 'bg-cyan-600 text-white',
  },
  {
    value: 'Edukatif/tutorial',
    labelId: 'Tutorial & Langkah Praktis',
    badge: 'Banyak Disimpan',
    desc: 'Menjelaskan cara pakai step-by-step yang mudah ditiru penonton.',
    icon: GraduationCap,
    colorBg: 'bg-teal-50 dark:bg-teal-950/40',
    colorText: 'text-teal-600 dark:text-teal-400',
    colorBorder: 'border-teal-200 dark:border-teal-800/50',
    colorActiveBg: 'bg-teal-600 text-white',
  },
  {
    value: 'Humor ringan/relatable',
    labelId: 'Humor Ringan & Keseharian',
    badge: 'Menghibur',
    desc: 'Menyelipkan komedi ringan atau situasi kocak seputar masalah produk.',
    icon: Smile,
    colorBg: 'bg-yellow-50 dark:bg-yellow-950/40',
    colorText: 'text-yellow-600 dark:text-yellow-400',
    colorBorder: 'border-yellow-200 dark:border-yellow-800/50',
    colorActiveBg: 'bg-yellow-600 text-white',
  },
  {
    value: 'POV/rutinitas',
    labelId: 'POV Rutinitas Keseharian',
    badge: 'Gaya Hidup',
    desc: 'Sudut pandang kegiatan harian (anak kost, pekerja kantor, keluarga).',
    icon: Compass,
    colorBg: 'bg-pink-50 dark:bg-pink-950/40',
    colorText: 'text-pink-600 dark:text-pink-400',
    colorBorder: 'border-pink-200 dark:border-pink-800/50',
    colorActiveBg: 'bg-pink-600 text-white',
  },
  {
    value: 'Unboxing/first impression',
    labelId: 'Buka Paket & Kesan Pertama',
    badge: 'Visual Menarik',
    desc: 'Fokus pada sensasi unboxing, packing rapi, dan sentuhan material pertama.',
    icon: PackageCheck,
    colorBg: 'bg-rose-50 dark:bg-rose-950/40',
    colorText: 'text-rose-600 dark:text-rose-400',
    colorBorder: 'border-rose-200 dark:border-rose-800/50',
    colorActiveBg: 'bg-rose-600 text-white',
  },
  {
    value: 'Komparasi/value',
    labelId: 'Bandingkan Nilai & Hemat (Value)',
    badge: 'Bukti Hemat',
    desc: 'Menghitung hematnya belanja produk ini dibanding alternatif lain.',
    icon: Scale,
    colorBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    colorText: 'text-indigo-600 dark:text-indigo-400',
    colorBorder: 'border-indigo-200 dark:border-indigo-800/50',
    colorActiveBg: 'bg-indigo-600 text-white',
  },
];

/* ===================================================================== */
/* 2. Target Durasi Video                                                */
/* ===================================================================== */
/* ===================================================================== */
/* 2. Durasi Video (Dropdown Options)                                    */
/* ===================================================================== */
export const DURATION_DROPDOWN_OPTIONS: DropdownOption<ScriptDuration>[] = [
  {
    value: 20,
    label: '20 Detik',
    sublabel: '~45-55 kata • Hook cepat & padat untuk TikTok/Shorts',
    badge: 'Hook Cepat',
    icon: Timer,
  },
  {
    value: 30,
    label: '30 Detik',
    sublabel: '~65-80 kata • Standar ideal TikTok, Reels & Shorts',
    badge: 'Paling Populer',
    icon: Clock,
  },
  {
    value: 60,
    label: '60 Detik',
    sublabel: '~130-160 kata • Pembahasan edukasi, manfaat & demo',
    badge: 'Lengkap',
    icon: Clock,
  },
  {
    value: 90,
    label: '90 Detik',
    sublabel: '~200-240 kata • Storytelling & pembuktian review autentik',
    badge: 'Cerita & Bukti',
    icon: Timer,
  },
  {
    value: 120,
    label: '120 Detik',
    sublabel: '~280-320 kata • Ulasan mendalam & tutorial langkah demi langkah',
    badge: 'Mendalam',
    icon: Clock,
  },
];

/* ===================================================================== */
/* 3. Jumlah Variasi Skrip (Dropdown Options)                            */
/* ===================================================================== */
export const SCRIPT_COUNT_DROPDOWN_OPTIONS: DropdownOption<number>[] = [
  {
    value: 2,
    label: '2 Variasi Skrip',
    sublabel: '2 naskah konsep berbeda untuk A/B testing cepat',
    icon: Hash,
  },
  {
    value: 5,
    label: '5 Variasi Skrip',
    sublabel: '5 naskah konsep variatif dengan hook & sudut pandang berbeda',
    badge: 'Rekomendasi',
    icon: ListOrdered,
  },
  {
    value: 10,
    label: '10 Variasi Skrip',
    sublabel: '10 naskah konsep variatif untuk stok video harian',
    badge: 'Stok Konten',
    icon: Hash,
  },
  {
    value: 20,
    label: '20 Variasi Skrip',
    sublabel: '20 naskah konsep untuk kampanye affiliate berskala besar',
    icon: LayoutGrid,
  },
  {
    value: 30,
    label: '30 Variasi Skrip',
    sublabel: '30 naskah konsep lengkap untuk kalender konten sebulan penuh',
    badge: 'Maksimal',
    icon: Rocket,
  },
];

/* ===================================================================== */
/* 4. Target Audiens / Persona (Dropdown Options)                        */
/* ===================================================================== */
export const PERSONA_DROPDOWN_OPTIONS: DropdownOption<string>[] = [
  {
    value: 'Auto',
    label: 'Otomatis Sesuai Produk',
    sublabel: 'AI menganalisis profil dan demografi pembeli paling ideal',
    badge: 'Rekomendasi AI',
    icon: Sparkles,
  },
  {
    value: 'Mahasiswa/anak kost',
    label: 'Mahasiswa & Anak Kost',
    sublabel: 'Bahasa santai, ramah anggaran, praktis, dan anti-ribet',
    icon: GraduationCap,
  },
  {
    value: 'Pekerja kantor/Gen-Z',
    label: 'Pekerja Kantor & Gen-Z',
    sublabel: 'Relatable dengan dunia kerja, tren viral, dan efisiensi waktu',
    icon: UserIcon,
  },
  {
    value: 'Orang tua/rumah tangga',
    label: 'Keluarga & Rumah Tangga',
    sublabel: 'Kebutuhan harian rumah tangga, keamanan, dan manfaat keluarga',
    icon: Users,
  },
  {
    value: 'Profesional',
    label: 'Profesional Bisnis',
    sublabel: 'Fakta akurat, kredibilitas tinggi, dan solusi produktivitas',
    icon: Target,
  },
  {
    value: 'Pengguna pemula',
    label: 'Pemula & Pengguna Baru',
    sublabel: 'Penjelasan ramah, panduan mudah, tanpa istilah teknis rumit',
    icon: Smile,
  },
  {
    value: 'Custom',
    label: '+ Kustom Mandiri',
    sublabel: 'Tuliskan target audiens spesifik Anda sendiri',
    icon: PlusCircle,
  },
];

/* ===================================================================== */
/* 5. Intensitas Promosi (Dropdown Options)                              */
/* ===================================================================== */
export const INTENSITY_DROPDOWN_OPTIONS: DropdownOption<SellingIntensity>[] = [
  {
    value: 'Soft',
    label: 'Halus (Soft Selling)',
    sublabel: 'Fokus edukasi & rekomendasi tulus tanpa kesan memaksa menjual',
    badge: 'Edukasi',
    icon: Feather,
  },
  {
    value: 'Balanced',
    label: 'Seimbang (Standar)',
    sublabel: 'Kombinasi proporsional antara manfaat produk dan ajakan beli yang wajar',
    badge: 'Standar Ideal',
    icon: Scale,
  },
  {
    value: 'Direct',
    label: 'Tegas (Direct CTA)',
    sublabel: 'Menekankan promo spesial, diskon potongan harga, dan ajakan pesan sekarang',
    badge: 'Tinggi Konversi',
    icon: Megaphone,
  },
];

/* ===================================================================== */
/* 6. Hook 3 Detik Awal (Dropdown Options)                               */
/* ===================================================================== */
export const HOOK_DROPDOWN_OPTIONS: DropdownOption<HookType>[] = [
  { value: 'Auto', label: 'Otomatis (Paling Relevan)', sublabel: 'AI memilih hook pembuka 3 detik yang paling pas untuk produk', badge: 'Rekomendasi', icon: Sparkles },
  { value: 'Bold claim berbukti', label: 'Klaim Berani & Berbukti', sublabel: 'Klaim hasil menonjol yang terbukti untuk menarik atensi instan', badge: 'Perhatian Tinggi', icon: Flame },
  { value: 'Pain-point callout', label: 'Sorot Keluhan Audiens', sublabel: 'Menyentuh masalah dan keresahan utama yang dialami penonton', icon: Target },
  { value: 'Outcome-first', label: 'Hasil Akhir di Awal Video', sublabel: 'Langsung memperlihatkan kondisi akhir sebelum menjelaskan produk', icon: CheckCircle2 },
  { value: 'Question/information gap', label: 'Pertanyaan Rasa Ingin Tahu', sublabel: 'Membuka dengan teka-teki yang memancing penonton bertahan sampai akhir', icon: HelpCircle },
  { value: 'Myth-busting', label: 'Bongkar Mitos & Salah Kaprah', sublabel: 'Membongkar pemahaman keliru di pasar dan menawarkan solusi nyata', icon: Lightbulb },
];

/* ===================================================================== */
/* 7. Metode Demo Produk (Dropdown Options)                              */
/* ===================================================================== */
export const DEMO_DROPDOWN_OPTIONS: DropdownOption<DemoMethod>[] = [
  { value: 'Auto', label: 'Otomatis Sesuai Produk', sublabel: 'AI memilih teknik demonstrasi visual yang paling meyakinkan', badge: 'Rekomendasi', icon: Sparkles },
  { value: 'Real-time / side-by-side', label: 'Perbandingan Berdampingan', sublabel: 'Visual komparasi langsung dua produk atau kondisi secara simultan', icon: ArrowRightLeft },
  { value: 'Close-up / macro', label: 'Sorot Detail Jarak Dekat', sublabel: 'Sorot tekstur, jahitan, material, atau keaslian produk dari dekat', icon: ZoomIn },
  { value: 'Unboxing & first touch', label: 'Buka Kotak & Sentuhan Pertama', sublabel: 'Momen membuka paket pesanan dan memperlihatkan kelengkapannya', icon: PackageOpen },
  { value: 'Mini tutorial langkah demi langkah', label: 'Tutorial Langkah demi Langkah', sublabel: 'Cara pemakaian singkat yang mudah ditiru oleh penonton', icon: ListOrdered },
  { value: 'Day-in-the-life rutinitas', label: 'Dipakai di Keseharian', sublabel: 'Memperlihatkan produk dalam aktivitas rutinitas sehari-hari', icon: Sun },
  { value: 'Proof / test aman', label: 'Uji Bukti & Ketahanan Nyata', sublabel: 'Tes ketahanan, uji air, uji gesek, atau sertifikasi keamanan', icon: ShieldCheck },
  { value: 'Before-after dengan bukti nyata', label: 'Perubahan Sebelum vs Sesudah', sublabel: 'Transisi nyata perbedaan sebelum dan setelah memakai produk', icon: SplitSquareVertical },
];

/* ===================================================================== */
/* 8. Ajakan Bertindak / CTA (Dropdown Options)                          */
/* ===================================================================== */
export const CTA_DROPDOWN_OPTIONS: DropdownOption<CtaType>[] = [
  { value: 'Auto', label: 'Otomatis Sesuai Gaya Skrip', sublabel: 'AI menyesuaikan ajakan bertindak dengan intensitas dan gaya narasi', badge: 'Rekomendasi', icon: Sparkles },
  { value: 'Direct instruction (keranjang kiri bawah)', label: 'Arahkan ke Keranjang Kiri Bawah', sublabel: 'Instruksi langsung menekan ikon keranjang kuning/oranye untuk checkout', badge: 'TikTok & Shopee', icon: ShoppingBag },
  { value: 'Cek detail / pilihan variasi', label: 'Ajak Cek Etalase & Pilihan Variasi', sublabel: 'Mendorong penonton mengecek varian warna, ukuran, atau etalase', icon: Eye },
  { value: 'Soft CTA (simpan video ini)', label: 'Simpan & Bagikan Video', sublabel: 'Ajakan menyimpan video atau membagikannya ke teman yang membutuhkan', icon: Bookmark },
  { value: 'Price / value CTA', label: 'Sorot Nilai Hemat & Promo', sublabel: 'Menekankan promo potongan harga atau hemat ongkir hari ini', icon: Tag },
  { value: 'Scarcity (hanya jika stok valid)', label: 'Informasikan Stok Terbatas', sublabel: 'Menekankan sisa stok yang menipis secara etis dan faktual', icon: AlertCircle },
  { value: 'Deadline (hanya jika batas waktu valid)', label: 'Informasikan Batas Waktu Promo', sublabel: 'Mengingatkan batas waktu flash sale atau voucher diskon', icon: Calendar },
];

/* ===================================================================== */
/* 9. Kata Ganti / Pronouns (Dropdown Options)                           */
/* ===================================================================== */
export const PRONOUN_DROPDOWN_OPTIONS: DropdownOption<PronounType>[] = [
  {
    value: 'aku/saya',
    label: 'Aku / Saya',
    sublabel: 'Gaya personal, testimoni pengalaman, dan cerita akrab layaknya teman',
    badge: 'Personal',
    icon: UserIcon,
  },
  {
    value: 'kamu',
    label: 'Kamu / Kalian',
    sublabel: 'Menyapa penonton secara langsung seperti sedang berbincang tatap muka',
    badge: 'Interaktif',
    icon: Users,
  },
  {
    value: 'netral',
    label: 'Netral',
    sublabel: 'Fokus sepenuhnya pada spesifikasi dan keunggulan produk tanpa kata ganti',
    badge: 'Objektif',
    icon: UserMinus,
  },
];

/* ===================================================================== */
/* 10. Switch Bersih                                                     */
/* ===================================================================== */
interface MinimalSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  label?: string;
}

const MinimalSwitch: React.FC<MinimalSwitchProps> = ({
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
      className={`relative inline-flex items-center h-7 w-12 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
        checked ? 'bg-blue-600' : 'bg-slate-200 dark:bg-zinc-700'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-xs transform transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
};

const GeneratorConfigPanelComponent: React.FC<GeneratorConfigPanelProps> = ({
  config,
  onChange,
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
  const [isStyleSheetOpen, setIsStyleSheetOpen] = useState<boolean>(false);

  const isAuthLocked = !user || !hasApiKey;

  // Custom persona handling
  const standardPersonaValues = PERSONA_DROPDOWN_OPTIONS.map((p) => p.value);
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

  // Dynamic options for target persona reflecting custom input
  const currentPersonaOptions = React.useMemo(() => {
    return PERSONA_DROPDOWN_OPTIONS.map((opt) => {
      if (opt.value === 'Custom') {
        return {
          ...opt,
          label: customPersonaValue ? `Kustom: ${customPersonaValue}` : '+ Kustom Mandiri',
          sublabel: customPersonaValue ? 'Target audiens spesifik pilihan Anda' : 'Tuliskan target audiens spesifik Anda sendiri',
        };
      }
      return opt;
    });
  }, [customPersonaValue]);

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-10">
      {/* ========================================================= */}
      {/* 1. PARAMETER INTI SKRIP (Panel Putih Solid Bersih)        */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        {/* Section Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-900/40">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 tracking-tight">
                <span>Parameter Inti Skrip</span>
                <InfoTooltip
                  title="Parameter Inti Skrip"
                  content="Pilih durasi, jumlah variasi konsep, dan karakter pembawaan narasi untuk video Anda."
                />
              </h2>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Item 1: Durasi Video (Dropdown Konvensional Menghemat Ruang) */}
          <DropdownSelect<ScriptDuration>
            id="select-duration"
            label="Durasi Video"
            icon={Clock}
            value={config.durationSeconds}
            options={DURATION_DROPDOWN_OPTIONS}
            onChange={(val) => handleDurationSelect(val)}
            disabled={disabled}
            rightBadge={
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                {config.durationSeconds} Detik
              </span>
            }
          />

          {/* Item 2: Jumlah Variasi Skrip (Dropdown Konvensional Menghemat Ruang) */}
          <DropdownSelect<number>
            id="select-script-count"
            label="Jumlah Variasi Skrip"
            icon={Hash}
            value={config.scriptCount}
            options={SCRIPT_COUNT_DROPDOWN_OPTIONS}
            onChange={(val) => handleScriptCountChange(val)}
            disabled={disabled}
            rightBadge={
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                {config.scriptCount} Konsep
              </span>
            }
          />

          {/* Item 3: Gaya Narasi (Kartu Pratinjau Tunggal Rapi dengan Bottom Sheet) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Gaya Narasi</span>
                <InfoTooltip
                  title="Gaya Narasi"
                  content="Pilih karakter penyampaian audio dan video agar sesuai dengan citra produk."
                />
              </label>
            </div>

            {/* Single Compact Preview Card */}
            <div
              onClick={() => setIsStyleSheetOpen(true)}
              className="py-2.5 sm:py-3 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#1C1C1E] flex flex-col justify-center gap-1.5 shadow-2xs hover:border-blue-400 dark:hover:border-blue-500/60 transition-all cursor-pointer group select-none"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsStyleSheetOpen(true);
                }
              }}
            >
              {/* Baris 1: Ikon Kecil + Judul di sisi kiri, Tombol Ubah di tepi kanan */}
              <div className="flex items-center justify-between w-full gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <currentStyleMeta.icon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug whitespace-nowrap overflow-hidden text-ellipsis sm:whitespace-normal">
                    {currentStyleMeta.labelId}
                  </span>
                </div>

                {/* Tombol Ubah sejajar dengan judul di tepi kanan dengan background sedikit biru */}
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/70 dark:border-blue-900/50 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shrink-0">
                  <span>Ubah</span>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                </div>
              </div>

              {/* Baris 2: Deskripsi membentang penuh dari kiri ke kanan rapi dan mudah dibaca */}
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 font-medium leading-normal w-full text-left">
                {currentStyleMeta.desc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TARGET AUDIENS (Dropdown Konvensional Menghemat Ruang) */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="p-5 space-y-3">
          <DropdownSelect<string>
            id="select-target-persona"
            label="Target Audiens"
            icon={UserIcon}
            tooltip={
              <InfoTooltip
                title="Target Audiens"
                content="Pilih persona penonton yang dituju agar gaya bahasa dan contoh masalah relevan dengan kehidupan mereka."
              />
            }
            value={isCustomSelected ? 'Custom' : config.audiencePersona}
            options={currentPersonaOptions}
            onChange={(val) => {
              if (val === 'Custom') {
                onChange({ ...config, audiencePersona: customPersonaValue || 'Custom' });
              } else {
                onChange({ ...config, audiencePersona: val as AudiencePersona });
              }
            }}
            disabled={disabled}
          />

          {/* Custom Persona Input */}
          {isCustomSelected && (
            <div className="pt-1.5 animate-in fade-in duration-150">
              <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                Tuliskan Target Audiens Kustom:
              </label>
              <input
                type="text"
                value={customPersonaValue}
                onChange={(e) => {
                  setCustomPersonaValue(e.target.value);
                  onChange({ ...config, audiencePersona: e.target.value || 'Custom' });
                }}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Contoh: Ibu muda yang baru punya bayi, reseller pemula, dsb."
                className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#1C1C1E] border border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none transition-all shadow-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. PENGATURAN LANJUTAN (Panel Putih Solid Bersih)         */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        {/* Accordion Header */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-200/60 dark:border-purple-900/40">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Pengaturan Lanjutan
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400">
                Formula angle, intensitas jualan, hook, demo, dan CTA
              </div>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showAdvanced && (
          <div className="p-5 border-t border-slate-100 dark:border-zinc-800 space-y-5 animate-in fade-in duration-200">
            {/* 3.1 Pustaka Sudut Pandang (Angle) */}
            <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Formula Sudut Pandang (Angle)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAngleLibrary(!showAngleLibrary)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200/80 dark:border-blue-900/60"
                >
                  {showAngleLibrary ? 'Tutup Pustaka' : 'Buka 20 Formula Angle'}
                </button>
              </div>

              {showAngleLibrary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 bg-slate-50 dark:bg-zinc-850 rounded-xl border border-slate-200 dark:border-zinc-700">
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
                            : 'bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-white hover:bg-slate-50 border-slate-200 dark:border-zinc-700'
                        }`}
                      >
                        <div className="min-w-0 pr-1">
                          <div className={`font-bold ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                            {ang.label}
                          </div>
                          <div
                            className={`text-[11px] leading-relaxed mt-0.5 ${
                              isSelected ? 'text-blue-100 font-medium' : 'text-slate-500 dark:text-zinc-400'
                            }`}
                          >
                            {ang.description}
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 shrink-0 mt-0.5 ml-1 text-white stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3.2 Intensitas Promosi (Dropdown Konvensional Menghemat Ruang) */}
            <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
              <DropdownSelect<SellingIntensity>
                id="select-selling-intensity"
                label="Intensitas Promosi"
                icon={Scale}
                value={config.sellingIntensity}
                options={INTENSITY_DROPDOWN_OPTIONS}
                onChange={(val) => onChange({ ...config, sellingIntensity: val })}
                disabled={disabled}
              />
            </div>

            {/* 3.3 Hook Pembuka & Metode Demo (Panel Melayang Bawah Layar) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Hook Type */}
              <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                <DropdownSelect<HookType>
                  id="select-hook-type"
                  label="Tipe Hook Pembuka"
                  icon={Flame}
                  value={config.hookType}
                  options={HOOK_DROPDOWN_OPTIONS}
                  onChange={(val) => onChange({ ...config, hookType: val })}
                  disabled={disabled}
                />
              </div>

              {/* Demo Method */}
              <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                <DropdownSelect<DemoMethod>
                  id="select-demo-method"
                  label="Metode Demo Visual"
                  icon={Eye}
                  value={config.demoMethod}
                  options={DEMO_DROPDOWN_OPTIONS}
                  onChange={(val) => onChange({ ...config, demoMethod: val })}
                  disabled={disabled}
                />
              </div>
            </div>

            {/* 3.4 Ajakan Bertindak (CTA) & Kata Ganti (Panel Melayang Bawah Layar) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* CTA Type */}
              <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                <DropdownSelect<CtaType>
                  id="select-cta-type"
                  label="Ajakan Bertindak (CTA)"
                  icon={ShoppingBag}
                  value={config.ctaType}
                  options={CTA_DROPDOWN_OPTIONS}
                  onChange={(val) => onChange({ ...config, ctaType: val })}
                  disabled={disabled}
                />
              </div>

              {/* Kata Ganti (Dropdown Konvensional Menghemat Ruang) */}
              <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
                <DropdownSelect<PronounType>
                  id="select-pronouns"
                  label="Panggilan Kata Ganti"
                  icon={UserIcon}
                  value={config.pronouns}
                  options={PRONOUN_DROPDOWN_OPTIONS}
                  onChange={(val) => onChange({ ...config, pronouns: val })}
                  disabled={disabled}
                />
              </div>
            </div>

            {/* 3.5 Price Anchoring & Urgensi */}
            <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-teal-600" />
                <span>Strategi Harga Coret & Kuota Promo</span>
              </div>

              <div className="bg-white dark:bg-[#1C1C1E] rounded-xl border border-slate-200 dark:border-zinc-700 overflow-hidden divide-y divide-slate-100 dark:divide-zinc-800 shadow-2xs">
                {/* Switch 1: Price Anchoring */}
                <div className="p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        Perbandingan Harga Coret
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Sebutkan harga normal vs harga promo untuk menegaskan nilai hemat
                      </div>
                    </div>
                  </div>

                  <MinimalSwitch
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
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        Batas Waktu & Kuota Promo
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Dorong penonton checkout cepat jika promo memiliki kuota terbatas
                      </div>
                    </div>
                  </div>

                  <MinimalSwitch
                    checked={Boolean(config.urgencyEnabled)}
                    onChange={(checked) => onChange({ ...config, urgencyEnabled: checked })}
                    label="Urgensi & Batas Promo"
                  />
                </div>
              </div>
            </div>

            {/* 3.6 Instruksi Khusus */}
            <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
              <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Instruksi Khusus untuk AI (Opsional)</span>
              </label>
              <textarea
                rows={2}
                value={config.extraInstructions || ''}
                onChange={(e) => onChange({ ...config, extraInstructions: e.target.value })}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Contoh: Tekankan varian warna hitam matte, sebutkan gratis ongkir hari ini..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-700 focus:border-blue-600 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none transition-all resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Script Generator Protection Warning Box */}
      {isAuthLocked && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-xs flex items-start gap-3 shadow-xs">
          <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-white">
              Proteksi Generator Skrip Aktif
            </div>
            <p className="text-slate-600 dark:text-zinc-400 leading-relaxed text-[11px]">
              Harap masuk akun Google atau masukkan API Key Google AI Studio Anda terlebih dahulu untuk memulai pembuatan skrip.
            </p>
            <button
              type="button"
              onClick={onRequireAuthOrKey}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 active:scale-95 transition-all cursor-pointer shadow-xs"
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
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 transition-all cursor-pointer active:scale-95 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Brief Produk</span>
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. PANEL MELAYANG: DAFTAR PILIHAN GAYA NARASI (FLOATING)  */}
      {/* ========================================================= */}
      {isStyleSheetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pilih Gaya Narasi"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3.5 sm:p-6 pb-4 sm:pb-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsStyleSheetOpen(false);
            }
          }}
        >
          <div className="w-full sm:max-w-xl bg-white dark:bg-[#1C1C1E] rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200 text-slate-900 dark:text-white">

            {/* Sheet Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Pilih Gaya Narasi
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Pilih karakter pembawaan audio & video yang paling sesuai
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStyleSheetOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable List of 10 Styles - Zero Truncation */}
            <div className="p-4 overflow-y-auto space-y-2.5 flex-1 divide-y-0">
              {STYLE_OPTIONS.map((st) => {
                const isSelected = config.style === st.value;
                const IconComp = st.icon;
                return (
                  <button
                    key={st.value}
                    type="button"
                    onClick={() => {
                      onChange({ ...config, style: st.value });
                      setIsStyleSheetOpen(false);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer active:scale-[0.99] ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-[#1C1C1E] border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                        isSelected ? 'bg-white text-blue-600' : `${st.colorBg} ${st.colorText}`
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <span
                          className={`text-xs sm:text-sm font-bold leading-snug ${
                            isSelected ? 'text-white' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {st.labelId}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              isSelected
                                ? 'bg-white/20 text-white border border-white/30'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                            }`}
                          >
                            {st.badge}
                          </span>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-white text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                      </div>
                      <p
                        className={`text-xs mt-1 leading-relaxed ${
                          isSelected ? 'text-blue-100 font-medium' : 'text-slate-600 dark:text-zinc-400'
                        }`}
                      >
                        {st.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="px-5 py-3 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#1C1C1E] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsStyleSheetOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const GeneratorConfigPanel = React.memo(GeneratorConfigPanelComponent);
