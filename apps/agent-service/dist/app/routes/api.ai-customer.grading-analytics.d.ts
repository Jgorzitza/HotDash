/**
 * API Route: AI-Customer Grading Analytics
 *
 * GET /api/ai-customer/grading-analytics?timeRange=30d
 *
 * Returns analytics on tone/accuracy/policy grades from HITL workflow.
 * Provides insights on AI response quality and identifies patterns.
 *
 * Query Parameters:
 * - timeRange: '7d' | '30d' | '90d' | 'all' (optional, default: '30d')
 *
 * @see docs/directions/ai-customer.md AI-CUSTOMER-001
 */
import { type LoaderFunctionArgs } from "react-router";
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.ai-customer.grading-analytics.d.ts.map