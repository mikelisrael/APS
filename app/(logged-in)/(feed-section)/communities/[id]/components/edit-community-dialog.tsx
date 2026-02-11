"use client";

import ResponsiveDialog from "@/components/shared/responsive-dialog";
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
import { useUpdateCommunity } from "@/hooks/use-communities";
import { Community } from "@/services/communities.service";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EditCommunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  community: Community;
}

const EditCommunityDialog = ({
  open,
  onOpenChange,
  community
}: EditCommunityDialogProps) => {
  const { mutate: updateCommunity, isPending } = useUpdateCommunity();
  const [name, setName] = useState(community.name);
  const [description, setDescription] = useState(community.description || "");
  const [visibility, setVisibility] = useState<"public" | "private">(
    community.visibility
  );

  // Reset form when community changes
  useEffect(() => {
    setName(community.name);
    setDescription(community.description || "");
    setVisibility(community.visibility);
  }, [community]);

  const handleReset = () => {
    setName(community.name);
    setDescription(community.description || "");
    setVisibility(community.visibility);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Community name is required");
      return;
    }

    // Check if anything changed
    const hasChanges =
      name.trim() !== community.name ||
      description.trim() !== (community.description || "") ||
      visibility !== community.visibility;

    if (!hasChanges) {
      toast.info("No changes made");
      onOpenChange(false);
      return;
    }

    updateCommunity(
      {
        communityId: community.id,
        data: {
          name: name.trim(),
          description: description.trim() || undefined,
          visibility
        }
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        }
      }
    );
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Community"
      onClose={handleReset}
      onSubmit={handleSubmit}
      disabledSubmit={!name.trim() || isPending}
      submitButtonText={isPending ? "Saving..." : "Save Changes"}
      loading={isPending}
      className="max-w-md"
    >
      <div className="space-y-4">
        {/* Community Name */}
        <div className="space-y-2">
          <Label htmlFor="edit-name">
            Community Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="edit-name"
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
          <Label htmlFor="edit-description">Description</Label>
          <Textarea
            id="edit-description"
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
          <Label htmlFor="edit-visibility">Visibility</Label>
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
      </div>
    </ResponsiveDialog>
  );
};

export default EditCommunityDialog;
