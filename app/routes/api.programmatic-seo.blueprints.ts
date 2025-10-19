import { isFeatureEnabled } from "~/config/featureFlags";
import {
  type ProgrammaticSeoBlueprintStatus,
  listProgrammaticBlueprints,
} from "~/services/programmatic-seo/blueprints.server";

function parseStatusParam(value: string | null) {
  if (!value) return undefined;
  const lower = value.toLowerCase();
  if (
    lower === "draft" ||
    lower === "ready" ||
    lower === "approved" ||
    lower === "archived"
  ) {
    return lower as ProgrammaticSeoBlueprintStatus;
  }
  return undefined;
}

function parseLimit(value: string | null) {
  if (!value) return undefined;
  const asNumber = Number.parseInt(value, 10);
  if (Number.isNaN(asNumber)) return undefined;
  return Math.max(1, Math.min(asNumber, 200));
}

export async function loader({ request }: { request: Request }) {
  if (!isFeatureEnabled("programmaticSeoFactory")) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Programmatic SEO Factory flag disabled",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const url = new URL(request.url);
  const status = parseStatusParam(url.searchParams.get("status"));
  const limit = parseLimit(url.searchParams.get("limit"));

  const { blueprints, fallbackReason } = await listProgrammaticBlueprints({
    status,
    limit,
  });

  const body = {
    success: !fallbackReason,
    data: blueprints,
    fallbackReason: fallbackReason ?? null,
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(body), {
    status: fallbackReason ? 207 : 200,
    headers: { "Content-Type": "application/json" },
  });
}
