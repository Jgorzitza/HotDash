/**
 * Monitoring Dashboard API
 *
 * GET /api/monitoring/dashboard?period=1h
 *
 * Returns comprehensive monitoring metrics for dashboard display.
 *
 * Query Parameters:
 * - period: '1h' | '24h' | '7d' (optional, default: '1h')
 *
 * @see DEVOPS-017
 */
import { type LoaderFunctionArgs } from "react-router";
/**
 * Dashboard metrics loader
 */
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.monitoring.dashboard.d.ts.map