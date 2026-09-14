// src/components/filter/FilterBottomSheet.tsx
"use client";

import React from "react";
import { X, RotateCcw, Check } from "lucide-react";

export interface FilterState {
  size: string | null;
  sort: "recent" | "price-asc" | "price-desc";
  onlyAvailable: boolean;
}

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onUpdateFilters: (f: FilterState) => void;
  onReset: () => void;
  totalResultsCount: number;
}

const SIZES = ["Todas", "XS", "S", "M", "L", "XL", "Única"];

const SORTS = [
  { id: "recent" as const, label: "Más recientes" },
  { id: "price-asc" as const, label: "Precio: Menor a Mayor" },
  { id: "price-desc" as const, label: "Precio: Mayor a Menor" },
];

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  isOpen,
  onClose,
  filters,
  onUpdateFilters,
  onReset,
  totalResultsCount,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[85vh] bg-white rounded-t-3xl overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E3DD]">
          <h3 className="font-display font-medium text-lg text-[#1F1F1F]">
            Filtros & Orden
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="p-2 text-xs font-medium text-[#8A8880] hover:text-[#1F1F1F] flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#EFEDE8] text-[#1F1F1F]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Tallas */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#1F1F1F]">
              Talla
            </label>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => {
                const isSelected =
                  (size === "Todas" && filters.size === null) ||
                  filters.size === size;

                return (
                  <button
                    key={size}
                    onClick={() =>
                      onUpdateFilters({
                        ...filters,
                        size: size === "Todas" ? null : size,
                      })
                    }
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-[#1F1F1F] text-white shadow-xs"
                        : "bg-[#F7F6F2] text-[#5A5852] border border-[#E5E3DD]"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ordenar por */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#1F1F1F]">
              Ordenar por
            </label>
            <div className="space-y-1.5">
              {SORTS.map((s) => {
                const isSelected = filters.sort === s.id;

                return (
                  <button
                    key={s.id}
                    onClick={() =>
                      onUpdateFilters({
                        ...filters,
                        sort: s.id,
                      })
                    }
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-[#F7F6F2] border-[#1F1F1F] text-[#1F1F1F]"
                        : "bg-white border-[#E5E3DD] text-[#5A5852]"
                    }`}
                  >
                    <span>{s.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#1F1F1F]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Disponibilidad */}
          <div className="pt-2 border-t border-[#E5E3DD]">
            <button
              onClick={() =>
                onUpdateFilters({
                  ...filters,
                  onlyAvailable: !filters.onlyAvailable,
                })
              }
              className="w-full flex items-center justify-between py-2 text-xs font-medium text-[#1F1F1F]"
            >
              <span>Mostrar únicamente piezas disponibles</span>
              <div
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  filters.onlyAvailable ? "bg-[#2E7D32]" : "bg-[#E5E3DD]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    filters.onlyAvailable ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#E5E3DD] safe-bottom">
          <button
            onClick={onClose}
            className="w-full py-3.5 px-5 rounded-2xl bg-[#1F1F1F] text-white font-semibold text-xs text-center pressable shadow-md"
          >
            Ver {totalResultsCount} {totalResultsCount === 1 ? "prenda" : "prendas"}
          </button>
        </div>
      </div>
    </div>
  );
};
