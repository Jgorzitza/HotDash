/**
 * AI Optimization Dashboard Component
 *
 * ADS-005: Dashboard for viewing and managing AI-powered ad optimizations
 * Displays bid adjustments, audience targeting, budget allocation, and ROI tracking
 */
import type { BidAdjustmentRecommendation, AudienceTargetingRecommendation, BudgetAllocationRecommendation } from "~/lib/ads/ai-optimizer";
import type { ROITrackingSummary } from "~/services/ads/roi-tracker";
interface AIOptimizationDashboardProps {
    bidAdjustments: BidAdjustmentRecommendation[];
    audienceTargeting: AudienceTargetingRecommendation[];
    budgetAllocation: BudgetAllocationRecommendation;
    roiSummary: ROITrackingSummary;
    onApplyRecommendation?: (type: string, campaignId: string) => void;
    loading?: boolean;
}
export declare function AIOptimizationDashboard({ bidAdjustments, audienceTargeting, budgetAllocation, roiSummary, onApplyRecommendation, loading, }: AIOptimizationDashboardProps): React.JSX.Element;
export {};
//# sourceMappingURL=AIOptimizationDashboard.d.ts.map