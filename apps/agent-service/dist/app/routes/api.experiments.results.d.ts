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
import type { Route } from "./+types/api.experiments.results";
export declare function loader({ params }: Route.LoaderArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.experiments.results.d.ts.map