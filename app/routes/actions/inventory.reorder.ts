import type { ActionFunctionArgs } from "react-router";
import { createClient } from "@supabase/supabase-js";

import { authenticate } from "../../shopify.server";
import { logDecision } from "../../services/decisions.server";
import { toInputJson } from "../../services/json";
import { getSupabaseConfig } from "../../config/supabase.server";

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });
}

const ACTION_MAP: Record<string, { decisionAction: string }> = {
  create_po: { decisionAction: "inventory.create_purchase_order" },
  adjust_quantity: { decisionAction: "inventory.adjust_quantity" },
  mark_intentional: { decisionAction: "inventory.mark_intentional_low_stock" },
  snooze: { decisionAction: "inventory.snooze_alert" },
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  if (!session?.shop) {
    throw jsonResponse({ error: "Missing shop context" }, { status: 400 });
  }

  const actor = (session as { email?: string | null }).email ?? session.shop;

  const formData = await request.formData();
  const actionType = formData.get("action");
  const variantId = formData.get("variantId");
  const sku = formData.get("sku");
  const reorderQuantity = formData.get("reorderQuantity");
  const vendor = formData.get("vendor");
  const note = formData.get("note");
  const velocityAnalysisRaw = formData.get("velocityAnalysis");

  if (typeof actionType !== "string" || !(actionType in ACTION_MAP)) {
    throw jsonResponse({ error: "Invalid action" }, { status: 400 });
  }

  const decisionInfo = ACTION_MAP[actionType];

  let velocityAnalysis: unknown = null;
  if (typeof velocityAnalysisRaw === "string" && velocityAnalysisRaw.trim() !== "") {
    try {
      velocityAnalysis = JSON.parse(velocityAnalysisRaw);
    } catch (error) {
      console.warn("Failed to parse inventory velocity analysis", error);
    }
  }

  const payload = {
    actionType,
    variantId: typeof variantId === "string" ? variantId : undefined,
    sku: typeof sku === "string" ? sku : undefined,
    reorderQuantity:
      typeof reorderQuantity === "string"
        ? Number.parseInt(reorderQuantity, 10)
        : undefined,
    vendor: typeof vendor === "string" ? vendor : undefined,
    velocityAnalysis,
  };

  await logDecision({
    scope: "ops",
    actor,
    action: decisionInfo.decisionAction,
    rationale:
      typeof note === "string" && note.trim() ? note.trim() : undefined,
    shopDomain: session.shop,
    payload: toInputJson(payload),
  });

  // Store to inventory_actions table for analytics (per spec: docs/design/wireframes/dashboard_wireframes.md line 184-220)
  const supabaseConfig = getSupabaseConfig();
  if (supabaseConfig) {
    const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceKey);

    const { error: insertError } = await supabase.from("inventory_actions").insert({
      action_type: actionType,
      variant_id: typeof variantId === "string" ? variantId : null,
      sku: typeof sku === "string" ? sku : null,
      reorder_quantity:
        typeof reorderQuantity === "string"
          ? Number.parseInt(reorderQuantity, 10)
          : null,
      vendor_id: typeof vendor === "string" ? vendor : null, // Note: This is vendor name, not UUID - needs enhancement
      velocity_analysis:
        typeof velocityAnalysisRaw === "string" ? velocityAnalysisRaw : null,
      operator_name: actor,
      notes: typeof note === "string" && note.trim() ? note.trim() : null,
      metadata: toInputJson(payload),
      project: "occ",
    });

    if (insertError) {
      console.error("Failed to insert inventory_action:", insertError);
      // Don't fail the request - decision_log is primary, inventory_actions is analytics
    }
  }

  return jsonResponse({ ok: true });
};

export default action;

