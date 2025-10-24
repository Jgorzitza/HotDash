// React Router 7: Use Response.json() from "~/utils/http.server";
import shopify from "~/shopify.server";
import { schedulePost } from "../../../packages/integrations/publer.ts";
export async function action({ request }) {
    const { session } = await shopify.authenticate.admin(request);
    if (request.method.toUpperCase() !== "POST") {
        return Response.json({ error: "Method Not Allowed" }, { status: 405 });
    }
    let payload;
    try {
        payload = await request.json();
    }
    catch {
        return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    if (!payload?.text ||
        !Array.isArray(payload?.accountIds) ||
        payload.accountIds.length === 0) {
        return Response.json({ error: "text and accountIds[] are required" }, { status: 400 });
    }
    try {
        const job = await schedulePost({
            text: payload.text,
            accountIds: payload.accountIds,
            scheduledAt: payload.scheduledAt,
            workspaceId: payload.workspaceId,
        });
        return Response.json({ ok: true, jobId: job.job_id, shop: session.shop });
    }
    catch (e) {
        return Response.json({ ok: false, error: "Failed to schedule post" }, { status: 502 });
    }
}
export const loader = async () => json({ error: "Not Found" }, { status: 404 });
//# sourceMappingURL=social.post.js.map