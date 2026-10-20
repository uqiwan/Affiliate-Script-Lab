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
  settingsSheetOpen?: boolean;
  onToggleSettingsSheet?: (open: boolean) => void;
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

  const [mobileAuthModalOpen, setMobileAuthModalOpen] = useState<boolean>(false);
  const isMobile = isMobileApp();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-2xl border-b border-[#E5E5EA] dark:border-[#38383A] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-4">
        {/* Brand & Subtitle with Official Gagaswara Logo */}
        <div className="flex items-center gap-3 select-none">
          <div className="relative shrink-0">
            <img
              src="/logo.png"
              alt="Gagaswara"
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-[14px] shadow-sm transition-transform active:scale-95"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-[19px] font-bold text-[#1C1C1E] dark:text-white tracking-tight leading-none">
                Gagaswara
              </h1>
            </div>
            <p className="text-[11px] sm:text-[12px] text-[#8E8E93] dark:text-[#98989D] leading-tight mt-1 font-medium tracking-tight">
              Skrip Generator & Teleprompter
            </p>
          </div>
        </div>

        {/* Right Nav: Clean User Profile or Login Button Only */}
        <div className="flex items-center gap-2" ref={dropdownRef}>

          {/* User Profile or Login Button */}
          {!user ? (
            <button
              type="button"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-[#007AFF] hover:bg-[#0071E3] active:scale-95 transition-all cursor-pointer disabled:opacity-60 shadow-xs"
            >
              {isLoggingIn ? (
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span className="hidden xs:inline">Masuk</span>
            </button>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`inline-flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-full transition-all cursor-pointer active:scale-95 border ${
                  dropdownOpen
                    ? 'bg-[#E5E5EA] border-[#007AFF]/40'
                    : 'bg-[#E5E5EA]/70 hover:bg-[#E5E5EA] border-transparent'
                }`}
                title="Akun & Pengaturan Profil"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#007AFF] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-3 h-3" />}
                  </div>
                )}
                <span className="text-xs font-semibold text-[#1C1C1E] dark:text-white max-w-[80px] sm:max-w-[120px] truncate hidden sm:inline">
                  {user.displayName || 'Pengguna'}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-[#8E8E93] transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180 text-[#007AFF]' : ''
                  }`}
                />
              </button>

              {/* iOS Inset Profile Popover Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-[20px] shadow-2xl border border-black/5 dark:border-white/10 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2.5 mb-1.5 rounded-[14px] bg-[#F2F2F7] dark:bg-[#2C2C2E] flex items-center gap-2.5">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#007AFF] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#1C1C1E] dark:text-white truncate">
                        {user.displayName || 'Pengguna'}
                      </div>
                      <div className="text-[11px] text-[#8E8E93] truncate">{user.email}</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => handleMenuAction(onOpenApiKey)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-[12px] text-xs font-medium text-[#1C1C1E] dark:text-white hover:bg-[#F2F2F7] dark:hover:bg-[#2C2C2E] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Key className="w-4 h-4 text-[#007AFF]" />
                        <span>API Key Google AI</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        hasApiKey ? 'bg-[#34C759]/15 text-[#34C759]' : 'bg-[#FF9500]/15 text-[#FF9500]'
                      }`}>
                        {hasApiKey ? 'Aktif' : 'Atur'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMenuAction(onOpenHistory)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-[12px] text-xs font-medium text-[#1C1C1E] dark:text-white hover:bg-[#F2F2F7] dark:hover:bg-[#2C2C2E] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <History className="w-4 h-4 text-[#5856D6]" />
                        <span>Riwayat Sesi Skrip</span>
                      </div>
                      {historyCount > 0 && (
                        <span className="text-[10px] bg-[#E5E5EA] dark:bg-[#38383A] text-[#1C1C1E] dark:text-white px-2 py-0.5 rounded-full font-bold">
                          {historyCount}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMenuAction(onReset)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[12px] text-xs font-medium text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-[#F2F2F7] dark:hover:bg-[#2C2C2E] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-[#8E8E93]" />
                      <span>Reset Sesi Saat Ini</span>
                    </button>

                    <div className="my-1 border-t border-[#E5E5EA] dark:border-[#38383A]" />

                    <button
                      type="button"
                      onClick={() => handleMenuAction(onLogout)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[12px] text-xs font-semibold text-[#FF3B30] hover:bg-[#FF3B30]/10 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-[#FF3B30]" />
                      <span>Keluar / Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* iOS Settings & Options Modal Sheet */}
      {isSettingsSheetVisible && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full sm:max-w-md bg-white dark:bg-[#1C1C1E] rounded-t-[28px] sm:rounded-[24px] shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden animate-in slide-in-from-bottom duration-250">
            {/* Header with Grab Handle on Mobile */}
            <div className="sm:hidden pt-2.5 pb-1 flex justify-center">
              <div className="w-10 h-1.5 bg-[#C6C6C8] dark:bg-[#48484A] rounded-full" />
            </div>

            <div className="px-5 py-3.5 border-b border-[#E5E5EA] dark:border-[#38383A] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4 text-[#007AFF]" />
                <h3 className="text-sm font-bold text-[#1C1C1E] dark:text-white">Pengaturan & Fitur</h3>
              </div>
              <button
                type="button"
                onClick={() => setSettingsSheetVisible(false)}
                className="w-7 h-7 rounded-full bg-[#E5E5EA] dark:bg-[#2C2C2E] flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E] active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inset Grouped Settings List */}
            <div className="p-4 space-y-3">
              {/* Group 1: Akun & Koneksi */}
              <div className="bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[16px] overflow-hidden divide-y divide-[#E5E5EA] dark:divide-[#38383A]">
                <button
                  type="button"
                  onClick={() => handleMenuAction(onOpenApiKey)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-[#1C1C1E] dark:text-white hover:bg-[#E5E5EA]/50 active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center">
                      <Key className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold">API Key Google AI Studio</div>
                      <div className="text-[11px] text-[#8E8E93]">Koneksi Gemini untuk ekstraksi & skrip</div>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    hasApiKey ? 'bg-[#34C759]/15 text-[#34C759]' : 'bg-[#FF9500]/15 text-[#FF9500]'
                  }`}>
                    {hasApiKey ? 'Terkoneksi' : 'Atur'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuAction(onOpenHistory)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-[#1C1C1E] dark:text-white hover:bg-[#E5E5EA]/50 active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#5856D6]/15 text-[#5856D6] flex items-center justify-center">
                      <History className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold">Riwayat Sesi Skrip</div>
                      <div className="text-[11px] text-[#8E8E93]">Tersimpan di cloud / lokal</div>
                    </div>
                  </div>
                  <span className="text-xs text-[#8E8E93] font-semibold">{historyCount} sesi</span>
                </button>
              </div>

              {/* Group 2: Tools & Utilities */}
              <div className="bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[16px] overflow-hidden divide-y divide-[#E5E5EA] dark:divide-[#38383A]">
                <button
                  type="button"
                  onClick={() => handleMenuAction(onOpenSafeZone)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-[#1C1C1E] dark:text-white hover:bg-[#E5E5EA]/50 active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#34C759]/15 text-[#34C759] flex items-center justify-center">
                      <Smartphone className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold">Panduan Safe Zone 9:16</div>
                      <div className="text-[11px] text-[#8E8E93]">Batas aman UI TikTok, Shopee, & Reels</div>
                    </div>
                  </div>
                </button>

                {onOpenApkModal && (
                  <button
                    type="button"
                    onClick={() => handleMenuAction(onOpenApkModal)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-[#1C1C1E] dark:text-white hover:bg-[#E5E5EA]/50 active:scale-[0.99] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#FF9500]/15 text-[#FF9500] flex items-center justify-center">
                        <Smartphone className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold">Bungkus APK Android (.APK)</div>
                        <div className="text-[11px] text-[#8E8E93]">Instal mandiri di ponsel Anda</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF9500]/15 text-[#FF9500]">
                      Siap
                    </span>
                  </button>
                )}
              </div>

              {/* Group 3: Reset */}
              <div className="bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[16px] overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleMenuAction(onReset)}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left text-xs font-semibold text-[#FF3B30] hover:bg-[#FF3B30]/10 active:scale-[0.99] transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-[#FF3B30]/15 text-[#FF3B30] flex items-center justify-center">
                    <RotateCcw className="w-3.5 h-3.5" />
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
