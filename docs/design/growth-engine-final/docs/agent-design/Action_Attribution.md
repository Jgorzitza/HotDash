# Action‑Linked Attribution (ROI Brain)

## Goal
Tie observed performance changes to specific approved Actions so the Top‑10 can be re‑ranked by **realized ROI**.

## How
- Create GA4 **custom dimension** `hd_action_key` (event scope).
- When an Action is approved, generate a slug (e.g., `seo-fix-powder-board-2025-10-21`).
- Client emits `hd_action_key` on relevant events (page view, click, add_to_cart, purchase).
- Dashboard joins Action → measured changes and updates expected_impact/confidence for future ranking.

## Acceptance
- Each approved Action has an `hd_action_key` and a 7/14/28‑day attribution panel.
- Top‑10 tiles reorder with observed ROI within 2–4 weeks.
