/**
 * Growth Engine Analytics Service
 *
 * ANALYTICS-274: Comprehensive Growth Engine analytics with advanced capabilities
 * Provides sophisticated analytics for Growth Engine phases with performance optimization
 */
export interface GrowthPhase {
    phase: number;
    name: string;
    description: string;
    objectives: string[];
    keyMetrics: string[];
    successCriteria: {
        metric: string;
        target: number;
        current: number;
        status: 'on-track' | 'at-risk' | 'behind';
    }[];
    startDate: string;
    endDate: string;
    status: 'planning' | 'active' | 'completed' | 'paused';
}
export interface GrowthAction {
    actionId: string;
    phase: number;
    actionType: 'seo' | 'ads' | 'content' | 'social' | 'email' | 'product' | 'partnership' | 'retention';
    targetSlug: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'planned' | 'approved' | 'executed' | 'completed' | 'failed' | 'paused';
    approvedAt?: string;
    executedAt?: string;
    completedAt?: string;
    budget?: number;
    expectedROI?: number;
    actualROI?: number;
    impact: {
        expected: {
            impressions: number;
            clicks: number;
            conversions: number;
            revenue: number;
            users: number;
        };
        actual: {
            impressions: number;
            clicks: number;
            conversions: number;
            revenue: number;
            users: number;
        };
    };
    attribution: {
        '7d': AttributionMetrics;
        '14d': AttributionMetrics;
        '28d': AttributionMetrics;
    };
    confidence: number;
    dependencies: string[];
    blockers: string[];
}
export interface AttributionMetrics {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    roas: number;
    ctr: number;
    conversionRate: number;
    costPerConversion: number;
    sessions: number;
    users: number;
}
export interface GrowthEngineAnalytics {
    overview: {
        totalPhases: number;
        activePhases: number;
        completedPhases: number;
        totalActions: number;
        activeActions: number;
        completedActions: number;
        totalRevenue: number;
        totalConversions: number;
        averageROI: number;
        overallProgress: number;
    };
    phases: GrowthPhase[];
    actions: GrowthAction[];
    performance: {
        topPerformingActions: GrowthAction[];
        underperformingActions: GrowthAction[];
        criticalActions: GrowthAction[];
        blockedActions: GrowthAction[];
    };
    insights: {
        phaseProgress: Array<{
            phase: number;
            progress: number;
            status: string;
            keyAchievements: string[];
            challenges: string[];
        }>;
        actionEffectiveness: Array<{
            actionType: string;
            averageROI: number;
            successRate: number;
            recommendations: string[];
        }>;
        optimizationOpportunities: string[];
        riskFactors: string[];
    };
    recommendations: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
        budgetOptimization: Array<{
            actionId: string;
            currentBudget: number;
            recommendedBudget: number;
            expectedImpact: number;
        }>;
    };
}
/**
 * Generate comprehensive Growth Engine analytics
 *
 * ANALYTICS-274: Advanced Growth Engine analytics with phase tracking,
 * action performance, and optimization recommendations
 */
export declare function generateGrowthEngineAnalytics(startDate: string, endDate: string): Promise<GrowthEngineAnalytics>;
/**
 * Export Growth Engine analytics for dashboard
 */
export declare function exportGrowthEngineAnalytics(analytics: GrowthEngineAnalytics): {
    overview: {
        totalPhases: number;
        activePhases: number;
        completedPhases: number;
        totalActions: number;
        activeActions: number;
        completedActions: number;
        totalRevenue: number;
        totalConversions: number;
        averageROI: number;
        overallProgress: number;
    };
    phases: {
        phase: number;
        name: string;
        status: "active" | "completed" | "paused" | "planning";
        progress: number;
        keyAchievements: string[];
        challenges: string[];
    }[];
    actions: {
        actionId: string;
        title: string;
        actionType: "content" | "product" | "email" | "seo" | "ads" | "social" | "partnership" | "retention";
        phase: number;
        status: "approved" | "completed" | "failed" | "paused" | "executed" | "planned";
        priority: "low" | "medium" | "high" | "critical";
        actualROI: number;
        confidence: number;
        impact: {
            impressions: number;
            clicks: number;
            conversions: number;
            revenue: number;
            users: number;
        };
    }[];
    performance: {
        topPerformers: GrowthAction[];
        underperformers: GrowthAction[];
        critical: GrowthAction[];
        blocked: GrowthAction[];
    };
    insights: {
        phaseProgress: Array<{
            phase: number;
            progress: number;
            status: string;
            keyAchievements: string[];
            challenges: string[];
        }>;
        actionEffectiveness: Array<{
            actionType: string;
            averageROI: number;
            successRate: number;
            recommendations: string[];
        }>;
        optimizationOpportunities: string[];
        riskFactors: string[];
    };
    recommendations: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
        budgetOptimization: Array<{
            actionId: string;
            currentBudget: number;
            recommendedBudget: number;
            expectedImpact: number;
        }>;
    };
};
//# sourceMappingURL=growthEngine.d.ts.map