import type { LoaderFunctionArgs } from "react-router";
/**
 * GET /api/analytics/ads-roas
 *
 * Returns advertising campaign ROAS metrics
 *
 * Response:
 * {
 *   totalSpend: number,
 *   totalRevenue: number,
 *   roas: number,
 *   topCampaign: { name, platform, roas, spend },
 *   trend: { labels, roas, spend },
 *   campaigns: Array<{ name, platform, spend, revenue, roas }>
 * }
 */
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.analytics.ads-roas.d.ts.map