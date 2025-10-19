Title: Programmatic SEO Factory (Metaobjects → Pages at scale)

Current Issue: #77 (SEO)
Flags: feature.programmaticSeoFactory = OFF (dev/staging only)

## Goal

Ship hundreds of ultra-specific, high-intent landers generated from structured data, not hand-written posts, while preserving CWV and manual override control.

## Scope

- **Metaobjects (phase 1):** `vehicle_model_year`, `swap_recipe`, `compatibility_fact`, `howto_guide`
- **Templates:** Programmatic lander published as Shopify page with `Product` + `Offer` schema blocks and FAQ support
- **Internal links:** Auto-generate related links (recipes, compatibility, guides) per entity cluster with nightly sweeps

## MVP Deliverables

1. CRUD + ingestion for the metaobjects above (seed via admin/API; MCP-first for schema introspection)
2. Page generator flow: Preview → Approve (HITL) → Publish (CEO-only approvals)
3. Internal link sweeps that are idempotent per page key with safeguards for duplicate anchors

## Success Metrics

- ≥100 programmatic pages live in 60 days
- ≥30% CTR lift on ≥50% of updated pages (vs baseline)
- All changes logged with evidence + explicit rollback path

## Risks & Guardrails

- Respect robots/indexability flags, canonical alignment, and sitemap hygiene
- Templates must remain CWV-friendly (LCP < 2.5s p75, CLS < 0.1)
- All feature flags default OFF and require HITL approvals prior to publish

---

## Schema draft v0.1 (2025-10-18)

Metaobject: `landing_page`

- key: `slug`
- fields: `title`, `h1`, `meta_description`, `canonical_url`, `hero_image`, `intro_richtext`, `faq_ref[]`, `related_products[]`, `collection_ref`

Metaobject: `comparison`

- key: `slug`
- fields: `subject_product`, `vs_product`, `pros[]`, `cons[]`, `verdict_richtext`, `schema_json`

Metaobject: `location_page`

- key: `slug`
- fields: `city`, `province`, `geo_lat`, `geo_lng`, `service_areas[]`, `hours_json`, `gmb_place_id`

Template outline (server‑rendered)

- route: `/l/:slug`
- sections: hero, TOC, content blocks, related links, FAQ
- SEO: title/h1 alignment, canonical, structured data (FAQPage, Product, Breadcrumb)

Internal‑link plan

- cluster by entity (product/topic/location)
- nightly sweep: add breadcrumbs + related links via idempotent rules
- guardrails: max N links/section; dedupe anchors; avoid loops

Flags & rollout

- `feature.programmaticSeoFactory` OFF
- preview: `/preview/l/:slug` (HITL only)
- rollback: unbind template + disable flag (404 fallback)

---

## Spec Scaffold — 2025-10-19

### Metaobject Schemas (Initial Draft)

| Metaobject              | Fields                                                                                                                                                                | Notes                                                                      |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `landing_page`          | `slug` (key), `title`, `h1`, `meta_description`, `canonical_url`, `hero_image`, `intro_richtext`, `faq_ref[]`, `related_products[]`, `collection_ref`, `evidence_doc` | Primary hub; evidence doc URI required for HITL approval trail.            |
| `comparison`            | `slug`, `subject_product`, `vs_product`, `pros[]`, `cons[]`, `verdict_richtext`, `schema_json`, `supporting_assets[]`                                                 | `schema_json` stores comparison-specific structured data snippets.         |
| `location_page`         | `slug`, `city`, `province`, `geo_lat`, `geo_lng`, `service_areas[]`, `hours_json`, `gmb_place_id`, `support_contact`                                                  | `geo_*` split to aid future map rendering; hours stored as JSON for reuse. |
| `swap_recipe` (backlog) | `slug`, `target_vehicle`, `compatible_parts[]`, `difficulty_score`, `steps_richtext`, `tools[]`, `safety_notes`                                                       | Enables conversion sub-landers tied to swap kits.                          |

### Content Assembly Pipeline

1. **Ingestion:** metaobject records seeded via Shopify Admin or API (MCP-first for schema updates) with validation against required fields.
2. **Preview Builder:** Remix route `/preview/l/:slug` renders the draft using mock commerce data; available only when `feature.programmaticSeoFactory` is ON for staff and request includes HITL token.
3. **Approval Queue:** Approvals dashboard receives preview metadata + evidence document link; CEO-level approval toggles publish eligibility.
4. **Publisher:** Background job hydrates Shopify Page via Admin API, attaches metaobject reference, and records change in decision log (supabase).
5. **Link Sweeps:** Nightly job analyzes entity clusters, injects related links and breadcrumbs while respecting max-link guardrails.

