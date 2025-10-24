/**
 * Daily Analytics Agent Cron Job
 *
 * POST /api/cron/growth-engine/analytics
 *
 * Runs daily analytics analysis to identify high-value opportunities.
 * Analyzes GSC and GA4 data to populate the Action Queue.
 *
 * Schedule: Daily at 3 AM UTC
 *
 * @module routes/api/cron/growth-engine/analytics
 */
import { type ActionFunctionArgs } from "react-router";
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.cron.growth-engine.analytics.d.ts.map