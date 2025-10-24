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

import { Toast as PolarisToast, Frame } from "@shopify/polaris";
import { useState, useEffect, useCallback } from "react";

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
export function Toast({
  message,
  type = "info",
  duration,
  onDismiss,
  onRetry,
  active = true,
}: ToastProps) {
  const [isActive, setIsActive] = useState(active);

  // Default durations based on type
  const defaultDuration = type === "error" || type === "warning" ? 7000 : 5000;
  const autoDismissDuration = duration ?? defaultDuration;

  // Auto-dismiss timer
  useEffect(() => {
    if (!isActive || autoDismissDuration === 0) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, autoDismissDuration);

    return () => clearTimeout(timer);
  }, [isActive, autoDismissDuration]);

  const handleDismiss = useCallback(() => {
    setIsActive(false);
    onDismiss?.();
  }, [onDismiss]);

  const handleRetry = useCallback(() => {
    handleDismiss();
    onRetry?.();
  }, [handleDismiss, onRetry]);

  if (!isActive) return null;

  // Map our types to Polaris Toast props
  const isError = type === "error";
  
  // For error toasts with retry button
  if (isError && onRetry) {
    return (
      <Frame>
        <PolarisToast
          content={message}
          error={true}
          onDismiss={handleDismiss}
          action={{
            content: "Retry",
            onAction: handleRetry,
          }}
        />
      </Frame>
    );
  }

  // For all other toasts
  return (
    <Frame>
      <PolarisToast
        content={message}
        error={isError}
        onDismiss={handleDismiss}
        duration={autoDismissDuration}
      />
    </Frame>
  );
}

/**
 * Toast Manager Hook
 * 
 * Provides functions to show different types of toasts
 */
export function useToastManager() {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  const showToast = useCallback((props: Omit<ToastProps, "active">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const toast = { ...props, id, active: true };
    
    setToasts((prev) => [...prev, toast]);

    // Auto-remove from array after duration + animation time
    const duration = props.duration ?? (props.type === "error" || props.type === "warning" ? 7000 : 5000);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration + 500);
  }, []);

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      showToast({ message, type: "success", duration });
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, onRetry?: () => void, duration?: number) => {
      showToast({ message, type: "error", onRetry, duration });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      showToast({ message, type: "info", duration });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      showToast({ message, type: "warning", duration });
    },
    [showToast]
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    dismissToast,
    clearAll,
  };
}

/**
 * Toast Container
 * 
 * Renders all active toasts
 */
export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Array<ToastProps & { id: string }>;
  onDismiss: (id: string) => void;
}) {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </>
  );
}

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

