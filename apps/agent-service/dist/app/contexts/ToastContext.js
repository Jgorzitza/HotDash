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
const ToastContext = createContext(null);
export function ToastProvider({ children }) {
    const { toasts, showSuccess, showError, showInfo, showWarning, dismissToast, clearAll, } = useToast();
    return (<ToastContext.Provider value={{
            showSuccess,
            showError,
            showInfo,
            showWarning,
            clearAll,
        }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast}/>
    </ToastContext.Provider>);
}
export function useToastContext() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToastContext must be used within ToastProvider");
    }
    return context;
}
//# sourceMappingURL=ToastContext.js.map