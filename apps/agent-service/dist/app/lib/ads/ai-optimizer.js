/**
 * AI-Powered Ad Optimization
 *
 * ADS-005: AI-driven ad optimization with automated bidding and performance analysis
 * Provides intelligent bid adjustments, audience targeting, and budget allocation
 */
/**
 * Default AI Optimizer Configuration
 */
export const DEFAULT_AI_OPTIMIZER_CONFIG = {
    bidAdjustment: {
        enabled: true,
        maxAdjustmentPercent: 20,
        minConfidence: 0.7,
        learningRate: 0.5,
    },
    audienceTargeting: {
        enabled: true,
        minAudienceSize: 1000,
        maxAudiences: 5,
    },
    budgetAllocation: {
        enabled: true,
        rebalanceThreshold: 0.5, // 0.5x ROAS difference
        minBudgetPerCampaign: 1000, // $10 minimum
    },
    performanceThresholds: {
        minROAS: 2.0,
        minCTR: 0.02, // 2%
        maxCPC: 500, // $5.00
    },
};
/**
 * Generate AI-powered bid adjustment recommendations
 *
 * Uses historical performance data and machine learning patterns to recommend
 * optimal bid adjustments for each campaign.
 */
export function generateBidAdjustmentRecommendations(campaigns, performances, config = DEFAULT_AI_OPTIMIZER_CONFIG) {
    if (!config.bidAdjustment.enabled) {
        return [];
    }
    const recommendations = [];
    for (const campaign of campaigns) {
        const performance = performances.find(p => p.campaignId === campaign.id);
        if (!performance)
            continue;
        // Calculate current average CPC
        const currentCPC = campaign.clicks > 0 ? campaign.costCents / campaign.clicks : 0;
        if (currentCPC === 0)
            continue;
        // AI-driven bid adjustment logic
        const roas = campaign.roas || 0;
        const ctr = campaign.ctr;
        let bidAdjustment = 0;
        let confidence = 0;
        let reasoning = '';
        // High ROAS campaigns: increase bids to capture more volume
        if (roas > config.performanceThresholds.minROAS * 1.5) {
            bidAdjustment = Math.min(config.bidAdjustment.maxAdjustmentPercent, (roas - config.performanceThresholds.minROAS) * 5 * config.bidAdjustment.learningRate);
            confidence = Math.min(0.95, 0.7 + (roas / 10));
            reasoning = `High ROAS (${roas.toFixed(2)}x) indicates strong performance. Increasing bid to capture more volume.`;
        }
        // Low ROAS campaigns: decrease bids to improve efficiency
        else if (roas < config.performanceThresholds.minROAS && roas > 0) {
            bidAdjustment = -Math.min(config.bidAdjustment.maxAdjustmentPercent, (config.performanceThresholds.minROAS - roas) * 10 * config.bidAdjustment.learningRate);
            confidence = Math.min(0.9, 0.6 + ((config.performanceThresholds.minROAS - roas) / 5));
            reasoning = `Low ROAS (${roas.toFixed(2)}x) indicates inefficiency. Decreasing bid to improve ROI.`;
        }
        // High CTR but low conversions: optimize for conversion
        else if (ctr > config.performanceThresholds.minCTR * 1.5 && campaign.conversions < 10) {
            bidAdjustment = -5;
            confidence = 0.75;
            reasoning = `High CTR (${(ctr * 100).toFixed(2)}%) but low conversions suggests targeting issues. Minor bid decrease recommended.`;
        }
        // Only recommend if confidence meets threshold
        if (Math.abs(bidAdjustment) > 0 && confidence >= config.bidAdjustment.minConfidence) {
            const recommendedBid = Math.round(currentCPC * (1 + bidAdjustment / 100));
            // Estimate impact
            const clicksImpact = bidAdjustment > 0 ? campaign.clicks * 1.2 : campaign.clicks * 0.9;
            const conversionsImpact = campaign.conversions * (1 + (bidAdjustment / 100) * 0.5);
            const roasImpact = roas * (1 + (bidAdjustment > 0 ? 0.1 : 0.15));
            recommendations.push({
                campaignId: campaign.id,
                campaignName: campaign.name,
                currentBid: Math.round(currentCPC),
                recommendedBid,
                adjustment: bidAdjustment,
                reasoning,
                confidence,
                expectedImpact: {
                    clicks: Math.round(clicksImpact),
                    conversions: Math.round(conversionsImpact),
                    roas: roasImpact,
                },
            });
        }
    }
    return recommendations.sort((a, b) => b.confidence - a.confidence);
}
/**
 * Generate AI-powered audience targeting recommendations
 *
 * Analyzes campaign performance to identify high-performing audience segments
 * and recommend new targeting strategies.
 */
