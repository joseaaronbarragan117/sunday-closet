'use client';

import React, { useState, useMemo } from 'react';
import { InventoryItem } from '@/types/inventory';
import { DriveImage } from '@/components/common/DriveImage';
import {
  Search,
  Instagram,
  Check,
  Copy,
  Layers,
  ArrowUpDown,
  X,
  FileText,
  Sparkles,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';

interface InstagramListViewProps {
  items: InventoryItem[];
}

export const InstagramListView: React.FC<InstagramListViewProps> = ({ items }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLot, setSelectedLot] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedSkus, setSelectedSkus] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);
  const [limitWarning, setLimitWarning] = useState(false);

  // Extract dynamic unique lot names from inventory items
  const availableLots = useMemo(() => {
    const lots = new Set<string>();
    items.forEach((item) => {
      if (item.lotName && item.lotName.trim()) {
        lots.add(item.lotName.trim());
      }
    });
    return Array.from(lots);
  }, [items]);

  // Lookup map for fast item access by SKU
  const itemsBySku = useMemo(() => {
    const map = new Map<string, InventoryItem>();
    items.forEach((item) => map.set(item.sku, item));
    return map;
  }, [items]);

  // Filter and sort items (Does NOT affect selectedSkus)
  const displayItems = useMemo(() => {
    let result = items.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.sku.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.color.toLowerCase().includes(q) ||
        (item.lotName && item.lotName.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (selectedLot !== 'all') {
        if (!item.lotName || item.lotName.trim() !== selectedLot) {
          return false;
        }
      }

      return true;
    });

    // Chronological sorting: Default newest to oldest (in reverse index order)
    if (sortOrder === 'newest') {
      result = [...result].reverse();
    } else {
      result = [...result];
    }

    return result;
  }, [items, searchQuery, selectedLot, sortOrder]);

  // Toggle selection for a garment
  const handleToggleSelect = (sku: string) => {
    setLimitWarning(false);
    setSelectedSkus((prev) => {
      if (prev.includes(sku)) {
        return prev.filter((s) => s !== sku);
      }
      if (prev.length >= 10) {
        setLimitWarning(true);
        setTimeout(() => setLimitWarning(false), 3000);
        return prev;
      }
      return [...prev, sku];
    });
  };

  // Generate Instagram Caption lines: [Descripción o Nombre de la prenda] | [Talla] | $[Precio]
  const handleGeneratePublication = () => {
    if (selectedSkus.length === 0) return;

    const lines = selectedSkus.map((sku) => {
      const item = itemsBySku.get(sku);
      if (!item) return sku;

      const typeClean = item.type.trim();
      const brandClean = (item.brand || '').trim();

      // Combine type + brand if brand isn't already inside type
      let title = typeClean;
      if (brandClean && !typeClean.toLowerCase().includes(brandClean.toLowerCase())) {
        title = `${typeClean} ${brandClean}`;
      }

      const size = item.size || 'M';
      const price = item.pricePublished || item.priceWeb || item.cost || 0;

      return `${title} | ${size} | $${price}`;
    });

    const output = lines.join('\n');
    setGeneratedText(output);
    setIsModalOpen(true);
    setCopied(false);
  };

  // Copy generated text to clipboard
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  // Deselect all
  const handleClearSelection = () => {
    setSelectedSkus([]);
    setLimitWarning(false);
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter Controls (Identical aesthetic to Galería Feed) */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        {/* Title bar with Instagram badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-500 text-white shadow-md shadow-pink-500/20">
              <Instagram className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Listas de Instagram — Carrusel
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20">
                  Max 10
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Selecciona hasta 10 prendas para generar la descripción del post automáticamente.
              </p>
            </div>
          </div>

          {/* Quick Counter of selected items */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-3 py-1.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-semibold flex items-center gap-2">
              <span className="text-slate-400">Seleccionadas:</span>
              <span
                className={`font-mono text-sm font-bold ${
                  selectedSkus.length === 10
                    ? 'text-pink-400 animate-pulse'
                    : selectedSkus.length > 0
                    ? 'text-rose-400'
                    : 'text-slate-500'
                }`}
              >
                {selectedSkus.length} / 10
              </span>
            </div>

            {selectedSkus.length > 0 && (
              <button
                onClick={handleClearSelection}
                className="px-2.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors flex items-center gap-1"
                title="Deseleccionar todas las prendas"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por SKU, tipo, marca, color o lote..."
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

          {/* Sort Order Selector (Recién agregadas vs Más antiguas) */}
          <button
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all flex items-center justify-center gap-2 shrink-0"
            title="Cambiar orden de publicaciones"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-rose-400" />
            <span>
              {sortOrder === 'newest' ? 'Recién agregadas' : 'Más antiguas'}
            </span>
          </button>
        </div>

        {/* Lot Filter Selector (Primer opción: Todos, siguientes: Lotes creados) */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 shrink-0 px-1">
            <Layers className="w-3.5 h-3.5 text-amber-400" /> Lote:
          </span>

          {/* Option: Todos */}
          <button
            onClick={() => setSelectedLot('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 ${
              selectedLot === 'all'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/35 font-semibold'
                : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            Todos los lotes
          </button>

          {/* Dynamic lots created via "Agregar Lote" */}
          {availableLots.map((lotName) => (
            <button
              key={lotName}
              onClick={() => setSelectedLot(lotName)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 ${
                selectedLot === lotName
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/35 font-semibold'
                  : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {lotName}
            </button>
          ))}
        </div>
      </div>

      {/* Warning if user tried to select an 11th item */}
      {limitWarning && (
        <div className="p-3 rounded-2xl bg-pink-500/15 border border-pink-500/30 text-xs text-pink-200 flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-pink-400 shrink-0" />
          <span>
            <strong>Límite de 10 prendas alcanzado:</strong> Los carruseles de Instagram admiten hasta 10 fotos por publicación. Desmarca una prenda para seleccionar otra.
          </span>
        </div>
      )}

      {/* Floating Action Button for generating caption when items are selected */}
      <div className="sticky top-16 z-30 flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 text-xs">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span className="text-slate-300">
            {selectedSkus.length === 0
              ? 'Haz clic sobre las fotos para seleccionarlas'
              : `${selectedSkus.length} de 10 prendas listas para el carrusel`}
          </span>
        </div>

        <button
          onClick={handleGeneratePublication}
          disabled={selectedSkus.length === 0}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 shadow-md shadow-pink-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
        >
          <FileText className="w-4 h-4" />
          <span>Crear publicación ({selectedSkus.length})</span>
        </button>
      </div>

      {/* Grid View (Identical to Galería Feed: 3 per row on mobile, responsive on desktop) */}
      {displayItems.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-400 space-y-2">
          <Instagram className="w-8 h-8 mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-300">No se encontraron prendas</p>
          <p className="text-xs text-slate-500">Prueba ajustando el filtro de lote o búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-0.5 sm:gap-1.5 md:gap-2 rounded-2xl overflow-hidden bg-slate-950 p-0.5 sm:p-2 border border-slate-800/80">
          {displayItems.map((item) => {
            const isSelected = selectedSkus.includes(item.sku);
            const selectionIndex = selectedSkus.indexOf(item.sku);

            return (
              <div
                key={item.sku}
                onClick={() => handleToggleSelect(item.sku)}
                className={`aspect-square relative group cursor-pointer bg-slate-900 overflow-hidden select-none transition-all ${
                  isSelected
                    ? 'ring-2 sm:ring-4 ring-pink-500 border-pink-500 scale-[0.97] rounded-xl z-10 shadow-lg shadow-pink-500/20'
                    : 'hover:opacity-90'
                }`}
              >
                {/* Photo */}
                <DriveImage
                  src={item.photoUrl}
                  alt={`${item.type} ${item.brand}`}
                  className="w-full h-full object-cover"
                />

                {/* Selection Overlay & Indicator */}
                {isSelected ? (
                  <div className="absolute inset-0 bg-pink-950/40 backdrop-blur-[1px] flex flex-col justify-between p-1.5 sm:p-2 pointer-events-none">
                    {/* Top corner: Selection Badge number */}
                    <div className="flex items-center justify-between">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white font-bold text-[10px] sm:text-xs flex items-center justify-center shadow-md shadow-pink-500/40">
                        #{selectionIndex + 1}
                      </span>
                      <div className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>

                    {/* Bottom: Title & Price */}
                    <div className="text-left bg-slate-950/80 backdrop-blur-xs p-1 rounded-lg border border-pink-500/40">
                      <p className="text-[10px] font-bold text-white truncate leading-tight">
                        {item.type}
                      </p>
                      <p className="text-[9px] text-pink-300 font-mono font-bold">
                        ${item.pricePublished || item.priceWeb} • {item.size}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Unselected: subtle bottom price tag */}
                    <div className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 z-10 pointer-events-none">
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-slate-950/80 backdrop-blur-xs text-rose-300 border border-slate-800">
                        ${item.pricePublished || item.priceWeb}
                      </span>
                    </div>

                    {/* Hover preview for desktop */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2 text-left pointer-events-none">
                      <p className="text-[10px] text-rose-400 font-mono truncate">{item.sku}</p>
                      <p className="text-xs font-bold text-white truncate leading-tight">{item.type}</p>
                      <p className="text-[11px] text-slate-300 truncate">{item.brand} • {item.size}</p>
                      {item.lotName && (
                        <p className="text-[9px] text-amber-300 truncate mt-0.5 flex items-center gap-1">
                          <Layers className="w-2.5 h-2.5" /> {item.lotName}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal with Generated Caption and Copy Button */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-500 text-white shadow-md shadow-pink-500/20">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Descripción para Carrusel
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedSkus.length} prendas formateadas para Instagram
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Texto Generado (Formato: Prenda | Talla | $Precio)</span>
                  <span className="text-[10px] text-slate-500">Puedes editar el texto si lo deseas</span>
                </label>
                <textarea
                  rows={Math.max(6, Math.min(12, selectedSkus.length + 2))}
                  value={generatedText}
                  onChange={(e) => setGeneratedText(e.target.value)}
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-mono text-slate-100 placeholder-slate-500 focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 focus:outline-none leading-relaxed resize-none"
                />
              </div>

              {/* Order of selected items preview */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Orden de diapositivas en el carrusel:
                </p>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {selectedSkus.map((sku, idx) => {
                    const item = itemsBySku.get(sku);
                    return (
                      <div
                        key={sku}
                        className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 relative group"
                        title={`${idx + 1}. ${item?.type || sku}`}
                      >
                        <DriveImage
                          src={item?.photoUrl}
                          alt={item?.type || ''}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-slate-950/80 text-[9px] font-bold text-pink-400 flex items-center justify-center">
                          {idx + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer / Actions */}
            <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between gap-3 bg-slate-950/60 shrink-0">
              <button
                type="button"
                onClick={() => {
                  handleClearSelection();
                  setIsModalOpen(false);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-slate-800/40 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Limpiar selección
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleCopyToClipboard}
                  className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center gap-2 ${
                    copied
                      ? 'bg-emerald-600 shadow-emerald-500/20'
                      : 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 shadow-pink-500/20'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" /> ¡Copiado al portapapeles!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copiar al portapapeles
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
