/**
 * Content Performance API Route
 *
 * Provides endpoints for fetching content performance metrics:
 * - Individual post performance
 * - Aggregated performance across date ranges
 * - Top performing posts
 *
 * Supports multiple platforms: Instagram, Facebook, TikTok
 */
import { type LoaderFunctionArgs } from "react-router";
/**
 * GET /api/content/performance
 *
 * Query parameters:
 * - type: 'post' | 'aggregated' | 'top' (required)
 * - postId: string (required for type=post)
 * - platform: 'instagram' | 'facebook' | 'tiktok' (required for type=post)
 * - startDate: YYYY-MM-DD (required for type=aggregated|top)
 * - endDate: YYYY-MM-DD (required for type=aggregated|top)
 * - limit: number (optional for type=top, default=10)
 * - sortBy: 'engagement' | 'reach' | 'clicks' | 'conversions' (optional for type=top)
 */
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=content.performance.d.ts.map