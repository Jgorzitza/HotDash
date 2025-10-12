---
epoch: 2025.10.E1
doc: docs/support/playbooks/hot-rod-an/06-chatwoot-macros.md
owner: support
customer: Hot Rod AN
category: chatwoot_macros
last_reviewed: 2025-10-12
expires: 2026-01-12
tags: [chatwoot, macros, templates, automation]
---

# Chatwoot Macros - Hot Rod AN Support

**Customer**: Hot Rod AN  
**Purpose**: Pre-built Chatwoot response templates for common support scenarios  
**Target Audience**: Customer Support Operators using Chatwoot  
**Integration**: Chatwoot macro library  

---

## Overview

This document contains **ready-to-use Chatwoot macros** for Hot Rod AN support. Each macro is based on gold reply templates from the playbook system.

### How to Use
1. Copy macro content into Chatwoot macro editor
2. Variables are marked with `{{variable}}` format
3. Replace variables before sending (or use Chatwoot variable substitution)
4. Customize tone/wording as needed for specific customer

### Macro Naming Convention
```
HOTROD-[CATEGORY]-[SPECIFIC_TOPIC]

Examples:
HOTROD-SIZE-AN6-CONVERSION
HOTROD-LEAK-UNDERTIGHTENED
HOTROD-INSTALL-BRAIDED-HOSE
```

---

## Category: Sizing & Product Selection

### Macro: HOTROD-SIZE-WHAT-SIZE-NEEDED
**Use When**: Customer asks "What size AN fitting do I need?"

**Macro Content**:
```
Hi {{customer.first_name}},

Great question! The right AN fitting size depends on your application and horsepower:

**Most Common Sizes:**
• AN-6 (3/8"): Standard for most hot rods up to 400 HP
• AN-8 (1/2"): High-performance builds, 400-700 HP
• AN-10 (5/8"): Racing applications, 700+ HP

**To recommend the exact size, I need to know:**
1. What are you connecting? (fuel line, oil cooler, etc.)
2. What's your engine horsepower?
3. What's your current hose size? (if replacing existing)

Once I have this info, I'll make sure you get exactly what you need!

Best,
{{agent.name}}
```

---

### Macro: HOTROD-SIZE-AN6-EXPLANATION
**Use When**: Customer asks "Will AN-6 fit my 3/8" line?"

**Macro Content**:
```
Hi {{customer.first_name}},

Yes! AN-6 fittings are designed for 3/8" inside diameter hose, so you're on the right track.

However, the connection method depends on your hose type:

**1. Braided Stainless Hose:**
   • Use reusable AN-6 hose ends (screw-on assembly)
   • Professional appearance
   • Best for show cars and visible installations

**2. Push-Lock Hose:**
   • Use AN-6 barbed fittings
   • Push hose onto barbs (no clamps needed)
   • Budget-friendly and easy to install

**3. Standard Rubber Hose:**
   • Use AN-6 hose ends for rubber hose
   • May require hose clamps
   • Least expensive option

Which type of hose are you planning to use? I'll recommend the exact fittings you need.

Best,
{{agent.name}}
```

---

### Macro: HOTROD-SIZE-CARBURETOR-ADAPTER
**Use When**: Customer asks about carburetor fitting size

**Macro Content**:
```
Hi {{customer.first_name}},

Most carburetors don't have direct AN fittings—you'll need an adapter. Here's what you need to know:

**Holley Carburetors (Most Common):**
• Inlet thread: 5/8"-18
• You need: AN-6 to 5/8"-18 adapter
• Part number: [INSERT PART NUMBER]

**Edelbrock Carburetors:**
• Inlet thread: 7/8"-20
• You need: AN-6 to 7/8"-20 adapter
• Part number: [INSERT PART NUMBER]

**Could you share your carburetor brand and model number?** I'll confirm the exact adapter you need and make sure you get the right part the first time.

Best,
{{agent.name}}
```

---

## Category: Troubleshooting - Leaks

### Macro: HOTROD-LEAK-UNDERTIGHTENED
**Use When**: Customer reports fuel leak from AN fitting

