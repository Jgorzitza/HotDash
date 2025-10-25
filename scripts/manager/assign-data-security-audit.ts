/**
 * Assign SECURITY-AUDIT-REDO-001 to DATA agent
 */

import "dotenv/config";
import { assignTask } from "../../app/services/tasks.server";

async function assignDataSecurityAudit() {
  console.log("📝 Assigning SECURITY-AUDIT-REDO-001 to DATA...\n");

  const task = await assignTask({
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

Validate or correct previous findings based on MCP-verified current best practices.

Previous Findings to Re-verify:
1. Chatwoot webhook dev mode HMAC bypass
2. Console logging patterns
3. PII handling
4. ABAC configuration
5. RLS policies
6. Secret management

For each finding:
- Use MCP tools to verify against current docs
- Confirm recommendation is still valid
- Update if practices have changed
- Document evidence in JSONL`,
    acceptanceCriteria: [
      "MCP Evidence JSONL files created BEFORE starting",
      "Shopify Dev MCP used for Shopify security patterns",
      "Context7 MCP used for library security patterns",
      "All recommendations verified against current docs (not training data)",
      "Previous audit findings validated or corrected with evidence",
      "Security recommendations are current (2025 standards)",
      "Each finding has MCP evidence URL in JSONL",
      "Updated security audit report created"
    ],
    allowedPaths: ["artifacts/data/**", "docs/security/**"],
    priority: "P0",
    estimatedHours: 2
  });

  console.log(`✅ Task assigned successfully!`);
  console.log(`   ID: ${task.id}`);
  console.log(`   TaskId: ${task.taskId}`);
  console.log(`   Status: ${task.status}`);
  console.log(`   Assigned: ${task.assignedAt.toISOString()}`);
  
  console.log("\nDATA agent can query with:");
  console.log(`  npx tsx --env-file=.env scripts/agent/get-my-tasks.ts data`);
}

assignDataSecurityAudit().catch(console.error);

