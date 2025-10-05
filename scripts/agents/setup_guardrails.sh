#!/usr/bin/env bash
set -euo pipefail

# =========================
# Agent Guardrails Installer
# =========================
# What this script does (idempotent):
# 1) Ensure git repo (main branch), push-ready.
# 2) Secret hygiene: ignore .env etc.
# 3) Tight MCP allowlist (GA MCP, Supabase RO MCP, GitHub MCP, Memory MCP).
# 4) Create Path Guard pre-commit hook (restrict commits to ALLOWED_PATH_PREFIX).
# 5) Create/refresh canon.lock with doc hashes; add a checker.
# 6) Push changes. If GitHub CLI is present + authenticated, enable baseline branch protection.
#
# Env knobs:
# - REPO_SLUG (optional): "owner/repo" for GitHub API; auto-detected if remote=origin points to GitHub.
# - ALLOWED_PATH_PREFIX (optional): e.g., "apps/admin/" to restrict commit scope during a shift.
# - EPOCH (optional): defaults to 2025.10.E1
# - CANON_DOCS (optional): comma-separated list of canonical docs; default minimal set.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

log() { printf "\033[1;34m[guardrails]\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m[warn]\033[0m %s\n" "$*" >&2; }
die() { printf "\033[1;31m[error]\033[0m %s\n" "$*" >&2; exit 1; }

# 0) Sanity checks
[ -f "package.json" ] || warn "package.json not found (still proceeding)."
[ -d ".github" ] || mkdir -p .github
[ -d "scripts" ] || mkdir -p scripts
[ -d "scripts/ci" ] || mkdir -p scripts/ci
[ -d "scripts/hooks" ] || mkdir -p scripts/hooks
[ -d "docs/policies" ] || mkdir -p docs/policies

# 1) Ensure git repo main
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  log "Initializing git repo…"
  git init
fi
git symbolic-ref -q HEAD >/dev/null 2>&1 || git checkout -b main || true

# 2) Secret hygiene
if ! grep -qE '^\s*\.env(\.local)?\s*$' .gitignore 2>/dev/null; then
  log "Adding .env to .gitignore"
  {
    echo ""
    echo "# local secrets"
    echo ".env"
    echo ".env.local"
    echo "secrets/"
  } >> .gitignore
fi

# 3) Tight MCP allowlist
cat > docs/policies/mcp-allowlist.json <<'JSON'
{
  "epoch": "2025.10.E1",
  "servers": [
    {"name":"google-analytics-mcp","version":">=1.0.0","checksum":"<sha256>","endpoint":"http://127.0.0.1:8780"},
    {"name":"supabase-mcp","version":">=1.0.0","checksum":"<sha256>","endpoint":"http://127.0.0.1:8781","mode":"read-only-views-prod"},
    {"name":"github-mcp","version":">=1.0.0","checksum":"<sha256>","endpoint":"http://127.0.0.1:8770"},
    {"name":"memory-mcp","version":">=1.0.0","checksum":"<sha256>","endpoint":"http://127.0.0.1:8774"}
  ]
}
JSON

# 4) Path Guard pre-commit hook (optional at runtime; active only if ALLOWED_PATH_PREFIX is set)
cat > scripts/hooks/path_guard.py <<'PY'
#!/usr/bin/env python3
import os, subprocess, sys, pathlib

allowed = os.environ.get("ALLOWED_PATH_PREFIX", "").strip()
if not allowed:
    sys.exit(0)  # no restriction requested

# Allow feedback logs to always update
ALWAYS_OK = ("docs/feedback/",)

# Get staged files (add+copy+modify+rename+type changes)
res = subprocess.run(["git", "diff", "--cached", "--name-only", "--diff-filter=ACMRT"], capture_output=True, text=True)
files = [f for f in res.stdout.strip().split("\n") if f]

violations = []
for f in files:
    if any(f.startswith(p) for p in ALWAYS_OK):
        continue
    if not f.startswith(allowed):
        violations.append(f)

