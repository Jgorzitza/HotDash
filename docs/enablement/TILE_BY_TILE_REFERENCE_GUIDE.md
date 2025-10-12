# HotDash Dashboard - Tile-by-Tile Reference Guide

**Version**: 1.0  
**Date**: October 12, 2025  
**Owner**: Enablement Agent  
**Purpose**: Deep-dive reference for each dashboard tile  
**Audience**: Operators, managers, and power users

---

## 📚 Guide Structure

This guide provides comprehensive information for each of the 6 HotDash tiles:

1. **Sales Pulse** - Revenue, orders, and top products
2. **CX Escalations** - Customer support SLA tracking
3. **Fulfillment Health** - Order shipping status
4. **Inventory Heatmap** - Stock level alerts
5. **SEO Content** - Landing page traffic analysis
6. **Ops Metrics** - Team performance analytics

For each tile, you'll find:
- What it shows and why it matters
- How to interpret the data
- When to take action
- Common scenarios and solutions
- Advanced features and tips

---

# 1️⃣ SALES PULSE TILE

## Overview

**Purpose**: Real-time visibility into revenue, order volume, product performance, and fulfillment status.

**Data Sources**: 
- Shopify Orders API
- Shopify Products API
- Shopify Fulfillment API

**Update Frequency**: Every 5 minutes

---

## What You See

### Section 1: Total Revenue
```
$12,458.50
24 orders in the current window.
```

**Explanation**:
- **Top number** = Total revenue from all orders in selected time window
- **Order count** = Number of orders placed (not necessarily fulfilled)
- **Currency** = Automatically matches your Shopify store currency

### Section 2: Top SKUs
```
Top SKUs
• Red Widget — 15 units ($2,247.75)
• Blue Gadget — 8 units ($1,599.92)
• Green Tool — 12 units ($1,800.00)
```

**Explanation**:
- **Product title** = As configured in Shopify
- **Units sold** = Quantity across all orders in window
- **Revenue** = Total revenue for this product (units × price)
- **Sorted by** = Revenue (highest first)
- **Limit** = Shows top 3-5 products (configurable)

### Section 3: Open Fulfillment
```
Open fulfillment
• Order #1234 — unfulfilled
• Order #1235 — partially fulfilled
```

OR

```
No fulfillment blockers detected.
```

**Explanation**:
- **Order number** = Shopify order ID (clickable link)
- **Status** = Unfulfilled, partially fulfilled, or on hold
- **Only shows orders** with issues (not all open orders)

---

## How to Interpret

### Revenue Benchmarks
| Time Window | Good | Warning | Critical |
|------------|------|---------|----------|
| Today (EOD) | On track vs. daily target | 10-20% below | >20% below |
| This Week | On track vs. weekly target | 10-20% below | >20% below |
| This Month | On track vs. monthly target | >15% below | >25% below |

**Action**: If revenue is in "Warning" or "Critical", investigate:
1. Is traffic down? (Check SEO Content tile)
2. Is conversion rate lower? (Check analytics)
3. Are top products out of stock? (Check Inventory Heatmap)

### Order Volume Patterns
| Pattern | Interpretation | Action |
|---------|---------------|--------|
| High orders, low revenue | Selling mostly low-value items | Review pricing or upsell strategy |
| Low orders, high revenue | Selling high-ticket items | Good, but monitor conversion funnel |
| Orders dropping vs. yesterday | Traffic or conversion issue | Investigate traffic sources |
| Orders spiking unexpectedly | Promotion working OR data error | Verify data is accurate |

### Top SKUs Changes
| Scenario | What It Means | Action |
|----------|--------------|--------|
| Same top 3 as yesterday | Stable demand | Continue current strategy |
| New SKU in top 3 | Emerging product or promotion | Consider featuring it more |
| Former best-seller dropped out | Demand shift or stockout | Investigate why |
| Only 1 SKU selling | Inventory issue or narrow focus | Check if others are in stock |

---

## When to Take Action

### ✅ Everything Good (No Action Needed)
- Revenue on track for target
- Order volume consistent with recent average
- Top SKUs are expected products
- No fulfillment blockers

**What to do**: Quick glance, move on. Maybe check again in afternoon.

---

### ⚠️ Minor Issues (Investigate Within 2-4 Hours)
- Revenue 10-15% below target
- Order volume down slightly vs. yesterday
- New unexpected SKU in top 3
- 1-2 orders with fulfillment issues

**What to do**:
1. Click "View details" to see more order data
2. Check if issue is temporary (morning vs. afternoon variance)
3. Review recent changes (pricing, promotions, inventory)
4. Monitor for next few hours to see if self-corrects

---

### 🚨 Critical Issues (Immediate Action Required)
- Revenue >20% below target
- Order volume dropped >30% vs. yesterday
- Best-selling SKU missing from top 3
- 5+ orders with fulfillment issues
- Fulfillment issues >24 hours old

**What to do**:
1. **Revenue crisis**: Escalate to marketing/ops lead immediately
2. **Order drop**: Check site status, payment processor, traffic sources
3. **SKU missing**: Check Inventory Heatmap for stockout
4. **Fulfillment crisis**: Contact warehouse/fulfillment team NOW

---

## Advanced Features

### 1. View Details Modal
Click "View details" to open expanded view:
- **All orders** in time window (not just top SKUs)
- **Order details** including customer, items, total
- **Fulfillment status** for each order
- **Payment status** (paid, pending, refunded)

**Use case**: When you need to drill into specific orders or identify patterns.

### 2. Time Window Selector
Change from "Today" to:
- **Yesterday** - Compare to previous day
- **This Week** - Monday-Sunday view
- **Last 7 Days** - Rolling week
- **Last 30 Days** - Monthly view

**Use case**: Spotting weekly or monthly trends vs. daily variance.

### 3. Currency Conversion
If you sell in multiple currencies:
- **Auto-convert** to your base currency
- **Toggle** to see original currencies
- **Exchange rates** updated daily

