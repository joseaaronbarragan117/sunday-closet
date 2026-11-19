// src/components/home/InstagramCatalogFeed.tsx
"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, X, ShoppingBag } from "lucide-react";
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

const CATEGORY_OPTIONS = [
  { id: "all", label: "Todos" },
  { id: "vestido", label: "Vestidos" },
  { id: "superior", label: "Tops & Blusas" },
  { id: "inferior", label: "Prendas Inferiores" },
  { id: "abrigo", label: "Abrigos & Blazers" },
  { id: "accesorio", label: "Accesorios" },
  { id: "otros", label: "Otros" },
];

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL"];

export const InstagramCatalogFeed: React.FC<InstagramCatalogFeedProps> = ({
  initialProducts,
}) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [activeCollection, setActiveCollection] = useState<"CLOSET" | "SELECT">("CLOSET");
  const [isGridFading, setIsGridFading] = useState(false);

  // Persistent filter states (preserved when switching CLOSET <-> SELECT)
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "disponible" | "apartado">("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
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

  const handleCollectionSwitch = (target: "CLOSET" | "SELECT") => {
    if (target === activeCollection) return;
    setIsGridFading(true);
    setTimeout(() => {
      setActiveCollection(target);
      setIsGridFading(false);
    }, 150);
  };

  const handleToggleSearch = () => {
    setIsSearchOpen((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => searchInputRef.current?.focus(), 60);
      }
      return next;
    });
  };

  // Filter Calculation (preserves searchQuery, category, size, status across CLOSET/SELECT)
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchLine = (item.linea || "CLOSET").toUpperCase() === activeCollection.toUpperCase();
      const matchCategory = selectedCategory === "all" || item.categoriaRopa === selectedCategory;
      const matchStatus = selectedStatus === "all" || item.estado === selectedStatus;
      const matchSize =
        selectedSize === "all" || item.talla?.toUpperCase() === selectedSize.toUpperCase();

      let matchSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        matchSearch = Boolean(
          item.nombre?.toLowerCase().includes(q) ||
            item.tipo?.toLowerCase().includes(q) ||
            item.marca?.toLowerCase().includes(q) ||
            item.id?.toLowerCase().includes(q) ||
            item.color?.toLowerCase().includes(q) ||
            item.estilo?.toLowerCase().includes(q)
        );
      }

      return matchLine && matchCategory && matchStatus && matchSize && matchSearch;
    });
  }, [products, activeCollection, searchQuery, selectedCategory, selectedStatus, selectedSize]);

  const activeCategoryLabel =
    CATEGORY_OPTIONS.find((c) => c.id === selectedCategory)?.label || "";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedSize("all");
    setSelectedStatus("all");
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
      selectedCategory !== "all" ||
      selectedSize !== "all" ||
      selectedStatus !== "all"
  );

  const bagCount = cartCount();

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#000000] flex flex-col pb-20 select-none">
      {/* 1. Floating Dynamic Island & Minimal Side Controls */}
      <div className="fixed top-4 left-0 right-0 z-40 pointer-events-none px-4 flex items-center justify-between">
        {/* Left Search Trigger */}
        <button
          onClick={handleToggleSearch}
          aria-label="Buscar prendas"
          className="pointer-events-auto relative w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-black/10 text-black flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.08)] active:scale-95 transition-all duration-150"
        >
          {isSearchOpen ? (
            <X className="w-4 h-4 stroke-[1.75]" />
          ) : (
            <Search className="w-4 h-4 stroke-[1.75]" />
          )}
          {!isSearchOpen && searchQuery.trim() && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-black" />
          )}
        </button>

        {/* Center Floating Switch ("CLOSET" vs "SELECT") */}
        <div
          role="tablist"
          aria-label="Selector de colección"
          className="pointer-events-auto fixed left-1/2 -translate-x-1/2 top-4 w-[70%] max-w-[290px] h-[46px] rounded-full bg-[#000000] shadow-[0_8px_24px_rgba(0,0,0,0.15)] p-1"
        >
          <div className="relative w-full h-full grid grid-cols-2 items-center">
            {/* Elastic Sliding Active Capsule */}
            <span
              aria-hidden="true"
              className={`absolute top-0 bottom-0 left-0 w-1/2 rounded-full bg-[#262626] transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                activeCollection === "SELECT" ? "translate-x-full" : "translate-x-0"
              }`}
            />

            <button
              role="tab"
              aria-selected={activeCollection === "CLOSET"}
              onClick={() => handleCollectionSwitch("CLOSET")}
              className={`relative z-10 h-full rounded-full uppercase text-[12px] font-semibold tracking-[0.05em] flex items-center justify-center transition-opacity duration-200 cursor-pointer ${
                activeCollection === "CLOSET" ? "text-white opacity-100" : "text-white opacity-60"
              }`}
            >
              CLOSET
            </button>

            <button
              role="tab"
              aria-selected={activeCollection === "SELECT"}
              onClick={() => handleCollectionSwitch("SELECT")}
              className={`relative z-10 h-full rounded-full uppercase text-[12px] font-semibold tracking-[0.05em] flex items-center justify-center transition-opacity duration-200 cursor-pointer ${
                activeCollection === "SELECT" ? "text-white opacity-100" : "text-white opacity-60"
              }`}
            >
              SELECT
            </button>
          </div>
        </div>

        {/* Right Shopping Bag Trigger */}
        <button
          onClick={openCart}
          aria-label="Abrir bolsa de compras"
          className="pointer-events-auto relative w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-black/10 text-black flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.08)] active:scale-95 transition-all duration-150"
        >
          <ShoppingBag className="w-4 h-4 stroke-[1.75]" />
          {bagCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-black text-white text-[9px] font-semibold flex items-center justify-center">
              {bagCount}
            </span>
          )}
        </button>
      </div>

      {/* Top Spacer for Fixed Floating Island (16px top + 46px height + 12px gap = 74px) */}
      <div className="h-[74px] shrink-0" />

      {/* Optional Expandable Minimal Search Bar */}
      {isSearchOpen && (
        <div className="px-4 pb-2 bg-[#FFFFFF]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="buscar prenda, marca o color..."
              className="w-full h-9 pl-9 pr-9 rounded-full bg-[#F7F7F7] border border-black/15 text-[12px] text-black placeholder-[#888888] focus:outline-none focus:border-black transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-black p-0.5"
              >
                <X className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. Sticky Horizontal Active Filters Carousel */}
      <div className="sticky top-[74px] z-30 bg-white/85 backdrop-blur-md py-2.5">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-4">
          {/* Active Filter Pills First (Black #000000 bg, White #FFFFFF text, subtle X) */}
          {selectedCategory !== "all" && (
            <button
              onClick={() => setSelectedCategory("all")}
              className="h-[30px] px-3 rounded-full bg-[#000000] text-[#FFFFFF] text-[12px] font-medium shrink-0 flex items-center gap-1.5 active:scale-[0.96] transition-all duration-150 cursor-pointer"
            >
              <span>{activeCategoryLabel}</span>
              <X className="w-3 h-3 stroke-[1.5]" />
            </button>
          )}

          {selectedSize !== "all" && (
            <button
              onClick={() => setSelectedSize("all")}
              className="h-[30px] px-3 rounded-full bg-[#000000] text-[#FFFFFF] text-[12px] font-medium shrink-0 flex items-center gap-1.5 active:scale-[0.96] transition-all duration-150 cursor-pointer"
            >
              <span>Talla {selectedSize}</span>
              <X className="w-3 h-3 stroke-[1.5]" />
            </button>
          )}

          {selectedStatus !== "all" && (
            <button
              onClick={() => setSelectedStatus("all")}
              className="h-[30px] px-3 rounded-full bg-[#000000] text-[#FFFFFF] text-[12px] font-medium shrink-0 flex items-center gap-1.5 active:scale-[0.96] transition-all duration-150 cursor-pointer"
            >
              <span>{selectedStatus === "disponible" ? "Disponibles" : "Apartadas"}</span>
              <X className="w-3 h-3 stroke-[1.5]" />
            </button>
          )}

          {searchQuery.trim() && (
            <button
              onClick={() => setSearchQuery("")}
              className="h-[30px] px-3 rounded-full bg-[#000000] text-[#FFFFFF] text-[12px] font-medium shrink-0 flex items-center gap-1.5 active:scale-[0.96] transition-all duration-150 cursor-pointer"
            >
              <span>&ldquo;{searchQuery.trim()}&rdquo;</span>
              <X className="w-3 h-3 stroke-[1.5]" />
            </button>
          )}

          {/* Category Pills */}
          {CATEGORY_OPTIONS.map((cat) => {
            if (cat.id !== "all" && selectedCategory === cat.id) return null;
            const isAllActive = cat.id === "all" && !hasActiveFilters;

            return (
              <button
                key={cat.id}
                onClick={() =>
                  cat.id === "all" ? handleResetFilters() : setSelectedCategory(cat.id)
                }
                className={`h-[30px] px-3 rounded-full text-[12px] font-medium shrink-0 flex items-center transition-all duration-150 active:scale-[0.96] cursor-pointer ${
                  isAllActive
                    ? "bg-[#000000] text-[#FFFFFF] border border-[#000000]"
                    : "bg-[#FFFFFF] text-[#000000] border border-[#121212]/20 hover:border-[#121212]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}

          {/* Size Pills */}
          {SIZE_OPTIONS.map((sz) => {
            if (selectedSize === sz) return null;
            return (
              <button
                key={sz}
                onClick={() => setSelectedSize(sz)}
                className="h-[30px] px-3 rounded-full bg-[#FFFFFF] text-[#000000] border border-[#121212]/20 hover:border-[#121212] text-[12px] font-medium shrink-0 flex items-center transition-all duration-150 active:scale-[0.96] cursor-pointer"
              >
                Talla {sz}
              </button>
            );
          })}

          {/* Status Filter Pill */}
          {selectedStatus !== "disponible" && (
            <button
              onClick={() => setSelectedStatus("disponible")}
              className="h-[30px] px-3 rounded-full bg-[#FFFFFF] text-[#000000] border border-[#121212]/20 hover:border-[#121212] text-[12px] font-medium shrink-0 flex items-center transition-all duration-150 active:scale-[0.96] cursor-pointer"
            >
              Solo disponibles
            </button>
          )}
        </div>
      </div>

      {/* 3. Product Grid (2 Columns, 16px side padding, 14px gap, 9:16 aspect ratio) */}
      <main
        className={`px-4 pt-2 flex-1 transition-opacity duration-250 ease-in-out ${
          isGridFading ? "opacity-30" : "opacity-100"
        }`}
      >
        {filteredProducts.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <p className="text-[13px] font-medium text-[#111111]">
              no se encontraron prendas con estos filtros
            </p>
            <button
              onClick={handleResetFilters}
              className="h-[32px] px-4 rounded-full bg-[#000000] text-[#FFFFFF] text-[12px] font-medium active:scale-[0.96] transition-all duration-150"
            >
              ver todo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-[14px]">
            {filteredProducts.map((product) => {
              const isApartada = product.estado === "apartado";

              return (
                <article
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="group cursor-pointer active:scale-[0.98] transition-all duration-150 select-none flex flex-col gap-1.5"
                >
                  {/* 9:16 Vertical Image Container */}
                  <div className="relative w-full aspect-[9/16] rounded-[5px] overflow-hidden bg-[#F7F7F7]">
                    <DriveImage
                      src={product.imagenUrl}
                      alt={product.nombre || product.tipo}
                      className="w-full h-full object-cover group-hover:opacity-90 group-hover:scale-[1.02] transition-all duration-300 ease-out"
                    />

                    {/* Sold Out / Apartado Subtle Overlay + Center Badge */}
                    {isApartada && (
                      <div className="absolute inset-0 bg-black/5 flex items-center justify-center pointer-events-none">
                        <span className="px-2.5 py-1 rounded-[4px] bg-black/75 text-white border border-white/20 font-mono text-[10px] font-medium tracking-[0.08em] uppercase">
                          APARTADO
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Minimalist Product Info Below Photo */}
                  <div className="flex flex-col text-left px-0.5">
                    <h2 className="text-[11px] text-[#111111] lowercase truncate leading-tight">
                      {product.nombre || product.tipo}
                    </h2>
                    <p className="text-[11px] text-[#666666] truncate leading-tight mt-0.5">
                      {formatPrice(product.precio)}
                      {product.talla ? ` · ${product.talla}` : ""}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* 4. Product Expansion Modal (Backend/Cart Actions Preserved) */}
      <InstagramPostModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* 5. Mobile Cart Sheet (Backend/Manual Checkout Preserved) */}
      <MobileCartSheet
        isOpen={isCartOpen}
        onClose={closeCart}
        onExploreClick={closeCart}
      />
    </div>
  );
};
