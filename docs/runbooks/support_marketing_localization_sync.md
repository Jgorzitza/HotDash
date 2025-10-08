---
epoch: 2025.10.E1
doc: docs/runbooks/support_marketing_localization_sync.md
owner: support
last_reviewed: 2025-10-08
doc_hash: TBD
expires: 2025-10-21
---
# Support-Marketing Localization Glossary Alignment

## Purpose
Ensure support coaching and operator training align with marketing's copy deck tone and localization glossary. Maintain consistency in customer-facing language across dashboard, Chatwoot templates, and support communications.

---

## Key Documents Review

### Marketing Copy Deck
**Location:** docs/design/copy_deck.md

**Scope:** 100+ localized strings (EN/FR) covering:
- Dashboard page elements
- Tile headings and summaries
- Action CTAs (buttons)
- Empty states, error messages
- Toast notifications
- Modal dialogs (CX Escalation, Inventory, SEO)

**Key Observations:**
- Professional, action-oriented tone
- French translations provided for all UI elements
- Consistent use of "Operator Control Center" → "Centre de contrôle opérateur"
- Status terminology: "Healthy" → "En bonne santé", "Attention needed" → "Attention requise"

### Brand Tone Deck
**Location:** docs/marketing/brand_tone_deck.md (reviewed if exists)

**Support Assessment:**
- Awaiting marketing brand tone guidelines for voice/style consistency
- Copy deck demonstrates professional, operator-focused language
- Tone appears aligned with B2B SaaS expectations

---

## Localization Glossary for Support Training

### Critical Terminology (EN → FR)

#### Dashboard & UI Terms
| English | Français | Support Context |
|---------|----------|-----------------|
| Operator Control Center | Centre de contrôle opérateur | Official product name |
| Mock mode | Mode d'exemple | Testing/demo environment |
| Live integrations | Intégrations en direct | Production data mode |
| Dashboard | Tableau de bord | Main interface |
| Tile | Tuile | Dashboard widget/card |

#### Status & Alerts
| English | Français | Support Context |
|---------|----------|-----------------|
| Healthy | En bonne santé | Green status, no issues |
| Attention needed | Attention requise | Yellow warning state |
| Configuration required | Configuration requise | Setup incomplete |
| Error | Erreur | Red error state |
| SLA breached | SLA dépassé | Service level violation |

#### CX Escalation Terms
| English | Français | Support Context |
|---------|----------|-----------------|
| CX Escalations | Escalades CX | Tile name, conversation priority |
| View & Reply | Voir et répondre | Primary CTA button |
| Approve & Send Reply | Approuver et envoyer la réponse | AI reply approval action |
| Escalate to Manager | Escalader au gestionnaire | Escalation ladder step |
| Mark Resolved | Marquer comme résolu | Conversation closure |
| Conversation Preview | Aperçu de la conversation | Modal section heading |
| Suggested Reply (AI-generated) | Réponse suggérée (générée par IA) | AI reply indicator |

#### Action Buttons (Critical for Training)
| English | Français | Support Context |
|---------|----------|-----------------|
| View Details | Voir les détails | Drill-in action |
| Take Action | Prendre des mesures | Generic approval CTA |
| Confirm Action | Confirmer l'action | Final approval step |
| Cancel | Annuler | Abort/close action |
| Retry | Réessayer | Error recovery |
| Dismiss | Fermer | Close notification |

#### Toast Notifications (Operator Feedback)
| English | Français | Support Context |
|---------|----------|-----------------|
| Reply sent to {customer} | Réponse envoyée à {customer} | Success confirmation |
| Decision logged to audit trail | Décision enregistrée dans le journal d'audit | Approval recorded |
| Action Failed | Action échouée | Error notification |
| Please try again | Veuillez réessayer | Retry prompt |

---

## Support Coaching Alignment

### Tone Guidelines (Based on Copy Deck)
**English Tone:**
- **Professional but approachable:** "Appreciate you reaching out" (not "Thanks for contacting us")
- **Action-oriented:** "I'm checking on your order now" (not "We'll look into it")
- **Empathetic:** "I'm sorry for the trouble" (not "We apologize for any inconvenience")
- **Clear next steps:** "will follow up with an update shortly" (not "we'll get back to you")

