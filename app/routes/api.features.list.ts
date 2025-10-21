/**
 * API Route: List Feature Flags
 * 
 * GET /api/features/list
 * 
 * Returns all feature flags with their current status.
 */

import { json } from "react-router";
import type { Route } from "./+types/api.features.list";
import { featureFlagService } from "~/services/experiments/feature-flags";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    // Get all feature flags
    const flags = await featureFlagService.getAllFeatureFlags();

    // If userId provided, check each flag for this user
    let flagsWithStatus = flags;
    if (userId) {
      flagsWithStatus = await Promise.all(
        flags.map(async (flag) => {
          const check = await featureFlagService.checkFeature(flag.id, userId);
          return {
            ...flag,
            isEnabledForUser: check.isEnabled,
            reason: check.reason
          };
        })
      );
    }

    return json({
      success: true,
      flags: flagsWithStatus.map(flag => ({
        id: flag.id,
        name: flag.name,
        description: flag.description,
        enabled: flag.enabled,
        rolloutPercentage: flag.rolloutPercentage,
        environment: flag.environment,
        isEnabledForUser: (flag as any).isEnabledForUser,
        reason: (flag as any).reason
      })),
      count: flagsWithStatus.length
    });
  } catch (error) {
    console.error("[API] Feature list error:", error);
    return json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

