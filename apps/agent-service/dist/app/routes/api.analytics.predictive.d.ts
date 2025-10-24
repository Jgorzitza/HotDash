/**
 * Predictive Analytics API Route
 *
 * ANALYTICS-003: API endpoints for predictive analytics
 */
import { type LoaderFunctionArgs } from 'react-router';
/**
 * GET /api/analytics/predictive
 *
 * Query parameters:
 * - type: 'insights' | 'customers' | 'sales' | 'all'
 * - days: 7 | 14 | 30 (for sales forecasts)
 * - customerId: string (optional, for customer-specific predictions)
 */
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.analytics.predictive.d.ts.map