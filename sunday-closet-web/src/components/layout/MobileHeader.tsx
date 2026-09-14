// src/components/layout/MobileHeader.tsx
"use client";

import React from "react";
import { Search, User, Heart, ShoppingBag, Menu } from "lucide-react";
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
  const cartCount = useCartStore((s) => s.count());
  const favCount = useFavoritesStore((s) => s.count());

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md safe-top border-b border-[#EAEAEA]">
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between px-5 sm:px-6 py-3">
        {/* Left: Authentic Sunday Clóset Logo */}
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Sunday Clóset"
            className="w-9 h-9 rounded-full object-cover shadow-xs ring-1 ring-black/5"
          />
          <div className="flex flex-col">
            <span className="font-serif font-bold text-base sm:text-lg tracking-tight text-black leading-none">
              Sunday Clóset
            </span>
            <span className="text-[9px] tracking-[0.2em] text-[#767676] uppercase font-medium mt-0.5">
              Curaduría Circular
            </span>
          </div>
        </div>

        {/* Right: Clean action icons with comfortable spacing */}
        <div className="flex items-center gap-4 text-black">
          <button
            onClick={onSearchClick}
            aria-label="Buscar"
            className="p-1 hover:opacity-70 transition-opacity"
          >
            <Search className="w-5 h-5 stroke-[1.8]" />
          </button>

          <button
            onClick={() => alert("Sunday Clóset — Piezas únicas seleccionadas a mano.")}
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
              <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-1 bg-[#E50010] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
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
              <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-1 bg-black text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
