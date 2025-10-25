import type { LoaderFunctionArgs } from "react-router";
/**
 * GET /api/analytics/growth-metrics
 *
 * Returns overall growth metrics across all channels
 *
 * Response:
 * {
 *   weeklyGrowth: number,
 *   totalReach: number,
 *   bestChannel: { name, growth },
 *   trend: { labels, social, seo, ads, email },
 *   channelComparison: Array<{ channel, thisWeek, lastWeek, growth }>
 * }
 */
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.analytics.growth-metrics.d.ts.map