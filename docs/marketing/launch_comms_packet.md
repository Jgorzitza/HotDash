---
epoch: 2025.10.E1
doc: docs/marketing/launch_comms_packet.md
owner: marketing
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-18
---
# Launch Communications Packet — Operator Control Center

## Approval & Evidence Tracker
| Surface | Owner | Status (2025-10-10) | Evidence / Placeholder |
|---------|-------|----------------------|------------------------|
| In-app banner | Marketing | Copy updated with OpenAI/LlamaIndex + Inbox messaging — **hold pending QA evidence** | `docs/marketing/product_approval_packet_2025-10-07.md#banner` |
| Launch email | Marketing | Copy updated with OpenAI/LlamaIndex + Inbox messaging — **hold pending QA evidence** | `docs/marketing/product_approval_packet_2025-10-07.md#email` |
| Blog post | Marketing | Draft updated with OpenAI/LlamaIndex + Inbox messaging — **hold pending QA evidence** | `docs/marketing/product_approval_packet_2025-10-07.md#blog-post` |
| Tooltip overlays & modal visuals | Design | ⚠️ Admin embed overlays pending Shopify token; React Router spec refreshed 2025-10-10 | Spec: `docs/design/tooltip_modal_annotations_2025-10-09.md`, handoff: `artifacts/engineering/modal-react-router-handoff_2025-10-10.md`, offline mocks: `artifacts/design/offline-cx-sales-package-2025-10-11/`, placeholder → upload Admin overlays to `artifacts/design/tooltip-overlays/2025-10-10/` once token lands |
| Telemetry & readiness evidence | Marketing + Reliability | ✅ Supabase parity + staging smoke (`?mock=1`) captured; Shopify staging secrets validated | `artifacts/monitoring/supabase-parity_2025-10-10T01-25-10Z.json`, `artifacts/monitoring/supabase-sync-summary-latest.json`, `artifacts/monitoring/synthetic-check-2025-10-10T02-31-11.417Z.json`, `feedback/reliability.md` (2025-10-10 01:14 UTC) |
| Staging smoke (`?mock=0`) | Reliability | ⏳ Pending QA sign-off; capture immediately once HTTP 200 sustained | Placeholder → `artifacts/monitoring/synthetic-check-<timestamp>-mock0.json` + `artifacts/integrations/shopify/2025-10-10/curl_mock0_<timestamp>.log` |
| Staging access rollout comms | Marketing + Support | Ready pending live smoke; announcement + acknowledgement tracker staged | `docs/enablement/dry_run_training_materials.md#draft-announcement-copy-hold-until-mock0-200`, `docs/enablement/dry_run_training_materials.md#acknowledgement-log-template` |
| Supabase NDJSON export | Reliability + Data | ✅ Delivered 2025-10-10 07:29 UTC; bundle ready for comms packet | `artifacts/logs/supabase_decision_export_2025-10-10T07-29-39Z.ndjson` |
| Staging readiness broadcast (internal ops) | Support ↔ Marketing | Templates staged — awaiting `DEPLOY-147` evidence drop | §2B, `artifacts/ops/dry_run_2025-10-16/` (placeholder files noted) |
| Security incident response | Deployment + Reliability | ✅ Clearance received 2025-10-10 16:00 UTC — existing secrets validated; external messaging stays *on hold* until QA + embed token greenlights | `feedback/manager.md` (2025-10-10 16:00Z), `feedback/reliability.md` (2025-10-10 15:55Z), `feedback/marketing.md` (security status log) |

**Security incident status:** Git history scrub completed (`af1d9f1` pushed 2025-10-10 08:12 UTC). Product + reliability validated existing Supabase credentials at 2025-10-10 16:00 UTC, so no rotation required. Clearance evidence remains archived for audit even as external sends stay on hold pending QA.
**QA gate:** `https://hotdash-staging.fly.dev/app?mock=0` remains HTTP 410 as of 2025-10-10 07:57 UTC. Hold all external sends until QA posts sustained 200 + sub-300 ms synthetic evidence (DEPLOY-147). Admin tour validation uses the Shopify CLI 3 dev flow (no embed/session token).
**Support inbox & Chatwoot Fly note:** The primary escalation channel is customer.support@hotrodan.com, which routes to Chatwoot hosted on Fly.io. All operator-facing copy should reference this inbox and avoid legacy addresses.
**English-only scope:** Launch surfaces ship in English. French strings stay in this packet for localization QA only (see `docs/marketing/translation_review_request_2025-10-07.md`).
**Readiness evidence:** Reference Supabase parity (01:25Z) + retry snapshot (`artifacts/monitoring/supabase-parity_2025-10-10T01-25-10Z.json`, `artifacts/monitoring/supabase-sync-summary-latest.json`), Fly staging smoke (`artifacts/monitoring/synthetic-check-2025-10-10T02-31-11.417Z.json`), and Shopify staging validation (`feedback/reliability.md`, 2025-10-10 01:14 UTC) when answering telemetry questions.

