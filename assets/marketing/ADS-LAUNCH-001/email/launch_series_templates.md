# Launch Email Series Templates

**Campaign:** ADS-LAUNCH-001  
**Platform:** Klaviyo (HTML modules)  
**Owner:** Ads Agent  
**Status:** Draft ready for CEO approval

---

## Email 1 — Launch Announcement (Day 0)

- **Subject Line Options**
  1. "HotDash is live: Your Shopify control center"
  2. "Launch day: Automate inventory, CX, and growth with AI you control"

- **Preview Text**
  - "14-day free trial. Human-reviewed AI built for Shopify operators."

- **Body Outline**
```
Hero: HotDash dashboard animation (animated GIF, loop ≤3s)
H1: Run Shopify operations with confidence
Paragraph: HotDash unifies inventory alerts, CX approvals, and growth playbooks in one control center.
CTA Button (primary): Start Free Trial
Secondary CTA: Book a 15-minute launch walkthrough
Feature Highlights Grid (3 columns)
 - Predictive inventory: Forecast stockouts and trigger POs.
 - CX approvals: Drafts are graded before they go live.
 - Launch campaigns: Plan Google & social ads with ROI tracking.
Testimonial Block: "We reduced manual ops work by 40% in two weeks." — Beta Partner
Footer: HotDash address, manage preferences links, social icons
```

- **Dynamic Content Blocks**
  - If subscriber is an existing beta customer → swap testimonial for “Thank you” upgrade offer.
  - If region = EU → include GDPR compliance blurb and contact info.

---

## Email 2 — Feature Spotlight: Inventory (Day 2)

- **Subject Options**
  1. "Never miss another stockout"
  2. "Inventory alerts with approval workflows"

- **Key Talking Points**
  - Safety stock suggestions with human override.
  - Purchase order CSV export & email workflow.
  - Integration with Shopify product tags (`BUNDLE:TRUE`, `PACK:X`).

- **CTA**
  - `Explore Inventory Module`

---

## Email 3 — Feature Spotlight: CX (Day 5)

- **Subject Options**
  1. "AI drafts, you approve — faster CX"
  2. "Keep every reply on brand during launch week"

- **Hook**
  - CX Queue dashboard with tone/policy scores.
  - Private note preview with inline grading slider.

- **CTA**
  - `Review CX Workflow`

---

## Email 4 — Feature Spotlight: Growth (Day 8)

- **Subject Options**
  1. "Launch campaigns without the scramble"
  2. "Centralize ads, content, and analytics"

- **Highlights**
  - Campaign planner referencing Google + social briefs.
  - Analytics dashboard integration + ROI tracking triggers.
  - Mention `/admin/marketing/approvals` for CEO sign-off.

- **CTA**
  - `Plan Campaigns`

---

## Email 5 — Security & Governance (Day 12)

- **Subject Options**
  1. "Human-in-the-loop by design"
  2. "Launch safely with audit trails"

- **Talk Track**
  - All changes logged with evidence.
  - CEO approval flows and rollback plans.
  - MCP-first development guardrails.

- **CTA**
  - `See Governance Controls`

---

## Drip Automation Snippets (Trials)

| Trigger Event              | Email Fragment                                                                 | CTA                    |
| -------------------------- | ------------------------------------------------------------------------------ | ---------------------- |
| `trial_created` (Hour 0)   | Welcome message + product tour links                                           | Complete Setup         |
| `inventory_alert_configured` | Congratulate user + share best practices                                    | View Inventory Tips    |
| `approval_submitted`       | Celebrate milestone + link to analytics dashboard                              | Open Launch Dashboard  |
| `trial_day_10`             | Offer strategy session + limited launch incentive                              | Schedule Strategy Call |
| `trial_day_13`             | Trial ending reminder + plan comparison chart                                  | Upgrade Plan           |

---

## QA Checklist

- Test across top clients (Gmail, Outlook, Apple Mail) and mobile.
- Validate merge tags: `{{ first_name }}`, `{{ company }}`, `{{ unsubscribe_link }}`.
- Ensure images have descriptive alt text.
- Run through Klaviyo Campaign QA (spam score <5, link validation, dark mode preview).

---

**Next Step:** Load templates into Klaviyo staging, generate test sends, attach Litmus screenshots to approval request.
