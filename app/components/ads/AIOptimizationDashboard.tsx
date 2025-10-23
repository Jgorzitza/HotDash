/**
 * AI Optimization Dashboard Component
 * 
 * ADS-005: Dashboard for viewing and managing AI-powered ad optimizations
 * Displays bid adjustments, audience targeting, budget allocation, and ROI tracking
 */

import { useState } from 'react';
import { Card, Text, Button, Badge, Stack, InlineStack, BlockStack, Box } from '@shopify/polaris';
import type {
  BidAdjustmentRecommendation,
  AudienceTargetingRecommendation,
  BudgetAllocationRecommendation,
} from '~/lib/ads/ai-optimizer';
import type { ROITrackingSummary } from '~/services/ads/roi-tracker';

interface AIOptimizationDashboardProps {
  bidAdjustments: BidAdjustmentRecommendation[];
  audienceTargeting: AudienceTargetingRecommendation[];
  budgetAllocation: BudgetAllocationRecommendation;
  roiSummary: ROITrackingSummary;
  onApplyRecommendation?: (type: string, campaignId: string) => void;
  loading?: boolean;
}

export function AIOptimizationDashboard({
  bidAdjustments,
  audienceTargeting,
  budgetAllocation,
  roiSummary,
  onApplyRecommendation,
  loading = false,
}: AIOptimizationDashboardProps) {
  const [activeTab, setActiveTab] = useState<'bids' | 'audience' | 'budget' | 'roi'>('bids');

  return (
    <BlockStack gap="400">
      {/* Header */}
      <Card>
        <BlockStack gap="200">
          <Text variant="headingLg" as="h2">
            AI-Powered Ad Optimization
          </Text>
          <Text variant="bodyMd" as="p" tone="subdued">
            Intelligent recommendations to improve campaign performance and maximize ROI
          </Text>
        </BlockStack>
      </Card>

      {/* Summary Cards */}
      <InlineStack gap="400" wrap={false}>
        <Card>
          <BlockStack gap="200">
            <Text variant="headingSm" as="h3">
              Total Recommendations
            </Text>
            <Text variant="heading2xl" as="p">
              {bidAdjustments.length + audienceTargeting.length + budgetAllocation.allocations.length}
            </Text>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="200">
            <Text variant="headingSm" as="h3">
              High Priority
            </Text>
            <Text variant="heading2xl" as="p">
              {bidAdjustments.filter(r => r.confidence > 0.85).length}
            </Text>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="200">
            <Text variant="headingSm" as="h3">
              Overall ROAS
            </Text>
            <Text variant="heading2xl" as="p">
              {roiSummary.overallROAS.toFixed(2)}x
            </Text>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="200">
            <Text variant="headingSm" as="h3">
              Projected Improvement
            </Text>
            <Text variant="heading2xl" as="p" tone="success">
              +{((budgetAllocation.projectedTotalROAS - roiSummary.overallROAS) * 100).toFixed(1)}%
            </Text>
          </BlockStack>
        </Card>
      </InlineStack>

      {/* Tab Navigation */}
      <Card>
        <InlineStack gap="200">
          <Button
            pressed={activeTab === 'bids'}
            onClick={() => setActiveTab('bids')}
          >
            Bid Adjustments ({bidAdjustments.length})
          </Button>
          <Button
            pressed={activeTab === 'audience'}
            onClick={() => setActiveTab('audience')}
          >
            Audience Targeting ({audienceTargeting.length})
          </Button>
          <Button
            pressed={activeTab === 'budget'}
            onClick={() => setActiveTab('budget')}
          >
            Budget Allocation ({budgetAllocation.allocations.length})
          </Button>
          <Button
            pressed={activeTab === 'roi'}
            onClick={() => setActiveTab('roi')}
          >
            ROI Tracking
          </Button>
        </InlineStack>
      </Card>

      {/* Tab Content */}
      {activeTab === 'bids' && (
        <BidAdjustmentsTab
          recommendations={bidAdjustments}
          onApply={onApplyRecommendation}
          loading={loading}
        />
      )}

      {activeTab === 'audience' && (
        <AudienceTargetingTab
          recommendations={audienceTargeting}
          onApply={onApplyRecommendation}
          loading={loading}
        />
      )}

      {activeTab === 'budget' && (
        <BudgetAllocationTab
          recommendation={budgetAllocation}
          onApply={onApplyRecommendation}
          loading={loading}
        />
      )}

      {activeTab === 'roi' && (
        <ROITrackingTab summary={roiSummary} />
      )}
    </BlockStack>
  );
}

