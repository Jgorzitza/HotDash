---
epoch: 2025.10.E1
doc: docs/support/shipping_logistics_support.md
owner: support
status: draft
last_updated: 2025-10-14T00:00:00Z
---

# Shipping and Logistics Support (Draft)

## Purpose
Handle tracking and delivery issues, international shipping (if applicable), and freight/LTL for large items.

## Shipping Methods & Carriers

### Standard Ground Shipping
**Carriers**: USPS Priority, UPS Ground, FedEx Ground
**Timeline**: 3-7 business days
**Best For**: Most orders, residential delivery, standard parts
**Tracking**: Provided automatically

### Expedited Shipping
**Carriers**: UPS 2nd Day Air, FedEx Express
**Timeline**: 2 business days
**Best For**: Rush orders, business delivery, time-sensitive
**Tracking**: Real-time updates

### Overnight Shipping
**Carriers**: UPS Next Day Air, FedEx Priority Overnight
**Timeline**: Next business day
**Best For**: Emergency orders, race weekends, critical failures
**Tracking**: Delivery guarantee, real-time

### Freight (LTL - Less Than Truckload)
**Carriers**: Regional freight lines, XPO, Old Dominion
**Timeline**: 3-10 business days (varies by region)
**Best For**: Large/heavy items (engines, transmissions, pallets)
**Tracking**: Freight BOL tracking

### International Shipping
**Carriers**: USPS International, UPS Worldwide, FedEx International
**Timeline**: 7-21 days (varies by country)
**Best For**: Canada, Mexico, overseas customers
**Tracking**: Customs updates included

## Tracking & Delivery Support

### Tracking Number Lookup

**Customer**: "Where's my order?"

**Response Process**:
1. Look up order number
2. Find tracking number
3. Check carrier website for status
4. Provide update:

```
"Your order shipped on [date] via [carrier].

Tracking: [number] ([clickable link])
Current status: [In transit / Out for delivery / Delivered]
Expected delivery: [date]

[If delayed]: Looks like there's a delay. Let me contact the carrier and get an update for you."
```

### Delivery Status Scenarios

#### In Transit (On Time)
```
"Your package is on its way! Tracking shows:

Shipped: [date]
Current location: [city/state]
Expected delivery: [date]

You should have it by [date]. I'll check in if it doesn't arrive."
```

#### In Transit (Delayed)
```
"I see your package is delayed. Here's what I know:

Shipped: [date]
Last scan: [city/state] on [date]
Original delivery: [date] → Now expected: [new date]

I'm contacting [carrier] to get more details. I'll update you within 2 hours."
```

#### Out for Delivery
```
"Good news! Your package is out for delivery today.

Expected delivery: By [time] today
Driver has your package on the truck

Someone should be available to receive it. If you miss delivery, the driver will leave a note with next steps."
```

#### Delivered
```
"Great! Your package was delivered on [date] at [time].

Delivered to: [location - porch, mailbox, etc.]
Signed by: [name or 'Left at door']

If you didn't receive it, let me know immediately and I'll investigate."
```

### Delivery Issues

#### Package Not Received (Delivered per Tracking)
**Process**:
1. Verify address: "Confirm delivery address - is this correct?"
2. Check alternative locations: "Sometimes drivers leave packages at side door, garage, or with neighbor"
3. Request proof: "Ask carrier for proof of delivery (photo or signature)"
4. Wait 24 hours: "Sometimes scans are early. Can you check again tomorrow?"
5. If still missing after 24 hours:
   - File carrier claim
   - Send replacement immediately
   - Absorb cost (customer satisfaction)

#### Package Damaged in Transit
**Process**:
1. Request photos: "Can you send photos of the damage (box and part)?"
2. Document: Save photos and damage report
3. File carrier claim: Submit claim with evidence
4. Send replacement: Don't wait for claim resolution
5. Follow up: "Replacement ships today. You don't need to return the damaged item."

#### Delivery Address Wrong
**Process**:
1. Check if already shipped: "Has it shipped yet?"
2. If not shipped: "I'll update the address before it ships."
3. If in transit: "I'm contacting the carrier to intercept and redirect."
4. If delivered to wrong address: "I'm working with the carrier to retrieve it. Meanwhile, I can send another to the correct address."

#### Signature Required (No One Home)
**Process**:
1. Check delivery attempts: "Carrier attempted delivery on [dates]"
2. Options:
   - Authorize release (no signature needed)
   - Hold for pickup at carrier facility
   - Reschedule delivery (specific date/time)
   - Reroute to alternative address (work, neighbor)

## International Shipping

### Customs & Duties

#### Customer Questions
**Q**: "Do I have to pay customs/duties?"
**A**: "Yes, international shipments may be subject to customs duties and taxes based on your country's import laws. These fees are collected by customs, not Hot Rodan, and are the buyer's responsibility."

**Q**: "How much will customs charge?"
**A**: "It varies by country and item value. Typical range is 5-25% of item value. Contact your customs office for exact rates."

