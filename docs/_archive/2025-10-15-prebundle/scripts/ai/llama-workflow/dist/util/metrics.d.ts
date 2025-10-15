export interface AgentRun {
    run_id: string;
    agent_name: string;
    input_kind: string;
    started_at: string;
    ended_at?: string;
    resolution: 'resolved' | 'escalated' | 'failed';
    self_corrected: boolean;
    tokens_input: number;
    tokens_output: number;
    cost_usd: number;
    sla_target_seconds?: number;
    metadata: Record<string, any>;
}
export interface AgentQC {
    run_id: string;
    quality_score?: number;
    notes?: string;
}
/**
 * Emit agent performance metrics per agentfeedbackprocess.md specs
 */
export declare function emitRunMetrics(run: Partial<AgentRun> & Pick<AgentRun, 'input_kind' | 'agent_name'>): Promise<string>;
/**
 * Emit agent quality control metrics
 */
export declare function emitQCMetrics(run_id: string, quality_score?: number, notes?: string): Promise<void>;
/**
 * Helper to calculate token counts (rough estimation)
 */
export declare function estimateTokens(text: string): number;
//# sourceMappingURL=metrics.d.ts.map