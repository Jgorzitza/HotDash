# Drift Checklist (Weekly, Friday)

- [ ] Run `gitleaks git -v --redact --log-opts="--all" .` → 0 findings
- [ ] `node scripts/policy/check-docs.mjs` → 0 violations
- [ ] `node scripts/ops/archive-docs.mjs` (planning TTL) → commit if changes
- [ ] Verify required checks still enforced on `main`
- [ ] Sample PR passes: Docs Policy + Danger + Gitleaks
- [ ] Review agent feedback logs and directions; archive stale docs
- [ ] Update NORTH_STAR metrics & PROJECT_PLAN gates if scope changed
