/**
 * Receiving Workflow Backend (INVENTORY-018) - Phase 10
 *
 * API route for receiving purchase orders with freight/duty inputs:
 * 1. Parse and validate inputs
 * 2. Process receipt (calculate ALC with freight/duty by weight)
 * 3. Sync ALC to Shopify inventoryItem.unitCost
 * 4. Update vendor reliability score
 * 5. Update PO status
 * 6. Log decision for audit trail
 * 7. Return receipt breakdown and ALC updates
 *
 * Context7 MCP: /websites/reactrouter
 * - Action patterns: ActionFunctionArgs, request.formData()
 * - Response: Response.json() for success/error
 * - Error handling: try/catch with status codes
 */
import { type ActionFunctionArgs } from "react-router";
/**
 * Receiving workflow action
 *
 * Handles POST /api/inventory/receive
 *
 * Form data:
 * - poId: Purchase order ID
 * - totalFreight: Total freight cost for shipment
 * - totalDuty: Total duty cost for shipment
 * - lineItems: JSON array of line items (variantId, qtyReceived, vendorInvoiceAmount, weight)
 *
 * @param args - Action function arguments (request)
 * @returns Response with receipt breakdown and ALC updates
 */
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.inventory.receive.d.ts.map