## Summary
<!-- What changed and why -->

## MCP Evidence (required for code changes)
<!-- List artifacts/<agent>/<YYYY-MM-DD>/mcp/*.jsonl files created during development -->
- artifacts/<agent>/<date>/mcp/<topic_or_tool>.jsonl
- (or state "No MCP usage - non-code change")

## Heartbeat (if task >2 hours)
<!-- Confirm heartbeat files were updated during 'doing' status -->
- [ ] Heartbeat files present: artifacts/<agent>/<date>/heartbeat.ndjson
- [ ] OR task completed in single session (<2 hours, no heartbeat required)

## Dev MCP Check (CRITICAL - Production Safety)
- [ ] No Dev MCP imports in runtime bundles (prod code only)
- [ ] Verified: No `mcp.*dev` or `dev.*mcp` imports in app/ (searched with grep)

## Evidence (required)
- [ ] Vitest report link
- [ ] Playwright trace/report link
- [ ] Lighthouse CI report link
- [ ] /metrics curl link
- [ ] (If streaming) SSE soak logs link

## Scope
- Molecule: <!-- agent/<agent>/<molecule> -->
- Affected routes:

## Stack Guardrails Compliance (CRITICAL - All Required)
**Changes must comply with canonical toolkit per docs/directions/README.md#canonical-toolkit--secrets**

### Database & Backend
- [ ] ✅ **Supabase-only backend:** No non-Supabase database clients (MySQL, MongoDB, Redis, DynamoDB, Firebase)
- [ ] ✅ **Chatwoot on Supabase:** CX integration uses Supabase for persistence only
- [ ] ✅ **Secrets handling:** All credentials use process.env or vault references (no hardcoded values)

### Frontend & AI Stack  
- [ ] ✅ **React Router 7 only:** No Remix, Next.js, Gatsby, or incompatible routing frameworks
- [ ] ✅ **OpenAI + LlamaIndex only:** No Anthropic, Claude, Cohere, HuggingFace, LangChain, or unauthorized AI services
- [ ] ✅ **External services:** No AWS SDK, Azure, Google Cloud, Firebase Admin (Shopify/Chatwoot/OpenAI/Supabase only)

### Special Approval Required (Check if applicable)
- [ ] **Stack guardrail modification:** Requires Product Agent + Engineering Lead approval
- [ ] **Security/compliance changes:** Requires security review + manager approval
- [ ] **Database schema changes:** Requires Data + Reliability team approval

## Risk & Rollback
- Rollback plan:
- Feature flags:
- DEPLOY-147 impact: <!-- Does this contribute to evidence bundle completion? -->

## Checklist
- [ ] Self-tested locally with evidence
- [ ] Stack guardrails CI passes
- [ ] Performance: No sub-300ms latency degradation
- [ ] Docs updated (if user-facing changes)
- [ ] Feedback updated (linked entry in feedback/<agent>.md with timestamp + command + output path)
- [ ] No secrets committed
- [ ] If PR touches docs/directions/**, authored by Manager or labeled 'approved-by-manager'
