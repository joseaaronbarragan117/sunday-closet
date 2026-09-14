"use client";

import React, { useState, useMemo } from "react";
import { Product } from "@/lib/data/mockProducts";
import ProductCard from "@/components/product/ProductCard";
import { motion, AnimatePresence } from "framer-motion";

interface ProductGridProps {
  products: Product[];
}

const STYLES = [
  { id: "todos", label: "Todos" },
  { id: "vintage", label: "Vintage" },
  { id: "streetwear", label: "Streetwear" },
  { id: "minimal", label: "Minimal" },
  { id: "y2k", label: "Y2K" },
];

const SIZES = [
  { id: "todas", label: "Todas" },
  { id: "XS", label: "XS" },
  { id: "S", label: "S" },
  { id: "M", label: "M" },
  { id: "L", label: "L" },
  { id: "XL", label: "XL" },
  { id: "Único", label: "Única" },
];

const COLORS = [
  { id: "todos", label: "Todos" },
  { id: "negro", label: "Negro" },
  { id: "beige", label: "Beige" },
  { id: "azul", label: "Azul" },
  { id: "blanco", label: "Blanco / Crema" },
  { id: "verde", label: "Verde" },
  { id: "floral", label: "Floral / Cuadros" },
];

const GARMENT_TYPES = [
  { id: "todos", label: "Todos" },
  { id: "top", label: "Top / Crop" },
  { id: "blusa", label: "Blusa" },
  { id: "camisa", label: "Camisa" },
  { id: "corset", label: "Corset" },
  { id: "blazer", label: "Blazer" },
  { id: "falda", label: "Falda" },
  { id: "pantalon", label: "Pantalón / Jeans" },
  { id: "accesorio", label: "Accesorios" },
];

