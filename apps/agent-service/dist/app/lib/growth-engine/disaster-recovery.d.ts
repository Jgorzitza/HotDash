/**
 * Disaster Recovery Infrastructure
 *
 * Implements comprehensive disaster recovery for DevOps Growth Engine
 * Provides backup, recovery, and business continuity capabilities
 */
import { GrowthEngineSupportFramework } from '../services/growth-engine-support.server';
export interface RecoveryPlan {
    id: string;
    name: string;
    description: string;
    type: 'database' | 'application' | 'infrastructure' | 'full';
    priority: 'low' | 'medium' | 'high' | 'critical';
    rto: number;
    rpo: number;
    steps: RecoveryStep[];
    dependencies: string[];
    testing: {
        lastTested?: string;
        nextTest: string;
        frequency: 'weekly' | 'monthly' | 'quarterly';
        status: 'passed' | 'failed' | 'pending';
    };
}
export interface RecoveryStep {
    id: string;
    order: number;
    description: string;
    type: 'backup' | 'restore' | 'verify' | 'notify' | 'escalate';
    automated: boolean;
    estimatedDuration: number;
    dependencies: string[];
    successCriteria: string[];
    rollbackSteps: string[];
}
export interface BackupStatus {
    id: string;
    type: 'database' | 'files' | 'configuration' | 'full';
    status: 'in_progress' | 'completed' | 'failed' | 'scheduled';
    startTime: string;
    endTime?: string;
    duration?: number;
    size: number;
    location: string;
    retention: number;
    encryption: boolean;
    verification: {
        status: 'pending' | 'passed' | 'failed';
        checksum?: string;
        integrity?: boolean;
    };
}
export interface DisasterScenario {
    id: string;
    name: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    probability: number;
    impact: {
        business: 'low' | 'medium' | 'high' | 'critical';
        technical: 'low' | 'medium' | 'high' | 'critical';
        financial: 'low' | 'medium' | 'high' | 'critical';
    };
    triggers: string[];
    response: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    };
    recovery: {
        planId: string;
        estimatedTime: number;
        resources: string[];
    };
}
export interface RecoveryTest {
    id: string;
    planId: string;
    type: 'tabletop' | 'simulation' | 'full';
    status: 'scheduled' | 'in_progress' | 'completed' | 'failed';
    startTime: string;
    endTime?: string;
    results: {
        rto: number;
        rpo: number;
        success: boolean;
        issues: string[];
        recommendations: string[];
    };
    participants: string[];
    documentation: string[];
}
export declare class DisasterRecoveryEngine {
    private framework;
    private monitoringInterval?;
    private recoveryPlans;
    private backupStatus;
    private disasterScenarios;
    private recoveryTests;
    constructor(framework: GrowthEngineSupportFramework);
    /**
     * Initialize disaster recovery engine
     */
    initialize(): Promise<void>;
    /**
     * Initialize recovery plans
     */
    private initializeRecoveryPlans;
    /**
     * Initialize disaster scenarios
     */
    private initializeDisasterScenarios;
    /**
     * Start recovery monitoring
     */
    startRecoveryMonitoring(): Promise<void>;
    /**
     * Check backup status
     */
    checkBackupStatus(): Promise<void>;
    /**
     * Check recovery testing
     */
    checkRecoveryTesting(): Promise<void>;
    /**
     * Monitor disaster scenarios
     */
    monitorDisasterScenarios(): Promise<void>;
    /**
     * Trigger disaster response
     */
    triggerDisasterResponse(scenario: DisasterScenario): Promise<void>;
    /**
     * Execute recovery plan
     */
    executeRecoveryPlan(plan: RecoveryPlan): Promise<void>;
    /**
     * Get recovery plans
     */
    getRecoveryPlans(): RecoveryPlan[];
    /**
     * Get backup status
     */
    getBackupStatus(): BackupStatus[];
    /**
     * Get disaster scenarios
     */
    getDisasterScenarios(): DisasterScenario[];
    /**
     * Get recovery tests
     */
    getRecoveryTests(): RecoveryTest[];
    /**
     * Update recovery plan
     */
    updateRecoveryPlan(planId: string, updates: Partial<RecoveryPlan>): void;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
/**
 * Factory function to create Disaster Recovery Engine
 */
export declare function createDisasterRecoveryEngine(framework: GrowthEngineSupportFramework): DisasterRecoveryEngine;
//# sourceMappingURL=disaster-recovery.d.ts.map