### Template Outline

- Route: `/l/:slug` (server-rendered, caches per slug with revalidation)
- Sections: hero, dynamic TOC, content blocks (cards, specs, FAQs), related products carousel, CTA banner, structured data embeds (`FAQPage`, `Product`, `BreadcrumbList`)
- Performance: image components served via CDN with width hints; render-blocking JS avoided; inline critical CSS for hero.

### Feature Flags & Rollback

- Primary flag: `feature.programmaticSeoFactory` (environment variable + local storage mirror for dev).
- Secondary guard: `feature.programmaticSeoFactoryPublisher` to isolate publish job from preview surface.
- Rollback:
  1. Disable publisher flag to stop new pages.
  2. Disable primary flag to hide preview, forcing `/l/:slug` to return 404/draft.
  3. Revert Shopify page template binding (scripted via `scripts/ops/unbind-programmatic-lander.mjs`).
  4. Notify approvals queue to halt remaining items; document in runbook.

### Evidence & QA Hooks

- Contract tests: extend vitals + SEO schema unit suites once template stub exists.
- Monitoring: add lighthouse synthetic run per representative slug (off in dev, manual in staging).
- HITL checklist: confirm meta description length, canonical alignment, internal links, structured data validator output.

### Open Items (Next Steps)

1. Use Shopify MCP Admin to introspect `MetaobjectDefinition` for the draft schemas and confirm field types / validation options.
2. Define content policy guardrails (alt text requirements, taboo language filters, minimum word count) and append to approvals checklist.
3. Draft `scripts/ops/unbind-programmatic-lander.mjs` stub (placeholder) to operationalize rollback playbook.

---

### Preview Route Contract (Draft)

- Route: `/preview/l/:slug`
- Guards: `feature.programmaticSeoFactory = ON` for staff-only sessions + HITL token in request
- Response shape:
  - status: 200 | 404 (when flag OFF or metaobject missing)
  - body: `{ slug, meta, sections: Section[], evidenceRef }`
  - headers: `Cache-Control: no-store` (preview only)
- Sections contract:
  - hero: `{ title, subtitle?, heroImage }`
  - toc: `{ anchors: {id, label}[] }`
  - blocks: array of `{ type: 'richtext'|'faq'|'productGrid'|'comparison', data: any }`
  - related: `{ links: {title, href}[], max: number }`
- SEO: preview sets `robots: noindex`
- Idempotency: preview renders from metaobject only; no Shopify Page mutations

### Internal-link Sweep Rules (Idempotent)

- Key: `{entityType}:{slug}` used to avoid duplicate inserts
- Limits: `maxLinksPerSection = 5`, `maxNewLinksPerPage = 12`
- Dedupe: normalize anchors by lowercase + hyphenized label; skip existing anchors
- Avoid loops: never link a page to itself; enforce entity cluster boundaries
- Evidence: write sweep plan and result counts to decision log (Supabase), include `request_id`
- Rollback: re-run sweep with `apply=false` to diff; use stored anchors to remove injected links if needed

---

## Field Validations (Draft — 2025-10-19)

Landing Page (`landing_page`)

- `slug`: required, pattern `^[a-z0-9\-\/]+$`, max 120 chars
- `title`: required, max 70 chars
- `h1`: optional, max 90 chars
- `meta_description`: optional, max 160 chars
- `canonical_url`: optional, absolute URL, https only
- `hero_image`: optional, file reference (image/\*)
- `intro_richtext`: optional, max 1,500 chars plain‑text equivalent
- `faq_ref[]`: optional, max 10 refs
- `related_products[]`: optional, max 12 refs
- `collection_ref`: optional

Comparison (`comparison`)

- `slug`: required, pattern `^[a-z0-9\-\/]+$`, max 120 chars
- `subject_product`: required, product reference
- `vs_product`: required, product reference, must differ from `subject_product`
- `pros[]` / `cons[]`: optional, each item max 120 chars, totals ≤ 20
- `verdict_richtext`: optional, max 2,000 chars plain‑text equivalent
- `schema_json`: optional, must be valid JSON
- `supporting_assets[]`: optional, file references (image/_, video/_), max 8

Location Page (`location_page`)

- `slug`: required, pattern `^[a-z0-9\-\/]+$`, max 120 chars
- `city`: required, max 60 chars
- `province`: optional, max 60 chars
- `geo_lat` / `geo_lng`: optional, numeric, within valid ranges
- `service_areas[]`: optional, max 25 items, each ≤ 60 chars
- `hours_json`: optional, valid JSON (keys: days; values: open/close)
- `gmb_place_id`: optional, max 120 chars
- `support_contact`: optional, email or tel URI

