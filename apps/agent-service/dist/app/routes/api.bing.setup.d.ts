/**
 * API Route: Bing Webmaster Tools Setup
 *
 * POST /api/bing/setup
 *
 * Sets up Bing Webmaster Tools integration:
 * - Site verification
 * - Sitemap submission
 * - Initial metrics collection
 */
import type { ActionFunctionArgs } from "react-router";
export interface BingSetupRequest {
    domain: string;
    sitemapUrl: string;
}
export interface BingSetupResponse {
    success: boolean;
    siteId?: string;
    sitemapId?: string;
    verificationToken?: string;
    error?: string;
}
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
export declare function loader(): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.bing.setup.d.ts.map