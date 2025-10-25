/**
 * Toast Container Component
 *
 * Manages and displays toast notifications with proper queueing and animations.
 * Supports 4 types: Success, Error, Info, Warning
 * Auto-dismiss after configurable duration (default 5s, errors 7s)
 *
 * Phase 4 - ENG-011
 */

import { useEffect, useState, type ComponentType, type SVGProps } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  XIcon,
} from "@shopify/polaris-icons";
import type { Toast } from "~/hooks/useToast";

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: "var(--occ-space-4)",
        right: "var(--occ-space-4)",
        zIndex: 9998, // Below modals (9999) - Design Audit H1
        display: "flex",
        flexDirection: "column",
        gap: "var(--occ-space-2)",
        maxWidth: "400px",
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

type StatusIcon = ComponentType<SVGProps<SVGSVGElement>>;

const STATUS_ICON_MAP: Record<Toast["type"], StatusIcon> = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: AlertTriangleIcon,
  info: InfoIcon,
};

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = toast.duration ?? (toast.type === "error" ? 7000 : 5000);
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onDismiss(toast.id);
      }, 300); // Match exit animation duration
    }, duration);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const getBackgroundColor = () => {
    switch (toast.type) {
      case "success":
        return "var(--occ-color-success)";
      case "error":
        return "var(--occ-color-error)";
      case "warning":
        return "var(--occ-color-warning)";
      case "info":
        return "var(--occ-color-info)";
      default:
        return "var(--occ-color-info)";
    }
  };

  const IconComponent = STATUS_ICON_MAP[toast.type] ?? InfoIcon;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        background: getBackgroundColor(),
        color: "white",
        padding: "var(--occ-space-3) var(--occ-space-4)",
        borderRadius: "var(--occ-radius-md)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        display: "flex",
        alignItems: "center",
        gap: "var(--occ-space-3)",
        minWidth: "280px",
        maxWidth: "400px",
        animation: isExiting
          ? "occ-toast-exit 0.3s ease-in forwards"
          : "occ-toast-enter 0.3s ease-out",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.2rem",
          flexShrink: 0,
        }}
      >
        <IconComponent focusable="false" />
      </span>
      <span
        style={{
          flex: 1,
          fontSize: "var(--occ-font-size-sm)",
        }}
      >
        {toast.message}
      </span>
      {toast.dismissible !== false && (
        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(() => onDismiss(toast.id), 300);
          }}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            cursor: "pointer",
            fontSize: "1.2rem",
            padding: "0",
            marginLeft: "var(--occ-space-2)",
            opacity: 0.8,
            flexShrink: 0,
          }}
          aria-label="Dismiss notification"
        >
          <XIcon aria-hidden="true" focusable="false" />
        </button>
      )}
    </div>
  );
}
