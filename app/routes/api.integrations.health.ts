/**
 * API Route: Integration Health Checks
 *
 * GET /api/integrations/health
 *
 * Returns health status of all integrations
 */

import type { LoaderFunctionArgs } from "react-router";
import shopify from "~/shopify.server";
import { checkAllIntegrations } from "~/services/integrations/health";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Get Shopify admin client if possible
    let adminGraphqlClient;
    try {
      const { admin } = await shopify.authenticate.admin(request);
      adminGraphqlClient = admin.graphql;
    } catch (error) {
      // Shopify auth might fail if not in embedded context
      console.warn(
        "[Health Check] Shopify auth unavailable, checking other services",
      );
    }

    // Run all health checks
    const results = await checkAllIntegrations(adminGraphqlClient);

    return Response.json(results);
  } catch (error) {
    console.error("[Health Check] Error:", error);
    return Response.json(
      {
        overall: "unhealthy" as const,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
