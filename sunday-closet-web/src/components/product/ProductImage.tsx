"use client";

import React, { useState, useEffect, useMemo } from "react";
import { formatDriveImageUrl, extractGoogleDriveId, getDriveThumbnailUrl } from "@/lib/imageUrl";

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  fallbackUrl?: string;
}

export default function ProductImage({
  src,
  alt,
  className = "w-full h-full object-cover",
  loading = "lazy",
  fallbackUrl = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80",
}: ProductImageProps) {
  const fileId = useMemo(() => extractGoogleDriveId(src), [src]);

  const candidates = useMemo(() => {
    if (!src || !src.trim()) return [fallbackUrl];
    if (fileId) {
      return [
        `https://lh3.googleusercontent.com/d/${fileId}`,
        `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
        fallbackUrl,
      ];
    }
    return [src.trim(), fallbackUrl];
  }, [src, fileId, fallbackUrl]);

  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    setStageIndex(0);
  }, [src]);

  const currentSrc = candidates[stageIndex] || fallbackUrl;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      className={className}
      onError={() => {
        if (stageIndex + 1 < candidates.length) {
          setStageIndex((prev) => prev + 1);
        }
      }}
    />
  );
}
