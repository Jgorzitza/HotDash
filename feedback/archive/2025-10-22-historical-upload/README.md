# Historical Feedback Archive (2025-10-22)

## Purpose
This directory contains all historical agent feedback markdown files that were uploaded to the database on 2025-10-22.

## Database Migration
All information from these files has been migrated to the `decision_log` table in the database with:
- Original timestamps preserved
- Source attribution (evidenceUrl field)
- Rich metadata (taskId, status, progress, blockers)
- Payload data (commits, files, tests, MCP evidence)

## Verification
Data integrity verified 100% on 2025-10-22. All 1,357 entries confirmed uploaded:
- 667 historical entries (from these markdown files)
- 690 live entries (from logDecision() calls)

## Query Instead of Reading
To access this historical information, use manager query scripts:
```bash
npx tsx --env-file=.env scripts/manager/query-agent-status.ts
npx tsx --env-file=.env scripts/manager/query-blocked-tasks.ts
npx tsx --env-file=.env scripts/manager/query-completed-today.ts
npx tsx --env-file=.env scripts/manager/query-task-details.ts <TASK-ID>
```

## Archive Date
2025-10-22 - Transition from markdown-based feedback to database-driven feedback complete.
