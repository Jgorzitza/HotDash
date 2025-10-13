# CEO Demo Scenarios - Practice Exercises

**Purpose:** Hands-on scenarios for CEO training session  
**Format:** Real-world situations with guided solutions  
**Duration:** 6 minutes total (2 min per scenario)  
**Created:** 2025-10-13

---

## Using These Scenarios

**During Training:**
1. Present scenario to CEO
2. Ask: "What would you do?"
3. Guide through decision-making process
4. Show correct answer and reasoning
5. Practice navigation in actual dashboard

**Goal:** Build CEO confidence in decision-making

---

## Scenario 1: Sudden Sales Drop (2 minutes)

### Scenario Setup

**You open HotDash at 9 AM and see:**

**Sales Pulse Tile:**
- Today's Revenue: $1,200 (as of 9 AM)
- Yesterday Same Time: $3,500
- **65% decrease** 🔴

**Other Tiles:**
- CX Escalations: 0 (all clear)
- Fulfillment: 2 orders delayed (normal)
- Inventory: All good (no low stock)
- SEO Content: Traffic normal

**CEO Question:** "Revenue is way down. What do I investigate first?"

---

### Guided Solution

**Step 1: Don't Panic - Gather Context** (30 seconds)
```
Ask yourself:
- Is it just early in the day? (Yes - it's 9 AM, most sales happen afternoon)
- What day is it? (Check: Monday vs. Saturday patterns differ)
- Any known factors? (Marketing campaigns, holidays, seasonality)
```

**Step 2: Drill Into Sales Pulse** (30 seconds)
```
Click into Sales Pulse tile:
- Check: Order count (is it volume or order size?)
- Compare: Same day last week
- Look for: Patterns in top SKUs
```

**Step 3: Investigate Further** (30 seconds)
```
Hypothesis testing:
- If order count is normal but order size is low → Product mix changed
- If order count is low → Check traffic (SEO Content tile)
- If traffic is normal → Could be conversion issue or site problem
```

**Step 4: Take Action** (30 seconds)
```
Decision tree:
- Technical issue (site down/slow)? → Alert engineer immediately
- Traffic drop? → Check marketing campaigns, SEO rankings
- Conversion drop? → Test checkout process yourself
- Too early to tell? → Check again at noon, compare to full-day pattern
```

---

### Expert Answer

**What CEO Should Do:**

1. **Recognize it's 9 AM** - Most sales happen afternoon/evening
2. **Check again at noon** - 3-hour data is more reliable
3. **Compare to last Monday at noon** - Apples to apples
4. **If still down significantly at noon:**
   - Test site yourself (place test order)
   - Check email campaigns (were they sent?)
   - Review Google Analytics (traffic sources)
   - Contact marketing team if unexplained

**Key Learning:** "Don't react to incomplete data. Wait for more signal before raising alarms."

---

## Scenario 2: Multiple Customer Escalations - Systemic Issue (2 minutes)

### Scenario Setup

**You open HotDash and see:**

**CX Escalations Tile:**
- 7 escalations 🔴
- All breached SLA
- All with similar messages:
  - "Where is my tracking number?"
  - "Shipping confirmation but no tracking"
  - "Can't track my order"

**Other Tiles:**
- Sales Pulse: Normal
- Fulfillment: 12 orders "Awaiting shipment" (higher than usual)
- Inventory: All good
- SEO: Normal

**CEO Question:** "I have 7 angry customers. Do I respond to each one individually?"

---

### Guided Solution

**Step 1: Identify Pattern** (15 seconds)
```
Recognize this is NOT 7 individual issues.
This is ONE systemic issue affecting multiple customers.
```

**Step 2: Investigate Root Cause** (45 seconds)
```
Click into one escalation to understand details.
Notice: All orders shipped 2-3 days ago but no tracking updates.

Cross-reference with Fulfillment tile:
- 12 orders "Awaiting shipment" (backlog?)

Hypothesis: Shipping partner issue or fulfillment backup
```

**Step 3: Contact Fulfillment Team** (30 seconds)
```
Call/message warehouse manager:
"We have 7+ customers saying tracking isn't updating. Orders from 
2-3 days ago. What's happening with the shipping partner?"

Get answer: Either technical issue or partner delay
```

**Step 4: Communicate with Customers** (30 seconds)
```
Draft one holding response for all 7:
"We're aware tracking isn't updating. Investigating with our shipping 
partner. Your order did ship on [date]. We'll update you within 2 hours."

Assign to support team to send to all affected customers.
```

---

### Expert Answer

**What CEO Should Do:**

