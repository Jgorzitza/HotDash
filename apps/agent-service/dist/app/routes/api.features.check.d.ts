/**
 * API Route: Check Feature Flag
 *
 * GET /api/features/check/:flagId
 * POST /api/features/check
 *
 * Checks if a feature is enabled for a user.
 * Returns enabled status and reason.
 */
import type { Route } from "./+types/api.features.check";
export declare function loader({ params, request }: Route.LoaderArgs): Promise<import("node_modules/undici-types").Response>;
export declare function action({ request }: Route.ActionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.features.check.d.ts.map