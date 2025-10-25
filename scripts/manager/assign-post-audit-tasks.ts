/**
 * Assign follow-up tasks after DATA security audit review
 */

import "dotenv/config";
import { assignTask } from "../../app/services/tasks.server";

async function assignPostAuditTasks() {
  console.log("📝 Assigning post-audit follow-up tasks...\n");

  // 1. ENGINEER - Fix SQL injection vulnerabilities (P0)
  console.log("1. Assigning ENG-SQL-INJECTION-FIX-001 to ENGINEER...");
  const sqlTask = await assignTask({
    assignedBy: "manager",
    assignedTo: "engineer",
    taskId: "ENG-SQL-INJECTION-FIX-001",
    title: "Fix SQL Injection Vulnerabilities",
    description: `Fix 3 critical SQL injection vulnerabilities found in DATA security audit.

SOURCE: artifacts/data/2025-10-24/mcp/SECURITY-AUDIT-FINAL-REPORT.md

VULNERABILITIES:

1. **app/services/knowledge/search.ts** (lines 63-85, 130-155)
   - Uses \`$queryRawUnsafe\` with string concatenation for embedding vector
   - Risk: SQL injection via malicious embedding values
   - Severity: HIGH

2. **app/services/security/database-security.ts** (lines 300-306)
   - Uses \`$executeRawUnsafe\` for dynamic table names in \`createSecurityBackup()\`
   - Risk: SQL injection via table name manipulation
   - Severity: MEDIUM

3. **app/routes/api.growth-engine.specialist-agents.ts**
   - Uses \`$queryRawUnsafe\` in \`createDbShim()\`
   - Risk: SQL injection if params not properly sanitized
   - Severity: MEDIUM

REMEDIATION:
- Replace \`$queryRawUnsafe\` with \`$queryRaw\` (parameterized queries)
- Replace \`$executeRawUnsafe\` with \`$executeRaw\` (parameterized queries)
- Prefer Prisma ORM methods over raw SQL where possible
- Add input validation for all user-supplied data

MCP Requirements:
- Use Context7 MCP to verify Prisma security best practices
- Use Context7 MCP to verify parameterized query patterns
- Create MCP Evidence JSONL: artifacts/engineer/$(date +%Y-%m-%d)/mcp/ENG-SQL-INJECTION-FIX-001.jsonl

CRITICAL: This MUST be fixed before production launch.`,
    acceptanceCriteria: [
      "All 3 SQL injection vulnerabilities fixed",
      "$queryRawUnsafe replaced with $queryRaw (parameterized)",
      "$executeRawUnsafe replaced with $executeRaw (parameterized)",
      "Input validation added for user-supplied data",
      "Tests pass",
      "Security re-scan shows no SQL injection vulnerabilities",
      "MCP Evidence JSONL created"
    ],
    allowedPaths: [
      "app/services/knowledge/search.ts",
      "app/services/security/database-security.ts",
      "app/routes/api.growth-engine.specialist-agents.ts",
      "tests/**",
      "artifacts/engineer/**"
    ],
    priority: "P0",
    estimatedHours: 2
  });
  console.log(`   ✅ Assigned (Task ID: ${sqlTask.id})\n`);

  // 2. DATA - Analytics Dashboard Enhancement
  console.log("2. Assigning DATA-ANALYTICS-DASHBOARD-001 to DATA...");
  const dataTask = await assignTask({
    assignedBy: "manager",
    assignedTo: "data",
    taskId: "DATA-ANALYTICS-DASHBOARD-001",
    title: "Analytics Dashboard Enhancement & Validation",
    description: `Enhance and validate analytics dashboards for production launch.

OBJECTIVE: Ensure all analytics dashboards are accurate, performant, and ready for launch.

TASKS:

1. **Validate Existing Dashboards**
   - Growth Engine metrics dashboard
   - Inventory health dashboard
   - Customer engagement dashboard
   - Revenue analytics dashboard

2. **Data Quality Checks**
   - Verify metric calculations are correct
   - Check for data inconsistencies
   - Validate aggregation logic
   - Test edge cases (zero data, missing data, etc.)

3. **Performance Optimization**
   - Identify slow queries
   - Add database indexes if needed
   - Optimize aggregation queries
   - Cache frequently accessed metrics

4. **Documentation**
   - Document metric definitions
   - Create data dictionary
   - Document calculation formulas
   - Add troubleshooting guide

MCP Requirements:
- Use Context7 MCP to verify analytics best practices
- Use codebase-retrieval to find all dashboard components
- Create MCP Evidence JSONL: artifacts/data/$(date +%Y-%m-%d)/mcp/DATA-ANALYTICS-DASHBOARD-001.jsonl

DELIVERABLES:
- Validation report for each dashboard
- Performance optimization recommendations
- Data quality report
- Analytics documentation`,
    acceptanceCriteria: [
      "All 4 dashboards validated",
      "Data quality report created",
      "Performance optimization recommendations documented",
      "Metric definitions documented",
      "Data dictionary created",
      "No data inconsistencies found",
      "MCP Evidence JSONL created"
    ],
    allowedPaths: [
      "app/routes/analytics/**",
      "app/components/analytics/**",
      "app/services/analytics/**",
      "docs/analytics/**",
      "artifacts/data/**"
    ],
    priority: "P1",
    estimatedHours: 3
  });
  console.log(`   ✅ Assigned (Task ID: ${dataTask.id})\n`);

  console.log("✅ Post-audit tasks assigned successfully!\n");
  console.log("Summary:");
  console.log(`  - ENGINEER: ENG-SQL-INJECTION-FIX-001 (P0, 2h) - Fix SQL injection vulnerabilities`);
  console.log(`  - DATA: DATA-ANALYTICS-DASHBOARD-001 (P1, 3h) - Analytics dashboard enhancement`);
}

assignPostAuditTasks().catch(console.error);

