# Recommenders

Each recommender reads features, proposes Actions with drafts, then the Scoring & Gating layer ranks them.

---

## 1) SEO CTR Fixer

**Goal:** Turn impression gains into clicks and revenue.

**Inputs**

- GSC: page × query (7d vs 28d deltas)
- GA4: revenue, add-to-carts for landing pages
- Perf: LCP/CLS/INP (flag performance-linked CTR drops)

**Heuristics**

- Pick candidates where impressions ↑ and CTR ↓ or rank between 4–10 with high volume.
- Draft:
  - `title`: include head term + value prop + model/engine if relevant.
  - `meta`: benefits + trust element (warranty, install guide) within ~155 chars.
  - `intro`: 2–3 sentences, include 1 exact-match and 1 semantic variant.
  - `internal links`: 2–3 contextual links (hub article + relevant PDPs).
- Output: `SEO_TITLE_REFRESH` Action with rendered diff and suggested links.

---

## 2) Programmatic Page Factory (Shopify metaobjects)

**Goal:** Manufacture long-tail, high-intent landing pages at scale.

**Inputs**

- Query clusters with commercial intent and thin current coverage.
- Catalog: kits, adapters, filters, regulators, compatibility facts.

**Process**

- Create metaobject entries for: `vehicle_model_year`, `swap_recipe`, `compatibility_fact`, `howto_guide`.
- Compose a page from these parts with:
  - Clear headline aligned to queries.
  - Compatibility tables and diagrams.
  - Product blocks with price/availability and returns/shipping info.
  - JSON-LD (Product + Offer).
- Output: `PROGRAMMATIC_PAGE` Action with a preview of the generated page.

---

## 3) Merchandising Playbooks (inventory-driven)

**Triggers**

- **Stock-out risk**: velocity × on-hand < threshold.
- **Slow mover**: zero sales 28d, > N units on hand.
- **Back-in-stock**: product regained availability.

**Drafts**

- Homepage banner copy, PDP badge JSON, bundle recommendation (based on attach-rate graph), and a 1-paragraph blog/news snippet.
- Output: `STOCKOUT_DROP_PLAN` or `BUNDLE_NUDGE` Action with assets.

---

## 4) Guided Selling (Chat)

**Goal:** Reduce time-to-answer; increase cart value.

**Inputs**

- New Chatwoot message + recent context.
- Knowledge base: metaobjects + how-to articles.

**Draft**

- Short, brand-aligned reply using facts only from your KB.
- Fit-finder decision path to recommend a kit + the exact adapters.
- Attach draft cart link.
- Output: `CW_REPLY_DRAFT` Action; on approve, adapter sends reply and tags thread.

---

## 5) Performance Repair

**Goal:** Fix web performance issues where $$ impact is highest.

**Inputs**

- Core Web Vitals by URL + GA4 revenue / add-to-carts.

**Draft**

- Concrete tasks: compress specific images; defer/async non-critical scripts; lazy-load galleries.
- Output: `PERF_FIX` Action with a checklist and estimated CVR lift.
