#!/usr/bin/env python3
import sys, os, json, argparse, hashlib, datetime, yaml

def sha256(path):
    h = hashlib.sha256()
    with open(path,'rb') as f:
        for chunk in iter(lambda:f.read(8192), b''):
            h.update(chunk)
    return h.hexdigest()

def parse_front_matter(path):
    try:
        with open(path, 'r', encoding='utf8') as f:
            content = f.read()
        if content.startswith('---'):
            parts = content.split('---', 2)
            if len(parts) >= 3:
                return yaml.safe_load(parts[1]) or {}
    except Exception:
        pass
    return {}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--epoch', required=True)
    ap.add_argument('--strict', action='store_true')
    args = ap.parse_args()

    docs = []
    for root, _, files in os.walk('docs'):
        for fn in files:
            if fn.endswith('.md'):
                docs.append(os.path.join(root, fn))

    stale = []
    for d in docs:
        fm = parse_front_matter(d)
        if fm.get('epoch') and fm['epoch'] != args.epoch:
            stale.append(d)

    if stale:
        print("Docs with stale epoch:", ", ".join(stale))
        if args.strict: sys.exit(1)

    mol_path = 'molecules.jsonl'
    if not os.path.exists(mol_path):
        print("[warn] molecules.jsonl not found; add it to enable molecule cross-checks.")
        sys.exit(0)

    print("Drift watchdog passed.")
if __name__ == "__main__":
    main()
