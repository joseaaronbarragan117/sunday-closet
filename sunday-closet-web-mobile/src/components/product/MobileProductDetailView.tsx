// src/components/product/MobileProductDetailView.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, MessageCircle, ShoppingBag, Check, ShieldCheck, Sparkles } from "lucide-react";
import { Product } from "@/lib/data/mockProducts";
import { formatPrice } from "@/lib/utils/format";
import { formatDriveImageUrl } from "@/lib/imageUrl";
import { useFavoritesStore } from "@/lib/store/favoritesStore";
import { useCartStore } from "@/lib/store/cartStore";
import { createProductWhatsAppUrl } from "@/lib/utils/whatsapp";

interface MobileProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
}

export const MobileProductDetailView: React.FC<MobileProductDetailViewProps> = ({
  product,
  relatedProducts,
}) => {
  const [imgError, setImgError] = useState(false);
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { addItem, isInCart } = useCartStore();

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
    <div className="min-h-screen bg-[#F7F6F2] text-[#1F1F1F] pb-32">
      {/* Sticky Mobile Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#F7F6F2]/90 backdrop-blur-md border-b border-[#E5E3DD] safe-top">
        <Link
          href="/"
          className="p-2 rounded-full bg-white border border-[#E5E3DD] text-[#1F1F1F] active:scale-95 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <span className="font-display font-medium text-lg text-[#1F1F1F]">
          Sunday Clóset
        </span>

        <button
          onClick={() => toggleFavorite(product)}
          className="p-2 rounded-full bg-white border border-[#E5E3DD] active:scale-95 shadow-xs"
        >
          <Heart
            className={`w-4 h-4 ${
              favorite ? "fill-rose-500 text-rose-500" : "text-[#5A5852]"
            }`}
          />
        </button>
      </div>

      <div className="p-4 space-y-5 max-w-md mx-auto">
        {/* Main Photo Card */}
        <div className="relative w-full aspect-3/4 rounded-3xl overflow-hidden bg-[#EFEDE8] border border-[#E5E3DD] shadow-xs">
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
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur-xs text-[#1F1F1F] shadow-xs">
              <Sparkles className="w-3 h-3 text-[#C2A78C]" />
              Pieza Única
            </span>
          </div>

          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1F1F1F]/80 backdrop-blur-xs text-white">
              Talla {product.talla}
            </span>
          </div>
        </div>

        {/* Title & Brand */}
        <div className="space-y-1">
          <span className="text-xs font-semibold tracking-widest text-[#C2A78C] uppercase">
            {product.marca}
          </span>
          <h1 className="font-display font-medium text-3xl text-[#1F1F1F] leading-snug">
            {product.nombre || product.tipo}
          </h1>
          <div className="pt-2 flex items-baseline gap-3">
            <span className="font-display font-bold text-3xl text-[#1F1F1F]">
              {formatPrice(product.precio)}
            </span>
            <span className="text-xs text-[#8A8880] uppercase tracking-wider">
              Segunda Selección
            </span>
          </div>
        </div>

        {/* Specs Pills */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3.5 bg-white rounded-2xl border border-[#E5E3DD]">
            <span className="block text-[10px] text-[#8A8880] uppercase tracking-wider">
              SKU
            </span>
            <span className="font-mono text-xs font-semibold text-[#1F1F1F]">
              {product.id}
            </span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-[#E5E3DD]">
            <span className="block text-[10px] text-[#8A8880] uppercase tracking-wider">
              Color
            </span>
            <span className="text-xs font-semibold text-[#1F1F1F]">
              {product.color || "Variado"}
            </span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-[#E5E3DD]">
            <span className="block text-[10px] text-[#8A8880] uppercase tracking-wider">
              Categoría
            </span>
            <span className="text-xs font-semibold text-[#1F1F1F] capitalize">
              {product.tipo}
            </span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-[#E5E3DD]">
            <span className="block text-[10px] text-[#8A8880] uppercase tracking-wider">
              Disponibilidad
            </span>
            <span className="text-xs font-semibold text-[#2E7D32] capitalize">
              {product.estado}
            </span>
          </div>
        </div>

        {/* Description */}
        {product.descripcion && (
          <div className="p-4 bg-white rounded-2xl border border-[#E5E3DD] space-y-1.5">
            <h3 className="text-xs font-semibold text-[#1F1F1F] uppercase tracking-wider">
              Curaduría & Detalles
            </h3>
            <p className="text-xs text-[#5A5852] font-light leading-relaxed">
              {product.descripcion}
            </p>
          </div>
        )}

        {/* Sustainable Fashion Callout */}
        <div className="p-4 bg-[#EFEDE8] rounded-2xl border border-[#E5E3DD] flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#8C6D4F] shrink-0 mt-0.5" />
          <p className="text-xs text-[#5A5852] font-light leading-relaxed">
            Pieza única seleccionada minuciosamente. Cuando una prenda encuentra a su nuevo dueño, no vuelve a existir en catálogo.
          </p>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="pt-4 space-y-3">
            <h3 className="font-display font-medium text-lg text-[#1F1F1F]">
              Podría Gustarte También
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {relatedProducts.slice(0, 2).map((rel) => (
                <Link
                  key={rel.id}
                  href={`/producto/${rel.slug}`}
                  className="bg-white rounded-2xl p-2.5 border border-[#E5E3DD] space-y-2 block"
                >
                  <div className="w-full aspect-3/4 rounded-xl overflow-hidden bg-[#EFEDE8]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formatDriveImageUrl(rel.imagenUrl)}
                      alt={rel.nombre}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-display font-medium text-xs text-[#1F1F1F] truncate">
                      {rel.nombre || rel.tipo}
                    </h4>
                    <span className="font-display font-bold text-xs text-[#1F1F1F]">
                      {formatPrice(rel.precio)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E3DD] p-4 safe-bottom">
        <div className="max-w-md mx-auto flex items-center gap-2">
          {isAvailable ? (
            <>
              <button
                onClick={handleWhatsApp}
                className="flex-1 py-4 px-4 rounded-2xl bg-[#25D366] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/25 active:scale-98 transition-transform"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Apartar por WhatsApp</span>
              </button>

              <button
                onClick={handleAddToCart}
                className={`py-4 px-5 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 ${
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
            </>
          ) : (
            <div className="w-full py-4 text-center bg-neutral-200 text-neutral-500 rounded-2xl text-xs font-semibold">
              Esta prenda ya fue adquirida
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
