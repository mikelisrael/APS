"use client";

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
  Newspaper
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PostComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: PostKind;
}

const PostComposer = ({
  open,
  onOpenChange,
  initialType = "post"
}: PostComposerProps) => {
  const { user } = useAuth();
  const { mutate: createPost, isPending } = useCreatePost();

  const [postType, setPostType] = useState<PostKind>(initialType);
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [hasContent, setHasContent] = useState(false);
  const [charCount, setCharCount] = useState(0);

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

  const handleReset = () => {
    editor?.commands.clearContent();
    setTitle("");
    setEventDate("");
    setHasContent(false);
    setCharCount(0);
    setPostType("post");
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

    if (!content && postType === "post") {
      toast.error("Post content is required");
      return;
    }

    // Create post
    createPost(
      {
        kind: postType,
        content: content || undefined,
        title: title || undefined,
        event_date: eventDate || undefined
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

    // For article or event, title and content are required.
    if (postType === "article" || postType === "event") {
      if (postType === "event" && !eventDate) {
        return true;
      }
      return !title || !hasContent;
    }

    return !hasContent;
  };

  return (
    <>
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

          {/* Dynamic Fields based on Post Type */}
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

          {/* TipTap Editor */}
          <div className="space-y-2">
            <Label>
              Content
              {postType === "post" && (
                <span className="text-destructive">*</span>
              )}
            </Label>
            <div className="rounded-lg border">
              <EditorContent editor={editor} />
            </div>
          </div>

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
              disabled={isPending}
            >
              <ImageIcon className="h-4 w-4" />
              <span>Add media</span>
            </Button>
          </div>
        </div>
      </ResponsiveDialog>
    </>
  );
};

export default PostComposer;
