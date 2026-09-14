// src/components/cart/MobileCartSheet.tsx
"use client";

import React from "react";
import { X, Trash2, ShoppingBag, MessageCircle, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { formatPrice } from "@/lib/utils/format";
import { formatDriveImageUrl } from "@/lib/imageUrl";
import { createCartWhatsAppUrl } from "@/lib/utils/whatsapp";

interface MobileCartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreClick: () => void;
}

export const MobileCartSheet: React.FC<MobileCartSheetProps> = ({
  isOpen,
  onClose,
  onExploreClick,
}) => {
  const { items, removeItem, clearCart, total, count } = useCartStore();

  if (!isOpen) return null;

  const totalAmount = total();
  const itemCount = count();

  const handleCheckoutWhatsApp = () => {
    if (items.length === 0) return;
    window.open(createCartWhatsAppUrl(items, totalAmount), "_blank");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] bg-white flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAEAEA]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-black font-sans">
              BOLSA DE COMPRAS
            </span>
            {itemCount > 0 && (
              <span className="text-xs text-[#767676]">
                ({itemCount})
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar bolsa"
            className="p-1 text-black hover:opacity-70"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Body Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <ShoppingBag className="w-12 h-12 text-[#EAEAEA] stroke-[1]" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold uppercase tracking-wider text-black">
                  Tu bolsa está vacía
                </h4>
                <p className="text-xs text-[#767676] max-w-xs">
                  Agrega prendas exclusivas del drop antes de que alguien más las aparte.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onExploreClick();
                }}
                className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-800"
              >
                VER PRODUCTOS
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#767676] pb-2 border-b border-[#EAEAEA]">
                <span className="font-bold uppercase tracking-wider text-black">
                  Prendas Seleccionadas
                </span>
                <button
                  onClick={clearCart}
                  className="text-xs text-[#E50010] hover:underline font-medium"
                >
                  Vaciar bolsa
                </button>
              </div>

              {items.map(({ product }) => {
                const photoUrl = formatDriveImageUrl(product.imagenUrl);
                const originalPrice = Math.round(product.precio * 1.18);

                return (
                  <div
                    key={product.id}
                    className="flex gap-4 pb-4 border-b border-[#EAEAEA]"
                  >
                    <div className="w-20 h-28 bg-[#F4F4F4] overflow-hidden shrink-0">
                      {photoUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={photoUrl}
                          alt={product.nombre || product.tipo}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">
                          👗
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <span className="block text-[10px] text-[#767676] uppercase font-bold tracking-wider">
                          {product.marca || "SUNDAY CURATED"}
                        </span>
                        <h4 className="text-xs font-bold text-black uppercase tracking-tight truncate">
                          {product.nombre || product.tipo}
                        </h4>
                        <div className="text-xs text-[#767676] pt-1">
                          Talla: <span className="text-black font-semibold">{product.talla}</span>
                          {product.color && <span> | {product.color}</span>}
                        </div>
                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="text-xs font-bold text-[#E50010]">
                            {formatPrice(product.precio)}
                          </span>
                          <span className="text-[11px] text-[#767676] line-through font-normal">
                            {formatPrice(originalPrice)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(product.id)}
                        className="text-xs text-[#767676] hover:text-[#E50010] flex items-center gap-1 self-start pt-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[#EAEAEA] safe-bottom bg-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-black">
                TOTAL ESTIMADO
              </span>
              <span className="text-lg font-bold text-black">
                {formatPrice(totalAmount)}
              </span>
            </div>

            <p className="text-[11px] text-[#767676] leading-tight">
              * Precios incluyen impuestos. Al apartar por WhatsApp, garantizas tu prenda única.
            </p>

            <button
              onClick={handleCheckoutWhatsApp}
              className="w-full py-4 text-center text-xs font-bold uppercase tracking-widest text-white bg-black hover:bg-neutral-900 active:opacity-90 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>APARTAR BOLSA POR WHATSAPP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
