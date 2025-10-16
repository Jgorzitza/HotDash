/**
 * Mock Chatwoot Server for Tests
 * Owner: integrations agent
 * Date: 2025-10-15
 */

import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

export const chatwootHandlers = [
  http.get("*/api/v1/accounts/*/conversations", ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "open";

    return HttpResponse.json({
      data: {
        payload: [
          {
            id: 1,
            account_id: 123,
            inbox_id: 1,
            status,
            messages: [],
            contact: { id: 1, name: "Test User" },
          },
        ],
        meta: {
          current_page: 1,
          total_pages: 1,
          count: 1,
        },
      },
    });
  }),

  http.get("*/api/v1/accounts/*/conversations/:id", ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      account_id: 123,
      inbox_id: 1,
      status: "open",
      messages: [],
      contact: { id: 1, name: "Test User" },
    });
  }),

  http.post("*/api/v1/accounts/*/conversations/:id/messages", async ({ request }) => {
    const body = await request.json() as { content: string; private: boolean };

    return HttpResponse.json({
      id: 1,
      content: body.content,
      message_type: body.private ? 1 : 0,
      created_at: new Date().toISOString(),
      private: body.private,
      sender: { id: 1, name: "Agent" },
    });
  }),
];

export const chatwootMockServer = setupServer(...chatwootHandlers);
