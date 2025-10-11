# Offline Modal Package — CX Escalations & Sales Pulse (2025-10-11)

## Purpose
Provide engineering, QA, enablement, and marketing with offline reference assets while the Shopify Admin embed token and refreshed Figma access remain pending. Assets reflect the current React Router implementation (2025-10-10) and keep support-inbox copy aligned across channels.

## Contents
| File | Description |
| --- | --- |
| `cx-escalations-modal.png` | Placeholder PNG mock highlighting header/body/footer regions for offline reference. |
| `sales-pulse-modal.png` | Placeholder PNG mock highlighting sections of the Sales Pulse modal. |
| `cx-escalations-modal.txt` | Focus order + support inbox callouts describing the CX Escalations modal. |
| `sales-pulse-modal.txt` | Action flow + support inbox callouts describing the Sales Pulse modal. |
| `focus-checklist.md` | Keyboard walkthrough for QA/enablement while live Admin embed is unavailable. |
| `component-snippets.md` | Canonical JSX snippets for modal headers, button clusters, and note fields, matching `app/components/modals/*`. |
| `README.md` | This overview + usage guidance. |

## Usage Guidelines
- Engineering: reference JSX snippets when wiring Admin embed routes or doing spot fixes without opening the full repo.
- QA: use PNG mocks to validate Playwright expectations (focus order, button text) while Admin embed remains inaccessible.
- Enablement/Marketing: drop PNGs into training decks and comms packets as placeholders until live screenshots are captured.
- Accessibility: confirm focus-visible outlines match `.occ-focus-visible` helper; deviations should be logged in `feedback/accessibility.md` once overlays are live.

## Evidence links
- React Router spec: `docs/design/tooltip_modal_annotations_2025-10-09.md`
- Enablement job aids: `docs/enablement/job_aids/cx_escalations_modal.md`, `docs/enablement/job_aids/sales_pulse_modal.md`
- Marketing tracker: `docs/marketing/launch_comms_packet.md`
- Admin overlay prep (pending token): `docs/design/shopify_admin_overlay_prep_2025-10-10.md`
