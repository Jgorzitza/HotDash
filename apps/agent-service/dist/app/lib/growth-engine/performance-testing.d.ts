/**
 * Growth Engine Performance Testing Suite
 *
 * ANALYTICS-001: Comprehensive performance testing and validation
 * Tests the impact of optimizations on ROI and system performance
 */
export interface PerformanceTestSuite {
    id: string;
    name: string;
    description: string;
    tests: PerformanceTest[];
    baseline: PerformanceMetrics;
    optimized: PerformanceMetrics;
    results: PerformanceTestResult[];
    summary: PerformanceTestSummary;
}
export interface PerformanceTest {
    id: string;
    name: string;
    description: string;
    category: 'database' | 'api' | 'frontend' | 'caching' | 'analytics' | 'overall';
    type: 'load' | 'stress' | 'endurance' | 'spike' | 'volume' | 'scalability';
    configuration: TestConfiguration;
    metrics: PerformanceMetrics;
    thresholds: PerformanceThresholds;
    results?: PerformanceTestResult;
}
export interface TestConfiguration {
    duration: number;
    concurrentUsers: number;
    rampUpTime: number;
    rampDownTime: number;
    thinkTime: number;
    dataVolume: number;
    cacheSize: number;
    memoryLimit: number;
    cpuLimit: number;
}
export interface PerformanceMetrics {
    responseTime: {
        average: number;
        median: number;
        p95: number;
        p99: number;
        max: number;
    };
    throughput: {
        requestsPerSecond: number;
        transactionsPerSecond: number;
        dataProcessedPerSecond: number;
    };
    resourceUsage: {
        cpu: number;
        memory: number;
        disk: number;
        network: number;
    };
    errorRate: number;
    availability: number;
    scalability: {
        maxConcurrentUsers: number;
        maxThroughput: number;
        maxDataVolume: number;
    };
    cost: {
        computeCost: number;
        storageCost: number;
        networkCost: number;
        totalCost: number;
    };
}
export interface PerformanceThresholds {
    responseTime: {
        average: number;
        p95: number;
        p99: number;
    };
    throughput: {
        minimum: number;
        target: number;
    };
    resourceUsage: {
        cpu: number;
        memory: number;
        disk: number;
    };
    errorRate: number;
    availability: number;
}
export interface PerformanceTestResult {
    testId: string;
    status: 'passed' | 'failed' | 'warning' | 'error';
    startTime: Date;
    endTime: Date;
    duration: number;
    metrics: PerformanceMetrics;
    thresholds: PerformanceThresholds;
    violations: PerformanceViolation[];
    recommendations: string[];
    score: number;
}
export interface PerformanceViolation {
    metric: string;
    threshold: number;
    actual: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
}
export interface PerformanceTestSummary {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    warningTests: number;
    errorTests: number;
    overallScore: number;
    performanceGains: {
        responseTime: number;
        throughput: number;
        resourceUsage: number;
        cost: number;
        overall: number;
    };
    costSavings: {
        compute: number;
        storage: number;
        network: number;
        total: number;
        annual: number;
    };
    recommendations: string[];
    nextSteps: string[];
}
export declare class PerformanceTestEngine {
    private testSuites;
    private currentTest?;
    private testResults;
    /**
     * Create a new performance test suite
     */
    createTestSuite(config: {
        id: string;
        name: string;
        description: string;
        baseline: PerformanceMetrics;
        optimized: PerformanceMetrics;
    }): PerformanceTestSuite;
    /**
     * Add a performance test to a suite
     */
    addTest(suiteId: string, test: Omit<PerformanceTest, 'results'>): PerformanceTest;
    /**
     * Execute a performance test
     */
    executeTest(suiteId: string, testId: string): Promise<PerformanceTestResult>;
    /**
     * Execute all tests in a suite
     */
    executeTestSuite(suiteId: string): Promise<PerformanceTestResult[]>;
    /**
     * Generate performance test report
     */
    generateReport(suiteId: string): PerformanceTestSummary;
    /**
     * Compare baseline vs optimized performance
     */
    comparePerformance(baseline: PerformanceMetrics, optimized: PerformanceMetrics): {
        responseTime: number;
        throughput: number;
        resourceUsage: number;
        cost: number;
        overall: number;
    };
    /**
     * Calculate cost savings
     */
    calculateCostSavings(baseline: PerformanceMetrics, optimized: PerformanceMetrics): {
        compute: number;
        storage: number;
        network: number;
        total: number;
        annual: number;
    };
    /**
     * Run a performance test (simulated)
     */
    private runPerformanceTest;
    /**
     * Generate realistic test metrics
     */
    private generateTestMetrics;
    /**
     * Check performance thresholds
     */
    private checkThresholds;
    /**
     * Calculate test score
     */
    private calculateTestScore;
    /**
     * Determine test status
     */
    private determineTestStatus;
    /**
     * Generate recommendations based on violations and metrics
     */
    private generateRecommendations;
    /**
     * Update suite summary
     */
    private updateSuiteSummary;
}
/**
 * Growth Engine Performance Testing Utilities
 */
export declare class GrowthEnginePerformanceTester {
    private testEngine;
    constructor();
    /**
     * Create a comprehensive Growth Engine performance test suite
     */
    createGrowthEngineTestSuite(): PerformanceTestSuite;
    /**
     * Add Growth Engine specific tests
     */
    addGrowthEngineTests(suiteId: string): void;
    /**
     * Execute comprehensive Growth Engine performance testing
     */
    executeGrowthEnginePerformanceTests(): Promise<{
        suite: PerformanceTestSuite;
        results: PerformanceTestResult[];
        summary: PerformanceTestSummary;
    }>;
}
export default PerformanceTestEngine;
//# sourceMappingURL=performance-testing.d.ts.map