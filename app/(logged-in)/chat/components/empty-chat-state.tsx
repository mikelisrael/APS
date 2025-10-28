import { MessageCircle } from "lucide-react";

const EmptyChatState = () => {
  return (
    <div className="flex h-full items-center justify-center bg-background px-4 text-sm">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
          <MessageCircle className="h-10 w-10 text-muted-foreground" />
        </div>

        <h2 className="mb-3 text-2xl font-semibold text-foreground">
          Your Messages
        </h2>

        <p className="text-balance text-muted-foreground">
          Say hello to your connections! Share ideas, collaborate, or just catch
          up. Pick a chat from the sidebar or start a new one to begin the
          conversation.
        </p>
      </div>
    </div>
  );
};

export default EmptyChatState;
