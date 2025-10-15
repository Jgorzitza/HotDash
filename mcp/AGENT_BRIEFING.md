# Agent Briefing: MCP Directory Protection

**TO:** All AI Agents (Cleanup, Refactoring, Documentation, QA, etc.)  
**FROM:** MCP Setup Process  
**DATE:** 2025-10-15  
**RE:** Critical Infrastructure - MCP Tools Directory

---

## 🚨 IMMEDIATE ACTION REQUIRED: READ BEFORE ANY CLEANUP

The `mcp/` directory was created on 2025-10-15 and contains **critical infrastructure documentation** for 6 active MCP (Model Context Protocol) servers.

**This directory is PROTECTED and must NOT be removed, archived, or modified without explicit approval.**

---

## What You Need to Know

### 1. What is MCP?

Model Context Protocol (MCP) enables AI agents to interact with external tools and services. This codebase uses 6 active MCP servers:

1. **GitHub Official** - Repository management, issues, PRs
2. **Context7** - Semantic code search (running on port 3001)
3. **Supabase** - Database operations
4. **Fly.io** - Deployment management (running on port 8080)
5. **Shopify** - E-commerce operations
6. **Google Analytics** - Analytics and reporting

**All 6 servers are currently OPERATIONAL.**

### 2. Why This Directory Exists

The `mcp/` directory contains comprehensive documentation that enables AI agents to:
- Understand when to use each MCP tool
- Find examples of common workflows
- Troubleshoot MCP server issues
- Verify server status
- Learn best practices

**Without this documentation, AI agents lose critical capabilities.**

### 3. Protection Status

✅ **CI Enforcement Active:**
- `scripts/policy/check-docs.mjs` - Line 16: `/^mcp\/.+\.md$/`
- `Dangerfile.js` - Line 18: `/^mcp\/.+\.md$/`

✅ **Documented in Governance:**
- `docs/RULES.md` - Line 21: `mcp/**` in allow-list
- `docs/NORTH_STAR.md` - Lines 9, 40-44: MCP architecture
- `docs/OPERATING_MODEL.md` - Lines 35-38: MCP guardrails
- `README.md` - Lines 74-104: MCP tools section

✅ **Verification Available:**
```bash
./mcp/test-mcp-tools.sh  # Quick test - all 6 servers should be active
```

---

## For Cleanup Agents

### DO NOT:
- ❌ Delete any files in `mcp/` directory
- ❌ Move files to `docs/_archive/`
- ❌ Mark as "stale" or "cleanup candidate"
- ❌ Suggest removal in cleanup reports
- ❌ Archive or relocate the directory

### INSTEAD:
- ✅ Skip the `mcp/` directory entirely
- ✅ Report it as "PROTECTED INFRASTRUCTURE - SKIPPED"
- ✅ Verify servers are operational: `./mcp/test-mcp-tools.sh`

### Sample Report Entry:
```markdown
### MCP Directory (`mcp/`)
**Status:** PROTECTED INFRASTRUCTURE - SKIPPED
**Reason:** Active MCP tools documentation (6 servers operational)
**CI Protection:** Verified in check-docs.mjs, Dangerfile.js, RULES.md
**Verification:** Ran ./mcp/test-mcp-tools.sh - All 6 servers active
**Action:** None - directory preserved as critical infrastructure
```

---

## For Documentation Agents

