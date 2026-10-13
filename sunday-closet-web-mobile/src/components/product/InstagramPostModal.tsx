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
  Bookmark,
  ShieldCheck,
  Lock,
  Sparkles,
  Tag,
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
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 my-auto flex flex-col max-h-[92vh]"
        >
          {/* 1. Header (Instagram Post Style) */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-white/95 sticky top-0 z-20">
            <div className="flex items-center gap-2.5">
              {/* Profile Avatar with Instagram Gradient Ring */}
              <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-600">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="Sunday Clóset"
                  className="w-full h-full rounded-full object-cover bg-white"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-xs text-neutral-900 leading-none">
                    sundaycloset.mx
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />
                </div>
                <span className="text-[10px] text-neutral-500 leading-none mt-0.5">
                  Catálogo Oficial • Pieza Única
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 active:scale-90 transition-all"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 stroke-[2]" />
            </button>
          </div>

          {/* Scrollable Post Content */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
            {/* 2. Main Photo Container (Double-tap interaction) */}
            <div
              onDoubleClick={handleDoubleTap}
              className="relative w-full aspect-square bg-neutral-100 overflow-hidden select-none"
            >
              <DriveImage
                src={product.imagenUrl}
                alt={product.nombre || product.tipo}
                className="w-full h-full object-cover object-top"
              />

              {/* Popping Heart Animation on Double-Tap */}
              {showHeartPop && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-in zoom-in-50 duration-200">
                  <Heart className="w-24 h-24 fill-rose-500 text-white drop-shadow-2xl animate-pulse" />
                </div>
              )}

              {/* Status Ribbon in Photo */}
              <div className="absolute top-3 left-3">
                {isApartado ? (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white shadow-md flex items-center gap-1.5">
                    <Lock className="w-3 h-3" /> Apartada
                  </span>
                ) : isAvailable ? (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-md flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> Disponible (1 de 1)
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-neutral-800 text-white shadow-md">
                    No disponible
                  </span>
                )}
              </div>

              {/* SKU Badge */}
              <div className="absolute bottom-3 right-3">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/70 backdrop-blur-xs text-white">
                  SKU: {product.id}
                </span>
              </div>
            </div>

            {/* 3. Action Bar (Instagram Interaction Row) */}
            <div className="px-4 py-2.5 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleFavorite(product)}
                  className="p-1 hover:opacity-70 active:scale-90 transition-all text-neutral-800"
                  aria-label="Me gusta"
                >
                  <Heart
                    className={`w-6 h-6 transition-colors ${
                      favorite
                        ? "fill-rose-500 text-rose-500"
                        : "text-neutral-800 fill-none stroke-[1.8]"
                    }`}
                  />
                </button>

                <button
                  onClick={handleShare}
                  className="p-1 hover:opacity-70 active:scale-90 transition-all text-neutral-800 relative"
                  aria-label="Compartir prenda"
                >
                  <Share2 className="w-5 h-5 stroke-[1.8]" />
                  {copiedLink && (
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black text-white text-[9px] font-bold rounded-full whitespace-nowrap">
                      ¡Enlace copiado!
                    </span>
                  )}
                </button>

                {isAvailable && (
                  <button
                    onClick={handleAddToCart}
                    className="p-1 hover:opacity-70 active:scale-90 transition-all text-neutral-800"
                    aria-label="Añadir a la bolsa"
                  >
                    <ShoppingBag
                      className={`w-5 h-5 ${
                        inCart ? "text-emerald-600 stroke-[2.2]" : "stroke-[1.8]"
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Price Highlight */}
              <div className="text-right">
                <span className="text-lg font-serif font-black text-neutral-900 tracking-tight">
                  {formatPrice(product.precio)}
                </span>
                <span className="block text-[9px] text-neutral-400 uppercase font-semibold">
                  MXN
                </span>
              </div>
            </div>

            {/* 4. Instagram Post Description & Garment Specs */}
            <div className="p-4 space-y-3 bg-white text-xs text-neutral-800">
              {/* Post Caption Title */}
              <div>
                <p className="leading-relaxed">
                  <span className="font-bold text-neutral-900 mr-1.5">sundaycloset.mx</span>
                  <span className="font-semibold text-neutral-900 capitalize">
                    {product.nombre || product.tipo}
                  </span>{" "}
                  {product.marca && (
                    <span className="text-neutral-500">de {product.marca}</span>
                  )}
                  . {product.descripcion || "Pieza única seleccionada para Sunday Clóset."}
                </p>
              </div>

              {/* Garment Technical Specs (Ficha técnica en post) */}
              <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-rose-500" /> Detalles de la prenda
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-neutral-400 text-[10px] block">TALLA</span>
                    <span className="font-bold text-neutral-900">{product.talla || "M"}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-[10px] block">MARCA</span>
                    <span className="font-bold text-neutral-900 truncate block">
                      {product.marca || "Sunday Curated"}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-[10px] block">COLOR</span>
                    <span className="font-bold text-neutral-900">{product.color || "Único"}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-[10px] block">ESTILO</span>
                    <span className="font-bold text-neutral-900 capitalize">
                      {product.estilo || "Vintage"}
                    </span>
                  </div>
                  {product.condicion && (
                    <div className="col-span-2 pt-1 border-t border-neutral-100">
                      <span className="text-neutral-400 text-[10px] block">CONDICIÓN</span>
                      <span className="font-semibold text-neutral-700">
                        {product.condicion}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Exclusivity note */}
              <p className="text-[11px] text-neutral-400 italic">
                * Cada prenda de Sunday Clóset es única. Si la apartas, se reserva exclusivamente para ti.
              </p>
            </div>
          </div>

          {/* 5. Sticky Bottom Action Buttons */}
          <div className="p-4 bg-white border-t border-neutral-100 safe-bottom">
            {isAvailable ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleWhatsApp}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 active:scale-98 transition-transform"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Apartar por WhatsApp</span>
                </button>

                <button
                  onClick={handleAddToCart}
                  className={`py-3.5 px-5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-98 border ${
                    inCart
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-black border-black text-white hover:bg-neutral-800"
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
              /* Prenda Apartada: Se muestra pero NO se puede agregar al carrito ni comprar */
              <div className="space-y-1.5">
                <button
                  disabled
                  className="w-full py-3.5 px-4 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                >
                  <Lock className="w-4 h-4" />
                  <span>Prenda Apartada (No disponible)</span>
                </button>
                <p className="text-[10px] text-center text-amber-700/80">
                  Esta prenda ya fue apartada por otra clienta. No se puede comprar ni añadir a la bolsa.
                </p>
              </div>
            ) : (
              <div className="w-full py-3.5 text-center bg-neutral-100 text-neutral-400 rounded-2xl text-xs font-bold uppercase tracking-wider">
                Esta prenda ya fue adquirida
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
