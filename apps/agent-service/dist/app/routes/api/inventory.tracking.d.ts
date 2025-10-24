import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { InventoryTrackingService } from "~/services/inventory/inventory-tracking";
export declare function loader({ request }: LoaderFunctionArgs): Promise<Response>;
export declare function action({ request }: ActionFunctionArgs): Promise<Response>;
export declare function initializeInventoryTracking(trackingService: InventoryTrackingService): void;
//# sourceMappingURL=inventory.tracking.d.ts.map