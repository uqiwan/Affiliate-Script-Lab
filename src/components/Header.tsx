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
import { TELEPROMPTER_THEMES, TeleprompterThemeId } from '../utils/teleprompterThemes';
import { Palette, Check } from 'lucide-react';

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
  currentThemeId: TeleprompterThemeId;
  onSelectTheme: (themeId: TeleprompterThemeId) => void;
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
  currentThemeId,
  onSelectTheme,
  settingsSheetOpen: externalSettingsSheetOpen,
  onToggleSettingsSheet,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState<boolean>(false);
  const [sheetThemeDropdownOpen, setSheetThemeDropdownOpen] = useState<boolean>(false);
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

  const prompterThemesList = Object.values(TELEPROMPTER_THEMES);

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

        {/* Right Nav: Account Icon with Theme & Settings Menu */}
        <div className="flex items-center gap-2" ref={dropdownRef}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`inline-flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-full transition-all cursor-pointer active:scale-95 border ${
                dropdownOpen
                  ? 'bg-[#E5E5EA] dark:bg-[#38383A] border-[#007AFF]/40 shadow-sm'
                  : 'bg-[#E5E5EA]/70 dark:bg-[#2C2C2E]/80 hover:bg-[#E5E5EA] dark:hover:bg-[#38383A] border-transparent'
              }`}
              title="Menu Akun & Tema Teleprompter"
              aria-label="Menu Akun & Tema Teleprompter"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-black/10 dark:ring-white/10"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#007AFF] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                </div>
              )}
              <span className="text-xs font-semibold text-[#1C1C1E] dark:text-white max-w-[80px] sm:max-w-[120px] truncate hidden sm:inline">
                {user?.displayName || 'Akun'}
              </span>
              <ChevronDown
                className={`w-3 h-3 text-[#8E8E93] transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180 text-[#007AFF]' : ''
                }`}
              />
            </button>

            {/* iOS Inset Profile & Theme Popover Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-2xl rounded-[22px] shadow-2xl border border-black/5 dark:border-white/10 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
                {/* User Info / Login status header */}
                <div className="px-3 py-2.5 mb-2 rounded-[16px] bg-[#F2F2F7] dark:bg-[#2C2C2E] flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-black/10"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#007AFF] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-[#1C1C1E] dark:text-white truncate">
                        {user ? user.displayName || 'Pengguna' : 'Pengguna Gagaswara'}
                      </div>
                      <div className="text-[11px] text-[#8E8E93] truncate">
                        {user ? user.email : 'Mode Offline / Kunci Pribadi'}
                      </div>
                    </div>
                  </div>

                  {!user && (
                    <button
                      type="button"
                      onClick={() => handleMenuAction(onLogin)}
                      disabled={isLoggingIn}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-white bg-[#007AFF] hover:bg-[#0071E3] active:scale-95 transition-all shrink-0 cursor-pointer shadow-xs disabled:opacity-60"
                    >
                      {isLoggingIn ? (
                        <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span>Masuk</span>
                      )}
                    </button>
                  )}
                </div>

                {/* ======================================================== */}
                {/* PRESET TEMA KHUSUS TELEPROMPTER (DROPDOWN RINGKAS)      */}
                {/* ======================================================== */}
                {(() => {
                  const activeTheme = TELEPROMPTER_THEMES[currentThemeId] || TELEPROMPTER_THEMES.dark_pro;
                  return (
                    <div className="mb-2 p-2 rounded-[16px] bg-[#F2F2F7]/70 dark:bg-[#2C2C2E]/70 border border-[#E5E5EA] dark:border-[#38383A]">
                      <div className="flex items-center justify-between mb-1.5 px-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1C1E] dark:text-white">
                          <Palette className="w-3.5 h-3.5 text-[#007AFF]" />
                          <span>Tema Teleprompter</span>
                        </div>
                        <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">
                          Pilihan
                        </span>
                      </div>

                      {/* Dropdown Selector Button */}
                      <button
                        type="button"
                        onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                        className="w-full flex items-center justify-between p-2 rounded-[12px] bg-white dark:bg-[#1C1C1E] border border-[#007AFF]/35 hover:border-[#007AFF] transition-all cursor-pointer shadow-xs active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            style={{ backgroundColor: activeTheme.previewSwatch.bg }}
                            className="w-6 h-6 rounded-full flex items-center justify-center border border-zinc-400/30 shadow-xs shrink-0 relative overflow-hidden"
                          >
                            <span
                              style={{ color: activeTheme.previewSwatch.text }}
                              className="text-[10px] font-black"
                            >
                              T
                            </span>
                            <span
                              style={{ backgroundColor: activeTheme.previewSwatch.highlight }}
                              className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full ring-1 ring-white"
                            />
                          </div>
                          <div className="min-w-0 text-left">
                            <div className="text-xs font-bold text-[#1C1C1E] dark:text-white flex items-center gap-1.5">
                              <span>{activeTheme.name}</span>
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#007AFF]/15 text-[#007AFF]">
                                Aktif
                              </span>
                            </div>
                            <p className="text-[10px] text-[#8E8E93] truncate leading-tight mt-0.5">
                              {activeTheme.tagline}
                            </p>
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-[#8E8E93] transition-transform duration-200 shrink-0 ml-1.5 ${
                            themeDropdownOpen ? 'rotate-180 text-[#007AFF]' : ''
                          }`}
                        />
                      </button>

                      {/* Dropdown Options List */}
                      {themeDropdownOpen && (
                        <div className="mt-1.5 pt-1.5 border-t border-[#E5E5EA] dark:border-[#38383A] space-y-1 animate-in fade-in duration-150">
                          {prompterThemesList.map((t) => {
                            const isSelected = (currentThemeId || 'dark_pro') === t.id;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => {
                                  onSelectTheme(t.id);
                                  setThemeDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between p-2 rounded-[10px] text-left transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#007AFF]/10 text-[#007AFF] font-bold border border-[#007AFF]/25'
                                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-[#1C1C1E] dark:text-zinc-200 border border-transparent'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div
                                    style={{ backgroundColor: t.previewSwatch.bg }}
                                    className="w-5 h-5 rounded-full flex items-center justify-center border border-zinc-400/30 shadow-xs shrink-0 relative overflow-hidden"
                                  >
                                    <span style={{ color: t.previewSwatch.text }} className="text-[9px] font-bold">
                                      T
                                    </span>
                                    <span
                                      style={{ backgroundColor: t.previewSwatch.highlight }}
                                      className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full ring-1 ring-white"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-xs font-semibold block">{t.name}</span>
                                    <span className="text-[9px] text-[#8E8E93] block truncate">{t.tagline}</span>
                                  </div>
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 text-[#007AFF] shrink-0 stroke-[2.5]" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}

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

                  {onOpenApkModal && (
                    <button
                      type="button"
                      onClick={() => handleMenuAction(onOpenApkModal)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-[12px] text-xs font-medium text-[#1C1C1E] dark:text-white hover:bg-[#F2F2F7] dark:hover:bg-[#2C2C2E] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Smartphone className="w-4 h-4 text-[#FF9500]" />
                        <span>Setelan Prompter Melayang Android</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF9500]/15 text-[#FF9500]">
                        Atur
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleMenuAction(onReset)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[12px] text-xs font-medium text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-[#F2F2F7] dark:hover:bg-[#2C2C2E] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-[#8E8E93]" />
                    <span>Reset Sesi Saat Ini</span>
                  </button>

                  {user && (
                    <>
                      <div className="my-1 border-t border-[#E5E5EA] dark:border-[#38383A]" />
                      <button
                        type="button"
                        onClick={() => handleMenuAction(onLogout)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[12px] text-xs font-semibold text-[#FF3B30] hover:bg-[#FF3B30]/10 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-[#FF3B30]" />
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
              {/* Group 0: Tema Teleprompter (Dropdown Ringkas) */}
              {(() => {
                const activeTheme = TELEPROMPTER_THEMES[currentThemeId] || TELEPROMPTER_THEMES.dark_pro;
                return (
                  <div className="bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[16px] p-3 space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#1C1C1E] dark:text-white">
                        <Palette className="w-4 h-4 text-[#007AFF]" />
                        <span>Tema Teks Teleprompter</span>
                      </div>
                      <span className="text-[10px] font-bold text-[#8E8E93]">Pilihan</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSheetThemeDropdownOpen(!sheetThemeDropdownOpen)}
                      className="w-full flex items-center justify-between p-2 rounded-[12px] bg-white dark:bg-[#1C1C1E] border border-[#007AFF]/35 hover:border-[#007AFF] transition-all cursor-pointer shadow-xs active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          style={{ backgroundColor: activeTheme.previewSwatch.bg }}
                          className="w-6 h-6 rounded-full flex items-center justify-center border border-zinc-400/30 shadow-xs shrink-0 relative overflow-hidden"
                        >
                          <span
                            style={{ color: activeTheme.previewSwatch.text }}
                            className="text-[10px] font-black"
                          >
                            T
                          </span>
                          <span
                            style={{ backgroundColor: activeTheme.previewSwatch.highlight }}
                            className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full ring-1 ring-white"
                          />
                        </div>
                        <div className="min-w-0 text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#1C1C1E] dark:text-white">{activeTheme.name}</span>
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#007AFF]/15 text-[#007AFF]">
                              Aktif
                            </span>
                          </div>
                          <p className="text-[10px] text-[#8E8E93] truncate leading-tight mt-0.5">
                            {activeTheme.tagline}
                          </p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-[#8E8E93] transition-transform duration-200 shrink-0 ml-1.5 ${
                          sheetThemeDropdownOpen ? 'rotate-180 text-[#007AFF]' : ''
                        }`}
                      />
                    </button>

                    {sheetThemeDropdownOpen && (
                      <div className="pt-1.5 border-t border-[#E5E5EA] dark:border-[#38383A] space-y-1 animate-in fade-in duration-150">
                        {prompterThemesList.map((t) => {
                          const isSelected = (currentThemeId || 'dark_pro') === t.id;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                onSelectTheme(t.id);
                                setSheetThemeDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between p-2 rounded-[10px] text-left transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#007AFF]/10 text-[#007AFF] font-bold border border-[#007AFF]/25'
                                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-[#1C1C1E] dark:text-zinc-200 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div
                                  style={{ backgroundColor: t.previewSwatch.bg }}
                                  className="w-5 h-5 rounded-full flex items-center justify-center border border-zinc-400/30 shadow-xs shrink-0 relative overflow-hidden"
                                >
                                  <span style={{ color: t.previewSwatch.text }} className="text-[9px] font-bold">
                                    T
                                  </span>
                                  <span
                                    style={{ backgroundColor: t.previewSwatch.highlight }}
                                    className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full ring-1 ring-white"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <span className="text-xs font-semibold block">{t.name}</span>
                                  <span className="text-[9px] text-[#8E8E93] block truncate">{t.tagline}</span>
                                </div>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#007AFF] shrink-0 stroke-[2.5]" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

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
                        <div className="font-semibold">Setelan Prompter Melayang & APK (.APK)</div>
                        <div className="text-[11px] text-[#8E8E93]">Atur kecepatan, transparansi & panduan melayang</div>
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
