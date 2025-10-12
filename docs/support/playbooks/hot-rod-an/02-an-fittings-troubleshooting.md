---
epoch: 2025.10.E1
doc: docs/support/playbooks/hot-rod-an/02-an-fittings-troubleshooting.md
owner: support
customer: Hot Rod AN
category: troubleshooting
last_reviewed: 2025-10-12
expires: 2026-01-12
tags: [an-fittings, troubleshooting, technical-support, leak-diagnosis]
---

# AN Fittings Troubleshooting Guide

**Customer**: Hot Rod AN  
**Purpose**: Systematic troubleshooting for AN fitting issues  
**Target Audience**: Customer Support Operators, Technical Support Staff  
**Difficulty**: Intermediate to Advanced  

---

## Troubleshooting Framework

### The 5-Step Diagnostic Process

1. **IDENTIFY**: What is the customer experiencing?
2. **ISOLATE**: Where exactly is the problem occurring?
3. **DIAGNOSE**: What is the root cause?
4. **RESOLVE**: What actions will fix it?
5. **VERIFY**: How will we confirm it's fixed?

**Operator Note**: Walk through each step with the customer. Don't jump to solutions before proper diagnosis.

---

## Issue #1: Fuel Leaks at AN Fitting Connection

### Symptoms
- Fuel seeping from fitting connection
- Fuel smell in engine bay
- Puddle under vehicle after sitting
- Visible fuel wetness on fittings

### Diagnostic Questions

**Ask the customer:**
1. "Where exactly is the leak coming from? (carburetor, fuel pump, inline connection)"
2. "Did you recently install or adjust this fitting?"
3. "Is it a slow seep or active drip?"
4. "Can you tighten it more, or is it already very tight?"
5. "Is this a new fitting or has it worked fine until now?"

### Common Causes & Solutions

#### Cause 1: Under-Tightened Fitting
**Symptoms**: Fitting looks loose, can easily turn by hand  
**Root Cause**: Customer didn't tighten enough (common with first-time installers)  

**Solution:**
```
1. Turn off fuel system and relieve pressure
2. Tighten fitting snug with wrench
3. Add 1/8 to 1/4 turn past snug
4. Check for leaks with fuel pressure on
5. If still leaking, proceed to next cause
```

**Gold Reply Template:**
```
Hi {{customerName}},

Thanks for reaching out about the fuel leak. Let's start with the most common cause - tightening.

AN fittings need proper torque to seal correctly. Here's the process:

1. **Safety First**: Turn off fuel pump and relieve fuel pressure
2. **Tighten**: Use two wrenches (one on each side of the connection)
3. **Torque**: Snug, then 1/8 to 1/4 turn more
4. **Test**: Turn on fuel pump and check for leaks

⚠️ **Don't over-tighten!** More than 1/4 turn past snug can damage the flare.

Try this and let me know if the leak stops. If not, we'll move to the next diagnostic step.

{{operatorName}}
```

#### Cause 2: Damaged Flare Surface
**Symptoms**: Leak persists after proper tightening  
**Root Cause**: Scratched, dented, or deformed 37° flare cone  

**Diagnostic Steps:**
1. Remove fitting and inspect flare visually
2. Look for scratches, dents, or irregularities
3. Check for debris (dirt, metal shavings, old gasket material)
4. Feel flare surface with fingernail (should be perfectly smooth)

**Solution:**
```
If flare is damaged:
→ REPLACE fitting (damaged flares cannot be repaired)
→ Clean mating surface thoroughly
→ Install new fitting with proper torque

Part to order: New AN-[size]-[type] fitting
```

**Gold Reply Template:**
```
Hi {{customerName}},

If tightening didn't solve the leak, the flare surface might be damaged. Here's how to check:

**Inspection Steps:**
1. Turn off fuel system and relieve pressure
2. Disconnect the leaking fitting
3. Look closely at the 37° cone (the angled part that seals)
4. Check for:
   • Scratches or gouges
   • Dents or deformations
   • Dirt, debris, or old sealant

**If you see damage**: The fitting needs to be replaced. Damaged flares can't be repaired.

**If it looks perfect**: The issue might be with the mating surface (the part it connects to). Check that side as well.

I can help you identify the exact replacement part. Could you share:
• AN size (e.g., AN-6, AN-8)
• Fitting type (straight, 45°, 90°)
• Photo of the fitting (if possible)

I'll make sure you get the right replacement!

{{operatorName}}
```

