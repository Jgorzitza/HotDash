/**
 * Core Web Vitals Monitoring Service
 *
 * Tracks Core Web Vitals using PageSpeed Insights API:
 * - LCP (Largest Contentful Paint) - Loading performance
 * - FID (First Input Delay) - Interactivity
 * - CLS (Cumulative Layout Shift) - Visual stability
 *
 * Provides performance optimization recommendations and daily monitoring.
 *
 * @module services/seo/core-web-vitals
 */
import { getCached, setCached } from "../cache.server";
import { appMetrics } from "../../utils/metrics.server";
// ============================================================================
// Constants - Official Core Web Vitals Thresholds
// ============================================================================
const CORE_WEB_VITALS_THRESHOLDS = {
    lcp: {
        good: 2500, // milliseconds
        needsImprovement: 4000,
        unit: "ms",
    },
    fid: {
        good: 100, // milliseconds
        needsImprovement: 300,
        unit: "ms",
    },
    cls: {
        good: 0.1, // score
        needsImprovement: 0.25,
        unit: "score",
    },
};
// ============================================================================
// PageSpeed Insights API Integration
// ============================================================================
/**
 * Fetch PageSpeed Insights data for a URL
 * Requires PAGESPEED_INSIGHTS_API_KEY environment variable
 */
async function fetchPageSpeedData(url, strategy) {
    const apiKey = process.env.PAGESPEED_INSIGHTS_API_KEY;
    if (!apiKey) {
        // Return mock data for development
        return generateMockPageSpeedData(url, strategy);
    }
    const apiUrl = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
    apiUrl.searchParams.set("url", url);
    apiUrl.searchParams.set("strategy", strategy);
    apiUrl.searchParams.set("key", apiKey);
    apiUrl.searchParams.set("category", "performance");
    try {
        const response = await fetch(apiUrl.toString(), {
            signal: AbortSignal.timeout(30000), // 30 second timeout
        });
        if (!response.ok) {
            throw new Error(`PageSpeed API error: ${response.status}`);
        }
        return await response.json();
    }
    catch (error) {
        console.error(`[Core Web Vitals] PageSpeed API error:`, error.message);
        // Fallback to mock data
        return generateMockPageSpeedData(url, strategy);
    }
}
/**
 * Generate mock PageSpeed data for development/testing
 */
function generateMockPageSpeedData(url, strategy) {
    const isMobile = strategy === "mobile";
    return {
        lighthouseResult: {
            audits: {
                "largest-contentful-paint": {
                    numericValue: isMobile ? 2800 : 2100,
                    displayValue: isMobile ? "2.8 s" : "2.1 s",
                },
                "first-input-delay": {
                    numericValue: isMobile ? 120 : 80,
                    displayValue: isMobile ? "120 ms" : "80 ms",
                },
                "cumulative-layout-shift": {
                    numericValue: isMobile ? 0.15 : 0.08,
                    displayValue: isMobile ? "0.15" : "0.08",
                },
                "speed-index": {
                    numericValue: isMobile ? 3500 : 2800,
                },
                "render-blocking-resources": {
                    numericValue: 450,
                    details: {
                        overallSavingsMs: 450,
                    },
                },
                "unused-css-rules": {
                    numericValue: 320,
                    details: {
                        overallSavingsBytes: 125000,
                    },
                },
                "unused-javascript": {
                    numericValue: 280,
                    details: {
                        overallSavingsBytes: 95000,
                    },
                },
                "modern-image-formats": {
                    numericValue: 180,
                    details: {
                        overallSavingsBytes: 75000,
                    },
                },
            },
            categories: {
                performance: {
                    score: isMobile ? 0.72 : 0.85,
                },
            },
        },
    };
}
// ============================================================================
// Core Web Vitals Extraction
// ============================================================================
/**
 * Extract and rate a vital metric
 */
