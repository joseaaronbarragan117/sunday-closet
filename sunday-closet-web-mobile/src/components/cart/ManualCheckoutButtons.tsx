// src/components/cart/ManualCheckoutButtons.tsx
"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { CartItem } from "@/lib/store/cartStore";

export const DEFAULT_WHATSAPP_PHONE = "523411622960";

export interface ManualCheckoutButtonsProps {
  items: CartItem[];
  totalAmount: number;
  whatsappPhone?: string;
  onSuccess?: () => void;
}

/**
 * Formats the order summary string required for WhatsApp checkout
 */
export function formatOrderSummary(items: CartItem[], total: number): string {
  const lines = items.map(({ product }) => {
    const name = product.nombre || product.tipo || "Prenda Sunday";
    const size = product.talla || "M";
    const ref = product.id;
    const price = product.precio;
    return `• ${name} | Talla: ${size} | Ref: #${ref} - $${price}`;
  });

  return [
    "¡Hola! Me interesa apartar estas prendas de la tienda:",
    "",
    ...lines,
    "",
    `Total estimado: $${total}`,
    "",
    "¿Siguen disponibles?",
  ].join("\n");
}

export const ManualCheckoutButtons: React.FC<ManualCheckoutButtonsProps> = ({
  items,
  totalAmount,
  whatsappPhone = DEFAULT_WHATSAPP_PHONE,
  onSuccess,
}) => {
  const cleanPhone = whatsappPhone.replace(/\D/g, "").trim();

  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;

    const orderText = formatOrderSummary(items, totalAmount);
    const encodedText = encodeURIComponent(orderText);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

    window.open(whatsappUrl, "_blank");
    if (onSuccess) onSuccess();
  };

  const isDisabled = items.length === 0;

  return (
    <div className="w-full">
      <button
        type="button"
        disabled={isDisabled}
        onClick={handleWhatsAppCheckout}
        className={`w-full py-3.5 px-4 rounded-xl font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] border select-none ${
          isDisabled
            ? "opacity-50 cursor-not-allowed border-black/10 bg-[#F7F7F7] text-[#888888]"
            : "border-emerald-500/40 hover:border-emerald-500/70 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 cursor-pointer"
        }`}
      >
        <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-500/15" />
        <span>CONFIRMAR PEDIDO POR WHATSAPP</span>
      </button>
    </div>
  );
};
