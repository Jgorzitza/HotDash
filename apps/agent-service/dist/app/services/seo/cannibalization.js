/**
 * Keyword Cannibalization Detection Service
 *
 * Identifies keyword cannibalization issues where multiple pages
 * from the same site compete for the same keywords in search results.
 *
 * Features:
 * - Detect multiple pages ranking for the same keyword
 * - Calculate cannibalization severity score
 * - Recommend consolidation strategies
 * - Track cannibalization trends over time
 *
 * @module services/seo/cannibalization
 */
import { getCached, setCached } from "../cache.server";
import { appMetrics } from "../../utils/metrics.server";
import { PrismaClient } from "@prisma/client";
import { logDecision } from "../decisions.server";
const prisma = new PrismaClient();
// ============================================================================
// Constants
// ============================================================================
const CANNIBALIZATION_THRESHOLDS = {
    // Number of URLs competing for the same keyword
    urlCount: {
        critical: 3, // 3+ URLs = critical
        warning: 2, // 2 URLs = warning
    },
    // Position difference threshold
    positionSpread: {
        critical: 10, // Positions spread by 10+ = critical
        warning: 5, // Positions spread by 5-10 = warning
    },
    // Minimum clicks to consider
    minClicks: 10,
};
// ============================================================================
// Detection Logic
// ============================================================================
/**
 * Group rankings by keyword to detect cannibalization
 */
function groupRankingsByKeyword(rankings) {
    const keywordMap = new Map();
    rankings.forEach((ranking) => {
        const existing = keywordMap.get(ranking.keyword) || [];
        existing.push(ranking);
        keywordMap.set(ranking.keyword, existing);
    });
    return keywordMap;
}
/**
 * Calculate cannibalization severity
 */
function calculateSeverity(urlCount, positionSpread, totalClicks) {
    // Critical: 3+ URLs OR large position spread with significant traffic
    if (urlCount >= CANNIBALIZATION_THRESHOLDS.urlCount.critical ||
        (positionSpread >= CANNIBALIZATION_THRESHOLDS.positionSpread.critical &&
            totalClicks >= CANNIBALIZATION_THRESHOLDS.minClicks)) {
        return "critical";
    }
    // Warning: 2 URLs OR moderate position spread
    if (urlCount >= CANNIBALIZATION_THRESHOLDS.urlCount.warning ||
        positionSpread >= CANNIBALIZATION_THRESHOLDS.positionSpread.warning) {
        return "warning";
    }
    return "info";
}
/**
 * Estimate potential clicks lost due to cannibalization
 */
function estimateClicksLost(rankings) {
    if (rankings.length < 2)
        return 0;
    // Sort by position (best first)
    const sorted = [...rankings].sort((a, b) => a.position - b.position);
    const bestPage = sorted[0];
    const otherPages = sorted.slice(1);
    // Estimate: If we consolidated to best page, it would get additional clicks
    // from improved position (assumption: consolidated page would rank better)
    const potentialClicks = otherPages.reduce((sum, page) => {
        // Conservative estimate: 50% of secondary page clicks could go to primary
        return sum + page.clicks * 0.5;
    }, 0);
    return Math.round(potentialClicks);
}
/**
 * Generate consolidation recommendation
 */
function generateRecommendation(keyword, rankings) {
    // Sort by performance (clicks first, then position)
    const sorted = [...rankings].sort((a, b) => {
        if (a.clicks !== b.clicks)
            return b.clicks - a.clicks;
        return a.position - b.position;
    });
    const primaryUrl = sorted[0].url;
    const secondaryUrls = sorted.slice(1).map((r) => r.url);
    // Determine action based on keyword intent and page similarity
    let action;
    let rationale;
    if (rankings.length >= 3) {
        action = "consolidate";
        rationale = `Consolidate content from ${rankings.length} pages into "${primaryUrl}" (best performer with ${sorted[0].clicks} clicks). Consider 301 redirects from secondary pages.`;
    }
    else if (sorted[0].position > 10 && sorted[1].position > 10) {
        action = "differentiate";
        rationale = `Both pages rank poorly (positions ${sorted[0].position}, ${sorted[1].position}). Consider differentiating content to target different keyword variations.`;
    }
    else {
        action = "canonical";
        rationale = `Set "${primaryUrl}" as canonical page for "${keyword}". Add canonical tag to "${secondaryUrls[0]}" pointing to primary page.`;
    }
    return {
        action,
        primaryUrl,
        secondaryUrls,
        rationale,
    };
}
/**
 * Analyze keyword rankings for cannibalization
 */
