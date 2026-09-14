// src/components/home/HMToolbar.tsx
"use client";

import React from "react";
import { SlidersHorizontal, Square } from "lucide-react";

interface HMToolbarProps {
  totalCount: number;
  columns: 1 | 2;
  onToggleColumns: () => void;
  onOpenFilter: () => void;
  hasActiveFilters?: boolean;
}

export const HMToolbar: React.FC<HMToolbarProps> = ({
  totalCount,
  columns,
  onToggleColumns,
  onOpenFilter,
  hasActiveFilters,
}) => {
  return (
    <div className="w-full bg-white border-b border-[#EAEAEA]">
      <div className="w-full max-w-5xl mx-auto px-5 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Product Count (Screenshot 3) */}
        <span className="text-xs text-[#767676] font-normal">
          {totalCount} productos
        </span>

        {/* Right Controls: View switcher & Filter button */}
        <div className="flex items-center gap-4 text-black">
          {/* Toggle 1-col vs 2-col */}
          <button
            onClick={onToggleColumns}
            title={columns === 2 ? "Ver 1 columna" : "Ver 2 columnas"}
            aria-label="Cambiar vista de columnas"
            className="p-1 hover:opacity-70 transition-opacity"
          >
            {columns === 2 ? (
              <div className="flex items-center gap-0.5">
                <span className="w-1 h-3.5 bg-black rounded-xs inline-block" />
                <span className="w-1 h-3.5 bg-black rounded-xs inline-block" />
              </div>
            ) : (
              <Square className="w-4 h-4 stroke-[2]" />
            )}
          </button>

          {/* Filter Trigger Button (exact icon from Screenshot 3) */}
          <button
            onClick={onOpenFilter}
            title="Abrir filtros"
            aria-label="Filtros"
            className="relative p-1 hover:opacity-70 transition-opacity"
          >
            <SlidersHorizontal className="w-4 h-4 stroke-[2]" />
            {hasActiveFilters && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#E50010]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
