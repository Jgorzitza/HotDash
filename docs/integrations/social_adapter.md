# Social Adapter (Keep it inside HotDash)

**Recommendation:** Use **Publer** API as the aggregator behind your own UI. Your app stays the only place you click; Publer is just the pipe.

- Post/schedule across Facebook, Instagram, TikTok, YouTube, LinkedIn, Twitter/X, Pinterest, Reddit with one call.
- Queue management, first-comment scheduling, media library, and analytics are all exposed via their REST API.
- Start with read‑only analytics; enable posting with HITL approval flow once the pipeline is validated.

Docs: https://publer.com/docs | Pricing overview: https://publer.com/pricing

**HITL Flow**

1. Agent proposes a post via Agents SDK tool (`requireApproval: true`).
2. CEO approves/rejects in-app.
3. On approve → call Publer `/posts` (or `/posts/schedule`), store post ID + metrics mapping in Supabase.
4. On reject → capture edits; feed back into training/evals.
