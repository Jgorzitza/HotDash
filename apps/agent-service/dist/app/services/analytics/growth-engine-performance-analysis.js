/**
 * Growth Engine Performance Analysis Service
 *
 * ANALYTICS-PERFORMANCE-001: Comprehensive performance analysis and optimization
 * for Growth Engine operations. Provides real-time monitoring, bottleneck detection,
 * and actionable optimization recommendations.
 */
import { logDecision } from '~/services/decisions.server';
export class GrowthEnginePerformanceAnalysisService {
    metricsHistory = [];
    insights = [];
    optimizationPlans = [];
    monitoringInterval;
    /**
     * Start real-time performance monitoring
     */
    async startMonitoring(intervalMs = 30000) {
        this.monitoringInterval = setInterval(async () => {
            try {
                const metrics = await this.collectRealTimeMetrics();
                this.metricsHistory.push(metrics);
                // Keep last 1000 metrics (approx 8 hours at 30s intervals)
                if (this.metricsHistory.length > 1000) {
                    this.metricsHistory = this.metricsHistory.slice(-1000);
                }
                // Analyze for insights
                await this.analyzeMetricsForInsights(metrics);
            }
            catch (error) {
                console.error('Performance monitoring error:', error);
            }
        }, intervalMs);
        await logDecision({
            scope: 'build',
            actor: 'analytics',
            action: 'performance_monitoring_started',
            rationale: `Started real-time performance monitoring with ${intervalMs}ms interval`,
            evidenceUrl: 'app/services/analytics/growth-engine-performance-analysis.ts'
        });
    }
    /**
     * Stop performance monitoring
     */
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = undefined;
        }
    }
    /**
     * Collect real-time performance metrics
     */
    async collectRealTimeMetrics() {
        // In production, this would collect real metrics from monitoring systems
        // For now, simulate realistic metrics with some variance
        const baseMetrics = {
            cpuUsage: 45 + Math.random() * 30, // 45-75%
            memoryUsage: 60 + Math.random() * 25, // 60-85%
            responseTime: 200 + Math.random() * 300, // 200-500ms
            throughput: 50 + Math.random() * 100, // 50-150 req/s
            errorRate: Math.random() * 2, // 0-2%
        };
        return {
            timestamp: new Date().toISOString(),
            system: {
                cpuUsage: baseMetrics.cpuUsage,
                memoryUsage: baseMetrics.memoryUsage,
                diskIO: Math.random() * 100,
                networkLatency: 10 + Math.random() * 40, // 10-50ms
            },
            application: {
                responseTime: baseMetrics.responseTime,
                throughput: baseMetrics.throughput,
                errorRate: baseMetrics.errorRate,
                activeConnections: Math.floor(Math.random() * 100) + 20,
            },
            database: {
                queryTime: 50 + Math.random() * 200, // 50-250ms
                connectionPoolUsage: 30 + Math.random() * 50, // 30-80%
                slowQueries: Math.floor(Math.random() * 5),
                cacheHitRate: 75 + Math.random() * 20, // 75-95%
            },
            agents: {
                activeAgents: Math.floor(Math.random() * 8) + 2, // 2-10 agents
                handoffLatency: 100 + Math.random() * 200, // 100-300ms
                mcpRequestTime: 500 + Math.random() * 1000, // 500-1500ms
                approvalQueueDepth: Math.floor(Math.random() * 20),
            }
        };
    }
    /**
     * Analyze metrics for performance insights
     */
    async analyzeMetricsForInsights(metrics) {
        const newInsights = [];
        // Check for high CPU usage
        if (metrics.system.cpuUsage > 70) {
            newInsights.push({
                id: `cpu-high-${Date.now()}`,
                category: metrics.system.cpuUsage > 85 ? 'critical' : 'warning',
                title: 'High CPU Usage Detected',
                description: `CPU usage at ${metrics.system.cpuUsage.toFixed(1)}%`,
                impact: metrics.system.cpuUsage > 85 ? 'critical' : 'high',
                confidence: 0.95,
                evidence: [
                    `Current CPU: ${metrics.system.cpuUsage.toFixed(1)}%`,
                    `Threshold: 70%`,
                    `Active connections: ${metrics.application.activeConnections}`
                ],
                recommendations: [
                    'Review and optimize CPU-intensive operations',
                    'Consider horizontal scaling',
                    'Implement request throttling if needed'
                ],
                estimatedImprovement: 25
            });
        }
        // Check for slow database queries
        if (metrics.database.slowQueries > 2) {
            newInsights.push({
                id: `db-slow-${Date.now()}`,
                category: 'warning',
                title: 'Slow Database Queries Detected',
                description: `${metrics.database.slowQueries} slow queries in current interval`,
                impact: 'high',
                confidence: 0.9,
                evidence: [
                    `Slow queries: ${metrics.database.slowQueries}`,
                    `Average query time: ${metrics.database.queryTime.toFixed(0)}ms`,
                    `Cache hit rate: ${metrics.database.cacheHitRate.toFixed(1)}%`
                ],
                recommendations: [
                    'Add indexes for frequently queried fields',
                    'Optimize complex joins',
                    'Implement query result caching',
                    'Consider read replicas for analytics'
                ],
                estimatedImprovement: 40
            });
        }
        // Check for low cache hit rate
        if (metrics.database.cacheHitRate < 80) {
            newInsights.push({
                id: `cache-low-${Date.now()}`,
                category: 'optimization',
                title: 'Low Cache Hit Rate',
                description: `Cache hit rate at ${metrics.database.cacheHitRate.toFixed(1)}%`,
                impact: 'medium',
                confidence: 0.85,
                evidence: [
                    `Cache hit rate: ${metrics.database.cacheHitRate.toFixed(1)}%`,
                    `Target: >85%`,
                    `Query time: ${metrics.database.queryTime.toFixed(0)}ms`
                ],
                recommendations: [
                    'Review cache eviction policies',
                    'Increase cache size if memory allows',
                    'Implement cache warming for frequently accessed data',
                    'Add multi-level caching strategy'
                ],
                estimatedImprovement: 30
            });
        }
        // Check for high MCP request time
        if (metrics.agents.mcpRequestTime > 1000) {
            newInsights.push({
                id: `mcp-slow-${Date.now()}`,
                category: 'warning',
                title: 'Slow MCP Request Times',
                description: `MCP requests averaging ${metrics.agents.mcpRequestTime.toFixed(0)}ms`,
                impact: 'high',
                confidence: 0.88,
                evidence: [
                    `MCP request time: ${metrics.agents.mcpRequestTime.toFixed(0)}ms`,
                    `Target: <800ms`,
                    `Active agents: ${metrics.agents.activeAgents}`
                ],
                recommendations: [
                    'Implement MCP response caching',
                    'Optimize MCP tool configurations',
                    'Consider parallel MCP requests where possible',
                    'Review network latency to MCP servers'
                ],
                estimatedImprovement: 35
            });
        }
        // Add new insights
        this.insights.push(...newInsights);
        // Keep only last 100 insights
        if (this.insights.length > 100) {
            this.insights = this.insights.slice(-100);
        }
    }
    /**
     * Generate comprehensive performance report
     */
    async generatePerformanceReport() {
        const latestMetrics = this.metricsHistory[this.metricsHistory.length - 1] ||
            await this.collectRealTimeMetrics();
        const score = this.calculateOverallScore(latestMetrics);
        const health = this.getHealthStatus(score);
        const trends = this.calculateTrends();
        await logDecision({
            scope: 'build',
            actor: 'analytics',
            action: 'performance_report_generated',
            rationale: `Generated performance report with score: ${score}, health: ${health}`,
            evidenceUrl: 'app/services/analytics/growth-engine-performance-analysis.ts',
            payload: {
                score,
                health,
                insightsCount: this.insights.length,
                trendsCount: trends.length
            }
        });
        return {
            summary: {
                overallHealth: health,
                score,
                timestamp: new Date().toISOString()
            },
            metrics: latestMetrics,
            insights: this.insights,
            optimizationPlans: this.optimizationPlans,
            trends
        };
    }
    /**
     * Calculate overall performance score
     */
    calculateOverallScore(metrics) {
        const scores = {
            cpu: Math.max(0, 100 - metrics.system.cpuUsage),
            memory: Math.max(0, 100 - metrics.system.memoryUsage),
            responseTime: Math.max(0, 100 - (metrics.application.responseTime / 10)),
            errorRate: Math.max(0, 100 - (metrics.application.errorRate * 20)),
            cacheHitRate: metrics.database.cacheHitRate,
        };
        return Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;
    }
    /**
     * Get health status from score
     */
    getHealthStatus(score) {
        if (score >= 90)
            return 'excellent';
        if (score >= 75)
            return 'good';
        if (score >= 60)
            return 'fair';
        if (score >= 40)
            return 'poor';
        return 'critical';
    }
    /**
     * Calculate performance trends
     */
    calculateTrends() {
        if (this.metricsHistory.length < 10) {
            return [];
        }
        const recent = this.metricsHistory.slice(-10);
        const older = this.metricsHistory.slice(-20, -10);
        const calculateAverage = (metrics, key) => {
            return metrics.reduce((sum, m) => {
                const keys = key.split('.');
                let value = m;
                for (const k of keys) {
                    value = value[k];
                }
                return sum + value;
            }, 0) / metrics.length;
        };
        const metrics = [
            'system.cpuUsage',
            'system.memoryUsage',
            'application.responseTime',
            'application.errorRate',
            'database.queryTime',
            'database.cacheHitRate'
        ];
        return metrics.map(metric => {
            const recentAvg = calculateAverage(recent, metric);
            const olderAvg = calculateAverage(older, metric);
            const change = ((recentAvg - olderAvg) / olderAvg) * 100;
            let trend;
            if (Math.abs(change) < 5) {
                trend = 'stable';
            }
            else if (metric.includes('cacheHitRate')) {
                trend = change > 0 ? 'improving' : 'declining';
            }
            else {
                trend = change < 0 ? 'improving' : 'declining';
            }
            return { metric, trend, change };
        });
    }
    /**
     * Generate optimization plans based on insights
     */
    async generateOptimizationPlans() {
        const plans = [];
        // Group insights by category
        const criticalInsights = this.insights.filter(i => i.impact === 'critical');
        const highImpactInsights = this.insights.filter(i => i.impact === 'high');
        // Generate plans for critical issues first
        for (const insight of criticalInsights) {
            const plan = this.createOptimizationPlan(insight, 10);
            if (plan)
                plans.push(plan);
        }
        // Then high impact issues
        for (const insight of highImpactInsights) {
            const plan = this.createOptimizationPlan(insight, 7);
            if (plan)
                plans.push(plan);
        }
        this.optimizationPlans = plans;
        await logDecision({
            scope: 'build',
            actor: 'analytics',
            action: 'optimization_plans_generated',
            rationale: `Generated ${plans.length} optimization plans`,
            evidenceUrl: 'app/services/analytics/growth-engine-performance-analysis.ts',
            payload: {
                plansCount: plans.length,
                criticalCount: criticalInsights.length,
                highImpactCount: highImpactInsights.length
            }
        });
        return plans;
    }
    /**
     * Create optimization plan from insight
     */
    createOptimizationPlan(insight, priority) {
        if (insight.title.includes('CPU')) {
            return {
                id: `opt-cpu-${Date.now()}`,
                title: 'CPU Usage Optimization',
                description: 'Reduce CPU usage through code optimization and resource management',
                priority,
                estimatedEffort: 'medium',
                estimatedImpact: insight.estimatedImprovement,
                dependencies: [],
                steps: [
                    {
                        order: 1,
                        description: 'Profile CPU-intensive operations',
                        estimatedTime: '2 hours',
                        resources: ['Performance profiling tools', 'CPU monitoring']
                    },
                    {
                        order: 2,
                        description: 'Optimize identified bottlenecks',
                        estimatedTime: '4 hours',
                        resources: ['Development environment', 'Testing infrastructure']
                    },
                    {
                        order: 3,
                        description: 'Implement request throttling',
                        estimatedTime: '2 hours',
                        resources: ['Rate limiting middleware']
                    },
                    {
                        order: 4,
                        description: 'Test and validate improvements',
                        estimatedTime: '2 hours',
                        resources: ['Load testing tools', 'Monitoring dashboards']
                    }
                ],
                rollbackPlan: 'Revert code changes and restore previous configuration',
                successMetrics: [
                    {
                        metric: 'CPU Usage',
                        currentValue: 75,
                        targetValue: 60,
                        unit: '%'
                    },
                    {
                        metric: 'Response Time',
                        currentValue: 500,
                        targetValue: 350,
                        unit: 'ms'
                    }
                ]
            };
        }
        if (insight.title.includes('Database')) {
            return {
                id: `opt-db-${Date.now()}`,
                title: 'Database Query Optimization',
                description: 'Optimize slow queries and improve database performance',
                priority,
                estimatedEffort: 'high',
                estimatedImpact: insight.estimatedImprovement,
                dependencies: [],
                steps: [
                    {
                        order: 1,
                        description: 'Identify slow queries using query logs',
                        estimatedTime: '1 hour',
                        resources: ['Database query logs', 'Performance monitoring']
                    },
                    {
                        order: 2,
                        description: 'Add indexes for frequently queried fields',
                        estimatedTime: '3 hours',
                        resources: ['Database access', 'Index analysis tools']
                    },
                    {
                        order: 3,
                        description: 'Optimize complex joins and subqueries',
                        estimatedTime: '4 hours',
                        resources: ['Query optimization tools', 'Database documentation']
                    },
                    {
                        order: 4,
                        description: 'Implement query result caching',
                        estimatedTime: '3 hours',
                        resources: ['Caching infrastructure', 'Redis/Memcached']
                    },
                    {
                        order: 5,
                        description: 'Test and validate improvements',
                        estimatedTime: '2 hours',
                        resources: ['Load testing tools', 'Query performance monitoring']
                    }
                ],
                rollbackPlan: 'Remove new indexes if they cause issues, restore original queries',
                successMetrics: [
                    {
                        metric: 'Query Time',
                        currentValue: 250,
                        targetValue: 100,
                        unit: 'ms'
                    },
                    {
                        metric: 'Slow Queries',
                        currentValue: 5,
                        targetValue: 1,
                        unit: 'count'
                    }
                ]
            };
        }
        if (insight.title.includes('Cache')) {
            return {
                id: `opt-cache-${Date.now()}`,
                title: 'Cache Hit Rate Optimization',
                description: 'Improve cache hit rate through better caching strategies',
                priority,
                estimatedEffort: 'medium',
                estimatedImpact: insight.estimatedImprovement,
                dependencies: [],
                steps: [
                    {
                        order: 1,
                        description: 'Analyze cache miss patterns',
                        estimatedTime: '2 hours',
                        resources: ['Cache monitoring tools', 'Access logs']
                    },
                    {
                        order: 2,
                        description: 'Implement cache warming for frequently accessed data',
                        estimatedTime: '3 hours',
                        resources: ['Caching infrastructure', 'Data access patterns']
                    },
                    {
                        order: 3,
                        description: 'Optimize cache eviction policies',
                        estimatedTime: '2 hours',
                        resources: ['Cache configuration', 'LRU/LFU algorithms']
                    },
                    {
                        order: 4,
                        description: 'Increase cache size if memory allows',
                        estimatedTime: '1 hour',
                        resources: ['Memory monitoring', 'Infrastructure capacity']
                    },
                    {
                        order: 5,
                        description: 'Test and validate improvements',
                        estimatedTime: '2 hours',
                        resources: ['Cache monitoring', 'Performance testing']
                    }
                ],
                rollbackPlan: 'Restore previous cache configuration and eviction policies',
                successMetrics: [
                    {
                        metric: 'Cache Hit Rate',
                        currentValue: 75,
                        targetValue: 90,
                        unit: '%'
                    },
                    {
                        metric: 'Response Time',
                        currentValue: 400,
                        targetValue: 250,
                        unit: 'ms'
                    }
                ]
            };
        }
        if (insight.title.includes('MCP')) {
            return {
                id: `opt-mcp-${Date.now()}`,
                title: 'MCP Request Optimization',
                description: 'Reduce MCP request latency through caching and optimization',
                priority,
                estimatedEffort: 'medium',
                estimatedImpact: insight.estimatedImprovement,
                dependencies: [],
                steps: [
                    {
                        order: 1,
                        description: 'Implement MCP response caching',
                        estimatedTime: '3 hours',
                        resources: ['Caching infrastructure', 'MCP tool configurations']
                    },
                    {
                        order: 2,
                        description: 'Optimize MCP tool configurations',
                        estimatedTime: '2 hours',
                        resources: ['MCP documentation', 'Tool settings']
                    },
                    {
                        order: 3,
                        description: 'Implement parallel MCP requests where possible',
                        estimatedTime: '4 hours',
                        resources: ['Async processing', 'Request orchestration']
                    },
                    {
                        order: 4,
                        description: 'Review and optimize network latency',
                        estimatedTime: '2 hours',
                        resources: ['Network monitoring', 'MCP server locations']
                    },
                    {
                        order: 5,
                        description: 'Test and validate improvements',
                        estimatedTime: '2 hours',
                        resources: ['MCP monitoring', 'Performance testing']
                    }
                ],
                rollbackPlan: 'Disable MCP caching and restore sequential request processing',
                successMetrics: [
                    {
                        metric: 'MCP Request Time',
                        currentValue: 1200,
                        targetValue: 700,
                        unit: 'ms'
                    },
                    {
                        metric: 'Agent Handoff Latency',
                        currentValue: 250,
                        targetValue: 150,
                        unit: 'ms'
                    }
                ]
            };
        }
        return null;
    }
    /**
     * Get current insights
     */
    getInsights() {
        return this.insights;
    }
    /**
     * Get metrics history
     */
    getMetricsHistory() {
        return this.metricsHistory;
    }
}
/**
 * Default configuration for performance analysis
 */
export const defaultPerformanceAnalysisConfig = {
    monitoringInterval: 30000, // 30 seconds
    metricsRetention: 1000, // Keep last 1000 metrics
    insightsRetention: 100, // Keep last 100 insights
    alertThresholds: {
        cpuUsage: 70,
        memoryUsage: 85,
        responseTime: 500,
        errorRate: 2,
        cacheHitRate: 80,
        mcpRequestTime: 1000
    }
};
//# sourceMappingURL=growth-engine-performance-analysis.js.map