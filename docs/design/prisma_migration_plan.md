---
epoch: 2025.10.E1
doc: docs/design/prisma_migration_plan.md
owner: manager
last_reviewed: 2025-10-04
doc_hash: TBD
expires: 2025-10-18
---
# Prisma Migration Plan — Dashboard Facts & Decisions

## Summary
Introduce persistence for dashboard metrics and approvals audit trail via two new tables: `DashboardFact` and `DecisionLog`. These tables back the Operator Control Center tiles and enforce evidence logging.

## Models
```prisma
model DashboardFact {
  id          Int      @id @default(autoincrement())
  shopDomain  String
  factType    String
  scope       String?
  value       Json
  metadata    Json?
  evidenceUrl String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([shopDomain, factType])
  @@index([createdAt])
}

model DecisionLog {
  id          Int      @id @default(autoincrement())
  scope       String
  actor       String
  action      String
  rationale   String?
  evidenceUrl String?
  shopDomain  String?
  externalRef String?
  payload     Json?
  createdAt   DateTime @default(now())

  @@index([scope, createdAt])
}
```

## Migration Steps
1. Create migration `20251004_init_dashboard_tables` via `npx prisma migrate dev --create-only` to generate SQL for SQLite.
2. Verify generated SQL for forward/backward compatibility; ensure default timestamps supported.
3. Update `prisma/seed.ts` (to be created) to insert baseline records for local dev if necessary.
4. Regenerate Prisma client (`npm run prisma generate`).

## Data Access Patterns
- Services write aggregated metrics to `DashboardFact` with a deterministic `factType` (e.g., `shopify.sales.summary`).
- Dashboard loader reads most recent fact per `factType` sorted by `createdAt`.
- Decisions action writes to both Prisma `DecisionLog` and Supabase memory for redundancy.

## Testing Plan
- Vitest integration tests using in-memory SQLite to validate CRUD operations.
- Ensure migrations run as part of CI `npm run setup`.

## Rollback Plan
- Prisma handles `prisma migrate resolve --rolled-back` if issues appear; we can drop tables without affecting sessions.

## Open Questions
- Need naming conventions for `factType` (proposal: `<source>.<domain>.<metric>`).
- Confirm whether to add foreign key to `DecisionLog` referencing `DashboardFact` for derived approvals.
