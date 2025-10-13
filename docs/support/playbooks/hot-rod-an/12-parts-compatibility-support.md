---
epoch: 2025.10.E1
doc: docs/support/playbooks/hot-rod-an/12-parts-compatibility-support.md
owner: support
customer: Hot Rod AN
category: compatibility
last_reviewed: 2025-10-12
expires: 2026-01-12
tags: [compatibility, fitment, parts-selection, application-guide]
---

# Parts Compatibility Support Guide

**Customer**: Hot Rod AN  
**Purpose**: Help customers find the right AN fittings for their specific application  
**Target Audience**: Support operators (Level 2+)  
**Created**: October 12, 2025

---

## 🎯 Compatibility Framework

### The 3-Question Compatibility Check

**Question 1**: What are you connecting? (Component identification)  
**Question 2**: What port type does it have? (AN, NPT, or ORB)  
**Question 3**: What size fitting do you need? (Based on hose size and HP)

**Master These 3 Questions** → Solve 90% of compatibility inquiries

---

## 🔧 Common Compatibility Scenarios

### Scenario 1: Carburetor Inlet Compatibility

**Customer**: *"Will AN-6 fittings work with my Holley carburetor?"*

**Your Process**:
```
Step 1: Identify carburetor model
"Which Holley do you have? (600 CFM, 750 CFM, 850 CFM, etc.)"

Step 2: Look up inlet spec
Most Holley carburetors:
• Inlet size: 1/2"-20 inverted flare OR 7/8"-20 straight thread
• Port type: Inverted flare (NOT standard AN flare!)
• Requires: Holley-specific adapter

Step 3: Recommend correct adapter
"Your Holley has inverted flare inlets (different from AN).
You need:
• AN-6 to Holley inlet adapter (part #[X])
• Qty: 2 (one for each inlet)

These adapt your AN-6 line to the Holley's unique fitting."
```

**Common Carburetor Inlets**:
| Carburetor | Inlet Type | Adapter Needed |
|------------|------------|----------------|
| Holley (most) | 7/8"-20 or 1/2"-20 inverted | AN to Holley adapter |
| Edelbrock | 1/2" NPT | AN-6 to 1/2" NPT |
| Demon/Quick Fuel | 1/2"-20 or 9/16"-24 | AN to Demon adapter |

---

### Scenario 2: Fuel Pump Compatibility

**Customer**: *"What fittings for an Aeromotive A1000 fuel pump?"*

**Your Process**:
```
Step 1: Look up pump specs
Aeromotive A1000:
• Inlet: -10 ORB (O-Ring Boss)
• Outlet: -8 ORB
• Requires: AN to ORB adapters

Step 2: Match to customer's line size
"What size fuel lines are you running?"
Customer: "AN-8"

Step 3: Recommend correct fittings
"For your A1000 with AN-8 lines, you need:
• Inlet: AN-10 to -10 ORB adapter (inlet is larger!)
• Outlet: AN-8 to -8 ORB adapter
• Note: Pump inlet is larger than outlet (prevents cavitation)"
```

**Common Fuel Pump Port Types**:
| Pump | Inlet | Outlet | Adapter Type |
|------|-------|--------|--------------|
| Aeromotive A1000 | -10 ORB | -8 ORB | AN to ORB |
| Holley 12-series | -10 ORB | -8 ORB | AN to ORB |
| Walbro GSS342 | Barb | Barb | Barb to AN hose end |
| Carter P4070 | 3/8" NPT | 5/16" NPT | AN to NPT |

---

### Scenario 3: Fuel Pressure Regulator Compatibility

**Customer**: *"What fittings for my Aeromotive regulator?"*

**Common Regulators**:
```
Aeromotive Regulators (Bypass Style):
• Inlet: -6 ORB or -8 ORB
• Outlet: -6 ORB or -8 ORB  
• Return: -6 ORB or -8 ORB
• All use ORB ports!

Holley EFI Regulator:
• Inlet: -6 ORB
• Outlet: -6 ORB
• Return: -6 AN (one ORB, others AN!)

Generic Adjustable Regulators:
• Usually: 1/8" NPT or 1/4" NPT
• Requires: AN to NPT adapters
```

**Your Response**:
```
"Most Aeromotive regulators use ORB ports. You'll need:
• 3x AN-6 to -6 ORB adapters (inlet, outlet, return)
• OR 3x AN-8 to -8 ORB (if running AN-8 lines)

Which line size are you running? I'll confirm the exact adapters."
```

---

## 🧩 Fitment Verification Process

### When Customer Asks: "Will This Fit My [Component]?"

