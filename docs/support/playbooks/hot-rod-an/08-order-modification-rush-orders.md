---
epoch: 2025.10.E1
doc: docs/support/playbooks/hot-rod-an/08-order-modification-rush-orders.md
owner: support
customer: Hot Rod AN
category: order-management
last_reviewed: 2025-10-12
expires: 2026-01-12
tags: [rush-orders, race-weekends, expedited-shipping, order-modification]
---

# Order Modification & Rush Order Process

**Customer**: Hot Rod AN  
**Purpose**: Handle rush orders for race weekends and time-sensitive modifications  
**Target Audience**: Customer Support Operators (All Levels)  
**Created**: October 12, 2025  

---

## 🎯 Purpose & Scope

Hot Rod AN customers frequently need parts **urgently** for:
- **Race weekends** (drag strip, road course, oval track)
- **Car shows** and events
- **Break/fix situations** (broken part needs immediate replacement)
- **Customer vehicle down** (daily driver or business vehicle)

This playbook defines:
- ✅ How to identify and prioritize rush orders
- ✅ When to offer expedited shipping options
- ✅ Order modification procedures
- ✅ Communication best practices for time-sensitive orders
- ✅ What can and cannot be rushed

**Key Principle**: *Speed matters to our customers. Deliver urgency with accuracy.*

---

## 🏁 Race Weekend Rush Order Framework

### Understanding Race Weekend Urgency

**Customer Scenario**: *"I have a race this Saturday and my fuel line fitting cracked. I need it by Friday!"*

**Why This Matters**:
- Race entry fees are often $200-500+ (customer has financial stake)
- Towing costs to event are $100-300
- Hotel reservations are non-refundable
- Trophy/championship points at stake
- Customer's weekend plans depend on us

**Our Role**: Make it happen if physically possible, or provide alternatives immediately.

---

## 📋 Rush Order Decision Matrix

### Can We Make It Happen? (4-Question Assessment)

#### Question 1: Is the part in stock?

**Check Inventory**:
```
1. Look up part in inventory system
2. Verify "In Stock" status
3. Confirm quantity available (not just 1 left if they need multiple)
4. Check warehouse location (same-day ship location?)
```

- ✅ **In Stock** → Proceed to Question 2
- ❌ **Out of Stock** → Skip to "Out of Stock Solutions" section

---

#### Question 2: What is today's date/time vs event date?

**Calculate Timeline**:

| Today's Day | Event Day | Days Available | Shipping Option |
|-------------|-----------|----------------|-----------------|
| Monday | Saturday | 5 days | Standard ground likely OK |
| Tuesday | Saturday | 4 days | Standard ground likely OK |
| Wednesday | Saturday | 3 days | 2-day or overnight |
| Thursday | Saturday | 2 days | Overnight required |
| Friday | Saturday | 1 day | Overnight AM required |
| Friday 2pm+ | Saturday | <1 day | **Too late for most carriers** |

**Cutoff Times** (verify with current carrier schedules):
- **Overnight shipping**: Order by 3:00 PM EST (same-day ship)
- **2-Day shipping**: Order by 5:00 PM EST (same-day ship)
- **Saturday delivery**: Special carrier option, order by Thursday 5:00 PM EST

- ✅ **Enough time** → Proceed to Question 3
- ⚠️ **Tight timeline** → Discuss with customer, proceed to Question 3
- ❌ **Physically impossible** → Skip to "Can't Make It Solutions" section

---

#### Question 3: What carrier options are available to customer's location?

**Check Carrier Coverage**:
```
Overnight Options:
• FedEx Priority Overnight (10:30 AM delivery)
• FedEx Standard Overnight (3:00 PM delivery)
• UPS Next Day Air Saver (end of day)

2-Day Options:
• FedEx 2Day
• UPS 2nd Day Air

Saturday Delivery:
• FedEx Saturday Delivery (additional fee)
• UPS Saturday Delivery (additional fee)
```

**Geographic Considerations**:
- ✅ Major metro areas: All options typically available
- ⚠️ Rural/remote: Overnight may deliver by 3-5 PM (not 10:30 AM)
- ❌ Very remote: Saturday delivery may not be available

