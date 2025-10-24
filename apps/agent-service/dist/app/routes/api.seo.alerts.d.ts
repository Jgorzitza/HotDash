/**
 * SEO Alerts API
 *
 * GET /api/seo/alerts - Get active alerts
 * POST /api/seo/alerts/resolve - Resolve an alert
 * POST /api/seo/alerts/diagnose - Diagnose an alert and create resolution workflow
 * POST /api/seo/alerts/approve - Approve a resolution workflow
 * POST /api/seo/alerts/apply - Apply an approved resolution
 * POST /api/seo/alerts/rollback - Rollback an applied resolution
 */
import { type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
/**
 * GET - Get active alerts
 */
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
/**
 * POST - Handle alert actions
 */
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.seo.alerts.d.ts.map