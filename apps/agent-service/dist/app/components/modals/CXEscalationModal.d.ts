import type { EscalationConversation } from "../../services/chatwoot/types";
interface CXEscalationModalProps {
    conversation: EscalationConversation;
    open: boolean;
    onClose: () => void;
}
export declare function CXEscalationModal({ conversation, open, onClose, }: CXEscalationModalProps): React.JSX.Element;
export {};
//# sourceMappingURL=CXEscalationModal.d.ts.map