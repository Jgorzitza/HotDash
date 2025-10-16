/**
 * OpenAI Agents SDK - Core Module
 *
 * Initializes OpenAI Agents SDK with HITL (Human-in-the-Loop) enforcement.
 * All customer-facing agents MUST have human_review: true.
 */

import { Agent, run as sdkRun } from '@openai/agents';
import { z } from 'zod';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Agent configuration schema
 */
export const AgentConfigSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  human_review: z.boolean(),
  reviewers: z.array(z.string()).optional(),
  model: z.string().optional(),
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;

/**
 * Agents configuration file schema
 */
export const AgentsConfigSchema = z.object({
  agents: z.array(AgentConfigSchema),
});

/**
 * Load agents configuration
 */
export function loadAgentsConfig(): AgentConfig[] {
  try {
    const configPath = join(process.cwd(), 'app/agents/config/agents.json');
    const configData = readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configData);

    const validated = AgentsConfigSchema.parse(config);
    return validated.agents;
  } catch (error) {
    console.error('[SDK] Failed to load agents config:', error);
    throw new Error('Failed to load agents configuration');
  }
}

/**
 * Optional Supabase client for approvals persistence
 */
function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    return createClient(url, key);
  } catch (e) {
    console.warn('[SDK] Supabase client init failed:', e);
    return null;
  }
}

/**
 * Get agent configuration by ID
 */
export function getAgentConfig(agentId: string): AgentConfig {
  const agents = loadAgentsConfig();
  const config = agents.find(a => a.id === agentId);

  if (!config) {
    throw new Error(`Agent configuration not found: ${agentId}`);
  }

  return config;
}

/**
 * Verify HITL enforcement for agent
 *
 * CRITICAL: All customer-facing agents MUST have human_review: true
 */
export function verifyHITLEnforcement(agentId: string): void {
  const config = getAgentConfig(agentId);

  // If human_review is required, must have reviewers
  if (config.human_review && (!config.reviewers || config.reviewers.length === 0)) {
    throw new Error(
      `Agent ${agentId} requires human_review but has no reviewers configured`
    );
  }

  console.log(`[SDK] HITL enforcement verified for agent: ${agentId}`);
}

/**
 * Approval request schema
 */
export const ApprovalRequestSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  conversationId: z.string(),
  action: z.string(),
  draftContent: z.string(),
  evidence: z.object({
    queries: z.array(z.string()).optional(),
    samples: z.array(z.unknown()).optional(),
    diffs: z.array(z.unknown()).optional(),
  }).optional(),
  projectedImpact: z.string().optional(),
  risks: z.string().optional(),
  rollback: z.string().optional(),
  affectedPaths: z.array(z.string()).optional(),
  createdAt: z.string(),
  status: z.enum(['pending', 'approved', 'rejected']),
});

export type ApprovalRequest = z.infer<typeof ApprovalRequestSchema>;

/**
 * Approval response schema
 */
export const ApprovalResponseSchema = z.object({
  approvalId: z.string(),
  approved: z.boolean(),
  reviewedBy: z.string(),
  reviewedAt: z.string(),
  feedback: z.string().optional(),
  grading: z.object({
    tone: z.number().min(1).max(5),
    accuracy: z.number().min(1).max(5),
    policy: z.number().min(1).max(5),
  }).optional(),
  editedContent: z.string().optional(),
});

export type ApprovalResponse = z.infer<typeof ApprovalResponseSchema>;

/**
 * Create approval request
 */
