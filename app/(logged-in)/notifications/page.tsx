"use client";

import AnimatedPage from "@/components/shared/animated-components";
import { ICON_MAP, NotificationType } from "./icon-map";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { NotificationSkeletonList } from "./components/notification-skeleton";
import { useEffect, useRef } from "react";
import Link from "next/link";

const NotificationItem = ({
  notification,
  markAsRead
}: {
  notification: any;
  markAsRead: (id: string) => void;
}) => {
  const itemRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    // Auto-mark as read when notification comes into view
    if (!notification.read && itemRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Mark as read after a short delay to ensure user saw it
              setTimeout(() => {
                markAsRead(notification.id);
              }, 500);
              observer.disconnect();
            }
          });
        },
        { threshold: 0.5 } // Trigger when 50% of the item is visible
      );

      observer.observe(itemRef.current);

      return () => observer.disconnect();
    }
  }, [notification.id, notification.read, markAsRead]);

  // Determine the navigation URL
  const getNavigationUrl = () => {
    if (notification.post_id) {
      // Post-related notifications (likes, comments)
      return `/post/${notification.post_id}`;
    } else if (notification.connection_id) {
      // Connection-related notifications
      if (notification.type === "connection" && notification.metadata?.requester_username) {
        // New connection request - go to connections pending tab
        return "/connections?tab=pending";
      } else if (notification.actor?.username) {
        // Accepted connection - go to their profile
        return `/${notification.actor.username}`;
      } else {
        // Fallback to connections page
        return "/connections";
      }
    } else if (notification.actor?.username) {
      // Generic fallback - go to actor's profile
      return `/${notification.actor.username}`;
    }
    return null;
  };

  const { icon: Icon, color } =
    ICON_MAP[notification.type as NotificationType] || ICON_MAP.welcome;

  const navigationUrl = getNavigationUrl();
  const isClickable = !!navigationUrl;

  const content = (
    <>
      <Icon className={`~size-8/12 shrink-0 ${color}`} />
      <div className="flex-grow">
        <h3 className="font-semibold">{notification.title}</h3>
        <p className="text-sm">{notification.message}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true
          })}
        </p>
      </div>
      {!notification.read && (
        <div className="size-2 shrink-0 rounded-full bg-primary" />
      )}
    </>
  );

  if (isClickable && navigationUrl) {
    return (
      <li ref={itemRef}>
        <Link
          href={navigationUrl}
          className={`flex gap-5 px-5 py-4 transition-colors ${
            !notification.read ? "bg-muted/50" : ""
          } hover:bg-muted`}
        >
          {content}
        </Link>
      </li>
    );
  }

  return (
    <li
      ref={itemRef}
      className={`flex gap-5 px-5 py-4 ${!notification.read ? "bg-muted/50" : ""}`}
    >
      {content}
    </li>
  );
};

const Notifications = () => {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications();

  if (isLoading) {
    return (
      <AnimatedPage className="safe-area max-w-2xl px-3 md:px-6">
        <h1 className="page-title">Notifications</h1>
        <NotificationSkeletonList count={8} />
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="safe-area max-w-2xl px-3 md:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="page-title">Notifications</h1>
        {unreadCount > 0 && (
          <Button onClick={() => markAllAsRead()} variant="outline" size="sm">
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="mt-8 text-center text-muted-foreground">
          No notifications yet
        </div>
      ) : (
        <ul className="mt-8 divide-y">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              markAsRead={markAsRead}
            />
          ))}
        </ul>
      )}
    </AnimatedPage>
  );
};

export default Notifications;
