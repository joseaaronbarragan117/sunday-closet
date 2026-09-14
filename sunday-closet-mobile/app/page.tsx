'use client';

import React, { useState, useEffect } from 'react';
import { InventoryItem, NewItemFormData } from '@/types/inventory';
import { AddItemModal } from '@/components/modals/AddItemModal';
import { PosModal } from '@/components/modals/PosModal';
import { BannerModal } from '@/components/modals/BannerModal';
import { DriveImage } from '@/components/common/DriveImage';
import { ItemStatusBadge } from '@/components/inventory/ItemStatusBadge';
import { IosToggle } from '@/components/inventory/IosToggle';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import {
  Search,
  RotateCw,
  Plus,
  ShoppingBag,
  Image as ImageIcon,
  Tag,
  Eye,
  EyeOff,
  Trash2,
  Loader2,
  Calendar,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

function sanitizeItems(rawItems: any[]): InventoryItem[] {
  if (!Array.isArray(rawItems)) return [];
  const seen = new Set<string>();
  return rawItems
    .filter((item) => item && typeof item === 'object' && item.sku)
    .map((item) => ({
      sku: String(item.sku || '').trim(),
      photoUrl: String(item.photoUrl || ''),
      type: String(item.type || ''),
      size: String(item.size || 'M'),
      color: String(item.color || ''),
      brand: String(item.brand || ''),
      style: item.style || 'Vintage',
      condition: item.condition || 'Nuevo c/etiqueta',
      cost: Number(item.cost) || 0,
      priceSunday: Number(item.priceSunday) || 0,
      priceWeb: Number(item.priceWeb) || 0,
      priceFB: Number(item.priceFB) || 0,
      pricePaca: Number(item.pricePaca) || 0,
      pricePublished: Number(item.pricePublished) || 0,
      visibleInWeb: Boolean(item.visibleInWeb),
      status: item.status || 'Disponible',
      scheduledDropDate: item.scheduledDropDate ? String(item.scheduledDropDate) : undefined,
      dropName: item.dropName ? String(item.dropName) : undefined,
    }))
    .filter((item) => {
      if (!item.sku || seen.has(item.sku)) return false;
      seen.add(item.sku);
      return true;
    });
}

function formatPrice(val: any): string {
  const num = Number(val);
  if (isNaN(num)) return '0';
  return num.toLocaleString('es-MX');
}

export default function MobileDashboardPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState<'all' | 'visible' | 'hidden'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingSku, setUpdatingSku] = useState<string | null>(null);
  const [deletingSku, setDeletingSku] = useState<string | null>(null);
  const [expandedSku, setExpandedSku] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPosModalOpen, setIsPosModalOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

  // Initial load from cache or API
  useEffect(() => {
    try {
      const cached = localStorage.getItem('sunday_inventory_cache_mobile');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(sanitizeItems(parsed));
          setIsLoading(false);
        }
      }
    } catch {
      // ignore
    }
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      setIsRefreshing(true);
      const res = await fetch('/api/inventory', {
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      if (data.items && Array.isArray(data.items)) {
        const clean = sanitizeItems(data.items);
        setItems(clean);
        try {
          localStorage.setItem('sunday_inventory_cache_mobile', JSON.stringify(clean));
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      console.warn('[Mobile] Error fetching inventory:', err?.message || err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Toggle visible in web
  const handleToggleVisibility = async (sku: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setItems((prev) =>
      prev.map((it) => (it.sku === sku ? { ...it, visibleInWeb: nextStatus } : it))
    );
    setUpdatingSku(sku);

    try {
      const res = await fetch('/api/update-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, visibleInWeb: nextStatus }),
      });

      if (!res.ok) {
        throw new Error('API returned non-200');
      }
    } catch (err) {
      console.error('Error toggling visibility:', err);
      // Revert on error
      setItems((prev) =>
        prev.map((it) => (it.sku === sku ? { ...it, visibleInWeb: currentStatus } : it))
      );
      alert('No se pudo actualizar la visibilidad en Google Sheets.');
    } finally {
      setUpdatingSku(null);
    }
  };

  // Delete item with row compacting
  const handleDeleteItem = async (sku: string) => {
    const itemToDelete = items.find((it) => it.sku === sku);
    const itemName = itemToDelete ? `"${itemToDelete.type}" (${sku})` : sku;

    const confirmed = window.confirm(
      `¿Deseas eliminar permanentemente la prenda ${itemName}?\n\nEsta acción eliminará la prenda del dashboard y de Google Sheets, y las filas siguientes se reordenarán automáticamente hacia arriba.`
    );
    if (!confirmed) return;

    setDeletingSku(sku);
    try {
      const res = await fetch(`/api/inventory?sku=${encodeURIComponent(sku)}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((it) => it.sku !== sku));
        try {
          const updated = items.filter((it) => it.sku !== sku);
          localStorage.setItem('sunday_inventory_cache_mobile', JSON.stringify(updated));
        } catch {
          // ignore
        }
      } else {
        alert(`Error al eliminar: ${data.error || 'No se pudo eliminar de Google Sheets'}`);
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Error de conexión al intentar eliminar la prenda.');
    } finally {
      setDeletingSku(null);
    }
  };

  // Handle Add Item
  const handleAddItem = async (newItem: NewItemFormData) => {
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      const data = await res.json();
      if (data.success && data.item) {
        setItems((prev) => [data.item, ...prev]);
        setIsAddModalOpen(false);
        fetchInventory();
      } else {
        alert('Hubo un problema al guardar la prenda.');
      }
    } catch (err) {
      console.error('Add item error:', err);
      alert('Error en la petición para guardar la prenda.');
    }
  };

  // Handle Update Banner
  const handleUpdateBanner = async (bannerUrl: string) => {
    try {
      const res = await fetch('/api/banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bannerUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setIsBannerModalOpen(false);
        alert('✨ ¡Banner actualizado con éxito!');
      } else {
        alert('Error al actualizar el banner.');
      }
    } catch (err) {
      console.error('Update banner error:', err);
      alert('Error al comunicar con la API del banner.');
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.color.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterVisible === 'visible') return item.visibleInWeb;
    if (filterVisible === 'hidden') return !item.visibleInWeb;
    return true;
  });

  const visibleCount = items.filter((it) => it.visibleInWeb).length;
  const hiddenCount = items.filter((it) => !it.visibleInWeb).length;

  return (
    <ErrorBoundary>
      <div
        className="min-h-screen bg-slate-950 text-slate-100 flex flex-col w-full selection:bg-rose-500 selection:text-white"
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 52px)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 80px)',
        }}
      >
        {/* ── HEADER MÓVIL CON MARGEN PARA ISLA DINÁMICA / NOTCH ── */}
        <header className="px-4 pb-3 space-y-3 sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-900">
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <h1 className="text-lg font-serif font-bold text-slate-100 tracking-wide">
                Sunday Clóset Móvil
              </h1>
            </div>

            <button
              onClick={fetchInventory}
              disabled={isRefreshing}
              className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-sm"
              aria-label="Sincronizar con Google Sheets"
            >
              <RotateCw className={`w-4 h-4 text-rose-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Buscador táctil */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar prenda, SKU, marca..."
              className="w-full bg-slate-900/90 text-slate-100 placeholder-slate-500 text-sm pl-10 pr-4 py-2.5 rounded-2xl border border-slate-800 focus:outline-none focus:border-rose-500/50 transition-all shadow-inner"
            />
          </div>

          {/* Chips de filtro rápido */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setFilterVisible('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filterVisible === 'all'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              <Tag className="w-3 h-3" />
              <span>Todos ({items.length})</span>
            </button>

            <button
              onClick={() => setFilterVisible('visible')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filterVisible === 'visible'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>En Web ({visibleCount})</span>
            </button>

            <button
              onClick={() => setFilterVisible('hidden')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filterVisible === 'hidden'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              <EyeOff className="w-3 h-3" />
              <span>Ocultos ({hiddenCount})</span>
            </button>
          </div>
        </header>

        {/* ── CONTENIDO PRINCIPAL: LISTA DE TARJETAS MÓVILES ── */}
        <main className="flex-1 px-4 py-4 space-y-3 w-full">
          {isLoading && items.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-rose-500 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-medium">Cargando inventario desde Google Sheets...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center text-slate-500 bg-slate-900/60 rounded-3xl border border-slate-800 p-6 space-y-2">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-medium text-slate-300 text-sm">No se encontraron prendas.</p>
              <p className="text-xs text-slate-500">Prueba con otra búsqueda o cambia el filtro de visibilidad.</p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isExpanded = expandedSku === item.sku;
              const isUpdating = updatingSku === item.sku;
              const isDeleting = deletingSku === item.sku;

              return (
                <article
                  key={`mobile-card-${item.sku}-${index}`}
                  className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-4 shadow-xl space-y-3 relative overflow-hidden transition-all"
                >
                  {/* Fila Superior: Imagen, Datos Básicos, Switch Web y Botón Basura Rojo */}
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

                      <div className="min-w-0 space-y-0.5">
                        <span className="font-mono text-xs font-bold text-rose-400 block">
                          {item.sku}
                        </span>
                        <h2 className="text-sm font-semibold text-slate-100 truncate">
                          {item.type}
                        </h2>
                        <p className="text-xs text-slate-400 truncate">
                          {item.brand || 'Sin marca'} · Talla {item.size}
                        </p>
                      </div>
                    </div>

                    {/* Acciones: Switch iOS + Basura Roja */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex flex-col items-end gap-1">
                        <IosToggle
                          id={`mobile-toggle-${item.sku}-${index}`}
                          checked={item.visibleInWeb}
                          disabled={isUpdating || isDeleting}
                          onChange={() => handleToggleVisibility(item.sku, item.visibleInWeb)}
                        />
                        <span className="text-[10px] font-medium text-slate-400">
                          {item.visibleInWeb ? (
                            <span className="text-emerald-400">En Web</span>
                          ) : (
                            <span className="text-slate-500">Oculto</span>
                          )}
                        </span>
                      </div>

                      {/* Botón de Basura Rojo para Eliminar con Reordenamiento */}
                      <button
                        type="button"
                        disabled={isDeleting || isUpdating}
                        onClick={() => handleDeleteItem(item.sku)}
                        title="Eliminar prenda del dashboard e inventario"
                        className="p-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 text-rose-500 border border-rose-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Estado y Precios */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <ItemStatusBadge status={item.status} />
                      {item.scheduledDropDate && (
                        <span className="text-[10px] text-amber-400/90 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.scheduledDropDate}
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Precio Web</span>
                      <span className="font-semibold text-emerald-400 text-sm">
                        ${formatPrice(item.pricePublished || item.priceWeb)}
                      </span>
                    </div>
                  </div>

                  {/* Botón Acordeón para ver más detalles */}
                  <button
                    type="button"
                    onClick={() => setExpandedSku(isExpanded ? null : item.sku)}
                    className="w-full pt-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1 border-t border-slate-800/40 cursor-pointer"
                  >
                    <span>{isExpanded ? 'Ocultar detalles' : 'Ver desglose de precios y color'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {/* Acordeón Expandido */}
                  {isExpanded && (
                    <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2 text-slate-300">
                        <div><span className="text-slate-500">Color:</span> {item.color || 'N/A'}</div>
                        <div><span className="text-slate-500">Estilo:</span> {item.style}</div>
                        <div><span className="text-slate-500">Condición:</span> {item.condition}</div>
                        <div><span className="text-slate-500">Costo compra:</span> ${formatPrice(item.cost)}</div>
                        <div><span className="text-slate-500">Precio Insta:</span> ${formatPrice(item.priceSunday)}</div>
                        <div><span className="text-slate-500">Precio FB:</span> ${formatPrice(item.priceFB)}</div>
                        <div><span className="text-slate-500">Precio Paca:</span> ${formatPrice(item.pricePaca)}</div>
                        <div><span className="text-slate-500">Publicado:</span> ${formatPrice(item.pricePublished)}</div>
                      </div>
                      {item.dropName && (
                        <div className="pt-1.5 border-t border-slate-800/60 text-amber-300 text-[11px]">
                          <span className="text-slate-500">Drop:</span> {item.dropName}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })
          )}
        </main>

        {/* ── BARRA DE NAVEGACIÓN INFERIOR PARA IPHONE (BOTTOM BAR) ── */}
        <nav className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 px-4 py-2 pb-safe flex items-center justify-around shadow-2xl">
          <button
            type="button"
            onClick={() => setFilterVisible('all')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
              filterVisible === 'all' ? 'text-rose-400 font-medium' : 'text-slate-400'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px]">Inventario</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex flex-col items-center gap-1 p-1.5 text-slate-300 active:scale-95 transition-all"
          >
            <div className="w-9 h-9 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-rose-400 font-medium">Nueva</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPosModalOpen(true)}
            className="flex flex-col items-center gap-1 p-1.5 text-slate-400 active:scale-95 transition-all"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[10px]">POS / Venta</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBannerModalOpen(true)}
            className="flex flex-col items-center gap-1 p-1.5 text-slate-400 active:scale-95 transition-all"
          >
            <ImageIcon className="w-5 h-5" />
            <span className="text-[10px]">Banner Web</span>
          </button>
        </nav>

        {/* Modales */}
        <AddItemModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddItem}
        />

        <PosModal
          isOpen={isPosModalOpen}
          onClose={() => setIsPosModalOpen(false)}
          inventory={items}
          onSaleComplete={fetchInventory}
        />

        <BannerModal
          isOpen={isBannerModalOpen}
          onClose={() => setIsBannerModalOpen(false)}
          onUpdateBanner={handleUpdateBanner}
          isUpdating={false}
        />
      </div>
    </ErrorBoundary>
  );
}
