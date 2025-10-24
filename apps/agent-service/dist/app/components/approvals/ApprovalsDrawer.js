/**
 * Approvals Drawer - Refactored
 *
 * Spec: docs/specs/approvals_drawer_spec.md
 *
 * Main orchestrator for approval details drawer.
 * Split into subcomponents to stay under 300 lines and avoid nested modals.
 *
 * HITL enforced: "Approve" disabled until evidence + rollback + /validate OK
 */
import React, { useState, useEffect } from "react";
import { Modal, Tabs, Card, Badge, Banner, Text, BlockStack, InlineStack, Divider, TextField, Button, } from "@shopify/polaris";
import { ApprovalEvidenceSection } from "./ApprovalEvidenceSection";
import { ApprovalGradingSection } from "./ApprovalGradingSection";
import { ApprovalActionsSection } from "./ApprovalActionsSection";
export function ApprovalsDrawer({ open, approval, onClose, onApprove, onReject, onRequestChanges, onApply, }) {
    const [selectedTab, setSelectedTab] = useState(0);
    const [toneGrade, setToneGrade] = useState(3);
    const [accuracyGrade, setAccuracyGrade] = useState(3);
    const [policyGrade, setPolicyGrade] = useState(3);
    const [validationErrors, setValidationErrors] = useState([]);
    const [validationWarnings, setValidationWarnings] = useState([]);
    const [validating, setValidating] = useState(false);
    const [editingImpact, setEditingImpact] = useState(false);
    const [editingRollback, setEditingRollback] = useState(false);
    const [editedImpact, setEditedImpact] = useState(approval?.impact || {});
    const [editedRollback, setEditedRollback] = useState(approval?.rollback || {});
    if (!approval)
        return null;
    // Keyboard shortcut: Cmd+Enter to approve
    useEffect(() => {
        const handleKeyDown = (event) => {
            if ((event.metaKey || event.ctrlKey) &&
                event.key === "Enter" &&
                canApprove) {
                event.preventDefault();
                handleApprove();
            }
        };
        if (open) {
            document.addEventListener("keydown", handleKeyDown);
            return () => document.removeEventListener("keydown", handleKeyDown);
        }
    }, [open, canApprove]);
    // Validate approval
    const validateApproval = async () => {
        setValidating(true);
        setValidationErrors([]);
        setValidationWarnings([]);
        try {
            const response = await fetch(`/api/approvals/${approval.id}/validate`);
            const result = await response.json();
            setValidationErrors(result.errors || []);
            setValidationWarnings(result.warnings || []);
            return result.valid;
        }
        catch (error) {
            setValidationErrors(["Failed to validate approval"]);
            return false;
        }
        finally {
            setValidating(false);
        }
    };
    // Handle approve with validation and grading
    const handleApprove = async () => {
        const isValid = await validateApproval();
        if (!isValid) {
            return;
        }
        if (approval.kind === "cx_reply") {
            onApprove({
                tone: toneGrade,
                accuracy: accuracyGrade,
                policy: policyGrade,
            });
        }
        else {
            onApprove();
        }
    };
    // Check if can approve
    const hasEvidence = approval.evidence && Object.keys(approval.evidence).length > 0;
    const hasRollback = approval.rollback &&
        approval.rollback.steps &&
        approval.rollback.steps.length > 0;
    const hasValidationErrors = approval.validation_errors && approval.validation_errors.length > 0;
    const canApprove = hasEvidence &&
        hasRollback &&
        !hasValidationErrors &&
        validationErrors.length === 0;
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
    const tabs = [
        { id: "evidence", content: "Evidence", panelID: "evidence-panel" },
        { id: "impact", content: "Impact & Risks", panelID: "impact-panel" },
        { id: "actions", content: "Actions", panelID: "actions-panel" },
        { id: "audit", content: "Audit", panelID: "audit-panel" },
    ];
    return (<Modal open={open} onClose={onClose} title={approval.summary} large>
      <Modal.Section>
        <BlockStack gap="400">
          {/* Header */}
          <InlineStack align="space-between" blockAlign="center">
            <InlineStack gap="200">
              <Badge tone={stateBadge.tone}>{stateBadge.label}</Badge>
              <Badge>{approval.kind.replace("_", " ").toUpperCase()}</Badge>
            </InlineStack>
            <Text as="p" variant="bodySm" tone="subdued">
              Created by {approval.created_by}
            </Text>
          </InlineStack>

          <Divider />

          {/* Validation Messages */}
          {hasValidationErrors && (<Banner tone="critical" title="Validation Errors">
              {approval.validation_errors.map((error, idx) => (<Text as="p" key={idx}>
                  • {error}
                </Text>))}
            </Banner>)}
          {validationErrors.length > 0 && (<Banner tone="critical" title="Validation Failed">
              {validationErrors.map((error, idx) => (<Text as="p" key={idx}>
                  • {error}
                </Text>))}
            </Banner>)}
          {validationWarnings.length > 0 && (<Banner tone="warning" title="Warnings">
              {validationWarnings.map((warning, idx) => (<Text as="p" key={idx}>
                  • {warning}
                </Text>))}
            </Banner>)}

          {/* Tabs */}
          <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
            {selectedTab === 0 && (<BlockStack gap="400">
                <ApprovalEvidenceSection evidence={approval.evidence}/>
              </BlockStack>)}

            {selectedTab === 1 && (<BlockStack gap="400">
                <Card>
                  <BlockStack gap="300">
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="h3" variant="headingMd">
                        Projected Impact
                      </Text>
                      <Button size="micro" onClick={() => setEditingImpact(!editingImpact)}>
                        {editingImpact ? "Done" : "Edit"}
                      </Button>
                    </InlineStack>
                    {editingImpact ? (<TextField label="Expected Outcome" value={editedImpact.expected_outcome || ""} onChange={(value) => setEditedImpact({
                    ...editedImpact,
                    expected_outcome: value,
                })} multiline={3}/>) : (editedImpact.expected_outcome && (<Text as="p">{editedImpact.expected_outcome}</Text>))}
                  </BlockStack>
                </Card>
                <Card>
                  <BlockStack gap="300">
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="h3" variant="headingMd">
                        Risks & Rollback
                      </Text>
                      <Button size="micro" onClick={() => setEditingRollback(!editingRollback)}>
                        {editingRollback ? "Done" : "Edit"}
                      </Button>
                    </InlineStack>
                    {editingRollback ? (<BlockStack gap="300">
                        <TextField label="What could go wrong?" value={approval.risk.what_could_go_wrong || ""} onChange={(value) => {
                    // Note: This would need to be connected to a state update function
                }} multiline={3}/>
                        <TextField label="Rollback Steps (one per line)" value={approval.rollback.steps?.join("\n") || ""} onChange={(value) => {
                    // Note: This would need to be connected to a state update function
                }} multiline={5}/>
                      </BlockStack>) : (<BlockStack gap="200">
                        {approval.risk.what_could_go_wrong && (<Text as="p">
                            {approval.risk.what_could_go_wrong}
                          </Text>)}
                        {approval.rollback.steps &&
                    approval.rollback.steps.length > 0 && (<BlockStack gap="100">
                              {approval.rollback.steps.map((step, idx) => (<Text as="p" key={idx}>
                                  {idx + 1}. {step}
                                </Text>))}
                            </BlockStack>)}
                      </BlockStack>)}
                  </BlockStack>
                </Card>
              </BlockStack>)}

            {selectedTab === 2 && (<Card>
                <BlockStack gap="300">
                  <Text as="h3" variant="headingMd">
                    Tool Calls Preview
                  </Text>
                  {approval.actions.map((action, idx) => (<BlockStack key={idx} gap="200">
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        {action.endpoint}
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        Dry-run status: {action.dry_run_status || "Not tested"}
                      </Text>
                      <pre style={{
                    fontSize: "12px",
                    overflow: "auto",
                    background: "#f6f6f7",
                    padding: "8px",
                    borderRadius: "4px",
                }}>
                        {JSON.stringify(action.payload, null, 2)}
                      </pre>
                    </BlockStack>))}
                </BlockStack>
              </Card>)}

            {selectedTab === 3 && (<Card>
                <BlockStack gap="300">
                  <Text as="h3" variant="headingMd">
                    Audit Trail
                  </Text>
                  {approval.receipts && approval.receipts.length > 0 ? (approval.receipts.map((receipt, idx) => (<BlockStack key={idx} gap="200">
                        <InlineStack align="space-between" blockAlign="center">
                          <Text as="p" variant="bodyMd" fontWeight="semibold">
                            Receipt #{receipt.id}
                          </Text>
                          <Text as="p" variant="bodySm" tone="subdued">
                            {new Date(receipt.timestamp).toLocaleString()}
                          </Text>
                        </InlineStack>
                        {receipt.metrics && (<pre style={{
                        fontSize: "12px",
                        overflow: "auto",
                        background: "#f6f6f7",
                        padding: "8px",
                        borderRadius: "4px",
                    }}>
                            {JSON.stringify(receipt.metrics, null, 2)}
                          </pre>)}
                      </BlockStack>))) : (<Text as="p" tone="subdued">
                      No audit records yet. Audit trail will appear after
                      actions are applied.
                    </Text>)}
                </BlockStack>
              </Card>)}
          </Tabs>

          {/* Grading Section (CX replies only) */}
          <ApprovalGradingSection kind={approval.kind} toneGrade={toneGrade} accuracyGrade={accuracyGrade} policyGrade={policyGrade} onToneChange={setToneGrade} onAccuracyChange={setAccuracyGrade} onPolicyChange={setPolicyGrade}/>

          <Divider />

          {/* Actions */}
          <ApprovalActionsSection state={approval.state} canApprove={canApprove} onApprove={handleApprove} onReject={onReject} onRequestChanges={onRequestChanges} onApply={onApply}/>
        </BlockStack>
      </Modal.Section>
    </Modal>);
}
//# sourceMappingURL=ApprovalsDrawer.js.map