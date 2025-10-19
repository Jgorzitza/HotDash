# ALL AGENTS - PRODUCTION FOCUS - 2025-10-19

## 🎯 MISSION: SHIP TO PRODUCTION

**Effective**: NOW
**Target**: Production deployment ready by morning
**Mode**: CLI-FIRST, NO BLOCKERS, DEEP EXECUTION

---

## ✅ BLOCKERS REMOVED

1. ~~GitHub Billing~~ → ✅ CEO RESOLVED
2. ~~Supabase MCP creds~~ → ✅ USE SUPABASE CLI (vault creds)
3. ~~GitHub MCP creds~~ → ✅ USE GH CLI (authenticated)
4. ~~Missing schemas.ts~~ → ✅ MANAGER CREATED
5. ~~Missing approvals service~~ → ✅ MANAGER CREATED
6. ~~Missing ads directories~~ → ✅ MANAGER CREATED
7. ~~Build failure~~ → ✅ PASSING (230/230 unit tests)

**ALL AGENTS**: Zero blockers. Use CLI tools. Execute to production.

---

## 🚀 CLI-FIRST STRATEGY

**Use These Tools** (All Working):

- `gh` - GitHub CLI (authenticated via browser)
- `supabase` - Supabase CLI v2.48.3 (vault creds)
- `shopify` - Shopify CLI v3.85.4
- `npm/npx/node` - Build/test tools
- `psql` - Direct database access
- `jq`, `rg`, `grep` - Data processing

**MCP Optional** (Documentation only):

- Context7 MCP - Library docs when needed
- Shopify MCP - Component validation if helpful

**NO WAITING FOR CREDENTIALS** - Everything works via CLI now!

---

## 📋 PRODUCTION READINESS CHECKLIST

### Build & Test (MUST BE GREEN)

- [x] Build passing
- [x] Unit tests: 230/230 (100%)
- [ ] Integration tests: Fix 4 failures
- [ ] E2E tests: Fix Playwright discovery
- [ ] Accessibility: Run full suite
- [ ] Performance: P95 <3s verified

### Database (MUST BE READY)

- [ ] Migrations applied to staging
- [ ] RLS tests all passing
- [ ] Data integrity verified
- [ ] Production migration plan ready

### Features (MUST BE FUNCTIONAL)

- [ ] Dashboard tiles: All 8 loading data
- [ ] Approvals drawer: Full HITL flow
- [ ] Idea pool: 5 suggestions working
- [ ] Analytics: Real GA4 data
- [ ] Inventory: ROP calculations
- [ ] CX: Chatwoot integration

### Operations (MUST BE DOCUMENTED)

- [ ] Runbooks: All updated
- [ ] Rollback procedures: Documented
- [ ] Monitoring: Configured
- [ ] Secrets: All in vault/GitHub
- [ ] Deploy process: Step-by-step

---

## 🎯 PRODUCTION TASK DISTRIBUTION

**Each agent gets**: 10-15 production-focused tasks
**Focus**: Ship features, not perfect code
**Standard**: Working > Perfect
**Timeline**: 8-12 hours to production

Updating all direction files now...
