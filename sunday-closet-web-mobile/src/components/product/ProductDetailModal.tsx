// src/components/product/ProductDetailModal.tsx
"use client";

import React, { useState } from "react";
import { X, Heart, MessageCircle, ShoppingBag, Check, ShieldCheck, Sparkles, Tag } from "lucide-react";
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

  const handleWhatsApp = () => {
    window.open(createProductWhatsAppUrl(product), "_blank");
  };

  const handleAddToCart = () => {
    if (isAvailable && !inCart) {
      addItem(product);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg max-h-[92vh] bg-[#F7F6F2] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Sticky Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E5E3DD] bg-white/90 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2E7D32]" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#8A8880]">
              SKU: {product.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(product)}
              className="p-2 rounded-full bg-[#F7F6F2] border border-[#E5E3DD] active:scale-95 transition-transform"
            >
              <Heart
                className={`w-4 h-4 ${
                  favorite ? "fill-rose-500 text-rose-500" : "text-[#5A5852]"
                }`}
              />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#F7F6F2] hover:bg-[#E5E3DD] text-[#1F1F1F] border border-[#E5E3DD] active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Main Image */}
          <div className="relative w-full aspect-3/4 rounded-2xl overflow-hidden bg-[#EFEDE8] border border-[#E5E3DD]">
            {!imgError && photoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={photoUrl}
                alt={product.nombre || product.tipo}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-[#8A8880]">
                <span className="text-4xl mb-2">👗</span>
                <span className="text-xs uppercase tracking-wider font-light">
                  Sunday Clóset Curaduría
                </span>
              </div>
            )}

            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur-xs text-[#1F1F1F] shadow-xs">
                <Sparkles className="w-3 h-3 text-[#C2A78C]" />
                Pieza Única
              </span>
            </div>
          </div>

          {/* Title and Price */}
          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-widest text-[#C2A78C] uppercase">
              {product.marca}
            </span>
            <h2 className="font-display font-medium text-2xl text-[#1F1F1F] leading-snug">
              {product.nombre || product.tipo}
            </h2>
            <div className="pt-2 flex items-baseline gap-3">
              <span className="font-display font-bold text-2xl text-[#1F1F1F]">
                {formatPrice(product.precio)}
              </span>
              <span className="text-[11px] text-[#8A8880] uppercase tracking-wider">
                Segunda Selección
              </span>
            </div>
          </div>

          {/* Attributes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-white rounded-xl border border-[#E5E3DD]">
              <span className="block text-[10px] text-[#8A8880] uppercase tracking-wider">
                Talla
              </span>
              <span className="font-semibold text-sm text-[#1F1F1F]">
                {product.talla || "Única"}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#E5E3DD]">
              <span className="block text-[10px] text-[#8A8880] uppercase tracking-wider">
                Color
              </span>
              <span className="font-semibold text-sm text-[#1F1F1F]">
                {product.color || "Variado"}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#E5E3DD]">
              <span className="block text-[10px] text-[#8A8880] uppercase tracking-wider">
                Categoría
              </span>
              <span className="font-semibold text-sm text-[#1F1F1F] capitalize">
                {product.tipo}
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#E5E3DD]">
              <span className="block text-[10px] text-[#8A8880] uppercase tracking-wider">
                Estado
              </span>
              <span className="font-semibold text-sm text-[#2E7D32] capitalize">
                {product.estado}
              </span>
            </div>
          </div>

          {/* Description */}
          {product.descripcion && (
            <div className="p-4 bg-white rounded-2xl border border-[#E5E3DD] space-y-1">
              <h4 className="text-xs font-semibold text-[#1F1F1F] uppercase tracking-wider">
                Detalles de la Prenda
              </h4>
              <p className="text-xs text-[#5A5852] font-light leading-relaxed">
                {product.descripcion}
              </p>
            </div>
          )}

          {/* Sustainable Fashion Notice */}
          <div className="p-3.5 bg-[#EFEDE8] rounded-2xl border border-[#E5E3DD] flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#8C6D4F] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#5A5852] font-light leading-relaxed">
              Cada prenda de Sunday Clóset es única. Al confirmar tu compra o apartado, se retira de la circulación para garantizar tu exclusividad.
            </p>
          </div>
        </div>

        {/* Bottom Floating Actions */}
        <div className="p-4 bg-white border-t border-[#E5E3DD] safe-bottom space-y-2">
          {isAvailable ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleWhatsApp}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-[#25D366] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/20 active:scale-98 transition-transform"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Apartar por WhatsApp</span>
              </button>

              <button
                onClick={handleAddToCart}
                className={`py-3.5 px-5 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 ${
                  inCart
                    ? "bg-[#2E7D32] text-white"
                    : "bg-[#1F1F1F] text-white hover:bg-black"
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
          ) : (
            <div className="w-full py-3.5 text-center bg-neutral-200 text-neutral-500 rounded-2xl text-xs font-semibold">
              Esta prenda ya fue adquirida
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
