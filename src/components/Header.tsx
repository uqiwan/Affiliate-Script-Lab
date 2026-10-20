/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  History,
  Key,
  LogOut,
  ChevronDown,
  User as UserIcon,
  Check,
  Info,
  X,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { isMobileApp } from '../utils/api';

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenApiKey: () => void;
  onOpenHistory: () => void;
  onOpenSafeZone: () => void;
  onOpenApkModal?: () => void;
  onReset: () => void;
  historyCount: number;
  hasApiKey: boolean;
  isLoggingIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogin,
  onLogout,
  onOpenApiKey,
  onOpenHistory,
  onOpenSafeZone,
  onOpenApkModal,
  onReset,
  historyCount,
  hasApiKey,
  isLoggingIn,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleMenuAction = (action: () => void) => {
    setDropdownOpen(false);
    action();
  };

  const [mobileAuthModalOpen, setMobileAuthModalOpen] = useState<boolean>(false);
  const isMobile = isMobileApp();

  return (
    <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
        {/* Brand & Tagline with Official Gagaswara Logo */}
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img
              src="/assets/aistudio/Gagaswara_AI_Teleprompter_Logo_8e7c7f61.png"
              alt="Gagaswara Logo"
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-2xl drop-shadow-sm transition-transform active:scale-95"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-zinc-950 tracking-tight leading-tight">
                Gagaswara
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> AI Teleprompter
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-500 leading-none mt-0.5 font-medium">
              Skrip Video Affiliate & Teleprompter Melayang
            </p>
          </div>
        </div>

        {/* Top-Right Profile / Account Menu */}
        <div className="flex items-center gap-2" ref={dropdownRef}>
          {!user ? (
            /* Status Belum Login: Tampilan adaptif untuk Mobile APK vs Web Browser */
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={onOpenHistory}
                className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200/90 shadow-2xs transition-all cursor-pointer active:scale-95"
                title="Riwayat Sesi Skrip"
              >
                <History className="w-3.5 h-3.5 text-teal-600" />
                <span className="hidden sm:inline">Riwayat</span>
                {historyCount > 0 && (
                  <span className="text-[10px] bg-teal-50 text-teal-800 font-bold px-1.5 rounded-full border border-teal-200/60">
                    {historyCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={onOpenSafeZone}
                className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200/90 shadow-2xs transition-all cursor-pointer active:scale-95"
                title="Panduan Zona (Safe Zone)"
              >
                <Smartphone className="w-3.5 h-3.5 text-zinc-500" />
                <span className="hidden sm:inline">Panduan Zona</span>
              </button>

              {isMobile ? (
                /* Mode APK Android: Akses Cepat API Key & Info Akun */
                <>
                  <button
                    type="button"
                    onClick={onOpenApiKey}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border shadow-2xs transition-all cursor-pointer ${
                      hasApiKey
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                        : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 animate-pulse'
                    }`}
                    title="Atur API Key AI Studio"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>{hasApiKey ? 'API Key Aktif' : 'Atur API Key'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMobileAuthModalOpen(true)}
                    className="p-2 rounded-xl text-zinc-600 bg-white hover:bg-zinc-50 border border-zinc-200 shadow-2xs transition-all cursor-pointer"
                    title="Informasi Mode APK & Akun"
                  >
                    <Info className="w-4 h-4 text-zinc-500" />
                  </button>
                </>
              ) : (
                /* Mode Web Browser Desktop/Mobile */
                <>
                  {onOpenApkModal && (
                    <button
                      type="button"
                      onClick={onOpenApkModal}
                      className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 shadow-2xs transition-all cursor-pointer"
                      title="Bungkus APK Android & Mode Melayang"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                      <span className="hidden sm:inline">APK Android</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onLogin}
                    disabled={isLoggingIn}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-800 bg-white hover:bg-zinc-50 border border-zinc-300 shadow-2xs hover:border-zinc-400 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
                  >
                    {isLoggingIn ? (
                      <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      /* Google G Logo SVG */
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span className="hidden xs:inline">Masuk dengan Google</span>
                    <span className="xs:hidden">Login</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            /* Status Sudah Login: Foto profil (avatar) beserta nama/email & dropdown menu */
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`inline-flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl transition-all cursor-pointer border ${
                  dropdownOpen
                    ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                    : 'bg-white hover:bg-zinc-50 border-zinc-200'
                }`}
                title="Buka menu profil dan pengaturan"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-lg object-cover border border-zinc-200 shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                  </div>
                )}
                <div className="text-left hidden sm:block max-w-[120px] lg:max-w-[150px]">
                  <div className="text-xs font-bold text-zinc-900 truncate leading-tight">
                    {user.displayName || 'Pengguna'}
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate leading-tight">
                    {user.email}
                  </div>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${
                    dropdownOpen ? 'rotate-180 text-emerald-600' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu Profile */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-zinc-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* User Profile Summary */}
                  <div className="px-4 py-3 border-b border-zinc-100 flex items-center gap-3 bg-zinc-50/50">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="w-10 h-10 rounded-xl object-cover border border-zinc-200 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-zinc-900 truncate">
                        {user.displayName || 'Pengguna'}
                      </div>
                      <div className="text-[11px] text-zinc-500 truncate">{user.email}</div>
                      {user.uid === 'local-session' ? (
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-amber-100 text-amber-800">
                            Sesi API Key Lokal
                          </span>
                          <button
                            type="button"
                            onClick={() => handleMenuAction(onLogin)}
                            className="text-[10px] text-emerald-700 hover:underline font-bold cursor-pointer"
                          >
                            Tautkan Google
                          </button>
                        </div>
                      ) : (
                        <span className="inline-block mt-1 text-[10px] px-1.5 py-0.2 rounded font-medium bg-emerald-100 text-emerald-800">
                          Google Account
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-1.5 space-y-0.5">
                    {/* 1. Pengaturan API Key */}
                    <button
                      type="button"
                      onClick={() => handleMenuAction(onOpenApiKey)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Key className="w-4 h-4 text-emerald-600" />
                        <span>Pengaturan API Key</span>
                      </div>
                      {hasApiKey ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Aktif
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          Wajib Diatur
                        </span>
                      )}
                    </button>

                    {/* 2. Riwayat */}
                    <button
                      type="button"
                      onClick={() => handleMenuAction(onOpenHistory)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <History className="w-4 h-4 text-teal-600" />
                        <span>Riwayat Skrip</span>
                      </div>
                      {historyCount > 0 && (
                        <span className="text-[10px] bg-zinc-200 text-zinc-800 px-2 py-0.5 rounded-full font-bold">
                          {historyCount} sesi
                        </span>
                      )}
                    </button>

                    {/* 3. Panduan Zona (Safe Zone) */}
                    <button
                      type="button"
                      onClick={() => handleMenuAction(onOpenSafeZone)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Smartphone className="w-4 h-4 text-zinc-500" />
                        <span>Panduan Zona (Safe Zone)</span>
                      </div>
                      <span className="text-[10px] text-zinc-400">9:16</span>
                    </button>

                    {/* 4. Bungkus APK Android (.APK) */}
                    {onOpenApkModal && (
                      <button
                        type="button"
                        onClick={() => handleMenuAction(onOpenApkModal)}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <Smartphone className="w-4 h-4 text-amber-600" />
                          <span>Bungkus APK Android (.APK)</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Siap
                        </span>
                      </button>
                    )}

                    {/* 5. Reset Sesi */}
                    <button
                      type="button"
                      onClick={() => handleMenuAction(onReset)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <RotateCcw className="w-4 h-4 text-zinc-400" />
                      <span>Reset Sesi Saat Ini</span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="my-1 border-t border-zinc-100" />

                  {/* 5. Keluar / Logout */}
                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={() => handleMenuAction(onLogout)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>Keluar / Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Penjelasan Mode APK Android & Akun */}
      {mobileAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Mode Aplikasi Android (.APK)</h3>
                  <p className="text-[11px] text-zinc-500">Siap Digunakan Langsung</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileAuthModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-zinc-600">
              <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200 text-emerald-900 leading-relaxed font-medium">
                ✓ Aplikasi versi APK Android berjalan secara <b>mandiri (standalone)</b> langsung di ponsel Anda. Seluruh skrip, teleprompter melayang, dan riwayat tersimpan otomatis di memori HP Anda <b>tanpa perlu login</b>.
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-zinc-800 text-[11px] uppercase tracking-wider">
                  Cara Mulai Menggunakan di APK:
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-zinc-600">
                  <li>
                    Masukkan <b>API Key Google AI Studio</b> Anda sekali saja di menu atas.
                  </li>
                  <li>
                    API Key ini gratis dan akan langsung menghubungkan ponsel Anda ke AI Google secara permanen.
                  </li>
                  <li>
                    Google secara resmi membatasi login akun Google di dalam WebView APK, sehingga mode mandiri ini adalah cara paling aman & cepat.
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setMobileAuthModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileAuthModalOpen(false);
                    onOpenApiKey();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Atur API Key AI Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
