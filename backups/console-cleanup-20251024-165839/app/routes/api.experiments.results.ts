/**
 * API Route: Get Experiment Results
 *
 * GET /api/experiments/results/:experimentId
 *
 * Returns experiment results including:
 * - Sample sizes per variant
 * - Conversion rates per variant
 * - Statistical significance (chi-square test, p-value)
 * - Winner declaration (if significant)
 */

// React Router 7: Use Response.json() instead of json() helper
import type { Route } from "./+types/api.experiments.results";
import { abTestingService } from "~/services/experiments/ab-testing";

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const { experimentId } = params;

    if (!experimentId) {
      return Response.json(
        { error: "Missing experimentId parameter" },
        { status: 400 },
      );
    }

    // Get experiment configuration
    const experiment = abTestingService.getExperiment(experimentId);
    if (!experiment) {
      return Response.json(
        { error: `Experiment not found: ${experimentId}` },
        { status: 404 },
      );
    }

    // Calculate statistical significance
    const significance =
      await abTestingService.calculateSignificance(experimentId);

    // Prepare results response
    const results = {
      experimentId,
      experimentName: experiment.name,
      status: experiment.status,
      startDate: experiment.startDate.toISOString(),
      endDate: experiment.endDate?.toISOString() || null,

      // Sample sizes
      sampleSizes: significance.sampleSizes,

      // Conversion rates (as percentages)
      conversionRates: Object.fromEntries(
        Object.entries(significance.conversionRates).map(([variant, rate]) => [
          variant,
          (rate * 100).toFixed(2) + "%",
        ]),
      ),

      // Statistical significance
      statistical: {
        chiSquare: significance.chiSquare.toFixed(4),
        pValue: significance.pValue.toFixed(4),
        isSignificant: significance.isSignificant,
        confidenceLevel: "95%",
      },

      // Winner (if significant)
      winner: significance.winner,

      // Recommendation
      recommendation: significance.isSignificant
        ? `Variant "${significance.winner}" is statistically significant winner (p < 0.05)`
        : "No significant difference detected. Continue test or end experiment.",

      // Metadata
      targetSampleSize: experiment.targetSampleSize,
      minDetectableEffect:
        (experiment.minDetectableEffect * 100).toFixed(0) + "%",
      metrics: experiment.metrics,
    };

    return Response.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("[API] Experiment results error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
