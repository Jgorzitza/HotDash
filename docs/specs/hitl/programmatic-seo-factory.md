Title: Programmatic SEO Factory (Metaobjects → Pages at scale)

Current Issue: #77 (SEO)
Flags: feature.programmaticSeoFactory = OFF (dev/staging only)

Goal

- Ship hundreds of ultra-specific, high-intent landers generated from structured data, not hand-written posts.

Scope

- Metaobjects: vehicle_model_year, swap_recipe, compatibility_fact, howto_guide
- Templates: "publish as page" with Product + Offer schema
- Internal links: auto-generate related links (recipes, compatibility, guides)

MVP

- CRUD for metaobjects (seed via admin/API; MCP-first for doc refs)
- Page generator with preview → Approve → Publish (CEO-only approvals)
- Internal-link sweeps nightly; idempotent by page key

Acceptance

- ≥100 programmatic pages live in 60 days
- ≥30% CTR lift on ≥50% of updated pages (vs baseline)
- All changes logged with evidence + rollback

Risks/Notes

- Respect robots/indexability flags
- Keep templates fast and CWV-friendly

---

## 2025-10-18 Planning Notes

Metaobject schema (draft candidates)

- landing_page
  - fields: slug (key), title, h1, meta_description, canonical_url, hero_image, intro_richtext, faq_ref[], related_products[], collection_ref
- comparison
  - fields: slug (key), subject_product, vs_product, pros[], cons[], verdict_richtext, schema_json
- location_page
  - fields: slug (key), city, province, geo (lat/lng), service_areas[], hours_json, gmb_place_id

Template outline

- route: `/l/:slug` (server-rendered, fast CWV)
- sections: hero, TOC, content blocks, related links, FAQ
- SEO: title/h1 alignment check, canonical, structured data (FAQPage, Product, Breadcrumb)

Internal-link plan

- clusters by entity (product, topic, location)
- nightly sweep: add breadcrumb + related nodes via lightweight rules
- guard: max N links per section; avoid duplicate anchors

Flags & rollout

- `feature.programmaticSeoFactory` OFF
- preview mode: draft pages at `/preview/l/:slug` (HITL only)
- rollback: unbind template + disable flag; pages fall back to 404

Open items

- MCP Shopify Admin: introspect MetaobjectDefinition + Page to verify fields
- Content policy: alt text requirements, min word count, red flags list
