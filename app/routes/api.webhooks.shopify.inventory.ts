/**
 * API Route: Shopify Inventory Webhooks
 * 
 * POST /api/webhooks/shopify/inventory
 * 
 * Receives inventory level update webhooks from Shopify
 * Updates dashboard_fact table with new inventory levels
 */

import type { ActionFunctionArgs } from 'react-router';
import { handleInventoryWebhook } from '~/services/shopify/inventory-sync';
import shopify from '~/shopify.server';

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return Response.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  }

  try {
    // Shopify webhook authentication is handled by shopify.server
    const { topic, shop, session, admin, payload } = await shopify.authenticate.webhook(request);

    if (topic !== 'INVENTORY_LEVELS_UPDATE') {
      return Response.json(
        { error: 'Unexpected webhook topic' },
        { status: 400 }
      );
    }

    // Process webhook
    const result = await handleInventoryWebhook(payload);

    if (!result.success) {
      return Response.json(
        { error: result.error || 'Processing failed' },
        { status: 500 }
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('[Shopify Inventory Webhook] Error:', error);
    
    // Shopify retries webhooks on non-200 responses
    // Return 200 for errors we can't recover from to avoid infinite retries
    return Response.json(
      { error: 'Processing error' },
      { status: 200 } // Return 200 to prevent retries
    );
  }
}

export async function loader() {
  return Response.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
