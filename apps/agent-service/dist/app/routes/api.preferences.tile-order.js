import { authenticate } from "../shopify.server";
/**
 * POST /api/preferences/tile-order
 *
 * Saves user's tile order preference for dashboard
 *
 * Request body:
 * - tileOrder: JSON string array of tile IDs in desired order
 *
 * Response:
 * - 200: { ok: true }
 * - 400: { error: string } if validation fails
 * - 401: { error: string } if not authenticated
 *
 * Future: Save to Supabase user_preferences table
 * For now: Returns success (Phase 11 will wire Supabase)
 */
export async function action({ request }) {
    // Authenticate user
    const { session } = await authenticate.admin(request);
    if (!session?.shop) {
        return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    // Parse request body
    const formData = await request.formData();
    const tileOrderRaw = formData.get("tileOrder");
    if (!tileOrderRaw || typeof tileOrderRaw !== "string") {
        return Response.json({ error: "tileOrder is required" }, { status: 400 });
    }
    let tileOrder;
    try {
        tileOrder = JSON.parse(tileOrderRaw);
    }
    catch (error) {
        return Response.json({ error: "tileOrder must be valid JSON array" }, { status: 400 });
    }
    if (!Array.isArray(tileOrder)) {
        return Response.json({ error: "tileOrder must be an array" }, { status: 400 });
    }
    // Validate all tile IDs are strings
    if (!tileOrder.every((id) => typeof id === "string")) {
        return Response.json({ error: "All tile IDs must be strings" }, { status: 400 });
    }
    // TODO (Phase 11): Save to Supabase user_preferences table
    // await supabase
    //   .from('user_preferences')
    //   .upsert({
    //     shop_domain: session.shop,
    //     tile_order: tileOrder,
    //     updated_at: new Date().toISOString(),
    //   });
    console.log(`[Preferences] Tile order saved for ${session.shop}:`, tileOrder);
    return Response.json({ ok: true });
}
//# sourceMappingURL=api.preferences.tile-order.js.map