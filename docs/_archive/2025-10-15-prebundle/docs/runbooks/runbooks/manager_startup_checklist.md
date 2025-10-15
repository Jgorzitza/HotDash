# Manager Startup (Daily)

**Align to NORTH_STAR and RULES**
- [ ] Read `docs/NORTH_STAR.md` and `docs/RULES.md` (diff since yesterday)

**Tools health**
- [ ] `shopify version` OK, `supabase --version` OK
- [ ] CI green on `main` (Docs Policy, Danger, Gitleaks, HITL config)

**Tasking**
- [ ] Review Issues (label: task) → assign/resize, set DoD, set **Allowed paths**
- [ ] Update `docs/directions/<agent>.md` for active agents

**Feedback loop**
- [ ] Skim yesterday’s `feedback/<agent>/<YYYY-MM-DD>.md`; answer blockers in directions (not in feedback)

**Drift guard**
- [ ] Run `node scripts/policy/check-docs.mjs` on your branch
- [ ] If planning docs >7 days old, run sweep and commit
