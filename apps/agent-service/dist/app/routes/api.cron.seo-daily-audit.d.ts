/**
 * Daily SEO Audit Cron Job
 *
 * POST /api/cron/seo-daily-audit
 *
 * Runs daily automated SEO audits for all configured shop domains.
 * This endpoint is called by a cron job scheduler (e.g., GitHub Actions,
 * external cron service, or pg_cron) to perform daily SEO health checks.
 *
 * Features:
 * - Audits all configured shop domains
 * - Stores results in database for historical tracking
 * - Generates anomaly reports for significant changes
 * - Sends notifications for critical issues
 *
 * @module routes/api/cron/seo-daily-audit
 */
import { type ActionFunctionArgs } from "react-router";
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.cron.seo-daily-audit.d.ts.map