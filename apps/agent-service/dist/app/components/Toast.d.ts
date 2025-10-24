/**
 * Toast Component
 *
 * ENG-069: Toast Infrastructure Implementation
 *
 * Polaris-based toast notification component with Shopify App Bridge integration.
 * Supports 4 types: Success, Error, Info, Warning
 *
 * Features:
 * - Auto-dismiss with configurable timing
 * - Retry button for error toasts
 * - Proper accessibility (ARIA live regions)
 * - Shopify App Bridge integration
 * - Follows Complete Vision specifications
 */
export type ToastType = "success" | "error" | "info" | "warning";
export interface ToastProps {
    message: string;
    type?: ToastType;
    duration?: number;
    onDismiss?: () => void;
    onRetry?: () => void;
    active?: boolean;
}
/**
 * Toast Component using Polaris Toast
 *
 * @param message - Toast message to display
 * @param type - Toast type (success, error, info, warning)
 * @param duration - Auto-dismiss duration in ms (default: 5000 for success/info, 7000 for error/warning)
 * @param onDismiss - Callback when toast is dismissed
 * @param onRetry - Callback for retry button (error toasts only)
 * @param active - Whether toast is active/visible
 */
export declare function Toast({ message, type, duration, onDismiss, onRetry, active, }: ToastProps): React.JSX.Element;
/**
 * Toast Manager Hook
 *
 * Provides functions to show different types of toasts
 */
export declare function useToastManager(): {
    toasts: (ToastProps & {
        id: string;
    })[];
    showSuccess: (message: string, duration?: number) => void;
    showError: (message: string, onRetry?: () => void, duration?: number) => void;
    showInfo: (message: string, duration?: number) => void;
    showWarning: (message: string, duration?: number) => void;
    dismissToast: (id: string) => void;
    clearAll: () => void;
};
/**
 * Toast Container
 *
 * Renders all active toasts
 */
export declare function ToastContainer({ toasts, onDismiss, }: {
    toasts: Array<ToastProps & {
        id: string;
    }>;
    onDismiss: (id: string) => void;
}): React.JSX.Element;
/**
 * Example Usage:
 *
 * // Success toast
 * const { showSuccess } = useToastManager();
 * showSuccess("Action approved and executed");
 *
 * // Error toast with retry
 * const { showError } = useToastManager();
 * showError("Approval failed", () => retryApproval());
 *
 * // Info toast
 * const { showInfo } = useToastManager();
 * showInfo("3 new approvals in queue");
 *
 * // Warning toast
 * const { showWarning } = useToastManager();
 * showWarning("Queue backlog detected");
 */
//# sourceMappingURL=Toast.d.ts.map