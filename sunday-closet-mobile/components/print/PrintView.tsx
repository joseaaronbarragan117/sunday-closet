'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { InventoryItem } from '@/types/inventory';
import { DriveImage } from '@/components/common/DriveImage';
import { BarcodeSvg } from '@/components/barcode/BarcodeSvg';
import {
  Printer,
  Check,
  Filter,
  ArrowDownUp,
  RotateCw,
  Search,
  Sparkles,
  Layers,
  FileText,
  HelpCircle,
  Tag
} from 'lucide-react';

interface PrintViewProps {
  items: InventoryItem[];
}

const STORAGE_PRINT_COUNTS_KEY = 'sunday_print_counts';

function getStoredPrintCounts(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_PRINT_COUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredPrintCounts(counts: Record<string, number>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PRINT_COUNTS_KEY, JSON.stringify(counts));
  } catch {}
}

export const PrintView: React.FC<PrintViewProps> = ({ items }) => {
  const [selectedSkus, setSelectedSkus] = useState<Set<string>>(new Set());
  const [filterPrinted, setFilterPrinted] = useState<'all' | 'unprinted' | 'printed'>('unprinted');
  const [sortOrder, setSortOrder] = useState<'recent-first' | 'old-first'>('recent-first');
  const [searchQuery, setSearchQuery] = useState('');
  const [printFormat, setPrintFormat] = useState<'thermal' | 'sheet'>('thermal');
  const [printCounts, setPrintCounts] = useState<Record<string, number>>({});
  const [isPrintingPreview, setIsPrintingPreview] = useState(false);

  // Load print counts from localStorage
  useEffect(() => {
    setPrintCounts(getStoredPrintCounts());
  }, []);

  // Format price
  const formatPrice = (val: any) => {
    const num = Number(val);
    if (isNaN(num)) return '0';
    return num.toLocaleString('es-MX');
  };

  // Sort and filter items
  const processedItems = useMemo(() => {
    // 1. Order: default is newest first (reverse of sheet order)
    let list = sortOrder === 'recent-first' ? [...items].reverse() : [...items];

    // 2. Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.sku.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.color.toLowerCase().includes(q)
      );
    }

    // 3. Filter by print status
    if (filterPrinted === 'unprinted') {
      list = list.filter((item) => (printCounts[item.sku] || 0) === 0);
    } else if (filterPrinted === 'printed') {
      list = list.filter((item) => (printCounts[item.sku] || 0) > 0);
    }

    return list;
  }, [items, sortOrder, searchQuery, filterPrinted, printCounts]);

  // Toggle single item selection
  const toggleSelect = (sku: string) => {
    setSelectedSkus((prev) => {
      const next = new Set(prev);
      if (next.has(sku)) {
        next.delete(sku);
      } else {
        next.add(sku);
      }
      return next;
    });
  };

  // Select all visible / Deselect all
  const areAllVisibleSelected =
    processedItems.length > 0 && processedItems.every((it) => selectedSkus.has(it.sku));

  const handleSelectAllVisible = () => {
    if (areAllVisibleSelected) {
      setSelectedSkus((prev) => {
        const next = new Set(prev);
        processedItems.forEach((it) => next.delete(it.sku));
        return next;
      });
    } else {
      setSelectedSkus((prev) => {
        const next = new Set(prev);
        processedItems.forEach((it) => next.add(it.sku));
        return next;
      });
    }
  };

  // Selected items objects
  const selectedItemsList = useMemo(() => {
    return items.filter((it) => selectedSkus.has(it.sku));
  }, [items, selectedSkus]);

  // Execute Print
  const handlePrint = () => {
    if (selectedSkus.size === 0) {
      alert('Por favor selecciona al menos una prenda para imprimir.');
      return;
    }

    // Increment print counts for all selected SKUs
    const updated = { ...printCounts };
    selectedSkus.forEach((sku) => {
      updated[sku] = (updated[sku] || 0) + 1;
    });
    setPrintCounts(updated);
    saveStoredPrintCounts(updated);

    // Trigger browser print dialog
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Reset count for selected items if requested
  const handleResetSelectedCount = (sku: string) => {
    const updated = { ...printCounts };
    delete updated[sku];
    setPrintCounts(updated);
    saveStoredPrintCounts(updated);
  };

  const unprintedTotal = items.filter((it) => (printCounts[it.sku] || 0) === 0).length;
  const printedTotal = items.filter((it) => (printCounts[it.sku] || 0) > 0).length;

  return (
    <div className="w-full space-y-6">
      {/* ── SECCIÓN VISIBLE SOLO EN PANTALLA (NO-PRINT) ── */}
      <div className="print:hidden space-y-6">
        {/* Banner Superior de Impresión */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-rose-950/20 border border-purple-800/30 relative overflow-hidden shadow-2xl">
          <div className="space-y-1 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
              <Printer className="w-3.5 h-3.5" /> Centro de Impresión de Etiquetas CODE 128
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-100">
              Impresión de Etiquetas de Código de Barras
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-2xl">
              Genera etiquetas con código de barras CODE 128 basadas en el SKU. Diseñado para impresoras térmicas continuas (58mm/80mm) y hojas de etiquetas adhesivas.
            </p>
          </div>

          {/* Botón de Acción Principal: Imprimir */}
          <div className="flex items-center gap-3 relative z-10 shrink-0">
            <button
              onClick={handlePrint}
              disabled={selectedSkus.size === 0}
              className={`px-5 py-3 rounded-2xl font-semibold text-sm flex items-center gap-2.5 transition-all shadow-xl ${
                selectedSkus.size > 0
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-emerald-500/25 cursor-pointer active:scale-95'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
              }`}
            >
              <Printer className="w-5 h-5" />
              <span>Imprimir ({selectedSkus.size}) {selectedSkus.size === 1 ? 'etiqueta' : 'etiquetas'}</span>
            </button>
          </div>
        </div>

        {/* Barra de Filtros, Conteo y Ordenamiento */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          {/* Conteo de selección y Select All */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAllVisible}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  areAllVisibleSelected
                    ? 'bg-emerald-500 border-emerald-400 text-white'
                    : 'border-slate-500 bg-slate-900'
                }`}
              >
                {areAllVisibleSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
              <span>{areAllVisibleSelected ? 'Deseleccionar visibles' : 'Seleccionar visibles'}</span>
            </button>

            <div className="text-xs font-medium text-slate-300">
              <span className="font-bold text-emerald-400 text-sm">{selectedSkus.size}</span>
              <span className="text-slate-400"> de {items.length} piezas seleccionadas</span>
            </div>
          </div>

          {/* Filtros de Impresión (Pendientes / Todas / Impresas) */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setFilterPrinted('unprinted')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filterPrinted === 'unprinted'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pendientes ({unprintedTotal})
              </button>
              <button
                onClick={() => setFilterPrinted('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filterPrinted === 'all'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todas ({items.length})
              </button>
              <button
                onClick={() => setFilterPrinted('printed')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filterPrinted === 'printed'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Ya impresas ({printedTotal})
              </button>
            </div>

            {/* Selector de Ordenamiento */}
            <button
              onClick={() =>
                setSortOrder((prev) => (prev === 'recent-first' ? 'old-first' : 'recent-first'))
              }
              title="Cambiar orden de las prendas"
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowDownUp className="w-3.5 h-3.5 text-rose-400" />
              <span>
                {sortOrder === 'recent-first' ? 'Más recientes primero' : 'Más antiguas primero'}
              </span>
            </button>

            {/* Selector de Formato de Salida */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setPrintFormat('thermal')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  printFormat === 'thermal'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Rollo Térmico
              </button>
              <button
                onClick={() => setPrintFormat('sheet')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  printFormat === 'sheet'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Hoja Adhesiva
              </button>
            </div>
          </div>
        </div>

        {/* Buscador de Prenda Rápido */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por SKU, tipo, marca, color para imprimir..."
            className="w-full bg-slate-900/90 text-slate-100 placeholder-slate-500 text-sm pl-11 pr-4 py-3 rounded-2xl border border-slate-800 focus:outline-none focus:border-purple-500 transition-all shadow-inner"
          />
        </div>

        {/* Tabla de Selección de Etiquetas */}
        <div className="w-full bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[920px]">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6 text-center w-16">Selección</th>
                  <th className="py-4 px-6">Código (SKU)</th>
                  <th className="py-4 px-6">Foto</th>
                  <th className="py-4 px-6">Tipo + Marca</th>
                  <th className="py-4 px-6">Detalles (Talla/Color/Precio)</th>
                  <th className="py-4 px-6 text-center">Código de Barras CODE 128</th>
                  <th className="py-4 px-6 text-center">Impresiones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
                {processedItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-500">
                      No se encontraron prendas con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  processedItems.map((item) => {
                    const isSelected = selectedSkus.has(item.sku);
                    const count = printCounts[item.sku] || 0;

                    return (
                      <tr
                        key={item.sku}
                        onClick={() => toggleSelect(item.sku)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-emerald-950/20 hover:bg-emerald-950/30' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Círculo Interactivo de Selección (Se torna VERDE) */}
                        <td className="py-4 px-6 text-center">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelect(item.sku);
                            }}
                            className={`w-7 h-7 mx-auto rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/30 scale-105'
                                : 'border-slate-600 bg-slate-800/80 hover:border-slate-400 text-transparent'
                            }`}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="py-4 px-6 font-mono font-bold text-rose-400">
                          {item.sku}
                        </td>

                        {/* Foto */}
                        <td className="py-4 px-6">
                          <div className="w-12 h-14 rounded-lg bg-slate-800 border border-slate-700/80 overflow-hidden flex items-center justify-center relative shadow-xs">
                            <DriveImage
                              src={item.photoUrl}
                              alt={item.type}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>

                        {/* Tipo + Marca */}
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-100">{item.type}</div>
                          <div className="text-xs text-slate-400">{item.brand || 'Sin marca'}</div>
                        </td>

                        {/* Detalles */}
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
                                Talla: {item.size}
                              </span>
                              <span className="text-xs text-slate-400 capitalize">
                                {item.color}
                              </span>
                            </div>
                            <div className="text-xs font-bold text-emerald-400">
                              ${formatPrice(item.pricePublished || item.priceWeb)} MXN
                            </div>
                          </div>
                        </td>

                        {/* Código de Barras CODE 128 */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex justify-center">
                            <BarcodeSvg value={item.sku} width={1.4} height={34} fontSize={11} />
                          </div>
                        </td>

                        {/* Contador de Impresiones */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex flex-col items-center gap-1">
                            {count === 0 ? (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                                0 impresiones
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Impreso {count}x
                              </span>
                            )}
                            {count > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleResetSelectedCount(item.sku);
                                }}
                                title="Reiniciar contador a 0 si hubo error de impresión"
                                className="text-[10px] text-slate-500 hover:text-amber-400 underline"
                              >
                                Reiniciar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── SECCIÓN DE ETIQUETAS PARA IMPRESIÓN (ESTILOS @media print) ── */}
      <div id="print-container" className="hidden print:block text-black bg-white">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background: white !important;
              color: black !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .print\\:hidden, aside, header, nav, #btn-nav-pos {
              display: none !important;
            }
            #print-container {
              display: block !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            /* Formato Rollo Térmico continuo (58mm / 80mm) */
            .thermal-label {
              width: 58mm;
              max-width: 100%;
              padding: 4mm 2mm;
              margin: 0 auto;
              text-align: center;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              page-break-after: always;
              break-after: page;
              box-sizing: border-box;
            }
            /* Formato Hoja Adhesiva (Rejilla) */
            .sheet-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 4mm;
              padding: 8mm;
              box-sizing: border-box;
            }
            .sheet-label {
              border: 1px dashed #ccc;
              border-radius: 4px;
              padding: 4mm 2mm;
              text-align: center;
              box-sizing: border-box;
              page-break-inside: avoid;
              break-inside: avoid;
            }
          }
        `}} />

        {printFormat === 'thermal' ? (
          // Vista Rollo Térmico 58mm / 80mm
          selectedItemsList.map((item) => (
            <div key={`print-thermal-${item.sku}`} className="thermal-label">
              <div style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
                SUNDAY CLÓSET
              </div>
              <div style={{ fontSize: '8px', color: '#666', marginBottom: '2px' }}>
                Vintage &amp; Selected
              </div>

              {/* Código de barras CODE 128 nítido */}
              <div style={{ margin: '3px 0' }}>
                <BarcodeSvg value={item.sku} width={1.5} height={34} fontSize={11} displayValue={true} />
              </div>

              <div style={{ fontSize: '10px', fontWeight: 'bold', lineHeight: '1.2', marginTop: '2px' }}>
                {item.type}
              </div>

              <div style={{ fontSize: '8px', color: '#333' }}>
                {item.brand ? `${item.brand} · ` : ''}Talla: {item.size} {item.color ? `· ${item.color}` : ''}
              </div>

              <div style={{ fontSize: '12px', fontWeight: '900', marginTop: '3px' }}>
                ${formatPrice(item.pricePublished || item.priceWeb)} MXN
              </div>
            </div>
          ))
        ) : (
          // Vista Hoja de Etiquetas Adhesivas (Grid)
          <div className="sheet-grid">
            {selectedItemsList.map((item) => (
              <div key={`print-sheet-${item.sku}`} className="sheet-label">
                <div style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  SUNDAY CLÓSET
                </div>
                <div style={{ margin: '3px 0' }}>
                  <BarcodeSvg value={item.sku} width={1.3} height={28} fontSize={10} displayValue={true} />
                </div>
                <div style={{ fontSize: '9px', fontWeight: 'bold' }}>
                  {item.type}
                </div>
                <div style={{ fontSize: '8px', color: '#444' }}>
                  Talla {item.size} · ${formatPrice(item.pricePublished || item.priceWeb)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