// Bid Adjustments Tab
function BidAdjustmentsTab({
  recommendations,
  onApply,
  loading,
}: {
  recommendations: BidAdjustmentRecommendation[];
  onApply?: (type: string, campaignId: string) => void;
  loading: boolean;
}) {
  return (
    <BlockStack gap="400">
      {recommendations.map((rec) => (
        <Card key={rec.campaignId}>
          <BlockStack gap="300">
            <InlineStack align="space-between" blockAlign="center">
              <Text variant="headingMd" as="h3">
                {rec.campaignName}
              </Text>
              <Badge tone={rec.confidence > 0.85 ? 'success' : rec.confidence > 0.7 ? 'info' : 'warning'}>
                {(rec.confidence * 100).toFixed(0)}% confidence
              </Badge>
            </InlineStack>

            <BlockStack gap="200">
              <InlineStack gap="400">
                <Box>
                  <Text variant="bodySm" as="p" tone="subdued">
                    Current Bid
                  </Text>
                  <Text variant="bodyLg" as="p">
                    ${(rec.currentBid / 100).toFixed(2)}
                  </Text>
                </Box>
                <Box>
                  <Text variant="bodySm" as="p" tone="subdued">
                    Recommended Bid
                  </Text>
                  <Text variant="bodyLg" as="p" tone={rec.adjustment > 0 ? 'success' : 'critical'}>
                    ${(rec.recommendedBid / 100).toFixed(2)} ({rec.adjustment > 0 ? '+' : ''}{rec.adjustment.toFixed(1)}%)
                  </Text>
                </Box>
              </InlineStack>

              <Text variant="bodySm" as="p">
                {rec.reasoning}
              </Text>

              <Box>
                <Text variant="bodySm" as="p" fontWeight="semibold">
                  Expected Impact:
                </Text>
                <Text variant="bodySm" as="p">
                  Clicks: {rec.expectedImpact.clicks} | Conversions: {rec.expectedImpact.conversions} | ROAS: {rec.expectedImpact.roas.toFixed(2)}x
                </Text>
              </Box>
            </BlockStack>

            <InlineStack align="end">
              <Button
                onClick={() => onApply?.('bid_adjustment', rec.campaignId)}
                loading={loading}
                tone="success"
              >
                Apply Recommendation
              </Button>
            </InlineStack>
          </BlockStack>
        </Card>
      ))}

      {recommendations.length === 0 && (
        <Card>
          <Text variant="bodyMd" as="p" tone="subdued">
            No bid adjustment recommendations at this time. Your campaigns are performing optimally.
          </Text>
        </Card>
      )}
    </BlockStack>
  );
}

// Audience Targeting Tab
function AudienceTargetingTab({
  recommendations,
  onApply,
  loading,
}: {
  recommendations: AudienceTargetingRecommendation[];
  onApply?: (type: string, campaignId: string) => void;
  loading: boolean;
}) {
  return (
    <BlockStack gap="400">
      {recommendations.map((rec) => (
        <Card key={rec.campaignId}>
          <BlockStack gap="300">
            <InlineStack align="space-between" blockAlign="center">
              <Text variant="headingMd" as="h3">
                {rec.campaignName}
              </Text>
              <Badge tone="info">
                {(rec.confidence * 100).toFixed(0)}% confidence
              </Badge>
            </InlineStack>

            <BlockStack gap="200">
              <Text variant="bodySm" as="p">
                {rec.reasoning}
              </Text>

              <Box>
                <Text variant="bodySm" as="p" fontWeight="semibold">
                  Recommended Audience:
                </Text>
                {rec.audienceSegment.demographics.ageRange && (
                  <Text variant="bodySm" as="p">
                    Age: {rec.audienceSegment.demographics.ageRange}
                  </Text>
                )}
                {rec.audienceSegment.demographics.location && (
                  <Text variant="bodySm" as="p">
                    Locations: {rec.audienceSegment.demographics.location.join(', ')}
                  </Text>
                )}
                <Text variant="bodySm" as="p">
                  Interests: {rec.audienceSegment.interests.join(', ')}
                </Text>
              </Box>

              <Box>
                <Text variant="bodySm" as="p" fontWeight="semibold">
                  Expected Performance:
                </Text>
                <Text variant="bodySm" as="p">
                  CTR: {(rec.expectedPerformance.estimatedCTR * 100).toFixed(2)}% | 
                  Conv Rate: {(rec.expectedPerformance.estimatedConversionRate * 100).toFixed(2)}% | 
                  ROAS: {rec.expectedPerformance.estimatedROAS.toFixed(2)}x
                </Text>
              </Box>
            </BlockStack>

            <InlineStack align="end">
              <Button
                onClick={() => onApply?.('audience_targeting', rec.campaignId)}
                loading={loading}
                tone="success"
              >
                Apply Recommendation
              </Button>
            </InlineStack>
          </BlockStack>
        </Card>
      ))}

      {recommendations.length === 0 && (
        <Card>
          <Text variant="bodyMd" as="p" tone="subdued">
            No audience targeting recommendations at this time.
          </Text>
        </Card>
      )}
    </BlockStack>
  );
}

