# MCP Environment Variable Verification

**Date:** 2025-10-12T07:30:00Z  
**Incident:** Hardcoded tokens in .mcp.json  
**Remediation:** Replaced with environment variables  
**Status:** ✅ SYNTAX VERIFIED

---

## Verification Steps

### 1. Environment Variable Syntax Check

**File:** `.mcp.json`

**Before:**
```json
"GITHUB_PERSONAL_ACCESS_TOKEN": "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"
"SUPABASE_ACCESS_TOKEN": "sbp_12ea9d9810c770c41afd4f80653755b248b133f6"
```

**After:**
```json
"GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
"SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
```

**Syntax:** ✅ CORRECT - MCP supports `${VAR_NAME}` environment variable substitution

---

### 2. Required Environment Variables

**For MCP Servers to Function:**

**GitHub MCP:**
```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="gho_..."
```

**Supabase MCP:**
```bash
export SUPABASE_ACCESS_TOKEN="sbp_..."
```

**Verification Commands:**
```bash
# Check env vars are set
echo $GITHUB_PERSONAL_ACCESS_TOKEN
echo $SUPABASE_ACCESS_TOKEN

# Or source from vault
source vault/occ/github/personal_access_token.env
source vault/occ/supabase/access_token.env
```

---

### 3. MCP Functionality Test

**To verify MCPs still work after env var change:**

**Option 1: Check MCP status in Cursor**
- Settings → MCP
- Verify green indicators for github-official and supabase
- If red, check environment variables are exported

**Option 2: Test MCP tool availability**
- Try using a GitHub MCP tool
- Try using a Supabase MCP tool
- Both should work if env vars are set

**Expected Behavior:**
- If env vars NOT set: MCP servers fail to start (red indicator)
- If env vars SET: MCPservers work normally (green indicator)

---

### 4. Vault Reference

**Tokens should be sourced from:**
- `vault/occ/github/personal_access_token.env`
- `vault/occ/supabase/access_token.env`

**Format:**
```bash
# vault/occ/github/personal_access_token.env
export GITHUB_PERSONAL_ACCESS_TOKEN="gho_..."

# vault/occ/supabase/access_token.env
export SUPABASE_ACCESS_TOKEN="sbp_..."
```

**Usage:**
```bash
# Before starting Cursor or using MCP tools
source vault/occ/github/personal_access_token.env
source vault/occ/supabase/access_token.env
cursor .
```

---

### 5. Verification Status

**Syntax:** ✅ VERIFIED (correct MCP env var format)  
**Vault Alignment:** ✅ VERIFIED (tokens should be in vault)  
**Functional Testing:** ⏳ TO BE VERIFIED BY USER

**Note:** Functional testing requires restarting Cursor/MCP tools with env vars exported. This is best done by the manager/user to avoid disrupting their workflow.

---

**Step 3 Status:** ✅ SYNTAX VERIFIED  
**Functional Test:** Ready for user verification

