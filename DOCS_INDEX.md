# Required Documentation Index

**Purpose**: Single source of truth for ESSENTIAL documents only  
**Owner**: Manager (updates when adding REQUIRED docs)  
**Rule**: If it's not in this index, it can be archived

---

## Tier 1: Governance (NEVER ARCHIVE)

| File | Purpose | Last Updated | Used By |
|------|---------|--------------|---------|
| `docs/NORTH_STAR.md` | Vision, philosophy, tech stack, MCP rules | 2025-10-19 | All agents (startup) |
| `docs/OPERATING_MODEL.md` | How we work, pipeline, guardrails, roles | 2025-10-19 | All agents (startup) |
| `docs/RULES.md` | Process, security, agent rules | 2025-10-19 | All agents (startup) |
| `README.md` | Project overview, quick start | 2025-10-20 | New contributors |

---

## Tier 2: Active Operations (IN USE)

| Directory | Purpose | Count | Owner | Archive Rule |
|-----------|---------|-------|-------|--------------|
| `docs/directions/*.md` | Agent task assignments | 16 | Manager | Never (active tasks) |
| `feedback/*/*.md` | Agent progress logs | ~30 | Agents | Archive >30 days old to feedback/archive/ |
| `docs/design/*.md` | Product design specs | 57 | Designer | NEVER ARCHIVE (per policy) |

---

## Tier 3: Reference (KEEP IF USED)

| File/Directory | Purpose | Archive Rule |
|----------------|---------|--------------|
| `docs/runbooks/*.md` | Operational procedures | Archive if unused >90 days |
| `docs/specs/*.md` | Technical specifications | Archive if unused >90 days |
| `.cursor/rules/*.mdc` | Agent workflow rules | NEVER (auto-applied) |

---

## Tier 4: Ad-Hoc (AUDIT MONTHLY)

| Pattern | Archive Rule |
|---------|--------------|
| Root `*.md` (except README) | Archive to `docs/archive/` if >7 days old |
| `reports/manager/*.md` | Archive to `reports/archive/` if >30 days old |
| `feedback/ANYTHING_NOT_AGENT_NAME/*.md` | Archive immediately |

---

## Audit Process (Manager runs DAILY)

```bash
# Manager runs at end of each session:
cd /home/justin/HotDash/hot-dash

# 1. Find root-level .md files (candidates for archive)
find . -maxdepth 1 -name "*.md" ! -name "README.md" ! -name "DOCS_INDEX.md" ! -name "SECURITY.md" ! -name "CONTRIBUTING.md"

# 2. Read each file, decide: KEEP or ARCHIVE
# 3. Archive to docs/archive/YYYY-MM-DD/
mkdir -p docs/archive/$(date +%Y-%m-%d)
# Move obsolete files

# 4. Update "Current Status" section below
```

---

## Current Status (2025-10-20)

**Total .md files**: 2,602  
**Required (Tier 1+2)**: ~107 (16 direction + 30 feedback + 57 design + 4 governance)  
**Root files**: 5 (README, SECURITY, CONTRIBUTING, AGENT_LAUNCH_PROMPT_OCT20, COMPLETE_VISION_OVERVIEW)  
**Last audit**: 2025-10-20T09:05Z  
**Archived**: 14 files to docs/archive/2025-10-20/ (incident reports, status updates, one-time configs)  
**Next audit due**: DAILY (end of each Manager session)

---

## Adding New Required Docs

**Before creating a new .md file, ask:**
1. Is this in Tier 1-3? (If no → don't create)
2. Can this go in existing feedback/direction? (If yes → use that)
3. Will this be referenced in >1 session? (If no → don't create)

**If yes to all 3**, then:
1. Create the file in appropriate directory
2. Add to this index with purpose + owner
3. Commit with reason

---

## References

- Agent workflow rules: `.cursor/rules/04-agent-workflow.mdc`
- Design protection policy: `docs/DESIGN_PROTECTION_POLICY.md`
- No ad-hoc documents rule: `docs/AGENT_RULES_REFERENCE.md`