**Customer Address Check**:
- Residential vs commercial (affects delivery times)
- PO Box? (overnight carriers don't deliver to PO Boxes!)
- Access issues? (gated community, business hours required?)

- ✅ **Good coverage** → Proceed to Question 4
- ⚠️ **Limited options** → Discuss alternatives with customer

---

#### Question 4: Is customer willing to pay expedited shipping cost?

**Expedited Shipping Costs** (example pricing):

| Shipping Method | Cost (typical) | Delivery Time |
|-----------------|----------------|---------------|
| Standard Ground | $10-15 | 3-7 business days |
| 2-Day | $25-40 | 2 business days |
| Overnight | $50-80 | Next business day |
| Saturday Delivery | +$20-30 | Saturday |

**Customer Communication**:
```
"To get this to you by Friday, we'll need to ship overnight. 
That's typically $[cost] for shipping. Your part is $[part cost], 
so total would be $[total]. Does that work for your timeline?"
```

- ✅ **Customer approves** → Process rush order
- ❌ **Customer declines** → Offer standard shipping or alternatives

---

## ✅ Processing Rush Orders (Step-by-Step)

### Step 1: Verify Order Details

**Double-Check with Customer**:
- [ ] **Part number**: Confirm exact part (AN-6 vs AN-8 makes a difference!)
- [ ] **Quantity**: How many do they need?
- [ ] **Shipping address**: Confirm address is 100% accurate (no typos!)
- [ ] **Phone number**: Carrier will call if delivery issue
- [ ] **Delivery location type**: Home (residential) or shop (commercial)?

**Why This Matters**: Any mistake delays delivery. No second chances with overnight orders.

**Gold Reply Template**:
```
Hi {{customerName}},

Perfect! Let's make sure we get this right the first time since it's urgent:

**Part**: {{partDescription}} - Part #{{partNumber}}
**Quantity**: {{quantity}}
**Ship To**:
{{customerAddress}}
{{city}}, {{state}} {{zip}}
**Phone**: {{phone}}

**Delivery**: {{shippingMethod}} - should arrive {{deliveryDate}}

Please reply with "CONFIRMED" if everything looks correct, or let me know what needs to change!

{{operatorName}}
```

---

### Step 2: Create Order with Rush Flag

**In Order System**:
```
1. Create new order
2. Add parts to order
3. Apply any applicable discounts
4. SELECT EXPEDITED SHIPPING OPTION
5. ⚠️ ADD ORDER NOTE: "RUSH - Race weekend [Date] - Ship ASAP"
6. Tag order: [RUSH], [RACE WEEKEND]
7. Send to warehouse with priority flag
```

**Order Note Example**:
```
RUSH ORDER - RACE WEEKEND
Customer has race Saturday 10/14
Must ship today for overnight delivery
Confirmed with customer at [time]
Operator: [Your Name]
```

---

### Step 3: Confirm with Warehouse

**Internal Communication** (if warehouse is separate):
```
Slack/Email to Warehouse:
"Rush order #[ORDER-ID] for race weekend - needs to ship TODAY by 3pm 
for overnight delivery. Customer has race Saturday. Please confirm 
pickup scheduled. Thanks!"
```

**Follow Up**:
- [ ] Verify order picked within 1 hour
- [ ] Verify shipped by cutoff time
- [ ] Obtain tracking number

---

### Step 4: Send Customer Confirmation

**Immediate Confirmation Email**:

**Gold Reply Template**:
```
Hi {{customerName}},

Great news! Your rush order is confirmed and processing:

**Order Number**: #{{orderNumber}}
**Parts**: {{partsList}}
**Total**: ${{totalAmount}} (includes ${{shippingCost}} expedited shipping)
**Ships**: Today by {{cutoffTime}}
**Arrives**: {{deliveryDate}} by {{deliveryTime}}

**Tracking**: I'll send tracking info within 2 hours once the carrier picks up.

**Race Weekend Notes**:
• Keep your phone handy Friday - carrier may call if any delivery questions
• Someone needs to be available to sign (residential delivery)
• Track at: [carrier tracking link when available]

Good luck at the race! Let me know how it goes! 🏁

{{operatorName}}
```

---

### Step 5: Send Tracking Info (Same Day)

**Once Package Ships**:

**Gold Reply Template**:
```
Hi {{customerName}},

Your parts are on the way! 📦

**Tracking Number**: {{trackingNumber}}
**Carrier**: {{carrierName}}
**Track Online**: {{trackingURL}}

**Expected Delivery**: {{deliveryDate}} by {{deliveryTime}}

**Pro Tip**: Download the {{carrierName}} app - you can get real-time 
notifications and even reroute to a hold location if needed.

You're all set for the race! 🏁

{{operatorName}}
```

---

## 🚨 Special Rush Order Scenarios

### Scenario 1: Same-Day Local Pickup

**When Available**: Customer is local to warehouse/shop location

**Process**:
```
1. Verify customer can pick up today during business hours
2. Create order as "LOCAL PICKUP"
3. Tag: [WILL CALL]
4. Alert warehouse: "Will call pickup - customer arriving at [time]"
5. Have customer bring ID and order confirmation
6. Parts ready at front desk/will call counter
```

**Gold Reply Template**:
```
Hi {{customerName}},

Even better! You can pick up today:

**Pickup Location**:
Hot Rod AN Warehouse
[Address]
[City, State ZIP]

**Hours**: [Business Hours]
**Your Order**: Will be ready at front desk by {{readyTime}}
**Bring**: Photo ID and this email

See you soon!

{{operatorName}}
```

**Benefit**: No shipping cost, guaranteed same-day availability

---

### Scenario 2: Friday Afternoon Order for Saturday Race

**Challenge**: After carrier cutoff time (usually 3:00 PM EST Friday)

**Options**:

#### Option A: Saturday Delivery (if available)
```
• FedEx/UPS Saturday delivery (not available all locations)
• Must order by Thursday 5:00 PM for Saturday delivery
• Additional $20-30 fee
• Not available to PO Boxes or rural areas
```

#### Option B: Hold for Pickup at Carrier Facility
```
1. Ship overnight Friday (will attempt Saturday delivery but likely Monday)
2. Customer calls carrier Saturday morning
3. Request "Hold at location" at local carrier depot
4. Customer picks up at FedEx/UPS facility Saturday afternoon
5. ⚠️ Not guaranteed - depot must be open Saturday and package must arrive
```

**Gold Reply Template**:
```
Hi {{customerName}},

Friday afternoon is tight for Saturday delivery. Here are your options:

**Option 1: Saturday Delivery** (${{saturdayCost}} total)
• ⚠️ Not available in all areas - I'd need to verify your ZIP code
• If available, guaranteed Saturday delivery

**Option 2: Hold for Pickup** (${{overnightCost}} total)
• Ship overnight Friday
• YOU call {{carrier}} Saturday morning (once tracking shows "arrived at facility")
• Request hold at local depot for pickup
• ⚠️ Not guaranteed - depends on depot hours and package arrival time

**Option 3: Monday Delivery** (${{overnightCost}} total)
• Overnight Friday for Monday AM delivery
• Reliable, but too late for your Saturday race

**My Recommendation**: {{recommendation based on customer location}}

Let me know which you'd like to try!

{{operatorName}}
```

---

### Scenario 3: Multiple Parts, Some In Stock, Some Not

**Challenge**: Customer needs AN-6 fitting (in stock) and AN-8 fitting (out of stock)

**Options**:

#### Option A: Partial Rush Shipment
```
• Ship in-stock items overnight
• Backorder out-of-stock items for later shipment
• Customer pays one expedited shipping fee (for in-stock)
• Customer pays standard shipping for backorder (when available)
```

#### Option B: Substitute Alternative Part
```
• Suggest in-stock alternative if functionally equivalent
• Example: Customer needs AN-8 90° (out of stock), offer AN-8 45° + AN-8 45° combo
• Ensure customer approves substitution
```

#### Option C: Source from Alternative Supplier
```
• Check if competitor/partner has part in stock
• Purchase and resell to customer (if margin allows)
• Rare, but possible for critical race weekend situations
• Requires manager approval
```

**Gold Reply Template**:
```
Hi {{customerName}},

Good news and challenge:

✅ **In Stock**: {{inStockParts}}
❌ **Out of Stock**: {{outOfStockParts}} (back in stock {{eta}})

**Your Options**:

**Option 1: Ship what's in stock now**
• Get {{inStockParts}} overnight for your race
• Backorder {{outOfStockParts}} to ship {{eta}}
• Can you race without the out-of-stock parts?

**Option 2: Alternative parts** (if applicable)
• {{alternativeSuggestion}}
• Functionally equivalent, in stock now

**Option 3: Wait for everything**
• Shipment on {{eta}}
• Won't arrive in time for Saturday race

**My Recommendation**: {{yourRecommendation}}

What would work best for your situation?

{{operatorName}}
```

---

### Scenario 4: Customer Already Placed Order, Needs to Upgrade Shipping

**Challenge**: Customer placed order 2 days ago with standard shipping, now needs it rushed

**Process**:
```
1. Look up existing order
2. Check order status:
   ☐ Not yet shipped → Can modify
   ☐ Already shipped → Cannot modify (package in transit)
   ☐ Delivered → Too late

3. If NOT yet shipped:
   • Cancel and refund shipping
   • Add expedited shipping
   • Calculate difference in cost
   • Charge customer difference
   • Alert warehouse: UPGRADE TO RUSH

4. If ALREADY shipped:
   • Cannot change in-transit package
   • Check tracking: When will it arrive?
   • If arriving too late, offer to ship replacement overnight
     (customer gets both shipments, pay for one)
```

**Gold Reply Template (Not Yet Shipped)**:
```
Hi {{customerName}},

Good timing! Your order hasn't shipped yet, so we can upgrade it:

**Your Order**: #{{orderNumber}}
**Current Shipping**: Standard Ground ({{originalDeliveryDate}})
**Upgraded Shipping**: {{upgradedMethod}} ({{newDeliveryDate}})

**Shipping Upgrade Cost**: ${{difference}}

I can process the upgrade right now and ensure it ships today. 
Should I go ahead?

{{operatorName}}
```

**Gold Reply Template (Already Shipped)**:
```
Hi {{customerName}},

I checked your order #{{orderNumber}} and it already shipped {{shipDate}}:

**Current Status**: {{trackingStatus}}
**Expected Delivery**: {{deliveryDate}}
**Tracking**: {{trackingNumber}}

Unfortunately, once a package is in the carrier's hands, we can't 
change the shipping speed. 

**Will {{deliveryDate}} work for your race on {{raceDate}}?**

If not, I have a backup option: I can ship a duplicate order overnight 
today so you have parts by {{rushDeliveryDate}}. You'd get both 
shipments, but only pay for the rush shipping (${{rushCost}}).

Let me know what works best!

{{operatorName}}
```

---

## ❌ Out of Stock Solutions

### When Part Is Not Available

**Transparency is Key**: Don't give false hope.

**Gold Reply Template**:
```
Hi {{customerName}},

I really wish I had better news. The {{partDescription}} is currently 
out of stock, and we're expecting more on {{restockDate}}.

**Your Race**: {{raceDate}}
**Restock Date**: {{restockDate}}
**Verdict**: ⚠️ Won't arrive in time

**Let's find a solution:**

**Option 1: Alternative Part**
• {{alternativePart}} - In stock, ships today
• {{explanation of how it works}}

**Option 2: Check Nearby Retailers**
• I can suggest local auto parts stores that might carry AN fittings
• Not guaranteed, but worth a call

**Option 3: Temporary Fix (if applicable)**
• {{temporaryWorkaround}}
• Get you through this race weekend, replace with proper part later

**Option 4: Raincheck for Next Race**
• Refund if you ordered, or
• We'll ship free overnight for your next event

I know this isn't what you wanted to hear. Let's figure out the best 
path forward together.

{{operatorName}}
```

### Out of Stock Alternative Solutions

#### 1. Suggest Compatible Alternative
```
Customer needs: AN-6 90° swivel (out of stock)
Alternatives:
• AN-6 45° + AN-6 45° = effective 90°
• AN-6 straight with hose routing change
• AN-8 90° (if compatible) with reducer fittings
```

#### 2. Local Store Referrals
```
"Here are some local stores that carry AN fittings:
• [Store Name] - [Address] - [Phone]
• [Store Name] - [Address] - [Phone]

Call ahead to confirm they have the specific part. 
Not all stores carry the exact size you need."
```

#### 3. Overnight from Competitor (Manager Approval)
```
Rare, but for critical race weekend + valued customer:
• Purchase from competitor who has stock
• Overnight to customer
• Absorb cost difference or charge minimal markup
• Requires manager approval
• Documents customer loyalty
```

---

## 🛠️ Temporary Workarounds (Get Through the Race)

### When Proper Part Unavailable

**Safety First**: Only suggest workarounds that are mechanically sound and safe.

### Temporary Fuel Line Repair

**Scenario**: Customer has leaking AN fitting, race Saturday, can't get replacement

**Temporary Solution**:
```
IF and ONLY IF:
• Leak is minor (slow seep, not active spray)
• Not near ignition source
• Customer can monitor closely during event

Temporary fix:
1. Clean fitting threads thoroughly
2. Apply high-temp thread sealant (racing-grade)
3. Tighten properly
4. Monitor closely during race day
5. ⚠️ REPLACE ASAP after race

⚠️ This is NOT a permanent solution!
```

**Gold Reply Template**:
```
Hi {{customerName}},

Here's a temporary fix to get you through Saturday. 
⚠️ YOU MUST REPLACE THIS PROPERLY AFTER THE RACE.

**Temporary Repair**:
1. {{step by step}}

**⚠️ Safety Rules**:
• Inspect before every run
• If leak worsens, STOP immediately
• Have fire extinguisher in vehicle
• Watch for fuel smell in cockpit

**After the Race**:
I'll ship you the proper replacement part Monday (my treat - free shipping).

This should get you through your race safely. Good luck!

{{operatorName}}
```

**When NOT to Suggest Temporary Fix**:
- ❌ Active fuel spray (immediate fire hazard)
- ❌ Brake system (safety critical, never temporary fix)
- ❌ High-pressure EFI system (>60 PSI)
- ❌ Customer is inexperienced (may not install correctly)

---

## 📞 Communication Best Practices

### Managing Expectations

**Be Honest About Timelines**:
```
❌ "We'll try to get it there by Friday"
✅ "With overnight shipping ordered by 3pm today, you'll have it Friday by 10:30am"

❌ "It might work"
✅ "There's a 90% chance this arrives Saturday IF you request hold-for-pickup when tracking shows 'arrived at facility'"

❌ "I think we have that in stock"
✅ "Let me check inventory... Yes, we have 3 in stock in our California warehouse, ships today"
```

**Under-Promise, Over-Deliver**:
```
If carrier says "Friday by 10:30am":
→ Tell customer: "Friday by end of day"
→ If it arrives at 10:30am, customer is thrilled

If restock date is "Tuesday":
→ Tell customer: "Mid-week"
→ If it arrives Tuesday, customer is happy
```

---

### Proactive Updates

**Don't Make Customer Chase You**:

**Timeline**:
- ☐ Order confirmed: Immediate confirmation email
- ☐ Order shipped: Send tracking within 2 hours
- ☐ Day before delivery: "Reminder: Package arriving tomorrow"
- ☐ Day after race: "How did the race go?"

**Proactive Update Template**:
```
Hi {{customerName}},

Quick update on your rush order:

**Shipped**: {{shipDate}} at {{shipTime}}
**Tracking**: {{trackingNumber}}
**Current Status**: {{latestTrackingUpdate}}
**On Track For**: {{deliveryDate}} delivery

Everything looks good! Your parts should arrive tomorrow as planned.

{{operatorName}}
```

---

### Race Weekend Follow-Up

**Show You Care** (builds loyalty):

**After Race Day**:
```
Hi {{customerName}},

How did the race go this weekend? 

Hope our {{partDescription}} worked perfectly for you!

If you need anything else, just let me know.

{{operatorName}}
```

**Benefits**:
- Builds customer relationship
- Generates word-of-mouth referrals
- Identifies any product issues
- Encourages customer to share race results (social media content!)

---

## 💰 Pricing & Cost Management

### Who Pays for Expedited Shipping?

**Standard Policy**:
```
Customer pays expedited shipping costs
• Customer requested rush timeline
• Premium service = premium cost
• Transparent pricing upfront
```

**Exceptions (Manager Approval Required)**:
```
1. Our error caused delay (wrong part shipped, order processing error)
   → We pay expedited shipping to correct our mistake

2. High-value customer (>$5K annual spend)
   → Consider covering or splitting cost as customer appreciation

3. Product defect (defective part, need replacement ASAP)
   → We pay expedited shipping for replacement

4. First-time customer, high-value order
   → Consider covering to win long-term business
```

### Rush Order Discounts?

**Standard Policy**: No discount on rush orders
- Customer is paying for speed, not discount
- Warehouse/shipping costs are higher
- Premium service justifies full price

**Exception**: If customer ordering multiple items and needs rush, consider:
- Free standard shipping on rest of order (if would normally charge)
- Small discount on parts (5-10%) to offset some shipping cost
- Loyalty points/credit toward future purchase

**Always Get Manager Approval for Discounts on Rush Orders**

---

## 📊 Rush Order Priority Matrix

### When Multiple Rush Orders Come In

**Priority Ranking**:

**Priority 1 - Immediate** (process first):
- Safety-critical parts (brakes, fuel system repairs)
- Sponsored race teams (represent our brand)
- Same-day local pickup (customer waiting)

**Priority 2 - High** (process within 1 hour):
- Race weekend orders (Saturday/Sunday events)
- High-value customers (>$5K annual spend)
- Customer vehicle is daily driver (down for work)

**Priority 3 - Standard Rush** (process within 4 hours):
- Car show events
- Non-critical parts (cosmetic, upgrades)
- Adequate delivery timeline (3+ days)

**Managing Conflicts**:
```
If warehouse can only ship X orders before cutoff:
1. Process Priority 1 first (safety/sponsored teams)
2. Process Priority 2 next (race weekends)
3. If time allows, Priority 3
4. If can't fit all: Contact customers, offer alternatives
```

---

## 🎯 Race Weekend Order Checklist

### Before Confirming Rush Order:

**Verify**:
- [ ] Part number is 100% correct
- [ ] Part is in stock (not "usually in stock" - verify NOW)
- [ ] Quantity matches customer need
- [ ] Shipping address is accurate (no typos!)
- [ ] Customer phone number on file
- [ ] Delivery date works for customer timeline
- [ ] Customer approved expedited shipping cost
- [ ] Customer knows delivery timeframe (10:30am vs end of day)

**Document**:
- [ ] Order tagged [RUSH] and [RACE WEEKEND]
- [ ] Order note explains urgency and timeline
- [ ] Warehouse notified (if separate team)
- [ ] Customer confirmation sent
- [ ] Tracking info sent when available
- [ ] Follow-up scheduled for after race

---

## 🚫 What NOT to Do

### Common Mistakes to Avoid

❌ **Promise delivery without checking inventory**
- Always verify stock FIRST, then promise timeline

❌ **Forget to mention shipping cost upfront**
- Customer should know full cost before order is placed

❌ **Ship wrong part in a rush**
- Double-check part numbers. Speed + error = disaster

❌ **Offer Saturday delivery without verifying carrier coverage**
- Not all ZIP codes have Saturday delivery

❌ **Suggest unsafe temporary fixes**
- Never compromise safety for speed

❌ **Forget to tag order as RUSH**
- Warehouse may not prioritize if not flagged

❌ **Don't follow up with tracking**
- Customer shouldn't have to ask for tracking info

---

## 📞 Escalation Criteria

### When to Escalate Rush Orders

**Escalate to Manager if**:
- [ ] Customer wants free expedited shipping (policy exception)
- [ ] Part is out of stock, customer is upset
- [ ] Expensive expedited shipping (>$100) needs approval
- [ ] Customer requests Saturday delivery to unverified location
- [ ] Competitor sourcing needed (buy from competitor to resell)
- [ ] Safety issue with temporary fix suggestion

**Escalation Process**:
```
1. Document situation (order #, customer need, timeline)
2. Present options you've already discussed with customer
3. Request manager decision
4. Manager responds within 1 hour for rush situations
5. Implement manager's decision immediately
6. Follow up with customer
```

---

## 📈 Metrics & Performance

### Track Rush Order Performance

**Operator Metrics**:
- Rush order accuracy (correct part first time)
- On-time delivery rate (did it arrive when promised?)
- Customer satisfaction post-race
- Follow-up completion rate

**Team Metrics**:
- Rush order volume by day/week
- Average shipping cost per rush order
- Percentage of rush orders that meet customer deadline
- Repeat customers who used rush service

**Continuous Improvement**:
- Which parts are most commonly rushed? (stock more)
- Which carrier has best success rate? (prefer that carrier)
- Which day of week has most rush orders? (staff accordingly)
- Are we meeting cutoff times? (adjust internal processes)

---

## 📚 Related Documentation

### Internal Playbooks
- `01-an-fittings-product-knowledge.md` - Part identification
- `02-an-fittings-troubleshooting.md` - Temporary fixes (use cautiously)
- `07-technical-escalation-matrix.md` - When to escalate
- `README.md` - Operator certification levels

### Internal Processes
- `docs/policies/shipping_policies.md` - Shipping rates and options
- `docs/policies/refund_policy.md` - Rush order refund policies
- `docs/runbooks/warehouse_operations.md` - Warehouse cutoff times

---

## 🔄 Document Maintenance

**Review Frequency**: Quarterly (or when carrier contracts change)  
**Owner**: Support Agent  
**Next Review**: January 12, 2026

**Update Triggers**:
- Carrier rate changes
- New shipping options available
- Customer feedback on rush order process
- Warehouse cutoff time changes

---

**Last Updated**: October 12, 2025  
**Document Owner**: Support Agent  
**Questions?** Post in #support-hot-rod-an or contact manager@hotrodan.com

---

## Quick Reference Card (Print & Keep at Desk)

```
┌─────────────────────────────────────────────────────┐
│         RUSH ORDER QUICK REFERENCE                  │
├─────────────────────────────────────────────────────┤
│ CUTOFF TIMES (EST)                                  │
│ • Overnight: 3:00 PM (same-day ship)                │
│ • 2-Day: 5:00 PM (same-day ship)                    │
│ • Saturday Delivery: Thursday 5:00 PM              │
├─────────────────────────────────────────────────────┤
│ SHIPPING COSTS (typical)                            │
│ • Standard Ground: $10-15 (3-7 days)                │
│ • 2-Day: $25-40                                     │
│ • Overnight: $50-80                                 │
│ • Saturday Delivery: +$20-30                        │
├─────────────────────────────────────────────────────┤
│ RUSH ORDER CHECKLIST                                │
│ ☐ Part in stock (verify!)                           │
│ ☐ Address 100% correct                              │
│ ☐ Customer approved cost                            │
│ ☐ Tagged [RUSH] [RACE WEEKEND]                     │
│ ☐ Warehouse notified                                │
│ ☐ Tracking sent to customer                         │
├─────────────────────────────────────────────────────┤
│ CAN'T MAKE TIMELINE?                                │
│ • Offer alternatives (substitute parts)             │
│ • Suggest local stores                              │
│ • Temporary fix (safety-appropriate only!)          │
│ • Raincheck for next event                          │
└─────────────────────────────────────────────────────┘
```

**Remember**: Speed + Accuracy = Happy Racer! 🏁

