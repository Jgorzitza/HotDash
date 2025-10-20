/**
 * Campaign Approval Drawer
 *
 * HITL (Human-In-The-Loop) workflow component for reviewing and approving
 * proposed ad campaign changes. Follows North Star operator-first principles.
 *
 * Workflow: Draft → Review → Approve/Reject
 */

import {
  BlockStack,
  Button,
  InlineStack,
  Text,
  Badge,
  Banner,
  Divider,
  Box,
  Card,
} from "@shopify/polaris";
import { useState } from "react";
import { formatCentsToDollars, formatROAS } from "~/lib/ads/metrics";

export interface CampaignProposal {
  id: string;
  type: "create" | "update" | "pause" | "budget_change";
  campaign: {
    id?: string;
    name: string;
    platform: "meta" | "google" | "organic";
    budgetCents: number;
    targetROAS?: number;
  };
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  evidence: {
    projectedSpend: number;
    targetROAS: number | null;
    estimatedClicks?: number;
    estimatedConversions?: number;
    estimatedRevenue?: number;
  };
  risk: {
    level: "low" | "medium" | "high";
    factors: string[];
    mitigation: string[];
  };
  rollback: {
    available: boolean;
    steps: string[];
  };
  createdAt: string;
  createdBy: string;
}

export interface CampaignApprovalDrawerProps {
  proposal: CampaignProposal;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (proposal: CampaignProposal, notes?: string) => Promise<void>;
  onReject: (proposal: CampaignProposal, reason: string) => Promise<void>;
}

