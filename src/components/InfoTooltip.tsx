/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Info, X } from 'lucide-react';

interface InfoTooltipProps {
  title?: string;
  content: string | React.ReactNode;
  className?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  title,
  content,
  className = '',
  placement = 'bottom',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen((prev) => !prev);
  };

  return (
    <span className={`relative inline-flex items-center align-middle mx-1 ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={toggle}
        aria-label="Info penjelasan"
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-zinc-100 hover:bg-emerald-100 text-zinc-500 hover:text-emerald-700 border border-zinc-300 hover:border-emerald-300 transition-colors text-[10px] font-bold cursor-pointer shrink-0"
        title="Klik untuk info penjelasan"
      >
        <span className="leading-none">i</span>
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 w-64 sm:w-72 p-3 bg-zinc-900 text-white rounded-xl shadow-2xl border border-zinc-700 text-xs leading-relaxed animate-in fade-in zoom-in-95 duration-150 ${
            placement === 'top'
              ? 'bottom-full mb-2 left-0 sm:left-1/2 sm:-translate-x-1/2'
              : placement === 'left'
              ? 'right-full mr-2 top-1/2 -translate-y-1/2'
              : placement === 'right'
              ? 'left-full ml-2 top-1/2 -translate-y-1/2'
              : 'top-full mt-2 left-0 sm:left-1/2 sm:-translate-x-1/2'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-zinc-800 mb-1.5">
            <span className="font-semibold text-emerald-400 text-xs flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{title || 'Penjelasan'}</span>
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-zinc-200 text-[11px] max-h-52 overflow-y-auto leading-normal">
            {content}
          </div>
        </div>
      )}
    </span>
  );
};
