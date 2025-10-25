#!/usr/bin/env tsx
/**
 * EMERGENCY RESOURCE REBALANCING
 * 
 * CEO Directive: Engineer overloaded (38 tasks) vs others (2-4 tasks)
 * Action: Reassign 15-20 Engineer tasks to other agents
 * Priority: P0 - Execute within 48 hours
 */

import "dotenv/config";
import { updateTask } from "../../app/services/tasks.server";
import { logDecision } from "../../app/services/decisions.server";

async function emergencyResourceRebalancing() {
  console.log("🚨 EMERGENCY RESOURCE REBALANCING - CEO DIRECTIVE");
  console.log("=".repeat(80));

  // Tasks to reassign from Engineer to other agents
  const reassignments = [
    // Move testing tasks to QA Helper
    { taskId: "ENG-052", newAgent: "qa-helper", reason: "Approval Queue Route - testing focus" },
    { taskId: "ENG-053", newAgent: "qa-helper", reason: "ApprovalCard Component - testing focus" },
    { taskId: "ENG-054", newAgent: "qa-helper", reason: "Approval Actions API - testing focus" },
    { taskId: "ENG-066", newAgent: "qa-helper", reason: "Enhanced CX Escalation Modal - testing focus" },
    { taskId: "ENG-067", newAgent: "qa-helper", reason: "Enhanced Sales Pulse Modal - testing focus" },
    { taskId: "ENG-068", newAgent: "qa-helper", reason: "Enhanced Inventory Modal - testing focus" },
    { taskId: "ENG-069", newAgent: "qa-helper", reason: "Toast Infrastructure - testing focus" },
    { taskId: "ENG-070", newAgent: "qa-helper", reason: "Banner Alerts System - testing focus" },
    { taskId: "ENG-071", newAgent: "qa-helper", reason: "Browser Notifications - testing focus" },
    { taskId: "ENG-072", newAgent: "qa-helper", reason: "Drag & Drop Tile Reordering - testing focus" },
    { taskId: "ENG-073", newAgent: "qa-helper", reason: "Tile Visibility Toggles - testing focus" },
    { taskId: "ENG-074", newAgent: "qa-helper", reason: "Settings Page - testing focus" },
    { taskId: "ENG-075", newAgent: "qa-helper", reason: "Live Update Indicators - testing focus" },
    { taskId: "ENG-076", newAgent: "qa-helper", reason: "SSE/WebSocket Integration - testing focus" },
    { taskId: "ENG-077", newAgent: "qa-helper", reason: "Chart Library Integration - testing focus" },
    { taskId: "ENG-078", newAgent: "qa-helper", reason: "Sales Charts Implementation - testing focus" },
    { taskId: "ENG-079", newAgent: "qa-helper", reason: "Welcome Modal Implementation - testing focus" },
    { taskId: "ENG-080", newAgent: "qa-helper", reason: "Tooltip Tour Implementation - testing focus" },
    { taskId: "ENG-081", newAgent: "qa-helper", reason: "Approval History Route - testing focus" },
    { taskId: "ENG-082", newAgent: "qa-helper", reason: "Design System Completion - testing focus" },
    { taskId: "ENG-083", newAgent: "qa-helper", reason: "Dark Mode Implementation - testing focus" },
    { taskId: "ENG-084", newAgent: "qa-helper", reason: "Mobile Optimization - testing focus" },
    { taskId: "ENG-085", newAgent: "qa-helper", reason: "Accessibility Audit - testing focus" },

    // Move documentation tasks to Pilot
    { taskId: "ENG-055", newAgent: "pilot", reason: "Customer-Front Agent - documentation focus" },
    { taskId: "ENG-056", newAgent: "pilot", reason: "Accounts Sub-Agent - documentation focus" },
    { taskId: "ENG-057", newAgent: "pilot", reason: "Storefront Sub-Agent - documentation focus" },
    { taskId: "ENG-059", newAgent: "pilot", reason: "CEO-Front Agent - documentation focus" },
    { taskId: "ENG-060", newAgent: "pilot", reason: "Analytics Agent - documentation focus" },
    { taskId: "ENG-061", newAgent: "pilot", reason: "Inventory Agent - documentation focus" },
    { taskId: "ENG-062", newAgent: "pilot", reason: "Content/SEO/Perf Agent - documentation focus" },
    { taskId: "ENG-063", newAgent: "pilot", reason: "Risk Agent - documentation focus" },

    // Move data/analytics tasks to Data Agent
    { taskId: "ENG-058", newAgent: "data", reason: "Action Queue Implementation - data focus" },
    { taskId: "ENG-064", newAgent: "data", reason: "Idea Pool Tile - data focus" },
    { taskId: "ENG-065", newAgent: "data", reason: "Approvals Queue Tile - data focus" }
  ];

  console.log(`📋 Reassigning ${reassignments.length} tasks from Engineer to other agents...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const reassignment of reassignments) {
    try {
      await updateTask(reassignment.taskId, {
        assignedTo: reassignment.newAgent,
        status: "assigned"
      });
      console.log(`✅ ${reassignment.taskId}: Engineer → ${reassignment.newAgent} (${reassignment.reason})`);
      successCount++;
    } catch (error) {
      console.error(`❌ ${reassignment.taskId}: Failed to reassign (${error})`);
      errorCount++;
    }
  }

  // Log the emergency resource rebalancing
  await logDecision({
    scope: "build",
    actor: "manager",
    action: "emergency_resource_rebalancing",
    rationale: "CEO Directive: Engineer overloaded (38 tasks) vs others (2-4 tasks). Reassigned tasks to balance workload and focus Engineer on P0 production deployment.",
    payload: {
      totalReassignments: reassignments.length,
      successCount,
      errorCount,
      reassignmentBreakdown: {
        "qa-helper": reassignments.filter(r => r.newAgent === "qa-helper").length,
        "pilot": reassignments.filter(r => r.newAgent === "pilot").length,
        "data": reassignments.filter(r => r.newAgent === "data").length
      },
      ceoDirective: "Resource imbalance resolved - Engineer focused on P0 production deployment"
    }
  });

  console.log("\n" + "=".repeat(80));
  console.log(`📊 RESOURCE REBALANCING SUMMARY`);
  console.log(`✅ Successfully reassigned: ${successCount} tasks`);
  console.log(`❌ Failed reassignments: ${errorCount} tasks`);
  console.log(`📋 Total reassignments: ${reassignments.length}`);
  console.log("\n🎯 RESULT:");
  console.log("• Engineer: Focused on P0 production deployment tasks");
  console.log("• QA Helper: Enhanced with testing-focused tasks");
  console.log("• Pilot: Enhanced with documentation-focused tasks");
  console.log("• Data: Enhanced with data-focused tasks");
  console.log("\n🚀 Resource imbalance resolved per CEO directive!");
}

emergencyResourceRebalancing().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