**Verification Steps**:
```
Step 1: Identify Component
"What brand and model is it?"
Example: "Holley 750 CFM carburetor"

Step 2: Research Port Type
• Check manufacturer specs (website, manual)
• Search our compatibility database
• Ask experienced operators if unsure

Step 3: Confirm with Customer
"Your Holley 750 has 7/8"-20 inverted flare inlets.
Can you verify that's what you have?"

Step 4: Recommend Correct Parts
"For that Holley, you need:
• AN-6 to Holley inlet adapter (part #[X])
• Qty: 2

These will adapt your AN-6 fuel line perfectly."

Step 5: Set Expectations
"With these adapters, your AN-6 line will screw right into
the carburetor. No modifications needed!"
```

---

## 🔄 Alternative Recommendations

### When Exact Part Is Unavailable

**Strategy**: Suggest functional alternative

**Example**:
```
Customer needs: AN-6 90° swivel (out of stock)

Alternatives:
1. AN-6 45° + AN-6 45° = effective 90° bend
2. AN-6 straight + flexible hose routing
3. AN-8 90° with AN-8 to AN-6 reducer (if inlet permits)

Your Response:
"The AN-6 90° swivel is backordered until [date]. Here are
alternatives that'll work:

Option 1 (BEST): Two AN-6 45° fittings
• Creates the same 90° bend
• In stock, ships today
• Same price as one 90°

Option 2: AN-6 straight + hose routing
• Route hose to make the turn
• Cheaper option
• Works if you have space

Option 3: Wait for restock
• Ships [date]
• Can do overnight when available

Which option works for your build?"
```

**Benefits**:
- Customer gets parts faster (no waiting for restock)
- Maintains sale (doesn't go to competitor)
- Shows expertise (know multiple solutions)

---

## 🏗️ Complete System Compatibility

### Helping Customers Build Complete Fuel Systems

**Customer**: *"I'm building a fuel system from scratch. What do I need?"*

**Your Process**:
```
Gather Requirements:
1. "What engine and HP?"
   Example: "Small block 350, 400 HP"

2. "Carburetor or EFI?"
   Example: "Holley 750 carburetor"

3. "What fuel pump?"
   Example: "Aeromotive A1000"

4. "Distance from tank to engine?"
   Example: "About 15 feet"

Based on answers, recommend complete system:

"Perfect! For your 400 HP small block with Holley 750 and A1000:

FUEL LINE:
• AN-6 braided line: 20 feet (15ft + 5ft extra for routing)

HOSE ENDS:
• AN-6 straight: Qty 4 (two per line if using feed + return)
• AN-6 90°: Qty 2 (for tight turns)

ADAPTERS:
• AN-10 to -10 ORB: Qty 1 (A1000 inlet - pump inlet is AN-10!)
• AN-8 to -8 ORB: Qty 1 (A1000 outlet)
• AN-6 to Holley inlet: Qty 2 (carburetor inlets)

FUEL PRESSURE REGULATOR:
• Adjustable AN-6 regulator (set to 6 PSI for Holley)
• AN-6 to -6 ORB adapters: Qty 3 (inlet, outlet, return)

ACCESSORIES:
• Inline fuel filter (AN-6, 100+ GPH)
• Fuel pressure gauge (0-15 PSI)

Would you like me to create a complete kit for you? I can bundle
everything and save you about 10%."
```

---

## ⚙️ Special Compatibility Scenarios

### LS Swap Compatibility

**Common Question**: *"I'm LS-swapping. What fuel system works?"*

**LS-Specific Considerations**:
```
If Keeping Stock EFI:
• Need high-pressure pump (58 PSI, not 5-7 PSI!)
• AN-8 feed line recommended (high-pressure EFI flow)
• No carburetor adapters (uses stock injectors)
• Fuel pressure regulator: EFI-specific

If Converting to Carb:
• Standard carburetor fuel system
• 5-7 PSI fuel pressure
• AN-6 or AN-8 feed line (depending on HP)
• Holley/Edelbrock carburetor adapters

Your Response:
"Are you keeping the LS EFI or converting to carburetor?

That determines your whole fuel system approach!"
```

---

### Forced Induction Compatibility

**Turbo/Supercharger Applications**: Different requirements!

**Key Differences**:
- Higher HP = larger lines (AN-8, AN-10, or dual AN-8)
- Higher fuel pressure (8-12 PSI for carb, 58-75 PSI for EFI)
- Boost-referenced regulators (fuel pressure rises with boost)

**Escalation**: Forced induction >600 HP → Escalate to technical support

**Why**: Complex system design beyond playbook scope

---

## 📋 Compatibility Resources

**Keep These Handy**:
1. Carburetor inlet spec sheet (Holley, Edelbrock, Demon)
2. Fuel pump port chart (Aeromotive, Holley, Walbro)
3. AN sizing chart (hose size to AN size)
4. Thread type guide (NPT, ORB, AN comparison)

**When Unsure**:
- Ask experienced operator
- Check manufacturer website/manual
- Escalate to technical support (better than guessing!)

---

**Last Updated**: October 12, 2025  
**Document Owner**: Support Agent  
**Review Frequency**: Quarterly  
**Next Review**: January 12, 2026

**Questions?** Email support@hotrodan.com

