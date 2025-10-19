import type { ActionFunctionArgs } from "react-router";
import { json } from "~/utils/http.server";
import { authenticate } from "~/shopify.server";
import { schedulePost } from "../../../packages/integrations/publer.ts";

type Payload = {
  text: string;
  accountIds: string[];
  scheduledAt?: string;
  workspaceId?: string;
};

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);

  if (request.method.toUpperCase() !== "POST") {
    return json({ error: "Method Not Allowed" }, { status: 405 });
  }

  let payload: Payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    !payload?.text ||
    !Array.isArray(payload?.accountIds) ||
    payload.accountIds.length === 0
  ) {
    return json(
      { error: "text and accountIds[] are required" },
      { status: 400 },
    );
  }

  try {
    const job = await schedulePost({
      text: payload.text,
      accountIds: payload.accountIds,
      scheduledAt: payload.scheduledAt,
      workspaceId: payload.workspaceId,
    });
    return json({ ok: true, jobId: job.job_id, shop: session.shop });
  } catch (e) {
    return json(
      { ok: false, error: "Failed to schedule post" },
      { status: 502 },
    );
  }
}

export const loader = async () => json({ error: "Not Found" }, { status: 404 });
