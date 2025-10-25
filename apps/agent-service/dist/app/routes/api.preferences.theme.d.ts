import type { ActionFunctionArgs } from "react-router";
/**
 * POST /api/preferences/theme
 *
 * Saves user's theme preference (ENG-016)
 *
 * Request body:
 * - theme: "light" | "dark" | "auto"
 *
 * Response:
 * - 200: { ok: true }
 * - 400: { error: string } if validation fails
 * - 401: { error: string } if not authenticated
 *
 * Future: Save to Supabase user_preferences.theme
 * For now: Returns success (Phase 11 will wire Supabase)
 */
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.preferences.theme.d.ts.map