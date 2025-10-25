/**
 * ENGINEER feedback script
 * Edit this file to log your feedback, then run it
 * 
 * Usage: npx tsx --env-file=.env scripts/agent/feedback/engineer.ts
 */

import "dotenv/config";
import { logDecision } from "../../../app/services/decisions.server";

async function logFeedback() {
  console.log("📝 Logging ENGINEER feedback...\n");

  // ============================================================================
  // EDIT YOUR FEEDBACK HERE
  // ============================================================================
  
  const feedback = await logDecision({
    scope: "build",                    // "build" or "ops"
    actor: "engineer",                 // DO NOT CHANGE - this is your agent name
    action: "task_completed",          // What you did
    rationale: "Completed the feature implementation",
    
    // Recommended:
    taskId: "ENG-XXX",                 // Your task ID
    status: "completed",               // pending, in_progress, completed, blocked
    progressPct: 100,                  // 0-100
    evidenceUrl: "artifacts/engineer/tasks/eng-xxx.md",
    
    // Optional:
    // durationActual: 3.5,            // hours
    // nextAction: "Start next task",
  });

  // ============================================================================
  // END EDIT SECTION
  // ============================================================================

  console.log("✅ Feedback logged!");
  console.log(`   ID: ${feedback.id}`);
  console.log(`   Task: ${feedback.taskId}`);
  console.log(`   Status: ${feedback.status}\n`);
}

logFeedback().catch(console.error);

