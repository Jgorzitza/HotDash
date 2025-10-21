/**
 * API Route: Run SEO Audit
 *
 * POST /api/seo/run-audit
 *
 * Triggers a daily automated SEO audit that checks:
 * - Title tags (presence, length, uniqueness)
 * - Meta descriptions (presence, length, uniqueness)
 * - Header tags (H1 presence and structure)
 * - Images (alt text presence)
 *
 * Returns comprehensive audit results with issues categorized by severity.
 *
 * @module routes/api/seo/run-audit
 */

import { type ActionFunctionArgs } from "react-router";
import { json } from "~/utils/http.server";
import { runDailyAudit, getURLsToAudit } from "../services/seo/automated-audit";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const url = new URL(request.url);
    const shopDomain = url.searchParams.get("shop") || "default-shop.myshopify.com";

    // Get URLs to audit
    const urls = await getURLsToAudit(shopDomain);

    // Run audit
    const auditResult = await runDailyAudit(urls);

    return json({
      success: true,
      data: auditResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[API] SEO audit error:", error);

    return json(
      {
        success: false,
        error: error.message || "Failed to run SEO audit",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

/**
 * GET endpoint to retrieve last audit results
 */
export async function loader({ request }: ActionFunctionArgs) {
  try {
    const url = new URL(request.url);
    const shopDomain = url.searchParams.get("shop") || "default-shop.myshopify.com";

    // Get URLs and run audit (will use cached results if available)
    const urls = await getURLsToAudit(shopDomain);
    const auditResult = await runDailyAudit(urls);

    return json({
      success: true,
      data: auditResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[API] SEO audit error:", error);

    return json(
      {
        success: false,
        error: error.message || "Failed to retrieve SEO audit results",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

