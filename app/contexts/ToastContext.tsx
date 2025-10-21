/**
 * Toast Context Provider
 * 
 * Global toast notification management with React Context
 * Provides toast functions to all components in the app
 * 
 * Phase 4 - ENG-011
 */

import { createContext, useContext } from "react";
import { useToast } from "~/hooks/useToast";
import { ToastContainer } from "~/components/notifications/ToastContainer";

interface ToastContextValue {
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, showSuccess, showError, showInfo, showWarning, dismissToast, clearAll } =
    useToast();

  return (
    <ToastContext.Provider
      value={{
        showSuccess,
        showError,
        showInfo,
        showWarning,
        clearAll,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToastContext(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within ToastProvider");
  }
  return context;
}

