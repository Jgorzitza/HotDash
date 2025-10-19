import { json } from "@remix-run/node";

import { getSliceBPacing } from "~/lib/ads";
import { AdsPacingResponseSchema } from "~/lib/ads/schemas";

export async function loader() {
  try {
    const summary = await getSliceBPacing();

    const response = AdsPacingResponseSchema.parse({
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
    });

    return json(response);
  } catch (error) {
    console.error("[API] Ads Slice B loader error:", error);
    const response = AdsPacingResponseSchema.parse({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
    return json(response, { status: 500 });
  }
}
