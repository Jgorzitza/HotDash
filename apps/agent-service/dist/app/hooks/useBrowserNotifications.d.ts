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
export declare function useBrowserNotifications(): {
    isSupported: boolean;
    permission: NotificationPermission;
    requestPermission: () => Promise<any>;
    showNotification: (title: string, options?: NotificationOptions) => any;
    showApprovalNotification: (count: number, playSound?: boolean) => void;
};
//# sourceMappingURL=useBrowserNotifications.d.ts.map