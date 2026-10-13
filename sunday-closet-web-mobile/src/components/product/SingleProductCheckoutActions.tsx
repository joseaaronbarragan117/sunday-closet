// src/components/product/SingleProductCheckoutActions.tsx
"use client";

import React, { useState } from "react";
import { MessageCircle, Check, ArrowRight, ShoppingBag } from "lucide-react";
import { InstagramIcon } from "@/components/common/InstagramIcon";
import { Product } from "@/lib/data/mockProducts";
import { useCartStore } from "@/lib/store/cartStore";

export const DEFAULT_INSTAGRAM_USERNAME = "sunday.closet1";
export const DEFAULT_WHATSAPP_PHONE = "523411622960";

export interface SingleProductCheckoutActionsProps {
  product: Product;
  instagramUsername?: string;
  whatsappPhone?: string;
  onSuccess?: () => void;
  className?: string;
}

/**
 * Formats a single product order inquiry for Instagram & WhatsApp
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
  instagramUsername = DEFAULT_INSTAGRAM_USERNAME,
  whatsappPhone = DEFAULT_WHATSAPP_PHONE,
  onSuccess,
  className = "",
}) => {
  const [isCopiedState, setIsCopiedState] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const { addItem, isInCart, openCart } = useCartStore();
  const inCart = isInCart(product.id);
  const isAvailable = product.estado === "disponible";

  const cleanUsername = instagramUsername.replace(/^@/, "").trim();
  const cleanPhone = whatsappPhone.replace(/\D/g, "").trim();

  // 1. Pedir por Instagram (Copy order format + delay 1s + open ig.me/m/sunday.closet1)
  const handleInstagramCheckout = async () => {
    if (!isAvailable) return;

    setErrorNotice(null);
    const orderText = formatSingleProductOrder(product);

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(orderText);
      } else {
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
      console.warn("No se pudo copiar automáticamente al portapapeles:", err);
      setErrorNotice("Copia tu pedido antes de enviar.");
      setIsCopiedState(true);
    }

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

  // 2. Pedir por WhatsApp (Direct link with pre-filled message)
  const handleWhatsAppCheckout = () => {
    if (!isAvailable) return;

    const orderText = formatSingleProductOrder(product);
    const encodedText = encodeURIComponent(orderText);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

    window.open(whatsappUrl, "_blank");
    if (onSuccess) onSuccess();
  };

  // 3. Agregar a la Bolsa / Ver Bolsa
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
      {/* 1. Botón Principal: "Pedir por Instagram" */}
      <button
        type="button"
        disabled={!isAvailable || isCopiedState}
        onClick={handleInstagramCheckout}
        className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg active:scale-98 transition-all border ${
          isCopiedState
            ? "bg-emerald-600/90 text-white border-emerald-500 shadow-emerald-500/20"
            : "bg-slate-900 hover:bg-slate-800 text-white border-slate-700 hover:border-pink-500/50 shadow-slate-950/60"
        } ${!isAvailable ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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
            <div className="p-1 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-500 text-white shrink-0">
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
        disabled={!isAvailable}
        onClick={handleWhatsAppCheckout}
        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-98 border ${
          !isAvailable
            ? "opacity-50 cursor-not-allowed border-slate-800 bg-slate-950/40 text-slate-500"
            : "border-emerald-500/35 hover:border-emerald-500/60 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300"
        }`}
      >
        <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
        <span>Pedir por WhatsApp</span>
      </button>

      {/* 3. Tercera Opción: "Agregar a la Bolsa / En Bolsa" */}
      <button
        type="button"
        disabled={!isAvailable}
        onClick={handleCartAction}
        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-98 border ${
          inCart
            ? "bg-slate-800/90 border-slate-700 text-emerald-300 hover:bg-slate-800"
            : "bg-slate-800/40 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:text-white"
        } ${!isAvailable ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {inCart ? (
          <>
            <Check className="w-4 h-4 text-emerald-400" />
            <span>En la Bolsa de Compras</span>
          </>
        ) : (
          <>
            <ShoppingBag className="w-4 h-4 text-slate-400" />
            <span>Agregar a la Bolsa</span>
          </>
        )}
      </button>

      {/* Microcopy informativo */}
      <p className="text-[11px] text-slate-400 text-center leading-snug px-1 pt-0.5">
        📋 Tu pedido se copiará automáticamente al portapapeles para que solo lo pegues en el chat de Instagram.
      </p>
    </div>
  );
};
