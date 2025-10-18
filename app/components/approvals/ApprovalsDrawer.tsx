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

import { useState } from "react";
import {
  Modal,
  Tabs,
  Card,
  Badge,
  Banner,
  Text,
  BlockStack,
  InlineStack,
  Divider,
} from "@shopify/polaris";
import type { BadgeProps } from "@shopify/polaris";
import { ApprovalEvidenceSection } from "./ApprovalEvidenceSection";
import { ApprovalGradingSection } from "./ApprovalGradingSection";
import { ApprovalActionsSection } from "./ApprovalActionsSection";

export interface Approval {
  id: string;
  kind: "cx_reply" | "inventory" | "growth" | "misc";
  state:
    | "draft"
    | "pending_review"
    | "approved"
    | "applied"
    | "audited"
    | "learned";
  summary: string;
  created_by: string;
  reviewer?: string;
  evidence: {
    what_changes?: string;
    why_now?: string;
    impact_forecast?: string;
    diffs?: Array<{ path: string; before: string; after: string }>;
    samples?: Array<{ label: string; content: string }>;
    queries?: Array<{ label: string; query: string; result?: string }>;
    screenshots?: Array<{ label: string; url: string }>;
  };
  impact: {
    expected_outcome?: string;
    metrics_affected?: string[];
    user_experience?: string;
    business_value?: string;
  };
  risk: {
    what_could_go_wrong?: string;
    recovery_time?: string;
  };
  rollback: {
    steps?: string[];
    artifact_location?: string;
  };
  actions: Array<{
    endpoint: string;
    payload: Record<string, unknown>;
    dry_run_status?: string;
  }>;
  receipts?: Array<{
    id: string;
    timestamp: string;
    metrics?: Record<string, unknown>;
  }>;
  created_at: string;
  updated_at: string;
  validation_errors?: string[];
}

export interface ApprovalsDrawerProps {
  open: boolean;
  approval: Approval | null;
  onClose: () => void;
  onApprove: (grades?: {
    tone: number;
    accuracy: number;
    policy: number;
  }) => void;
  onReject: (reason: string) => void;
  onRequestChanges: (note: string) => void;
  onApply?: () => void;
}

export function ApprovalsDrawer({
  open,
  approval,
  onClose,
  onApprove,
  onReject,
  onRequestChanges,
  onApply,
}: ApprovalsDrawerProps) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [toneGrade, setToneGrade] = useState(3);
  const [accuracyGrade, setAccuracyGrade] = useState(3);
  const [policyGrade, setPolicyGrade] = useState(3);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [validating, setValidating] = useState(false);

  if (!approval) return null;

  // Validate approval
  interface ValidationResponse {
    valid: boolean;
    errors?: string[];
    warnings?: string[];
  }

  const validateApproval = async () => {
    setValidating(true);
    setValidationErrors([]);
    setValidationWarnings([]);

    try {
      const response = await fetch(`/api/approvals/${approval.id}/validate`);
      const result: ValidationResponse = await response.json();

      setValidationErrors(result.errors ?? []);
      setValidationWarnings(result.warnings ?? []);

      return result.valid;
    } catch (error) {
      setValidationErrors(["Failed to validate approval"]);
      return false;
    } finally {
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
    } else {
      onApprove();
    }
  };

  // Check if can approve
  const hasEvidence =
    approval.evidence && Object.keys(approval.evidence).length > 0;
  const hasRollback = !!(approval.rollback?.steps && approval.rollback.steps.length > 0);
  const hasValidationErrors =
    approval.validation_errors && approval.validation_errors.length > 0;
  const canApprove: boolean = Boolean(
    hasEvidence && hasRollback && !hasValidationErrors && validationErrors.length === 0,
  );

  // Get state badge
  const getStateBadge = () => {
    const badges: Record<
      Approval["state"],
      { tone: BadgeProps["tone"]; label: string }
    > = {
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
  ];

  return (
    <Modal open={open} onClose={onClose} title={approval.summary}>
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
          {hasValidationErrors && (
            <Banner tone="critical" title="Validation Errors">
              {approval.validation_errors!.map((error, idx) => (
                <Text as="p" key={idx}>
                  • {error}
                </Text>
              ))}
            </Banner>
          )}
          {validationErrors.length > 0 && (
            <Banner tone="critical" title="Validation Failed">
              {validationErrors.map((error, idx) => (
                <Text as="p" key={idx}>
                  • {error}
                </Text>
              ))}
            </Banner>
          )}
          {validationWarnings.length > 0 && (
            <Banner tone="warning" title="Warnings">
              {validationWarnings.map((warning, idx) => (
                <Text as="p" key={idx}>
                  • {warning}
                </Text>
              ))}
            </Banner>
          )}

          {/* Tabs */}
          <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
            {selectedTab === 0 && (
              <BlockStack gap="400">
                <ApprovalEvidenceSection evidence={approval.evidence} />
              </BlockStack>
            )}

            {selectedTab === 1 && (
              <BlockStack gap="400">
                <Card>
                  <BlockStack gap="300">
                    <Text as="h3" variant="headingMd">
                      Projected Impact
                    </Text>
                    {approval.impact.expected_outcome && (
                      <Text as="p">{approval.impact.expected_outcome}</Text>
                    )}
                  </BlockStack>
                </Card>
                <Card>
                  <BlockStack gap="300">
                    <Text as="h3" variant="headingMd">
                      Risks & Rollback
                    </Text>
                    {approval.risk.what_could_go_wrong && (
                      <Text as="p">{approval.risk.what_could_go_wrong}</Text>
                    )}
                    {approval.rollback.steps &&
                      approval.rollback.steps.length > 0 && (
                        <BlockStack gap="100">
                          {approval.rollback.steps.map((step, idx) => (
                            <Text as="p" key={idx}>
                              {idx + 1}. {step}
                            </Text>
                          ))}
                        </BlockStack>
                      )}
                  </BlockStack>
                </Card>
              </BlockStack>
            )}

            {selectedTab === 2 && (
              <Card>
                <BlockStack gap="300">
                  <Text as="h3" variant="headingMd">
                    Actions to Execute
                  </Text>
                  {approval.actions.map((action, idx) => (
                    <BlockStack key={idx} gap="200">
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        {action.endpoint}
                      </Text>
                      <pre style={{ fontSize: "12px", overflow: "auto" }}>
                        {JSON.stringify(action.payload, null, 2)}
                      </pre>
                    </BlockStack>
                  ))}
                </BlockStack>
              </Card>
            )}
          </Tabs>

          {/* Grading Section (CX replies only) */}
          <ApprovalGradingSection
            kind={approval.kind}
            toneGrade={toneGrade}
            accuracyGrade={accuracyGrade}
            policyGrade={policyGrade}
            onToneChange={setToneGrade}
            onAccuracyChange={setAccuracyGrade}
            onPolicyChange={setPolicyGrade}
          />

          <Divider />

          {/* Actions */}
          <ApprovalActionsSection
            state={approval.state}
            canApprove={canApprove}
            onApprove={handleApprove}
            onReject={onReject}
            onRequestChanges={onRequestChanges}
            onApply={onApply}
            isValidating={validating}
          />
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
