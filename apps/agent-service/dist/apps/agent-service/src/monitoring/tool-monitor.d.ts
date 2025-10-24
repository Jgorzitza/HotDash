/**
 * Tool Execution Monitor
 *
 * Tracks and monitors tool executions for agent operations.
 * Collects metrics, logs errors, and provides insights into tool usage.
 */
export interface ToolExecution {
    id: string;
    conversationId: number;
    agentName: string;
    toolName: string;
    arguments: Record<string, any>;
    startTime: Date;
    endTime?: Date;
    durationMs?: number;
    status: 'running' | 'success' | 'error' | 'cancelled';
    result?: any;
    error?: string;
    approved?: boolean;
    approvedBy?: string;
    approvedAt?: Date;
}
export interface ToolMetrics {
    toolName: string;
    totalExecutions: number;
    successCount: number;
    errorCount: number;
    cancelledCount: number;
    avgDurationMs: number;
    maxDurationMs: number;
    minDurationMs: number;
    approvalRate: number;
}
/**
 * Monitors tool executions across all agents
 */
export declare class ToolMonitor {
    private executions;
    private maxHistorySize;
    /**
     * Start tracking a tool execution
     */
    startExecution(conversationId: number, agentName: string, toolName: string, args: Record<string, any>): string;
    /**
     * Mark execution as successful
     */
    completeExecution(executionId: string, result?: any): void;
    /**
     * Mark execution as failed
     */
    failExecution(executionId: string, error: string): void;
    /**
     * Mark execution as cancelled
     */
    cancelExecution(executionId: string): void;
    /**
     * Mark execution as approved
     */
    approveExecution(executionId: string, approvedBy: string): void;
    /**
     * Get execution by ID
     */
    getExecution(executionId: string): ToolExecution | undefined;
    /**
     * Get all executions for a conversation
     */
    getConversationExecutions(conversationId: number): ToolExecution[];
    /**
     * Get metrics for a specific tool
     */
    getToolMetrics(toolName: string): ToolMetrics;
    /**
     * Get metrics for all tools
     */
    getAllMetrics(): ToolMetrics[];
    /**
     * Get recent failures
     */
    getRecentFailures(limit?: number): ToolExecution[];
    /**
     * Get slow executions (> threshold)
     */
    getSlowExecutions(thresholdMs?: number, limit?: number): ToolExecution[];
    /**
     * Get executions pending approval
     */
    getPendingApprovals(): ToolExecution[];
    /**
     * Clear old executions
     */
    cleanup(maxAgeMs?: number): number;
}
export declare const toolMonitor: ToolMonitor;
//# sourceMappingURL=tool-monitor.d.ts.map