# Growth Engine Implementation Pack (Manager Edition)

**Date:** 2025-10-21

## Purpose
Build a durable **Growth Engine** that a single operator can run from HotDash to 10× sales at hotrodan.com. This pack tells the Development Manager exactly **how to get it done**—what to build, how agents cooperate, what guardrails apply, and how success is measured. It contains **process and acceptance criteria** only (no code).

## Core Design
- Two **front-end** agents: **Customer-facing** (Chatwoot intake) and **CEO-facing** (Operator/you).
- Specialist **sub‑agents** behind them (Storefront MCP, Customer Accounts MCP, Analytics, Inventory, Content/SEO/Perf, Risk).
- Strict **handoffs** (one owner at a time), never broadcast. See `architecture/Agents_and_Handoffs.md`.
- Real-time commerce via **Shopify Storefront MCP**; authenticated account work via **Customer Accounts MCP** (OAuth). Dev MCP is **never used** in runtime.
- Background agents produce a unified **Action Queue** that feeds the Operator dashboard.

## What success looks like
- The Operator sees only **Top‑10 Actions** ranked by Expected Revenue × Confidence × Ease and can click **Approve / Edit / Dismiss** with one action.
- Customer requests are solved safely: PII stays in a **redacted card** behind HITL; public replies never leak PII.
- Background agents continuously keep tiles fresh (traffic, conversion, inventory, risk) with evidence and rollback.

## Where to start
1. Read `architecture/Agents_and_Handoffs.md` and `integrations/Shopify_MCP_Split.md`.
2. Assign per‑lane molecules from `manager/Plan_Molecules.md` into each agent’s daily task files.
3. Enforce the **no‑ask** execution pattern in `runbooks/Agent_Startup_Checklist.md`.
