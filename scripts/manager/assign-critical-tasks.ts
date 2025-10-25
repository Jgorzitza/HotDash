#!/usr/bin/env tsx
/**
 * Critical Task Assignment for Growth Engine Completion
 * 
 * Focus on the critical gaps identified:
 * 1. Integration Testing (QA Helper)
 * 2. Production Deployment (Engineer) 
 * 3. Performance Optimization (Data/Analytics)
 * 4. Documentation (Pilot)
 */

import "dotenv/config";
import { assignTask } from "../../app/services/tasks.server";
import { logDecision } from "../../app/services/decisions.server";

async function assignCriticalTasks() {
  console.log("🎯 ASSIGNING CRITICAL TASKS FOR GROWTH ENGINE COMPLETION");
  console.log("=".repeat(80));

  const tasks = [
    // ============================================================================
    // QA HELPER AGENT - INTEGRATION TESTING (P0)
    // ============================================================================
    {
      assignedBy: "manager",
      assignedTo: "qa-helper",
      taskId: "QA-INTEGRATION-001",
      title: "Growth Engine End-to-End Integration Testing",
      description: "Test complete Growth Engine flow: telemetry → action queue → approval → execution. Verify all UI components work with real data and HITL approval workflow functions correctly.",
      acceptanceCriteria: [
        "Test telemetry pipeline data flow from GSC/GA4 to action queue",
        "Verify action queue ranking algorithm works correctly", 
        "Test approval drawer UI with real approval data",
        "Test HITL approval workflow end-to-end",
        "Verify action execution and audit trail",
        "Test error handling and rollback scenarios",
        "Document all test results and any issues found"
      ],
      allowedPaths: ["app/components/growth-engine/*", "app/lib/growth-engine/*", "app/routes/api.growth-engine.*", "app/services/ai-customer/*"],
      priority: "P0",
      phase: "Phase 9",
      estimatedHours: 8,
      dependencies: [],
      blocks: [],
      evidenceUrl: "artifacts/qa-helper/growth-engine-integration-testing.md"
    },
    {
      assignedBy: "manager", 
      assignedTo: "qa-helper",
      taskId: "QA-UI-001",
      title: "Growth Engine UI Component Testing",
      description: "Comprehensive testing of all UI components for approval queue drawer and action queue dashboard. Test with real data, edge cases, and user interactions.",
      acceptanceCriteria: [
        "Test ApprovalsDrawer.tsx with various approval states",
        "Test ActionQueueTile.tsx with different action types", 
        "Test ActionQueueCard.tsx with GA4 attribution tracking",
        "Test approval workflow UI interactions",
        "Test error states and loading states",
        "Test responsive design and accessibility",
        "Document UI testing results and recommendations"
      ],
      allowedPaths: ["app/components/approvals/*", "app/components/growth-engine/*", "app/components/ActionQueueCard.tsx", "app/components/ApprovalCard.tsx"],
      priority: "P0",
      phase: "Phase 9", 
      estimatedHours: 6,
      dependencies: [],
      blocks: [],
      evidenceUrl: "artifacts/qa-helper/ui-component-testing.md"
    },

    // ============================================================================
    // ENGINEER AGENT - PRODUCTION DEPLOYMENT (P0)
    // ============================================================================
    {
      assignedBy: "manager",
      assignedTo: "engineer", 
      taskId: "ENG-PRODUCTION-001",
      title: "Production Environment Setup with IPv6 Database Configuration",
      description: "Set up production environment with correct IPv6 database connections. Configure all Growth Engine components for production deployment.",
      acceptanceCriteria: [
        "Configure production database with IPv6 connections (not IPv4)",
        "Set up production environment variables and secrets",
        "Deploy Growth Engine backend services to production", 
        "Configure production monitoring and alerting",
        "Test production database connectivity and performance",
        "Document production deployment process and configuration"
      ],
      allowedPaths: ["app/db.server.ts", "app/config/database.ts", ".env.production", "supabase/migrations/*"],
      priority: "P0",
      phase: "Phase 9",
      estimatedHours: 6,
      dependencies: [],
      blocks: [],
      evidenceUrl: "artifacts/engineer/production-deployment.md"
    },
    {
      assignedBy: "manager",
      assignedTo: "engineer",
      taskId: "ENG-API-001", 
      title: "Growth Engine API Routes Production Testing",
      description: "Test all Growth Engine API routes in production environment. Verify endpoints work correctly with production data and configurations.",
      acceptanceCriteria: [
        "Test /api/growth-engine/action-queue endpoints",
        "Test /api/ceo-agent/execute-action endpoints",
        "Test /api/ai-customer/escalation endpoints", 
        "Test all approval workflow API endpoints",
        "Test error handling and rate limiting",
        "Document API testing results and performance metrics"
      ],
      allowedPaths: ["app/routes/api.growth-engine.*", "app/routes/api.ceo-agent.*", "app/routes/api.ai-customer.*"],
      priority: "P0",
      phase: "Phase 9",
      estimatedHours: 4,
      dependencies: ["ENG-PRODUCTION-001"],
      blocks: [],
      evidenceUrl: "artifacts/engineer/api-production-testing.md"
    },

    // ============================================================================
    // DATA AGENT - TELEMETRY OPTIMIZATION (P1)
    // ============================================================================
    {
      assignedBy: "manager",
      assignedTo: "data",
      taskId: "DATA-TELEMETRY-001",
      title: "Telemetry Pipeline Production Data Flow Testing",
      description: "Test and optimize the telemetry pipeline with real production data. Ensure GSC and GA4 data flows correctly to action queue.",
      acceptanceCriteria: [
        "Test GSC Bulk Export integration with real data",
        "Test GA4 Data API integration with real data",
        "Test Analytics Transform with production data",
        "Test Action Queue emission with real opportunities", 
        "Optimize data processing performance",
        "Document telemetry pipeline performance and accuracy"
      ],
      allowedPaths: ["app/lib/growth-engine/telemetry-pipeline.ts", "app/services/analytics/*"],
      priority: "P1",
      phase: "Phase 9",
      estimatedHours: 6,
      dependencies: [],
      blocks: [],
      evidenceUrl: "artifacts/data/telemetry-pipeline-testing.md"
    },
    {
      assignedBy: "manager",
      assignedTo: "data",
      taskId: "DATA-ANALYTICS-001",
      title: "Growth Engine Analytics Dashboard Implementation",
      description: "Create comprehensive analytics and reporting dashboard for Growth Engine performance. Track ROI, conversion rates, and system metrics.",
      acceptanceCriteria: [
        "Create Growth Engine performance dashboard",
        "Implement ROI tracking and attribution",
        "Set up conversion rate monitoring",
        "Create system health and performance reports",
        "Document analytics dashboard and reporting features"
      ],
      allowedPaths: ["app/components/analytics/*", "app/services/analytics/*", "app/lib/growth-engine/*"],
      priority: "P1",
      phase: "Phase 9",
      estimatedHours: 8,
      dependencies: ["DATA-TELEMETRY-001"],
      blocks: [],
      evidenceUrl: "artifacts/data/analytics-dashboard.md"
    },

    // ============================================================================
    // ANALYTICS AGENT - PERFORMANCE OPTIMIZATION (P1)
    // ============================================================================
    {
      assignedBy: "manager",
      assignedTo: "analytics",
      taskId: "ANALYTICS-PERFORMANCE-001",
      title: "Growth Engine Performance Analysis and Optimization",
      description: "Analyze Growth Engine performance and identify optimization opportunities. Improve system efficiency and ROI.",
      acceptanceCriteria: [
        "Analyze Growth Engine performance metrics",
        "Identify optimization opportunities",
        "Implement performance improvements",
        "Test optimization impact on ROI",
        "Document performance analysis and optimization results"
      ],
      allowedPaths: ["app/lib/growth-engine/*", "app/services/analytics/*", "app/components/analytics/*"],
      priority: "P1",
      phase: "Phase 9",
      estimatedHours: 6,
      dependencies: [],
      blocks: [],
      evidenceUrl: "artifacts/analytics/growth-engine-optimization.md"
    },
    {
      assignedBy: "manager",
      assignedTo: "analytics",
      taskId: "ANALYTICS-ATTRIBUTION-001",
      title: "Action Attribution and ROI Measurement System",
      description: "Implement comprehensive action attribution and ROI measurement system. Track the impact of Growth Engine actions on business metrics.",
      acceptanceCriteria: [
        "Implement action attribution tracking",
        "Set up ROI measurement for all action types",
        "Create attribution reports and dashboards",
        "Test attribution accuracy with real data",
        "Document attribution system and ROI measurement"
      ],
      allowedPaths: ["app/services/analytics/*", "app/components/analytics/*", "app/utils/analytics.ts"],
      priority: "P1",
      phase: "Phase 9",
      estimatedHours: 8,
      dependencies: [],
      blocks: [],
      evidenceUrl: "artifacts/analytics/action-attribution-system.md"
    },

    // ============================================================================
    // SUPPORT AGENT - SUPPORT ENHANCEMENT (P1)
    // ============================================================================
    {
      assignedBy: "manager",
      assignedTo: "support",
      taskId: "SUPPORT-ENHANCEMENT-001",
      title: "Growth Engine Support Agent Enhancement",
      description: "Enhance the Growth Engine Support Agent with advanced capabilities. Improve support automation and response quality.",
      acceptanceCriteria: [
        "Enhance Growth Engine Support Agent capabilities",
        "Implement advanced troubleshooting features",
        "Add performance monitoring and optimization",
        "Test support agent with real scenarios",
        "Document support agent enhancements and capabilities"
      ],
      allowedPaths: ["app/services/growth-engine-support-agent.ts", "app/services/ai-customer/*"],
      priority: "P1",
      phase: "Phase 9",
      estimatedHours: 6,
      dependencies: [],
      blocks: [],
      evidenceUrl: "artifacts/support/growth-engine-support-enhancement.md"
    },

    // ============================================================================
    // PILOT AGENT - DOCUMENTATION (P1)
    // ============================================================================
    {
      assignedBy: "manager",
      assignedTo: "pilot",
      taskId: "PILOT-DOCS-001",
      title: "Growth Engine Knowledge Base Integration",
      description: "Integrate Growth Engine documentation into the knowledge base system. Ensure all Growth Engine components are searchable and accessible.",
      acceptanceCriteria: [
        "Index all Growth Engine documentation",
        "Create searchable knowledge base entries",
        "Test knowledge base search functionality",
        "Integrate with existing KB system",
        "Document knowledge base integration and search capabilities"
      ],
      allowedPaths: ["docs/growth-engine/*", "app/services/kb-integration.server.ts", "scripts/agent/kb-search.ts"],
      priority: "P1",
      phase: "Phase 9",
      estimatedHours: 6,
      dependencies: [],
      blocks: [],
      evidenceUrl: "artifacts/pilot/growth-engine-knowledge-base.md"
    },
    {
      assignedBy: "manager",
      assignedTo: "pilot",
      taskId: "PILOT-PROCESS-001",
      title: "Growth Engine Process Documentation and Runbooks",
      description: "Create comprehensive process documentation and runbooks for Growth Engine operations. Ensure all processes are documented and repeatable.",
      acceptanceCriteria: [
        "Document Growth Engine operational processes",
        "Create runbooks for common scenarios",
        "Document troubleshooting procedures",
        "Create maintenance and update procedures",
        "Document process documentation and runbooks"
      ],
      allowedPaths: ["docs/runbooks/*", "docs/processes/*", "docs/growth-engine/*"],
      priority: "P1",
      phase: "Phase 9",
      estimatedHours: 8,
      dependencies: [],
      blocks: [],
      evidenceUrl: "artifacts/pilot/growth-engine-process-documentation.md"
    }
  ];

  console.log(`\n📋 Assigning ${tasks.length} critical tasks to agents...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const task of tasks) {
    try {
      const result = await assignTask(task);
      console.log(`✅ ${task.taskId}: ${task.title} → ${task.assignedTo}`);
      successCount++;
    } catch (error) {
      console.error(`❌ ${task.taskId}: ${task.title} → ${task.assignedTo} (${error})`);
      errorCount++;
    }
  }

  // Log the critical task assignment
  await logDecision({
    scope: "build",
    actor: "manager",
    action: "critical_task_assignment",
    rationale: "Assigned critical tasks to complete Growth Engine implementation. Focus on integration testing, production deployment, and optimization.",
    payload: {
      totalTasks: tasks.length,
      successCount,
      errorCount,
      taskBreakdown: {
        "qa-helper": tasks.filter(t => t.assignedTo === "qa-helper").length,
        "engineer": tasks.filter(t => t.assignedTo === "engineer").length,
        "data": tasks.filter(t => t.assignedTo === "data").length,
        "analytics": tasks.filter(t => t.assignedTo === "analytics").length,
        "support": tasks.filter(t => t.assignedTo === "support").length,
        "pilot": tasks.filter(t => t.assignedTo === "pilot").length
      },
      focusAreas: [
        "Integration testing (QA Helper)",
        "Production deployment (Engineer)",
        "Telemetry optimization (Data)",
        "Performance analysis (Analytics)",
        "Support enhancement (Support)",
        "Documentation (Pilot)"
      ]
    }
  });

  console.log("\n" + "=".repeat(80));
  console.log(`📊 CRITICAL TASK ASSIGNMENT SUMMARY`);
  console.log(`✅ Successfully assigned: ${successCount} tasks`);
  console.log(`❌ Failed assignments: ${errorCount} tasks`);
  console.log(`📋 Total tasks: ${tasks.length}`);
  console.log("\n🎯 CRITICAL FOCUS AREAS:");
  console.log("• QA Helper: Integration testing and UI testing");
  console.log("• Engineer: Production deployment with IPv6 configuration");
  console.log("• Data: Telemetry pipeline optimization and analytics dashboard");
  console.log("• Analytics: Performance analysis and attribution system");
  console.log("• Support: Support agent enhancement");
  console.log("• Pilot: Knowledge base integration and process documentation");
  console.log("\n🚀 All agents now have critical tasks to complete Growth Engine!");
}

assignCriticalTasks().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
