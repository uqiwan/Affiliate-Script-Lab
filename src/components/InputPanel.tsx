/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
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
  onValidityChange?: (isValid: boolean, triggerAnalyze: () => void) => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  onAnalyze,
  isAnalyzing,
  disabled = false,
  onValidityChange,
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
      setErrorMessage('Maksimal 5 gambar produk.');
      return;
    }

    let currentTotalSize = images.reduce((acc, curr) => acc + curr.size, 0);

    for (const file of files) {
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setErrorMessage(`Format "${file.name}" tidak didukung. Gunakan JPG, PNG, atau WEBP.`);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage(`File "${file.name}" melebihi batas 10 MB.`);
        return;
      }

      currentTotalSize += file.size;
      if (currentTotalSize > 20 * 1024 * 1024) {
        setErrorMessage('Total ukuran gambar melebihi batas 20 MB.');
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

  const handleAnalyzeFromCurrentTab = (mode: InputMode) => {
    setErrorMessage(null);

    if (mode === 'images') {
      if (images.length === 0) {
        setErrorMessage('Harap unggah minimal 1 foto produk.');
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

    if (mode === 'url') {
      const trimmedUrl = productUrl.trim();
      if (!trimmedUrl) {
        setErrorMessage('Harap masukkan tautan produk e-commerce.');
        return;
      }
      onAnalyze({
        inputMode: 'url',
        productUrl: trimmedUrl,
      });
      return;
    }

    if (mode === 'text') {
      const trimmedText = textDescription.trim();
      if (!trimmedText) {
        setErrorMessage('Harap isi deskripsi produk.');
        return;
      }
      onAnalyze({
        inputMode: 'text',
        textDescription: trimmedText,
      });
      return;
    }

    if (mode === 'mixed') {
      const hasText = textDescription.trim().length > 0;
      const hasUrl = productUrl.trim().length > 0;
      const hasImages = images.length > 0;

      if (!hasText && !hasUrl && !hasImages) {
        setErrorMessage('Masukkan minimal salah satu sumber (foto, link, atau teks).');
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

  // Check if current tab has valid input provided
  const isCurrentTabValid = (() => {
    if (activeTab === 'images') return images.length > 0;
    if (activeTab === 'url') return productUrl.trim().length > 0;
    if (activeTab === 'text') return textDescription.trim().length > 0;
    return images.length > 0 || productUrl.trim().length > 0 || textDescription.trim().length > 0;
  })();

  // Notify parent component for floating action bar synchronization
  useEffect(() => {
    if (onValidityChange) {
      onValidityChange(isCurrentTabValid, () => handleAnalyzeFromCurrentTab(activeTab));
    }
  }, [isCurrentTabValid, activeTab, images, productUrl, textDescription]);

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-[22px] border border-[#E5E5EA] dark:border-[#38383A] shadow-xs p-5 sm:p-6 max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#F2F2F7] dark:border-[#2C2C2E] mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[10px] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#1C1C1E] dark:text-white flex items-center gap-1.5 tracking-tight">
              <span>Sumber Info Produk</span>
              <InfoTooltip
                title="Sumber Info Produk"
                content="Pilih salah satu sumber informasi produk (Foto, Link, atau Teks) atau Campuran. Data akan dirangkum otomatis ke dalam brief produk."
              />
            </h2>
            <p className="text-[11px] text-[#8E8E93] font-medium">Langkah awal persiapan materi skrip</p>
          </div>
        </div>
      </div>

      {/* iOS-Style Segmented Source Tabs */}
      <div className="grid grid-cols-4 gap-1 p-[3px] bg-[#767680]/12 dark:bg-[#767680]/24 rounded-[12px] mb-5 text-xs font-semibold select-none">
        <button
          type="button"
          onClick={() => {
            setActiveTab('images');
            setErrorMessage(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-[9px] transition-all duration-150 cursor-pointer ${
            activeTab === 'images'
              ? 'bg-white dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-white shadow-[0_2px_4px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.04)] font-bold'
              : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-[#5856D6] shrink-0" />
          <span>Foto</span>
          {images.length > 0 && (
            <span className="text-[10px] bg-[#5856D6]/15 text-[#5856D6] px-1.5 py-0.2 rounded-full font-bold">
              {images.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('url');
            setErrorMessage(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-[9px] transition-all duration-150 cursor-pointer ${
            activeTab === 'url'
              ? 'bg-white dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-white shadow-[0_2px_4px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.04)] font-bold'
              : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5 text-[#FF9500] shrink-0" />
          <span>Link</span>
          {productUrl.trim() && (
            <span className="text-[10px] bg-[#FF9500]/15 text-[#FF9500] w-3.5 h-3.5 rounded-full inline-flex items-center justify-center font-bold">
              ✓
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('text');
            setErrorMessage(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-[9px] transition-all duration-150 cursor-pointer ${
            activeTab === 'text'
              ? 'bg-white dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-white shadow-[0_2px_4px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.04)] font-bold'
              : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-[#007AFF] shrink-0" />
          <span>Teks</span>
          {textDescription.trim() && (
            <span className="text-[10px] bg-[#007AFF]/15 text-[#007AFF] w-3.5 h-3.5 rounded-full inline-flex items-center justify-center font-bold">
              ✓
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('mixed');
            setErrorMessage(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-[9px] transition-all duration-150 cursor-pointer ${
            activeTab === 'mixed'
              ? 'bg-white dark:bg-[#2C2C2E] text-[#1C1C1E] dark:text-white shadow-[0_2px_4px_rgba(0,0,0,0.08),0_1px_1px_rgba(0,0,0,0.04)] font-bold'
              : 'text-[#8E8E93] hover:text-[#1C1C1E] dark:hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
          <span>Campuran</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* TAB 1: Foto Produk */}
        {activeTab === 'images' && (
          <div className="space-y-3">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#C6C6C8] dark:border-[#48484A] hover:border-[#007AFF] rounded-[18px] p-6 text-center cursor-pointer bg-[#F2F2F7]/50 dark:bg-[#2C2C2E]/40 hover:bg-[#F2F2F7] transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-[#1C1C1E] dark:text-white">
                Sentuh untuk memilih foto produk
              </p>
              <p className="text-[11px] text-[#8E8E93] mt-0.5">
                Maksimal 5 foto (JPG, PNG, WEBP hingga 10MB per foto)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled || isAnalyzing}
              />
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 pt-1">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-[14px] overflow-hidden border border-[#E5E5EA] dark:border-[#38383A] aspect-square bg-[#F2F2F7]"
                  >
                    <img
                      src={img.previewUrl}
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(idx);
                      }}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-all cursor-pointer"
                      title="Hapus foto"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[9px] px-1 py-0.5 truncate text-center backdrop-blur-xs">
                      {(img.size / 1024).toFixed(0)} KB
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Link URL Produk */}
        {activeTab === 'url' && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#1C1C1E] dark:text-white block">
              Tautan URL Produk E-Commerce
            </label>
            <div className="relative">
              <input
                type="url"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="Contoh: https://id.shp.ee/... atau https://tokopedia.link/..."
                disabled={disabled || isAnalyzing}
                className="w-full h-11 px-3.5 rounded-[12px] bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-transparent focus:border-[#007AFF] focus:bg-white text-xs text-[#1C1C1E] dark:text-white focus:outline-none transition-all placeholder:text-[#8E8E93]"
              />
              {productUrl.trim() && (
                <button
                  type="button"
                  onClick={() => setProductUrl('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-[#1C1C1E] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-[11px] text-[#8E8E93]">
              Mendukung link Shopee, Tokopedia, TikTok Shop, Lazada, dan toko online lainnya.
            </p>
          </div>
        )}

        {/* TAB 3: Teks Deskripsi */}
        {activeTab === 'text' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#1C1C1E] dark:text-white">
                Deskripsi Produk & Poin Keunggulan
              </label>
              <span className="text-[11px] text-[#8E8E93] tabular-nums">
                {textDescription.length}/10.000 karakter
              </span>
            </div>
            <textarea
              rows={4}
              value={textDescription}
              onChange={(e) => setTextDescription(e.target.value)}
              placeholder="Tuliskan nama produk, kelebihan, bahan, promo potongan harga, atau spesifikasi utama di sini..."
              disabled={disabled || isAnalyzing}
              className="w-full p-3.5 rounded-[14px] bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-transparent focus:border-[#007AFF] focus:bg-white text-xs text-[#1C1C1E] dark:text-white focus:outline-none transition-all placeholder:text-[#8E8E93]"
            />
          </div>
        )}

        {/* TAB 4: Campuran (Mixed) */}
        {activeTab === 'mixed' && (
          <div className="space-y-3">
            <div className="p-3 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[14px] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1C1C1E] dark:text-white">
                  1. Foto Produk ({images.length}/5)
                </span>
                <button
                  type="button"
                  onClick={() => mixedFileInputRef.current?.click()}
                  className="text-xs text-[#007AFF] font-semibold hover:underline cursor-pointer"
                >
                  + Tambah Foto
                </button>
                <input
                  ref={mixedFileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={disabled || isAnalyzing}
                />
              </div>

              {images.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-14 h-14 rounded-[10px] overflow-hidden shrink-0 border border-[#E5E5EA]">
                      <img src={img.previewUrl} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center text-[10px]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                type="text"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="2. Tautan link produk (opsional)"
                disabled={disabled || isAnalyzing}
                className="w-full h-10 px-3 text-xs rounded-[10px] bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 focus:outline-none focus:border-[#007AFF]"
              />

              <textarea
                rows={2}
                value={textDescription}
                onChange={(e) => setTextDescription(e.target.value)}
                placeholder="3. Catatan teks tambahan (opsional)..."
                disabled={disabled || isAnalyzing}
                className="w-full p-2.5 text-xs rounded-[10px] bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 focus:outline-none focus:border-[#007AFF]"
              />
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-[12px] bg-[#FF3B30]/10 border border-[#FF3B30]/30 flex items-start gap-2 text-xs text-[#FF3B30]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
      </form>
    </div>
  );
};
