/**
 * Approval Grading Section — Quality grading UI for CX replies
 *
 * Displays grading form for tone, accuracy, and policy (1-5 scale).
 * Required for cx_reply approvals before approve button is enabled.
 */

import {
  Card,
  BlockStack,
  Text,
  TextField,
  InlineStack,
  Badge,
} from "@shopify/polaris";

export interface ApprovalGradingSectionProps {
  kind: "cx_reply" | "inventory" | "growth" | "misc";
  toneGrade: number;
  accuracyGrade: number;
  policyGrade: number;
  onToneChange: (value: number) => void;
  onAccuracyChange: (value: number) => void;
  onPolicyChange: (value: number) => void;
}

export function ApprovalGradingSection({
  kind,
  toneGrade,
  accuracyGrade,
  policyGrade,
  onToneChange,
  onAccuracyChange,
  onPolicyChange,
}: ApprovalGradingSectionProps) {
  // Only show for CX replies
  if (kind !== "cx_reply") {
    return null;
  }

  const handleGradeChange = (
    setter: (value: number) => void,
    value: string,
  ) => {
    const num = Number(value);
    const clamped = Math.max(1, Math.min(5, num));
    setter(clamped);
  };

  const getScoreBadge = (score: number) => {
    if (score >= 4.5) return { text: "Excellent", tone: "success" as const };
    if (score >= 4.0) return { text: "Good", tone: "success" as const };
    if (score >= 3.0) return { text: "Fair", tone: "attention" as const };
    return { text: "Needs Work", tone: "critical" as const };
  };

  const avgScore = (toneGrade + accuracyGrade + policyGrade) / 3;
  const scoreBadge = getScoreBadge(avgScore);

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h3" variant="headingMd">
            Quality Grading (Required)
          </Text>
          <Badge tone={scoreBadge.tone}>
            {avgScore.toFixed(1)} / 5.0 - {scoreBadge.text}
          </Badge>
        </InlineStack>

        <Text as="p" variant="bodySm" tone="subdued">
          Grade this reply on a 1-5 scale before approving. These scores are
          used for learning and quality metrics.
        </Text>

        <BlockStack gap="300">
          <TextField
            label="Tone"
            helpText="Friendly, professional, aligned with brand voice"
            type="number"
            value={String(toneGrade)}
            onChange={(val) => handleGradeChange(onToneChange, val)}
            min={1}
            max={5}
            autoComplete="off"
          />

          <TextField
            label="Accuracy"
            helpText="Factually correct, addresses customer need"
            type="number"
            value={String(accuracyGrade)}
            onChange={(val) => handleGradeChange(onAccuracyChange, val)}
            min={1}
            max={5}
            autoComplete="off"
          />

          <TextField
            label="Policy"
            helpText="Follows company policies and guidelines"
            type="number"
            value={String(policyGrade)}
            onChange={(val) => handleGradeChange(onPolicyChange, val)}
            min={1}
            max={5}
            autoComplete="off"
          />
        </BlockStack>

        <BlockStack gap="200">
          <Text as="p" variant="bodyMd" fontWeight="semibold">
            Grading Reference
          </Text>
          <BlockStack gap="100">
            <Text as="p" variant="bodySm">
              <strong>5:</strong> Excellent - perfect example of quality
            </Text>
            <Text as="p" variant="bodySm">
              <strong>4:</strong> Good - minor improvements possible
            </Text>
            <Text as="p" variant="bodySm">
              <strong>3:</strong> Acceptable - needs work
            </Text>
            <Text as="p" variant="bodySm">
              <strong>2:</strong> Below standard - significant issues
            </Text>
            <Text as="p" variant="bodySm">
              <strong>1:</strong> Unacceptable - complete rewrite needed
            </Text>
          </BlockStack>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
