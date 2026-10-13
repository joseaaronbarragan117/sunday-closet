// src/components/cart/MobileCartSheet.tsx
"use client";

import React from "react";
import { X, Trash2, ShoppingBag, MessageCircle, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { formatPrice } from "@/lib/utils/format";
import { DriveImage } from "@/components/common/DriveImage";
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Bolsa de Compras
            </span>
            {itemCount > 0 && (
              <span className="text-xs font-mono font-bold text-rose-400 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                {itemCount}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar bolsa"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Body Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500">
                <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">
                  Tu bolsa está vacía
                </h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  Agrega prendas exclusivas del catálogo antes de que otra clienta las aparte.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onExploreClick();
                }}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                Explorar Prendas
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs pb-1">
                <span className="font-semibold text-slate-300">
                  Prendas Seleccionadas
                </span>
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-400 hover:text-rose-300 hover:underline font-medium"
                >
                  Vaciar bolsa
                </button>
              </div>

              {items.map(({ product }) => (
                <div
                  key={product.id}
                  className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex gap-3.5 items-center"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                    <DriveImage
                      src={product.imagenUrl}
                      alt={product.nombre || product.tipo}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-rose-400 font-bold">
                        {product.id}
                      </span>
                      <span className="font-mono text-sm font-bold text-white">
                        {formatPrice(product.precio)}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white truncate capitalize">
                      {product.nombre || product.tipo}
                    </h4>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-0.5">
                      <span>
                        Talla: <span className="text-slate-200 font-semibold">{product.talla}</span>
                        {product.color && <span> • {product.color}</span>}
                      </span>

                      <button
                        onClick={() => removeItem(product.id)}
                        className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                        title="Eliminar de la bolsa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/70 safe-bottom space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Total Estimado
              </span>
              <span className="font-mono text-xl font-bold text-rose-400">
                {formatPrice(totalAmount)} <span className="text-xs text-slate-400 font-normal">MXN</span>
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-tight">
              * Cada pieza es 1 de 1. Al enviar tu pedido por WhatsApp, garantizas tu apartado inmediato.
            </p>

            <button
              onClick={handleCheckoutWhatsApp}
              className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 active:scale-98 transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Apartar Bolsa por WhatsApp</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
