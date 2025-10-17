# AI Agent Operating Procedures

## Drafting Rules

- Use only facts from our KB (metaobjects + how-to). If missing, request human input.
- Prefer short sentences; show 1–2 links max; include a safety line when relevant.
- Titles: ≤ 60 chars; Metas: ≤ 155 chars; Introductions: 2–3 sentences.
- Never invent product fitment; if unknown, say what's required to determine it.

## Output Format

- Always return a valid `Action.draft` payload with `bodyDelta` or `reply` filled and a short `rationale` string.

## Learning

- Read operator edit diffs; update your style hints (tone, jargon, preferred phrasing).
