"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Trash2, Upload } from "lucide-react";
import NextImage from "next/image";
import { useCallback, useEffect, useState } from "react";
import Cropper from "react-easy-crop";

const createCroppedImage = async (imageSrc: string, pixelCrop: any) => {
  const image = new Image();
  image.src = imageSrc;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (ctx === null) {
    throw new Error("Failed to get 2D context");
  }

  await new Promise((resolve) => {
    image.onload = resolve;
  });

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL("image/png");
};

const formatFileSize = (sizeInBytes: number) => {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  } else if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
  }
};

export interface FileUploaderProps {
  acceptedFileTypes: string[];
  max: number;
  enableCrop?: boolean;
  cropAspect?: number;
  value: string | undefined;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  onError: (message: string) => void;
}

const FileUploader = ({
  acceptedFileTypes = ["image/*"],
  max = 5,
  enableCrop = false,
  cropAspect = 1,
  value,
  onChange,
  className = "",
  placeholder = "Drag and drop file here",
  onError
}: FileUploaderProps) => {
  const maxSizeInBytes = max * 1024 * 1024;
  const [dragActive, setDragActive] = useState(false);
  const [filePreview, setFilePreview] = useState(value || "");
  const [originalImage, setOriginalImage] = useState("");
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [fileInfo, setFileInfo] = useState({ name: "", size: 0 });

  useEffect(() => {
    if (value) {
      setFilePreview(value);
    }
  }, [value]);

  const handleDrag = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleFileUpload = (files: File[]) => {
    if (files?.[0]) {
      const file = files[0];

      if (file.size > maxSizeInBytes) {
        onError(`File size exceeds maximum limit of ${max}MB`);
        return;
      }

      const mimeTypes = acceptedFileTypes.filter((t) => t.includes("/"));
      const extensions = acceptedFileTypes
        .filter((t) => !t.includes("/"))
        .map((ext) => (ext.startsWith(".") ? ext : `.${ext}`));

      const isMimeTypeAllowed = mimeTypes.some((mime) => {
        if (mime.endsWith("/*")) {
          const category = mime.split("/")[0];
          return file.type.startsWith(`${category}/`);
        }
        return mime === file.type;
      });

      const isExtensionAllowed = extensions.some((ext) =>
        file.name.toLowerCase().endsWith(ext.toLowerCase())
      );

      if (!isMimeTypeAllowed && !isExtensionAllowed) {
        onError(`Invalid file type. Allowed: ${acceptedFileTypes.join(", ")}`);
        return;
      }

      const reader = new FileReader();
      setFileInfo({ name: file.name, size: file.size });

      reader.onload = (event) => {
        const result = event.target?.result;
        if (result) {
          const isImage = file.type.startsWith("image/");
          if (enableCrop && isImage) {
            setOriginalImage(result as string);
            setShowCropper(true);
          } else {
            setFilePreview(result as string);
            onChange(result as string);
          }
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const clearFile = (e: any) => {
    e.stopPropagation();
    setFilePreview("");
    setFileInfo({ name: "", size: 0 });
    onChange("");
  };

  interface CroppedArea {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  const onCropComplete = useCallback(
    (croppedArea: CroppedArea, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const saveCroppedImage = async () => {
    try {
      const croppedImage = await createCroppedImage(
        originalImage,
        croppedAreaPixels
      );
      setFilePreview(croppedImage);
      onChange(croppedImage);
      setShowCropper(false);
    } catch (e) {
      console.error("Error creating cropped image:", e);
    }
  };

  const fileTypePlaceholder = () => {
    const mimeToExtension: { [key: string]: string } = {
      "application/pdf": "PDF",
      "image/jpeg": "JPG",
      "image/png": "PNG",
      "image/svg+xml": "SVG",
      "image/*": "Images"
    };

    const parts = acceptedFileTypes.map((type) => {
      if (mimeToExtension[type]) return mimeToExtension[type];
      if (type.startsWith(".")) return type.toUpperCase().slice(1);
      if (type.includes("/")) return type.split("/")[1].toUpperCase();
      return type.toUpperCase();
    });

    return Array.from(new Set(parts)).join(", ");
  };

  const uploaderId = `file-uploader-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <>
      <div
        className={cn(
          `relative flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-all ${
            dragActive
              ? "border-primary bg-primary/20"
              : "border-input hover:border-gray-400"
          }`,
          className
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document?.getElementById(uploaderId)?.click()}
      >
        {filePreview ? (
          <div className="flex h-full w-full flex-col items-center justify-center">
            <NextImage
              src={filePreview}
              alt="File preview"
              width={150}
              height={150}
              className="max-h-16 max-w-full object-contain"
            />
            {fileInfo.name && (
              <div className="mt-2 text-center">
                <p className="max-w-full truncate text-xs font-medium text-muted-foreground">
                  {fileInfo.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(fileInfo.size)}
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mb-2 text-center text-muted-foreground">
              <Upload size={20} className="mx-auto mb-1" />
              <p className="text-sm font-medium">{placeholder}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {fileTypePlaceholder()} (max. {max}MB)
              </p>
            </div>
          </>
        )}
        <input
          id={uploaderId}
          type="file"
          className="hidden"
          accept={acceptedFileTypes
            .map((type) => (type.includes("/") ? type : `.${type}`))
            .join(",")}
          onChange={(e) => {
            const files = e.target.files;
            if (files) handleFileUpload(Array.from(files));
          }}
        />

        {filePreview && (
          <button
            type="button"
            onClick={clearFile}
            className="absolute bottom-2 right-2 rounded-full bg-destructive/10 p-1 text-destructive transition-all"
            aria-label="Clear file"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {enableCrop && (
        <Dialog open={showCropper} onOpenChange={setShowCropper}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crop Image</DialogTitle>
              <DialogDescription>
                Adjust the crop area and zoom level, then click {`"Apply" `}to
                save.
              </DialogDescription>
            </DialogHeader>
            <div className="relative h-64 w-full">
              {originalImage && (
                <Cropper
                  image={originalImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={cropAspect}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              )}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Zoom</span>
                <span className="text-sm">{zoom.toFixed(1)}x</span>
              </div>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0])}
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCropper(false)}>
                Cancel
              </Button>
              <Button onClick={saveCroppedImage}>Apply</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default FileUploader;