export default function ProductGrid({ products }: ProductGridProps) {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState("todos");
  const [selectedSize, setSelectedSize] = useState("todas");
  const [selectedColor, setSelectedColor] = useState("todos");
  const [selectedType, setSelectedType] = useState("todos");

  const hasActiveFilters =
    selectedStyle !== "todos" ||
    selectedSize !== "todas" ||
    selectedColor !== "todos" ||
    selectedType !== "todos";

  const clearFilters = () => {
    setSelectedStyle("todos");
    setSelectedSize("todas");
    setSelectedColor("todos");
    setSelectedType("todos");
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Filtro Estilo
      if (selectedStyle !== "todos") {
        const pStyle = (product.estilo || "").toLowerCase();
        if (!pStyle.includes(selectedStyle)) return false;
      }

      // 2. Filtro Talla
      if (selectedSize !== "todas") {
        const pSize = (product.talla || "").toLowerCase();
        const target = selectedSize.toLowerCase();
        if (target === "único" || target === "unica") {
          if (!pSize.includes("únic") && !pSize.includes("unic") && !pSize.includes("one")) return false;
        } else if (pSize !== target) {
          return false;
        }
      }

      // 3. Filtro Color
      if (selectedColor !== "todos") {
        const pColor = (product.color || "").toLowerCase();
        const pDesc = (product.descripcion || "").toLowerCase();
        const pName = (product.nombre || "").toLowerCase();
        const searchTarget = `${pColor} ${pDesc} ${pName}`;

        if (selectedColor === "blanco") {
          if (!searchTarget.includes("blanco") && !searchTarget.includes("crema")) return false;
        } else if (selectedColor === "floral") {
          if (!searchTarget.includes("floral") && !searchTarget.includes("flores") && !searchTarget.includes("cuadros")) return false;
        } else if (selectedColor === "pantalon") {
          if (!searchTarget.includes("pantalon") && !searchTarget.includes("pantalón") && !searchTarget.includes("cargo") && !searchTarget.includes("jeans") && !searchTarget.includes("palazzo")) return false;
        } else {
          if (!searchTarget.includes(selectedColor)) return false;
        }
      }

      // 4. Filtro Tipo de prenda
      if (selectedType !== "todos") {
        const pType = (product.tipo || "").toLowerCase();
        const pCat = (product.categoriaRopa || "").toLowerCase();
        const pName = (product.nombre || "").toLowerCase();

        if (selectedType === "pantalon") {
          const isLower =
            pCat === "inferior" ||
            pType.includes("pant") ||
            pType.includes("jeans") ||
            pType.includes("cargo") ||
            pType.includes("palazzo");
          if (!isLower) return false;
        } else if (selectedType === "accesorio") {
          if (pCat !== "accesorio" && !pType.includes("bolso") && !pType.includes("gorra") && !pType.includes("cintur")) return false;
        } else {
          if (!pType.includes(selectedType) && !pName.includes(selectedType)) return false;
        }
      }

      return true;
    });
  }, [products, selectedStyle, selectedSize, selectedColor, selectedType]);

  return (
    <section id="productos" className="w-full bg-[#F7F6F2] py-20 sm:py-28">
      <div className="site-container space-y-10">
        {/* Header con título y botón de filtros con embudo gris */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#E5E3DD] pb-8">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#C2A78C] font-light">
              Colección Curada
            </span>
            <h2 className="font-display font-light text-3xl sm:text-4xl text-[#1F1F1F] mt-1">
              Todas las Piezas
            </h2>
          </div>

          {/* Botón de control de Filtros con emoji/ícono gris de embudo */}
          <div className="flex items-center gap-4">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-light tracking-wider text-[#A88C72] hover:text-[#1F1F1F] underline transition-colors"
              >
                Limpiar filtros
              </button>
            )}

            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#E5E3DD] bg-white/80 hover:bg-white text-[#1F1F1F] shadow-2xs transition-all duration-200"
              aria-expanded={filtersOpen}
              aria-label="Alternar filtros"
            >
              {/* Emoji gris de un embudo (SVG estilizado para máxima nitidez) */}
              <span className="inline-flex items-center justify-center text-[#8A8880]" aria-hidden="true">
                <svg
                  className="w-3.5 h-3.5 text-[#8A8880]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" fill="#8A8880" fillOpacity="0.2" />
                </svg>
              </span>
              <span className="font-display font-light italic text-base text-[#1F1F1F]">
                Filtros
              </span>
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#C2A78C]" />
              )}
            </button>
          </div>
        </div>

        {/* Panel de Filtros: 4 Categorías */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden bg-[#EFEDE8]/50 border border-[#E5E3DD] rounded-xs p-6 sm:p-8"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* 1. Categoría: Estilo */}
                <div className="space-y-3">
                  <h3 className="font-display font-light italic text-xl sm:text-2xl text-[#1F1F1F]">
                    Estilo
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {STYLES.map((item) => {
                      const isActive = selectedStyle === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedStyle(item.id)}
                          className={`px-3 py-1 rounded-full text-xs sm:text-sm font-light leading-relaxed tracking-wider transition-all duration-200 ${
                            isActive
                              ? "bg-[#1F1F1F] text-[#F7F6F2] shadow-xs"
                              : "text-[#5A5852] hover:text-[#1F1F1F] hover:bg-white/60 bg-transparent"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Categoría: Talla */}
                <div className="space-y-3">
                  <h3 className="font-display font-light italic text-xl sm:text-2xl text-[#1F1F1F]">
                    Talla
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {SIZES.map((item) => {
                      const isActive = selectedSize === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedSize(item.id)}
                          className={`px-3 py-1 rounded-full text-xs sm:text-sm font-light leading-relaxed tracking-wider transition-all duration-200 ${
                            isActive
                              ? "bg-[#1F1F1F] text-[#F7F6F2] shadow-xs"
                              : "text-[#5A5852] hover:text-[#1F1F1F] hover:bg-white/60 bg-transparent"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Categoría: Color */}
                <div className="space-y-3">
                  <h3 className="font-display font-light italic text-xl sm:text-2xl text-[#1F1F1F]">
                    Color
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {COLORS.map((item) => {
                      const isActive = selectedColor === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedColor(item.id)}
                          className={`px-3 py-1 rounded-full text-xs sm:text-sm font-light leading-relaxed tracking-wider transition-all duration-200 ${
                            isActive
                              ? "bg-[#1F1F1F] text-[#F7F6F2] shadow-xs"
                              : "text-[#5A5852] hover:text-[#1F1F1F] hover:bg-white/60 bg-transparent"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Categoría: Tipo de prenda */}
                <div className="space-y-3">
                  <h3 className="font-display font-light italic text-xl sm:text-2xl text-[#1F1F1F]">
                    Tipo de prenda
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {GARMENT_TYPES.map((item) => {
                      const isActive = selectedType === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedType(item.id)}
                          className={`px-3 py-1 rounded-full text-xs sm:text-sm font-light leading-relaxed tracking-wider transition-all duration-200 ${
                            isActive
                              ? "bg-[#1F1F1F] text-[#F7F6F2] shadow-xs"
                              : "text-[#5A5852] hover:text-[#1F1F1F] hover:bg-white/60 bg-transparent"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contador de resultados */}
        <div className="text-xs font-light tracking-wider text-[#8A8880]">
          Mostrando {filteredProducts.length} {filteredProducts.length === 1 ? "pieza" : "piezas"}
        </div>

        {/* Grid de Productos */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-[#8A8880] space-y-3">
            <p className="font-display font-light italic text-2xl text-[#1F1F1F]">
              No hay piezas disponibles con esta combinación de filtros.
            </p>
            <p className="text-xs sm:text-sm font-light text-[#5A5852] max-w-md mx-auto leading-relaxed">
              Prueba cambiando o limpiando los filtros para descubrir otras prendas de la curaduría.
            </p>
            <div className="pt-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-full text-xs font-light tracking-widest uppercase bg-[#1F1F1F] text-white hover:bg-[#C2A78C] transition-colors"
              >
                Ver todas las piezas
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 sm:gap-x-8 sm:gap-y-12">
            {filteredProducts.map((product, idx) => (
              <ProductCard key={product.id || product.slug} product={product} priority={idx < 4} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