**Macro Content**:
```
Hi {{customer.first_name}},

Thanks for reaching out about the fuel leak. Let's start with the most common cause—tightening.

AN fittings need proper torque to seal correctly. Here's how to fix it:

**Steps to Tighten:**
1. **Safety First:** Turn off fuel pump and relieve fuel pressure
2. **Two Wrenches:** Use one on each side of the connection
3. **Tighten:** Snug, then add 1/8 to 1/4 turn more
4. **Test:** Turn on fuel pump and check for leaks

⚠️ **Important:** Don't over-tighten! More than 1/4 turn past snug can damage the flare and make the leak worse.

Try this and let me know if the leak stops. If it's still leaking, we'll move to the next diagnostic step.

Best,
{{agent.name}}
```

---

### Macro: HOTROD-LEAK-DAMAGED-FLARE
**Use When**: Leak persists after proper tightening

**Macro Content**:
```
Hi {{customer.first_name}},

If tightening didn't solve the leak, the flare surface might be damaged. Here's how to check:

**Inspection Steps:**
1. Turn off fuel system and relieve pressure
2. Disconnect the leaking fitting
3. Look closely at the 37° cone (the angled part that seals)
4. Check for:
   • Scratches or gouges
   • Dents or deformations
   • Dirt, debris, or old sealant

**If you see damage:** The fitting needs to be replaced. Unfortunately, damaged flares can't be repaired—they need a new fitting.

**If it looks perfect:** The issue might be with the mating surface (the part it connects to). Check that side as well.

I can help you identify the exact replacement part. Could you share:
• AN size (e.g., AN-6, AN-8)
• Fitting type (straight, 45°, 90°)
• Photo of the fitting (if possible)

I'll get you the right replacement ASAP!

Best,
{{agent.name}}
```

---

### Macro: HOTROD-LEAK-WRONG-FITTING-TYPE
**Use When**: Customer trying to seal incompatible fitting types

**Macro Content**:
```
Hi {{customer.first_name}},

Based on your description, I suspect you might have a fitting mismatch. Let me explain:

**Three Common Port Types:**

1. **AN Flare:** 37° cone, seals metal-to-metal (no O-ring)
2. **ORB (O-Ring Boss):** Straight threads with O-ring groove
3. **NPT (Pipe Thread):** Tapered threads, requires sealant

**The Problem:** You can't seal an AN fitting into an ORB or NPT port—they're not compatible! No amount of tightening will fix this.

**The Solution:** You need an adapter to match your port type.

Could you tell me what component you're connecting to?
• Fuel pump brand/model?
• Fuel pressure regulator?
• Carburetor?

I'll identify the exact adapter you need. This is a super common issue and easy to fix with the right part!

Best,
{{agent.name}}
```

---

## Category: Installation Help

### Macro: HOTROD-INSTALL-BASIC-FITTING
**Use When**: Customer needs basic installation guidance

**Macro Content**:
```
Hi {{customer.first_name}},

Happy to help you install your AN fittings! Here's the step-by-step process:

**Installation Steps:**

1. **Clean Everything:**
   • Spray threads with brake cleaner
   • Wipe with clean cloth
   • Inspect for debris

2. **Hand Start (IMPORTANT!):**
   • Turn counter-clockwise until you feel a "click" (finds starting point)
   • NOW turn clockwise—should thread smoothly
   • Do 3-4 turns by hand (no wrench yet!)

3. **Hand Tighten:**
   • Continue threading until snug (can't turn easily by hand)

4. **Wrench Tighten:**
   • Use two wrenches (one on each side)
   • Tighten until snug, then 1/8 to 1/4 turn more
   • STOP—don't over-tighten!

5. **Test for Leaks:**
   • Pressurize system
   • Check all connections
   • Tighten slightly if needed

**Key Tips:**
• Always start by hand (prevents cross-threading)
• No thread sealant needed (AN fittings seal at the flare, not threads)
• Two wrenches prevent twisting the component

Let me know if you run into any issues!

Best,
{{agent.name}}
```

