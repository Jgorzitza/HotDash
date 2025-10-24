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
export declare function useModalFocusTrap(isOpen: boolean, onClose: () => void, activatorRef?: React.RefObject<HTMLElement>): void;
//# sourceMappingURL=useModalFocusTrap.d.ts.map