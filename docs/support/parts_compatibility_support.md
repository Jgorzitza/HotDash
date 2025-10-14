---
epoch: 2025.10.E1
doc: docs/support/parts_compatibility_support.md
owner: support
status: draft
last_updated: 2025-10-14T00:00:00Z
---

# Parts Compatibility Support (Draft)

## Purpose
Help customers find the right parts for their build, verify fitment, and recommend alternatives when needed.

## Compatibility Verification Process

### Step 1: Gather Complete Application Details

**Must-Have Information**:
- Year, Make, Model (e.g., "1970 Chevelle")
- Engine (e.g., "383 stroker SBC")
- Transmission (auto/manual, specific model if known)
- Chassis/suspension mods (if relevant)
- End use (street, strip, Pro-Touring, etc.)

**Ask**:
```
"To confirm fitment, I need a few details:

1. What's your vehicle? (year, make, model)
2. What engine? (size, type, any modifications)
3. What's this for? (street car, race car, etc.)

This helps me verify the part will work perfectly for your setup."
```

### Step 2: Cross-Reference Part Specs

#### Check Application Charts
1. Locate product application chart (website, vendor docs)
2. Find customer's vehicle/engine in chart
3. Verify part number matches
4. Note any special requirements or limitations

#### Common Application Checks

**Headers/Exhaust**:
- Block type (SBC, BBC, LS, etc.)
- Chassis model and year (header fitment varies)
- Steering type (manual/power affects clearance)
- Motor mounts (stock, swap mounts, custom)

**Fuel System**:
- Carburetor size and inlet thread (AN vs. NPT)
- Fuel pump flow rate vs. HP requirements
- Regulator pressure range vs. carb/EFI needs
- Tank/sender compatibility (if replacing)

**Ignition**:
- Distributor: Engine family (GM, Ford, Mopar) and firing order
- Coil: Ignition system type (points, HEI, CDI, etc.)
- Plug wires: Boot type, routing, header clearance

**Engine Components**:
- Heads: Block type, deck height, intake bolt pattern
- Intake: Head port match, carburetor flange size
- Cam: Lifter type (flat tappet, roller), lobe profile for use

### Step 3: Identify Compatibility Issues

#### Exact Fit
✅ Part designed specifically for application
✅ No modifications needed
✅ Confirmed in application chart
**Action**: "This will bolt right on!"

#### Compatible with Adapter
⚠️ Part fits with minor adapter (AN fitting, spacer, etc.)
⚠️ Adapter commonly available and inexpensive
**Action**: "You'll need a [adapter], we have that in stock too."

#### Modification Required
⚠️ Part fits but needs trimming, grinding, custom fab
⚠️ Common modification in the community (documented)
**Action**: "This can work but requires [modification]. Are you comfortable with that?"

#### Not Compatible
❌ Part won't fit without major custom work
❌ Safety concern or functional issue
**Action**: "This won't work for your setup. Here's what will..."

### Step 4: Recommend Alternatives

#### When to Offer Alternatives
- Part is out of stock or discontinued
- Part isn't compatible with customer's application
- Customer's budget doesn't fit the part
- Better option exists for their specific needs

#### Alternative Recommendation Process
1. **Understand the need**: "What are you trying to achieve?"
2. **Suggest options**: "Here are 2-3 alternatives that will work..."
3. **Explain differences**: "Option A is [cheaper/lighter/easier], Option B is [more power/more durable]"
4. **Recommend best fit**: "For your use case, I'd go with [X] because..."

**Example**:
```
Customer: "Will this Holley 750 work on my 383 street car?"
Support: "It'll work, but a 650 might be better for street driving - better throttle response and fuel economy. The 750 is great if you're planning to add power later. What's your end goal?"
```

## Common Compatibility Scenarios

### Scenario 1: Engine Swap Fitment

**Customer**: "I'm swapping an LS into a '67 Camaro. Will these headers fit?"

**Response**:
1. "What LS engine specifically?" (LS1, LS3, LSx truck, etc.)
2. "What motor mounts are you using?" (Hooker, Trans-Dapt, custom)
3. "Manual or auto trans?" (affects steering and header clearance)
4. [Cross-check header application for that specific combo]
5. "Yes, these will fit with [specific mounts]. OR "You need [different headers] for that combo."

### Scenario 2: Carburetor Selection

