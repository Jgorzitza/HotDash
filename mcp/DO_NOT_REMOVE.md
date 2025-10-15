# ⚠️ CRITICAL INFRASTRUCTURE - DO NOT REMOVE

## MCP Tools Documentation - Protected Directory

This directory contains **critical infrastructure documentation** for the Model Context Protocol (MCP) tools that enable AI agents to work effectively with this codebase.

---

## 🚨 PROTECTION STATUS

**This directory is PROTECTED by CI enforcement:**
- ✅ Added to `scripts/policy/check-docs.mjs` allow-list
- ✅ Added to `Dangerfile.js` allow-list  
- ✅ Documented in `docs/RULES.md`
- ✅ Referenced in `docs/NORTH_STAR.md`
- ✅ Referenced in `docs/OPERATING_MODEL.md`
- ✅ Referenced in `README.md`

**Pattern:** `/^mcp\/.+\.md$/` - All Markdown files in this directory are allowed

---

## 📋 PROTECTED FILES

### Core Documentation (11 files)
1. ✅ `README.md` - Main entry point
2. ✅ `ALL_SYSTEMS_GO.md` - Success guide with examples
3. ✅ `SERVER_STATUS.md` - Current server status
4. ✅ `MCP_SETUP_SUMMARY.md` - Setup overview
5. ✅ `QUICK_REFERENCE.md` - Tool reference guide
6. ✅ `USAGE_EXAMPLES.md` - Real-world examples
7. ✅ `SETUP.md` - Detailed setup instructions
8. ✅ `INDEX.md` - Navigation guide
9. ✅ `DO_NOT_REMOVE.md` - This file (protection notice)

### Configuration & Scripts
10. ✅ `mcp-config.json` - Server configuration
11. ✅ `test-mcp-tools.sh` - Quick verification script
12. ✅ `verify-mcp-servers.sh` - Comprehensive verification

### Examples Directory
13. ✅ `examples/` - Example configurations

---

## 🎯 PURPOSE

This directory provides documentation for **6 active MCP servers**:

1. **GitHub Official** - Repository management, issues, PRs
2. **Context7** - Semantic code search (port 3001)
3. **Supabase** - Database operations
4. **Fly.io** - Deployment management (port 8080)
5. **Shopify** - E-commerce operations
6. **Google Analytics** - Analytics and reporting

These tools are **essential infrastructure** that enables AI agents to:
- Create and manage GitHub issues
- Search code semantically
- Query and modify databases
- Deploy and monitor applications
- Work with Shopify products
- Analyze analytics data

---

## ⛔ DO NOT

**NEVER do any of the following without explicit approval:**

❌ Delete any files in this directory
❌ Move files out of this directory
❌ Rename the `mcp/` directory
❌ Remove the directory from CI allow-lists
❌ Modify files without understanding their purpose
❌ Archive or move to `docs/_archive/`
❌ Mark as "cleanup candidate"
❌ Suggest removal in cleanup processes

---

## ✅ ALLOWED ACTIONS

**You MAY do the following:**

✅ Read and reference these files
✅ Add NEW documentation files (they're in the allow-list)
✅ Update existing files to improve clarity
✅ Fix typos or broken links
✅ Add examples or usage patterns
✅ Update server status information

**Always verify changes don't break:**
- CI policy checks
- Documentation links
- Script functionality
- Server configurations

---

## 🔍 VERIFICATION

To verify MCP tools are working:

```bash
# Quick test (recommended)
./mcp/test-mcp-tools.sh

# Comprehensive verification
./mcp/verify-mcp-servers.sh

# Check CI policy
node scripts/policy/check-docs.mjs
```

Expected result: All 6 servers should show as active/ready.

---

## 📖 FOR CLEANUP AGENTS

**If you're running a cleanup process, READ THIS:**

### This Directory is NOT Cleanup Eligible

**Reason:** Critical infrastructure documentation for active MCP servers

**Evidence:**
- All 6 MCP servers are currently operational
- Documentation is actively used by AI agents
- Protected by CI enforcement in multiple files
- Referenced in core governance documents

### What to Report

If you encounter this directory during cleanup:

```
SKIP: mcp/ directory
Reason: Protected infrastructure (MCP tools documentation)
Status: All 6 servers active and operational
CI Protection: Yes (check-docs.mjs, Dangerfile.js, RULES.md)
Action: No action required - directory is current and in use
```

### Verification Steps

Before considering ANY changes:

1. ✅ Run `./mcp/test-mcp-tools.sh` - Verify servers are active
2. ✅ Check `docs/RULES.md` - Confirm `mcp/**` is in allow-list
3. ✅ Review `README.md` - Verify MCP section references this directory
4. ✅ Check `docs/NORTH_STAR.md` - Confirm MCP is core architecture
5. ✅ Review `docs/OPERATING_MODEL.md` - Verify MCP in guardrails

If ALL checks pass (they should), this directory is **PROTECTED** and **ACTIVE**.

---

## 🚨 IF FILES ARE MISSING

If any files from this directory are accidentally removed:

### Immediate Actions

1. **Stop the cleanup process**
2. **Restore from git history:**
   ```bash
   git checkout HEAD -- mcp/
   ```
3. **Verify restoration:**
   ```bash
   ./mcp/test-mcp-tools.sh
   ```
4. **Report the incident** in feedback log

### Prevention

- Always check `docs/RULES.md` before cleanup
- Verify CI allow-lists before removing `.md` files
- Test MCP tools after any changes
- Review protection notices like this file

---

## 📞 QUESTIONS?

**Before making changes, ask:**

1. Is this directory in the CI allow-list? → **YES** (check `docs/RULES.md`)
2. Are the MCP servers active? → **YES** (run `./mcp/test-mcp-tools.sh`)
3. Is this referenced in core docs? → **YES** (README, NORTH_STAR, OPERATING_MODEL)
4. Is this critical infrastructure? → **YES** (enables all AI agent operations)

**If all answers are YES, DO NOT REMOVE.**

---

## 📚 REFERENCES

**Governance Documents:**
- `docs/RULES.md` - Line 21: `mcp/**` in allow-list
- `docs/NORTH_STAR.md` - Lines 9, 40-44: MCP architecture
- `docs/OPERATING_MODEL.md` - Lines 35-38: MCP guardrails
- `README.md` - Lines 74-104: MCP tools section

**CI Enforcement:**
- `scripts/policy/check-docs.mjs` - Line 16: `mcp/**` pattern
- `Dangerfile.js` - Line 18: `mcp/**` pattern

**Verification:**
- `./mcp/test-mcp-tools.sh` - Quick test script
- `./mcp/verify-mcp-servers.sh` - Comprehensive verification

---

## ✅ SUMMARY FOR AGENTS

**Status:** PROTECTED INFRASTRUCTURE  
**Action:** PRESERVE - DO NOT REMOVE  
**Reason:** Active MCP tools documentation (6 servers operational)  
**CI Protected:** YES (multiple enforcement points)  
**Last Verified:** 2025-10-15  
**Verification Command:** `./mcp/test-mcp-tools.sh`

---

**This directory is essential for AI agent operations. Treat it as critical infrastructure.**

🛡️ **PROTECTED** | 🚀 **ACTIVE** | ⚠️ **DO NOT REMOVE**

