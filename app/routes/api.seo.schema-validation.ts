/**
 * API Route: Schema Markup Validation
 *
 * POST /api/seo/schema-validation
 *
 * Validates JSON-LD structured data on specified URLs:
 * - Product schema validation
 * - Organization schema validation
 * - WebSite schema validation
 * - Required field checking
 * - Recommendations for improvements
 *
 * @module routes/api/seo/schema-validation
 */

import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { json } from "~/utils/http.server";
import { validateSchemaMarkup } from "../services/seo/schema-validator";
import { getURLsToAudit } from "../services/seo/automated-audit";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const urlsParam = formData.get("urls");
    
    let urls: string[];
    if (typeof urlsParam === "string") {
      urls = JSON.parse(urlsParam);
    } else {
      return json(
        {
          success: false,
          error: "URLs parameter is required (JSON array of URLs)",
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      );
    }

    // Validate schemas
    const report = await validateSchemaMarkup(urls);

    return json({
      success: true,
      data: report,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[API] Schema validation error:", error);

    return json(
      {
        success: false,
        error: error.message || "Failed to validate schema markup",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

/**
 * GET endpoint to retrieve schema validation for default URLs
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const shopDomain = url.searchParams.get("shop") || "default-shop.myshopify.com";

    // Get default URLs to validate
    const urls = await getURLsToAudit(shopDomain);

    // Validate schemas
    const report = await validateSchemaMarkup(urls);

    return json({
      success: true,
      data: report,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[API] Schema validation error:", error);

    return json(
      {
        success: false,
        error: error.message || "Failed to validate schema markup",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

