"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/lib/data/mockProducts";

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
}

export default function ProductCarousel({ title, subtitle, products }: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!trackRef.current) return;
    const amount = trackRef.current.clientWidth * 0.7;
    trackRef.current.scrollBy({
      left: dir === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 site-container">
      {/* Header */}
      <div className="flex items-end justify-between mb-6 border-b border-[#E5E3DD] pb-4">
        <div>
          <motion.h2
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="font-display font-light text-2xl sm:text-3xl text-[#1F1F1F]"
          >
            {title}
          </motion.h2>
          {subtitle && (
            <p className="text-xs font-light text-[#8A8880] mt-1">{subtitle}</p>
          )}
        </div>
        {/* Scroll controls */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            aria-label="Anterior"
            className="w-8 h-8 rounded-full border border-[#E5E3DD] flex items-center justify-center text-[#1F1F1F] hover:bg-[#1F1F1F] hover:text-white hover:border-[#1F1F1F] transition-all duration-200"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Siguiente"
            className="w-8 h-8 rounded-full border border-[#E5E3DD] flex items-center justify-center text-[#1F1F1F] hover:bg-[#1F1F1F] hover:text-white hover:border-[#1F1F1F] transition-all duration-200"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        className="carousel-track py-2"
      >
        {products.map((product) => (
          <div key={product.id || product.slug} className="w-[240px] sm:w-[260px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
