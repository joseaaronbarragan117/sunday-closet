// src/components/product/InstagramPostModal.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Heart,
  Share2,
  Lock,
  Tag,
} from "lucide-react";
import { Product } from "@/lib/data/mockProducts";
import { formatPrice } from "@/lib/utils/format";
import { DriveImage } from "@/components/common/DriveImage";
import { useFavoritesStore } from "@/lib/store/favoritesStore";
import { SingleProductCheckoutActions } from "@/components/product/SingleProductCheckoutActions";

interface InstagramPostModalProps {
  product: Product | null;
  onClose: () => void;
}

export const InstagramPostModal: React.FC<InstagramPostModalProps> = ({
  product,
  onClose,
}) => {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!product) return null;

  const favorite = isFavorite(product.id);
  const isAvailable = product.estado === "disponible";
  const isApartado = product.estado === "apartado";

  const handleDoubleTap = () => {
    if (!favorite) {
      toggleFavorite(product);
    }
    setShowHeartPop(true);
    setTimeout(() => setShowHeartPop(false), 900);
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Sunday Clóset — ${product.nombre}`,
          text: `Mira esta prenda única en Sunday Clóset: ${product.nombre} (${formatPrice(product.precio)})`,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-[#FFFFFF] border border-black/10 rounded-2xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[92vh] text-[#000000]"
        >
          {/* 1. Modal Header */}
          <div className="px-5 py-3.5 border-b border-black/10 flex items-center justify-between bg-[#FFFFFF] shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-[#000000] px-2.5 py-1 rounded-full bg-[#F7F7F7] border border-black/10">
                {product.id}
              </span>
              {isAvailable ? (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-black text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Disponible
                </span>
              ) : isApartado ? (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F7F7F7] text-[#111111] border border-black/15 flex items-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  Apartado
                </span>
              ) : null}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#666666] hover:text-black rounded-full hover:bg-[#F7F7F7] transition-colors active:scale-95"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5 stroke-[1.75]" />
            </button>
          </div>

          {/* 2. Scrollable Body */}
          <div className="p-4 sm:p-5 overflow-y-auto scrollbar-none space-y-4">
            {/* Main Photo */}
            <div
              onDoubleClick={handleDoubleTap}
              className="w-full aspect-[4/5] max-h-96 rounded-[6px] overflow-hidden bg-[#F7F7F7] relative select-none"
            >
              <DriveImage
                src={product.imagenUrl}
                alt={product.nombre || product.tipo}
                className="w-full h-full object-cover"
              />

              {/* Popping Heart Animation on Double-Tap */}
              {showHeartPop && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in zoom-in-50 duration-200">
                  <Heart className="w-20 h-20 fill-black text-white drop-shadow-xl animate-pulse" />
                </div>
              )}

              {/* Top-Right Favorite & Share Buttons */}
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product);
                  }}
                  className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs border border-black/10 text-black flex items-center justify-center active:scale-90 transition-all shadow-xs"
                  aria-label="Favorito"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      favorite ? "fill-black text-black" : "text-black"
                    }`}
                  />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                  className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs border border-black/10 text-black flex items-center justify-center active:scale-90 transition-all relative shadow-xs"
                  aria-label="Compartir"
                >
                  <Share2 className="w-4 h-4" />
                  {copiedLink && (
                    <span className="absolute -bottom-7 right-0 px-2 py-0.5 bg-black text-white text-[10px] font-medium rounded-full whitespace-nowrap shadow-md">
                      ¡Copiado!
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Title, Brand, and Price Row */}
            <div className="flex items-start justify-between gap-3 pt-1">
              <div className="space-y-0.5">
                <h3 className="text-[16px] font-semibold text-[#000000] leading-tight lowercase">
                  {product.nombre || product.tipo}
                </h3>
                <p className="text-[12px] text-[#666666]">
                  {product.marca || "Sunday Curated"} · talla {product.talla || "M"}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[18px] font-semibold text-[#000000]">
                  {formatPrice(product.precio)}
                </span>
                <span className="block text-[10px] text-[#666666] font-mono">
                  MXN
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#F7F7F7]">
                <span className="text-[10px] text-[#666666] block font-medium">Color</span>
                <span className="font-medium text-[#111111]">{product.color || "—"}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F7F7F7]">
                <span className="text-[10px] text-[#666666] block font-medium">Talla</span>
                <span className="font-medium text-[#111111]">{product.talla || "M"}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F7F7F7]">
                <span className="text-[10px] text-[#666666] block font-medium">Estilo</span>
                <span className="font-medium text-[#111111] capitalize">{product.estilo || "Vintage"}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F7F7F7]">
                <span className="text-[10px] text-[#666666] block font-medium">Condición</span>
                <span className="font-medium text-[#111111]">{product.condicion || "Nuevo c/etiqueta"}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F7F7F7]">
                <span className="text-[10px] text-[#666666] block font-medium">Estado</span>
                <span className="font-medium text-[#111111]">
                  {isAvailable ? "Disponible" : isApartado ? "Apartado" : "Agotado"}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F7F7F7]">
                <span className="text-[10px] text-[#666666] block font-medium">Pieza</span>
                <span className="font-medium text-[#111111]">1 de 1 única</span>
              </div>
            </div>

            {/* Description Box */}
            {product.descripcion && (
              <div className="p-3 rounded-lg bg-[#F7F7F7] text-[12px] text-[#333333] leading-relaxed space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#666666] flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Descripción
                </span>
                <p>{product.descripcion}</p>
              </div>
            )}

            <p className="text-[11px] text-[#666666] px-0.5">
              * Cada pieza de Sunday Clóset es única. Al apartarla se retira del catálogo para ti.
            </p>
          </div>

          {/* 3. Action Footer */}
          <div className="px-5 py-4 border-t border-black/10 bg-[#FFFFFF] shrink-0">
            {isAvailable ? (
              <SingleProductCheckoutActions product={product} />
            ) : isApartado ? (
              <div className="space-y-1.5">
                <button
                  disabled
                  className="w-full py-3.5 px-4 rounded-full bg-[#F7F7F7] border border-black/15 text-[#666666] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Prenda Apartada (No disponible)</span>
                </button>
                <p className="text-[10px] text-center text-[#666666]">
                  Esta prenda ya fue apartada por otra clienta. No se puede añadir a la bolsa ni comprar.
                </p>
              </div>
            ) : (
              <div className="w-full py-3.5 text-center bg-[#F7F7F7] text-[#666666] rounded-full text-xs font-semibold uppercase tracking-wider border border-black/10">
                Esta prenda ya fue adquirida
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
