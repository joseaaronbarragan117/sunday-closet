// src/components/layout/MobileHeader.tsx
"use client";

import React, { useState } from "react";
import { Search, User, Heart, ShoppingBag, Menu, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { useFavoritesStore } from "@/lib/store/favoritesStore";

interface MobileHeaderProps {
  onSearchClick: () => void;
  onCartClick: () => void;
  onFavoritesClick: () => void;
  isSearchOpen?: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onSearchClick,
  onCartClick,
  onFavoritesClick,
  isSearchOpen,
}) => {
  const [promoExpanded, setPromoExpanded] = useState(false);
  const cartCount = useCartStore((s) => s.count());
  const favCount = useFavoritesStore((s) => s.count());

  return (
    <header className="sticky top-0 z-40 w-full bg-white safe-top border-b border-[#EAEAEA]">
      {/* Top Red Promo Ribbon (exact as Screenshot 2) */}
      <div
        onClick={() => setPromoExpanded(!promoExpanded)}
        className="w-full bg-white border-b border-[#EAEAEA] px-4 py-2 flex items-center justify-between text-xs cursor-pointer select-none"
      >
        <span className="text-[#E50010] font-bold tracking-tight text-[11px] sm:text-xs">
          -15% EN TODO EL DROP VINTAGE
        </span>
        <button
          aria-label="Ver detalles de promoción"
          className="text-[#E50010] hover:opacity-80 p-0.5"
        >
          {promoExpanded ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>
      </div>

      {promoExpanded && (
        <div className="bg-[#F4F4F4] px-4 py-2.5 text-[11px] text-[#555555] border-b border-[#EAEAEA] animate-in slide-in-from-top duration-150">
          Aplica automáticamente en tu apartado por WhatsApp o compra en línea. Piezas únicas curadas de segunda selección.
        </div>
      )}

      {/* Main Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5">
        {/* Left: H&M-styled bold brand mark */}
        <div className="flex items-center">
          <span className="font-black italic text-2xl tracking-tighter text-[#E50010] font-sans">
            SUNDAY
          </span>
          <span className="font-bold text-xs tracking-widest text-black ml-1.5 uppercase -mb-1">
            Clóset
          </span>
        </div>

        {/* Right: Clean action icons (exact as Screenshot 2) */}
        <div className="flex items-center gap-4 text-black">
          <button
            onClick={onSearchClick}
            aria-label="Buscar"
            className="p-1 hover:opacity-70 transition-opacity"
          >
            <Search className="w-5 h-5 stroke-[1.8]" />
          </button>

          <button
            onClick={() => alert("Sunday Clóset — Tienda Móvil oficial")}
            aria-label="Cuenta"
            className="p-1 hover:opacity-70 transition-opacity"
          >
            <User className="w-5 h-5 stroke-[1.8]" />
          </button>

          <button
            onClick={onFavoritesClick}
            aria-label="Favoritos"
            className="relative p-1 hover:opacity-70 transition-opacity"
          >
            <Heart className="w-5 h-5 stroke-[1.8]" />
            {favCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 bg-[#E50010] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {favCount}
              </span>
            )}
          </button>

          <button
            onClick={onCartClick}
            aria-label="Bolsa de compras"
            className="relative p-1 hover:opacity-70 transition-opacity"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 bg-black text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={onSearchClick}
            aria-label="Menú"
            className="p-1 hover:opacity-70 transition-opacity"
          >
            <Menu className="w-5 h-5 stroke-[1.8]" />
          </button>
        </div>
      </div>
    </header>
  );
};
