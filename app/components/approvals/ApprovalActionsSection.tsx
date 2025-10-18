import { InlineStack, Button, ButtonGroup } from "@shopify/polaris";

export function ApprovalActionsSection({
  state,
  canApprove,
  onApprove,
  onReject,
  onRequestChanges,
  onApply,
}: {
  state: "draft" | "pending_review" | "approved" | "applied" | "audited" | "learned";
  canApprove: boolean;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onRequestChanges: (note: string) => void;
  onApply?: () => void;
}) {
  const disableApprove = !canApprove || state !== "pending_review";
  const disableApply = state !== "approved";

  return (
    <InlineStack align="end">
      <ButtonGroup>
        <Button
          tone="critical"
          onClick={() => onReject("Rejected by reviewer")}
          accessibilityLabel="Reject approval"
        >
          Reject
        </Button>
        <Button
          onClick={() => onRequestChanges("Please address the review notes.")}
          accessibilityLabel="Request changes"
        >
          Request changes
        </Button>
        <Button
          variant="primary"
          onClick={onApprove}
          disabled={disableApprove}
          accessibilityLabel="Approve"
        >
          Approve
        </Button>
        {onApply && (
          <Button onClick={onApply} disabled={disableApply} accessibilityLabel="Apply">
            Apply
          </Button>
        )}
      </ButtonGroup>
    </InlineStack>
  );
}

