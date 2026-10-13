// src/components/product/InstagramPostModal.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Heart,
  MessageCircle,
  ShoppingBag,
  Check,
  Share2,
  Lock,
  Sparkles,
  Tag,
  Copy,
} from "lucide-react";
import { Product } from "@/lib/data/mockProducts";
import { formatPrice } from "@/lib/utils/format";
import { DriveImage } from "@/components/common/DriveImage";
import { useFavoritesStore } from "@/lib/store/favoritesStore";
import { useCartStore } from "@/lib/store/cartStore";
import { createProductWhatsAppUrl } from "@/lib/utils/whatsapp";

interface InstagramPostModalProps {
  product: Product | null;
  onClose: () => void;
}

export const InstagramPostModal: React.FC<InstagramPostModalProps> = ({
  product,
  onClose,
}) => {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { addItem, isInCart } = useCartStore();
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!product) return null;

  const favorite = isFavorite(product.id);
  const inCart = isInCart(product.id);
  const isAvailable = product.estado === "disponible";
  const isApartado = product.estado === "apartado";

  const handleDoubleTap = () => {
    if (!favorite) {
      toggleFavorite(product);
    }
    setShowHeartPop(true);
    setTimeout(() => setShowHeartPop(false), 900);
  };

  const handleWhatsApp = () => {
    if (!isAvailable) return;
    window.open(createProductWhatsAppUrl(product), "_blank");
  };

  const handleAddToCart = () => {
    if (isAvailable && !inCart) {
      addItem(product);
    }
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
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[92vh] text-slate-100"
        >
          {/* 1. Modal Header (Exact Dashboard Style) */}
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-rose-400 px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/20">
                {product.id}
              </span>
              {isAvailable ? (
                <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Disponible
                </span>
              ) : isApartado ? (
                <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-amber-400" />
                  Apartada
                </span>
              ) : null}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors active:scale-95"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5 stroke-[2]" />
            </button>
          </div>

          {/* 2. Scrollable Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
            {/* Main Photo (Double-tap interaction like Instagram) */}
            <div
              onDoubleClick={handleDoubleTap}
              className="w-full aspect-square max-h-80 sm:max-h-96 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative select-none"
            >
              <DriveImage
                src={product.imagenUrl}
                alt={product.nombre || product.tipo}
                className="w-full h-full object-contain"
              />

              {/* Popping Heart Animation on Double-Tap */}
              {showHeartPop && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in zoom-in-50 duration-200">
                  <Heart className="w-24 h-24 fill-rose-500 text-white drop-shadow-2xl animate-pulse" />
                </div>
              )}

              {/* Top-Right Favorite & Share Buttons */}
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product);
                  }}
                  className="p-2 rounded-xl bg-slate-950/80 backdrop-blur-xs border border-slate-800 text-slate-300 hover:text-white active:scale-90 transition-all"
                  aria-label="Favorito"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      favorite ? "fill-rose-500 text-rose-500" : "text-slate-300"
                    }`}
                  />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                  className="p-2 rounded-xl bg-slate-950/80 backdrop-blur-xs border border-slate-800 text-slate-300 hover:text-white active:scale-90 transition-all relative"
                  aria-label="Compartir"
                >
                  <Share2 className="w-4 h-4" />
                  {copiedLink && (
                    <span className="absolute -bottom-7 right-0 px-2 py-0.5 bg-slate-950 text-rose-300 border border-slate-800 text-[10px] font-bold rounded-lg whitespace-nowrap shadow-md">
                      ¡Copiado!
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Title, Brand, and Price Row */}
            <div className="flex items-start justify-between gap-3 pt-1">
              <div className="space-y-0.5">
                <h3 className="text-lg sm:text-xl font-bold text-white leading-tight capitalize">
                  {product.nombre || product.tipo}
                </h3>
                <p className="text-xs text-slate-400">
                  Marca:{" "}
                  <span className="text-slate-200 font-semibold">
                    {product.marca || "Sunday Curated"}
                  </span>{" "}
                  • Talla:{" "}
                  <span className="text-rose-400 font-bold">{product.talla || "M"}</span>
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono text-2xl font-bold text-rose-400">
                  {formatPrice(product.precio)}
                </span>
                <span className="block text-[10px] text-slate-500 font-mono">
                  MXN
                </span>
              </div>
            </div>

            {/* Details Grid (Exact Dashboard Aesthetic from GalleryFeedView) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Color</span>
                <span className="font-semibold text-slate-200">{product.color || "—"}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Talla</span>
                <span className="font-semibold text-slate-200">{product.talla || "M"}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Estilo</span>
                <span className="font-semibold text-slate-200 capitalize">{product.estilo || "Vintage"}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Condición</span>
                <span className="font-semibold text-slate-200">{product.condicion || "Nuevo c/etiqueta"}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Estado</span>
                <span
                  className={`font-semibold ${
                    isAvailable
                      ? "text-emerald-400"
                      : isApartado
                      ? "text-amber-400"
                      : "text-rose-400"
                  }`}
                >
                  {isAvailable ? "Disponible" : isApartado ? "Apartada" : "Agotada"}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium">Pieza</span>
                <span className="font-semibold text-rose-300">1 de 1 única</span>
              </div>
            </div>

            {/* Description Box */}
            {product.descripcion && (
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-rose-400" /> Descripción
                </span>
                <p>{product.descripcion}</p>
              </div>
            )}

            <p className="text-[11px] text-slate-500 italic px-1">
              * Cada pieza de Sunday Clóset es única. Al apartarla se retira del catálogo para ti.
            </p>
          </div>

          {/* 3. Action Footer */}
          <div className="px-5 py-4 border-t border-slate-800 bg-slate-950/70 shrink-0">
            {isAvailable ? (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleWhatsApp}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 active:scale-98 transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Apartar por WhatsApp</span>
                </button>

                <button
                  onClick={handleAddToCart}
                  className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-98 border ${
                    inCart
                      ? "bg-emerald-600 border-emerald-500 text-white"
                      : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
                  }`}
                >
                  {inCart ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>En Bolsa</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Añadir</span>
                    </>
                  )}
                </button>
              </div>
            ) : isApartado ? (
              <div className="space-y-1.5">
                <button
                  disabled
                  className="w-full py-3.5 px-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Prenda Apartada (No disponible)</span>
                </button>
                <p className="text-[10px] text-center text-amber-400/80">
                  Esta prenda ya fue apartada por otra clienta. No se puede añadir a la bolsa ni comprar.
                </p>
              </div>
            ) : (
              <div className="w-full py-3.5 text-center bg-slate-950 text-slate-500 rounded-xl text-xs font-bold uppercase tracking-wider border border-slate-800">
                Esta prenda ya fue adquirida
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
