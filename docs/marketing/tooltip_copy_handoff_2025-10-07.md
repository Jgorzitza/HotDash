---
epoch: 2025.10.E1
doc: docs/marketing/tooltip_copy_handoff_2025-10-07.md
owner: marketing
last_reviewed: 2025-10-07
doc_hash: TBD
expires: 2025-10-18
---
# Tooltip Copy Handoff — 2025-10-07

## Overview
Finalized tooltip strings for Operator Control Center tiles and approval modal. All entries stay ≤80 characters per locale to match `docs/design/copy_deck_modals.md` guidance. Copy reviewed against brand tone deck (professional, operator-first, action-oriented).

## Tile Tooltips
| Tile | Locale | Copy | Characters | Limit | Status |
|------|--------|------|------------|-------|--------|
| Sales Pulse | EN | Track today's orders vs. 7-day avg. Click to see fulfillment blockers. | 70 | 80 | ✅ Within limit |
| Sales Pulse | FR | Commandes du jour vs moyenne 7 jours. Repérez les blocages d'exécution. | 71 | 80 | ✅ Within limit |
| CX Escalations | EN | Open conversations breaching SLA. One tap to approve AI replies. | 64 | 80 | ✅ Within limit |
| CX Escalations | FR | Conversations urgentes au-delà du SLA. Approuvez les réponses IA en un clic. | 76 | 80 | ✅ Within limit |
| Inventory Heatmap | EN | See low-stock SKUs and reorder before stockouts cost you. | 57 | 80 | ✅ Within limit |
| Inventory Heatmap | FR | Voyez les SKU en stock faible et réapprovisionnez avant les ruptures coûteuses. | 79 | 80 | ✅ Within limit |
| SEO & Content Watch | EN | Pages losing >20% traffic WoW. Assign content fixes to your team. | 65 | 80 | ✅ Within limit |
| SEO & Content Watch | FR | Pages perdant >20 % de trafic SàS. Assignez une mise à jour contenu à l'équipe. | 79 | 80 | ✅ Within limit |

## Approval Modal Tooltip
| Locale | Copy | Characters | Limit | Status |
|--------|------|------------|-------|--------|
| EN | This action will be logged in your decision audit trail. | 56 | 80 | ✅ Within limit |
| FR | Cette action sera enregistrée dans votre journal d'audit des décisions. | 71 | 80 | ✅ Within limit |

## Implementation Notes for Engineering
- Tooltip keys follow `tile.{tile_slug}.tooltip` pattern used in `docs/design/copy_deck_modals.md`; add FR strings to localization files with the same keys.
- Persist dismissal state per user via existing preferences service (see `app/services/preferences.ts`).
- First-visit trigger: call tooltip sequence once per account, as outlined in `docs/marketing/launch_comms_packet.md`.
- If character limits tighten for mobile, fall back to responsive truncation recommended in design doc.

## Next Steps
1. Share this handoff doc with design for placement annotations on wireframes.
2. Load EN strings into `en.json` and FR strings into `fr.json` before staging review.
3. Flag any layout issues discovered in QA within `feedback/marketing.md` for traceability.
