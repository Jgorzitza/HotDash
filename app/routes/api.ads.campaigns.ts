import { json, type LoaderFunctionArgs } from "@remix-run/node";

/**
 * Ads Campaigns API
 * Returns campaign metrics (ROAS, CPC, CPA)
 */
export async function loader({ request: _request }: LoaderFunctionArgs) {
  // TODO: Implement real campaign data fetching
  // For now, return mock data
  return json({
    campaigns: [],
    total: 0,
    metrics: {
      roas: 0,
      cpc: 0,
      cpa: 0,
      spend: 0,
      revenue: 0,
    },
  });
}
