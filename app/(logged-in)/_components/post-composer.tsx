"use client";

import EmojiPickerButton from "@/components/shared/emoji-picker-button";
import ResponsiveDialog from "@/components/shared/responsive-dialog";
import UserAvatar from "@/components/shared/user-avatar";
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
import { useCreatePost } from "@/hooks/use-posts";
import { useAuth } from "@/hooks/use-query-resource";
import { PostKind } from "@/services/posts.service";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarPlus,
  Globe,
  Image as ImageIcon,
  Newspaper,
  X
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface PostComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: PostKind;
  triggerMediaUpload?: boolean;
  onMediaUploadTriggered?: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 4;

const PostComposer = ({
  open,
  onOpenChange,
  initialType = "post",
  triggerMediaUpload = false,
  onMediaUploadTriggered
}: PostComposerProps) => {
  const { user } = useAuth();
  const { mutate: createPost, isPending } = useCreatePost();

  const [postType, setPostType] = useState<PostKind>(initialType);
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [hasContent, setHasContent] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string }>(
    {}
  );
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);
  const fullname = user?.user_metadata?.full_name;
  const abbr = fullname
    ? fullname
        .split(" ")
        .map((word: string) => word[0])
        .join("")
    : "";

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        hardBreak: {
          keepMarks: true
        }
      }),
      Placeholder.configure({
        placeholder: "Start a post, what's on your mind?",
        emptyEditorClass: "is-editor-empty"
      })
    ],
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-sm p-4 focus:outline-none min-h-[120px] max-h-[400px] overflow-y-auto thin-scrollbar"
      }
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      const textContent = text.trim();
      setHasContent(textContent.length > 0);
      setCharCount(text.length);
    }
  });

  useEffect(() => {
    if (editor && open) {
      editor.commands.focus();
    }
  }, [editor, open]);

  useEffect(() => {
    setPostType(initialType);
  }, [initialType]);

  // Trigger media upload when the Media button is clicked
  useEffect(() => {
    if (!triggerMediaUpload || !open) return;

    // Wait for next tick to ensure the dialog is mounted
    const timer = setTimeout(() => {
      const fileInput = document.getElementById("post-image-input");
      if (fileInput instanceof HTMLInputElement) {
        fileInput.click();
        // Delay the reset callback to ensure the file dialog opens
        setTimeout(() => {
          onMediaUploadTriggered?.();
        }, 100);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [triggerMediaUpload, open, onMediaUploadTriggered]);

  // Generate image previews
  useEffect(() => {
    const newPreviews: { [key: string]: string } = {};

    images.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviews[`${index}-${file.name}`] = e.target.result as string;
          setImagePreviews((prev) => ({ ...prev, ...newPreviews }));
        }
      };
      reader.readAsDataURL(file);
    });

    return () => {
      Object.values(imagePreviews).forEach((preview) => {
        if (preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [images]);

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name} exceeds 5MB limit`);
      return false;
    }
    return true;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    Array.from(files).forEach((file) => {
      if (validateFile(file)) {
        validFiles.push(file);
      }
    });

    const remainingSlots = MAX_IMAGES - images.length;
    if (validFiles.length > remainingSlots) {
      toast.error(`You can only add ${remainingSlots} more image(s)`);
      setImages((prev) => [...prev, ...validFiles.slice(0, remainingSlots)]);
    } else {
      setImages((prev) => [...prev, ...validFiles]);
    }
  };

  const removeImage = (index: number) => {
    const file = images[index];
    const previewKey = `${index}-${file.name}`;
    setImagePreviews((prev) => {
      const newPreviews = { ...prev };
      delete newPreviews[previewKey];
      return newPreviews;
    });
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleReset = () => {
    editor?.commands.clearContent();
    setTitle("");
    setEventDate("");
    setHasContent(false);
    setCharCount(0);
    setPostType("post");
    setImages([]);
    setImagePreviews({});
  };

  const handleClose = () => {
    handleReset();
  };

  const handleSubmit = () => {
    if (!editor || isPending) return;

    const content = editor.getText().trim();

    // Validation
    if (postType === "article" && !title) {
      toast.error("Article title is required");
      return;
    }

    if (postType === "event" && !title) {
      toast.error("Event title is required");
      return;
    }

    if (postType === "event" && !eventDate) {
      toast.error("Event date is required");
      return;
    }

    if (!content && postType === "post" && images.length === 0) {
      toast.error("Post content or images are required");
      return;
    }

    // Create post
    createPost(
      {
        kind: postType,
        content: content || undefined,
        title: title || undefined,
        event_date: eventDate || undefined,
        images: images.length > 0 ? images : undefined
      },
      {
        onSuccess: () => {
          handleReset();
          onOpenChange(false);
        }
      }
    );
  };

  const getPostTypeIcon = () => {
    switch (postType) {
      case "article":
        return <Newspaper className="h-4 w-4" />;
      case "event":
        return <CalendarPlus className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const isSubmitDisabled = () => {
    if (isPending) return true;

    if (postType === "article" || postType === "event") {
      if (postType === "event" && !eventDate) {
        return true;
      }
      return !title || !hasContent;
    }

    return !hasContent && images.length === 0;
  };

  return (
    <>
      <input
        id="post-image-input"
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
        disabled={isPending || images.length >= MAX_IMAGES}
      />
      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
          user-select: none;
        }

        .thin-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .thin-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .thin-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }

        .thin-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>

      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Create a post"
        onClose={handleClose}
        onSubmit={handleSubmit}
        disabledSubmit={isSubmitDisabled()}
        submitButtonText={isPending ? "Posting..." : "Post"}
        loading={isPending}
        className="max-w-2xl"
      >
        <div className="space-y-4">
          {/* User Info & Post Type */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar
                src={user?.user_metadata?.avatar_url}
                alt={fullname || "User Avatar"}
                fallback={abbr}
                className="h-12 w-12"
              />
              <div>
                <p className="font-semibold">{fullname}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  {getPostTypeIcon()}
                  <span className="capitalize">{postType}</span>
                </div>
              </div>
            </div>

            <Select
              value={postType}
              onValueChange={(value) => setPostType(value as PostKind)}
              disabled={isPending}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="post">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span>Post</span>
                  </div>
                </SelectItem>
                <SelectItem value="article">
                  <div className="flex items-center gap-2">
                    <Newspaper className="h-4 w-4" />
                    <span>Article</span>
                  </div>
                </SelectItem>
                <SelectItem value="event">
                  <div className="flex items-center gap-2">
                    <CalendarPlus className="h-4 w-4" />
                    <span>Event</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dynamic Fields */}
          <AnimatePresence mode="wait">
            {(postType === "article" || postType === "event") && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 overflow-hidden"
              >
                <div className="space-y-2">
                  <Label htmlFor="title">
                    {postType === "article" ? "Article Title" : "Event Title"}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder={
                      postType === "article"
                        ? "Give your article a compelling title..."
                        : "What's your event called?"
                    }
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isPending}
                    className="text-base"
                  />
                </div>

                {postType === "event" && (
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">
                      Event Date & Time
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="eventDate"
                      type="datetime-local"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      disabled={isPending}
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* TipTap Editor with Drag & Drop */}
          <div className="space-y-2">
            <Label>
              Content
              {postType === "post" && images.length === 0 && (
                <span className="text-destructive">*</span>
              )}
            </Label>
            <div
              className={`relative rounded-lg border ${
                isDragging ? "ring-2 ring-primary" : ""
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <EditorContent editor={editor} />
              <AnimatePresence>
                {isDragging && (
                  <motion.div
                    className="flex-center absolute inset-0 bg-primary/10 p-4 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-sm font-medium text-primary">
                      Drop images here
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Image Previews */}
          <AnimatePresence>
            {images.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-2">
                  {images.map((file, index) => {
                    const previewKey = `${index}-${file.name}`;
                    const previewUrl = imagePreviews[previewKey];

                    return (
                      <motion.div
                        key={previewKey}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="group relative aspect-square overflow-hidden rounded-lg border"
                      >
                        {previewUrl && (
                          <Image
                            src={previewUrl}
                            alt={file.name}
                            fill
                            className="object-cover"
                          />
                        )}
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                          disabled={isPending}
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Helper Text */}
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-xs text-muted-foreground">
              {postType === "article"
                ? "Share your insights and expertise"
                : postType === "event"
                  ? "Tell people about your event"
                  : "Share your thoughts with your network"}
            </p>
            {hasContent && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs text-muted-foreground"
              >
                {charCount || 0} characters
              </motion.span>
            )}
          </motion.div>

          {/* Media Actions */}
          <div className="flex items-center gap-2 border-t pt-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              disabled={isPending || images.length >= MAX_IMAGES}
              onClick={() =>
                document.getElementById("post-image-input")?.click()
              }
            >
              <ImageIcon className="h-4 w-4" />
              <span>
                Add images{" "}
                {images.length > 0 && `(${images.length}/${MAX_IMAGES})`}
              </span>
            </Button>

            <EmojiPickerButton
              onEmojiSelect={(emoji) => editor?.commands.insertContent(emoji)}
              disabled={isPending}
              buttonSize="sm"
              className="gap-2"
            />
          </div>
        </div>
      </ResponsiveDialog>
    </>
  );
};

export default PostComposer;
