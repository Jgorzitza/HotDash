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
/**
 * Check if browser supports notifications
 */
export declare function isNotificationSupported(): boolean;
/**
 * Get current notification permission status
 */
export declare function getNotificationPermission(): NotificationPermission;
/**
 * Request notification permission from user
 *
 * @returns Promise resolving to permission status
 */
export declare function requestNotificationPermission(): Promise<NotificationPermission>;
/**
 * Show a desktop notification
 *
 * @param options - Notification options
 * @returns Notification instance or null
 */
export declare function showNotification(options: NotificationOptions): Notification | null;
/**
 * Show notification for new approval
 *
 * @param count - Number of new approvals
 * @param onClick - Callback when notification is clicked
 */
export declare function notifyNewApprovals(count: number, onClick?: () => void): void;
/**
 * Show notification for inventory alert
 *
 * @param sku - SKU with low stock
 * @param onClick - Callback when notification is clicked
 */
export declare function notifyInventoryAlert(sku: string, onClick?: () => void): void;
/**
 * Show notification for sales milestone
 *
 * @param message - Sales message
 * @param onClick - Callback when notification is clicked
 */
export declare function notifySalesMilestone(message: string, onClick?: () => void): void;
/**
 * Get notification preferences from localStorage
 */
export declare function getNotificationPreferences(): NotificationPreferences;
/**
 * Save notification preferences to localStorage
 *
 * @param preferences - Preferences to save
 */
export declare function saveNotificationPreferences(preferences: Partial<NotificationPreferences>): void;
/**
 * Clear all notification preferences
 */
export declare function clearNotificationPreferences(): void;
/**
 * Play notification sound
 *
 * @param soundUrl - URL to sound file (optional)
 */
export declare function playNotificationSound(soundUrl?: string): void;
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
//# sourceMappingURL=notifications.client.d.ts.map