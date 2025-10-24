#!/usr/bin/env tsx
/**
 * QA E2E Runner (QA-001)
 *
 * Executes a safe end-to-end pathway for the Growth Engine:
 * 1) Telemetry pipeline (gracefully degrades if external APIs unavailable)
 * 2) Specialist Agents to emit mock actions
 * 3) Persist actions to action_queue
 * 4) Create and approve a sample CEO approval (decision_log)
 * 5) Log a summary decision for traceability
 *
 * This runner avoids UI/network-heavy flows and uses existing services only.
 *
 * Allowed path: app/lib/growth-engine/* (per QA-001 task constraints)
 */
export {};
//# sourceMappingURL=qa_e2e_runner.d.ts.map