export function generateAudienceTargetingRecommendations(campaigns, performances, config = DEFAULT_AI_OPTIMIZER_CONFIG) {
    if (!config.audienceTargeting.enabled) {
        return [];
    }
    const recommendations = [];
    for (const campaign of campaigns) {
        const performance = performances.find(p => p.campaignId === campaign.id);
        if (!performance)
            continue;
        const roas = campaign.roas || 0;
        const ctr = campaign.ctr;
        // AI-driven audience insights based on performance patterns
        if (roas > config.performanceThresholds.minROAS) {
            // High-performing campaign: expand to similar audiences
            recommendations.push({
                campaignId: campaign.id,
                campaignName: campaign.name,
                audienceSegment: {
                    demographics: {
                        ageRange: '25-54', // Typical high-value segment
                        location: ['US', 'CA', 'UK'], // Expand to similar markets
                    },
                    interests: ['online shopping', 'product research', 'brand loyalty'],
                    behaviors: ['frequent purchasers', 'cart abandoners', 'product viewers'],
                    customAudiences: ['lookalike-top-customers', 'website-visitors-30d'],
                },
                expectedPerformance: {
                    estimatedCTR: ctr * 0.9, // Slightly lower for new audience
                    estimatedConversionRate: (campaign.conversions / campaign.clicks) * 0.85,
                    estimatedROAS: roas * 0.8, // Conservative estimate
                },
                confidence: 0.8,
                reasoning: `Campaign shows strong performance (${roas.toFixed(2)}x ROAS). Expanding to lookalike audiences likely to maintain good ROI.`,
            });
        }
    }
    return recommendations.slice(0, config.audienceTargeting.maxAudiences);
}
/**
 * Generate AI-powered budget allocation recommendations
 *
 * Optimizes budget distribution across campaigns based on performance data
 * to maximize overall ROAS.
 */
