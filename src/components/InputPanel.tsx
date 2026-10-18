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

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-3.5 sm:p-5">
      {/* Header bar without redundant long paragraphs */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
            1
          </div>
          <h2 className="text-sm sm:text-base font-bold text-zinc-900 flex items-center">
            <span>Sumber Info Produk</span>
            <InfoTooltip
              title="Sumber Info Produk"
              content="Pilih salah satu sumber informasi produk (Foto, Link, atau Teks) atau Campuran. Setelah input terisi, tombol Analisis & Siapkan Brief akan menyala dan siap ditekan."
            />
          </h2>
        </div>
        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
          Tahap 1
        </span>
      </div>

      {/* Segmented Source Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-100 rounded-xl mb-3 text-xs font-medium">
        <button
          type="button"
          onClick={() => {
            setActiveTab('images');
            setErrorMessage(null);
          }}
          className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all cursor-pointer ${
            activeTab === 'images'
              ? 'bg-white text-zinc-900 shadow-xs font-bold'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          <span>Foto</span>
          {images.length > 0 && (
            <span className="text-[10px] bg-purple-100 text-purple-700 px-1 rounded-full font-bold">
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
          className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all cursor-pointer ${
            activeTab === 'url'
              ? 'bg-white text-zinc-900 shadow-xs font-bold'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Link</span>
          {productUrl.trim() && (
            <span className="text-[10px] bg-amber-100 text-amber-700 w-3.5 h-3.5 rounded-full inline-flex items-center justify-center font-bold">
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
          className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all cursor-pointer ${
            activeTab === 'text'
              ? 'bg-white text-zinc-900 shadow-xs font-bold'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Teks</span>
          {textDescription.trim() && (
            <span className="text-[10px] bg-blue-100 text-blue-700 w-3.5 h-3.5 rounded-full inline-flex items-center justify-center font-bold">
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
          className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all cursor-pointer ${
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
        {/* TAB 1: FOTO */}
        {activeTab === 'images' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
              <label className="flex items-center">
                <ImageIcon className="w-3.5 h-3.5 text-purple-600 mr-1.5" />
                <span>Upload Foto Produk ({images.length}/5)</span>
                <InfoTooltip
                  title="Upload Foto Produk"
                  content="Unggah 1-5 foto produk yang jelas. AI mengekstrak nama, bentuk, label kemasan, dan fitur fisik langsung dari foto."
                />
              </label>
              <span className="text-[10px] text-zinc-400 font-normal">
                Maks 10MB/foto
              </span>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/20 rounded-xl p-4 text-center cursor-pointer transition-colors"
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
                Tarik foto ke sini atau <span className="text-purple-600 underline">pilih file</span>
              </p>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group border border-purple-200/80 rounded-lg overflow-hidden bg-zinc-100 flex flex-col"
                  >
                    <img
                      src={img.previewUrl}
                      alt={img.name}
                      className="w-full h-16 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                      title="Hapus gambar"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <span className="text-[9px] truncate px-1 py-0.5 text-zinc-600 font-mono text-center">
                      {(img.size / (1024 * 1024)).toFixed(1)}MB
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LINK */}
        {activeTab === 'url' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
              <label className="flex items-center">
                <LinkIcon className="w-3.5 h-3.5 text-amber-600 mr-1.5" />
                <span>Tautan Link Produk</span>
                <InfoTooltip
                  title="Tautan Link E-Commerce"
                  content="Tempel tautan produk dari Shopee, TikTok Shop, Tokopedia, atau marketplace lainnya. AI akan membaca judul, harga, dan spesifikasi produk."
                />
              </label>
            </div>
            <input
              type="text"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="Contoh: https://shopee.co.id/... atau https://vt.tiktok.com/..."
              disabled={disabled || isAnalyzing}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        )}

        {/* TAB 3: TEKS */}
        {activeTab === 'text' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
              <label className="flex items-center">
                <FileText className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
                <span>Deskripsi / Catatan Produk</span>
                <InfoTooltip
                  title="Deskripsi Produk"
                  content="Tuliskan nama produk, fungsi, cara pakai, harga, atau keunggulan produk. AI akan merapikannya menjadi brief yang terstruktur."
                />
              </label>
            </div>
            <textarea
              rows={4}
              value={textDescription}
              onChange={(e) => setTextDescription(e.target.value)}
              placeholder="Tuliskan nama produk, fitur utama, kegunaan, atau variasi..."
              disabled={disabled || isAnalyzing}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        )}

        {/* TAB 4: CAMPURAN */}
        {activeTab === 'mixed' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
              <label className="flex items-center">
                <Layers className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                <span>Gabungan Foto + Link + Teks</span>
                <InfoTooltip
                  title="Mode Campuran"
                  content="Padukan beberapa sumber sekaligus. AI akan menggabungkan keunggulan dari foto, link, dan teks catatan Anda."
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
                <span className="text-zinc-600 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                  Foto ({images.length}/5)
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
                placeholder="Tautan link produk (opsional)"
                disabled={disabled || isAnalyzing}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />

              <textarea
                rows={2}
                value={textDescription}
                onChange={(e) => setTextDescription(e.target.value)}
                placeholder="Catatan teks produk (opsional)..."
                disabled={disabled || isAnalyzing}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 
          TOMBOL 'Analisis & Siapkan Brief':
          Ketika belum ada input: disabled & redup.
          Ketika sudah diisi salah satu input: MENYALA TERANG SIAP DITEKAN!
        */}
        <button
          type="submit"
          disabled={disabled || isAnalyzing || !isCurrentTabValid}
          className={`w-full min-h-[46px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            disabled || isAnalyzing || !isCurrentTabValid
              ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200/80 opacity-60'
              : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg ring-4 ring-emerald-500/30 scale-[1.005] active:scale-[0.99] cursor-pointer'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Menganalisis & Menyiapkan Brief...</span>
            </>
          ) : (
            <>
              <Sparkles className={`w-4 h-4 ${isCurrentTabValid ? 'text-amber-200 animate-spin' : ''}`} />
              <span>Analisis & Siapkan Brief</span>
              {isCurrentTabValid && <ArrowRight className="w-4 h-4 ml-0.5 animate-pulse" />}
            </>
          )}
        </button>
      </form>
    </div>
  );
};