**Go-live trigger checklist (fill as QA signs off):**
- Replace tooltip overlay placeholder with annotated screenshots from design handoff.
- Attach the first sustained HTTP 200 artifact for `https://hotdash-staging.fly.dev/app?mock=0` (curl log + synthetic JSON); latest probe at 2025-10-10 07:57 UTC still 410 (`artifacts/integrations/shopify/2025-10-10/curl_mock0_2025-10-10T07-57-48Z.log`).
- Confirm Supabase NDJSON bundle (`artifacts/logs/supabase_decision_export_2025-10-10T07-29-39Z.ndjson`) remains current; replace if reliability drops a newer export.
- Verify Shopify Admin tour validated using Shopify CLI 3 dev flow and documented by Reliability (link evidence path) before unpausing releases.

## Assets (Staged for GA)

- Email: artifacts/marketing/assets/email/launch_email_v1.md
- Email variants (A/B): artifacts/marketing/assets/email/launch_email_variants.md
- Blog: artifacts/marketing/assets/blog/ga_launch_post_v1.md
- Social (X): artifacts/marketing/assets/social/x_thread_v1.md
- Social (LinkedIn): artifacts/marketing/assets/social/linkedin_post_v1.md
- Social (alternates): artifacts/marketing/assets/social/alt_variants_v1.md
- Press note: artifacts/marketing/assets/press/press_note_v1.md
- Approvals folder: artifacts/marketing/assets/approvals/
- Release-day graphics: artifacts/marketing/assets/graphics/
- Release-day snippets: artifacts/marketing/assets/snippets/

## Testimonials

- Curated testimonials (placeholders): docs/marketing/testimonials_curated.md

## Release Day Operations

- Release day playbook: artifacts/marketing/assets/release_day_playbook.md
- Manual send playbook: artifacts/marketing/assets/social/send_playbook.md

## Release Cadence Alignment

Per `docs/directions/product_operating_plan.md`, releases follow **Mock → Staging → Production** with communications tied to each milestone.

---

## 1. Mock Review Communications (Internal)

### Audience
Design, engineering, QA, product teams

### Channel
# (#occ-launch) + email to stakeholders

### Timing
48h before staging deployment

### Message Template

**Subject:** [Mock Review Ready] Operator Control Center — Dashboard + Tiles

**Body:**
```
Team,

Mock review artifacts are ready for the Operator Control Center dashboard.

📦 Evidence Bundle:
- Wireframes: docs/design/wireframes/dashboard_wireframes.md
- Vitest results: [CI link]
- Playwright results: [CI link]
- Lighthouse snapshot: [CI link]
- Design tokens: app/styles/tokens.css

🎯 Scope:
- Sales Pulse tile
- CX Escalations tile
- Inventory Heatmap tile
- Fulfillment Health tile
- SEO & Content Watch tile

⚠️ Open Risks:
- GA MCP host pending (mock mode active; hold external copy until gates in `docs/marketing/phase2_ga_mcp_messaging.md` clear)
- [List any other blockers from feedback/manager.md]

📅 Next: Staging review scheduled for [DATE]

Review docs in docs/design/ and flag any concerns in #occ-launch by EOD.

— Product Team
```

---

## 2. Staging Review Communications (Beta Partners)

### Audience
Select operator partners (Riley Chen, Morgan Patel from Evergreen Outfitters per `docs/directions/product_operating_plan.md`)

### Channel
Email with calendar invite + dashboard walkthrough link

### Timing
1 week before production launch

### Email Template

**Subject:** [Early Access] Operator Control Center — Your feedback shapes our roadmap

