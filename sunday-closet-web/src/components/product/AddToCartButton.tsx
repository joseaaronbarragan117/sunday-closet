// src/components/product/AddToCartButton.tsx
"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/lib/store/cartStore";
import { Product } from "@/lib/data/mockProducts";

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem, items } = useCartStore();
  const [justAdded, setJustAdded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const alreadyInCart = mounted && items.some((i) => i.product.id === product.id);
  const unavailable   = product.estado === "vendido" || product.estado === "en_carrito";

  const handleAdd = () => {
    if (unavailable || alreadyInCart) return;
    addItem(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  if (unavailable) {
    const label = product.estado === "vendido" ? "Vendida" : "Reservada";
    return (
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 bg-[#EEECEA] text-[#8A8880] font-display font-semibold py-4 px-6 rounded-sm cursor-not-allowed text-sm tracking-wide"
      >
        {label} — no disponible
      </button>
    );
  }

  return (
    <motion.button
      id="btn-add-to-cart"
      onClick={handleAdd}
      whileTap={{ scale: 0.98 }}
      disabled={alreadyInCart}
      className={`w-full flex items-center justify-center gap-3 font-display font-bold py-4 px-6 rounded-sm transition-all duration-300 text-sm tracking-wide ${
        alreadyInCart
          ? "bg-[#4B8C5A] text-white cursor-default"
          : "bg-[#0A0A0A] text-white hover:bg-[#C8A882] hover:text-[#0A0A0A]"
      }`}
    >
      <AnimatePresence mode="wait">
        {alreadyInCart || justAdded ? (
          <motion.span
            key="added"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <Check size={18} />
            En tu carrito
          </motion.span>
        ) : (
          <motion.span
            key="add"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <ShoppingBag size={18} />
            Agregar al Carrito
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