export function generateBudgetAllocationRecommendations(campaigns, totalBudget, config = DEFAULT_AI_OPTIMIZER_CONFIG) {
    if (!config.budgetAllocation.enabled) {
        return {
            totalBudget,
            allocations: [],
            projectedTotalROAS: 0,
            confidence: 0,
        };
    }
    // Calculate current total budget and ROAS
    const currentTotalBudget = campaigns.reduce((sum, c) => sum + c.costCents, 0);
    const totalRevenue = campaigns.reduce((sum, c) => {
        const roas = c.roas || 0;
        return sum + (c.costCents * roas);
    }, 0);
    const currentOverallROAS = currentTotalBudget > 0 ? totalRevenue / currentTotalBudget : 0;
    // Score each campaign based on performance
    const campaignScores = campaigns.map(campaign => {
        const roas = campaign.roas || 0;
        const ctr = campaign.ctr;
        const conversions = campaign.conversions;
        // AI scoring algorithm: weighted combination of metrics
        const roasScore = roas * 0.5; // 50% weight on ROAS
        const ctrScore = (ctr / config.performanceThresholds.minCTR) * 0.3; // 30% weight on CTR
        const conversionScore = (conversions / 100) * 0.2; // 20% weight on conversions
        const totalScore = roasScore + ctrScore + conversionScore;
        return {
            campaign,
            score: totalScore,
            roas,
        };
    }).filter(cs => cs.score > 0);
    // Calculate total score for normalization
    const totalScore = campaignScores.reduce((sum, cs) => sum + cs.score, 0);
    // Allocate budget proportionally to scores
    const allocations = campaignScores.map(({ campaign, score, roas }) => {
        const currentBudget = campaign.costCents;
        // Calculate recommended budget based on performance score
        let recommendedBudget = Math.round((score / totalScore) * totalBudget);
        // Ensure minimum budget
        recommendedBudget = Math.max(recommendedBudget, config.budgetAllocation.minBudgetPerCampaign);
        const change = currentBudget > 0
            ? ((recommendedBudget - currentBudget) / currentBudget) * 100
            : 0;
        let reasoning = '';
        if (change > 10) {
            reasoning = `High performance score (${score.toFixed(2)}) warrants increased budget allocation.`;
        }
        else if (change < -10) {
            reasoning = `Lower performance score (${score.toFixed(2)}) suggests reducing budget allocation.`;
        }
        else {
            reasoning = `Current allocation is optimal based on performance score (${score.toFixed(2)}).`;
        }
        return {
            campaignId: campaign.id,
            campaignName: campaign.name,
            currentBudget,
            recommendedBudget,
            change,
            reasoning,
            expectedROAS: roas * (1 + (change > 0 ? 0.05 : 0)), // Slight ROAS improvement expected
        };
    });
    // Calculate projected total ROAS
    const projectedRevenue = allocations.reduce((sum, alloc) => {
        return sum + (alloc.recommendedBudget * alloc.expectedROAS);
    }, 0);
    const projectedTotalROAS = totalBudget > 0 ? projectedRevenue / totalBudget : 0;
    // Confidence based on data quality
    const avgCampaignSpend = currentTotalBudget / campaigns.length;
    const confidence = Math.min(0.95, 0.6 + (avgCampaignSpend / 100000)); // Higher confidence with more data
    return {
        totalBudget,
        allocations,
        projectedTotalROAS,
        confidence,
    };
}
/**
 * Generate comprehensive AI optimization recommendations
 *
 * Combines bid adjustments, audience targeting, and budget allocation
 * into a unified set of recommendations.
 */
export function generateAIOptimizationRecommendations(campaigns, performances, totalBudget, config = DEFAULT_AI_OPTIMIZER_CONFIG) {
    const bidAdjustments = generateBidAdjustmentRecommendations(campaigns, performances, config);
    const audienceTargeting = generateAudienceTargetingRecommendations(campaigns, performances, config);
    const budgetAllocation = generateBudgetAllocationRecommendations(campaigns, totalBudget, config);
    // Calculate summary metrics
    const totalRecommendations = bidAdjustments.length + audienceTargeting.length + budgetAllocation.allocations.length;
    const highPriorityCount = bidAdjustments.filter(r => r.confidence > 0.85).length;
    // Calculate projected ROAS improvement
    const currentTotalBudget = campaigns.reduce((sum, c) => sum + c.costCents, 0);
    const currentRevenue = campaigns.reduce((sum, c) => sum + (c.costCents * (c.roas || 0)), 0);
    const currentROAS = currentTotalBudget > 0 ? currentRevenue / currentTotalBudget : 0;
    const projectedROASImprovement = budgetAllocation.projectedTotalROAS - currentROAS;
    // Average confidence across all recommendations
    const avgConfidence = (bidAdjustments.reduce((sum, r) => sum + r.confidence, 0) / Math.max(bidAdjustments.length, 1) +
        audienceTargeting.reduce((sum, r) => sum + r.confidence, 0) / Math.max(audienceTargeting.length, 1) +
        budgetAllocation.confidence) / 3;
    return {
        bidAdjustments,
        audienceTargeting,
        budgetAllocation,
        summary: {
            totalRecommendations,
            highPriorityCount,
            projectedROASImprovement,
            confidence: avgConfidence,
        },
    };
}
//# sourceMappingURL=ai-optimizer.js.map