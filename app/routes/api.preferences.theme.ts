import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

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
export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  if (!session?.shop) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await request.formData();
  const theme = formData.get("theme");

  if (!theme || typeof theme !== "string") {
    return Response.json({ error: "theme is required" }, { status: 400 });
  }

  const validThemes = ["light", "dark", "auto"];
  if (!validThemes.includes(theme)) {
    return Response.json(
      { error: `theme must be one of: ${validThemes.join(", ")}` },
      { status: 400 },
    );
  }

  // TODO (Phase 11): Save to Supabase
  // await supabase
  //   .from('user_preferences')
  //   .upsert({
  //     shop_domain: session.shop,
  //     theme: theme,
  //     updated_at: new Date().toISOString(),
  //   });

  console.log(`[Preferences] Theme saved for ${session.shop}:`, theme);

  return Response.json({ ok: true });
}
