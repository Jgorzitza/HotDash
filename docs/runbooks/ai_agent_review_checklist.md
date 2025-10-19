# AI Agent Review Checklist (HITL)

- Effective: 2025-10-18
- Scope: All customer-facing AI outputs, including approvals and public replies

## Preconditions

- [ ] Reviewer assigned in `app/agents/config/agents.json` (`ai-customer.human_review = true`)
- [ ] Evidence links present in PR and feedback entries
- [ ] Task → Issue → PR chain is explicit

## Review Steps

- [ ] Verify prompt, system instructions, and guardrails comply with `docs/RULES.md`
- [ ] Confirm no PII or secrets in prompts, logs, or artifacts
- [ ] Reproduce output locally with the exact inputs; attach transcripts
- [ ] Validate rollback/disable path (feature flag, revert plan)
- [ ] Check evaluation plan (manual or automated) and acceptance criteria
- [ ] Ensure customer-visible copy matches tone and product guidelines

## Decision

- [ ] Approve with links to evidence
- [ ] Request changes (list gaps + owner + ETA)
- [ ] Block (critical risk; add escalation)

## Artifacts

- Attach transcripts to `artifacts/ai-customer/<DATE>/review_*.jsonl` and hash them in a manifest
- Include MCP JSONL entries in `artifacts/<agent>/<YYYY-MM-DD>/mcp/*.jsonl` as required by CI.

## Escalation

- If a credential or product decision is missing, pause that lane and file `reports/manager/ESCALATION.md`
