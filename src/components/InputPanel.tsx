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
  Info,
} from 'lucide-react';

export type InputMode = 'mixed' | 'images' | 'url' | 'text';

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
  const [activeTab, setActiveTab] = useState<InputMode>('mixed');
  const [textDescription, setTextDescription] = useState<string>('');
  const [productUrl, setProductUrl] = useState<string>('');
  const [images, setImages] = useState<UploadedImageFile[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
          // split mime and base64
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const hasText = textDescription.trim().length > 0;
    const hasUrl = productUrl.trim().length > 0;
    const hasImages = images.length > 0;

    // 1. TAB FOTO SAJA
    if (activeTab === 'images') {
      if (!hasImages) {
        setErrorMessage('Harap upload minimal 1 foto produk pada tab Foto sebelum menganalisis.');
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
      });
      return;
    }

    // 2. TAB LINK SAJA
    if (activeTab === 'url') {
      if (!hasUrl) {
        setErrorMessage('Harap masukkan tautan produk Shopee atau TikTok pada tab Link.');
        return;
      }
      onAnalyze({
        inputMode: 'url',
        productUrl: productUrl.trim(),
      });
      return;
    }

    // 3. TAB TEKS SAJA
    if (activeTab === 'text') {
      if (!hasText) {
        setErrorMessage('Harap masukkan deskripsi produk pada tab Teks.');
        return;
      }
      onAnalyze({
        inputMode: 'text',
        textDescription: textDescription.trim(),
      });
      return;
    }

    // 4. TAB CAMPURAN (GABUNGAN)
    if (!hasText && !hasUrl && !hasImages) {
      setErrorMessage('Pada tab Campuran, harap masukkan minimal satu sumber (foto, link, atau teks) untuk digabungkan.');
      return;
    }

    onAnalyze({
      inputMode: 'mixed',
      textDescription: hasText ? textDescription.trim() : undefined,
      productUrl: hasUrl ? productUrl.trim() : undefined,
      images: hasImages
        ? images.map((img) => ({
            name: img.name,
            mimeType: img.mimeType,
            base64Data: img.base64Data,
            size: img.size,
          }))
        : undefined,
    });
  };

  const hasValidInputForTab = (() => {
    if (activeTab === 'images') return images.length > 0;
    if (activeTab === 'url') return productUrl.trim().length > 0;
    if (activeTab === 'text') return textDescription.trim().length > 0;
    return images.length > 0 || productUrl.trim().length > 0 || textDescription.trim().length > 0;
  })();

  const getButtonText = () => {
    if (activeTab === 'images') {
      return `Analisis ${images.length > 0 ? `${images.length} ` : ''}Foto & Siapkan Brief`;
    }
    if (activeTab === 'url') {
      return 'Analisis Link Produk & Siapkan Brief';
    }
    if (activeTab === 'text') {
      return 'Analisis Teks Produk & Siapkan Brief';
    }
    return 'Analisis Gabungan (Campuran) & Siapkan Brief';
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-4 sm:p-5">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-zinc-900">
            1. Sumber Info Produk
          </h2>
          <p className="text-xs text-zinc-500">
            Pilih cara memasukkan informasi produk
          </p>
        </div>
      </div>

      {/* Segmented Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-100 rounded-xl mb-4 text-xs font-medium">
        <button
          type="button"
          onClick={() => {
            setActiveTab('mixed');
            setErrorMessage(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'mixed'
              ? 'bg-white text-zinc-900 shadow-xs font-semibold'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Campuran</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('images');
            setErrorMessage(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'images'
              ? 'bg-white text-zinc-900 shadow-xs font-semibold'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Foto ({images.length})</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('url');
            setErrorMessage(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'url'
              ? 'bg-white text-zinc-900 shadow-xs font-semibold'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Link</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('text');
            setErrorMessage(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition-all cursor-pointer ${
            activeTab === 'text'
              ? 'bg-white text-zinc-900 shadow-xs font-semibold'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Teks</span>
        </button>
      </div>

      {/* Active Source Mode Clarification Pill */}
      <div className="flex items-center justify-between text-[11px] px-1 text-zinc-500 mb-3.5">
        <span>Sumber aktif yang dianalisis:</span>
        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          {activeTab === 'images' && '📸 Hanya Foto Produk'}
          {activeTab === 'url' && '🔗 Hanya Link Produk'}
          {activeTab === 'text' && '📝 Hanya Teks Deskripsi'}
          {activeTab === 'mixed' && '🔀 Gabungan Campuran (Foto + Link + Teks)'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* TAB 1: IMAGES (Visible in 'mixed' and 'images') */}
        {(activeTab === 'mixed' || activeTab === 'images') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
              <label className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                Upload Foto Produk ({images.length}/5)
              </label>
              <span className="text-[11px] text-zinc-400 font-normal">
                JPG, PNG, WEBP (Maks 10MB/file)
              </span>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-200 hover:border-emerald-500/60 bg-zinc-50/60 hover:bg-emerald-50/20 rounded-xl p-4 text-center cursor-pointer transition-colors"
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
              <Upload className="w-6 h-6 text-zinc-400 mx-auto mb-1.5" />
              <p className="text-xs font-medium text-zinc-700">
                Tarik foto produk ke sini atau <span className="text-emerald-600 underline">pilih file</span>
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Gemini akan membaca teks kemasan, bentuk, dan fitur fisik
              </p>
            </div>

            {/* Image Preview List */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group border border-zinc-200 rounded-lg overflow-hidden bg-zinc-100 flex flex-col"
                  >
                    <div className="aspect-square w-full overflow-hidden bg-zinc-900/5">
                      <img
                        src={img.previewUrl}
                        alt={img.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-1.5 bg-white text-[10px] text-zinc-600 truncate flex items-center justify-between">
                      <span className="truncate max-w-[80%]">{img.name}</span>
                      <span className="text-[9px] text-zinc-400">
                        {(img.size / (1024 * 1024)).toFixed(1)}MB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(idx);
                      }}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-black text-white transition-opacity cursor-pointer"
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

        {/* TAB 2: PRODUCT URL (Visible in 'mixed' and 'url') */}
        {(activeTab === 'mixed' || activeTab === 'url') && (
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700">
              <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
              Tautan / Link Halaman Produk (Opsional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://shopee.co.id/... atau https://id.shp.ee/... atau https://vt.tiktok.com/..."
                disabled={disabled || isAnalyzing}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-zinc-400"
              />
            </div>
            <p className="text-[11px] text-zinc-500 flex items-center gap-1">
              <Info className="w-3 h-3 text-zinc-400 shrink-0" />
              Mendukung link Shopee (shopee.co.id, id.shp.ee) dan TikTok (vt.tiktok.com, TikTok Shop). Info produk asli langsung dipetakan ke brief.
            </p>
          </div>
        )}

        {/* TAB 3: TEXT DESCRIPTION (Visible in 'mixed' and 'text') */}
        {(activeTab === 'mixed' || activeTab === 'text') && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
              <label className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                Deskripsi Produk & Catatan Kreator
              </label>
              <span className="text-[11px] text-zinc-400 font-normal">
                {textDescription.length}/10.000 karakter
              </span>
            </div>
            <textarea
              rows={activeTab === 'text' ? 6 : 4}
              maxLength={10000}
              value={textDescription}
              onChange={(e) => setTextDescription(e.target.value)}
              placeholder="Contoh: Lampu meja LED aesthetic lipat, 3 tingkat kecerahan, rechargeable baterai 2000mAh tahan 8 jam. Cocok buat anak kost atau meja kerja malam. Harga promo Rp49.000 (normal Rp89.000), gratis ongkir. Jangan klaim anti-air karena tidak tahan air."
              disabled={disabled || isAnalyzing}
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-zinc-400 leading-relaxed"
            />
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={disabled || isAnalyzing || !hasValidInputForTab}
          className={`w-full min-h-[44px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            disabled || isAnalyzing || !hasValidInputForTab
              ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-md'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Mengekstrak Info Produk dengan Gemini...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{getButtonText()}</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