**Customer**: "What size carburetor for my 350 SBC?"

**Response**:
1. "Is it stock or modified? What's the cam, heads, compression?"
2. "Street, strip, or both?"
3. [Calculate rough CFM: (CID × RPM × VE) / 3456]
4. "For a mild 350 street car, 600-650 CFM. For a built 350 strip car, 750-850 CFM."
5. [Recommend specific model based on budget and features]

### Scenario 3: Fuel Pump Sizing

**Customer**: "What fuel pump for 600 HP?"

**Response**:
1. "Carb or EFI?"
2. "Naturally aspirated or forced induction?"
3. [Calculate flow: ~0.5 lb/hr per HP for NA, ~0.6-0.7 for boosted]
4. "You'll need ~300 lb/hr (or ~50 GPH). This [pump model] flows [X] and will handle it."

### Scenario 4: Multi-Part Compatibility

**Customer**: "Building a fuel system - what do I need?"

**Response**:
1. Gather details (engine, HP, carb/EFI, tank setup)
2. Build complete parts list:
   - Fuel pump (size for HP)
   - Regulator (match to carb/EFI pressure)
   - Filter (10-micron for carb, finer for EFI)
   - Lines and fittings (size for flow, match threads)
3. Verify all parts work together (thread types, flow capacity, pressure range)
4. "Here's your complete system: [itemized list with part numbers]"

## Fitment Verification Tools

### Application Charts
- **Location**: Product pages, vendor catalogs, internal database
- **How to use**: Find vehicle/engine, cross-check part number
- **Limitations**: May not cover custom/swap applications

### Measurement & Specs
- **When needed**: Custom applications, clearance concerns
- **What to check**: Tube diameter, overall length, mounting bolt pattern, thread pitch
- **Customer provides**: Photos, measurements, existing part specs

### Community Knowledge
- **Forums**: Search for "LS swap 67 Camaro headers" to find proven combos
- **Build threads**: See what worked for similar builds
- **Vendor tech support**: Call manufacturer for edge cases

### Internal Knowledge Base
- Document proven combinations (this + that = works)
- Note common issues (X headers hit Y steering on Z chassis)
- Build institutional knowledge (share what you learn)

## When to Escalate

### Escalate to Tech Specialist When:
- Multiple compatibility factors (swap + mods + custom parts)
- Performance calculation required (cam selection, compression ratio, tuning)
- Safety concern (brake system, fuel system under boost, etc.)
- Customer wants engineering explanation or dyno data

### Escalate to Vendor When:
- Application not listed in chart (confirm if it will work)
- Conflicting information (chart says yes, but customer says no fit)
- Custom modification request (can vendor modify the part?)
- Warranty concern on fitment claim

## Fitment Issue Resolution

### If Part Doesn't Fit (Customer Reports)

**Step 1: Verify Details**
```
"Let's figure out what's going on:

1. Confirm the part number - is it [X]?
2. Confirm your application - [year, make, model, engine]?
3. What specifically doesn't fit? (bolt holes, clearance, threads, etc.)
4. Can you send a photo showing the issue?"
```

**Step 2: Diagnose Issue**
- Wrong part shipped? → Exchange immediately
- Customer has different application than stated? → Correct part, return wrong one
- Part doesn't match application chart? → Escalate to vendor
- Modification needed (not disclosed)? → Offer modification guide or alternative

**Step 3: Resolution**
- **Our error**: Free exchange, expedited shipping, apology
- **Customer error**: Standard return/exchange, help them get correct part
- **Vendor error**: Coordinate return/replacement, escalate to vendor
- **Modification path**: Provide resources, offer professional installer referral

## Compatibility Knowledge Building

### Personal Reference Sheet
Keep a running doc of:
- Common swaps and proven part combos
- Frequent fitment questions and answers
- "Gotchas" (X header won't fit with Y steering)
- Vendor contact info for tech support

### Team Knowledge Sharing
- Weekly meeting: "What new fitment issue did you solve?"
- Slack/email: "FYI: Customer confirmed [X] headers fit [Y] swap"
- Knowledge base: Document and tag for searchability

### Continuous Learning
- Read build threads and forums (see real-world applications)
- Attend vendor trainings (learn application details)
- Ask questions when escalating (learn from tech specialists)
- Document every compatibility call (build your mental database)

---
Status: Draft compatibility guide. Expand with specific application charts and reference links.

