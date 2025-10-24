/**
 * API Route: SEO Anomalies
 *
 * GET /api/seo/anomalies
 *
 * Returns comprehensive SEO anomaly detection including:
 * - Traffic drops > 20% week-over-week (from GA4)
 * - Keyword ranking losses (from Search Console)
 * - Core Web Vitals failures (from CrUX/PageSpeed)
 * - Crawl errors (from Search Console)
 *
 * Response includes severity classification (critical, warning, info)
 * and aggregated summary for dashboard tile display.
 *
 * @module routes/api/seo/anomalies
 */
import { type LoaderFunctionArgs } from "react-router";
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.seo.anomalies.d.ts.map