**Body:**
```
Hi Riley and Morgan,

We're excited to invite you to preview the **Operator Control Center** before it goes live to all merchants.

This is your daily operations command center, embedded right in Shopify Admin. It surfaces the truth across CX, sales, inventory, and SEO—with one-tap actions to resolve issues before they escalate.

🎯 What You'll See:
✓ CX Escalations — Spot SLA breaches, approve AI-suggested replies
✓ Sales Pulse — Track today's orders vs. 7-day avg, flag fulfillment blockers
✓ Inventory Heatmap — Low-stock alerts with AI reorder recommendations
✓ SEO & Content Watch — Catch pages losing >20% traffic WoW

📅 Guided Walkthrough:
[Tuesday, Oct 14 @ 10:00 AM ET — Calendar Invite]

We'll demo the dashboard, walk through approval workflows, and capture your feedback to refine the experience before general availability.

🔗 Early Access Link:
https://hotdash-staging.fly.dev/app?mock=1 (credentials tracked in `vault/occ/shopify/app_url_staging.env`; share via enablement once invites send)

Your input directly shapes our roadmap. Looking forward to hearing what works—and what doesn't. We'll recap Supabase parity + staging smoke evidence at the walkthrough so you have telemetry context alongside UI feedback.

— [Product Lead Name]
```

---

## 2B. Staging Readiness Broadcast (Internal Operators)

**Trigger:** DEPLOY-147 credential bundle delivered and `https://hotdash-staging.fly.dev/app?mock=0` returning HTTP 200 with fresh evidence archived under `artifacts/ops/dry_run_2025-10-16/`.

### Audience
Support reps, CX leads, enablement facilitators preparing for the 16 Oct dry run

### Channels
- #: `#occ-ops`
- Email: `occ-operators@hotdash.internal`

### # Template (Support Lead)
```
:rocket: OCC staging is live — time to rehearse.

✅ DEPLOY-147 credentials are in the local vault (`vault/occ/shopify/` bundle).
✅ Reliability posted green smoke for https://hotdash-staging.fly.dev/app?mock=0 (see artifacts/ops/dry_run_2025-10-16/mock0-smoke.png).
✅ QA uploaded walkthrough screenshots + modal evidence to artifacts/ops/dry_run_2025-10-16/screenshots/.

Next steps:
- Install the staging app (Shopify Admin → Apps → HotDash) before the 16 Oct dry run.
- Walk the CX Escalations + Sales Pulse flows, logging gaps in feedback/support.md.
- Review the rate-limit recovery playbook: docs/runbooks/shopify_rate_limit_recovery.md.

Calendar invite + facilitator packet are landing separately today. RSVP so we can lock scribe/backup coverage.

Questions → thread here or DM @support-lead.
```

### Email Template (Support & Enablement)
```
Subject: OCC staging ready — rehearse ahead of 16 Oct dry run

Hi team,

Staging access for the Operator Control Center is unlocked. Please complete the following today:

1. Accept the DEPLOY-147 Shopify store invite (credentials bundle in `vault/occ/shopify/`).
2. Launch https://hotdash-staging.fly.dev/app?mock=0 and confirm tiles load with live data.
3. Capture findings in feedback/support.md with request IDs + screenshots; escalate blocking issues in #occ-ops.
4. Review the facilitator packet + agenda: docs/enablement/dry_run_training_materials.md and docs/runbooks/operator_training_agenda.md.

Evidence bundle (smoke headers, screenshots, decision IDs) lives in artifacts/ops/dry_run_2025-10-16/.

Reply-all to confirm once you’ve validated access. Ping @support-lead or @enablement-lead if anything blocks you.

— Support & Enablement
```

### Attachments / Links
- `artifacts/ops/dry_run_2025-10-16/mock0-smoke.png`
- `artifacts/ops/dry_run_2025-10-16/screenshots/`
- `docs/runbooks/shopify_rate_limit_recovery.md`

---

## 3. Production Launch Communications (General Availability)

### A. In-App Banner

**Placement:** Top of Shopify Admin app home (app._index.tsx)

**Timing:** Day of production launch

**Design:** Polaris Banner component (tone: success, dismissible)

**Copy (EN):**
```
🎉 Operator Inbox now runs on Chatwoot Fly + OpenAI insights. [View Dashboard →]
```

**Copy (FR):**
```
🎉 Boîte opérateur sur Chatwoot Fly + IA OpenAI. [Voir le tableau de bord →]
```

**Character Counts:** EN 79 (<=80 limit), FR 75 (<=80 limit)

**CTA Action:** Navigate to `/app/dashboard` route

---

