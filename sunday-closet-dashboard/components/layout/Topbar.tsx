'use client';

import React from 'react';
import { Search, RefreshCw, Menu } from 'lucide-react';

interface TopbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  totalCount: number;
  onOpenMobileMenu?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  searchQuery,
  setSearchQuery,
  onRefresh,
  isRefreshing = false,
  totalCount,
  onOpenMobileMenu,
}) => {
  return (
    <header 
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)' }}
      className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 pb-3 flex items-center justify-between sticky top-0 z-20 transition-all w-full max-w-full overflow-hidden"
    >
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 mr-2">
        {/* Mobile Hamburger Button */}
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-800 md:hidden transition-all shrink-0"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Search Input by SKU */}
        <div className="relative flex-1 min-w-0 max-w-xs sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-sku-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por SKU, prenda..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950/70 text-slate-100 placeholder-slate-500 rounded-xl text-xs sm:text-sm border border-slate-800 focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 transition-all truncate"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {onRefresh && (
          <button
            id="btn-refresh-data"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-800 transition-all disabled:opacity-50 shrink-0"
            title="Sincronizar con Google Sheets"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-rose-400' : ''}`} />
          </button>
        )}

        <div className="text-xs text-slate-400 px-2.5 sm:px-3 py-1.5 bg-slate-950/60 rounded-xl border border-slate-800 shrink-0">
          <span className="hidden sm:inline">Total Prendería: </span>
          <span className="sm:hidden font-mono text-[11px]">Total: </span>
          <span className="font-semibold text-rose-400">{totalCount}</span>
        </div>
      </div>
    </header>
  );
};
