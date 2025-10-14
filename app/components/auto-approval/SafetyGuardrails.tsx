/**
 * SafetyGuardrails Component - P0
 * 
 * Safety limits for auto-approval
 * - Max per day
 * - High-value threshold
 * - Require manual for high value
 */

import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Checkbox,
  Banner,
  Divider,
} from '@shopify/polaris';

export interface SafetyGuardrailsProps {
  guardrails: {
    maxPerDay: number;
    highValueThreshold: number;
    requireManualForHighValue: boolean;
  };
  onChange: (guardrails: SafetyGuardrailsProps['guardrails']) => void;
}

export function SafetyGuardrails({ guardrails, onChange }: SafetyGuardrailsProps) {
  const handleMaxPerDayChange = (value: string) => {
    const num = parseInt(value) || 0;
    onChange({ ...guardrails, maxPerDay: num });
  };

  const handleHighValueThresholdChange = (value: string) => {
    const num = parseInt(value) || 0;
    onChange({ ...guardrails, highValueThreshold: num });
  };

  const handleRequireManualChange = (value: boolean) => {
    onChange({ ...guardrails, requireManualForHighValue: value });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <BlockStack gap="400">
        <Text variant="headingMd" as="h3">
          Safety Guardrails
        </Text>

        <Banner tone="warning">
          <Text>
            🛡️ These limits prevent excessive auto-approvals and ensure critical actions get human review.
          </Text>
        </Banner>

        <Divider />

        <BlockStack gap="500">
          {/* Max Per Day */}
          <BlockStack gap="200">
            <TextField
              label="Maximum Auto-Approvals Per Day"
              type="number"
              value={guardrails.maxPerDay.toString()}
              onChange={handleMaxPerDayChange}
              autoComplete="off"
              helpText="System will pause auto-approvals after this limit is reached"
              min={1}
              max={1000}
            />
          </BlockStack>

          {/* High Value Threshold */}
          <BlockStack gap="200">
            <TextField
              label="High-Value Threshold"
              type="number"
              value={guardrails.highValueThreshold.toString()}
              onChange={handleHighValueThresholdChange}
              prefix="$"
              autoComplete="off"
              helpText="Actions with estimated revenue impact above this amount are considered high-value"
              min={100}
              max={100000}
            />
          </BlockStack>

          {/* Require Manual for High Value */}
          <Checkbox
            label="Require manual approval for high-value actions"
            checked={guardrails.requireManualForHighValue}
            onChange={handleRequireManualChange}
            helpText={
              guardrails.requireManualForHighValue
                ? `Actions with impact > ${formatCurrency(guardrails.highValueThreshold)} will always require manual review`
                : `High-value actions can be auto-approved if they meet confidence threshold`
            }
          />

          {/* Summary */}
          <Banner tone="info" hideIcon>
            <BlockStack gap="200">
              <Text variant="bodyMd" fontWeight="semibold">
                Current Settings Summary
              </Text>
              <Text variant="bodySm">
                • Up to {guardrails.maxPerDay} actions can auto-approve per day
              </Text>
              <Text variant="bodySm">
                • High-value actions ({formatCurrency(guardrails.highValueThreshold)}+) 
                {guardrails.requireManualForHighValue 
                  ? ' always require manual review' 
                  : ' can auto-approve if confident'}
              </Text>
            </BlockStack>
          </Banner>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

