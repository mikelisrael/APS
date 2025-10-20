import { Button } from "@/components/ui/button";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { PaperclipIcon, SendHorizontal, Smile } from "lucide-react";

interface ChatInputProps {
  onSend: (content: string) => void;
}

const ChatInput = ({ onSend }: ChatInputProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Type a message",
        emptyEditorClass: "is-editor-empty"
      })
    ],
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-sm p-4 focus:outline-none max-h-[120px] overflow-y-auto thin-scrollbar"
      }
    }
  });

  const handleSend = () => {
    if (!editor) return;

    const content = editor.getHTML();
    if (content === "<p></p>" || !content.trim()) return;

    onSend(content);
    editor.commands.clearContent();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="mt-auto flex flex-col border-t">
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
      <div className="relative flex items-center gap-1 rounded-lg bg-background p-2">
        <div className="min-h-[20px] w-full" onKeyDown={handleKeyDown}>
          <EditorContent editor={editor} />
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            type="button"
          >
            <Smile className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            type="button"
          >
            <PaperclipIcon className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleSend}
            type="button"
          >
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
