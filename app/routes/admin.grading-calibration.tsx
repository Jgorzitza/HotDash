/**
 * Grading Calibration Tool — Ensure consistent 1-5 scoring
 *
 * Admin interface for grading calibration training.
 * Shows example replies with reference scores to align reviewers.
 */

import { useLoaderData } from "react-router";
import {
  Page,
  Card,
  BlockStack,
  Text,
  InlineStack,
  Badge,
  Button,
  TextField,
  Divider,
} from "@shopify/polaris";
import { useState } from "react";

interface CalibrationExample {
  id: string;
  conversationContext: string[];
  draftReply: string;
  referenceGrading: {
    tone: number;
    accuracy: number;
    policy: number;
    rationale: string;
  };
}

const CALIBRATION_EXAMPLES: CalibrationExample[] = [
  {
    id: "excellent-example",
    conversationContext: ["[customer] Do you ship to Canada?"],
    draftReply:
      "Yes, we ship to Canada! Shipping takes 5-7 business days and costs $15 USD. Let me know if you'd like to place an order!",
    referenceGrading: {
      tone: 5,
      accuracy: 5,
      policy: 5,
      rationale:
        "Perfect tone (friendly, helpful), accurate information, follows shipping policy",
    },
  },
  {
    id: "good-example",
    conversationContext: ["[customer] What's your return policy?"],
    draftReply:
      "Our return policy allows returns within 30 days of purchase. Items must be unused and in original packaging.",
    referenceGrading: {
      tone: 4,
      accuracy: 5,
      policy: 5,
      rationale:
        "Accurate and policy-compliant, but tone could be warmer (missing greeting)",
    },
  },
  {
    id: "needs-improvement",
    conversationContext: ["[customer] My order arrived damaged"],
    draftReply:
      "Unfortunately, we cannot process returns for damaged items as per our policy. Please contact shipping carrier.",
    referenceGrading: {
      tone: 2,
      accuracy: 3,
      policy: 2,
      rationale:
        "Negative tone, inaccurate (we DO handle damaged items), doesn't follow customer service policy",
    },
  },
  {
    id: "fair-example",
    conversationContext: [
      "[customer] Is this part compatible with a 1967 Chevelle?",
    ],
    draftReply:
      "Based on our catalog, this part is compatible with 1964-1972 Chevelles. You should verify fitment with your specific model year and trim.",
    referenceGrading: {
      tone: 4,
      accuracy: 4,
      policy: 4,
      rationale:
        "Good information and helpful tone, could be more enthusiastic. Accuracy caveat is appropriate.",
    },
  },
];

export async function loader() {
  return { examples: CALIBRATION_EXAMPLES };
}

