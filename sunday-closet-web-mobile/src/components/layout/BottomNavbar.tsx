// src/components/layout/BottomNavbar.tsx
"use client";

import React from "react";
import { Home, Compass, Heart, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { useFavoritesStore } from "@/lib/store/favoritesStore";

export type NavTab = "home" | "explore" | "favorites" | "cart";

interface BottomNavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNavbar: React.FC<BottomNavbarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const cartCount = useCartStore((s) => s.count());
  const favCount = useFavoritesStore((s) => s.count());

  const navItems = [
    { id: "home" as NavTab, label: "Inicio", icon: Home },
    { id: "explore" as NavTab, label: "Explorar", icon: Compass },
    { id: "favorites" as NavTab, label: "Favoritos", icon: Heart, badge: favCount },
    { id: "cart" as NavTab, label: "Bolsa", icon: ShoppingBag, badge: cartCount },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E3DD] safe-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative ${
                isActive
                  ? "text-[#1F1F1F] font-semibold"
                  : "text-[#8A8880] font-normal hover:text-[#1F1F1F]"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? "scale-110 stroke-[2.2]" : "scale-100 stroke-[1.7]"
                  } ${isActive && item.id === "favorites" ? "fill-rose-500 text-rose-500" : ""}`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#C2A78C] text-[#1F1F1F] text-[9px] font-bold flex items-center justify-center border-2 border-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#1F1F1F] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
