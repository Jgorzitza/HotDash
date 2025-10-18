/**
 * API Route: SEO Anomalies
 *
 * GET /api/seo/anomalies
 *
 * Returns comprehensive SEO anomaly detection including:
 * - Traffic drops > 20% week-over-week (from GA4)
 * - Keyword ranking losses (from Search Console)
 * - Core Web Vitals failures (from CrUX/PageSpeed)
 * - Crawl errors (from Search Console)
 *
 * Response includes severity classification (critical, warning, info)
 * and aggregated summary for dashboard tile display.
 *
 * @module routes/api/seo/anomalies
 */

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getLandingPageAnomalies } from "~/services/ga/ingest";
import {
  detectTrafficAnomalies,
  detectRankingAnomalies,
  detectVitalsAnomalies,
  detectCrawlAnomalies,
  type TrafficAnomalyInput,
  type RankingAnomalyInput,
  type VitalsAnomalyInput,
  type CrawlErrorInput,
} from "~/lib/seo/anomalies";
import { buildSeoAnomalyBundle, GaSamplingError } from "~/lib/seo/pipeline";
import { buildSeoDiagnostics } from "~/lib/seo/diagnostics";

/**
 * Mock data generators for Search Console and Core Web Vitals
 * TODO: Replace with real Search Console API integration
 */
function getMockRankingData(): RankingAnomalyInput[] {
  // In production, this would call Google Search Console API
  // For now, return empty array until Search Console integration is ready
  return [];
}

function getMockVitalsData(): VitalsAnomalyInput[] {
  // In production, this would call PageSpeed Insights API or CrUX API
  // For now, return empty array until vitals integration is ready
  return [];
}

function getMockCrawlErrors(): CrawlErrorInput[] {
  // In production, this would call Google Search Console API
  // For now, return empty array until Search Console integration is ready
  return [];
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const shopDomain =
      url.searchParams.get("shop") || "default-shop.myshopify.com";

    // Fetch traffic anomalies from GA4
    const gaResult = await getLandingPageAnomalies({ shopDomain });

    // Convert GA anomalies to TrafficAnomalyInput format
    const trafficInputs: TrafficAnomalyInput[] = gaResult.data
      .filter((item) => item.isAnomaly)
      .map((item) => ({
        landingPage: item.landingPage,
        currentSessions: item.sessions,
        previousSessions: Math.round(item.sessions / (1 + item.wowDelta)),
        wowDelta: item.wowDelta,
      }));

    // Detect all anomaly types
    const metadata: any = (gaResult as any).fact?.metadata ?? undefined;
    const generatedAt =
      metadata &&
      typeof metadata === "object" &&
      "generatedAt" in metadata &&
      typeof (metadata as Record<string, unknown>).generatedAt === "string"
        ? (metadata as Record<string, unknown>).generatedAt
        : undefined;
    const isSampled =
      metadata && typeof metadata === "object" && Object.prototype.hasOwnProperty.call(metadata, 'sampled')
        ? Boolean((metadata as Record<string, unknown>).sampled)
        : false;

    const bundle = buildSeoAnomalyBundle({
      shopDomain,
      traffic: detectTrafficAnomalies(trafficInputs),
      ranking: detectRankingAnomalies(getMockRankingData()),
      vitals: detectVitalsAnomalies(getMockVitalsData()),
      crawl: detectCrawlAnomalies(getMockCrawlErrors()),
      generatedAt,
      sources: {
        traffic: gaResult.source,
        ranking: "mock",
        vitals: "mock",
        crawl: "mock",
      },
      isSampled,
    });

    const diagnostics = buildSeoDiagnostics(bundle);

    return json({
      success: true,
      data: {
        ...bundle,
        diagnostics,
      },
    });
  } catch (error: unknown) {
    if (error instanceof GaSamplingError) {
      return json(
        {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 502 },
      );
    }

    console.error("[API] SEO anomalies error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to fetch SEO anomalies";

    return json(
      {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
