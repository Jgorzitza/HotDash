import { createClient } from "@supabase/supabase-js";
import { authenticate } from "../../shopify.server";
import { logDecision } from "../../services/decisions.server";
import { toInputJson } from "../../services/json";
import { getSupabaseConfig } from "../../config/supabase.server";
function jsonResponse(body, init) {
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "content-type": "application/json" },
        ...init,
    });
}
const ACTION_MAP = {
    acknowledge: { decisionAction: "sales_pulse.log_follow_up" },
    escalate: { decisionAction: "sales_pulse.escalate" },
    no_action: { decisionAction: "sales_pulse.no_action" },
};
export const action = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    if (!session?.shop) {
        throw jsonResponse({ error: "Missing shop context" }, { status: 400 });
    }
    const actor = session.email ?? session.shop;
    const formData = await request.formData();
    const actionType = formData.get("action");
    const note = formData.get("note");
    const contextRaw = formData.get("context");
    const currency = formData.get("currency");
    const totalRevenue = formData.get("totalRevenue");
    const orderCount = formData.get("orderCount");
    if (typeof actionType !== "string" || !(actionType in ACTION_MAP)) {
        throw jsonResponse({ error: "Invalid action" }, { status: 400 });
    }
    const decisionInfo = ACTION_MAP[actionType];
    let context = null;
    if (typeof contextRaw === "string" && contextRaw.trim() !== "") {
        try {
            context = JSON.parse(contextRaw);
        }
        catch (error) {
            console.warn("Failed to parse sales pulse context", error);
        }
    }
    const payload = {
        actionType,
        context,
        summary: {
            currency: typeof currency === "string" ? currency : undefined,
            totalRevenue: typeof totalRevenue === "string"
                ? Number.parseFloat(totalRevenue)
                : undefined,
            orderCount: typeof orderCount === "string"
                ? Number.parseInt(orderCount, 10)
                : undefined,
        },
    };
    await logDecision({
        scope: "ops",
        actor,
        action: decisionInfo.decisionAction,
        rationale: typeof note === "string" && note.trim() ? note.trim() : undefined,
        shopDomain: session.shop,
        payload: toInputJson(payload),
    });
    // Store to sales_pulse_actions table for analytics (per spec: docs/design/wireframes/dashboard_wireframes.md line 177)
    const supabaseConfig = getSupabaseConfig();
    if (supabaseConfig) {
        const supabase = createClient(supabaseConfig.url, supabaseConfig.serviceKey);
        const { error: insertError } = await supabase
            .from("sales_pulse_actions")
            .insert({
            action_type: actionType,
            revenue_variance: null, // TODO: Calculate WoW variance when Data service provides historical data
            selected_action: actionType,
            notes: typeof note === "string" && note.trim() ? note.trim() : null,
            operator_name: actor,
            metadata: toInputJson(payload),
            project: "occ",
        });
        if (insertError) {
            console.error("Failed to insert sales_pulse_action:", insertError);
            // Don't fail the request - decision_log is primary, sales_pulse_actions is analytics
        }
    }
    return jsonResponse({ ok: true });
};
export default action;
//# sourceMappingURL=sales-pulse.decide.js.map