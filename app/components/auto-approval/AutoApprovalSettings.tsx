/**
 * AutoApprovalSettings Component - P0
 * 
 * Threshold sliders for each recommender
 * Shows confidence threshold and enable/disable toggle
 */

import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  RangeSlider,
  Checkbox,
  Box,
  Divider,
} from '@shopify/polaris';
import { useState } from 'react';

export interface Recommender {
  id: string;
  name: string;
  threshold: number;
  enabled: boolean;
}

export interface AutoApprovalSettingsProps {
  recommenders: Recommender[];
  onChange: (recommenders: Recommender[]) => void;
}

export function AutoApprovalSettings({ 
  recommenders, 
  onChange 
}: AutoApprovalSettingsProps) {
  const handleThresholdChange = (id: string, newValue: number) => {
    const updated = recommenders.map(r =>
      r.id === id ? { ...r, threshold: newValue } : r
    );
    onChange(updated);
  };

  const handleEnabledChange = (id: string, enabled: boolean) => {
    const updated = recommenders.map(r =>
      r.id === id ? { ...r, enabled } : r
    );
    onChange(updated);
  };

  const getThresholdTone = (threshold: number) => {
    if (threshold >= 85) return 'success';
    if (threshold >= 70) return 'info';
    return 'warning';
  };

  return (
    <Card>
      <BlockStack gap="400">
        <Text variant="headingMd" as="h3">
          Recommender Thresholds
        </Text>

        <Text variant="bodySm" tone="subdued">
          Set minimum confidence thresholds for automatic approval. 
          Actions below the threshold will require manual review.
        </Text>

        <Divider />

        <BlockStack gap="500">
          {recommenders.map((recommender) => (
            <Box
              key={recommender.id}
              background={recommender.enabled ? 'bg-surface-active' : 'bg-surface'}
              padding="400"
              borderRadius="200"
            >
              <BlockStack gap="300">
                {/* Header: Name and Toggle */}
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="bodyMd" fontWeight="semibold">
                    {recommender.name}
                  </Text>
                  <Checkbox
                    label="Enable"
                    checked={recommender.enabled}
                    onChange={(value) => handleEnabledChange(recommender.id, value)}
                  />
                </InlineStack>

                {/* Threshold Slider */}
                <Box paddingBlockStart="200">
                  <RangeSlider
                    label={`Confidence Threshold: ${recommender.threshold}%`}
                    value={recommender.threshold}
                    onChange={(value) => handleThresholdChange(recommender.id, value)}
                    output
                    min={50}
                    max={100}
                    step={5}
                    disabled={!recommender.enabled}
                  />
                </Box>

                {/* Threshold Info */}
                <InlineStack gap="200" align="space-between">
                  <Text variant="bodySm" tone="subdued">
                    {recommender.enabled 
                      ? `Actions ≥ ${recommender.threshold}% confidence will auto-approve`
                      : 'All actions require manual review'}
                  </Text>
                  {recommender.enabled && (
                    <Box
                      background={`bg-fill-${getThresholdTone(recommender.threshold)}` as any}
                      paddingInline="200"
                      paddingBlock="100"
                      borderRadius="100"
                    >
                      <Text 
                        variant="bodySm" 
                        fontWeight="semibold"
                        tone={getThresholdTone(recommender.threshold)}
                      >
                        {recommender.threshold >= 85 ? 'Conservative' : 
                         recommender.threshold >= 70 ? 'Moderate' : 'Aggressive'}
                      </Text>
                    </Box>
                  )}
                </InlineStack>
              </BlockStack>
            </Box>
          ))}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

