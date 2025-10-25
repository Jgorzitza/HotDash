import { useState } from "react";
import { Card, BlockStack, InlineStack, Text, Button, Badge, Banner, } from "@shopify/polaris";
import { useSubmit } from "react-router";
export function ApprovalCard({ approval, onDetails }) {
    const submit = useSubmit();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Get first action for display
    const action = approval.actions[0];
    const riskLevel = action ? getRiskLevel(action.endpoint) : "low";
    // Format timestamp
    const formatTime = (timestamp) => {
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
        const badges = {
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
    return (<Card>
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

          {action && (<Text variant="bodySm" as="p">
              <strong>Action:</strong> {action.endpoint}
            </Text>)}
        </BlockStack>

        {/* Validation Errors */}
        {approval.validation_errors &&
            approval.validation_errors.length > 0 && (<Banner tone="critical">
              <BlockStack gap="200">
                {approval.validation_errors.map((error, idx) => (<Text as="p" key={idx}>
                    • {error}
                  </Text>))}
              </BlockStack>
            </Banner>)}

        {/* Actions */}
        <InlineStack gap="200">
          <Button variant="primary" onClick={onDetails}>
            View Details
          </Button>
        </InlineStack>
      </BlockStack>
    </Card>);
}
// Helper: Determine risk level based on endpoint
function getRiskLevel(endpoint) {
    const highRisk = [
        "/api/chatwoot/send-reply",
        "/api/shopify/create-refund",
        "/api/shopify/cancel-order",
    ];
    const mediumRisk = ["/api/chatwoot/create-note", "/api/shopify/update-order"];
    if (highRisk.some((risk) => endpoint.includes(risk)))
        return "high";
    if (mediumRisk.some((risk) => endpoint.includes(risk)))
        return "medium";
    return "low";
}
//# sourceMappingURL=ApprovalCard.js.map