#### Cause 3: Over-Tightened (Damaged Threads or Flare)
**Symptoms**: Fitting extremely tight but still leaking  
**Root Cause**: Customer over-tightened, crushing the flare or damaging threads  

**Diagnostic Clues:**
- Fitting requires excessive force to turn
- Threads feel "gritty" or rough when turning
- Flare looks flattened or deformed
- Aluminum fitting shows cracks or stress marks

**Solution:**
```
1. Remove over-tightened fitting (may require vice grips if severely stuck)
2. Inspect both male and female threads for damage
3. Inspect flare for crushing or deformation
4. Replace damaged components (both if threads are damaged)
5. Educate customer on proper torque technique
```

**Gold Reply Template:**
```
Hi {{customerName}},

It sounds like the fitting might have been over-tightened, which can actually cause leaks by damaging the flare or threads.

**Signs of Over-Tightening:**
• Fitting extremely hard to turn
• Threads feel rough or gritty
• Flare looks flattened
• Aluminum shows cracks

**Solution:**
1. Remove the fitting carefully (don't force it if severely stuck)
2. Inspect threads on both sides
3. Replace if damaged

**Going Forward**: AN fittings should be "snug + 1/8 turn". If you're cranking with all your strength, it's too much!

Would you like me to send replacement fittings? I can also include a torque spec guide so this doesn't happen again.

{{operatorName}}
```

#### Cause 4: Wrong Fitting Type (Flare vs ORB vs NPT)
**Symptoms**: No amount of tightening stops leak  
**Root Cause**: Customer trying to seal incompatible fitting types  

**Diagnostic Questions:**
- "What are you connecting to? (carburetor, fuel pump, regulator)"
- "Does the fitting have O-ring grooves or flat flare surfaces?"
- "Are the threads straight (AN) or tapered (NPT)?"

**Common Mismatches:**
- AN flare fitting into ORB (O-Ring Boss) port → needs ORB fitting
- AN fitting into NPT port → needs NPT to AN adapter
- AN-6 fitting into inverted flare (brake line) → needs inverted flare adapter

**Solution:**
```
1. Identify port type on component (ORB, NPT, or AN)
2. Order correct adapter or fitting type
3. Install proper fitting with appropriate sealing method:
   • AN flare = metal-to-metal seal (no sealant)
   • ORB = O-ring seal
   • NPT = thread sealant required
```

**Gold Reply Template:**
```
Hi {{customerName}},

Based on your description, I suspect you might have a fitting mismatch. Let me explain:

**Three Common Port Types:**

1. **AN Flare**: 37° cone, seals metal-to-metal (no O-ring)
2. **ORB (O-Ring Boss)**: Straight threads with O-ring groove
3. **NPT (Pipe Thread)**: Tapered threads, requires sealant

**The Problem**: You can't seal an AN fitting into an ORB or NPT port—they're not compatible!

**Solution**: We need an adapter to match your port type.

Could you tell me what component you're connecting to?
• Fuel pump brand/model?
• Fuel pressure regulator?
• Carburetor?

I'll identify the exact adapter you need. This is a common issue and easy to fix with the right part!

{{operatorName}}
```

#### Cause 5: Debris or Contamination
**Symptoms**: Intermittent leak, sometimes seals properly  
**Root Cause**: Dirt, metal shavings, or debris preventing proper seal  

**Solution:**
```
1. Disassemble fitting completely
2. Clean both flare surfaces with brake cleaner
3. Inspect for debris (use compressed air to blow out)
4. Check for embedded particles in soft aluminum
5. Reassemble with clean, dry surfaces
6. Tighten to proper torque
```

