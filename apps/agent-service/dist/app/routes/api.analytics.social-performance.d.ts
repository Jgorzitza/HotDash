import type { LoaderFunctionArgs } from "react-router";
/**
 * GET /api/analytics/social-performance
 *
 * Returns social media performance metrics for dashboard tile and modal
 *
 * Response:
 * {
 *   totalPosts: number,
 *   avgEngagement: number,
 *   topPost: { platform, content, impressions, engagement },
 *   trend: { labels: string[], impressions: number[], engagement: number[] },
 *   topPosts: Array<{ postId, platform, content, metrics }>
 * }
 *
 * Future: Use app/services/analytics/social-performance.ts
 * For now: Returns mock data (Phase 11 will wire Publer API)
 */
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.analytics.social-performance.d.ts.map