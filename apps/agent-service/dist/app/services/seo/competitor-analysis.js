/**
 * Competitor Analysis Service
 *
 * Analyzes competitor SEO strategies:
 * - Track competitor keyword rankings
 * - Compare content metrics
 * - Identify competitive opportunities
 * - Gap analysis for keywords and content
 *
 * @module services/seo/competitor-analysis
 */
import { getCached, setCached } from "../cache.server";
import { appMetrics } from "../../utils/metrics.server";
// ============================================================================
// Mock Data Generation (for development)
// ============================================================================
/**
 * Generate mock competitor data for development/testing
 * In production, integrate with SEO APIs (SEMrush, Ahrefs, Moz)
 */
function generateMockCompetitorData(domain) {
    const baseSeed = domain.length;
    return {
        domain,
        estimatedTraffic: Math.floor(10000 + baseSeed * 1000),
        domainAuthority: Math.min(100, 30 + baseSeed),
        topKeywords: [
            {
                keyword: "seo tools",
                position: 5,
                searchVolume: 12000,
                difficulty: 65,
                traffic: 480,
                url: `https://${domain}/seo-tools`,
            },
            {
                keyword: "keyword research",
                position: 8,
                searchVolume: 8500,
                difficulty: 58,
                traffic: 255,
                url: `https://${domain}/keyword-research`,
            },
            {
                keyword: "backlink analysis",
                position: 12,
                searchVolume: 5200,
                difficulty: 52,
                traffic: 104,
                url: `https://${domain}/backlinks`,
            },
        ],
        contentMetrics: {
            totalPages: 150 + baseSeed * 10,
            avgWordCount: 1200 + baseSeed * 50,
            avgReadingTime: 6 + Math.floor(baseSeed / 10),
            contentTypes: {
                "blog-post": 80,
                guide: 25,
                tool: 15,
                "case-study": 10,
            },
            updateFrequency: "weekly",
        },
        backlinks: 5000 + baseSeed * 500,
        analyzedAt: new Date().toISOString(),
    };
}
// ============================================================================
// Competitive Analysis
// ============================================================================
/**
 * Identify keyword gaps (keywords competitors rank for but you don't)
 */
function identifyKeywordGaps(yourKeywords, competitorKeywords) {
    return competitorKeywords.filter((kw) => !yourKeywords.has(kw.keyword));
}
/**
 * Identify content gaps (topics competitors cover but you don't)
 */
function identifyContentGaps(yourTopics, competitorTopics) {
    return competitorTopics.filter((topic) => !yourTopics.has(topic));
}
/**
 * Generate competitive opportunities based on analysis
 */
function generateOpportunities(yourDomain, competitors, keywordGaps) {
    const opportunities = [];
    // Keyword gap opportunities
    keywordGaps
        .filter((kw) => kw.difficulty < 60 && kw.searchVolume > 500)
        .slice(0, 5)
        .forEach((kw) => {
        opportunities.push({
            type: "keyword-gap",
            keyword: kw.keyword,
            competitor: competitors[0].domain,
            opportunity: `Target "${kw.keyword}" (${kw.searchVolume} monthly searches, difficulty: ${kw.difficulty})`,
            estimatedImpact: kw.searchVolume > 2000 ? "high" : "medium",
            difficulty: kw.difficulty < 40 ? "easy" : kw.difficulty < 60 ? "medium" : "hard",
        });
    });
    // Content gap opportunities
    const contentTypes = new Set();
    competitors.forEach((comp) => {
        Object.keys(comp.contentMetrics.contentTypes).forEach((type) => {
            contentTypes.add(type);
        });
    });
    contentTypes.forEach((contentType) => {
        if (contentType !== "blog-post") {
            opportunities.push({
                type: "content-gap",
                contentTopic: contentType,
                competitor: competitors[0].domain,
                opportunity: `Create more ${contentType} content. Competitors average ${Math.round(competitors.reduce((sum, c) => sum + (c.contentMetrics.contentTypes[contentType] || 0), 0) / competitors.length)} pieces.`,
                estimatedImpact: "medium",
                difficulty: "medium",
            });
        }
    });
    // Ranking opportunities (competitors rank 11-20, easy to beat)
    const rankingOpps = keywordGaps.filter((kw) => kw.position >= 11 && kw.position <= 20);
    rankingOpps.slice(0, 3).forEach((kw) => {
        opportunities.push({
            type: "ranking-opportunity",
            keyword: kw.keyword,
            competitor: competitors.find((c) => c.topKeywords.some((ck) => ck.keyword === kw.keyword))?.domain || "",
            opportunity: `Easy win: competitor ranks #${kw.position} for "${kw.keyword}". Create better content to outrank.`,
            estimatedImpact: "high",
            difficulty: "easy",
        });
    });
    // Sort by impact and difficulty
    return opportunities.sort((a, b) => {
        const impactOrder = { high: 0, medium: 1, low: 2 };
        const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
        if (impactOrder[a.estimatedImpact] !== impactOrder[b.estimatedImpact]) {
            return impactOrder[a.estimatedImpact] - impactOrder[b.estimatedImpact];
        }
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });
}
/**
 * Generate recommended actions
 */
