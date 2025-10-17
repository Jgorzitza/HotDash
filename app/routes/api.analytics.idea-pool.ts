import type { LoaderFunctionArgs } from "react-router";
import { isFeatureEnabled } from "../config/featureFlags";

function json(data: unknown, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers || {});
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const live = isFeatureEnabled("idea_pool_live", false);
  if (!live) {
    return json({ ok: false, error: "idea-pool feature disabled" }, { status: 501 });
  }

  // Mocked response for now; real Supabase integration will replace this
  return json({ ok: true, ideas: [] }, { status: 200 });
}