#### Customs Forms
- Complete commercial invoice (item description, value, HS code)
- Mark as "Merchandise" or "Gift" (per customer request)
- Declare accurate value (don't undervalue - causes delays)

### International Delivery Issues

#### Package Held in Customs
```
"Your package is held at customs in [country].

This is normal for international shipments. Here's what to do:

1. You should receive a customs notice with instructions
2. You may need to pay duties/taxes to release it
3. Sometimes you need to provide additional documentation

Timeframe: Usually releases within 3-7 business days after payment

If it's been > 10 days, let me know and I'll contact the carrier."
```

#### Lost in Transit (International)
```
"I see your package hasn't updated in [X] days.

International shipments can go dark for a while (customs, etc.), but this seems excessive.

Here's what I'm doing:
1. Filing a trace with [carrier]
2. Contacting international hub for update
3. If not located in 7 days, I'll send a replacement

I'll update you every 2-3 days with any news."
```

### Country-Specific Notes

#### Canada
- USMCA/NAFTA eligible for duty-free on many parts (provide certificate of origin)
- Expect 7-14 day delivery
- Brokerage fees (UPS/FedEx charge extra, USPS doesn't)

#### Mexico
- Can be slow (10-21 days)
- Customs can be strict (good documentation required)
- Some regions have delivery challenges (remote areas)

#### Europe / UK
- VAT and duties apply
- Brexit affects UK shipments (separate from EU)
- Longer transit times (10-21 days)

#### Australia / New Zealand
- Strict biosecurity (food, wood, organic materials flagged)
- Expensive freight (remote location)
- 14-28 day delivery typical

## Freight / LTL Shipping

### When to Use Freight

**Item Characteristics**:
- Weight > 150 lbs
- Dimensions > 96" any side
- Pallet shipment
- Multiple large items (engines, transmissions, chassis parts)

### Freight Quote Process

**Customer**: "How much to ship this engine?"

**Response**:
1. Get dimensions and weight: "What are the dimensions (L×W×H) and weight?"
2. Get destination details: "Residential or business? Forklift available?"
3. Get LTL quote from carrier:
   - Class (based on weight and density)
   - Accessorial charges (residential, liftgate, inside delivery)
4. Provide quote:

```
"Freight quote for [item]:

Base freight: $[X]
Residential delivery: $[Y]
Liftgate service (no dock/forklift): $[Z]
Total freight: $[Total]

Transit time: [X] business days

Want me to book it? I'll need a signature upon delivery."
```

### Freight Delivery Coordination

#### Pre-Delivery
1. Carrier contacts customer to schedule (1-2 days before)
2. Customer confirms delivery window (AM or PM)
3. Ensure someone is there to receive (signature required)

#### Delivery Day
1. Driver calls 30-60 min before arrival
2. Inspect item before signing (damage check)
3. Note any damage on BOL before signing
4. Take photos if any damage observed

#### Post-Delivery Issues
- **Damage**: Note on BOL, take photos, file claim immediately
- **Refused**: If damaged and customer refuses, notify support immediately
- **Shortage**: If items missing from shipment, note on BOL

## Carrier-Specific Issues

### USPS
**Strengths**: Affordable, residential delivery, no extra fees
**Weaknesses**: Slower tracking updates, limited recourse for lost packages
**Common Issues**: Marked delivered but not received, lost in local facility

### UPS
**Strengths**: Reliable, good tracking, extensive network
**Weaknesses**: Expensive for residential, brokerage fees (Canada)
**Common Issues**: Residential surcharges, signature requirements, damaged packages

### FedEx
**Strengths**: Fast express service, good international
**Weaknesses**: Higher cost, residential fees
**Common Issues**: Similar to UPS - fees and damage claims

### Freight Carriers
**Strengths**: Handles large/heavy items
**Weaknesses**: Slow, scheduling complexity, damage risk
**Common Issues**: Delivery delays, scheduling conflicts, damage (require inspection)

## Shipping Cost Management

### Free Shipping Threshold
- Orders > $99: Free standard ground shipping
- Orders < $99: $12 flat rate shipping

### Customer Questions

**Q**: "Can you waive shipping?"
**A**: "Our free shipping kicks in at $99. You're at $[X]. Add $[Y] more and shipping is free. Want me to suggest something?"

**Q**: "Shipping is too expensive!"
**A**: "I hear you. Shipping is actual cost from the carrier. Options:
1. Ground shipping (slower but cheaper)
2. Add items to hit $99 free shipping
3. Split order (ship some now, some later when you need more)"

## Proactive Shipping Support

### Delivery Notifications
- Email when shipped (auto)
- SMS option for delivery day (opt-in)
- Email if delayed > 2 days (manual)

### Problem Prevention
- Verify address at checkout (flag PO boxes for freight items)
- Set realistic delivery expectations (don't promise what carriers can't deliver)
- Offer insurance for high-value items (engines, custom parts >$2K)

### Post-Delivery Follow-Up
- Email 2-3 days post-delivery: "Did your part arrive OK?"
- Identify delivery issues early (before customer has to reach out)
- Catch damage before it's installed (too late to claim)

---
Status: Draft shipping & logistics guide. Update with actual carrier contacts and freight procedures.

