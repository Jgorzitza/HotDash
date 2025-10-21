import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

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
export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  if (!session?.shop) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const mockData = {
    weeklyGrowth: 18.5,
    totalReach: 45200,
    bestChannel: {
      name: "Social Media",
      growth: 24.3,
    },
    trend: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      social: [8500, 11200, 14800, 18400],
      seo: [12000, 13500, 14200, 15100],
      ads: [6200, 7400, 8900, 9500],
      email: [2100, 2300, 2800, 2200],
    },
    channelComparison: [
      { channel: "Social Media", thisWeek: 18400, lastWeek: 14800, growth: 24.3 },
      { channel: "SEO/Organic", thisWeek: 15100, lastWeek: 14200, growth: 6.3 },
      { channel: "Paid Ads", thisWeek: 9500, lastWeek: 8900, growth: 6.7 },
      { channel: "Email", thisWeek: 2200, lastWeek: 2800, growth: -21.4 },
    ],
    weeklyReport: {
      summary: "Social media driving significant growth (+24.3%). Email campaign underperformed this week.",
      recommendations: [
        "Double down on Instagram content (highest engagement)",
        "Review email subject lines (low open rate)",
        "Increase ad spend on top-performing campaigns",
      ],
    },
  };

  return Response.json({ ok: true, data: mockData });
}
