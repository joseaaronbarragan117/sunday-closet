// src/components/product/SingleProductCheckoutActions.tsx
"use client";

import React from "react";
import { MessageCircle, Check, ShoppingBag } from "lucide-react";
import { Product } from "@/lib/data/mockProducts";
import { useCartStore } from "@/lib/store/cartStore";

export const DEFAULT_WHATSAPP_PHONE = "523411622960";

export interface SingleProductCheckoutActionsProps {
  product: Product;
  whatsappPhone?: string;
  onSuccess?: () => void;
  className?: string;
}

/**
 * Formats a single product order inquiry for WhatsApp
 */
export function formatSingleProductOrder(product: Product): string {
  const name = product.nombre || product.tipo || "Prenda Sunday";
  const size = product.talla || "M";
  const ref = product.id;
  const price = product.precio;

  return [
    "¡Hola! Me interesa apartar esta prenda de la tienda:",
    "",
    `• ${name} | Talla: ${size} | Ref: #${ref} - $${price}`,
    "",
    "¿Sigue disponible?",
  ].join("\n");
}

export const SingleProductCheckoutActions: React.FC<SingleProductCheckoutActionsProps> = ({
  product,
  whatsappPhone = DEFAULT_WHATSAPP_PHONE,
  onSuccess,
  className = "",
}) => {
  const { addItem, isInCart, openCart } = useCartStore();
  const inCart = isInCart(product.id);
  const isAvailable = product.estado === "disponible";

  const cleanPhone = whatsappPhone.replace(/\D/g, "").trim();

  // Pedir por WhatsApp (Direct link with pre-filled message)
  const handleWhatsAppCheckout = () => {
    if (!isAvailable) return;

    const orderText = formatSingleProductOrder(product);
    const encodedText = encodeURIComponent(orderText);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

    window.open(whatsappUrl, "_blank");
    if (onSuccess) onSuccess();
  };

  // Agregar a la Bolsa / Ver Bolsa
  const handleCartAction = () => {
    if (!isAvailable) return;

    if (inCart) {
      openCart();
    } else {
      addItem(product);
    }
  };

  return (
    <div className={`w-full space-y-2 select-none ${className}`}>
      {/* 1. Botón Primario: "AGREGAR A LA BOLSA" en Azul Marino Profundo */}
      <button
        type="button"
        disabled={!isAvailable}
        onClick={handleCartAction}
        className={`w-full py-3 px-4 rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] bg-[#0B1528] hover:bg-[#0B1528]/90 text-white ${
          !isAvailable ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        {inCart ? (
          <>
            <Check className="w-4 h-4 text-white stroke-[2.5]" />
            <span>EN LA BOLSA DE COMPRAS</span>
          </>
        ) : (
          <>
            <ShoppingBag className="w-4 h-4 text-white" />
            <span>AGREGAR A LA BOLSA</span>
          </>
        )}
      </button>

      {/* 2. Botón Secundario: "PEDIR POR WHATSAPP" */}
      <button
        type="button"
        disabled={!isAvailable}
        onClick={handleWhatsAppCheckout}
        className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] border ${
          !isAvailable
            ? "opacity-50 cursor-not-allowed border-black/10 bg-[#F7F7F7] text-[#888888]"
            : "border-emerald-500/40 hover:border-emerald-500/70 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 cursor-pointer"
        }`}
      >
        <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-500/15" />
        <span>PEDIR POR WHATSAPP</span>
      </button>
    </div>
  );
};
