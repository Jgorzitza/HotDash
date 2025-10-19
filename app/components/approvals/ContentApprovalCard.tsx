/**
 * Content Approval Card
 *
 * Displays content approval in approvals drawer.
 * Shows post preview, target metrics, tone check, evidence.
 *
 * @see app/services/content/approvals-integration.ts
 * @see app/components/approvals/ApprovalsDrawer.tsx
 */

import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  TextField,
  Button,
} from "@shopify/polaris";
import { useState } from "react";
import type { ContentApproval } from "~/services/content/approvals-integration";

export interface ContentApprovalCardProps {
  approval: ContentApproval;
  onApprove: (
    edits: { original_text: string; edited_text: string } | null,
    grades: any,
  ) => void;
  onDecline: (reason: string) => void;
}

export function ContentApprovalCard({
  approval,
  onApprove,
  onDecline,
}: ContentApprovalCardProps) {
  const [editedText, setEditedText] = useState(
    approval.post_draft.content.text,
  );
  const [toneGrade, setToneGrade] = useState<number>(4);
  const [accuracyGrade, setAccuracyGrade] = useState<number>(4);
  const [policyGrade, setPolicyGrade] = useState<number>(5);

  const hasEdits = editedText !== approval.post_draft.content.text;
  const platformName =
    approval.post_draft.platform.charAt(0).toUpperCase() +
    approval.post_draft.platform.slice(1);

  const getToneCheckBadge = () => {
    const { brand_voice, cta_present, length_ok } = approval.tone_check;

    if (brand_voice === "pass" && cta_present && length_ok) {
      return <Badge tone="success">Tone: Pass</Badge>;
    } else if (brand_voice === "review") {
      return <Badge tone="warning">Tone: Review</Badge>;
    }
    return <Badge tone="critical">Tone: Issues</Badge>;
  };

  const handleApprove = () => {
    const edits = hasEdits
      ? {
          original_text: approval.post_draft.content.text,
          edited_text: editedText,
        }
      : null;

    const grades = {
      tone: toneGrade as 1 | 2 | 3 | 4 | 5,
      accuracy: accuracyGrade as 1 | 2 | 3 | 4 | 5,
      policy: policyGrade as 1 | 2 | 3 | 4 | 5,
    };

    onApprove(edits, grades);
  };

  return (
    <Card>
      <BlockStack gap="400">
        {/* Header */}
        <InlineStack align="space-between" blockAlign="center">
          <BlockStack gap="100">
            <Text as="h3" variant="headingMd">
              {platformName} Post - {approval.post_draft.type}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              {approval.summary}
            </Text>
          </BlockStack>
          {getToneCheckBadge()}
        </InlineStack>

        {/* Post Preview */}
        <BlockStack gap="200">
          <Text as="p" variant="headingSm" fontWeight="semibold">
            Post Copy
          </Text>
          <TextField
            label="Edit post copy (optional)"
            value={editedText}
            onChange={setEditedText}
            multiline={4}
            autoComplete="off"
            helpText={
              hasEdits
                ? "⚠️ You've edited the post"
                : "Review and edit if needed"
            }
          />

          {approval.post_draft.content.hashtags && (
            <Text as="p" variant="bodySm" tone="subdued">
              Hashtags: {approval.post_draft.content.hashtags.join(" ")}
            </Text>
          )}
        </BlockStack>

        {/* Target Metrics */}
        <BlockStack gap="200">
          <Text as="p" variant="headingSm" fontWeight="semibold">
            Target Metrics
          </Text>
          <InlineStack gap="400">
            <Text as="p" variant="bodySm">
              ER: {approval.projected_impact.engagement_rate}%
            </Text>
            <Text as="p" variant="bodySm">
              CTR: {approval.projected_impact.click_through_rate}%
            </Text>
            <Text as="p" variant="bodySm">
              Est. Revenue: $
              {approval.projected_impact.estimated_revenue.toLocaleString()}
            </Text>
          </InlineStack>
        </BlockStack>

        {/* Evidence */}
        <BlockStack gap="200">
          <Text as="p" variant="headingSm" fontWeight="semibold">
            Evidence
          </Text>
          <Text as="p" variant="bodySm">
            {approval.evidence.why_now}
          </Text>
        </BlockStack>

        {/* Grading */}
        <BlockStack gap="200">
          <Text as="p" variant="headingSm" fontWeight="semibold">
            Quality Grades (1-5)
          </Text>
          <InlineStack gap="300">
            <div style={{ width: "100px" }}>
              <TextField
                label="Tone"
                type="number"
                value={toneGrade.toString()}
                onChange={(val) =>
                  setToneGrade(Math.min(5, Math.max(1, parseInt(val) || 1)))
                }
                autoComplete="off"
                min={1}
                max={5}
              />
            </div>
            <div style={{ width: "100px" }}>
              <TextField
                label="Accuracy"
                type="number"
                value={accuracyGrade.toString()}
                onChange={(val) =>
                  setAccuracyGrade(Math.min(5, Math.max(1, parseInt(val) || 1)))
                }
                autoComplete="off"
                min={1}
                max={5}
              />
            </div>
            <div style={{ width: "100px" }}>
              <TextField
                label="Policy"
                type="number"
                value={policyGrade.toString()}
                onChange={(val) =>
                  setPolicyGrade(Math.min(5, Math.max(1, parseInt(val) || 1)))
                }
                autoComplete="off"
                min={1}
                max={5}
              />
            </div>
          </InlineStack>
        </BlockStack>

        {/* Actions */}
        <InlineStack align="end" gap="200">
          <Button onClick={() => onDecline("CEO declined")}>Decline</Button>
          <Button variant="primary" onClick={handleApprove}>
            Approve {hasEdits ? "(with edits)" : ""}
          </Button>
        </InlineStack>

        {/* Rollback Info */}
        <Text as="p" variant="bodySm" tone="subdued">
          Rollback: {approval.rollback.plan}
        </Text>
      </BlockStack>
    </Card>
  );
}
