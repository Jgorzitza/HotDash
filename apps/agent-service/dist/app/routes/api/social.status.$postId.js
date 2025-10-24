// React Router 7: Use Response.json() from "~/utils/http.server";
import shopify from "~/shopify.server";
import { getJobStatus } from "../../../packages/integrations/publer.ts";
export async function loader({ request, params }) {
    await shopify.authenticate.admin(request);
    const { postId } = params;
    if (!postId) {
        return Response.json({ error: "postId is required" }, { status: 400 });
    }
    try {
        const status = await getJobStatus(postId);
        return Response.json({ ok: true, status });
    }
    catch (error) {
        return Response.json({
            ok: false,
            error: "Failed to fetch job status",
        }, { status: 502 });
    }
}
//# sourceMappingURL=social.status.$postId.js.map