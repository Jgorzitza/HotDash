import fs from 'node:fs';
import path from 'path';
import { Pool } from 'pg';
import type { Feedback, ApprovalRow } from './types.js';

const pgUrl = process.env.PG_URL;
const usePg = !!pgUrl;

let pool: Pool | null = null;
if (usePg) {
  pool = new Pool({ connectionString: pgUrl });
}

const dataDir = path.join(process.cwd(), 'data');
const feedbackPath = path.join(dataDir, 'feedback.jsonl');
const approvalsDir = path.join(dataDir, 'approvals');
fs.mkdirSync(approvalsDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

/**
 * Save a feedback sample for training/evaluation
 */
export async function saveFeedbackSample(sample: Partial<Feedback> & { conversationId: number; inputText: string }) {
  if (usePg && pool) {
    await pool.query(
      `INSERT INTO agent_feedback
       (conversation_id, input_text, model_draft, safe_to_send, labels, rubric, annotator, notes, meta)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        sample.conversationId,
        sample.inputText,
        sample.modelDraft,
        sample.safeToSend,
        JSON.stringify(sample.labels ?? []),
        JSON.stringify(sample.rubric ?? {}),
        sample.annotator ?? null,
        sample.notes ?? null,
        JSON.stringify(sample.meta ?? {}),
      ]
    );
  } else {
    fs.appendFileSync(feedbackPath, JSON.stringify(sample) + '\n');
  }
}

/**
 * Save approval state for later resumption
 */
export async function saveApprovalState(conversationId: number, state: any) {
  const id = `${conversationId}-${Date.now()}`;
  const record: ApprovalRow = {
    id,
    conversationId,
    serialized: JSON.stringify(state),
    lastInterruptions: state.interruptions ?? [],
    createdAt: new Date().toISOString(),
  };
  if (usePg && pool) {
    await pool.query(
      `INSERT INTO approvals (id, conversation_id, serialized, last_interruptions, created_at)
       VALUES ($1,$2,$3,$4,$5)`,
      [record.id, record.conversationId, record.serialized, JSON.stringify(record.lastInterruptions), record.createdAt]
    );
  } else {
    fs.writeFileSync(path.join(approvalsDir, `${id}.json`), JSON.stringify(record, null, 2));
  }
  return record;
}

/**
 * List all pending approvals
 */
export async function listPendingApprovals(): Promise<ApprovalRow[]> {
  if (usePg && pool) {
    const { rows } = await pool.query(
      `SELECT id, conversation_id, serialized, last_interruptions, created_at 
       FROM approvals 
       ORDER BY created_at DESC`
    );
    return rows.map((r: any) => ({
      id: r.id,
      conversationId: Number(r.conversation_id),
      serialized: r.serialized,
      lastInterruptions: r.last_interruptions,
      createdAt: r.created_at,
    }));
  }
  const files = fs.readdirSync(approvalsDir).filter(f => f.endsWith('.json'));
  return files.map(f => JSON.parse(fs.readFileSync(path.join(approvalsDir, f), 'utf-8')));
}

/**
 * Load approval state by ID
 */
export async function loadApprovalState(id: string): Promise<ApprovalRow | null> {
  if (usePg && pool) {
    const { rows } = await pool.query(
      `SELECT id, conversation_id, serialized, last_interruptions, created_at 
       FROM approvals 
       WHERE id=$1`,
      [id]
    );
    if (!rows[0]) return null;
    const r = rows[0];
    return {
      id: r.id,
      conversationId: Number(r.conversation_id),
      serialized: r.serialized,
      lastInterruptions: r.last_interruptions,
      createdAt: r.created_at,
    };
  }
  const p = path.join(approvalsDir, `${id}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

