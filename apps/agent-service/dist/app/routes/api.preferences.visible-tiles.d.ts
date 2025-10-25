import type { ActionFunctionArgs } from "react-router";
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
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.preferences.visible-tiles.d.ts.map