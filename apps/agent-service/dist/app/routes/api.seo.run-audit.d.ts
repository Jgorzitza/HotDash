/**
 * API Route: Run SEO Audit
 *
 * POST /api/seo/run-audit
 *
 * Triggers a daily automated SEO audit that checks:
 * - Title tags (presence, length, uniqueness)
 * - Meta descriptions (presence, length, uniqueness)
 * - Header tags (H1 presence and structure)
 * - Images (alt text presence)
 *
 * Returns comprehensive audit results with issues categorized by severity.
 *
 * @module routes/api/seo/run-audit
 */
import { type ActionFunctionArgs } from "react-router";
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
/**
 * GET endpoint to retrieve last audit results
 */
export declare function loader({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.seo.run-audit.d.ts.map