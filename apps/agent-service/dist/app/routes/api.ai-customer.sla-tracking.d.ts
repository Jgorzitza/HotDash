/**
 * API Route: AI-Customer SLA Tracking
 *
 * GET /api/ai-customer/sla-tracking?timeRange=24h&firstResponseTime=60&resolutionTime=1440
 *
 * Tracks SLA performance for customer support conversations,
 * including First Response Time and Resolution Time metrics.
 * Generates alerts for breaches and at-risk conversations.
 *
 * Query Parameters:
 * - timeRange: '24h' | '7d' | '30d' (optional, default: '24h')
 * - firstResponseTime: number (minutes, optional, default: 60)
 * - resolutionTime: number (minutes, optional, default: 1440)
 * - businessHoursOnly: boolean (optional, default: true)
 *
 * @see docs/directions/ai-customer.md AI-CUSTOMER-004
 */
import { type LoaderFunctionArgs } from "react-router";
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.ai-customer.sla-tracking.d.ts.map