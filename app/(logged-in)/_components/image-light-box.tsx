"use client";

import { PostAttachment } from "@/services/posts.service";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";

interface ImageLightboxProps {
  images: PostAttachment[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const ImageLightbox = ({
  images,
  initialIndex,
  isOpen,
  onClose,
  onNavigate
}: ImageLightboxProps) => {
  const currentImage = images[initialIndex];
  const hasPrev = initialIndex > 0;
  const hasNext = initialIndex < images.length - 1;
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && hasPrev) {
        onNavigate(initialIndex - 1);
      } else if (e.key === "ArrowRight" && hasNext) {
        onNavigate(initialIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialIndex, hasPrev, hasNext, onClose, onNavigate]);

  // Auto-scroll to center the active thumbnail
  useEffect(() => {
    if (!thumbnailContainerRef.current) return;

    const container = thumbnailContainerRef.current;
    const activeThumb = container.children[initialIndex] as HTMLElement;

    if (activeThumb) {
      const containerWidth = container.offsetWidth;
      const thumbLeft = activeThumb.offsetLeft;
      const thumbWidth = activeThumb.offsetWidth;

      // Center the thumbnail
      const scrollPosition = thumbLeft - containerWidth / 2 + thumbWidth / 2;

      container.scrollTo({
        left: scrollPosition,
        behavior: "smooth"
      });
    }
  }, [initialIndex]);

  if (!isOpen || !currentImage) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={onClose}
        >
          {/* Close Button */}
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
          >
            <X className="h-6 w-6" />
          </motion.button>

          {/* Image Counter */}
          {images.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 z-10 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white"
            >
              {initialIndex + 1} / {images.length}
            </motion.div>
          )}

          {/* Previous Button */}
          {hasPrev && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(initialIndex - 1);
              }}
              className="absolute left-4 z-10 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
            >
              <ChevronLeft className="h-6 w-6" />
            </motion.button>
          )}

          {/* Next Button */}
          {hasNext && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(initialIndex + 1);
              }}
              className="absolute right-4 z-10 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
            >
              <ChevronRight className="h-6 w-6" />
            </motion.button>
          )}

          {/* Image Container */}
          <motion.div
            key={initialIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="relative flex h-full w-full items-center justify-center p-12"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-full w-full">
              <Image
                src={currentImage.file_url}
                alt={`Image ${initialIndex + 1}`}
                fill
                className="object-contain"
                priority
                sizes="100vw"
              />
            </div>
          </motion.div>

          {images.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 z-10 w-full max-w-3xl -translate-x-1/2 px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center">
                <div
                  ref={thumbnailContainerRef}
                  className="no-scrollbar flex max-w-full gap-2 overflow-x-auto rounded-2xl bg-black/50 p-2"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none"
                  }}
                >
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => onNavigate(index)}
                      className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                        index === initialIndex
                          ? "ring-2 ring-white ring-offset-2 ring-offset-black"
                          : "opacity-50 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={image.file_url}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageLightbox;
