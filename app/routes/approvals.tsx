import { useEffect } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useRevalidator } from "react-router";
import { Page, Layout, Card, EmptyState, SkeletonPage } from "@shopify/polaris";
import { ApprovalCard } from "../components/approvals/ApprovalCard";
import { mockApprovals } from "../fixtures/approvals";

interface Approval {
  id: string;
  conversationId: number;
  createdAt: string;
  pending: {
    agent: string;
    tool: string;
    args: Record<string, any>;
  }[];
}

interface LoaderData {
  approvals: Approval[];
  mode: "dev:test" | "live";
}

export async function loader({ request }: LoaderFunctionArgs) {
  const mode = "dev:test";

  if (mode === "dev:test") {
    return Response.json({
      approvals: mockApprovals,
      mode,
    });
  }

  try {
    const response = await fetch("http://localhost:8002/approvals");
    const approvals: Approval[] = await response.json();
    return Response.json({ approvals, mode: "live" as const });
  } catch (error) {
    console.error("Failed to fetch approvals:", error);
    return Response.json({ approvals: [], mode: "live" as const });
  }
}

export default function ApprovalsRoute() {
  const { approvals, mode } = useLoaderData<LoaderData>();
  const revalidator = useRevalidator();

  useEffect(() => {
    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 5000);
    return () => clearInterval(interval);
  }, [revalidator]);

  if (revalidator.state === "loading" && approvals.length === 0) {
    return <SkeletonPage primaryAction />;
  }

  return (
    <Page
      title="Approval Queue"
      subtitle={`${approvals.length} pending ${approvals.length === 1 ? "approval" : "approvals"}`}
    >
      {mode === "dev:test" && (
        <div
          style={{
            marginBottom: "var(--p-space-500)",
            padding: "var(--p-space-400)",
            border: "1px dashed var(--p-color-border-subdued)",
            borderRadius: "var(--p-border-radius-200)",
            background: "var(--p-color-bg-surface-secondary)",
          }}
        >
          <p style={{ margin: 0, color: "var(--p-color-text-subdued)" }}>
            <strong>Dev Mode:</strong> Displaying fixture data only. Auto-refresh enabled (5s interval).
          </p>
        </div>
      )}

      <Layout>
        {approvals.length === 0 ? (
          <Layout.Section>
            <Card>
              <EmptyState
                heading="All clear\!"
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
