# EFI Conversion Guide for Classic Cars & Hot Rods

**Last Updated:** October 2025  
**For:** Converting carbureted engines to modern electronic fuel injection

## Why Convert to EFI?

### Benefits of EFI Over Carburetor

**Performance:**
- ✅ Better throttle response
- ✅ More consistent power delivery
- ✅ Improved fuel economy (10-20%)
- ✅ Better cold starts
- ✅ Altitude compensation (automatic)

**Driveability:**
- ✅ No warm-up period needed
- ✅ Smooth idle (no tuning carburetor)
- ✅ No flooding or vapor lock
- ✅ Consistent performance in all weather
- ✅ Better part-throttle response

**Tuning:**
- ✅ Precise air/fuel ratio control
- ✅ Adjustable via laptop (no jet changes)
- ✅ Data logging capabilities
- ✅ Self-learning capabilities (some systems)

**Reliability:**
- ✅ No carburetor maintenance
- ✅ Fewer adjustments needed
- ✅ Better emissions
- ✅ Safer (no fuel bowl to leak)

---

## EFI System Types

### Throttle Body Injection (TBI)

**Description:** Single or dual injectors mounted in throttle body (looks like carburetor)

**Pros:**
- ✅ Simple installation (bolts where carb was)
- ✅ Uses existing intake manifold
- ✅ Lower cost ($800-1200)
- ✅ Easy to tune

**Cons:**
- ❌ Less precise than port injection
- ❌ Lower power potential
- ❌ Wet manifold (fuel distribution issues)

**Best For:**
- Street cruisers
- Budget conversions
- Engines under 400 HP
- Keeping stock appearance

---

### Port Fuel Injection (Multi-Point)

**Description:** Individual injector for each cylinder

**Pros:**
- ✅ Most precise fuel delivery
- ✅ Best power potential
- ✅ Better emissions
- ✅ Individual cylinder tuning

**Cons:**
- ❌ Requires EFI intake manifold
- ❌ More complex installation
- ❌ Higher cost ($1500-3000+)
- ❌ More wiring

**Best For:**
- Performance builds (500+ HP)
- Maximum efficiency
- Racing applications
- Modern engine swaps (LS, Coyote, Hemi)

---

## Fuel System Requirements for EFI

### Fuel Pressure

**TBI Systems:**
- Pressure: 10-15 PSI
- Similar to carb pressure (but more precise)
- Low-pressure pump adequate

**Port EFI Systems:**
- Pressure: 40-45 PSI base (58 PSI for LS)
- High-pressure pump required
- Returnless or return-style

**Critical:** EFI requires CONSISTENT pressure
- Carb can tolerate 4-8 PSI variation
- EFI needs within 2 PSI of target
- Requires quality regulator

---

### Fuel Line Sizing for EFI

**TBI Conversions:**
- Same as carb: 3/8" (AN-6) adequate
- Can reuse existing fuel line if metal
- Must be clean (flush before conversion)

**Port EFI Conversions:**
- **Return-style:** AN-6 supply, AN-6 return (up to 600 HP)
- **Returnless:** AN-8 supply (no return)
- **High HP:** See main fuel sizing guide

**Material Requirements:**
- ❌ **Old rubber hose:** Will degrade, especially with E85
- ✅ **PTFE braided hose:** Best option, all fuels compatible
- ✅ **Steel hardline:** Durable, requires bending skills
- ⚠️ **New rubber:** Short-term OK, replace with PTFE for long-term

---

## Complete Parts List for EFI Conversion

### Core EFI Components

**Engine Management:**
- ECU (engine control unit): $800-2500
- Wiring harness: $300-800
- Throttle body: $200-500 (TBI) or included with intake (port EFI)
- Sensors: $200-400 (O2, IAT, CLT, MAP/MAF, TPS, CKP)

**Fuel System:**
- High-pressure fuel pump: $120-250
- Fuel lines (AN-6 or AN-8 PTFE): $160-200
- AN fittings: $120-200
- Fuel filter: $45-75
- Fuel pressure regulator: $85-150
- Fuel rail: $150-300 (port EFI)

**Ignition:**
- Coil packs or distributor adapter: $200-400
- Spark plugs: $50-100
- Ignition wiring: Included in harness

**Accessories:**
- Laptop for tuning: $400+ (or use existing)
- Wideband O2 sensor & gauge: $200-350
- Fuel pressure gauge: $35-60

