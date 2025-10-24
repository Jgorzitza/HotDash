/**
 * API Route: Social Post Publishing
 *
 * POST /api/social/publish
 *
 * Publishes an approved social post via Publer adapter
 * Updates social_posts table with receipt
 */
import type { ActionFunctionArgs } from "react-router";
import type { SocialPostApproval } from "~/services/publer/adapter";
export interface PublishRequest {
    approval: SocialPostApproval;
}
export interface PublishResponse {
    success: boolean;
    jobId?: string;
    receiptId?: string;
    error?: string;
}
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
export declare function loader(): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.social.publish.d.ts.map