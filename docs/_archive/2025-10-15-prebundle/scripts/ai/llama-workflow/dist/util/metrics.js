// Metrics emitter implementing agentfeedbackprocess.md specifications
import fs from "node:fs/promises";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
/**
 * Emit agent performance metrics per agentfeedbackprocess.md specs
 */
export async function emitRunMetrics(run) {
  const run_id = uuidv4();
  const now = new Date().toISOString();
  const outDir = path.join(
    process.cwd(),
    "artifacts",
    "ai",
    now.replace(/[:]/g, "").slice(0, 15),
  );
  await fs.mkdir(outDir, { recursive: true });
  const metrics = {
    run_id,
    agent_name: run.agent_name,
    input_kind: run.input_kind,
    started_at: run.started_at || now,
    ...(run.ended_at ? { ended_at: run.ended_at } : {}),
    resolution: run.resolution || "failed",
    self_corrected: run.self_corrected || false,
    tokens_input: run.tokens_input || 0,
    tokens_output: run.tokens_output || 0,
    cost_usd: run.cost_usd || 0,
    ...(run.sla_target_seconds
      ? { sla_target_seconds: run.sla_target_seconds }
      : {}),
    metadata: run.metadata || {},
  };
  const metricsPath = path.join(outDir, `metrics_${run_id}.json`);
  await fs.writeFile(metricsPath, JSON.stringify(metrics, null, 2));
  console.log(`📊 Metrics emitted to: ${metricsPath}`);
  return run_id;
}
/**
 * Emit agent quality control metrics
 */
export async function emitQCMetrics(run_id, quality_score, notes) {
  const now = new Date().toISOString();
  const outDir = path.join(
    process.cwd(),
    "artifacts",
    "ai",
    now.replace(/[:]/g, "").slice(0, 15),
  );
  await fs.mkdir(outDir, { recursive: true });
  const qc = {
    run_id,
    ...(quality_score !== undefined ? { quality_score } : {}),
    ...(notes !== undefined ? { notes } : {}),
  };
  const qcPath = path.join(outDir, `qc_${run_id}.json`);
  await fs.writeFile(qcPath, JSON.stringify(qc, null, 2));
  console.log(`📋 QC metrics emitted to: ${qcPath}`);
}
/**
 * Helper to calculate token counts (rough estimation)
 */
export function estimateTokens(text) {
  // Very rough estimation - 4 chars per token on average
  return Math.ceil(text.length / 4);
}
//# sourceMappingURL=metrics.js.map