**French Tone:**
- Maintain formal "vous" form (not informal "tu")
- Use action verbs: "Prendre des mesures" (take action) not passive constructions
- Professional but warm: Consistent with EN approach

### Chatwoot Template Alignment
**Current Templates (app/services/chatwoot/templates.ts):**

1. **ack_delay** (EN):
   ```
   Hi {{name}}, thanks for your patience. I'm checking on your order now and will follow up with an update shortly.
   ```
   **Tone Assessment:** ✅ Aligned with copy deck (professional, action-oriented)
   **French Translation Needed:** Add to glossary

2. **ship_update** (EN):
   ```
   Appreciate you reaching out, {{name}}. Your order is with our carrier and I'm expediting a status check right away.
   ```
   **Tone Assessment:** ✅ Aligned (action-oriented, urgent)
   **French Translation Needed:** Add to glossary

3. **refund_offer** (EN):
   ```
   I'm sorry for the trouble, {{name}}. I can refund this immediately or offer store credit—let me know what works best.
   ```
   **Tone Assessment:** ✅ Aligned (empathetic, clear options)
   **French Translation Needed:** Add to glossary

**Recommendation:** Request marketing to provide official French translations for Chatwoot templates, or use translation service per product direction.

---

## Localization Gaps & Actions

### Current Gaps
1. ❌ **Chatwoot templates not localized:** Only EN versions exist in codebase
2. ❌ **Support runbooks only in EN:** Training materials need FR versions for bilingual operators
3. ❌ **AI prompt library only in EN:** reply-generation.v1.md prompt not localized
4. ⚠️ **Brand tone deck not reviewed:** Awaiting marketing's brand voice guidelines

### Action Items for Support
- [ ] **Immediate (Pre-Pilot):**
  - Request marketing to provide French translations for 3 Chatwoot templates
  - Update docs/runbooks/cx_escalations.md with bilingual template examples
  - Add localization note to operator_training_agenda.md
  - **Status 2025-10-08:** Submitted request doc (`docs/marketing/chatwoot_template_localization_request_2025-10-08.md`); awaiting marketing owner assignment. Review translation status Tue/Thu until delivered.

- [ ] **Short-term (Pilot Phase):**
  - Create FR version of operator_training_agenda.md if bilingual operators
  - Coordinate with marketing on glossary updates for new UI strings
  - File Linear tickets for any copy deck terminology unclear to operators

- [ ] **Ongoing:**
  - Review new marketing copy (release notes, in-app messaging) for tone consistency
  - Update training materials when copy deck changes
  - Maintain support glossary doc with marketing input

### Action Items for Marketing (Support to Request)
- [ ] Provide French translations for Chatwoot templates (ack_delay, ship_update, refund_offer)
- [ ] Share brand tone deck with voice/style guidelines for support training
- [ ] Confirm glossary terms approved for customer-facing communications
- [ ] Engage translation service for future template additions (per product direction)

---

## Support Training Terminology Guide

### How to Reference Dashboard Elements in Training
**Correct:**
- "Click the **View & Reply** button on the CX Escalations tile"
- "Review the **Conversation Preview** section in the modal"
- "The **Approve & Send Reply** button logs your decision"

