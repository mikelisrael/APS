"use client";

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
import {getInitials} from '@/lib/utils';

const NewPost = () => {
  const { user } = useAuth();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState<PostKind>("post");

  const fullname = user?.user_metadata?.full_name;
  const abbr = getInitials(fullname || "User");

  const handleQuickAction = (type: PostKind) => {
    setSelectedPostType(type);
    setIsComposerOpen(true);
  };

  const handleOpenComposer = () => {
    setSelectedPostType("post");
    setIsComposerOpen(true);
  };

  return (
    <>
      <header className="~px-2/5">
        <div className="flex-center gap-5">
          <UserAvatar
            src={user?.user_metadata?.avatar_url}
            alt={fullname || "User Avatar"}
            fallback={abbr}
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
          {quickActions.map((action, index) => {
            const { icon: Icon, text, color, type } = action;
            return (
              <Button
                variant="ghost"
                className="w-full whitespace-normal"
                key={index}
                onClick={() => handleQuickAction(type)}
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
    type: "post" as PostKind
  },
  {
    icon: BriefcaseBusiness,
    text: "Job",
    color: "text-red-400",
    type: "post" as PostKind
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
