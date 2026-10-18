/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  History,
  X,
  Clock,
  ArrowRight,
  Trash2,
  Layers,
  FileText,
  Search,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { HistorySession } from '../types';
import { InfoTooltip } from './InfoTooltip';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistorySession[];
  onLoadSession: (session: HistorySession) => void;
  onDeleteSession: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onLoadSession,
  onDeleteSession,
  onClearHistory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreviewId, setSelectedPreviewId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.productName.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.scripts.some((s) => s.title.toLowerCase().includes(q) || s.angle.toLowerCase().includes(q))
    );
  });

  const formatTimestamp = (ts: number) => {
    try {
      const d = new Date(ts);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Baru saja';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[88vh] shadow-2xl border border-zinc-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 flex items-center">
                <span>Riwayat Skrip</span>
                <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {history.length} Sesi
                </span>
                <InfoTooltip
                  title="Riwayat Pembuatan Skrip"
                  content="Setiap kali Anda menekan 'Buat Skrip', sesi skrip dan brief produk otomatis diarsipkan di sini. Anda dapat memuatnya kembali ke workspace kapan saja."
                />
              </h2>
              <p className="text-xs text-zinc-500">
                Akses dan muat kembali skrip yang pernah dibuat sebelumnya
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar if history has items */}
        {history.length > 0 && (
          <div className="p-3 border-b border-zinc-100 bg-white shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan nama produk atau angle skrip..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
                <History className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-zinc-800">
                  Belum Ada Riwayat Tersimpan
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Setiap kali Anda menekan <strong>"Buat Skrip"</strong>, paket skrip dan brief produk akan otomatis diarsipkan di sini agar bisa digunakan kembali kapan saja.
                </p>
              </div>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-500">
              Tidak ditemukan riwayat yang cocok dengan kata kunci pencarian.
            </div>
          ) : (
            filteredHistory.map((session) => {
              const isExpanded = selectedPreviewId === session.id;

              return (
                <div
                  key={session.id}
                  className="p-3.5 rounded-xl border border-zinc-200 bg-white hover:border-emerald-300 transition-all space-y-2.5 shadow-2xs"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1 flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 line-clamp-1">
                          {session.productName}
                        </h4>
                        <span className="text-[10px] text-zinc-400 flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(session.timestamp)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 font-medium">
                          {session.category || 'Umum'}
                        </span>
                        <span>·</span>
                        <span className="text-emerald-700 font-semibold">
                          {session.scripts.length} Konsep Skrip
                        </span>
                        <span>·</span>
                        <span>{session.durationSeconds} Detik</span>
                        <span>·</span>
                        <span className="truncate max-w-[140px]">
                          {session.config.style}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedPreviewId(isExpanded ? null : session.id)
                        }
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer"
                        title="Lihat daftar konsep skrip"
                      >
                        {isExpanded ? 'Tutup' : 'Lihat'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onLoadSession(session);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all cursor-pointer flex items-center gap-1"
                        title="Buka kembali skrip ini di workspace"
                      >
                        <span>Muat</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteSession(session.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus sesi ini dari riwayat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Script Previews */}
                  {isExpanded && (
                    <div className="mt-2 pt-2 border-t border-zinc-100 space-y-2 animate-in fade-in duration-150">
                      <div className="text-[11px] font-semibold text-zinc-700">
                        Konsep Skrip dalam Sesi Ini:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {session.scripts.map((sc, scIdx) => (
                          <div
                            key={sc.id || scIdx}
                            className="p-2 rounded-lg bg-zinc-50 border border-zinc-200 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between font-bold text-zinc-800 text-[11px]">
                              <span>Konsep #{scIdx + 1}</span>
                              <span className="text-[10px] text-emerald-700 font-semibold">
                                {sc.angle.split('/')[0]}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-600 line-clamp-2">
                              {sc.title}
                            </p>
                            <p className="text-[10px] text-zinc-500 italic line-clamp-2">
                              "{sc.voiceoverOnly.slice(0, 100)}..."
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-3 sm:p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between shrink-0">
          {history.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Kosongkan semua riwayat skrip?')) {
                  onClearHistory();
                }
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
            >
              Hapus Semua Riwayat
            </button>
          ) : (
            <span className="text-xs text-zinc-400">
              Riwayat otomatis diperbarui
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
