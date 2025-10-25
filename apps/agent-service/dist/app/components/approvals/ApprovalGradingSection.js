import { BlockStack, InlineStack, Text, RangeSlider, Card, } from "@shopify/polaris";
export function ApprovalGradingSection({ kind, toneGrade, accuracyGrade, policyGrade, onToneChange, onAccuracyChange, onPolicyChange, }) {
    if (kind !== "cx_reply")
        return null;
    return (<Card>
      <BlockStack gap="300">
        <Text as="h3" variant="headingMd">
          Grades (HITL)
        </Text>
        <InlineStack gap="400">
          <BlockStack gap="150" align="start">
            <Text as="p" variant="bodySm">
              Tone: {toneGrade}
            </Text>
            <RangeSlider label="" output min={1} max={5} value={toneGrade} onChange={(v) => onToneChange(Array.isArray(v) ? v[0] : v)}/>
          </BlockStack>
          <BlockStack gap="150" align="start">
            <Text as="p" variant="bodySm">
              Accuracy: {accuracyGrade}
            </Text>
            <RangeSlider label="" output min={1} max={5} value={accuracyGrade} onChange={(v) => onAccuracyChange(Array.isArray(v) ? v[0] : v)}/>
          </BlockStack>
          <BlockStack gap="150" align="start">
            <Text as="p" variant="bodySm">
              Policy: {policyGrade}
            </Text>
            <RangeSlider label="" output min={1} max={5} value={policyGrade} onChange={(v) => onPolicyChange(Array.isArray(v) ? v[0] : v)}/>
          </BlockStack>
        </InlineStack>
      </BlockStack>
    </Card>);
}
//# sourceMappingURL=ApprovalGradingSection.js.map