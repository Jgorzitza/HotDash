/**
 * Assign tasks to all idle agents
 * Usage: npx tsx --env-file=.env scripts/manager/assign-all-idle-agents.ts
 */

import "dotenv/config";
import { assignTask } from "../../app/services/tasks.server";

async function assignAllIdleAgents() {
  console.log("📋 Assigning tasks to all idle agents...\n");

  const assignments = [
    // 1. ENGINEER - Fix build failures (P0)
    {
      assignedBy: "manager",
      assignedTo: "engineer",
      taskId: "ENG-BUILD-FIX-001",
      title: "Fix Build Failures (package.json + analytics.ts)",
      description: `Fix critical build failures blocking QA and QA-HELPER:

1. Remove duplicate key in package.json: 'dev-kb:query'
2. Fix duplicate exports in app/utils/analytics.ts
3. Verify build passes without errors
4. Run tests to confirm no regressions

MCP Requirements:
- Use Context7 MCP to verify package.json best practices
- Use Context7 MCP to verify TypeScript export patterns
- Create MCP Evidence JSONL: artifacts/engineer/$(date +%Y-%m-%d)/mcp/ENG-BUILD-FIX-001.jsonl

Unblocks: QA-004, QA-UI-001 (3 tasks total)`,
      acceptanceCriteria: [
        "Duplicate package.json key removed",
        "Duplicate exports in analytics.ts fixed",
        "Build passes: npm run build succeeds",
        "Tests pass: npm test succeeds",
        "QA and QA-HELPER unblocked",
        "MCP Evidence JSONL created"
      ],
      allowedPaths: ["package.json", "app/utils/analytics.ts", "tests/**", "artifacts/engineer/**"],
      priority: "P0" as const,
      estimatedHours: 1
    },

    // 2. DATA - Redo security audits with MCP (P0)
    {
      assignedBy: "manager",
      assignedTo: "data",
      taskId: "SECURITY-AUDIT-REDO-001",
      title: "Redo Security Audits with MCP Verification",
      description: `CRITICAL: Redo SECURITY-AUDIT-001 and SECURITY-AUDIT-002 WITH MCP TOOLS.

Previous audits violated CRITICAL_MCP_ENFORCEMENT.md by not using MCP tools.

MCP Requirements (MANDATORY):
1. Create MCP Evidence directory FIRST: artifacts/data/$(date +%Y-%m-%d)/mcp/
2. Use Shopify Dev MCP for Shopify security patterns
3. Use Context7 MCP for library security patterns (React Router, Prisma, TypeScript)
4. Verify ALL recommendations against current official docs
5. Log each MCP call to JSONL: artifacts/data/$(date +%Y-%m-%d)/mcp/SECURITY-AUDIT-REDO-001.jsonl

Tasks to redo:
- SECURITY-AUDIT-001: General security audit
- SECURITY-AUDIT-002: Console logging review

Validate or correct previous findings based on MCP-verified current best practices.`,
      acceptanceCriteria: [
        "MCP Evidence JSONL files created BEFORE starting",
        "Shopify Dev MCP used for Shopify security patterns",
        "Context7 MCP used for library security patterns",
        "All recommendations verified against current docs (not training data)",
        "Previous audit findings validated or corrected with evidence",
        "Security recommendations are current (2025 standards)"
      ],
      allowedPaths: ["artifacts/data/**", "docs/security/**"],
      priority: "P0" as const,
      estimatedHours: 2
    },

    // 3. DESIGNER - UI/UX Launch Readiness Review (P1)
    {
      assignedBy: "manager",
      assignedTo: "designer",
      taskId: "DESIGNER-LAUNCH-REVIEW-001",
      title: "UI/UX Launch Readiness Review",
      description: `Review all UI components for launch readiness.

Focus Areas:
1. Polaris component usage consistency
2. Responsive design across breakpoints
3. Accessibility (WCAG 2.1 AA compliance)
4. Visual consistency (colors, spacing, typography)
5. Error states and loading states
6. Empty states and placeholder content

MCP Requirements:
- Use Shopify Dev MCP to verify Polaris best practices
- Create MCP Evidence JSONL: artifacts/designer/$(date +%Y-%m-%d)/mcp/DESIGNER-LAUNCH-REVIEW-001.jsonl

Deliverables:
- UI/UX audit report with screenshots
- List of issues found (P0/P1/P2)
- Recommendations for improvements`,
      acceptanceCriteria: [
        "All major UI routes reviewed",
        "Polaris usage verified via Shopify Dev MCP",
        "Accessibility issues documented",
        "Visual consistency issues documented",
        "Launch readiness report created",
        "MCP Evidence JSONL created"
      ],
      allowedPaths: ["artifacts/designer/**", "docs/design/**"],
      priority: "P1" as const,
      estimatedHours: 2
    },

    // 4. ANALYTICS - Launch Metrics Monitoring (P1)
    {
      assignedBy: "manager",
      assignedTo: "analytics",
      taskId: "ANALYTICS-LAUNCH-MONITOR-001",
      title: "Launch Metrics Monitoring Setup",
      description: `Set up real-time monitoring for launch metrics.

Metrics to Monitor:
1. Core Web Vitals (LCP, FID, CLS)
2. Page load times (P50, P95, P99)
3. Error rates (client + server)
4. User engagement (sessions, bounce rate)
5. Conversion funnel (signup, activation)

MCP Requirements:
- Use Context7 MCP to verify Google Analytics 4 patterns
- Create MCP Evidence JSONL: artifacts/analytics/$(date +%Y-%m-%d)/mcp/ANALYTICS-LAUNCH-MONITOR-001.jsonl

Deliverables:
- Real-time dashboard for launch metrics
- Alert thresholds configured
- Monitoring runbook`,
      acceptanceCriteria: [
        "Real-time metrics dashboard created",
        "Alert thresholds configured",
        "GA4 integration verified via Context7 MCP",
        "Monitoring runbook documented",
        "MCP Evidence JSONL created"
      ],
      allowedPaths: ["app/components/analytics/**", "app/routes/analytics/**", "artifacts/analytics/**"],
      priority: "P1" as const,
      estimatedHours: 2
    },

    // 5. INVENTORY - ROP Calculations & Monitoring (P1)
    {
      assignedBy: "manager",
      assignedTo: "inventory",
      taskId: "INVENTORY-ROP-MONITOR-001",
      title: "ROP Calculations & Inventory Health Monitoring",
      description: `Implement automated ROP (Reorder Point) calculations and monitoring.

Features:
1. Calculate ROP = Lead-time demand + Safety stock
2. Monitor inventory levels vs ROP
3. Generate reorder alerts
4. Track stockout risk
5. Emergency sourcing recommendations

MCP Requirements:
- Use Context7 MCP to verify calculation patterns
- Create MCP Evidence JSONL: artifacts/inventory/$(date +%Y-%m-%d)/mcp/INVENTORY-ROP-MONITOR-001.jsonl

Deliverables:
- ROP calculation service
- Inventory health dashboard
- Reorder alert system`,
      acceptanceCriteria: [
        "ROP calculations implemented and tested",
        "Inventory health dashboard created",
        "Reorder alerts configured",
        "Calculation patterns verified via Context7 MCP",
        "MCP Evidence JSONL created"
      ],
      allowedPaths: ["app/services/inventory/**", "app/components/inventory/**", "artifacts/inventory/**"],
      priority: "P1" as const,
      estimatedHours: 2
    },

    // 6. SEO - Post-Launch SEO Monitoring (P1)
    {
      assignedBy: "manager",
      assignedTo: "seo",
      taskId: "SEO-LAUNCH-MONITOR-001",
      title: "Post-Launch SEO Monitoring & Optimization",
      description: `Set up SEO monitoring and optimization for launch.

Focus Areas:
1. Meta tags optimization (title, description, OG tags)
2. Structured data (JSON-LD)
3. Sitemap generation
4. Robots.txt configuration
5. Core Web Vitals impact on SEO
6. Mobile-first indexing readiness

MCP Requirements:
- Use web search to verify current SEO best practices (2025)
- Create MCP Evidence JSONL: artifacts/seo/$(date +%Y-%m-%d)/mcp/SEO-LAUNCH-MONITOR-001.jsonl

Deliverables:
- SEO audit report
- Optimization recommendations
- Monitoring dashboard`,
      acceptanceCriteria: [
        "SEO audit completed",
        "Meta tags optimized",
        "Structured data implemented",
        "SEO best practices verified via web search",
        "Monitoring dashboard created",
        "MCP Evidence JSONL created"
      ],
      allowedPaths: ["app/routes/**", "app/components/**", "public/**", "artifacts/seo/**"],
      priority: "P1" as const,
      estimatedHours: 2
    },

    // 7. CONTENT - Help Documentation Completion (P1)
    {
      assignedBy: "manager",
      assignedTo: "content",
      taskId: "CONTENT-HELP-DOCS-001",
      title: "Complete Help Documentation for Launch",
      description: `Complete comprehensive help documentation for launch.

Documentation Needed:
1. Getting Started Guide
2. Feature Tutorials (step-by-step)
3. FAQ (common questions)
4. Troubleshooting Guide
5. Video Tutorials (scripts)
6. API Documentation (if applicable)

MCP Requirements:
- Use web search to verify documentation best practices
- Create MCP Evidence JSONL: artifacts/content/$(date +%Y-%m-%d)/mcp/CONTENT-HELP-DOCS-001.jsonl

Deliverables:
- Complete help documentation
- Video tutorial scripts
- FAQ database`,
      acceptanceCriteria: [
        "Getting Started Guide complete",
        "Feature tutorials complete",
        "FAQ complete (min 20 questions)",
        "Troubleshooting guide complete",
        "Documentation best practices verified",
        "MCP Evidence JSONL created"
      ],
      allowedPaths: ["docs/help/**", "app/routes/help/**", "artifacts/content/**"],
      priority: "P1" as const,
      estimatedHours: 3
    },

    // 8. PRODUCT - Launch Coordination & Stakeholder Comms (P1)
    {
      assignedBy: "manager",
      assignedTo: "product",
      taskId: "PRODUCT-LAUNCH-COORD-001",
      title: "Launch Coordination & Stakeholder Communication",
      description: `Coordinate launch activities and stakeholder communication.

Responsibilities:
1. Launch checklist verification
2. Stakeholder communication plan
3. Launch timeline coordination
4. Risk assessment and mitigation
5. Success metrics tracking
6. Post-launch retrospective planning

Deliverables:
- Launch readiness report
- Stakeholder communication plan
- Risk mitigation plan
- Success metrics dashboard`,
      acceptanceCriteria: [
        "Launch checklist 100% complete",
        "Stakeholder communication plan created",
        "Launch timeline finalized",
        "Risk assessment complete",
        "Success metrics dashboard ready",
        "Post-launch retrospective scheduled"
      ],
      allowedPaths: ["docs/product/**", "artifacts/product/**"],
      priority: "P1" as const,
      estimatedHours: 2
    }
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const assignment of assignments) {
    try {
      console.log(`\n📝 Assigning ${assignment.taskId} to ${assignment.assignedTo.toUpperCase()}...`);
      const task = await assignTask(assignment);
      console.log(`   ✅ Success! Task ID: ${task.id}, Status: ${task.status}`);
      successCount++;
    } catch (error) {
      console.error(`   ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      errorCount++;
    }
  }

  console.log(`\n\n📊 Assignment Summary:`);
  console.log(`   Total tasks: ${assignments.length}`);
  console.log(`   Successful: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  
  if (successCount === assignments.length) {
    console.log(`\n✅ ALL AGENTS NOW HAVE WORK ASSIGNED!\n`);
  } else {
    console.log(`\n⚠️  Some assignments failed. Review errors above.\n`);
  }
}

assignAllIdleAgents().catch(console.error);

