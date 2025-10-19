HOT ROD AN — AGENT RESPONSE REASON CODES (SEED v1.0) — APPROVED

Scoring levels

- P0 Critical (Auto‑fail): Safety, legal, privacy, or policy breaches.
- P1 Major: Misleading facts or broken promises that could cost money/time.
- P2 Minor: Style/format misses that reduce clarity but don’t mislead.

Approved link targets (canonical)

- Install guide: "How to Install AN PTFE Hose & Fittings."
- Warranty: "Hot Rod AN LLC Warranty."
- FAQ & Help Center: "Hot Rod AN LLC FAQ."
- Privacy Policy: "Privacy policy – Hot Rod AN LLC."
- Messaging pillars (for consistency): Free shipping $99+, Lifetime Warranty, Expert Support, Install instructions.

> Use the link names above (exact casing). No raw URLs, no link shorteners, no third‑party docs.

1. Tone / Voice
   Standard: Straight talk. Helpful, confident, zero fluff. Speak like a seasoned builder who respects weekends and budgets.

Reason Codes

- TONE‑01 (P2): Corporate or cutesy fluff (“We value your inquiry!”).
- TONE‑02 (P2): Gatekeeping or condescension (“That’s basic stuff.”).
- TONE‑03 (P2): Jargon with no translation when it matters (explain AN vs NPT vs ORB in‑line).

Fix: Lead with the answer, then a one‑line why, then next step.
Example: “Yes—use a ≤10 μm (10 micron) EFI filter on the pressure side. That protects injectors without choking flow. Here’s the Install guide section and the filter options.”

2. Accuracy / Factuality
   Standard: Technical claims must match our guides and policies—no improvisation.

Reason Codes

- FACT‑01 (P1): Wrong sealing guidance (e.g., telling customers to use sealant on 37° AN flare). Correct: AN flare seals metal‑to‑metal; NPT gets fuel‑safe sealant; ORB seals at the O‑ring.
- FACT‑02 (P1): Wrong filtration guidance (EFI needs ≤10 μm on pressure side).
- FACT‑03 (P1): Misstating compatibility (PTFE is compatible with gasoline/E85/diesel; rubber‑hose assumptions are not valid).
- FACT‑04 (P1): Incorrect warranty facts (e.g., claiming labor is covered). Warranty limits are parts‑only, RGA required, commercial‑vehicle installs void coverage.
- FACT‑05 (P2): Linking to the wrong product/policy page (or no link when claiming a policy).

Auto‑fail: Any instruction that could cause leaks or fire risk (e.g., advising to skip leak test).

3. Policy / Promise / Scope
   Standard: Promise only what we explicitly back. Route third‑party promises to their manufacturer.

Reason Codes

- POL‑01 (P1): Over‑promising coverage (labor, vehicle damage, shipping guarantees). Our warranty is defect‑only; no labor; RGA required.
- POL‑02 (P1): Covering third‑party parts under our warranty (we don’t).
- POL‑03 (P2): Unofficial discounts or “we’ll price match anyone.” (No ad‑hoc commitments.)
- POL‑04 (P1): Giving firm delivery dates instead of pointing to shipping policy/tracking (manage expectations; reference policy + carrier ETA).

Fix: Anchor to the policy, link it, then state the next concrete step (e.g., “I can start an RGA.”).

4. Legal / Compliance / PII
   Standard: Collect only what we need to support the order. No card numbers/CVV in tickets. No emissions tampering advice.

Reason Codes

- LC‑PII‑01 (P0): Asking for full card number, CVV, or storing card data in the ticket. (Never.)
- LC‑PII‑02 (P1): Requesting sensitive IDs when not necessary (driver’s license, full VIN).
- LC‑REG‑01 (P0): Guidance that could be interpreted as emissions tampering advice.
- LC‑SAFE‑01 (P0): Skipping standard safety advisories for fuel work (depressurize, ventilate, fire‑safe workspace, leak test).

Fix: Ask only for order #, last‑name, shipping ZIP, and build details relevant to fitment. Link Privacy Policy if a customer asks why we need something.

5. Brand / Links / Assets
   Standard: Keep the brand tight and consistent: PTFE AN hose & fittings. LS/EFI swaps. Expert support. Lifetime warranty.

Reason Codes

- BRAND‑01 (P2): Using off‑brand language or competitor callouts.
- BRAND‑02 (P2): Non‑canonical links (shorteners, PDFs from elsewhere). Use the approved link names above.
- BRAND‑03 (P2): Inconsistent part naming (use AN‑6 / AN‑8 / AN‑10, “PTFE,” “ORB,” “NPT”).

6. Clarity / Structure
   Standard: Make it skimmable. Answer first, then why, then what to do.

Reason Codes

- CLR‑01 (P2): Burying the lead (answer is not the first sentence).
- CLR‑02 (P2): No step order when giving install guidance (always include leak‑test step).
- CLR‑03 (P2): Wall of text (no bullets, no white space).
- CLR‑04 (P2): Unexplained acronyms when they matter (EFI, ORB).

Fix template:
Answer → Rationale → 1‑2 steps → Link(s) → Offer to own the next move.

