# 🚨 READ THIS BEFORE WRITING ANY CODE 🚨

## You Keep Making the Same Mistakes

### Mistake #1: "audit_log table does not exist"

**THE TRUTH:**
```
There is NO audit_log table.
There has NEVER BEEN an audit_log table.
There will NEVER BE an audit_log table.
```

**USE THIS INSTEAD:**
```typescript
import prisma from './app/db.server';
await prisma.pii_audit_log.create({...});  // ✅ CORRECT
```

**NOT THIS:**
```typescript
await prisma.audit_log.create({...});  // ❌ DOES NOT EXIST
```

---

### Mistake #2: Using KB Database for Production Work

**THE TRUTH:**
```
KB Database has ONLY 2 tables:
1. DecisionLog (your feedback)
2. TaskAssignment (your tasks)

THAT'S IT. NOTHING ELSE.
```

**If you're trying to use KB database for:**
- ❌ SEO audits → WRONG - use Production DB
- ❌ Analytics → WRONG - use Production DB
- ❌ Security auditing → WRONG - use Production DB
- ❌ Shopify data → WRONG - use Production DB
- ❌ ANYTHING except feedback → WRONG - use Production DB

**CORRECT:**
```typescript
// For ALL your work (SEO, analytics, Shopify, etc.):
import prisma from './app/db.server';

// For logging YOUR progress ONLY:
cp scripts/agent/log-feedback.ts /tmp/my-feedback.ts
code /tmp/my-feedback.ts
npx tsx --env-file=.env /tmp/my-feedback.ts
```

---

### Mistake #3: Overthinking It

**SIMPLE RULE:**

```
Are you logging YOUR progress/feedback?
  YES → Use template pattern (see above)
  NO  → import prisma from './app/db.server'
```

**THAT'S IT. STOP OVERTHINKING.**

---

## The Process (Step by Step)

### For Logging Your Progress

**Step 1:** Copy template to YOUR temp file
```bash
cp scripts/agent/log-feedback.ts /tmp/my-feedback.ts
```

**Step 2:** Edit YOUR temp file
```bash
code /tmp/my-feedback.ts
```

Change:
- `actor: "engineer"` → YOUR agent name
- `taskId: "ENG-XXX"` → YOUR task ID
- `rationale: "..."` → What you did

**Step 3:** Run YOUR temp file
```bash
npx tsx --env-file=.env /tmp/my-feedback.ts
```

**Done.** Your feedback is logged.

---

### For Everything Else (Your Actual Work)

**Step 1:** Import production database
```typescript
import prisma from './app/db.server';
```

**Step 2:** Use it
```typescript
// SEO work
await prisma.seoAudit.create({...});
await prisma.seo_audits.create({...});

// Security auditing
await prisma.pii_audit_log.create({...});  // NOT audit_log!

// Analytics
await prisma.dashboardFact.create({...});

// Shopify
await prisma.session.findMany();

// Etc.
```

**Done.** That's your actual work.

---

## Common Errors (And How to Fix Them)

### Error: "audit_log does not exist"
**Fix:** Use `pii_audit_log` instead
```typescript
await prisma.pii_audit_log.create({...});  // ✅
```

### Error: "SeoAudit does not exist in current database"
**Fix:** You're using KB database. Use production database instead.
```typescript
import prisma from './app/db.server';  // NOT kbPrisma!
await prisma.seoAudit.create({...});
```

### Error: "DecisionLog does not exist in current database"
**Fix:** You're using production database for feedback. Use template pattern instead.
```bash
cp scripts/agent/log-feedback.ts /tmp/my-feedback.ts
code /tmp/my-feedback.ts
npx tsx --env-file=.env /tmp/my-feedback.ts
```

---

## What Each Database Has

### Production Database
**Import:** `import prisma from './app/db.server'`

**Has:**
- pii_audit_log (NOT audit_log)
- SeoAudit (camelCase)
- seo_audits (snake_case)
- DashboardFact
- Session
- knowledge_base
- action_queue
- 100+ other business tables

**Use for:** ALL your actual work

### KB Database
**Access:** Template pattern or `logDecision()`

**Has:**
- DecisionLog
- TaskAssignment

**Use for:** Logging YOUR progress ONLY

---

## Decision Tree

```
What are you doing?

├─ Logging task progress/feedback?
│  └─ Use template pattern
│
└─ Anything else?
   └─ import prisma from './app/db.server'
```

**It's that simple.**

---

## Full Documentation

**Quick reference:** This file (you're reading it)

**Complete guide:** `docs/agents/DATABASE_GUIDE.md`

**Feedback guide:** `docs/agents/FEEDBACK_QUICK_START.md`

---

## Summary

**For feedback:**
```bash
cp scripts/agent/log-feedback.ts /tmp/my-feedback.ts
code /tmp/my-feedback.ts
npx tsx --env-file=.env /tmp/my-feedback.ts
```

**For everything else:**
```typescript
import prisma from './app/db.server';
```

**Remember:**
- ❌ NO audit_log table - use pii_audit_log
- ❌ KB database is ONLY for feedback
- ✅ Production database is for ALL your work

**Stop making the same mistakes. Read the error messages. Use the right database.**

---

**Questions?** Read `docs/agents/DATABASE_GUIDE.md` - it has examples for every scenario.

