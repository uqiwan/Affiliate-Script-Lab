/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ArrowLeft,
  FileText,
  Sparkles,
  Tag,
  ListPlus,
  ShieldAlert,
  Target,
  DollarSign,
  Info,
} from 'lucide-react';
import { ProductBrief } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface ProductBriefEditorProps {
  brief: ProductBrief;
  onChange: (updatedBrief: ProductBrief) => void;
  conflicts?: string[];
  onDismissConflict?: () => void;
  warning?: string;
  onApprove?: () => void;
  onBackToSource?: () => void;
}

/**
 * Auto-resizing textarea that expands dynamically to fit all text content.
 * Prevents text truncation and guarantees natural Space, Enter, and cursor behavior.
 */
interface AutoGrowTextareaProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  minRows?: number;
  id?: string;
}

const AutoGrowTextarea: React.FC<AutoGrowTextareaProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  minRows = 3,
  id,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const computedLineHeight = 22;
    const minHeight = minRows * computedLineHeight + 20;
    el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
  };

  useEffect(() => {
    resize();
  }, [value]);

  return (
    <textarea
      id={id}
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        resize();
      }}
      onKeyDown={(e) => {
        // Stop bubbling to prevent any parent hotkey listeners from catching Space/Enter
        e.stopPropagation();
      }}
      rows={minRows}
      placeholder={placeholder}
      className={`w-full transition-all duration-150 leading-relaxed overflow-hidden resize-none ${className}`}
    />
  );
};

