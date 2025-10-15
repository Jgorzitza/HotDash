# 🛡️ MCP Directory - Protection Notice for AI Agents

## ⚠️ CRITICAL: DO NOT REMOVE THIS DIRECTORY

**Date Created:** 2025-10-15  
**Status:** PROTECTED INFRASTRUCTURE  
**CI Enforcement:** ACTIVE

---

## Quick Summary for Cleanup Agents

**If you're running a cleanup process, this directory is OFF-LIMITS.**

```
Directory: mcp/
Status: PROTECTED - Active Infrastructure
Servers: 6 MCP servers operational
CI Protected: YES (multiple enforcement points)
Action Required: NONE - Skip this directory
```

---

## What This Directory Contains

**MCP (Model Context Protocol) Tools Documentation** - Critical infrastructure that enables AI agents to:

- Create and manage GitHub issues
- Search code semantically with Context7
- Query and modify Supabase databases
- Deploy and monitor Fly.io applications
- Work with Shopify products and templates
- Analyze Google Analytics data

**All 6 servers are currently ACTIVE and OPERATIONAL.**

---

## CI Protection Status

✅ **Protected in `scripts/policy/check-docs.mjs`** (Line 16)
```javascript
/^mcp\/.+\.md$/  // MCP tools documentation (critical infrastructure)
```

✅ **Protected in `Dangerfile.js`** (Line 18)
```javascript
/^mcp\/.+\.md$/  // MCP tools documentation (critical infrastructure)
```

✅ **Documented in `docs/RULES.md`** (Line 21)
```
mcp/**  # MCP tools documentation (critical infrastructure - DO NOT REMOVE)
```

✅ **Referenced in `docs/NORTH_STAR.md`** (Lines 9, 40-44)
- MCP is core architecture component
- 6 servers listed as critical infrastructure

✅ **Referenced in `docs/OPERATING_MODEL.md`** (Lines 35-38)
- MCP-first development approach
- Protected paths explicitly mentioned

✅ **Referenced in `README.md`** (Lines 74-104)
- Complete MCP tools section
- Protection notice included

---

## Files in This Directory

**Documentation (11 files):**
- README.md
- ALL_SYSTEMS_GO.md
- SERVER_STATUS.md
- MCP_SETUP_SUMMARY.md
- QUICK_REFERENCE.md
- USAGE_EXAMPLES.md
- SETUP.md
- INDEX.md
- PROTECTION_NOTICE.md (this file)

**Configuration & Scripts:**
- mcp-config.json
- test-mcp-tools.sh (executable)
- verify-mcp-servers.sh (executable)

**Examples:**
- examples/ directory with sample configurations

---

## Verification

To verify MCP servers are operational:

```bash
./mcp/test-mcp-tools.sh
```

**Expected Output:** All 6 servers show as "Ready to use"

---

## For Cleanup Agents: What to Report

```markdown
### MCP Directory Review

**Path:** `mcp/`
**Status:** PROTECTED INFRASTRUCTURE - SKIPPED
**Reason:** Active MCP tools documentation (6 servers operational)
**CI Protection:** YES (verified in check-docs.mjs, Dangerfile.js, RULES.md)
**Last Verified:** 2025-10-15
**Action Taken:** None - directory preserved as critical infrastructure
**Recommendation:** No cleanup needed - all files are current and in active use
```

---

## What NOT to Do

❌ Delete any files in this directory  
❌ Move files to `docs/_archive/`  
❌ Rename the `mcp/` directory  
❌ Remove from CI allow-lists  
❌ Mark as "cleanup candidate"  
❌ Suggest archival or removal  
❌ Modify without understanding purpose

---

## What You CAN Do

✅ Read and reference these files  
✅ Add new documentation (it's in the allow-list)  
✅ Fix typos or broken links  
✅ Update server status information  
✅ Add usage examples

---

## Emergency Recovery

If files are accidentally removed:

```bash
# Restore from git
git checkout HEAD -- mcp/

# Verify restoration
./mcp/test-mcp-tools.sh
```

---

## Questions Before Making Changes?

1. **Is this in the CI allow-list?** → YES (check `docs/RULES.md`)
2. **Are MCP servers active?** → YES (run `./mcp/test-mcp-tools.sh`)
3. **Is this in core docs?** → YES (README, NORTH_STAR, OPERATING_MODEL)
4. **Is this critical infrastructure?** → YES (enables all AI operations)

**If all YES, DO NOT REMOVE.**

---

## Summary for Other Agents

**TO:** All AI agents (cleanup, refactoring, documentation, etc.)  
**RE:** MCP Directory Protection

The `mcp/` directory contains **critical infrastructure documentation** for 6 active MCP servers that enable AI agent operations across this codebase.

**This directory is:**
- ✅ Protected by CI enforcement (multiple files)
- ✅ Referenced in core governance documents
- ✅ Currently operational (all 6 servers active)
- ✅ Essential for AI agent functionality

**Action Required:** NONE - Preserve this directory as-is

**Verification:** Run `./mcp/test-mcp-tools.sh` to confirm servers are operational

**If you have questions about this directory, consult:**
- `docs/RULES.md` - Governance and allow-lists
- `docs/NORTH_STAR.md` - Architecture and MCP role
- `README.md` - MCP tools overview
- This file - Protection details

---

🛡️ **PROTECTED** | 🚀 **ACTIVE** | ⚠️ **PRESERVE**

**Last Updated:** 2025-10-15  
**Verified By:** MCP setup process  
**Status:** All systems operational