### B. Launch Email

**Audience:** All merchants with app installed

**Subject (EN):** Your operations command center + Operator Inbox are live in Shopify Admin

**Subject (FR):** Votre centre de commande + boîte opérateur sont en ligne dans l'administration Shopify

**Subject Lengths:** EN 75 (flagged for localization review - exceeds 60 target), FR 85 (flagged for localization review - exceeds 60 target)

**Body (EN):**
```
Hi [Merchant Name],

We built something for you—and wired it for faster collaboration.

The **Operator Control Center** is now live in your Shopify Admin. It's a single dashboard that surfaces the truth across your busiest workflows—CX escalations, the new shared Operator Inbox, sales pulse, inventory gaps, and SEO declines—so you can act fast without the tab fatigue.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ CX Escalations  
Spot SLA breaches and approve AI-suggested replies in one tap (OpenAI via our LlamaIndex middleware). Everything routes through the Operator Inbox so nothing slips.

✓ Operator Inbox  
Centralize approvals, escalations, and AI drafts in one queue. Assign teammates, add notes, and clear conversations without leaving Shopify Admin.

✓ Sales Pulse  
Track today's orders vs. 7-day avg + flag fulfillment blockers before they snowball.

✓ Inventory Heatmap  
See low-stock alerts with AI-powered reorder recommendations built on our LlamaIndex dataset.

✓ SEO & Content Watch  
Catch pages losing >20% traffic WoW and assign fixes in seconds.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 How to activate:
1. Open your Shopify Admin
2. Navigate to Apps → [Your App Name]
3. Click "Operator Control Center" in the nav (look for the Operator Inbox badge)

Every action you take is logged in the decision audit trail—so your team always has context.

Privacy note: Operator access stays inside Shopify Admin. We log limited operator telemetry (email, tile interactions, request IDs) in Supabase for up to 180 days so you have an auditable trail. AI suggestions route through our LlamaIndex middleware before reaching OpenAI, and we automatically strip payment details and PII. Manage these settings anytime in Settings → Privacy and review our [Privacy Notice].

Need help? Reach us at customer.support@hotrodan.com — your messages now route through our Chatwoot cluster on Fly, so escalations land in the Operator Inbox with lower latency.

Questions? Check our [launch FAQ] or reply to this email. Cite telemetry readiness (Supabase parity + staging smoke) when addressing reliability asks.

— [Your Team Name]
```

**Body (FR):**
```
Bonjour [Nom du commerçant],

Nous avons construit quelque chose pour vous — et l'avons câblé pour collaborer plus vite.

Le **Centre de contrôle opérateur** est désormais actif dans votre administration Shopify. C'est un tableau de bord unique qui révèle la réalité de vos flux de travail les plus chargés—escalades CX, nouvelle boîte de réception opérateur partagée, pouls des ventes, lacunes d'inventaire et baisses SEO—pour que vous puissiez agir rapidement sans la fatigue des onglets.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Escalades CX  
Repérez les dépassements de SLA et approuvez les réponses suggérées par l'IA (OpenAI via notre service LlamaIndex) en un clic. Tout transite par la boîte opérateur pour rester suivi.

✓ Boîte de réception opérateur  
Visualisez toutes les approbations, escalades et suivis dans un seul espace. Assignez des coéquipiers, ajoutez des notes et validez les brouillons IA sans quitter l'administration Shopify.

✓ Pouls des ventes  
Suivez les commandes d'aujourd'hui par rapport à la moyenne sur 7 jours + signalez les bloqueurs d'exécution avant qu'ils n'escaladent.

✓ Carte thermique d'inventaire  
Voyez les alertes de stock faible avec des recommandations de réapprovisionnement alimentées par notre pipeline LlamaIndex.

✓ Veille SEO et contenu  
Détectez les pages perdant >20 % de trafic SàS et assignez des corrections en un clic.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 Comment activer :
1. Ouvrez votre administration Shopify
2. Accédez à Applications → [Nom de votre application]
3. Cliquez sur "Centre de contrôle opérateur" dans la navigation (repérez le badge de la boîte opérateur)

Chaque action que vous entreprenez est enregistrée dans le journal d'audit des décisions—pour que votre équipe ait toujours le contexte.

Note de confidentialité : L'accès reste dans votre administration Shopify. Nous enregistrons un nombre limité de données opérateur (courriel, interactions avec les tuiles, identifiants de requête) dans Supabase pendant 180 jours afin de maintenir un journal d'audit exploitable. Les suggestions IA transitent par notre middleware LlamaIndex avant d'atteindre OpenAI et nous supprimons automatiquement les données de paiement et les PII. Gérez ces paramètres à tout moment dans Paramètres → Confidentialité et consultez notre [Avis de confidentialité].

Besoin d'aide ? Écrivez-nous à customer.support@hotrodan.com — vos messages passent désormais par notre cluster Chatwoot sur Fly, garantissant une arrivée plus rapide dans la boîte opérateur.

Des questions ? Consultez notre [FAQ de lancement] ou répondez à cet e-mail.

— [Nom de votre équipe]
```

