/**
 * Agent Prompts - Central Export
 * 
 * System prompts for all specialized agents in the HotDash Agent SDK.
 */

export * from './triage.js';
export * from './order-support.js';
export * from './product-qa.js';
export * from './utils.js';

// Agent registry for dynamic loading
export const AGENT_PROMPTS = {
  triage: () => import('./triage.js'),
  orderSupport: () => import('./order-support.js'),
  productQA: () => import('./product-qa.js'),
} as const;

export type AgentType = keyof typeof AGENT_PROMPTS;