**Use case**: Multi-currency stores needing unified view.

---

## Common Scenarios & Solutions

### Scenario 1: Revenue Looks Low But It's Only 10 AM
**Problem**: Dashboard shows $500 revenue when daily target is $10,000.

**Solution**: 
- Check time window - make sure it's "Today"
- Revenue accumulates throughout the day
- Compare to same time yesterday
- Don't panic until 3-4 PM if revenue is tracking normally

**Best practice**: Set hourly benchmarks (e.g., should have $2K by noon).

---

### Scenario 2: Top SKU Changed Overnight
**Problem**: Yesterday's best-seller isn't in top 3 today.

**Solution**:
1. Check Inventory Heatmap - is it out of stock?
2. Review recent price changes
3. Check if there's a new promotion on another product
4. Look at 7-day view to see if it's a trend or one-day variance

**Best practice**: Track top SKUs weekly, not daily, to spot real trends.

---

### Scenario 3: "No Fulfillment Blockers" But Orders Aren't Shipping
**Problem**: Tile says all good, but you know orders are delayed.

**Solution**:
1. The tile only shows *unfulfilled* or *on hold* orders
2. Orders "fulfilled" in Shopify but stuck at warehouse won't show here
3. Check Fulfillment Health tile for more detail
4. May need to audit Shopify order status accuracy

**Best practice**: This tile catches Shopify status issues, not real-world logistics delays.

---

### Scenario 4: Order Count Spiked But Revenue Didn't
**Problem**: 50 orders but only $1,000 revenue (normally 20 orders = $2,000).

**Solution**:
1. Check Top SKUs - are you selling mostly low-value items today?
2. Could be promotion attracting deal-seekers
3. Could be wholesale or test orders
4. Verify data accuracy - sometimes bots create fake orders

**Best practice**: Monitor both metrics - volume AND revenue.

---

## Key Metrics Glossary

| Term | Definition | Notes |
|------|-----------|-------|
| **Total Revenue** | Sum of all order totals in window | Includes tax and shipping |
| **Order Count** | Number of orders placed | Includes cancelled orders |
| **Top SKUs** | Best-selling products by revenue | Not by units sold |
| **Units Sold** | Quantity of a product sold | Across all orders |
| **Unfulfilled** | Order created but not shipped | Needs warehouse action |
| **Partially Fulfilled** | Some items shipped, others pending | Split shipment |
| **On Hold** | Order flagged for review | Usually fraud or payment issue |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Shift + S` | Focus Sales Pulse tile |
| `V` | Open "View details" modal (when focused) |
| `T` | Open time window selector |
| `Esc` | Close modal |
| `R` | Refresh tile data |

---

## Troubleshooting

### Problem: Tile shows "No data available"
**Cause**: Shopify API connection issue or no orders in window.

**Solution**:
1. Check if Shopify integration is connected (Settings → Integrations)
2. Try a longer time window (7 days instead of Today)
3. If still no data, contact support

---

### Problem: Revenue doesn't match Shopify admin
**Cause**: Time zone difference or refunds not yet reflected.

**Solution**:
1. Check time zone in Settings - must match Shopify
2. Refunds may take 5-10 minutes to sync
3. HotDash shows *net* revenue (after refunds), Shopify shows gross

---

### Problem: Top SKUs list is empty
**Cause**: No products sold in time window, or variants not rolled up.

**Solution**:
1. Expand time window
2. Check if products are tracked properly in Shopify
3. Verify SKUs are set in Shopify product variants

---

# 2️⃣ CX ESCALATIONS TILE

## Overview

**Purpose**: Track customer support conversations that have breached SLA or need attention.

**Data Sources**:
- Chatwoot Conversations API
- Internal SLA tracking system

**Update Frequency**: Every 2 minutes

---

## What You See

### With Escalations
```
• Sarah Johnson - open • SLA breached [Review]
• Mike Chen - pending [Review]
• Lisa Rodriguez - open • SLA breached [Review]
```

**Explanation**:
- **Customer name** = From Chatwoot conversation
- **Status** = open, pending, resolved
- **SLA indicator** = Shows "SLA breached" if over threshold
- **Review button** = Opens conversation modal

### Without Escalations
```
No SLA breaches detected.
```

**Explanation**: All conversations are within SLA targets. Green light!

---

## How to Interpret

### SLA Thresholds
| Priority | First Response | Resolution | Definition |
|----------|---------------|------------|------------|
| **Urgent** | 15 min | 4 hours | Threats, legal, system down |
| **High** | 1 hour | 24 hours | Refunds, damaged items, complaints |
| **Medium** | 4 hours | 48 hours | General questions, order status |
| **Low** | 24 hours | 72 hours | Feature requests, feedback |

**Note**: These are defaults. Your org may have custom SLA targets.

---

### Conversation Status Meanings
| Status | What It Means | Action Needed |
|--------|--------------|---------------|
| **Open** | Customer waiting for response | Respond ASAP |
| **Pending** | Waiting for customer reply | Monitor, may auto-close after 48h |
| **Resolved** | Closed by operator | Should not appear on tile (unless SLA breached before resolution) |
| **Snoozed** | Temporarily hidden | Will reappear when snooze expires |

---

## When to Take Action

### ✅ No Escalations (No Action)
**What you see**: "No SLA breaches detected."

**What it means**: Support team is on top of all conversations.

**What to do**: Nothing! Pat your team on the back.

---

### ⚠️ 1-2 Escalations (Review Within 15 Minutes)
**What you see**: 1-2 conversations with SLA breach indicators.

**What to do**:
1. Click "Review" to see conversation history
2. Check if operator is already working on it
3. If not assigned, assign to available operator
4. If complex, escalate to senior support

**Don't panic**: Occasional breaches happen during busy periods.

---

### 🚨 3+ Escalations (Immediate Action)
**What you see**: Multiple SLA breaches, especially with "Urgent" priority.

**What to do**:
1. **Check staffing**: Are enough operators online?
2. **Triage**: Respond to Urgent first, then High
3. **Escalate**: Contact support manager immediately
4. **Communicate**: Update customers with estimated response time

**This is critical**: Multiple breaches = support team overwhelmed.

---

## Advanced Features

### 1. Review Modal
Click "Review" to open conversation modal:
- **Full conversation thread** with timestamps
- **Customer information** (email, order history, location)
- **Source documents** (if AI-assisted response was prepared)
- **Action buttons**: Reply, Escalate, Close, Snooze

**Use case**: Getting full context before responding.

### 2. Bulk Actions
Select multiple conversations to:
- **Assign to operator** (load balancing)
- **Change priority** (if incorrectly categorized)
- **Snooze all** (during planned maintenance)

**Use case**: Managing multiple conversations efficiently.

### 3. SLA History
View SLA performance over time:
- **Breach rate** (% of conversations that breached)
- **Average response time** (mean time to first response)
- **P90 response time** (90th percentile)

**Use case**: Identifying trends and staffing needs.

---

## Common Scenarios & Solutions

### Scenario 1: Customer Appears Multiple Times
**Problem**: Same customer (Sarah Johnson) has 3 conversations in escalation list.

**Solution**:
1. Click "Review" on first conversation
2. Check if they're separate issues or related
3. If related, merge conversations in Chatwoot
4. If separate, prioritize the most urgent

**Best practice**: Customers with multiple escalations are likely very frustrated. Handle with extra care.

---

### Scenario 2: SLA Breached But Customer Already Responded To
**Problem**: Tile shows SLA breach, but operator already replied.

**Solution**:
- There's a 2-minute sync delay
- Refresh the tile (R key) to get latest data
- If still showing after 5 minutes, it's a true breach (reply took too long)

**Best practice**: Don't blame the tool - it's accurate. Focus on faster responses.

---

### Scenario 3: "No SLA Breaches" But Customers Are Complaining
**Problem**: Tile says all good, but customers are tweeting about slow support.

**Solution**:
1. Check if conversations are properly tagged in Chatwoot
2. Verify SLA thresholds are set correctly (not too lenient)
3. Customer expectations may be higher than your SLA targets
4. Consider tightening SLA thresholds

**Best practice**: SLAs should match customer expectations, not just internal goals.

---

### Scenario 4: Too Many Escalations to Handle
**Problem**: 10+ conversations breached, team is overwhelmed.

**Solution**:
1. **Triage immediately**: Focus on Urgent and High priority
2. **Send holding responses**: "We're experiencing high volume, will respond within X hours"
3. **Bring in backup**: Call in part-time operators or managers
4. **Communicate**: Post status update on social media/website
5. **Post-mortem**: After resolved, analyze why it happened and prevent next time

**Best practice**: Have a "SLA crisis" playbook ready for these situations.

---

## Key Metrics Glossary

| Term | Definition | Notes |
|------|-----------|-------|
| **SLA Breach** | Conversation exceeded response/resolution target | Tracked separately for first response vs. resolution |
| **First Response** | Time from customer's first message to operator's first reply | Most critical metric |
| **Resolution Time** | Time from first message to conversation closed | Less critical than response time |
| **Priority** | Urgency level assigned to conversation | Can be manual or auto-assigned |
| **Conversation Status** | Current state of the conversation | Open, Pending, Resolved, Snoozed |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Shift + C` | Focus CX Escalations tile |
| `R` | Open "Review" modal for first conversation (when focused) |
| `↓ / ↑` | Navigate between conversations |
| `Enter` | Open selected conversation |
| `Esc` | Close modal |

