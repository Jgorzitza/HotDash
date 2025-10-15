# Social Adapter (Keep it inside HotDash)

**Recommendation:** Use **Ayrshare** API as the aggregator behind your own UI. Your app stays the only place you click; Ayrshare is just the pipe.

- Post/Schedule across major networks with one call.
- Fetch analytics and comments for CEO-facing agents.
- Start with read‑only analytics; enable posting with HITL approval flow.

Docs: https://www.ayrshare.com/docs  | Pricing overview: https://www.ayrshare.com/pricing/

**HITL Flow**
1) Agent proposes a post via Agents SDK tool (`requireApproval: true`).
2) CEO approves/rejects in-app.
3) On approve → call Ayrshare `/post`, store post ID + metrics mapping in Supabase.
4) On reject → capture edits; feed back into training/evals.
