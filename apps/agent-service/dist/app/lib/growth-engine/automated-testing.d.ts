/**
 * Growth Engine Automated Testing Infrastructure
 *
 * Implements advanced automated testing for Growth Engine phases 9-12
 * Provides comprehensive test automation, coverage analysis, and quality assurance
 */
import { GrowthEngineSupportFramework } from '../services/growth-engine-support.server';
export interface TestSuite {
    id: string;
    name: string;
    type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security' | 'accessibility';
    status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
    duration: number;
    coverage: number;
    tests: TestCase[];
    environment: string;
    timestamp: string;
}
export interface TestCase {
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
    duration: number;
    error?: string;
    steps: TestStep[];
    assertions: TestAssertion[];
    coverage: {
        lines: number;
        branches: number;
        functions: number;
        statements: number;
    };
}
export interface TestStep {
    id: string;
    description: string;
    action: string;
    expected: string;
    actual?: string;
    status: 'pending' | 'passed' | 'failed';
    duration: number;
    screenshot?: string;
    logs?: string[];
}
export interface TestAssertion {
    id: string;
    description: string;
    expected: any;
    actual: any;
    status: 'passed' | 'failed';
    error?: string;
}
export interface TestReport {
    id: string;
    timestamp: string;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    coverage: {
        overall: number;
        byType: Record<string, number>;
    };
    performance: {
        averageDuration: number;
        slowestTest: string;
        fastestTest: string;
    };
    quality: {
        codeQuality: number;
        testQuality: number;
        maintainability: number;
    };
    recommendations: string[];
}
export interface TestConfiguration {
    environments: string[];
    browsers: string[];
    devices: string[];
    testTypes: TestSuite['type'][];
    coverageThreshold: number;
    performanceThreshold: number;
    parallel: boolean;
    retries: number;
    timeout: number;
}
export declare class AutomatedTestingEngine {
    private framework;
    private testSuites;
    private testReports;
    private configuration;
    constructor(framework: GrowthEngineSupportFramework, config: TestConfiguration);
    /**
     * Initialize automated testing engine
     */
    initialize(): Promise<void>;
    /**
     * Initialize test environments
     */
    private initializeTestEnvironments;
    /**
     * Setup test runners
     */
    private setupTestRunners;
    /**
     * Execute test suite
     */
    executeTestSuite(testType: TestSuite['type'], environment: string, options?: {
        parallel?: boolean;
        retries?: number;
        timeout?: number;
        coverage?: boolean;
    }): Promise<TestSuite>;
    /**
     * Execute tests based on type
     */
    private executeTests;
    /**
     * Execute unit tests
     */
    private executeUnitTests;
    /**
     * Execute integration tests
     */
    private executeIntegrationTests;
    /**
     * Execute E2E tests
     */
    private executeE2ETests;
    /**
     * Execute performance tests
     */
    private executePerformanceTests;
    /**
     * Execute security tests
     */
    private executeSecurityTests;
    /**
     * Execute accessibility tests
     */
    private executeAccessibilityTests;
    /**
     * Calculate test coverage
     */
    private calculateCoverage;
    /**
     * Generate test report
     */
    generateTestReport(): Promise<TestReport>;
    /**
     * Calculate overall coverage
     */
    private calculateOverallCoverage;
    /**
     * Calculate performance metrics
     */
    private calculatePerformanceMetrics;
    /**
     * Calculate quality metrics
     */
    private calculateQualityMetrics;
    /**
     * Generate recommendations
     */
    private generateRecommendations;
    /**
     * Get test suites
     */
    getTestSuites(): TestSuite[];
    /**
     * Get test reports
     */
    getTestReports(): TestReport[];
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
/**
 * Factory function to create Automated Testing Engine
 */
export declare function createAutomatedTestingEngine(framework: GrowthEngineSupportFramework, config: TestConfiguration): AutomatedTestingEngine;
//# sourceMappingURL=automated-testing.d.ts.map