---

### Macro: HOTROD-INSTALL-BRAIDED-HOSE
**Use When**: Customer needs to assemble braided hose ends

**Macro Content**:
```
Hi {{customer.first_name}},

Braided hose assembly is straightforward once you know the steps. Here's how:

**Assembly Process:**

1. **Cut Hose Cleanly:**
   • Measure needed length + 2" for fittings
   • Cut with sharp blade (clean, square cut)

2. **Push Back Outer Braid:**
   • Push stainless braid back 1/2" to expose liner
   • You should see the inner rubber/PTFE liner

3. **Trim Inner Liner:**
   • Cut ONLY the liner (not braid) 1/4" from end
   • This creates space for nipple to grip

4. **Install Socket:**
   • Slide socket over hose (threads facing cut end)
   • Push until it bottoms out

5. **Thread Nipple:**
   • Screw nipple into socket (clockwise)
   • You'll feel resistance as it pushes onto liner
   • Tighten until fully seated (use wrench for final 1/8 turn)

6. **Verify:**
   • Tug test—hose shouldn't pull out
   • No gaps between nipple and socket

**Common Mistake:** Not removing the 1/4" of inner liner. The nipple MUST push onto bare liner to seal properly!

Need photos or a video? I can send our detailed assembly guide with pictures.

Best,
{{agent.name}}
```

---

## Category: Fuel System Issues

### Macro: HOTROD-FUEL-STARVATION
**Use When**: Customer reports engine dying at high RPM

**Macro Content**:
```
Hi {{customer.first_name}},

Engine starvation at high RPM usually means your fuel system can't flow enough fuel. Let's diagnose:

**Questions to Identify the Issue:**
1. What size is your fuel line? (AN-4, AN-6, AN-8?)
2. How much horsepower is your engine?
3. What type of fuel pump? (mechanical or electric?)
4. Where is your fuel filter? (before or after pump?)

**Common Causes:**

**1. Undersized Fuel Line:**
   • 150-400 HP needs AN-6 minimum
   • 400-700 HP needs AN-8
   • 700+ HP needs AN-10

**2. Restricted Fuel Filter:**
   • Should be AFTER pump (not before)
   • Must be high-flow (100+ GPH)
   • May be clogged (replace every 2 years)

**3. Weak Fuel Pump:**
   • Mechanical pumps max out around 300 HP
   • Electric pumps better for high-performance

Once you share your current setup, I can pinpoint the exact problem and recommend the upgrade you need.

Best,
{{agent.name}}
```

---

### Macro: HOTROD-FUEL-PRESSURE-TOO-HIGH
**Use When**: Customer reports carburetor flooding

**Macro Content**:
```
Hi {{customer.first_name}},

Carburetor flooding is usually caused by fuel pressure that's too high. Let's check:

**What's Your Fuel Pressure?**
(If you don't have a gauge, we need to install one first!)

**Correct Pressure by Carburetor:**
• Holley: 5-7 PSI
• Edelbrock: 4-6 PSI
• Demon/Quick Fuel: 6-8 PSI

**If You Have an Electric Pump:**
Most run 10-15 PSI (WAY too high for carburetors!). You NEED a fuel pressure regulator.

**The Solution:**
Install an adjustable fuel pressure regulator:
• Mounts between pump and carburetor
• Dial in exact pressure your carb needs
• Return line sends excess fuel back to tank

**What You Need:**
• AN-6 adjustable fuel pressure regulator
• Fuel pressure gauge (to set accurately)
• AN-4 return line to tank (optional but recommended)

I can set you up with a complete regulator kit. What AN size are your fuel lines?

Best,
{{agent.name}}
```

---

### Macro: HOTROD-FUEL-HARD-START-COLD
**Use When**: Customer reports long cranking before engine fires

