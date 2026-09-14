"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Product } from "@/lib/data/mockProducts";
import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils/format";
import ProductImage from "@/components/product/ProductImage";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const isAvailable = product.estado === "disponible";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col"
    >
      <Link
        href={isAvailable ? `/producto/${product.slug}` : "#"}
        className={`block relative ${!isAvailable ? "cursor-not-allowed" : ""}`}
      >
        {/* Product Image Frame */}
        <div className="product-img-wrap relative aspect-[3/4] w-full bg-[#EFEDE8] overflow-hidden rounded-xs group-hover:scale-105 transition-transform duration-500">
          <ProductImage
            src={product.imagenUrl}
            alt={product.nombre}
            loading={priority ? "eager" : "lazy"}
            className={`w-full h-full object-cover ${!isAvailable ? "opacity-50 grayscale" : ""}`}
          />

          {/* Badge Overlay */}
          <div className="absolute top-3 left-3 z-10">
            <Badge status={product.estado} size="sm" />
          </div>

          {/* Subtle Hover Info Bar */}
          {isAvailable && (
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between text-white text-xs font-light tracking-wider">
              <span>Talla {product.talla}</span>
              <span className="font-light text-sm">{formatPrice(product.precio)}</span>
            </div>
          )}
        </div>

        {/* Info below Card */}
        <div className="mt-3.5 space-y-1 text-left">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-light text-[#1F1F1F] group-hover:text-[#C2A78C] transition-colors duration-200 line-clamp-1">
              {product.nombre}
            </h3>
            <span className="font-light text-sm text-[#1F1F1F]">
              {formatPrice(product.precio)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-[#8A8880] font-light">
            <span>{product.marca}</span>
            <span className="uppercase tracking-widest text-[10px] text-[#A88C72]">Talla {product.talla}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
