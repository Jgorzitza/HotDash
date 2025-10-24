/**
 * Growth Engine Analytics Service
 *
 * ANALYTICS-274: Comprehensive Growth Engine analytics with advanced capabilities
 * Provides sophisticated analytics for Growth Engine phases with performance optimization
 */
/**
 * Generate comprehensive Growth Engine analytics
 *
 * ANALYTICS-274: Advanced Growth Engine analytics with phase tracking,
 * action performance, and optimization recommendations
 */
export async function generateGrowthEngineAnalytics(startDate, endDate) {
    // Get growth phases data
    const phases = await getGrowthPhases();
    // Get growth actions data
    const actions = await getGrowthActions(startDate, endDate);
    // Calculate overview metrics
    const overview = calculateOverviewMetrics(phases, actions);
    // Analyze performance
    const performance = analyzeActionPerformance(actions);
    // Generate insights
    const insights = generateGrowthInsights(phases, actions);
    // Generate recommendations
    const recommendations = generateGrowthRecommendations(phases, actions, performance);
    return {
        overview,
        phases,
        actions,
        performance,
        insights,
        recommendations,
    };
}
/**
 * Get growth phases data
 */
async function getGrowthPhases() {
    // Mock data - in production this would come from database
    return [
        {
            phase: 1,
            name: 'Foundation',
            description: 'Establish core infrastructure and initial user base',
            objectives: [
                'Set up analytics tracking',
                'Implement basic SEO',
                'Create content foundation',
                'Establish social presence'
            ],
            keyMetrics: ['users', 'sessions', 'conversions', 'revenue'],
            successCriteria: [
                { metric: 'users', target: 1000, current: 850, status: 'on-track' },
                { metric: 'revenue', target: 5000, current: 4200, status: 'on-track' }
            ],
            startDate: '2025-01-01',
            endDate: '2025-03-31',
            status: 'completed'
        },
        {
            phase: 2,
            name: 'Growth Acceleration',
            description: 'Scale user acquisition and optimize conversion',
            objectives: [
                'Increase traffic by 300%',
                'Optimize conversion funnel',
                'Launch paid advertising',
                'Expand content strategy'
            ],
            keyMetrics: ['traffic', 'conversion_rate', 'cac', 'ltv'],
            successCriteria: [
                { metric: 'traffic', target: 10000, current: 7500, status: 'at-risk' },
                { metric: 'conversion_rate', target: 5, current: 4.2, status: 'behind' }
            ],
            startDate: '2025-04-01',
            endDate: '2025-06-30',
            status: 'active'
        },
        {
            phase: 3,
            name: 'Optimization',
            description: 'Fine-tune performance and maximize efficiency',
            objectives: [
                'Optimize ad spend',
                'Improve user retention',
                'Scale successful channels',
                'Reduce acquisition costs'
            ],
            keyMetrics: ['roas', 'retention_rate', 'cac', 'ltv'],
            successCriteria: [
                { metric: 'roas', target: 4, current: 3.2, status: 'behind' },
                { metric: 'retention_rate', target: 70, current: 65, status: 'on-track' }
            ],
            startDate: '2025-07-01',
            endDate: '2025-09-30',
            status: 'planning'
        }
    ];
}
/**
 * Get growth actions data
 */
