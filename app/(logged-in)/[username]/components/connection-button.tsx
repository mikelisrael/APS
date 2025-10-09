"use client";

import { Button } from "@/components/ui/button";
import { useConnectionStatus } from "@/hooks/use-connections";
import {
  Check,
  Clock,
  LoaderCircle,
  MessageCircle,
  UserRoundPlus,
  X
} from "lucide-react";

const ConnectionButton = ({ userId }: { userId: string }) => {
  const {
    status,
    isLoading,
    isReceiver,
    isRequester,
    sendRequest,
    acceptConnectionRequest,
    rejectConnectionRequest
  } = useConnectionStatus(userId);

  if (isLoading) {
    return <LoaderCircle size={20} className="animate-spin" />;
  }

  if (status === "accepted") {
    return (
      <Button size="sm">
        <MessageCircle className="mr-2 h-4 w-4" />
        Message
      </Button>
    );
  }

  if (status === "pending") {
    if (isReceiver) {
      return (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="default" onClick={acceptConnectionRequest}>
            <Check className="mr-2 h-4 w-4" strokeWidth={2} />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-600 text-red-600 dark:border-red-500 dark:text-red-500"
            onClick={rejectConnectionRequest}
          >
            <X className="mr-2 h-4 w-4" strokeWidth={2} />
            Reject
          </Button>
        </div>
      );
    }

    if (isRequester) {
      return (
        <Button size="sm" variant="secondary" disabled>
          <Clock className="mr-2 h-4 w-4" />
          Pending Request
        </Button>
      );
    }
  }

  if (status === "rejected") {
    return (
      <Button size="sm" onClick={sendRequest}>
        <UserRoundPlus className="mr-2 h-4 w-4" />
        Connect
      </Button>
    );
  }

  return (
    <Button size="sm" onClick={sendRequest}>
      <UserRoundPlus className="mr-2 size-4" />
      Connect
    </Button>
  );
};
export default ConnectionButton;
