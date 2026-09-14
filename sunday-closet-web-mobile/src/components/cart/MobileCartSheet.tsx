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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] bg-[#F7F6F2] rounded-t-3xl overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E3DD] bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#1F1F1F]" />
            <h3 className="font-display font-medium text-lg text-[#1F1F1F]">
              Bolsa de Compras
            </h3>
            {itemCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C2A78C] text-[#1F1F1F]">
                {itemCount} {itemCount === 1 ? "pieza" : "piezas"}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#EFEDE8] text-[#1F1F1F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white border border-[#E5E3DD] flex items-center justify-center text-2xl shadow-xs">
                🛍️
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-medium text-lg text-[#1F1F1F]">
                  Tu bolsa está vacía
                </h4>
                <p className="text-xs text-[#8A8880] max-w-xs font-light">
                  Agrega prendas exclusivas de nuestro drop antes de que alguien más las aparte.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onExploreClick();
                }}
                className="px-5 py-2.5 rounded-full bg-[#1F1F1F] text-white text-xs font-semibold pressable"
              >
                Explorar Catálogo →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#8A8880] pb-1 border-b border-[#E5E3DD]">
                <span>Prendas seleccionadas</span>
                <button
                  onClick={clearCart}
                  className="text-rose-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Vaciar</span>
                </button>
              </div>

              {items.map(({ product }) => {
                const photoUrl = formatDriveImageUrl(product.imagenUrl);

                return (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-[#E5E3DD] shadow-xs"
                  >
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-[#EFEDE8] shrink-0 border border-[#E5E3DD]">
                      {photoUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={photoUrl}
                          alt={product.nombre || product.tipo}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">
                          👗
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#C2A78C]">
                        {product.marca}
                      </span>
                      <h4 className="font-display font-medium text-sm text-[#1F1F1F] truncate">
                        {product.nombre || product.tipo}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-[#8A8880]">
                        <span>Talla: {product.talla}</span>
                        {product.color && <span>• {product.color}</span>}
                      </div>
                      <div className="pt-1">
                        <span className="font-display font-bold text-sm text-[#1F1F1F]">
                          {formatPrice(product.precio)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(product.id)}
                      className="p-2 text-[#8A8880] hover:text-rose-500 transition-colors"
                      title="Eliminar de la bolsa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 bg-white border-t border-[#E5E3DD] safe-bottom space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-[#8A8880]">
                Total ({itemCount} piezas)
              </span>
              <span className="font-display font-bold text-2xl text-[#1F1F1F]">
                {formatPrice(totalAmount)}
              </span>
            </div>

            <p className="text-[11px] text-[#8A8880] leading-tight">
              * Prendas únicas. Al enviar el mensaje por WhatsApp se apartan temporalmente a tu nombre.
            </p>

            <button
              onClick={handleCheckoutWhatsApp}
              className="w-full py-4 px-5 rounded-2xl bg-[#25D366] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/25 pressable"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>Apartar Bolsa por WhatsApp</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
