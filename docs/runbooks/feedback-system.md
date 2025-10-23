# Feedback System Documentation

## Overview

The HotDash project uses a **database-driven feedback system** where all agent progress is logged to the database via the `logDecision()` function.

## Key Principles

1. **Database-First**: All feedback goes to the database, not markdown files
2. **Real-Time**: Immediate logging on status changes
3. **Structured**: Consistent format with required fields
4. **Queryable**: Manager can instantly see progress across all agents

## How It Works

### For Agents

1. **Get Tasks**: `npx tsx --env-file=.env scripts/agent/get-my-tasks.ts <agent>`
2. **Start Task**: `npx tsx --env-file=.env scripts/agent/start-task.ts <TASK-ID>`
3. **Log Progress**: Use `logDecision()` with proper fields
4. **Complete Task**: `npx tsx --env-file=.env scripts/agent/complete-task.ts <TASK-ID>`

### For Manager

1. **Query Blocked Tasks**: `scripts/manager/query-blocked-tasks.ts`
2. **Query Agent Status**: `scripts/manager/query-agent-status.ts`
3. **Query Completed Today**: `scripts/manager/query-completed-today.ts`

## Required Fields

- `scope`: 'build' for engineering tasks
- `actor`: Agent name (engineer, designer, etc.)
- `taskId`: Task identifier
- `status`: pending | in_progress | completed | blocked | cancelled
- `progressPct`: 0-100 percentage
- `action`: What happened
- `rationale`: Description of work done
- `evidenceUrl`: Path to evidence file
- `payload`: Rich metadata (commits, files, tests)

## Status Transitions

- `pending` → `in_progress` (task started)
- `in_progress` → `completed` (task finished)
- `in_progress` → `blocked` (hit blocker)
- `blocked` → `in_progress` (blocker cleared)
- Any status → `cancelled` (task cancelled)

## Benefits

- **Real-Time Visibility**: Manager sees progress instantly
- **Automatic Coordination**: Dependencies clear automatically
- **Rich Metadata**: Commits, files, tests, MCP evidence
- **Queryable**: Filter by agent, status, date, etc.
- **Audit Trail**: Complete history of all decisions

## Troubleshooting

### Common Issues

1. **Missing taskId**: Always include the task ID
2. **Wrong status**: Use the 5 standard statuses only
3. **Missing evidence**: Include evidenceUrl with file path
4. **Vague rationale**: Be specific about what was done

### Error Handling

- **Database errors**: Check connection and schema
- **Missing fields**: Ensure all required fields are present
- **Invalid status**: Use only the 5 standard statuses
- **Missing evidence**: Create evidence files before logging

## Migration from Markdown

The old markdown feedback system has been archived to `feedback/archive/`. All new feedback goes to the database via `logDecision()`.

## Examples

See `scripts/manager/README.md` for complete examples and query patterns.
