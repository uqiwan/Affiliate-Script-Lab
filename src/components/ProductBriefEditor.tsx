/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Check,
  FileText,
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

export const ProductBriefEditor: React.FC<ProductBriefEditorProps> = ({
  brief,
  onChange,
  conflicts = [],
  onDismissConflict,
  warning,
  onApprove,
  onBackToSource,
}) => {
  const [isPricingOpen, setIsPricingOpen] = useState<boolean>(false);
  const [isRestrictionsOpen, setIsRestrictionsOpen] = useState<boolean>(false);

  const hasPricingData = Boolean(
    brief.currentPrice ||
      brief.referencePrice ||
      brief.promoDetails ||
      brief.stockOrDeadline ||
      brief.socialProof
  );
  const hasRestrictionsData = Boolean(brief.restrictions && brief.restrictions.length > 0);

  const handleTextChange = (field: keyof ProductBrief, value: string) => {
    onChange({
      ...brief,
      [field]: value,
    });
  };

  const handleArrayChange = (field: 'features' | 'benefits' | 'painPoints' | 'restrictions', raw: string) => {
    const arr = raw
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
    onChange({
      ...brief,
      [field]: arr,
    });
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-10">
      {/* Main White Card Container */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-zinc-200/80 dark:border-[#38383A] shadow-xs p-5 sm:p-6 space-y-4">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100 dark:border-[#2C2C2E]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[10px] bg-[#34C759]/10 text-[#34C759] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 tracking-tight">
                <span>Product Brief Terverifikasi</span>
                <InfoTooltip
                  title="Product Brief Terverifikasi"
                  content="Informasi fakta produk yang berhasil dirangkum. Anda dapat menyunting nama, keunggulan, harga, maupun pantangan overclaim sebelum menyetujui brief untuk melangkah ke tahap berikutnya."
                />
              </h2>
              <p className="text-[11px] text-zinc-400 dark:text-[#8E8E93] font-medium">Verifikasi data produk sebelum diproduksi jadi skrip</p>
            </div>
          </div>
        </div>

        {/* Warning Banner if any */}
        {warning && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{warning}</span>
          </div>
        )}

        {/* Conflicts if any */}
        {brief.activeSourceMode === 'mixed' && conflicts && conflicts.length > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/50 text-xs sm:text-sm space-y-2">
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

        {/* Form Content - Kotak Lebih Besar & Teks Lebih Terbaca Jelas */}
        <div className="space-y-4">
          {/* Row 1: Nama Produk & Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center">
                <span>Nama Produk *</span>
                <InfoTooltip
                  title="Nama Produk"
                  content="Nama produk yang akan disebut dalam skrip video. Pastikan ejaannya tepat."
                />
              </label>
              <input
                type="text"
                value={brief.name}
                onChange={(e) => handleTextChange('name', e.target.value)}
                placeholder="Contoh: Lampu Belajar Lipat LED Portable"
                className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/50 dark:bg-[#2C2C2E]/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] font-medium transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center">
                <span>Kategori</span>
                <InfoTooltip
                  title="Kategori Produk"
                  content="Kategori e-commerce yang relevan (misal: Elektronik, Skincare, Rumah Tangga)."
                />
              </label>
              <input
                type="text"
                value={brief.category}
                onChange={(e) => handleTextChange('category', e.target.value)}
                placeholder="Elektronik / Rumah Tangga"
                className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/50 dark:bg-[#2C2C2E]/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] transition-all"
              />
            </div>
          </div>

          {/* Row 2: Deskripsi Ringkas - Tinggi Mengikuti Teks */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center">
              <span>Ringkasan Deskripsi</span>
              <InfoTooltip
                title="Ringkasan Deskripsi"
                content="Ringkasan fungsi utama dan keunikan produk secara objektif."
              />
            </label>
            <textarea
              rows={Math.max(2, (brief.description || '').split('\n').length)}
              value={brief.description}
              onChange={(e) => handleTextChange('description', e.target.value)}
              placeholder="Deskripsi singkat produk..."
              className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/50 dark:bg-[#2C2C2E]/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] leading-relaxed resize-y transition-all"
            />
          </div>

          {/* Row 3: Fitur & Manfaat (2 Kolom) - Tinggi Mengikuti Teks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center">
                <span>Fitur Produk (1 per baris)</span>
                <InfoTooltip
                  title="Fitur Nyata Produk"
                  content="Spesifikasi teknis atau fitur nyata (misal: baterai 2000mAh, 3 tingkat kecerahan, colokan USB-C)."
                />
              </label>
              <textarea
                rows={Math.max(3, brief.features.length || 1)}
                value={brief.features.join('\n')}
                onChange={(e) => handleArrayChange('features', e.target.value)}
                placeholder="3 mode terang&#10;Baterai tahan 8 jam&#10;Bisa dilipat"
                className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/50 dark:bg-[#2C2C2E]/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] font-mono leading-relaxed resize-y transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center">
                <span>Manfaat Pengguna (1 per baris)</span>
                <InfoTooltip
                  title="Manfaat Nyata Pengguna"
                  content="Dampak langsung yang dirasakan pembeli (misal: mata tidak cepat lelah saat belajar malam, hemat listrik)."
                />
              </label>
              <textarea
                rows={Math.max(3, brief.benefits.length || 1)}
                value={brief.benefits.join('\n')}
                onChange={(e) => handleArrayChange('benefits', e.target.value)}
                placeholder="Mata tidak lelah saat begadang&#10;Hemat tempat di meja kost"
                className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/50 dark:bg-[#2C2C2E]/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] font-mono leading-relaxed resize-y transition-all"
              />
            </div>
          </div>

          {/* Row 4: Target Audiens & Masalah */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center">
                <span>Target Audiens</span>
                <InfoTooltip
                  title="Target Audiens"
                  content="Segmen pembeli yang paling cocok (misal: anak kost, pekerja WFH, ibu rumah tangga)."
                />
              </label>
              <input
                type="text"
                value={brief.audience}
                onChange={(e) => handleTextChange('audience', e.target.value)}
                placeholder="Contoh: Mahasiswa kost & pekerja WFH"
                className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/50 dark:bg-[#2C2C2E]/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center">
                <span>Masalah yang Diselesaikan</span>
                <InfoTooltip
                  title="Masalah yang Diselesaikan"
                  content="Masalah sehari-hari yang menjadi alasan orang butuh produk ini."
                />
              </label>
              <input
                type="text"
                value={brief.painPoints.join(', ')}
                onChange={(e) =>
                  onChange({
                    ...brief,
                    painPoints: e.target.value.split(',').map((p) => p.trim()).filter(Boolean),
                  })
                }
                placeholder="Contoh: Meja sempit, kamar kurang terang"
                className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/50 dark:bg-[#2C2C2E]/50 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 focus:border-[#007AFF] transition-all"
              />
            </div>
          </div>

          {/* Collapsible Section: Harga, Promo & Bukti Sosial */}
          <div className="border border-zinc-200 dark:border-[#38383A] rounded-xl overflow-hidden">
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
              className="w-full flex items-center justify-between p-3 bg-zinc-50 dark:bg-[#2C2C2E]/60 hover:bg-zinc-100 dark:hover:bg-[#2C2C2E] transition-colors text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer select-none"
            >
              <div className="flex items-center">
                <span>Data Harga & Promo (Opsional)</span>
                <InfoTooltip
                  title="Data Harga & Promo"
                  content="Hanya isi jika data harga atau promo resmi diketahui. Jangan mengarang angka agar skrip tetap mematuhi aturan etika."
                />
                {hasPricingData && (
                  <span className="ml-2 text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                    Terisi
                  </span>
                )}
              </div>
              <div className="text-zinc-500">
                {isPricingOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {isPricingOpen && (
              <div className="p-3.5 border-t border-zinc-200 dark:border-[#38383A] bg-white dark:bg-[#1C1C1E] grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block">Harga Saat Ini</label>
                  <input
                    type="text"
                    value={brief.currentPrice || ''}
                    onChange={(e) => handleTextChange('currentPrice', e.target.value)}
                    placeholder="Rp49.000"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/50 dark:bg-[#2C2C2E]/50 text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block">Harga Pembanding (Coret)</label>
                  <input
                    type="text"
                    value={brief.referencePrice || ''}
                    onChange={(e) => handleTextChange('referencePrice', e.target.value)}
                    placeholder="Rp99.000"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/50 dark:bg-[#2C2C2E]/50 text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block">Detail Promo/Voucher</label>
                  <input
                    type="text"
                    value={brief.promoDetails || ''}
                    onChange={(e) => handleTextChange('promoDetails', e.target.value)}
                    placeholder="Diskon 50% + Gratis Ongkir"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/50 dark:bg-[#2C2C2E]/50 text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block">Stok / Deadline Nyata</label>
                  <input
                    type="text"
                    value={brief.stockOrDeadline || ''}
                    onChange={(e) => handleTextChange('stockOrDeadline', e.target.value)}
                    placeholder="Hanya s/d akhir bulan (jika valid)"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-[#38383A] bg-zinc-50/50 dark:bg-[#2C2C2E]/50 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Collapsible Section: Pantangan Overclaim */}
          <div className="border border-rose-200 dark:border-rose-900/40 rounded-xl overflow-hidden bg-rose-50/20 dark:bg-rose-950/20">
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
              className="w-full flex items-center justify-between p-3 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-xs sm:text-sm font-semibold text-rose-900 dark:text-rose-200 cursor-pointer select-none"
            >
              <div className="flex items-center">
                <span>Batasan & Pantangan Overclaim (Opsional)</span>
                <InfoTooltip
                  title="Batasan & Pantangan"
                  content="Klaim yang dilarang disebut (misal: dilarang klaim medis atau anti-air). Skrip akan otomatis mematuhi aturan ini."
                />
                {hasRestrictionsData && (
                  <span className="ml-2 text-[10px] bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-full font-semibold">
                    {brief.restrictions.length} pantangan
                  </span>
                )}
              </div>
              <div className="text-rose-500">
                {isRestrictionsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {isRestrictionsOpen && (
              <div className="p-3.5 border-t border-rose-200 dark:border-rose-900/40 bg-white dark:bg-[#1C1C1E]">
                <input
                  type="text"
                  value={brief.restrictions?.join(', ') || ''}
                  onChange={(e) =>
                    onChange({
                      ...brief,
                      restrictions: e.target.value.split(',').map((r) => r.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Contoh: Jangan klaim anti-air, jangan jamin hasil instan..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 text-rose-950 dark:text-rose-200 placeholder:text-zinc-400"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar: Navigasi Kembali di luar kotak putih (Sama seperti Parameter Inti Skrip) */}
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