---

### C. Blog Post (SEO + Partner Portal)

**Publication:** Company blog + Shopify Partner portal

**Timing:** Same day as production launch

**Hero subhead (EN):** Know what changed overnight and act before issues escalate.

**Hero subhead (FR):** Sachez ce qui a changé du jour au lendemain et agissez avant que les problèmes n'escaladent.

**Hero Subhead Lengths:** EN 59 (<=90 target), FR 92 (needs localization trim to meet <=90 target)

**SEO Metadata:**

- **Title (EN):** Introducing the Operator Control Center: Your Daily Operations Dashboard for Shopify
- **Title (FR):** Présentation du Centre de contrôle opérateur : Votre tableau de bord opérationnel quotidien pour Shopify
- **Meta Description (EN):** Monitor CX escalations, sales trends, inventory gaps & SEO declines from one Shopify dashboard. The Operator Control Center turns data into action.
- **Meta Description (FR):** Surveillez les escalades CX, tendances des ventes, lacunes d'inventaire et baisses SEO depuis un seul tableau de bord Shopify. Le Centre de contrôle opérateur transforme les données en action.
- **Keywords:** Shopify operations, CX dashboard, inventory management, sales analytics, SEO monitoring, operator tools

**Post Structure:**

```markdown
# Introducing the Operator Control Center: Your Daily Operations Dashboard for Shopify

Running a Shopify store means juggling CX, fulfillment, inventory, and marketing—often across 10+ browser tabs and disconnected inboxes. Today, we're launching the **Operator Control Center**, a single dashboard that surfaces the daily truth across your most critical workflows.

From SLA-breaching customer conversations to low-stock SKUs, every tile gives you context, recommended actions, and one-tap approvals. The new Operator Inbox keeps approvals and escalations in one place, while our LlamaIndex middleware feeds OpenAI-powered copy that stays audit-ready.

## Why We Built This

We talked to 20+ store operators over the past month. The same pain points came up again and again:

- **Tab fatigue:** Switching between Shopify Admin, Chatwoot, Google Analytics, and spreadsheets
- **Delayed escalations:** CX conversations breaching SLA before anyone notices
- **Stockout surprises:** Bestsellers going out of stock without warning
- **Traffic blindspots:** SEO declines discovered days (or weeks) too late
- **Fragmented approvals:** AI drafts, escalations, and follow-ups scattered across email, docs, and chat threads

The Operator Control Center solves these by consolidating your daily truth into one embedded dashboard.

## What's Inside

### CX Escalations
Surface open conversations breaching SLA thresholds. View full context, approve AI-suggested replies (OpenAI powered via our LlamaIndex middleware), or escalate to a manager—all in one tap.

**Operator benefit:** Stop tab-switching. Resolve escalations in seconds, not minutes. Every approval syncs to the Operator Inbox for follow-up.

### Operator Inbox
Keep approvals, escalations, and AI drafts in one shared queue. Assign owners, add notes, and move work forward without leaving Shopify Admin.

**Operator benefit:** Nothing slips through email cracks. Everyone sees the same queue, linked back to tile telemetry. Chatwoot now runs on Fly, so inbox updates reach operators with lower latency and better failover.

### Sales Pulse
Track today's order count vs. 7-day average, top SKUs, and fulfillment blockers—all at a glance.

**Operator benefit:** Know your sales health in 3 seconds. Spot anomalies without running reports.

### Inventory Heatmap
Identify low-stock SKUs, days of cover, and AI-recommended reorder quantities based on 14-day velocity with insights assembled through LlamaIndex.

**Operator benefit:** Prevent stockouts with proactive alerts. Create draft purchase orders with one approval tap.

### SEO & Content Watch
Detect landing pages with >20% session drop week-over-week. Assign content refresh tasks to your team.

**Operator benefit:** Catch traffic declines before they hurt conversions. Track follow-up tasks straight from the Operator Inbox.

## Privacy & Security

Operator Control Center lives inside Shopify Admin, so your existing permissions decide who can view or take action on tiles. We log limited operator telemetry (email, tile interactions, request IDs) in Supabase for up to 180 days to power the decision audit trail and reliability monitoring. AI copy runs through our LlamaIndex middleware before reaching OpenAI, and we automatically remove payment details and other PII. You can disable analytics at any time in Settings → Privacy, and our [Privacy Notice] details how data is handled across integrations.

Need a hand during rollout? Email `customer.support@hotrodan.com`. Our Chatwoot Fly deployment routes requests straight into the Operator Inbox so specialists can respond with the same telemetry you see in OCC.

## How It Works

Every tile follows the same pattern:

1. **Surface the truth** — Real-time data from Shopify, Chatwoot, Google Analytics
2. **Recommend action** — AI-powered suggestions based on context
3. **Approve workflow** — One-tap approvals with decision audit trail

No vanity metrics. Every tile owns a workflow that ends in a decision or logged follow-up.

## Getting Started

### Activation Steps

1. Open your Shopify Admin
2. Navigate to Apps → [Your App Name]
3. Click "Operator Control Center" in the nav
4. Configure integrations (Shopify is pre-connected; add Chatwoot + Google Analytics for full coverage)

### Integration Setup

- **Shopify:** Pre-configured (uses your existing admin credentials)
- **Chatwoot:** Add API token in Settings → Integrations
- **Google Analytics:** Connect via OAuth (read-only access)

All credentials are stored securely per Shopify's app standards.

### GA MCP Phase-2 Messaging (Hold)

- Do not publish GA MCP availability until OCC-INF-221 delivers host + credentials and parity checklist items 1-8 pass.
- Reference `docs/marketing/phase2_ga_mcp_messaging.md` for positioning pillars, evidence requirements, and asset updates.
- Prep internal notes so once credentials land we can add landing-page insights copy to the launch email/blog without rework.

## What's Next

This is v1. We're already working on:

- **Social Sentiment (Phase 2):** Track campaign health across X/Meta
- **GA MCP Integration (Phase 2):** Bring landing page + acquisition telemetry into OCC once credentials + parity checks clear (`docs/marketing/phase2_ga_mcp_messaging.md`)
- **Advanced Automations:** Auto-approve low-risk actions based on your rules
- **Custom Tiles:** Build your own tiles with our SDK

Have feedback? We'd love to hear it. Reply to this post or email us at customer.support@hotrodan.com (now routed through Chatwoot on Fly).

## Try It Today

Install [App Name] and activate the Operator Control Center → [App Install Link]

Built for operators, by operators. Welcome to your new command center.
```

