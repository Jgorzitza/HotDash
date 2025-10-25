/**
 * Simple script for agents to log feedback to KB database
 * 
 * Usage:
 *   npx tsx --env-file=.env scripts/agent/log-feedback.ts
 * 
 * Then edit the feedback object below with your details.
 */

import "dotenv/config";
import { logDecision } from "../../app/services/decisions.server";

async function logFeedback() {
  console.log("📝 Logging feedback to KB database...\n");

  // ============================================================================
  // EDIT THIS SECTION WITH YOUR FEEDBACK
  // ============================================================================
  
  const feedback = await logDecision({
    scope: "build",                    // "build" or "ops"
    actor: "engineer",                 // Your agent name: engineer, data, designer, etc.
    action: "task_completed",          // What you did: task_completed, task_started, blocker_found, etc.
    rationale: "Completed the feature implementation with tests",
    
    // Optional but recommended:
    taskId: "ENG-123",                 // Task ID from your direction
    status: "completed",               // pending, in_progress, completed, blocked, cancelled
    progressPct: 100,                  // 0-100
    evidenceUrl: "artifacts/engineer/tasks/eng-123.md",
    
    // If blocked:
    // blockerDetails: "Waiting for API endpoint",
    // blockedBy: "ENG-122",
    
    // Time tracking:
    // durationEstimate: 4,            // hours
    // durationActual: 3.5,            // hours
    
    // Next steps:
    // nextAction: "Start testing in staging environment",
  });

  // ============================================================================
  // END EDIT SECTION
  // ============================================================================

  console.log("✅ Feedback logged successfully!");
  console.log(`   ID: ${feedback.id}`);
  console.log(`   Actor: ${feedback.actor}`);
  console.log(`   Action: ${feedback.action}`);
  console.log(`   Task: ${feedback.taskId || "N/A"}`);
  console.log(`   Status: ${feedback.status || "N/A"}`);
  console.log(`   Created: ${feedback.createdAt}\n`);
}

logFeedback().catch(console.error);

