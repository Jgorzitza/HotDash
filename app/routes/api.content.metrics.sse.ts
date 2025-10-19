/**
 * Content Metrics SSE Endpoint
 *
 * Real-time streaming of content performance metrics.
 * Used by ContentTile for live updates.
 *
 * @see app/components/dashboard/ContentTile.tsx
 */

import type { LoaderFunctionArgs } from "react-router";
import { getAggregatedPerformance } from "~/lib/content/tracking";

export async function loader({ request }: LoaderFunctionArgs) {
  // Create SSE stream
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const sendMetrics = async () => {
        try {
          const endDate = new Date().toISOString();
          const startDate = new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000,
          ).toISOString();

          const performance = await getAggregatedPerformance(
            startDate,
            endDate,
          );

          const data = {
            postsPublished: performance.totalPosts,
            avgEngagementRate: performance.averageEngagementRate,
            avgClickThroughRate: performance.averageClickThroughRate,
            totalConversions: performance.totalConversions,
            timestamp: new Date().toISOString(),
          };

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
          );
        } catch (error) {
          console.error("SSE metrics error:", error);
        }
      };

      // Send initial metrics
      await sendMetrics();

      // Send every 5 minutes
      const interval = setInterval(sendMetrics, 5 * 60 * 1000);

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