async function getGrowthActions(startDate, endDate) {
    // Mock data - in production this would come from database
    return [
        {
            actionId: 'action-001',
            phase: 1,
            actionType: 'seo',
            targetSlug: 'homepage-optimization',
            title: 'Homepage SEO Optimization',
            description: 'Optimize homepage for target keywords and user experience',
            priority: 'high',
            status: 'completed',
            approvedAt: '2025-01-15T10:00:00Z',
            executedAt: '2025-01-15T11:00:00Z',
            completedAt: '2025-01-20T15:00:00Z',
            budget: 2000,
            expectedROI: 3.5,
            actualROI: 4.2,
            impact: {
                expected: {
                    impressions: 5000,
                    clicks: 250,
                    conversions: 15,
                    revenue: 3000,
                    users: 200
                },
                actual: {
                    impressions: 6200,
                    clicks: 310,
                    conversions: 18,
                    revenue: 3600,
                    users: 250
                }
            },
            attribution: {
                '7d': {
                    impressions: 1500,
                    clicks: 75,
                    conversions: 4,
                    revenue: 800,
                    roas: 2.1,
                    ctr: 5.0,
                    conversionRate: 5.3,
                    costPerConversion: 200,
                    sessions: 75,
                    users: 60
                },
                '14d': {
                    impressions: 3000,
                    clicks: 150,
                    conversions: 8,
                    revenue: 1600,
                    roas: 2.7,
                    ctr: 5.0,
                    conversionRate: 5.3,
                    costPerConversion: 200,
                    sessions: 150,
                    users: 120
                },
                '28d': {
                    impressions: 6200,
                    clicks: 310,
                    conversions: 18,
                    revenue: 3600,
                    roas: 4.2,
                    ctr: 5.0,
                    conversionRate: 5.8,
                    costPerConversion: 200,
                    sessions: 310,
                    users: 250
                }
            },
            confidence: 85,
            dependencies: [],
            blockers: []
        },
        {
            actionId: 'action-002',
            phase: 2,
            actionType: 'ads',
            targetSlug: 'google-ads-campaign',
            title: 'Google Ads Campaign Launch',
            description: 'Launch targeted Google Ads campaign for high-intent keywords',
            priority: 'critical',
            status: 'executed',
            approvedAt: '2025-04-01T09:00:00Z',
            executedAt: '2025-04-01T10:00:00Z',
            budget: 5000,
            expectedROI: 2.8,
            actualROI: 2.1,
            impact: {
                expected: {
                    impressions: 15000,
                    clicks: 750,
                    conversions: 45,
                    revenue: 8000,
                    users: 600
                },
                actual: {
                    impressions: 12000,
                    clicks: 600,
                    conversions: 30,
                    revenue: 6300,
                    users: 480
                }
            },
            attribution: {
                '7d': {
                    impressions: 3000,
                    clicks: 150,
                    conversions: 8,
                    revenue: 1400,
                    roas: 1.8,
                    ctr: 5.0,
                    conversionRate: 5.3,
                    costPerConversion: 175,
                    sessions: 150,
                    users: 120
                },
                '14d': {
                    impressions: 6000,
                    clicks: 300,
                    conversions: 16,
                    revenue: 2800,
                    roas: 1.9,
                    ctr: 5.0,
                    conversionRate: 5.3,
                    costPerConversion: 175,
                    sessions: 300,
                    users: 240
                },
                '28d': {
                    impressions: 12000,
                    clicks: 600,
                    conversions: 30,
                    revenue: 6300,
                    roas: 2.1,
                    ctr: 5.0,
                    conversionRate: 5.0,
                    costPerConversion: 210,
                    sessions: 600,
                    users: 480
                }
            },
            confidence: 65,
            dependencies: ['action-001'],
            blockers: []
        },
        {
            actionId: 'action-003',
            phase: 2,
            actionType: 'content',
            targetSlug: 'blog-content-strategy',
            title: 'Content Marketing Strategy',
            description: 'Develop and execute comprehensive content marketing strategy',
            priority: 'medium',
            status: 'executed',
            approvedAt: '2025-04-15T14:00:00Z',
            executedAt: '2025-04-15T15:00:00Z',
            budget: 3000,
            expectedROI: 4.0,
            actualROI: 3.2,
            impact: {
                expected: {
                    impressions: 8000,
                    clicks: 400,
                    conversions: 20,
                    revenue: 4000,
                    users: 320
                },
                actual: {
                    impressions: 6500,
                    clicks: 325,
                    conversions: 16,
                    revenue: 3200,
                    users: 260
                }
            },
            attribution: {
                '7d': {
                    impressions: 2000,
                    clicks: 100,
                    conversions: 5,
                    revenue: 1000,
                    roas: 3.3,
                    ctr: 5.0,
                    conversionRate: 5.0,
                    costPerConversion: 200,
                    sessions: 100,
                    users: 80
                },
                '14d': {
                    impressions: 4000,
                    clicks: 200,
                    conversions: 10,
                    revenue: 2000,
                    roas: 3.3,
                    ctr: 5.0,
                    conversionRate: 5.0,
                    costPerConversion: 200,
                    sessions: 200,
                    users: 160
                },
                '28d': {
                    impressions: 6500,
                    clicks: 325,
                    conversions: 16,
                    revenue: 3200,
                    roas: 3.2,
                    ctr: 5.0,
                    conversionRate: 4.9,
                    costPerConversion: 200,
                    sessions: 325,
                    users: 260
                }
            },
            confidence: 78,
            dependencies: ['action-001'],
            blockers: []
        }
    ];
}
/**
 * Calculate overview metrics
 */
