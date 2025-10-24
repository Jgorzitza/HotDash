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
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
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
    (count: number, playSound: boolean = false) => {
      if (document.hidden) {
        // Only show when tab is hidden
        showNotification("New Approvals", {
          body: `${count} new approval${count > 1 ? "s" : ""} need your review`,
          tag: "approvals",
          requireInteraction: true,
        });
        
        // Play sound if enabled
        if (playSound) {
          try {
            // Create a simple beep sound using Web Audio API
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
          } catch (error) {
            console.warn('Could not play notification sound:', error);
          }
        }
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