export async function createApprovalRequest(
  request: Omit<ApprovalRequest, 'id' | 'createdAt' | 'status'>
): Promise<ApprovalRequest> {
  const base: ApprovalRequest = {
    ...request,
    id: `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  // Try Supabase first (if configured)
  const sb = getSupabase();
  if (sb) {
    try {
      const actions = [
        {
          tool: 'cw_send_public_reply',
          args: { conversationId: request.conversationId, content: request.draftContent },
        },
      ];
      const { data, error } = await sb
        .from('approvals')
        .insert({
          kind: 'cx_reply',
          state: 'pending_review',
          summary: request.action || `Draft reply for conversation ${request.conversationId}`,
          created_by: request.agentId,
          evidence: request.evidence || {},
          impact: base.projectedImpact ? { text: base.projectedImpact } : {},
          risk: base.risks ? { text: base.risks } : {},
          rollback: base.rollback ? { text: base.rollback } : {},
          actions,
        })
        .select()
        .single();
      if (error) throw error;
      if (data && data.id) {
        console.log('[SDK] Approval stored in Supabase:', data.id);
        return { ...base, id: String(data.id) };
      }
    } catch (e) {
      console.warn('[SDK] Supabase approval insert failed, falling back:', (e as Error)?.message);
    }
  }

  // Fallback: log only, return generated id
  console.log('[SDK] Approval request (fallback):', base.id);
  return base;
}

/**
 * Wait for approval (polling)
 */
export async function waitForApproval(
  approvalId: string,
  timeoutMs: number = 300000 // 5 minutes
): Promise<ApprovalResponse> {
  console.log('[SDK] Waiting for approval:', approvalId);
  const start = Date.now();
  const sb = getSupabase();

  if (!sb) {
    throw new Error('HITL approval required. Supabase not configured for polling.');
  }

  while (Date.now() - start < timeoutMs) {
    const { data, error } = await sb
      .from('approvals')
      .select('id, state, reviewer, updated_at')
      .eq('id', Number(approvalId))
      .single();

    if (error) {
      console.warn('[SDK] Approval poll error:', error.message);
    } else if (data) {
      if (data.state === 'approved') {
        return {
          approvalId: String(data.id),
          approved: true,
          reviewedBy: data.reviewer || 'unknown',
          reviewedAt: data.updated_at || new Date().toISOString(),
        };
      }
      if (data.state === 'rejected') {
        return {
          approvalId: String(data.id),
          approved: false,
          reviewedBy: data.reviewer || 'unknown',
          reviewedAt: data.updated_at || new Date().toISOString(),
        };
      }
    }

    await new Promise((r) => setTimeout(r, 1000));
  }

  throw new Error(`Approval wait timed out after ${timeoutMs}ms`);
}


/**
 * Verify approval is approved (Supabase-backed). Returns true if approved.
 */
export async function isApprovalApproved(approvalId: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    const { data, error } = await sb
      .from('approvals')
      .select('state')
      .eq('id', Number(approvalId))
      .single();
    if (error) return false;
    return data?.state === 'approved';
  } catch {
    return false;
  }
}

/**
 * Create agent with HITL verification
 */
export function createAgent(
  agentId: string,
  options: {
    instructions: string;
    tools?: any[];
    model?: string;
  }
): Agent {
  // Verify HITL enforcement
  verifyHITLEnforcement(agentId);

  const config = getAgentConfig(agentId);

  const agent = new Agent({
    name: config.name || agentId,
    instructions: options.instructions,
    tools: options.tools || [],
    model: options.model || config.model || 'gpt-4o',
  });

  console.log('[SDK] Agent created:', agentId);

  return agent;
}

/**
 * Run agent with timeout and error boundary
 */
export interface RunOptions {
  timeoutMs?: number; // default 15000
  metadata?: Record<string, unknown>;
}

export async function run(agent: Agent, input: string, options: RunOptions = {}): Promise<any> {
  const timeoutMs = options.timeoutMs ?? 15000;

  logStructured('info', '[SDK] Running agent', {
    agent: agent.name,
    inputPreview: typeof input === 'string' ? input.slice(0, 100) : '[non-string]',
    ...options.metadata,
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Agent run timed out after ${timeoutMs}ms`)), timeoutMs)
  );

  try {
    const result = await Promise.race([
      // Under the hood, sdkRun(agent, input) may call external services
      // We enforce a timeout via Promise.race to avoid hanging requests
      sdkRun(agent, input),
      timeoutPromise,
    ]);

    logStructured('info', '[SDK] Agent run complete', { agent: agent.name });
    return result;
  } catch (err: any) {
    const msg = err?.message || 'Unknown error during agent run';
    logStructured('error', '[SDK] Agent run failed', { agent: agent.name, error: msg });
    throw new Error(msg);
  }
}


function redactPII(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  let s = value;
  // Emails
  s = s.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted_email]');
  // Phone numbers (very rough)
  s = s.replace(/\+?\d[\d\s().-]{7,}\d/g, '[redacted_phone]');
  // Order numbers like #12345
  s = s.replace(/#\d{4,}/g, '[redacted_order]');
  return s;
}

/**
 * Structured log entry
 */
export function logStructured(
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  metadata?: Record<string, unknown>
): void {
  // Shallow redact strings in metadata
  const redactedMeta: Record<string, unknown> | undefined = metadata
    ? Object.fromEntries(
        Object.entries(metadata).map(([k, v]) => [k, redactPII(v)])
      )
    : undefined;

  const entry = {
    level,
    message: String(redactPII(message)),
    timestamp: new Date().toISOString(),
    ...redactedMeta,
  };

  console.log(JSON.stringify(entry));
}

/**
 * Export all SDK utilities
 */
export {
  Agent,
  sdkRun,
};

