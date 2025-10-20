# Data Direction v5.1

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
git branch --show-current  # Verify: should show manager-reopen-20251020
```


**Owner**: Manager  
**Effective**: 2025-10-20T22:00Z  
**Version**: 6.2  
**Status**: ACTIVE — Option A Database Support (Manager applies migrations after CEO approval)

---

## Objective

**Create and apply database tables** for Option A features (Phases 2-13)

**Primary Reference**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan — LOCKED)

**Current Priority**: P0 - Create Phase 2 tables IMMEDIATELY (Engineer blocked)

---

## P0 URGENT: Chatwoot Database Migrations (START IMMEDIATELY)

**Blocker**: Chatwoot service running but database schema incomplete - blocks Support testing & AI-Customer

**Issue Identified**: `ERROR: column "settings" does not exist` in `accounts` table
- Service: https://hotdash-chatwoot.fly.dev (HTTP 200 ✅)
- Database: hotdash-chatwoot-db.flycast:5432/postgres
- Problem: Fresh database created but Chatwoot migrations NOT run
- Impact: API returns 401/404, blocks SUPPORT-001, SUPPORT-002, AI-Customer testing

**Your Task**: Run Chatwoot database migrations to complete schema

### Option A: Via Fly SSH (RECOMMENDED)
```bash
# Connect to Chatwoot app
fly ssh console -a hotdash-chatwoot

# Run Rails migrations
bundle exec rails db:migrate

# Verify accounts table has settings column
bundle exec rails runner "puts Account.column_names.include?('settings')"

# Exit
exit
```

### Option B: If Rails unavailable, apply SQL manually
```bash
# Get Chatwoot schema SQL from official repo
# Apply to database using credentials from vault/occ/chatwoot/database_production.env
```

**Verification**:
1. Check logs: `fly logs -a hotdash-chatwoot | grep "ERROR.*settings"`
2. Should see NO more "column settings does not exist" errors
3. Test API: Support's health check should pass
4. Confirm in manager feedback when complete

**Time**: 15-30 minutes
**Priority**: P0 - Blocks Support agent SUPPORT-001, AI-Customer testing
**Credentials**: `vault/occ/chatwoot/database_production.env`

---

## Day 1 Tasks (AFTER CHATWOOT) — CREATE ALL TABLES UPFRONT

**Strategy**: Build ALL 4 tables NOW (don't wait for phases) → Unblocks Engineer completely

### DATA-001: Create Sales Pulse Actions Table

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

### DATA-002: Create Inventory Actions Table

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

### DATA-003: Notify for Migration Application

**Your Job**: Create migration files + update Prisma schema → Notify CEO when ready

**Manager's Job**: Apply migrations via `psql` after CEO approval

**Process**:
1. You create all migration files (DATA-001, DATA-002, DATA-004, DATA-005, DATA-006)
2. You update `prisma/schema.prisma` with all models
3. You report in feedback: "✅ All 5 migrations ready to apply - awaiting CEO approval"
4. CEO reviews and approves
5. Manager applies migrations: `psql "$DATABASE_URL" -f supabase/migrations/*.sql`
6. You verify tables exist (Manager will confirm)

**DO NOT**:
- ❌ Try to apply migrations yourself (wait for CEO approval)
- ❌ Add migration commands to deployment files
- ❌ Skip notification step (CEO must approve database changes)

**Evidence Required** (after migrations applied):
- Migration files created: `supabase/migrations/*.sql` (list files)
- Prisma models updated: `prisma/schema.prisma` (list models)
- Validation passed: `npx prisma validate` output

**UNBLOCKS**: Engineer can proceed with Phase 2 modals (after migrations applied)

---

### DATA-004: Notifications Table — DAY 1

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

### DATA-005: User Preferences Table — DAY 1

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

### DATA-006: Social Posts Table — DAY 1 [If Needed]

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

## Credential & Blocker Protocol

### If You Need Credentials:

**Step 1**: Check `vault/` directory first
- Supabase credentials: `vault/occ/supabase/`
- Other services: `vault/occ/<service-name>/`

**Step 2**: If not in vault, report in feedback:
```md
## HH:MM - Credential Request
**Need**: [specific credential name, e.g., "Supabase service account key"]
**For**: [what task/feature, e.g., "Applying migrations"]
**Checked**: vault/occ/supabase/ (not found)
**Status**: Paused, waiting for CEO
```

**Step 3**: Move to next task immediately (don't wait idle)

### If You Hit a True Blocker:

**Before reporting blocker, verify you**:
1. ✅ Checked vault for credentials
2. ✅ Inspected codebase for existing patterns
3. ✅ Pulled Context7 docs for the library
4. ✅ Reviewed RULES.md and relevant direction sections

**If still blocked**:
```md
## HH:MM - Blocker Report
**Blocked On**: [specific issue]
**What I Tried**: [list 3+ things you attempted]
**Vault Checked**: [yes/no, paths checked]
**Docs Pulled**: [Context7 libraries consulted]
**Asking CEO**: [specific question or guidance needed]
**Moving To**: [next task ID you're starting]
```

**Then immediately move to next task** - CEO will respond when available

**Key Principle**: NEVER sit idle. If one task blocked → start next task right away.

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

**Day 1** — START NOW:
- DATA-001: sales_pulse_actions
- DATA-002: inventory_actions
- DATA-003: CEO applies migrations via Supabase console
- DATA-004: notifications
- DATA-005: user_preferences
- DATA-006: social_posts (if needed)

**Result**: ALL tables ready upfront → Engineer NEVER blocked

---

## Quick Reference

**Plan**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan)
**Schema**: `prisma/schema.prisma`
**Rules**: `docs/RULES.md` (Database Safety section)
**Feedback**: `feedback/data/2025-10-20.md`
**Startup**: `docs/runbooks/agent_startup_checklist.md`

---

**START WITH**: DATA-001 + DATA-002 (create Phase 2 tables — UNBLOCK ENGINEER)
