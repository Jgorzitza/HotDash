/**
 * Browser Notifications Hook
 * 
 * Manages desktop notifications for:
 * - New approvals requiring action
 * - Critical system alerts
 * - Important updates
 * 
 * Features:
 * - Permission request handling
 * - Desktop notifications (when tab hidden)
 * - Sound support (configurable)
 * - Persistent until clicked
 * 
 * Phase 4 - ENG-013
 */

import { useState, useEffect, useCallback } from "react";

export function useBrowserNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      console.warn("Browser notifications not supported");
      return "denied";
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error("Failed to request notification permission:", error);
      return "denied";
    }
  }, [isSupported]);

  const showNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!isSupported) {
        console.warn("Browser notifications not supported");
        return null;
      }

      if (permission !== "granted") {
        console.warn("Browser notification permission not granted");
        return null;
      }

      try {
        const notification = new Notification(title, {
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: "hotdash-notification",
          requireInteraction: true, // Stays until clicked
          ...options,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        return notification;
      } catch (error) {
        console.error("Failed to show notification:", error);
        return null;
      }
    },
    [isSupported, permission],
  );

  const showApprovalNotification = useCallback(
    (count: number) => {
      if (document.hidden) {
        // Only show when tab is hidden
        showNotification("New Approvals", {
          body: `${count} new approval${count > 1 ? "s" : ""} need your review`,
          tag: "approvals",
        });
      }
    },
    [showNotification],
  );

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    showApprovalNotification,
  };
}

