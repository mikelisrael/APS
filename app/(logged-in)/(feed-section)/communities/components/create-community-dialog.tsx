"use client";

import ResponsiveDialog from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCommunity } from "@/hooks/use-communities";
import { ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

interface CreateCommunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateCommunityDialog = ({
  open,
  onOpenChange
}: CreateCommunityDialogProps) => {
  const { mutate: createCommunity, isPending } = useCreateCommunity();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "cover") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    if (type === "logo") {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setCover(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (type: "logo" | "cover") => {
    if (type === "logo") {
      setImage(null);
      setImagePreview(null);
    } else {
      setCover(null);
      setCoverPreview(null);
    }
  };

  const handleReset = () => {
    setName("");
    setDescription("");
    setVisibility("public");
    setImage(null);
    setImagePreview(null);
    setCover(null);
    setCoverPreview(null);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Community name is required");
      return;
    }

    createCommunity(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        visibility,
        image: image || undefined,
        cover: cover || undefined
      },
      {
        onSuccess: () => {
          handleReset();
          onOpenChange(false);
        }
      }
    );
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create Community"
      onClose={handleReset}
      onSubmit={handleSubmit}
      disabledSubmit={!name.trim() || isPending}
      submitButtonText={isPending ? "Creating..." : "Create"}
      loading={isPending}
      className="max-w-md"
    >
      <div className="space-y-4">
        {/* Community Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Community Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Enter community name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            maxLength={255}
          />
          <p className="text-xs text-muted-foreground">
            {name.length}/255 characters
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your community..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground">
            {description.length}/500 characters
          </p>
        </div>

        {/* Visibility */}
        <div className="space-y-2">
          <Label htmlFor="visibility">Visibility</Label>
          <Select
            value={visibility}
            onValueChange={(value: "public" | "private") => setVisibility(value)}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Public</span>
                  <span className="text-xs text-muted-foreground">
                    Anyone can view and join
                  </span>
                </div>
              </SelectItem>
              <SelectItem value="private">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Private</span>
                  <span className="text-xs text-muted-foreground">
                    Only members can view
                  </span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Community Logo */}
        <div className="space-y-2">
          <Label>Community Logo (Avatar)</Label>
          {imagePreview ? (
            <div className="relative aspect-square w-32 overflow-hidden rounded-lg border">
              <Image
                src={imagePreview}
                alt="Logo Preview"
                fill
                className="object-cover"
              />
              <button
                onClick={() => handleRemoveImage("logo")}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 transition-colors hover:bg-black/80"
                disabled={isPending}
                type="button"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById("community-logo-input")?.click()}
              disabled={isPending}
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Upload Logo
            </Button>
          )}
          <input
            id="community-logo-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageSelect(e, "logo")}
            disabled={isPending}
          />
          <p className="text-xs text-muted-foreground">
            Square image recommended. Max size: 5MB.
          </p>
        </div>

        {/* Community Cover Image */}
        <div className="space-y-2">
          <Label>Cover Image (Optional)</Label>
          {coverPreview ? (
            <div className="relative aspect-[3/1] w-full overflow-hidden rounded-lg border">
              <Image
                src={coverPreview}
                alt="Cover Preview"
                fill
                className="object-cover"
              />
              <button
                onClick={() => handleRemoveImage("cover")}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 transition-colors hover:bg-black/80"
                disabled={isPending}
                type="button"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById("community-cover-input")?.click()}
              disabled={isPending}
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              Upload Cover
            </Button>
          )}
          <input
            id="community-cover-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageSelect(e, "cover")}
            disabled={isPending}
          />
          <p className="text-xs text-muted-foreground">
            Wide image (3:1 ratio) recommended. Max size: 5MB.
          </p>
        </div>
      </div>
    </ResponsiveDialog>
  );
};

export default CreateCommunityDialog;
