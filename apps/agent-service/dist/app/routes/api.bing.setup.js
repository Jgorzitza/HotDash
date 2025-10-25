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
import { createBingIntegration } from "~/services/bing/integration";
export async function action({ request }) {
    if (request.method !== "POST") {
        return Response.json({ success: false, error: "Method not allowed" }, { status: 405 });
    }
    try {
        const body = await request.json();
        if (!body.domain || !body.sitemapUrl) {
            return Response.json({ success: false, error: "domain and sitemapUrl are required" }, { status: 400 });
        }
        // Validate domain format
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
        if (!domainRegex.test(body.domain)) {
            return Response.json({ success: false, error: "Invalid domain format" }, { status: 400 });
        }
        // Validate sitemap URL format
        try {
            new URL(body.sitemapUrl);
        }
        catch {
            return Response.json({ success: false, error: "Invalid sitemap URL format" }, { status: 400 });
        }
        const integration = createBingIntegration({
            domain: body.domain,
            sitemapUrl: body.sitemapUrl,
        });
        const result = await integration.setup();
        const response = {
            success: result.success,
            siteId: result.siteId,
            sitemapId: result.sitemapId,
            verificationToken: result.verificationToken,
            error: result.error,
        };
        return Response.json(response);
    }
    catch (error) {
        console.error("[Bing Setup] Error:", error);
        return Response.json({
            success: false,
            error: error instanceof Error ? error.message : "Internal server error",
        }, { status: 500 });
    }
}
export async function loader() {
    return Response.json({ error: "Method not allowed. Use POST to setup Bing integration." }, { status: 405 });
}
//# sourceMappingURL=api.bing.setup.js.map