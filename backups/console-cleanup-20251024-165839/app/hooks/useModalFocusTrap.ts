/**
 * Modal Focus Trap Hook
 *
 * Implements WCAG 2.4.3 compliant focus trapping for modal dialogs.
 * Based on spec: docs/design/modal-refresh-handoff.md lines 56-93
 *
 * Features:
 * - Traps focus within modal (Tab/Shift+Tab wrapping)
 * - Auto-focuses first element on open
 * - Handles Escape key to close
 * - Returns focus to activator on close (if ref provided)
 *
 * @param isOpen - Whether the modal is currently open
 * @param onClose - Function to call when Escape is pressed
 * @param activatorRef - Optional ref to return focus to on close
 */

import { useEffect, useRef } from "react";

export function useModalFocusTrap(
  isOpen: boolean,
  onClose: () => void,
  activatorRef?: React.RefObject<HTMLElement>,
) {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Return focus to activator when closing
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
      return;
    }

    // Store the element that had focus before modal opened
    previousActiveElement.current =
      (document.activeElement as HTMLElement) || activatorRef?.current || null;

    const modal = document.querySelector('[role="dialog"][aria-modal="true"]');
    if (!modal) return;

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Auto-focus first element (Close button per spec)
    if (firstElement) {
      // Small delay to ensure modal is rendered
      const focusTimeout = setTimeout(() => {
        firstElement.focus();
      }, 10);

      const handleKeyDown = (e: KeyboardEvent) => {
        // Escape key closes modal
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
          return;
        }

        // Tab key handling for focus trap
        if (e.key === "Tab") {
          if (focusableElements.length === 1) {
            // Only one element - prevent tabbing
            e.preventDefault();
            return;
          }

          if (e.shiftKey) {
            // Shift+Tab: wrap from first to last
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab: wrap from last to first
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        clearTimeout(focusTimeout);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose, activatorRef]);
}
