// src/components/home/InstagramCatalogFeed.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  X,
  Grid3X3,
  Grid2X2,
  SlidersHorizontal,
  ArrowUpDown,
  Lock,
  Sparkles,
  ShoppingBag,
  Heart,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { Product } from "@/lib/data/mockProducts";
import { formatPrice } from "@/lib/utils/format";
import { DriveImage } from "@/components/common/DriveImage";
import { InstagramPostModal } from "@/components/product/InstagramPostModal";
import { MobileCartSheet } from "@/components/cart/MobileCartSheet";
import { useCartStore } from "@/lib/store/cartStore";
import { useFavoritesStore } from "@/lib/store/favoritesStore";
import { mapItemToProduct, DASHBOARD_API_URL } from "@/lib/data/getProducts";

interface InstagramCatalogFeedProps {
  initialProducts: Product[];
}

export const InstagramCatalogFeed: React.FC<InstagramCatalogFeedProps> = ({
  initialProducts,
}) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "disponible" | "apartado">("all");
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"recent" | "price-asc" | "price-desc">("recent");
  const [gridColumns, setGridColumns] = useState<2 | 3>(3); // 3-col Instagram (default) or 2-col Pinterest
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { isOpen: isCartOpen, openCart, closeCart, count: cartCount } = useCartStore();
  const favCount = useFavoritesStore((s) => s.count());

  // Background live sync with Google Sheets via Dashboard API
  useEffect(() => {
    let isMounted = true;
    const fetchLatest = async () => {
      try {
        const res = await fetch(DASHBOARD_API_URL, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.products) && data.products.length > 0) {
            const mapped = data.products.map(mapItemToProduct);
            // Strict rule: visibleEnWeb and (disponible or apartado)
            const clean = mapped.filter(
              (p: Product) => p.visibleEnWeb && (p.estado === "disponible" || p.estado === "apartado")
            );
            if (isMounted && clean.length > 0) {
              setProducts(clean);
            }
          }
        }
      } catch {
        // Fallback gracefully to initialProducts
      }
    };

    fetchLatest();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter & Sort Calculation
  const displayProducts = useMemo(() => {
    let list = [...products];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.nombre?.toLowerCase().includes(q) ||
          p.tipo?.toLowerCase().includes(q) ||
          p.marca?.toLowerCase().includes(q) ||
          p.id?.toLowerCase().includes(q) ||
          p.color?.toLowerCase().includes(q) ||
          p.estilo?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      if (selectedCategory === "vestidos") {
        list = list.filter((p) => p.tipo.toLowerCase().includes("vestido") || p.nombre.toLowerCase().includes("vestido"));
      } else if (selectedCategory === "tops") {
        list = list.filter((p) => p.categoriaRopa === "superior" && !p.tipo.toLowerCase().includes("vestido"));
      } else if (selectedCategory === "pantalones") {
        list = list.filter((p) => p.categoriaRopa === "inferior");
      } else if (selectedCategory === "accesorios") {
        list = list.filter((p) => p.categoriaRopa === "accesorio");
      }
    }

    // Status filter: Disponible vs Apartada
    if (selectedStatus !== "all") {
      list = list.filter((p) => p.estado === selectedStatus);
    }

    // Size filter
    if (selectedSize !== "all") {
      list = list.filter((p) => p.talla?.toUpperCase() === selectedSize.toUpperCase());
    }

    // Sort order
    if (sortOrder === "recent") {
      // Keep natural order (newest first)
    } else if (sortOrder === "price-asc") {
      list.sort((a, b) => a.precio - b.precio);
    } else if (sortOrder === "price-desc") {
      list.sort((a, b) => b.precio - a.precio);
    }

    return list;
  }, [products, searchQuery, selectedCategory, selectedStatus, selectedSize, sortOrder]);

  const hasActiveFilters = Boolean(
    searchQuery ||
    selectedCategory !== "all" ||
    selectedStatus !== "all" ||
    selectedSize !== "all" ||
    sortOrder !== "recent"
  );

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSelectedSize("all");
    setSortOrder("recent");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col pb-24 select-none">
      {/* 1. Instagram Top Bar */}
      <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 safe-top">
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-lg text-white tracking-tight">
              sundaycloset.mx
            </span>
            <ShieldCheck className="w-4 h-4 text-rose-400 fill-rose-500/20" />
          </div>

          <div className="flex items-center gap-3">
            {/* Bag / Cart with live badge counter */}
            <button
              onClick={openCart}
              className="relative p-2 rounded-full hover:bg-neutral-800 active:scale-95 transition-all text-white"
              aria-label="Ver bolsa de compras"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
              {cartCount() > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 bg-gradient-to-tr from-pink-500 to-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md shadow-pink-500/40">
                  {cartCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Instagram Profile Bio Section */}
      <section className="max-w-3xl w-full mx-auto px-4 pt-4 pb-2 border-b border-neutral-900">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Avatar with gradient Story Ring */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-500 shadow-lg shadow-pink-500/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Sunday Clóset"
                className="w-full h-full rounded-full object-cover bg-neutral-900 ring-2 ring-neutral-950"
              />
            </div>
            <span className="absolute bottom-0 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-neutral-950 flex items-center justify-center text-[10px]" title="En línea">
              ✨
            </span>
          </div>

          {/* Profile Stats */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-around text-center py-1">
              <div>
                <span className="block font-bold text-sm sm:text-base text-white">
                  {products.length}
                </span>
                <span className="text-[10px] text-neutral-400">Prendas</span>
              </div>
              <div>
                <span className="block font-bold text-sm sm:text-base text-emerald-400">
                  {products.filter((p) => p.estado === "disponible").length}
                </span>
                <span className="text-[10px] text-neutral-400">Disponibles</span>
              </div>
              <div>
                <span className="block font-bold text-sm sm:text-base text-amber-400">
                  {products.filter((p) => p.estado === "apartado").length}
                </span>
                <span className="text-[10px] text-neutral-400">Apartadas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio Text */}
        <div className="mt-3 text-xs space-y-0.5">
          <p className="font-bold text-white text-sm">Sunday Clóset — Catálogo Móvil</p>
          <p className="text-neutral-300">
            🌸 Curaduría de moda circular, piezas vintage &amp; preloved únicas.
          </p>
          <p className="text-neutral-400 text-[11px]">
            📦 Envíos a todo México • Cada prenda es 1 de 1.
          </p>
          <p className="text-rose-400 font-medium text-[11px] pt-0.5">
            ✨ Toca cualquier foto para expandir datos y apartar por WhatsApp
          </p>
        </div>
      </section>

      {/* 3. Story Highlights Circles (Instagram Stories) */}
      <section className="w-full py-3 overflow-x-auto scrollbar-none border-b border-neutral-900 bg-neutral-950/60">
        <div className="flex items-center gap-3.5 px-4 max-w-3xl mx-auto">
          {[
            { id: "all", label: "✨ Todo", filter: "all" },
            { id: "vestidos", label: "👗 Vestidos", filter: "vestidos" },
            { id: "tops", label: "👚 Tops", filter: "tops" },
            { id: "pantalones", label: "👖 Pantalones", filter: "pantalones" },
            { id: "accesorios", label: "👜 Accesorios", filter: "accesorios" },
            { id: "disp", label: "🟢 Disponibles", status: "disponible" as const },
            { id: "apart", label: "🔒 Apartadas", status: "apartado" as const },
          ].map((story) => {
            const isCatActive = story.filter && selectedCategory === story.filter && selectedStatus === "all";
            const isStatusActive = story.status && selectedStatus === story.status;
            const isActive = isCatActive || isStatusActive;

            return (
              <button
                key={story.id}
                onClick={() => {
                  if (story.filter) {
                    setSelectedCategory(story.filter);
                    setSelectedStatus("all");
                  } else if (story.status) {
                    setSelectedStatus(story.status);
                    setSelectedCategory("all");
                  }
                }}
                className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
              >
                <div
                  className={`w-14 h-14 rounded-full p-[2px] transition-all ${
                    isActive
                      ? "bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-500 ring-2 ring-pink-500/40"
                      : "bg-neutral-800 hover:bg-neutral-700"
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center text-lg overflow-hidden border border-neutral-950">
                    <span className="group-hover:scale-110 transition-transform">
                      {story.label.split(" ")[0]}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] text-center max-w-[64px] truncate ${
                    isActive ? "font-bold text-rose-300" : "text-neutral-400"
                  }`}
                >
                  {story.label.split(" ")[1] || story.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Rescued Search & Filters Bar (Galería Feed Controls) */}
      <section className="sticky top-[49px] z-30 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 px-4 py-2.5 space-y-2 max-w-3xl w-full mx-auto">
        {/* Search Input Row */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por prenda, marca, color o estilo..."
              className="w-full pl-9 pr-8 py-2 bg-neutral-900 text-white placeholder-neutral-500 rounded-xl text-xs border border-neutral-800 focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Grid Layout Switcher (3-col Instagram vs 2-col Pinterest) */}
          <div className="flex items-center rounded-xl bg-neutral-900 border border-neutral-800 p-0.5 shrink-0">
            <button
              onClick={() => setGridColumns(3)}
              className={`p-1.5 rounded-lg transition-colors ${
                gridColumns === 3
                  ? "bg-rose-500 text-white shadow-xs"
                  : "text-neutral-400 hover:text-white"
              }`}
              title="Feed Instagram (3 columnas)"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setGridColumns(2)}
              className={`p-1.5 rounded-lg transition-colors ${
                gridColumns === 2
                  ? "bg-rose-500 text-white shadow-xs"
                  : "text-neutral-400 hover:text-white"
              }`}
              title="Catálogo Pinterest (2 columnas)"
            >
              <Grid2X2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter Pills Row (Touch Horizontal Scroll) */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] pt-1">
          {/* Status selector */}
          <button
            onClick={() => setSelectedStatus(selectedStatus === "all" ? "disponible" : selectedStatus === "disponible" ? "apartado" : "all")}
            className={`px-2.5 py-1 rounded-lg border font-medium shrink-0 flex items-center gap-1 transition-all ${
              selectedStatus === "disponible"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : selectedStatus === "apartado"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-neutral-900 text-neutral-400 border-neutral-800"
            }`}
          >
            <span>Estado:</span>
            <span className="font-bold text-white capitalize">
              {selectedStatus === "all" ? "Todos" : selectedStatus === "disponible" ? "Disponibles" : "Apartadas"}
            </span>
          </button>

          {/* Size Pills */}
          {["XS", "S", "M", "L", "XL"].map((sz) => (
            <button
              key={sz}
              onClick={() => setSelectedSize(selectedSize === sz ? "all" : sz)}
              className={`px-2.5 py-1 rounded-lg border font-medium shrink-0 transition-all ${
                selectedSize === sz
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold"
                  : "bg-neutral-900 text-neutral-400 border-neutral-800"
              }`}
            >
              {sz}
            </button>
          ))}

          {/* Sort Order Toggle */}
          <button
            onClick={() =>
              setSortOrder(
                sortOrder === "recent"
                  ? "price-asc"
                  : sortOrder === "price-asc"
                  ? "price-desc"
                  : "recent"
              )
            }
            className="px-2.5 py-1 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 shrink-0 flex items-center gap-1 hover:border-neutral-700"
          >
            <ArrowUpDown className="w-3 h-3 text-rose-400" />
            <span>
              {sortOrder === "recent"
                ? "Recientes"
                : sortOrder === "price-asc"
                ? "$ Menor"
                : "$ Mayor"}
            </span>
          </button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-2 py-1 rounded-lg text-rose-400 hover:text-rose-300 shrink-0 flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" /> Limpiar
            </button>
          )}
        </div>
      </section>

      {/* 5. The Feed Grid (3-Col Instagram / 2-Col Pinterest) */}
      <main className="max-w-3xl w-full mx-auto px-0.5 sm:px-2 pt-2 flex-1">
        {displayProducts.length === 0 ? (
          <div className="py-24 px-4 text-center space-y-3">
            <span className="text-4xl block">🔍</span>
            <p className="text-sm font-bold text-white">No se encontraron prendas</p>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              Prueba cambiando los filtros de categoría, talla o término de búsqueda.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
            >
              Ver todo el catálogo
            </button>
          </div>
        ) : (
          <div
            className={`grid ${
              gridColumns === 3
                ? "grid-cols-3 gap-0.5 sm:gap-1.5"
                : "grid-cols-2 gap-1.5 sm:gap-2.5"
            }`}
          >
            {displayProducts.map((product) => {
              const isApartada = product.estado === "apartado";

              return (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`aspect-square relative group cursor-pointer bg-neutral-900 overflow-hidden select-none active:scale-[0.98] transition-all ${
                    gridColumns === 2 ? "rounded-2xl border border-neutral-800" : ""
                  }`}
                >
                  {/* Photo */}
                  <DriveImage
                    src={product.imagenUrl}
                    alt={product.nombre || product.tipo}
                    className="w-full h-full object-cover"
                  />

                  {/* Corner Price Badge */}
                  <div className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 z-10 pointer-events-none">
                    <span className="px-1.5 py-0.5 rounded-md text-[9px] sm:text-xs font-bold font-mono bg-black/75 backdrop-blur-xs text-rose-300 border border-neutral-800">
                      {formatPrice(product.precio)}
                    </span>
                  </div>

                  {/* Apartada Ribbon / Overlay */}
                  {isApartada && (
                    <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex flex-col justify-between p-1.5 pointer-events-none">
                      <div className="self-start">
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold bg-amber-500/90 text-white shadow-md flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Apartada
                        </span>
                      </div>
                      <div className="text-left bg-black/70 p-1 rounded-md">
                        <p className="text-[9px] text-amber-200 font-semibold truncate leading-tight">
                          No disponible
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Subtle touch cue overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 6. Instagram Post Center Expansion Modal */}
      <InstagramPostModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* 7. Slide-over Cart Sheet */}
      <MobileCartSheet
        isOpen={isCartOpen}
        onClose={closeCart}
        onExploreClick={closeCart}
      />
    </div>
  );
};
