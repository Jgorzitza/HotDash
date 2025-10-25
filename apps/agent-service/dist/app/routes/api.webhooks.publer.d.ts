/**
 * API Route: Publer Webhooks
 *
 * POST /api/webhooks/publer
 *
 * Receives webhook events from Publer
 * Verifies HMAC-SHA256 signature
 * Updates approval and post status
 */
import type { ActionFunctionArgs } from "react-router";
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
export declare function loader(): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.webhooks.publer.d.ts.map