/**
 * Health endpoint
 *
 * GET /health
 * Returns aggregated health status for the app and dependencies.
 */

import { json } from "@remix-run/node";
import { healthCheckManager } from "~/utils/health-check.server";

export async function loader() {
  const status = await healthCheckManager.runAll();
  // Always return 200 for external health checks; encode status inside payload
  return json(status, { status: 200 });
}
