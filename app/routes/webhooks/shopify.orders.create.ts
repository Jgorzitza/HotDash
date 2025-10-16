/**
 * Shopify Order Create Webhook Handler
 * Owner: integrations agent
 * Date: 2025-10-15
 */



import { authenticate } from "../../shopify.server";
import { logger } from "../../utils/logger.server";
import { SupabaseRPC } from "../../lib/supabase/client";
import { withIdempotency } from "../../lib/idempotency";

export async function action({ request }: any) {
  const startTime = Date.now();

  try {
    // Authenticate webhook
    const { topic, shop, session, admin, payload } = await authenticate.webhook(request);

    if (topic !== "ORDERS_CREATE") {
      return Response.json({ error: "Invalid webhook topic" }, { status: 400 });
    }

    logger.info("Shopify order/create webhook received", {
      shop,
      orderId: payload.id,
      orderName: payload.name,
    });

    // Process webhook with idempotency
    const idempotencyKey = `shopify:order:create:${shop}:${payload.id}`;
    
    await withIdempotency(idempotencyKey, async () => {
      // Extract order data
      const orderData = {
        shopDomain: shop,
        orderId: payload.id.toString(),
        orderName: payload.name,
        email: payload.email,
        totalPrice: payload.total_price,
        currency: payload.currency,
        financialStatus: payload.financial_status,
        fulfillmentStatus: payload.fulfillment_status,
        lineItemsCount: payload.line_items?.length || 0,
        createdAt: payload.created_at,
      };

      // Log to audit trail
      await SupabaseRPC.logAuditEntry({
        scope: "shopify.webhook.orders.create",
        actor: "system",
        action: "order_created",
        shopDomain: shop,
        externalRef: payload.id.toString(),
        payload: orderData,
      });

      // Store order metrics (if needed)
      // This could trigger inventory updates, analytics, etc.
      
      logger.info("Shopify order/create webhook processed", {
        shop,
        orderId: payload.id,
        orderName: payload.name,
        latencyMs: Date.now() - startTime,
      });

      return { success: true };
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    const latency = Date.now() - startTime;
    
    logger.error("Shopify order/create webhook failed", {
      error: error instanceof Error ? error.message : String(error),
      latencyMs: latency,
    });

    return Response.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
