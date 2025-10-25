/**
 * API Route: Schema Markup Validation
 *
 * POST /api/seo/schema-validation
 *
 * Validates JSON-LD structured data on specified URLs:
 * - Product schema validation
 * - Organization schema validation
 * - WebSite schema validation
 * - Required field checking
 * - Recommendations for improvements
 *
 * @module routes/api/seo/schema-validation
 */
import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
/**
 * GET endpoint to retrieve schema validation for default URLs
 */
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.seo.schema-validation.d.ts.map