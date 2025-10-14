import { useEffect, useMemo } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useRevalidator } from "react-router";
import { Page, Layout, Card, EmptyState } from "@shopify/polaris";

import {
  ApprovalCard,
  type ApprovalSummary,
} from "../../components/ApprovalCard";
import { jsonResponse } from "../../utils/http";

interface LoaderData {
  approvals: ApprovalSummary[];
  error?: string | null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const agentBase =
    process.env.AGENT_SDK_URL ?? "https://hotdash-agent-service.fly.dev";
  const approvalsUrl = new URL("/approvals", agentBase);
  approvalsUrl.search = url.search;

  try {
    const response = await fetch(approvalsUrl, {
      headers: {
        "content-type": "application/json",
        "x-forwarded-from": "hotdash-app",
      },
    });

    if (!response.ok) {
      const message = `Agent service responded with ${response.status}`;
      console.error("[Approvals Loader] Failed to fetch approvals", message);
      return jsonResponse<LoaderData>(
        { approvals: [], error: message },
        { status: 502 },
      );
    }

    const approvals = (await response.json()) as ApprovalSummary[];
    return jsonResponse<LoaderData>({ approvals, error: null });
  } catch (error) {
    console.error("[Approvals Loader] Agent service unavailable", error);
    return jsonResponse<LoaderData>(
      { approvals: [], error: "Agent service unavailable" },
      { status: 503 },
    );
  }
}

export default function ApprovalsRoute() {
  const { approvals, error } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const subtitle = useMemo(() => {
    const count = approvals.length;
    return `${count} pending ${count === 1 ? "approval" : "approvals"}`;
  }, [approvals.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 5000);

    return () => clearInterval(interval);
  }, [revalidator]);

  return (
    <Page title="Approval Queue" subtitle={subtitle}>
      <Layout>
        {error ? (
          <Layout.Section>
            <Card>
              <div style={{ padding: "16px", color: "#bf0711" }}>
                <strong>Error:</strong> {error}
              </div>
            </Card>
          </Layout.Section>
        ) : null}

        {approvals.length === 0 ? (
          <Layout.Section>
            <Card>
              <EmptyState
                heading="All clear!"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>No pending approvals. Check back later.</p>
              </EmptyState>
            </Card>
          </Layout.Section>
        ) : (
          approvals.map((approval) => (
            <Layout.Section key={approval.id}>
              <ApprovalCard approval={approval} />
            </Layout.Section>
          ))
        )}
      </Layout>
    </Page>
  );
}
