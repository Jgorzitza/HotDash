import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

/**
 * GET /api/analytics/social-performance
 * 
 * Returns social media performance metrics for dashboard tile and modal
 * 
 * Response:
 * {
 *   totalPosts: number,
 *   avgEngagement: number,
 *   topPost: { platform, content, impressions, engagement },
 *   trend: { labels: string[], impressions: number[], engagement: number[] },
 *   topPosts: Array<{ postId, platform, content, metrics }>
 * }
 * 
 * Future: Use app/services/analytics/social-performance.ts
 * For now: Returns mock data (Phase 11 will wire Publer API)
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  if (!session?.shop) {
    return Response.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  // Mock data for social performance
  const mockData = {
    totalPosts: 24,
    avgEngagement: 342,
    topPost: {
      platform: "Instagram",
      content: "Winter collection drop - Limited edition snow gear ❄️",
      impressions: 5240,
      engagement: 892,
    },
    trend: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      impressions: [1200, 1850, 2100, 1950, 3200, 5240, 4100],
      engagement: [145, 234, 278, 312, 445, 892, 658],
    },
    topPosts: [
      {
        postId: "post-1",
        platform: "Instagram",
        content: "Winter collection drop - Limited edition...",
        metrics: {
          impressions: 5240,
          clicks: 342,
          engagement: 892,
          ctr: 6.5,
          engagementRate: 17.0,
        },
      },
      {
        postId: "post-2",
        platform: "Facebook",
        content: "Flash sale on premium snow gear - 24h only...",
        metrics: {
          impressions: 3100,
          clicks: 245,
          engagement: 534,
          ctr: 7.9,
          engagementRate: 17.2,
        },
      },
      {
        postId: "post-3",
        platform: "Instagram",
        content: "Customer spotlight: @snow_enthusiast loving...",
        metrics: {
          impressions: 2450,
          clicks: 189,
          engagement: 421,
          ctr: 7.7,
          engagementRate: 17.2,
        },
      },
    ],
  };

  return Response.json({ ok: true, data: mockData });
}
