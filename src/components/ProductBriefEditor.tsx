/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileEdit,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Tag,
  CheckCircle,
  ShieldAlert,
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
  const [isOpen, setIsOpen] = useState<boolean>(true);
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

  // Determine active mode badge
  const renderSourceModeBadge = () => {
    if (brief.activeSourceMode === 'images') {
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-50 text-purple-800 border border-purple-200">
          Foto Produk Saja
        </span>
      );
    }
    if (brief.activeSourceMode === 'url') {
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200">
          Link E-Commerce Saja
        </span>
      );
    }
    if (brief.activeSourceMode === 'text') {
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-800 border border-blue-200">
          Deskripsi Teks Saja
        </span>
      );
    }
    if (brief.activeSourceMode === 'mixed') {
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          Campuran Terpadu
        </span>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-4 sm:p-5 space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
            2
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 flex items-center gap-1.5">
              <span>Product Brief Terverifikasi</span>
              <InfoTooltip
                title="Product Brief Terverifikasi"
                content="Data fakta produk yang diekstrak oleh AI. Anda dapat menyunting nama, keunggulan, harga, maupun batas klaim sebelum menyetujui brief untuk melangkah ke pembuatan skrip."
              />
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {renderSourceModeBadge()}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-500 cursor-pointer"
            title={isOpen ? 'Ciutkan Panel' : 'Buka Panel'}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Warning / Notes Banner if any */}
      {warning && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{warning}</span>
        </div>
      )}

      {/* Cross-Source Conflict Clarification (Only shown in mixed mode if conflicts exist) */}
      {brief.activeSourceMode === 'mixed' && conflicts && conflicts.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-300 text-xs space-y-2">
          <div className="flex items-start justify-between gap-2 text-amber-900 font-bold">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Perbedaan Klaim Antar-Sumber Terdeteksi:
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
          <ul className="list-disc pl-5 space-y-1 text-amber-800 text-[11px]">
            {conflicts.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {isOpen && (
        <div className="space-y-3.5">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nama Produk */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 block">
                Nama Produk *
              </label>
              <input
                type="text"
                value={brief.name}
                onChange={(e) => handleTextChange('name', e.target.value)}
                placeholder="Nama resmi produk..."
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-zinc-900"
              />
            </div>

            {/* Kategori Produk */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 block">
                Kategori
              </label>
              <input
                type="text"
                value={brief.category}
                onChange={(e) => handleTextChange('category', e.target.value)}
                placeholder="Elektronik, Skincare, Rumah Tangga..."
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900"
              />
            </div>
          </div>

          {/* Ringkasan Produk */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 block">
              Ringkasan Deskripsi
            </label>
            <textarea
              rows={2}
              value={brief.description}
              onChange={(e) => handleTextChange('description', e.target.value)}
              placeholder="Deskripsi singkat produk..."
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900"
            />
          </div>

          {/* 2-Column: Fitur & Manfaat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 block">
                Fitur Utama (1 baris/fitur)
              </label>
              <textarea
                rows={3}
                value={brief.features?.join('\n') || ''}
                onChange={(e) => handleArrayChange('features', e.target.value)}
                placeholder="Contoh: Baterai 2000mAh tahan 8 jam..."
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 block">
                Manfaat untuk Pembeli (1 baris/poin)
              </label>
              <textarea
                rows={3}
                value={brief.benefits?.join('\n') || ''}
                onChange={(e) => handleArrayChange('benefits', e.target.value)}
                placeholder="Contoh: Belajar malam tanpa silau..."
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 leading-relaxed"
              />
            </div>
          </div>

          {/* Audiens & Pain Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 block">
                Target Pengguna
              </label>
              <input
                type="text"
                value={brief.audience || ''}
                onChange={(e) => handleTextChange('audience', e.target.value)}
                placeholder="Anak kost, pekerja WFH, ibu rumah tangga..."
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 text-zinc-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 block">
                Masalah yang Diselesaikan
              </label>
              <input
                type="text"
                value={brief.painPoints?.join(', ') || ''}
                onChange={(e) =>
                  onChange({
                    ...brief,
                    painPoints: e.target.value.split(',').map((p) => p.trim()).filter(Boolean),
                  })
                }
                placeholder="Meja sempit, lampu redup, ribet kabel..."
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 text-zinc-900"
              />
            </div>
          </div>

          {/* ========================================================= */}
          {/* MENU HARGA & PROMOSI (Bisa Dikecilkan / Collapsible)       */}
          {/* Default: Tertutup, Submenu Simetris & Singkat               */}
          {/* ========================================================= */}
          <div className="rounded-xl border border-zinc-200/90 bg-zinc-50/50 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsPricingOpen(!isPricingOpen)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-zinc-100/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-bold text-zinc-800">
                  Data Harga & Promosi
                </span>
                <InfoTooltip
                  title="Data Harga & Promosi"
                  content="Isi hanya jika data valid atau tercantum di produk. Jika dikosongkan, AI tidak akan mengarang harga agar video aman ditonton kapan saja."
                />
                {hasPricingData && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full font-semibold">
                    Terisi
                  </span>
                )}
              </div>
              <div className="text-zinc-400">
                {isPricingOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 text-zinc-600" />}
              </div>
            </button>

            {isPricingOpen && (
              <div className="p-3.5 pt-1 border-t border-zinc-200/60 mt-1">
                {/* Symmetrical Grid: 2 columns on mobile, 3 on sm */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 block">
                      Harga Normal
                    </label>
                    <input
                      type="text"
                      value={brief.referencePrice || ''}
                      onChange={(e) => handleTextChange('referencePrice', e.target.value)}
                      placeholder="Cth: Rp89.000"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 block">
                      Harga Coret
                    </label>
                    <input
                      type="text"
                      value={brief.currentPrice || ''}
                      onChange={(e) => handleTextChange('currentPrice', e.target.value)}
                      placeholder="Cth: Rp49.000"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium text-emerald-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 block">
                      Diskon
                    </label>
                    <input
                      type="text"
                      value={brief.promoDetails || ''}
                      onChange={(e) => handleTextChange('promoDetails', e.target.value)}
                      placeholder="Cth: Hemat 45%"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-zinc-600 block">
                      Sisa Stok
                    </label>
                    <input
                      type="text"
                      value={brief.stockOrDeadline || ''}
                      onChange={(e) => handleTextChange('stockOrDeadline', e.target.value)}
                      placeholder="Cth: Sisa 20 unit"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1 col-span-2 sm:col-span-2">
                    <label className="text-[11px] font-semibold text-zinc-600 block">
                      Ulasan Nyata
                    </label>
                    <input
                      type="text"
                      value={brief.socialProof || ''}
                      onChange={(e) => handleTextChange('socialProof', e.target.value)}
                      placeholder="Cth: Rating 4.9 dari 1.2k pembeli"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* MENU BATASAN / KLAIM TERLARANG (Bisa Dikecilkan)           */}
          {/* Default: Tertutup, Sederhana & Rapi                        */}
          {/* ========================================================= */}
          <div className="rounded-xl border border-rose-200/90 bg-rose-50/20 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsRestrictionsOpen(!isRestrictionsOpen)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-rose-50/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span className="text-xs font-bold text-rose-900">
                  Batasan & Klaim Terlarang
                </span>
                <InfoTooltip
                  title="Batasan & Pantangan Overclaim"
                  content="Poin klaim yang dilarang disebut (misalnya: dilarang klaim tahan air, dilarang klaim medis, atau tanpa garansi seumur hidup). Skrip video akan otomatis patuh dan menghindarinya."
                />
                {hasRestrictionsData && (
                  <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.2 rounded-full font-semibold">
                    {brief.restrictions.length} pantangan
                  </span>
                )}
              </div>
              <div className="text-rose-500">
                {isRestrictionsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {isRestrictionsOpen && (
              <div className="p-3.5 pt-1 border-t border-rose-100/80 mt-1 space-y-1.5">
                <label className="text-[11px] font-medium text-rose-900 block">
                  Pantangan Overclaim (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={brief.restrictions?.join(', ') || ''}
                  onChange={(e) =>
                    onChange({
                      ...brief,
                      restrictions: e.target.value.split(',').map((r) => r.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Contoh: Jangan klaim anti-air, jangan klaim obat medis"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-rose-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-rose-950 placeholder:text-zinc-400"
                />
              </div>
            )}
          </div>

          {/* Action Bar: Setujui Brief & Navigasi */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {onBackToSource && (
              <button
                type="button"
                onClick={onBackToSource}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer"
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
                    ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg ring-2 ring-emerald-500/30'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Setujui Brief & Lanjut ke Pengaturan</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
