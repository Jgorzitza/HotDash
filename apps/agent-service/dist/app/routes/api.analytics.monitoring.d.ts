/**
 * Production Analytics Monitoring API
 *
 * ANALYTICS-004: API endpoints for production monitoring
 */
import type { LoaderFunctionArgs } from 'react-router';
/**
 * GET /api/analytics/monitoring
 *
 * Query parameters:
 * - action: 'health' | 'metrics' | 'alerts' | 'history'
 * - limit: number (for history)
 */
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
/**
 * POST /api/analytics/monitoring
 *
 * Actions:
 * - start: Start monitoring
 * - stop: Stop monitoring
 */
export declare function action({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.analytics.monitoring.d.ts.map