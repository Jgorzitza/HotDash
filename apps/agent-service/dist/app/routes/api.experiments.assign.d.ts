/**
 * API Route: Assign Experiment Variant
 *
 * POST /api/experiments/assign
 *
 * Assigns a user to an experiment variant using deterministic hashing.
 * Returns the assigned variant ID and configuration.
 */
import type { Route } from "./+types/api.experiments.assign";
export declare function action({ request }: Route.ActionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.experiments.assign.d.ts.map