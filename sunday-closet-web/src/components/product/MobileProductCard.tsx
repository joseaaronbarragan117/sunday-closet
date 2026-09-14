// src/components/product/MobileProductCard.tsx
"use client";

import React, { useState } from "react";
import { Heart } from "lucide-react";
import { Product } from "@/lib/data/mockProducts";
import { formatPrice } from "@/lib/utils/format";
import { formatDriveImageUrl } from "@/lib/imageUrl";
import { useFavoritesStore } from "@/lib/store/favoritesStore";

interface MobileProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
  isSingleColumn?: boolean;
}

export const MobileProductCard: React.FC<MobileProductCardProps> = ({
  product,
  onOpenDetail,
  isSingleColumn = false,
}) => {
  const [imgError, setImgError] = useState(false);
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  const favorite = isFavorite(product.id);
  const isAvailable = product.estado === "disponible";
  const photoUrl = formatDriveImageUrl(product.imagenUrl);

  // Calculate reference original price (~18% higher for the -15% discount badge style of H&M)
  const originalPrice = Math.round(product.precio * 1.18);

  return (
    <div
      onClick={() => onOpenDetail(product)}
      className="group flex flex-col bg-white cursor-pointer select-none pb-4"
    >
      {/* Product Image Media Container (exact as Screenshot 3 & 4) */}
      <div className={`relative w-full ${isSingleColumn ? "aspect-3/4 max-h-[500px]" : "aspect-3/4"} bg-[#F4F4F4] overflow-hidden`}>
        {!imgError && photoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={photoUrl}
            alt={product.nombre || product.tipo}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02] ${
              !isAvailable ? "grayscale contrast-125 opacity-70" : ""
            }`}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-[#767676] bg-[#F4F4F4]">
            <span className="text-3xl mb-1">👗</span>
            <span className="text-[10px] uppercase tracking-wider font-bold">
              Sunday Clóset
            </span>
          </div>
        )}

        {/* Bottom-left Black Tag Pill (exact as Screenshots 3 & 4: "-15%") */}
        <div className="absolute bottom-0 left-0 z-10">
          <span className="bg-black text-white text-[10px] sm:text-[11px] font-bold px-2 py-1 inline-block uppercase tracking-wider">
            {isAvailable ? "-15%" : "AGOTADO"}
          </span>
        </div>

        {/* Bottom-right Floating Heart Outline (exact as Screenshots 3 & 4) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product);
          }}
          aria-label={favorite ? "Quitar de favoritos" : "Guardar en favoritos"}
          className="absolute bottom-1 right-1 z-10 p-2 text-black hover:opacity-80 active:scale-90 transition-all"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              favorite
                ? "fill-[#E50010] text-[#E50010]"
                : "text-black fill-none stroke-[1.7]"
            }`}
          />
        </button>
      </div>

      {/* Card Info Below Image (exact typography & spacing as Screenshots 3 & 4) */}
      <div className="pt-2 space-y-0.5">
        {/* Sub-brand / Line */}
        <span className="block text-[10px] text-[#767676] uppercase tracking-wider font-semibold">
          {product.marca || "SUNDAY CURATED"}
        </span>

        {/* Product Title in Uppercase Bold */}
        <h3 className="text-xs font-bold text-black uppercase tracking-tight line-clamp-1">
          {product.nombre || product.tipo}
        </h3>

        {/* Price Row: Red Offer Price + Grey Original Crossed-Out Price */}
        <div className="flex items-baseline gap-1.5 pt-0.5">
          <span className="text-xs sm:text-sm font-bold text-[#E50010]">
            {formatPrice(product.precio)}
          </span>
          <span className="text-[11px] text-[#767676] line-through font-normal">
            {formatPrice(originalPrice)}
          </span>
        </div>

        {/* Color / Variant Swatches (exact as Screenshot 4: ■ ■ ■ +2) */}
        <div className="flex items-center gap-1 pt-1">
          <span className="w-2.5 h-2.5 bg-black inline-block border border-neutral-300" />
          <span className="w-2.5 h-2.5 bg-[#8B7355] inline-block border border-neutral-300" />
          <span className="w-2.5 h-2.5 bg-[#EAEAEA] inline-block border border-neutral-300" />
          <span className="text-[10px] text-[#767676] font-medium ml-0.5">
            +Talla {product.talla || "U"}
          </span>
        </div>
      </div>
    </div>
  );
};
