/**
 * Notifications Management Hook
 *
 * Manages notification history, read/unread state, and persistence
 * Integrates with browser notifications when appropriate
 *
 * Phase 4 - ENG-013
 */
import type { Notification } from "~/components/notifications/NotificationCenter";
export declare function useNotifications(): {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notif: Omit<Notification, "id" | "timestamp" | "read">) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
    isOpen: boolean;
    toggleOpen: () => void;
    close: () => void;
    browserNotifications: {
        isSupported: boolean;
        permission: NotificationPermission;
        requestPermission: () => Promise<any>;
        showNotification: (title: string, options?: NotificationOptions) => any;
        showApprovalNotification: (count: number, playSound?: boolean) => void;
    };
};
//# sourceMappingURL=useNotifications.d.ts.map