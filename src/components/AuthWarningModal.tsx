/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, Key, LogIn, X, ExternalLink } from 'lucide-react';
import { User } from 'firebase/auth';

interface AuthWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  hasApiKey: boolean;
  onLogin: () => void;
  onOpenApiKey: () => void;
}

export const AuthWarningModal: React.FC<AuthWarningModalProps> = ({
  isOpen,
  onClose,
  user,
  hasApiKey,
  onLogin,
  onOpenApiKey,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-amber-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Proteksi Generator Skrip</h3>
              <p className="text-[11px] text-zinc-500">Perlu Autentikasi & API Key</p>
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

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed font-medium">
            Harap login dan atur API Key Google AI Studio Anda terlebih dahulu di menu profil (kanan atas).
          </div>

          <div className="space-y-2.5 text-xs text-zinc-600">
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 bg-zinc-50">
              <div className="flex items-center gap-2">
                <LogIn className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-zinc-800">1. Status Akun</span>
              </div>
              {user ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Sudah Login
                </span>
              ) : (
                <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                  Belum Login
                </span>
              )}
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-200 bg-zinc-50">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-zinc-800">2. Google AI Studio API Key</span>
              </div>
              {hasApiKey ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Tersimpan
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Belum Diatur
                </span>
              )}
            </div>
          </div>

          <div className="text-[11px] text-zinc-500 flex items-center justify-between">
            <span>Belum punya API Key?</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-semibold"
            >
              <span>Dapatkan gratis di Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              Tutup
            </button>

            {!user ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogin();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk dengan Google</span>
              </button>
            ) : !hasApiKey ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenApiKey();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Atur API Key Sekarang</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
