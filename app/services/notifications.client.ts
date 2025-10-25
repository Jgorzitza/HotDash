/**
 * Browser Notifications Service (Client-side)
 * 
 * ENG-071: Browser Notifications Implementation
 * 
 * Provides desktop notifications using the Web Notifications API.
 * Supports permission requests, sound options, and works when tab is hidden.
 * 
 * Features:
 * - Request notification permission
 * - Desktop notifications for new approvals
 * - Sound option (configurable)
 * - Works when tab is hidden
 * - Notification preferences management
 */

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  data?: unknown;
  onClick?: () => void;
}

export interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  approvals: boolean;
  inventory: boolean;
  sales: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  sound: true,
  approvals: true,
  inventory: true,
  sales: true,
};

const PREFERENCES_KEY = "hotdash_notification_preferences";

/**
 * Check if browser supports notifications
 */
export function isNotificationSupported(): boolean {
  return "Notification" in window;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return "denied";
  }
  return Notification.permission;
}

/**
 * Request notification permission from user
 * 
 * @returns Promise resolving to permission status
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    console.warn("Notifications not supported in this browser");
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return "denied";
  }
}

/**
 * Show a desktop notification
 * 
 * @param options - Notification options
 * @returns Notification instance or null
 */
export function showNotification(options: NotificationOptions): Notification | null {
  if (!isNotificationSupported()) {
    console.warn("Notifications not supported");
    return null;
  }

  if (Notification.permission !== "granted") {
    console.warn("Notification permission not granted");
    return null;
  }

  const preferences = getNotificationPreferences();
  if (!preferences.enabled) {
    return null;
  }

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || "/icon-192.png",
      badge: options.badge || "/icon-96.png",
      tag: options.tag,
      requireInteraction: options.requireInteraction ?? false,
      silent: options.silent ?? !preferences.sound,
      data: options.data,
    });

    if (options.onClick) {
      notification.onclick = () => {
        window.focus();
        options.onClick?.();
        notification.close();
      };
    }

    // Auto-close after 10 seconds if not requireInteraction
    if (!options.requireInteraction) {
      setTimeout(() => {
        notification.close();
      }, 10000);
    }

    return notification;
  } catch (error) {
    console.error("Error showing notification:", error);
    return null;
  }
}

/**
 * Show notification for new approval
 * 
 * @param count - Number of new approvals
 * @param onClick - Callback when notification is clicked
 */
export function notifyNewApprovals(count: number, onClick?: () => void): void {
  const preferences = getNotificationPreferences();
  if (!preferences.approvals) {
    return;
  }

  showNotification({
    title: "New Approvals",
    body: `${count} ${count === 1 ? "approval" : "approvals"} pending review`,
    tag: "approvals",
    requireInteraction: true,
    onClick: onClick || (() => {
      window.location.href = "/approvals";
    }),
  });
}

/**
 * Show notification for inventory alert
 * 
 * @param sku - SKU with low stock
 * @param onClick - Callback when notification is clicked
 */
export function notifyInventoryAlert(sku: string, onClick?: () => void): void {
  const preferences = getNotificationPreferences();
  if (!preferences.inventory) {
    return;
  }

  showNotification({
    title: "Inventory Alert",
    body: `Low stock alert for ${sku}`,
    tag: "inventory",
    onClick: onClick || (() => {
      window.location.href = "/inventory";
    }),
  });
}

/**
 * Show notification for sales milestone
 * 
 * @param message - Sales message
 * @param onClick - Callback when notification is clicked
 */
export function notifySalesMilestone(message: string, onClick?: () => void): void {
  const preferences = getNotificationPreferences();
  if (!preferences.sales) {
    return;
  }

  showNotification({
    title: "Sales Milestone",
    body: message,
    tag: "sales",
    onClick,
  });
}

/**
 * Get notification preferences from localStorage
 */
export function getNotificationPreferences(): NotificationPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (!stored) {
      return DEFAULT_PREFERENCES;
    }

    const preferences = JSON.parse(stored) as NotificationPreferences;
    return { ...DEFAULT_PREFERENCES, ...preferences };
  } catch (error) {
    console.error("Error loading notification preferences:", error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Save notification preferences to localStorage
 * 
 * @param preferences - Preferences to save
 */
export function saveNotificationPreferences(preferences: Partial<NotificationPreferences>): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const current = getNotificationPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving notification preferences:", error);
  }
}

/**
 * Clear all notification preferences
 */
export function clearNotificationPreferences(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(PREFERENCES_KEY);
  } catch (error) {
    console.error("Error clearing notification preferences:", error);
  }
}

/**
 * Play notification sound
 * 
 * @param soundUrl - URL to sound file (optional)
 */
export function playNotificationSound(soundUrl?: string): void {
  const preferences = getNotificationPreferences();
  if (!preferences.sound) {
    return;
  }

  try {
    const audio = new Audio(soundUrl || "/sounds/notification.mp3");
    audio.volume = 0.5;
    audio.play().catch((error) => {
      console.warn("Could not play notification sound:", error);
    });
  } catch (error) {
    console.error("Error playing notification sound:", error);
  }
}

/**
 * Example Usage:
 * 
 * // Request permission on app load
 * await requestNotificationPermission();
 * 
 * // Show notification for new approvals
 * notifyNewApprovals(3, () => {
 *   console.log("User clicked notification");
 * });
 * 
 * // Update preferences
 * saveNotificationPreferences({
 *   sound: false,
 *   approvals: true,
 * });
 * 
 * // Get current preferences
 * const prefs = getNotificationPreferences();
 * console.log(prefs);
 */

