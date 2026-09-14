// src/components/home/HMEditorialBanner.tsx
"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, Tag } from "lucide-react";
import { fetchBannerUrl } from "@/lib/data/getBanner";
import { formatDriveImageUrl } from "@/lib/imageUrl";

interface HMEditorialBannerProps {
  onExploreClick: () => void;
  featuredPrice?: string;
}

export const HMEditorialBanner: React.FC<HMEditorialBannerProps> = ({
  onExploreClick,
  featuredPrice = "$699.00",
}) => {
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    fetchBannerUrl().then((url) => {
      if (url) {
        setBannerUrl(formatDriveImageUrl(url) || url);
      }
    });
  }, []);

  const fallbackBanner =
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&auto=format&fit=crop&q=80";

  const displayImage = !imgError && bannerUrl ? bannerUrl : fallbackBanner;

  return (
    <section className="w-full bg-white mb-6">
      {/* Full-bleed Photo Container (Screenshot 2) */}
      <div className="relative w-full aspect-4/5 sm:aspect-3/4 overflow-hidden bg-[#F4F4F4]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayImage}
          alt="Sunday Clóset Editorial"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top"
          onError={() => setImgError(true)}
        />

        {/* Hotspot Price Tag Overlay (exact as Screenshot 2) */}
        <div
          onClick={onExploreClick}
          className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 bg-white/95 text-black px-3 py-1 text-xs font-bold tracking-tight shadow-md cursor-pointer hover:bg-white active:scale-95 transition-all"
        >
          <span className="w-2.5 h-2.5 bg-black inline-block" />
          <span>{featuredPrice}</span>
        </div>
      </div>

      {/* Editorial Title Below Image (exact as Screenshot 2) */}
      <div
        onClick={onExploreClick}
        className="px-4 py-4 flex items-center justify-between cursor-pointer group"
      >
        <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-black group-hover:text-[#E50010] transition-colors">
          LOS NUEVOS CLÁSICOS
        </h2>
        <ArrowRight className="w-5 h-5 text-black group-hover:translate-x-1 group-hover:text-[#E50010] transition-all" />
      </div>
    </section>
  );
};
