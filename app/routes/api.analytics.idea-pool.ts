import { type LoaderFunctionArgs } from "react-router";
import { json } from "~/utils/http.server";
import {
  getIdeaPoolAnalytics,
  getMockIdeaPoolItems,
} from "../lib/analytics/idea-pool";
import { IdeaPoolResponseSchema } from "../lib/analytics/schemas";

export async function loader(_: LoaderFunctionArgs) {
  try {
    const response = await getIdeaPoolAnalytics();
    return json(response);
  } catch (error: any) {
    console.error("[API] Idea pool analytics error", error);
    const items = getMockIdeaPoolItems();
    const totals = items.reduce(
      (acc, item) => {
        if (item.status === "pending_review") acc.pending += 1;
        if (item.status === "approved") acc.approved += 1;
        if (item.status === "rejected") acc.rejected += 1;
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0 },
    );

    const fallback = IdeaPoolResponseSchema.parse({
      success: false,
      data: {
        items,
        totals,
      },
      error: `Failed to load idea pool metrics: ${error?.message ?? "unknown error"}`,
      timestamp: new Date().toISOString(),
      source: "mock",
    });
    return json(fallback, { status: 500 });
  }
}
