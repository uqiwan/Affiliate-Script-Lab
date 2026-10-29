/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  RotateCcw,
  Smartphone,
  History,
  Key,
  LogOut,
  ChevronDown,
  User as UserIcon,
  Info,
  X,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { isMobileApp } from '../utils/api';
import { TeleprompterThemeId } from '../utils/teleprompterThemes';

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
  currentThemeId?: TeleprompterThemeId;
  onSelectTheme?: (themeId: TeleprompterThemeId) => void;
  settingsSheetOpen?: boolean;
  onToggleSettingsSheet?: (open: boolean) => void;
}

const HeaderComponent: React.FC<HeaderProps> = ({
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
  settingsSheetOpen: externalSettingsSheetOpen,
  onToggleSettingsSheet,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [internalSettingsSheetOpen, setInternalSettingsSheetOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isSettingsSheetVisible = externalSettingsSheetOpen !== undefined ? externalSettingsSheetOpen : internalSettingsSheetOpen;
  const setSettingsSheetVisible = (open: boolean) => {
    if (onToggleSettingsSheet) {
      onToggleSettingsSheet(open);
    } else {
      setInternalSettingsSheetOpen(open);
    }
  };

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
    setSettingsSheetVisible(false);
    action();
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-[#18181B] border-b border-slate-200 dark:border-zinc-800 shadow-2xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-4">
        {/* Brand & Subtitle with Official Gagaswara Logo */}
        <div className="flex items-center gap-3 select-none">
          <div className="relative shrink-0">
            <img
              src="/logo.png"
              alt="Gagaswara"
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-xl shadow-xs transition-transform active:scale-95"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                Gagaswara
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-tight mt-1 font-medium tracking-tight">
              Skrip Generator & Teleprompter
            </p>
          </div>
        </div>

        {/* Right Nav: Account Icon with Theme & Settings Menu */}
        <div className="flex items-center gap-2" ref={dropdownRef}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`inline-flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-full transition-all cursor-pointer active:scale-95 border ${
                dropdownOpen
                  ? 'bg-slate-100 dark:bg-zinc-800 border-blue-600/40 shadow-xs'
                  : 'bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200/80 dark:hover:bg-zinc-700/80 border-slate-200/80 dark:border-zinc-700/60'
              }`}
              title="Menu Akun & Pengaturan"
              aria-label="Menu Akun & Pengaturan"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-zinc-700"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                </div>
              )}
              <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 max-w-[80px] sm:max-w-[120px] truncate hidden sm:inline">
                {user?.displayName || 'Akun'}
              </span>
              <ChevronDown
                className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180 text-blue-600' : ''
                }`}
              />
            </button>

            {/* Profile Popover Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
                {/* User Info / Login status header */}
                <div className="px-3 py-2.5 mb-2 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-zinc-700"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user ? user.displayName || 'Pengguna' : 'Pengguna Gagaswara'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                        {user ? user.email : 'Mode Offline / Kunci Pribadi'}
                      </div>
                    </div>
                  </div>

                  {!user && (
                    <button
                      type="button"
                      onClick={() => handleMenuAction(onLogin)}
                      disabled={isLoggingIn}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shrink-0 cursor-pointer shadow-xs disabled:opacity-60"
                    >
                      {isLoggingIn ? (
                        <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span>Masuk</span>
                      )}
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => handleMenuAction(onOpenApiKey)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Key className="w-4 h-4 text-blue-600" />
                      <span>API Key Google AI</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      hasApiKey ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                    }`}>
                      {hasApiKey ? 'Aktif' : 'Atur'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMenuAction(onOpenHistory)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <History className="w-4 h-4 text-indigo-600" />
                      <span>Riwayat Sesi Skrip</span>
                    </div>
                    {historyCount > 0 && (
                      <span className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 px-2 py-0.5 rounded-full font-bold">
                        {historyCount}
                      </span>
                    )}
                  </button>

                  {onOpenApkModal && (
                    <button
                      type="button"
                      onClick={() => handleMenuAction(onOpenApkModal)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Smartphone className="w-4 h-4 text-amber-600" />
                        <span>Setelan Prompter Melayang Android</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                        Atur
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleMenuAction(onReset)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-500" />
                    <span>Reset Sesi Saat Ini</span>
                  </button>

                  {user && (
                    <>
                      <div className="my-1 border-t border-slate-100 dark:border-zinc-800" />
                      <button
                        type="button"
                        onClick={() => handleMenuAction(onLogout)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>Keluar / Logout</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings & Options Modal Sheet */}
      {isSettingsSheetVisible && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 animate-in fade-in duration-150">
          <div className="w-full sm:max-w-md bg-white dark:bg-[#1C1C1E] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Grab Handle on Mobile */}
            <div className="sm:hidden pt-2.5 pb-1 flex justify-center">
              <div className="w-10 h-1 bg-slate-300 dark:bg-zinc-700 rounded-full" />
            </div>

            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pengaturan & Fitur</h3>
              </div>
              <button
                type="button"
                onClick={() => setSettingsSheetVisible(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inset Grouped Settings List */}
            <div className="p-4 space-y-3">
              {/* Group 1: Akun & Koneksi */}
              <div className="bg-slate-50 dark:bg-zinc-800/80 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 overflow-hidden divide-y divide-slate-100 dark:divide-zinc-700/60">
                <button
                  type="button"
                  onClick={() => handleMenuAction(onOpenApiKey)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-700/50 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold">API Key Google AI Studio</div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400">Koneksi Gemini untuk generate skrip</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    hasApiKey ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                  }`}>
                    {hasApiKey ? 'Terkoneksi' : 'Atur'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuAction(onOpenHistory)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-700/50 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <History className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold">Riwayat Sesi Skrip</div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400">Tersimpan di cloud / lokal</div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 font-bold">{historyCount} sesi</span>
                </button>
              </div>

              {/* Group 2: Tools & Utilities */}
              <div className="bg-slate-50 dark:bg-zinc-800/80 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 overflow-hidden divide-y divide-slate-100 dark:divide-zinc-700/60">
                <button
                  type="button"
                  onClick={() => handleMenuAction(onOpenSafeZone)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-700/50 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold">Panduan Safe Zone 9:16</div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400">Batas aman UI TikTok, Shopee, & Reels</div>
                    </div>
                  </div>
                </button>

                {onOpenApkModal && (
                  <button
                    type="button"
                    onClick={() => handleMenuAction(onOpenApkModal)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-zinc-700/50 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold">Setelan Prompter Melayang Android</div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400">Atur kecepatan, transparansi & panduan melayang</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                      Siap
                    </span>
                  </button>
                )}
              </div>

              {/* Group 3: Reset */}
              <div className="bg-slate-50 dark:bg-zinc-800/80 rounded-xl border border-slate-200/80 dark:border-zinc-700/60 overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleMenuAction(onReset)}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <span>Reset Sesi Saat Ini</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export const Header = React.memo(HeaderComponent);

