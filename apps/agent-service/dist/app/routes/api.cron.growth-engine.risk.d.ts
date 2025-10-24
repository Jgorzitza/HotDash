/**
 * Continuous Risk Agent Cron Job
 *
 * POST /api/cron/growth-engine/risk
 *
 * Runs continuous risk monitoring for fraud detection and compliance.
 * Populates the Action Queue with risk mitigation actions.
 *
 * Schedule: Every 15 minutes
 *
 * @module routes/api/cron/growth-engine/risk
 */
import { type ActionFunctionArgs } from "react-router";
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.cron.growth-engine.risk.d.ts.map