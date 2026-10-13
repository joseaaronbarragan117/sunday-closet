// src/components/cart/ManualCheckoutButtons.tsx
"use client";

import React, { useState } from "react";
import { MessageCircle, Check, ArrowRight, Copy } from "lucide-react";
import { InstagramIcon } from "@/components/common/InstagramIcon";
import { CartItem } from "@/lib/store/cartStore";

// Default Configuration Variables
export const DEFAULT_INSTAGRAM_USERNAME = "sunday.closet1";
export const DEFAULT_WHATSAPP_PHONE = "523411622960";

export interface ManualCheckoutButtonsProps {
  items: CartItem[];
  totalAmount: number;
  instagramUsername?: string;
  whatsappPhone?: string;
  onSuccess?: () => void;
}

/**
 * Formats the order summary string required for Instagram & WhatsApp manual checkout
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
  instagramUsername = DEFAULT_INSTAGRAM_USERNAME,
  whatsappPhone = DEFAULT_WHATSAPP_PHONE,
  onSuccess,
}) => {
  const [isCopiedState, setIsCopiedState] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Clean username (remove any '@' or leading slashes)
  const cleanUsername = instagramUsername.replace(/^@/, "").trim();
  // Clean phone (digits only)
  const cleanPhone = whatsappPhone.replace(/\D/g, "").trim();

  // 1. Primary Action: Pedir por Instagram (Copy text + delay + open ig.me/m/<user>)
  const handleInstagramCheckout = async () => {
    if (items.length === 0) return;

    setErrorNotice(null);
    const orderText = formatOrderSummary(items, totalAmount);

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(orderText);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = orderText;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setIsCopiedState(true);
    } catch (err) {
      console.warn("No se pudo acceder automáticamente al portapapeles:", err);
      setErrorNotice("Copia tu pedido antes de enviar.");
      setIsCopiedState(true);
    }

    // 1-second delay so user reads confirmation feedback before opening Instagram chat
    setTimeout(() => {
      const instagramUrl = `https://ig.me/m/${cleanUsername}`;
      window.open(instagramUrl, "_blank");

      setTimeout(() => {
        setIsCopiedState(false);
        setErrorNotice(null);
        if (onSuccess) onSuccess();
      }, 2500);
    }, 1000);
  };

  // 2. Secondary Action: Pedir por WhatsApp (Direct link with pre-filled encoded text)
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
    <div className="w-full space-y-2.5">
      {/* 1. Botón Principal: "Pedir por Instagram" */}
      <button
        type="button"
        disabled={isDisabled || isCopiedState}
        onClick={handleInstagramCheckout}
        className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg active:scale-98 transition-all relative overflow-hidden select-none border ${
          isCopiedState
            ? "bg-emerald-600/90 text-white border-emerald-500 shadow-emerald-500/20"
            : "bg-slate-900 hover:bg-slate-800 text-white border-slate-700 hover:border-pink-500/50 shadow-slate-950/60"
        } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {isCopiedState ? (
          <>
            <Check className="w-4 h-4 stroke-[3] text-emerald-200 animate-in zoom-in-50 duration-200" />
            <span className="font-semibold text-white tracking-normal text-xs normal-case">
              {errorNotice || "¡Pedido copiado! Abriendo chat..."}
            </span>
          </>
        ) : (
          <>
            <div className="p-1 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-500 text-white">
              <InstagramIcon className="w-3.5 h-3.5" />
            </div>
            <span>Pedir por Instagram DM</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 ml-auto" />
          </>
        )}
      </button>

      {/* 2. Botón Secundario: "Pedir por WhatsApp" */}
      <button
        type="button"
        disabled={isDisabled}
        onClick={handleWhatsAppCheckout}
        className={`w-full py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all active:scale-98 border select-none ${
          isDisabled
            ? "opacity-50 cursor-not-allowed border-slate-800 bg-slate-950/40 text-slate-500"
            : "border-emerald-500/35 hover:border-emerald-500/60 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300"
        }`}
      >
        <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
        <span>Pedir por WhatsApp</span>
      </button>

      {/* 3. Microcopy Informativo */}
      <p className="text-[11px] text-slate-400 text-center leading-snug px-2 pt-0.5">
        📋 Tu pedido se copiará automáticamente al portapapeles para que solo lo pegues en el chat de Instagram.
      </p>
    </div>
  );
};
