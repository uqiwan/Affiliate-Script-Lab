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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative inline-flex items-center align-middle ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={toggle}
        aria-label="Info penjelasan"
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-zinc-200/80 hover:bg-emerald-100 text-zinc-600 hover:text-emerald-700 transition-colors text-[10px] font-bold cursor-pointer shrink-0"
        title="Klik untuk info penjelasan"
      >
        <Info className="w-2.5 h-2.5" />
      </button>

      {isOpen && (
        <div
          className={`absolute z-40 w-64 sm:w-72 p-3 bg-zinc-900 text-white rounded-xl shadow-xl border border-zinc-700 text-xs leading-relaxed animate-in fade-in zoom-in-95 duration-150 ${
            placement === 'top'
              ? 'bottom-full mb-2 left-1/2 -translate-x-1/2'
              : placement === 'left'
              ? 'right-full mr-2 top-1/2 -translate-y-1/2'
              : placement === 'right'
              ? 'left-full ml-2 top-1/2 -translate-y-1/2'
              : 'top-full mt-2 left-1/2 -translate-x-1/2'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-zinc-800 mb-1.5">
            <span className="font-semibold text-emerald-400 text-[11px] flex items-center gap-1">
              <Info className="w-3 h-3" />
              {title || 'Penjelasan'}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="text-zinc-200 text-[11px] max-h-48 overflow-y-auto">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};