**Total Investment:**
- **TBI System:** $2000-3500
- **Port EFI System:** $3500-6000
- **Professional installation/tuning:** $1000-2500 additional

---

## Installation Overview

### Pre-Installation Planning

**Step 1: Choose Your System**
- TBI for simplicity, port EFI for performance
- Self-tuning vs. professional tuning
- Standalone ECU vs. modified factory ECU

**Step 2: Inventory Current Setup**
- What intake manifold? (need EFI manifold for port injection)
- What ignition? (need crank/cam sensors)
- What fuel tank? (needs high-pressure pump)
- What wiring? (need complete harness)

**Step 3: Order Complete Kit**
- ECU with harness
- All sensors
- Fuel system components
- Installation manual

**Step 4: Plan Installation Timeline**
- Weekend warrior: 3-4 weekends
- Full-time: 1-2 weeks
- Professional shop: 2-5 days

---

### Fuel System Installation

**Step 1: Fuel Pump Upgrade**
1. Drop tank or access through bed/trunk
2. Remove old mechanical pump or stock electric
3. Install high-pressure EFI pump (Walbro 255 recommended)
4. Wire pump through relay (30A)
5. Test pump operation before final assembly

**Step 2: Install Fuel Lines**
1. Remove old fuel line (if rubber or inadequate)
2. Install AN-6 or AN-8 PTFE supply line from tank to engine
3. Install return line (if return-style system)
4. Route away from exhaust and heat sources
5. Secure every 12-18" with P-clamps

**Step 3: Install Fuel Filter**
1. Mount inline filter in engine bay
2. Between pump and regulator
3. Easy access for future replacement
4. Flow arrow pointing toward engine

**Step 4: Install Pressure Regulator**
1. Mount near fuel rail
2. Connect supply inlet from filter
3. Connect outlet to fuel rail
4. Connect return to tank (if return-style)
5. Connect vacuum reference line to intake manifold

