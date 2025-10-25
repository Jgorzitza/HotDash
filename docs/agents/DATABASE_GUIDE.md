# Agent Database Guide - Which Database to Use

**CRITICAL: We have TWO separate databases. Use the RIGHT one for your task.**

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
- audit_log (security auditing)
- SeoAudit (SEO tracking)
- action_queue (agent actions)
- And 100+ other business tables

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
await kbPrisma.audit_log.create(...);  // ❌ audit_log is NOT in KB database
await kbPrisma.seoAudit.create(...);   // ❌ SeoAudit is NOT in KB database
```

**Error you'll get:**
```
Invalid `prisma.audit_log.create()` invocation:
The table `public.audit_log` does not exist in the current database.
```

### ✅ CORRECT: Use production database for production work
```typescript
// DO THIS
import prisma from './app/db.server';
await prisma.audit_log.create(...);   // ✅ audit_log is in production DB
await prisma.seoAudit.create(...);    // ✅ SeoAudit is in production DB
```

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
await prisma.seoAudit.create({...});    // ✅ SeoAudit in production DB

// For logging your progress:
import { logDecision } from './app/services/decisions.server';
await logDecision({
  scope: 'build',
  actor: 'seo',
  action: 'task_completed',
  rationale: 'Completed SEO audit for homepage',
});
```

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
| Security audit | Production | `import prisma from './app/db.server'` |
| SEO tracking | Production | `import prisma from './app/db.server'` |
| Customer data | Production | `import prisma from './app/db.server'` |
| Orders | Production | `import prisma from './app/db.server'` |

## Error Messages

### "Table does not exist in current database"
**Cause:** You're using the wrong database

**Fix:** Check which database has that table:
- `audit_log`, `SeoAudit`, `DashboardFact`, `Session`, etc. → Production DB
- `DecisionLog`, `TaskAssignment` → KB DB

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

