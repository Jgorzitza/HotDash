Title: Guided Selling + Complete‑the‑Kit

## Goal

Persistent fit-finder + attach-rate engine across PDP, cart, and chat that prescribes complete kits with rationale, without enabling autopublish until HITL sign-off.

## Core Flow

1. Decision intake: vehicle → engine → fuel → HP → recommended kit variant.
2. Kit Composer: merge base kits with adapter/cross-sell rules (gauges/filters/regulators, wiring, calibration tools).
3. Output surfaces: PDP module, cart sidebar upsell, chat deep-link with prefilled cart.

## Rules Graph Outline

| Node Type            | Example Fields                                                     | Notes                                                |
| -------------------- | ------------------------------------------------------------------ | ---------------------------------------------------- |
| `VehicleProfile`     | make, model, year, trim                                            | Primary key, maps to base kit options.               |
| `UseCaseModifier`    | tow_capacity, altitude, horsepower_bands                           | Adjusts recommended adapters and add-ons.            |
| `KitBundle`          | base_sku, required_parts[], optional_parts[], install_time_minutes | Bundles autopromo to compute labor estimate.         |
| `ConflictRule`       | incompatible_parts[], fallback_message                             | Prevents unsafe combinations; must surface warnings. |
| `RecommendationEdge` | from_node, to_node, rationale, evidence_link                       | Provides explainability for attach logging.          |

Graph evaluation order:

1. Resolve `VehicleProfile` → fetch eligible `KitBundle` nodes.
2. Apply `UseCaseModifier` nodes (multiplicative factors) to add/remove optional parts.
3. Run `ConflictRule` filters; if triggered, show modal with remediation suggestions.
4. Emit `RecommendationEdge` rationale log to telemetry pipeline (Supabase decision log).

## Route & Module Skeleton

- **API**: Draft Remix loader/action at `app/routes/api.guided-selling.ts` (behind flag) returning bundle JSON with rationale + conflict notes.
- **PDP Module**: React component `app/components/guided-selling/FitFinder.tsx` renders multi-step form, persists selected profile in local storage, and hydrates recommended kit card.
- **Cart Sidebar**: Compose existing upsell component to read flagged recommendation context and render quick add/remove toggles.
- **Chat Deep-Link**: Utility in `app/services/chatwoot/guided-selling.ts` builds `/cart/add` links with metadata + fallback copy when flag off.

## Feature Flags

- `feature.guidedSelling` — gates PDP module + API (env + local storage).
- `feature.guidedSellingCart` — optional secondary flag to enable cart sidebar upsell separately.
- All flags default OFF; require Approvals HITL step prior to toggling in staging/prod.

## Acceptance Targets

- +15–25% attach rate on eligible PDPs
- ≥20% of chats send a cart deep-link
- Telemetry: capture attach attempt + success + rationale in Supabase decision log

## UX Checklist

- Fit-finder entry accessible via keyboard, maintains focus order, escape closes modals.
- PDP card shows price, parts count, install time, and rationale snippet.
- Cart sidebar explains why item recommended; supports undo.
- Chat deep-link preview includes item list; avoids exposing PII in URL.

## Evidence & Telemetry

- Contract tests to ensure deterministic outputs given profile + modifier inputs.
- Attach events piped to analytics adapter (GA4 custom dim `guided_kit_variant`).
- Decision logs stored with `scope="guided-kit"`, linking to `RecommendationEdge` rationale.

## Open Questions / Next Steps

1. Confirm data source for horsepower/fuel attributes (Supabase vs. Shopify metafields).
2. Align with QA on scripted conflict scenarios for regression testing.
3. Coordinate with Chatwoot team for deep-link preview design and gating (flag OFF by default).
