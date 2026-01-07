"use client";

import {
  useGlobalChatNotifications,
  useNotificationPermission
} from "@/hooks/use-notifications";
import { PropsWithChildren } from "react";

/**
 * Component to initialize push notifications
 * Wraps the app and sets up global notification listeners
 */
export function PushNotificationProvider({ children }: PropsWithChildren) {
  // Request notification permission on app load
  useNotificationPermission();

  // Listen for all incoming messages and send notifications
  useGlobalChatNotifications();

  return children;
}
