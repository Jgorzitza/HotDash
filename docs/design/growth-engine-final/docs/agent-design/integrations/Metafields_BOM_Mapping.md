# Metafields — Bundle BOM Mapping (Standard)

**Namespace:** `hotdash.bom`

## On product (bundle) metafield: `hotdash.bom.components` (JSON)
- Describes the components and their required quantities
- Supports parameterized options (color/length) → specific component variant IDs

### Example
{
  "components": [
    { "handle": "20ft-braided-hose", "variant_map": {"black":"gid://shopify/ProductVariant/111"}, "qty": 1 },
    { "handle": "hose-nut", "variant_map": {"black":"gid://shopify/ProductVariant/222"}, "qty": 8 },
    { "handle": "hose-end-straight", "variant_map": {"black":"gid://shopify/ProductVariant/333"}, "qty": 4 },
    { "handle": "hose-end-45", "variant_map": {"black":"gid://shopify/ProductVariant/444"}, "qty": 2 },
    { "handle": "hose-end-90", "variant_map": {"black":"gid://shopify/ProductVariant/555"}, "qty": 2 },
    { "handle": "clamp-bag", "variant_map": {"default":"gid://shopify/ProductVariant/666"}, "qty": 1 },
    { "handle": "efi-quick-connect-5-16", "variant_map": {"default":"gid://shopify/ProductVariant/777"}, "qty": 1 },
    { "handle": "efi-quick-connect-3-8",  "variant_map": {"default":"gid://shopify/ProductVariant/888"}, "qty": 1 }
  ],
  "parameters": ["color","length"]
}

## On component variants
- Optional boolean metafield: `hotdash.bom.is_component = true` to aid discovery.

## Rules
- Variant IDs must be resolvable (Storefront/Admin API).
- Parameter mapping must be exhaustive for options offered on the bundle.
