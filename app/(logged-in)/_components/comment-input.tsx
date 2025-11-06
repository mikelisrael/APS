"use client";

import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-query-resource";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ReplyingTo {
  id: string;
  author: string;
  content: string;
}

interface CommentInputProps {
  onSubmit: (content: string, parentCommentId?: string) => void;
  isPending?: boolean;
  replyingTo?: ReplyingTo | null;
  onCancelReply?: () => void;
  autoFocus?: boolean;
}

const CommentInput = ({
  onSubmit,
  isPending = false,
  replyingTo,
  onCancelReply,
  autoFocus = false
}: CommentInputProps) => {
  const { user } = useAuth();
  const [hasContent, setHasContent] = useState(false);

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
        placeholder: replyingTo
          ? `Reply to ${replyingTo.author}...`
          : "Write a comment...",
        emptyEditorClass: "is-editor-empty"
      })
    ],
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-sm p-3 focus:outline-none min-h-[30px] max-h-[200px] overflow-y-auto thin-scrollbar"
      }
    },
    onUpdate: ({ editor }) => {
      const textContent = editor.getText().trim();
      setHasContent(textContent.length > 0);
    }
  });

  useEffect(() => {
    if (editor && autoFocus) {
      editor.commands.focus();
    }
  }, [editor, autoFocus]);

  const handleSubmit = () => {
    if (!editor || !hasContent || isPending) return;

    const content = editor.getText().trim();
    onSubmit(content, replyingTo?.id);
    editor.commands.clearContent();
    setHasContent(false);

    // Clear reply state after submitting
    if (replyingTo && onCancelReply) {
      onCancelReply();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-2">
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

      {/* Reply Preview */}
      {replyingTo && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="flex items-center gap-2 rounded-md border-l-4 border-l-primary bg-muted/50 px-3 py-2"
        >
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-medium">
              Replying to {replyingTo.author}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {replyingTo.content}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={onCancelReply}
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      <div
        className="grid grid-cols-[auto,1fr,auto] gap-2"
        id="comment-input-container"
      >
        <UserAvatar
          src={user?.user_metadata?.avatar_url}
          fallback={abbr}
          className="h-10 w-10"
        />

        <div className="bg-background" onKeyDown={handleKeyDown}>
          <EditorContent editor={editor} />
        </div>

        <div className="flex h-full items-end justify-end">
          <Button onClick={handleSubmit} disabled={!hasContent || isPending}>
            {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}{" "}
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommentInput;
