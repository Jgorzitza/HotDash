# Agent Database Guide - Which Database to Use

**🚨 CRITICAL: Read this BEFORE writing ANY database code 🚨**

## TL;DR - The Only Thing You Need to Know

**For logging YOUR progress/feedback:**
```bash
cp scripts/agent/log-feedback.ts /tmp/my-feedback.ts
code /tmp/my-feedback.ts
npx tsx --env-file=.env /tmp/my-feedback.ts
```

**For EVERYTHING ELSE (your actual work):**
```typescript
import prisma from './app/db.server';
```

**That's it. Stop overthinking it.**

---

## Common Errors & Fixes

### Error: "audit_log table does not exist"
**Problem:** There is NO `audit_log` table in ANY database.

**Fix:** Use `pii_audit_log` instead:
```typescript
import prisma from './app/db.server';
await prisma.pii_audit_log.create({...});  // ✅ CORRECT
```

### Error: "SeoAudit does not exist in current database"
**Problem:** You're using KB database for production work.

**Fix:** Use production database:
```typescript
import prisma from './app/db.server';  // NOT kbPrisma!
await prisma.seoAudit.create({...});   // ✅ CORRECT
```

### Error: "DecisionLog does not exist in current database"
**Problem:** You're using production database for feedback.

**Fix:** Use template pattern or logDecision():
```bash
cp scripts/agent/log-feedback.ts /tmp/my-feedback.ts
code /tmp/my-feedback.ts
npx tsx --env-file=.env /tmp/my-feedback.ts
```

---

## The Problem

Agents keep trying to use tables that don't exist because they're confused about which database to use.

**Common errors:**
- ❌ "audit_log table does not exist" - Because there IS NO `audit_log` table (use `pii_audit_log` instead)
- ❌ "SeoAudit not in KB database" - Because KB database is ONLY for feedback, not SEO work
- ❌ "DecisionLog not in production" - Because DecisionLog is ONLY in KB database

---

## We Have TWO Databases

## The Two Databases

### 1. Production Database (Business Data)
**Use for:** Your actual work (Shopify data, customers, orders, analytics, etc.)

**Import:**
```typescript
import prisma from './app/db.server';
```

**Tables include:**
- Session (Shopify OAuth)
- DashboardFact (analytics)
- knowledge_base (KB articles)
- pii_audit_log (PII security auditing) - **NOTE: NOT `audit_log`**
- SeoAudit (SEO tracking - camelCase)
- seo_audits (SEO tracking - snake_case)
- action_queue (agent actions)
- And 100+ other business tables

**⚠️ IMPORTANT:** There is NO `audit_log` table. Use `pii_audit_log` instead.

**When to use:**
- ✅ Querying Shopify data
- ✅ Storing business analytics
- ✅ Security auditing
- ✅ SEO tracking
- ✅ Any production feature work

### 2. KB Database (Development Coordination)
**Use for:** Logging your progress, tasks, and feedback ONLY

**Import:**
```typescript
import kbPrisma from './app/kb-db.server';
// OR use the template pattern (recommended)
```

**Tables include:**
- DecisionLog (your feedback/progress)
- TaskAssignment (your assigned tasks)
- **THAT'S IT - ONLY 2 TABLES**

**When to use:**
- ✅ Logging task progress
- ✅ Reporting blockers
- ✅ Daily feedback
- ✅ Task status updates

## Common Mistakes

### ❌ WRONG: Using KB database for production work
```typescript
// DON'T DO THIS
import kbPrisma from './app/kb-db.server';
await kbPrisma.pii_audit_log.create(...);  // ❌ pii_audit_log is NOT in KB database
await kbPrisma.seoAudit.create(...);       // ❌ SeoAudit is NOT in KB database
```

**Error you'll get:**
```
Invalid `prisma.pii_audit_log.create()` invocation:
The table `public.pii_audit_log` does not exist in the current database.
```

**Why:** KB database ONLY has DecisionLog and TaskAssignment. Everything else is in Production DB.

### ✅ CORRECT: Use production database for production work
```typescript
// DO THIS
import prisma from './app/db.server';
await prisma.pii_audit_log.create(...);  // ✅ pii_audit_log is in production DB
await prisma.seoAudit.create(...);       // ✅ SeoAudit is in production DB (camelCase)
await prisma.seo_audits.create(...);     // ✅ seo_audits is in production DB (snake_case)
```

**⚠️ NOTE:** There is NO `audit_log` table. Use `pii_audit_log` instead.

### ❌ WRONG: Using production database for feedback
```typescript
// DON'T DO THIS
import prisma from './app/db.server';
await prisma.decisionLog.create(...);  // ❌ Will fail - DecisionLog not in production schema
```

