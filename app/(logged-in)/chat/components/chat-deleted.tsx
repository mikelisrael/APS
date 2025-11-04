import { Button } from "@/components/ui/button";
import { MessageCircleOff, MessageCirclePlus, ArrowLeft } from "lucide-react";

export const ChatDeletedEmptyState = () => {
  return (
    <section className="flex-center h-full flex-col border-l text-sm">
      <div className="flex max-w-md flex-col items-center p-8 text-center">
        <div className="mb-4 rounded-full bg-muted p-6">
          <MessageCircleOff className="h-12 w-12 text-muted-foreground" />
        </div>

        <h3 className="mb-2 text-xl font-semibold">
          This chat has been deleted
        </h3>

        <p className="mb-6 text-sm text-muted-foreground">
          This conversation is no longer available. You can start a new one with
          them.
        </p>
      </div>
    </section>
  );
};

export default ChatDeletedEmptyState;
