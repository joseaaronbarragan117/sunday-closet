// src/components/filter/FilterBottomSheet.tsx
"use client";

import React, { useState } from "react";
import { X, ChevronRight, Minus, Plus, Check } from "lucide-react";

export interface FilterState {
  minPrice: number;
  maxPrice: number;
  sort: "recent" | "price-asc" | "price-desc";
  size: string | null;
  category: string | null;
  color: string | null;
  style: string | null;
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

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  isOpen,
  onClose,
  filters,
  onUpdateFilters,
  onReset,
  totalResultsCount,
}) => {
  const [priceSectionOpen, setPriceSectionOpen] = useState(true);
  const [openSection, setOpenSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSection = (name: string) => {
    setOpenSection((prev) => (prev === name ? null : name));
  };

  const sortOptions = [
    { id: "recent" as const, label: "Más recientes / Novedades" },
    { id: "price-asc" as const, label: "Precio: Menor a Mayor" },
    { id: "price-desc" as const, label: "Precio: Mayor a Menor" },
  ];

  const sizeOptions = ["Todas", "XS", "S", "M", "L", "XL", "Única"];
  const colorOptions = ["Todos", "Negro", "Blanco", "Beige", "Azul", "Rojo", "Verde", "Gris", "Floral"];
  const categoryOptions = [
    { id: null, label: "Todos los productos" },
    { id: "vestidos", label: "Vestidos" },
    { id: "superior", label: "Tops & Blusas" },
    { id: "inferior", label: "Pantalones & Faldas" },
    { id: "accesorio", label: "Bolsos & Accesorios" },
  ];
  const styleOptions = ["Todos", "Vintage 90s", "Minimal", "Streetwear", "Y2K", "Boho", "Casual"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg h-[92vh] bg-white flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header: Centered "FILTRO" with "✕" (exact as Screenshot 1) */}
        <div className="relative px-5 py-4 border-b border-[#EAEAEA] flex items-center justify-center">
          <h2 className="text-xs font-bold uppercase tracking-widest text-black font-sans">
            FILTRO
          </h2>

          <button
            onClick={onClose}
            aria-label="Cerrar filtros"
            className="absolute right-4 p-1.5 text-black hover:opacity-70 transition-opacity"
          >
            <X className="w-5 h-5 stroke-[1.8]" />
          </button>
        </div>

        {/* Scrollable Filter List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#EAEAEA]">
          {/* Section: RANGO DE PRECIOS (exact as Screenshot 1) */}
          <div className="p-5 space-y-4">
            <div
              onClick={() => setPriceSectionOpen(!priceSectionOpen)}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-black font-sans">
                RANGO DE PRECIOS
              </span>
              <button className="text-black">
                {priceSectionOpen ? (
                  <Minus className="w-4 h-4 stroke-[2]" />
                ) : (
                  <Plus className="w-4 h-4 stroke-[2]" />
                )}
              </button>
            </div>

            {priceSectionOpen && (
              <div className="space-y-4 pt-1">
                {/* Min & Max Price Labels */}
                <div className="flex items-center justify-between text-xs font-bold text-black font-sans">
                  <span>$ {filters.minPrice}.00</span>
                  <span>$ {filters.maxPrice}.00</span>
                </div>

                {/* Range Slider Track */}
                <div className="relative flex items-center py-2">
                  <input
                    type="range"
                    min={49}
                    max={9999}
                    step={50}
                    value={filters.maxPrice}
                    onChange={(e) =>
                      onUpdateFilters({
                        ...filters,
                        maxPrice: Number(e.target.value),
                      })
                    }
                    className="w-full accent-black h-1 bg-black rounded-none appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section: CLASIFICAR POR ➔ */}
          <div className="px-5 py-4">
            <div
              onClick={() => toggleSection("sort")}
              className="flex items-center justify-between cursor-pointer select-none group"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-black font-sans group-hover:text-[#E50010] transition-colors">
                CLASIFICAR POR
              </span>
              <ChevronRight
                className={`w-4 h-4 text-black transition-transform ${
                  openSection === "sort" ? "rotate-90" : ""
                }`}
              />
            </div>

            {openSection === "sort" && (
              <div className="pt-3 space-y-2 animate-in slide-in-from-top duration-150">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() =>
                      onUpdateFilters({ ...filters, sort: opt.id })
                    }
                    className={`w-full flex items-center justify-between p-2.5 text-xs text-left border ${
                      filters.sort === opt.id
                        ? "border-black font-bold text-black bg-[#F4F4F4]"
                        : "border-[#EAEAEA] text-[#767676]"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {filters.sort === opt.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section: COLOR ➔ */}
          <div className="px-5 py-4">
            <div
              onClick={() => toggleSection("color")}
              className="flex items-center justify-between cursor-pointer select-none group"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-black font-sans group-hover:text-[#E50010] transition-colors">
                COLOR {filters.color ? `(${filters.color})` : ""}
              </span>
              <ChevronRight
                className={`w-4 h-4 text-black transition-transform ${
                  openSection === "color" ? "rotate-90" : ""
                }`}
              />
            </div>

            {openSection === "color" && (
              <div className="pt-3 flex flex-wrap gap-2 animate-in slide-in-from-top duration-150">
                {colorOptions.map((color) => {
                  const isSelected =
                    (color === "Todos" && filters.color === null) ||
                    filters.color === color;

                  return (
                    <button
                      key={color}
                      onClick={() =>
                        onUpdateFilters({
                          ...filters,
                          color: color === "Todos" ? null : color,
                        })
                      }
                      className={`px-3 py-1.5 text-xs font-medium border ${
                        isSelected
                          ? "border-black bg-black text-white"
                          : "border-[#EAEAEA] text-[#767676] bg-white"
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: TALLA ➔ */}
          <div className="px-5 py-4">
            <div
              onClick={() => toggleSection("size")}
              className="flex items-center justify-between cursor-pointer select-none group"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-black font-sans group-hover:text-[#E50010] transition-colors">
                TALLA {filters.size ? `(${filters.size})` : ""}
              </span>
              <ChevronRight
                className={`w-4 h-4 text-black transition-transform ${
                  openSection === "size" ? "rotate-90" : ""
                }`}
              />
            </div>

            {openSection === "size" && (
              <div className="pt-3 flex flex-wrap gap-2 animate-in slide-in-from-top duration-150">
                {sizeOptions.map((sz) => {
                  const isSelected =
                    (sz === "Todas" && filters.size === null) ||
                    filters.size === sz;

                  return (
                    <button
                      key={sz}
                      onClick={() =>
                        onUpdateFilters({
                          ...filters,
                          size: sz === "Todas" ? null : sz,
                        })
                      }
                      className={`w-11 h-11 flex items-center justify-center text-xs font-bold border ${
                        isSelected
                          ? "border-black bg-black text-white"
                          : "border-[#EAEAEA] text-black bg-white hover:border-black"
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: TIPO DE PRODUCTO ➔ */}
          <div className="px-5 py-4">
            <div
              onClick={() => toggleSection("category")}
              className="flex items-center justify-between cursor-pointer select-none group"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-black font-sans group-hover:text-[#E50010] transition-colors">
                TIPO DE PRODUCTO
              </span>
              <ChevronRight
                className={`w-4 h-4 text-black transition-transform ${
                  openSection === "category" ? "rotate-90" : ""
                }`}
              />
            </div>

            {openSection === "category" && (
              <div className="pt-3 space-y-1.5 animate-in slide-in-from-top duration-150">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() =>
                      onUpdateFilters({
                        ...filters,
                        category: cat.id,
                      })
                    }
                    className={`w-full flex items-center justify-between p-2 text-xs text-left border ${
                      filters.category === cat.id
                        ? "border-black font-bold text-black bg-[#F4F4F4]"
                        : "border-[#EAEAEA] text-[#767676]"
                    }`}
                  >
                    <span>{cat.label}</span>
                    {filters.category === cat.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section: ESTILO ➔ */}
          <div className="px-5 py-4">
            <div
              onClick={() => toggleSection("style")}
              className="flex items-center justify-between cursor-pointer select-none group"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-black font-sans group-hover:text-[#E50010] transition-colors">
                ESTILO
              </span>
              <ChevronRight
                className={`w-4 h-4 text-black transition-transform ${
                  openSection === "style" ? "rotate-90" : ""
                }`}
              />
            </div>

            {openSection === "style" && (
              <div className="pt-3 flex flex-wrap gap-2 animate-in slide-in-from-top duration-150">
                {styleOptions.map((st) => (
                  <button
                    key={st}
                    onClick={() =>
                      onUpdateFilters({
                        ...filters,
                        style: st === "Todos" ? null : st,
                      })
                    }
                    className={`px-3 py-1.5 text-xs font-medium border ${
                      (st === "Todos" && filters.style === null) || filters.style === st
                        ? "border-black bg-black text-white"
                        : "border-[#EAEAEA] text-[#767676]"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section: DISPONIBILIDAD */}
          <div className="px-5 py-4 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-black font-sans">
              SOLO DISPONIBLES
            </span>
            <input
              type="checkbox"
              checked={filters.onlyAvailable}
              onChange={(e) =>
                onUpdateFilters({
                  ...filters,
                  onlyAvailable: e.target.checked,
                })
              }
              className="w-4 h-4 accent-black cursor-pointer"
            />
          </div>
        </div>

        {/* Sticky Bottom Actions (exact as Screenshot 1: BORRAR + VER [9222]) */}
        <div className="flex items-center border-t border-[#EAEAEA] safe-bottom bg-white">
          <button
            onClick={onReset}
            className="w-1/2 py-4 text-center text-xs font-bold uppercase tracking-widest text-[#767676] bg-[#EAEAEA] hover:bg-[#dedede] active:opacity-90 transition-colors select-none"
          >
            BORRAR
          </button>

          <button
            onClick={onClose}
            className="w-1/2 py-4 text-center text-xs font-bold uppercase tracking-widest text-white bg-black hover:bg-neutral-900 active:opacity-90 transition-colors select-none"
          >
            VER [{totalResultsCount}]
          </button>
        </div>
      </div>
    </div>
  );
};
