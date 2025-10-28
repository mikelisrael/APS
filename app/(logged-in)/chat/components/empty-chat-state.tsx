"use client";

import emptyAnimation from "@/public/animations/messageLoading.json";
import Lottie from "lottie-react";

const EmptyChatState = () => {
  return (
    <div className="flex h-full items-center justify-center border-l px-4 text-sm">
      <div className="flex max-w-md flex-col items-center text-center">
        <Lottie
          animationData={emptyAnimation}
          loop={true}
          autoplay={true}
          style={{ width: 100, height: 100 }}
        />

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
