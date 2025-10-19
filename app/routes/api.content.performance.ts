/**
 * Content Performance API Route
 *
 * GET /api/content/performance
 *
 * Query params:
 * - type: 'post' | 'aggregated' | 'top'
 * - postId (for type=post)
 * - platform (for type=post)
 * - startDate (for type=aggregated|top)
 * - endDate (for type=aggregated|top)
 * - limit (for type=top)
 * - sortBy (for type=top)
 *
 * @see app/lib/content/tracking.ts
 * @see docs/specs/content_tracking.md
 */

import type { LoaderFunctionArgs } from "react-router";
import { json } from "react-router";
import {
  getContentPerformance,
  getAggregatedPerformance,
  getTopPerformingPosts,
  type SocialPlatform,
} from "~/lib/content/tracking";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  if (!type) {
    return json({ error: "Missing required parameter: type" }, { status: 400 });
  }

  try {
    switch (type) {
      case "post": {
        const postId = url.searchParams.get("postId");
        const platform = url.searchParams.get("platform") as SocialPlatform;

        if (!postId || !platform) {
          return json(
            { error: "Missing required parameters: postId, platform" },
            { status: 400 },
          );
        }

        const performance = await getContentPerformance(postId, platform);
        return json({ performance });
      }

      case "aggregated": {
        const startDate = url.searchParams.get("startDate");
        const endDate = url.searchParams.get("endDate");
        const platform = url.searchParams.get("platform") as
          | SocialPlatform
          | undefined;

        if (!startDate || !endDate) {
          return json(
            { error: "Missing required parameters: startDate, endDate" },
            { status: 400 },
          );
        }

        const performance = await getAggregatedPerformance(
          startDate,
          endDate,
          platform,
        );
        return json({ performance });
      }

      case "top": {
        const startDate = url.searchParams.get("startDate");
        const endDate = url.searchParams.get("endDate");
        const limit = parseInt(url.searchParams.get("limit") || "10", 10);
        const sortBy = (url.searchParams.get("sortBy") || "engagement") as
          | "engagement"
          | "reach"
          | "clicks"
          | "conversions";

        if (!startDate || !endDate) {
          return json(
            { error: "Missing required parameters: startDate, endDate" },
            { status: 400 },
          );
        }

        if (limit < 1 || limit > 100) {
          return json(
            { error: "Parameter limit must be between 1 and 100" },
            { status: 400 },
          );
        }

        const posts = await getTopPerformingPosts(
          startDate,
          endDate,
          limit,
          sortBy,
        );
        return json({ posts });
      }

      default:
        return json(
          {
            error: `Invalid type: ${type}. Must be 'post', 'aggregated', or 'top'`,
          },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Content performance API error:", error);
    return json(
      { error: "Failed to fetch content performance" },
      { status: 500 },
    );
  }
}
