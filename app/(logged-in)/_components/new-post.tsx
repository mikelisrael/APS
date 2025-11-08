"use client";

import TransitionLink from "@/components/shared/transition-link";
import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-query-resource";
import { PostKind } from "@/services/posts.service";
import {
  BriefcaseBusiness,
  CalendarPlus,
  Image,
  Newspaper
} from "lucide-react";
import { useState } from "react";
import PostComposer from "./post-composer";

const NewPost = () => {
  const { user } = useAuth();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState<PostKind>("post");
  const [triggerMediaUpload, setTriggerMediaUpload] = useState(false);

  const fullname = user?.user_metadata?.full_name;

  const handleQuickAction = (type: PostKind, isMedia = false) => {
    setSelectedPostType(type);
    setTriggerMediaUpload(isMedia);
    setIsComposerOpen(true);
  };

  const handleOpenComposer = () => {
    setSelectedPostType("post");
    setTriggerMediaUpload(false);
    setIsComposerOpen(true);
  };

  return (
    <>
      <header className="~px-2/5">
        <div className="flex-center gap-5">
          <UserAvatar
            src={user?.user_metadata?.avatar_url}
            alt={fullname || "User Avatar"}
          />

          <div
            className="h-10 w-full flex-grow cursor-pointer rounded-full border border-input bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent"
            onClick={handleOpenComposer}
          >
            <span className="line-clamp-1">
              Start a post, {`what's`} on your mind?
            </span>
          </div>
        </div>

        <div className="flex-center mt-2 w-full">
          {quickActions.map((action) => {
            const { icon: Icon, text, color, type, href, isMedia } = action;

            if (href) {
              return (
                <Button
                  variant="ghost"
                  className="w-full whitespace-normal"
                  key={text}
                  asChild
                >
                  <TransitionLink href={href}>
                    <Icon className={`mr-2 ${color}`} />
                    <span className="hidden sm:inline-block">{text}</span>
                  </TransitionLink>
                </Button>
              );
            }

            return (
              <Button
                variant="ghost"
                className="w-full whitespace-normal"
                key={text}
                onClick={() => handleQuickAction(type, isMedia)}
              >
                <Icon className={`mr-2 ${color}`} />
                <span className="hidden sm:inline-block">{text}</span>
              </Button>
            );
          })}
        </div>
      </header>

      <PostComposer
        open={isComposerOpen}
        onOpenChange={setIsComposerOpen}
        initialType={selectedPostType}
        triggerMediaUpload={triggerMediaUpload}
        onMediaUploadTriggered={() => setTriggerMediaUpload(false)}
      />
    </>
  );
};

export default NewPost;

const quickActions = [
  {
    icon: Image,
    text: "Media",
    color: "text-blue-400",
    type: "post" as PostKind,
    isMedia: true
  },
  {
    icon: BriefcaseBusiness,
    text: "Job",
    color: "text-red-400",
    type: "post" as PostKind,
    href: "/jobs/new"
  },
  {
    icon: CalendarPlus,
    text: "Event",
    color: "text-pink-400",
    type: "event" as PostKind
  },
  {
    icon: Newspaper,
    text: "Article",
    color: "text-amber-600",
    type: "article" as PostKind
  }
];
