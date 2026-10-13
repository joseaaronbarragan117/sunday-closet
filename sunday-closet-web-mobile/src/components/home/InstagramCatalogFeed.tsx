// src/components/home/InstagramCatalogFeed.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  X,
  Grid3X3,
  Grid2X2,
  ArrowUpDown,
  Lock,
  Sparkles,
  ShoppingBag,
  Tag,
  Eye,
  RotateCcw,
  Check,
} from "lucide-react";
import { Product } from "@/lib/data/mockProducts";
import { formatPrice } from "@/lib/utils/format";
import { DriveImage } from "@/components/common/DriveImage";
import { InstagramPostModal } from "@/components/product/InstagramPostModal";
import { MobileCartSheet } from "@/components/cart/MobileCartSheet";
import { useCartStore } from "@/lib/store/cartStore";
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

  // Background live sync with Google Sheets via Dashboard API
  useEffect(() => {
    let isMounted = true;
    const fetchLatest = async () => {
      try {
        const res = await fetch(DASHBOARD_API_URL, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.products) && data.products.length > 0) {
            const mapped: Product[] = data.products.map(mapItemToProduct);
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
  const filteredProducts = useMemo(() => {
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
      } else if (selectedCategory === "abrigos") {
        list = list.filter((p) => p.tipo.toLowerCase().includes("blazer") || p.tipo.toLowerCase().includes("abrigo") || p.tipo.toLowerCase().includes("chamarra"));
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

  const totalAvailable = products.filter((p) => p.estado === "disponible").length;
  const totalApartadas = products.filter((p) => p.estado === "apartado").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-20 select-none">
      {/* 1. Sleek Dashboard Topbar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo image with rounded ring */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Sunday Clóset"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-rose-500/30"
            />
            <div className="flex flex-col">
              <span className="font-serif font-bold text-base sm:text-lg text-slate-100 leading-tight">
                Sunday Clóset
              </span>
              <span className="text-[10px] text-rose-400 font-medium tracking-wide">
                Catálogo Exclusivo
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Shopping Bag Button with Live Counter */}
            <button
              onClick={openCart}
              className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 flex items-center gap-2 active:scale-95 transition-all shadow-xs"
              aria-label="Abrir bolsa de compras"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-rose-400" />
                {cartCount() > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 bg-rose-500 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {cartCount()}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-semibold">Bolsa</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Container with Generous Aesthetic Margins */}
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 md:px-8 py-5 sm:py-7 space-y-5 flex-1">
        {/* Header Hero Banner (Identical to Dashboard Header Banner) */}
        <section className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden space-y-4">
          <div className="space-y-1 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Curaduría Vintage &amp; Preloved
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate-100">
              Prendas Únicas Sunday Clóset
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Cada prenda es pieza única (1 de 1). Toca cualquier imagen para ver medidas completas, detalles y apartar por WhatsApp.
            </p>
          </div>

          {/* Quick Stat Pill Selectors (Dashboard Stats Style) */}
          <div className="flex flex-wrap items-center gap-2 relative z-10 pt-1">
            <button
              onClick={() => setSelectedStatus("all")}
              className={`px-3.5 py-2 rounded-2xl border text-xs font-medium transition-all flex items-center gap-2 ${
                selectedStatus === "all"
                  ? "bg-slate-800 text-white border-slate-700 shadow-xs"
                  : "bg-slate-900/70 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-rose-400" />
              <span>Todas ({products.length})</span>
            </button>

            <button
              onClick={() => setSelectedStatus("disponible")}
              className={`px-3.5 py-2 rounded-2xl border text-xs font-medium transition-all flex items-center gap-2 ${
                selectedStatus === "disponible"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/35 shadow-xs font-semibold"
                  : "bg-slate-900/70 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Disponibles ({totalAvailable})</span>
            </button>

            <button
              onClick={() => setSelectedStatus("apartado")}
              className={`px-3.5 py-2 rounded-2xl border text-xs font-medium transition-all flex items-center gap-2 ${
                selectedStatus === "apartado"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/35 shadow-xs font-semibold"
                  : "bg-slate-900/70 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Apartadas ({totalApartadas})</span>
            </button>
          </div>
        </section>

        {/* Search & Shopping Filters Bar (Rescued from Galería Feed & Adapted for Clients) */}
        <section className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3.5">
          {/* Top Search Input & View Switcher */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por tipo de prenda, marca, color o estilo..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950 text-slate-100 placeholder-slate-500 rounded-2xl text-xs sm:text-sm border border-slate-800 focus:outline-none focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View Grid Switcher: 3-Col Instagram vs 2-Col Pinterest */}
            <div className="flex items-center bg-slate-950 rounded-2xl border border-slate-800 p-1 shrink-0">
              <button
                onClick={() => setGridColumns(3)}
                className={`p-2 rounded-xl transition-colors ${
                  gridColumns === 3
                    ? "bg-rose-500 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Feed Instagram (3 por fila)"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setGridColumns(2)}
                className={`p-2 rounded-xl transition-colors ${
                  gridColumns === 2
                    ? "bg-rose-500 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Catálogo Pinterest (2 columnas)"
              >
                <Grid2X2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category Shopping Pills (Horizontal Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs pt-1 border-t border-slate-800/60">
            <span className="text-[11px] text-slate-500 font-medium px-1 shrink-0">Categoría:</span>
            {[
              { id: "all", label: "Todas" },
              { id: "vestidos", label: "Vestidos" },
              { id: "tops", label: "Tops & Blusas" },
              { id: "pantalones", label: "Pantalones & Faldas" },
              { id: "abrigos", label: "Abrigos & Blazers" },
              { id: "accesorios", label: "Accesorios" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
                  selectedCategory === cat.id
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/35 font-semibold"
                    : "bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Size Pills & Sort Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
            {/* Tallas */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-[11px] text-slate-500 font-medium px-1 shrink-0">Talla:</span>
              {["all", "XS", "S", "M", "L", "XL"].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`px-2.5 py-1 rounded-xl font-medium shrink-0 transition-all ${
                    selectedSize === sz
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/35 font-semibold"
                      : "bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200"
                  }`}
                >
                  {sz === "all" ? "Todas" : sz}
                </button>
              ))}
            </div>

            {/* Price Sort & Reset */}
            <div className="flex items-center gap-2 ml-auto">
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
                className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-medium"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-rose-400" />
                <span>
                  {sortOrder === "recent"
                    ? "Recientes"
                    : sortOrder === "price-asc"
                    ? "Menor precio"
                    : "Mayor precio"}
                </span>
              </button>

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 px-1"
                >
                  <RotateCcw className="w-3 h-3" /> Limpiar
                </button>
              )}
            </div>
          </div>
        </section>

        {/* 3. The Feed Grid (Aesthetic Breathable Margins and Spacing) */}
        <section className="p-3 sm:p-5 rounded-3xl bg-slate-900/50 border border-slate-800 shadow-xl">
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center rounded-2xl bg-slate-900/40 text-slate-400 space-y-2">
              <Tag className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-300">No se encontraron prendas</p>
              <p className="text-xs text-slate-500">Prueba con otra categoría, talla o búsqueda.</p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 mt-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Ver todo el catálogo
              </button>
            </div>
          ) : (
            <div
              className={`grid ${
                gridColumns === 3
                  ? "grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5"
                  : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4.5"
              }`}
            >
              {filteredProducts.map((product) => {
                const isApartada = product.estado === "apartado";

                return (
                  <div
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className="aspect-square relative group cursor-pointer bg-slate-900 rounded-2xl overflow-hidden border border-slate-800/90 hover:border-rose-500/50 hover:shadow-lg hover:shadow-rose-500/5 active:scale-[0.98] transition-all select-none"
                  >
                    {/* Photo with DriveImage */}
                    <DriveImage
                      src={product.imagenUrl}
                      alt={product.nombre || product.tipo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                    />

                    {/* Top Status Pill on Card */}
                    {isApartada ? (
                      <div className="absolute top-1.5 left-1.5 z-10 pointer-events-none">
                        <span className="px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-bold bg-amber-500/25 text-amber-300 border border-amber-500/40 backdrop-blur-xs flex items-center gap-1 shadow-xs">
                          <Lock className="w-2.5 h-2.5" /> Apartada
                        </span>
                      </div>
                    ) : (
                      <div className="absolute top-1.5 right-1.5 z-10 pointer-events-none">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950 inline-block" title="Disponible" />
                      </div>
                    )}

                    {/* Bottom-right Price Tag */}
                    <div className="absolute bottom-1.5 right-1.5 z-10 pointer-events-none">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold font-mono bg-slate-950/85 backdrop-blur-xs text-rose-300 border border-slate-800 shadow-xs">
                        {formatPrice(product.precio)}
                      </span>
                    </div>

                    {/* Hover Card Overlay (Exact Galería Feed Style) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2.5 text-left pointer-events-none">
                      <p className="text-[10px] text-rose-400 font-mono tracking-tight truncate">
                        {product.id}
                      </p>
                      <p className="text-xs font-bold text-white truncate leading-tight capitalize">
                        {product.nombre || product.tipo}
                      </p>
                      <p className="text-[11px] text-slate-300 truncate">
                        {product.marca || "Sunday Curated"} • {product.talla || "M"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* 4. Instagram Post Modal with Exact Dashboard Dark Slate Aesthetic */}
      <InstagramPostModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* 5. Mobile Cart Sheet */}
      <MobileCartSheet
        isOpen={isCartOpen}
        onClose={closeCart}
        onExploreClick={closeCart}
      />
    </div>
  );
};
