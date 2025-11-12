import { cn } from "@/lib/utils";
import {
  Download,
  File,
  FileText,
  Image as ImageIcon,
  Loader2,
  Video
} from "lucide-react";
import Image from "next/image";
import React from "react";

interface ChatAttachment {
  id: string;
  file_url: string;
  file_type: string;
  file_size: number;
  metadata?: any;
  _optimistic?: boolean;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith("image/")) return ImageIcon;
  if (fileType.startsWith("video/")) return Video;
  if (fileType.includes("pdf") || fileType.includes("document"))
    return FileText;
  return File;
};

const AttachmentPreview: React.FC<{
  attachment: ChatAttachment;
  isOwn: boolean;
}> = ({ attachment, isOwn }) => {
  const isOptimistic = attachment._optimistic;
  const isImage = attachment.file_type.startsWith("image/");
  const isVideo = attachment.file_type.startsWith("video/");
  const Icon = getFileIcon(attachment.file_type);

  if (isImage) {
    return (
      <div className="group relative overflow-hidden rounded-lg">
        <Image
          src={attachment.file_url}
          alt={attachment.metadata?.name || "Attachment"}
          className={cn(
            "max-h-64 w-full rounded-lg object-cover transition-opacity",
            isOptimistic && "opacity-60"
          )}
          height={1080}
          width={1080}
          unoptimized={isOptimistic} // Don't optimize blob URLs
        />
        {isOptimistic && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-2 text-white">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-xs font-medium">Uploading...</span>
            </div>
          </div>
        )}
        {!isOptimistic && (
          <a
            href={attachment.file_url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-2 top-2 rounded-full bg-black/50 p-2 opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
          >
            <Download className="h-4 w-4 text-white" />
          </a>
        )}
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className="relative overflow-hidden rounded-lg">
        <video
          src={attachment.file_url}
          controls={!isOptimistic}
          className={cn(
            "max-h-64 w-full rounded-lg",
            isOptimistic && "opacity-60"
          )}
        />
        {isOptimistic && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 text-white">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-xs font-medium">Uploading...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  const isPdf =
    attachment.file_type.includes("pdf") ||
    attachment.file_url?.toLowerCase().endsWith(".pdf");

  if (isPdf) {
    return (
      <div className="overflow-hidden rounded-lg">
        <div
          className={cn(
            "relative h-52 w-full overflow-hidden rounded-lg border",
            isOptimistic && "opacity-60"
          )}
        >
          {!isOptimistic ? (
            <object
              data={attachment.file_url}
              type="application/pdf"
              className="h-full w-full"
            >
              <div className="flex h-full w-full flex-col items-center justify-center p-4">
                <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm">
                  {attachment.metadata?.name ||
                    attachment.file_url.split("/").pop()?.split("?")[0] ||
                    "Document.pdf"}
                </p>
                <a
                  href={attachment.file_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-xs underline"
                >
                  Download PDF
                </a>
              </div>
            </object>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4">
              <FileText className="h-8 w-8" />
              <p className="text-sm font-medium">
                {attachment.metadata?.name || "Document.pdf"}
              </p>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-xs">Uploading...</span>
            </div>
          )}

          {!isOptimistic && (
            <a
              href={attachment.file_url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="absolute right-2 top-2 rounded-full bg-black/50 p-2 opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
            >
              <Download className="h-4 w-4 text-white" />
            </a>
          )}
        </div>
      </div>
    );
  }

  // File attachment card
  const FileCard = (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3 transition-colors",
        isOwn
          ? "border-primary-foreground/20 bg-primary-foreground/10"
          : "border-border bg-muted/50",
        !isOptimistic &&
          (isOwn ? "hover:bg-primary-foreground/15" : "hover:bg-muted"),
        isOptimistic && "opacity-60"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded",
          isOwn ? "bg-primary-foreground/20" : "bg-background"
        )}
      >
        <Icon
          className={cn(
            "h-5 w-5",
            isOwn ? "text-primary-foreground" : "text-muted-foreground"
          )}
        />
      </div>
      <div className="flex-1 overflow-hidden">
        <p
          className={cn(
            "truncate text-sm font-medium",
            isOwn && "text-primary-foreground"
          )}
        >
          {attachment.metadata?.name ||
            attachment.file_url.split("/").pop()?.split("?")[0] ||
            "File"}
        </p>
        <p
          className={cn(
            "text-xs",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {formatFileSize(attachment.file_size)}
        </p>
      </div>
      {isOptimistic ? (
        <Loader2
          className={cn(
            "h-4 w-4 animate-spin",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        />
      ) : (
        <Download
          className={cn(
            "h-4 w-4",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        />
      )}
    </div>
  );

  // Only make it a link if not optimistic
  if (isOptimistic) {
    return FileCard;
  }

  return (
    <a
      href={attachment.file_url}
      download
      target="_blank"
      rel="noopener noreferrer"
    >
      {FileCard}
    </a>
  );
};

export { AttachmentPreview };