### You MAY:
- ✅ Read and reference MCP documentation
- ✅ Add new documentation files (they're in the allow-list)
- ✅ Fix typos or broken links
- ✅ Update server status information
- ✅ Add usage examples or patterns

### You MUST:
- ⚠️ Verify changes don't break CI policy
- ⚠️ Test scripts after modifications
- ⚠️ Maintain protection notices
- ⚠️ Keep references in core docs updated

---

## For QA/Testing Agents

### Verification Steps:
```bash
# 1. Quick test (recommended)
./mcp/test-mcp-tools.sh

# 2. Comprehensive verification
./mcp/verify-mcp-servers.sh

# 3. Check CI policy
node scripts/policy/check-docs.mjs
```

**Expected Results:**
- All 6 MCP servers show as "Ready to use"
- CI policy check passes
- No violations reported

---

## For Refactoring Agents

### Before Any Changes:
1. ✅ Check if `mcp/` is affected
2. ✅ Verify it's in CI allow-list (`docs/RULES.md`)
3. ✅ Confirm servers are operational
4. ✅ Review protection notices

### If Refactoring Affects MCP:
- Consult `mcp/PROTECTION_NOTICE.md`
- Verify changes with `./mcp/test-mcp-tools.sh`
- Update documentation if needed
- Maintain CI protection

---

## Emergency Recovery

If files are accidentally removed:

```bash
# Restore from git history
git checkout HEAD -- mcp/

# Verify restoration
./mcp/test-mcp-tools.sh

# Report incident in feedback log
```

---

## Key Files in MCP Directory

| File | Purpose | Can Modify? |
|------|---------|-------------|
| README.md | Main entry point | ✅ Yes (carefully) |
| ALL_SYSTEMS_GO.md | Ready-to-use examples | ✅ Yes |
| QUICK_REFERENCE.md | Tool reference | ✅ Yes |
| USAGE_EXAMPLES.md | Real-world patterns | ✅ Yes |
| SERVER_STATUS.md | Current status | ✅ Yes (update as needed) |
| SETUP.md | Setup instructions | ✅ Yes (carefully) |
| INDEX.md | Navigation guide | ✅ Yes |
| MCP_SETUP_SUMMARY.md | Overview | ✅ Yes |
| PROTECTION_NOTICE.md | Protection details | ⚠️ Carefully |
| AGENT_BRIEFING.md | This file | ⚠️ Carefully |
| mcp-config.json | Server config | ⚠️ Expert only |
| test-mcp-tools.sh | Quick test script | ⚠️ Expert only |
| verify-mcp-servers.sh | Full verification | ⚠️ Expert only |

---

## Quick Reference Card

**Directory:** `mcp/`  
**Status:** PROTECTED INFRASTRUCTURE  
**Servers:** 6 active MCP servers  
**CI Protected:** YES (multiple files)  
**Test Command:** `./mcp/test-mcp-tools.sh`  
**Action for Cleanup:** SKIP - Do not remove  
**Action for Docs:** May update carefully  
**Action for QA:** Verify with test script  
**Action for Refactor:** Check protection first

---

## Questions?

**Before making ANY changes to `mcp/` directory:**

1. Is this directory in the CI allow-list?
   - **Answer:** YES (check `docs/RULES.md` line 21)

2. Are the MCP servers currently active?
   - **Answer:** YES (run `./mcp/test-mcp-tools.sh`)

3. Is this referenced in core governance docs?
   - **Answer:** YES (README, NORTH_STAR, OPERATING_MODEL, RULES)

4. Is this critical infrastructure?
   - **Answer:** YES (enables all AI agent operations)

**If all answers are YES (they are), treat this directory as PROTECTED.**

---

## Summary

**The `mcp/` directory is critical infrastructure that must be preserved.**

- 🛡️ **Protected by CI** (check-docs.mjs, Dangerfile.js)
- 📚 **Documented in governance** (RULES, NORTH_STAR, OPERATING_MODEL)
- 🚀 **Currently operational** (6 servers active)
- ⚠️ **Essential for AI agents** (enables core capabilities)

**Action Required:** Preserve this directory. Do not remove, archive, or mark for cleanup.

**Verification:** Run `./mcp/test-mcp-tools.sh` to confirm servers are operational.

---

**For detailed protection information, see:** `mcp/PROTECTION_NOTICE.md`

**Last Updated:** 2025-10-15  
**Status:** All systems operational ✅

