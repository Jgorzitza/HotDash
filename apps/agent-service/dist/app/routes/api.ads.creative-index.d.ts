/**
 * Ad Creative Indexing API
 *
 * Provides endpoints for indexing ad creatives into the image search system
 *
 * Part of ADS-IMAGE-SEARCH-001: Use Image Search for Ad Creative Optimization
 *
 * @module app/routes/api.ads.creative-index
 */
import type { ActionFunctionArgs } from "react-router";
/**
 * POST /api/ads/creative-index
 *
 * Index a single ad creative or batch index creatives for a campaign
 *
 * Single Creative Request Body:
 * {
 *   platform: 'google' | 'facebook' | 'instagram';
 *   adId: string;
 *   imageUrl: string;
 *   metadata: AdCreativeMetadata;
 * }
 *
 * Batch Request Body:
 * {
 *   platform: 'google' | 'facebook' | 'instagram';
 *   campaignId: string;
 *   dateRange: { start: string; end: string };
 * }
 */
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.ads.creative-index.d.ts.map