// src/components/home/MobileHeroBanner.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, ArrowDown } from "lucide-react";
import { fetchBannerUrl } from "@/lib/data/getBanner";
import { formatDriveImageUrl } from "@/lib/imageUrl";

interface MobileHeroBannerProps {
  onExploreClick?: () => void;
}

export const MobileHeroBanner: React.FC<MobileHeroBannerProps> = ({
  onExploreClick,
}) => {
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    fetchBannerUrl().then((url) => {
      if (url) {
        setBannerUrl(formatDriveImageUrl(url) || url);
      }
    });
  }, []);

  const showCustomBanner = bannerUrl && !hasError;

  return (
    <section className="relative w-full overflow-hidden bg-[#EFEDE8] rounded-3xl mx-auto max-w-[calc(100%-2rem)] my-4 shadow-sm border border-[#E5E3DD]">
      {/* Background Media */}
      {showCustomBanner ? (
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bannerUrl}
            alt="Sunday Clóset Editorial Banner"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
            onError={() => setHasError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/25" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#EAE7E1] via-[#F2EFE9] to-[#E3DFD5]">
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-[#C2A78C]/15 blur-2xl" />
        </div>
      )}

      {/* Content Container */}
      <div
        className={`relative z-10 p-6 flex flex-col justify-end min-h-[260px] ${
          showCustomBanner ? "text-white" : "text-[#1F1F1F]"
        }`}
      >
        <div className="space-y-2 max-w-xs">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase backdrop-blur-md bg-white/20 text-[#C2A78C] border border-white/20">
            <Sparkles className="w-3 h-3" />
            <span>Segunda Selección</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-normal leading-tight">
            Piezas únicas. <br />
            <span className="italic font-light">Estilo propio.</span>
          </h1>

          <p
            className={`text-xs font-light leading-relaxed ${
              showCustomBanner ? "text-slate-200" : "text-[#5A5852]"
            }`}
          >
            Moda circular curada a mano. Cuando una prenda encuentra su hogar, no vuelve a repetirse.
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={onExploreClick}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition-all pressable ${
              showCustomBanner
                ? "bg-white text-[#1F1F1F] shadow-lg shadow-black/20"
                : "bg-[#1F1F1F] text-white shadow-md"
            }`}
          >
            <span>Ver Catálogo</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  );
};
