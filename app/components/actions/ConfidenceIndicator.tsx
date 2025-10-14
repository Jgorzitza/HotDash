/**
 * ConfidenceIndicator Component
 * 
 * Displays AI confidence score (0-100%) with color coding
 * - 0-50%: Critical (Red)
 * - 51-75%: Warning (Yellow)
 * - 76-100%: Success (Green)
 */

import { Card, BlockStack, InlineStack, Text, ProgressBar, Badge } from '@shopify/polaris';

export interface ConfidenceIndicatorProps {
  confidence: number; // 0-100
}

export function ConfidenceIndicator({ confidence }: ConfidenceIndicatorProps) {
  const getConfidenceTone = (): 'success' | 'warning' | 'critical' => {
    if (confidence >= 76) return 'success';
    if (confidence >= 51) return 'warning';
    return 'critical';
  };

  const getConfidenceLabel = (): string => {
    if (confidence >= 76) return 'High Confidence';
    if (confidence >= 51) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const getProgressColor = (): 'success' | 'primary' | 'critical' => {
    if (confidence >= 76) return 'success';
    if (confidence >= 51) return 'primary';
    return 'critical';
  };

  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center">
          <Text variant="headingXs">AI Confidence</Text>
          <Badge tone={getConfidenceTone()}>
            {getConfidenceLabel()}
          </Badge>
        </InlineStack>

        <ProgressBar 
          progress={confidence} 
          tone={getProgressColor()}
          size="small"
        />

        <InlineStack align="space-between">
          <Text variant="bodySm" tone="subdued">
            {confidence}% confident this action will achieve its goal
          </Text>
          <Text variant="bodySm" fontWeight="semibold">
            {confidence}%
          </Text>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

