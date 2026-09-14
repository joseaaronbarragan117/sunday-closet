// src/components/layout/MobileHeader.tsx
"use client";

import React from "react";
import { ShoppingBag, Search, Sparkles } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";

interface MobileHeaderProps {
  onSearchClick: () => void;
  onCartClick: () => void;
  isSearchOpen?: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onSearchClick,
  onCartClick,
  isSearchOpen,
}) => {
  const count = useCartStore((s) => s.count());

  return (
    <header className="sticky top-0 z-30 w-full bg-[#F7F6F2]/95 backdrop-blur-md border-b border-[#E5E3DD] transition-all safe-top">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Brand Identity */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-medium text-2xl tracking-tight text-[#1F1F1F]">
              Sunday Clóset
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-[#C2A78C]/20 text-[#8C6D4F]">
              DROP
            </span>
          </div>
          <span className="text-[10px] tracking-widest uppercase font-light text-[#8A8880] -mt-0.5">
            Segunda Selección
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSearchClick}
            aria-label="Buscar prendas"
            className={`p-2.5 rounded-full border transition-all ${
              isSearchOpen
                ? "bg-[#1F1F1F] text-white border-[#1F1F1F]"
                : "bg-white text-[#1F1F1F] border-[#E5E3DD] active:scale-95 shadow-xs"
            }`}
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={onCartClick}
            aria-label="Ver bolsa de compras"
            className="relative p-2.5 rounded-full bg-white text-[#1F1F1F] border border-[#E5E3DD] active:scale-95 shadow-xs"
          >
            <ShoppingBag className="w-4 h-4" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C2A78C] text-[#1F1F1F] font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in-50">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
