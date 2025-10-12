/**
 * Agent Collaboration Coordinator
 *
 * Orchestrates collaboration between multiple agents to solve complex tasks.
 * Implements patterns like sequential handoff, parallel consultation, and consensus.
 */
export interface CollaborationTask {
    id: string;
    type: 'sequential' | 'parallel' | 'consensus';
    agents: string[];
    input: string;
    context: Record<string, any>;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    results: AgentResult[];
    finalOutput?: any;
    startTime?: Date;
    endTime?: Date;
}
export interface AgentResult {
    agentName: string;
    output: any;
    confidence: number;
    timestamp: Date;
    durationMs: number;
}
/**
 * Coordinates collaboration between multiple agents
 */
export declare class CollaborationCoordinator {
    private tasks;
    /**
     * Create a sequential collaboration task
     * Each agent processes the output of the previous agent
     */
    sequential(agents: string[], input: string, context?: Record<string, any>): Promise<CollaborationTask>;
    /**
     * Create a parallel collaboration task
     * All agents process the same input simultaneously
     */
    parallel(agents: string[], input: string, context?: Record<string, any>): Promise<CollaborationTask>;
    /**
     * Create a consensus collaboration task
     * Agents vote on the best response
     */
    consensus(agents: string[], input: string, context?: Record<string, any>): Promise<CollaborationTask>;
    /**
     * Add agent result to task
     */
    addResult(taskId: string, result: AgentResult): void;
    /**
     * Mark task as complete and generate final output
     */
    private completeTask;
    /**
     * Get task by ID
     */
    getTask(taskId: string): CollaborationTask | undefined;
    /**
     * Get all active tasks
     */
    getActiveTasks(): CollaborationTask[];
    /**
     * Get completed tasks
     */
    getCompletedTasks(limit?: number): CollaborationTask[];
    /**
     * Clean up old tasks
     */
    cleanup(maxAgeMs?: number): number;
}
/**
 * Common collaboration patterns
 */
export declare const CollaborationPatterns: {
    /**
     * Triage → Specialist pattern
     * Triage agent classifies, then hands off to specialist
     */
    triageAndSpecialize: (coordinator: CollaborationCoordinator, input: string) => Promise<CollaborationTask>;
    /**
     * Multiple specialists review in parallel
     * Useful for complex questions requiring different expertise
     */
    parallelReview: (coordinator: CollaborationCoordinator, input: string, specialists: string[]) => Promise<CollaborationTask>;
    /**
     * Consensus for sensitive actions
     * Multiple agents must agree before taking action
     */
    consensusAction: (coordinator: CollaborationCoordinator, input: string, agents: string[]) => Promise<CollaborationTask>;
    /**
     * Draft → Review → Send pattern
     * One agent drafts, another reviews, final approval before sending
     */
    draftReviewSend: (coordinator: CollaborationCoordinator, input: string) => Promise<CollaborationTask>;
};
export declare const collaborationCoordinator: CollaborationCoordinator;
//# sourceMappingURL=collaboration-coordinator.d.ts.map