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
