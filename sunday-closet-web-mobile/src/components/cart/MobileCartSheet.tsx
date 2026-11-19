// src/components/cart/MobileCartSheet.tsx
"use client";

import { X, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { formatPrice } from "@/lib/utils/format";
import { DriveImage } from "@/components/common/DriveImage";
import { ManualCheckoutButtons } from "@/components/cart/ManualCheckoutButtons";

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] bg-[#FFFFFF] border border-black/10 rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 text-[#000000] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/10 bg-[#FFFFFF]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.05em] text-[#000000]">
              Bolsa de Compras
            </span>
            {itemCount > 0 && (
              <span className="text-[11px] font-mono font-semibold text-white px-2 py-0.5 rounded-full bg-black">
                {itemCount}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar bolsa"
            className="p-1.5 rounded-full text-[#666666] hover:text-black hover:bg-[#F7F7F7] transition-colors"
          >
            <X className="w-5 h-5 stroke-[1.75]" />
          </button>
        </div>

        {/* Body Items */}
        <div className="flex-1 overflow-y-auto scrollbar-none p-4 sm:p-5 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#F7F7F7] border border-black/10 flex items-center justify-center text-[#666666]">
                <ShoppingBag className="w-7 h-7 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-[#000000]">
                  Tu bolsa está vacía
                </h4>
                <p className="text-xs text-[#666666] max-w-xs">
                  Agrega prendas exclusivas del catálogo antes de que otra clienta las aparte.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onExploreClick();
                }}
                className="px-5 py-2.5 bg-black hover:bg-black/85 text-white text-xs font-semibold rounded-full transition-colors active:scale-95"
              >
                Explorar Prendas
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs pb-1">
                <span className="font-medium text-[#111111]">
                  Prendas Seleccionadas
                </span>
                <button
                  onClick={clearCart}
                  className="text-xs text-[#666666] hover:text-black hover:underline font-medium"
                >
                  Vaciar bolsa
                </button>
              </div>

              {items.map(({ product }) => (
                <div
                  key={product.id}
                  className="p-3 rounded-xl bg-[#F7F7F7] flex gap-3.5 items-center"
                >
                  <div className="w-14 h-16 rounded-[4px] overflow-hidden bg-white shrink-0">
                    <DriveImage
                      src={product.imagenUrl}
                      alt={product.nombre || product.tipo}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-[#666666] font-medium">
                        {product.id}
                      </span>
                      <span className="font-mono text-sm font-semibold text-[#000000]">
                        {formatPrice(product.precio)}
                      </span>
                    </div>

                    <h4 className="text-xs font-medium text-[#111111] truncate lowercase">
                      {product.nombre || product.tipo}
                    </h4>

                    <div className="text-[11px] text-[#666666] flex items-center justify-between pt-0.5">
                      <span>
                        Talla: <span className="text-[#111111] font-medium">{product.talla}</span>
                        {product.color && <span> · {product.color}</span>}
                      </span>

                      <button
                        onClick={() => removeItem(product.id)}
                        className="text-[#666666] hover:text-black p-1 transition-colors"
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
          <div className="p-4 sm:p-5 border-t border-black/10 bg-[#FFFFFF] safe-bottom space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#666666]">
                Total Estimado
              </span>
              <span className="font-mono text-lg font-semibold text-[#000000]">
                {formatPrice(totalAmount)} <span className="text-xs text-[#666666] font-normal">MXN</span>
              </span>
            </div>

            <ManualCheckoutButtons
              items={items}
              totalAmount={totalAmount}
            />
          </div>
        )}
      </div>
    </div>
  );
};
