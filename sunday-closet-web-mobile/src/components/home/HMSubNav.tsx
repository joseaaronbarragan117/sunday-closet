// src/components/home/HMSubNav.tsx
"use client";

import React from "react";

export interface CategoryTabItem {
  id: string;
  label: string;
}

export const HM_TABS: CategoryTabItem[] = [
  { id: "all", label: "VER TODO" },
  { id: "bestsellers", label: "LOS MÁS VENDIDOS" },
  { id: "vestidos", label: "VESTIDOS" },
  { id: "superior", label: "TOPS" },
  { id: "inferior", label: "PANTALONES" },
  { id: "accesorio", label: "ACCESORIOS" },
];

interface HMSubNavProps {
  selectedTab: string;
  onSelectTab: (tabId: string) => void;
}

export const HMSubNav: React.FC<HMSubNavProps> = ({
  selectedTab,
  onSelectTab,
}) => {
  const currentTabLabel =
    HM_TABS.find((t) => t.id === selectedTab)?.label || "VER TODO";

  return (
    <div className="w-full bg-white pt-2 border-b border-[#EAEAEA]">
      {/* Massive Bold Headline (exact as Screenshot 3) */}
      <div className="px-4 pb-4">
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black font-sans">
          {currentTabLabel}
        </h1>
      </div>

      {/* Horizontal Tabs with solid black underline on active */}
      <div className="flex items-center overflow-x-auto no-scrollbar px-4 gap-6">
        {HM_TABS.map((tab) => {
          const isActive = selectedTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`pb-3 text-xs tracking-wider uppercase whitespace-nowrap transition-all border-b-2 shrink-0 ${
                isActive
                  ? "border-black text-black font-bold"
                  : "border-transparent text-[#767676] font-medium hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
