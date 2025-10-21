/**
 * Toast Notification Hook
 * 
 * Simple toast notification system using Shopify App Bridge Toast API.
 * For embedded Shopify apps - falls back to console.log if App Bridge unavailable.
 * 
 * Designer P0 requirement: Success feedback for all modal actions
 * 
 * @see https://shopify.dev/docs/api/app-bridge/previous-versions/actions/toast
 */

import { useState, useCallback } from "react";

export interface ToastOptions {
  message: string;
  duration?: number;
  isError?: boolean;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const showToast = useCallback((options: ToastOptions) => {
    const { message, duration = 5000, isError = false } = options;

    // For now, use simple browser notification
    // TODO: Integrate Shopify App Bridge Toast API in Phase 4 (ENG-011)
    const toastElement = document.createElement("div");
    toastElement.className = isError ? "occ-toast occ-toast--error" : "occ-toast occ-toast--success";
    toastElement.setAttribute("role", "status");
    toastElement.setAttribute("aria-live", "polite");
    toastElement.textContent = message;
    toastElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: ${isError ? "#D72828" : "#008060"};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-size: 14px;
      min-width: 200px;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(toastElement);

    // Auto-dismiss after duration
    setTimeout(() => {
      toastElement.style.animation = "slideOut 0.3s ease-in";
      setTimeout(() => {
        document.body.removeChild(toastElement);
      }, 300);
    }, duration);

    // Update state for React tracking
    setToasts((prev) => [...prev, { message, duration, isError }]);
  }, []);

  const showSuccess = useCallback((message: string) => {
    showToast({ message, isError: false });
  }, [showToast]);

  const showError = useCallback((message: string) => {
    showToast({ message, isError: true, duration: 7000 }); // Errors stay longer
  }, [showToast]);

  return { showToast, showSuccess, showError, toasts };
}

