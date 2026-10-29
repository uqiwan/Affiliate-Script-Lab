/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ChevronDown, Check, X, ChevronRight } from 'lucide-react';

export interface DropdownOption<T extends string | number = string | number> {
  value: T;
  label: string;
  sublabel?: string;
  badge?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface DropdownSelectProps<T extends string | number> {
  id?: string;
  label?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tooltip?: React.ReactNode;
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
  rightBadge?: React.ReactNode;
}

export function DropdownSelect<T extends string | number>({
  id,
  label,
  icon: HeaderIcon,
  tooltip,
  value,
  options,
  onChange,
  disabled = false,
  className = '',
  rightBadge,
}: DropdownSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];
  const SelectedIcon = selectedOption?.icon || HeaderIcon;

  // Handle escape key & body scroll lock when Bottom Sheet is open
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSelectOption = (optVal: T) => {
    onChange(optVal);
    setIsOpen(false);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={id}
            className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5"
          >
            {HeaderIcon && <HeaderIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
            <span>{label}</span>
            {tooltip}
          </label>
          {rightBadge}
        </div>
      )}

      {/* Trigger Button - Taller, well-padded, comfortable 2-row layout */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`w-full py-2.5 sm:py-3 px-3.5 rounded-xl bg-white dark:bg-[#1C1C1E] border transition-all flex flex-col justify-center gap-1.5 text-left cursor-pointer active:scale-[0.99] select-none ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800'
            : isOpen
            ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
            : 'border-slate-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500/60 shadow-2xs'
        }`}
      >
        {/* Baris 1: Ikon Kecil + Judul di kiri sejajar, Tombol Ubah di tepi kanan */}
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {SelectedIcon && (
              <SelectedIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug whitespace-nowrap overflow-hidden text-ellipsis sm:whitespace-normal">
              {selectedOption?.label}
            </span>
          </div>

          {/* Tombol Ubah sejajar di tepi kanan dengan background sedikit biru */}
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/70 dark:border-blue-900/50 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shrink-0">
            <span>Ubah</span>
            <ChevronDown className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
          </div>
        </div>

        {/* Baris 2: Teks Keterangan membentang penuh dari kiri ke kanan rapi dan mudah dibaca */}
        {selectedOption?.sublabel && (
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 font-medium leading-normal w-full text-left">
            {selectedOption.sublabel}
          </p>
        )}
      </button>

      {/* Panel Melayang (Floating Modal - Numpang di Atas Aplikasi Utama, Tidak Mepet Tepi) */}
      {/* Mounted at viewport level with margins on left, right, and bottom so it looks like an elevated detached card */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={label ? `Pilihan ${label}` : 'Pilihan Menu'}
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-3.5 sm:p-6 pb-4 sm:pb-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div className="w-full max-w-lg bg-white dark:bg-[#1C1C1E] rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200 text-slate-900 dark:text-white">

            {/* Sheet Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {HeaderIcon && (
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <HeaderIcon className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {label ? `Pilih ${label}` : 'Pilih Opsi'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Pilih opsi yang paling sesuai untuk video Anda
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Option List - Zero Truncation */}
            <div className="p-4 overflow-y-auto space-y-2.5 flex-1 max-h-[62vh]">
              {options.map((option) => {
                const isSelected = option.value === value;
                const OptionIcon = option.icon || HeaderIcon;

                return (
                  <button
                    key={String(option.value)}
                    type="button"
                    onClick={() => handleSelectOption(option.value)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3.5 cursor-pointer active:scale-[0.99] select-none ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs ring-2 ring-blue-500/20'
                        : 'bg-white dark:bg-[#1C1C1E] border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600'
                    }`}
                  >
                    {/* Option Icon */}
                    {OptionIcon && (
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                          isSelected
                            ? 'bg-white text-blue-600'
                            : 'bg-slate-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 border border-slate-200/60 dark:border-zinc-700'
                        }`}
                      >
                        <OptionIcon className="w-4 h-4" />
                      </div>
                    )}

                    {/* Option Content - Full Non-Truncated Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <span
                          className={`text-xs sm:text-sm font-bold leading-snug ${
                            isSelected ? 'text-white' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {option.label}
                        </span>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {option.badge && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                isSelected
                                  ? 'bg-white/20 text-white border border-white/30'
                                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700'
                              }`}
                            >
                              {option.badge}
                            </span>
                          )}

                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-white text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                      </div>

                      {option.sublabel && (
                        <p
                          className={`text-xs mt-1 leading-relaxed ${
                            isSelected
                              ? 'text-blue-100 font-medium'
                              : 'text-slate-500 dark:text-zinc-400'
                          }`}
                        >
                          {option.sublabel}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="px-5 py-3 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#1C1C1E] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
