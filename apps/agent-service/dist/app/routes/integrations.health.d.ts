/**
 * Integration Health Dashboard
 *
 * Real-time monitoring dashboard for all third-party integrations:
 * - Shopify Admin API
 * - Publer Social Media API
 * - Chatwoot Customer Service API
 *
 * Features:
 * - Real-time health status
 * - Circuit breaker status
 * - Performance metrics
 * - Rate limit monitoring
 * - Incident tracking
 */
import type { LoaderFunctionArgs } from 'react-router';
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
export default function IntegrationHealthDashboard(): React.JSX.Element;
//# sourceMappingURL=integrations.health.d.ts.map