export default function GradingCalibration() {
  const { examples } = useLoaderData<typeof loader>();
  const [currentExample, setCurrentExample] = useState(0);
  const [userTone, setUserTone] = useState("");
  const [userAccuracy, setUserAccuracy] = useState("");
  const [userPolicy, setUserPolicy] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);

  const example = examples[currentExample];

  const checkAnswers = () => {
    setShowAnswer(true);
  };

  const nextExample = () => {
    setShowAnswer(false);
    setUserTone("");
    setUserAccuracy("");
    setUserPolicy("");
    setCurrentExample((prev) => (prev + 1) % examples.length);
  };

  const getScoreBadge = (userScore: number, refScore: number) => {
    const diff = Math.abs(userScore - refScore);
    if (diff === 0) return <Badge tone="success">Exact match!</Badge>;
    if (diff === 1) return <Badge tone="attention">Close (±1)</Badge>;
    return <Badge tone="critical">Off by {diff}</Badge>;
  };

  return (
    <Page
      title="Grading Calibration"
      subtitle="Practice consistent 1-5 scoring for customer reply quality"
    >
      <BlockStack gap="500">
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text as="h2" variant="headingMd">
                Example {currentExample + 1} of {examples.length}
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                ID: {example.id}
              </Text>
            </InlineStack>

            {/* Conversation Context */}
            <BlockStack gap="200">
              <Text as="p" variant="bodyMd" fontWeight="semibold">
                Conversation
              </Text>
              {example.conversationContext.map((msg, idx) => (
                <Text key={idx} as="p" variant="bodyMd">
                  {msg}
                </Text>
              ))}
            </BlockStack>

            <Divider />

            {/* Draft Reply */}
            <BlockStack gap="200">
              <Text as="p" variant="bodyMd" fontWeight="semibold">
                AI Draft Reply
              </Text>
              <Card background="bg-surface-secondary">
                <Text as="p" variant="bodyMd">
                  {example.draftReply}
                </Text>
              </Card>
            </BlockStack>
          </BlockStack>
        </Card>

        {/* Grading Form */}
        <Card>
          <BlockStack gap="400">
            <Text as="h3" variant="headingMd">
              Your Grading (1-5 scale)
            </Text>

            <BlockStack gap="300">
              <TextField
                label="Tone (Friendly, professional, brand-aligned)"
                type="number"
                value={userTone}
                onChange={setUserTone}
                min={1}
                max={5}
                autoComplete="off"
                disabled={showAnswer}
              />

              <TextField
                label="Accuracy (Factually correct, addresses need)"
                type="number"
                value={userAccuracy}
                onChange={setUserAccuracy}
                min={1}
                max={5}
                autoComplete="off"
                disabled={showAnswer}
              />

              <TextField
                label="Policy (Follows company guidelines)"
                type="number"
                value={userPolicy}
                onChange={setUserPolicy}
                min={1}
                max={5}
                autoComplete="off"
                disabled={showAnswer}
              />
            </BlockStack>

            <InlineStack gap="300">
              {!showAnswer ? (
                <Button onClick={checkAnswers} variant="primary">
                  Check Answers
                </Button>
              ) : (
                <Button onClick={nextExample} variant="primary">
                  Next Example
                </Button>
              )}
            </InlineStack>
          </BlockStack>
        </Card>

        {/* Reference Answer */}
        {showAnswer && (
          <Card>
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">
                Reference Grading
              </Text>

              <BlockStack gap="300">
                <InlineStack gap="300" blockAlign="center">
                  <div style={{ width: "100px" }}>
                    <Text as="p" variant="bodyMd">
                      Tone:
                    </Text>
                  </div>
                  <Text as="p" variant="headingMd">
                    {example.referenceGrading.tone}
                  </Text>
                  {userTone &&
                    getScoreBadge(
                      Number(userTone),
                      example.referenceGrading.tone,
                    )}
                </InlineStack>

                <InlineStack gap="300" blockAlign="center">
                  <div style={{ width: "100px" }}>
                    <Text as="p" variant="bodyMd">
                      Accuracy:
                    </Text>
                  </div>
                  <Text as="p" variant="headingMd">
                    {example.referenceGrading.accuracy}
                  </Text>
                  {userAccuracy &&
                    getScoreBadge(
                      Number(userAccuracy),
                      example.referenceGrading.accuracy,
                    )}
                </InlineStack>

                <InlineStack gap="300" blockAlign="center">
                  <div style={{ width: "100px" }}>
                    <Text as="p" variant="bodyMd">
                      Policy:
                    </Text>
                  </div>
                  <Text as="p" variant="headingMd">
                    {example.referenceGrading.policy}
                  </Text>
                  {userPolicy &&
                    getScoreBadge(
                      Number(userPolicy),
                      example.referenceGrading.policy,
                    )}
                </InlineStack>
              </BlockStack>

              <Divider />

              <BlockStack gap="200">
                <Text as="p" variant="bodyMd" fontWeight="semibold">
                  Rationale
                </Text>
                <Text as="p" variant="bodyMd">
                  {example.referenceGrading.rationale}
                </Text>
              </BlockStack>
            </BlockStack>
          </Card>
        )}

        {/* Guidelines */}
        <Card>
          <BlockStack gap="300">
            <Text as="h3" variant="headingMd">
              Grading Guidelines
            </Text>

            <BlockStack gap="200">
              <Text as="p" variant="bodyMd" fontWeight="semibold">
                Tone (1-5)
              </Text>
              <Text as="p" variant="bodySm">
                5: Perfectly friendly and professional, brand voice exemplar
              </Text>
              <Text as="p" variant="bodySm">
                4: Good tone, minor improvements possible
              </Text>
              <Text as="p" variant="bodySm">
                3: Acceptable but needs work (too formal or too casual)
              </Text>
              <Text as="p" variant="bodySm">
                2: Tone issues (negative language, unprofessional)
              </Text>
              <Text as="p" variant="bodySm">
                1: Unacceptable tone
              </Text>
            </BlockStack>

            <BlockStack gap="200">
              <Text as="p" variant="bodyMd" fontWeight="semibold">
                Accuracy (1-5)
              </Text>
              <Text as="p" variant="bodySm">
                5: Completely accurate, addresses customer need perfectly
              </Text>
              <Text as="p" variant="bodySm">
                4: Accurate with minor omissions
              </Text>
              <Text as="p" variant="bodySm">
                3: Mostly accurate but needs clarification
              </Text>
              <Text as="p" variant="bodySm">
                2: Contains errors or misleading information
              </Text>
              <Text as="p" variant="bodySm">
                1: Factually incorrect
              </Text>
            </BlockStack>

            <BlockStack gap="200">
              <Text as="p" variant="bodyMd" fontWeight="semibold">
                Policy (1-5)
              </Text>
              <Text as="p" variant="bodySm">
                5: Perfectly follows all company policies
              </Text>
              <Text as="p" variant="bodySm">
                4: Follows policy with minor gaps
              </Text>
              <Text as="p" variant="bodySm">
                3: Generally compliant but needs review
              </Text>
              <Text as="p" variant="bodySm">
                2: Policy violations present
              </Text>
              <Text as="p" variant="bodySm">
                1: Serious policy breach
              </Text>
            </BlockStack>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
