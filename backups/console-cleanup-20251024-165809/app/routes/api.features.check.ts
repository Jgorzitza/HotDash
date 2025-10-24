/**
 * API Route: Check Feature Flag
 *
 * GET /api/features/check/:flagId
 * POST /api/features/check
 *
 * Checks if a feature is enabled for a user.
 * Returns enabled status and reason.
 */

// React Router 7: Use Response.json() instead of json() helper
import type { Route } from "./+types/api.features.check";
import { featureFlagService } from "~/services/experiments/feature-flags";

export async function loader({ params, request }: Route.LoaderArgs) {
  try {
    const { flagId } = params;
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const userSegment = url.searchParams.get("userSegment") || undefined;

    if (!flagId || !userId) {
      return Response.json(
        { error: "Missing required parameters: flagId, userId" },
        { status: 400 },
      );
    }

    const check = await featureFlagService.checkFeature(
      flagId,
      userId,
      userSegment,
    );

    return Response.json({
      success: true,
      flagId: check.flagId,
      userId: check.userId,
      isEnabled: check.isEnabled,
      reason: check.reason,
      checkedAt: check.checkedAt.toISOString(),
    });
  } catch (error) {
    console.error("[API] Feature check error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { flagId, userId, userSegment } = body;

    if (!flagId || !userId) {
      return Response.json(
        { error: "Missing required fields: flagId, userId" },
        { status: 400 },
      );
    }

    const check = await featureFlagService.checkFeature(
      flagId,
      userId,
      userSegment,
    );

    return Response.json({
      success: true,
      flagId: check.flagId,
      userId: check.userId,
      isEnabled: check.isEnabled,
      reason: check.reason,
      checkedAt: check.checkedAt.toISOString(),
    });
  } catch (error) {
    console.error("[API] Feature check error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
