---
epoch: 2025.10.E1
doc: docs/design/staging_screenshot_checklist.md
owner: designer
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-17
---
# Staging Screenshot & Overlay Checklist — Operator Control Center

> Use this runbook once QA signals the staging host is green. Captured assets unblock enablement/support dry-run packets and engineering visual QA. Mirror evidence links into `feedback/designer.md` and `feedback/manager.md` when complete.

## Prerequisites
- ✅ QA confirms smoke test pass on staging (`hotdash-staging.fly.dev`) and provides timestamp + build hash.
- ✅ Latest design assets pulled from `docs/design/assets/` (annotated SVGs, status icons, token references).
- ✅ Browser tools prepped for high-resolution capture (Chrome/Edge DevTools, 1280px width minimum).
- ✅ `?mock=1` query available for deterministic tile states when live data is unavailable.
- ✅ Supabase decision log accessible or fallback evidence path agreed with reliability.

## Capture Targets
1. **Dashboard Overview (Desktop 1440x900)**
   - Show full tile grid with mixed states (healthy, attention, critical).
   - Overlay focus order arrows for first tile row.
   - Filename: `staging-dashboard-overview-YYYYMMDD.png`.
2. **CX Escalations Modal**
   - Use live or mock breached conversation.
   - Apply callouts from `docs/design/assets/modal-cx-escalations-annotations.svg`.
   - Filename: `modal-cx-escalations-callouts-YYYYMMDD.png`.
3. **Sales Pulse Modal**
   - Include revenue delta chip hover + skip-link reference.
   - Apply callouts per `docs/design/assets/modal-sales-pulse-annotations.svg`.
   - Filename: `modal-sales-pulse-callouts-YYYYMMDD.png`.
4. **Inventory Heatmap Modal**
   - Capture SKU summary, Days of Cover tooltip, action row.
   - Apply callouts using `docs/design/assets/modal-inventory-heatmap-annotations.svg`.
   - Filename: `modal-inventory-heatmap-callouts-YYYYMMDD.png`.
5. **Tile Error & Empty States**
   - Use `?mock=error` and `?mock=empty` toggles if necessary.
   - Focus on toast + approval flows; tie back to copy deck.
   - Filename: `tile-state-<sales|cx|inventory>-<error|empty>-YYYYMMDD.png`.

## Capture Workflow
1. **Set Viewport**
   - Desktop: 1440px width, 100% zoom.
   - Tablet: 834px width for responsive verification (optional evidence).
2. **Enable Focus Indicators**
   - In DevTools, toggle `:focus-visible` on key elements to surface `--occ-focus-ring`.
   - Document sequence in notes.
3. **Record Tooltip Content**
   - Trigger hover/focus tooltips; copy English-only text into notes for alt text parity.
4. **Annotate**
   - Use the provided SVG overlays (CX, Sales, Inventory) or add numbered callouts via Figma/Acorn if access restored.
   - Ensure annotations match enablement script numbering (`docs/enablement/job_aids/annotations/2025-10-16_dry_run_callouts.md`).
5. **Export & Optimize**
   - Save PNG @2x for clarity.
   - Run through `npx sharp-cli` or macOS Preview to keep files <500 KB without quality loss.
6. **Log Evidence**
   - Upload to `artifacts/ops/dry_run_2025-10-16/`.
   - Add entries to `feedback/designer.md` (include timestamps, filenames, outstanding gaps).
   - Ping enablement/support once assets in place.

> **Note:** As of 2025-10-10, `?modal=sales` and `?modal=cx` query params render the dashboard without opening a modal. Re-test after each staging deploy; if modal routes remain inactive, escalate via `feedback/engineer.md` before the capture window.

## Modal Capture Playbook

### Sales Pulse Modal
- **Entry workflow:**
  1. Ensure staging feature flag `FEATURE_AGENT_ENGINEER_SALES_PULSE_MODAL=1` is enabled.
  2. From the Sales Pulse tile, activate the `View details` link button (`page.getByRole("button", { name: "View details" })`).
  3. Wait for the dialog with `aria-labelledby="sales-pulse-modal-title"` to appear (`page.getByRole("dialog", { name: "Sales Pulse — Details" })`).
- **Focus & content checkpoints:**
  - Default focus should land on the first actionable control inside the modal (`Action` select).
  - Tooltip capture: hover the revenue delta chip (`.occ-pill[data-testid="sales-delta-chip"]` once engineering exposes the data attribute) and record the percent delta text.
  - Record ARIA names for controls: close button `aria-label="Close sales pulse modal"`; primary CTA inherits the selected action label (default `Log follow-up`).
- **Playwright reference snippet:**
  ```ts
  await page.getByRole("button", { name: "View details" }).click();
  const modal = page.getByRole("dialog", { name: "Sales Pulse — Details" });
  await expect(modal).toBeVisible();
  await expect(modal.getByRole("heading", { name: "Top SKUs" })).toBeVisible();
  await modal.getByLabel("Notes").fill("Operator follow-up context");
  ```

