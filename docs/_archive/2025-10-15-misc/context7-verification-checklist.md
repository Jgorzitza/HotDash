# Context7 MCP Verification Checklist

Use this checklist to verify that Context7 MCP is properly configured and working for the HotDash project.

## Pre-Flight Checks

### ✅ Configuration Files

- [ ] `.mcp.json` exists in project root
- [ ] `.mcp.json` contains `context7` server configuration
- [ ] `--workspace-path` points to `/home/justin/HotDash/hot-dash`
- [ ] `.context7ignore` exists in project root
- [ ] `.context7ignore` excludes `node_modules/`, `build/`, `.env*`, `vault/`

**Verify:**

```bash
# From project root
cat .mcp.json | jq '.mcpServers.context7'
cat .context7ignore | grep -E 'node_modules|build|\.env|vault'
```

### ✅ Documentation

- [ ] `docs/context7-mcp-guide.md` exists (comprehensive guide)
- [ ] `docs/context7-quick-reference.md` exists (quick reference)
- [ ] `docs/directions/context7-mcp-setup.md` exists (setup summary)
- [ ] README.md includes "AI Agent Support: Context7 MCP" section

**Verify:**

```bash
ls -la docs/context7-*.md docs/directions/context7-mcp-setup.md
grep -A 5 "AI Agent Support: Context7 MCP" README.md
```

## Functional Tests

### Test 1: Basic Code Search

**Query:** "dashboard tile component implementation"

**Expected Results:**

- Should return references to `app/components/tiles/`
- Should include specific tile implementations (Sales Pulse, Inventory, etc.)
- Should show component patterns and structure

**Status:** [ ] Pass / [ ] Fail

---

### Test 2: Service Integration Search

**Query:** "Shopify service client for order fulfillment"

**Expected Results:**

- Should return `app/services/shopify/` references
- Should show order-related service methods
- Should include relevant integration code

**Status:** [ ] Pass / [ ] Fail

---

### Test 3: Documentation Search

**Query:** "production deployment checklist"

**Expected Results:**

- Should return `docs/deployment/production_go_live_checklist.md`
- May include related deployment documentation
- Should not return code files

**Status:** [ ] Pass / [ ] Fail

---

### Test 4: Configuration Search

**Query:** "environment variables for staging"

**Expected Results:**

