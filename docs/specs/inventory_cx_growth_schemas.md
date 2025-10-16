# Inventory, CX, and Growth Metrics Schemas

**File:** `docs/specs/inventory_cx_growth_schemas.md`  
**Owner:** data agent  
**Version:** 1.0  
**Date:** 2025-10-15  
**Migrations:** Tasks 4, 5, 6

---

## 1) Purpose

Database schemas for inventory management (picker payouts), CX metrics aggregation, and growth metrics tracking (SEO, ads, content, social).

---

## 2) Task 4: Inventory Schema - Picker Payouts

### Table: `picker_payouts`

**Purpose:** Track picker performance and calculate payouts

**Columns:**
- `id` - UUID primary key
- `picker_name` - Full name
- `picker_email` - Email (unique identifier)
- `pay_period_start` - Start date of pay period
- `pay_period_end` - End date of pay period
- `orders_picked` - Total orders picked
- `units_picked` - Total units picked
- `pick_accuracy_pct` - Accuracy percentage (0-100)
- `avg_pick_time_seconds` - Average pick time
- `base_rate_per_order` - Base payout rate
- `bonus_rate_per_unit` - Bonus per unit
- `accuracy_bonus` - Accuracy bonus amount
- `speed_bonus` - Speed bonus amount
- `total_payout` - Total payout amount
- `status` - draft, pending_review, approved, paid
- `approved_by` - Manager who approved
- `approved_at` - Approval timestamp
- `paid_at` - Payment timestamp

**RLS Policies (5):**
1. Service role: Full access
2. Authenticated: Read all
3. Managers: Can update (approve)
4. Service role: Can insert
5. No deletes (audit trail)

**Indexes (4):**
- picker_email
- pay_period (start, end)
- status
- Unique: (picker_email, pay_period_start, pay_period_end)

---

## 3) Task 5: CX Metrics Schema

### Table: `cx_metrics_daily`

**Purpose:** Daily aggregation of CX conversation metrics

**Columns:**
- `id` - UUID primary key
- `metric_date` - Date of aggregation
- `shop_domain` - Shop identifier
- `conversations_total` - Total conversations
- `conversations_new` - New conversations
- `conversations_resolved` - Resolved conversations
- `conversations_pending` - Pending conversations
- `avg_first_response_minutes` - Average first response time
- `median_first_response_minutes` - Median first response time
- `p95_first_response_minutes` - P95 first response time
- `avg_resolution_minutes` - Average resolution time
- `median_resolution_minutes` - Median resolution time
- `sla_target_minutes` - SLA target (default 120)
- `sla_met_count` - Conversations meeting SLA
- `sla_breached_count` - SLA breaches
- `sla_compliance_pct` - SLA compliance percentage
- `escalations_count` - Number of escalations
- `escalation_rate_pct` - Escalation rate
- `avg_messages_per_conversation` - Average messages
- `sentiment_positive_count` - Positive sentiment count
- `sentiment_neutral_count` - Neutral sentiment count
- `sentiment_negative_count` - Negative sentiment count
- `sentiment_very_negative_count` - Very negative sentiment count
- `ai_drafted_count` - AI-drafted replies
- `ai_approval_rate_pct` - AI approval rate
- `avg_tone_grade` - Average tone grade (1-5)
- `avg_accuracy_grade` - Average accuracy grade (1-5)
- `avg_policy_grade` - Average policy grade (1-5)

**RLS Policies (5):**
1. Service role: Full access
2. Authenticated: Read all
3. Service role: Can insert
4. Service role: Can update
5. No deletes (audit trail)

**Indexes (3):**
- metric_date (DESC)
- shop_domain
- sla_compliance_pct (WHERE < 90)

---

## 4) Task 6: Growth Metrics Schema

### Table: `growth_metrics_daily`

**Purpose:** Daily aggregation of SEO, ads, content, and social performance

**Columns:**

**SEO Metrics:**
- `organic_sessions` - Organic search sessions
- `organic_pageviews` - Organic pageviews
- `organic_bounce_rate_pct` - Bounce rate
- `avg_session_duration_seconds` - Session duration
- `pages_indexed` - Pages indexed by search engines
- `avg_page_rank` - Average page rank

**Traffic Anomalies:**
- `traffic_anomalies_count` - Number of anomalies
- `pages_with_drops_count` - Pages with traffic drops
- `avg_traffic_change_pct` - Average traffic change

**Ads Metrics:**
- `ad_spend` - Total ad spend
- `ad_impressions` - Ad impressions
- `ad_clicks` - Ad clicks
- `ad_ctr_pct` - Click-through rate
- `ad_conversions` - Ad conversions
- `ad_conversion_rate_pct` - Conversion rate
- `ad_roas` - Return on ad spend

**Content Metrics:**
- `blog_posts_published` - Blog posts published
- `blog_pageviews` - Blog pageviews
- `blog_avg_time_on_page_seconds` - Average time on page
- `blog_social_shares` - Social shares

**Email Metrics:**
- `emails_sent` - Emails sent
- `email_open_rate_pct` - Open rate
- `email_click_rate_pct` - Click rate
- `email_conversions` - Email conversions

**Social Metrics:**
- `social_posts_count` - Social posts
- `social_impressions` - Social impressions
- `social_engagement_count` - Engagement count
- `social_engagement_rate_pct` - Engagement rate
- `social_clicks` - Social clicks

**Conversion Metrics:**
- `total_conversions` - Total conversions
- `conversion_rate_pct` - Conversion rate
- `revenue_from_organic` - Revenue from organic
- `revenue_from_ads` - Revenue from ads
- `revenue_from_social` - Revenue from social

**RLS Policies (5):**
1. Service role: Full access
2. Authenticated: Read all
3. Service role: Can insert
4. Service role: Can update
5. No deletes (audit trail)

**Indexes (4):**
- metric_date (DESC)
- shop_domain
- traffic_anomalies_count (WHERE > 0)
- ad_roas (DESC)

---

## 5) Performance Targets

- Query P95 latency: < 100ms
- All tables have RLS enabled
- All tables have indexes on common query patterns
- All migrations have rollback scripts

---

## 6) Testing

All migrations tested in local Supabase:
- ✅ Tables created successfully
- ✅ RLS policies enabled
- ✅ Indexes created
- ✅ Rollback migrations tested
- ✅ Data integrity constraints working

---

## 7) Changelog

- 1.0 (2025-10-15) - Initial schemas for inventory, CX, and growth metrics

