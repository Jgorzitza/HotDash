---
epoch: 2025.10.E1
doc: docs/design/shopify_admin_overlay_prep_2025-10-10.md
owner: designer
last_reviewed: 2025-10-13
doc_hash: TBD
expires: 2025-10-20
---

# Shopify Admin Overlay Prep — Operator Control Center (2025-10-10)

## Goal

Prepare annotated overlays for the Shopify Admin embed screens as soon as the updated design token access (Figma API token or Polaris component share) arrives. These overlays must mirror the dashboard modals (CX Escalations, Sales Pulse) so engineering can maintain parity between embedded Admin surfaces and the React Router dashboard.

## Required Inputs

- **Design token access**: Awaiting Shopify Admin team token to sync latest Polaris variables in Figma.
- **Figma workspace access**: Still pending. Static assets will be produced with current tooling the moment access is granted.
- **Data capture**: Need fresh screenshots from staging Admin embed once `?mock=0` returns 200.

## Deliverables

1. Annotated overlay for CX Escalations Admin modal (focus order, tooltip copy, support inbox callout) aligned with `docs/design/modal_refresh_2025-10-13.md`.
2. Annotated overlay for Sales Pulse Admin modal (chart helper text, skip link, support inbox reminder) reflecting new CTAs (`Log follow-up`, `Escalate to ops`).
3. Overlay handoff bundle (SVG + PDF + Markdown notes) stored under `docs/design/assets/shopify-admin/` with toast trigger summary.
4. Evidence link logged in `feedback/manager.md` and `feedback/designer.md` including Supabase mutation IDs from staging captures.

## Production Plan

1. **Token landing notification** (Owner: Manager) → confirm access to Polaris tokens + Figma workspace via # `#occ-design`.
2. **Screenshot capture** (Owner: Engineer/QA) → capture Shopify Admin embedded modals in both healthy + attention states; drop captures in `artifacts/engineering/raw_captures/`.
3. **Overlay creation** (Owner: Designer) → import screenshots, apply annotation template from `docs/design/assets/templates/modal-sales-pulse-overlay-template.svg`, update callout numbering to match `docs/design/modal_refresh_2025-10-13.md`. Until then, reference offline PNG mocks in `artifacts/design/offline-cx-sales-package-2025-10-11/`.
4. **Support inbox alignment** → ensure overlay copy references `customer.support@hotrodan.com` and highlights Supabase audit trail linkage for both actions.
5. **Toast confirmation** → capture success + error toasts (desktop + tablet) to prove parity with dashboard spec; include them in overlay bundle.
6. **Handoff** → package overlays (SVG + PNG) and update enablement + marketing job aids within 24h of token delivery.

## Risks & Mitigations

- **Delayed token**: Continue shipping static textual specs (`docs/design/tooltip_modal_annotations_2025-10-09.md`) so engineering remains unblocked.
- **Screenshot drift**: Confirm environment variables match dashboard theme before capturing; rerun if tiles show outdated tokens.
- **Accessibility regressions**: Verify focus outlines with `.occ-focus-visible` helper in Admin context; add notes if Polaris overrides differ.
- **Toast divergence**: If Admin embeds render Shopify toast styles, capture comparison and flag engineering to standardize via Polaris `Frame` toast API.

## Evidence Tracking

- Add progress entries to `feedback/designer.md` once token lands and overlays are generated.
- Notify manager with links in `feedback/manager.md` and cross-post to `#occ-design`.
- Reference `docs/design/modal_refresh_2025-10-13.md` and the captured toast assets in every evidence update.