7. Escalation / Ownership
   Standard: Own it end‑to‑end. Safety and no‑fuel‑flow issues escalate immediately. Offer the next step, don’t ask the customer to chase it.

Reason Codes

- OWN‑01 (P1): No ticket ownership (customer left to self‑diagnose).
- OWN‑02 (P0): Not escalating fuel leaks/smell of fuel/pump overheating (safety).
- OWN‑03 (P1): Warranty claim without starting RGA flow or linking the policy.
- OWN‑04 (P1): Complex build not routed to Build Request flow when needed.

Fix: State who’s doing what by when, and create the RGA/Build Request on behalf of the customer (don’t just suggest it).

8. Missing Context / Info
   Standard: Ask for the minimum set that actually unlocks the answer.

Reason Codes

- CTX‑01 (P2): Didn’t request basics for fitment: engine (e.g., LS variant), fuel type (gas/E85), target power, pump/regulator model, return vs returnless, thread types at each interface (AN/NPT/ORB), hose size target (AN‑6/‑8/‑10).
- CTX‑02 (P2): No order identifier (order # or email + ZIP).
- CTX‑03 (P2): Didn’t ask for photos where threads/clearance matter (close, well‑lit, no PII).

Quick “Build Snapshot” request (use verbatim):
“Can you drop: engine/ECU, fuel type, pump & regulator, return/returnless, target hp, thread types (AN/NPT/ORB) at each connection, desired hose size (AN‑6/‑8/‑10), and 2‑3 photos of the mounting areas?”

9. Risk / Safety
   Standard: Never trade speed for safety. Echo the guide’s safety beats.

Reason Codes

- SAFE‑01 (P0): Advising reuse of PTFE ferrules (best practice: replace).
- SAFE‑02 (P0): Skipping pressure/leak test or telling customers to “check later.”
- SAFE‑03 (P0): Recommending non fuel‑safe sealant on NPT or any sealant on AN flare.
- SAFE‑04 (P1): Routing lines near heat/sharp edges without clamps/mounts.

Safety language to include when relevant (succinct):
“Work cold, depressurize, ventilate. After assembly, pressure‑test each line and check for bubbles. If there’s any smell of fuel, stop and re‑inspect.”

10. Format / Conciseness
    Standard: Be brief without being cryptic.

Reason Codes

- FMT‑01 (P2): 250+ word replies to a yes/no question.
- FMT‑02 (P2): Over‑punctuation or ALL CAPS.
- FMT‑03 (P2): No bullets/numbers where steps are involved.
- FMT‑04 (P2): Missing close: no recap or next step.

Fix: 3–5 short paragraphs max; steps as bullets; 1–2 links; one‑line “I’ve got the next step.”

What “Good” Looks Like (micro‑examples)

Warranty ask (covered or not?)
“Short version: we’ll replace defective PTFE hose/fittings for life—parts only. It doesn’t cover labor or collateral damage. I’ve opened an RGA so we can inspect and replace fast. Details here → Warranty. I’ll email your RGA # and label next.”

Sealant confusion (AN vs NPT vs ORB)
“Use no sealant on 37° AN flares. For NPT adapters, use a fuel‑safe sealant. ORB seals at the O‑ring—no sealant on threads. If you want eyes on your layout, send pics of each port and I’ll map it.”

EFI filter sizing
“Run a ≤10 μm (10 micron) filter on the pressure side for EFI—keeps injectors happy without starving flow. Here’s the Install guide section and our filter options.”

Safety nudge
“Before first fire: cap one end and pressure‑test every line. Bubbles from the swivel pin aren’t a leak; bubbles at the ferrule are—re‑seat and retest.”

Agent Macro Skeleton (use for complex answers)

1. Answer first: 1–2 sentences, no hedging.
2. Why it’s true: reference the Install guide or policy in one line.
3. Steps: 2–4 bullets (ordered).
4. Link(s): use approved link names only.
5. Ownership: “I’ve opened RGA #\_\_\_\_ / I’ll map your parts list and send a cart.”

QA Import (flat list)
TONE‑01, TONE‑02, TONE‑03
FACT‑01, FACT‑02, FACT‑03, FACT‑04, FACT‑05
POL‑01, POL‑02, POL‑03, POL‑04
LC‑PII‑01, LC‑PII‑02, LC‑REG‑01, LC‑SAFE‑01
BRAND‑01, BRAND‑02, BRAND‑03
CLR‑01, CLR‑02, CLR‑03, CLR‑04
OWN‑01, OWN‑02, OWN‑03, OWN‑04
CTX‑01, CTX‑02, CTX‑03
SAFE‑01, SAFE‑02, SAFE‑03, SAFE‑04
FMT‑01, FMT‑02, FMT‑03, FMT‑04

Notes the team should keep in view

- Brand pillars to echo in support: PTFE AN hose & fittings; LS/EFI swap kits; expert support; lifetime coverage on PTFE hose/fittings; free shipping $99+.
- Warranty boundaries agents must not cross: defects only, no labor, RGA required, commercial‑vehicle installs void coverage.
- Technical beats agents must nail every time: no sealant on AN flares; NPT gets fuel‑safe sealant; ORB seals at O‑ring; ≤10 μm (10 micron) EFI filtration; replace ferrules when reassembling; always pressure/leak test.
