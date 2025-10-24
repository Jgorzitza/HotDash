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
import { processReceipt } from "~/services/inventory/alc";
import { updateVendorReliability } from "~/services/inventory/vendor-service";
import { getCurrentShopDomain } from "~/config/shopify.server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
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
export async function action({ request }) {
    const formData = await request.formData();
    const poId = formData.get("poId");
    const totalFreight = parseFloat(formData.get("totalFreight")) || 0;
    const totalDuty = parseFloat(formData.get("totalDuty")) || 0;
    // Parse line items (JSON array)
    const lineItemsJson = formData.get("lineItems");
    let lineItems;
    try {
        lineItems = JSON.parse(lineItemsJson);
    }
    catch (error) {
        return Response.json({ success: false, error: "Invalid lineItems JSON format" }, { status: 400 });
    }
    // Validate inputs
    if (!poId) {
        return Response.json({ success: false, error: "Missing required field: poId" }, { status: 400 });
    }
    if (!lineItems || lineItems.length === 0) {
        return Response.json({
            success: false,
            error: "Missing required field: lineItems (must be non-empty array)",
        }, { status: 400 });
    }
    // Validate each line item
    for (const item of lineItems) {
        if (!item.variantId ||
            !item.qtyReceived ||
            !item.vendorInvoiceAmount ||
            item.weight === undefined) {
            return Response.json({
                success: false,
                error: "Invalid line item: missing required fields (variantId, qtyReceived, vendorInvoiceAmount, weight)",
            }, { status: 400 });
        }
    }
    try {
        // 1. Process receipt (calculate ALC, record history)
        const { receiptBreakdowns, alcUpdates } = await processReceipt(poId, lineItems, totalFreight, totalDuty);
        // 2. Sync ALC to Shopify for each variant
        // TODO: In production, call Integrations agent's Shopify sync service
        // For now, log the sync intention
        for (const update of alcUpdates) {
            // await syncInventoryCostToShopify(update.variantId, update.newALC);
            console.log(`[Inventory] Would sync ALC to Shopify: ${update.variantId} -> $${update.newALC}`);
        }
        // 3. Update PO status to 'received'
        const po = await prisma.purchaseOrder.update({
            where: { id: poId },
            data: {
                status: "received",
                actualDeliveryDate: new Date(),
            },
            select: {
                id: true,
                poNumber: true,
                vendorId: true,
                expectedDeliveryDate: true,
                actualDeliveryDate: true,
            },
        });
        // 4. Update vendor reliability score
        if (po.expectedDeliveryDate && po.actualDeliveryDate) {
            await updateVendorReliability(po.vendorId, po.expectedDeliveryDate, po.actualDeliveryDate);
        }
        // 5. Log decision for audit trail
        await prisma.decisionLog.create({
            data: {
                scope: "ops",
                actor: "operator",
                action: "receive_purchase_order",
                rationale: `PO ${po.poNumber} received: ${lineItems.length} items, freight $${totalFreight}, duty $${totalDuty}`,
                evidenceUrl: `/api/purchase-orders/${poId}`,
                shopDomain: getCurrentShopDomain(),
                externalRef: po.poNumber,
                payload: {
                    poId,
                    lineItemCount: lineItems.length,
                    totalFreight,
                    totalDuty,
                    alcUpdates,
                },
            },
        });
        // 6. Return success response
        return Response.json({
            success: true,
            data: {
                poId: po.id,
                poNumber: po.poNumber,
                receiptBreakdowns,
                alcUpdates,
                vendorReliabilityUpdated: true,
                syncedToShopify: false, // TODO: Set to true when Shopify sync implemented
            },
        });
    }
    catch (error) {
        console.error("[Inventory] Receipt processing error:", error);
        // Handle specific error types
        if (error instanceof Error) {
            return Response.json({ success: false, error: error.message }, { status: 500 });
        }
        return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
//# sourceMappingURL=api.inventory.receive.js.map