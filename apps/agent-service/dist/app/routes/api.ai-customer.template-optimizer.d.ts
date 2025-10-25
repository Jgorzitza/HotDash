/**
 * API Route: AI-Customer Template Optimization
 *
 * GET /api/ai-customer/template-optimizer?timeRange=30d
 *
 * Analyzes template performance based on HITL grades and provides
 * optimization recommendations, pattern analysis, and A/B test candidates.
 *
 * Query Parameters:
 * - timeRange: '7d' | '30d' | '90d' | 'all' (optional, default: '30d')
 *
 * @see docs/directions/ai-customer.md AI-CUSTOMER-002
 */
import { type LoaderFunctionArgs } from "react-router";
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.ai-customer.template-optimizer.d.ts.map