# HotDash Growth Machine — Spec Pack v1

**Date:** 2025-10-13  
**Owner:** HotDash / Hot Rod AN

This spec pack turns HotDash into an operator-first **growth machine**. It bakes the daily recommendation loop into the product so a single operator can: **click → quick edit → publish** (content/merch) and **review → edit → reply** (CX), with **continuous learning**.

**Core idea:** unify signals (Search Console, GA4, Shopify, Chatwoot, performance) → generate scored **Actions** with drafts → one-click adapters to publish → log operator edits & outcomes → update models and rules.

---

## What you build

- **Signals layer:** first-party telemetry from Shopify, GA4, GSC, Chatwoot, Core Web Vitals.
- **Recommenders:** SEO CTR fixer; programmatic page factory (metaobjects); inventory-driven merch playbooks; guided-selling drafts; performance repair tasks.
- **Action Queue:** the only daily UI—the Top 10 list with drafts, diffs, evidence, and one-click execution.
- **Learning loop:** log operator edits and outcomes (CTR, rank, CVR, revenue) to auto-tune future drafts and confidence gates.

## Who this is for

- Engineers building the data pipelines, adapters, and UI.
- AI agents that draft copy, titles, bundles, and replies.
- Operators who approve, edit, and ship.

## How to use this pack

Start with **architecture/System-Overview.md**, then implement the **data/ActionSchema.md** and **pipelines**. Wire **adapters** last and hook the **front-end** to the Action API. The **agents/** folder contains SOPs for AI agents to produce drafts safely.

## Non-goals (v1)

- Paid ads automation (cash is tight). Focus is **organic + conversion**.
- Heavy ML/LLM infra. Keep it simple, rules-first; learn from operator edits.
- Fancy experimentation suites. A thin GA4-based A/B layer is enough to start.

## Directory map

- `architecture/` — system design & flows
- `data/` — schemas (Action object, warehouse tables)
- `pipelines/` — ETL & recommenders (logic + pseudocode)
- `adapters/` — Shopify, GA4, GSC, Chatwoot integration details
- `front-end/` — HotDash UI spec for Action cards & previews
- `storefront/` — metaobjects, templates, structured data
- `experiments/` — A/B testing (lightweight)
- `playbooks/` — inventory-driven merchandising automation
- `chat/` — guided selling flow & replies
- `security/`, `ops/`, `testing/` — guardrails, deployment, QA
- `content/`, `guardrails/` — publish gates (helpful, reliable content)
- `agents/` — procedures + prompts for AI assistants
- `roadmap/` — 90-day plan & acceptance criteria
- `appendix/` — glossary & references
- `BossNotes.md` — candid critique of this plan and what to tighten next

---

## Single-operator workflow (the UX contract)

1. **Open HotDash** → see **Top 10 Actions** sorted by _Expected Revenue × Confidence × Ease_.
2. Click an action → see **draft + diff + evidence**.
3. **Approve** (or Edit → Approve). The adapter executes (publish page/bundle/reply).
4. The system logs the edit diff and **tracks outcomes** automatically.
5. Next day, the list refreshes. Smart, fast, measurable.