export function CampaignApprovalDrawer({
  proposal,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: CampaignApprovalDrawerProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [notes, setNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove(proposal, notes);
      onClose();
    } catch (error) {
      console.error("Error approving campaign:", error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      return;
    }

    setIsRejecting(true);
    try {
      await onReject(proposal, rejectionReason);
      onClose();
    } catch (error) {
      console.error("Error rejecting campaign:", error);
    } finally {
      setIsRejecting(false);
    }
  };

  // Determine risk color
  const riskTone =
    proposal.risk.level === "low"
      ? "success"
      : proposal.risk.level === "medium"
        ? "warning"
        : "critical";

  // Calculate estimated ROAS if we have revenue projection
  const estimatedROAS =
    proposal.evidence.estimatedRevenue && proposal.evidence.projectedSpend > 0
      ? proposal.evidence.estimatedRevenue / proposal.evidence.projectedSpend
      : null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "600px",
        height: "100vh",
        backgroundColor: "white",
        boxShadow: "-2px 0 8px rgba(0,0,0,0.1)",
        zIndex: 1000,
        overflowY: "auto",
        padding: "24px",
      }}
    >
      <BlockStack gap="400">
        {/* Header */}
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h2" variant="headingLg">
            Campaign Approval
          </Text>
          <Button onClick={onClose} variant="plain">
            Close
          </Button>
        </InlineStack>

        <Divider />

        {/* Campaign Info */}
        <Card>
          <BlockStack gap="300">
            <InlineStack align="space-between" blockAlign="center">
              <Text as="h3" variant="headingMd">
                {proposal.campaign.name}
              </Text>
              <Badge tone={proposal.type === "create" ? "info" : "attention"}>
                {proposal.type.replace("_", " ").toUpperCase()}
              </Badge>
            </InlineStack>

            <InlineStack gap="200">
              <Badge>{proposal.campaign.platform.toUpperCase()}</Badge>
              <Text as="span" variant="bodySm" tone="subdued">
                Budget: {formatCentsToDollars(proposal.campaign.budgetCents)}
              </Text>
            </InlineStack>
          </BlockStack>
        </Card>

        {/* Changes (if update) */}
        {proposal.changes && proposal.changes.length > 0 && (
          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingMd">
                Proposed Changes
              </Text>
              {proposal.changes.map((change, idx) => (
                <Box key={idx}>
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    {change.field}
                  </Text>
                  <InlineStack gap="100">
                    <Text as="span" variant="bodySm" tone="subdued">
                      From: {String(change.oldValue)}
                    </Text>
                    <Text as="span" variant="bodySm">
                      →
                    </Text>
                    <Text as="span" variant="bodySm" fontWeight="semibold">
                      To: {String(change.newValue)}
                    </Text>
                  </InlineStack>
                </Box>
              ))}
            </BlockStack>
          </Card>
        )}

        {/* Evidence Section */}
        <Card>
          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">
              Evidence & Projections
            </Text>

            <Box>
              <BlockStack gap="200">
                <InlineStack align="space-between">
                  <Text as="span" variant="bodySm" tone="subdued">
                    Projected Spend
                  </Text>
                  <Text as="span" variant="bodyMd" fontWeight="semibold">
                    {formatCentsToDollars(proposal.evidence.projectedSpend)}
                  </Text>
                </InlineStack>

                {proposal.evidence.targetROAS && (
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodySm" tone="subdued">
                      Target ROAS
                    </Text>
                    <Text as="span" variant="bodyMd" fontWeight="semibold">
                      {formatROAS(proposal.evidence.targetROAS)}
                    </Text>
                  </InlineStack>
                )}

                {estimatedROAS && (
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodySm" tone="subdued">
                      Estimated ROAS
                    </Text>
                    <Text
                      as="span"
                      variant="bodyMd"
                      fontWeight="semibold"
                      tone={
                        estimatedROAS >= 2
                          ? "success"
                          : estimatedROAS >= 1
                            ? undefined
                            : "critical"
                      }
                    >
                      {formatROAS(estimatedROAS)}
                    </Text>
                  </InlineStack>
                )}

                {proposal.evidence.estimatedClicks && (
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodySm" tone="subdued">
                      Est. Clicks
                    </Text>
                    <Text as="span" variant="bodyMd">
                      {proposal.evidence.estimatedClicks.toLocaleString()}
                    </Text>
                  </InlineStack>
                )}

                {proposal.evidence.estimatedConversions && (
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodySm" tone="subdued">
                      Est. Conversions
                    </Text>
                    <Text as="span" variant="bodyMd">
                      {proposal.evidence.estimatedConversions.toLocaleString()}
                    </Text>
                  </InlineStack>
                )}

                {proposal.evidence.estimatedRevenue && (
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodySm" tone="subdued">
                      Est. Revenue
                    </Text>
                    <Text as="span" variant="bodyMd" fontWeight="semibold">
                      {formatCentsToDollars(proposal.evidence.estimatedRevenue)}
                    </Text>
                  </InlineStack>
                )}
              </BlockStack>
            </Box>
          </BlockStack>
        </Card>

        {/* Risk Assessment */}
        <Banner tone={riskTone}>
          <BlockStack gap="200">
            <Text as="p" variant="bodyMd" fontWeight="semibold">
              Risk Level: {proposal.risk.level.toUpperCase()}
            </Text>

            {proposal.risk.factors.length > 0 && (
              <Box>
                <Text as="p" variant="bodySm" fontWeight="semibold">
                  Risk Factors:
                </Text>
                <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                  {proposal.risk.factors.map((factor, idx) => (
                    <li key={idx}>
                      <Text as="span" variant="bodySm">
                        {factor}
                      </Text>
                    </li>
                  ))}
                </ul>
              </Box>
            )}

            {proposal.risk.mitigation.length > 0 && (
              <Box>
                <Text as="p" variant="bodySm" fontWeight="semibold">
                  Mitigation:
                </Text>
                <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                  {proposal.risk.mitigation.map((step, idx) => (
                    <li key={idx}>
                      <Text as="span" variant="bodySm">
                        {step}
                      </Text>
                    </li>
                  ))}
                </ul>
              </Box>
            )}
          </BlockStack>
        </Banner>

        {/* Rollback Plan */}
        <Card>
          <BlockStack gap="200">
            <InlineStack align="space-between" blockAlign="center">
              <Text as="h3" variant="headingMd">
                Rollback Plan
              </Text>
              <Badge
                tone={proposal.rollback.available ? "success" : "critical"}
              >
                {proposal.rollback.available ? "Available" : "Not Available"}
              </Badge>
            </InlineStack>

            {proposal.rollback.steps.length > 0 && (
              <ol style={{ paddingLeft: "20px" }}>
                {proposal.rollback.steps.map((step, idx) => (
                  <li key={idx}>
                    <Text as="span" variant="bodySm">
                      {step}
                    </Text>
                  </li>
                ))}
              </ol>
            )}
          </BlockStack>
        </Card>

        {/* Rejection Form */}
        {showRejectionForm && (
          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingMd">
                Rejection Reason (Required)
              </Text>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this campaign is being rejected..."
                style={{
                  width: "100%",
                  minHeight: "100px",
                  padding: "12px",
                  border: "1px solid #c9cccf",
                  borderRadius: "8px",
                  fontFamily: "inherit",
                  fontSize: "14px",
                }}
              />
            </BlockStack>
          </Card>
        )}

        {/* Actions */}
        <Box paddingBlockStart="400">
          <InlineStack gap="300" align="end">
            {!showRejectionForm ? (
              <>
                <Button
                  variant="primary"
                  tone="critical"
                  onClick={() => setShowRejectionForm(true)}
                  disabled={isApproving}
                >
                  Reject
                </Button>
                <Button
                  variant="primary"
                  onClick={handleApprove}
                  loading={isApproving}
                  disabled={isRejecting}
                >
                  Approve Campaign
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setShowRejectionForm(false)}
                  disabled={isRejecting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  tone="critical"
                  onClick={handleReject}
                  loading={isRejecting}
                  disabled={!rejectionReason.trim()}
                >
                  Confirm Rejection
                </Button>
              </>
            )}
          </InlineStack>
        </Box>

        {/* Metadata */}
        <Divider />
        <Box>
          <Text as="p" variant="bodySm" tone="subdued">
            Created: {new Date(proposal.createdAt).toLocaleString()}
            <br />
            By: {proposal.createdBy}
          </Text>
        </Box>
      </BlockStack>
    </div>
  );
}
