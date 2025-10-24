/**
 * Welcome Modal Component
 *
 * First-visit welcome modal with 3-step setup guide
 *
 * Task: ENG-079
 */
export interface WelcomeModalProps {
    open: boolean;
    onClose: () => void;
    onComplete?: () => void;
}
export declare function WelcomeModal({ open, onClose, onComplete }: WelcomeModalProps): React.JSX.Element;
/**
 * Hook to check if welcome modal should be shown
 */
export declare function useWelcomeModal(): {
    shouldShow: boolean;
    markCompleted: () => void;
};
//# sourceMappingURL=WelcomeModal.d.ts.map