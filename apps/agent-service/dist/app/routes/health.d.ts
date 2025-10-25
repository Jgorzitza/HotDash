/**
 * Health Check Endpoint
 *
 * GET /health
 *
 * Returns application health status with subsystem checks.
 * Used by infrastructure monitoring and load balancers.
 *
 * Response time target: <500ms
 */
import type { LoaderFunctionArgs } from "react-router";
/**
 * Health check loader
 */
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
/**
 * Default export for health check route
 * (Route doesn't render UI, only returns JSON)
 */
export default function HealthRoute(): any;
//# sourceMappingURL=health.d.ts.map