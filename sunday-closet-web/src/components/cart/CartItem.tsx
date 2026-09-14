// src/components/cart/CartItem.tsx
"use client";

import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore, CartItem as CartItemType } from "@/lib/store/cartStore";
import { formatPrice } from "@/lib/utils/format";
import ProductImage from "@/components/product/ProductImage";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { removeItem } = useCartStore();
  const { product } = item;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="flex gap-4 py-4"
    >
      {/* Image */}
      <div className="relative w-20 h-24 shrink-0 bg-[#EEECEA] rounded-sm overflow-hidden">
        <ProductImage
          src={product.imagenUrl}
          alt={product.nombre}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold text-sm text-[#0A0A0A] leading-tight line-clamp-2">
          {product.nombre}
        </p>
        <p className="text-xs text-[#8A8880] mt-1">
          {product.marca} · Talla {product.talla}
        </p>
        <p className="text-xs text-[#8A8880] capitalize mt-0.5">
          {product.estilo}
        </p>
        <p className="font-display font-bold text-sm text-[#0A0A0A] mt-2">
          {formatPrice(product.precio)}
        </p>
      </div>

      {/* Remove */}
      <button
        onClick={() => removeItem(product.id)}
        aria-label={`Eliminar ${product.nombre} del carrito`}
        className="self-start mt-1 p-1 text-[#8A8880] hover:text-[#C84B4B] transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </motion.div>
  );
}
