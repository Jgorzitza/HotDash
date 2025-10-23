import { type ActionFunctionArgs } from "react-router";
import { json } from "~/utils/http.server";
import { processReceipt } from "~/services/inventory/alc";
import { updateVendorReliability } from "~/services/inventory/vendor-service";
import { syncInventoryCostToShopify } from "~/services/shopify/inventory-sync";
import { logDecision } from "~/services/decisions.server";
import { prisma } from "~/db.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const poId = formData.get("poId") as string;
  const totalFreight = parseFloat(formData.get("totalFreight") as string) || 0;
  const totalDuty = parseFloat(formData.get("totalDuty") as string) || 0;
  const lineItems = JSON.parse(formData.get("lineItems") as string);

  if (!poId || !lineItems || lineItems.length === 0) {
    return Response.json(
      { success: false, error: "Missing required fields" },
      { status: 400 },
    );
  }

  try {
    // Process the receipt with ALC calculations
    const { receiptBreakdowns, alcUpdates } = await processReceipt(
      poId,
      lineItems,
      totalFreight,
      totalDuty,
    );

    // Sync updated costs to Shopify
    for (const update of alcUpdates) {
      await syncInventoryCostToShopify(update.variantId, update.newALC);
    }

    // Update purchase order status
    const po = await prisma.purchase_orders.update({
      where: { id: poId },
      data: {
        status: "received",
        actualDeliveryDate: new Date(),
      },
      include: { vendors: true },
    });

    // Update vendor reliability if delivery was on time
    if (po.expectedDeliveryDate && po.actualDeliveryDate) {
      await updateVendorReliability(
        po.vendorId,
        po.expectedDeliveryDate,
        po.actualDeliveryDate,
      );
    }

    // Log the receipt decision
    await logDecision({
      scope: "ops",
      who: "operator",
      what: "receive_purchase_order",
      why: `PO ${po.poNumber} received: ${lineItems.length} items, freight $${totalFreight}, duty $${totalDuty}`,
      evidenceUrl: `/api/purchase-orders/${poId}`,
      createdAt: new Date(),
    });

    return Response.json({
      success: true,
      data: {
        receiptBreakdowns,
        alcUpdates,
        vendorReliabilityUpdated: true,
      },
    });
  } catch (error: any) {
    console.error("[Inventory] Receipt processing error:", error);
    
    await logDecision({
      scope: "ops",
      who: "operator",
      what: "receive_purchase_order_error",
      why: `Failed to process receipt for PO ${poId}: ${error.message}`,
      evidenceUrl: `/api/purchase-orders/${poId}`,
      createdAt: new Date(),
    });

    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