Validation Enforcement

- Enforce at Admin GraphQL input validation (HITL pre‑submit) and at publisher job (reject invalid records, log to evidence bundle).
- Record validation errors under `artifacts/seo/<date>/psf-validation.json` with sample payloads.

## GraphQL — MetaobjectDefinitionCreate (validated) — 2025-10-18

Spec section: Admin GraphQL metaobjects — create `landing_page` definition

Operation (validated via Shopify MCP; see artifacts/seo/2025-10-18/mcp/shopify_admin_graphql_validation.jsonl):

```graphql
mutation CreateLandingMetaobjectDefinition(
  $definition: MetaobjectDefinitionCreateInput!
) {
  metaobjectDefinitionCreate(definition: $definition) {
    metaobjectDefinition {
      id
      type
      name
      fieldDefinitions {
        key
        name
        required
        type {
          name
          category
        }
      }
    }
    userErrors {
      field
      message
      code
    }
  }
}
```

Example variables (dev):

```json
{
  "definition": {
    "type": "landing_page",
    "name": "Landing Page",
    "displayNameKey": "title",
    "fieldDefinitions": [
      {
        "key": "slug",
        "type": "single_line_text_field",
        "name": "Slug",
        "required": true
      },
      {
        "key": "title",
        "type": "single_line_text_field",
        "name": "Title",
        "required": true
      },
      { "key": "h1", "type": "single_line_text_field", "name": "H1" },
      {
        "key": "meta_description",
        "type": "multi_line_text_field",
        "name": "Meta Description"
      },
      { "key": "canonical_url", "type": "url", "name": "Canonical URL" },
      { "key": "hero_image", "type": "file_reference", "name": "Hero Image" },
      { "key": "intro_richtext", "type": "rich_text_field", "name": "Intro" },
      {
        "key": "faq_ref",
        "type": "list.metaobject_reference",
        "name": "FAQ Items"
      },
      {
        "key": "related_products",
        "type": "list.product_reference",
        "name": "Related Products"
      },
      {
        "key": "collection_ref",
        "type": "collection_reference",
        "name": "Collection"
      }
    ]
  }
}
```

Note: Execution occurs only in dev/staging with HITL; flags remain OFF.

### Additional variables (dev) — comparison

```json
{
  "definition": {
    "type": "comparison",
    "name": "Comparison",
    "displayNameKey": "subject_product",
    "fieldDefinitions": [
      {
        "key": "slug",
        "type": "single_line_text_field",
        "name": "Slug",
        "required": true
      },
      {
        "key": "subject_product",
        "type": "product_reference",
        "name": "Subject Product",
        "required": true
      },
      {
        "key": "vs_product",
        "type": "product_reference",
        "name": "VS Product",
        "required": true
      },
      { "key": "pros", "type": "list.single_line_text_field", "name": "Pros" },
      { "key": "cons", "type": "list.single_line_text_field", "name": "Cons" },
      {
        "key": "verdict_richtext",
        "type": "rich_text_field",
        "name": "Verdict"
      },
      { "key": "schema_json", "type": "json", "name": "Schema JSON" },
      {
        "key": "supporting_assets",
        "type": "list.file_reference",
        "name": "Assets"
      }
    ]
  }
}
```

### Additional variables (dev) — location_page

```json
{
  "definition": {
    "type": "location_page",
    "name": "Location Page",
    "displayNameKey": "city",
    "fieldDefinitions": [
      {
        "key": "slug",
        "type": "single_line_text_field",
        "name": "Slug",
        "required": true
      },
      {
        "key": "city",
        "type": "single_line_text_field",
        "name": "City",
        "required": true
      },
      {
        "key": "province",
        "type": "single_line_text_field",
        "name": "Province/State"
      },
      { "key": "geo_lat", "type": "number_integer", "name": "Lat" },
      { "key": "geo_lng", "type": "number_integer", "name": "Lng" },
      {
        "key": "service_areas",
        "type": "list.single_line_text_field",
        "name": "Service Areas"
      },
      { "key": "hours_json", "type": "json", "name": "Hours JSON" },
      {
        "key": "gmb_place_id",
        "type": "single_line_text_field",
        "name": "GMB Place ID"
      },
      {
        "key": "support_contact",
        "type": "single_line_text_field",
        "name": "Support Contact"
      }
    ]
  }
}
```
