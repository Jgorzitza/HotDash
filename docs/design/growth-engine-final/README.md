# Growth Engine — Final Manager Pack
**Date:** 2025-10-21

This bundle is the **authoritative** set of instructions for finishing the Growth Engine with zero ambiguity.
It encodes the latest CEO decisions:

- **Dev agents are INTERACTIVE ONLY** (no background loops). The live app may trigger on‑demand runs and **one nightly inventory cleanup**.
- **Store switch**: dev `hotroddash.myshopify.com` → prod `fm8vte-ex.myshopify.com` (primary `hotrodan.com`). API canonical after cutover = `fm8vte-ex.myshopify.com`.
- **OAuth**: Same client via **Shopify App Bridge**; env‑specific redirect URIs; scopes unchanged.
- **Telemetry**: **GA4 only** (Property ID **339826228**). GSC property exists (`https://hotrodan.com`) but no BigQuery now. Add **Bing Webmaster** verification.
- **Refresh model**: On‑demand + one nightly inventory reconcile (warehouse counts + virtual bundle stock recompute).
- **Dev MCP ban in prod**: build must **fail** if any Dev MCP import/call exists in runtime bundles.
- **PII Card policy**: Operator‑only fields → city/region/country, postal prefix, masked email/phone, last‑4 order ID, tracking last event, line items. No street address in public text.

### What’s inside (docs only, no code)
- Store switch runbook, GA4-only telemetry guide, Bing webmaster checklist
- Agents & handoffs addenda (interactive dev, tool‑based handoffs, one owner)
- HITL policy (100% until proven), memory system wiring (dev + prod)
- Inventory blueprint: vendor master, multi‑SKU mapping, **Bundles‑as‑BOM**, ALC, **ROP**, **opportunity‑cost emergency sourcing**
- pgvector data plane plan (what to embed, ANN indexing, safety, maintenance)
- Action Attribution (ROI brain), CX→Product loop, escalation grammar
- PR evidence policy + heartbeat and required checks
- Metafields JSON schema for bundle mapping

**Manager workflow:** Read `NORTH_STAR_ADDENDA.md` → apply file‑by‑file edits →
create runbooks/policies from this pack → assign molecules in your board.
