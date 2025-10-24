/**
 * Toast Notification Hook (Enhanced for Phase 4)
 *
 * Complete toast notification system with 4 types:
 * - Success: Action approved, settings saved
 * - Error: Approval failed, connection lost
 * - Info: New approvals, queue refreshed
 * - Warning: Queue backlog, performance degradation
 *
 * Features:
 * - Auto-dismiss (5s default, 7s for errors)
 * - Queue management (multiple toasts)
 * - Dismissible toasts
 * - Accessible (ARIA live regions)
 *
 * Phase 4 - ENG-011
 */
export type ToastType = "success" | "error" | "info" | "warning";
export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
    dismissible?: boolean;
}
export interface ToastOptions {
    message: string;
    type?: ToastType;
    duration?: number;
    dismissible?: boolean;
}
export declare function useToast(): {
    toasts: Toast[];
    showToast: (options: ToastOptions) => void;
    showSuccess: (message: string, duration?: number) => void;
    showError: (message: string, duration?: number) => void;
    showInfo: (message: string, duration?: number) => void;
    showWarning: (message: string, duration?: number) => void;
    dismissToast: (id: string) => void;
    clearAll: () => void;
};
//# sourceMappingURL=useToast.d.ts.map