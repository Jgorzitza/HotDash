/**
 * SEO Monitoring API Route
 * Returns anomaly counts, critical issues, and Core Web Vitals for dashboard tile
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { normalizeVitals } from "~/lib/seo/vitals";

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

    // Mock data - in production, fetch from Supabase + GA4
    const vitals = normalizeVitals(
      { LCP: 2300, FID: 120, CLS: 0.05 },
      "mobile",
    );

    const response = {
      success: true,
      data: {
        anomalyCount: 3,
        criticalCount: 1,
        vitals: {
          LCP: { value: 2300, passes: vitals[0]?.passes ?? true },
          FID: { value: 120, passes: vitals[1]?.passes ?? false },
          CLS: { value: 0.05, passes: vitals[2]?.passes ?? true },
        },
        lastUpdated: new Date().toISOString(),
      },
      metadata: {
        shopDomain: shop,
        timestamp: new Date().toISOString(),
      },
    };

    return json(response);
  } catch (error) {
    console.error("SEO monitoring API error:", error);
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
