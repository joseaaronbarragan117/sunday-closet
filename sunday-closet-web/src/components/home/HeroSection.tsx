"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Product } from "@/lib/data/mockProducts";
import { fetchBannerUrl } from "@/lib/data/getBanner";
import { formatDriveImageUrl } from "@/lib/imageUrl";

interface HeroSectionProps {
  featuredProduct?: Product;
}

export default function HeroSection({ featuredProduct }: HeroSectionProps) {
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    fetchBannerUrl().then((url) => {
      if (url) {
        setBannerUrl(formatDriveImageUrl(url) || url);
      }
    });
  }, []);

  const showBanner = bannerUrl && !hasError;

  return (
    <section className="relative w-full min-h-[85vh] sm:min-h-[90vh] flex items-center bg-[#EFEDE8] overflow-hidden pt-12">
      {/* Background Banner */}
      {showBanner ? (
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bannerUrl}
            alt="Sunday Clóset Editorial Banner"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
            onError={() => setHasError(true)}
          />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[0.5px]" />
        </div>
      ) : null}

      {/* Content Wrapper with Generous Side Margins */}
      <div className="relative z-10 site-container py-20 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`max-w-2xl space-y-6 ${showBanner ? 'text-white' : 'text-[#1F1F1F]'}`}
        >
          <span className="block text-xs uppercase tracking-[0.25em] font-light text-[#C2A78C]">
            Edición Curada — Segunda Selección
          </span>

          <h1 className="font-display font-light italic text-4xl sm:text-6xl md:text-7xl leading-[1.1] tracking-tight">
            Piezas únicas. <br />
            <span className="not-italic font-normal">Estilo propio.</span>
          </h1>

          <p className={`text-sm sm:text-base font-light leading-relaxed max-w-lg ${showBanner ? 'text-slate-100' : 'text-[#5A5852]'}`}>
            Curaduría exclusiva de moda circular y prendas irrepetibles. Cuando una pieza encuentra su hogar, no vuelve a repetirse.
          </p>

          <div className="pt-6 flex flex-wrap items-center gap-8 text-sm tracking-widest uppercase font-light">
            {featuredProduct && (
              <Link
                href={`/producto/${featuredProduct.slug}`}
                className="link-underline text-[#C2A78C] hover:text-[#A88C72] transition-colors py-1"
              >
                Ver Pieza Destacada →
              </Link>
            )}

            <a
              href="#productos"
              className={`link-underline transition-colors py-1 ${showBanner ? 'text-white hover:text-[#C2A78C]' : 'text-[#1F1F1F] hover:text-[#C2A78C]'}`}
            >
              Explorar Catálogo
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
