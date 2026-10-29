/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, Copy, Check, ExternalLink, X, Key, ArrowRight } from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';

interface UnauthorizedDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseLocalApiKey: () => void;
}

export const UnauthorizedDomainModal: React.FC<UnauthorizedDomainModalProps> = ({
  isOpen,
  onClose,
  onUseLocalApiKey,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
  const projectId = firebaseConfig.projectId || 'gen-lang-client-0665892309';
  const firebaseSettingsUrl = `https://console.firebase.google.com/project/${projectId}/authentication/settings`;

  const handleCopyDomain = async () => {
    if (!currentDomain) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(currentDomain);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-zinc-200 overflow-hidden space-y-0">
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-amber-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 leading-tight">
                Domain Belum Diotorisasi di Firebase
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">auth/unauthorized-domain</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 text-xs">
          <p className="text-zinc-600 leading-relaxed">
            Google Sign-In memblokir permintaan login karena domain aplikasi saat ini belum ditambahkan ke daftar <strong className="text-zinc-800">Authorized Domains</strong> di Firebase Authentication proyek Anda.
          </p>

          {/* Domain Box */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-700 block">
              Domain Aplikasi Anda Saat Ini:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentDomain}
                className="flex-1 px-3 py-2 text-xs font-mono bg-zinc-50 border border-zinc-300 rounded-xl text-zinc-800 select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyDomain}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-900 text-white transition-all cursor-pointer shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Domain</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step by Step Guide */}
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
            <div className="font-bold text-zinc-800 text-[11px] flex items-center justify-between">
              <span>Langkah Mengatasi di Firebase Console:</span>
              <a
                href={firebaseSettingsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-semibold text-[11px]"
              >
                <span>Buka Firebase Settings</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="list-decimal pl-4 space-y-1 text-zinc-600 leading-normal text-[11px]">
              <li>Buka tautan Firebase Console Settings di atas.</li>
              <li>Gulir ke bagian <strong className="text-zinc-700">Authorized domains</strong>.</li>
              <li>Klik tombol <strong className="text-zinc-700">Add domain</strong> lalu tempel domain di atas.</li>
              <li>Klik <strong className="text-zinc-700">Save</strong>, lalu coba login Google kembali.</li>
            </ol>
          </div>

          {/* Quick Fallback Option: Gunakan API Key Langsung */}
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-1.5">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-700" />
              <span>Ingin langsung membuat skrip sekarang?</span>
            </div>
            <p className="text-emerald-800 leading-relaxed text-[11px]">
              Anda tidak perlu menunggu! Anda dapat langsung menggunakan aplikasi dengan memasukkan Google AI Studio API Key Anda secara lokal. Riwayat dan fitur generator akan langsung aktif.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer text-center"
            >
              Lanjut sebagai Tamu
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onUseLocalApiKey();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Gunakan dengan API Key Langsung</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
