// Metrics emitter implementing agentfeedbackprocess.md specifications
import fs from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';

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
export async function emitRunMetrics(
  run: Partial<AgentRun> & Pick<AgentRun, 'input_kind' | 'agent_name'>
): Promise<string> {
  const run_id = uuidv4();
  const now = new Date().toISOString();
  const outDir = path.join(process.cwd(), 'artifacts', 'ai', now.replace(/[:]/g, '').slice(0, 15));

  await fs.mkdir(outDir, { recursive: true });

  const metrics: AgentRun = {
    run_id,
    agent_name: run.agent_name,
    input_kind: run.input_kind,
    started_at: run.started_at || now,
    ended_at: run.ended_at,
    resolution: run.resolution || 'failed',
    self_corrected: run.self_corrected || false,
    tokens_input: run.tokens_input || 0,
    tokens_output: run.tokens_output || 0,
    cost_usd: run.cost_usd || 0,
    sla_target_seconds: run.sla_target_seconds,
    metadata: run.metadata || {}
  };

  const metricsPath = path.join(outDir, `metrics_${run_id}.json`);
  
  await fs.writeFile(metricsPath, JSON.stringify(metrics, null, 2));
  console.log(`📊 Metrics emitted to: ${metricsPath}`);

  return run_id;
}

/**
 * Emit agent quality control metrics
 */
export async function emitQCMetrics(
  run_id: string,
  quality_score?: number,
  notes?: string
): Promise<void> {
  const now = new Date().toISOString();
  const outDir = path.join(process.cwd(), 'artifacts', 'ai', now.replace(/[:]/g, '').slice(0, 15));

  await fs.mkdir(outDir, { recursive: true });

  const qc: AgentQC = {
    run_id,
    quality_score,
    notes
  };

  const qcPath = path.join(outDir, `qc_${run_id}.json`);
  await fs.writeFile(qcPath, JSON.stringify(qc, null, 2));
  console.log(`📋 QC metrics emitted to: ${qcPath}`);
}

/**
 * Helper to calculate token counts (rough estimation)
 */
export function estimateTokens(text: string): number {
  // Very rough estimation - 4 chars per token on average
  return Math.ceil(text.length / 4);
}