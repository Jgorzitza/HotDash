import { useState } from "react";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Badge,
  Banner,
} from "@shopify/polaris";
import { useSubmit } from "react-router";

interface ApprovalCardProps {
  approval: {
    id: string;
    conversationId: number;
    createdAt: string;
    pending: {
      agent: string;
      tool: string;
      args: Record<string, any>;
    }[];
  };
}

function getRiskLevel(tool: string): "high" | "medium" | "low" {
  if (tool.includes("chatwoot") || tool.includes("payment")) {
    return "high";
  }
  if (tool.includes("inventory") || tool.includes("social") || tool.includes("updateReorderPoint")) {
    return "medium";
  }
  return "low";
}

export function ApprovalCard({ approval }: ApprovalCardProps) {
  const submit = useSubmit();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const action = approval.pending[0];
  const riskLevel = getRiskLevel(action.tool);

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/approvals/${approval.id}/0/approve`, {
        method: "POST",
      });
      if (\!response.ok) throw new Error("Failed to approve");
      submit(null, { method: "post", action: "/approvals" });
    } catch (err) {
      setError("Failed to approve. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/approvals/${approval.id}/0/reject`, {
        method: "POST",
      });
      if (\!response.ok) throw new Error("Failed to reject");
      submit(null, { method: "post", action: "/approvals" });
    } catch (err) {
      setError("Failed to reject. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <BlockStack gap="400">
        {error && (
          <Banner tone="critical" onDismiss={() => setError(null)}>
            {error}
          </Banner>
        )}

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

        <BlockStack gap="200">
          <Text variant="bodyMd" as="p">
            <strong>Agent:</strong> {action.agent}
          </Text>
          <Text variant="bodyMd" as="p">
            <strong>Tool:</strong> {action.tool}
          </Text>
          <details>
            <summary style={{ cursor: "pointer", color: "var(--p-color-text-subdued)" }}>
              <Text variant="bodySm" as="span" tone="subdued">
                View arguments
              </Text>
            </summary>
            <pre
              style={{
                marginTop: "var(--p-space-200)",
                padding: "var(--p-space-300)",
                background: "var(--p-color-bg-surface-secondary)",
                borderRadius: "var(--p-border-radius-200)",
                fontSize: "12px",
                overflow: "auto",
              }}
            >
              {JSON.stringify(action.args, null, 2)}
            </pre>
          </details>
          <Text variant="bodySm" as="p" tone="subdued">
            Requested {new Date(approval.createdAt).toLocaleString()}
          </Text>
        </BlockStack>

        <InlineStack gap="200">
          <Button
            variant="primary"
            tone="success"
            onClick={handleApprove}
            loading={loading}
            disabled={loading}
          >
            Approve
          </Button>
          <Button
            variant="primary"
            tone="critical"
            onClick={handleReject}
            loading={loading}
            disabled={loading}
          >
            Reject
          </Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}