### ✅ CORRECT: Use KB database for feedback
```typescript
// DO THIS - Use template pattern
cp scripts/agent/log-feedback.ts /tmp/my-feedback.ts
code /tmp/my-feedback.ts
npx tsx --env-file=.env /tmp/my-feedback.ts

// OR in code:
import { logDecision } from './app/services/decisions.server';
await logDecision({
  scope: 'build',
  actor: 'seo',
  action: 'task_completed',
  rationale: 'Completed SEO audit',
});
```

## Decision Tree: Which Database?

```
What are you doing?
│
├─ Logging task progress/feedback?
│  └─ Use KB Database (template pattern or logDecision())
│
├─ Working on production feature?
│  └─ Use Production Database (import prisma from './app/db.server')
│
├─ Storing business data (Shopify, customers, orders)?
│  └─ Use Production Database
│
├─ Security auditing?
│  └─ Use Production Database (audit_log table)
│
├─ SEO tracking?
│  └─ Use Production Database (SeoAudit table)
│
└─ Not sure?
   └─ Ask: "Is this about MY work progress?" 
      YES → KB Database
      NO → Production Database
```

## Examples by Agent

### SEO Agent

**❌ WRONG:**
```typescript
import kbPrisma from './app/kb-db.server';
await kbPrisma.seoAudit.create({...});  // ❌ SeoAudit not in KB DB
```

**✅ CORRECT:**
```typescript
// For SEO work (production feature):
import prisma from './app/db.server';
await prisma.seoAudit.create({...});    // ✅ SeoAudit in production DB (camelCase)
// OR
await prisma.seo_audits.create({...});  // ✅ seo_audits in production DB (snake_case)

// For logging your progress:
import { logDecision } from './app/services/decisions.server';
await logDecision({
  scope: 'build',
  actor: 'seo',
  action: 'task_completed',
  rationale: 'Completed SEO audit for homepage',
});
```

**⚠️ NOTE:** Use `pii_audit_log` for security auditing, NOT `audit_log` (doesn't exist).

### DATA Agent

**❌ WRONG:**
```typescript
import kbPrisma from './app/kb-db.server';
await kbPrisma.dashboardFact.create({...});  // ❌ DashboardFact not in KB DB
```

**✅ CORRECT:**
```typescript
// For analytics work (production feature):
import prisma from './app/db.server';
await prisma.dashboardFact.create({...});    // ✅ DashboardFact in production DB

// For logging your progress:
import { logDecision } from './app/services/decisions.server';
await logDecision({
  scope: 'build',
  actor: 'data',
  action: 'task_completed',
  rationale: 'Completed analytics dashboard',
});
```

### ENGINEER Agent

**❌ WRONG:**
```typescript
import kbPrisma from './app/kb-db.server';
await kbPrisma.session.findMany();  // ❌ Session not in KB DB
```

**✅ CORRECT:**
```typescript
// For session management (production feature):
import prisma from './app/db.server';
await prisma.session.findMany();    // ✅ Session in production DB

// For logging your progress:
import { logDecision } from './app/services/decisions.server';
await logDecision({
  scope: 'build',
  actor: 'engineer',
  action: 'task_completed',
  rationale: 'Completed session management feature',
});
```

## Quick Reference

| Task | Database | Import |
|------|----------|--------|
| Log task progress | KB | `logDecision()` or template |
| Report blocker | KB | `logDecision()` with `status: 'blocked'` |
| Daily feedback | KB | Template pattern |
| Shopify data | Production | `import prisma from './app/db.server'` |
| Analytics | Production | `import prisma from './app/db.server'` |
| PII Security audit | Production | `prisma.pii_audit_log` (NOT audit_log) |
| SEO tracking | Production | `prisma.seoAudit` or `prisma.seo_audits` |
| Customer data | Production | `import prisma from './app/db.server'` |
| Orders | Production | `import prisma from './app/db.server'` |

## Error Messages

### "Table does not exist in current database"
**Cause:** You're using the wrong database

**Fix:** Check which database has that table:
- `pii_audit_log` (NOT audit_log), `SeoAudit`, `DashboardFact`, `Session`, etc. → Production DB
- `DecisionLog`, `TaskAssignment` → KB DB

**Common mistake:** Trying to use `audit_log` - this table DOES NOT EXIST. Use `pii_audit_log` instead.

### "Invalid Prisma Client"
**Cause:** You're importing the wrong client

**Fix:**
- Production work: `import prisma from './app/db.server'`
- Feedback: Use `logDecision()` or template pattern

## Summary

**Simple rule:**
- **Your work** (features, data, production) → Production Database
- **Your progress** (feedback, tasks, status) → KB Database

**When in doubt:**
- If it's about what you're DOING → Production DB
- If it's about REPORTING what you did → KB DB

---

**Questions?** See `docs/agents/FEEDBACK_QUICK_START.md` for feedback logging.