**Incorrect (Avoid):**
- "Click the reply button" (too generic)
- "Look at the conversation" (unclear which UI element)
- "Send the message" (doesn't indicate approval workflow)

### French Training Context
**If training bilingual operators:**
- Always show EN and FR terms side-by-side: "SLA breached / SLA dépassé"
- Use official translations from copy_deck.md
- Clarify that dashboard UI may display in EN or FR based on operator preferences (future feature)
- Chatwoot interface language independent of dashboard language

### Customer Communication Guidelines
**English:**
- Use Chatwoot template tone as baseline: professional, empathetic, action-oriented
- Avoid overly casual: "no worries", "totally", "hey there"
- Avoid overly formal: "kindly advise", "as per our records", "please be informed"

**French:**
- Maintain "vous" formality
- Use active voice: "Je vérifie votre commande" not "Votre commande sera vérifiée"
- Follow marketing's approved translations for consistency

---

## Coordination Protocol

### Daily/Weekly Sync with Marketing
**Per support direction (docs/directions/support.md:29):**
- Coordinate with marketing on localization glossary to keep support coaching aligned with copy deck tone

**Sync Cadence:**
- **Ad-hoc during pilot:** When new UI strings or templates added
- **Weekly post-rollout:** Review copy deck updates, new release notes, in-app messaging

**Sync Agenda:**
1. Review any copy_deck.md or copy_deck_modals.md updates
2. Discuss new customer-facing terminology (glossary additions)
3. Align on tone for upcoming feature releases
4. Share operator feedback on unclear UI language
5. Request translations for new Chatwoot templates

### Memory Logging
Support logs coordination outcomes in Memory (scope `ops`):
- **Decision type:** `support.localization.sync`
- **What:** "Coordinated with marketing on glossary alignment for [feature/release]"
- **Why:** "Ensure support training matches copy deck tone, [specific changes discussed]"
- **Evidence:** Link to updated runbook or training agenda

---

## Translation Request Workflow

### When Support Needs Translation
1. **Identify need:** New Chatwoot template, runbook content, or training materials requiring FR version
2. **Draft EN content:** Finalize English version first (clarity, tone, accuracy)
3. **Submit request to marketing:**
   - Use template: "Translation Request: [Item Name]"
   - Include: EN source text, context (customer-facing vs. internal), character limits (if UI constraint)
   - Reference docs/design/copy_deck.md for existing terminology precedents
4. **Marketing engages translation service** (per product + marketing direction)
5. **Support reviews FR translation:**
   - Verify tone aligns with brand guidelines
   - Test with bilingual operators for clarity
   - Confirm character limits respected (button labels, toast messages)
6. **Update glossary:** Add new terms to this doc for future reference

---

## Glossary Maintenance

### Ownership
- **Marketing:** Owns official copy deck (docs/design/copy_deck.md, copy_deck_modals.md)
- **Support:** Owns runbooks and training materials; references marketing glossary
- **Designer:** Provides EN/FR string pairs for UI implementation

### Update Cadence
- **Copy Deck:** Updated by designer/marketing per feature releases
- **Support Glossary (this doc):** Updated by support after marketing coordination
- **Training Materials:** Updated within 48 hours of copy deck changes

### Version Control
- Support glossary updates logged in revision history (end of this doc)
- Reference copy_deck.md last_reviewed date to track alignment

---

## Support Training Checklist (Localization)

### Pre-Training Prep
- [ ] Verify copy_deck.md is current (check last_reviewed date)
- [ ] Confirm Chatwoot templates have FR translations if bilingual operators
- [ ] Update operator_training_agenda.md with glossary reference
- [ ] Print EN/FR term cheat sheet for training session

### During Training
- [ ] Explain official terminology (refer to glossary)
- [ ] Show both EN and FR UI elements (if applicable)
- [ ] Clarify customer communication tone guidelines
- [ ] Note any operator confusion about terminology → file Linear ticket

### Post-Training
- [ ] Update glossary if operators identify missing terms
- [ ] Share terminology feedback with marketing
- [ ] Log sync outcomes in feedback/support.md

---

## Related Documentation
- Copy Deck (EN/FR): docs/design/copy_deck.md
- Copy Deck Modals (EN/FR): docs/design/copy_deck_modals.md
- Brand Tone Deck: docs/marketing/brand_tone_deck.md
- Chatwoot Templates: app/services/chatwoot/templates.ts
- Operator Training Agenda: docs/runbooks/operator_training_agenda.md
- Support Direction: docs/directions/support.md
- Marketing Direction: docs/directions/marketing.md

---

## Revision History
| Date | Author | Change |
|------|--------|--------|
| 2025-10-08 | support | Logged translation request cadence and status tracking plan |
| 2025-10-07 | support | Initial localization glossary and marketing sync protocol per manager sprint focus |