function analyzeCannibalization(keywordRankings) {
    const groupedByKeyword = groupRankingsByKeyword(keywordRankings);
    const issues = [];
    groupedByKeyword.forEach((rankings, keyword) => {
        // Only flag if multiple URLs rank for the same keyword
        if (rankings.length < 2)
            return;
        // Calculate metrics
        const positions = rankings.map((r) => r.position);
        const minPosition = Math.min(...positions);
        const maxPosition = Math.max(...positions);
        const positionSpread = maxPosition - minPosition;
        const totalClicks = rankings.reduce((sum, r) => sum + r.clicks, 0);
        const totalImpressions = rankings.reduce((sum, r) => sum + r.impressions, 0);
        // Skip low-traffic keywords (less than threshold clicks)
        if (totalClicks < CANNIBALIZATION_THRESHOLDS.minClicks)
            return;
        const severity = calculateSeverity(rankings.length, positionSpread, totalClicks);
        const potentialClicksLost = estimateClicksLost(rankings);
        const recommendation = generateRecommendation(keyword, rankings);
        issues.push({
            keyword,
            severity,
            affectedUrls: rankings.map((r) => ({
                url: r.url,
                position: r.position,
                clicks: r.clicks,
                impressions: r.impressions,
                ctr: r.ctr,
            })),
            totalClicks,
            totalImpressions,
            potentialClicksLost,
            recommendation,
            detectedAt: new Date().toISOString(),
        });
    });
    // Sort by severity and potential impact
    return issues.sort((a, b) => {
        // Sort by severity first
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        if (a.severity !== b.severity) {
            return severityOrder[a.severity] - severityOrder[b.severity];
        }
        // Then by potential clicks lost
        return b.potentialClicksLost - a.potentialClicksLost;
    });
}
// ============================================================================
// Main Detection Function
// ============================================================================
/**
 * Detect keyword cannibalization issues from Search Console data
 */
export async function detectKeywordCannibalization(shopDomain) {
    const startTime = Date.now();
    const cacheKey = `seo:cannibalization:${shopDomain}`;
    const cached = getCached(cacheKey);
    if (cached) {
        appMetrics.cacheHit(cacheKey);
        return cached;
    }
    appMetrics.cacheMiss(cacheKey);
    try {
        // In production, fetch real data from Search Console API
        // For now, use sample data
        const keywordRankings = await fetchKeywordRankings(shopDomain);
        // Analyze for cannibalization
        const issues = analyzeCannibalization(keywordRankings);
        // Store results in database
        if (issues.length > 0) {
            await storeCannibalizationResults(shopDomain, issues);
        }
        // Generate summary
        const criticalIssues = issues.filter((i) => i.severity === "critical").length;
        const warningIssues = issues.filter((i) => i.severity === "warning").length;
        const infoIssues = issues.filter((i) => i.severity === "info").length;
        const estimatedClicksLost = issues.reduce((sum, i) => sum + i.potentialClicksLost, 0);
        const report = {
            summary: {
                totalKeywords: new Set(keywordRankings.map((r) => r.keyword)).size,
                keywordsWithCannibalization: issues.length,
                criticalIssues,
                warningIssues,
                infoIssues,
                estimatedClicksLost,
            },
            issues,
            topIssues: issues.slice(0, 10),
            generatedAt: new Date().toISOString(),
        };
        const durationMs = Date.now() - startTime;
        appMetrics.gaApiCall("detectKeywordCannibalization", true, durationMs);
        // Cache for 6 hours
        setCached(cacheKey, report, 21600000);
        return report;
    }
    catch (error) {
        const durationMs = Date.now() - startTime;
        appMetrics.gaApiCall("detectKeywordCannibalization", false, durationMs);
        throw error;
    }
}
/**
 * Fetch keyword rankings from Search Console
 * In production, this would call the Search Console API
 */
async function fetchKeywordRankings(shopDomain) {
    // Sample data for development
    // In production, replace with actual Search Console API calls
    return [
        {
            keyword: "running shoes",
            url: `https://${shopDomain}/products/running-shoes-pro`,
            position: 8,
            clicks: 120,
            impressions: 2500,
            ctr: 0.048,
        },
        {
            keyword: "running shoes",
            url: `https://${shopDomain}/collections/running-shoes`,
            position: 15,
            clicks: 45,
            impressions: 1200,
            ctr: 0.0375,
        },
        {
            keyword: "best running shoes",
            url: `https://${shopDomain}/products/running-shoes-pro`,
            position: 12,
            clicks: 85,
            impressions: 1800,
            ctr: 0.047,
        },
        {
            keyword: "best running shoes",
            url: `https://${shopDomain}/blog/best-running-shoes-2025`,
            position: 9,
            clicks: 95,
            impressions: 2100,
            ctr: 0.045,
        },
    ];
}
/**
 * Get detailed cannibalization analysis for a specific keyword
 */
