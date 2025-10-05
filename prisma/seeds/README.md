# Prisma Seeds — Operator Control Center

## Purpose
This directory contains seed scripts for populating development and test databases with baseline data. Seeds are used to:
- Provide realistic data for local development
- Enable testing of dashboard tiles without live API connections
- Demonstrate anomaly detection and KPI calculations
- Support migration QA for schema changes

---

## Seed Scripts

### `dashboard-facts.seed.ts`
Seeds the `DashboardFact` and `DecisionLog` tables with sample data representing:
- **Sales summaries**: 7 days of revenue data with simulated anomaly (30% drop on current day)
- **CX escalations**: 2 breached conversations from Chatwoot
- **GA session anomalies**: 3 landing pages with traffic trends
- **Inventory coverage**: 3 SKUs with varying days-of-cover
- **Fulfillment issues**: 2 pending orders exceeding processing window
- **Decision logs**: 3 operator/system decisions

**Shop Domain**: `dev-shop.myshopify.com` (used as default for all seeded data)

---

## Running Seeds

### Local Development (SQLite)
```bash
npx tsx prisma/seeds/dashboard-facts.seed.ts
```

### Staging/Production (Postgres)
```bash
DATABASE_URL="postgresql://..." npx tsx prisma/seeds/dashboard-facts.seed.ts
```

**Note**: Seeds clear existing data for `dev-shop.myshopify.com` before inserting. Do not run on production databases with real shop data.

---

## Backfill Scripts

Backfill scripts migrate or transform existing data during schema changes. Coordinate with engineer before creating backfill scripts.

### Example: Backfill `evidenceUrl` for existing facts
```typescript
// prisma/seeds/backfill-evidence-urls.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function backfillEvidenceUrls() {
  const facts = await prisma.dashboardFact.findMany({
    where: { evidenceUrl: null },
  });

  for (const fact of facts) {
    // Generate evidence URL based on factType
    let evidenceUrl: string | null = null;
    if (fact.factType.startsWith("shopify.")) {
      evidenceUrl = `https://${fact.shopDomain}/admin/orders`;
    } else if (fact.factType.startsWith("chatwoot.")) {
      evidenceUrl = `https://chatwoot.example.com/app/accounts/1/conversations`;
    }

    if (evidenceUrl) {
      await prisma.dashboardFact.update({
        where: { id: fact.id },
        data: { evidenceUrl },
      });
    }
  }

  console.log(`✓ Backfilled ${facts.length} evidence URLs`);
}

backfillEvidenceUrls();
```

---

## Migration QA Process

When a Prisma schema change requires backfill or data transformation:

1. **Engineer** creates migration: `npx prisma migrate dev --name <migration_name>`
2. **Data agent** reviews schema diff and identifies data impact
3. **Data agent** writes backfill script (if needed) in `prisma/seeds/backfill-*.ts`
4. **Engineer** tests migration + backfill on SQLite (dev) and Postgres (staging)
5. **Data agent** validates data integrity post-migration
6. **Manager** approves migration PR with evidence (test logs, screenshots)

### QA Checklist
- [ ] Migration runs without errors on SQLite
- [ ] Migration runs without errors on Postgres
- [ ] Backfill script completes without data loss
- [ ] Dashboard tiles render correctly with migrated data
- [ ] Evidence links logged in PR (migration output, test results)

---

## Testing with Seeds

### Vitest Unit Tests
Use seed data patterns in test fixtures:
```typescript
import { seedDashboardFacts } from "../prisma/seeds/dashboard-facts.seed";

beforeEach(async () => {
  await seedDashboardFacts();
});

test("calculates sales delta correctly", async () => {
  const facts = await prisma.dashboardFact.findMany({
    where: { factType: "shopify.sales.summary" },
  });
  expect(facts.length).toBeGreaterThan(0);
});
```

### Playwright E2E Tests
Seed database before running E2E tests to ensure consistent state:
```bash
npx tsx prisma/seeds/dashboard-facts.seed.ts && npx playwright test
```

---

## References
- Schema: `prisma/schema.prisma`
- KPI Definitions: `docs/data/kpis.md`
- Data Contracts: `docs/data/data_contracts.md`
- Direction: `docs/directions/data.md`
