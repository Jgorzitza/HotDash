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
