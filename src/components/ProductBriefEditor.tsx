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

  const renderSourceModeBadge = () => {
    if (brief.activeSourceMode === 'images') {
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-50 text-purple-800 border border-purple-200">
          Sumber Foto
        </span>
      );
    }
    if (brief.activeSourceMode === 'url') {
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200">
          Sumber Link
        </span>
      );
    }
    if (brief.activeSourceMode === 'text') {
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-800 border border-blue-200">
          Sumber Teks
        </span>
      );
    }
    if (brief.activeSourceMode === 'mixed') {
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          Campuran
        </span>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-3.5 sm:p-5 space-y-3.5">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
            2
          </div>
          <h2 className="text-sm sm:text-base font-bold text-zinc-900 flex items-center">
            <span>Product Brief Terverifikasi</span>
            <InfoTooltip
              title="Product Brief Terverifikasi"
              content="Informasi fakta produk yang berhasil dirangkum. Anda dapat menyunting nama, keunggulan, harga, maupun pantangan overclaim sebelum menyetujui brief untuk melangkah ke tahap berikutnya."
            />
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          {renderSourceModeBadge()}
        </div>
      </div>

      {/* Warning Banner if any */}
      {warning && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{warning}</span>
        </div>
      )}

      {/* Conflicts if any */}
      {brief.activeSourceMode === 'mixed' && conflicts && conflicts.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-300 text-xs space-y-2">
          <div className="flex items-start justify-between gap-2 text-amber-900 font-bold">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Perbedaan Klaim Antar-Sumber:
            </span>
            {onDismissConflict && (
              <button
                type="button"
                onClick={onDismissConflict}
                className="text-[11px] text-amber-700 hover:underline cursor-pointer"
              >
                Abaikan
              </button>
            )}
          </div>
          <ul className="list-disc list-inside space-y-1 text-zinc-700">
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

      {/* Form Content - Compact & Clean */}
      <div className="space-y-3">
        {/* Row 1: Nama Produk & Kategori */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-zinc-700 flex items-center">
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
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 flex items-center">
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
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Row 2: Deskripsi Ringkas */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-700 flex items-center">
            <span>Ringkasan Deskripsi</span>
            <InfoTooltip
              title="Ringkasan Deskripsi"
              content="Ringkasan fungsi utama dan keunikan produk secara objektif."
            />
          </label>
          <textarea
            rows={2}
            value={brief.description}
            onChange={(e) => handleTextChange('description', e.target.value)}
            placeholder="Deskripsi singkat produk..."
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed"
          />
        </div>

        {/* Row 3: Fitur & Manfaat (2 Kolom) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 flex items-center">
              <span>Fitur Produk (1 per baris)</span>
              <InfoTooltip
                title="Fitur Nyata Produk"
                content="Spesifikasi teknis atau fitur nyata (misal: baterai 2000mAh, 3 tingkat kecerahan, colokan USB-C)."
              />
            </label>
            <textarea
              rows={3}
              value={brief.features.join('\n')}
              onChange={(e) => handleArrayChange('features', e.target.value)}
              placeholder="3 mode terang&#10;Baterai tahan 8 jam&#10;Bisa dilipat"
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-[11px]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 flex items-center">
              <span>Manfaat Pengguna (1 per baris)</span>
              <InfoTooltip
                title="Manfaat Nyata Pengguna"
                content="Dampak langsung yang dirasakan pembeli (misal: mata tidak cepat lelah saat belajar malam, hemat listrik)."
              />
            </label>
            <textarea
              rows={3}
              value={brief.benefits.join('\n')}
              onChange={(e) => handleArrayChange('benefits', e.target.value)}
              placeholder="Mata tidak lelah saat begadang&#10;Hemat tempat di meja kost"
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-[11px]"
            />
          </div>
        </div>

        {/* Row 4: Target Audiens & Masalah */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 flex items-center">
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
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 flex items-center">
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
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Collapsible Section: Harga, Promo & Bukti Sosial */}
        <div className="border border-zinc-200 rounded-xl overflow-hidden">
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
            className="w-full flex items-center justify-between p-2.5 bg-zinc-50 hover:bg-zinc-100 transition-colors text-xs font-semibold text-zinc-800 cursor-pointer select-none"
          >
            <div className="flex items-center">
              <span>Data Harga & Promo (Opsional)</span>
              <InfoTooltip
                title="Data Harga & Promo"
                content="Hanya isi jika data harga atau promo resmi diketahui. Jangan mengarang angka agar skrip tetap mematuhi aturan etika."
              />
              {hasPricingData && (
                <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full font-semibold">
                  Terisi
                </span>
              )}
            </div>
            <div className="text-zinc-500">
              {isPricingOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>

          {isPricingOpen && (
            <div className="p-3 border-t border-zinc-200 bg-white grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-600 block">Harga Saat Ini</label>
                <input
                  type="text"
                  value={brief.currentPrice || ''}
                  onChange={(e) => handleTextChange('currentPrice', e.target.value)}
                  placeholder="Rp49.000"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-600 block">Harga Pembanding (Coret)</label>
                <input
                  type="text"
                  value={brief.referencePrice || ''}
                  onChange={(e) => handleTextChange('referencePrice', e.target.value)}
                  placeholder="Rp99.000"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-600 block">Detail Promo/Voucher</label>
                <input
                  type="text"
                  value={brief.promoDetails || ''}
                  onChange={(e) => handleTextChange('promoDetails', e.target.value)}
                  placeholder="Diskon 50% + Gratis Ongkir"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-600 block">Stok / Deadline Nyata</label>
                <input
                  type="text"
                  value={brief.stockOrDeadline || ''}
                  onChange={(e) => handleTextChange('stockOrDeadline', e.target.value)}
                  placeholder="Hanya s/d akhir bulan (jika valid)"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200"
                />
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Section: Pantangan Overclaim */}
        <div className="border border-rose-200 rounded-xl overflow-hidden bg-rose-50/20">
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
            className="w-full flex items-center justify-between p-2.5 bg-rose-50/50 hover:bg-rose-50 transition-colors text-xs font-semibold text-rose-900 cursor-pointer select-none"
          >
            <div className="flex items-center">
              <span>Batasan & Pantangan Overclaim (Opsional)</span>
              <InfoTooltip
                title="Batasan & Pantangan"
                content="Klaim yang dilarang disebut (misal: dilarang klaim medis atau anti-air). Skrip akan otomatis mematuhi aturan ini."
              />
              {hasRestrictionsData && (
                <span className="ml-2 text-[10px] bg-rose-100 text-rose-800 px-2 py-0.2 rounded-full font-semibold">
                  {brief.restrictions.length} pantangan
                </span>
              )}
            </div>
            <div className="text-rose-500">
              {isRestrictionsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>

          {isRestrictionsOpen && (
            <div className="p-3 border-t border-rose-200 bg-white">
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
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-rose-200 text-rose-950 placeholder:text-zinc-400"
              />
            </div>
          )}
        </div>
      </div>

      {/* Action Bar: Kembali & Tombol 'Setujui Brief' */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {onBackToSource && (
          <button
            type="button"
            onClick={onBackToSource}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ubah Sumber Info</span>
          </button>
        )}

        {onApprove && (
          <button
            type="button"
            onClick={onApprove}
            disabled={!brief.name}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              !brief.name
                ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200/80'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg ring-4 ring-emerald-500/25 active:scale-[0.99]'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Setujui Brief</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>
        )}
      </div>
    </div>
  );
};
