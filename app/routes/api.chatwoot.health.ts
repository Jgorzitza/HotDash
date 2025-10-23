/**
 * Chatwoot Health Check API
 * 
 * GET /api/chatwoot/health
 * 
 * Verifies Chatwoot API connectivity.
 */

import { type LoaderFunctionArgs } from "react-router";
import { checkChatwootHealth } from "~/utils/health-check.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const healthCheck = await checkChatwootHealth();
    
    const response = {
      connected: healthCheck.status === "pass",
      message: healthCheck.message,
      responseTime: healthCheck.responseTime,
      timestamp: new Date().toISOString(),
    };
    
    const status = healthCheck.status === "pass" ? 200 : 503;
    
    return Response.json(response, { status });
  } catch (error: any) {
    return Response.json(
      {
        connected: false,
        error: error.message || "Chatwoot health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

