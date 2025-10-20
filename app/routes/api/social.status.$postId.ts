import type { LoaderFunctionArgs } from "react-router";
import { json } from "~/utils/http.server";
import shopify from "~/shopify.server";
import { getJobStatus } from "~/../packages/integrations/publer.ts";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await shopify.authenticate.admin(request);

  const { postId } = params;
  if (!postId) {
    return json({ error: "postId is required" }, { status: 400 });
  }

  try {
    const status = await getJobStatus(postId);
    return json({ ok: true, status });
  } catch (error) {
    return json(
      {
        ok: false,
        error: "Failed to fetch job status",
      },
      { status: 502 },
    );
  }
}
