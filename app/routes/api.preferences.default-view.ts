import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

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
export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  if (!session?.shop) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await request.formData();
  const defaultView = formData.get("defaultView");

  if (!defaultView || typeof defaultView !== "string") {
    return Response.json({ error: "defaultView is required" }, { status: 400 });
  }

  const validViews = ["grid", "list"];
  if (!validViews.includes(defaultView)) {
    return Response.json(
      { error: `defaultView must be one of: ${validViews.join(", ")}` },
      { status: 400 },
    );
  }

  // TODO (Phase 11): Save to Supabase
  // await supabase
  //   .from('user_preferences')
  //   .upsert({
  //     shop_domain: session.shop,
  //     default_view: defaultView,
  //     updated_at: new Date().toISOString(),
  //   });

    `[Preferences] Default view saved for ${session.shop}:`,
    defaultView,
  );

  return Response.json({ ok: true });
}
