"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { useUserChats } from "@/hooks/use-chats";
import { useAuth } from "@/hooks/use-query-resource";
import { cn } from "@/lib/utils";
import Logo from "@/public/main-logo.svg";
import { Chat } from "@/services/chats.service";
import { Ellipsis } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import TransitionLink from "../shared/transition-link";
import UserAvatar from "../shared/user-avatar";
import { Button } from "../ui/button";
import LightDarkSwitch from "./light-dark-switch";
import { navigationItems } from "./navigation-items";

const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout, isLoggingOut } = useAuth();
  const { data: chats } = useUserChats();

  const isActive = (href: string) => {
    const hrefPath = href.split("?")[0];

    if (hrefPath === "/" && pathname === "/") {
      return true;
    }

    if (hrefPath !== "/" && pathname.startsWith(hrefPath)) {
      return true;
    }

    return false;
  };

  // Calculate badge counts for different navigation items
  const badgeCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    // Calculate unread chats count
    const unreadChatsCount =
      chats?.reduce(
        (total: number, chat: Chat) => total + (chat.unread_count || 0),
        0
      ) || 0;

    counts["/chat"] = unreadChatsCount;

    // Add more badge counts here for other routes as needed
    // counts["/connections"] = someConnectionCount;
    // counts["/notifications"] = someNotificationCount;

    return counts;
  }, [chats]);

  const firstName = user?.user_metadata?.first_name || "";
  const lastName = user?.user_metadata?.last_name || "";
  const username = user?.user_metadata?.username || "";
  const email = user?.email || "";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <aside className="sticky top-0 hidden h-dvh flex-col border-r py-10 ~pr-2/5 sm:flex">
      <div className="flex items-center gap-3 px-3">
        <Logo className="size-8 text-primary" />
        <h2 className="hidden text-xl font-bold xl:inline-block">UICS</h2>
      </div>
      <ul className="mt-5">
        {navigationItems.map((item, index) => {
          const { Icon, title, href, showBadge } = item;
          const isLinkActive = isActive(href);
          const Component = isLinkActive ? "span" : TransitionLink;
          const badgeCount = badgeCounts[href] || 0;
          const shouldShowBadge = showBadge && badgeCount > 0 && !isLinkActive;

          return (
            <li key={index}>
              <Component
                className={cn(
                  "flex-center relative w-full !justify-start gap-4 rounded-full px-5 py-3 text-lg font-normal transition-colors duration-200 hover:bg-accent hover:text-accent-foreground",
                  isLinkActive &&
                    "cursor-default font-medium text-primary hover:bg-transparent hover:text-primary"
                )}
                href={href}
              >
                <div className="relative">
                  <Icon
                    fill={isLinkActive ? "hsl(var(--primary))" : "transparent"}
                  />
                  {shouldShowBadge && (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  )}
                </div>
                <span className="hidden xl:inline-block">{title}</span>
              </Component>
            </li>
          );
        })}
      </ul>

      <Popover>
        <PopoverTrigger className="flex-center mt-auto justify-between gap-2 rounded-full px-2 py-3 hover:bg-accent hover:text-accent-foreground">
          <UserAvatar
            src={user?.user_metadata?.avatar_url}
            fallback={initials}
          />

          <div className="hidden flex-1 text-left xl:inline-block">
            <h3 className="line-clamp-1 break-all font-semibold tracking-tight">
              {firstName} {lastName}
            </h3>
            <span className="line-clamp-1 -translate-y-0.5 break-all text-xs text-muted-foreground">
              {username ? "@" + username : email}
            </span>
          </div>
          <Ellipsis className="hidden size-5 text-muted-foreground xl:inline-block" />
        </PopoverTrigger>

        <PopoverContent className="space-y-2 text-sm">
          <LightDarkSwitch />
          <Button
            variant="destructive"
            className="line-clamp-1 w-full break-all"
            onClick={() => logout(undefined)}
            disabled={isLoggingOut}
          >
            {isLoggingOut
              ? "Logging out..."
              : `Log out ${username ? "@" + username : ""}`}
          </Button>
        </PopoverContent>
      </Popover>
    </aside>
  );
};

export default Sidebar;
