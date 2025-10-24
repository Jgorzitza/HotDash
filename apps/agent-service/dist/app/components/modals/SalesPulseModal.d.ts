import type { OrderSummary } from "../../services/shopify/types";
interface SalesPulseModalProps {
    summary: OrderSummary;
    open: boolean;
    onClose: () => void;
}
export declare function SalesPulseModal({ summary, open, onClose, }: SalesPulseModalProps): React.JSX.Element;
export {};
//# sourceMappingURL=SalesPulseModal.d.ts.map