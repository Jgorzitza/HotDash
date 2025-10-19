# Lint Cleanup Strategy — Sequential File-Owner Approach

**Status**: Active  
**Created**: 2025-10-19  
**Owner**: Manager  
**Context**: Automated bulk lint fix caused regressions. Sequential approach prevents conflicts.

---

## Problem Statement

- **590 lint errors** across 37 files in `app/` directory
- **Root Cause**: 578 `@typescript-eslint/no-explicit-any` violations, 10 missing return types
- **Failed Approach**: Automated bulk replacement broke tests (Engineer attempted, reverted)
- **Risk**: Multiple agents fixing same files simultaneously causes git contamination

---

## Sequential Strategy

### Phase 1: Manager Creates Manifest (15 min)

```bash
cd ~/HotDash/hot-dash
npm run lint -- --format json > lint-manifest.json

# Parse to file → owner mapping based on directory:
# app/routes/api.analytics.* → Analytics
# app/routes/api.ads.* → Ads
# app/components/dashboard/* → Engineer
# app/services/analytics/* → Analytics
# etc.
```

**Output**: `reports/manager/lint-file-owners.md`

Example:
```markdown
| File | Errors | Owner | Assigned |
|------|--------|-------|----------|
| app/routes/api.analytics.revenue.ts | 12 | Analytics | Cycle 1 |
| app/services/ads/campaign.service.ts | 8 | Ads | Cycle 2 |
| app/components/dashboard/SalesTile.tsx | 15 | Engineer | Cycle 1 |
```

---

### Phase 2: Cyclic Assignment (5-10 files per cycle)

**Cycle Structure**:
1. Manager assigns 5-10 files to Agent X
2. Agent X fixes lint in assigned files ONLY
3. Agent X runs `npm run test:unit` for affected areas
4. If tests pass → Manager commits
5. If tests fail → Manager reverts, assigns smaller batch
6. Next agent proceeds (Cycle 2)

**Agents Execute Sequentially** (never concurrently):
- Cycle 1: Analytics (10 files)
- Cycle 2: Ads (8 files)  
- Cycle 3: Engineer (12 files)
- Cycle 4: Integrations (5 files)
- Cycle 5: Support (2 files)

**Rules**:
- ONE agent working on lint at a time
- Agent does NOT commit (Manager controls git)
- Full test suite must pass before next cycle
- If tests fail, revert that cycle's changes

---

### Phase 3: Agent Lint Fix Molecule (per agent)

**Template** (`docs/directions/<agent>.md`):

```markdown
### LINT-001: Fix TypeScript Lint Errors (Your Files Only)

**Assigned Files** (see `reports/manager/lint-file-owners.md`):
1. app/routes/api.<your-domain>.*.ts (3 files)
2. app/services/<your-domain>/*.ts (2 files)

**Actions**:
1. Run `npm run lint -- <file>` to see errors
2. Fix `@typescript-eslint/no-explicit-any`:
   - Replace `any` with proper types (use Context7 MCP for React Router 7 types)
   - Example:
     ```typescript
     // ❌ Before
     function handler(data: any) { ... }
     
     // ✅ After (use Route.LoaderArgs, Route.ActionArgs, etc.)
     import type { Route } from "./+types/route-name";
     function handler({ request }: Route.LoaderArgs) { ... }
     ```
3. Fix missing return types:
   - Add explicit return type to functions
   - Example: `async function getData(): Promise<RevenueData> { ... }`
4. Test your fixes:
   - Run `npm run test:unit -- <your-test-files>`
   - Verify all tests still pass
5. Evidence: `npm run lint -- <your-files>` shows 0 errors

**Evidence Target**: All assigned files show 0 lint errors, tests passing

**ETA**: 30-45 min (2-3 errors per file average)

**Critical**: Do NOT fix files outside your assignment - causes merge conflicts
```

---

### Phase 4: Manager Verification (per cycle)

After each agent completes:

```bash
# 1. Run full lint
npm run lint > lint-after-<agent>.log

# 2. Verify error count decreased
# Before: 590 errors → After: Should be 590 - <agent's fixes>

# 3. Run full test suite
npm run test:unit

# 4. If passing → commit
git add app/routes/api.<domain>.* app/services/<domain>/*
git commit -m "fix(lint): <Agent> - fix TypeScript errors in <domain> files

- Fixed <N> lint errors across <M> files
- All tests passing: <passing>/<total>
- Remaining lint errors: <count>

Refs #<issue>"

# 5. If failing → revert
git checkout -- app/
echo "Cycle failed - reverting <Agent>'s changes"
```

---

## Timeline Estimate

**Total Lint Errors**: 590  
**Files**: 37  
**Agents Involved**: 5 (Analytics, Ads, Engineer, Integrations, Support)  
**Cycles**: 5 (one per agent, sequential)

**Per Cycle**:
- Agent work: 30-45 min
- Manager verification: 10 min
- Total: ~60 min per cycle

**Total Timeline**: ~5 hours (all cycles sequential)

**Parallel Work**: Other agents can work on non-lint molecules during lint cycles

---

## Rollback Plan

If any cycle breaks tests:
1. Manager reverts that agent's changes immediately
2. Reduce batch size (10 files → 5 files)
3. Retry with smaller scope
4. Document which files caused regressions

---

## Success Criteria

- [ ] All 590 lint errors resolved
- [ ] `npm run lint` returns 0 errors
- [ ] `npm run test:unit` passes 100% (target)
- [ ] No merge conflicts or git contamination
- [ ] All changes within agent allowed paths

---

## Notes

- **Priority**: P2 (deferred from v1.0 P0 to v1.1 technical debt)
- **Reason for Deferral**: Automated approach caused regressions, production features take priority
- **When to Execute**: After v1.0 production launch, before v1.1 planning
- **Alternative**: Accept lint warnings for v1.0, address systematically in v1.1

---

**Manager Directive**: This approach ensures no git contamination and verifies each batch independently. Slower but safer than bulk fixes.

