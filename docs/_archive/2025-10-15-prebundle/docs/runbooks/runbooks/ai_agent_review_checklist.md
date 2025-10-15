# AI_AGENT_HITL — Human-in-the-Loop Policy

**Scope:** `ai-customer` and any outward-facing agent.

**Flow**
1) Agent drafts response as Chatwoot **Private Note**.
2) Human reviewer edits/approves; post as **public reply**.
3) Grade 1–5: Tone, Accuracy, Policy. Store in Supabase (`ai_reviews`).

**Hard rules**
- No refunds/payments or irreversible actions.
- Always use MCP tools for Shopify/Supabase/Chatwoot data.
- No sending without human approval until manager flips the flag.
