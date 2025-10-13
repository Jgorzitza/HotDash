import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";

import { authenticate } from "../shopify.server";
import { isMockMode } from "../utils/env.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Bypass auth in test/mock mode for E2E testing
  const isTestMode = isMockMode(request);

  if (!isTestMode) {
    await authenticate.admin(request);
  }

  // Return API key for App Bridge initialization
  return { 
    apiKey: process.env.SHOPIFY_API_KEY || "",
    mockMode: isTestMode,
  };
};

export default function App() {
  const { apiKey, mockMode } = useLoaderData<typeof loader>();

  return (
    <AppProvider embedded apiKey={apiKey}>
      {/* Accessibility: Skip to main content link (WCAG 2.4.1) */}
      <a 
        href="#main-content" 
        style={{
          position: 'absolute',
          left: '-9999px',
          zIndex: 9999,
          padding: '1rem',
          background: '#2c6ecb',
          color: 'white',
          borderRadius: '4px',
          textDecoration: 'none',
        }}
        onFocus={(e) => {
          e.currentTarget.style.left = '1rem';
          e.currentTarget.style.top = '1rem';
        }}
        onBlur={(e) => {
          e.currentTarget.style.left = '-9999px';
        }}
      >
        Skip to main content
      </a>
      <s-app-nav>
        <s-link href="/app">Dashboard</s-link>
        <s-link href="/approvals">Approvals</s-link>
        <s-link href="/app/picker-payments">Picker Payments</s-link>
        <s-link href="/app/additional">Additional page</s-link>
        <s-link href="/app/tools/session-token">Session token tool</s-link>
        {mockMode && (
          <s-badge tone="warning">Mock Mode</s-badge>
        )}
      </s-app-nav>
      <div id="main-content">
        <Outlet />
      </div>
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
