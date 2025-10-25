/**
 * API Route: Track Experiment Event
 *
 * POST /api/experiments/track
 *
 * Tracks experiment events (exposure, conversion, engagement).
 * Used for collecting data to calculate experiment results.
 */

// React Router 7: Use Response.json() instead of json() helper
import type { Route } from "./+types/api.experiments.track";
import { abTestingService } from "~/services/experiments/ab-testing";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const {
      experimentId,
      variantId,
      userId,
      eventType,
      eventName,
      value,
      metadata,
    } = body;

    // Validate inputs
    if (!experimentId || !variantId || !userId || !eventType || !eventName) {
      return Response.json(
        {
          error:
            "Missing required fields: experimentId, variantId, userId, eventType, eventName",
        },
        { status: 400 },
      );
    }

    // Validate event type
    const validEventTypes = ["exposure", "conversion", "engagement"];
    if (!validEventTypes.includes(eventType)) {
      return Response.json(
        {
          error: `Invalid eventType. Must be one of: ${validEventTypes.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Track event based on type
    switch (eventType) {
      case "exposure":
        await abTestingService.trackExposure(experimentId, variantId, userId);
        break;

      case "conversion":
        await abTestingService.trackConversion(
          experimentId,
          variantId,
          userId,
          eventName,
          value,
        );
        break;

      case "engagement":
        await abTestingService.trackEngagement(
          experimentId,
          variantId,
          userId,
          eventName,
          metadata,
        );
        break;
    }

    return Response.json({
      success: true,
      tracked: {
        experimentId,
        variantId,
        userId,
        eventType,
        eventName,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[API] Experiment track error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
