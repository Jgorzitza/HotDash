/**
 * API Route: CEO Agent Health Check
 *
 * GET /api/ceo-agent/health?timeRange=24h
 *
 * Monitors CEO Agent performance and health status.
 * Tracks response times, token usage, error rates, tool utilization.
 *
 * Query Parameters:
 * - timeRange: '1h' | '24h' | '7d' | '30d' (optional, default: '24h')
 *
 * @see docs/directions/ai-customer.md AI-CUSTOMER-012
 */
import { type LoaderFunctionArgs } from "react-router";
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.ceo-agent.health.d.ts.map