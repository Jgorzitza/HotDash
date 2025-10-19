import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Badge,
  Banner,
} from "@shopify/polaris";
import type { Approval } from "./approvals/ApprovalsDrawer";

interface ApprovalCardProps {
  approval: Approval;
  onDetails: () => void;
}

export function ApprovalCard({ approval, onDetails }: ApprovalCardProps) {
  // Get first action for display
  const action = approval.actions[0];

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Get state badge
  const getStateBadge = () => {
    const badges: Record<Approval["state"], { tone: any; label: string }> = {
      draft: { tone: "info", label: "Draft" },
      pending_review: { tone: "attention", label: "Pending Review" },
      approved: { tone: "success", label: "Approved" },
      applied: { tone: "success", label: "Applied" },
      audited: { tone: "success", label: "Audited" },
      learned: { tone: "success", label: "Learned" },
    };
    return badges[approval.state];
  };

  const stateBadge = getStateBadge();

  return (
    <Card>
      <BlockStack gap="400">
        {/* Header */}
        <InlineStack align="space-between" blockAlign="center">
          <Text variant="headingMd" as="h2">
            {approval.summary}
          </Text>
          <Badge tone={stateBadge.tone}>{stateBadge.label}</Badge>
        </InlineStack>

        {/* Info */}
        <BlockStack gap="200">
          <InlineStack gap="400">
            <Badge>{approval.kind.replace("_", " ").toUpperCase()}</Badge>
            <Text variant="bodySm" as="p" tone="subdued">
              Created by {approval.created_by}
            </Text>
          </InlineStack>

          <Text variant="bodySm" as="p" tone="subdued">
            {formatTime(approval.created_at)}
          </Text>

          {action && (
            <Text variant="bodySm" as="p">
              <strong>Action:</strong> {action.endpoint}
            </Text>
          )}
        </BlockStack>

        {/* Validation Errors */}
        {approval.validation_errors &&
          approval.validation_errors.length > 0 && (
            <Banner tone="critical">
              <BlockStack gap="200">
                {approval.validation_errors!.map((validationError, idx) => (
                  <Text as="p" key={idx}>
                    • {validationError}
                  </Text>
                ))}
              </BlockStack>
            </Banner>
          )}

        {/* Actions */}
        <InlineStack gap="200">
          <Button variant="primary" onClick={onDetails}>
            View Details
          </Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}