function calculateOverviewMetrics(phases, actions) {
    const totalPhases = phases.length;
    const activePhases = phases.filter(p => p.status === 'active').length;
    const completedPhases = phases.filter(p => p.status === 'completed').length;
    const totalActions = actions.length;
    const activeActions = actions.filter(a => a.status === 'executed' || a.status === 'approved').length;
    const completedActions = actions.filter(a => a.status === 'completed').length;
    const totalRevenue = actions.reduce((sum, action) => sum + action.impact.actual.revenue, 0);
    const totalConversions = actions.reduce((sum, action) => sum + action.impact.actual.conversions, 0);
    const averageROI = actions.length > 0
        ? actions.reduce((sum, action) => sum + (action.actualROI || 0), 0) / actions.length
        : 0;
    const overallProgress = totalActions > 0 ? (completedActions / totalActions) * 100 : 0;
    return {
        totalPhases,
        activePhases,
        completedPhases,
        totalActions,
        activeActions,
        completedActions,
        totalRevenue,
        totalConversions,
        averageROI,
        overallProgress
    };
}
/**
 * Analyze action performance
 */
function analyzeActionPerformance(actions) {
    const topPerformingActions = actions
        .filter(action => action.actualROI && action.actualROI > 3)
        .sort((a, b) => (b.actualROI || 0) - (a.actualROI || 0))
        .slice(0, 5);
    const underperformingActions = actions
        .filter(action => action.actualROI && action.actualROI < 2)
        .sort((a, b) => (a.actualROI || 0) - (b.actualROI || 0));
    const criticalActions = actions
        .filter(action => action.priority === 'critical' && action.status !== 'completed');
    const blockedActions = actions
        .filter(action => action.blockers.length > 0);
    return {
        topPerformingActions,
        underperformingActions,
        criticalActions,
        blockedActions
    };
}
/**
 * Generate growth insights
 */
