/**
 * Heartbeat Service
 *
 * Manages agent heartbeat tracking for Growth Engine compliance.
 * Required for tasks >2 hours to ensure agents are actively working.
 */
export interface HeartbeatEntry {
    timestamp: string;
    task: string;
    status: 'doing' | 'completed' | 'blocked';
    progress?: string;
    file?: string;
}
export declare class HeartbeatService {
    private basePath;
    constructor(basePath?: string);
    /**
     * Initialize heartbeat file for an agent and date
     */
    initializeHeartbeatFile(agent: string, date: string): Promise<string>;
    /**
     * Append heartbeat entry to NDJSON file
     */
    appendHeartbeat(agent: string, date: string, entry: HeartbeatEntry): Promise<void>;
    /**
     * Get all heartbeat entries for an agent and date
     */
    getHeartbeatEntries(agent: string, date: string): Promise<HeartbeatEntry[]>;
    /**
     * Get the last heartbeat entry for a task
     */
    getLastHeartbeat(agent: string, date: string, task: string): Promise<HeartbeatEntry | null>;
    /**
     * Check if heartbeat is stale (>15 minutes old)
     */
    isHeartbeatStale(agent: string, date: string, task: string): Promise<boolean>;
    /**
     * Check if heartbeat file exists
     */
    hasHeartbeatFile(agent: string, date: string): Promise<boolean>;
    /**
     * Validate heartbeat entry format
     */
    private validateHeartbeatEntry;
    /**
     * Generate Heartbeat section for PR template
     */
    generatePRTemplateSection(agent: string, date: string, task: string): Promise<string>;
    /**
     * Start heartbeat monitoring for a task
     */
    startHeartbeatMonitoring(agent: string, date: string, task: string, intervalMinutes?: number): Promise<NodeJS.Timeout>;
    /**
     * Stop heartbeat monitoring
     */
    stopHeartbeatMonitoring(interval: NodeJS.Timeout): void;
}
export declare const heartbeatService: HeartbeatService;
//# sourceMappingURL=heartbeat.server.d.ts.map