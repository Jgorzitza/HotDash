/**
 * Data Validation Service
 *
 * Validates analytics data integrity
 * Detects missing data, outliers, and inconsistencies
 * Calculates data quality score (0-100)
 */
import prisma from "~/db.server";
/**
 * Validate analytics data quality
 */
export async function validateDataQuality(shopDomain = "occ", days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    // Get all analytics records
    const allFacts = await prisma.dashboardFact.findMany({
        where: {
            shopDomain,
            createdAt: {
                gte: since,
            },
        },
        orderBy: {
            createdAt: "asc",
        },
    });
    const issues = [];
    // Check for missing data (gaps in timeline)
    const missingDataIssues = detectMissingData(allFacts, since, days);
    issues.push(...missingDataIssues);
    // Check for outliers (statistical anomalies)
    const outlierIssues = detectOutliers(allFacts);
    issues.push(...outlierIssues);
    // Check for inconsistencies (conflicting data)
    const inconsistencyIssues = detectInconsistencies(allFacts);
    issues.push(...inconsistencyIssues);
    // Check for stale data (no recent updates)
    const staleDataIssues = detectStaleData(allFacts);
    issues.push(...staleDataIssues);
    // Calculate quality score
    const qualityScore = calculateQualityScore(allFacts.length, issues, days);
    // Count valid records (those without issues)
    const validRecords = allFacts.length -
        issues.reduce((sum, i) => sum + i.affectedDates.length, 0);
    return {
        shopDomain,
        validatedAt: new Date(),
        qualityScore,
        grade: getQualityGrade(qualityScore),
        issues,
        summary: {
            totalRecords: allFacts.length,
            validRecords: Math.max(0, validRecords),
            missingDataDays: missingDataIssues.reduce((sum, i) => sum + i.affectedDates.length, 0),
            outlierCount: outlierIssues.length,
            inconsistencyCount: inconsistencyIssues.length,
        },
        recommendations: generateRecommendations(issues, qualityScore),
    };
}
/**
 * Detect missing data (gaps in timeline)
 */
function detectMissingData(facts, since, expectedDays) {
    const issues = [];
    // Get unique dates from facts
    const recordedDates = new Set(facts.map((f) => f.createdAt.toISOString().split("T")[0]));
    // Check for gaps
    const missingDates = [];
    for (let i = 0; i < expectedDays; i++) {
        const checkDate = new Date(since);
        checkDate.setDate(checkDate.getDate() + i);
        const dateKey = checkDate.toISOString().split("T")[0];
        if (!recordedDates.has(dateKey)) {
            missingDates.push(new Date(dateKey));
        }
    }
    if (missingDates.length > 0) {
        issues.push({
            type: "missing_data",
            severity: missingDates.length > 7 ? "critical" : "warning",
            metric: "all",
            description: `${missingDates.length} days with no analytics data recorded`,
            affectedDates: missingDates,
            impact: Math.min(10, Math.ceil(missingDates.length / 3)),
        });
    }
    return issues;
}
/**
 * Detect outliers using IQR method
 */
function detectOutliers(facts) {
    const issues = [];
    // Group by factType and check for outliers
    const factTypes = ["social_performance", "ads_roas", "seo_ranking"];
    for (const factType of factTypes) {
        const typedFacts = facts.filter((f) => f.factType === factType);
        if (typedFacts.length < 4)
            continue; // Need at least 4 points for IQR
        // Extract numeric values for key metrics
        const revenues = typedFacts
            .map((f) => f.value.revenue || 0)
            .filter((v) => v > 0);
        if (revenues.length > 0) {
            const outlierDates = findOutliersIQR(revenues, typedFacts, "revenue");
            if (outlierDates.length > 0) {
                issues.push({
                    type: "outlier",
                    severity: "info",
                    metric: `${factType}.revenue`,
                    description: `${outlierDates.length} outlier values detected`,
                    affectedDates: outlierDates,
                    impact: 2,
                });
            }
        }
    }
    return issues;
}
/**
 * Find outliers using Interquartile Range method
 */
