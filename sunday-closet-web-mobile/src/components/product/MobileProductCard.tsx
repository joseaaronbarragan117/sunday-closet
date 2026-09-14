// src/components/product/MobileProductCard.tsx
"use client";

import React, { useState } from "react";
import { Heart, MessageCircle, ShoppingBag, Check } from "lucide-react";
import { Product } from "@/lib/data/mockProducts";
import { formatPrice } from "@/lib/utils/format";
import { formatDriveImageUrl } from "@/lib/imageUrl";
import { useFavoritesStore } from "@/lib/store/favoritesStore";
import { useCartStore } from "@/lib/store/cartStore";
import { createProductWhatsAppUrl } from "@/lib/utils/whatsapp";

interface MobileProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
}

export const MobileProductCard: React.FC<MobileProductCardProps> = ({
  product,
  onOpenDetail,
}) => {
  const [imgError, setImgError] = useState(false);
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { addItem, isInCart } = useCartStore();

  const favorite = isFavorite(product.id);
  const inCart = isInCart(product.id);
  const isAvailable = product.estado === "disponible";

  const photoUrl = formatDriveImageUrl(product.imagenUrl);

  const handleWhatsAppReserve = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(createProductWhatsAppUrl(product), "_blank");
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAvailable && !inCart) {
      addItem(product);
    }
  };

  return (
    <div
      onClick={() => onOpenDetail(product)}
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-[#E5E3DD] shadow-xs cursor-pointer pressable"
    >
      {/* Product Image Media Container */}
      <div className="relative w-full aspect-3/4 bg-[#EFEDE8] overflow-hidden">
        {!imgError && photoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={photoUrl}
            alt={product.nombre || product.tipo}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 ${
              !isAvailable ? "grayscale contrast-125 opacity-70" : ""
            }`}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-[#8A8880] bg-[#EAE7E1]">
            <span className="text-3xl mb-1">👗</span>
            <span className="text-[11px] uppercase tracking-wider font-light">
              Sunday Clóset
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
          {isAvailable ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-xs text-[#1F1F1F] shadow-xs">
              Única pieza
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-black/85 text-white">
              Agotada
            </span>
          )}
        </div>

        {/* Top Right Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product);
          }}
          aria-label={favorite ? "Quitar de favoritos" : "Guardar en favoritos"}
          className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/90 backdrop-blur-xs border border-white/40 shadow-xs active:scale-90 transition-transform"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              favorite ? "fill-rose-500 text-rose-500" : "text-[#5A5852]"
            }`}
          />
        </button>

        {/* Size Badge Bottom Overlay */}
        <div className="absolute bottom-2 left-2 z-10">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#1F1F1F]/80 backdrop-blur-xs text-white">
            Talla {product.talla}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3 flex flex-col justify-between flex-1 space-y-2">
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#8A8880] uppercase tracking-wider font-light">
            <span className="truncate max-w-[110px]">{product.marca}</span>
            {product.color && <span className="truncate">{product.color}</span>}
          </div>

          <h3 className="font-display font-medium text-base text-[#1F1F1F] line-clamp-1 mt-0.5">
            {product.nombre || product.tipo}
          </h3>
        </div>

        {/* Price & Quick Actions */}
        <div className="pt-1 border-t border-[#F5F4F0] flex items-center justify-between">
          <div>
            <span className="font-display font-bold text-base text-[#1F1F1F]">
              {formatPrice(product.precio)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isAvailable && (
              <>
                <button
                  onClick={handleAddToCart}
                  title="Añadir a la bolsa"
                  className={`p-2 rounded-xl transition-all ${
                    inCart
                      ? "bg-[#2E7D32] text-white"
                      : "bg-[#EFEDE8] text-[#1F1F1F] hover:bg-[#E5E3DD] active:scale-95"
                  }`}
                >
                  {inCart ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <ShoppingBag className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  onClick={handleWhatsAppReserve}
                  title="Apartar por WhatsApp"
                  className="p-2 rounded-xl bg-[#25D366]/15 text-[#128C7E] hover:bg-[#25D366]/25 active:scale-95 transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-[#25D366]" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
