import { useRouteError, isRouteErrorResponse } from "react-router";
import { Banner, Page, Layout, Text, Button, BlockStack } from "@shopify/polaris";

/**
 * Enhanced Error Boundary Component
 * 
 * Provides user-friendly error messages and recovery options
 * for different types of errors in the application.
 */
export function ErrorBoundary() {
  const error = useRouteError();

  // Handle route error responses (4xx, 5xx)
  if (isRouteErrorResponse(error)) {
    return (
      <Page title="Error">
        <Layout>
          <Layout.Section>
            <Banner
              title={`Error ${error.status}: ${error.statusText}`}
              tone="critical"
            >
              <BlockStack gap="400">
                <Text as="p">
                  {error.status === 404
                    ? "The page you're looking for doesn't exist."
                    : error.status === 401
                      ? "You need to be logged in to access this page."
                      : error.status === 403
                        ? "You don't have permission to access this resource."
                        : "An error occurred while processing your request."}
                </Text>

                {error.data?.message && (
                  <Text as="p" tone="subdued">
                    {error.data.message}
                  </Text>
                )}

                <Button url="/app">Return to Dashboard</Button>
              </BlockStack>
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  // Handle generic errors
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "An unexpected error occurred";

  const errorStack = error instanceof Error ? error.stack : undefined;

  return (
    <Page title="Unexpected Error">
      <Layout>
        <Layout.Section>
          <Banner
            title="Something went wrong"
            tone="critical"
          >
            <BlockStack gap="400">
              <Text as="p">
                We encountered an unexpected error. Our team has been notified and is working on a fix.
              </Text>

              <Text as="p" fontWeight="semibold">
                {errorMessage}
              </Text>

              {process.env.NODE_ENV === "development" && errorStack && (
                <details>
                  <summary>Error Details (Development Only)</summary>
                  <pre
                    style={{
                      background: "#f6f6f7",
                      padding: "1rem",
                      borderRadius: "4px",
                      overflow: "auto",
                      fontSize: "12px",
                    }}
                  >
                    {errorStack}
                  </pre>
                </details>
              )}

              <Button url="/app">Return to Dashboard</Button>
            </BlockStack>
          </Banner>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

/**
 * Tile-specific error boundary for graceful degradation
 */
export function TileErrorFallback({ error, tileName }: { error: Error; tileName: string }) {
  return (
    <Banner tone="warning">
      <BlockStack gap="200">
        <Text as="p" fontWeight="semibold">
          {tileName} Unavailable
        </Text>
        <Text as="p" tone="subdued">
          {error.message || "Unable to load data for this tile. Please try refreshing."}
        </Text>
      </BlockStack>
    </Banner>
  );
}
