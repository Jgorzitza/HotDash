---
epoch: 2025.10.E1
doc: docs/support/order_modification_rush_orders.md
owner: support
status: draft
last_updated: 2025-10-14T00:00:00Z
---

# Order Modification and Rush Orders (Draft)

## Purpose
Define procedures for handling rush shipping for race weekends, order modifications before shipping, and custom part order processes for Hot Rodan.

## Rush Orders & Expedited Shipping

### Rush Order Definition
Any order where customer needs delivery by a specific deadline, typically:
- Race weekend (Friday/Saturday delivery)
- Build deadline (customer waiting on part to complete project)
- Replacement for failed part (customer's car is down)

### Shipping Options & Cutoff Times

#### Standard Shipping
- **Method**: USPS Priority or UPS Ground
- **Timeline**: 3-7 business days
- **Cost**: Free on orders >$99, otherwise $12
- **Cutoff**: 3:00 PM EST for same-day ship

#### Expedited Shipping  
- **Method**: UPS 2nd Day Air
- **Timeline**: 2 business days
- **Cost**: $25-45 depending on weight/zone
- **Cutoff**: 2:00 PM EST for same-day ship

#### Overnight Shipping
- **Method**: UPS Next Day Air
- **Timeline**: Next business day
- **Cost**: $45-95 depending on weight/zone
- **Cutoff**: 1:00 PM EST for next-day delivery

#### Saturday Delivery
- **Method**: UPS Next Day Air Saturday
- **Timeline**: Saturday delivery (order by Friday cutoff)
- **Cost**: +$20 on top of overnight rate
- **Cutoff**: 12:00 PM EST Friday

### Rush Order Process

#### Step 1: Qualify the Rush
Ask:
1. "When do you need this by?" (specific date/time)
2. "What's the deadline for?" (race, build, replacement)
3. "Where's the delivery location?" (residential, shop, track)

#### Step 2: Check Stock & Warehouse
1. Verify item is in stock (real-time inventory)
2. Check warehouse cut-off time remaining
3. Confirm shipping address is in serviceable zone
4. Note any weather/holiday delays

#### Step 3: Present Options
```
"Here are your options to get this by [deadline]:

Option 1: Overnight - $[cost] - Delivery by [day/time]
  Order by [cutoff] today

Option 2: Saturday Delivery - $[cost] - Delivery Saturday
  Order by 12 PM Friday (if before Friday)

Option 3: 2-Day Air - $[cost] - Delivery by [day]
  Less expensive, arrives [explain timing]

Which works best for your schedule?"
```

#### Step 4: Execute
1. Process order with selected shipping method
2. **Immediately notify fulfillment** (Slack/email): "Rush order #[number] - needs to ship by [cutoff]"
3. Provide tracking number ASAP (within 30 min of ship)
4. Set delivery alert for customer

#### Step 5: Follow Up
- Text/email tracking on ship: "Your part shipped! Track here: [link]"
- Day before delivery: "Your part arrives tomorrow by [time]"
- After deadline: "Did your part arrive in time? Let us know if any issues."

### Race Weekend Emergency Protocol

**Scenario**: Customer needs part for Saturday race, it's Thursday afternoon

#### Critical Questions:
1. What breaks/fails if part doesn't arrive? (understand impact)
2. Do you have a backup plan? (Can they race without it?)
3. What's the shipping address? (Home, shop, track)
4. Will someone be there to receive? (Signature required?)

#### Action Steps:
1. **Verify stock immediately** - don't quote if not in stock
2. **Calculate true delivery time** - factor in distance, carrier schedule
3. **Offer Saturday delivery if needed** - even if expensive, give option
4. **Coordinate with fulfillment** - flag as race emergency
5. **Provide backup options** - local pickup, alternative part, next-day to track

#### Communication:
```
"I understand you're racing Saturday - let's get this handled.

✅ Part is in stock
✅ If you order in the next [X hours], I can get this to you Friday with overnight shipping ($[cost])
✅ I'll personally track this and text you the tracking number
✅ If anything goes wrong with the shipment, call my direct line: [number]

Would you like me to process this with overnight shipping?"
```

### When Rush Shipping Isn't Possible

#### Part Out of Stock
```
"Unfortunately, this part won't be back in stock until [date]. 

Options:
1. Alternative part that fits your application? [If available]
2. Local auto parts store might have similar? [Check with customer]
3. We can rush ship as soon as it's in stock (monitor and email when ready)

I really wish we could help you make the deadline. What's your backup plan?"
```

#### Missed Cutoff Time
```
"I see it's [time] and our cutoff for overnight was [cutoff time].

Options:
1. We can ship 2-day tomorrow, arrives [day] - still miss Saturday?
2. Local pickup if you're near [warehouse location]
3. Check if [competitor] has in stock for local pickup

I'm sorry we can't make Saturday. Can you move the deadline or is there a workaround?"
```

#### Unserviceable Location
```
"I checked and [carrier] can't guarantee Saturday delivery to [location].

Options:
1. Ship to alternative address that IS serviceable? (Friend, shop, hotel)
2. Ship to general delivery at local post office
3. Will-call pickup at carrier terminal (if available)

Let's find a way to get this to you. Any of these work?"
```

## Order Modifications

### Before Order Ships

#### Customer Requests Modification
Common requests:
- Add item to existing order
- Change shipping address
- Cancel/remove item
- Upgrade shipping method

#### Process:
1. **Act fast** - Check if order already shipped (tracking number issued?)
2. **If not shipped**: Contact fulfillment to hold
3. **Make modification** in system
4. **Confirm with customer**: "Updated! New total $[X], ships today by [time]"
5. **Release to fulfillment**: "Order #[number] modified, ready to ship"

#### If Already Shipped:
```
"I see this just shipped 10 minutes ago (tracking: [number]).

Options:
1. We can ship the additional item separately (free shipping on orders >$99)
2. You could refuse delivery and reorder (but delays you)
3. Place a second order for the item you need

What works best for you?"
```

### After Order Ships

#### Change Shipping Address
1. **Check carrier** - Can they intercept and redirect?
2. **Contact carrier** - Submit address change request (may have fee)
3. **Set expectations**: "UPS charges $[X] to redirect, takes 24-48 hours to process"
4. **Alternative**: "Can someone pick it up from the original address and forward it?"

#### Cancel Order (Already Shipped)
```
"The order shipped this morning. 

Options:
1. Refuse delivery when it arrives (return to sender, we'll refund when received)
2. Accept delivery and return it (you pay return shipping, we refund less restocking fee)
3. Keep it and we'll work out a discount?

Which would you prefer?"
```

### Combining Orders

**Customer**: "I just placed order #123, then realized I need another part. Can you combine?"

1. Check if either order shipped
2. If both unshipped: Cancel newer order, add items to original, reprocess payment if needed
3. If one shipped: Ship second separately or wait for first to deliver and combine next order
4. **Always**: Confirm final total and ship date before executing

## Custom Part Orders

### What Qualifies as Custom
- Special order from vendor (not stocked)
- Modified/machined parts (custom length, drilling, welding)
- Bulk/kit orders with specific configuration
- Parts requiring vendor fabrication or lead time

### Custom Order Process

#### Step 1: Gather Requirements
1. Exact specifications (measurements, materials, finish)
2. Application details (what it's for, fitment requirements)
3. Quantity and timeline
4. Budget range

#### Step 2: Quote & Timeline
1. Contact vendor for quote and lead time
2. Add margin for Hot Rodan (standard markup)
3. Present to customer: "Quoted at $[X], ready in [timeframe]"
4. Set expectations: "Custom orders are non-returnable"

#### Step 3: Customer Approval
```
"Here's your custom part quote:

Part: [Description]
Price: $[X]
Lead Time: [X weeks]
Shipping: Add $[X] for [method]

⚠️ Custom orders require:
- 50% deposit to start
- Non-returnable/non-refundable
- Lead time may vary based on vendor schedule

Ready to proceed? I'll send the deposit invoice."
```

#### Step 4: Order & Track
1. Collect deposit (50% upfront)
2. Submit order to vendor with all specs
3. **Track weekly** - Don't let it go silent
4. Update customer every 7-10 days (even if no news)
5. Alert when ready to ship, collect balance

#### Step 5: Delivery & Follow-Up
1. Verify part matches specs before shipping to customer
2. Ship with signature required (high-value custom)
3. Follow up post-delivery: "Does it fit/work as expected?"
4. Document any issues for vendor feedback

### Custom Order Red Flags

#### Escalate to Manager If:
- Custom quote >$10K
- Customer requests engineering/design work
- Timeline is unrealistic (vendor can't meet)
- Specs are unclear or likely to have issues
- Customer has change requests after deposit

---
Status: Draft process guide. Update with actual shipping costs, cutoff times, and vendor contacts.