---

## 4. In-Admin Tooltip Copy

### Tile Tooltips (First-Time User Experience)

**Trigger:** Show on first dashboard visit (dismissible, stored in user prefs)

**Placement:** Tooltip overlay on each tile using Polaris Tooltip component

#### Sales Pulse Tile
**EN:** Track today's orders vs. 7-day avg. Click to see fulfillment blockers.
**FR:** Suivez les commandes d'aujourd'hui par rapport à la moyenne sur 7 jours. Cliquez pour voir les bloqueurs d'exécution.

#### CX Escalations Tile
**EN:** Open conversations breaching SLA. One tap to approve AI replies.
**FR:** Conversations ouvertes dépassant le SLA. Un clic pour approuver les réponses IA.

#### Inventory Heatmap Tile
**EN:** See low-stock SKUs and reorder before stockouts cost you.
**FR:** Voyez les SKU en stock faible et réapprovisionnez avant les ruptures coûteuses.

#### SEO & Content Watch Tile
**EN:** Pages losing >20% traffic WoW. Assign content fixes to your team.
**FR:** Pages perdant >20 % de trafic SàS. Assignez des corrections de contenu à votre équipe.

### Approval Modal Tooltips

**Placement:** Info icon next to "Approve & Send" buttons in modals

**Copy (EN):** This action will be logged in your decision audit trail.
**Copy (FR):** Cette action sera enregistrée dans votre journal d'audit des décisions.

---

## Supporting Materials

