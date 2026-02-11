"use client";

import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-query-resource";
import { PostKind } from "@/services/posts.service";
import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import {
  BriefcaseBusiness,
  CalendarPlus,
  Image,
  Newspaper,
  PlusIcon
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useInView } from "react-intersection-observer";
import PostComposer from "./post-composer";

const NewPost = () => {
  const { user } = useAuth();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState<PostKind>("post");
  const [triggerMediaUpload, setTriggerMediaUpload] = useState(false);
  const { ref: posterRef, inView } = useInView();

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
    <LazyMotion features={domAnimation}>
      <header ref={posterRef} id="new-post-section" className="px-3 md:~px-2/5">
        <div className="flex-center gap-3 md:gap-5">
          <UserAvatar
            src={user?.user_metadata?.avatar_url}
            alt={fullname || "User Avatar"}
            className="h-10 w-10"
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

        <div className="mt-2 grid grid-cols-4 gap-1 md:flex md:justify-center md:gap-0">
          {quickActions.map((action) => {
            const { icon: Icon, text, color, type, href, isMedia } = action;

            if (href) {
              return (
                <Button
                  variant="ghost"
                  className="h-auto flex-col gap-1 whitespace-normal py-2 md:w-full md:flex-row md:gap-2 md:py-3"
                  key={text}
                  asChild
                >
                  <Link href={href}>
                    <Icon
                      className={`h-5 w-5 ${color} md:mr-2 md:h-4 md:w-4`}
                    />
                    <span className="text-[10px] md:hidden md:text-sm">
                      {text}
                    </span>
                    <span className="hidden md:inline-block">{text}</span>
                  </Link>
                </Button>
              );
            }

            return (
              <Button
                variant="ghost"
                className="h-auto flex-col gap-1 whitespace-normal py-2 md:w-full md:flex-row md:gap-2 md:py-3"
                key={text}
                onClick={() => handleQuickAction(type, isMedia)}
              >
                <Icon className={`h-5 w-5 ${color} md:mr-2 md:h-4 md:w-4`} />
                <span className="text-[10px] md:hidden md:text-sm">{text}</span>
                <span className="hidden md:inline-block">{text}</span>
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

      <AnimatePresence initial={false} mode="popLayout">
        {!inView && (
          <m.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-32 right-4 z-50 md:hidden"
          >
            <Button
              onClick={handleOpenComposer}
              size="icon"
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="h-6 w-6" />
            </Button>
          </m.div>
        )}
      </AnimatePresence>
    </LazyMotion>
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
