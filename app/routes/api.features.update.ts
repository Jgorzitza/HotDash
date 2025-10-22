/**
 * API Route: Update Feature Flag
 * 
 * POST /api/features/update
 * 
 * Updates feature flag settings (enable/disable, rollout %, targeting).
 */

// React Router 7: Use Response.json() instead of json() helper
import type { Route } from "./+types/api.features.update";
import { featureFlagService } from "~/services/experiments/feature-flags";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { flagId, action: updateAction, value } = body;

    if (!flagId || !updateAction) {
      return Response.json(
        { error: "Missing required fields: flagId, action" },
        { status: 400 }
      );
    }

    // Perform requested action
    switch (updateAction) {
      case "enable":
        await featureFlagService.enableFeature(flagId);
        break;

      case "disable":
        await featureFlagService.disableFeature(flagId);
        break;

      case "updateRollout":
        if (typeof value !== "number") {
          return Response.json(
            { error: "Rollout percentage must be a number (0-100)" },
            { status: 400 }
          );
        }
        await featureFlagService.updateRolloutPercentage(flagId, value);
        break;

      case "addTargetUser":
        if (typeof value !== "string") {
          return Response.json(
            { error: "Target user must be a string" },
            { status: 400 }
          );
        }
        await featureFlagService.addTargetUser(flagId, value);
        break;

      case "removeTargetUser":
        if (typeof value !== "string") {
          return Response.json(
            { error: "Target user must be a string" },
            { status: 400 }
          );
        }
        await featureFlagService.removeTargetUser(flagId, value);
        break;

      default:
        return Response.json(
          { error: `Invalid action: ${updateAction}` },
          { status: 400 }
        );
    }

    // Return updated flag
    const updatedFlag = await featureFlagService.getFeatureFlag(flagId);

    return Response.json({
      success: true,
      flag: updatedFlag,
      message: `Feature flag ${flagId} updated successfully`
    });
  } catch (error) {
    console.error("[API] Feature update error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


