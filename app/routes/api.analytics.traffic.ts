import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { isAnalyticsTilesEnabled } from "~/lib/analytics/config";
import { getSampleTraffic } from "~/lib/analytics/sample";

export async function loader({ request }: LoaderFunctionArgs) {
  const enabled = isAnalyticsTilesEnabled();
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") || (enabled ? "live" : "sample");
  if (!enabled || mode === "sample") {
    return json({ success: true, mode: "sample", data: getSampleTraffic() });
  }
  // TODO: implement live GA4-backed traffic when migrations + adapters are ready
  return json({ success: false, error: "live mode not available", mode: "live" }, { status: 501 });
}

