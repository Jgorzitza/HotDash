import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

/**
 * POST /api/preferences/visible-tiles
 *
 * Saves user's visible tiles preference
 *
 * Request body (form data):
 * - visibleTiles: JSON string array of tile IDs to show
 *
 * Response:
 * - 200: { ok: true }
 * - 400: { error: string } if validation fails
 * - 401: { error: string } if not authenticated
 *
 * Future: Save to Supabase user_preferences.visible_tiles
 * For now: Returns success (Phase 11 will wire Supabase)
 */
export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  if (!session?.shop) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await request.formData();
  const visibleTilesRaw = formData.get("visibleTiles");

  if (!visibleTilesRaw || typeof visibleTilesRaw !== "string") {
    return Response.json(
      { error: "visibleTiles is required" },
      { status: 400 },
    );
  }

  let visibleTiles: string[];
  try {
    visibleTiles = JSON.parse(visibleTilesRaw);
  } catch (error) {
    return Response.json(
      { error: "visibleTiles must be valid JSON array" },
      { status: 400 },
    );
  }

  if (!Array.isArray(visibleTiles)) {
    return Response.json(
      { error: "visibleTiles must be an array" },
      { status: 400 },
    );
  }

  // TODO (Phase 11): Save to Supabase
  // await supabase
  //   .from('user_preferences')
  //   .upsert({
  //     shop_domain: session.shop,
  //     visible_tiles: visibleTiles,
  //     updated_at: new Date().toISOString(),
  //   });

  console.log(
    `[Preferences] Visible tiles saved for ${session.shop}:`,
    visibleTiles,
  );

  return Response.json({ ok: true });
}
