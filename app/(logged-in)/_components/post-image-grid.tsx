"use client";

import ImageLoader from "@/components/shared/image-loader";
import { cn } from "@/lib/utils";
import { PostAttachment } from "@/services/posts.service";

interface PostImageGridProps {
  attachments: PostAttachment[];
  onImageClick?: (index: number) => void;
}

const PostImageGrid = ({ attachments, onImageClick }: PostImageGridProps) => {
  if (!attachments || attachments.length === 0) return null;

  const imageCount = attachments.length;

  if (imageCount === 1) {
    const attachment = attachments[0];
    return (
      <div
        className="mt-3 flex items-center justify-center overflow-hidden rounded-2xl border"
        onClick={(e) => {
          e.stopPropagation();
          onImageClick?.(0);
        }}
      >
        <div className="relative max-h-[500px] w-full">
          <ImageLoader
            src={attachment.file_url}
            alt="Post Image"
            className="mx-auto h-[500px] w-full object-contain"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  // 🟡 Multi Image Layout
  const getGridClass = () => {
    switch (imageCount) {
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-2 h-[400px]";
      case 4:
        return "grid-cols-2 grid-rows-2";
      default:
        return "grid-cols-2";
    }
  };
  const getImageClass = (index: number) => {
    if (imageCount === 2) return "col-span-1 aspect-square";
    if (imageCount === 3) {
      if (index === 0) return "col-span-1 row-span-2 h-full";
      return "col-span-1 aspect-square";
    }
    return "col-span-1 aspect-square";
  };

  return (
    <div
      className={cn(
        "mt-3 grid gap-0.5 overflow-hidden rounded-2xl border",
        getGridClass()
      )}
    >
      {attachments.slice(0, 4).map((attachment, index) => (
        <div
          key={attachment.id}
          className={cn(
            "relative cursor-pointer overflow-hidden bg-muted transition-opacity hover:opacity-90",
            getImageClass(index)
          )}
          onClick={(e) => {
            e.stopPropagation();
            onImageClick?.(index);
          }}
        >
          <ImageLoader
            src={attachment.file_url}
            alt={`Image ${index + 1}`}
            // fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
          />

          {imageCount > 4 && index === 3 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <span className="text-3xl font-bold text-white">
                +{imageCount - 4}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PostImageGrid;
