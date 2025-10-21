# PII Card — Operator‑Only Policy (Best Practice)

**Public text (customer‑visible):** must contain **no PII** beyond what policy allows (e.g., order ID last‑4).

**PII Card (operator‑only fields):**
- Order ID (last‑4), order status, fulfillment status
- Tracking: carrier + last event (no full tracking URL in public text)
- Shipping **city/region/country** and **postal prefix** (first 3–4)
- Line items (titles/SKUs/qty)
- Masked email (j***@d***.com), masked phone (***‑***‑1234)
- RMA status (if applicable)

**Prohibited in public text:** full address, full email, full phone, payment identifiers.

**Workflow:** Front agent composes **redacted reply** + attaches **PII card**. HITL approval required to send.