**Gold Reply Template:**
```
Hi {{customerName}},

Debris between the flare surfaces can prevent a proper seal. Let's clean it and try again:

**Cleaning Steps:**
1. Disconnect the fitting
2. Spray both sealing surfaces with brake cleaner
3. Wipe with clean, lint-free cloth
4. Use compressed air to blow out any hidden debris
5. Inspect for embedded particles (tiny metal shavings)
6. Reassemble dry (no sealant!)

**Pro Tip**: Work in a clean environment. Even a tiny speck of dirt can cause a leak with AN fittings.

Try this cleaning process and let me know if it solves the issue!

{{operatorName}}
```

---

## Issue #2: Fitting Won't Thread On (Cross-Threading)

### Symptoms
- Fitting won't screw on smoothly
- Threads feel "crunchy" or stuck
- Fitting goes on crooked
- Excessive force needed to turn

### Diagnostic Questions

**Ask the customer:**
1. "Does it thread on smoothly for the first few turns?"
2. "Did you start it by hand or immediately use a wrench?"
3. "Does it feel stuck or like the threads are grinding?"
4. "Is this a new fitting or one you've used before?"

### Common Causes & Solutions

#### Cause 1: Cross-Threaded During Installation
**Root Cause**: Customer started threading at wrong angle or forced it  

**Solution:**
```
1. STOP immediately (don't force it!)
2. Back out the fitting carefully
3. Inspect threads for damage
4. If threads OK: Start by hand, turning counter-clockwise until you feel a "click"
5. Then turn clockwise, threading on smoothly
6. If threads damaged: Replace fitting
```

**Gold Reply Template:**
```
Hi {{customerName}},

STOP! Don't force it. Cross-threading can ruin both parts. Here's the fix:

**Recovery Steps:**
1. **Back out carefully**: Turn counter-clockwise slowly
2. **Inspect threads**: Look for bent or damaged threads
3. **Try again the right way**:
   • Start by hand (no wrench yet!)
   • Turn counter-clockwise until you feel it "click" into place
   • Now turn clockwise—should thread smoothly
   • Use wrench only after it's hand-tight

**If threads are damaged**: You'll need a replacement. I can help you identify the part.

**Prevention**: Always start AN fittings by hand first!

Let me know if this works or if you need a replacement.

{{operatorName}}
```

#### Cause 2: Aluminum Threads with Debris
**Root Cause**: Metal shavings or dirt in soft aluminum threads  

**Solution:**
```
1. Remove fitting
2. Clean threads with brake cleaner and wire brush
3. Use compressed air to blow out debris
4. Apply anti-seize compound to threads (NOT sealing surface!)
5. Thread on by hand first
```

**Gold Reply Template:**
```
Hi {{customerName}},

Aluminum threads can collect debris that makes threading difficult. Here's the fix:

**Cleaning Process:**
1. Spray threads with brake cleaner
2. Use a soft wire brush to clean threads
3. Blow out with compressed air
4. Apply a TINY bit of anti-seize to threads (not the flare!)
5. Thread on by hand first

⚠️ **Important**: Anti-seize goes on threads only, NOT on the 37° flare sealing surface!

This should make threading smooth and easy.

{{operatorName}}
```

---

## Issue #3: Fitting Loosens Over Time (Vibration)

### Symptoms
- Fitting was tight initially, now leaking
- Fitting feels loose after driving
- Leak appears after engine running

### Diagnostic Questions

**Ask the customer:**
1. "How long has the system been installed?"
2. "Is the fitting on a component that vibrates (fuel pump, engine mount)?"
3. "Did you use any locking mechanism (safety wire, lock washers)?"
4. "Does it leak immediately or only after driving?"

### Solution

**Short-term Fix:**
```
Re-tighten fitting to proper torque
```

**Long-term Fix:**
```
Install vibration-resistant solution:
1. Replace with swivel fitting (absorbs vibration)
2. Add rubber-isolated mounting for vibrating components
3. Use safety wire on critical connections (racing applications)
4. Apply thread locker to threads (NOT sealing surface)
```