function extractVitalMetric(value, metricType) {
    const threshold = CORE_WEB_VITALS_THRESHOLDS[metricType];
    let rating;
    if (value <= threshold.good) {
        rating = "good";
    }
    else if (value <= threshold.needsImprovement) {
        rating = "needs-improvement";
    }
    else {
        rating = "poor";
    }
    return {
        value: Math.round(value * 100) / 100,
        unit: threshold.unit,
        rating,
        percentile: 75, // PageSpeed uses 75th percentile
        threshold: {
            good: threshold.good,
            needsImprovement: threshold.needsImprovement,
        },
    };
}
/**
 * Parse PageSpeed Insights response to Core Web Vitals metrics
 */
function parsePageSpeedResponse(data, url, device) {
    const audits = data.lighthouseResult?.audits || {};
    // Extract Core Web Vitals
    const lcpValue = audits["largest-contentful-paint"]?.numericValue || 0;
    const fidValue = audits["first-input-delay"]?.numericValue ||
        audits["max-potential-fid"]?.numericValue ||
        0;
    const clsValue = audits["cumulative-layout-shift"]?.numericValue || 0;
    const lcp = extractVitalMetric(lcpValue, "lcp");
    const fid = extractVitalMetric(fidValue, "fid");
    const cls = extractVitalMetric(clsValue, "cls");
    // Calculate overall score (0-100)
    const performanceScore = data.lighthouseResult?.categories?.performance?.score || 0;
    const overallScore = Math.round(performanceScore * 100);
    // Generate recommendations
    const recommendations = generateRecommendations(lcp, fid, cls, audits);
    return {
        url,
        device,
        lcp,
        fid,
        cls,
        overallScore,
        recommendations,
        measuredAt: new Date().toISOString(),
    };
}
/**
 * Generate performance recommendations based on metrics
 */
function generateRecommendations(lcp, fid, cls, audits) {
    const recommendations = [];
    // LCP recommendations
    if (lcp.rating !== "good") {
        recommendations.push(`Improve Largest Contentful Paint (LCP): ${lcp.value}${lcp.unit} (target: <${lcp.threshold.good}${lcp.unit})`);
        if (audits["render-blocking-resources"]) {
            recommendations.push("  → Eliminate render-blocking resources (CSS, JS)");
        }
        if (audits["unused-css-rules"]) {
            recommendations.push("  → Remove unused CSS");
        }
        if (audits["modern-image-formats"]) {
            recommendations.push("  → Use modern image formats (WebP, AVIF)");
        }
    }
    // FID recommendations
    if (fid.rating !== "good") {
        recommendations.push(`Improve First Input Delay (FID): ${fid.value}${fid.unit} (target: <${fid.threshold.good}${fid.unit})`);
        if (audits["unused-javascript"]) {
            recommendations.push("  → Reduce unused JavaScript");
        }
        if (audits["long-tasks"]) {
            recommendations.push("  → Break up long tasks");
        }
    }
    // CLS recommendations
    if (cls.rating !== "good") {
        recommendations.push(`Improve Cumulative Layout Shift (CLS): ${cls.value} (target: <${cls.threshold.good})`);
        recommendations.push("  → Set explicit width/height on images and ads");
        recommendations.push("  → Reserve space for dynamic content");
        recommendations.push("  → Avoid inserting content above existing content");
    }
    // General recommendations
    if (recommendations.length === 0) {
        recommendations.push("All Core Web Vitals are in good range! Keep monitoring and maintain performance.");
    }
    return recommendations;
}
// ============================================================================
// Main Monitoring Functions
// ============================================================================
/**
 * Analyze Core Web Vitals for a URL (both mobile and desktop)
 */