export const ProductBriefEditor: React.FC<ProductBriefEditorProps> = ({
  brief,
  onChange,
  conflicts = [],
  onDismissConflict,
  warning,
  onBackToSource,
}) => {
  const [isPricingOpen, setIsPricingOpen] = useState<boolean>(() => {
    return Boolean(
      brief.currentPrice ||
        brief.referencePrice ||
        brief.promoDetails ||
        brief.stockOrDeadline ||
        brief.socialProof
    );
  });
  const [isRestrictionsOpen, setIsRestrictionsOpen] = useState<boolean>(() => {
    return Boolean(brief.restrictions && brief.restrictions.length > 0);
  });

  // Local draft states to ensure smooth, unhindered manual input (Space, Enter, indentations)
  const [name, setName] = useState<string>(brief.name || '');
  const [category, setCategory] = useState<string>(brief.category || '');
  const [description, setDescription] = useState<string>(brief.description || '');
  const [featuresText, setFeaturesText] = useState<string>(
    brief.features && brief.features.length > 0 ? brief.features.join('\n') : ''
  );
  const [benefitsText, setBenefitsText] = useState<string>(
    brief.benefits && brief.benefits.length > 0 ? brief.benefits.join('\n') : ''
  );
  const [audience, setAudience] = useState<string>(brief.audience || '');
  const [painPointsText, setPainPointsText] = useState<string>(
    brief.painPoints && brief.painPoints.length > 0 ? brief.painPoints.join('\n') : ''
  );
  const [currentPrice, setCurrentPrice] = useState<string>(brief.currentPrice || '');
  const [referencePrice, setReferencePrice] = useState<string>(brief.referencePrice || '');
  const [promoDetails, setPromoDetails] = useState<string>(brief.promoDetails || '');
  const [stockOrDeadline, setStockOrDeadline] = useState<string>(brief.stockOrDeadline || '');
  const [restrictionsText, setRestrictionsText] = useState<string>(
    brief.restrictions && brief.restrictions.length > 0 ? brief.restrictions.join('\n') : ''
  );

  // Track state signature to detect external syncs (e.g. from analysis) without overwriting user typing
  const syncSignatureRef = useRef<string>('');

  const computeBriefSignature = (b: ProductBrief) => {
    return [
      b.name || '',
      b.category || '',
      b.description || '',
      (b.features || []).join('\n'),
      (b.benefits || []).join('\n'),
      b.audience || '',
      (b.painPoints || []).join('\n'),
      b.currentPrice || '',
      b.referencePrice || '',
      b.promoDetails || '',
      b.stockOrDeadline || '',
      (b.restrictions || []).join('\n'),
    ].join('###');
  };

  useEffect(() => {
    const incomingSignature = computeBriefSignature(brief);
    if (incomingSignature !== syncSignatureRef.current) {
      syncSignatureRef.current = incomingSignature;
      setName(brief.name || '');
      setCategory(brief.category || '');
      setDescription(brief.description || '');
      setFeaturesText(brief.features && brief.features.length > 0 ? brief.features.join('\n') : '');
      setBenefitsText(brief.benefits && brief.benefits.length > 0 ? brief.benefits.join('\n') : '');
      setAudience(brief.audience || '');
      setPainPointsText(
        brief.painPoints && brief.painPoints.length > 0 ? brief.painPoints.join('\n') : ''
      );
      setCurrentPrice(brief.currentPrice || '');
      setReferencePrice(brief.referencePrice || '');
      setPromoDetails(brief.promoDetails || '');
      setStockOrDeadline(brief.stockOrDeadline || '');
      setRestrictionsText(
        brief.restrictions && brief.restrictions.length > 0 ? brief.restrictions.join('\n') : ''
      );

      if (
        brief.currentPrice ||
        brief.referencePrice ||
        brief.promoDetails ||
        brief.stockOrDeadline
      ) {
        setIsPricingOpen(true);
      }
      if (brief.restrictions && brief.restrictions.length > 0) {
        setIsRestrictionsOpen(true);
      }
    }
  }, [brief]);

  // Helper to parse line breaks while preserving user's manual items
  const parseLines = (raw: string): string[] => {
    return raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  };

  const handleUpdate = (updatedFields: Partial<ProductBrief>) => {
    const newBrief: ProductBrief = {
      ...brief,
      ...updatedFields,
    };
    syncSignatureRef.current = computeBriefSignature(newBrief);
    onChange(newBrief);
  };

  const hasPricingData = Boolean(
    currentPrice || referencePrice || promoDetails || stockOrDeadline
  );
  const hasRestrictionsData = Boolean(restrictionsText.trim().length > 0);

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-10">
      {/* Main White Card Container */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-zinc-200/80 dark:border-[#38383A] shadow-xs p-5 sm:p-6 space-y-5">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-[#2C2C2E]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#34C759]/10 text-[#34C759] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 tracking-tight">
                <span>Product Brief Terverifikasi</span>
                <InfoTooltip
                  title="Product Brief Terverifikasi"
                  content="Seluruh informasi fakta produk yang akan menjadi bahan skrip. Anda dapat mengedit, menambah, atau mengurangi teks secara bebas tanpa batasan."
                />
              </h2>
              <p className="text-xs text-zinc-500 dark:text-[#8E8E93] font-medium">
                Semua kolom dapat diedit manual sepenuhnya (tekan Enter untuk baris baru, spasi bebas)
              </p>
            </div>
          </div>
        </div>

        {/* Warning Banner if any */}
        {warning && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{warning}</span>
          </div>
        )}

        {/* Conflicts if any */}
        {brief.activeSourceMode === 'mixed' && conflicts && conflicts.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/50 text-xs sm:text-sm space-y-2">
            <div className="flex items-start justify-between gap-2 text-amber-900 dark:text-amber-200 font-bold">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                Perbedaan Klaim Antar-Sumber:
              </span>
              {onDismissConflict && (
                <button
                  type="button"
                  onClick={onDismissConflict}
                  className="text-xs text-amber-700 dark:text-amber-300 hover:underline cursor-pointer"
                >
                  Abaikan
                </button>
              )}
            </div>
            <ul className="list-disc list-inside space-y-1 text-zinc-700 dark:text-zinc-300">
              {conflicts.map((c: any, i: number) => {
                const text =
                  typeof c === 'string'
                    ? c
                    : typeof c === 'object' && c !== null
                    ? c.field && c.detail
                      ? `${c.field}: ${c.detail}`
                      : c.detail || c.conflict || c.description || c.message || JSON.stringify(c)
                    : String(c);
                return <li key={i}>{text}</li>;
              })}
            </ul>
          </div>
        )}

        {/* Form Content - Flexible, Dynamic Heights & Unrestricted Manual Editing */}
        <div className="space-y-4">
          {/* Row 1: Nama Produk & Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#007AFF]" />
                  <span>Nama Produk *</span>
                  <InfoTooltip
                    title="Nama Produk"
                    content="Nama produk yang akan diucapkan dalam skrip video. Anda bisa mengubah atau melengkapinya secara bebas."
                  />
                </span>
                <span className="text-[11px] text-zinc-400 font-normal">Edit bebas</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  const val = e.target.value;
                  setName(val);
                  handleUpdate({ name: val });
                }}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Contoh: Lampu Belajar Lipat LED Portable"
                className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/60 dark:bg-[#2C2C2E]/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF] font-medium transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>Kategori</span>
                  <InfoTooltip
                    title="Kategori Produk"
                    content="Kategori produk (misal: Elektronik, Rumah Tangga, Skincare, Fashion)."
                  />
                </span>
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => {
                  const val = e.target.value;
                  setCategory(val);
                  handleUpdate({ category: val });
                }}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Elektronik / Rumah Tangga"
                className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/60 dark:bg-[#2C2C2E]/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF] transition-all"
              />
            </div>
          </div>

          {/* Row 2: Deskripsi Ringkas - Tinggi Fleksibel Otomatis Sesuai Panjang Teks */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#5856D6]" />
                <span>Ringkasan Deskripsi Produk</span>
                <InfoTooltip
                  title="Ringkasan Deskripsi"
                  content="Deskripsi fungsional produk. Kolom ini otomatis menyesuaikan ketinggiannya dengan jumlah teks yang dimasukkan."
                />
              </label>
              <span className="text-[11px] text-zinc-400">Tinggi otomatis mengikuti teks</span>
            </div>
            <AutoGrowTextarea
              minRows={2}
              value={description}
              onChange={(val) => {
                setDescription(val);
                handleUpdate({ description: val });
              }}
              placeholder="Jelaskan deskripsi produk secara bebas dan lengkap..."
              className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/60 dark:bg-[#2C2C2E]/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF]"
            />
          </div>

          {/* Row 3: Fitur Produk & Manfaat Pengguna (2 Kolom Fleksibel, Enter & Spasi Bebas) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 flex flex-col">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <ListPlus className="w-3.5 h-3.5 text-[#007AFF]" />
                  <span>Fitur Produk (1 baris per fitur)</span>
                  <InfoTooltip
                    title="Fitur Nyata Produk"
                    content="Spesifikasi teknis atau keunggulan fisik (contoh: baterai 2000mAh, 3 mode terang, port USB Type-C). Tekan Enter untuk membuat baris fitur baru."
                  />
                </label>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {featuresText.split('\n').filter((l) => l.trim()).length} butir
                </span>
              </div>
              <AutoGrowTextarea
                minRows={4}
                value={featuresText}
                onChange={(val) => {
                  setFeaturesText(val);
                  handleUpdate({ features: parseLines(val) });
                }}
                placeholder="3 tingkat kecerahan&#10;Baterai tahan hingga 8 jam&#10;Desain lipat 180 derajat&#10;Bahan kokoh anti silau"
                className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/60 dark:bg-[#2C2C2E]/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF] font-mono"
              />
              <p className="text-[10px] text-zinc-400 mt-0.5">
                💡 Tekan <kbd className="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[9px]">Enter</kbd> untuk baris baru, spasi dan simbol dapat dimasukkan bebas.
              </p>
            </div>

            <div className="space-y-1.5 flex flex-col">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#34C759]" />
                  <span>Manfaat Pengguna (1 baris per manfaat)</span>
                  <InfoTooltip
                    title="Manfaat Nyata Pengguna"
                    content="Dampak positif yang dirasakan pembeli (contoh: mata tidak cepat lelah saat belajar malam, hemat tempat di meja sempit). Tekan Enter untuk baris baru."
                  />
                </label>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {benefitsText.split('\n').filter((l) => l.trim()).length} butir
                </span>
              </div>
              <AutoGrowTextarea
                minRows={4}
                value={benefitsText}
                onChange={(val) => {
                  setBenefitsText(val);
                  handleUpdate({ benefits: parseLines(val) });
                }}
                placeholder="Mata tidak cepat lelah saat belajar malam&#10;Hemat tempat di meja kost sempit&#10;Praktis dibawa bepergian tanpa kabel"
                className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/60 dark:bg-[#2C2C2E]/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF] font-mono"
              />
              <p className="text-[10px] text-zinc-400 mt-0.5">
                💡 Tekan <kbd className="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[9px]">Enter</kbd> untuk baris baru, spasi dan simbol dapat dimasukkan bebas.
              </p>
            </div>
          </div>

          {/* Row 4: Target Audiens & Masalah yang Diselesaikan (Fleksibel Multi-baris) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#FF9500]" />
                  <span>Target Audiens</span>
                  <InfoTooltip
                    title="Target Audiens"
                    content="Siapa pembeli ideal produk ini (contoh: Mahasiswa kost, pekerja WFH, ibu rumah tangga)."
                  />
                </span>
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => {
                  const val = e.target.value;
                  setAudience(val);
                  handleUpdate({ audience: val });
                }}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Contoh: Mahasiswa kost & pekerja WFH"
                className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/60 dark:bg-[#2C2C2E]/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#FF3B30]" />
                  <span>Masalah yang Diselesaikan</span>
                  <InfoTooltip
                    title="Masalah yang Diselesaikan"
                    content="Keluhan atau masalah yang dirasakan pembeli sebelum membeli produk ini. Bisa ditulis per baris atau dengan koma."
                  />
                </label>
                <span className="text-[11px] text-zinc-400">Enter / koma</span>
              </div>
              <AutoGrowTextarea
                minRows={2}
                value={painPointsText}
                onChange={(val) => {
                  setPainPointsText(val);
                  handleUpdate({
                    painPoints: val
                      .split(/[\n,]+/)
                      .map((p) => p.trim())
                      .filter(Boolean),
                  });
                }}
                placeholder="Contoh:&#10;Kamar kost remang-remang bikin pusing&#10;Meja sempit banyak kabel berseliweran"
                className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/60 dark:bg-[#2C2C2E]/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF]"
              />
            </div>
          </div>

          {/* Collapsible Section: Data Harga, Promo & Bukti Sosial */}
          <div className="border border-zinc-200 dark:border-[#38383A] rounded-2xl overflow-hidden shadow-2xs">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setIsPricingOpen(!isPricingOpen)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsPricingOpen(!isPricingOpen);
                }
              }}
              className="w-full flex items-center justify-between p-3.5 bg-zinc-50/80 dark:bg-[#2C2C2E]/60 hover:bg-zinc-100 dark:hover:bg-[#2C2C2E] transition-colors text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#34C759]" />
                <span>Data Harga, Promo & Stok (Opsional)</span>
                <InfoTooltip
                  title="Data Harga & Promo"
                  content="Isi hanya jika data harga atau promo resmi diketahui. Semua kolom dapat diedit manual."
                />
                {hasPricingData && (
                  <span className="ml-1 text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                    Terisi
                  </span>
                )}
              </div>
              <div className="text-zinc-500">
                {isPricingOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {isPricingOpen && (
              <div className="p-4 border-t border-zinc-200 dark:border-[#38383A] bg-white dark:bg-[#1C1C1E] grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                    Harga Saat Ini (Promo)
                  </label>
                  <input
                    type="text"
                    value={currentPrice}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCurrentPrice(val);
                      handleUpdate({ currentPrice: val });
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                    placeholder="Contoh: Rp49.000"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/60 dark:bg-[#2C2C2E]/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                    Harga Pembanding (Coret)
                  </label>
                  <input
                    type="text"
                    value={referencePrice}
                    onChange={(e) => {
                      const val = e.target.value;
                      setReferencePrice(val);
                      handleUpdate({ referencePrice: val });
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                    placeholder="Contoh: Rp99.000"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/60 dark:bg-[#2C2C2E]/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                    Detail Promo / Voucher Tambahan
                  </label>
                  <input
                    type="text"
                    value={promoDetails}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPromoDetails(val);
                      handleUpdate({ promoDetails: val });
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                    placeholder="Contoh: Diskon 50% + Gratis Ongkir Xtra"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/60 dark:bg-[#2C2C2E]/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                    Stok / Batas Waktu Promo Nyata
                  </label>
                  <input
                    type="text"
                    value={stockOrDeadline}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStockOrDeadline(val);
                      handleUpdate({ stockOrDeadline: val });
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                    placeholder="Contoh: Promo flash sale sampai pukul 24.00"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/60 dark:bg-[#2C2C2E]/60 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Collapsible Section: Batasan & Pantangan Overclaim (Flexible Auto-Grow Textarea) */}
          <div className="border border-rose-200 dark:border-rose-900/40 rounded-2xl overflow-hidden bg-rose-50/20 dark:bg-rose-950/20 shadow-2xs">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setIsRestrictionsOpen(!isRestrictionsOpen)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsRestrictionsOpen(!isRestrictionsOpen);
                }
              }}
              className="w-full flex items-center justify-between p-3.5 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-xs sm:text-sm font-semibold text-rose-900 dark:text-rose-200 cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Batasan & Pantangan Overclaim (Opsional)</span>
                <InfoTooltip
                  title="Batasan & Pantangan"
                  content="Klaim atau kata-kata yang dilarang disebut dalam video (misal: dilarang klaim anti-air, dilarang jamin hasil instan). Skrip AI akan mematuhi aturan ini secara otomatis."
                />
                {hasRestrictionsData && (
                  <span className="ml-1 text-[10px] bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-full font-semibold">
                    {restrictionsText.split('\n').filter((l) => l.trim()).length} pantangan
                  </span>
                )}
              </div>
              <div className="text-rose-500">
                {isRestrictionsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {isRestrictionsOpen && (
              <div className="p-4 border-t border-rose-200 dark:border-rose-900/40 bg-white dark:bg-[#1C1C1E] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-900 dark:text-rose-300">
                    Daftar Pantangan (1 per baris atau pisahkan koma)
                  </span>
                  <span className="text-[11px] text-zinc-400">Tinggi otomatis</span>
                </div>
                <AutoGrowTextarea
                  minRows={2}
                  value={restrictionsText}
                  onChange={(val) => {
                    setRestrictionsText(val);
                    handleUpdate({
                      restrictions: val
                        .split(/[\n,]+/)
                        .map((r) => r.trim())
                        .filter(Boolean),
                    });
                  }}
                  placeholder="Contoh:&#10;Jangan klaim lampu tahan air atau waterproof&#10;Jangan sebut merek kompetitor&#10;Jangan jamin baterai awet seumur hidup"
                  className="px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 text-rose-950 dark:text-rose-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar: Navigasi Kembali di luar kotak putih */}
      {onBackToSource && (
        <div className="pt-2 flex items-center justify-start">
          <button
            type="button"
            onClick={onBackToSource}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[12px] text-xs font-semibold text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white bg-[#E5E5EA]/70 dark:bg-[#2C2C2E] hover:bg-[#E5E5EA] transition-all cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ubah Sumber Info</span>
          </button>
        </div>
      )}
    </div>
  );
};
