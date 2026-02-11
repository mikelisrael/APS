"use client";

import { useUserChats } from "@/hooks/use-chats";
import { usePendingConnectionsCount } from "@/hooks/use-connections";
import { useUnreadNotificationsCount } from "@/hooks/use-unread-notifications-count";
import { cn } from "@/lib/utils";
import { Chat } from "@/services/chats.service";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { navigationItems } from "../sidebar/navigation-items";

const MobileNavigation = () => {
  const pathname = usePathname();
  const { data: chats } = useUserChats();
  const { data: pendingConnectionsCount = 0 } = usePendingConnectionsCount();
  const unreadNotificationsCount = useUnreadNotificationsCount();

  const isActive = (href: string) => {
    const hrefPath = href.split("?")[0];

    // Handle root path and post paths
    if (hrefPath === "/") {
      return pathname === "/" || pathname.startsWith("/post");
    }

    // Handle other paths
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
    counts["/connections?tab=connections"] = pendingConnectionsCount;
    counts["/notifications"] = unreadNotificationsCount;

    return counts;
  }, [chats, pendingConnectionsCount, unreadNotificationsCount]);

  // Show all navigation items on mobile
  const mobileNavItems = navigationItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-safe sm:hidden">
      <div className="flex overflow-x-auto scrollbar-hide">
        {mobileNavItems.map((item, index) => {
          const { Icon, title, href, showBadge, dynamicHref } = item;
          const badgeCount = badgeCounts[href] || 0;

          const actualHref = dynamicHref ? dynamicHref(badgeCount) : href;
          const isLinkActive = isActive(actualHref);
          const shouldShowBadge = showBadge && badgeCount > 0;

          return (
            <Link
              key={index}
              href={actualHref}
              className={cn(
                "flex min-w-[80px] flex-col items-center justify-center gap-1 py-3 transition-colors",
                isLinkActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon
                  className="h-6 w-6"
                  fill={isLinkActive ? "hsl(var(--primary))" : "transparent"}
                />
                {shouldShowBadge && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;
