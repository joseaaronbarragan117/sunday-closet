'use client';

import React from 'react';
import { Package, PlusCircle, Calendar, Sparkles, Tag, ShieldCheck, Image as ImageIcon, Store, X } from 'lucide-react';

interface SidebarProps {
  activeTab: 'inventory' | 'add' | 'schedule' | 'banner' | 'pos';
  setActiveTab: (tab: 'inventory' | 'add' | 'schedule' | 'banner' | 'pos') => void;
  onOpenAddModal: () => void;
  onOpenScheduleModal: () => void;
  onOpenBannerModal: () => void;
  onOpenPosModal: () => void;
  hiddenCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenScheduleModal,
  onOpenBannerModal,
  onOpenPosModal,
  hiddenCount,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      <aside
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)',
        }}
        className={`w-72 md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 h-screen fixed md:sticky top-0 z-50 md:z-30 select-none transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none md:translate-x-0 md:pointer-events-auto'
        }`}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 py-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 p-0.5 shadow-lg shadow-rose-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-rose-400" />
                </div>
              </div>
              <div>
                <h1 className="font-serif text-lg font-bold tracking-wide text-slate-100">
                  Sunday Clóset
                </h1>
                <p className="text-[11px] text-slate-400 font-medium tracking-wider uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Admin Private
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          <button
            id="btn-nav-inventory"
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'inventory'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4" />
              <span>Inventario Activo</span>
            </div>
            <Tag className="w-3.5 h-3.5 opacity-60" />
          </button>

          {/* Venta Manual / POS Navigation Button */}
          <button
            id="btn-nav-pos"
            onClick={onOpenPosModal}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-800/40 hover:bg-emerald-600/20 hover:border-emerald-500/30 border border-transparent transition-all group"
          >
            <div className="flex items-center gap-3">
              <Store className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Venta Manual / POS</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              Físico / IG
            </span>
          </button>

          <button
            id="btn-nav-add-item"
            onClick={onOpenAddModal}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-800/40 hover:bg-rose-600/20 hover:border-rose-500/30 border border-transparent transition-all group"
          >
            <PlusCircle className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
            <span>+ Agregar Prenda</span>
          </button>

          <button
            id="btn-nav-schedule-drop"
            onClick={onOpenScheduleModal}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-800/40 hover:bg-amber-600/20 hover:border-amber-500/30 border border-transparent transition-all group"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>+ Programar Drop</span>
            </div>
            {hiddenCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {hiddenCount}
              </span>
            )}
          </button>

          {/* New Banner Update Navigation Button */}
          <button
            id="btn-nav-banner"
            onClick={onOpenBannerModal}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-800/40 hover:bg-indigo-600/20 hover:border-indigo-500/30 border border-transparent transition-all group"
          >
            <ImageIcon className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span>Actualizar Banner Web</span>
          </button>
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-1">
        <div className="flex items-center justify-between text-slate-300 font-medium">
          <span>Fuente de Datos:</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Google Sheets
          </span>
        </div>
        <p className="text-[11px] text-slate-500">Single Source of Truth active</p>
      </div>
    </aside>
    </>
  );
};
