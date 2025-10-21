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

import { useState, useCallback } from "react";

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

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((options: ToastOptions) => {
    const toast: Toast = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      message: options.message,
      type: options.type ?? "info",
      duration: options.duration,
      dismissible: options.dismissible ?? true,
    };

    setToasts((prev) => [...prev, toast]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      showToast({ message, type: "success", duration });
    },
    [showToast],
  );

  const showError = useCallback(
    (message: string, duration?: number) => {
      showToast({ message, type: "error", duration: duration ?? 7000 });
    },
    [showToast],
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      showToast({ message, type: "info", duration });
    },
    [showToast],
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      showToast({ message, type: "warning", duration });
    },
    [showToast],
  );

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    dismissToast,
    clearAll,
  };
}

