import type { InventoryAlert } from "../../services/shopify/types";
interface InventoryModalProps {
    alert: InventoryAlert;
    open: boolean;
    onClose: () => void;
}
export declare function InventoryModal({ alert, open, onClose }: InventoryModalProps): React.JSX.Element;
export {};
//# sourceMappingURL=InventoryModal.d.ts.map