### Clearance Communications (prep — send only after QA `mock=0` + embed token greenlights)
- **Internal # (#occ-launch) — Clearance Broadcast**
  ```
  Heads-up: Security review is complete. Git scrub (`af1d9f1`) remains live and reliability validated the existing Supabase credentials at 16:00 UTC—no rotation needed. External messaging stays on hold until QA posts the sustained mock=0 200 (<300 ms) and reliability ships the Chatwoot Fly embed token. Keep campaign assets staged, track updates in the calendar, and reply with ✅ once your team has pulled latest to the sanitized head.
  ```
- **Merchant Email (GA) — Launch Announcement opener**
  ```
  Subject: Operator Control Center is ready for you

  We’ve completed today’s security review and finished final QA on Operator Control Center. Your dashboard ships with refreshed telemetry, approval trails, and safeguards. Activate it today to keep fulfillment, support, and marketing decisions in one shared workspace.

  → Explore Operator Control Center

  Need help? Reach us at customer.support@hotrodan.com—responses now route through our Chatwoot cluster on Fly, so escalations land in the Operator Inbox with lower latency. We’ll send the full email once QA + embed token gates clear.
  ```
- **Social Post (LinkedIn/Twitter) — Go-Live Teaser**
  ```
  Operator Control Center is cleared for takeoff once QA posts the sustained mock=0 200 and the Chatwoot Fly embed token lands. Prep copy: “Operator Control Center now unifies support, sales, and ops—from the new Operator Inbox to faster Chatwoot Fly escalations. Dive in: <launch URL>” (hold until gates clear).
  ```
- **Support Enablement Ping — Training Timeline**
  ```
  Security review complete at 16:00 UTC. Training invite deck + FAQ reflect the new support inbox (customer.support@hotrodan.com) and Chatwoot Fly cut-over plan. Dry run stays on 2025-10-16—distribute externally only after QA mock=0 200 + embed token confirmation.
  ```

### FAQ Document
Location: `docs/marketing/launch_faq.md` (to be created)

Key questions to address:
- What integrations are required?
- How is my data secured?
- What does "AI-suggested reply" mean?
- Can I customize tile thresholds (e.g., SLA breach time)?
- How do I access the decision audit trail?

### Hold-Ready Variants & Testimonial Inserts (prep only)
- **Launch Email — Variant B (post-hold option)**
  ```
  Subject: Your shared Operator Inbox goes live with OCC

  Hi [Merchant Name],

  The **Operator Control Center** keeps every escalation and approval in one shared inbox so your team never loses track of next steps.

  The Operator Inbox brings every approval, AI draft, and follow-up into one queue. Powered by our Chatwoot cluster on Fly, responses land in seconds—even during peak surges. Every decision still records in the audit trail so you can see who approved what and when.

  Ready to move fast? Switch to this variant the moment QA + embed token gates clear—no CTA change required.

  → Explore Operator Control Center

  P.S. Need help? Reach us at customer.support@hotrodan.com (also routed through Chatwoot on Fly for quicker replies).
  ```
- **Social Caption — Variant B**
  ```
  Operator Control Center unifies your support inbox (now on Chatwoot Fly) with real-time sales + ops telemetry. Hold caption until QA + embed token gates clear: “One shared inbox. AI you approve. Operations on autopilot. OCC keeps every escalation flowing—fast.” Link: <launch URL>
  ```
- **Blog Hero — Variant Sidebar**
  ```
  ### Why the Operator Inbox Matters
  Your support inbox now runs on Chatwoot Fly, so Operator Control Center can surface AI suggestions and approvals in real time. Teams see escalations, follow-ups, and metrics in one shared view—no more chasing emails or losing context across tools.
  ```
- **Testimonial placeholders (insert once recorded)**
  - Evergreen Outfitters — CX Lead quote on Operator Inbox responsiveness (target length 200 characters). Placeholder: “[TBD quote — capture during dry run debrief]”.
  - Morgan Patel (Support) — Internal testimonial for enablement materials on Chatwoot Fly latency improvement. Placeholder stored at `docs/marketing/testimonial_placeholders.md`.
  - Riley Chen — Beta partner quote for blog sidebar; collect after staging walkthrough. Placeholder currently notes question set in `docs/marketing/privacy_toggle_rollout.md`.
- **Variant asset tracking**
  - Maintain alternate banner headline ≤80 characters: “🎉 OCC now routes every escalation through your shared inbox.”
  - Keep localized variant stub in `docs/marketing/product_approval_packet_2025-10-07.md` for quick swap once testimonials approved.

