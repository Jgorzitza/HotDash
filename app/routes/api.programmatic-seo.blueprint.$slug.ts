import { isFeatureEnabled } from "~/config/featureFlags";
import { getProgrammaticBlueprintDetail } from "~/services/programmatic-seo/blueprints.server";

export async function loader({ params }: { params: { slug?: string } }) {
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

  const slug = params.slug;
  if (!slug) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Missing blueprint slug",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const detail = await getProgrammaticBlueprintDetail(slug);
  const success = !!detail.blueprint && !detail.fallbackReason;

  return new Response(
    JSON.stringify({
      success,
      data: detail,
      timestamp: new Date().toISOString(),
    }),
    {
      status: success ? 200 : detail.fallbackReason ? 404 : 500,
      headers: { "Content-Type": "application/json" },
    },
  );
}
