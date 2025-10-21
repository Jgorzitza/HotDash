/**
 * API Route: Assign Experiment Variant
 * 
 * POST /api/experiments/assign
 * 
 * Assigns a user to an experiment variant using deterministic hashing.
 * Returns the assigned variant ID and configuration.
 */

import { json } from "react-router";
import type { Route } from "./+types/api.experiments.assign";
import { abTestingService } from "~/services/experiments/ab-testing";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { userId, experimentId } = body;

    // Validate inputs
    if (!userId || !experimentId) {
      return json(
        { error: "Missing required fields: userId, experimentId" },
        { status: 400 }
      );
    }

    // Get experiment configuration
    const experiment = abTestingService.getExperiment(experimentId);
    if (!experiment) {
      return json(
        { error: `Experiment not found: ${experimentId}` },
        { status: 404 }
      );
    }

    // Check if experiment is running
    if (experiment.status !== "running") {
      return json(
        { error: `Experiment is not running: ${experiment.status}` },
        { status: 400 }
      );
    }

    // Assign variant (deterministic)
    const assignment = abTestingService.assignVariant(userId, experiment);

    // Track exposure
    await abTestingService.trackExposure(
      experimentId,
      assignment.variantId,
      userId
    );

    // Get variant configuration
    const config = abTestingService.getExperimentConfig(userId, experimentId);

    return json({
      success: true,
      assignment: {
        experimentId: assignment.experimentId,
        variantId: assignment.variantId,
        userId: assignment.userId,
        assignedAt: assignment.assignedAt.toISOString(),
        config
      }
    });
  } catch (error) {
    console.error("[API] Experiment assign error:", error);
    return json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


