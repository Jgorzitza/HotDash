/**
 * POST /api/cx-themes/process
 *
 * Processes CX conversation themes and generates Action Queue items
 * Called by nightly job or manually to convert customer feedback into actionable tasks
 */
import type { ActionFunctionArgs } from "react-router";
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
export declare const loader: () => Promise<any>;
//# sourceMappingURL=process.d.ts.map