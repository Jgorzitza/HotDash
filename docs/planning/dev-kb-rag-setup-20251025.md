# Dev Knowledge Base RAG Setup — Implementation Notes (2025-10-25)

**Owner:** Pilot (dev knowledge base)  
**Scope:** Internal agent knowledge only (keep separate from production KB)  
**Status:** Draft plan for ingestion + query tooling

---

## 1. Data Modeling & Prisma

- New Prisma schema located at `prisma/dev-kb/schema.prisma`
  - Generates a dedicated client into `packages/dev-kb-prisma` (run `npx prisma generate --schema=prisma/dev-kb/schema.prisma` once credentials are exported)
  - Datasource uses `SUPABASE_DEV_KB_DATABASE_URL` / `SUPABASE_DEV_KB_DIRECT_URL`
- Initial migration (`prisma/dev-kb/migrations/20251025000001_init/`) provisions:
  - `knowledge_base` table (vector + metadata)
  - GIN/IVFFlat indexes scoped to the dev project
  - RLS policy filtering `project = 'dev_kb'`
- Credentials stored in `vault/dev-kb/supabase.env`
  - Password kept in plain form + URL-encoded variants for connection strings

**Next:** Decide where the generated client should live (monorepo package vs. scripts-only usage) before running codegen.

---

## 2. Ingestion Pipeline

1. **Source Selection**
   - Start with `docs/directions/**`, `docs/manager/PROJECT_PLAN.md`, `DOCS_INDEX.md`, and runbooks critical to dev workflows.
   - Add curated feedback summaries (e.g., `feedback/manager/*.md`) after redacting sensitive data.
2. **Transformation**
   - Use `scripts/dev-kb/ingest.ts` to:
     - Reads approved Markdown files
     - Extracts metadata (title, category, tags) from front-matter or headings
     - Splits content into Q/A style chunks (aligned with `document_key`)
     - Generates OpenAI embeddings (`text-embedding-3-small`)
     - Upserts into `knowledge_base` with `project='dev_kb'`
   - Manual run (until CI workflow exists):
     ```bash
     set -a && source vault/dev-kb/supabase.env && set +a
     OPENAI_API_KEY=... npx tsx scripts/dev-kb/ingest.ts
     ```
3. **Scheduling**
   - GitHub Action (`.github/workflows/dev-kb-ingest.yml`) runs daily at 07:00 UTC (or via manual dispatch).
   - Required repo secrets: `DEV_KB_DIRECT_URL`, `DEV_KB_DATABASE_URL`, `DEV_KB_POOLER_URL`, `DEV_KB_PASSWORD`, `OPENAI_API_KEY`.
   - Local fallback: `npm run dev-kb:ingest` (logs can be stored in `artifacts/dev-kb/`).
4. **Versioning**
   - Keep `previous_version_id` chain intact when documents change; mark `is_current=false` on superseded entries.

---

## 3. Query Surface

- Extend the existing RAG scripts to support a dev mode:
  - New CLI shortcut: `npm run dev-kb:query -- "How do task assignments work?"`
  - Script will use the dev Prisma client (or direct SQL) to fetch matching documents via cosine similarity.
- Optional: Publish a lightweight internal API route (`/api/dev-kb/query`) gated by dev auth.
- Update `packages/memory/indexes` only if we also want a local vector index for offline work; otherwise rely on Supabase query.

---

## 4. Validation & Access Control

- Restrict Supabase keys for this project to internal tooling only (no exposure in production builds).
- Add smoke tests:
  - Ingestion test ensures at least one doc indexed (`npm run test:dev-kb`).
  - Query test validates expected answer for a known question.
- Document operational runbook (future) describing ingestion scheduling, failure handling, and backup strategy.

---

## 5. Open Questions

- Should we mirror knowledge snippets back into the repo (for audit) after ingestion?
- Do we need per-agent views/tags (manager vs. engineer) inside the KB?
- How do we keep feedback logs anonymized before indexing?

> Once these decisions are made, implement ingestion + query scripts and wire them into daily workflows.
