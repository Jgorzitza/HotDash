/**
 * Toast Container Component
 *
 * Manages and displays toast notifications with proper queueing and animations.
 * Supports 4 types: Success, Error, Info, Warning
 * Auto-dismiss after configurable duration (default 5s, errors 7s)
 *
 * Phase 4 - ENG-011
 */
import type { Toast } from "~/hooks/useToast";
interface ToastContainerProps {
    toasts: Toast[];
    onDismiss: (id: string) => void;
}
export declare function ToastContainer({ toasts, onDismiss }: ToastContainerProps): React.JSX.Element;
export {};
//# sourceMappingURL=ToastContainer.d.ts.map