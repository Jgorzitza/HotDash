import { InlineStack, Button, ButtonGroup } from "@shopify/polaris";
export function ApprovalActionsSection({ state, canApprove, onApprove, onReject, onRequestChanges, onApply, }) {
    const disableApprove = !canApprove || state !== "pending_review";
    const disableApply = state !== "approved";
    return (<InlineStack align="end">
      <ButtonGroup>
        <Button tone="critical" onClick={() => onReject("Rejected by reviewer")} accessibilityLabel="Reject approval">
          Reject
        </Button>
        <Button onClick={() => onRequestChanges("Please address the review notes.")} accessibilityLabel="Request changes">
          Request changes
        </Button>
        <Button variant="primary" onClick={onApprove} disabled={disableApprove} accessibilityLabel="Approve">
          Approve
        </Button>
        {onApply && (<Button onClick={onApply} disabled={disableApply} accessibilityLabel="Apply">
            Apply
          </Button>)}
      </ButtonGroup>
    </InlineStack>);
}
//# sourceMappingURL=ApprovalActionsSection.js.map