# CX → Product Loop (Chatwoot Embeddings → Product Tasks)

## Idea

Mine CX conversations for repeated “fit/missing/confusion” phrases; propose mini tasks with draft content.

## Mechanics

- Sanitize and embed Chatwoot conversation chunks (no PII) into pgvector.
- Nightly (or on‑demand) query for top recurring themes by product/collection.
- Propose tasks: add size table, add adapter SKU, clarify policy paragraph.
- Each task is an **Action card** with draft copy, evidence snippets, and expected impact.

## Acceptance

- At least 3 mini tasks/week surfaced with evidence.
- CEO approval → task lands in the correct lane with a ready draft.