---

## Troubleshooting

### Problem: Tile shows "Unable to load escalations"
**Cause**: Chatwoot API connection issue.

**Solution**:
1. Check Chatwoot integration status (Settings → Integrations)
2. Verify API token is valid
3. If integration shows "Connected", try refreshing tile
4. Contact support if issue persists >5 minutes

---

### Problem: SLA breach count doesn't match Chatwoot
**Cause**: Different SLA thresholds in HotDash vs. Chatwoot, or time zone difference.

**Solution**:
1. Verify SLA thresholds in Settings → CX Escalations
2. Ensure time zones match between systems
3. HotDash may have stricter thresholds than Chatwoot defaults

---

# 3️⃣ FULFILLMENT HEALTH TILE

## Overview

**Purpose**: Monitor orders that aren't fulfilling on schedule.

**Data Sources**:
- Shopify Orders API
- Shopify Fulfillment API

**Update Frequency**: Every 5 minutes

---

## What You See

### With Issues
```
• Order #1234 - unfulfilled (since Oct 11, 9:15 AM)
• Order #1235 - partially fulfilled (since Oct 10, 2:30 PM)
```

**Explanation**:
- **Order number** = Clickable link to Shopify order
- **Status** = unfulfilled, partially fulfilled, on hold
- **Timestamp** = When order entered this status

### Without Issues
```
All recent orders are on track.
```

**Explanation**: All orders are fulfilled or scheduled to fulfill soon.

---

## How to Interpret

### Fulfillment Timing Benchmarks
| Order Placed | Target Fulfillment | Warning | Critical |
|--------------|-------------------|---------|----------|
| Standard shipping | Within 24 hours | >24h | >48h |
| Express shipping | Within 4 hours | >4h | >8h |
| Next-day | Within 2 hours | >2h | >4h |

**Note**: Adjust based on your fulfillment SLAs and shipping carriers.

---

### Status Meanings
| Status | What It Means | Typical Cause |
|--------|--------------|---------------|
| **Unfulfilled** | No shipping label created, no items packed | Inventory issue, warehouse backlog, or needs review |
| **Partially Fulfilled** | Some items shipped, others pending | Split shipment or partial stockout |
| **On Hold** | Order flagged for manual review | Fraud check, payment issue, address verification needed |