### CX Escalations Modal
- **Entry workflow:**
  1. Enable `FEATURE_AGENT_ENGINEER_CX_ESCALATIONS_MODAL=1` in staging.
  2. From the CX Escalations tile list, choose the first breach row and press `Review` (`page.getByRole("button", { name: "Review" }).first()`).
  3. Validate dialog with accessible name `CX Escalation — <Customer Name>` using `page.getByRole("dialog", { name: /CX Escalation/i })`.
- **Focus & content checkpoints:**
  - Initial focus should be inside the conversation history region (`role="log"`, `aria-live="polite"`).
  - Confirm textarea for suggested reply exposes `aria-label="Reply text"` and the close affordance advertises `aria-label="Close escalation modal"`.
  - Capture button row states (`Approve & send`, `Escalate`, `Mark resolved`) plus secondary cancel path if surfaced.
- **Playwright reference snippet:**
  ```ts
  await page.getByRole("button", { name: "Review" }).first().click();
  const dialog = page.getByRole("dialog", { name: /CX Escalation/ });
  await expect(dialog.getByRole("log", { name: "Conversation history" })).toBeVisible();
  await dialog.getByLabel("Reply text").fill("Approved as drafted");
  await dialog.getByRole("button", { name: "Approve & send" }).click();
  ```

### Inventory Heatmap Modal (pending implementation)
- **Entry workflow (to be validated with engineering):**
  1. Confirm forthcoming feature flag `FEATURE_AGENT_ENGINEER_INVENTORY_HEATMAP_MODAL=1` or equivalent route toggle.
  2. Tile trigger should surface as `page.getByRole("button", { name: /View heatmap/i })` or `... { name: "Review inventory" }` per copy deck. Verify final label before scripting.
  3. Expected dialog name: `Inventory Alert — <SKU>` with `aria-labelledby="inventory-heatmap-modal-title"` (aligns with wireframe `Inventory Alert — Powder Board XL`).
- **Focus & content checkpoints:**
  - Initial focus should land on the Days of Cover summary block or first actionable button (design intent: `Confirm action`).
  - Tooltip capture target: Days of Cover info icon (engineering to expose `data-testid="inventory-days-of-cover-tooltip"`).
  - Action bar should include `Confirm action`, `Mark as intentional`, `Snooze alert`, with accessible labels matching copy deck casing.
- **Playwright reference stub:**
  ```ts
  await page.getByRole("button", { name: /View heatmap|Review inventory/i }).first().click();
  const heatmapModal = page.getByRole("dialog", { name: /Inventory Alert/ });
  await expect(heatmapModal.getByRole("heading", { name: "14-Day Velocity Analysis" })).toBeVisible();
  await heatmapModal.getByRole("button", { name: "Confirm action" }).focus();
  ```
- **Designer TODO:** finalize selector names with engineering once modal lands; update this section with concrete button labels/test IDs before capture day.

## Pre-built Annotation Templates
- Templates for outline boxes and numbered callouts live under `docs/design/assets/templates/`:
  - `modal-sales-pulse-overlay-template.svg`
  - `modal-cx-escalations-overlay-template.svg`
  - `modal-inventory-heatmap-overlay-template.svg`
- Each template uses a 1440×900 canvas with grouped layers (`g[data-layer="callouts"]`, `g[data-layer="focus-path"]`) so captured PNGs can be dropped under `g[data-layer="screenshot"]` in Figma or SVG editors.
- Usage:
  1. Duplicate the template file and place the raw staging screenshot inside the `screenshot` group.
  2. Adjust callout rectangles to match live layout; update numeric labels to align with enablement script ordering.
  3. Export as flattened SVG or PNG (<500 KB) and store within `artifacts/ops/dry_run_2025-10-16/` alongside evidence notes.
- Track edits in version control; if staging layout shifts, update the template coordinates first so downstream overlays stay consistent.

## Alt Text & Caption Template
- **Structure:** `Context — Key insight — Action expectation`. Example: `Inventory Heatmap modal highlighting Powder Board XL low stock; Days of Cover tooltip explains 2.5 day projection; primary action Confirm highlighted for approval logging.`
- Align with annotated callouts (1–5) so screen reader narratives match visual cues.
- Store final alt text in `docs/enablement/job_aids/annotations/2025-10-16_dry_run_callouts.md` under relevant bullet.

## Blockers & Escalation
- If staging host unavailable → escalate to reliability/deployment immediately; note downtime in `feedback/designer.md`.
- If Figma access still blocked → continue using SVG overlays; log status in `feedback/designer.md` and request manager escalation.
- If Supabase sync unresolved → capture fallback logs/screenshots with `mock=1` flag and tag QA for evidence acceptance.

## Deliverables Checklist
- [ ] Dashboard overview screenshot exported and logged.
- [ ] CX Escalations modal overlay exported, alt text drafted.
- [ ] Sales Pulse modal overlay exported, alt text drafted.
- [ ] Inventory Heatmap modal overlay exported, alt text drafted.
- [ ] Error/empty state captures exported (Sales Pulse + CX Escalations + Inventory Heatmap).
- [ ] Evidence links posted to `feedback/designer.md` and `feedback/manager.md`.
- [ ] Enablement/support notified with ready-to-use assets.
