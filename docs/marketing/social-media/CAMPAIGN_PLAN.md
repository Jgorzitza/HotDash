# Social Media Ads Campaign Plan

**Campaign:** HotDash Launch – Paid Social  
**Budget:** 30% of total marketing budget  
**Objective:** Build awareness, generate qualified leads, drive trials  
**Timeline:** Pre-launch (-7 days) → Ongoing

---

## Channel Mix & Goals

| Platform        | Goal                                  | Budget Share | Primary KPIs                                   |
| --------------- | ------------------------------------- | ------------ | ---------------------------------------------- |
| Facebook Ads    | Demand generation & retargeting       | 45%          | CTR ≥ 1.5%, CPL ≤ $40, Cost-per-trial ≤ $200   |
| Instagram Ads   | Visual storytelling & social proof    | 25%          | Video completion ≥ 35%, Saves/Shares ≥ 5%      |
| LinkedIn Ads    | B2B decision maker acquisition        | 20%          | Lead form CVR ≥ 12%, SQL rate ≥ 20%            |
| X (Twitter) Ads | Launch buzz & product updates         | 10%          | Engagement rate ≥ 3%, Cost-per-engagement ≤ $2 |

---

## Campaign Structure

### 1. Awareness (Top of Funnel)
- **Objective:** Reach target audiences with launch messaging.
- **Formats:** Video (15–30s), carousel, story ads, LinkedIn single image.
- **Audiences:** Lookalikes from customer list, interest-based (e-commerce ops, Shopify merchants), industry groups (retail, DTC brands).
- **Messaging Pillars:** Automate operations, AI copilots for e-commerce teams, unify CX + inventory + growth.

### 2. Consideration (Mid Funnel)
- **Objective:** Drive traffic to launch landing pages and gated content.
- **Formats:** Lead ads (LinkedIn, Facebook), carousel product tours, collection ads.
- **Audiences:** Website visitors (30 days), content viewers ≥50%, engaged social followers.
- **Offers:** Demo webinar invite, downloadable "Operations Automation Playbook", free trial CTA.

### 3. Conversion (Bottom Funnel)
- **Objective:** Convert high-intent prospects to trials or demos.
- **Formats:** Retargeting static ads, testimonial videos, LinkedIn conversation ads.
- **Audiences:** Pricing page visitors, abandoned trial sign-ups, CRM leads not yet trialing.
- **Messaging:** Limited-time launch bonus, ROI proof points, customer testimonials.

### 4. Advocacy (Post-Conversion)
- **Objective:** Encourage sharing and referrals from early adopters.
- **Formats:** UGC-style ads, customer spotlight reels, referral program promos.
- **Audiences:** New customers, engaged trial users, community groups.
- **CTA:** Share success story, invite peers, schedule strategy session.

---

## Target Audiences

1. **Primary Buyer Personas**
   - E-commerce Operations Managers (50–500 SKU online stores)
   - Customer Support Leads managing multi-channel support
   - Growth/Marketing Directors for DTC brands

2. **Filters**
   - Company size: 10–200 employees
   - Locations: North America, UK, Australia (English-first markets)
   - Tech stack interests: Shopify, Klaviyo, Gorgias, ShipBob

3. **Remarketing Pools**
   - Website visitors (last 30/60/90 days)
   - Trial sign-ups without activation
   - Content downloaders/webinar attendees
   - Email subscribers (synced to custom audiences)

4. **Lookalikes**
   - Paid customers (1%, 2%, 5% tiers)
   - High-LTV customers (top quartile)
   - Newsletter subscribers with ≥3 engagements

---

## Creative Strategy

### Messaging Themes
- **Unified Operations:** Inventory, CX, and growth automations in one dashboard.
- **Human-in-the-loop AI:** Emphasize approvals workflow and CEO oversight.
- **Time Savings & ROI:** Highlight 30% faster approvals, 20% fewer stockouts.
- **Customer Stories:** Feature testimonials from beta customers (with permission).

### Asset Requirements
- **Video (15–30s):** Product walkthrough, CEO intro, motion graphics.
- **Static Images (1080x1080, 1200x628):** Feature highlights, before/after metrics.
- **Carousel Sets:** 4–5 cards covering inventory, CX, growth, analytics.
- **Story/Reels:** Vertical 1080x1920 animations with CTA swipe-up.
- **Copy Variations:** Minimum 5 primary texts, 5 headlines, 5 descriptions per persona.

### Creative Production Timeline
- **Day -14:** Finalize messaging framework and scripts.
- **Day -10:** Complete asset production, route for CEO review.
- **Day -7:** Load approved creatives into ad manager as drafts.
- **Day -1:** QA check, schedule go-live.

