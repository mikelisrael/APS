/**
 * Notification Service
 * Handles Web Notifications API for push notifications
 */

export interface NotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  tag?: string;
  badge?: string;
  onclick?: () => void;
}

/**
 * Convert image URL to circular image using Canvas
 * Returns a data URL of the circular image
 */
export const makeCircularImage = async (imageUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 256; // Size of circular image
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(imageUrl); // Fallback to original if canvas fails
        return;
      }

      // Create circular clipping path
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();

      // Draw image centered and scaled to fill circle
      const scale = Math.max(size / img.width, size / img.height);
      const x = (size - img.width * scale) / 2;
      const y = (size - img.height * scale) / 2;

      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      // Return the canvas as a data URL
      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = () => {
      resolve(imageUrl); // Fallback to original if image fails to load
    };

    img.src = imageUrl;
  });
};

/**
 * Request notification permission from user
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

/**
 * Send a push notification
 */
export const sendPushNotification = (
  options: NotificationOptions
): Notification | null => {
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications");
    return null;
  }

  if (Notification.permission !== "granted") {
    console.warn("Notification permission not granted");
    return null;
  }

  const notif = new Notification(options.title, {
    body: options.body,
    icon: options.icon,
    tag: options.tag, // Prevents duplicate notifications
    badge: options.badge
  });

  if (options.onclick) {
    notif.onclick = () => {
      window.focus();
      options.onclick?.();
      notif.close();
    };
  }

  return notif;
};

/**
 * Send chat message notification
 */
export const sendChatMessageNotification = async (
  senderName: string,
  messagePreview: string,
  chatId: string,
  senderAvatar?: string,
  onNotificationClick?: () => void
): Promise<Notification | null> => {
  // Truncate message preview to 60 chars
  const truncatedMessage =
    messagePreview.length > 60
      ? messagePreview.substring(0, 60) + "..."
      : messagePreview;

  // Convert avatar to circular image if available
  let circularAvatar = senderAvatar;
  if (senderAvatar) {
    try {
      circularAvatar = await makeCircularImage(senderAvatar);
    } catch (error) {
      console.error("Error creating circular image:", error);
      circularAvatar = senderAvatar; // Fallback to original
    }
  }

  return sendPushNotification({
    title: `${senderName}`,
    body: truncatedMessage,
    icon: circularAvatar,
    tag: `chat-${chatId}`, // Groups notifications by chat
    onclick: onNotificationClick
  });
};

/**
 * Check if user is currently viewing the tab
 */
export const isWindowFocused = (): boolean => {
  return typeof document !== "undefined" && document.hasFocus();
};

/**
 * Send notification only if window is not focused
 */
export const sendNotificationIfBgd = async (
  senderName: string,
  messagePreview: string,
  chatId: string,
  senderAvatar?: string,
  onNotificationClick?: () => void
): Promise<Notification | null> => {
  if (isWindowFocused()) {
    return null; // Don't show if user is already viewing the window
  }

  return sendChatMessageNotification(
    senderName,
    messagePreview,
    chatId,
    senderAvatar,
    onNotificationClick
  );
};
