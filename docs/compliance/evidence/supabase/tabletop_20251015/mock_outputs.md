---
epoch: 2025.10.E1
doc: docs/compliance/evidence/supabase/tabletop_20251015/mock_outputs.md
owner: compliance
last_reviewed: 2025-10-15
doc_hash: TBD
expires: 2026-01-15
---
# Mock Outputs — Supabase Tabletop 2025-10-15

## Detection Evidence
```
2025-10-15T18:07:12Z grafana.occ
ALERT: Supabase Audit Log Anomaly — Unknown IP 203.0.113.88 accessed `decision_log`.
Action: Paging reliability@hotdash.internal (Supabase On-call).
```

## Audit Log Excerpt (Simulated)
```json
{
  "event": "access",
  "schema": "public",
  "table": "decision_log",
  "role": "service_key",
  "client_ip": "203.0.113.88",
  "timestamp": "2025-10-15T18:06:52Z",
  "details": "SELECT * FROM decision_log LIMIT 200",
  "hash_reference": "d34d7a73e8c25678947f4f283d75dc8ed934bdc1cbc0b493df9280b392637f26"
}
```

## Parity Check Summary (Post-Rotation)
```json
{
  "event": "analytics.parity.check",
  "timestamp": "2025-10-15T18:42:11Z",
  "result": {
    "supabaseRows": 0,
    "prismaRows": 0,
    "diff": 0
  },
  "notes": "Outputs mirrored existing artifact `artifacts/monitoring/supabase-parity-2025-10-10T19-27-30Z.json`."
}
```

## Communication Draft Snippet
```
Operators: We detected and contained an issue with our Supabase decision log replica. Audit trails remain intact in Prisma, and retention jobs are confirmed. No customer-facing action required.
```
