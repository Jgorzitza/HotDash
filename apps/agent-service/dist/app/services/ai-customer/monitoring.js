/**
 * AI-Customer CEO Agent Monitoring Service
 *
 * Tracks CEO Agent performance metrics including response times,
 * token usage, error rates, and tool utilization patterns.
 * Provides health status and performance dashboards.
 *
 * @module app/services/ai-customer/monitoring
 * @see docs/directions/ai-customer.md AI-CUSTOMER-012
 */
import { createClient } from "@supabase/supabase-js";
/**
 * Perform health check on CEO Agent
 *
 * Strategy:
 * 1. Query decision_log for recent CEO agent activity
 * 2. Calculate performance metrics (response time, tokens, errors)
 * 3. Analyze tool usage patterns
 * 4. Determine health status based on thresholds
 * 5. Generate recommendations if issues detected
 *
 * @param timeRange - Time range to analyze
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase service key
 * @returns Health check result with metrics
 */
export async function checkHealth(timeRange, supabaseUrl, supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    try {
        // Calculate date range
        const startDate = calculateStartDate(timeRange);
        // Query recent CEO agent activity
        const { data, error } = await supabase
            .from("decision_log")
            .select("*")
            .eq("scope", "ceo_agent")
            .gte("created_at", startDate.toISOString())
            .order("created_at", { ascending: false });
        if (error) {
            throw new Error(`Query error: ${error.message}`);
        }
        // Handle no data case
        if (!data || data.length === 0) {
            return createHealthyStatus(timeRange, 0);
        }
        // Calculate metrics
        const metrics = calculateMetrics(data);
        // Determine health status
        const { status, issues } = determineHealthStatus(metrics, data.length);
        // Generate recommendations
        const recommendations = generateRecommendations(metrics, issues);
        // Calculate uptime (time since first record)
        const firstRecord = data[data.length - 1];
        const uptime = Date.now() - new Date(firstRecord.created_at).getTime();
        return {
            status,
            timestamp: new Date().toISOString(),
            uptime,
            metrics,
            issues,
            recommendations,
        };
    }
    catch (error) {
        console.error("[Monitoring] Error checking health:", error);
        return {
            status: "offline",
            timestamp: new Date().toISOString(),
            uptime: 0,
            metrics: createEmptyMetrics(),
            issues: ["Failed to fetch monitoring data"],
            recommendations: [
                "Check database connectivity",
                "Verify Supabase credentials",
            ],
        };
    }
}
/**
 * Calculate performance metrics from decision log data
 */
function calculateMetrics(data) {
    const responseTimes = [];
    const tokenCounts = [];
    let inputTokens = 0;
    let outputTokens = 0;
    let totalErrors = 0;
    const errorsByType = {};
    const toolUsage = {};
    let totalToolCalls = 0;
    for (const record of data) {
        const payload = record.payload;
        // Response time
        if (payload?.receipt?.duration) {
            responseTimes.push(payload.receipt.duration);
        }
        else if (payload?.metrics?.queryTime) {
            responseTimes.push(payload.metrics.queryTime);
        }
        // Token usage
        if (payload?.tokens) {
            tokenCounts.push(payload.tokens.total || 0);
            inputTokens += payload.tokens.input || 0;
            outputTokens += payload.tokens.output || 0;
        }
        // Errors
        if (record.action.includes(".error") || payload?.error) {
            totalErrors++;
            const errorType = payload?.errorType || "unknown";
            errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
        }
        // Tool usage
        if (payload?.toolCalls) {
            for (const toolCall of payload.toolCalls) {
                const toolName = toolCall.toolName || toolCall.name;
                if (toolName) {
                    toolUsage[toolName] = (toolUsage[toolName] || 0) + 1;
                    totalToolCalls++;
                }
            }
        }
    }
    // Calculate response time percentiles
    responseTimes.sort((a, b) => a - b);
    const p50 = percentile(responseTimes, 50);
    const p95 = percentile(responseTimes, 95);
    const p99 = percentile(responseTimes, 99);
    const avg = responseTimes.length > 0
        ? responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length
        : 0;
    // Calculate token averages
    const totalTokens = tokenCounts.reduce((sum, t) => sum + t, 0);
    const avgPerQuery = tokenCounts.length > 0 ? totalTokens / tokenCounts.length : 0;
    // Calculate error rate
    const errorPercentage = data.length > 0 ? (totalErrors / data.length) * 100 : 0;
    // Calculate avg tools per query
    const avgToolsPerQuery = data.length > 0 ? totalToolCalls / data.length : 0;
    return {
        responseTime: {
            avg: Number(avg.toFixed(0)),
            p50,
            p95,
            p99,
        },
        tokenUsage: {
            total: totalTokens,
            avgPerQuery: Number(avgPerQuery.toFixed(0)),
            inputTokens,
            outputTokens,
        },
        errorRate: {
            percentage: Number(errorPercentage.toFixed(2)),
            totalErrors,
            totalRequests: data.length,
            byType: errorsByType,
        },
        toolUsage: {
            byTool: toolUsage,
            avgToolsPerQuery: Number(avgToolsPerQuery.toFixed(2)),
            totalToolCalls,
        },
    };
}
/**
 * Determine health status based on metrics
 */
