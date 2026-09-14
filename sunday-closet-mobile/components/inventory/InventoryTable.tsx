'use client';

import React, { useState } from 'react';
import { InventoryItem } from '@/types/inventory';
import { ItemStatusBadge } from './ItemStatusBadge';
import { IosToggle } from './IosToggle';
import { ImageOff, DollarSign, Calendar, Info, ChevronDown, ChevronUp, Layers, Sparkles, Trash2, Loader2 } from 'lucide-react';
import { formatDriveImageUrl } from '@/lib/imageUrl';
import { DriveImage } from '@/components/common/DriveImage';

interface InventoryTableProps {
  items: InventoryItem[];
  onToggleVisibility: (sku: string, currentStatus: boolean) => void;
  onDeleteItem?: (sku: string) => void;
  isUpdatingSku?: string | null;
  isDeletingSku?: string | null;
}

function formatPrice(val: any): string {
  const num = Number(val);
  if (isNaN(num)) return '0';
  return num.toLocaleString('es-MX');
}

function formatDate(dateStr: any): string {
  if (!dateStr || typeof dateStr !== 'string' || !dateStr.trim()) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('es-MX');
  } catch {
    return dateStr;
  }
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  onToggleVisibility,
  onDeleteItem,
  isUpdatingSku,
  isDeletingSku,
}) => {
  const [expandedSku, setExpandedSku] = useState<string | null>(null);

  const toggleExpand = (sku: string) => {
    setExpandedSku(expandedSku === sku ? null : sku);
  };

  if (items.length === 0) {
    return (
      <div className="w-full py-16 text-center text-slate-500 bg-slate-900/60 rounded-3xl border border-slate-800 flex flex-col items-center justify-center gap-3">
        <Info className="w-8 h-8 text-slate-600" />
        <p className="font-medium text-slate-400">No se encontraron prendas.</p>
        <p className="text-xs text-slate-600">Ajusta los filtros de búsqueda o agrega una nueva prenda.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* ── 1. VISTA MÓVIL (iPhones & Pantallas < 768px: Tarjetas Táctiles) ── */}
      <div className="block md:hidden space-y-3">
        {items.map((item, index) => {
          const isExpanded = expandedSku === item.sku;
          const isUpdating = isUpdatingSku === item.sku;
          const isDeleting = isDeletingSku === item.sku;

          return (
            <div
              key={`mobile-card-${item.sku}-${index}`}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3 relative overflow-hidden"
            >
              {/* Top Row: Miniatura, SKU, Tipo, Marca, Switch y Botón Eliminar */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-16 rounded-2xl bg-slate-800 border border-slate-700/80 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                    <DriveImage
                      src={item.photoUrl}
                      alt={item.type}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <span className="font-mono text-xs font-bold text-rose-400 block">
                      {item.sku}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-100 truncate">
                      {item.type}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">
                      {item.brand || 'Sin marca'} · Talla {item.size}
                    </p>
                  </div>
                </div>

                {/* Acciones: Switch de Visibilidad + Botón de Basura Rojo */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex flex-col items-end gap-1">
                    <IosToggle
                      id={`mobile-toggle-${item.sku}-${index}`}
                      checked={item.visibleInWeb}
                      disabled={isUpdating || isDeleting}
                      onChange={() => onToggleVisibility(item.sku, item.visibleInWeb)}
                    />
                    <span className="text-[10px] font-medium text-slate-400">
                      {item.visibleInWeb ? (
                        <span className="text-emerald-400">En Web</span>
                      ) : (
                        <span className="text-slate-500">Oculto</span>
                      )}
                    </span>
                  </div>

                  {onDeleteItem && (
                    <button
                      type="button"
                      disabled={isDeleting || isUpdating}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteItem(item.sku);
                      }}
                      title="Eliminar prenda del dashboard e inventario"
                      className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 text-rose-500 border border-rose-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Status Badge & Web Price */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <ItemStatusBadge status={item.status} />
                  {item.scheduledDropDate && (
                    <span className="text-[10px] text-amber-400/90 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.scheduledDropDate)}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Precio Web</span>
                  <span className="font-bold text-emerald-400 text-sm flex items-center justify-end">
                    <DollarSign className="w-3.5 h-3.5 -mr-0.5 text-emerald-500" />
                    {formatPrice(item.priceWeb)}
                  </span>
                </div>
              </div>

              {/* Botón de acordeón para ver todos los detalles (21 columnas) */}
              <button
                type="button"
                onClick={() => toggleExpand(item.sku)}
                className="w-full py-2 px-3 bg-slate-950/70 hover:bg-slate-800/60 active:bg-slate-800 rounded-xl text-xs text-slate-400 flex items-center justify-between transition-colors cursor-pointer select-none"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <Layers className="w-3.5 h-3.5 text-rose-400" />
                  {isExpanded ? 'Ocultar detalles' : 'Ver desglose completo'}
                </span>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {/* Acordeón expandido de columnas completas */}
              {isExpanded && (
                <div className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800/80 text-xs space-y-2 animate-in fade-in duration-150">
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div><span className="text-slate-500">Color:</span> {item.color || 'N/A'}</div>
                    <div><span className="text-slate-500">Estilo:</span> {item.style}</div>
                    <div><span className="text-slate-500">Condición:</span> {item.condition}</div>
                    <div><span className="text-slate-500">Costo compra:</span> ${formatPrice(item.cost)}</div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Precio Sunday (IG):</span>
                      <span className="font-bold text-rose-300">${formatPrice(item.priceSunday)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Precio Facebook:</span>
                      <span className="font-bold text-blue-300">${formatPrice(item.priceFB)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Precio Paca / Remate:</span>
                      <span className="font-bold text-amber-300">${formatPrice(item.pricePaca)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Precio Publicado:</span>
                      <span className="font-bold text-emerald-300">${formatPrice(item.pricePublished)}</span>
                    </div>
                  </div>

                  {(item.dropName || item.scheduledDropDate) && (
                    <div className="pt-2 border-t border-slate-800/60 text-[11px] text-amber-300/90 space-y-0.5">
                      {item.dropName && <div><span className="text-slate-500">Drop:</span> {item.dropName}</div>}
                      {item.scheduledDropDate && <div><span className="text-slate-500">Fecha Drop:</span> {formatDate(item.scheduledDropDate)}</div>}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── 2. VISTA ESCRITORIO Y TABLET (>= 768px: Tabla horizontal completa) ── */}
      <div className="hidden md:block w-full bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6 sticky left-0 bg-slate-950/90 backdrop-blur-xs z-10">Código (SKU)</th>
                <th className="py-4 px-6">Foto</th>
                <th className="py-4 px-6">Tipo + Marca</th>
                <th className="py-4 px-6">Detalles (Talla/Color)</th>
                <th className="py-4 px-6 text-right">Precio Web</th>
                <th className="py-4 px-6 text-center">Estado</th>
                <th className="py-4 px-6 text-center">Visible en Web</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
              {items.map((item) => {
                const isUpdating = isUpdatingSku === item.sku;
                const isDeleting = isDeletingSku === item.sku;
                return (
                  <tr
                    key={item.sku}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* SKU */}
                    <td className="py-4 px-6 font-mono font-bold text-rose-400 sticky left-0 bg-slate-900/90 backdrop-blur-xs z-10">
                      {item.sku}
                    </td>

                    {/* Foto */}
                    <td className="py-4 px-6">
                      <div className="w-12 h-14 rounded-lg bg-slate-800 border border-slate-700/80 overflow-hidden flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
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
                      <div className="text-xs text-slate-400">{item.brand}</div>
                    </td>

                    {/* Detalles */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
                          Talla: {item.size}
                        </span>
                        <span className="text-xs text-slate-400 capitalize">
                          {item.color}
                        </span>
                      </div>
                    </td>

                    {/* Precio Web */}
                    <td className="py-4 px-6 text-right font-semibold text-emerald-400">
                      <span className="inline-flex items-center">
                        <DollarSign className="w-3.5 h-3.5 -mr-0.5 text-emerald-500" />
                        {formatPrice(item.priceWeb)}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="py-4 px-6 text-center">
                      <ItemStatusBadge status={item.status} />
                      {item.scheduledDropDate && (
                        <div className="text-[10px] text-amber-400/80 flex items-center justify-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.scheduledDropDate)}
                        </div>
                      )}
                    </td>

                    {/* Toggle Switch y Eliminar */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="flex items-center gap-2">
                          <IosToggle
                            id={`toggle-visible-${item.sku}`}
                            checked={item.visibleInWeb}
                            disabled={isUpdating || isDeleting}
                            onChange={() => onToggleVisibility(item.sku, item.visibleInWeb)}
                          />
                          {isUpdating && (
                            <span className="text-[10px] text-rose-400 animate-pulse">
                              Guardando...
                            </span>
                          )}
                        </div>

                        {onDeleteItem && (
                          <button
                            type="button"
                            disabled={isDeleting || isUpdating}
                            onClick={() => onDeleteItem(item.sku)}
                            title="Eliminar prenda del dashboard e inventario"
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 text-rose-500 border border-rose-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed group/del"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-rose-500 group-hover/del:scale-110 transition-transform" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
