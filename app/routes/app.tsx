import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import enTranslations from "@shopify/polaris/locales/en.json";
import { useEffect, useState } from "react";

import { authenticate } from "../shopify.server";
import { isMockMode } from "../utils/env.server";
import { ToastProvider } from "../contexts/ToastContext";
import { useSSE } from "../hooks/useSSE";
import { LiveBadge } from "../components/realtime/LiveBadge";
import { ConnectionIndicator } from "../components/realtime/ConnectionIndicator";
import { ChatwootUnreadIndicator } from "../components/notifications/ChatwootUnreadIndicator";
import type { UnreadMessagesResponse } from "./api.chatwoot.unread";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Bypass auth in test/mock mode for E2E testing
  const isTestMode = isMockMode(request);

  if (!isTestMode) {
    await authenticate.admin(request);
  }

  // Get pending approvals count for navigation badge
  let pendingCount = 0;
  try {
    const { getApprovalCounts } = await import("../services/approvals");
    const counts = await getApprovalCounts();
    pendingCount =
      (counts.pending_review || 0) +
      (counts.draft || 0) +
      (counts.approved || 0);
  } catch (error) {
    // Silently fail - don't block page load
    console.error("Failed to load approval counts:", error);
  }

  let chatwootUnreadCount = 0;
  try {
    const unreadUrl = new URL("/api/chatwoot/unread", request.url);
    const unreadResponse = await fetch(unreadUrl.toString(), {
      headers: {
        Cookie: request.headers.get("cookie") ?? "",
      },
    });

    if (unreadResponse.ok) {
      const unreadBody = (await unreadResponse.json()) as UnreadMessagesResponse;
      chatwootUnreadCount = Math.max(
        0,
        unreadBody.data?.unread_count ?? 0,
      );
    }
  } catch (error) {
    console.error("Failed to load Chatwoot unread count:", error);
    chatwootUnreadCount = 0;
  }

  // Return API key for App Bridge initialization
  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    mockMode: isTestMode,
    pendingCount,
    chatwootUnreadCount,
  };
};

export default function App() {
  const {
    apiKey,
    mockMode,
    pendingCount: initialPendingCount,
    chatwootUnreadCount,
  } = useLoaderData<typeof loader>();

  // Real-time SSE connection (Phase 5 - ENG-023, ENG-024)
  const {
    status: sseStatus,
    lastMessage,
    lastHeartbeat,
  } = useSSE("/api/sse/updates", true);
  const [livePendingCount, setLivePendingCount] = useState(initialPendingCount);

  // Update pending count from SSE approval-update events
  useEffect(() => {
    if (lastMessage?.type === "approval-update") {
      const data = lastMessage.data as { pendingCount?: number };
      if (data.pendingCount !== undefined) {
        setLivePendingCount(data.pendingCount);
      }
    }
  }, [lastMessage]);

  return (
    <AppProvider embedded apiKey={apiKey} i18n={enTranslations}>
      <ToastProvider>
        <s-app-nav>
          <s-link href="/app">Dashboard</s-link>
          <s-link href="/app/approvals">
            Approvals
            {/* Live Badge (Phase 5 - ENG-024) */}
            {livePendingCount > 0 && (
              <span style={{ marginLeft: "var(--occ-space-2)" }}>
                <LiveBadge
                  count={livePendingCount}
                  showPulse={sseStatus === "connected"}
                />
              </span>
            )}
          </s-link>
          <s-link href="/seo/monitoring">SEO Monitoring</s-link>
          <s-link href="/app/additional">Additional page</s-link>
          <s-link href="/app/tools/session-token">Session token tool</s-link>
          {mockMode && <s-badge tone="warning">Mock Mode</s-badge>}
          {/* Connection indicator (Phase 5 - ENG-023) */}
          <div
            slot="actions"
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: "var(--occ-space-4)",
              alignItems: "center",
            }}
          >
            <ChatwootUnreadIndicator count={chatwootUnreadCount} />
            <ConnectionIndicator
              status={sseStatus}
              lastHeartbeat={lastHeartbeat}
            />
          </div>
        </s-app-nav>
        <Outlet />
      </ToastProvider>
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
