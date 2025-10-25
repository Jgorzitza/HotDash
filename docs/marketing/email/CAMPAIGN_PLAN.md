# Email Marketing Campaign Plan

**Campaign:** HotDash Launch – Email Lifecycle  
**Budget:** 10% of total marketing budget  
**Objective:** Convert leads, nurture prospects, onboard new trials  
**Timeline:** Launch Day 0 → Ongoing

---

## Audience Segmentation

1. **Existing List**
   - Customers (beta users, early adopters)
   - Warm leads (webinar attendees, content downloads)
   - General subscribers (newsletter sign-ups)

2. **Partner & Integration Lists**
   - Shopify app marketplace subscribers (opt-in)
   - Co-marketing partners (Klaviyo, ShipBob, etc.)

3. **New Trial Users**
   - Day 0 onboarding
   - Activation nudges (Day 1–14)
   - Retention flow (post-trial)

4. **Behavioral Segments**
   - High intent (pricing page visits, demo requests)
   - Content engaged (3+ email clicks in 30 days)
   - Dormant leads (no opens in 90 days)

---

## Campaign Streams

### 1. Launch Announcement (Day 0)
- **Subject Line Options:** 
  - "HotDash is live: The AI control center for Shopify teams"  
  - "Launch day: Automate inventory, CX, and growth with HotDash"
- **Structure:** 
  - Hero banner showcasing dashboard
  - Key benefits (inventory intelligence, CX approvals, growth insights)
  - CTA buttons: `Start free trial` and `Book a demo`
  - CEO message snippet with quote/vision
  - Social proof & beta testimonial

### 2. Feature Highlight Series (5 emails, Days 2–14)
| Email | Focus                     | Key CTA               |
| ----- | ------------------------- | --------------------- |
| #1    | Inventory & stock alerts  | Explore Inventory     |
| #2    | CX approvals workflow     | View Support Console  |
| #3    | Growth/Ads automation     | Plan Campaigns        |
| #4    | Analytics & dashboards    | View Live Metrics     |
| #5    | Security & governance     | Review Safeguards     |

Each email includes:
- 3 value bullets with metrics
- 1 customer quote or data point
- Interactive GIF/video thumbnail
- Secondary CTA to "Chat with an expert"

### 3. Testimonial & Social Proof (Days 7, 14, 21)
- Case study spotlight (before/after metrics)
- Quote block + portrait imagery
- CTA: Download full case study / Watch testimonial video

### 4. Drip Onboarding (New Trials)
- **Welcome (Hour 0):** Get started checklist, login links, support contact.
- **Activation Nudge (Day 1):** Encourage connecting Shopify, invite teammates.
- **Feature Adoption (Day 3):** Configure inventory alerts, enable approval workflow.
- **Value Reinforcement (Day 5):** Show sample dashboard metrics, ROI calculator.
- **Executive Check-in (Day 7):** CEO outreach offering strategy session.
- **Conversion Push (Day 10):** Highlight paid plan benefits, limited time launch incentives.
- **Last Chance (Day 13):** Trial ending reminder with plan comparison.

### 5. Win-back & Dormant Lead Reactivation (Day 30+)
- Subject: "Still solving operations fire drills manually?"
- Offer: Exclusive webinar or discounted onboarding package.
- CTA: Re-engage with updated playbook.

---

## Creative & Content Requirements

- **Design Templates:** Responsive HTML modules (hero, two-column feature, testimonial, CTA bar).
- **Brand Elements:** Launch color palette, product screenshots, icon set from design team.
- **Personalization Tokens:** First name, company name, last touched feature, trial status.
- **Dynamic Content Blocks:** Tailor CTAs based on segment (trial vs lead).
- **Accessibility:** Minimum 60 characters for alt text, large tap targets on mobile, dark mode friendly.

---

## Automation & Tooling

- **Platform:** Klaviyo (primary) syncing with CRM & product usage data.
- **Integrations:** Shopify customer list sync, Segment events for in-app actions, Zapier fallback.
- **Trigger Events:** `trial_created`, `shopify_connected`, `approval_submitted`, `usage_inactive_72h`.
- **Suppression Logic:** 
  - Exclude customers from prospect blasts.
  - Pause onboarding sequence if subscription activated.
  - Weekly hygiene: suppress unengaged >120 days.

---

## KPIs & Benchmarks

| Stream                  | Open Rate | Click Rate | Conversion Goal                   |
| ----------------------- | --------- | ---------- | --------------------------------- |
| Launch Announcement     | ≥30%      | ≥6%        | 1,000 trials started              |
| Feature Highlight       | ≥28%      | ≥7%        | 15% trial activation              |
| Onboarding Drip         | ≥40%      | ≥12%       | 40% Day 7 activation              |
| Testimonial Campaign    | ≥25%      | ≥5%        | 10% demo bookings                 |
| Win-back Reactivation   | ≥18%      | ≥4%        | 5% re-engagement to trial         |

Alert thresholds:
- Trigger Slack alert if open rate drops <20% or bounce rate >2%.
- Pause/resend if unsubscribe rate >0.5% on any send.

---

## Compliance & Deliverability

- Double opt-in enforced for new subscribers.
- Include physical mailing address & unsubscribe in footer.
- Pre-warm dedicated IP/domain 14 days pre-launch.
- Run Litmus tests (desktop/mobile/dark mode) before scheduling.
- DMARC, DKIM, SPF confirmed with DevOps.

---

## Production Timeline

| Date (relative) | Milestone                                      |
| --------------- | ---------------------------------------------- |
| Day -14         | Map segments, confirm data availability        |
| Day -12         | Draft copy for all streams                     |
| Day -10         | Design review with design agent                |
| Day -7          | CEO approval on launch sequence & drip flows   |
| Day -5          | Build flows in Klaviyo (automation + triggers) |
| Day -3          | QA tests, validate personalization & tracking  |
| Day -1          | Schedule launch announcement, arm drips        |
| Day 0           | Send launch email, monitor in real time        |
| Day 1–14        | Daily monitoring, A/B test subject lines       |

---

## Testing & Optimization

- **Subject Line Tests:** Emojis vs plain text, benefit vs curiosity.
- **Send Time Tests:** 8 AM vs 2 PM local; adjust by segment performance.
- **Content Tests:** Video thumbnail vs static image, short vs long intro copy.
- **CTA Tests:** "Start trial" vs "See dashboard" vs "Book demo".
- **Lifecycle:** Evaluate engagement by segment weekly; refine triggers.

---

## Reporting

- Daily summary dashboard (opens, clicks, conversions) piped to marketing BI.
- Weekly executive recap with key learnings, improvements, and deliverability health.
- Quarterly nurture performance review to prune low performers.
- Evidence stored in `artifacts/ads/<date>/email-metrics/`.

---

## CEO Approval Checklist

1. Final copy and design for launch announcement.
2. Outline of feature highlight series and drip content.
3. Segmentation logic and suppression rules.
4. Automation triggers and fail-safes.
5. Reporting cadence and dashboards.

Once approved, workflows are published through `/app/routes/admin.marketing.email.tsx` interface.

---

**Owner:** Ads Agent  
**Status:** Ready for build-out after CEO feedback  
**Next Action:** Sync with design agent for creative and ensure CRM data connectors live.

