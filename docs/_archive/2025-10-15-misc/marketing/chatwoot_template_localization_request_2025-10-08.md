---
epoch: 2025.10.E1
doc: docs/marketing/chatwoot_template_localization_request_2025-10-08.md
owner: support
last_reviewed: 2025-10-08
doc_hash: TBD
expires: 2025-10-15
---

# Localization Request — Chatwoot Templates FR Translation

## Summary

Support is requesting official French translations for the three Chatwoot reply templates used in the CX Escalations modal. These translations unblock bilingual operator training and ensure customer-facing replies remain on-brand.

## Templates Requiring Translation

| Template ID    | English Copy                                                                                                          | Notes                                                             |
| -------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `ack_delay`    | Hi {{name}}, thanks for your patience. I'm checking on your order now and will follow up with an update shortly.      | Preserve empathetic tone; highlight active follow-up.             |
| `ship_update`  | Appreciate you reaching out, {{name}}. Your order is with our carrier and I'm expediting a status check right away.   | Keep action-oriented voice; include promise to expedite tracking. |
| `refund_offer` | I'm sorry for the trouble, {{name}}. I can refund this immediately or offer store credit—let me know what works best. | Maintain clear options; respect brand tone for apologies.         |

## Acceptance Criteria

- Provide approved FR copy that mirrors the tone guidelines in `docs/marketing/brand_tone_deck.md` and glossary entries in `docs/runbooks/support_marketing_localization_sync.md`.
- Confirm whether {{name}} placeholder should remain or be adapted for FR grammar.
- Document translations and review notes in `feedback/localization.md` with references back to this request.
- Target delivery by **2025-10-10 @ 17:00 ET** to stay ahead of the operator training dry run.

## Supporting Context

- Training agenda: `docs/runbooks/operator_training_agenda.md`
- CX Escalations runbook (modal walkthrough): `docs/runbooks/cx_escalations.md`
- Localization glossary + cadence: `docs/runbooks/support_marketing_localization_sync.md`
- Prior translation review kickoff: `docs/marketing/translation_review_request_2025-10-07.md`

## Next Steps

1. Marketing/localization assigns FR translator and confirms availability.
2. Translator delivers drafts; support reviews tone fit against glossary.
3. Final copy committed to `app/services/chatwoot/templates.ts` once approved; update glossary doc with FR strings.

Please reply in #occ-localization or annotate this doc with ownership details so support can track completion.
