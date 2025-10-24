/**
 * API Route: Keyword Cannibalization Detection
 *
 * GET /api/seo/cannibalization
 *
 * Returns keyword cannibalization analysis:
 * - Keywords with multiple pages competing
 * - Severity scoring
 * - Consolidation recommendations
 * - Estimated traffic impact
 *
 * @module routes/api/seo/cannibalization
 */
import { type LoaderFunctionArgs } from "react-router";
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
/**
 * POST endpoint to resolve cannibalization conflicts
 */
export declare function action({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.seo.cannibalization.d.ts.map