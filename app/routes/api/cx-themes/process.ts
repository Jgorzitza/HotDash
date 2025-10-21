/**
 * POST /api/cx-themes/process
 * 
 * Processes CX conversation themes and generates Action Queue items
 * Called by nightly job or manually to convert customer feedback into actionable tasks
 */

import type { ActionFunctionArgs } from "react-router";
import { json } from "~/utils/http.server";
import shopify from "~/shopify.server";
import { processCXThemes, addCXActionsToQueue, type ConversationTheme } from "~/services/product/cx-theme-actions";

interface ProcessPayload {
  themes: ConversationTheme[];
  shopDomain?: string;
}

export async function action({ request }: ActionFunctionArgs) {
  // Authenticate with Shopify
  const { session } = await shopify.authenticate.admin(request);
  const shopDomain = session.shop;

  if (request.method.toUpperCase() !== "POST") {
    return json({ error: "Method Not Allowed" }, { status: 405 });
  }

  let payload: ProcessPayload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(payload?.themes)) {
    return json(
      { error: "themes array is required" },
      { status: 400 }
    );
  }

  try {
    console.log(`[CX Themes] Processing ${payload.themes.length} themes for ${shopDomain}`);
    
    // 1. Convert themes to Action cards
    const actions = await processCXThemes(payload.themes, shopDomain);
    
    console.log(`[CX Themes] Generated ${actions.length} actions from ${payload.themes.length} themes`);
    
    // 2. Add to Action Queue (via DashboardFact)
    const result = await addCXActionsToQueue(actions, shopDomain);
    
    return json({
      success: true,
      themesProcessed: payload.themes.length,
      actionsGenerated: actions.length,
      actionsAdded: result.added,
      shop: shopDomain
    });
  } catch (error: any) {
    console.error("[CX Themes] Processing error:", error);
    
    return json(
      { 
        success: false, 
        error: error.message || "Failed to process CX themes" 
      },
      { status: 500 }
    );
  }
}

export const loader = async () => json({ error: "Not Found" }, { status: 404 });

