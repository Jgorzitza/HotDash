/**
 * Growth Engine Specialist Agents Infrastructure
 *
 * Implements the specialist agents (Analytics, Inventory, Content/SEO/Perf, Risk)
 * that run on schedules and events to populate the Action Queue
 */
import { ActionQueueItem } from './action-queue';
export declare class AnalyticsAgent {
    private agent;
    constructor();
    /**
     * Run daily analytics analysis
     */
    runDailyAnalysis(): Promise<ActionQueueItem[]>;
}
export declare class InventoryAgent {
    private agent;
    constructor();
    /**
     * Run hourly inventory analysis
     */
    runHourlyAnalysis(): Promise<ActionQueueItem[]>;
}
export declare class ContentSEOPerfAgent {
    private agent;
    constructor();
    /**
     * Run daily content/SEO/performance analysis
     */
    runDailyAnalysis(): Promise<ActionQueueItem[]>;
}
export declare class RiskAgent {
    private agent;
    constructor();
    /**
     * Run continuous risk monitoring
     */
    runContinuousMonitoring(): Promise<ActionQueueItem[]>;
}
export declare class SpecialistAgentOrchestrator {
    private analytics;
    private inventory;
    private contentSeoPerf;
    private risk;
    constructor();
    /**
     * Run all specialist agents
     */
    runAllAgents(): Promise<ActionQueueItem[]>;
    /**
     * Run specific agent
     */
    runAgent(agentName: string): Promise<ActionQueueItem[]>;
}
//# sourceMappingURL=specialist-agents.d.ts.map