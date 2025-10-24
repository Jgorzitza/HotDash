/**
 * API Route: Daily Cannibalization Detection Cron
 *
 * POST /api/cron/seo-cannibalization
 *
 * Runs daily cannibalization detection and stores results in database.
 * Called by GitHub Actions or external cron services.
 *
 * @module routes/api/cron/seo-cannibalization
 */
import { type ActionFunctionArgs } from "react-router";
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.cron.seo-cannibalization.d.ts.map