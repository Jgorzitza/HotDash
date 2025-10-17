# In‑App Agents (OpenAI Agents SDK, TypeScript)

**This folder is for runtime (customer/CEO‑facing) agents**, not dev agents.

- Use Agents SDK for orchestration, tools, and HITL.
- Tools should call your **server-side** routes that proxy to:
  - Shopify Admin GraphQL (inventory/orders)
  - Supabase (analytics, storage)
  - Chatwoot API (notes/messages)
  - Social aggregator (Publer) for posting/analytics
- HITL: Use `requireApproval: true` and `onApproval` to pause/resume.
  See: https://openai.github.io/openai-agents-js/guides/quickstart and https://openai.github.io/openai-agents-js/guides/human-in-the-loop/