---

## Sample Copy Library

### Awareness (Facebook/Instagram)
```
Primary: Run your store like a pro. HotDash combines inventory, CX, and growth automation in one AI-powered control center—built for Shopify teams that move fast.
Headline: Automate Store Ops with AI
Description: 14-day free trial. No credit card required.
CTA: Start Free Trial
```

### Consideration (LinkedIn)
```
Intro: 👋 Operations leaders, meet your new control tower.
Body: HotDash keeps inventory, support, and growth in sync with human-reviewed AI workflows. See how brands cut manual ops time by 40%.
CTA Button: Book a Demo
```

### Conversion (Retargeting)
```
Primary: You explored HotDash—ready to launch? Activate your free trial and unlock inventory forecasts, CX approvals, and launch-ready campaigns in minutes.
Headline: Finish Setting Up HotDash
CTA: Continue Trial
```

### Advocacy (UGC)
```
Primary: “HotDash helped us launch faster and stay in control.” – Beta Partner
Headline: Share Your HotDash Story
CTA: Refer a Friend
```

---

## Launch Timeline

| Phase          | Window                     | Key Actions                                                                 |
| -------------- | -------------------------- | --------------------------------------------------------------------------- |
| Pre-launch 1   | Day -14 to -8              | Finalize strategy, build audiences, draft creative, set tracking parameters |
| Pre-launch 2   | Day -7 to -1               | CEO approvals, load campaigns (paused), QA pixels, schedule organic teasers |
| Launch Day     | Day 0                      | Activate awareness/consideration, monitor delivery, respond to engagement   |
| Post-launch 1  | Day 1–7                    | Shift budget to top creatives, add retargeting layers, launch lead magnets  |
| Optimization   | Day 8–30                   | Scale LinkedIn demo ads, refresh creatives weekly, expand lookalikes        |
| Evergreen      | Day 31+                    | Move budgets to best ROAS ad sets, rotate testimonials, test new offers     |

---

## Measurement & Reporting

- **Daily Dashboard:** Spend vs budget, CTR, CPL, trial conversions, by platform/ad set.
- **Weekly Review:** Creative performance leaderboard, audience saturation, frequency checks, recommendations for CEO.
- **Event Tracking:** Pixel & CAPI (Facebook), LinkedIn Insight Tag, X Pixel; all URLs tagged with UTMs (`utm_source`, `utm_medium=paid_social`, `utm_campaign=launch2025`).
- **Attribution:** Primary model – 7-day click/1-day view (Meta); 30-day click (LinkedIn); supplement with GA4 multi-touch.
- **Alerting:** Slack alerts via marketing automation when CPL > $60 or CPA > $400 for 48h.

---

## CEO Approval Checklist

1. Channel strategy & budget split
2. Persona targeting and exclusions
3. Creative asset packages (video, static, copy variants)
4. Lead magnet offers and landing pages
5. Launch schedule and escalation paths

Approval artifacts stored in `/app/routes/admin.marketing.approvals.tsx` workflow once ready.

---

## Optimization Playbook

- **Frequency Caps:** Maintain <3 for awareness, <5 for retargeting; rotate creatives weekly.
- **Creative Refresh Cadence:** Introduce 2 new creatives per platform weekly; retire underperformers (<0.7x account average CTR).
- **Bid Strategies:** Awareness – lowest cost; consideration – cost cap; conversion – bid cap aligned to CPL target.
- **Testing Roadmap:** 
  - Week 1: Test messaging pillar (AI automation vs ROI).
  - Week 2: Test creative format (video vs carousel).
  - Week 3: Test CTAs (Free Trial vs Demo vs Playbook Download).
- **Fail Fast Rules:** Pause any ad set with spend >$500 and no conversions; reallocate to top 3 performers.

---

## Launch Checklist

- [ ] Pixels & CAPI verified for all platforms
- [ ] Audiences synced (CRM, website, lookalikes)
- [ ] Creative assets approved by CEO
- [ ] UTM templates applied to every ad
- [ ] Campaign naming convention adhered to (`HD2025_<Stage>_<Persona>_<Creative>`)
- [ ] QA screenshots captured and stored in `artifacts/ads/<date>/screenshots/`
- [ ] Slack launch war-room channel set (`#launch-paid-social`)

---

**Owner:** Ads Agent  
**Status:** Ready for CEO review once creative assets uploaded  
**Next Action:** Build campaigns in platform sandboxes and attach approval evidence.