if violations:
    print(f"[Path Guard] ALLOWED_PATH_PREFIX={allowed}")
    print("[Path Guard] The following files are outside your allowed path:")
    for v in violations:
        print(f" - {v}")
    print("Refuse commit. Adjust ALLOWED_PATH_PREFIX for this shift or move changes under the allowed path.")
    sys.exit(1)
sys.exit(0)
PY
chmod +x scripts/hooks/path_guard.py

# Ensure pre-commit config includes path guard
if [ ! -f "pre-commit-config.yaml" ] || ! grep -q "path-guard" pre-commit-config.yaml; then
  log "Adding Path Guard to pre-commit-config.yaml"
  cat >> pre-commit-config.yaml <<'YAML'

# Guard-relative commits (optional; active only if ALLOWED_PATH_PREFIX is set in env)
- repo: local
  hooks:
    - id: path-guard
      name: Path Guard (respects $ALLOWED_PATH_PREFIX)
      entry: python3 scripts/hooks/path_guard.py
      language: system
      stages: [commit]
YAML
fi

# Install pre-commit quietly if available
if command -v python3 >/dev/null 2>&1; then
  python3 -c "import pkgutil,sys" || true
  python3 -m pip -q install --user pre-commit >/dev/null 2>&1 || true
  if command -v pre-commit >/dev/null 2>&1 || [ -x "$HOME/.local/bin/pre-commit" ]; then
    PATH="$HOME/.local/bin:$PATH" pre-commit install --install-hooks >/dev/null 2>&1 || true
  fi
fi

# 5) Canon: update lock with doc hashes + add checker
EPOCH="${EPOCH:-2025.10.E1}"
# default canon set; adjust if you add more docs later
CANON_DOCS="${CANON_DOCS:-docs/NORTH_STAR.md,docs/directions/manager.md,docs/git_protocol.md}"

# Python helper (uses PyYAML if present; falls back to simple YAML write)
cat > scripts/ci/update-canon-lock.py <<'PY'
#!/usr/bin/env python3
import os, sys, hashlib, datetime
try:
    import yaml
except Exception:
    yaml = None

epoch = os.environ.get("EPOCH","2025.10.E1")
docs_csv = os.environ.get("CANON_DOCS","docs/NORTH_STAR.md,docs/directions/manager.md,docs/git_protocol.md")
docs = [d.strip() for d in docs_csv.split(",") if d.strip()]

def sha256(path):
    h = hashlib.sha256()
    with open(path,'rb') as f:
        for chunk in iter(lambda:f.read(8192), b''):
            h.update(chunk)
    return h.hexdigest()

entries = []
for p in docs:
    if os.path.exists(p):
        entries.append({"path": p, "sha256": sha256(p)})
    else:
        print(f"[update-canon-lock] warn: missing {p}", file=sys.stderr)

data = {"epoch": epoch, "generated_at": datetime.datetime.utcnow().isoformat()+"Z",
        "docs": entries}

# Write canon.lock
if yaml:
    with open("canon.lock","w",encoding="utf-8") as f:
        yaml.safe_dump(data, f, sort_keys=False)
else:
    # naive YAML writer
    with open("canon.lock","w",encoding="utf-8") as f:
        f.write(f"epoch: {epoch}\n")
        f.write(f"generated_at: {datetime.datetime.utcnow().isoformat()}Z\n")
        f.write("docs:\n")
        for e in entries:
            f.write(f"  - path: {e['path']}\n")
            f.write(f"    sha256: {e['sha256']}\n")
print("[update-canon-lock] wrote canon.lock")
PY
chmod +x scripts/ci/update-canon-lock.py

cat > scripts/ci/check-canon.py <<'PY'
#!/usr/bin/env python3
import sys, os, hashlib
try:
    import yaml
except Exception as e:
    print("[check-canon] PyYAML required. Install: python3 -m pip install pyyaml", file=sys.stderr)
    sys.exit(2)

