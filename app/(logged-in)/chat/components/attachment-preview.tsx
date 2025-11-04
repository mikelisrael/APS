import {
  Download,
  File,
  FileText,
  Image as ImageIcon,
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
  const isImage = attachment.file_type.startsWith("image/");
  const isVideo = attachment.file_type.startsWith("video/");
  const Icon = getFileIcon(attachment.file_type);

  if (isImage) {
    return (
      <div className="group relative overflow-hidden rounded-lg">
        <Image
          src={attachment.file_url}
          alt="Attachment"
          className="max-h-64 w-full rounded-lg object-cover"
          height={1080}
          width={1080}
        />
        <a
          href={attachment.file_url}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-2 top-2 rounded-full bg-black/50 p-2 opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
        >
          <Download className="h-4 w-4 text-white" />
        </a>
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className="overflow-hidden rounded-lg">
        <video
          src={attachment.file_url}
          controls
          className="max-h-64 w-full rounded-lg"
        />
      </div>
    );
  }

  // File attachment card
  return (
    <a
      href={attachment.file_url}
      download
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
        isOwn
          ? "border-primary-foreground/20 bg-primary-foreground/10 hover:bg-primary-foreground/15"
          : "border-border bg-muted/50 hover:bg-muted"
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded ${
          isOwn ? "bg-primary-foreground/20" : "bg-background"
        }`}
      >
        <Icon
          className={`h-5 w-5 ${isOwn ? "text-primary-foreground" : "text-muted-foreground"}`}
        />
      </div>
      <div className="flex-1 overflow-hidden">
        <p
          className={`truncate text-sm font-medium ${isOwn ? "text-primary-foreground" : ""}`}
        >
          {attachment.file_url.split("/").pop()?.split("?")[0] || "File"}
        </p>
        <p
          className={`text-xs ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}
        >
          {formatFileSize(attachment.file_size)}
        </p>
      </div>
      <Download
        className={`h-4 w-4 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}
      />
    </a>
  );
};

export { AttachmentPreview };
