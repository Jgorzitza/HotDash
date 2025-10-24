/**
 * Growth Engine Performance Analysis API Route
 *
 * ANALYTICS-PERFORMANCE-001: API endpoint for Growth Engine performance analysis
 * Provides real-time performance metrics, insights, and optimization recommendations
 */
import { type LoaderFunctionArgs } from 'react-router';
/**
 * GET /api/analytics/growth-engine-performance
 *
 * Query parameters:
 * - action: 'report' | 'insights' | 'plans' | 'metrics' | 'trends'
 * - format: ' ' | 'summary'
 */
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
/**
 * POST /api/analytics/growth-engine-performance
 *
 * Actions:
 * - start-monitoring: Start performance monitoring
 * - stop-monitoring: Stop performance monitoring
 * - generate-plans: Generate optimization plans
 */
export declare function action({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.analytics.growth-engine-performance.d.ts.map