**Macro Content**:
```
Hi {{customer.first_name}},

Long cranking before starting usually means fuel is draining back to the tank when the car sits. Here's the fix:

**The Problem:**
Gravity drains fuel from the carburetor bowl back to the tank overnight. Next start = empty bowl = long cranking to refill.

**The Solution:**
Install an inline check valve between the fuel pump and carburetor:
• Allows fuel to flow forward only
• Keeps carburetor bowl full when sitting
• Quick starts every time

**Part You Need:**
AN-6 inline check valve (matches your fuel line size)

**Installation:**
Super easy—installs in your fuel line between pump and carburetor. Takes about 30 minutes.

I can send you the exact part with installation instructions. What size are your fuel lines (AN-6 or AN-8)?

Best,
{{agent.name}}
```

---

## Category: Technical Questions

### Macro: HOTROD-TECH-THREAD-SEALANT
**Use When**: Customer asks if they need thread sealant

**Macro Content**:
```
Hi {{customer.first_name}},

Great question! **No thread sealant needed for AN fittings.**

Here's why:

**AN Fittings:**
• Use 37° flare seal (metal-to-metal)
• Seal happens at the flare cone, NOT the threads
• Threads just hold the fitting in place
• Sealant actually PREVENTS proper sealing

**EXCEPTION—NPT Adapters:**
If you're using NPT (pipe thread) adapters, those DO require sealant:
• NPT threads are tapered and seal via the threads
• Use Teflon tape (2-3 wraps) or liquid sealant
• Apply to NPT threads only, never to AN flare surfaces

**Bottom Line:**
• AN flare to AN flare = NO sealant ✅
• NPT adapter threads = YES sealant ✅

Need help identifying if you have NPT adapters? Send me a photo and I'll confirm!

Best,
{{agent.name}}
```

---

### Macro: HOTROD-TECH-REUSABLE
**Use When**: Customer asks if fittings can be reused

**Macro Content**:
```
Hi {{customer.first_name}},

Yes! One of the best features of AN fittings is that they're **fully reusable.**

**Reusability:**
• Can be taken apart and reassembled multiple times
• Metal-to-metal seal reforms each time
• Recommended: 3-5 assembly cycles before replacement

**Best Practices for Reuse:**
• Inspect the 37° flare for damage before reusing
• Clean with brake cleaner
• Check threads for cross-threading
• Replace if you see visible damage

**When to Replace:**
• Deep scratches on flare cone
• Damaged or crossed threads
• Corrosion on sealing surfaces
• After 5+ disassembly cycles (preventive)

Want me to check if we have replacements in stock just in case?

Best,
{{agent.name}}
```

---

### Macro: HOTROD-TECH-WONT-THREAD
**Use When**: Customer reports fitting won't thread on

**Macro Content**:
```
Hi {{customer.first_name}},

STOP! Don't force it. Cross-threading can ruin both parts. Here's how to fix it:

**Recovery Steps:**

1. **Back Out Carefully:**
   • Turn counter-clockwise slowly
   • Don't force it

2. **Inspect Threads:**
   • Look for bent or damaged threads
   • Clean with brake cleaner if dirty

3. **Try Again the RIGHT Way:**
   • Start by hand (no wrench!)
   • Turn counter-clockwise until you feel it "click" into place
   • NOW turn clockwise—should thread smoothly
   • Use wrench only after it's hand-tight

**If Threads Are Damaged:**
The fitting needs to be replaced. I can help you identify the right part and get it shipped out today.

**Prevention:**
Always start AN fittings by hand first. Never start with a wrench!

Let me know if this works or if you need a replacement.

Best,
{{agent.name}}
```

---

## Category: Order & Shipping

### Macro: HOTROD-ORDER-WRONG-SIZE
**Use When**: Customer ordered wrong size fitting

**Macro Content**:
```
Hi {{customer.first_name}},

No problem—sizing mix-ups happen all the time with AN fittings! Let's get you the right size.

**To Process Exchange:**
Please measure and confirm:
1. **Hose inside diameter:** _____ inches (not outside!)
2. **Component port:** What are you connecting to?
3. **Current fitting:** What size did you receive? (check box/part number)

**Quick Sizing Guide:**
• 3/8" hose = AN-6 (most common for fuel feed)
• 1/4" hose = AN-4 (common for fuel return)
• 1/2" hose = AN-8 (large fuel systems)

**Exchange Process:**
1. I'll send correct size immediately
2. Return incorrect size with prepaid label (included)
3. No restocking fee for unused fittings

Once I have those measurements, I'll get the right parts shipped out today!

Best,
{{agent.name}}
```

