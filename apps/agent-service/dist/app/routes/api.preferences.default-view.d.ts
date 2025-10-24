import type { ActionFunctionArgs } from "react-router";
/**
 * POST /api/preferences/default-view
 *
 * Saves user's default view preference (ENG-017)
 *
 * Request body:
 * - defaultView: "grid" | "list"
 *
 * Response:
 * - 200: { ok: true }
 * - 400: { error: string } if validation fails
 * - 401: { error: string } if not authenticated
 *
 * Future: Save to Supabase user_preferences.default_view
 * For now: Returns success (Phase 11 will wire Supabase)
 */
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.preferences.default-view.d.ts.map