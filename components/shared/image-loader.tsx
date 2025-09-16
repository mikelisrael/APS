"use client";

import { cn } from "@/lib/utils";
import Image, { ImageProps } from "next/image";
import { useState } from "react";
import { IoImageOutline } from "react-icons/io5";

type ImageLoaderProps = Omit<ImageProps, "width" | "height"> & {
  className?: string;
  width?: number;
  height?: number;
  showLoader?: boolean;
};

const ImageLoader = ({
  className,
  showLoader = true,
  ...props
}: ImageLoaderProps) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      {!hasError ? (
        <>
          {showLoader && (
            <div className="absolute inset-0 animate-pulse bg-gray-400" />
          )}
          <Image
            fill
            sizes="(max-width: 1024px) 100vw, 800px"
            className="h-full w-full object-cover transition-opacity"
            onError={() => setHasError(true)}
            {...props}
            alt={props.alt ?? "carousel image"}
          />
        </>
      ) : (
        <div className="bg-muted flex h-full w-full items-center justify-center">
          <IoImageOutline className="text-muted-foreground m-auto text-2xl" />
        </div>
      )}
    </div>
  );
};

export default ImageLoader;