---

### Macro: HOTROD-ORDER-SHIPPING-STATUS
**Use When**: Customer asks about shipping status

**Macro Content**:
```
Hi {{customer.first_name}},

Let me check on your order status!

**Order Number:** {{ticket.custom_attributes.order_number}}

**Shipping Details:**
• Status: [SHIPPED / PROCESSING / PENDING]
• Carrier: [USPS / UPS / FedEx]
• Tracking Number: [TRACKING_NUMBER]
• Expected Delivery: [DATE]

**Track Your Order:**
[TRACKING_LINK]

**Need It Faster?**
If you need expedited shipping, let me know and I can see what options we have available.

Is there anything else I can help you with?

Best,
{{agent.name}}
```

---

## Category: Returns & Exchanges

### Macro: HOTROD-RETURN-POLICY
**Use When**: Customer asks about return policy

**Macro Content**:
```
Hi {{customer.first_name}},

We have a hassle-free return and exchange policy!

**Return Policy:**
• **Timeframe:** 30 days from purchase
• **Condition:** Unused, in original packaging
• **Refund:** Full refund or exchange
• **Shipping:** We cover return shipping for wrong/defective items

**Exchange Process:**
1. Contact us with order number
2. We send correct item immediately
3. Return incorrect item with prepaid label

**Used Fittings:**
If fittings have been installed but are defective, we'll still work with you! We just need photos showing the defect.

**To Start Return/Exchange:**
Please provide:
• Order number
• Reason for return
• Condition of items (unused vs. installed)

I'll get this processed right away!

Best,
{{agent.name}}
```

---

## Macro Variables Reference

### Available Chatwoot Variables
```
{{customer.first_name}}     - Customer first name
{{customer.last_name}}      - Customer last name
{{customer.email}}          - Customer email address
{{agent.name}}              - Support operator name
{{agent.email}}             - Support operator email
{{ticket.id}}               - Ticket/conversation ID
{{ticket.custom_attributes.order_number}} - Order number (if captured)
```

### Custom Variables to Replace Manually
```
{{horsePower}}              - Customer's engine horsepower
{{currentLineSize}}         - Current fuel line size (AN-4, AN-6, etc.)
{{recommendedSize}}         - Recommended upgrade size
{{productSize}}             - AN fitting size ordered
{{delayDays}}               - Number of days order delayed
{{carrierName}}             - Shipping carrier name
{{followUpHours}}           - Response timeline commitment
```

---

## Macro Management Best Practices

### Creating New Macros
1. Base on successful customer interactions (gold replies)
2. Use clear, conversational language (English-only)
3. Include all necessary context
4. Add helpful formatting (bullets, bold, spacing)
5. Test with at least 3 operators before deployment

### Updating Existing Macros
1. Track macro usage and customer response
2. Update monthly based on feedback
3. A/B test significant changes
4. Archive outdated macros (don't delete immediately)

### Quality Standards
- ✅ Professional but friendly tone
- ✅ Clear action items for customer
- ✅ Educational (explain why, not just what)
- ✅ Formatted for easy scanning
- ✅ Under 300 words (exceptions for technical guides)
- ✅ No jargon without explanation

---

## Related Documentation

- **Gold Reply Source**: `02-an-fittings-troubleshooting.md`, `05-an-fittings-faq.md`
- **Chatwoot Setup**: `docs/runbooks/support_gold_replies.md`
- **Escalation Workflow**: `docs/runbooks/cx_escalations.md`
- **Playbook Master Index**: `README.md`

---

**Last Updated**: October 12, 2025  
**Document Owner**: Support Agent  
**Review Frequency**: Monthly  
**Next Review**: November 12, 2025

**Feedback**: Submit new macro requests or improvements to support@hotrodan.com

