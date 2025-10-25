# Email Templates — Reports & Alerts

**File:** `docs/specs/email-templates.md`  
**Owner:** Content Agent  
**Version:** 1.0  
**Date:** 2025-10-21  
**Status:** Ready for Implementation  
**Purpose:** Automated email templates for analytics reports, inventory alerts, ad performance, SEO updates

---

## Purpose

Comprehensive email templates for Hot Rodan automated notifications and reports. Includes both HTML and plain text versions for maximum compatibility. All templates follow responsive email design best practices.

---

## Email Template Standards

### General Requirements

- ✅ **Both Versions**: HTML (primary) + Plain Text (fallback)
- ✅ **Mobile-First**: 600px max width, readable on small screens
- ✅ **Accessibility**: Alt text for images, semantic HTML, sufficient contrast
- ✅ **Brand Voice**: Hot Rodan theme (strategic use)
- ✅ **CTA Clarity**: Single primary action per email
- ✅ **Unsubscribe**: Required in footer (CAN-SPAM compliance)

### Technical Specs

- **Max Width**: 600px (desktop inbox compatibility)
- **Font Stack**: Arial, Helvetica, sans-serif (web-safe)
- **Line Height**: 1.6 (readability)
- **Link Color**: #0066CC (sufficient contrast)
- **Button Color**: Hot Rodan Red (#E74C3C)

---

## 1. Weekly Analytics Report

### 1.1 HTML Version

**Subject Line:**

```
Your Weekly Performance Report — {week_dates}
```

**Preheader:**

```
Revenue up {percentage}%, {highlight_metric} this week
```

**Body Structure:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Weekly Performance Report</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: Arial, Helvetica, sans-serif;
        background-color: #f4f4f4;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
      }
      .header {
        background-color: #e74c3c;
        color: #ffffff;
        padding: 20px;
        text-align: center;
      }
      .content {
        padding: 30px 20px;
      }
      .metric-card {
        background-color: #f9f9f9;
        padding: 15px;
        margin: 10px 0;
        border-left: 4px solid #e74c3c;
      }
      .metric-label {
        font-size: 12px;
        color: #666666;
        text-transform: uppercase;
      }
      .metric-value {
        font-size: 32px;
        font-weight: bold;
        color: #333333;
        margin: 5px 0;
      }
      .metric-trend {
        font-size: 14px;
        color: #00aa44;
      }
      .metric-trend.down {
        color: #cc0000;
      }
      .cta-button {
        display: inline-block;
        background-color: #e74c3c;
        color: #ffffff;
        padding: 12px 30px;
        text-decoration: none;
        border-radius: 4px;
        font-weight: bold;
        margin: 20px 0;
      }
      .footer {
        background-color: #333333;
        color: #ffffff;
        padding: 20px;
        text-align: center;
        font-size: 12px;
      }
      .footer a {
        color: #ffffff;
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Header -->
      <div class="header">
        <h1 style="margin: 0; font-size: 24px;">Weekly Performance Report</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">{week_dates}</p>
      </div>

      <!-- Content -->
      <div class="content">
        <p style="font-size: 16px; line-height: 1.6;">Hi {first_name},</p>

        <p style="font-size: 16px; line-height: 1.6;">
          Here's your weekly performance summary. Overall, {summary_sentence}.
        </p>

        <!-- Sales Metric -->
        <div class="metric-card">
          <div class="metric-label">Revenue (7 Days)</div>
          <div class="metric-value">${revenue}</div>
          <div class="metric-trend">▲ {percentage}% vs last week</div>
        </div>

        <!-- Orders Metric -->
        <div class="metric-card">
          <div class="metric-label">Orders</div>
          <div class="metric-value">{order_count}</div>
          <div class="metric-trend">▲ {percentage}% vs last week</div>
        </div>

        <!-- Ad Performance -->
        <div class="metric-card">
          <div class="metric-label">Ad ROAS</div>
          <div class="metric-value">{roas}:1</div>
          <div class="metric-trend">Target: 3:1 — {status}</div>
        </div>

        <!-- SEO Traffic -->
        <div class="metric-card">
          <div class="metric-label">Organic Traffic</div>
          <div class="metric-value">{sessions}</div>
          <div class="metric-trend">▲ {percentage}% vs last week</div>
        </div>

        <!-- Key Insights -->
        <h2 style="font-size: 18px; color: #333333; margin-top: 30px;">
          Key Insights
        </h2>
        <ul style="line-height: 1.8; color: #555555;">
          <li>{insight_1}</li>
          <li>{insight_2}</li>
          <li>{insight_3}</li>
        </ul>

        <!-- CTA -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="{dashboard_url}" class="cta-button"> View Full Dashboard </a>
        </div>

        <p style="font-size: 14px; color: #666666; line-height: 1.6;">
          This report covers {week_dates}. For real-time data, visit your
          dashboard anytime.
        </p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p style="margin: 0 0 10px 0;">Hot Rodan Operations Control Center</p>
        <p style="margin: 0;">
          <a href="{dashboard_url}">Dashboard</a> |
          <a href="{settings_url}">Settings</a> |
          <a href="{unsubscribe_url}">Unsubscribe</a>
        </p>
        <p style="margin: 10px 0 0 0; opacity: 0.7;">
          You're receiving this because you enabled weekly reports in your
          notification settings.
        </p>
      </div>
    </div>
  </body>
</html>
```

### 1.2 Plain Text Version

```
=============================================
WEEKLY PERFORMANCE REPORT
{week_dates}
=============================================

Hi {first_name},

Here's your weekly performance summary.

REVENUE (7 DAYS)
${revenue}
▲ {percentage}% vs last week

ORDERS
{order_count}
▲ {percentage}% vs last week

AD ROAS
{roas}:1
Target: 3:1 — {status}

ORGANIC TRAFFIC
{sessions} sessions
▲ {percentage}% vs last week

KEY INSIGHTS
• {insight_1}
• {insight_2}
• {insight_3}

VIEW FULL DASHBOARD
{dashboard_url}

---

This report covers {week_dates}. For real-time data, visit your dashboard anytime.

Hot Rodan Operations Control Center
Dashboard: {dashboard_url}
Settings: {settings_url}
Unsubscribe: {unsubscribe_url}

You're receiving this because you enabled weekly reports in your notification settings.
```

---

## 2. Critical Inventory Alert

### 2.1 HTML Version

**Subject Line:**

```
🚨 URGENT: {product_name} — Critical Stock Level
```

**Preheader:**

```
Only {quantity} units remaining. Immediate action needed.
```

**Body:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Critical Inventory Alert</title>
    <style>
      /* Same base styles as Weekly Report */
      .alert-banner {
        background-color: #cc0000;
        color: #ffffff;
        padding: 15px;
        text-align: center;
        font-weight: bold;
      }
      .product-info {
        background-color: #fff3cd;
        border-left: 4px solid #ffa500;
        padding: 15px;
        margin: 20px 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Alert Banner -->
      <div class="alert-banner">🚨 CRITICAL INVENTORY ALERT</div>

      <!-- Content -->
      <div class="content">
        <h1 style="color: #CC0000; font-size: 22px;">
          Immediate Action Required
        </h1>

        <p style="font-size: 16px; line-height: 1.6;">
          <strong>{product_name}</strong> has reached critical stock levels.
        </p>

        <!-- Product Info -->
        <div class="product-info">
          <p style="margin: 5px 0;"><strong>SKU:</strong> {sku}</p>
          <p style="margin: 5px 0;">
            <strong>Current Stock:</strong> {quantity} units
          </p>
          <p style="margin: 5px 0;">
            <strong>Threshold:</strong> {threshold} units
          </p>
          <p style="margin: 5px 0;">
            <strong>Days of Cover:</strong> {days} days
          </p>
          <p style="margin: 5px 0;">
            <strong>Avg Daily Sales:</strong> {avg_sales} units
          </p>
        </div>

        <h2 style="font-size: 18px; color: #333333;">Recommended Action</h2>
        <p style="font-size: 16px; line-height: 1.6;">
          Reorder {recommended_quantity} units from {vendor} to maintain
          {target_days} days of supply.
        </p>

        <p
          style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #0066CC;"
        >
          <strong>Lead Time:</strong> {lead_time} days<br />
          <strong>Estimated Stockout:</strong> {stockout_date} (if not
          reordered)
        </p>

        <!-- CTA -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="{dashboard_url}/inventory/{variant_id}" class="cta-button">
            Review & Create PO
          </a>
        </div>

        <p style="font-size: 14px; color: #666666;">
          This alert was triggered because stock dropped below {threshold}
          units. Adjust alert thresholds in
          <a href="{settings_url}">Settings</a>.
        </p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p style="margin: 0 0 10px 0;">Hot Rodan Inventory Management</p>
        <p style="margin: 0;">
          <a href="{dashboard_url}">Dashboard</a> |
          <a href="{settings_url}">Alert Settings</a> |
          <a href="{unsubscribe_url}">Unsubscribe</a>
        </p>
      </div>
    </div>
  </body>
</html>
```

### 2.2 Plain Text Version

```
=============================================
🚨 CRITICAL INVENTORY ALERT
=============================================

IMMEDIATE ACTION REQUIRED

{product_name} has reached critical stock levels.

PRODUCT DETAILS
SKU: {sku}
Current Stock: {quantity} units
Threshold: {threshold} units
Days of Cover: {days} days
Avg Daily Sales: {avg_sales} units

RECOMMENDED ACTION
Reorder {recommended_quantity} units from {vendor} to maintain {target_days} days of supply.

TIMELINE
Lead Time: {lead_time} days
Estimated Stockout: {stockout_date} (if not reordered)

REVIEW & CREATE PO
{dashboard_url}/inventory/{variant_id}

---

This alert was triggered because stock dropped below {threshold} units.
Adjust alert thresholds in Settings: {settings_url}

Hot Rodan Inventory Management
Dashboard: {dashboard_url}
Alert Settings: {settings_url}
Unsubscribe: {unsubscribe_url}
```

---

## 3. Ad Performance Alert

### 3.1 HTML Version

**Subject Line:**

```
⚠ Ad Alert: {campaign_name} — {alert_type}
```

**Alert Types:**

- "ROAS Below Target"
- "Budget Nearly Exhausted"
- "Campaign Paused"
- "High CPA Detected"

**Preheader:**

```
{campaign_name}: {specific_issue} — Review recommended
```

**Body Structure:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Ad Performance Alert</title>
    <style>
      /* Base styles */
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header" style="background-color: #FFA500;">
        <h1>⚠ Ad Performance Alert</h1>
      </div>

      <div class="content">
        <h2 style="color: #FF8800;">{campaign_name}</h2>

        <p style="font-size: 16px; line-height: 1.6;">
          <strong>Issue:</strong> {issue_description}
        </p>

        <!-- Performance Metrics -->
        <div class="metric-card">
          <div class="metric-label">ROAS (30 Days)</div>
          <div class="metric-value">{roas}:1</div>
          <div class="metric-trend down">⚠ Below 3:1 target</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Ad Spend (30 Days)</div>
          <div class="metric-value">${spend}</div>
          <div class="metric-trend">{percentage}% of monthly budget</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">CPA (Cost Per Acquisition)</div>
          <div class="metric-value">${cpa}</div>
          <div class="metric-trend down">⚠ Above ${target_cpa} target</div>
        </div>

        <!-- Recommendation -->
        <h2 style="font-size: 18px;">Recommended Actions</h2>
        <ol style="line-height: 1.8;">
          <li>{recommendation_1}</li>
          <li>{recommendation_2}</li>
          <li>{recommendation_3}</li>
        </ol>

        <!-- CTA -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="{dashboard_url}/analytics/ads" class="cta-button">
            Review Campaign Performance
          </a>
        </div>

        <p style="font-size: 14px; color: #666666;">
          Alert triggered: {alert_condition}. Adjust alert thresholds in
          Settings.
        </p>
      </div>

      <div class="footer">
        <p>Hot Rodan Ad Performance Monitoring</p>
        <p>
          <a href="{dashboard_url}">Dashboard</a> |
          <a href="{settings_url}">Settings</a> |
          <a href="{unsubscribe_url}">Unsubscribe</a>
        </p>
      </div>
    </div>
  </body>
</html>
```

### 3.2 Plain Text Version

```
=============================================
⚠ AD PERFORMANCE ALERT
=============================================

CAMPAIGN: {campaign_name}

ISSUE: {issue_description}

PERFORMANCE METRICS (30 DAYS)

ROAS: {roas}:1
⚠ Below 3:1 target

Ad Spend: ${spend}
{percentage}% of monthly budget

CPA: ${cpa}
⚠ Above ${target_cpa} target

RECOMMENDED ACTIONS
1. {recommendation_1}
2. {recommendation_2}
3. {recommendation_3}

REVIEW CAMPAIGN PERFORMANCE
{dashboard_url}/analytics/ads

---

Alert triggered: {alert_condition}
Adjust thresholds: {settings_url}

Hot Rodan Ad Performance Monitoring
Dashboard: {dashboard_url}
Unsubscribe: {unsubscribe_url}
```

---

## 4. SEO Update (Weekly)

### 4.1 HTML Version

**Subject Line:**

```
SEO Update: Organic traffic {up/down} {percentage}% this week
```

**Preheader:**

```
{number} new keywords ranking, {number} position improvements
```

**Body:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Weekly SEO Update</title>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Weekly SEO Update</h1>
        <p>{week_dates}</p>
      </div>

      <div class="content">
        <p>Hi {first_name},</p>

        <p>Your SEO performance this week:</p>

        <!-- Traffic Metric -->
        <div class="metric-card">
          <div class="metric-label">Organic Sessions</div>
          <div class="metric-value">{sessions}</div>
          <div class="metric-trend">▲ {percentage}% vs last week</div>
        </div>

        <!-- Keyword Wins -->
        <h2>Keyword Wins 🎯</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f4f4f4;">
              <th style="padding: 10px; text-align: left;">Keyword</th>
              <th style="padding: 10px; text-align: center;">Movement</th>
              <th style="padding: 10px; text-align: center;">Now</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 10px;">{keyword_1}</td>
              <td style="padding: 10px; text-align: center; color: #00AA44;">
                ▲ {positions}
              </td>
              <td style="padding: 10px; text-align: center;">
                #{new_position}
              </td>
            </tr>
            <!-- More rows -->
          </tbody>
        </table>

        <!-- Top Pages -->
        <h2>Top Landing Pages</h2>
        <ol style="line-height: 1.8;">
          <li>
            <a href="{page_1_url}">{page_1_title}</a> — {sessions_1} sessions
          </li>
          <li>
            <a href="{page_2_url}">{page_2_title}</a> — {sessions_2} sessions
          </li>
          <li>
            <a href="{page_3_url}">{page_3_title}</a> — {sessions_3} sessions
          </li>
        </ol>

        <!-- CTA -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="{dashboard_url}/analytics/seo" class="cta-button">
            View Full SEO Report
          </a>
        </div>
      </div>

      <div class="footer">
        <p>Hot Rodan SEO Monitoring</p>
        <p>
          <a href="{dashboard_url}">Dashboard</a> |
          <a href="{unsubscribe_url}">Unsubscribe</a>
        </p>
      </div>
    </div>
  </body>
</html>
```

### 4.2 Plain Text Version

```
=============================================
WEEKLY SEO UPDATE
{week_dates}
=============================================

Hi {first_name},

ORGANIC SESSIONS
{sessions}
▲ {percentage}% vs last week

KEYWORD WINS 🎯
• {keyword_1}: Moved up {positions} spots to #{new_position}
• {keyword_2}: Moved up {positions} spots to #{new_position}
• {keyword_3}: Moved up {positions} spots to #{new_position}

TOP LANDING PAGES
1. {page_1_title} — {sessions_1} sessions
   {page_1_url}

2. {page_2_title} — {sessions_2} sessions
   {page_2_url}

3. {page_3_title} — {sessions_3} sessions
   {page_3_url}

VIEW FULL SEO REPORT
{dashboard_url}/analytics/seo

---

Hot Rodan SEO Monitoring
Dashboard: {dashboard_url}
Unsubscribe: {unsubscribe_url}
```

---

## 5. System Alert Email

### 5.1 Service Degradation

**Subject:**

```
System Alert: {service_name} Connection Degraded
```

**Body (HTML):**

```html
<div class="container">
  <div class="header" style="background-color: #FFA500;">
    <h1>⚠ System Alert</h1>
  </div>

  <div class="content">
    <p>Hi {first_name},</p>

    <p style="font-size: 16px; font-weight: bold; color: #FF8800;">
      {service_name} connection is experiencing issues.
    </p>

    <p>
      <strong>Status:</strong> Degraded Performance<br />
      <strong>Detected:</strong> {timestamp}<br />
      <strong>Impact:</strong> {impact_description}
    </p>

    <h2>What This Means</h2>
    <p>{user_impact_description}</p>

    <h2>What We're Doing</h2>
    <ul>
      <li>{action_1}</li>
      <li>{action_2}</li>
    </ul>

    <h2>What You Can Do</h2>
    <p>{user_action_recommendation}</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{dashboard_url}/settings?tab=integrations" class="cta-button">
        Check Integration Status
      </a>
    </div>

    <p style="font-size: 14px; color: #666666;">
      We'll send an update when service is fully restored.
    </p>
  </div>

  <div class="footer">
    <p>Hot Rodan System Monitoring</p>
  </div>
</div>
```

### 5.2 Plain Text Version

```
=============================================
⚠ SYSTEM ALERT
=============================================

{service_name} connection is experiencing issues.

STATUS: Degraded Performance
DETECTED: {timestamp}
IMPACT: {impact_description}

WHAT THIS MEANS
{user_impact_description}

WHAT WE'RE DOING
• {action_1}
• {action_2}

WHAT YOU CAN DO
{user_action_recommendation}

CHECK INTEGRATION STATUS
{dashboard_url}/settings?tab=integrations

---

We'll send an update when service is fully restored.

Hot Rodan System Monitoring
Dashboard: {dashboard_url}
```

---

## 6. Email Template Variables Reference

### Weekly Report Variables

- `{first_name}` - User's first name
- `{week_dates}` - "Oct 15-21, 2025"
- `{summary_sentence}` - "strong performance across all channels"
- `{revenue}` - "12,847.50" (no $ in variable)
- `{percentage}` - "15.2" (no % in variable)
- `{order_count}` - "187"
- `{roas}` - "4.2" (ratio before :1)
- `{sessions}` - "4,283"
- `{insight_1/2/3}` - Dynamic insights
- `{dashboard_url}` - Full URL to dashboard
- `{settings_url}` - Full URL to settings
- `{unsubscribe_url}` - Full URL to unsubscribe

### Inventory Alert Variables

- `{product_name}` - "TurboCharge Pro Battery"
- `{sku}` - "BATT-TCP-001"
- `{quantity}` - "6"
- `{threshold}` - "10"
- `{days}` - "2.5"
- `{avg_sales}` - "2.4"
- `{recommended_quantity}` - "30"
- `{vendor}` - "Acme Distribution"
- `{target_days}` - "14"
- `{lead_time}` - "7"
- `{stockout_date}` - "Oct 24, 2025"
- `{variant_id}` - Shopify variant ID

### Ad Alert Variables

- `{campaign_name}` - "Fall Performance Sale"
- `{alert_type}` - "ROAS Below Target"
- `{issue_description}` - "ROAS has dropped to 2.1:1, below 3:1 target"
- `{roas}` - "2.1"
- `{spend}` - "2,847.00"
- `{cpa}` - "78.50"
- `{target_cpa}` - "50.00"
- `{recommendation_1/2/3}` - Action items
- `{alert_condition}` - "ROAS < 3:1 for 3+ consecutive days"

### SEO Update Variables

- `{sessions}` - "4,283"
- `{percentage}` - "22.4"
- `{keyword_1}` - "performance auto parts"
- `{positions}` - "3" (positions moved)
- `{new_position}` - "5" (current ranking)
- `{page_1_title}` - "TurboCharge Pro Battery"
- `{page_1_url}` - Full URL
- `{sessions_1}` - "1,240"

---

## 7. Email Best Practices

### Subject Lines

- ✅ **Clear and Specific**: State the content or alert
- ✅ **Front-Load Important Info**: "URGENT" or metrics first
- ✅ **Personalization**: Use {first_name} when appropriate
- ✅ **Emoji Strategy**: Use 1 emoji max, only for alerts/urgency
- ✅ **Length**: 40-50 characters ideal (mobile preview)
- ❌ ALL CAPS (except urgent alerts)
- ❌ Clickbait or misleading
- ❌ Generic ("Your Report")

### Preheaders

- ✅ **Complement Subject**: Add detail, not duplicate
- ✅ **60-100 Characters**: Full mobile preview
- ✅ **Value Proposition**: What's inside?
- ✅ **Action Preview**: What should they do?

### Body Content

- ✅ **Scannable**: Short paragraphs, bullets, headings
- ✅ **Data-Driven**: Specific numbers, not vague
- ✅ **Actionable**: Clear next steps
- ✅ **Single CTA**: One primary action per email
- ❌ Walls of text
- ❌ Multiple CTAs competing
- ❌ Generic "Click here" links

### CTA Buttons

- ✅ **Specific Action**: "Review Campaign" not "Click Here"
- ✅ **High Contrast**: Button color vs background
- ✅ **Touch-Friendly**: 44px min height for mobile
- ✅ **Fallback Link**: Plain text URL after button
- ❌ Generic text
- ❌ Low contrast
- ❌ Multiple primary buttons

---

## 8. Compliance & Legal

### CAN-SPAM Requirements

- ✅ **Unsubscribe Link**: Every email must have it
- ✅ **Physical Address**: Business address in footer
- ✅ **Honest Subject Lines**: No deceptive headers
- ✅ **Honor Opt-Outs**: Process within 10 business days
- ✅ **Identify as Ad**: If promotional content

### GDPR Compliance (If EU Recipients)

- ✅ **Consent Required**: Opt-in for marketing emails
- ✅ **Data Processing**: Explain how data is used
- ✅ **Easy Unsubscribe**: One-click unsubscribe
- ✅ **Privacy Policy**: Link in footer

### Accessibility

- ✅ **Alt Text**: All images have descriptive alt text
- ✅ **Semantic HTML**: Proper heading hierarchy
- ✅ **Color Contrast**: WCAG AA minimum (4.5:1)
- ✅ **Plain Text Version**: Always provide fallback
- ✅ **Link Text**: Descriptive, not "click here"

---

## 9. Email Testing Checklist

**Before Sending:**

- [ ] Subject line < 50 characters
- [ ] Preheader 60-100 characters
- [ ] All variables populated (no {placeholder} visible)
- [ ] Links work and go to correct URLs
- [ ] Images load (include alt text)
- [ ] Mobile responsive (test on iPhone, Android)
- [ ] Plain text version readable
- [ ] Unsubscribe link works
- [ ] CTA button visible and clickable
- [ ] Spell check passed
- [ ] Brand voice consistent
- [ ] Test send to team email first

**Testing Tools:**

- Litmus or Email on Acid (cross-client testing)
- Gmail, Outlook, Apple Mail (manual testing)
- Mobile device testing (iOS Mail, Gmail app)

---

## 10. Frequency & Timing

### Automated Reports

- **Weekly Analytics**: Monday 8am (user's timezone)
- **Monthly Summary**: 1st of month, 9am
- **Quarterly Review**: First Monday of quarter

### Real-Time Alerts

- **Critical Inventory**: Immediately (any time)
- **Ad Performance**: Daily check at 6am, alert if triggered
- **SEO Ranking Drop**: Daily check at 8am
- **System Status**: Immediately upon detection

### User Preferences

- **Frequency Controls**: Daily, Weekly, Monthly, Never
- **Quiet Hours**: No alerts 10pm-7am (except critical)
- **Delivery Method**: Email, SMS, or In-App only

---

## Quick Reference

### Email Type Summary

| Email Type       | Frequency   | Urgency  | Primary CTA     |
| ---------------- | ----------- | -------- | --------------- |
| Weekly Analytics | Weekly      | Info     | View Dashboard  |
| Inventory Alert  | Real-time   | Critical | Create PO       |
| Ad Performance   | Daily check | Warning  | Review Campaign |
| SEO Update       | Weekly      | Info     | View SEO Report |
| System Alert     | Real-time   | Warning  | Check Status    |

### Subject Line Formulas

**Reports:**

```
{Metric} Report — {Time Period}
Your Weekly Performance Report — {dates}
```

**Alerts:**

```
{Emoji} {Alert Type}: {Specific Issue}
🚨 URGENT: {Product} — Critical Stock
⚠ Ad Alert: {Campaign} — ROAS Below Target
```

**Updates:**

```
{Metric} Update: {Change Description}
SEO Update: Traffic up 22% this week
```

---

**END OF DOCUMENT**

**Implementation Notes:**

1. Use email service provider's templating system (variables, conditionals)
2. A/B test subject lines for engagement
3. Monitor open rates, click rates, unsubscribe rates
4. Personalize content based on user's role/interests
5. Respect user preferences for frequency and timing

**Questions?** Contact Content team or refer to email service provider documentation.
