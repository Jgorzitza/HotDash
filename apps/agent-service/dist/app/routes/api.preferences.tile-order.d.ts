import type { ActionFunctionArgs } from "react-router";
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
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.preferences.tile-order.d.ts.map