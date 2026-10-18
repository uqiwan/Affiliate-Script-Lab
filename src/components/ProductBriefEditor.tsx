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
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import { ProductBrief, SourceType } from '../types';

interface ProductBriefEditorProps {
  brief: ProductBrief;
  onChange: (updatedBrief: ProductBrief) => void;
  conflicts?: string[];
  warning?: string;
}

export const ProductBriefEditor: React.FC<ProductBriefEditorProps> = ({
  brief,
  onChange,
  conflicts = [],
  warning,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const getSourceBadge = (fieldName: string) => {
    const src = brief.sources?.find((s) => s.field === fieldName)?.source || 'user';
    switch (src) {
      case 'image':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
            Terdeteksi dari gambar
          </span>
        );
      case 'url':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Diambil dari link
          </span>
        );
      case 'user':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            Dari input pengguna
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-500 border border-zinc-200">
            Belum diketahui
          </span>
        );
    }
  };

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
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
      {/* Header with toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-zinc-50/60 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
            <FileEdit className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-zinc-900">
                2. Product Brief Terverifikasi
              </h2>
              {brief.platform && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  {brief.platform.includes('Shopee') ? '🛍️' : brief.platform.includes('TikTok') ? '🎵' : '🔗'}{' '}
                  {brief.platform}
                </span>
              )}
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800">
                Bisa Diedit
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              {brief.name ? brief.name : 'Data fakta yang menjadi acuan pembuatan skrip'}
            </p>
          </div>
        </div>

        <div className="text-zinc-400">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Verified Link Success Notification Banner */}
      {brief.platform && brief.name && (
        <div className="mx-4 sm:mx-5 mb-3 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">
              Informasi Asli Berhasil Diambil dari Link {brief.platform}!
            </span>
            <p className="text-[11px] text-emerald-800 mt-0.5">
              Produk terdeteksi: <strong>{brief.name}</strong>. Data telah otomatis dipetakan ke field di bawah dan siap digunakan untuk membuat skrip.
            </p>
          </div>
        </div>
      )}

      {/* Warnings & Conflicts */}
      {warning && (
        <div className="mx-4 sm:mx-5 mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{warning}</span>
        </div>
      )}

      {conflicts && conflicts.length > 0 && (
        <div className="mx-4 sm:mx-5 mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
          <div className="flex items-center gap-1.5 font-bold mb-1">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            Konflik Fakta Terdeteksi Antar-Sumber:
          </div>
          <ul className="list-disc pl-5 space-y-0.5">
            {conflicts.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
          <p className="mt-1 text-[11px] text-rose-700">
            *Harap periksa dan koreksi data di bawah agar generator tidak bingung.
          </p>
        </div>
      )}

      {/* Collapsible Form Body */}
      {isOpen && (
        <div className="px-4 pb-5 sm:px-5 space-y-4 border-t border-zinc-100 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nama Produk */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
                <label>Nama Produk</label>
                {getSourceBadge('name')}
              </div>
              <input
                type="text"
                value={brief.name}
                onChange={(e) => handleTextChange('name', e.target.value)}
                placeholder="Contoh: Lampu Meja LED Lipat Multifungsi"
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Kategori */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
                <label>Kategori Produk</label>
                {getSourceBadge('category')}
              </div>
              <input
                type="text"
                value={brief.category}
                onChange={(e) => handleTextChange('category', e.target.value)}
                placeholder="Contoh: Perlengkapan Kamar / Elektronik"
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Deskripsi / Ringkasan */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
              <label>Ringkasan Produk</label>
              {getSourceBadge('description')}
            </div>
            <textarea
              rows={2}
              value={brief.description}
              onChange={(e) => handleTextChange('description', e.target.value)}
              placeholder="Deskripsi singkat produk..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Fitur & Manfaat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
                <label>Fitur Eksplisit (1 baris per fitur)</label>
                {getSourceBadge('features')}
              </div>
              <textarea
                rows={3}
                value={brief.features?.join('\n') || ''}
                onChange={(e) => handleArrayChange('features', e.target.value)}
                placeholder="Baterai 2000mAh&#10;3 mode warna lampu&#10;Port USB-C"
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
                <label>Manfaat Masuk Akal (1 baris per manfaat)</label>
                {getSourceBadge('benefits')}
              </div>
              <textarea
                rows={3}
                value={brief.benefits?.join('\n') || ''}
                onChange={(e) => handleArrayChange('benefits', e.target.value)}
                placeholder="Bisa dibawa traveling tanpa colokan&#10;Mata tidak cepat lelah saat belajar malam&#10;Hemat tempat di meja sempit"
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Target Audiens & Masalah */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 block">
                Target Audiens Utama
              </label>
              <input
                type="text"
                value={brief.audience}
                onChange={(e) => handleTextChange('audience', e.target.value)}
                placeholder="Contoh: Mahasiswa kost, pekerja WFH, pembaca buku malam"
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 block">
                Masalah / Kebutuhan yang Diselesaikan
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
                placeholder="Contoh: Lampu kamar terlalu silau, meja sempit, colokan jauh"
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Pricing & Promo details */}
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              <span>Data Harga & Promosi (Hanya isi bila valid)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-600 block">
                  Harga Saat Ini
                </label>
                <input
                  type="text"
                  value={brief.currentPrice || ''}
                  onChange={(e) => handleTextChange('currentPrice', e.target.value)}
                  placeholder="Rp49.000"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-600 block">
                  Harga Pembanding (Normal)
                </label>
                <input
                  type="text"
                  value={brief.referencePrice || ''}
                  onChange={(e) => handleTextChange('referencePrice', e.target.value)}
                  placeholder="Rp89.000"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-600 block">
                  Promo / Voucher / Gratis Ongkir
                </label>
                <input
                  type="text"
                  value={brief.promoDetails || ''}
                  onChange={(e) => handleTextChange('promoDetails', e.target.value)}
                  placeholder="Diskon 45% + Gratis Ongkir"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-600 block">
                  Stok Tersisa atau Batas Waktu Promo
                </label>
                <input
                  type="text"
                  value={brief.stockOrDeadline || ''}
                  onChange={(e) => handleTextChange('stockOrDeadline', e.target.value)}
                  placeholder="Hanya isi bila ada batas nyata (cth: Flash sale hari ini)"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-600 block">
                  Social Proof / Bukti Ulasan Nyata
                </label>
                <input
                  type="text"
                  value={brief.socialProof || ''}
                  onChange={(e) => handleTextChange('socialProof', e.target.value)}
                  placeholder="Hanya isi jika ada data ulasan nyata pembeli"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Batasan & Klaim Terlarang */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-800">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Batasan / Klaim yang Dilarang (Overclaim yang harus dihindari)</span>
            </div>
            <input
              type="text"
              value={brief.restrictions?.join(', ') || ''}
              onChange={(e) =>
                onChange({
                  ...brief,
                  restrictions: e.target.value.split(',').map((r) => r.trim()).filter(Boolean),
                })
              }
              placeholder="Contoh: Jangan klaim anti-air, jangan klaim garansi seumur hidup"
              className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200 bg-rose-50/30 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-rose-900"
            />
          </div>
        </div>
      )}
    </div>
  );
};
