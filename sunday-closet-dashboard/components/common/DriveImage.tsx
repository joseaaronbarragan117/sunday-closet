'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { extractGoogleDriveId } from '@/lib/imageUrl';
import { ImageOff } from 'lucide-react';

interface DriveImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fallbackUrl?: string;
}

export const DriveImage: React.FC<DriveImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  loading = 'lazy',
  fallbackUrl = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&auto=format&fit=crop&q=80',
}) => {
  const fileId = useMemo(() => extractGoogleDriveId(src), [src]);

  // Generate sequence of fallback candidate URLs for maximum resilience
  const candidates = useMemo(() => {
    if (!src || !src.trim()) return [];

    if (fileId) {
      return [
        // 1. Direct high-res Google CDN with no-referrer
        `https://lh3.googleusercontent.com/d/${fileId}`,
        // 2. Google Drive Thumbnail CDN
        `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
        // 3. Same-origin proxy on local Next.js server (immune to Safari/CORS/Referrer)
        `/api/drive-image?id=${fileId}`,
        // 4. Final placeholder fallback
        fallbackUrl,
      ];
    }

    const trimmed = src.trim();
    return [
      trimmed,
      `/api/drive-image?url=${encodeURIComponent(trimmed)}`,
      fallbackUrl,
    ];
  }, [src, fileId, fallbackUrl]);

  const [stageIndex, setStageIndex] = useState(0);
  const [hasFailedAll, setHasFailedAll] = useState(false);

  // Reset stage whenever src changes
  useEffect(() => {
    setStageIndex(0);
    setHasFailedAll(!src || !src.trim());
  }, [src]);

  const currentUrl = candidates[stageIndex] || fallbackUrl;

  const handleError = () => {
    if (stageIndex + 1 < candidates.length) {
      setStageIndex((prev) => prev + 1);
    } else {
      setHasFailedAll(true);
    }
  };

  if (hasFailedAll || !src || !src.trim()) {
    return (
      <div className={`flex items-center justify-center bg-slate-900 text-slate-600 ${className}`}>
        <ImageOff className="w-5 h-5 opacity-60" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentUrl}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      className={className}
      onError={handleError}
    />
  );
};
