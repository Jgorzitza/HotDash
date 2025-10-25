/**
 * KB INTEGRATION SERVICE
 *
 * This service provides KB tool integration for all agents to search for
 * existing solutions, context, and documentation before executing tasks.
 *
 * Prevents redoing work and ensures agents have full context.
 */
export interface KBQueryResult {
    question: string;
    answer: string;
    sources: Array<{
        title: string;
        similarity: number;
    }>;
    timestamp: Date;
}
export interface KBContextSearch {
    taskId: string;
    taskTitle: string;
    searchQueries: string[];
    results: KBQueryResult[];
    recommendations: string[];
}
/**
 * Execute KB query using the pilot agent's KB tool
 */
export declare function queryKB(question: string): Promise<KBQueryResult>;
/**
 * Search for existing solutions and context before executing a task
 */
export declare function searchTaskContext(taskId: string, taskTitle: string, taskDescription: string, assignedAgent: string): Promise<KBContextSearch>;
/**
 * Log KB search results to DecisionLog
 */
export declare function logKBSearch(taskId: string, searchResults: KBContextSearch, agent: string): Promise<void>;
/**
 * Pre-task KB search workflow
 * This should be called before any task execution
 */
export declare function preTaskKBSearch(taskId: string, taskTitle: string, taskDescription: string, assignedAgent: string): Promise<KBContextSearch>;
//# sourceMappingURL=kb-integration.server.d.ts.map