Status: Review complete — recommendations below (no implementation yet)

# Review: Agent Reason Codes Seed (docs/specs/agent_reason_codes.md)

Overall: Excellent domain fit and specificity. The taxonomy aligns with our global editorial reasons and extends with concrete, high‑signal technical checks for AN/PTFE guidance, safety, and policy. Below are recommendations to make this implementable across features and actionable in UI and analytics.

## 1) Normalize for Cross‑Feature Use

- Keep seed as the authoritative “Customer Replies” set; map to our global categories so we can reuse where relevant in Social and Discounts.
- Add metadata per code:
  - `severity`: P0/P1/P2 (already present)
  - `block`: boolean (P0 → block Approve; P1 → warn → Approve requires explicit reason acknowledgement; P2 → soft‑note)
  - `features`: ["customerReplies", "social", "discounts", "inventory"] (most codes apply to Customer Replies; Social should use Tone/Brand, Compliance/Claims, Link hygiene; Inventory should use Policy/Safety when customer‑facing comms are involved)

Example JSON (proposed representation)

```
{
  "code": "FACT-01",
  "label": "Wrong sealing guidance",
  "category": "Accuracy/Factuality",
  "severity": "P1",
  "block": false,
  "features": ["customerReplies"],
  "hint": "37° AN flares seal metal‑to‑metal; NPT requires fuel‑safe sealant; ORB seals at O‑ring."
}
```

## 2) P0 Handling (Blocking)

- Mark P0 items (LC‑PII‑01/02, LC‑REG‑01, LC‑SAFE‑01, SAFE‑01..03) as `block: true` so Approve/Schedule are disabled until edited.
- UI copy should reflect: “Blocking issue: fix or Reject. Approve disabled due to P0.”

## 3) Canonical Links

- Store canonical link names → URL slugs in config (not in agent text). Example mapping:
  - `Install guide` → `/guides/an-ptfe-install`
  - `Warranty` → `/policies/warranty`
  - `FAQ & Help Center` → `/help`
  - `Privacy Policy` → `/policies/privacy`
- Composer inserts by name; renderer resolves to URL to prevent drift. This avoids raw URLs and ensures consistency.

## 4) QA & Scoring Integration

- Keep “QA Import (flat list)” as a machine‑readable section; we can parse and use to seed the code list.
- Consider adding a `weight` per code for scoring overall reply quality (P0 > P1 > P2 weights), to drive coaching heatmaps.

## 5) Social/Discounts Alignment

- Social posts should reference `BRAND-0x`, `TONE-0x`, `COMPLIANCE/CLAIMS` equivalents; add two codes:
  - `SOC-LINK-01 (P1)`: Missing UTM or broken link.
  - `SOC-CLAIM-01 (P0)`: Performance/guarantee claim not supported by policy.
- Discounts: add codes for offer misuse:
  - `DISC-STACK-01 (P1)`: Violates discount combination settings.
  - `DISC-TERM-01 (P2)`: Missing end date or default 7‑day term.

## 6) Customer Replies Macros

- Great skeleton. Suggest we save the “Build Snapshot” prompt as a reusable macro with a one‑click insert.
- Add a macro for “Sealant guidance (AN/NPT/ORB)” and “EFI filter sizing” to standardize phrasing.

## 7) Safety Language

- Keep the short safety advisory; also add an explicit “Leak‑test always” badge to composer when the topic involves fuel system work (contextual hint).

## 8) Implementation Plan (post‑approval)

- Convert seed doc into JSON per code with fields: code, label, category, severity, block, features, hint.
- Map categories to approvals reason taxonomy; expose in Approvals drawer reason picker.
- Enforce P0 blocking; require reasons on Approve (per your direction) and on Approve with Edit.
- Log code selections in audit; roll up by category for weekly coaching.

## 9) Minor editorial suggestions

- Consider adding `FACT-06 (P1)`: “PTFE reassembly requires new ferrule—no reuse.” (It’s in Safety as SAFE‑01; duplicating under factual helps catch where the message is advisory rather than blocking.)
- Add `CLR-05 (P2)`: “No link when citing policy/guide.” (You have FACT‑05; clarity variant helps UI highlight missing links even if the fact is correct.)
- Add `OWN-05 (P1)`: “No leak‑test ownership (didn’t confirm customer steps).”

No content changes have been applied yet. Awaiting your confirmation to proceed to implementation in the approvals reason‑codes JSON structure.
