# Push Notifications Implementation Guide

## Overview

Every incoming message now triggers a push notification automatically. The system is designed to:

- Request user permission on app load
- Send browser notifications for incoming messages
- Only notify when the app is in the background
- Group notifications by chat (preventing spam)
- Navigate to chat when notification is clicked

## How It Works

### 1. **Notification Service** (`services/notifications.service.ts`)

Core service that handles Web Notifications API:

- `requestNotificationPermission()` - Requests browser notification permission
- `sendPushNotification()` - Sends a notification
- `sendChatMessageNotification()` - Specialized for chat messages
- `sendNotificationIfBgd()` - Only sends if window is not in focus

### 2. **Notification Hooks** (`hooks/use-notifications.ts`)

React hooks for notification management:

#### `useNotificationPermission()`

- Requests notification permission when app loads
- Called automatically via NotificationProvider

#### `useChatNotifications(chatId, receiverName?)`

- Listens for messages in a specific chat
- Sends notifications only for messages from OTHER users
- Useful if you want per-chat notification control

#### `useGlobalChatNotifications()`

- **The main hook** - Listens for ALL incoming messages
- Automatically sends notifications for messages to the current user
- Active globally across the app
- Handles navigation when notification is clicked

### 3. **Notification Provider** (`components/providers/notifications-provider.tsx`)

Client component that:

- Initializes notification permission request
- Activates global message listener
- Wrapped in main Providers component

## Features

### ✅ What's Included

- Browser push notifications for every incoming message
- Smart notification grouping (prevents duplicate notifications for same chat)
- Automatic navigation to chat when notification is clicked
- Window focus detection (no notifications if user is viewing the app)
- Sender avatar in notification (when available)
- Message preview truncated to 60 characters
- Works in background/minimized state

### 🔧 Customization Options

#### Change notification behavior globally:

```typescript
// In notifications.service.ts, modify sendChatMessageNotification():
export const sendChatMessageNotification = (
  senderName: string,
  messagePreview: string,
  chatId: string,
  senderAvatar?: string,
  onNotificationClick?: () => void
): Notification | null => {
  // Customize here - add sounds, change behavior, etc.
  return sendPushNotification({
    title: `${senderName}`,
    body: truncatedMessage,
    icon: senderAvatar,
    tag: `chat-${chatId}`,
    onclick: onNotificationClick
  });
};
```

#### Enable per-chat notifications instead of global:

```typescript
// In your chat component, replace useGlobalChatNotifications with:
useChatNotifications(chatId, receiverName);
```

#### Disable notifications for background-only:

```typescript
// In hooks/use-notifications.ts, change:
sendNotificationIfBgd(...) // Only when in background

// To always notify:
sendChatMessageNotification(...) // Always notify
```

## Browser Compatibility

| Browser     | Support    | Notes               |
| ----------- | ---------- | ------------------- |
| Chrome/Edge | ✅ Full    | Fully supported     |
| Firefox     | ✅ Full    | Fully supported     |
| Safari      | ⚠️ Limited | Limited to PWA mode |
| Opera       | ✅ Full    | Fully supported     |

## User Permissions

Users will see a browser permission prompt on first visit:

- **Allow** - Notifications will be sent
- **Block** - No notifications (can be re-enabled in browser settings)
- **Dismiss** - Permission request appears again next visit

## Testing Notifications

### In Development:

1. Open your app
2. Click "Allow" on the notification permission prompt
3. Open a new chat in another browser tab/window
4. Send a message
5. You should see a notification appear

### In Production:

- Same steps, but deployed version must be on HTTPS
- Service Workers require secure context (HTTPS)

## Advanced: Custom Notification Actions

To add more features (sound, custom actions, etc.):

```typescript
// Modify sendPushNotification() in services/notifications.service.ts:
export const sendPushNotification = (
  options: NotificationOptions
): Notification | null => {
  const notif = new Notification(options.title, {
    body: options.body,
    icon: options.icon,
    tag: options.tag,
    badge: options.badge,
    // Add these:
    sound: "/notification-sound.mp3", // Add custom sound
    requireInteraction: true, // Keep notification until user acts
    actions: [
      { action: "reply", title: "Reply" },
      { action: "close", title: "Close" }
    ]
  });

  return notif;
};
```

## Files Modified/Created

### New Files:

- `services/notifications.service.ts` - Core notification service
- `hooks/use-notifications.ts` - React hooks for notifications
- `components/providers/notifications-provider.tsx` - Provider component

### Modified Files:

- `components/providers/providers.tsx` - Added NotificationProvider

## Troubleshooting

### Notifications not appearing?

1. Check browser notification settings (chrome://settings/content/notifications)
2. Ensure app is not focused (notifications only show when in background)
3. Check browser console for permission errors
4. Verify HTTPS in production

### Duplicate notifications?

- `tag` property prevents this automatically
- Each chat has unique tag: `chat-${chatId}`

### Want to disable notifications?

- Remove `useGlobalChatNotifications()` from NotificationProvider
- Or remove `<NotificationProvider>` from Providers component

## Future Enhancements

Consider adding:

- Notification sound on incoming message
- Badge count on app icon
- Notification categories (mentions, direct messages, etc.)
- User notification preferences (mute specific chats)
- Service Worker integration for even better background handling
