/**
 * API Route: Inventory Sync
 * 
 * POST /api/inventory/sync
 * 
 * Triggers manual inventory sync from Shopify
 * Stores inventory levels in dashboard_fact table
 */

import type { ActionFunctionArgs } from 'react-router';
import shopify from '~/shopify.server';
import { syncInventoryFromShopify } from '~/services/shopify/inventory-sync';

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return Response.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  }

  try {
    // Authenticate with Shopify
    const { admin } = await shopify.authenticate.admin(request);

    // Sync inventory
    const result = await syncInventoryFromShopify(admin.graphql);

    if (!result.success) {
      return Response.json(
        { 
          success: false, 
          error: result.error || 'Sync failed' 
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      itemsProcessed: result.itemsProcessed,
      itemsStored: result.itemsStored,
    });
  } catch (error) {
    console.error('[Inventory Sync] Error:', error);
    return Response.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function loader() {
  return Response.json(
    { error: 'Method not allowed. Use POST to trigger sync.' },
    { status: 405 }
  );
}
