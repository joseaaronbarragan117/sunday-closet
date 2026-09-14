// src/components/home/MobileStorefront.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Search, X, Sparkles, Heart, Compass, RefreshCw } from "lucide-react";
import { Product } from "@/lib/data/mockProducts";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { BottomNavbar, NavTab } from "@/components/layout/BottomNavbar";
import { StoriesHighlights } from "@/components/home/StoriesHighlights";
import { MobileHeroBanner } from "@/components/home/MobileHeroBanner";
import { CategoryPills } from "@/components/home/CategoryPills";
import { MobileProductCard } from "@/components/product/MobileProductCard";
import { ProductDetailModal } from "@/components/product/ProductDetailModal";
import { MobileCartSheet } from "@/components/cart/MobileCartSheet";
import { FilterBottomSheet, FilterState } from "@/components/filter/FilterBottomSheet";
import { useFavoritesStore } from "@/lib/store/favoritesStore";
import { useCartStore } from "@/lib/store/cartStore";

interface MobileStorefrontProps {
  initialProducts: Product[];
}

export const MobileStorefront: React.FC<MobileStorefrontProps> = ({
  initialProducts,
}) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<NavTab>("home");

  // Search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Category & Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [storyCategory, setStoryCategory] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    size: null,
    sort: "recent",
    onlyAvailable: false,
  });
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Cart
  const { isOpen: isCartOpen, openCart, closeCart } = useCartStore();

  // Favorites
  const { favorites } = useFavoritesStore();

  // Combined Category Filter
  const effectiveCategory = storyCategory || (selectedCategory !== "all" ? selectedCategory : null);

  // Filtered Products Calculation
  const filteredProducts = useMemo(() => {
    let list = [...initialProducts];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.nombre?.toLowerCase().includes(q) ||
          p.tipo?.toLowerCase().includes(q) ||
          p.marca?.toLowerCase().includes(q) ||
          p.id?.toLowerCase().includes(q) ||
          p.color?.toLowerCase().includes(q)
      );
    }

    // Category
    if (effectiveCategory) {
      if (effectiveCategory === "disponible") {
        list = list.filter((p) => p.estado === "disponible");
      } else {
        list = list.filter((p) => p.categoriaRopa === effectiveCategory);
      }
    }

    // Size
    if (filters.size) {
      list = list.filter((p) => p.talla?.toUpperCase() === filters.size?.toUpperCase());
    }

    // Only Available
    if (filters.onlyAvailable) {
      list = list.filter((p) => p.estado === "disponible");
    }

    // Sort
    if (filters.sort === "price-asc") {
      list.sort((a, b) => a.precio - b.precio);
    } else if (filters.sort === "price-desc") {
      list.sort((a, b) => b.precio - a.precio);
    }

    return list;
  }, [initialProducts, searchQuery, effectiveCategory, filters]);

  const hasActiveFilters = Boolean(
    filters.size !== null ||
    filters.onlyAvailable ||
    filters.sort !== "recent"
  );

  const handleTabChange = (tab: NavTab) => {
    if (tab === "cart") {
      openCart();
    } else {
      setActiveTab(tab);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleResetFilters = () => {
    setFilters({
      size: null,
      sort: "recent",
      onlyAvailable: false,
    });
    setSelectedCategory("all");
    setStoryCategory(null);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col pb-24">
      {/* Fixed Sticky Header */}
      <MobileHeader
        onSearchClick={() => setIsSearchOpen((prev) => !prev)}
        onCartClick={openCart}
        isSearchOpen={isSearchOpen}
      />

      {/* Expandable Search Input */}
      {isSearchOpen && (
        <div className="px-4 py-2.5 bg-white border-b border-[#E5E3DD] animate-in slide-in-from-top duration-200">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#8A8880] absolute left-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por prenda, marca (ej. Zara, Levi's) o SKU..."
              className="w-full bg-[#F7F6F2] text-xs text-[#1F1F1F] placeholder-[#8A8880] pl-9 pr-8 py-2.5 rounded-full border border-[#E5E3DD] focus:outline-none focus:border-[#C2A78C]"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-[#8A8880] hover:text-[#1F1F1F]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: HOME */}
      {activeTab === "home" && (
        <main className="flex-1">
          {/* Stories Highlights */}
          <StoriesHighlights
            selectedFilter={storyCategory}
            onSelectCategory={(cat) => {
              setStoryCategory(cat);
              if (cat) setSelectedCategory("all");
            }}
          />

          {/* Editorial Banner */}
          <MobileHeroBanner
            onExploreClick={() => {
              const el = document.getElementById("mobile-catalog");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          />

          {/* Catalog Section */}
          <div id="mobile-catalog" className="pt-2">
            {/* Category Filter Pills */}
            <CategoryPills
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setStoryCategory(null);
              }}
              onOpenFilterSheet={() => setIsFilterSheetOpen(true)}
              hasActiveFilters={hasActiveFilters}
            />

            {/* Results Counter & Active Filter Tags */}
            <div className="flex items-center justify-between px-4 py-2 text-xs text-[#8A8880]">
              <span>
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "prenda disponible" : "prendas"}
              </span>

              {(storyCategory || hasActiveFilters || searchQuery) && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-[#8C6D4F] hover:underline"
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            {/* 2-Column Product Grid */}
            <div className="grid grid-cols-2 gap-3 px-4 py-2">
              {filteredProducts.map((product) => (
                <MobileProductCard
                  key={product.id}
                  product={product}
                  onOpenDetail={setSelectedProduct}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="py-20 px-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white border border-[#E5E3DD] mx-auto flex items-center justify-center text-xl">
                  🔍
                </div>
                <h3 className="font-display font-medium text-base text-[#1F1F1F]">
                  No se encontraron prendas
                </h3>
                <p className="text-xs text-[#8A8880] max-w-xs mx-auto">
                  Prueba cambiando tus filtros o buscando con otros términos.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-full bg-[#1F1F1F] text-white text-xs font-semibold"
                >
                  Ver todo el catálogo
                </button>
              </div>
            )}
          </div>
        </main>
      )}

      {/* TAB CONTENT: EXPLORE */}
      {activeTab === "explore" && (
        <main className="flex-1 p-4 space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C2A78C]">
              Curaduría Digital
            </span>
            <h2 className="font-display font-medium text-2xl text-[#1F1F1F]">
              Explorar Colección
            </h2>
            <p className="text-xs text-[#5A5852] font-light">
              Navega por las categorías de nuestra selección de moda circular.
            </p>
          </div>

          {/* Big Visual Category Cards */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { id: "superior", title: "Prendas Superiores", count: "Tops & Blusas", icon: "👚", bg: "bg-amber-50" },
              { id: "inferior", title: "Prendas Inferiores", count: "Pantalones & Faldas", icon: "👖", bg: "bg-blue-50" },
              { id: "accesorio", title: "Accesorios", count: "Bolsos & Joyería", icon: "👜", bg: "bg-emerald-50" },
              { id: "all", title: "Catálogo Completo", count: "Todas las piezas", icon: "✨", bg: "bg-stone-100" },
            ].map((card) => (
              <div
                key={card.id}
                onClick={() => {
                  setSelectedCategory(card.id);
                  setActiveTab("home");
                }}
                className={`p-4 rounded-2xl border border-[#E5E3DD] ${card.bg} space-y-3 cursor-pointer pressable shadow-xs`}
              >
                <div className="text-3xl">{card.icon}</div>
                <div>
                  <h4 className="font-display font-semibold text-sm text-[#1F1F1F]">
                    {card.title}
                  </h4>
                  <span className="text-[11px] text-[#8A8880]">
                    {card.count}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Grid */}
          <div className="pt-4">
            <h3 className="font-display font-medium text-lg text-[#1F1F1F] mb-3">
              Últimas Adiciones
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {initialProducts.slice(0, 4).map((p) => (
                <MobileProductCard
                  key={p.id}
                  product={p}
                  onOpenDetail={setSelectedProduct}
                />
              ))}
            </div>
          </div>
        </main>
      )}

      {/* TAB CONTENT: FAVORITES */}
      {activeTab === "favorites" && (
        <main className="flex-1 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-[#C2A78C]">
                Tus Piezas Guardadas
              </span>
              <h2 className="font-display font-medium text-2xl text-[#1F1F1F]">
                Favoritos ({favorites.length})
              </h2>
            </div>
          </div>

          {favorites.length === 0 ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white border border-[#E5E3DD] mx-auto flex items-center justify-center text-rose-500 shadow-xs">
                <Heart className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-medium text-lg text-[#1F1F1F]">
                  Aún no tienes prendas guardadas
                </h3>
                <p className="text-xs text-[#8A8880] max-w-xs mx-auto">
                  Presiona el corazón en cualquier prenda para guardarla y revisarla después.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("home")}
                className="px-5 py-2.5 rounded-full bg-[#1F1F1F] text-white text-xs font-semibold pressable"
              >
                Explorar Catálogo →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {favorites.map((product) => (
                <MobileProductCard
                  key={product.id}
                  product={product}
                  onOpenDetail={setSelectedProduct}
                />
              ))}
            </div>
          )}
        </main>
      )}

      {/* Modals & Sheets */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <MobileCartSheet
        isOpen={isCartOpen}
        onClose={closeCart}
        onExploreClick={() => {
          closeCart();
          setActiveTab("home");
        }}
      />

      <FilterBottomSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        filters={filters}
        onUpdateFilters={setFilters}
        onReset={handleResetFilters}
        totalResultsCount={filteredProducts.length}
      />

      {/* Fixed Bottom Navigation Bar */}
      <BottomNavbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
};