**Step 5: Pressure Testing**
1. Turn key ON (don't start engine)
2. Check for leaks at all connections
3. Verify fuel pressure: 58 PSI (LS) or 40-45 PSI (other)
4. Adjust regulator if needed
5. Recheck all fittings

---

### ECU & Sensor Installation

**Crank Position Sensor:**
- Required for all EFI
- Triggers injection and ignition timing
- Mount per ECU instructions
- Gap critical (usually 0.040-0.060")

**Camshaft Position Sensor:**
- Required for sequential injection
- Identifies which cylinder is firing
- Some systems use distributor pickup

**Throttle Position Sensor (TPS):**
- Mounted on throttle body
- Tells ECU throttle opening percentage
- Must be calibrated in tuning software

**Manifold Absolute Pressure (MAP):**
- Measures manifold vacuum/boost
- Calculates engine load
- Alternative to MAF sensor

**Mass Air Flow (MAF):**
- Measures actual air mass entering engine
- More accurate than MAP for some applications
- Requires careful placement

**Oxygen Sensors:**
- Wideband: Best for tuning (measures actual AFR)
- Narrowband: Cheaper, less precise
- Mount in header collectors

**Coolant & Air Temperature:**
- CLT sensor in coolant passage
- IAT sensor in intake tract
- Critical for cold start enrichment

---

## Tuning Your EFI System

### Initial Startup Tuning

**Before First Start:**
1. Load base calibration for your engine
2. Set basic parameters:
   - Engine displacement
   - Number of cylinders
   - Injector size
   - Fuel pressure
   - VE table starting point

**First Start Process:**
1. Prime fuel system (key on/off 3 times)
2. Verify fuel pressure is correct
3. Crank engine (may take several seconds)
4. Let idle and stabilize
5. Check AFR (should be 14.0-15.0:1 for idle)

**Initial Adjustments:**
- Idle speed: 850-950 RPM
- Idle AFR: 14.5:1 typical
- Cranking fuel: May need more for cold starts
- Warm-up enrichment: Tune for smooth cold operation

---

### Break-In Tuning

**Week 1:**
- Monitor AFR constantly
- Log all drives
- Adjust VE table as needed
- Fine-tune idle and cruise

**Week 2-4:**
- Full throttle tuning (on dyno recommended)
- Set WOT AFR (12.5-13.0:1 for power)
- Optimize ignition timing
- Set rev limits and safety parameters

**Self-Learning Systems:**
- Let system learn for 500-1000 miles
- Monitor corrections being made
- Verify learning is converging
- May still need professional dyno tune

---

### Common Tuning Issues

**Problem: Hard to Start When Cold**
- Increase cranking fuel enrichment
- Add more cold start enrichment
- Check CLT sensor reading
- Verify fuel pressure holds overnight

**Problem: Won't Idle Smoothly**
- Adjust idle VE cells
- Check for vacuum leaks
- Verify TPS is calibrated (0% at closed throttle)
- May need idle air control adjustment

**Problem: Hesitation on Acceleration**
- Accel enrichment too low
- Increase AE amount and taper
- Check for lean condition (add fuel)
- May be ignition issue (not fuel)

**Problem: Poor Fuel Economy**
- Running too rich (check AFR at cruise)
- Target 14.7:1 AFR for best economy
- Check for fuel leaks
- Verify correct injector scaling

---

## Fuel Pump Selection for EFI

### Matching Pump to EFI Type

**TBI Systems (10-15 PSI):**
- External low-pressure pump
- OR high-pressure pump with regulator set low
- Walbro GSL392 inline (255 LPH, can be regulated down)

**Port EFI (40-45 PSI):**
- In-tank or inline high-pressure pump
- Walbro 255 LPH (GCA758 in-tank, GSL392 inline)
- Aeromotive for high performance

**LS Engines (58 PSI):**
- Must use high-pressure pump
- Walbro 255 minimum
- Aeromotive 340 for 700+ HP

---

## Wiring the EFI System

### Basic Wiring Requirements

**Power & Ground:**
- Main power: 10-12 AWG from battery (fused 30A)
- Sensor power: 18 AWG (usually in ECU harness)
- Grounds: Multiple, clean connections to engine and chassis

**Fuel Pump Circuit:**
- Controlled by ECU
- Relay required (30A)
- See fuel pump wiring section in LS guide

**Injector Circuits:**
- Low-side drivers in ECU
- 18 AWG per injector adequate
- Peak-and-hold vs. saturated (check injector specs)

**Sensors:**
- Included in ECU harness
- Follow color-coded wiring
- Use proper crimps (no twist-and-tape)

---

## Testing & Commissioning

### Pre-Start Checklist

**Fuel System:**
- [ ] Fuel pressure at spec (58 PSI for LS, 40-45 for others)
- [ ] No leaks when pressurized
- [ ] Filter installed correctly (flow direction)
- [ ] Return line routing verified

**Electrical:**
- [ ] All sensors connected and reading properly
- [ ] Injectors clicking when cranking
- [ ] Fuel pump primes on key-on
- [ ] Battery fully charged (13-14V)

**Calibration:**
- [ ] Base tune loaded
- [ ] Engine parameters set correctly
- [ ] TPS calibrated
- [ ] IAC calibrated (if applicable)

---

### First Start Procedure

1. **Prime fuel system:**
   - Turn key ON (don't start)
   - Wait for pump to prime (2-3 seconds)
   - Turn key OFF
   - Repeat 3 times

2. **Crank engine:**
   - May take 5-10 seconds on first attempt (filling fuel rail)
   - Should start and idle
   - May run rough initially (ECU learning)

3. **Monitor critical parameters:**
   - Fuel pressure: Should be stable
   - AFR: Should be 13-15:1 initially
   - RPM: Should stabilize at idle setting
   - Coolant temp: Should start rising

4. **Let warm up:**
   - Run for 5-10 minutes
   - Watch for leaks
   - Listen for unusual noises
   - Verify all gauges reading normally

---

## Troubleshooting EFI Conversions

### Won't Start

**Check in Order:**
1. **Fuel pressure?** Should be 40-45 PSI (port EFI) or 10-15 PSI (TBI)
2. **Injectors firing?** Listen for clicking, use test light
3. **Spark?** Pull plug and check
4. **Crank sensor signal?** Check ECU for RPM reading while cranking
5. **Throttle position?** Should read 0% at closed throttle

---

### Starts but Won't Stay Running

**Common Causes:**
1. **Low fuel pressure** → Check pump, filter, regulator
2. **Air leak** → Check all intake connections
3. **TPS not calibrated** → Recalibrate in software
4. **MAF dirty** → Clean MAF sensor
5. **IAC stuck** → Clean or replace idle air control

---

### Runs Rough or Misfires

**Fuel-Side Checks:**
1. Check fuel pressure stability
2. Verify injectors are all firing
3. Check for clogs in fuel rail
4. Verify correct injector sizing

**Ignition-Side Checks:**
1. Check spark on all cylinders
2. Verify timing is correct
3. Check coil pack operation
4. Verify crank/cam sensor signals

---

## EFI Fuel System Upgrade Checklist

### From Carb to TBI

**Required:**
- [ ] TBI unit (Holley Sniper, FiTech, etc.)
- [ ] Fuel pump (returnless OK): 10-15 PSI
- [ ] Fuel line: 3/8" adequate
- [ ] Fuel filter: Low-pressure type
- [ ] Fuel tank return bung (if using return-style)

**Optional but Recommended:**
- [ ] Fuel pressure gauge
- [ ] Wideband O2 sensor
- [ ] Laptop for data logging

---

### From Carb to Port EFI

**Required:**
- [ ] ECU (Holley Terminator X, FAST, etc.)
- [ ] EFI intake manifold with fuel rails
- [ ] Injectors (sized for HP)
- [ ] High-pressure fuel pump: 40-45 PSI (Walbro 255)
- [ ] Fuel lines: AN-6 or AN-8 PTFE
- [ ] AN fittings: Complete supply and return
- [ ] Fuel filter: High-pressure rated
- [ ] Fuel pressure regulator: Adjustable 30-65 PSI
- [ ] Complete sensor kit (TPS, IAT, CLT, O2, etc.)
- [ ] Wiring harness
- [ ] Throttle cable or electronic throttle

**Critical Sensors:**
- [ ] Crank position sensor (trigger)
- [ ] Cam sensor (for sequential - optional)
- [ ] Wideband O2 sensor (tuning)
- [ ] MAP or MAF sensor (load calculation)

---

## Choosing an ECU System

### Popular Systems for Hot Rods

**Budget-Friendly ($800-1200):**
- **Holley Sniper EFI (TBI):**
  - Self-learning
  - Touchscreen
  - Looks like carburetor
  - Good to 650 HP

**Mid-Range ($1500-2500):**
- **Holley Terminator X (Port EFI):**
  - LS/Gen III Hemi specific
  - Complete harness included
  - Touchscreen handheld
  - Good to 1000+ HP

- **FiTech Go EFI:**
  - Similar to Sniper
  - Multiple power levels
  - Easy installation

**High-End ($2500-5000):**
- **Holley Dominator:**
  - Most advanced
  - Supports boost control, nitrous, etc.
  - Pro-level tuning capability

- **FAST XFI 2.0:**
  - Racing-grade
  - Extensive tuning options
  - Data logging

**DIY/Custom:**
- **MegaSquirt:**
  - Open-source
  - Highly customizable
  - Requires more technical knowledge
  - $400-800 for hardware

---

## Fuel System Design for EFI

### Return-Style EFI System

**Components:**
```
Tank → High-pressure pump (in-tank) 
    → Fuel line (AN-6 or AN-8)
    → Fuel filter (10-micron)
    → Fuel pressure regulator (40-45 PSI)
    → Fuel rail with injectors
    → Return line (AN-6) back to tank
```

**Advantages:**
- Best pressure stability
- Fuel stays cooler
- Easy to tune
- Supports all power levels

**Setup Requirements:**
- Return bung in fuel tank
- Two fuel lines (supply and return)
- External pressure regulator

---

### Returnless EFI System

**Components:**
```
Tank → High-pressure pump with integrated regulator
    → Fuel line (AN-8)
    → Fuel filter
    → Fuel rail with injectors
```

**Advantages:**
- Simpler (one fuel line)
- Lower cost
- Lighter weight
- Clean installation

**Limitations:**
- Cannot easily adjust pressure
- Limited upgrade potential
- Fuel can heat up
- Not ideal for racing

---

## Injector Sizing

### Calculating Required Injector Size

**Formula:**
```
Required lb/hr = (HP × BSFC) ÷ (Injector Count × Duty Cycle × Cylinders)
```

**BSFC (Brake Specific Fuel Consumption):**
- Naturally aspirated: 0.5
- Forced induction: 0.55
- E85: 0.65

**Duty Cycle:**
- Target: 80% maximum (allows headroom)
- Never exceed 90% (insufficient time to fire)

**Example (500 HP naturally aspirated, 8 cylinders, gas):**
```
(500 × 0.5) ÷ (0.80 × 8) = 39 lb/hr per injector
Round up: 42 lb/hr injectors
```

**Common Injector Sizes:**
- 24 lb/hr: ~300 HP (stock LS)
- 36 lb/hr: ~450 HP
- 42-48 lb/hr: ~500-600 HP
- 60 lb/hr: ~750 HP
- 80 lb/hr: ~1000 HP

**For E85:** Multiply gas size by 1.3

---

## Compatibility with Existing Parts

### Can I Keep My...?

**Carburetor Intake Manifold?**
- ✅ Yes for TBI (TBI bolts on like carb)
- ❌ No for port EFI (need EFI manifold)

**Mechanical Fuel Pump?**
- ❌ No - EFI needs electric high-pressure pump
- Plug mechanical pump hole in block

**Distributor?**
- ✅ Yes - Many ECUs can trigger from distributor
- ❌ No for fully sequential - need crank sensor

**Headers/Exhaust?**
- ✅ Yes - Just add O2 sensor bungs
- Need 18mm × 1.5 thread bungs welded in collectors

**Fuel Tank?**
- ✅ Yes - Install new high-pressure pump
- Add return bung if using return-style

---

## Common Conversions

### Small Block Chevy (283-400)

**Recommended:**
- Holley Sniper (TBI) for budget/simple
- Holley Terminator X (port) for performance
- Keep stock intake for TBI
- Use Edelbrock EFI intake for port injection

**Fuel System:**
- Walbro 255 pump
- AN-6 supply and return
- 42 lb/hr injectors (for 500 HP)

---

### LS Swap (4.8L - 6.2L)

**Recommended:**
- Use LS factory ECU (modified) OR
- Holley Terminator X LS
- LS3 intake manifold and rails

**Fuel System:**
- See LS Swap Fuel System Guide (detailed in separate doc)
- Walbro 255 minimum
- AN-6 or AN-8 depending on HP

---

### Ford Small Block (289-351W)

**Recommended:**
- Holley Sniper (TBI)
- Edelbrock Pro-Flo 4 (port EFI)

**Fuel System:**
- Similar to SBC
- May need sending unit adapter
- AN-6 lines adequate for most builds

---

## Cost Breakdown

### Budget TBI Conversion

- Holley Sniper kit: $1100
- Walbro inline pump: $120
- Fuel line & fittings: $200
- Misc (relay, wire, clamps): $50
- **Total:** ~$1470

**Add for professional tuning:** $300-500

---

### Mid-Range Port EFI Conversion

- Holley Terminator X: $1800
- EFI intake manifold: $400
- Walbro 255 in-tank pump: $120
- AN-6 fuel line kit: $299 (Hot Rod AN bundle)
- Fuel filter & regulator: $130
- Sensors & misc: $200
- **Total:** ~$2950

**Add for professional tuning:** $500-1000 (dyno tune)

---

## Maintenance

### EFI System Maintenance

**Every Oil Change:**
- Check fuel pressure
- Listen for pump noise (should be quiet)
- Visual inspection of lines and fittings

**Every 10,000 Miles:**
- Replace fuel filter
- Clean MAF sensor (if equipped)
- Check all electrical connections

**Every 30,000 Miles:**
- Replace fuel filter
- Service injectors (cleaning)
- Check fuel pressure regulator
- Update ECU firmware if available

**Annually:**
- Data log and review tune
- Check for ECU error codes
- Verify all sensors reading correctly
- Test fuel pump output

---

## Resources & Support

### Free Resources
- ECU manufacturer forums (Holley, FiTech, FAST)
- LS1Tech.com (LS swaps)
- YellowBullet.com (pro street/race)
- YouTube tutorials

### Professional Help
- EFI installation shops
- Dyno tuning (highly recommended for port EFI)
- Wiring services (if not comfortable with electrical)

### Hot Rod AN Support
- Fuel system design consultation: Free
- Parts recommendations: support@hotrodan.com
- Installation guidance included with orders
- Phone: Monday-Friday, 9AM-5PM EST

---

**Success Tip:** EFI conversions are very doable for DIY builders, but take your time. Read all instructions completely before starting, plan your fuel system carefully, and don't skip the tuning process. A well-tuned EFI system is night-and-day better than any carburetor!

