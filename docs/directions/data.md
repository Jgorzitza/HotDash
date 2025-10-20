# Data Direction v6.0

**Owner**: Manager  
**Effective**: 2025-10-20T20:00Z  
**Version**: 6.0  
**Status**: ACTIVE — Option A Database Support

---

## Objective

**Create and apply database tables** for Option A features (Phases 2-13)

**Primary Reference**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan — LOCKED)

**Current Priority**: P0 - Create Phase 2 tables IMMEDIATELY (Engineer blocked)

---

## Day 1 Tasks (START NOW - 3h) — CREATE ALL TABLES UPFRONT

**Strategy**: Build ALL 4 tables NOW (don't wait for phases) → Unblocks Engineer completely

### DATA-001: Create Sales Pulse Actions Table (20 min)

**Create migration**: `supabase/migrations/YYYYMMDDHHMMSS_create_sales_pulse_actions.sql`

```sql
CREATE TABLE IF NOT EXISTS sales_pulse_actions (
  id SERIAL PRIMARY KEY,
  shop_domain TEXT NOT NULL,
  variance_pct DECIMAL(5,2),
  action_type TEXT NOT NULL, -- 'log_follow_up', 'escalate_to_ops', 'no_action'
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX idx_sales_actions_shop ON sales_pulse_actions(shop_domain, created_at DESC);

-- RLS policies
ALTER TABLE sales_pulse_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shop sales actions"
  ON sales_pulse_actions FOR SELECT
  USING (shop_domain = current_setting('app.current_shop', true));

CREATE POLICY "Users can insert own shop sales actions"
  ON sales_pulse_actions FOR INSERT
  WITH CHECK (shop_domain = current_setting('app.current_shop', true));
```

**Add to Prisma schema**:
```prisma
model SalesPulseAction {
  id          Int      @id @default(autoincrement())
  shopDomain  String   @map("shop_domain")
  variancePct Decimal? @map("variance_pct") @db.Decimal(5, 2)
  actionType  String   @map("action_type")
  notes       String?
  createdBy   String   @map("created_by")
  createdAt   DateTime @default(now()) @map("created_at")
  metadata    Json?

  @@index([shopDomain, createdAt(sort: Desc)])
  @@map("sales_pulse_actions")
  @@schema("public")
}
```

**CRITICAL**: Add `@@schema("public")` to avoid P1012 error

---

### DATA-002: Create Inventory Actions Table (20 min)

**Create migration**: `supabase/migrations/YYYYMMDDHHMMSS_create_inventory_actions.sql`

```sql
CREATE TABLE IF NOT EXISTS inventory_actions (
  id SERIAL PRIMARY KEY,
  shop_domain TEXT NOT NULL,
  sku TEXT NOT NULL,
  product_name TEXT,
  action_type TEXT NOT NULL, -- 'approve_reorder', 'skip', 'remind_later'
  quantity INT,
  vendor TEXT,
  days_of_cover DECIMAL(5,2),
  velocity_14d DECIMAL(8,2),
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX idx_inventory_actions_shop_sku ON inventory_actions(shop_domain, sku, created_at DESC);

-- RLS policies
ALTER TABLE inventory_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own shop inventory actions"
  ON inventory_actions FOR SELECT
  USING (shop_domain = current_setting('app.current_shop', true));

CREATE POLICY "Users can insert own shop inventory actions"
  ON inventory_actions FOR INSERT
  WITH CHECK (shop_domain = current_setting('app.current_shop', true));
```

**Add to Prisma schema**:
```prisma
model InventoryAction {
  id           Int      @id @default(autoincrement())
  shopDomain   String   @map("shop_domain")
  sku          String
  productName  String?  @map("product_name")
  actionType   String   @map("action_type")
  quantity     Int?
  vendor       String?
  daysOfCover  Decimal? @map("days_of_cover") @db.Decimal(5, 2)
  velocity14d  Decimal? @map("velocity_14d") @db.Decimal(8, 2)
  createdBy    String   @map("created_by")
  createdAt    DateTime @default(now()) @map("created_at")
  metadata     Json?

  @@index([shopDomain, sku, createdAt(sort: Desc)])
  @@map("inventory_actions")
  @@schema("public")
}
```

**CRITICAL**: Add `@@schema("public")` to avoid P1012 error

---

### DATA-003: Apply Migrations to Staging (10 min)

**After creating migrations**:

```bash
# DO NOT add to fly.toml or package.json (database safety policy)

# Manual application via psql:
# (Manager will coordinate Supabase console access or provide connection)

# Verify tables created:
# SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%_actions';
```

**Evidence Required**:
- Screenshot of tables in Supabase dashboard
- Row count (should be 0 initially)
- RLS policies enabled

**UNBLOCKS**: Engineer can proceed with ENG-006, ENG-007

---

### DATA-004: Notifications Table (20 min) — DAY 1

**Create**: notifications table for notification system

```sql
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'approval', 'alert', 'system', 'escalation'
  priority TEXT NOT NULL, -- 'critical', 'high', 'medium', 'low'
  title TEXT NOT NULL,
  message TEXT,
  action_url TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;
```

---

### DATA-005: User Preferences Table (20 min) — DAY 1

**Create**: user_preferences for personalization

```sql
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY,
  tile_order TEXT[],
  visible_tiles TEXT[],
  default_view TEXT, -- 'grid' or 'list'
  theme TEXT, -- 'light', 'dark', 'auto'
  notification_prefs JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### DATA-006: Social Posts Table (20 min) — DAY 1 [If Needed]

**Check if exists first**: May already be in schema

If NOT exists, create NOW:

```sql
CREATE TABLE IF NOT EXISTS social_posts (
  id SERIAL PRIMARY KEY,
  shop_domain TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'facebook', 'instagram', 'twitter', 'linkedin'
  status TEXT NOT NULL, -- 'draft', 'approved', 'published', 'failed'
  content TEXT NOT NULL,
  media_urls TEXT[],
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  publer_post_id TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX idx_social_posts_shop_status ON social_posts(shop_domain, status, created_at DESC);
```

---

## Work Protocol

### 1. Before Creating ANY Migration:

**Pull Context7 Docs** (MANDATORY):
```bash
# Prisma multi-schema support:
mcp_context7_get-library-docs("/prisma/docs", "multi-schema")

# Supabase RLS policies:
mcp_context7_get-library-docs("/supabase/supabase", "row-level-security")
```

**Log in feedback**:
```md
## HH:MM - Context7: Prisma
- Topic: multi-schema @@schema attribute
- Key Learning: ALL models need @@schema("public") when datasource has schemas array
- Applied to: prisma/schema.prisma (SalesPulseAction, InventoryAction)
```

### 2. Migration Safety Checklist:

**BEFORE creating migration**:
- [ ] Additive only (no DROP, ALTER with data loss)
- [ ] RLS policies included
- [ ] Indexes for performance
- [ ] Prisma schema updated with `@@schema("public")`
- [ ] No migration commands in deployment files (fly.toml, package.json)

**AFTER creating migration**:
- [ ] Run `npx prisma format` on schema
- [ ] Run `npx prisma validate`
- [ ] Test locally if possible
- [ ] Document in feedback with table name, purpose, columns

### 3. Database Safety Policy:

**ALLOWED**:
- ✅ Create new tables
- ✅ Add columns to existing tables
- ✅ Create indexes
- ✅ Add RLS policies

**FORBIDDEN in Deployment Files**:
- ❌ `prisma migrate deploy` in fly.toml or package.json
- ❌ `prisma db push` in deployment paths
- ❌ ANY command that modifies schema automatically

**How Migrations Are Applied**:
1. You create migration file
2. You update Prisma schema
3. **Manager manually applies** via Supabase console or psql
4. You verify tables exist
5. Engineer can use new tables

**See**: `docs/RULES.md` Database Safety section

---

## Reporting Requirements

**Report every 2 hours** in `feedback/data/2025-10-20.md`:

```md
## YYYY-MM-DDTHH:MM:SSZ — Data: Phase N Table Creation

**Working On**: Creating [table_name] for Phase N
**Progress**: Migration file created, Prisma schema updated

**Evidence**:
- Migration: supabase/migrations/[timestamp]_[name].sql (X lines)
- Prisma: Added [ModelName] with @@schema("public")
- Context7: Pulled /prisma/docs topic: multi-schema
- Validation: npx prisma validate → PASS

**Blockers**: None (or waiting for Manager to apply migration)

**Next**: Verify table in Supabase dashboard after Manager applies
```

---

## Definition of Done (Each Table)

**Migration File**:
- [ ] Additive only (CREATE TABLE, CREATE INDEX)
- [ ] RLS policies included
- [ ] Indexes for query performance
- [ ] No DROP or destructive commands

**Prisma Schema**:
- [ ] Model added with correct field types
- [ ] `@@schema("public")` attribute present
- [ ] Index declarations match SQL
- [ ] Map names match SQL (snake_case → camelCase)
- [ ] `npx prisma format` passing
- [ ] `npx prisma validate` passing

**Verification** (After Manager applies):
- [ ] Table exists in Supabase dashboard
- [ ] RLS policies active
- [ ] Can insert test row
- [ ] Can query test row

**Evidence**:
- [ ] Feedback updated with file paths, line counts
- [ ] Context7 docs pulled for Prisma/Supabase
- [ ] Screenshot of table in Supabase (if possible)

---

## Critical Reminders

**DO**:
- ✅ Add `@@schema("public")` to EVERY model
- ✅ Pull Context7 docs before creating migrations
- ✅ Create RLS policies for security
- ✅ Coordinate with Manager for migration application

**DO NOT**:
- ❌ Add migration commands to fly.toml or package.json
- ❌ Use `prisma db push` in deployment
- ❌ Create migrations without `@@schema` attribute
- ❌ Skip RLS policies (security requirement)

---

## Phase Schedule

**Day 1** (3h) — START NOW:
- DATA-001: sales_pulse_actions (20 min)
- DATA-002: inventory_actions (20 min)
- DATA-003: Apply migrations (10 min)
- DATA-004: notifications (20 min)
- DATA-005: user_preferences (20 min)
- DATA-006: social_posts (20 min, if needed)

**Result**: ALL tables ready upfront → Engineer NEVER blocked

**Total**: 3 hours Day 1, then ongoing support

---

## Quick Reference

**Plan**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan)
**Schema**: `prisma/schema.prisma`
**Rules**: `docs/RULES.md` (Database Safety section)
**Feedback**: `feedback/data/2025-10-20.md`
**Startup**: `docs/runbooks/agent_startup_checklist.md`

---

**START WITH**: DATA-001 + DATA-002 (create Phase 2 tables — UNBLOCK ENGINEER)
