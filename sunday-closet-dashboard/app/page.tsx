'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { AddItemModal } from '@/components/modals/AddItemModal';
import { DropSchedulerModal } from '@/components/modals/DropSchedulerModal';
import { BannerModal } from '@/components/modals/BannerModal';
import { PosModal } from '@/components/modals/PosModal';
import { InventoryItem, NewItemFormData, ScheduleDropPayload } from '@/types/inventory';
import { Tag, Eye, EyeOff, Sparkles, Filter, Trash2 } from 'lucide-react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

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
      style: (item.style || 'Vintage'),
      condition: (item.condition || 'Nuevo c/etiqueta'),
      cost: Number(item.cost) || 0,
      priceSunday: Number(item.priceSunday) || 0,
      priceWeb: Number(item.priceWeb) || 0,
      priceFB: Number(item.priceFB) || 0,
      pricePaca: Number(item.pricePaca) || 0,
      pricePublished: Number(item.pricePublished) || 0,
      visibleInWeb: Boolean(item.visibleInWeb),
      status: (item.status || 'Disponible'),
      scheduledDropDate: item.scheduledDropDate ? String(item.scheduledDropDate) : undefined,
      dropName: item.dropName ? String(item.dropName) : undefined,
    }))
    .filter((item) => {
      if (!item.sku || seen.has(item.sku)) return false;
      seen.add(item.sku);
      return true;
    });
}

