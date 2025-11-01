import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Edit,
  FileText,
  Image as ImageIcon,
  Loader2,
  PaperclipIcon,
  SendHorizontal,
  Smile,
  Video,
  X
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ReplyingTo {
  id: string;
  message: string;
  sender: string;
}

interface EditingMessage {
  id: string;
  message: string;
}

interface ChatInputProps {
  onSend: (content: string, attachments?: File[], replyToId?: string) => void;
  replyingTo?: ReplyingTo | null;
  editingMessage?: EditingMessage | null;
  onCancelReply?: () => void;
  onCancelEdit?: () => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ChatInput = ({
  onSend,
  replyingTo,
  editingMessage,
  onCancelReply,
  onCancelEdit,
  disabled = false
}: ChatInputProps) => {
  const { theme } = useTheme();
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string }>(
    {}
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: editingMessage
          ? "Edit message..."
          : replyingTo
            ? "Reply to message..."
            : "Type a message",
        emptyEditorClass: "is-editor-empty"
      })
    ],
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-sm p-4 focus:outline-none max-h-[120px] overflow-y-auto thin-scrollbar"
      }
    },
    onUpdate: ({ editor }) => {
      // Check if editor has actual text content (not just empty paragraphs)
      const textContent = editor.getText().trim();
      setHasContent(textContent.length > 0);
    }
  });

  // Initialize hasContent based on editor state
  useEffect(() => {
    if (editor) {
      const textContent = editor.getText().trim();
      setHasContent(textContent.length > 0);
    }
  }, [editor]);

  // Load message content when editing
  useEffect(() => {
    if (editor && editingMessage) {
      editor.commands.setContent(editingMessage.message);
      editor.commands.focus();
    } else if (editor && !editingMessage) {
      editor.commands.clearContent();
    }
  }, [editingMessage, editor]);

  // Generate image previews when attachments change
  useEffect(() => {
    const newPreviews: { [key: string]: string } = {};

    attachments.forEach((file, index) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newPreviews[`${index}-${file.name}`] = e.target.result as string;
            setImagePreviews((prev) => ({ ...prev, ...newPreviews }));
          }
        };
        reader.readAsDataURL(file);
      }
    });

    return () => {
      // Clean up object URLs when component unmounts or attachments change
      Object.values(imagePreviews).forEach((preview) => {
        if (preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [attachments]);

  const validateFile = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name} exceeds 10MB limit`);
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

    // Add new files to the end of the array (most recent last)
    setAttachments((prev) => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    const file = attachments[index];
    // Clean up the preview URL if it exists
    if (file.type.startsWith("image/")) {
      const previewKey = `${index}-${file.name}`;
      setImagePreviews((prev) => {
        const newPreviews = { ...prev };
        delete newPreviews[previewKey];
        return newPreviews;
      });
    }
    setAttachments((prev) => prev.filter((_, i) => i !== index));
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

  const handleSend = () => {
    if (!editor || disabled) return;

    const content = editor.getText().trim();
    if (!content && attachments.length === 0) return;

    onSend(content, attachments, replyingTo?.id);
    editor.commands.clearContent();
    setAttachments([]);
    setImagePreviews({});
    setHasContent(false);
    if (onCancelReply) onCancelReply();
    if (onCancelEdit) onCancelEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape" && editingMessage && onCancelEdit) {
      e.preventDefault();
      onCancelEdit();
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    if (!editor) return;
    editor.commands.insertContent(emojiData.emoji);
    editor.commands.focus();
    // Update content state after inserting emoji
    const textContent = editor.getText().trim();
    setHasContent(textContent.length > 0);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
    if (type.startsWith("video/")) return <Video className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Determine if send button should be enabled
  const isSendEnabled = hasContent || attachments.length > 0;

  // Get attachments in reverse order (last sent first)
  const reversedAttachments = [...attachments].reverse();

  return (
    <motion.div
      className="mt-auto flex flex-col border-t"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
          user-select: none;
        }
      `}</style>

      {/* Edit Mode Indicator */}
      <AnimatePresence mode="wait">
        {editingMessage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <motion.div
              className="flex items-center gap-2 border-b border-l-4 border-l-blue-500 bg-blue-50 px-4 py-2 dark:bg-blue-950/30"
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
                  Editing message
                </p>
                <p className="truncate text-xs text-blue-700 dark:text-blue-300">
                  {editingMessage.message}
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={onCancelEdit}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply Preview */}
      <AnimatePresence mode="wait">
        {replyingTo && !editingMessage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <motion.div
              className="flex items-center gap-2 border-b border-l-4 border-l-primary bg-muted/50 px-4 py-2"
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-medium text-foreground">
                  Replying to {replyingTo.sender}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {replyingTo.message}
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={onCancelReply}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachments Preview - Hide when editing */}
      <AnimatePresence mode="wait">
        {attachments.length > 0 && !editingMessage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="no-scrollbar flex gap-2 overflow-x-auto border-b p-2">
              <AnimatePresence>
                {reversedAttachments.map((file, reversedIndex) => {
                  const originalIndex = attachments.length - 1 - reversedIndex;
                  const previewKey = `${originalIndex}-${file.name}`;
                  const isImage = file.type.startsWith("image/");
                  const previewUrl = imagePreviews[previewKey];

                  return (
                    <motion.div
                      key={previewKey}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: reversedIndex * 0.05,
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
                      className={`flex items-center gap-2 rounded-md border bg-muted px-2 py-1.5 ${
                        isImage ? "flex-row" : ""
                      }`}
                      whileHover={{ scale: 1.02 }}
                    >
                      {isImage && previewUrl ? (
                        <motion.div
                          initial={{ rotate: -180, scale: 0 }}
                          animate={{ rotate: 0, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className="h-10 w-10 shrink-0 overflow-hidden rounded border"
                        >
                          <Image
                            src={previewUrl}
                            alt={file.name}
                            className="h-full w-full object-cover"
                            width={40}
                            height={40}
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ rotate: -180 }}
                          animate={{ rotate: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {getFileIcon(file.type)}
                        </motion.div>
                      )}
                      <div className="flex flex-col">
                        <span className="max-w-[150px] truncate text-xs font-medium">
                          {file.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                      <motion.button
                        onClick={() => removeAttachment(originalIndex)}
                        className="ml-1 rounded-sm p-0.5 hover:bg-background"
                        disabled={disabled}
                        whileHover={{ scale: 1.2, rotate: 90 }}
                        whileTap={{ scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <X className="h-3 w-3" />
                      </motion.button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <motion.div
        className={`relative flex items-center gap-1 rounded-lg bg-background p-2 dark:bg-[#121212] ${
          isDragging && !editingMessage ? "ring-2 ring-primary" : ""
        } ${disabled ? "pointer-events-none opacity-60" : ""}`}
        onDragEnter={editingMessage ? undefined : handleDragEnter}
        onDragLeave={editingMessage ? undefined : handleDragLeave}
        onDragOver={editingMessage ? undefined : handleDragOver}
        onDrop={editingMessage ? undefined : handleDrop}
        animate={isDragging && !editingMessage ? { scale: 1.02 } : { scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence>
          {isDragging && !editingMessage && (
            <motion.div
              className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-primary/10 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <motion.p
                className="text-sm font-medium text-primary"
                initial={{ y: 10 }}
                animate={{ y: 0 }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                Drop files here to attach
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="min-h-[20px] w-full" onKeyDown={handleKeyDown}>
          <EditorContent editor={editor} />
        </div>

        <div className="flex items-center gap-1">
          <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
            <PopoverTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  type="button"
                  disabled={disabled}
                >
                  <motion.div
                    animate={
                      isEmojiPickerOpen ? { rotate: 180 } : { rotate: 0 }
                    }
                    transition={{ duration: 0.3 }}
                  >
                    <Smile className="h-5 w-5" />
                  </motion.div>
                </Button>
              </motion.div>
            </PopoverTrigger>
            <PopoverContent
              className="w-full border-0 p-0"
              side="top"
              align="end"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
                  width="100%"
                  height={400}
                  searchPlaceHolder="Search emoji..."
                  previewConfig={{ showPreview: false }}
                />
              </motion.div>
            </PopoverContent>
          </Popover>

          {/* Hide attachment button when editing */}
          {!editingMessage && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                disabled={disabled}
              />

              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                >
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PaperclipIcon className="h-5 w-5" />
                  </motion.div>
                </Button>
              </motion.div>
            </>
          )}

          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleSend}
              type="button"
              disabled={disabled || !isSendEnabled}
            >
              {disabled ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : editingMessage ? (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Edit className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  <SendHorizontal className="h-5 w-5" />
                </motion.div>
              )}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChatInput;
