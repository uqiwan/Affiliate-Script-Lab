/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Link as LinkIcon,
  FileText,
  Layers,
  Upload,
  X,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

export type InputMode = 'images' | 'url' | 'text' | 'mixed';

export interface UploadedImageFile {
  name: string;
  mimeType: string;
  base64Data: string;
  size: number;
  previewUrl: string;
}

interface InputPanelProps {
  onAnalyze: (data: {
    inputMode: InputMode;
    textDescription?: string;
    productUrl?: string;
    images?: Array<{ name: string; mimeType: string; base64Data: string; size: number }>;
  }) => void;
  isAnalyzing: boolean;
  disabled?: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  onAnalyze,
  isAnalyzing,
  disabled = false,
}) => {
  const [activeTab, setActiveTab] = useState<InputMode>('images');
  const [textDescription, setTextDescription] = useState<string>('');
  const [productUrl, setProductUrl] = useState<string>('');
  const [images, setImages] = useState<UploadedImageFile[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mixedFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    processFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const processFiles = (files: File[]) => {
    setErrorMessage(null);
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (images.length + files.length > 5) {
      setErrorMessage('Maksimal 5 gambar produk yang dapat diunggah.');
      return;
    }

    let currentTotalSize = images.reduce((acc, curr) => acc + curr.size, 0);

    for (const file of files) {
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setErrorMessage(`Format file "${file.name}" tidak didukung. Harap gunakan JPG, PNG, atau WEBP.`);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage(`File "${file.name}" melebihi batas 10 MB per gambar.`);
        return;
      }

      currentTotalSize += file.size;
      if (currentTotalSize > 20 * 1024 * 1024) {
        setErrorMessage('Total ukuran seluruh gambar melebihi batas 20 MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          const base64Data = result.split(',')[1] || '';
          const newImg: UploadedImageFile = {
            name: file.name,
            mimeType: file.type,
            base64Data,
            size: file.size,
            previewUrl: result,
          };
          setImages((prev) => [...prev, newImg]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled || isAnalyzing) return;
    if (e.dataTransfer.files) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Handler strictly enforcing source isolation per tab
  const handleAnalyzeFromCurrentTab = (mode: InputMode) => {
    setErrorMessage(null);

    // 1. TAB FOTO: Hanya kirim foto, buang text & url
    if (mode === 'images') {
      if (images.length === 0) {
        setErrorMessage('Harap unggah minimal 1 foto produk sebelum menganalisis.');
        return;
      }
      onAnalyze({
        inputMode: 'images',
        images: images.map((img) => ({
          name: img.name,
          mimeType: img.mimeType,
          base64Data: img.base64Data,
          size: img.size,
        })),
        productUrl: undefined,
        textDescription: undefined,
      });
      return;
    }

    // 2. TAB LINK: Hanya kirim URL, buang images & text
    if (mode === 'url') {
      const trimmedUrl = productUrl.trim();
      if (!trimmedUrl) {
        setErrorMessage('Harap masukkan tautan link produk e-commerce sebelum menganalisis.');
        return;
      }
      onAnalyze({
        inputMode: 'url',
        productUrl: trimmedUrl,
        images: undefined,
        textDescription: undefined,
      });
      return;
    }

    // 3. TAB TEKS: Hanya kirim teks, buang images & url
    if (mode === 'text') {
      const trimmedText = textDescription.trim();
      if (!trimmedText) {
        setErrorMessage('Harap isi deskripsi atau catatan produk sebelum menganalisis.');
        return;
      }
      onAnalyze({
        inputMode: 'text',
        textDescription: trimmedText,
        images: undefined,
        productUrl: undefined,
      });
      return;
    }

    // 4. TAB CAMPURAN: Padukan sumber yang diisi
    if (mode === 'mixed') {
      const hasText = textDescription.trim().length > 0;
      const hasUrl = productUrl.trim().length > 0;
      const hasImages = images.length > 0;

      if (!hasText && !hasUrl && !hasImages) {
        setErrorMessage('Pada tab Campuran, masukkan minimal salah satu sumber (foto, link, atau teks) untuk digabungkan.');
        return;
      }

      onAnalyze({
        inputMode: 'mixed',
        images: hasImages
          ? images.map((img) => ({
              name: img.name,
              mimeType: img.mimeType,
              base64Data: img.base64Data,
              size: img.size,
            }))
          : undefined,
        productUrl: hasUrl ? productUrl.trim() : undefined,
        textDescription: hasText ? textDescription.trim() : undefined,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAnalyzeFromCurrentTab(activeTab);
  };

  const isCurrentTabValid = (() => {
    if (activeTab === 'images') return images.length > 0;
    if (activeTab === 'url') return productUrl.trim().length > 0;
    if (activeTab === 'text') return textDescription.trim().length > 0;
    return images.length > 0 || productUrl.trim().length > 0 || textDescription.trim().length > 0;
  })();

  const getButtonText = () => {
    if (isAnalyzing) {
      if (activeTab === 'images') return 'Mengekstrak Foto Produk...';
      if (activeTab === 'url') return 'Mengekstrak Link Produk...';
      if (activeTab === 'text') return 'Menyusun Brief dari Teks...';
      return 'Memproses Gabungan Campuran...';
    }

    if (!isCurrentTabValid) {
      if (activeTab === 'images') return 'Pilih / Unggah Foto Produk Dahulu';
      if (activeTab === 'url') return 'Masukkan Tautan Link Produk Dahulu';
      if (activeTab === 'text') return 'Tuliskan Deskripsi Teks Dahulu';
      return 'Pilih Minimal 1 Sumber Dahulu';
    }

    if (activeTab === 'images') {
      return `Analisis & Siapkan Brief (${images.length} Foto)`;
    }
    if (activeTab === 'url') {
      return 'Analisis & Siapkan Brief dari Link';
    }
    if (activeTab === 'text') {
      return 'Analisis & Siapkan Brief dari Teks';
    }
    return 'Analisis & Siapkan Brief Campuran';
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-4 sm:p-5">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
            1
          </div>
          <h2 className="text-sm sm:text-base font-bold text-zinc-900 flex items-center gap-1.5">
            Sumber Info Produk
            <InfoTooltip
              title="Tentang Sumber Info"
              content="Pilih salah satu tab: Foto, Link, atau Teks untuk analisis murni dari sumber tersebut tanpa resiko konflik fakta. Atau pilih Campuran jika ingin menggabungkan beberapa sumber sekaligus."
            />
          </h2>
        </div>
        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
          Tahap 1
        </span>
      </div>

      {/* Segmented Tabs: Foto, Link, Teks, Campuran */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-100 rounded-xl mb-3 text-xs font-medium">
        {/* Tab 1: Foto */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('images');
            setErrorMessage(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 sm:px-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'images'
              ? 'bg-white text-zinc-900 shadow-xs font-bold'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          <span>Foto</span>
          {images.length > 0 && (
            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded-full font-bold">
              {images.length}
            </span>
          )}
        </button>

        {/* Tab 2: Link */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('url');
            setErrorMessage(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 sm:px-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'url'
              ? 'bg-white text-zinc-900 shadow-xs font-bold'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Link</span>
          {productUrl.trim() && (
            <span className="text-[10px] bg-amber-100 text-amber-700 w-4 h-4 rounded-full inline-flex items-center justify-center font-bold">
              ✓
            </span>
          )}
        </button>

        {/* Tab 3: Teks */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('text');
            setErrorMessage(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 sm:px-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'text'
              ? 'bg-white text-zinc-900 shadow-xs font-bold'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Teks</span>
          {textDescription.trim() && (
            <span className="text-[10px] bg-blue-100 text-blue-700 w-4 h-4 rounded-full inline-flex items-center justify-center font-bold">
              ✓
            </span>
          )}
        </button>

        {/* Tab 4: Campuran */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('mixed');
            setErrorMessage(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 sm:px-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'mixed'
              ? 'bg-white text-zinc-900 shadow-xs font-bold'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Campur</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* ========================================================= */}
        {/* TAB 1: FOTO SAJA (Images Only)                            */}
        {/* ========================================================= */}
        {activeTab === 'images' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
              <label className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                <span>Upload Foto Produk ({images.length}/5)</span>
                <InfoTooltip
                  title="Mode Khusus Foto"
                  content="Hanya menganalisis gambar produk yang diunggah. Tautan link atau teks tidak akan dipakai, dijamin bebas dari pertentangan fakta sumber lain."
                />
              </label>
              <span className="text-[10px] text-zinc-400 font-normal">
                Maks 10MB/foto
              </span>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-purple-200 hover:border-purple-500 bg-purple-50/15 hover:bg-purple-50/30 rounded-xl p-4 text-center cursor-pointer transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled || isAnalyzing}
              />
              <Upload className="w-6 h-6 text-purple-500 mx-auto mb-1" />
              <p className="text-xs font-semibold text-zinc-800">
                Tarik foto atau <span className="text-purple-600 underline">pilih file</span>
              </p>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                AI akan membaca label kemasan, varian, dan fitur fisik dari foto
              </p>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group border border-purple-200/80 rounded-lg overflow-hidden bg-zinc-100 flex flex-col"
                  >
                    <div className="aspect-square w-full overflow-hidden bg-zinc-900/5">
                      <img
                        src={img.previewUrl}
                        alt={img.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(idx);
                      }}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-black/75 hover:bg-black text-white transition-opacity cursor-pointer"
                      title="Hapus foto"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: LINK SAJA (URL Only)                               */}
        {/* ========================================================= */}
        {activeTab === 'url' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
              <label className="flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-amber-600" />
                <span>Tautan Link Produk E-Commerce</span>
                <InfoTooltip
                  title="Mode Khusus Link"
                  content="Hanya mengekstrak informasi resmi dari URL produk e-commerce (Shopee, TikTok showcase/video, dsb). Gambar atau teks tidak diikutsertakan, bebas dari konflik fakta."
                />
              </label>
            </div>

            <div className="relative">
              <input
                type="text"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://shopee.co.id/... atau link showcase/video e-commerce"
                disabled={disabled || isAnalyzing}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-zinc-400"
              />
              {productUrl && (
                <button
                  type="button"
                  onClick={() => setProductUrl('')}
                  className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-600 p-0.5 cursor-pointer"
                  title="Kosongkan link"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: TEKS SAJA (Text Description Only)                  */}
        {/* ========================================================= */}
        {activeTab === 'text' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
              <label className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Deskripsi & Catatan Produk</span>
                <InfoTooltip
                  title="Mode Khusus Teks"
                  content="Hanya menyusun brief dari catatan teks yang Anda ketik. Gambar atau URL di tab lain diabaikan sehingga bebas dari pertentangan fakta."
                />
              </label>
              <span className="text-[10px] text-zinc-400 font-normal">
                {textDescription.length} karakter
              </span>
            </div>

            <textarea
              rows={4}
              maxLength={10000}
              value={textDescription}
              onChange={(e) => setTextDescription(e.target.value)}
              placeholder="Contoh: Lampu meja LED aesthetic lipat, 3 tingkat kecerahan, baterai 2000mAh tahan 8 jam. Cocok untuk anak kost. Promo Rp49.000 (normal Rp89.000). Jangan klaim anti-air."
              disabled={disabled || isAnalyzing}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-zinc-400 leading-relaxed"
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: CAMPURAN (Mixed Multimodal)                        */}
        {/* ========================================================= */}
        {activeTab === 'mixed' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
              <label className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>Gabungan Foto + Link + Teks</span>
                <InfoTooltip
                  title="Mode Campuran"
                  content="Memadukan beberapa sumber sekaligus. Jika ada klaim berbeda antar sumber (misal harga link vs teks), AI akan mencatatnya di panel klarifikasi."
                />
              </label>
            </div>

            {/* Compact Mixed Inputs */}
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
                <span className="text-zinc-600 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                  Foto Produk ({images.length}/5)
                </span>
                <button
                  type="button"
                  onClick={() => mixedFileInputRef.current?.click()}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                >
                  {images.length > 0 ? '+ Tambah' : '+ Pilih Foto'}
                </button>
                <input
                  ref={mixedFileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={disabled || isAnalyzing}
                />
              </div>

              <input
                type="text"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="Tautan link e-commerce (opsional)"
                disabled={disabled || isAnalyzing}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />

              <textarea
                rows={2}
                value={textDescription}
                onChange={(e) => setTextDescription(e.target.value)}
                placeholder="Catatan tambahan teks (opsional)..."
                disabled={disabled || isAnalyzing}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Dedicated Submit Button: Menyala siap ditekan saat valid */}
        <button
          type="submit"
          disabled={disabled || isAnalyzing || !isCurrentTabValid}
          className={`w-full min-h-[44px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            disabled || isAnalyzing || !isCurrentTabValid
              ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200/80 opacity-70'
              : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg ring-4 ring-emerald-500/20 scale-[1.005] active:scale-[0.995]'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{getButtonText()}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{getButtonText()}</span>
              {isCurrentTabValid && <ArrowRight className="w-4 h-4 ml-0.5 animate-pulse" />}
            </>
          )}
        </button>
      </form>
    </div>
  );
};