export default function DashboardPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'inventory' | 'add' | 'schedule' | 'banner' | 'pos'>('inventory');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [isPosModalOpen, setIsPosModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdatingBanner, setIsUpdatingBanner] = useState(false);
  const [updatingSku, setUpdatingSku] = useState<string | null>(null);
  const [deletingSku, setDeletingSku] = useState<string | null>(null);
  const [filterVisible, setFilterVisible] = useState<'all' | 'visible' | 'hidden'>('all');

  const [loadError, setLoadError] = useState<string | null>(null);

  // Clear cache and force fresh reload
  const handleHardReset = () => {
    try {
      localStorage.removeItem('sunday_inventory_cache');
    } catch {
      // ignore
    }
    setItems([]);
    setIsLoading(true);
    fetchInventory();
  };

  // Fetch Inventory Data with Timeout & Local Cache (Stale-While-Revalidate)
  const fetchInventory = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      setIsRefreshing(true);
      setLoadError(null);

      const res = await fetch('/api/inventory', {
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.items && Array.isArray(data.items)) {
        const clean = sanitizeItems(data.items);
        setItems(clean);
        try {
          localStorage.setItem('sunday_inventory_cache', JSON.stringify(clean));
        } catch {
          // Ignore localStorage errors in private mode
        }
      }
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
      const isTimeout = err.name === 'AbortError';
      const msg = isTimeout 
        ? 'Tiempo de espera agotado al consultar Google Sheets. Mostrando datos disponibles.' 
        : 'No se pudo sincronizar en vivo con Google Sheets.';
      setLoadError(msg);

      // Try reading from localStorage if current items are empty
      try {
        const cached = localStorage.getItem('sunday_inventory_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          const clean = sanitizeItems(parsed);
          if (clean.length > 0) {
            setItems(clean);
          }
        }
      } catch {
        // ignore
      }
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Initial quick load from local cache if available to prevent flash/waiting
    try {
      const cached = localStorage.getItem('sunday_inventory_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        const clean = sanitizeItems(parsed);
        if (clean.length > 0) {
          setItems(clean);
          setIsLoading(false);
        }
      }
    } catch {
      // ignore
    }

    fetchInventory();
  }, []);

  // Handle Toggle Switch Visibility (VERDADERO / FALSO)
  const handleToggleVisibility = async (sku: string, currentVisibility: boolean) => {
    const newVisibility = !currentVisibility;
    setUpdatingSku(sku);

    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) =>
        item.sku === sku ? { ...item, visibleInWeb: newVisibility } : item
      )
    );

    try {
      const res = await fetch('/api/update-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, visibleInWeb: newVisibility }),
      });

      if (!res.ok) {
        // Rollback on failure
        setItems((prev) =>
          prev.map((item) =>
            item.sku === sku ? { ...item, visibleInWeb: currentVisibility } : item
          )
        );
        alert('Error actualizando el Google Sheet');
      }
    } catch (err) {
      console.error('Toggle error:', err);
      // Rollback
      setItems((prev) =>
        prev.map((item) =>
          item.sku === sku ? { ...item, visibleInWeb: currentVisibility } : item
        )
      );
    } finally {
      setUpdatingSku(null);
    }
  };

  // Handle Deleting an Item from Google Sheets and Dashboard
  const handleDeleteItem = async (sku: string) => {
    const itemToDelete = items.find((it) => it.sku === sku);
    const itemName = itemToDelete ? `${itemToDelete.sku} (${itemToDelete.type})` : sku;

    const confirmed = window.confirm(`¿Estás seguro de que deseas eliminar permanentemente la prenda "${itemName}" del inventario y de Google Sheets?`);
    if (!confirmed) return;

    setDeletingSku(sku);

    // Optimistic UI update: Remove immediately from list
    const previousItems = [...items];
    const updatedList = items.filter((it) => it.sku !== sku);
    setItems(updatedList);
    try {
      localStorage.setItem('sunday_inventory_cache', JSON.stringify(updatedList));
    } catch {
      // ignore
    }

    try {
      const res = await fetch(`/api/inventory?sku=${encodeURIComponent(sku)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al eliminar de Google Sheets');
      }
    } catch (err: any) {
      console.error('Delete item error:', err);
      // Rollback on error
      setItems(previousItems);
      try {
        localStorage.setItem('sunday_inventory_cache', JSON.stringify(previousItems));
      } catch {
        // ignore
      }
      alert(`No se pudo eliminar la prenda: ${err.message || 'Error desconocido'}`);
    } finally {
      setDeletingSku(null);
    }
  };

  // Handle Adding New Item
  const handleAddItem = async (formData: NewItemFormData) => {
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success && data.item) {
        setItems((prev) => [data.item, ...prev]);
        setIsAddModalOpen(false);
        setActiveTab('inventory');
      } else {
        alert('Hubo un problema guardando la prenda.');
      }
    } catch (err) {
      console.error('Add item error:', err);
      alert('Error en la petición para guardar la prenda.');
    }
  };

  // Handle Drop Scheduling
  const handleScheduleDrop = async (payload: ScheduleDropPayload) => {
    try {
      const res = await fetch('/api/schedule-drop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setItems((prev) =>
          prev.map((item) => {
            if (payload.skus.includes(item.sku)) {
              return {
                ...item,
                status: 'Programado',
                scheduledDropDate: payload.scheduledAt,
              };
            }
            return item;
          })
        );
        setIsScheduleModalOpen(false);
        alert(`✨ ${data.message}`);
      } else {
        alert('Error al guardar el drop en Google Sheets.');
      }
    } catch (err) {
      console.error('Schedule drop error:', err);
      alert('Error al programar el drop.');
    }
  };

  // Handle Banner Update
  const handleUpdateBanner = async (bannerUrl: string) => {
    try {
      setIsUpdatingBanner(true);
      const res = await fetch('/api/banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bannerUrl }),
      });

      const data = await res.json();
      if (data.success) {
        setIsBannerModalOpen(false);
        alert('✨ ¡El banner de la web ha sido actualizado con éxito!');
      } else {
        alert('Error al guardar la imagen del banner.');
      }
    } catch (err) {
      console.error('Update banner error:', err);
      alert('Error al comunicar con la API del banner.');
    } finally {
      setIsUpdatingBanner(false);
    }
  };

  // Filtered items based on search query & visibility toggle filter
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterVisible === 'visible') return item.visibleInWeb;
    if (filterVisible === 'hidden') return !item.visibleInWeb;
    return true;
  });

  const hiddenCount = items.filter((item) => !item.visibleInWeb).length;
  const visibleCount = items.filter((item) => item.visibleInWeb).length;

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-slate-950 text-slate-100">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsMobileSidebarOpen(false);
            if (tab === 'add') setIsAddModalOpen(true);
            if (tab === 'schedule') setIsScheduleModalOpen(true);
            if (tab === 'banner') setIsBannerModalOpen(true);
            if (tab === 'pos') setIsPosModalOpen(true);
          }}
          onOpenAddModal={() => {
            setIsMobileSidebarOpen(false);
            setIsAddModalOpen(true);
          }}
          onOpenScheduleModal={() => {
            setIsMobileSidebarOpen(false);
            setIsScheduleModalOpen(true);
          }}
          onOpenBannerModal={() => {
            setIsMobileSidebarOpen(false);
            setIsBannerModalOpen(true);
          }}
          onOpenPosModal={() => {
            setIsMobileSidebarOpen(false);
            setIsPosModalOpen(true);
          }}
          hiddenCount={hiddenCount}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Workspace */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Topbar Navigation */}
          <Topbar
            searchQuery={searchQuery}
            setSearchQuery={(q) => setSearchQuery(q)}
            onRefresh={fetchInventory}
            isRefreshing={isRefreshing}
            totalCount={items.length}
            onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          />

        {/* Dashboard Main View Container */}
        <main 
          style={{
            paddingLeft: 'max(env(safe-area-inset-left, 0px), 16px)',
            paddingRight: 'max(env(safe-area-inset-right, 0px), 16px)',
            paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 32px)',
          }}
          className="p-4 md:p-8 space-y-6 max-w-7xl w-full mx-auto"
        >
          {/* Header Dashboard Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-slate-800 relative overflow-hidden shadow-2xl">
            <div className="space-y-1 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Sparkles className="w-3.5 h-3.5" /> Sunday Clóset Operational Hub
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-100">
                Inventario Privado &amp; Drops
              </h1>
              <p className="text-sm text-slate-400">
                Gestión en tiempo real sincronizada con Google Sheets como Base de Datos.
              </p>
            </div>

            {/* Metric Quick Stats */}
            <div className="flex items-center gap-3 relative z-10">
              <button
                onClick={() => setFilterVisible('all')}
                className={`px-4 py-2.5 rounded-2xl border text-xs font-medium transition-all ${
                  filterVisible === 'all'
                    ? 'bg-slate-800 text-white border-slate-700 shadow-xs'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-rose-400" />
                  <span>Todos ({items.length})</span>
                </div>
              </button>

              <button
                onClick={() => setFilterVisible('visible')}
                className={`px-4 py-2.5 rounded-2xl border text-xs font-medium transition-all ${
                  filterVisible === 'visible'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-xs'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Visible en Web ({visibleCount})</span>
                </div>
              </button>

              <button
                onClick={() => setFilterVisible('hidden')}
                className={`px-4 py-2.5 rounded-2xl border text-xs font-medium transition-all ${
                  filterVisible === 'hidden'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-xs'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ocultos / Drops ({hiddenCount})</span>
                </div>
              </button>
            </div>
          </div>

          {/* Active Filter Bar */}
          {filterVisible !== 'all' && (
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800">
              <Filter className="w-3.5 h-3.5 text-rose-400" />
              <span>Filtrando por: </span>
              <span className="font-semibold text-slate-200 capitalize">
                {filterVisible === 'visible' ? 'Prendas Visibles en Web' : 'Prendas Ocultas para Drops'}
              </span>
              <button
                onClick={() => setFilterVisible('all')}
                className="ml-auto text-rose-400 hover:underline"
              >
                Limpiar filtro
              </button>
            </div>
          )}

          {/* Connection Notification */}
          {loadError && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 bg-amber-950/40 border border-amber-800/60 rounded-2xl text-xs text-amber-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
                <span>{loadError}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => fetchInventory()}
                  disabled={isRefreshing}
                  className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {isRefreshing ? 'Reintentando...' : 'Reintentar'}
                </button>
                <button
                  onClick={handleHardReset}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg font-medium text-slate-300 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3 text-rose-400" />
                  Limpiar caché
                </button>
              </div>
            </div>
          )}

          {/* Inventory Table Container */}
          {isLoading && items.length === 0 ? (
            <div className="w-full py-20 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-4">
              <div className="inline-block w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mb-1"></div>
              <p className="text-sm font-medium text-slate-300">Cargando inventario desde Google Sheets...</p>
              <div>
                <button
                  onClick={handleHardReset}
                  className="text-xs text-rose-400 hover:text-rose-300 underline font-medium"
                >
                  ¿Tarda demasiado? Forzar recarga limpia
                </button>
              </div>
            </div>
          ) : (
            <InventoryTable
              items={filteredItems}
              onToggleVisibility={handleToggleVisibility}
              onDeleteItem={handleDeleteItem}
              isUpdatingSku={updatingSku}
              isDeletingSku={deletingSku}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setActiveTab('inventory');
        }}
        onSubmit={handleAddItem}
      />

      <DropSchedulerModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setActiveTab('inventory');
        }}
        items={items}
        onScheduleDrop={handleScheduleDrop}
      />

      <BannerModal
        isOpen={isBannerModalOpen}
        onClose={() => {
          setIsBannerModalOpen(false);
          setActiveTab('inventory');
        }}
        onUpdateBanner={handleUpdateBanner}
        isSubmitting={isUpdatingBanner}
      />

      {/* Manual Sales / POS Modal */}
      <PosModal
        isOpen={isPosModalOpen}
        onClose={() => {
          setIsPosModalOpen(false);
          setActiveTab('inventory');
        }}
        items={items}
        onSaleCompleted={(soldSkus) => {
          setItems((prev) =>
            prev.map((item) =>
              soldSkus.includes(item.sku)
                ? { ...item, status: 'Vendido', visibleInWeb: false }
                : item
            )
          );
          fetchInventory();
        }}
      />
    </div>
    </ErrorBoundary>
  );
}
