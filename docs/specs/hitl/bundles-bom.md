Status: Planned only — do NOT seed or ship yet

# Bundles BOM Data Shape (Runtime Product)

Goal: Represent bundle variants as parameterized Bills of Materials (BOM) so that:

- Virtual stock is computed from component availability
- Bundle sales decrement component inventory (orders/paid webhook)
- Reorder logic and AVLC operate at the component level

## Core Entities (planned)

1. bundle_templates

- id (uuid)
- title
- description?
- tags[]?
- param_schema: Array<ParamSpec>
- components: Array<ComponentSpec>
- version (int)
- created_at, updated_at

2. bundle_variants_map

- bundle_variant_id (Shopify ProductVariant id)
- template_id (fk → bundle_templates.id)
- param_values: { [paramKey: string]: string | number }
- created_at, updated_at

3. locations_map (reuse from inventory plan)

- app_location_key (e.g., "MAIN", "CANADA")
- shopify_location_id (GID)
- is_main (bool)
- is_proxy (bool)

Note: Component master data (variant_id, inventoryItemId, sku, options) is read from Shopify on demand; we don’t duplicate it unless we add a cache table later.

## ParamSpec

- key: string (e.g., "hose_color", "hose_length")
- label: string
- type: "enum" | "string" | "number"
- required: boolean
- enum?: string[] (for type=enum)
- default?: string | number
- sources?:
  - variant_option?: string (e.g., "Color", "Length") — derive from bundle variant options
  - variant_metafield?: { namespace: string, key: string }
- normalize?: { synonyms?: Array<{ from: string, to: string }> }

## ComponentSpec

- name: string (e.g., "Hose", "StraightFitting", "45Fitting", "90Fitting")
- qty_per_bundle: integer (>0)
- selector: one of
  - { kind: "variantId", value: string } // gid://shopify/ProductVariant/...
  - { kind: "sku", value: string }
  - { kind: "hr_an_mpn", value: string }
  - { kind: "dynamic", template: string, params: string[] }
    - Example template: "hose-{hose_color}-{hose_length}"
- bindings?: Array<Binding>
  - Binding: { component_option: string, from_param: string }
    - e.g., component_option="Color", from_param="hose_color"
- notes?: string

## Resolution Rules

Given a bundle_variant_id:

1. Find bundle_variants_map → template_id and param_values
2. If any param_value missing and ParamSpec.sources.variant_option is set, derive from the bundle variant’s option value; normalize via synonyms if configured.
3. For each ComponentSpec:
   - If selector.kind != "dynamic": resolve via provided field (variantId/sku/hr_an_mpn)
   - If selector.kind == "dynamic": substitute params into template and resolve to SKU → variant → inventoryItemId
   - Apply bindings to assert that selected variant option (e.g., Color/Length) matches param value
4. Validation: all components must resolve to exactly one inventoryItemId; else error (blocked and logged)

## Virtual Stock (computed)

virtual_stock(bundle_variant) = min_over_components(floor(component_available / qty_per_bundle))
Notes:

- Use MAIN location availability for sales and dashboards
- Optionally cache computed value with timestamp for UI; never the source of truth

## Webhook Adjustment (orders/paid)

- For each bundle line: resolve components → produce changes array
- Mutation: inventoryAdjustQuantities
  - name: available
  - reason: correction
  - referenceDocumentUri: gid://shopify/Order/${order_id}
  - changes: [{ inventoryItemId, locationId: MAIN, delta: - (qty × qty_per_bundle) }]
- Idempotency key: ${order_id}:${line_item_id}:${component_sku}

## Overnight Settlement (proxy)

- See inventory-updates.md — Canada negatives normalized to 0 and MAIN decreased by same amount

## Example: AN6 Hose Bundle (template)

Param schema

```
[
  { "key": "hose_color", "label": "Hose Color", "type": "enum", "required": true,
    "enum": ["black", "black/red", "black/blue"], "sources": { "variant_option": "Color" },
    "normalize": { "synonyms": [{"from":"Black Red","to":"black/red"}] }
  },
  { "key": "hose_length", "label": "Hose Length", "type": "enum", "required": true,
    "enum": ["20ft", "30ft", "40ft"], "sources": { "variant_option": "Length" } }
]
```

Components

```
[
  { "name": "Hose", "qty_per_bundle": 1,
    "selector": { "kind": "dynamic", "template": "hose-{hose_color}-{hose_length}", "params": ["hose_color","hose_length"] },
    "bindings": [ { "component_option": "Color", "from_param": "hose_color" },
                   { "component_option": "Length", "from_param": "hose_length" } ]
  },
  { "name": "StraightFitting", "qty_per_bundle": 4,
    "selector": { "kind": "dynamic", "template": "fitting-straight-an6-{hose_color}", "params": ["hose_color"] },
    "bindings": [ { "component_option": "Color", "from_param": "hose_color" } ]
  },
  { "name": "45Fitting", "qty_per_bundle": 2,
    "selector": { "kind": "dynamic", "template": "fitting-45-an6-{hose_color}", "params": ["hose_color"] },
    "bindings": [ { "component_option": "Color", "from_param": "hose_color" } ]
  },
  { "name": "90Fitting", "qty_per_bundle": 2,
    "selector": { "kind": "dynamic", "template": "fitting-90-an6-{hose_color}", "params": ["hose_color"] },
    "bindings": [ { "component_option": "Color", "from_param": "hose_color" } ]
  }
]
```

bundle_variants_map example

```
{
  "bundle_variant_id": "gid://shopify/ProductVariant/1234567890",
  "template_id": "tmpl_an6_hose_bundle_v1",
  "param_values": { "hose_color": "black/red", "hose_length": "30ft" }
}
```

## Constraints & Validation

- All components must resolve to a unique inventoryItemId; ambiguous selectors fail the line and log
- qty_per_bundle must be integer > 0
- Param values must pass enum or type validation; normalization applies before validation
- Duplicate component lines should be consolidated before mutation (sum deltas)

## Versioning & Migration

- template.version increments on structural changes (params/components)
- bundle_variants_map records template_id + version for historical reproduction
- Migrator can re-resolve param bindings when enums change (HITL review recommended)

## Admin UX (planned)

- Templates index: create/edit param schema and components; preview resolution for sample param sets
- Variant mapping: attach bundle variants to templates; import param values from options; edit overrides
- Health: compute virtual stock, list unresolved components, show recent webhook adjustments

## Security & Audit

- Record every adjust group id and referenceDocumentUri in ledger
- Redact PII in logs; no product secrets in reference URIs
