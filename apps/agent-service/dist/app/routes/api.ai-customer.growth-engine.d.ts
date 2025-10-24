/**
 * AI-Customer Growth Engine API Route
 *
 * Provides API endpoints for Growth Engine AI functionality including
 * initialization, workflow execution, status monitoring, and configuration.
 *
 * @route /api/ai-customer/growth-engine
 * @see app/services/ai-customer/growth-engine-ai.ts
 */
import { type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
/**
 * GET /api/ai-customer/growth-engine
 * Get Growth Engine AI status and configuration
 */
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response | {
    status: number;
}>;
/**
 * POST /api/ai-customer/growth-engine
 * Execute Growth Engine AI operations
 */
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response | {
    status: number;
}>;
//# sourceMappingURL=api.ai-customer.growth-engine.d.ts.map