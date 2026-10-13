'use client';

import React, { useState, useMemo } from 'react';
import { InventoryItem } from '@/types/inventory';
import { DriveImage } from '@/components/common/DriveImage';
import {
  Search,
  Eye,
  EyeOff,
  Sparkles,
  Tag,
  X,
  Copy,
  Check,
  Layers,
} from 'lucide-react';

interface GalleryFeedViewProps {
  items: InventoryItem[];
  onToggleVisibility?: (sku: string, currentVisibility: boolean) => void;
  isUpdatingSku?: string | null;
}

export const GalleryFeedView: React.FC<GalleryFeedViewProps> = ({
  items,
  onToggleVisibility,
  isUpdatingSku,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Disponible' | 'Reservado' | 'Vendido' | 'Programado'>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [styleFilter, setStyleFilter] = useState<'all' | 'Vintage' | 'Cute' | 'Casual'>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [copiedSku, setCopiedSku] = useState(false);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.sku.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.color.toLowerCase().includes(q) ||
        (item.lotName && item.lotName.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (visibilityFilter === 'visible' && !item.visibleInWeb) return false;
      if (visibilityFilter === 'hidden' && item.visibleInWeb) return false;
      if (styleFilter !== 'all' && item.style !== styleFilter) return false;

      return true;
    });
  }, [items, searchQuery, statusFilter, visibilityFilter, styleFilter]);

  const handleCopySku = (sku: string) => {
    navigator.clipboard.writeText(sku);
    setCopiedSku(true);
    setTimeout(() => setCopiedSku(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Header Bar */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar en galería por SKU, prenda, marca, color o lote..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-950 text-slate-100 placeholder-slate-500 rounded-2xl text-xs sm:text-sm border border-slate-800 focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Counter */}
          <div className="text-xs text-slate-400 px-3.5 py-2 bg-slate-950/70 rounded-2xl border border-slate-800/80 flex items-center justify-between sm:justify-start gap-2 shrink-0">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Fotos:</span>
            </span>
            <span className="font-bold text-rose-400">
              {filteredItems.length}
              <span className="text-slate-500 font-normal"> / {items.length}</span>
            </span>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60 text-xs">
          {/* Status Filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[11px] text-slate-500 font-medium px-1">Estado:</span>
            {(['all', 'Disponible', 'Reservado', 'Vendido', 'Programado'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {st === 'all' ? 'Todos' : st}
              </button>
            ))}
          </div>

          <div className="hidden sm:block h-4 w-px bg-slate-800 mx-1" />

          {/* Web Visibility Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-500 font-medium px-1">Web:</span>
            <button
              onClick={() => setVisibilityFilter('all')}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                visibilityFilter === 'all'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setVisibilityFilter('visible')}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                visibilityFilter === 'visible'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3 h-3 text-emerald-400" />
              <span>En Web</span>
            </button>
            <button
              onClick={() => setVisibilityFilter('hidden')}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                visibilityFilter === 'hidden'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <EyeOff className="w-3 h-3 text-amber-400" />
              <span>Ocultos</span>
            </button>
          </div>

          {/* Reset Filters button if any active */}
          {(statusFilter !== 'all' || visibilityFilter !== 'all' || searchQuery !== '') && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setVisibilityFilter('all');
                setStyleFilter('all');
                setSearchQuery('');
              }}
              className="ml-auto text-[11px] text-rose-400 hover:text-rose-300 underline font-medium px-1"
            >
              Restablecer filtros
            </button>
          )}
        </div>
      </div>

      {/* Instagram 3-per-row Feed Grid on Mobile, Responsive Grid on Desktop */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400 space-y-2">
          <Tag className="w-8 h-8 mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-300">No se encontraron prendas</p>
          <p className="text-xs text-slate-500">Prueba con otros términos de búsqueda o filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-0.5 sm:gap-1.5 md:gap-2 rounded-2xl overflow-hidden bg-slate-950 p-0.5 sm:p-2 border border-slate-800/80">
          {filteredItems.map((item) => {
            const isVisible = item.visibleInWeb;
            const isAvailable = item.status === 'Disponible';
            const isSold = item.status === 'Vendido';
            const isReserved = item.status === 'Reservado';
            const isScheduled = item.status === 'Programado';

            return (
              <div
                key={item.sku}
                onClick={() => setSelectedItem(item)}
                className="aspect-square relative group cursor-pointer bg-slate-900 overflow-hidden select-none"
              >
                {/* Photo */}
                <DriveImage
                  src={item.photoUrl}
                  alt={`${item.type} ${item.brand}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                />

                {/* Subtle Status Pill / Indicator on Mobile */}
                <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 flex items-center gap-1 pointer-events-none z-10">
                  {isVisible && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" title="Visible en Web" />
                  )}
                  {isSold && (
                    <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-slate-950/80 text-rose-300 border border-rose-500/30">
                      Vendido
                    </span>
                  )}
                  {isReserved && (
                    <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-slate-950/80 text-amber-300 border border-amber-500/30">
                      Reservado
                    </span>
                  )}
                  {isScheduled && (
                    <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-slate-950/80 text-purple-300 border border-purple-500/30">
                      Drop
                    </span>
                  )}
                </div>

                {/* Price Tag in Bottom Corner */}
                <div className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 z-10 pointer-events-none">
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-slate-950/80 backdrop-blur-xs text-rose-300 border border-slate-800">
                    ${item.pricePublished || item.priceWeb}
                  </span>
                </div>

                {/* Hover Overlay for Desktop & Tablet */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2 sm:p-2.5 text-left pointer-events-none">
                  <p className="text-[10px] text-rose-400 font-mono tracking-tight truncate">{item.sku}</p>
                  <p className="text-xs font-bold text-white truncate leading-tight">{item.type}</p>
                  <p className="text-[11px] text-slate-300 truncate">{item.brand} • {item.size}</p>
                  {item.lotName && (
                    <p className="text-[9px] text-amber-300 truncate mt-0.5 flex items-center gap-1">
                      <Layers className="w-2.5 h-2.5" /> {item.lotName}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Item Quick Detail Modal */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-rose-400 px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  {selectedItem.sku}
                </span>
                <button
                  onClick={() => handleCopySku(selectedItem.sku)}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Copiar SKU"
                >
                  {copiedSku ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Photo View */}
              <div className="w-full aspect-square max-h-72 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative">
                <DriveImage
                  src={selectedItem.photoUrl}
                  alt={selectedItem.type}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Garment Title and Brand */}
              <div>
                <h3 className="text-lg font-bold text-white">{selectedItem.type}</h3>
                <p className="text-xs text-slate-400">
                  Marca: <span className="text-slate-200 font-medium">{selectedItem.brand || 'Sin especificar'}</span> • Talla: <span className="text-slate-200 font-medium">{selectedItem.size}</span>
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Color</span>
                  <span className="font-medium text-slate-200">{selectedItem.color || '—'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Estilo</span>
                  <span className="font-medium text-slate-200">{selectedItem.style}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Condición</span>
                  <span className="font-medium text-slate-200">{selectedItem.condition}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Estado</span>
                  <span className="font-medium text-emerald-400">{selectedItem.status}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Costo Base</span>
                  <span className="font-medium text-slate-300">${selectedItem.cost} MXN</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Precio Publicado</span>
                  <span className="font-bold text-rose-400">${selectedItem.pricePublished} MXN</span>
                </div>
              </div>

              {/* Lot info if available */}
              {selectedItem.lotName && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="font-bold text-amber-200">Lote: {selectedItem.lotName}</p>
                      <p className="text-[10px] text-amber-400/80">Fecha: {selectedItem.lotDate || 'Sin fecha'}</p>
                    </div>
                  </div>
                  {selectedItem.lotTotalCost !== undefined && (
                    <span className="font-mono text-amber-300 font-semibold text-[11px]">
                      Lote: ${selectedItem.lotTotalCost}
                    </span>
                  )}
                </div>
              )}

              {/* Price Breakdown */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                  Desglose de Precios por Canal
                </span>
                <div className="grid grid-cols-4 gap-2 text-center pt-1">
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Sunday</span>
                    <span className="font-bold text-slate-200">${selectedItem.priceSunday}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Web</span>
                    <span className="font-bold text-emerald-400">${selectedItem.priceWeb}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Facebook</span>
                    <span className="font-bold text-slate-200">${selectedItem.priceFB}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">Paca</span>
                    <span className="font-bold text-slate-200">${selectedItem.pricePaca}</span>
                  </div>
                </div>
              </div>

              {/* Visibility Action */}
              {onToggleVisibility && (
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedItem.visibleInWeb ? (
                      <Eye className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-amber-400" />
                    )}
                    <div>
                      <p className="text-xs font-semibold text-slate-200">
                        {selectedItem.visibleInWeb ? 'Visible en Tienda Web' : 'Oculto en Tienda Web'}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {selectedItem.visibleInWeb
                          ? 'Los clientes pueden ver y comprar esta prenda en la web'
                          : 'Prenda privada guardada para drops o catálogo interno'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onToggleVisibility(selectedItem.sku, selectedItem.visibleInWeb);
                      setSelectedItem({
                        ...selectedItem,
                        visibleInWeb: !selectedItem.visibleInWeb,
                      });
                    }}
                    disabled={isUpdatingSku === selectedItem.sku}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedItem.visibleInWeb
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                    }`}
                  >
                    {isUpdatingSku === selectedItem.sku
                      ? 'Actualizando...'
                      : selectedItem.visibleInWeb
                      ? 'Ocultar de Web'
                      : 'Hacer Visible'}
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-800 flex justify-end bg-slate-950/40">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
