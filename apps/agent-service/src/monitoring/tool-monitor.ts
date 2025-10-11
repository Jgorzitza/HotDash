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
export class ToolMonitor {
  private executions: ToolExecution[] = [];
  private maxHistorySize = 1000;

  /**
   * Start tracking a tool execution
   */
  startExecution(
    conversationId: number,
    agentName: string,
    toolName: string,
    args: Record<string, any>
  ): string {
    const execution: ToolExecution = {
      id: `exec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      conversationId,
      agentName,
      toolName,
      arguments: args,
      startTime: new Date(),
      status: 'running',
    };

    this.executions.push(execution);
    
    // Keep only recent executions
    if (this.executions.length > this.maxHistorySize) {
      this.executions = this.executions.slice(-this.maxHistorySize);
    }

    console.log(`[ToolMonitor] Started: ${toolName} (${execution.id})`);
    return execution.id;
  }

  /**
   * Mark execution as successful
   */
  completeExecution(executionId: string, result?: any): void {
    const execution = this.executions.find(e => e.id === executionId);
    if (!execution) return;

    execution.endTime = new Date();
    execution.durationMs = execution.endTime.getTime() - execution.startTime.getTime();
    execution.status = 'success';
    execution.result = result;

    console.log(`[ToolMonitor] Completed: ${execution.toolName} (${execution.durationMs}ms)`);
  }

  /**
   * Mark execution as failed
   */
  failExecution(executionId: string, error: string): void {
    const execution = this.executions.find(e => e.id === executionId);
    if (!execution) return;

    execution.endTime = new Date();
    execution.durationMs = execution.endTime.getTime() - execution.startTime.getTime();
    execution.status = 'error';
    execution.error = error;

    console.error(`[ToolMonitor] Failed: ${execution.toolName} - ${error}`);
  }

  /**
   * Mark execution as cancelled
   */
  cancelExecution(executionId: string): void {
    const execution = this.executions.find(e => e.id === executionId);
    if (!execution) return;

    execution.endTime = new Date();
    execution.durationMs = execution.endTime.getTime() - execution.startTime.getTime();
    execution.status = 'cancelled';

    console.log(`[ToolMonitor] Cancelled: ${execution.toolName}`);
  }

  /**
   * Mark execution as approved
   */
  approveExecution(executionId: string, approvedBy: string): void {
    const execution = this.executions.find(e => e.id === executionId);
    if (!execution) return;

    execution.approved = true;
    execution.approvedBy = approvedBy;
    execution.approvedAt = new Date();

    console.log(`[ToolMonitor] Approved: ${execution.toolName} by ${approvedBy}`);
  }

  /**
   * Get execution by ID
   */
  getExecution(executionId: string): ToolExecution | undefined {
    return this.executions.find(e => e.id === executionId);
  }

  /**
   * Get all executions for a conversation
   */
  getConversationExecutions(conversationId: number): ToolExecution[] {
    return this.executions.filter(e => e.conversationId === conversationId);
  }

  /**
   * Get metrics for a specific tool
   */
  getToolMetrics(toolName: string): ToolMetrics {
    const toolExecutions = this.executions.filter(e => e.toolName === toolName);
    
    if (toolExecutions.length === 0) {
      return {
        toolName,
        totalExecutions: 0,
        successCount: 0,
        errorCount: 0,
        cancelledCount: 0,
        avgDurationMs: 0,
        maxDurationMs: 0,
        minDurationMs: 0,
        approvalRate: 0,
      };
    }

    const successCount = toolExecutions.filter(e => e.status === 'success').length;
    const errorCount = toolExecutions.filter(e => e.status === 'error').length;
    const cancelledCount = toolExecutions.filter(e => e.status === 'cancelled').length;
    
    const completedExecutions = toolExecutions.filter(e => e.durationMs !== undefined);
    const durations = completedExecutions.map(e => e.durationMs!);
    
    const approvedCount = toolExecutions.filter(e => e.approved).length;
    const needsApproval = toolExecutions.filter(e => e.status === 'running').length;

    return {
      toolName,
      totalExecutions: toolExecutions.length,
      successCount,
      errorCount,
      cancelledCount,
      avgDurationMs: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
      maxDurationMs: durations.length > 0 ? Math.max(...durations) : 0,
      minDurationMs: durations.length > 0 ? Math.min(...durations) : 0,
      approvalRate: needsApproval > 0 ? approvedCount / needsApproval : 1,
    };
  }

  /**
   * Get metrics for all tools
   */
  getAllMetrics(): ToolMetrics[] {
    const toolNames = [...new Set(this.executions.map(e => e.toolName))];
    return toolNames.map(name => this.getToolMetrics(name));
  }

  /**
   * Get recent failures
   */
  getRecentFailures(limit: number = 10): ToolExecution[] {
    return this.executions
      .filter(e => e.status === 'error')
      .slice(-limit)
      .reverse();
  }

  /**
   * Get slow executions (> threshold)
   */
  getSlowExecutions(thresholdMs: number = 5000, limit: number = 10): ToolExecution[] {
    return this.executions
      .filter(e => e.durationMs && e.durationMs > thresholdMs)
      .sort((a, b) => (b.durationMs || 0) - (a.durationMs || 0))
      .slice(0, limit);
  }

  /**
   * Get executions pending approval
   */
  getPendingApprovals(): ToolExecution[] {
    return this.executions.filter(e => e.status === 'running' && e.approved === undefined);
  }

  /**
   * Clear old executions
   */
  cleanup(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
    const now = Date.now();
    const before = this.executions.length;
    
    this.executions = this.executions.filter(e => {
      const age = now - e.startTime.getTime();
      return age < maxAgeMs;
    });

    return before - this.executions.length;
  }
}

// Export singleton instance
export const toolMonitor = new ToolMonitor();

// Run cleanup every 6 hours
setInterval(() => {
  const removed = toolMonitor.cleanup();
  if (removed > 0) {
    console.log(`[ToolMonitor] Cleaned up ${removed} old executions`);
  }
}, 6 * 60 * 60 * 1000);

