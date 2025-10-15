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