export async function analyzeWebVitals(url) {
    const startTime = Date.now();
    const cacheKey = `seo:cwv:${url}`;
    const cached = getCached(cacheKey);
    if (cached) {
        appMetrics.cacheHit(cacheKey);
        return cached;
    }
    appMetrics.cacheMiss(cacheKey);
    try {
        // Fetch both mobile and desktop data in parallel
        const [mobileData, desktopData] = await Promise.all([
            fetchPageSpeedData(url, "mobile"),
            fetchPageSpeedData(url, "desktop"),
        ]);
        const mobile = parsePageSpeedResponse(mobileData, url, "mobile");
        const desktop = parsePageSpeedResponse(desktopData, url, "desktop");
        // Extract opportunities and diagnostics
        const opportunities = extractOpportunities(mobileData);
        const diagnostics = extractDiagnostics(mobileData);
        const analysis = {
            mobile,
            desktop,
            opportunities,
            diagnostics,
            analyzedAt: new Date().toISOString(),
        };
        const duration = Date.now() - startTime;
        appMetrics.gaApiCall("analyzeWebVitals", true, duration);
        // Cache for 1 hour
        setCached(cacheKey, analysis, 3600000);
        return analysis;
    }
    catch (error) {
        const duration = Date.now() - startTime;
        appMetrics.gaApiCall("analyzeWebVitals", false, duration);
        throw error;
    }
}
/**
 * Extract performance opportunities from PageSpeed data
 */
function extractOpportunities(data) {
    const audits = data.lighthouseResult?.audits || {};
    const opportunities = [];
    const opportunityAudits = [
        {
            key: "render-blocking-resources",
            title: "Eliminate render-blocking resources",
        },
        { key: "unused-css-rules", title: "Remove unused CSS" },
        { key: "unused-javascript", title: "Remove unused JavaScript" },
        { key: "modern-image-formats", title: "Serve images in modern formats" },
        { key: "offscreen-images", title: "Defer offscreen images" },
        { key: "unminified-css", title: "Minify CSS" },
        { key: "unminified-javascript", title: "Minify JavaScript" },
    ];
    opportunityAudits.forEach(({ key, title }) => {
        const audit = audits[key];
        if (audit && audit.details) {
            const savings = audit.details.overallSavingsMs || audit.numericValue || 0;
            if (savings > 0) {
                let impact;
                if (savings > 500)
                    impact = "high";
                else if (savings > 200)
                    impact = "medium";
                else
                    impact = "low";
                opportunities.push({
                    title,
                    description: audit.description || "",
                    estimatedSavings: Math.round(savings),
                    impact,
                });
            }
        }
    });
    // Sort by impact and savings
    return opportunities.sort((a, b) => {
        const impactOrder = { high: 0, medium: 1, low: 2 };
        if (impactOrder[a.impact] !== impactOrder[b.impact]) {
            return impactOrder[a.impact] - impactOrder[b.impact];
        }
        return b.estimatedSavings - a.estimatedSavings;
    });
}
/**
 * Extract performance diagnostics from PageSpeed data
 */
function extractDiagnostics(data) {
    const audits = data.lighthouseResult?.audits || {};
    const diagnostics = [];
    // Check for common issues
    if (audits["uses-long-cache-ttl"] &&
        audits["uses-long-cache-ttl"].score < 0.9) {
        diagnostics.push({
            title: "Serve static assets with efficient cache policy",
            description: "A long cache lifetime can speed up repeat visits to your page.",
            severity: "warning",
        });
    }
    if (audits["uses-text-compression"] &&
        audits["uses-text-compression"].score < 1) {
        diagnostics.push({
            title: "Enable text compression",
            description: "Text-based resources should be served with compression (gzip, deflate, or brotli).",
            severity: "warning",
        });
    }
    if (audits["uses-responsive-images"] &&
        audits["uses-responsive-images"].score < 0.9) {
        diagnostics.push({
            title: "Properly size images",
            description: "Serve images that are appropriately-sized to save cellular data and improve load time.",
            severity: "warning",
        });
    }
    return diagnostics;
}
/**
 * Daily monitoring function (to be called by cron job)
 */
export async function runDailyWebVitalsMonitoring(urls) {
    const results = new Map();
    // Analyze URLs sequentially to avoid rate limiting
    for (const url of urls) {
        try {
            const analysis = await analyzeWebVitals(url);
            results.set(url, analysis);
            // Wait 2 seconds between requests to respect rate limits
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
        catch (error) {
            console.error(`[Core Web Vitals] Failed to analyze ${url}:`, error.message);
        }
    }
    return results;
}
//# sourceMappingURL=core-web-vitals.js.map