**Gold Reply Template:**
```
Hi {{customerName}},

Vibration can loosen AN fittings over time, especially on fuel pumps or components mounted to the engine. Here's how to fix it:

**Immediate Fix:**
1. Re-tighten to proper torque
2. Check after your next drive

**Permanent Solution (if it keeps loosening):**
1. **Swivel Fittings**: Absorb vibration, stay tight
2. **Rubber Isolation**: Mount vibrating components on rubber mounts
3. **Thread Locker**: Apply to threads (blue Loctite 242, NOT on the flare!)
4. **Safety Wire**: For racing applications

For most hot rods, switching to swivel fittings solves this permanently.

Would you like me to find the swivel version of your current fitting?

{{operatorName}}
```

---

## Issue #4: Fitting Leaked After Disassembly/Reassembly

### Symptoms
- Fitting sealed fine originally
- Leak started after taking apart and reassembling
- No visible damage to fitting

### Diagnostic Questions

**Ask the customer:**
1. "How many times have you taken this fitting apart?"
2. "Did you inspect the flare before reassembling?"
3. "Did you clean the surfaces before reassembly?"
4. "Did you apply any sealant (you shouldn't)?"

### Common Causes & Solutions

#### Cause 1: Flare Damage During Disassembly
**Solution**: Inspect and replace if damaged  

#### Cause 2: Dirt Introduced During Reassembly
**Solution**: Clean both surfaces thoroughly  

#### Cause 3: Fitting Reused Too Many Times
**Solution**: Replace after 3-5 cycles (preventive maintenance)  

**Gold Reply Template:**
```
Hi {{customerName}},

AN fittings are reusable, but they can degrade after multiple assembly cycles. Let's troubleshoot:

**Check These:**
1. **Flare Condition**: Look for tiny scratches or deformation
2. **Cleanliness**: Clean with brake cleaner before reassembly
3. **Reuse Count**: If you've taken this apart 5+ times, consider replacing it

**Best Practice for Reassembly:**
• Clean both sealing surfaces
• Inspect for damage
• Reassemble dry (no sealant)
• Torque properly

If inspection shows damage, I recommend replacing the fitting. After 3-5 disassembly cycles, it's good practice to replace as preventive maintenance.

Would you like me to send a replacement just in case?

{{operatorName}}
```

---

## Issue #5: Wrong Size Fitting Ordered

### Symptoms
- Customer received fitting but it doesn't fit their hose
- Threads don't match component
- Fitting too large or small

### Diagnostic Process

**Key Questions:**
1. "What size hose are you using? (measure inside diameter)"
2. "What component are you connecting to?"
3. "What size did you order?"
4. "Do you have the part number from your order?"

