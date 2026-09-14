// src/components/product/ProductDetailModal.tsx
"use client";

import React, { useState } from "react";
import { X, Heart, MessageCircle, ShoppingBag, Check } from "lucide-react";
import { Product } from "@/lib/data/mockProducts";
import { formatPrice } from "@/lib/utils/format";
import { formatDriveImageUrl } from "@/lib/imageUrl";
import { useFavoritesStore } from "@/lib/store/favoritesStore";
import { useCartStore } from "@/lib/store/cartStore";
import { createProductWhatsAppUrl } from "@/lib/utils/whatsapp";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
}) => {
  const [imgError, setImgError] = useState(false);
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { addItem, isInCart } = useCartStore();

  if (!product) return null;

  const favorite = isFavorite(product.id);
  const inCart = isInCart(product.id);
  const isAvailable = product.estado === "disponible";
  const photoUrl = formatDriveImageUrl(product.imagenUrl);
  const originalPrice = Math.round(product.precio * 1.18);

  const handleWhatsApp = () => {
    window.open(createProductWhatsAppUrl(product), "_blank");
  };

  const handleAddToCart = () => {
    if (isAvailable && !inCart) {
      addItem(product);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[92vh] bg-white flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#EAEAEA]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#767676]">
            SKU: {product.id}
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleFavorite(product)}
              className="p-1 text-black hover:opacity-70 active:scale-90 transition-all"
            >
              <Heart
                className={`w-5 h-5 ${
                  favorite ? "fill-[#E50010] text-[#E50010]" : "text-black"
                }`}
              />
            </button>

            <button
              onClick={onClose}
              className="p-1 text-black hover:opacity-70 active:scale-90 transition-all"
            >
              <X className="w-5 h-5 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Main Photo */}
          <div className="relative w-full aspect-3/4 bg-[#F4F4F4] overflow-hidden">
            {!imgError && photoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={photoUrl}
                alt={product.nombre || product.tipo}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-[#767676]">
                <span className="text-4xl mb-2">👗</span>
                <span className="text-xs uppercase tracking-wider font-bold">
                  Sunday Clóset
                </span>
              </div>
            )}

            <div className="absolute bottom-0 left-0 z-10">
              <span className="bg-black text-white text-xs font-bold px-3 py-1.5 inline-block uppercase tracking-wider">
                {isAvailable ? "-15%" : "AGOTADO"}
              </span>
            </div>
          </div>

          {/* Titles & Prices */}
          <div className="space-y-1">
            <span className="text-xs text-[#767676] uppercase tracking-wider font-semibold">
              {product.marca || "SUNDAY CURATED"}
            </span>

            <h2 className="text-base font-bold text-black uppercase tracking-tight">
              {product.nombre || product.tipo}
            </h2>

            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-lg font-bold text-[#E50010]">
                {formatPrice(product.precio)}
              </span>
              <span className="text-xs text-[#767676] line-through font-normal">
                {formatPrice(originalPrice)}
              </span>
            </div>
          </div>

          {/* Garment Details Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-[#F4F4F4] border border-[#EAEAEA]">
              <span className="block text-[10px] text-[#767676] uppercase font-bold tracking-wider">
                TALLA
              </span>
              <span className="font-bold text-black">{product.talla || "ÚNICA"}</span>
            </div>

            <div className="p-3 bg-[#F4F4F4] border border-[#EAEAEA]">
              <span className="block text-[10px] text-[#767676] uppercase font-bold tracking-wider">
                COLOR
              </span>
              <span className="font-bold text-black">{product.color || "VARIADO"}</span>
            </div>

            <div className="p-3 bg-[#F4F4F4] border border-[#EAEAEA]">
              <span className="block text-[10px] text-[#767676] uppercase font-bold tracking-wider">
                TIPO
              </span>
              <span className="font-bold text-black uppercase">{product.tipo}</span>
            </div>

            <div className="p-3 bg-[#F4F4F4] border border-[#EAEAEA]">
              <span className="block text-[10px] text-[#767676] uppercase font-bold tracking-wider">
                ESTADO
              </span>
              <span className="font-bold text-black uppercase">{product.estado}</span>
            </div>
          </div>

          {/* Description */}
          {product.descripcion && (
            <div className="p-4 border border-[#EAEAEA] bg-[#F4F4F4] space-y-1">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-black">
                DESCRIPCIÓN
              </h4>
              <p className="text-xs text-[#555555] leading-relaxed">
                {product.descripcion}
              </p>
            </div>
          )}

          <div className="p-3 bg-neutral-100 text-[11px] text-[#767676] leading-snug">
            * Cada prenda de Sunday Clóset es única. Si apartas esta pieza, se retira inmediatamente del catálogo para garantizar tu exclusividad.
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#EAEAEA] safe-bottom bg-white space-y-2">
          {isAvailable ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleWhatsApp}
                className="flex-1 py-4 text-center text-xs font-bold uppercase tracking-widest text-white bg-black hover:bg-neutral-900 active:opacity-90 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>APARTAR POR WHATSAPP</span>
              </button>

              <button
                onClick={handleAddToCart}
                className={`py-4 px-5 text-xs font-bold uppercase tracking-widest border border-black transition-all ${
                  inCart
                    ? "bg-[#2E7D32] border-[#2E7D32] text-white"
                    : "bg-white text-black hover:bg-[#F4F4F4]"
                }`}
              >
                {inCart ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <div className="w-full py-4 text-center bg-[#EAEAEA] text-[#767676] text-xs font-bold uppercase tracking-wider">
              ESTA PRENDA YA FUE ADQUIRIDA
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
