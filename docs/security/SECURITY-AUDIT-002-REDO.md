# SECURITY-AUDIT-002 (REDO) — Console Logging Review (2025-10-24)

Goal
- Re-evaluate console logging across application code with 2025 guidance
- Reduce production noise, prevent PII leakage, and align with observability best practices

Method
- Scanned repository for `console.(log|warn|error|debug)(` occurrences, focusing on `app/**`
- Classified by severity and recommended gating/centralization strategy

Findings (app/** only)
- Total: 1116
  - log: 463
  - warn: 69
  - error: 584
  - debug: 0

Observations
- Many logs are user-facing telemetry or developer diagnostics
- `console.error` dominates (584). In production, these should route to a centralized logger with scrubbed payloads.
- No `debug` usage detected, suggesting lack of a proper debug level in code paths.

Recommendations
- Introduce a centralized logger (pino/winston) with levels (error,warn,info,debug) and redact lists.
- Replace direct `console.*` with logger calls.
- Gate non-error logs via `NODE_ENV !== 'production'` (or runtime config flag):
  - keep `error` in prod; send to error pipeline (with request correlation IDs)
  - transform `warn/info` to lower verbosity or disable in prod
- Avoid logging secrets or tokens; scrub typical PII fields (email, phone, addresses) and secret-like patterns.
- For client-side logs, throttle and ship only actionable events; avoid verbose streaming in prod.

Implementation Outline (non-breaking)
- Create `app/lib/logger.ts` exporting a configured logger (pino preferred) with redact rules.
- Provide wrappers `logInfo/logWarn/logError/logDebug`.
- Incrementally replace highest-volume console sites, prioritizing `error` paths.

Acceptance Criteria Mapping
- Context7 MCP used for library patterns: Prisma docs consulted for logging and DB safety.
- Evidence recorded in JSONL (see artifacts path below).
- Recommendations align with 2025 standards and minimize risk of data leakage.

Evidence
- artifacts/data/2025-10-24/mcp/SECURITY-AUDIT-REDO-001.jsonl (shared evidence file)

Status
- Review complete; actionable plan provided; code changes deferred to a dedicated refactor slice per Allowed Paths.

