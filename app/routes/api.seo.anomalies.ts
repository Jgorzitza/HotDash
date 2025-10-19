/**
 * SEO Anomalies API Route
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { scanForAnomalies } from "~/lib/seo/anomalies-detector";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");

    if (!shop) {
      return json(
        { success: false, error: "Missing required parameter: shop" },
        { status: 400 },
      );
    }

    // Mock data - in production, fetch from Supabase
    const urlMetrics = [
      { url: "/products/hot-rods", current: 550, previous: 1000 },
      { url: "/collections/custom", current: 320, previous: 380 },
    ];

    const anomalies = scanForAnomalies(urlMetrics);

    return json({
      success: true,
      data: {
        anomalies,
        summary: {
          total: anomalies.length,
          critical: anomalies.filter((a) => a.severity === "critical").length,
          warning: anomalies.filter((a) => a.severity === "warning").length,
        },
      },
      metadata: {
        shopDomain: shop,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
