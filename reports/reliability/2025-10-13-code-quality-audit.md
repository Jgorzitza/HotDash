# HotDash Code Quality & Risk Assessment — 2025-10-13

## Executive Summary
HotDash ships a mature React Router 7 + Supabase control center for Shopify operators with extensive operational tooling and documentation. Continuous testing, retry-aware data clients, and Supabase-backed decision logging demonstrate thoughtful engineering, but several production-facing surfaces can benefit from stronger input validation, cache invalidation policies, and consolidation of duplicated security logic.

## Strengths Observed
- **Operator-focused documentation**: The README and repository status report provide clear onboarding, tooling, and workflow expectations for engineers and operators. (see README quick start and repository health summaries)
- **Resilient integrations**: Shopify and Supabase clients implement bounded retries, deterministic test seams, and legacy fallbacks to preserve uptime. (see Shopify service context retry wrapper and Supabase memory adapter)
- **Test coverage of critical retry paths**: Vitest suites exercise Shopify admin retries across success and failure cases, preventing regressions in rate-limited flows. (see `tests/unit/shopify.client.spec.ts`)

## Key Findings
### 1. Input Validation & Type Safety Gaps
- The `toInputJson` helper casts arbitrary data to Prisma `InputJsonValue` without runtime validation, risking schema drift or malformed writes if upstream callers pass unexpected shapes. (see `app/services/json.ts`)
- Chatwoot webhook ingestion parses request bodies directly with `JSON.parse` and skips signature verification outside production, leaving local/staging vulnerable to untrusted inputs or accidental schema drift; coupling validation with strict signature checks would raise safety. (see `app/routes/api.webhooks.chatwoot.tsx`)

### 2. Security Hardening Opportunities
- Chatwoot signature verification logic exists in both the route handler and an ops script, increasing the risk of drift; centralizing HMAC verification in a shared module would ensure parity and simplify audits. (compare `app/routes/api.webhooks.chatwoot.tsx` and `scripts/ops/verify-chatwoot-webhook.ts`)
- Webhook forwarding lacks outbound authentication (e.g., mTLS or shared secret) when calling the agent service, and error responses echo third-party payload text—consider redacting or hashing error bodies before logging to avoid leaking customer content. (see `app/routes/api.webhooks.chatwoot.tsx`)

### 3. Performance & Reliability Considerations
- The process-wide in-memory cache never evicts expired entries unless read and offers no observability; long-lived Node processes may accumulate stale data and complicate horizontal scaling. Introducing size/TTL guards and optional metrics would make cache behaviour transparent. (see `app/services/cache.server.ts`)
- Anomaly detection thresholds are static constants that blend absolute and relative values without store-specific baselines; as merchant volume grows, configurable thresholds or adaptive baselines will better reflect seasonal patterns. (see `app/services/anomalies.server.ts`)

### 4. Code Duplication & Maintainability
- Signature verification routines and anomaly threshold literals appear in multiple locations; extracting shared utilities or configuration (e.g., YAML/JSON thresholds) would reduce repetition and ease tuning across services. (see `app/routes/api.webhooks.chatwoot.tsx`, `scripts/ops/verify-chatwoot-webhook.ts`, `app/services/anomalies.server.ts`)

### 5. Project Status
- Repository health is reported as “Excellent” with clear branch discipline, rich documentation, and active cleanup, indicating a well-governed codebase ready for continued iteration. (see `REPO_STATUS.md`)

## Recommendations
1. Add schema validation (zod/valibot) to JSON helpers and webhook payloads before persisting data; treat non-production environments as hostile to catch malformed events early.
2. Move Chatwoot HMAC validation into a shared module consumed by both the API route and ops tooling, and require signatures in all environments with feature-flag support for local testing.
3. Extend the in-memory cache with max-size eviction, stale-while-revalidate hooks, and structured logging to prevent silent staleness in multi-instance deployments.
4. Externalize anomaly thresholds into configurable data (database table or JSON) and incorporate rolling baselines so operators can tune per-shop sensitivity without code changes.
5. Maintain repository hygiene via automated branch pruning and keep the status report refreshed so contributors can trust governance data.

