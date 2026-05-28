"use client";

import { useEffect, useState } from "react";

type SafeImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackSrc?: string;
};

export default function SafeImage({
  src,
  alt,
  className,
  fallbackSrc = "/smc-bird.svg",
}: SafeImageProps) {
  const normalized = src?.trim() ? src : fallbackSrc;
  const [currentSrc, setCurrentSrc] = useState(normalized);

  useEffect(() => {
    setCurrentSrc(normalized);
  }, [normalized]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
      }}
    />
  );
}
