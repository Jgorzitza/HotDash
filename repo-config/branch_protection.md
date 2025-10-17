# Branch Protection — Required Checks and Reviews

1) **Settings → Branches → Add rule**
   - Branch name pattern: `main`
   - ✅ Require pull request reviews before merging — **2 approvals**
   - ✅ Dismiss stale approvals
   - ✅ Require status checks to pass before merging
     Required checks:
       - build
       - lint
       - vitest
       - playwright
       - workflow-smoke
       - security
   - ✅ Require conversation resolution before merging
   - ✅ Require linear history

Reference: GitHub documentation on protected branches and required checks.
