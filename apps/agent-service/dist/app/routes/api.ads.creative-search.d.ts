/**
 * Ad Creative Search API
 *
 * Provides search and recommendation endpoints for ad creative optimization
 * using image similarity search.
 *
 * Part of ADS-IMAGE-SEARCH-001: Use Image Search for Ad Creative Optimization
 *
 * @module app/routes/api.ads.creative-search
 */
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
/**
 * GET /api/ads/creative-search
 *
 * Search for similar ad creatives by text query or reference image
 *
 * Query Parameters:
 * - q: Text search query (optional)
 * - referenceImageId: Reference image ID for similarity search (optional)
 * - limit: Maximum results (default: 10)
 * - minRoas: Minimum ROAS filter (optional)
 * - minCtr: Minimum CTR filter (optional)
 * - minConversions: Minimum conversions filter (optional)
 * - platforms: Comma-separated platforms (optional)
 */
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
/**
 * POST /api/ads/creative-search
 *
 * Get recommendations for similar high-performing creatives
 *
 * Request Body:
 * {
 *   referenceImageId: string;
 *   minRoas?: number;
 *   minCtr?: number;
 *   minConversions?: number;
 *   limit?: number;
 * }
 */
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.ads.creative-search.d.ts.map