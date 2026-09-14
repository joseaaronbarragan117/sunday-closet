// src/components/home/MobileStorefront.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Product } from "@/lib/data/mockProducts";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { HMEditorialBanner } from "@/components/home/HMEditorialBanner";
import { HMSubNav } from "@/components/home/HMSubNav";
import { HMToolbar } from "@/components/home/HMToolbar";
import { MobileProductCard } from "@/components/product/MobileProductCard";
import { ProductDetailModal } from "@/components/product/ProductDetailModal";
import { MobileCartSheet } from "@/components/cart/MobileCartSheet";
import { FilterBottomSheet, FilterState } from "@/components/filter/FilterBottomSheet";
import { useCartStore } from "@/lib/store/cartStore";

interface MobileStorefrontProps {
  initialProducts: Product[];
}

export const MobileStorefront: React.FC<MobileStorefrontProps> = ({
  initialProducts,
}) => {
  // Active category tab in HMSubNav
  const [selectedTab, setSelectedTab] = useState<string>("all");

  // Columns layout: 2 columns (default) or 1 column
  const [columns, setColumns] = useState<1 | 2>(2);

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter Drawer state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    minPrice: 49,
    maxPrice: 9999,
    sort: "recent",
    size: null,
    category: null,
    color: null,
    style: null,
    onlyAvailable: false,
  });

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { isOpen: isCartOpen, openCart, closeCart } = useCartStore();

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

    // Category from HMSubNav tab
    if (selectedTab !== "all") {
      if (selectedTab === "bestsellers") {
        // Keep all
      } else if (selectedTab === "vestidos") {
        list = list.filter((p) => p.tipo.toLowerCase().includes("vestido") || p.nombre.toLowerCase().includes("vestido"));
      } else if (selectedTab === "superior") {
        list = list.filter((p) => p.categoriaRopa === "superior");
      } else if (selectedTab === "inferior") {
        list = list.filter((p) => p.categoriaRopa === "inferior");
      } else if (selectedTab === "accesorio") {
        list = list.filter((p) => p.categoriaRopa === "accesorio");
      }
    }

    // Category from Filter Drawer
    if (filters.category) {
      if (filters.category === "vestidos") {
        list = list.filter((p) => p.tipo.toLowerCase().includes("vestido") || p.nombre.toLowerCase().includes("vestido"));
      } else {
        list = list.filter((p) => p.categoriaRopa === filters.category);
      }
    }

    // Size filter
    if (filters.size) {
      list = list.filter((p) => p.talla?.toUpperCase() === filters.size?.toUpperCase());
    }

    // Color filter
    if (filters.color) {
      list = list.filter((p) => p.color?.toLowerCase().includes(filters.color!.toLowerCase()));
    }

    // Price range filter
    list = list.filter((p) => p.precio >= filters.minPrice && p.precio <= filters.maxPrice);

    // Only Available filter
    if (filters.onlyAvailable) {
      list = list.filter((p) => p.estado === "disponible");
    }

    // Sort order
    if (filters.sort === "price-asc") {
      list.sort((a, b) => a.precio - b.precio);
    } else if (filters.sort === "price-desc") {
      list.sort((a, b) => b.precio - a.precio);
    }

    return list;
  }, [initialProducts, searchQuery, selectedTab, filters]);

  const hasActiveFilters = Boolean(
    filters.size !== null ||
    filters.category !== null ||
    filters.color !== null ||
    filters.style !== null ||
    filters.onlyAvailable ||
    filters.sort !== "recent" ||
    filters.maxPrice < 9999
  );

  const handleResetFilters = () => {
    setFilters({
      minPrice: 49,
      maxPrice: 9999,
      sort: "recent",
      size: null,
      category: null,
      color: null,
      style: null,
      onlyAvailable: false,
    });
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col pb-20">
      {/* Mobile Header with Official Sunday Clóset Logo */}
      <MobileHeader
        onSearchClick={() => setIsSearchOpen((prev) => !prev)}
        onCartClick={openCart}
        onFavoritesClick={() => setIsFilterOpen(true)}
        isSearchOpen={isSearchOpen}
      />

      {/* Expandable Search Bar with comfortable margins */}
      {isSearchOpen && (
        <div className="w-full bg-white border-b border-[#EAEAEA] animate-in slide-in-from-top duration-150">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 py-3">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#767676] absolute left-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por prenda, marca o SKU..."
                className="w-full bg-[#F4F4F4] text-xs text-black placeholder-[#767676] pl-9 pr-8 py-3 border-b-2 border-black focus:outline-none"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-[#767676] hover:text-black"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Flow */}
      <main className="flex-1">
        {/* Full-bleed Editorial Banner (THE ONLY ELEMENT WITHOUT MARGINS) */}
        <HMEditorialBanner
          onExploreClick={() => {
            const el = document.getElementById("catalog-section");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          featuredPrice="$699.00"
        />

        <div id="catalog-section">
          {/* Category SubNav with large "VER TODO" title and margins */}
          <HMSubNav
            selectedTab={selectedTab}
            onSelectTab={setSelectedTab}
          />

          {/* Toolbar with product count, 1-col/2-col toggle, and Filter button with margins */}
          <HMToolbar
            totalCount={filteredProducts.length}
            columns={columns}
            onToggleColumns={() => setColumns((prev) => (prev === 2 ? 1 : 2))}
            onOpenFilter={() => setIsFilterOpen(true)}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Product Grid with Generous Margins & Spacing (Never touches screen edge) */}
          <div className="w-full max-w-5xl mx-auto px-5 sm:px-8 pt-6 pb-16">
            <div
              className={`${
                columns === 2
                  ? "grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10"
                  : "grid grid-cols-1 gap-y-10 max-w-md mx-auto"
              }`}
            >
              {filteredProducts.map((product) => (
                <MobileProductCard
                  key={product.id}
                  product={product}
                  onOpenDetail={setSelectedProduct}
                  isSingleColumn={columns === 1}
                />
              ))}
            </div>

            {/* Empty State with proper margins */}
            {filteredProducts.length === 0 && (
              <div className="py-24 px-6 text-center space-y-4 max-w-md mx-auto">
                <span className="text-4xl block">🔍</span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-black">
                  No encontramos productos con estos filtros
                </h3>
                <p className="text-xs text-[#767676]">
                  Prueba ajustando el rango de precios o eliminando filtros activos.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800"
                >
                  BORRAR FILTROS
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Filter Drawer Modal (exact as Screenshot 1) */}
      <FilterBottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onUpdateFilters={setFilters}
        onReset={handleResetFilters}
        totalResultsCount={filteredProducts.length}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Mobile Cart Sheet */}
      <MobileCartSheet
        isOpen={isCartOpen}
        onClose={closeCart}
        onExploreClick={() => {
          closeCart();
          const el = document.getElementById("catalog-section");
          el?.scrollIntoView({ behavior: "smooth" });
        }}
      />
    </div>
  );
};
