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

import prisma from "../../db.server";

async function runTelemetryPipeline() {
  const { TelemetryPipeline } = await import("./telemetry-pipeline");
  const pipeline = new TelemetryPipeline();
  try {
    const result = await pipeline.runDailyPipeline();
    console.log("[QA-001] Telemetry pipeline result:", result);
    return result;
  } catch (err: any) {
    console.error("[QA-001] Telemetry pipeline failed:", err?.message || err);
    return {
      success: false,
      opportunitiesFound: 0,
      actionsEmitted: 0,
      errors: [String(err?.message || err)],
      performance: { totalTime: 0, gscFetchTime: 0, ga4FetchTime: 0, transformTime: 0, emitTime: 0 },
    };
  }
}

async function runSpecialistAgentsAndPersist() {
  const { SpecialistAgentOrchestrator } = await import("./specialist-agents");

  const orchestrator = new SpecialistAgentOrchestrator();
  const actions = await orchestrator.runAllAgents();
  console.log(`[QA-001] Specialist agents produced ${actions.length} actions`);

  let inserted = 0;
  for (const action of actions) {
    try {
      await prisma.$queryRaw`
        INSERT INTO action_queue (
          type, target, draft, evidence, expected_impact, confidence,
          ease, risk_tier, can_execute, rollback_plan, freshness_label, agent
        ) VALUES (
          ${action.type}, ${action.target}, ${action.draft}, ${JSON.stringify(action.evidence)},
          ${JSON.stringify(action.expected_impact)}, ${action.confidence}, ${action.ease},
          ${action.risk_tier}, ${action.can_execute}, ${action.rollback_plan},
          ${action.freshness_label}, ${action.agent}
        )
      `;
      inserted++;
    } catch (err: any) {
      console.error("[QA-001] Failed to insert action_queue item:", err?.message || err);
    }
  }

  console.log(`[QA-001] Persisted ${inserted}/${actions.length} actions to action_queue`);
  return { produced: actions.length, inserted };
}

async function createAndApproveSampleApproval() {
  // Use Approval Adapter via Supabase (env must be present)
  const { createApproval, updateApprovalStatus } = await import("../../services/ai-customer/approval-adapter");

  const SUPABASE_URL = process.env.SUPABASE_URL || "";
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.warn("[QA-001] Missing SUPABASE_URL/SUPABASE_SERVICE_KEY; skipping approval creation");
    return { created: false };
  }

  const actionId = `qa-${Date.now()}`;
  const action = {
    actionId,
    actionType: "cx" as const,
    description: "Send courteous reply: shipment delivered confirmation.",
    payload: { conversationId: 101, template: "delivery-confirmation" },
    reasoning: "Customer status verified. Sending confirmation improves CSAT.",
    evidence: { sources: ["kb://qa/approval-flow"], metrics: { csatLift: 3.2 } },
    projectedImpact: { customerSatisfaction: 2.5 },
    risks: ["none"],
    rollback: "Send follow-up apology if error detected.",
  };

  const userId = "qa-helper";
  const approval = await createApproval(action, userId, SUPABASE_URL, SUPABASE_SERVICE_KEY);
  console.log("[QA-001] Created approval:", approval);

  const approved = await updateApprovalStatus(
    approval.approvalId,
    "approved",
    userId,
    undefined,
    SUPABASE_URL,
    SUPABASE_SERVICE_KEY,
  );
  console.log(`[QA-001] Approval ${approval.approvalId} approved:`, approved);

  return { created: true, approvalId: approval.approvalId, approved };
}

async function logSummary(summary: any) {
  try {
    const { logDecision } = await import("../../services/decisions.server");
    await logDecision({
      scope: "build",
      actor: "qa-helper",
      action: "qa_e2e_summary",
      rationale: "QA-001 E2E run completed",
      payload: summary,
    });
    console.log("[QA-001] Summary logged to decision_log");
  } catch (err: any) {
    console.error("[QA-001] Failed to log summary:", err?.message || err);
  }
}

async function main() {
  const beforeCount = await prisma.action_queue.count().catch(() => 0);
  console.log(`[QA-001] action_queue count (before): ${beforeCount}`);

  const telemetry = await runTelemetryPipeline();
  const agentRun = await runSpecialistAgentsAndPersist();

  const afterCount = await prisma.action_queue.count().catch(() => beforeCount);
  console.log(`[QA-001] action_queue count (after): ${afterCount}`);

  const approval = await createAndApproveSampleApproval();

  const summary = {
    actionQueue: { before: beforeCount, after: afterCount, insertedFromAgents: agentRun.inserted },
    telemetry,
    approval,
    timestamp: new Date().toISOString(),
  };

  await logSummary(summary);

  console.log("\n[QA-001] E2E Summary:", JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error("[QA-001] Runner failed:", err);
  process.exitCode = 1;
});

