// src/components/home/CategoryPills.tsx
"use client";

import React from "react";
import { SlidersHorizontal } from "lucide-react";

interface CategoryPillsProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onOpenFilterSheet: () => void;
  hasActiveFilters?: boolean;
}

const CATEGORIES = [
  { id: "all", label: "Todas" },
  { id: "superior", label: "Superiores" },
  { id: "inferior", label: "Inferiores" },
  { id: "accesorio", label: "Accesorios" },
  { id: "disponible", label: "Solo Disponibles" },
];

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
  onOpenFilterSheet,
  hasActiveFilters,
}) => {
  return (
    <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto no-scrollbar">
      {/* Filter Button Trigger */}
      <button
        onClick={onOpenFilterSheet}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all shrink-0 pressable ${
          hasActiveFilters
            ? "bg-[#1F1F1F] text-white border-[#1F1F1F]"
            : "bg-white text-[#1F1F1F] border-[#E5E3DD] shadow-xs"
        }`}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>Filtros</span>
        {hasActiveFilters && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#C2A78C]" />
        )}
      </button>

      <div className="w-[1px] h-5 bg-[#E5E3DD] shrink-0" />

      {/* Pills */}
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 pressable ${
              isSelected
                ? "bg-[#1F1F1F] text-white shadow-xs"
                : "bg-white text-[#5A5852] border border-[#E5E3DD] hover:text-[#1F1F1F]"
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};
