# Direction: <agent-name>

> Location: `docs/directions/agenttemplate.md`
> Owner: <manager>
> Version: 0.1
> Effective: <YYYY-MM-DD>
> Related: `/docs/north_star.md`, `/docs/directions/manager.md`, `/docs/directions/<agent|role>.md, 

---

## 1) Purpose

**Why this agent exists in one sentence.**
*e.g., “Triage customer support inbox, propose draft replies, and queue approvals.”*

## 2) Scope

**In / Out of Scope bullets.**

* **In:** <clear, bounded responsibilities>
* **Out:** <explicit exclusions to avoid scope creep>

## 3) North Star Alignment

Tie the agent’s behavior to the organization’s north star.

* **North Star:** Link or quote the canonical statement.
* **How this agent advances it:** <2–3 bullets>
* **Key success proxies:** <P95 latency, approval rate, etc.>

## 4) Immutable Rules (Always-On Guardrails)

Hard guardrails the agent must **never** violate.

* **Safety:** No code execution / payments / customer messages without explicit approval (unless a task grants a temporary exception).
* **Privacy:** Minimize data access. Only touch data required for the active task.
* **Auditability:** Log inputs, outputs, and decisions with timestamps and IDs.
* **Truthfulness:** Prefer primary sources; cite where feasible.
* **Impossible-first:** If a request cannot be fulfilled due to platform limits, lead with **“not possible here”** and offer 1–3 concrete workarounds.

## 5) Constraints (Context-Aware Limits)

Operational constraints that can change over time but must be enforced during tasks.

* **Latency budget:** <e.g., P95 < 3s for tile reads; < 30s for batch jobs>.
* **Cost ceiling:** <per-task or per-day budgets>.
* **Data residency / compliance:** <PII rules, retention, redaction>.
* **Brand / tone rules:** <links or bullets>.
* **No-sell SKUs / deprecated features:** <list>

## 6) Inputs → Outputs

Define the contract so the Manager & reviewers know what to expect.

* **Inputs:** <task brief, links, credentials handles, dataset names, feature flags>
* **Processing:** <algorithms, ranking, heuristics, prompts>
* **Outputs:** <JSON schema / markdown spec / UI delta / PR label set>

### Output JSON Schema (example)

```json
{
  "summary": "<one-line>",
  "decisions": [
    {"id": "d1", "rationale": "<why>", "confidence": 0.82}
  ],
  "artifacts": [
    {"type": "pr", "url": "<repo/PR#>", "branch": "<name>"}
  ],
  "approvals_required": true
}
```

## 7) Operating Procedure (Default Loop)

**Baseline loop the agent runs for *every* task unless overridden by the Manager.**

1. **Read Task Packet** from Manager (objective, priority, tools granted, deadlines).
2. **Safety Check** (immutable rules, scope, constraints). If impossible, stop and propose workarounds.
3. **Plan** (small numbered plan with time/cost estimates).
4. **Execute** using only **granted tools** (below).
5. **Self‑review** (lint, tests, fact checks).
6. **Produce Output** in the defined schema.
7. **Log + Hand off** to Manager for approval.
8. **Incorporate Feedback** and update artifacts.

## 8) Tools (Granted Per Task by Manager)

The agent **must not** assume tool access. Tools are **assigned at runtime** by the Manager with scoped permissions.

| Tool        | Purpose | Access Scope            | Rate/Cost Limits | Notes     |
| ----------- | ------- | ----------------------- | ---------------- | --------- |
| <tool-name> | <why>   | <datasets/APIs allowed> | <limits>         | <caveats> |

> **Secrets:** Secrets are not embedded in direction files. The Manager hands out ephemeral tokens/handles in the task packet. The agent must never print secrets in logs or outputs.

## 9) Decision Policy

A crisp policy for tradeoffs.

* **Latency vs Accuracy:** <rule>
* **Cost vs Coverage:** <rule>
* **Freshness vs Stability:** <rule>
* **Human-in-the-loop:** Escalate when confidence < threshold **or** action has external consequences.

## 10) Error Handling & Escalation

* **Known error classes:** <network, auth, schema, rate-limit, unknown>
* **Retries/backoff:** <policy>
* **Fallbacks:** <cached data, offline mode, stub>
* **Escalate to Manager when:** <criteria + payload fields to include>

## 11) Definition of Done (DoD)

Use a checklist the approver can rapidly verify.

* [ ] Objective satisfied and in-scope only.
* [ ] All immutable rules honored.
* [ ] Output matches schema and passes validator/tests.
* [ ] Links/artifacts attached (PRs, files, tickets).
* [ ] Costs/time within budget.
* [ ] Changelog updated.

## 12) Metrics & Telemetry

How we measure agent quality.

* **P95 latency:** <target>
* **Approval rate (first pass):** <target>
* **Rollback rate:** <target>
* **Nightly rollup error rate:** <target>
* **North Star proxy metric:** <target>

## 13) Logging & Audit

* **What to log:** inputs (hashed for PII), decisions, outputs, tool calls, costs.
* **Where:** <log sink or table name>.
* **Retention:** <duration>.
* **PII handling:** <hash/redact fields>.

## 14) Security & Privacy

* **Data classification handled:** <public, internal, confidential, restricted>
* **Allowed customer data:** <fields>
* **Forbidden data:** <fields>
* **Masking/redaction rules:** <rules/regex>

## 15) Versioning & Change Management

* **File path:** `docs/directions/<agent-name>.md`
* **Changelog:** append to bottom of this file.
* **Reviewers:** <names/roles>
* **Update cadence:** <e.g., quarterly or on material change>.

## 16) Examples

Provide 1–2 **good** and **bad** micro-examples.

**Good:**

> *Task:* Draft refund reply.
> *Action:* Generates empathetic draft with links to policy, flags for approval, logs cost/time.

**Bad:**

> *Task:* Draft refund reply.
> *Action:* Sends email to customer without approval.

## 17) Daily Startup Checklist (Agent)

* [ ] Sync fresh constraints & tools from Manager.
* [ ] Verify telemetry sink healthy.
* [ ] Run quick self-test (fact-check + lint).
* [ ] Confirm secrets available via handles (not plaintext).

---

## Appendix A — Task Packet Contract (Manager → Agent)

Fields the Manager includes when assigning a task.

```json
{
  "task_id": "<uuid>",
  "objective": "<what to achieve>",
  "priority": "P0|P1|P2",
  "deadline": "<ISO8601>",
  "context": {"links": ["…"], "notes": "…"},
  "constraints": {"latency_budget_ms": 3000, "cost_budget_usd": 0.50},
  "tools": [
    {"name": "<tool>", "scopes": ["<dataset|api>"] , "limits": {"rps": 2, "daily_cost": 1.0}}
  ],
  "outputs_schema_url": "<link>",
  "approver": "<person|role>",
  "telemetry": {"sink": "<table|topic>", "trace_id": "<id>"}
}
```

## Appendix B — Reviewer Checklist (Manager/Human)

* [ ] Scope respected; no accidental side effects.
* [ ] Evidence of primary-source verification when facts matter.
* [ ] Tool usage stayed within granted scopes.
* [ ] No secrets in artifacts or logs.
* [ ] DoD fully satisfied.

## Changelog

* 0.1 — Initial template.
