import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

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
export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  if (!session?.shop) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const mockData = {
    totalKeywords: 142,
    avgPosition: 12.4,
    topMover: {
      keyword: "snow boots",
      oldPosition: 24,
      newPosition: 8,
      change: -16,
    },
    trend: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      positions: [15.2, 13.8, 12.1, 12.4],
    },
    topMovers: [
      {
        keyword: "snow boots",
        position: 8,
        change: -16,
        url: "/products/snow-boots",
      },
      {
        keyword: "winter gloves",
        position: 5,
        change: -12,
        url: "/products/gloves",
      },
      {
        keyword: "thermal jacket",
        position: 11,
        change: -8,
        url: "/products/jackets",
      },
      {
        keyword: "ski goggles",
        position: 14,
        change: 3,
        url: "/products/goggles",
      },
    ],
  };

  return Response.json({ ok: true, data: mockData });
}