**Common Mistakes:**
- Customer measured outside diameter instead of inside
- Customer assumed "6mm = AN-6" (it's actually 3/8" = AN-6)
- Customer ordered hose end size instead of adapter size

**Solution Process:**
```
1. Confirm hose inside diameter (3/16", 1/4", 3/8", 1/2")
2. Match to correct AN size:
   • 3/16" = AN-3
   • 1/4" = AN-4
   • 3/8" = AN-6
   • 1/2" = AN-8
3. Confirm component port size/type (AN, NPT, ORB)
4. Identify correct fitting or adapter
5. Process exchange/return if wrong size ordered
```

**Gold Reply Template:**
```
Hi {{customerName}},

No problem—sizing mix-ups are really common with AN fittings! Let's figure out the right size:

**Please measure:**
1. **Hose inside diameter** (not outside): _____ inches
2. **Component port**: What brand/model are you connecting to?
3. **Current fitting**: What size did you receive? (check box or part number)

**Quick Sizing Guide:**
• 3/8" hose = AN-6 (most common for fuel feed)
• 1/4" hose = AN-4 (common for fuel return)
• 1/2" hose = AN-8 (large fuel systems)

Once I have those measurements, I'll identify the exact part you need and we'll get it swapped out quickly!

{{operatorName}}
```

---

## Issue #6: Hose End Won't Seat Properly on Braided Hose

### Symptoms
- Hose end fitting leaks at hose connection (not flare)
- Hose end won't thread on fully
- Hose bulges or kinks at fitting

### Diagnostic Questions

**Ask the customer:**
1. "Did you cut the hose before installing the fitting?"
2. "Did you remove the inner liner before installing the socket?"
3. "Is the outer braid pushed back to expose the liner?"
4. "What type of hose? (braided stainless, PTFE, push-lock)"

### Common Causes & Solutions

#### Cause 1: Incorrect Hose Preparation
**Root Cause**: Customer didn't prep hose correctly before assembly  

**Solution:**
```
Proper Braided Hose End Assembly:
1. Cut hose with sharp blade (clean, square cut)
2. Push back outer braid 1/2" to expose inner liner
3. Remove 1/4" of inner liner with razor blade
4. Slide socket over hose until it bottoms out
5. Screw nipple into socket (pushes onto liner)
6. Tighten until snug
```

**Gold Reply Template:**
```
Hi {{customerName}},

Braided hose ends need proper preparation to seal correctly. Here's the step-by-step:

**Assembly Process:**
1. **Cut hose cleanly**: Use sharp blade, square cut
2. **Push back braid**: Expose inner liner by 1/2"
3. **Trim liner**: Remove 1/4" of inner liner (creates grip space)
4. **Install socket**: Slide over hose until it stops
5. **Thread nipple**: Screw into socket, tightening as it pushes onto liner
6. **Tighten**: Should be snug, braid captured between socket and nipple

**Common Mistake**: Not removing inner liner before installing socket (it won't seal!)

Would a detailed video help? I can send you our installation guide with photos.

{{operatorName}}
```

---

## Escalation Criteria

**Escalate to Technical Support if:**
- Customer describes repeated failures after following all troubleshooting steps
- Suspected manufacturing defect in fitting
- Customer reports fuel fire or dangerous safety issue
- Complex system design questions beyond basic troubleshooting
- Customer requests professional installation referral

**Escalation Process:**
1. Document all troubleshooting steps attempted
2. Collect photos if possible
3. Note customer's mechanical skill level
4. Forward to technical@hotrodan.com with tag: [ESCALATION]

---

## Quick Reference Troubleshooting Flowchart

```
FUEL LEAK
   │
   ├─→ Under-tightened? → Tighten to proper torque
   │
   ├─→ Over-tightened? → Inspect for damage, replace if needed
   │
   ├─→ Damaged flare? → Replace fitting
   │
   ├─→ Wrong fitting type? → Order correct adapter (ORB, NPT, AN)
   │
   └─→ Debris/contamination? → Clean and reassemble


WON'T THREAD ON
   │
   ├─→ Cross-threaded? → Back out, start by hand, thread carefully
   │
   ├─→ Dirty threads? → Clean with brake cleaner, use anti-seize
   │
   └─→ Damaged threads? → Replace fitting


LOOSENS OVER TIME
   │
   ├─→ Vibration? → Use swivel fitting or thread locker
   │
   └─→ Thermal cycling? → Check for proper fitting material (aluminum vs SS)
```

---

## Operator Certification Checkpoints

**Troubleshooting Certification:**
- [ ] Can diagnose leak causes over phone
- [ ] Knows when to recommend replacement vs repair
- [ ] Can explain proper tightening technique
- [ ] Understands difference between AN/ORB/NPT
- [ ] Can guide customer through flare inspection
- [ ] Knows when to escalate to technical support

---

## Related Documentation

- **Product Knowledge**: `01-an-fittings-product-knowledge.md`
- **Common Issues**: `03-fuel-system-common-issues.md`
- **Installation Guide**: `04-an-fittings-installation-guide.md`
- **FAQ**: `05-an-fittings-faq.md`

---

**Last Updated**: October 12, 2025  
**Document Owner**: Support Agent  
**Review Frequency**: Quarterly  
**Next Review**: January 12, 2026

**Feedback**: Report troubleshooting gaps to support@hotrodan.com

