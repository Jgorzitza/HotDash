/**
 * Monitoring Health Check API
 *
 * GET /api/monitoring/health
 *
 * Returns current system health status with monitoring metrics.
 * Used by infrastructure monitoring and alerting systems.
 *
 * @see DEVOPS-017
 */
import { type LoaderFunctionArgs } from "react-router";
/**
 * Health check loader
 */
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.monitoring.health.d.ts.map