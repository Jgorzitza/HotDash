import type { LoaderFunctionArgs } from "react-router";
/**
 * GET /api/analytics/seo-impact
 *
 * Returns SEO ranking performance metrics
 *
 * Response:
 * {
 *   totalKeywords: number,
 *   avgPosition: number,
 *   topMover: { keyword, oldPosition, newPosition, change },
 *   trend: { labels, positions },
 *   topMovers: Array<{ keyword, position, change, url }>
 * }
 */
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.analytics.seo-impact.d.ts.map