import { json } from "@remix-run/node";

import { getSliceCAttribution } from "~/lib/ads";
import { AdsAttributionResponseSchema } from "~/lib/ads/schemas";

export async function loader() {
  try {
    const summary = await getSliceCAttribution();

    const response = AdsAttributionResponseSchema.parse({
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
    });

    return json(response);
  } catch (error) {
    console.error("[API] Ads Slice C loader error:", error);
    const response = AdsAttributionResponseSchema.parse({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
    return json(response, { status: 500 });
  }
}
