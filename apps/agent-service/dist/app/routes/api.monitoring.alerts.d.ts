/**
 * Monitoring Alerts API
 *
 * GET /api/monitoring/alerts - Get all alerts
 * POST /api/monitoring/alerts/:id/acknowledge - Acknowledge an alert
 *
 * Manages monitoring alerts and acknowledgments.
 *
 * @see DEVOPS-017
 */
import { type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
/**
 * Get alerts loader
 */
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
/**
 * Acknowledge alert action
 */
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.monitoring.alerts.d.ts.map