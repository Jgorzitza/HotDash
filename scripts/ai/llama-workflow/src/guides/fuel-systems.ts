/**
 * Fuel System Technical Guides
 * Hot Rod AN-specific guides for LS swaps and AN plumbing
 */

export interface TechnicalGuide {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  topics: string[];
  relatedProducts: string[];
  keywords: string[];
}

export const FUEL_SYSTEM_GUIDES: TechnicalGuide[] = [
  {
    id: 'ls-swap-fuel-basics',
    title: 'LS Swap Fuel System Basics',
    category: 'ls-swap',
    summary: 'Complete guide to planning your LS swap fuel system with AN fittings',
    content: `# LS Swap Fuel System Guide

## Overview
LS engines require proper fuel delivery for reliable performance. This guide covers fuel system planning for LS swaps using AN fittings and PTFE hoses.

## Fuel Line Sizing

### AN-6 (3/8" ID)
- **Horsepower**: Up to 500 HP (naturally aspirated)
- **Applications**: Most street LS swaps, mild performance builds
- **Fuel Pump**: Walbro 255 LPH or similar
- **Pros**: More flexible, easier to route, lower cost
- **Cons**: Limited flow for high-HP applications

### AN-8 (1/2" ID)
- **Horsepower**: 500-800 HP (ideal for forced induction)
- **Applications**: Turbo/supercharged builds, high-performance street/strip
- **Fuel Pump**: Aeromotive 340 LPH or larger
- **Pros**: Better flow headroom, supports boost applications
- **Cons**: Slightly less flexible, higher cost

### AN-10 (5/8" ID)
- **Horsepower**: 800+ HP (serious racing)
- **Applications**: Dedicated race cars, extreme builds
- **Pros**: Maximum flow capacity
- **Cons**: Difficult to route in tight spaces, expensive

## Return vs Returnless

### Return Style (Recommended for Performance)
- Fuel goes to rails, excess returns to tank
- Maintains consistent pressure under all conditions
- Better for high-horsepower and boost applications
- Requires: Supply line (AN-6/8), return line (AN-6), fuel pressure regulator
- **Our Kit**: Return Style LS Engine Fuel Line Kit

### Returnless Style
- Fuel pressure regulated at tank
- Simpler installation (one less line)
- Works for stock and mild performance
- Limited adjustability
- **Our Kit**: Returnless Style LS Engine Fuel Line Kit

## Fuel Pump Selection

### Street Performance (300-500 HP)
- **Walbro 255 LPH** (in-tank or inline)
- AN-6 fuel lines adequate
- Return or returnless OK

### High Performance (500-700 HP)
- **Aeromotive Stealth 340 LPH**
- AN-8 fuel lines recommended
- Return style preferred

### Racing (700+ HP)
- **Aeromotive A1000** or dual pump setup
- AN-10 feed, AN-8 return
- Return style required

## Installation Best Practices

1. **Route Away From Heat**: Keep fuel lines away from headers/exhaust
2. **Secure Properly**: Use P-clamps every 12-18 inches
3. **Avoid Sharp Bends**: Minimum 6" radius for AN-6, 8" for AN-8
4. **Check Clearance**: Ensure no contact with moving parts
5. **Test Before Final**: Pressure test system before finishing installation

## Common Mistakes

❌ **Using wrong size**: AN-6 on 700HP build (flow restriction)
❌ **No return line**: Returnless on boosted application (pressure issues)
❌ **Poor routing**: Lines contacting exhaust (fire hazard)
❌ **Overtightening**: Damaging aluminum fittings
❌ **Wrong fuel pump**: Underpowered pump causing lean conditions

✅ **Do It Right**: Size properly, route carefully, test thoroughly

## Parts Checklist for LS Swap

**Return Style System (AN-8)**:
- [ ] 30ft AN-8 PTFE hose (supply + return)
- [ ] 2x 90° swivel fittings (fuel rail)
- [ ] 2x 45° swivel fittings (tank connections)
- [ ] 4x straight swivel fittings
- [ ] 2x LS fuel rail adapters
- [ ] Fuel pressure regulator (Corvette style)
- [ ] Fuel filter (factory style)
- [ ] Fuel pump (340 LPH for boost)
- [ ] P-clamps for mounting
- [ ] Vice jaws and spanner wrench

**OR**: Use our complete Return Style LS Fuel Line Kit!

## Resources
- Product: Return Style LS Kit
- Product: Returnless LS Kit
- Product: Aeromotive Stealth 340 Pump
- Product: PTFE AN-8 Hose
- Product: Installation Tools`,
    topics: ['LS swap', 'fuel sizing', 'return vs returnless', 'pump selection', 'installation'],
    relatedProducts: [
      'ls-fuel-kit-return',
      'ls-fuel-kit-returnless',
      'aeromotive-stealth-340',
      'ptfe-hose-black-nylon',
      'vice-jaws-aluminum',
    ],
    keywords: ['LS', 'swap', 'fuel system', 'sizing', 'horsepower', 'AN-6', 'AN-8', 'return', 'returnless'],
  },
  
  {
    id: 'an-fitting-installation',
    title: 'AN PTFE Fitting Installation Guide',
    category: 'installation',
    summary: 'Step-by-step guide to properly installing reusable AN PTFE fittings',
    content: `# AN PTFE Fitting Installation Guide

## Tools Required
1. Aluminum vice jaws (protects braided covering)
2. Adjustable spanner wrench (AN3-AN12)
3. AN hose cutting shears
4. Bench vise
5. Clean rag

## Installation Steps

### Step 1: Cut Hose to Length
- Measure required length CAREFULLY
- Add 2-3" extra for fitting assembly
- Use AN hose shears for clean cut
- **Pro Tip**: Measure twice, cut once!

### Step 2: Inspect Hose End
- Check for clean, square cut
- Ensure PTFE liner is not damaged
- Remove any frayed braiding strands
- PTFE should be slightly recessed (normal)

### Step 3: Separate Fitting Components
- Socket (threaded part)
- Nipple (barbed insert)
- Ferrule (compression sleeve)

### Step 4: Slide Socket onto Hose
- Thread socket onto hose FIRST (easy to forget!)
- Push it back several inches
- Keep threads clean

### Step 5: Insert Nipple
- Push nipple into hose end
- Twist while pushing for easier insertion
- Should insert fully until shoulder contacts hose
- **Critical**: PTFE liner must be behind barbs

### Step 6: Assemble in Vice
- Place hose in aluminum vice jaws
- **DO NOT use steel vice or pliers** (will crush braid)
- Hold hose firmly but don't overtighten vice
- Vice jaws protect the braided covering

### Step 7: Thread Socket Forward
- Slide socket forward over nipple
- Start threading by hand
- Align ferrule as socket advances
- Thread until hand-tight

### Step 8: Tighten with Spanner Wrench
- Use adjustable spanner on socket
- Tighten in quarter-turn increments
- **Stop when**: Braided covering is flush with socket collar
- **DO NOT OVERTIGHTEN**: Aluminum threads can strip

### Step 9: Inspect Assembly
- Braided cover should be flush with socket
- Ferrule should be evenly compressed
- No gaps between components
- Fitting should swivel freely

### Step 10: Leak Test
- Pressure test before final installation
- Check for leaks at both ends
- Verify swivel action not binding

## Common Installation Errors

### Error: Overtightening
- **Symptom**: Stripped threads, cracked socket
- **Fix**: Replace fitting, use torque awareness
- **Prevention**: Stop when braid is flush, don't force it

### Error: Nipple Not Fully Seated
- **Symptom**: Leak at hose/nipple junction
- **Fix**: Disassemble, reseat nipple fully
- **Prevention**: Ensure nipple shoulder contacts hose end

### Error: Forgot Socket
- **Symptom**: Socket not on hose (can't assemble)
- **Fix**: Cut hose, restart (or push socket over fitting - difficult)
- **Prevention**: ALWAYS slide socket on first!

### Error: Damaged PTFE Liner
- **Symptom**: Leak through PTFE
- **Fix**: Cut off damaged section, restart
- **Prevention**: Clean cuts, gentle handling

### Error: Using Regular Vise
- **Symptom**: Crushed/damaged braided covering
- **Fix**: Cut off damaged section
- **Prevention**: ALWAYS use aluminum vice jaws

## Reusing Fittings

AN PTFE fittings are reusable! To remake an assembly:
1. Unscrew socket with spanner wrench
2. Remove nipple from hose
3. Inspect ferrule - replace if worn
4. Reassemble on new hose following steps above

**Ferrule Life**: Good for 3-5 assemblies typically

## Pro Tips

✅ Mark hose direction before cutting (some installations are directional)
✅ Assemble one end at a time (easier than both at once)
✅ Test fit before cutting (measure installed, not on bench)
✅ Keep fittings clean (dirt/debris can cause leaks)
✅ Use Teflon tape on NPT threads ONLY (never on AN threads)

## What NOT To Do

❌ Don't use crimp fittings on PTFE hose (incompatible)
❌ Don't use pipe thread sealant on AN threads
❌ Don't mix fitting sizes (AN-6 on AN-8 hose)
❌ Don't skip the vice jaws (you'll damage the braid)
❌ Don't guess at tightness (hand tight + 1/4 turn with wrench)

## Safety

⚠️ **Fuel System Safety**:
- Always depressurize system before working
- No smoking or open flames near fuel
- Work in well-ventilated area
- Keep fire extinguisher nearby
- Double-check all connections before pressurizing

## Need Help?

If you're installing PTFE fittings for the first time:
- Take your time
- Follow steps carefully
- Don't be afraid to restart if something doesn't look right
- Fittings are reusable so you can practice

Contact us if you have questions - we're here to help!`,
    topics: ['installation', 'PTFE fittings', 'tools', 'troubleshooting', 'safety'],
    relatedProducts: [
      'vice-jaws-aluminum',
      'spanner-wrench',
      'hose-shears',
      'replacement-ferrules',
    ],
    keywords: ['install', 'PTFE', 'fitting', 'AN', 'reusable', 'ferrule', 'vice', 'wrench'],
  },
  
  {
    id: 'an-sizing-guide',
    title: 'AN Fitting & Hose Sizing Guide',
    category: 'technical',
    summary: 'Understand AN sizes and choose the right size for your application',
    content: `# AN Fitting & Hose Sizing Guide

## What is AN?

AN stands for **Army-Navy** specification - a standardized fitting system developed for military aircraft and later adopted by racing/performance automotive.

## AN Size Chart

| AN Size | Inside Diameter | Outside Diameter | Common Uses |
|---------|----------------|------------------|-------------|
| AN-3 | 3/16" (4.8mm) | ~3/8" | Brake lines, small oil lines |
| AN-4 | 1/4" (6.4mm) | ~1/2" | Oil pressure, transmission cooler |
| AN-6 | 3/8" (9.5mm) | ~5/8" | **Fuel lines (most common)**, oil return |
| AN-8 | 1/2" (12.7mm) | ~3/4" | **High-flow fuel**, oil feed |
| AN-10 | 5/8" (15.9mm) | ~7/8" | **Racing fuel**, large oil systems |
| AN-12 | 3/4" (19mm) | ~1" | Big-block oil, extreme fuel systems |

**Hot Rod AN Focus**: We specialize in AN-6, AN-8, and AN-10 for fuel systems

## Sizing for Fuel Systems

### Naturally Aspirated
- **Up to 350 HP**: AN-6 adequate
- **350-500 HP**: AN-6 or AN-8 (AN-8 recommended)
- **500-700 HP**: AN-8 required
- **700+ HP**: AN-10 supply, AN-8 return

### Forced Induction (Turbo/Supercharger)
- **Up to 500 HP**: AN-8 minimum
- **500-800 HP**: AN-8 supply and return
- **800+ HP**: AN-10 supply, AN-8 return

**Why bigger for boost?** Forced induction = higher fuel demand. Size up for headroom.

## Choosing Hose vs Fitting Sizes

**Rule**: Hose and fitting must match!
- AN-6 hose requires AN-6 fittings
- AN-8 hose requires AN-8 fittings
- Cannot mix sizes (won't seal)

**Exception**: Reducer fittings (AN-8 to AN-6) for transitioning sizes

## Common Applications

### Fuel Supply Line
- **Stock LS Swap**: AN-6
- **Performance LS Build (400-600 HP)**: AN-8
- **Big Power (600+ HP)**: AN-8 or AN-10

### Fuel Return Line
- **Most Applications**: AN-6
- **High Volume Systems**: AN-8

### Oil System
- **Oil Feed (to turbo)**: AN-8 or AN-10
- **Oil Return (from turbo)**: AN-10 or AN-12 (gravity drain, bigger is better)

### Brake Lines
- **Standard**: AN-3
- **Performance**: AN-4

### Transmission Cooler Lines
- **Standard**: AN-6
- **Heavy-duty/towing**: AN-8

## Pressure Ratings

AN PTFE hoses are rated for:
- **Working Pressure**: 1500-2000 PSI (depending on size and construction)
- **Burst Pressure**: 4000+ PSI

**Fuel System Typical Pressures**:
- Carbureted: 5-7 PSI
- EFI (Stock): 40-60 PSI
- EFI (Performance): 60-80 PSI
- **Safety Factor**: AN hoses massively over-rated for fuel use

## Temperature Ratings

### Nylon Braided
- **Range**: -40°F to 500°F
- **Best For**: Engine bay, away from exhaust

### Stainless Steel Braided
- **Range**: -40°F to 600°F
- **Best For**: Near exhaust, harsh environments

**PTFE Liner**: Both use same PTFE liner (500°F+), difference is outer covering

## Flow Capacity

Approximate flow capacities at 40 PSI:
- **AN-6**: ~90 GPH (supports 450 HP gasoline)
- **AN-8**: ~160 GPH (supports 800 HP gasoline)
- **AN-10**: ~250 GPH (supports 1250 HP gasoline)

**Note**: Actual flow depends on line length, bends, and restrictions

## Material Compatibility

### PTFE Liner Compatible With:
✅ Gasoline (all octanes)
✅ E85 ethanol blend
✅ Methanol (racing fuel)
✅ Diesel
✅ Oil (motor, transmission, power steering)
✅ Coolant/water
✅ Brake fluid

### NOT Compatible:
❌ Strong acids
❌ Strong bases

**For Hot Rod AN Use**: PTFE handles everything automotive

## Bundle Deals (Cost Savings)

We offer complete hose + fitting kits:
- **AN-6 Bundle**: 30ft hose + 8 fittings (save ~15%)
- **AN-8 Bundle**: 30ft hose + 8 fittings
- **AN-10 Bundle**: 30ft hose + 8 fittings

**Includes**:
- Mix of straight, 45°, and 90° swivel fittings
- Enough for complete fuel system
- Installation ready

## Quick Reference

**"What size do I need for my LS swap?"**
- Stock/mild (< 400 HP): AN-6
- Performance (400-600 HP): AN-8
- High-power/boost (600+ HP): AN-8 or AN-10

**"Return or returnless?"**
- Stock replacement: Either OK
- Performance/boost: Return style

**"Nylon or stainless braid?"**
- Engine bay: Nylon (lighter, flexible)
- Near exhaust: Stainless (heat resistant)
- Show car: Your color preference!

**"What fuel pump?"**
- 300-500 HP: Walbro 255
- 500-700 HP: Aeromotive 340
- 700+ HP: Bigger pump or dual setup`,
    topics: ['AN sizing', 'fuel system', 'horsepower', 'LS swap', 'pressure ratings'],
    relatedProducts: [
      'ptfe-hose-black-nylon',
      'ptfe-hose-stainless',
      'an-fitting-straight-swivel',
      'an-fitting-45-degree',
      'an-fitting-90-degree',
    ],
    keywords: ['AN', 'sizing', 'fuel', 'LS', 'horsepower', 'pressure', 'flow', 'PTFE'],
  },
  
  {
    id: 'an-plumbing-101',
    title: 'AN Plumbing 101 - Hot Rod Fuel Systems',
    category: 'technical',
    summary: 'Fundamental concepts of AN plumbing for hot rod builds',
    content: `# AN Plumbing 101

## Why AN Fittings for Hot Rods?

### Advantages
✅ **No flaring required**: Unlike steel brake line
✅ **Reusable**: Can remake assemblies multiple times
✅ **Leak-resistant**: Proper sealing when installed correctly
✅ **Flexible routing**: Easy to work with in tight spaces
✅ **Professional appearance**: Clean, race-inspired look
✅ **Fuel safe**: PTFE liner handles all fuels

### Vs Traditional Methods
- **Hard line**: AN is easier to work with, no flaring tools needed
- **Rubber hose**: AN handles higher pressure and temperature
- **Push-lock**: AN is reusable and more reliable

## Thread Types

### AN/JIC (37° Flare)
- **Our fittings**: All AN thread (37° flare seat)
- **Sealing method**: Metal-to-metal flare seal
- **No sealant needed**: Proper torque creates seal

### Adapters We Offer
- **AN to NPT**: National Pipe Taper (tapered threads)
- **AN to ORB**: O-Ring Boss (O-ring seal)
- **AN to Metric**: For GM/import applications

**Important**: Never use Teflon tape on AN threads (only on NPT)

## Swivel vs Non-Swivel

### Swivel Fittings (What We Sell)
- Fitting rotates on hose end
- Easier installation and alignment
- No need to twist hose
- **Best for**: All applications

### Non-Swivel (Crimp Fittings)
- Fixed orientation
- Requires special crimp tools
- One-time use
- **We don't carry these** (reusable is better for hot rods)

## Fitting Types

### Straight
- 0° angle
- **Use when**: Direct path, no obstacles
- Most common fitting type

### 45-Degree
- 45° angle
- **Use when**: Moderate routing changes
- Cleaner than using two straight fittings

### 90-Degree
- 90° right angle
- **Use when**: Sharp bends needed (fuel rail connections)
- Space-saving in tight areas

### Union/Coupler
- Connects two hoses
- **Use when**: Extending lines, connecting sections

### Reducer/Expander
- Changes AN size (e.g., AN-8 to AN-6)
- **Use when**: Transitioning between line sizes

## Routing Best Practices

### Planning Your Fuel Lines

1. **Sketch it first**: Plan route before buying parts
2. **Count fittings**: Straight for straight runs, angled for turns
3. **Measure length**: Account for fitting assembly (add 2-3" per fitting)
4. **Allow slack**: Don't make lines too tight (engine movement)
5. **Avoid heat**: Route away from headers and exhaust

### Recommended Routing
- **Under Frame Rails**: Cleanest routing, protected
- **Away From Driveshaft**: Prevent contact/chafing
- **Secure Every 12-18"**: Use P-clamps to prevent vibration
- **Gradual Bends**: 6-8" radius minimum (varies by size)

## Typical LS Swap Fuel System

**Supply Line** (Tank to Fuel Rails):
- AN-6 or AN-8 hose
- Straight fitting at tank
- 90° fitting at each fuel rail (2 total)
- In-line fuel filter
- P-clamps for securing

**Return Line** (Fuel Rails to Tank):
- AN-6 hose
- 90° fittings at fuel rails
- Straight fitting at tank
- Fuel pressure regulator

**Fittings Needed** (Return style):
- 4x 90° swivel (2 supply + 2 return at rails)
- 2x straight swivel (tank connections)
- 2x LS fuel rail adapters
- 2-4x extra straight for filter/regulator

**OR**: Just get our Return Style LS Fuel Line Kit!

## Leak Prevention

### Proper Assembly
- ✅ Clean threads before assembly
- ✅ Tighten to proper torque (hand tight + 1/4 turn)
- ✅ Inspect ferrule compression
- ✅ Pressure test before final install

### Common Leak Points
- ⚠️ Under-tightened fitting (not enough compression)
- ⚠️ Over-tightened fitting (damaged threads or sealing surface)
- ⚠️ Damaged PTFE liner (cut too short or damaged)
- ⚠️ Wrong size fitting on hose

### Testing
1. Pressure test with fuel pump (before final installation)
2. Check all connections with engine running
3. Monitor for 5-10 minutes
4. Verify no leaks before closing hood

## Maintenance

AN PTFE fuel systems are LOW MAINTENANCE:
- ✅ Inspect connections annually
- ✅ Check for chafing/rubbing
- ✅ Verify P-clamp security
- ✅ Look for fuel staining (indicates past leak)

**Typical Lifespan**: 10+ years with proper installation

## Cost Comparison

**DIY AN System** (LS swap, AN-8):
- 30ft hose: ~$150
- 8 fittings: ~$200
- Tools: ~$100
- **Total**: ~$450

**Pre-Made Kit**: ~$380 (bundle savings)

**Tools**: One-time purchase, use on all future builds

## Bottom Line

AN plumbing looks intimidating but it's actually EASIER than traditional methods once you understand the basics:
1. Size correctly for your horsepower
2. Use proper tools (vice jaws essential)
3. Don't overtighten
4. Test before final installation

**First time?** Go slow, follow the steps, you'll be fine!`,
    topics: ['AN basics', 'plumbing', 'threads', 'routing', 'installation', 'troubleshooting'],
    relatedProducts: [
      'vice-jaws-aluminum',
      'spanner-wrench',
      'hose-shears',
      'an-fitting-straight-swivel',
      'an-fitting-45-degree',
      'an-fitting-90-degree',
    ],
    keywords: ['AN', 'plumbing', 'installation', 'sizing', 'routing', 'hot rod', 'fuel system'],
  },
];

/**
 * Search guides by topic or keyword
 */
export function searchGuides(query: string): TechnicalGuide[] {
  const queryLower = query.toLowerCase();
  
  return FUEL_SYSTEM_GUIDES.filter(guide => {
    const searchable = [
      guide.title,
      guide.summary,
      guide.content,
      ...guide.topics,
      ...guide.keywords,
    ].join(' ').toLowerCase();
    
    return searchable.includes(queryLower);
  });
}

/**
 * Get guide by ID
 */
export function getGuideById(id: string): TechnicalGuide | undefined {
  return FUEL_SYSTEM_GUIDES.find(g => g.id === id);
}