---

## When to Take Action

### ✅ No Issues (No Action)
**What you see**: "All recent orders are on track."

**What to do**: Quick glance, move on. Your fulfillment is running smoothly.

---

### ⚠️ 1-3 Orders Stuck <24 Hours (Monitor)
**What you see**: A few orders unfulfilled, but <24 hours old.

**What to do**:
1. Check if they're within your fulfillment SLA
2. If Express/Next-day, escalate immediately
3. If Standard, monitor and check again in 4 hours

**Don't panic**: Some delay is normal, especially for complex orders.

---

### 🚨 Multiple Orders >24 Hours OR Express Orders >4 Hours (Urgent)
**What you see**: Several orders stuck for extended period, or Express orders delayed.

**What to do**:
1. **Click order number** to view in Shopify
2. **Check inventory** - Are items actually in stock?
3. **Contact warehouse** - Are they backed up?
4. **Notify customers** - Set expectations for delay
5. **Offer expedited shipping** or partial refund for inconvenience

**This is critical**: Delayed fulfillment = angry customers + bad reviews.

---

## Advanced Features

### 1. Filter by Status
Toggle to show only:
- **Unfulfilled** (not started)
- **Partially Fulfilled** (in progress)
- **On Hold** (needs review)

**Use case**: Focusing on specific issue types.

### 2. Sort by Age
Sort orders by:
- **Oldest first** (default - most urgent)
- **Newest first** (least urgent)
- **Order value** (high-value orders first)

**Use case**: Prioritizing which orders to address first.

### 3. Bulk Actions
Select multiple orders to:
- **Print packing slips** (if you have fulfillment app)
- **Mark as urgent** (flag for warehouse)
- **Send delay notification** (to customers)

**Use case**: Handling multiple delayed orders efficiently.

---

## Common Scenarios & Solutions

### Scenario 1: Order Stuck as "Unfulfilled" for 36 Hours
**Problem**: Order #1234 placed yesterday morning, still unfulfilled.

**Solution**:
1. **Click order in Shopify** to see details
2. **Check inventory** for each line item
   - If out of stock: Contact supplier, notify customer
   - If in stock: Contact warehouse - why isn't it fulfilled?
3. **Possible causes**:
   - Inventory system out of sync
   - Warehouse backlog (check overall volume)
   - Shipping address needs verification
   - Payment authorization expired

**Best practice**: Any Standard order >24h unfulfilled needs investigation.

---

### Scenario 2: "Partially Fulfilled" with No Timeline for Rest
**Problem**: Order #1235 - 2 items shipped, 1 item pending for 3 days.

**Solution**:
1. **Check pending item** - Is it backordered?
2. **Contact customer**: Offer options
   - **Option A**: Wait for full order (+ discount for inconvenience)
   - **Option B**: Partial refund for missing item
   - **Option C**: Replace with similar item
3. **Update order notes** in Shopify with customer's choice

**Best practice**: Don't let partial orders linger >48h without customer communication.

---

### Scenario 3: "On Hold" Orders Piling Up
**Problem**: 5-7 orders on hold, not moving.

**Solution**:
1. **Review hold reasons** in Shopify (usually under "Timeline")
2. **Common causes**:
   - **Fraud alert** - Review order for red flags
   - **Payment issue** - Contact customer to update card
   - **Address invalid** - Request corrected address
