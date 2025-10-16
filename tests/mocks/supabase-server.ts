/**
 * Mock Supabase Server for Tests
 * Owner: integrations agent
 * Date: 2025-10-15
 */

import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

export const supabaseHandlers = [
  http.post("*/rest/v1/rpc/*", async ({ params, request }) => {
    const functionName = params[0];
    const body = await request.json();

    if (functionName === "get_approval_queue") {
      return HttpResponse.json([
        {
          id: 1,
          status: "pending",
          created_at: "2025-10-15T00:00:00Z",
        },
      ]);
    }

    if (functionName === "log_audit_entry") {
      return HttpResponse.json({ id: 1 });
    }

    if (functionName === "get_dashboard_metrics_history") {
      return HttpResponse.json([
        {
          id: 1,
          fact_type: "shopify.dashboard.metrics",
          value: { revenue: 1000 },
          created_at: "2025-10-15T00:00:00Z",
        },
      ]);
    }

    return HttpResponse.json({});
  }),

  http.get("*/rest/v1/*", () => {
    return HttpResponse.json({ data: [] });
  }),
];

export const supabaseMockServer = setupServer(...supabaseHandlers);
