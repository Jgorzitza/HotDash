# Pilot Scaffold

Scope

- Isolated sidecar under `packages/pilot/` and `scripts/pilot/`, no side effects, flags OFF.
- Pure functions only; inputs/outputs are JSON-serializable.

Quick Check

```bash
node scripts/pilot/check.mjs
```

Status

```bash
node scripts/pilot/run.mjs status
```

Direction

- See `docs/directions/pilot.md` for Autonomy Mode (15‑minute rule) and the fallback queue.

Generate sequence docs

```bash
node scripts/pilot/generate-sequence.mjs
```