3. **Process or cancel** within 24-48h (don't leave in limbo)

**Best practice**: "On hold" should be temporary status, not permanent.

---

### Scenario 4: All Orders Delayed Due to Warehouse Issue
**Problem**: 20+ orders unfulfilled, warehouse had power outage.

**Solution**:
1. **Triage**: Identify Express/Next-day orders - prioritize these
2. **Communicate**:
   - Send bulk email to all affected customers
   - Offer apology + 15-20% discount or free shipping
   - Set realistic expectations ("will ship within 48h")
3. **Update website** with banner: "Slight delay in fulfillment due to [issue]"
4. **Work with warehouse** to process ASAP
5. **Post-mortem**: How to prevent/handle better next time?

**Best practice**: Transparency + compensation = customers more likely to forgive delays.

---

## Key Metrics Glossary

| Term | Definition | Notes |
|------|-----------|-------|
| **Unfulfilled** | Order created but no fulfillment started | Needs action |
| **Partially Fulfilled** | Some items shipped, others pending | May be intentional split shipment |
| **On Hold** | Order requires manual review before fulfillment | Usually fraud/payment/address issue |
| **Fulfillment Lag** | Time from order placement to fulfillment | Target: <24h for Standard |
| **Fulfillment Rate** | % of orders fulfilled within SLA | Target: >95% |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Shift + F` | Focus Fulfillment Health tile |
| `Enter` | Open first order in Shopify (when focused) |
| `↓ / ↑` | Navigate between orders |
| `Ctrl + Click` | Open order in new tab |
| `R` | Refresh tile data |

---

## Troubleshooting

### Problem: Orders showing here that were already fulfilled
**Cause**: Shopify API sync delay (usually 5-10 minutes).

**Solution**:
1. Wait 10 minutes and refresh
2. Verify order is marked "Fulfilled" in Shopify admin
3. If still showing after 20 min, contact support

---

### Problem: Tile shows "All on track" but warehouse says they're behind
**Cause**: Shopify order status doesn't reflect real-world warehouse status.

**Solution**:
- This tile shows Shopify *system* status
- If warehouse is behind but orders are marked "Fulfilled" in Shopify, they won't appear here
- May need separate warehouse tracking system
- Consider using Shopify fulfillment app that syncs with warehouse in real-time

---

# 4️⃣ INVENTORY HEATMAP TILE

## Overview

**Purpose**: Proactive alerts for low stock before you run out.

**Data Sources**:
- Shopify Inventory API
- Internal sales velocity calculations

**Update Frequency**: Every 15 minutes

---

## What You See

### With Alerts
```
• Red Widget: 12 left • 3 days of cover
• Blue Gadget: 5 left • 2 days of cover
• Green Tool: 8 left • 4 days of cover
```

**Explanation**:
- **Product name** = Shopify product title
- **Quantity available** = Current stock on hand
- **Days of cover** = At current sales velocity, how many days until stockout

### Without Alerts
```
No low stock alerts right now.
```

**Explanation**: All products have sufficient inventory.

---

## How to Interpret

### Days of Cover Thresholds
| Days of Cover | Status | Action |
|--------------|--------|--------|
| **>14 days** | Healthy | No action needed |
| **7-14 days** | Monitor | Check if reorder is already placed |
| **3-7 days** | Warning | Reorder NOW |
| **<3 days** | Critical | Expedite shipment or pause sales |

---

### Alert Triggers
Products appear on this tile when:
- **AND**:
  - Days of cover <7 days
  - Product has sold at least 1 unit in last 30 days
  - Product is "Active" in Shopify

**Why these criteria?** 
- Prevents alerts for discontinued products
- Focuses on actively selling items
- Gives reasonable lead time to reorder

---

## When to Take Action

### ✅ No Alerts (No Action)
**What you see**: "No low stock alerts right now."

**What to do**: Nothing! Your inventory is healthy.

**Best practice**: Still review your best-sellers weekly to ensure they stay well-stocked.

---

### ⚠️ 7-14 Days of Cover (Check Reorder Status)
**What you see**: Product with 7-14 days remaining.

**What to do**:
1. Check if reorder PO already exists
2. Verify expected delivery date
3. If no PO, place order today

**Don't panic**: You have time, but don't delay.

---

### 🚨 <7 Days of Cover (Immediate Action)
**What you see**: Product with <7 days, especially <3 days.

**What to do**:
1. **Place emergency order** - Expedited shipping if possible
2. **Check if similar products** can substitute
3. **Notify sales/marketing** to throttle promotions for this SKU
4. **Prepare "low stock" or "sold out" messaging** for product page

**This is urgent**: Risk of losing sales if you stock out.

---

### 🆘 <2 Days of Cover (Crisis Mode)
**What you see**: Best-seller with <2 days remaining.

**What to do**:
1. **Pause paid ads** for this product immediately
2. **Hide from homepage** or featured collections
3. **Add "low stock" badge** to product page
4. **Contact supplier** - Can they air-ship emergency stock?
5. **Prepare waitlist** for when it sells out
6. **Consider pre-orders** if restock date is known

**This is critical**: You're about to lose sales. Minimize exposure until restock.

---

## Advanced Features

### 1. Sales Velocity Calculator
Click on product alert to see:
- **Daily sales rate** (averaged over last 7, 14, and 30 days)
- **Trend direction** (accelerating, stable, declining)
- **Seasonal factor** (if applicable)

**Use case**: Understanding if low stock is due to sudden spike or steady drain.

### 2. Reorder Recommendations
For each alert, see:
- **Suggested reorder quantity** (based on lead time + safety stock)
- **Estimated restock date** (if PO exists)
- **Supplier contact** (if configured)

**Use case**: One-click access to reorder info.

### 3. Stock Reservation
If you use pre-orders or reservations:
- **Reserved quantity** shown separately from available
- **Days of cover** calculated on available (not reserved)

**Use case**: Prevents overselling pre-orders.

---

## Common Scenarios & Solutions

### Scenario 1: Best-Seller at 2 Days of Cover
**Problem**: Your #1 product has only 2 days of inventory left.

**Solution**:
1. **Immediate reorder** - Contact supplier NOW
2. **Expedited shipping** - Worth the extra cost to avoid stockout
3. **Marketing pause** - Stop promoting until restock arrives
4. **Customer communication** - If it sells out, send "back in stock" notification when it arrives

**Best practice**: Keep 30-60 days of inventory for best-sellers to avoid this crisis.

---

### Scenario 2: Days of Cover Calculation Seems Wrong
**Problem**: Product shows "3 days" but you know you have enough for a week.

**Solution**:
- Check recent sales velocity - Did you just have a spike?
- Calculation is based on **recent** sales (last 7-30 days)
- If there was a promotion or viral post, velocity might be temporarily inflated
- **Manual override**: You can adjust the calculation window in Settings

**Best practice**: Trust the data, but verify with your own knowledge of sales patterns.

---

### Scenario 3: Product Has Low Stock But Isn't Selling
**Problem**: Alert for "Green Tool: 5 left • 7 days" but it's barely selling.

**Solution**:
- This shouldn't trigger an alert if sales velocity is low
- Check Settings → Inventory Alerts → Minimum sales threshold
- Increase threshold so only actively selling products trigger alerts
- Or manually dismiss this alert if it's a one-time issue

**Best practice**: Tune alert thresholds to match your business (high-volume vs. boutique).

---

### Scenario 4: Inventory Says 20 Units But Shopify Says 5
**Problem**: HotDash shows more inventory than Shopify admin.

**Solution**:
- Check if inventory is spread across multiple locations
- HotDash may be showing **total** inventory, Shopify may show **available** at specific location
- Verify Settings → Inventory → Location filter
- If still mismatched, there may be a sync issue - contact support

**Best practice**: Ensure location settings match between HotDash and Shopify.

---

## Key Metrics Glossary

| Term | Definition | Notes |
|------|-----------|-------|
| **Quantity Available** | Current stock on hand | Excludes reserved/committed inventory |
| **Days of Cover** | Days until stockout at current sales velocity | Based on recent sales (default: 30 days) |
| **Sales Velocity** | Average daily units sold | Calculated over configurable window |
| **Safety Stock** | Buffer inventory to prevent stockouts | Recommended: 7-14 days of cover |
| **Lead Time** | Days from PO placement to stock arrival | Used in reorder recommendations |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Shift + I` | Focus Inventory Heatmap tile |
| `Enter` | Open first product details (when focused) |
| `↓ / ↑` | Navigate between products |
| `D` | Dismiss alert (remove from tile) |
| `R` | Refresh tile data |

---

## Troubleshooting

### Problem: Product not showing alert despite low stock
**Cause**: Sales velocity too low (didn't sell in last 30 days), or product is inactive.

**Solution**:
1. Check Settings → Inventory Alerts → Minimum sales threshold
2. Lower threshold if you want alerts for slower-moving products
3. Verify product is "Active" in Shopify

---

### Problem: Days of cover shows "—" (dash)
**Cause**: No sales history to calculate velocity.

**Solution**:
- Product is new or hasn't sold recently
- HotDash can't predict stockout date without sales data
- Monitor quantity manually until sales history builds

---

# 5️⃣ SEO CONTENT TILE

## Overview

**Purpose**: Monitor landing page traffic and detect anomalies (unexpected drops).

**Data Sources**:
- Google Analytics 4 API

**Update Frequency**: Hourly (GA data has 24-48h delay for accuracy)

---

## What You See

### With Traffic
```
• /products/red-widget - 1,245 sessions (+15.3% WoW)
• /collections/sale - 892 sessions (-8.2% WoW) • attention
• /products/blue-gadget - 654 sessions (+2.1% WoW)
```

**Explanation**:
- **Landing page URL** = Page where users first landed on your site
- **Sessions** = Number of sessions that started on this page
- **WoW (Week-over-Week) change** = % change vs. same day last week
- **"Attention" flag** = Significant negative change (usually >15-20% drop)

### Without Traffic (or Stable)
```
Traffic trends stable.
```

**Explanation**: No significant anomalies detected. Traffic is normal.

---

## How to Interpret

### Week-over-Week (WoW) Thresholds
| WoW Change | Status | Action |
|-----------|--------|--------|
| **>+20%** | Great | Investigate what's working, amplify it |
| **+5% to +20%** | Good | Keep doing what you're doing |
| **-5% to +5%** | Stable | Normal variance, no action |
| **-5% to -15%** | Monitor | Check if it's a trend over multiple days |
| **<-15%** | Attention | Investigate immediately (shown with flag) |

---

### Common Causes of Traffic Drops
| Drop % | Likely Cause | Action |
|--------|-------------|--------|
| **-80% to -100%** | Page is down or deindexed | Check site status, Google Search Console |
| **-40% to -80%** | Major SEO penalty or algo change | Review recent site changes, check GSC |
| **-20% to -40%** | Lost backlinks or competitor surge | Competitive analysis, backlink audit |
| **-10% to -20%** | Seasonal variance or normal fluctuation | Monitor for 3-7 days before acting |

---

## When to Take Action

### ✅ Traffic Stable (No Action)
**What you see**: "Traffic trends stable" or all positive WoW changes.

**What to do**: Nothing! Your SEO strategy is working.

---

### ⚠️ One Page with -10% to -20% Drop (Monitor)
**What you see**: Single page with moderate decline.

**What to do**:
1. Check if drop persists for 3+ days
2. Review recent changes to that page (content, title, meta)
3. Check Google Search Console for that URL - any crawl errors or manual penalties?
4. Compare to competitors - Are they ranking higher now?

**Don't panic**: Single-page drops can be normal variance.

---

### 🚨 Multiple Pages with Attention Flags OR Single Page >30% Drop (Urgent)
**What you see**: Several pages with significant drops, or one critical page down >30%.

**What to do**:
1. **Check site status** - Is the site/page down? Use uptime monitor or try loading page
2. **Google Search Console** - Any manual actions, security issues, or crawl errors?
3. **Recent changes** - Did you update content, change URLs, or migrate servers?
4. **Algorithm update** - Check SEO news (e.g., Moz, Search Engine Land) for Google updates
5. **Competitors** - Did a competitor launch similar content or outrank you?

**This is critical**: Significant organic traffic loss = revenue loss.

---

## Advanced Features

### 1. Detailed Page Report
Click on page to see:
- **7-day trend** (not just WoW snapshot)
- **Top keywords** driving traffic to this page
- **Bounce rate** and **conversion rate** (if configured)
- **Comparison to other pages** in same category

**Use case**: Understanding why traffic changed.

### 2. Traffic Attribution
See traffic source breakdown:
- **Organic search** (Google, Bing, etc.)
- **Direct** (typed URL or bookmark)
- **Referral** (from other sites)
- **Social** (Facebook, Instagram, etc.)

**Use case**: Determining if drop is SEO-specific or broader.

### 3. Anomaly Sensitivity
Adjust what triggers "attention" flag:
- **Sensitive** (>10% drop)
- **Moderate** (>20% drop) - Default
- **Conservative** (>30% drop)

**Use case**: Tuning alerts to match your business volatility.

---

## Common Scenarios & Solutions

### Scenario 1: Top Landing Page Dropped 50% Overnight
**Problem**: Your #1 traffic page went from 2,000 sessions/day to 1,000.

**Solution**:
1. **Is the page down?** Load it in incognito browser
2. **Google Search Console** - Check coverage report for this URL
   - Deindexed? Submit for recrawl
   - Manual penalty? Review and fix issue
3. **Recent changes?**
   - Changed title/meta? Revert if rankings dropped
   - Removed content? Restore important keywords
   - Redirected URL? Ensure 301 redirect is correct
4. **Algorithm update?** Check if Google pushed an update this week

**Best practice**: Top pages should be monitored daily, not just weekly.

---

### Scenario 2: All Pages Down by 5-10%
**Problem**: Every page has slight decline, no specific page stands out.

**Solution**:
- This suggests **site-wide** issue, not page-specific
- Possible causes:
  1. **Google algorithm update** - Check SEO news
  2. **Technical issue** - Slow site speed, mobile usability
  3. **Competitor surge** - New competitor ranking for your keywords
  4. **Seasonal dip** - Compare to same time last year
- **Action**: Comprehensive site audit (speed, mobile, content quality)

**Best practice**: Site-wide drops require holistic fixes, not page-by-page tweaks.

---

### Scenario 3: New Page Has High Traffic But Low Conversion
**Problem**: /products/new-item is getting 1,500 sessions but few sales.

**Solution**:
- Traffic alone doesn't mean success
- Click page to see **bounce rate** and **conversion rate**
- High bounce? Page content doesn't match search intent
- Low conversion? Price, reviews, or CTA needs improvement
- **Action**: Optimize page for conversion, not just traffic

**Best practice**: Prioritize pages with high traffic AND high potential (not just traffic volume).

---

### Scenario 4: "Traffic Trends Stable" But Revenue Is Down
**Problem**: SEO tile says all good, but sales are declining.

**Solution**:
- This tile shows **traffic**, not **revenue**
- Traffic can be stable while conversion rate drops
- Check Sales Pulse tile for revenue metrics
- Possible causes:
  1. Traffic quality declined (wrong keywords attracting non-buyers)
  2. Product pages aren't converting (price, reviews, trust issues)
  3. Competitors have better prices/offers
- **Action**: Optimize for conversion, not just traffic

**Best practice**: SEO success = traffic × conversion rate × AOV.

---

## Key Metrics Glossary

| Term | Definition | Notes |
|------|-----------|-------|
| **Landing Page** | First page user visited in their session | Entry point to your site |
| **Sessions** | Number of visits that started on this page | One user can have multiple sessions |
| **WoW (Week-over-Week)** | % change vs. same day last week | Accounts for day-of-week variance |
| **Attention Flag** | Indicator for pages with significant drops | Usually >15-20% decline |
| **Bounce Rate** | % of sessions that viewed only this page | High bounce = low engagement |
| **Conversion Rate** | % of sessions that completed goal (purchase, signup) | Varies by page type |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Shift + E` | Focus SEO Content tile |
| `Enter` | Open first page details (when focused) |
| `↓ / ↑` | Navigate between pages |
| `Ctrl + Click` | Open page in new tab |
| `R` | Refresh tile data |

---

## Troubleshooting

### Problem: Tile shows "No data available"
**Cause**: Google Analytics not connected or no data in time window.

**Solution**:
1. Check Settings → Integrations → Google Analytics
2. Verify GA4 property ID is correct
3. Ensure GA4 has data for your site (24-48h delay for first time)
4. Try expanding time window to 7 or 30 days

---

### Problem: Traffic numbers don't match GA4 dashboard
**Cause**: Time zone difference, data sampling, or filter differences.

**Solution**:
- HotDash shows **landing page** sessions, GA4 may show total pageviews
- Ensure time zones match (Settings → General)
- HotDash excludes internal traffic (if configured), GA4 may not
- Small discrepancies (1-5%) are normal due to sampling

---

# 6️⃣ OPS METRICS TILE

## Overview

**Purpose**: Track team performance - shop activation rates and support response times.

**Data Sources**:
- Internal activation tracking
- Chatwoot conversation timestamps
- Shopify shop data

**Update Frequency**: Every 15 minutes (7-day rolling window)

---

## What You See

### With Data
```
Activation (7d)
82.5%
33 / 40 shops activated
Window Oct 5 - Oct 12

SLA Resolution (7d)
12.5 min
Median to first operator action
P90: 28.3 min
Sample size: 47
```

**Explanation**:

**Activation Section**:
- **Activation rate** = % of active shops that completed onboarding
- **Shops activated** = Number of shops that completed setup
- **Total active shops** = Total shops in activation window
- **Window dates** = 7-day rolling window

**SLA Resolution Section**:
- **Median minutes** = Median time from customer message to operator response
- **P90 minutes** = 90th percentile (slowest 10% took longer than this)
- **Sample size** = Number of escalated conversations resolved in window

### Without Data
```
Activation (7d)
No activation data yet.

SLA Resolution (7d)
No resolved breaches in window.
```

**Explanation**: Not enough data to calculate metrics.

---

## How to Interpret

### Activation Rate Benchmarks
| Rate | Status | Action |
|------|--------|--------|
| **>85%** | Excellent | Current onboarding is working well |
| **70-85%** | Good | Standard performance, minor optimization |
| **50-70%** | Warning | Investigate drop-off points in onboarding |
| **<50%** | Critical | Major onboarding issues, immediate fix needed |

---

### SLA Resolution Benchmarks
| Median Time | Status | Action |
|------------|--------|--------|
| **<10 min** | Excellent | Team is very responsive |
| **10-15 min** | Good | Meeting target SLA |
| **15-25 min** | Warning | Team may be stretched |
| **>25 min** | Critical | Need more operators or better tools |

**P90 Benchmark**: Aim for <30 min (means 90% of customers get response in <30 min)

---

## When to Take Action

### ✅ Both Metrics Green (No Action)
**What you see**: 
- Activation rate >80%
- Median response <15 min

**What to do**: Celebrate! Your team is performing well.

---

### ⚠️ One Metric in Warning Range (Investigate)
**What you see**:
- Activation rate 60-70% OR
- Median response 15-25 min

**What to do**:
1. **Activation warning**:
   - Review onboarding funnel - Where do shops drop off?
   - Check if recent product changes broke onboarding
   - Survey non-activated shops for feedback
2. **SLA warning**:
   - Check operator schedules - Are peak hours covered?
   - Review recent conversation volume trends
   - Consider temporary staffing increase

**Don't panic**: Single day dips are normal. Look for 3+ day trends.

---

### 🚨 Both Metrics Critical OR One Metric Critical for 3+ Days (Urgent)
**What you see**:
- Activation rate <50% OR
- Median response >25 min

**What to do**:
1. **Activation crisis**:
   - Halt new shop signups until issue is fixed
   - Emergency onboarding audit
   - Reach out to recent failed shops - Offer 1:1 help
2. **SLA crisis**:
   - Bring in backup operators immediately
   - Pause non-critical work (training, meetings)
   - Consider auto-responses to set expectations
   - Hire temporary support staff if needed

**This is critical**: Poor activation = churn, poor SLA = bad reviews.

---

## Advanced Features

### 1. Trend View
Click tile to see:
- **Daily breakdown** of activation rate (7-day trend)
- **Hourly breakdown** of SLA resolution (peak hours)
- **Comparison to previous week** (improving or declining?)

**Use case**: Understanding if metrics are trending up or down.

### 2. Shop Activation Funnel
Drill into activation metrics to see:
- **Step 1**: Shop created (100%)
- **Step 2**: Shopify connected (85%)
- **Step 3**: First order synced (70%)
- **Step 4**: Dashboard viewed (60%)
- **Step 5**: Fully activated (50%)

**Use case**: Identifying exact drop-off point in onboarding.

### 3. Operator Performance
(Manager view only):
- **Individual operator** response times
- **Conversation volume** by operator
- **Quality scores** (approval rate, customer satisfaction)

**Use case**: Coaching and load balancing.

---

## Common Scenarios & Solutions

### Scenario 1: Activation Rate Dropped from 85% to 60% This Week
**Problem**: Sudden decline in shop activation.

**Solution**:
1. **Recent changes?** Did you update onboarding flow, add new steps, or change UI?
2. **Technical issue?** Are shops getting error messages during setup?
3. **Seasonal?** Is this a typically slower period (holidays, industry events)?
4. **Sample size?** If only 10 shops this week vs. 100 last week, rate is less reliable
5. **Action**:
   - Revert recent changes if applicable
   - Contact non-activated shops for feedback
   - Offer 1:1 onboarding assistance

**Best practice**: Don't change onboarding without A/B testing first.

---

### Scenario 2: Median Response Time is Good But P90 is Terrible
**Problem**: Median 12 min (great!), P90 48 min (bad!).

**Solution**:
- This means most customers get fast response, but **10%** wait way too long
- Possible causes:
  1. Complex issues taking longer (good - appropriate)
  2. Off-hours gaps in coverage (bad - hire night shift)
  3. Some operators much slower than others (bad - training needed)
- **Action**: Review the slowest 10% of conversations
  - If they're complex, that's expected
  - If they're simple but delayed, it's a coverage or training issue

**Best practice**: P90 matters as much as median - don't ignore outliers.

---

### Scenario 3: "No Activation Data Yet" Despite Active Shops
**Problem**: Tile says no data, but you have 20 active shops.

**Solution**:
- Check Settings → Ops Metrics → Activation tracking
- Ensure activation criteria are configured
- May need to manually mark shops as "activated" until automated tracking kicks in
- Or, expand time window beyond 7 days to include historical data

**Best practice**: Define clear activation criteria (e.g., "First order synced" + "Dashboard viewed").

---

### Scenario 4: Both Metrics Look Great But Revenue Is Down
**Problem**: Activation and SLA metrics are green, but business is struggling.

**Solution**:
- These metrics measure **team efficiency**, not **business outcomes**
- You can have high activation but shops aren't growing revenue
- You can have fast SLA but not solving customer problems effectively
- **Action**: Add outcome metrics
  - Average revenue per activated shop
  - Customer satisfaction (CSAT) scores
  - Shop retention rate (6-month active %)

**Best practice**: Ops metrics should correlate with revenue, not replace it.

---

## Key Metrics Glossary

| Term | Definition | Notes |
|------|-----------|-------|
| **Activation Rate** | % of shops that completed onboarding | Denominator = shops in window |
| **Activated Shop** | Shop that met activation criteria | Criteria configurable (e.g., first order, dashboard viewed) |
| **Median Response Time** | Middle value of response times (50th percentile) | Less affected by outliers than average |
| **P90 Response Time** | 90th percentile - 90% of responses were faster | Shows worst-case experience for 10% of customers |
| **Sample Size** | Number of data points used in calculation | <30 = unreliable, >100 = very reliable |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Shift + O` | Focus Ops Metrics tile |
| `Enter` | Open detailed metrics view (when focused) |
| `T` | Toggle between 7-day and 30-day window |
| `R` | Refresh tile data |

---

## Troubleshooting

### Problem: Activation rate shows 0% despite shops being activated
**Cause**: Activation criteria not met or tracking not enabled.

**Solution**:
1. Check Settings → Ops Metrics → Activation tracking
2. Verify criteria (e.g., "First order synced" is marked as required)
3. Manually trigger activation for test shop to verify tracking works
4. May need to backfill historical data

---

### Problem: SLA resolution shows "No data" despite escalations
**Cause**: No escalations were **resolved** in the 7-day window (only opened).

**Solution**:
- This metric tracks **resolved** escalations, not open ones
- If escalations are still open, they won't appear here
- Expand to 30-day window to see historical resolutions
- Or check CX Escalations tile for currently open escalations

---

## 🎓 Summary

This Tile-by-Tile Reference Guide provides deep expertise on each HotDash tile:
- **Sales Pulse**: Revenue and product performance
- **CX Escalations**: Support SLA tracking
- **Fulfillment Health**: Order shipping status
- **Inventory Heatmap**: Proactive stock alerts
- **SEO Content**: Landing page traffic
- **Ops Metrics**: Team performance

**Use this guide** when you need to:
- Understand what a metric means
- Know when to take action
- Troubleshoot data discrepancies
- Train new operators on specific tiles

**For quick reference**, use the CEO Quick Start Guide.  
**For training**, use the Video Script.  
**For mastery**, use this Tile-by-Tile Reference.

---

**Document Path**: `docs/enablement/TILE_BY_TILE_REFERENCE_GUIDE.md`  
**Version**: 1.0  
**Last Updated**: October 12, 2025  
**Status**: Ready for operator training ✅
