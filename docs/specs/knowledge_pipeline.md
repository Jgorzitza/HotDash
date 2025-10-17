# Knowledge Pipeline (Spec)

Status: Draft (stub mode active)
Owner: ai-knowledge
Effective: 2025-10-17

## Overview
Prepare a production knowledge backbone used by in-app agents via RAG. Until approvals and credentials land, run in "stub" mode to avoid unapproved ingestion.

## Embeddings
- Provider: OpenAI
- Model: text-embedding-3-small (1536 dims)
- Provisioning: via vault (never in code)
- Code skeleton: app/services/knowledge/embeddings/openai.ts

## Learning Pipeline
- Code skeleton: app/services/knowledge/learning.ts
- Next: integrate Supabase audit tables (server-only, service role via vault)

## Ingestion Flow
- Current: app/services/knowledge/ingestion.stub.ts (no-op)
- Live (guarded): app/services/knowledge/ingestion.live.ts (KB_INGEST_MODE=live + OPENAI_API_KEY; dryRun default)

## Scripts
- Build index (stub): scripts/ai/build-llama-index.ts
- Drift check (stub): scripts/ai/drift-check.ts

## Guardrails
- No secrets in repo; use vault/ and env
- Respect Supabase RLS; service role only in server contexts
- HITL approval required for new sources

