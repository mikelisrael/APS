"use client";

import { cn } from "@/lib/utils";
import Image, { ImageProps } from "next/image";
import { useState } from "react";

interface ImageLoaderProps extends Omit<ImageProps, "src"> {
  className?: string;
  src?: string;
}

const ImageLoader = ({ className, alt, src, ...props }: ImageLoaderProps) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      {!hasError && src ? (
        <>
          <div className="absolute inset-0 -z-10 size-full animate-pulse bg-muted" />
          <Image
            alt={alt}
            src={src}
            {...props}
            className="size-full w-full bg-muted object-cover transition-opacity"
            onError={() => setHasError(true)}
          />
        </>
      ) : (
        <div className="flex-center size-full bg-muted"></div>
      )}
    </div>
  );
};

export default ImageLoader;
