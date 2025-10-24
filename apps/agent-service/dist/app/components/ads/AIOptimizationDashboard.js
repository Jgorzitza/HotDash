/**
 * AI Optimization Dashboard Component
 *
 * ADS-005: Dashboard for viewing and managing AI-powered ad optimizations
 * Displays bid adjustments, audience targeting, budget allocation, and ROI tracking
 */
import { useState } from "react";
import { Card, Text, Button, Badge, InlineStack, BlockStack, Box, } from "@shopify/polaris";
export function AIOptimizationDashboard({ bidAdjustments, audienceTargeting, budgetAllocation, roiSummary, onApplyRecommendation, loading = false, }) {
    const [activeTab, setActiveTab] = useState("bids");
    return (<BlockStack gap="400">
      {/* Header */}
      <Card>
        <BlockStack gap="200">
          <Text variant="headingLg" as="h2">
            AI-Powered Ad Optimization
          </Text>
          <Text variant="bodyMd" as="p" tone="subdued">
            Intelligent recommendations to improve campaign performance and
            maximize ROI
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
              {bidAdjustments.length +
            audienceTargeting.length +
            budgetAllocation.allocations.length}
            </Text>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="200">
            <Text variant="headingSm" as="h3">
              High Priority
            </Text>
            <Text variant="heading2xl" as="p">
              {bidAdjustments.filter((r) => r.confidence > 0.85).length}
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
              +
              {((budgetAllocation.projectedTotalROAS - roiSummary.overallROAS) *
            100).toFixed(1)}
              %
            </Text>
          </BlockStack>
        </Card>
      </InlineStack>

      {/* Tab Navigation */}
      <Card>
        <InlineStack gap="200">
          <Button pressed={activeTab === "bids"} onClick={() => setActiveTab("bids")}>
            Bid Adjustments ({bidAdjustments.length})
          </Button>
          <Button pressed={activeTab === "audience"} onClick={() => setActiveTab("audience")}>
            Audience Targeting ({audienceTargeting.length})
          </Button>
          <Button pressed={activeTab === "budget"} onClick={() => setActiveTab("budget")}>
            Budget Allocation ({budgetAllocation.allocations.length})
          </Button>
          <Button pressed={activeTab === "roi"} onClick={() => setActiveTab("roi")}>
            ROI Tracking
          </Button>
        </InlineStack>
      </Card>

      {/* Tab Content */}
      {activeTab === "bids" && (<BidAdjustmentsTab recommendations={bidAdjustments} onApply={onApplyRecommendation} loading={loading}/>)}

      {activeTab === "audience" && (<AudienceTargetingTab recommendations={audienceTargeting} onApply={onApplyRecommendation} loading={loading}/>)}

      {activeTab === "budget" && (<BudgetAllocationTab recommendation={budgetAllocation} onApply={onApplyRecommendation} loading={loading}/>)}

      {activeTab === "roi" && <ROITrackingTab summary={roiSummary}/>}
    </BlockStack>);
}
// Bid Adjustments Tab
function BidAdjustmentsTab({ recommendations, onApply, loading, }) {
    return (<BlockStack gap="400">
      {recommendations.map((rec) => (<Card key={rec.campaignId}>
          <BlockStack gap="300">
            <InlineStack align="space-between" blockAlign="center">
              <Text variant="headingMd" as="h3">
                {rec.campaignName}
              </Text>
              <Badge tone={rec.confidence > 0.85
                ? "success"
                : rec.confidence > 0.7
                    ? "info"
                    : "warning"}>
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
                  <Text variant="bodyLg" as="p" tone={rec.adjustment > 0 ? "success" : "critical"}>
                    ${(rec.recommendedBid / 100).toFixed(2)} (
                    {rec.adjustment > 0 ? "+" : ""}
                    {rec.adjustment.toFixed(1)}%)
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
                  Clicks: {rec.expectedImpact.clicks} | Conversions:{" "}
                  {rec.expectedImpact.conversions} | ROAS:{" "}
                  {rec.expectedImpact.roas.toFixed(2)}x
                </Text>
              </Box>
            </BlockStack>

            <InlineStack align="end">
              <Button onClick={() => onApply?.("bid_adjustment", rec.campaignId)} loading={loading} tone="success">
                Apply Recommendation
              </Button>
            </InlineStack>
          </BlockStack>
        </Card>))}

      {recommendations.length === 0 && (<Card>
          <Text variant="bodyMd" as="p" tone="subdued">
            No bid adjustment recommendations at this time. Your campaigns are
            performing optimally.
          </Text>
        </Card>)}
    </BlockStack>);
}
// Audience Targeting Tab
function AudienceTargetingTab({ recommendations, onApply, loading, }) {
    return (<BlockStack gap="400">
      {recommendations.map((rec) => (<Card key={rec.campaignId}>
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
                {rec.audienceSegment.demographics.ageRange && (<Text variant="bodySm" as="p">
                    Age: {rec.audienceSegment.demographics.ageRange}
                  </Text>)}
                {rec.audienceSegment.demographics.location && (<Text variant="bodySm" as="p">
                    Locations:{" "}
                    {rec.audienceSegment.demographics.location.join(", ")}
                  </Text>)}
                <Text variant="bodySm" as="p">
                  Interests: {rec.audienceSegment.interests.join(", ")}
                </Text>
              </Box>

              <Box>
                <Text variant="bodySm" as="p" fontWeight="semibold">
                  Expected Performance:
                </Text>
                <Text variant="bodySm" as="p">
                  CTR: {(rec.expectedPerformance.estimatedCTR * 100).toFixed(2)}
                  % | Conv Rate:{" "}
                  {(rec.expectedPerformance.estimatedConversionRate * 100).toFixed(2)}
                  % | ROAS: {rec.expectedPerformance.estimatedROAS.toFixed(2)}x
                </Text>
              </Box>
            </BlockStack>

            <InlineStack align="end">
              <Button onClick={() => onApply?.("audience_targeting", rec.campaignId)} loading={loading} tone="success">
                Apply Recommendation
              </Button>
            </InlineStack>
          </BlockStack>
        </Card>))}

      {recommendations.length === 0 && (<Card>
          <Text variant="bodyMd" as="p" tone="subdued">
            No audience targeting recommendations at this time.
          </Text>
        </Card>)}
    </BlockStack>);
}
// Budget Allocation Tab
function BudgetAllocationTab({ recommendation, onApply, loading, }) {
    return (<BlockStack gap="400">
      <Card>
        <BlockStack gap="300">
          <InlineStack align="space-between" blockAlign="center">
            <Text variant="headingMd" as="h3">
              Optimized Budget Allocation
            </Text>
            <Badge tone="success">
              {(recommendation.confidence * 100).toFixed(0)}% confidence
            </Badge>
          </InlineStack>

          <InlineStack gap="400">
            <Box>
              <Text variant="bodySm" as="p" tone="subdued">
                Total Budget
              </Text>
              <Text variant="bodyLg" as="p">
                ${(recommendation.totalBudget / 100).toFixed(2)}
              </Text>
            </Box>
            <Box>
              <Text variant="bodySm" as="p" tone="subdued">
                Projected ROAS
              </Text>
              <Text variant="bodyLg" as="p" tone="success">
                {recommendation.projectedTotalROAS.toFixed(2)}x
              </Text>
            </Box>
          </InlineStack>
        </BlockStack>
      </Card>

      {recommendation.allocations.map((alloc) => (<Card key={alloc.campaignId}>
          <BlockStack gap="300">
            <Text variant="headingMd" as="h3">
              {alloc.campaignName}
            </Text>

            <InlineStack gap="400">
              <Box>
                <Text variant="bodySm" as="p" tone="subdued">
                  Current Budget
                </Text>
                <Text variant="bodyLg" as="p">
                  ${(alloc.currentBudget / 100).toFixed(2)}
                </Text>
              </Box>
              <Box>
                <Text variant="bodySm" as="p" tone="subdued">
                  Recommended Budget
                </Text>
                <Text variant="bodyLg" as="p" tone={alloc.change > 0
                ? "success"
                : alloc.change < 0
                    ? "critical"
                    : undefined}>
                  ${(alloc.recommendedBudget / 100).toFixed(2)} (
                  {alloc.change > 0 ? "+" : ""}
                  {alloc.change.toFixed(1)}%)
                </Text>
              </Box>
              <Box>
                <Text variant="bodySm" as="p" tone="subdued">
                  Expected ROAS
                </Text>
                <Text variant="bodyLg" as="p">
                  {alloc.expectedROAS.toFixed(2)}x
                </Text>
              </Box>
            </InlineStack>

            <Text variant="bodySm" as="p">
              {alloc.reasoning}
            </Text>
          </BlockStack>
        </Card>))}

      <Card>
        <InlineStack align="end">
          <Button onClick={() => onApply?.("budget_allocation", "all")} loading={loading} tone="success">
            Apply All Budget Changes
          </Button>
        </InlineStack>
      </Card>
    </BlockStack>);
}
// ROI Tracking Tab
function ROITrackingTab({ summary }) {
    return (<BlockStack gap="400">
      {/* Summary Card */}
      <Card>
        <BlockStack gap="300">
          <Text variant="headingMd" as="h3">
            ROI Summary
          </Text>

          <InlineStack gap="400">
            <Box>
              <Text variant="bodySm" as="p" tone="subdued">
                Total Revenue
              </Text>
              <Text variant="bodyLg" as="p">
                ${(summary.totalRevenueCents / 100).toFixed(2)}
              </Text>
            </Box>
            <Box>
              <Text variant="bodySm" as="p" tone="subdued">
                Total Cost
              </Text>
              <Text variant="bodyLg" as="p">
                ${(summary.totalCostCents / 100).toFixed(2)}
              </Text>
            </Box>
            <Box>
              <Text variant="bodySm" as="p" tone="subdued">
                Overall ROAS
              </Text>
              <Text variant="bodyLg" as="p" tone="success">
                {summary.overallROAS.toFixed(2)}x
              </Text>
            </Box>
          </InlineStack>
        </BlockStack>
      </Card>

      {/* Insights */}
      {summary.insights.length > 0 && (<Card>
          <BlockStack gap="200">
            <Text variant="headingMd" as="h3">
              Key Insights
            </Text>
            {summary.insights.map((insight, index) => (<Text key={index} variant="bodySm" as="p">
                • {insight}
              </Text>))}
          </BlockStack>
        </Card>)}

      {/* Top Performing Campaigns */}
      <Card>
        <BlockStack gap="300">
          <Text variant="headingMd" as="h3">
            Top Performing Campaigns
          </Text>

          {summary.topPerformingCampaigns.map((campaign) => (<InlineStack key={campaign.campaignId} align="space-between" blockAlign="center">
              <Box>
                <Text variant="bodyMd" as="p" fontWeight="semibold">
                  {campaign.campaignName}
                </Text>
                <Text variant="bodySm" as="p" tone="subdued">
                  Revenue: ${(campaign.revenueCents / 100).toFixed(2)}
                </Text>
              </Box>
              <Badge tone="success">{campaign.roas.toFixed(2)}x ROAS</Badge>
            </InlineStack>))}
        </BlockStack>
      </Card>

      {/* CLV Metrics */}
      {summary.clvMetrics.length > 0 && (<Card>
          <BlockStack gap="300">
            <Text variant="headingMd" as="h3">
              Customer Lifetime Value
            </Text>

            {summary.clvMetrics.slice(0, 5).map((clv) => (<BlockStack key={clv.campaignId} gap="200">
                <Text variant="bodyMd" as="p" fontWeight="semibold">
                  {clv.campaignName}
                </Text>
                <InlineStack gap="400">
                  <Box>
                    <Text variant="bodySm" as="p" tone="subdued">
                      Avg CLV
                    </Text>
                    <Text variant="bodySm" as="p">
                      ${(clv.averageCLV / 100).toFixed(2)}
                    </Text>
                  </Box>
                  <Box>
                    <Text variant="bodySm" as="p" tone="subdued">
                      Repeat Rate
                    </Text>
                    <Text variant="bodySm" as="p">
                      {(clv.repeatPurchaseRate * 100).toFixed(1)}%
                    </Text>
                  </Box>
                  <Box>
                    <Text variant="bodySm" as="p" tone="subdued">
                      Projected LTV
                    </Text>
                    <Text variant="bodySm" as="p">
                      ${(clv.projectedLTV / 100).toFixed(2)}
                    </Text>
                  </Box>
                </InlineStack>
              </BlockStack>))}
          </BlockStack>
        </Card>)}
    </BlockStack>);
}
//# sourceMappingURL=AIOptimizationDashboard.js.map