# APPLY — How to use this bundle

1) Create branch: `git checkout -b governance-reset-$(date +%F)`
2) Copy contents into repo root; commit & open PR.
3) Make these **required checks** on `main`: Docs Policy, Gitleaks, Danger, Validate AI Agent Config.
4) Turn on **Secret scanning → Push protection** in Settings.
5) (Optional) Run `scripts/rulesets/create-md-allowlist.sh <owner/repo>` to add a push ruleset that blocks rogue `.md` at push time.
6) Run one-time archive sweep: `node scripts/ops/archive-docs.mjs` then commit.
7) Edit `docs/directions/*` for the 16 agents and relaunch via runbooks.
