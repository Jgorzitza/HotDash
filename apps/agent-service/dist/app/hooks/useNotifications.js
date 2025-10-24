/**
 * Notifications Management Hook
 *
 * Manages notification history, read/unread state, and persistence
 * Integrates with browser notifications when appropriate
 *
 * Phase 4 - ENG-013
 */
import { useState, useCallback, useEffect } from "react";
import { useBrowserNotifications } from "./useBrowserNotifications";
const STORAGE_KEY = "hotdash-notifications";
const MAX_NOTIFICATIONS = 50;
export function useNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const browserNotifications = useBrowserNotifications();
    // Load notifications from localStorage on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    setNotifications(JSON.parse(stored));
                }
            }
            catch (error) {
                console.error("Failed to load notifications from storage:", error);
            }
        }
    }, []);
    // Save notifications to localStorage whenever they change
    useEffect(() => {
        if (typeof window !== "undefined" && notifications.length > 0) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
            }
            catch (error) {
                console.error("Failed to save notifications to storage:", error);
            }
        }
    }, [notifications]);
    const addNotification = useCallback((notif) => {
        const newNotification = {
            ...notif,
            id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            timestamp: new Date().toISOString(),
            read: false,
        };
        setNotifications((prev) => {
            const updated = [newNotification, ...prev];
            // Keep only last MAX_NOTIFICATIONS
            return updated.slice(0, MAX_NOTIFICATIONS);
        });
        // Show browser notification if permission granted and tab hidden
        if (document.hidden && browserNotifications.permission === "granted") {
            browserNotifications.showNotification(notif.title, {
                body: notif.message,
            });
        }
    }, [browserNotifications]);
    const markAsRead = useCallback((id) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    }, []);
    const markAllAsRead = useCallback(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }, []);
    const clearAll = useCallback(() => {
        setNotifications([]);
        if (typeof window !== "undefined") {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);
    const unreadCount = notifications.filter((n) => !n.read).length;
    const toggleOpen = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);
    const close = useCallback(() => {
        setIsOpen(false);
    }, []);
    return {
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        isOpen,
        toggleOpen,
        close,
        browserNotifications,
    };
}
//# sourceMappingURL=useNotifications.js.map