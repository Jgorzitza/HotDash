/**
 * Notification Center Component
 *
 * Slide-out panel showing notification history:
 * - Grouped by date (Today, Yesterday, Earlier)
 * - Mark as read/unread
 * - "Mark all as read" action
 * - Links to relevant pages
 * - Accessible (keyboard navigation, ARIA)
 *
 * Phase 4 - ENG-013
 */
export interface Notification {
    id: string;
    type: "approval" | "action" | "alert" | "info";
    title: string;
    message: string;
    url?: string;
    timestamp: string;
    read: boolean;
}
interface NotificationCenterProps {
    open: boolean;
    onClose: () => void;
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
}
export declare function NotificationCenter({ open, onClose, notifications, onMarkAsRead, onMarkAllAsRead, }: NotificationCenterProps): React.JSX.Element;
export {};
//# sourceMappingURL=NotificationCenter.d.ts.map