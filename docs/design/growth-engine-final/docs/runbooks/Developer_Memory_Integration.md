# Runbook — Integrate Dev Agents with Memory (No Rework)

## Step 1 — Import the memory client

Use `packages/memory/supabase.ts` for `putDecision`, `putFact`, `listDecisions`.
Fallback to `packages/memory/file.ts` in local offline runs.

## Step 2 — Log decisions at task boundaries

On task start/finish, log:

- scope='build', actor=<agent>, action=<verb>, rationale=<issue/ref>,
  evidenceUrl=<artifacts path>, payload={paths/tests/mcpIds}

## Step 3 — Tie MCP evidence to decisions

Include the relative `artifacts/<agent>/<date>/mcp/*.jsonl` paths in `evidenceUrl` and the PR body section.

## Step 4 — Query in postmortems

`listDecisions(scope='build', since=ISO)` to generate changelogs and ensure visibility across agents.

## Acceptance

- All dev agents produce decision logs for their tasks.
- Manager can query by agent or window and view evidence without hunting.
