/**
 * Data Validation API Route
 *
 * GET /api/analytics/validation
 * Query params:
 * - project: Shop domain (default: "occ")
 * - days: Period to validate (default: 30)
 *
 * Returns data quality report with score and issues
 * Uses Response.json() per React Router 7 pattern
 */
import type { LoaderFunctionArgs } from "react-router";
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.analytics.validation.d.ts.map