def sha256(path):
    h = hashlib.sha256()
    with open(path,'rb') as f:
        for chunk in iter(lambda:f.read(8192), b''):
            h.update(chunk)
    return h.hexdigest()

if not os.path.exists("canon.lock"):
    print("[check-canon] canon.lock missing", file=sys.stderr)
    sys.exit(1)

with open("canon.lock","r",encoding="utf-8") as f:
    data = yaml.safe_load(f)

failed = []
for d in data.get("docs",[]):
    p = d.get("path")
    want = d.get("sha256")
    if not p or not want or not os.path.exists(p):
        failed.append(p or "<unknown>")
        continue
    have = sha256(p)
    if have != want:
        failed.append(p)

if failed:
    print("[check-canon] hash mismatch or missing docs:", ", ".join(failed), file=sys.stderr)
    sys.exit(1)

print("[check-canon] OK")
sys.exit(0)
PY
chmod +x scripts/ci/check-canon.py

# ensure PyYAML for local run (best-effort)
python3 - <<'PY' 2>/dev/null || true
import sys, subprocess
try:
    import yaml  # type: ignore
except Exception:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--user", "PyYAML"])
PY

EPOCH="$EPOCH" CANON_DOCS="$CANON_DOCS" python3 scripts/ci/update-canon-lock.py
python3 scripts/ci/check-canon.py || true

# 6) Commit + push
git add .gitignore docs/policies/mcp-allowlist.json scripts/hooks/path_guard.py pre-commit-config.yaml scripts/ci/update-canon-lock.py scripts/ci/check-canon.py canon.lock 2>/dev/null || true
git commit -m "chore(guardrails): secrets hygiene, MCP allowlist, Path Guard hook, canon lock/update scripts" || true

if git remote get-url origin >/dev/null 2>&1; then
  log "Pushing to origin/main…"
  git push -u origin main || true
else
  warn "No 'origin' remote set. Create a GitHub repo and:  git remote add origin <url> ; git push -u origin main"
fi

# 7) GitHub branch protections (baseline) if gh available + authenticated
if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then
    if [ -z "${REPO_SLUG:-}" ]; then
      # derive from git remote url
      url="$(git remote get-url origin 2>/dev/null || true)"
      if echo "$url" | grep -qi github.com; then
        # parse owner/repo
        REPO_SLUG="$(echo "$url" | sed -E 's#.*github.com[:/](.+)/([^/]+)(\.git)?#\1/\2#')"
      fi
    fi
    if [ -n "${REPO_SLUG:-}" ]; then
      log "Applying baseline branch protection to $REPO_SLUG/main"
      gh api -X PUT "repos/${REPO_SLUG}/branches/main/protection" \
        -f required_status_checks.strict=true \
        -f enforce_admins=true \
        -f required_pull_request_reviews.dismiss_stale_reviews=true \
        -f required_pull_request_reviews.required_approving_review_count=1 \
        -f required_pull_request_reviews.require_code_owner_reviews=true \
        -f restrictions= \
        -f allow_deletions=false \
        -f block_creations=true \
        -f required_linear_history=true \
        -f allow_force_pushes=false >/dev/null
      log "Branch protection applied (mark CI checks as 'required' after first run)."
    else
      warn "Could not determine REPO_SLUG for GitHub protection. Set REPO_SLUG=owner/repo and re-run."
    fi
  else
    warn "GitHub CLI not authenticated. Run: gh auth login ; then re-run this script to apply branch protection."
  fi
else
  warn "GitHub CLI not installed. Skip branch protection step."
fi

log "Guardrails done. Optional runtime setting:
- Export ALLOWED_PATH_PREFIX to constrain commits for a shift, e.g.:
    export ALLOWED_PATH_PREFIX='apps/admin/'
- Pre-commit is installed; Path Guard activates only if ALLOWED_PATH_PREFIX is set.
- CI will enforce branch names / evidence / canon once you push and open PRs."