### Screenshot Assets
Location: TBD (coordinate with designer)

Required screenshots:
- Dashboard overview (all 5 tiles visible)
- CX Escalations tile expanded view
- Inventory Heatmap with reorder modal
- Decision audit trail view
- Mock mode vs. live mode comparison

---

## Compliance & Legal Review

### Required Approvals
- [ ] Legal: AI-generated reply disclaimers reviewed
- [ ] Legal: GDPR/CCPA compliance for decision logging confirmed
- [ ] Partner Portal: Blog post submitted 5 business days before launch
- [ ] Support: FAQ + training materials delivered 48h before launch

### Brand Consistency
- All copy follows "professional but approachable" tone from `docs/design/copy_deck.md`
- French translations use formal "vous" form
- No jargon unless operator-familiar (SLA, SKU, WoW acceptable)

---

## Distribution Channels

| Channel | Audience | Timing | Owner |
|---------|----------|--------|-------|
| # (#occ-launch) | Internal team | Mock review ready | Product |
| Email (beta partners) | Riley Chen, Morgan Patel | 1 week before prod | Product |
| In-app banner | All merchants | Production launch day | Engineering |
| Launch email | All merchants | Production launch day | Marketing |
| Blog post | Public + Partner Portal | Production launch day | Marketing |
| Social (Twitter/LinkedIn) | Public | Production launch day | Marketing |

---

## Metrics & Success Tracking

Per `docs/directions/marketing.md`, track:

| Metric | Target (30 days) | Source |
|--------|------------------|--------|
| Email open rate | >35% | Email platform |
| In-app banner CTR | >15% | Dashboard telemetry |
| Blog post traffic | >1000 visits | Google Analytics |
| Beta partner feedback quality | 5+ actionable insights | Memory (scope `ops`) |
| Operator activation rate | >70% | `dashboard.session.opened` fact |

---

## Readiness Evidence — 2025-10-10

- Git scrub completed with sanitized history (`af1d9f1`, 2025-10-10 08:12 UTC); all teams instructed to reset to the new head prior to launch sequencing (`feedback/manager.md`, `feedback/marketing.md`).
- Supabase telemetry snapshot (analyzer output) stored at `artifacts/monitoring/supabase-sync-summary-latest.json`; mirrors the latest retry/latency profile from `artifacts/logs/supabase_decision_export_2025-10-10T07-29-39Z.ndjson` for post-launch KPI narratives.
- Staging Supabase credentials (service key + Postgres DSN) now vaulted at `vault/occ/supabase/service_key_staging.env` and `vault/occ/supabase/database_url_staging.env`, with GitHub `staging` environment sync logged in `feedback/reliability.md`.
- Shopify staging bundle (`SHOPIFY_API_KEY_STAGING`, `SHOPIFY_API_SECRET_STAGING`, `SHOPIFY_CLI_AUTH_TOKEN_STAGING`, `STAGING_APP_URL`, `STAGING_SHOP_DOMAIN`) synced via `scripts/deploy/sync-supabase-secret.sh`; evidence referenced in `feedback/reliability.md` and required for enablement dry run/tooltips QA.
- Live staging smoke (`https://hotdash-staging.fly.dev/app?mock=0`) still returns HTTP 410; latest probe logged at `artifacts/integrations/shopify/2025-10-10/curl_mock0_2025-10-10T072315Z.log`. Marketing/support announcement templates remain queued to send once QA confirms a 200 response.
- Reliability confirmed existing Supabase credentials remain valid at 2025-10-10 16:00 UTC; no rotation required. Clearance evidence archived in `feedback/reliability.md` and `feedback/manager.md`.

---

## Evidence Links

- Copy deck: docs/design/copy_deck.md
- Product operating plan: docs/directions/product_operating_plan.md
- Initial delivery plan: docs/strategy/initial_delivery_plan.md
- North Star: docs/NORTH_STAR.md

---

## Next Steps

1. ✅ Draft launch communications packet (this doc)
2. ⏳ Review with product team for approval on milestone structure
3. ⏳ Coordinate with designer on tooltip placement and screenshot assets
4. ⏳ Create FAQ document (docs/marketing/launch_faq.md)
5. ⏳ Submit blog post to Shopify Partner Portal 5 days before launch
6. ⏳ Deliver training materials to support team 48h before launch
