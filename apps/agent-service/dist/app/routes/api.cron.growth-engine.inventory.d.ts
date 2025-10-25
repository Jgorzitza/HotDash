/**
 * Hourly Inventory Agent Cron Job
 *
 * POST /api/cron/growth-engine/inventory
 *
 * Runs hourly inventory analysis to monitor stock levels and generate reorder proposals.
 * Populates the Action Queue with inventory actions.
 *
 * Schedule: Hourly
 *
 * @module routes/api/cron/growth-engine/inventory
 */
import { type ActionFunctionArgs } from "react-router";
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.cron.growth-engine.inventory.d.ts.map