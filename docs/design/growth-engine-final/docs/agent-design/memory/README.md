# Memory Systems (Dev + Production) — Integration Guide

## Goal

Use the **same memory services** for dev and production agents to avoid rework and keep a single source of truth.

## Dev Team Memory (scope='build')

- Log every decision to `decision_log` with: who/what/why/when/evidence (link to artifacts).
- Store MCP conversation IDs, commit SHAs, test outcomes.
- Use `packages/memory/supabase.ts` as the default client; fallback to file memory in local runs.

## Production Agent Memory

- Conversation memory (scope='ceo_conversation'): multi‑turn, auto‑summarize >20, search.
- Approval adapter: store approve/reject/edit + grades (1–5).
- Action execution tracking: proposal → approved → executed → impact.
- Monitoring: tool success/failure, latency, token cost.

## Rules

- No ad‑hoc logs: use memory services only.
- For any agent reply: write to conversation memory before HITL; update with decision.
- For any Action card: write proposal + evidence; after approval/execution, write result + impact.

## Acceptance

- Decision logs exist for dev & prod flows.
- Conversations searchable; approvals and impacts retrievable per Action card.
