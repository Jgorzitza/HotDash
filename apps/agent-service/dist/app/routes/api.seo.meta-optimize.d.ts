/**
 * API Route: Meta Tag Optimization
 *
 * POST /api/seo/meta-optimize
 *
 * Automatically optimizes meta tags for a page based on content analysis,
 * keyword research, and Search Console data.
 *
 * Request body:
 * {
 *   url: string;
 *   title?: string;
 *   description?: string;
 *   content: string;
 * }
 *
 * Response:
 * {
 *   success: boolean;
 *   data: MetaOptimizationResult;
 *   timestamp: string;
 * }
 */
import { type ActionFunctionArgs } from "react-router";
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
/**
 * GET endpoint to retrieve optimization suggestions for a URL
 */
export declare function loader({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.seo.meta-optimize.d.ts.map