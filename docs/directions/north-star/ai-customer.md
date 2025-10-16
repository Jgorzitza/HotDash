# North Star Task Plan — AI-Customer Agent

## A. Agent SDK Foundations
- [ ] Restore SDK scaffolding (`app/agents/sdk`) with typed config, timeout handling, and error boundaries.
- [ ] Implement customer support agent workflow (draft → HITL approval → public reply).
- [ ] Implement CEO assistant agent for dashboards/insights with HITL gate.
- [ ] Configure `agents.json` reviewers, grade schema, and policy enforcement.
- [ ] Add telemetry logging (latency, cost, token usage) per tool call.

## B. Tooling & Integrations
- [ ] Wire KB search tools to llamaindex MCP (query, contextual, related articles).
- [ ] Add fallback to MCP server when local embeddings unavailable; handle outages gracefully.
- [ ] Integrate triage service (priority, sentiment, SLA, VIP detection) into agent context.
- [ ] Connect Supabase logging (approvals, grade capture, usage tracking).
- [ ] Support policy playbooks (no-offer caps, refund limits) before sending drafts.

## C. Learning & Feedback Loop
- [ ] Capture human edits, compute edit distance, and classify learning type.
- [ ] Emit learning events to knowledge base pipeline for article refresh suggestions.
- [ ] Store tone/accuracy/policy grades for future fine-tuning datasets.
- [ ] Build regression/evaluation scripts to measure model improvements.

## D. Safety & Observability
- [ ] Implement PII scrubbing, logging redaction, and compliance filters.
- [ ] Add red-team and security tests covering injection, tool misuse, and fallback scenarios.
- [ ] Provide dashboards/logs for approval latency, error rates, and draft quality metrics.
- [ ] Document incident response for agent-service / MCP failures.

## E. Testing & Evidence
- [ ] Create Vitest coverage for agent workflows, tool wrappers, and escalation logic.
- [ ] Add integration tests simulating Chatwoot webhook to approved reply.
- [ ] Include QA artifacts: transcripts, grading screenshots, rollback steps.
- [ ] Maintain feedback logs with WORK COMPLETE blocks and blockers/next steps.