1. **Recognize pattern** - Systemic issue, not individual complaints
2. **Investigate root cause** - Contact fulfillment immediately
3. **Holding response** - Acknowledge issue, set expectation
4. **Follow up** - Resolve with shipping partner, update customers
5. **Prevent recurrence** - Add monitoring for tracking delays

**Key Learning:** "Multiple customers with same issue = systemic problem. Fix the root cause, don't treat symptoms."

---

## Scenario 3: Inventory Crisis - Top SKU Stockout Risk (2 minutes)

### Scenario Setup

**You open HotDash and see:**

**Inventory Heatmap:**
- SKU: "Holley 750 CFM Carburetor" 🔴
- Current Stock: 8 units
- Days of Cover: **1.5 days**
- Status: URGENT

**Sales Pulse shows:**
- This SKU is #1 top seller today
- Sold 12 units yesterday
- Selling 5-6 units per day average

**Other Context:**
- Supplier lead time: 7 days
- This is a high-margin product ($450 retail)
- No alternate suppliers for this exact model

**CEO Question:** "We're about to run out of our best-selling product. What do I do?"

---

### Guided Solution

**Step 1: Assess Urgency** (15 seconds)
```
Math check:
- 8 units in stock
- 5-6 per day sales rate
- 1.5 days = stockout likely within 36 hours

This is URGENT - P0 priority.
```

**Step 2: Immediate Actions** (60 seconds)
```
Call supplier NOW:
"We need emergency expedite on Holley 750 CFM. Currently have 8 units, 
selling 6/day. Can you ship overnight/2-day? We'll pay expedite fee."

Possible outcomes:
✅ Supplier can expedite (48-hour ship) → Problem solved
❌ Supplier can't expedite (7-day standard) → Need Plan B
```

**Step 3: Plan B - If Expedite Fails** (45 seconds)
```
Options:
1. Source from alternate distributor (call 2-3 distributors)
2. Pre-sell with "ships in 7 days" notice
3. Update product page: "Back in stock [date]"
4. Offer similar alternative products
5. Email customers on waitlist when stock arrives

Choose based on: customer urgency, profit margin, brand impact
```

---

### Expert Answer

**What CEO Should Do:**

1. **Call supplier immediately** - Ask for expedite (pay extra if needed)
2. **If expedite available** - Problem solved, pay the fee
3. **If no expedite** - Update product page TODAY: "Limited stock, ships [date]"
4. **Monitor daily** - Check inventory heatmap every morning until restocked
5. **Prevent recurrence** - Set reorder point at 7 days of cover (auto-reorder)

**Key Learning:** "High-margin top sellers deserve urgent attention. Pay for expedited shipping to avoid stockouts."

---

## Scenario Difficulty Progression

**Scenario 1 (Easy):** Recognize incomplete data, wait for more signal  
**Scenario 2 (Medium):** Identify systemic issue, coordinate response  
**Scenario 3 (Hard):** Urgent crisis, multiple options, cost/benefit decision

---

## CEO Practice Checklist

After completing all 3 scenarios, CEO should be able to:

- [ ] Identify when to wait vs. act immediately
- [ ] Recognize patterns (systemic vs. individual issues)
- [ ] Navigate dashboard to investigate details
- [ ] Know who to contact for different issues
- [ ] Make cost/benefit decisions under pressure
- [ ] Understand escalation criteria

---

## Facilitator Notes

**If CEO struggles:**
- Slow down, walk through step-by-step
- Ask guiding questions: "What information do you need?"
- Emphasize: "It's okay to ask for help"

**If CEO excels:**
- Add complexity: "What if supplier can't expedite AND no alternates?"
- Explore edge cases: "What if it's a weekend?"
- Discuss prevention: "How do we avoid this next time?"

**Time Management:**
- Spend 2 minutes per scenario
- If CEO wants more time, that's great (interest is good)
- If time is short, skip to Scenario 3 (most critical)

---

## Success Indicators

**CEO is Ready If:**
- ✅ Makes correct decision in 2/3 scenarios
- ✅ Asks clarifying questions (good instinct)
- ✅ Knows when to escalate vs. handle themselves
- ✅ Thinks through consequences before acting

**CEO Needs More Training If:**
- ⚠️ Panics or freezes when presented with scenarios
- ⚠️ Doesn't know who to contact for help
- ⚠️ Treats systemic issues as individual complaints
- ⚠️ Can't navigate dashboard independently

---

**Document Created:** 2025-10-13  
**Purpose:** Hands-on practice for CEO training  
**Duration:** 6 minutes (2 min per scenario)  
**Evidence Path:** docs/enablement/ceo_demo_scenarios.md