function determineHealthStatus(metrics, totalRequests) {
    const issues = [];
    // Check error rate (> 10% = degraded, > 25% = unhealthy)
    if (metrics.errorRate.percentage > 25) {
        issues.push(`Critical error rate: ${metrics.errorRate.percentage}% (threshold: 25%)`);
    }
    else if (metrics.errorRate.percentage > 10) {
        issues.push(`Elevated error rate: ${metrics.errorRate.percentage}% (threshold: 10%)`);
    }
    // Check response time (p95 > 5000ms = degraded, p95 > 10000ms = unhealthy)
    if (metrics.responseTime.p95 > 10000) {
        issues.push(`Critical response time: p95 ${metrics.responseTime.p95}ms (threshold: 10s)`);
    }
    else if (metrics.responseTime.p95 > 5000) {
        issues.push(`Elevated response time: p95 ${metrics.responseTime.p95}ms (threshold: 5s)`);
    }
    // Check if agent is active (> 0 requests in time range)
    if (totalRequests === 0) {
        issues.push("No recent activity detected");
    }
    // Determine overall status
    let status;
    if (totalRequests === 0) {
        status = "offline";
    }
    else if (metrics.errorRate.percentage > 25 ||
        metrics.responseTime.p95 > 10000) {
        status = "unhealthy";
    }
    else if (metrics.errorRate.percentage > 10 ||
        metrics.responseTime.p95 > 5000) {
        status = "degraded";
    }
    else {
        status = "healthy";
    }
    return { status, issues };
}
/**
 * Generate recommendations based on detected issues
 */
function generateRecommendations(metrics, issues) {
    const recommendations = [];
    // Error rate recommendations
    if (metrics.errorRate.percentage > 10) {
        recommendations.push("Review error logs and implement error handling improvements");
        const topErrorType = Object.entries(metrics.errorRate.byType).sort(([, a], [, b]) => b - a)[0];
        if (topErrorType) {
            recommendations.push(`Address most common error type: ${topErrorType[0]} (${topErrorType[1]} occurrences)`);
        }
    }
    // Response time recommendations
    if (metrics.responseTime.p95 > 5000) {
        recommendations.push("Optimize query performance - consider caching frequently accessed data");
    }
    // Token usage recommendations
    if (metrics.tokenUsage.avgPerQuery > 10000) {
        recommendations.push("High token usage detected - review context window management and summarization");
    }
    // Tool usage recommendations
    if (metrics.toolUsage.avgToolsPerQuery > 5) {
        recommendations.push("High tool call volume - consider consolidating related queries");
    }
    // If no issues, provide optimization suggestions
    if (issues.length === 0) {
        recommendations.push("System operating normally - continue monitoring for anomalies");
    }
    return recommendations;
}
/**
 * Calculate percentile value from sorted array
 */
function percentile(sortedArray, percentile) {
    if (sortedArray.length === 0)
        return 0;
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))];
}
/**
 * Calculate start date based on time range
 */
function calculateStartDate(timeRange) {
    const now = new Date();
    switch (timeRange) {
        case "1h":
            return new Date(now.getTime() - 60 * 60 * 1000);
        case "24h":
            return new Date(now.getTime() - 24 * 60 * 60 * 1000);
        case "7d":
            return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case "30d":
            return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
}
/**
 * Create empty metrics structure
 */
function createEmptyMetrics() {
    return {
        responseTime: { avg: 0, p50: 0, p95: 0, p99: 0 },
        tokenUsage: { total: 0, avgPerQuery: 0, inputTokens: 0, outputTokens: 0 },
        errorRate: { percentage: 0, totalErrors: 0, totalRequests: 0, byType: {} },
        toolUsage: { byTool: {}, avgToolsPerQuery: 0, totalToolCalls: 0 },
    };
}
/**
 * Create healthy status for no-activity case
 */
function createHealthyStatus(timeRange, uptime) {
    return {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime,
        metrics: createEmptyMetrics(),
        issues: [],
        recommendations: [
            `No activity in last ${timeRange} - system idle but healthy`,
        ],
    };
}
//# sourceMappingURL=monitoring.js.map