// src/components/cart/CartSlideOver.tsx
"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import CartItem from "@/components/cart/CartItem";
import { formatPrice } from "@/lib/utils/format";

export default function CartSlideOver() {
  const { isOpen, closeCart, items, total, count } = useCartStore();

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="cart-backdrop"
            onClick={closeCart}
          />

          {/* Panel */}
          <motion.aside
            key="cart-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
            aria-label="Carrito de compras"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#D8D6D2]">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-[#0A0A0A]" />
                <span className="font-display font-semibold text-lg text-[#0A0A0A]">
                  Carrito
                </span>
                {count() > 0 && (
                  <span className="bg-[#C8A882] text-[#0A0A0A] text-xs font-bold px-2 py-0.5 rounded-full font-display">
                    {count()}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                aria-label="Cerrar carrito"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F4F0] transition-colors"
              >
                <X size={18} className="text-[#0A0A0A]" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <ShoppingBag size={48} className="text-[#D8D6D2]" />
                  <div>
                    <p className="font-display font-semibold text-[#0A0A0A]">
                      Tu carrito está vacío
                    </p>
                    <p className="text-sm text-[#8A8880] mt-1">
                      Agregá prendas para armar tu look
                    </p>
                  </div>
                  <button
                    onClick={closeCart}
                    className="mt-2 text-sm font-medium text-[#C8A882] hover:text-[#A8845E] transition-colors underline underline-offset-2"
                  >
                    Explorar productos →
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#F5F4F0]">
                  {items.map((item) => (
                    <CartItem key={item.product.id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-[#D8D6D2] px-6 py-5 space-y-4 bg-[#F5F4F0]">
                <div className="flex items-center justify-between">
                  <span className="font-display font-semibold text-[#0A0A0A]">Total</span>
                  <span className="font-display font-bold text-xl text-[#0A0A0A]">
                    {formatPrice(total())}
                  </span>
                </div>
                <p className="text-xs text-[#8A8880]">
                  * Los precios no incluyen envío. Se calcula en el checkout.
                </p>
                <button
                  id="btn-checkout"
                  className="w-full flex items-center justify-center gap-2 bg-[#0A0A0A] text-white font-display font-semibold py-4 px-6 rounded-sm hover:bg-[#C8A882] hover:text-[#0A0A0A] transition-all duration-300 group"
                  onClick={() => {
                    // TODO (Phase 2): redirect to Mercado Pago Checkout Pro
                    alert("Checkout con Mercado Pago — Próximamente en Fase 2");
                  }}
                >
                  Ir al Checkout
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform duration-200"
                  />
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
