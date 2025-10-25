/**
 * Growth Engine Security Monitoring Infrastructure
 *
 * Implements advanced security monitoring for Growth Engine phases 9-12
 * Provides automated security analysis, threat detection, and compliance monitoring
 */
import { GrowthEngineSupportFramework } from '../services/growth-engine-support.server';
export interface SecurityMetrics {
    timestamp: string;
    threatLevel: 'low' | 'medium' | 'high' | 'critical';
    activeThreats: number;
    blockedRequests: number;
    suspiciousActivities: number;
    complianceScore: number;
    vulnerabilityCount: number;
    securityIncidents: number;
    authenticationFailures: number;
    authorizationViolations: number;
}
export interface SecurityThreat {
    id: string;
    type: 'malware' | 'ddos' | 'injection' | 'brute_force' | 'data_exfiltration' | 'privilege_escalation';
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: string;
    target: string;
    description: string;
    detectedAt: string;
    status: 'active' | 'investigating' | 'mitigated' | 'resolved';
    impact: {
        affectedSystems: string[];
        dataAtRisk: string[];
        businessImpact: 'low' | 'medium' | 'high' | 'critical';
    };
    mitigation: {
        actions: string[];
        automated: boolean;
        effectiveness: number;
    };
}
export interface ComplianceCheck {
    id: string;
    standard: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS';
    requirement: string;
    status: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable';
    evidence: string[];
    lastChecked: string;
    nextCheck: string;
    remediation?: {
        description: string;
        priority: 'low' | 'medium' | 'high' | 'critical';
        deadline: string;
    };
}
export interface SecurityRecommendation {
    id: string;
    type: 'prevention' | 'detection' | 'response' | 'recovery';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    implementation: {
        steps: string[];
        effort: 'low' | 'medium' | 'high';
        cost: 'low' | 'medium' | 'high';
        timeline: string;
    };
    expectedResults: {
        riskReduction: number;
        complianceImprovement: number;
        costSavings: number;
    };
    evidence: {
        threatIntelligence: string[];
        vulnerabilityReports: string[];
        complianceGaps: string[];
    };
}
export declare class SecurityMonitoringEngine {
    private framework;
    private monitoringInterval?;
    private activeThreats;
    private complianceChecks;
    constructor(framework: GrowthEngineSupportFramework);
    /**
     * Initialize security monitoring engine
     */
    initialize(): Promise<void>;
    /**
     * Start security monitoring
     */
    startSecurityMonitoring(): Promise<void>;
    /**
     * Collect security metrics
     */
    collectSecurityMetrics(): Promise<SecurityMetrics>;
    /**
     * Analyze security metrics and detect threats
     */
    analyzeSecurityMetrics(metrics: SecurityMetrics): Promise<void>;
    /**
     * Detect security threats
     */
    detectThreats(metrics: SecurityMetrics): Promise<SecurityThreat[]>;
    /**
     * Check compliance status
     */
    checkCompliance(): Promise<ComplianceCheck[]>;
    /**
     * Assess vulnerabilities
     */
    assessVulnerabilities(): Promise<void>;
    /**
     * Generate security recommendations
     */
    generateSecurityRecommendations(): Promise<SecurityRecommendation[]>;
    /**
     * Initialize compliance checks
     */
    private initializeComplianceChecks;
    /**
     * Get active threats
     */
    getActiveThreats(): SecurityThreat[];
    /**
     * Get compliance checks
     */
    getComplianceChecks(): ComplianceCheck[];
    /**
     * Update threat status
     */
    updateThreatStatus(threatId: string, status: SecurityThreat['status']): void;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
/**
 * Factory function to create Security Monitoring Engine
 */
export declare function createSecurityMonitoringEngine(framework: GrowthEngineSupportFramework): SecurityMonitoringEngine;
//# sourceMappingURL=security-monitoring.d.ts.map