- Should return `.env.example` or `.env.staging.example`
- May include `docs/deployment/env_matrix.md`
- Should NOT return actual `.env` files (they're ignored)

**Status:** [ ] Pass / [ ] Fail

---

### Test 5: Pattern Discovery

**Query:** "service client implementation pattern"

**Expected Results:**

- Should return multiple service client files
- Should show common patterns across clients
- May include base classes or utilities

**Status:** [ ] Pass / [ ] Fail

---

### Test 6: Database Schema Search

**Query:** "dashboard facts table structure"

**Expected Results:**

- Should return `prisma/schema.prisma` references
- Should show DashboardFact model
- May include related migrations

**Status:** [ ] Pass / [ ] Fail

---

### Test 7: Script Discovery

**Query:** "nightly metrics rollup script"

**Expected Results:**

- Should return `scripts/ops/run-nightly-metrics.ts`
- May include related documentation in `docs/data/nightly_metrics.md`
- Should show the actual implementation

**Status:** [ ] Pass / [ ] Fail

---

### Test 8: Exclusion Verification

**Query:** "node_modules lodash"

**Expected Results:**

- Should NOT return files from `node_modules/`
- May return project code that uses lodash
- Should respect `.context7ignore` rules

**Status:** [ ] Pass / [ ] Fail

---

## Performance Tests

### Test 9: Initial Index Time

**Action:** First time using Context7 after setup

**Expected:**

- Indexing completes in 1-3 minutes
- No errors during indexing
- Subsequent queries are fast

**Actual Time:** ****\_\_**** minutes

**Status:** [ ] Pass / [ ] Fail

---

### Test 10: Query Response Time

**Action:** Run any of the queries above after indexing

**Expected:**

- Queries return in < 1 second
- Results are relevant
- No timeout errors

**Actual Time:** ****\_\_**** ms

**Status:** [ ] Pass / [ ] Fail

---

## Integration Tests

### Test 11: Multi-MCP Usage

**Action:** Use both Context7 and Shopify Dev MCP in same session

**Query 1 (Context7):** "dashboard tile implementation"  
**Query 2 (Shopify):** "Admin API product query"

**Expected:**

- Both MCPs respond correctly
- No conflicts between servers
- Each returns appropriate results

**Status:** [ ] Pass / [ ] Fail

---

### Test 12: Cross-Reference Search

**Query:** "metrics aggregation implementation and documentation"

**Expected:**

- Returns both code (`scripts/ai/`, `app/services/`)
- Returns docs (`docs/data/nightly_metrics.md`)
- Shows complete picture of the feature

**Status:** [ ] Pass / [ ] Fail

---

## Edge Cases

### Test 13: Broad Query Handling

**Query:** "dashboard"

**Expected:**

- Returns relevant results (not everything)
- Prioritizes most relevant files
- Results are still useful despite broad query

**Status:** [ ] Pass / [ ] Fail

---

### Test 14: Typo Tolerance

**Query:** "shopfy order fulfilment" (typos intentional)

**Expected:**

- Still returns relevant Shopify order results
- Semantic understanding compensates for typos
- Or returns "no results" gracefully

**Status:** [ ] Pass / [ ] Fail

---

### Test 15: Non-Existent Code Search

**Query:** "bitcoin mining integration"

**Expected:**

- Returns no results or very low relevance results
- Doesn't hallucinate non-existent code
- Responds gracefully

**Status:** [ ] Pass / [ ] Fail

---

## Agent Workflow Tests

### Test 16: Before Implementing New Feature

**Scenario:** Agent needs to add a new dashboard tile

**Queries:**

1. "existing dashboard tile implementation"
2. "dashboard tile component pattern"
3. "how to register a new tile"

**Expected:**

- Agent finds existing tile examples
- Agent understands the pattern
- Agent can implement without asking humans

**Status:** [ ] Pass / [ ] Fail

---

### Test 17: Debugging Workflow

**Scenario:** Integration isn't working

**Queries:**

1. "Chatwoot service client implementation"
2. "error handling in service clients"
3. "incident response for integration failures"

**Expected:**

- Agent finds the service code
- Agent finds error handling patterns
- Agent finds runbook procedures

**Status:** [ ] Pass / [ ] Fail

---

## Troubleshooting

If any tests fail, check:

### Common Issues

**No Results / Slow Queries:**

- [ ] Verify workspace path is correct
- [ ] Check `.context7ignore` isn't over-excluding
- [ ] Restart MCP server (reload Cursor)
- [ ] Check for Context7 errors in MCP logs

**Wrong Results:**

- [ ] Query may be too broad - try more specific terms
- [ ] Check if files exist that should match
- [ ] Verify files aren't in `.context7ignore`

**Indexing Fails:**

- [ ] Check `.mcp.json` syntax (use `jq` validation)
- [ ] Verify npx can install `@upguard/context7-mcp`
- [ ] Check disk space for index cache
- [ ] Review Context7 MCP server logs

**MCP Not Loading:**

- [ ] Verify `.mcp.json` is valid JSON
- [ ] Check Cursor has loaded MCP servers
- [ ] Restart Cursor completely
- [ ] Check npx is available in PATH

---

## Sign-Off

**Tested By:** ******\_\_\_\_******  
**Date:** ******\_\_\_\_******  
**All Tests Pass:** [ ] Yes / [ ] No  
**Issues Found:** ******\_\_\_\_******  
**Ready for Agent Use:** [ ] Yes / [ ] No

---

## Notes

Add any observations, issues, or suggestions:

```
[Your notes here]
```

---

**Quick Fix Reference:**

```bash
# Validate JSON
cat .mcp.json | python3 -m json.tool

# Check what's being indexed
find . -type f ! -path "*/node_modules/*" ! -path "*/build/*" ! -path "*/.*/*" | head -20

# Manually test Context7 package exists
npx -y @upguard/context7-mcp@latest --help

# View ignore rules
cat .context7ignore
```

---

**Related Documentation:**

- `docs/context7-quick-reference.md` - Query templates
- `docs/context7-mcp-guide.md` - Complete guide
- `docs/directions/context7-mcp-setup.md` - Setup summary
