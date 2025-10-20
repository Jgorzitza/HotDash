import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import enTranslations from "@shopify/polaris/locales/en.json";

import { authenticate } from "../shopify.server";
import { isMockMode } from "../utils/env.server";

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
      (counts.pending_review || 0) + (counts.draft || 0) + (counts.approved || 0);
  } catch (error) {
    // Silently fail - don't block page load
    console.error("Failed to load approval counts:", error);
  }

  // Return API key for App Bridge initialization
  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    mockMode: isTestMode,
    pendingCount,
  };
};

export default function App() {
  const { apiKey, mockMode, pendingCount } = useLoaderData<typeof loader>();

  return (
    <AppProvider embedded apiKey={apiKey} i18n={enTranslations}>
      <s-app-nav>
        <s-link href="/app">Dashboard</s-link>
        <s-link href="/approvals">
          Approvals
          {pendingCount > 0 && (
            <s-badge tone="attention">{pendingCount}</s-badge>
          )}
        </s-link>
        <s-link href="/app/additional">Additional page</s-link>
        <s-link href="/app/tools/session-token">Session token tool</s-link>
        {mockMode && <s-badge tone="warning">Mock Mode</s-badge>}
      </s-app-nav>
      <Outlet />
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
