import { useMemo } from "react";
import {
  Badge,
  Banner,
  BlockStack,
  Button,
  Card,
  InlineStack,
  Text,
} from "@shopify/polaris";
import { useFetcher } from "react-router";

export interface ApprovalSummary {
  id: string;
  conversationId: number;
  createdAt: string;
  pending: Array<{
    agent: string;
    tool: string;
    args: Record<string, unknown>;
  }>;
}

interface ApprovalCardProps {
  approval: ApprovalSummary;
}

export function ApprovalCard({ approval }: ApprovalCardProps) {
  const fetcher = useFetcher<{ error?: string }>();
  const pendingAction = approval.pending[0];
  const riskLevel = useMemo(
    () => getRiskLevel(pendingAction?.tool ?? ""),
    [pendingAction?.tool],
  );
  const isSubmitting = fetcher.state !== "idle";
  const error = fetcher.data?.error ?? null;

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <Text variant="headingMd" as="h2">
            Conversation #{approval.conversationId}
          </Text>
          <Badge
            tone={
              riskLevel === "high"
                ? "critical"
                : riskLevel === "medium"
                  ? "warning"
                  : "success"
            }
          >
            {riskLevel.toUpperCase()} RISK
          </Badge>
        </InlineStack>

        {pendingAction ? (
          <BlockStack gap="200">
            <Text variant="bodyMd" as="p">
              <strong>Agent:</strong> {pendingAction.agent}
            </Text>
            <Text variant="bodyMd" as="p">
              <strong>Tool:</strong> {pendingAction.tool}
            </Text>
            <Text variant="bodyMd" as="p" tone="subdued">
              <strong>Arguments:</strong>
            </Text>
            <pre
              style={{
                background: "#f6f6f7",
                padding: "12px",
                borderRadius: "4px",
                fontSize: "12px",
                overflow: "auto",
              }}
            >
              {JSON.stringify(pendingAction.args, null, 2)}
            </pre>
            <Text variant="bodySm" as="p" tone="subdued">
              Requested {new Date(approval.createdAt).toLocaleString()}
            </Text>
          </BlockStack>
        ) : (
          <Text tone="subdued">No pending actions for this approval.</Text>
        )}

        {error && <Banner tone="critical">{error}</Banner>}

        <InlineStack gap="200">
          <fetcher.Form
            method="post"
            action={`/approvals/${approval.id}/0/approve`}
            replace
          >
            <Button
              variant="primary"
              tone="success"
              submit
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Approve
            </Button>
          </fetcher.Form>
          <fetcher.Form
            method="post"
            action={`/approvals/${approval.id}/0/reject`}
            replace
          >
            <Button
              variant="primary"
              tone="critical"
              submit
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Reject
            </Button>
          </fetcher.Form>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

function getRiskLevel(tool: string): "low" | "medium" | "high" {
  const highRisk = ["send_email", "create_refund", "cancel_order"];
  const mediumRisk = ["create_private_note", "update_conversation"];

  if (highRisk.includes(tool)) return "high";
  if (mediumRisk.includes(tool)) return "medium";
  return "low";
}