export async function getKeywordCannibalizationDetails(shopDomain, keyword) {
    const report = await detectKeywordCannibalization(shopDomain);
    return report.issues.find((issue) => issue.keyword === keyword) || null;
}
/**
 * Store cannibalization results in database
 */
async function storeCannibalizationResults(shopDomain, issues) {
    for (const issue of issues) {
        // Check if this cannibalization already exists
        const existing = await prisma.seoCannibalization.findFirst({
            where: {
                shopDomain,
                keyword: issue.keyword,
                status: "active",
            },
        });
        if (existing) {
            // Update existing record
            await prisma.seoCannibalization.update({
                where: { id: existing.id },
                data: {
                    severity: issue.severity,
                    totalClicks: issue.totalClicks,
                    totalImpressions: issue.totalImpressions,
                    potentialClicksLost: issue.potentialClicksLost,
                    action: issue.recommendation.action,
                    primaryUrl: issue.recommendation.primaryUrl,
                    secondaryUrls: issue.recommendation.secondaryUrls,
                    rationale: issue.recommendation.rationale,
                    detectedAt: new Date(issue.detectedAt),
                    updatedAt: new Date(),
                },
            });
            // Update URLs
            await prisma.seoCannibalizationUrl.deleteMany({
                where: { cannibalizationId: existing.id },
            });
            for (const urlData of issue.affectedUrls) {
                await prisma.seoCannibalizationUrl.create({
                    data: {
                        cannibalizationId: existing.id,
                        url: urlData.url,
                        position: urlData.position,
                        clicks: urlData.clicks,
                        impressions: urlData.impressions,
                        ctr: urlData.ctr,
                        isPrimary: urlData.url === issue.recommendation.primaryUrl,
                    },
                });
            }
        }
        else {
            // Create new record
            const cannibalization = await prisma.seoCannibalization.create({
                data: {
                    shopDomain,
                    keyword: issue.keyword,
                    severity: issue.severity,
                    totalClicks: issue.totalClicks,
                    totalImpressions: issue.totalImpressions,
                    potentialClicksLost: issue.potentialClicksLost,
                    action: issue.recommendation.action,
                    primaryUrl: issue.recommendation.primaryUrl,
                    secondaryUrls: issue.recommendation.secondaryUrls,
                    rationale: issue.recommendation.rationale,
                    detectedAt: new Date(issue.detectedAt),
                },
            });
            // Create URL records
            for (const urlData of issue.affectedUrls) {
                await prisma.seoCannibalizationUrl.create({
                    data: {
                        cannibalizationId: cannibalization.id,
                        url: urlData.url,
                        position: urlData.position,
                        clicks: urlData.clicks,
                        impressions: urlData.impressions,
                        ctr: urlData.ctr,
                        isPrimary: urlData.url === issue.recommendation.primaryUrl,
                    },
                });
            }
        }
    }
}
/**
 * Get stored cannibalization conflicts from database
 */
export async function getStoredCannibalizationConflicts(shopDomain, status = "active") {
    const conflicts = await prisma.seoCannibalization.findMany({
        where: {
            shopDomain,
            status,
        },
        include: {
            urls: true,
        },
        orderBy: [
            { severity: "asc" }, // critical, warning, info
            { potentialClicksLost: "desc" },
        ],
    });
    return conflicts.map((conflict) => ({
        keyword: conflict.keyword,
        severity: conflict.severity,
        affectedUrls: conflict.urls.map((url) => ({
            url: url.url,
            position: url.position,
            clicks: url.clicks,
            impressions: url.impressions,
            ctr: Number(url.ctr),
        })),
        totalClicks: conflict.totalClicks,
        totalImpressions: conflict.totalImpressions,
        potentialClicksLost: conflict.potentialClicksLost,
        recommendation: {
            action: conflict.action,
            primaryUrl: conflict.primaryUrl,
            secondaryUrls: conflict.secondaryUrls,
            rationale: conflict.rationale,
        },
        detectedAt: conflict.detectedAt.toISOString(),
    }));
}
/**
 * Mark cannibalization as resolved
 */
export async function resolveCannibalizationConflict(id, resolution) {
    await prisma.seoCannibalization.update({
        where: { id },
        data: {
            status: "resolved",
            resolvedAt: new Date(),
            rationale: `${resolution}\n\nOriginal: ${prisma.seoCannibalization.findUnique({ where: { id } }).then(r => r?.rationale)}`,
        },
    });
    await logDecision({
        scope: "build",
        actor: "seo",
        action: "cannibalization_resolved",
        rationale: `Resolved cannibalization conflict #${id}: ${resolution}`,
        evidenceUrl: `artifacts/seo/2025-10-22/cannibalization-resolved-${id}.json`,
        payload: {
            conflictId: id,
            resolution,
            timestamp: new Date().toISOString(),
        },
    });
}
//# sourceMappingURL=cannibalization.js.map