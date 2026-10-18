/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Info, X } from 'lucide-react';

interface InfoTipProps {
  content: string;
  title?: string;
  className?: string;
  size?: 'xs' | 'sm';
}

export const InfoTip: React.FC<InfoTipProps> = ({
  content,
  title = 'Informasi',
  className = '',
  size = 'xs',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="w-4 h-4 rounded-full bg-zinc-100 hover:bg-emerald-100 text-zinc-400 hover:text-emerald-700 inline-flex items-center justify-center transition-colors cursor-pointer border border-zinc-200"
        title="Klik untuk melihat penjelasan"
        aria-label="Info penjelasan"
      >
        <span className="text-[10px] font-bold leading-none">i</span>
      </button>

      {isOpen && (
        <div className="absolute z-40 top-full left-0 mt-1.5 w-64 sm:w-72 p-3 bg-zinc-900 text-white rounded-xl shadow-xl text-[11px] leading-relaxed animate-in fade-in zoom-in-95 duration-150 border border-zinc-700">
          <div className="flex items-center justify-between font-bold text-emerald-400 mb-1 border-b border-zinc-800 pb-1">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              {title}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="text-zinc-400 hover:text-white p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="text-zinc-200">{content}</div>
        </div>
      )}
    </div>
  );
};
