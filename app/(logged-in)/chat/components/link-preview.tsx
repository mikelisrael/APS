import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useEffect, useState } from "react";

interface LinkMetadata {
  title: string;
  description: string;
  image: string;
  url: string;
}

interface LinkPreviewProps {
  url: string;
  isOwn: boolean;
}

const LinkPreview = ({ url, isOwn }: LinkPreviewProps) => {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch metadata when component mounts
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // We'll need to create an API endpoint to fetch metadata
        const response = await fetch(
          `/api/link-preview?url=${encodeURIComponent(url)}`
        );
        if (!response.ok) throw new Error("Failed to fetch metadata");

        const data = await response.json();
        setMetadata(data);
      } catch (err) {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [url]);

  if (error || (!isLoading && !metadata)) return null;

  if (isLoading) {
    return (
      <Card className="mb-2 w-full max-w-[300px] overflow-hidden">
        <Skeleton className="h-32 w-full" />
        <div className="p-3">
          <Skeleton className="mb-2 h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-2 w-[300px] overflow-hidden">
      {metadata?.image && (
        <div className="relative h-32 w-full">
          <Image
            src={metadata.image}
            alt={metadata.title || "Link preview"}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-3">
        <h4 className="mb-1 line-clamp-2 text-sm font-medium">
          {metadata?.title}
        </h4>
        {metadata?.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {metadata.description}
          </p>
        )}
      </div>
    </Card>
  );
};

export default LinkPreview;
