'use client';

import React from 'react';
import { Search, User, RefreshCw, Menu } from 'lucide-react';

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
      className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 pb-3 flex items-center justify-between sticky top-0 z-20 transition-all"
    >
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-800 md:hidden transition-all"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Search Input by SKU */}
        <div className="relative w-48 sm:w-72 md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-sku-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por SKU, prenda..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950/70 text-slate-100 placeholder-slate-500 rounded-xl text-xs sm:text-sm border border-slate-800 focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 transition-all"
          />
        </div>
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center gap-4">
        {onRefresh && (
          <button
            id="btn-refresh-data"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-800 transition-all disabled:opacity-50"
            title="Sincronizar con Google Sheets"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-rose-400' : ''}`} />
          </button>
        )}

        <div className="text-xs text-slate-400 px-3 py-1.5 bg-slate-950/60 rounded-xl border border-slate-800">
          Total Prendería: <span className="font-semibold text-rose-400">{totalCount}</span>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 p-0.5 shadow-xs">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-slate-200">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-slate-200">Sunday Admin</p>
            <p className="text-[10px] text-slate-400">admin@sundaycloset.com</p>
          </div>
        </div>
      </div>
    </header>
  );
};