function generateGrowthInsights(phases, actions) {
    const phaseProgress = phases.map(phase => {
        const phaseActions = actions.filter(action => action.phase === phase.phase);
        const completedActions = phaseActions.filter(action => action.status === 'completed').length;
        const progress = phaseActions.length > 0 ? (completedActions / phaseActions.length) * 100 : 0;
        const keyAchievements = phaseActions
            .filter(action => action.status === 'completed' && action.actualROI && action.actualROI > 2)
            .map(action => `${action.title}: ${action.actualROI?.toFixed(1)}x ROI`);
        const challenges = phaseActions
            .filter(action => action.status === 'executed' && action.actualROI && action.actualROI < 1.5)
            .map(action => `${action.title}: Underperforming at ${action.actualROI?.toFixed(1)}x ROI`);
        return {
            phase: phase.phase,
            progress,
            status: progress >= 80 ? 'on-track' : progress >= 60 ? 'at-risk' : 'behind',
            keyAchievements,
            challenges
        };
    });
    const actionEffectiveness = ['seo', 'ads', 'content', 'social', 'email'].map(actionType => {
        const typeActions = actions.filter(action => action.actionType === actionType);
        const averageROI = typeActions.length > 0
            ? typeActions.reduce((sum, action) => sum + (action.actualROI || 0), 0) / typeActions.length
            : 0;
        const successRate = typeActions.length > 0
            ? (typeActions.filter(action => action.actualROI && action.actualROI > 2).length / typeActions.length) * 100
            : 0;
        const recommendations = [];
        if (averageROI > 3)
            recommendations.push('Scale this channel');
        if (averageROI < 2)
            recommendations.push('Optimize or pause this channel');
        if (successRate < 50)
            recommendations.push('Review strategy and execution');
        return {
            actionType,
            averageROI,
            successRate,
            recommendations
        };
    });
    const optimizationOpportunities = [
        'Scale high-performing SEO actions',
        'Optimize underperforming ad campaigns',
        'Increase content production frequency',
        'Improve conversion rate optimization'
    ];
    const riskFactors = [
        'Google Ads campaign underperforming',
        'Content strategy needs optimization',
        'Dependency on single high-performing action'
    ];
    return {
        phaseProgress,
        actionEffectiveness,
        optimizationOpportunities,
        riskFactors
    };
}
/**
 * Generate growth recommendations
 */
function generateGrowthRecommendations(phases, actions, performance) {
    const immediate = [
        'Address blocked actions immediately',
        'Optimize underperforming campaigns',
        'Scale top-performing actions'
    ];
    const shortTerm = [
        'Complete critical actions in current phase',
        'Improve conversion rate optimization',
        'Diversify traffic sources'
    ];
    const longTerm = [
        'Develop advanced attribution models',
        'Implement predictive analytics',
        'Build automated optimization systems'
    ];
    const budgetOptimization = actions
        .filter(action => action.budget && action.actualROI)
        .map(action => ({
        actionId: action.actionId,
        currentBudget: action.budget || 0,
        recommendedBudget: action.actualROI && action.actualROI > 3
            ? (action.budget || 0) * 1.5
            : action.actualROI && action.actualROI < 2
                ? (action.budget || 0) * 0.7
                : action.budget || 0,
        expectedImpact: action.actualROI && action.actualROI > 3 ? 1.5 : 0.8
    }));
    return {
        immediate,
        shortTerm,
        longTerm,
        budgetOptimization
    };
}
/**
 * Export Growth Engine analytics for dashboard
 */
export function exportGrowthEngineAnalytics(analytics) {
    return {
        overview: analytics.overview,
        phases: analytics.phases.map(phase => ({
            phase: phase.phase,
            name: phase.name,
            status: phase.status,
            progress: analytics.insights.phaseProgress.find(p => p.phase === phase.phase)?.progress || 0,
            keyAchievements: analytics.insights.phaseProgress.find(p => p.phase === phase.phase)?.keyAchievements || [],
            challenges: analytics.insights.phaseProgress.find(p => p.phase === phase.phase)?.challenges || []
        })),
        actions: analytics.actions.map(action => ({
            actionId: action.actionId,
            title: action.title,
            actionType: action.actionType,
            phase: action.phase,
            status: action.status,
            priority: action.priority,
            actualROI: action.actualROI,
            confidence: action.confidence,
            impact: action.impact.actual
        })),
        performance: {
            topPerformers: analytics.performance.topPerformingActions.slice(0, 3),
            underperformers: analytics.performance.underperformingActions.slice(0, 3),
            critical: analytics.performance.criticalActions,
            blocked: analytics.performance.blockedActions
        },
        insights: analytics.insights,
        recommendations: analytics.recommendations
    };
}
//# sourceMappingURL=growthEngine.js.map