"use client";

import Image, { type ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ImageWithFallbackProps = ImageProps & {
  fallback?: ReactNode;
  fallbackClassName?: string;
  fallbackLabel?: string;
};

export function ImageWithFallback({
  src,
  alt,
  fallback,
  fallbackClassName,
  fallbackLabel = "이미지를 불러오지 못했어요",
  onError,
  ...props
}: ImageWithFallbackProps) {
  const [failedSrc, setFailedSrc] = useState<ImageProps["src"] | null>(null);
  const hasError = failedSrc === src;

  if (hasError) {
    return (
      <span
        className={cn(
          "flex h-full w-full items-center justify-center bg-muted text-muted-foreground",
          fallbackClassName,
        )}
        role={alt ? "img" : undefined}
        aria-label={alt || fallbackLabel}
      >
        {fallback ?? <ImageOff className="size-5 opacity-55" aria-hidden="true" />}
      </span>
    );
  }

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      onError={(event) => {
        setFailedSrc(src);
        onError?.(event);
      }}
    />
  );
}