function generateRecommendedActions(opportunities, competitors) {
    const actions = [];
    // High-impact keyword opportunities
    const keywordOpps = opportunities.filter((o) => o.type === "keyword-gap" && o.estimatedImpact === "high");
    if (keywordOpps.length > 0) {
        actions.push(`Target ${keywordOpps.length} high-impact keyword${keywordOpps.length > 1 ? "s" : ""} with low competition`);
    }
    // Content gaps
    const contentGaps = opportunities.filter((o) => o.type === "content-gap");
    if (contentGaps.length > 0) {
        actions.push(`Create ${contentGaps[0].contentTopic} content to match competitor offerings`);
    }
    // Backlink building
    const avgBacklinks = competitors.reduce((sum, c) => sum + c.backlinks, 0) / competitors.length;
    actions.push(`Build backlinks (competitor average: ${Math.round(avgBacklinks)} links)`);
    // Content frequency
    const updateFrequencies = competitors.map((c) => c.contentMetrics.updateFrequency);
    if (updateFrequencies.includes("daily") ||
        updateFrequencies.includes("weekly")) {
        actions.push("Increase content publishing frequency to match competitor pace");
    }
    // Ranking opportunities
    const easyWins = opportunities.filter((o) => o.type === "ranking-opportunity");
    if (easyWins.length > 0) {
        actions.push(`Quick wins: Outrank competitors on ${easyWins.length} keyword${easyWins.length > 1 ? "s" : ""} where they rank #11-20`);
    }
    return actions.slice(0, 5);
}
// ============================================================================
// Main Analysis Function
// ============================================================================
/**
 * Analyze competitors and identify opportunities
 */
export async function analyzeCompetitors(yourDomain, competitorDomains, yourKeywords, yourTopics) {
    const startTime = Date.now();
    const cacheKey = `seo:competitors:${yourDomain}:${competitorDomains.join(",")}`;
    const cached = getCached(cacheKey);
    if (cached) {
        appMetrics.cacheHit(cacheKey);
        return cached;
    }
    appMetrics.cacheMiss(cacheKey);
    try {
        // Analyze each competitor
        // In production, call SEO APIs (SEMrush, Ahrefs, Moz)
        // For now, use mock data
        const competitors = competitorDomains.map((domain) => generateMockCompetitorData(domain));
        // Identify keyword gaps
        const userKeywords = yourKeywords || new Set();
        const allCompetitorKeywords = competitors.flatMap((c) => c.topKeywords);
        const keywordGaps = identifyKeywordGaps(userKeywords, allCompetitorKeywords);
        // Identify content gaps
        const userTopics = yourTopics || new Set();
        const competitorTopics = competitors.flatMap((c) => Object.keys(c.contentMetrics.contentTypes));
        const contentGaps = identifyContentGaps(userTopics, competitorTopics);
        // Generate opportunities
        const opportunities = generateOpportunities(yourDomain, competitors, keywordGaps);
        // Calculate summary
        const totalCompetitors = competitors.length;
        const avgCompetitorAuthority = Math.round(competitors.reduce((sum, c) => sum + c.domainAuthority, 0) /
            totalCompetitors);
        const recommendedActions = generateRecommendedActions(opportunities, competitors);
        const report = {
            yourDomain,
            competitors,
            opportunities,
            keywordGaps: keywordGaps.slice(0, 20),
            contentGaps: contentGaps.slice(0, 10),
            summary: {
                totalCompetitors,
                totalOpportunities: opportunities.length,
                avgCompetitorAuthority,
                recommendedActions,
            },
            analyzedAt: new Date().toISOString(),
        };
        const duration = Date.now() - startTime;
        appMetrics.gaApiCall("analyzeCompetitors", true, duration);
        // Cache for 24 hours
        setCached(cacheKey, report, 86400000);
        return report;
    }
    catch (error) {
        const duration = Date.now() - startTime;
        appMetrics.gaApiCall("analyzeCompetitors", false, duration);
        throw error;
    }
}
/**
 * Get top opportunities from competitor analysis
 */
export async function getTopOpportunities(yourDomain, competitorDomains) {
    const report = await analyzeCompetitors(yourDomain, competitorDomains);
    return report.opportunities.slice(0, 10);
}
//# sourceMappingURL=competitor-analysis.js.map