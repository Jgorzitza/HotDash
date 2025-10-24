/**
 * Toast Context Provider
 *
 * Global toast notification management with React Context
 * Provides toast functions to all components in the app
 *
 * Phase 4 - ENG-011
 */
interface ToastContextValue {
    showSuccess: (message: string, duration?: number) => void;
    showError: (message: string, duration?: number) => void;
    showInfo: (message: string, duration?: number) => void;
    showWarning: (message: string, duration?: number) => void;
    clearAll: () => void;
}
export declare function ToastProvider({ children }: {
    children: React.ReactNode;
}): React.JSX.Element;
export declare function useToastContext(): ToastContextValue;
export {};
//# sourceMappingURL=ToastContext.d.ts.map