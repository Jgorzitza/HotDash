/**
 * API Route: Enhanced SEO Dashboard
 *
 * GET /api/seo/enhanced
 *
 * Returns comprehensive SEO metrics from multiple sources:
 * - Google Analytics (traffic and organic sessions)
 * - Google Search Console (organic search performance)
 * - Bing Webmaster Tools (Bing search performance)
 *
 * Provides graceful degradation if any source is unavailable.
 */
import { type LoaderFunctionArgs } from "react-router";
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.seo.enhanced.d.ts.map