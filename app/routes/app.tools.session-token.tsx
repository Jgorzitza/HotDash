import { useCallback, useEffect, useMemo, useState } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getSessionToken } from "@shopify/app-bridge/utilities";

import { authenticate } from "../shopify.server";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";

interface SessionTokenClaims {
  shopDomain: string;
  destination: string;
  audience: string;
  issuedAt: string;
  notBefore: string;
  expiresAt: string;
  sessionId: string | null;
  userId: string | null;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function SessionTokenTool() {
  const appBridge = useAppBridge();
  const authenticatedJsonFetch = useAuthenticatedFetch({
    defaultHeaders: {
      Accept: "application/json",
      "X-Hotdash-Session-Tool": "1",
    },
    defaultRequestInit: {
      credentials: "same-origin",
      cache: "no-store",
    },
  });

  const [rawToken, setRawToken] = useState<string | null>(null);
  const [claims, setClaims] = useState<SessionTokenClaims | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const expiresInSeconds = useMemo(() => {
    if (!claims) return null;
    const expiry = new Date(claims.expiresAt).getTime();
    const delta = Math.floor((expiry - Date.now()) / 1000);
    return Number.isFinite(delta) ? Math.max(delta, 0) : null;
  }, [claims]);

  const refreshToken = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    setCopied(false);

    try {
      const token = await getSessionToken(appBridge as any);
      setRawToken(token);

      const response = await authenticatedJsonFetch(
        "/api/session-token/claims",
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error ?? response.statusText);
      }

      const data = (await response.json()) as SessionTokenClaims;
      setClaims(data);
      setStatus("idle");
    } catch (error) {
      console.error("Failed to refresh Shopify session token", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unexpected error retrieving session token",
      );
      setStatus("error");
    }
  }, [appBridge, authenticatedJsonFetch]);

  useEffect(() => {
    void refreshToken();
  }, [refreshToken]);

  useEffect(() => {
    if (!claims) return;

    const expiry = new Date(claims.expiresAt).getTime();
    const delay = Math.max(expiry - Date.now() - 5000, 0);

    if (!Number.isFinite(delay) || delay <= 0) return;

    const timeout = setTimeout(() => {
      void refreshToken();
    }, delay);

    return () => clearTimeout(timeout);
  }, [claims, refreshToken]);

  const handleCopy = useCallback(async () => {
    if (!rawToken) return;

    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API unavailable in this context");
      }

      await navigator.clipboard.writeText(rawToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 5000);
    } catch (error) {
      console.error("Unable to copy session token to clipboard", error);
      setErrorMessage("Copy to clipboard failed — copy token manually.");
      setCopied(false);
    }
  }, [rawToken]);

  return (
    <s-page heading="Session token utility">
      <s-stack gap="base">
        <s-section heading="Current session token">
          <s-stack gap="base">
            <s-paragraph>
              Tokens expire in under a minute. This tool fetches a fresh token
              via App Bridge and verifies it with our backend before showing any
              details. Use the copy button immediately after refreshing and
              store the token securely — never commit it to Git.
            </s-paragraph>
            <s-stack direction="inline" gap="base">
              <s-button
                onClick={refreshToken}
                loading={status === "loading"}
                variant="secondary"
              >
                Refresh now
              </s-button>
              <s-button onClick={handleCopy} disabled={!rawToken}>
                {copied ? "Copied" : "Copy token"}
              </s-button>
              {expiresInSeconds !== null && (
                <s-badge tone={expiresInSeconds < 15 ? "critical" : "success"}>
                  Expires in {expiresInSeconds}s
                </s-badge>
              )}
            </s-stack>
            <s-box
              padding="base"
              borderWidth="base"
              borderRadius="base"
              background="subdued"
            >
              <pre
                style={{
                  margin: 0,
                  whiteSpace: "normal",
                  wordBreak: "break-all",
                }}
              >
                <code>{rawToken ?? "Fetch a token to display it here."}</code>
              </pre>
            </s-box>
            {errorMessage && (
              <s-box
                padding="base"
                borderWidth="base"
                borderRadius="base"
                background="subdued"
              >
                <strong>Unable to fetch session token:</strong> {errorMessage}
              </s-box>
            )}
          </s-stack>
        </s-section>

        {claims && (
          <s-section heading="Decoded claims (server validated)">
            <s-stack gap="base">
              <s-stack direction="inline" gap="base">
                <s-text>
                  <strong>Shop domain:</strong>
                </s-text>
                <s-text>{claims.shopDomain}</s-text>
              </s-stack>
              <s-stack direction="inline" gap="base">
                <s-text>
                  <strong>Audience (client id):</strong>
                </s-text>
                <s-text>{claims.audience}</s-text>
              </s-stack>
              <s-stack direction="inline" gap="base">
                <s-text>
                  <strong>Issued at:</strong>
                </s-text>
                <s-text>{claims.issuedAt}</s-text>
              </s-stack>
              <s-stack direction="inline" gap="base">
                <s-text>
                  <strong>Valid from:</strong>
                </s-text>
                <s-text>{claims.notBefore}</s-text>
              </s-stack>
              <s-stack direction="inline" gap="base">
                <s-text>
                  <strong>Expires at:</strong>
                </s-text>
                <s-text>{claims.expiresAt}</s-text>
              </s-stack>
              <s-stack direction="inline" gap="base">
                <s-text>
                  <strong>Session id:</strong>
                </s-text>
                <s-text>{claims.sessionId ?? "—"}</s-text>
              </s-stack>
              <s-stack direction="inline" gap="base">
                <s-text>
                  <strong>User id:</strong>
                </s-text>
                <s-text>{claims.userId ?? "—"}</s-text>
              </s-stack>
              <s-paragraph>
                The backend decodes the Authorization bearer token using
                Shopify&apos;s session utilities. If this section fails to load,
                the header was missing or the token is invalid — refresh to
                obtain a new token.
              </s-paragraph>
            </s-stack>
          </s-section>
        )}
      </s-stack>
    </s-page>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
