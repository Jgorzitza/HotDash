import { authenticate } from "../shopify.server";
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
export async function loader({ request }) {
    const { session } = await authenticate.admin(request);
    if (!session?.shop) {
        return Response.json({ error: "Not authenticated" }, { status: 401 });
    }
    const mockData = {
        totalSpend: 4250,
        totalRevenue: 18900,
        roas: 4.45,
        topCampaign: {
            name: "Winter Collection Launch",
            platform: "Google Ads",
            roas: 6.2,
            spend: 1200,
        },
        trend: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            roas: [3.2, 3.8, 4.1, 4.5, 5.2, 4.8, 4.45],
            spend: [550, 620, 580, 610, 720, 650, 520],
        },
        campaigns: [
            {
                name: "Winter Collection Launch",
                platform: "Google",
                spend: 1200,
                revenue: 7440,
                roas: 6.2,
            },
            {
                name: "Retargeting - Cart Abandon",
                platform: "Facebook",
                spend: 850,
                revenue: 3825,
                roas: 4.5,
            },
            {
                name: "Snow Gear - Search",
                platform: "Google",
                spend: 950,
                revenue: 3800,
                roas: 4.0,
            },
            {
                name: "Brand Awareness",
                platform: "Instagram",
                spend: 750,
                revenue: 2250,
                roas: 3.0,
            },
        ],
        distribution: [
            { platform: "Google Ads", spend: 2150, percentage: 50.6 },
            { platform: "Facebook Ads", spend: 1250, percentage: 29.4 },
            { platform: "Instagram Ads", spend: 850, percentage: 20.0 },
        ],
    };
    return Response.json({ ok: true, data: mockData });
}
//# sourceMappingURL=api.analytics.ads-roas.js.map