function findOutliersIQR(values, facts, metricKey) {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    const outlierDates = [];
    facts.forEach((fact, index) => {
        const value = fact.value[metricKey] || 0;
        if (value < lowerBound || value > upperBound) {
            outlierDates.push(fact.createdAt);
        }
    });
    return outlierDates;
}
/**
 * Detect inconsistencies in data
 */
function detectInconsistencies(facts) {
    const issues = [];
    // Check for negative values where not expected
    const negativeValues = facts.filter((f) => {
        const value = f.value;
        return ((value.impressions && value.impressions < 0) ||
            (value.clicks && value.clicks < 0) ||
            (value.revenue && value.revenue < 0));
    });
    if (negativeValues.length > 0) {
        issues.push({
            type: "inconsistency",
            severity: "critical",
            metric: "all",
            description: "Negative values detected in metrics that should be positive",
            affectedDates: negativeValues.map((f) => f.createdAt),
            impact: 8,
        });
    }
    // Check for CTR > 100% (impossible)
    const invalidCTR = facts.filter((f) => {
        const value = f.value;
        return value.ctr && value.ctr > 100;
    });
    if (invalidCTR.length > 0) {
        issues.push({
            type: "inconsistency",
            severity: "critical",
            metric: "ctr",
            description: "CTR values exceed 100% (impossible)",
            affectedDates: invalidCTR.map((f) => f.createdAt),
            impact: 9,
        });
    }
    return issues;
}
/**
 * Detect stale data (no recent updates)
 */
function detectStaleData(facts) {
    const issues = [];
    if (facts.length === 0) {
        issues.push({
            type: "stale_data",
            severity: "critical",
            metric: "all",
            description: "No analytics data found",
            affectedDates: [],
            impact: 10,
        });
        return issues;
    }
    // Check if most recent data is older than 2 days
    const mostRecent = facts[facts.length - 1];
    const daysSinceUpdate = Math.floor((Date.now() - mostRecent.createdAt.getTime()) / (24 * 60 * 60 * 1000));
    if (daysSinceUpdate > 2) {
        issues.push({
            type: "stale_data",
            severity: "warning",
            metric: "all",
            description: `Last update was ${daysSinceUpdate} days ago`,
            affectedDates: [mostRecent.createdAt],
            impact: Math.min(10, daysSinceUpdate),
        });
    }
    return issues;
}
/**
 * Calculate overall data quality score (0-100)
 */
function calculateQualityScore(totalRecords, issues, expectedDays) {
    let score = 100;
    // Deduct points for each issue based on impact
    for (const issue of issues) {
        score -= issue.impact;
    }
    // Deduct points for insufficient data
    if (totalRecords < expectedDays * 0.5) {
        score -= 20;
    }
    return Math.max(0, Math.min(100, score));
}
/**
 * Assign quality grade
 */
function getQualityGrade(score) {
    if (score >= 90)
        return "A";
    if (score >= 80)
        return "B";
    if (score >= 70)
        return "C";
    if (score >= 60)
        return "D";
    return "F";
}
/**
 * Generate recommendations based on issues
 */
function generateRecommendations(issues, qualityScore) {
    const recommendations = [];
    const criticalIssues = issues.filter((i) => i.severity === "critical");
    if (criticalIssues.length > 0) {
        recommendations.push("URGENT: Address critical data issues immediately to ensure accurate analytics.");
    }
    const missingDataIssue = issues.find((i) => i.type === "missing_data");
    if (missingDataIssue) {
        recommendations.push("Implement automated data collection to prevent gaps in analytics tracking.");
    }
    const outlierIssues = issues.filter((i) => i.type === "outlier");
    if (outlierIssues.length > 3) {
        recommendations.push("High number of outliers detected. Review data collection process for accuracy.");
    }
    if (qualityScore < 70) {
        recommendations.push("Data quality below acceptable threshold. Prioritize data integrity improvements.");
    }
    if (recommendations.length === 0) {
        recommendations.push("Data quality is good. Continue current monitoring practices.");
    }
    return recommendations;
}
//# sourceMappingURL=data-validation.js.map