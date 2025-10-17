# Action Object — Contract

Actions are the **only** object the UI and operators need to care about. Everything funnels into scored, reviewable Actions with drafts.

## JSON Schema (v1)

```json
{
  "id": "uuid",
  "type": "SEO_TITLE_REFRESH | PROGRAMMATIC_PAGE | BUNDLE_NUDGE | STOCKOUT_DROP_PLAN | CW_REPLY_DRAFT | PERF_FIX",
  "target": {
    "url": "string (optional)",
    "productId": "string (Shopify GID, optional)",
    "metaobjectId": "string (optional)",
    "chatId": "string (Chatwoot, optional)"
  },
  "evidence": {
    "gsc": [
      { "query": "string", "impressions": 0, "ctr": 0.0, "position": 0.0 }
    ],
    "ga4": { "sessions": 0, "revenue": 0.0, "cvr": 0.0 },
    "shopify": { "inventory": 0, "attachRate": 0.0, "sales28d": 0.0 },
    "perf": { "lcp": 0.0, "cls": 0.0, "inp": 0.0 },
    "chat": { "intent": "string", "lastMessage": "string" }
  },
  "draft": {
    "title": "string",
    "meta": "string",
    "bodyDelta": "<ins>...</ins> and <del>...</del> HTML snippet",
    "reply": "string",
    "assets": [{ "type": "banner|badge|sectionJSON|bundle", "payload": {} }]
  },
  "checks": [
    { "name": "HelpfulContent", "status": "pass|fail", "notes": "string" }
  ],
  "confidence": 0.0,
  "expectedImpact": { "clicks7d": 0, "revenue7d": 0.0 },
  "canAutoPublish": false,
  "expiresAt": "ISO8601 string",
  "createdAt": "ISO8601 string"
}
```

## Types

- `SEO_TITLE_REFRESH` — title/meta/intro/internal links patch for an existing page.
- `PROGRAMMATIC_PAGE` — new metaobject-backed page (vehicle/engine/kit/calculator).
- `BUNDLE_NUDGE` — attach-rate driven upsell on PDP/cart, or bundle suggestion.
- `STOCKOUT_DROP_PLAN` — banner/badge/email/SMS drafts for soon-to-sell-out items.
- `CW_REPLY_DRAFT` — guided selling reply + ready-to-approve cart link.
- `PERF_FIX` — specific performance task (compress image, defer script).

## Lifecycle

`candidate → queued → shown → approved|dismissed → executed → measuring → closed`

## Execution Guarantees

- **Idempotent** adapters: same Action can be executed twice with no harm.
- **Dry-run** mode: every Action shows a rendered preview and diff before approval.
- **Rollback**: each Action stores a revert plan (previous values / unpublish instruction).
