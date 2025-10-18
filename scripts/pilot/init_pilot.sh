#!/usr/bin/env bash
set -euo pipefail

BRANCH="pilot/dev-memory-rag"
TODAY="$(date +%F)"

echo ">>> Checking out pilot branch: ${BRANCH}"
git checkout -b "${BRANCH}" || git checkout "${BRANCH}"

echo ">>> Creating pilot artifact + feedback roots"
mkdir -p artifacts/pilot/${TODAY} feedback/pilot

if [ ! -f ".env.pilot" ]; then
  cat > .env.pilot <<'EOF'
# Pilot feature flags
DEV_MEMORY_ENABLED=true
DEV_MEMORY_NAMESPACE=devmem1
DEV_MEMORY_ARTIFACT_ROOT=artifacts/pilot
DEV_MEMORY_FEEDBACK_ROOT=feedback/pilot
AI_HITL_ENFORCED=true

# Optional
DEV_MEMORY_RETRY_BUDGET=2
DEV_MEMORY_LOOP_TTL_MIN=90
EOF
  echo ">>> Wrote .env.pilot"
fi

echo ">>> Writing pilot GitHub Actions workflow"
mkdir -p .github/workflows
cat > .github/workflows/pilot-dev-guards.yml <<'YAML'
name: pilot-dev-guards
on:
  pull_request:
    branches: [ pilot/dev-memory-rag ]
  push:
    branches: [ pilot/dev-memory-rag ]

jobs:
  guards:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }

      - name: Enforce molecules (≤8h & Allowed paths)
        run: node scripts/policy/assert-molecules.mjs

      - name: Artifacts exist (today)
        run: node scripts/policy/assert-artifacts.mjs artifacts/pilot

      - name: Credential proof freshness (soft fail initially)
        run: node scripts/policy/cred-proof.mjs feedback/pilot/$(date +%F).md || true

      - name: Existing repo guards (Docs Policy, Danger, Gitleaks, AI Config)
        run: echo "Run existing checks here or via separate workflows"
YAML

echo ">>> Writing Dangerfile (pilot)"
cat > Dangerfile.pilot.js <<'JS'
// Dangerfile for pilot branch: fence writes to allowed areas only
const minimatch = require("minimatch");

const changed = [
  ...danger.git.created_files,
  ...danger.git.modified_files,
  ...danger.git.deleted_files,
];

const allowed = [
  "artifacts/pilot/**",
  "feedback/pilot/**",
  "scripts/**",
  "docs/runbooks/**",
  "reports/manager/**",
  "app/**"
];

function allowedFile(f) { return allowed.some(p => minimatch(f, p)); }
const offPath = changed.filter(f => !allowedFile(f));

if (offPath.length) {
  fail("Off-path changes in pilot branch: " + offPath.join(", "));
}

// Nudge for artifacts present in pilot dir
schedule(async () => {
  const today = new Date().toISOString().slice(0,10);
  message(`Pilot day context: ${today}. Ensure artifacts/pilot/${today} exists with hashes.`);
});
JS

echo ">>> Writing helper scripts"
mkdir -p scripts/policy scripts/memory

cat > scripts/policy/assert-molecules.mjs <<'JS'
import fs from "node:fs";
const planPath = "reports/manager/plan.json";
if (!fs.existsSync(planPath)) {
  console.error("Missing reports/manager/plan.json"); process.exit(1);
}
const plan = JSON.parse(fs.readFileSync(planPath,"utf8"));
const bad = [];
(plan.agents || []).forEach(a => {
  (a.molecules || []).forEach(m => {
    if (typeof m.ttl_hours !== "number" || m.ttl_hours > 8) bad.push(m.title + ":ttl");
    if (!m.allowed_paths || m.allowed_paths.length === 0) bad.push(m.title + ":paths");
  });
});
if (bad.length) { console.error("Invalid molecules:", bad.join(", ")); process.exit(1); }
console.log("Molecules OK.");
JS

cat > scripts/policy/assert-artifacts.mjs <<'JS'
import fs from "node:fs";
import path from "node:path";
const dir = process.argv[2] || "artifacts/pilot";
const today = new Date().toISOString().slice(0,10);
const p = path.join(dir, today);
if (!fs.existsSync(p)) { console.error("No artifacts for today:", p); process.exit(1); }
const files = fs.readdirSync(p);
if (!files.length) { console.error("Artifacts dir empty:", p); process.exit(1); }
console.log("Artifacts present:", files.length);
JS

cat > scripts/policy/cred-proof.mjs <<'JS'
import fs from "node:fs";
const fp = process.argv[2];
if (!fp || !fs.existsSync(fp)) {
  console.error("usage: node scripts/policy/cred-proof.mjs <feedback.md>"); process.exit(1);
}
const s = fs.readFileSync(fp, "utf8");
const must = [
  "Repo docs:", "MCP secret stores:", "Environment/CI:",
  "App config:", "Recent changes:"
];
if (!must.every(h => s.includes(h))) {
  console.error("Credential Retrieval Protocol proof is incomplete."); process.exit(1);
}
console.log("Credential proof present.");
JS

cat > scripts/memory/rehydrate.mjs <<'JS'
import fs from "node:fs";
import crypto from "node:crypto";
const planPath = "reports/manager/plan.json";
if (!fs.existsSync(planPath)) {
  console.error("Missing reports/manager/plan.json"); process.exit(1);
}
const buf = fs.readFileSync(planPath);
const hash = crypto.createHash("sha256").update(buf).digest("hex");
const plan = JSON.parse(buf.toString("utf8"));
const out = {
  event: "rehydrate",
  plan_sha256: hash,
  next_gates: plan.next_gates || [],
  north_star: plan.north_star || ""
};
console.log(JSON.stringify(out, null, 2));
JS

echo ">>> Staging files"
git add -f .env.pilot
git add .github/workflows/pilot-dev-guards.yml Dangerfile.pilot.js scripts/pilot scripts/policy scripts/memory
git commit -m "pilot: init scripts, Dangerfile, CI, env"
git push -u origin "${BRANCH}"

echo ">>> Done. Start a pilot manager session with the opener in the rollout doc."
