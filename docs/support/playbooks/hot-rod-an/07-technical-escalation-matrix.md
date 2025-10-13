---
epoch: 2025.10.E1
doc: docs/support/playbooks/hot-rod-an/07-technical-escalation-matrix.md
owner: support
customer: Hot Rod AN
category: escalation-matrix
last_reviewed: 2025-10-12
expires: 2026-01-12
tags: [escalation, technical-support, decision-tree, operator-guide]
---

# Technical Escalation Matrix

**Customer**: Hot Rod AN  
**Purpose**: Define clear escalation criteria for AN sizing and fuel system technical questions  
**Target Audience**: Customer Support Operators (All Levels)  
**Created**: October 12, 2025  

---

## 🎯 Purpose & Scope

This escalation matrix defines:
- ✅ **When** to escalate technical questions beyond your certification level
- ✅ **Who** to escalate to (Technical Support, Manager, Engineer)
- ✅ **How** to document and hand off escalations
- ✅ **Expected response times** for each escalation type

**Key Principle**: *Escalate early on safety issues, escalate appropriately on technical complexity.*

---

## 📊 Escalation Decision Framework

### The 4-Question Escalation Test

Before escalating, ask yourself:

1. **Is this a safety issue?** (fuel fire, brake failure, injury risk)
   - **YES** → Escalate immediately to Technical Support (P0)
   - **NO** → Continue to Question 2

2. **Is this covered in our playbooks?** (check FAQ, troubleshooting guides)
   - **YES** → Use playbook guidance, no escalation needed
   - **NO** → Continue to Question 3

3. **Is this within my certification level?**
   - **NO** → Escalate to higher-level operator or Technical Support
   - **YES** → Continue to Question 4

4. **Have I tried all troubleshooting steps?**
   - **NO** → Complete troubleshooting, then reassess
   - **YES** → Escalate to Technical Support with documentation

---

## 🚨 Immediate Escalation Scenarios (P0 - Critical)

### Escalate IMMEDIATELY to Technical Support if:

**Safety Issues**:
- [ ] Customer reports fuel fire or smoke
- [ ] Fuel leak near ignition source (headers, exhaust)
- [ ] Brake line failure or brake fluid leak
- [ ] Customer reports injury from product failure
- [ ] Suspected catastrophic failure (burst hose, exploded fitting)

**Product Defect Indicators**:
- [ ] Multiple customers report same failure mode
- [ ] Fitting breaks/cracks during normal installation
- [ ] Manufacturing defect visible in photos
- [ ] Batch/lot quality issue suspected

**Liability Risk**:
- [ ] Customer threatens legal action
- [ ] Property damage claim (vehicle fire, garage damage)
- [ ] Request for incident report or safety data
- [ ] Media inquiry or public complaint

**Escalation Target**: technical@hotrodan.com  
**Tag**: `[P0 - CRITICAL]`  
**Response Time**: <30 minutes

---

## ⚠️ High Priority Escalation (P1 - Urgent)

### Escalate within 1 hour to Technical Support if:

**Complex System Design**:
- [ ] Custom fuel system design for 800+ HP
- [ ] Forced induction (turbo/supercharger) fuel system
- [ ] Alcohol fuel system (E85, methanol, nitrous)
- [ ] Dry sump oiling system with AN fittings
- [ ] Racing applications (drag, road race, oval track)

**Advanced Diagnostics Required**:
- [ ] Customer followed all troubleshooting steps, issue persists
- [ ] Intermittent failure with no clear pattern
- [ ] Multiple system failures simultaneously
- [ ] Requires dynamometer testing or professional shop

**High-Value Customer**:
- [ ] Fleet/shop order ($5,000+ value)
- [ ] Sponsored race team
- [ ] Repeat bulk buyer
- [ ] Influencer or media personality

**Escalation Target**: technical@hotrodan.com  
**Tag**: `[P1 - URGENT]`  
**Response Time**: <2 hours

---

## 📋 Standard Escalation (P2 - Normal)

### Escalate within 4 hours to Technical Support if:

**Beyond Playbook Scope**:
- [ ] Question not covered in any playbook
- [ ] Non-automotive application (marine, aviation, industrial)
- [ ] Custom fabrication consultation needed
- [ ] Compatibility with non-standard components

**Requires Expert Knowledge**:
- [ ] Material science questions (fatigue, corrosion resistance)
- [ ] Pressure rating calculations for custom application
- [ ] Thread specification questions (UNF vs metric)
- [ ] Certification questions (DOT, SAE, motorsport sanctioning bodies)

**Suspected Installer Error (Complex)**:
- [ ] Professional shop reports installation problem
- [ ] Multiple failed attempts at installation
- [ ] Customer has advanced mechanical skills, still struggling

**Escalation Target**: technical@hotrodan.com  
**Tag**: `[P2 - TECHNICAL]`  
**Response Time**: <4 hours

---

## 🔧 AN Fitting Sizing Escalation Criteria

### ✅ Level 1 Operators Can Handle:

**Basic Sizing Questions**:
- Standard AN size conversions (AN-6 = 3/8", AN-8 = 1/2")
- Fuel line sizing for common horsepower (up to 500 HP)
- Hose end sizing for braided hose
- Basic adapter identification (AN to NPT, AN to ORB)

**Example Questions You Can Answer**:
- "What size AN fitting do I need for 3/8" fuel hose?"
  - **Answer**: AN-6
- "I have a 350 HP small block, what size fuel line?"
  - **Answer**: AN-6 (3/8") feed, AN-4 (1/4") return
- "What adapter do I need for my Holley fuel pump?"
  - **Answer**: Check pump manual, likely ORB to AN adapter

**Reference**: `01-an-fittings-product-knowledge.md` (sections 3-5)

---

### ⚠️ Escalate to Technical Support:

**Complex Sizing Scenarios**:
- [ ] High-horsepower applications (700+ HP)
- [ ] Forced induction fuel system sizing
- [ ] Racing applications with specific rules
- [ ] Long fuel line runs (25+ feet requiring upsize)
- [ ] Dual fuel pump systems
- [ ] Surge tank or fuel cell sizing

**Pressure Rating Questions**:
- [ ] Maximum safe pressure for AN line size
- [ ] Burst pressure vs working pressure
- [ ] Pressure drop calculations over distance
- [ ] High-pressure EFI systems (>100 PSI)

**Material Selection (Advanced)**:
- [ ] Aluminum vs stainless for specific application
- [ ] Anodized vs non-anodized for ethanol
- [ ] PTFE vs braided stainless for temperature extremes

**Example Questions to Escalate**:
- "I'm building a twin-turbo LS making 1200 HP, what size fuel lines?"
  - **Why Escalate**: Exceeds standard playbook HP guidelines, requires expert calculation
- "Can I use aluminum AN fittings with methanol fuel?"
  - **Why Escalate**: Material compatibility with alcohol fuels requires expert knowledge
- "What's the pressure drop for AN-8 over 30 feet?"
  - **Why Escalate**: Requires engineering calculation beyond playbook scope

**Escalation Target**: technical@hotrodan.com  
**Tag**: `[SIZING - ADVANCED]`

---

## ⛽ Fuel System Escalation Criteria

### ✅ Level 1 Operators Can Handle:

**Common Fuel System Questions**:
- Basic fuel line size recommendations (up to 400 HP)
- Fuel pressure regulator setup (5-7 PSI for carburetors)
- Check valve installation for drain-back
- Fuel filter placement and sizing
- Common carburetor flooding diagnosis

**Example Questions You Can Answer**:
- "My engine dies at high RPM, what's wrong?"
  - **Troubleshoot**: Check fuel line size, fuel pump capacity, fuel filter (reference: `03-fuel-system-common-issues.md`)
- "What fuel pressure for a Holley carb?"
  - **Answer**: 5-7 PSI
- "Should my fuel filter go before or after the pump?"
  - **Answer**: After the pump (inline, not on suction side)

**Reference**: `03-fuel-system-common-issues.md` (sections 1-5)

---

### ⚠️ Escalate to Technical Support:

**Complex Fuel System Design**:
- [ ] High-horsepower fuel systems (700+ HP)
- [ ] Return-style vs returnless fuel systems
- [ ] Dual fuel pump systems (parallel or series)
- [ ] Aeromotive A1000 or high-end race pump systems
- [ ] Custom fuel cell with sump design
- [ ] Surge tank sizing and placement

**Forced Induction Systems**:
- [ ] Turbocharger fuel system upgrades
- [ ] Supercharger fuel delivery requirements
- [ ] Rising rate fuel pressure regulators
- [ ] Boost-referenced fuel pressure systems

**Alternative Fuels**:
- [ ] E85 ethanol fuel system conversions
- [ ] Methanol fuel systems (drag racing)
- [ ] Nitrous oxide wet systems
- [ ] Propane or CNG conversions

**Advanced Diagnostics**:
- [ ] Fuel pump flow testing required
- [ ] Fuel pressure gauge readings inconsistent
- [ ] Vapor lock in complex routing
- [ ] Fuel temperature management (heat exchanger)

**Example Questions to Escalate**:
- "I need a fuel system for a ProCharger F-1X on a 427 LS"
  - **Why Escalate**: High-boost forced induction requires expert fuel system design
- "Can I run E85 through my aluminum AN fittings?"
  - **Why Escalate**: Material compatibility with E85 requires technical validation
- "My fuel pressure fluctuates between 5-12 PSI randomly"
  - **Why Escalate**: Complex diagnostic beyond basic troubleshooting, may require dyno testing

**Escalation Target**: technical@hotrodan.com  
**Tag**: `[FUEL SYSTEM - ADVANCED]`

---

## 🔄 Escalation Process & Documentation

### Step 1: Prepare Escalation Documentation

**Required Information** (copy-paste template):

```
[ESCALATION REQUEST]
Date/Time: [YYYY-MM-DD HH:MM UTC]
Operator: [Your Name]
Certification Level: [Level 1/2/3]
Customer: [Name]
Contact: [Email/Phone]
Ticket ID: [Chatwoot or system ID]

ISSUE SUMMARY:
[One-sentence description]

CUSTOMER SETUP:
- Vehicle: [Year/Make/Model]
- Engine: [Type, displacement, HP]
- Fuel System: [Carb/EFI, pump type]
- Current AN Sizes: [Feed line, return line]
- Application: [Street, street/strip, race]

TROUBLESHOOTING STEPS COMPLETED:
- [ ] Step 1: [Description and result]
- [ ] Step 2: [Description and result]
- [ ] Step 3: [Description and result]

PHOTOS/EVIDENCE:
- [ ] Attached: [leak photo, fitting photo, system photo]

PLAYBOOKS REFERENCED:
- [List playbooks consulted]

CUSTOMER MECHANICAL SKILL LEVEL:
- [ ] Beginner (first-time installer)
- [ ] Intermediate (home mechanic)
- [ ] Advanced (professional shop)

WHY ESCALATING:
[Specific reason - safety, complexity, beyond certification, etc.]

URGENCY:
- [ ] P0 - Critical (safety, fire, injury)
- [ ] P1 - Urgent (high-value customer, complex system)
- [ ] P2 - Normal (beyond playbook scope)
```

### Step 2: Send Escalation

**Email**: technical@hotrodan.com  
**Subject Line Format**: `[P0/P1/P2] [CATEGORY] - Brief Description`

**Examples**:
- `[P0 - SAFETY] Fuel leak near exhaust headers - immediate risk`
- `[P1 - SIZING] Twin turbo LS 1200 HP fuel system design`
- `[P2 - TECHNICAL] AN fitting material compatibility with E85`

### Step 3: Customer Communication

**Immediately after escalating**, send customer update:

```
Hi {{customerName}},

I've reviewed your question and want to make sure you get the best possible answer. I've escalated this to our Technical Support team who specializes in {{issue type}}.

You should hear back from our technical team within {{response time}}. They'll have the expertise to give you a complete and accurate solution.

In the meantime, [any safe interim steps or information].

I'll personally follow up to make sure you're taken care of!

{{operatorName}}
```

### Step 4: Follow-Up

**Operator Responsibility**:
- [ ] Check escalation response within expected timeframe
- [ ] Ensure technical team contacted customer
- [ ] Confirm resolution before closing ticket
- [ ] Update playbooks if gap identified

---

## 🧑‍🏫 Escalation by Certification Level

### Level 1: Basic Support (Weeks 1-2)

**Can Handle Without Escalation**:
- ✅ Product sizing (standard applications up to 400 HP)
- ✅ Basic troubleshooting (leaks, tightening, installation)
- ✅ FAQ questions
- ✅ Order status and returns

**Must Escalate**:
- ⚠️ Any safety issue
- ⚠️ Horsepower >500 HP
- ⚠️ Forced induction systems
- ⚠️ Alcohol fuels
- ⚠️ Issue not in FAQ or basic playbooks

**Escalation Rate Target**: 40-50% of technical issues  
**Training Focus**: Reduce escalations by mastering playbooks

---

### Level 2: Technical Support (Weeks 3-4)

**Can Handle Without Escalation**:
- ✅ All Level 1 topics
- ✅ Advanced troubleshooting (multi-step diagnosis)
- ✅ Fuel systems up to 700 HP
- ✅ Basic racing applications (street/strip)
- ✅ Installation guidance (braided hose assembly)

**Must Escalate**:
- ⚠️ Any safety issue
- ⚠️ Horsepower >800 HP
- ⚠️ Professional racing applications
- ⚠️ Custom fuel cell design
- ⚠️ Alternative fuels (E85, methanol)

**Escalation Rate Target**: 20-30% of technical issues  
**Training Focus**: Expand knowledge to reduce escalations to <20%

---

### Level 3: Expert Support (Month 2+)

**Can Handle Without Escalation**:
- ✅ All Level 1 & 2 topics
- ✅ High-horsepower systems (up to 1000 HP)
- ✅ Forced induction (turbo/supercharger)
- ✅ E85 ethanol systems
- ✅ Racing applications (drag, road race)
- ✅ Complex system design

**Must Escalate**:
- ⚠️ Any safety issue (always escalate)
- ⚠️ Extreme racing (>1500 HP, professional series)
- ⚠️ Methanol or exotic fuel systems
- ⚠️ Engineering calculations (pressure drop, flow modeling)
- ⚠️ Suspected product defect patterns

**Escalation Rate Target**: <15% of technical issues  
**Role**: May receive escalations from Level 1/2 operators

---

## 🎯 Special Escalation Scenarios

### Angry or Frustrated Customer

**When to Escalate to Manager**:
- [ ] Customer uses profanity or threats
- [ ] Customer demands refund beyond policy
- [ ] Customer escalates to "speak to manager"
- [ ] You've attempted de-escalation, customer remains hostile

**Escalation Target**: manager@hotrodan.com  
**Tag**: `[CUSTOMER SERVICE - ESCALATION]`  
**Response Time**: <1 hour

**De-escalation Attempts Before Escalating**:
1. Acknowledge frustration: "I understand this is frustrating"
2. Take ownership: "Let's figure this out together"
3. Offer solutions: "Here are three ways we can resolve this"
4. Set expectations: "I'll personally follow up within 24 hours"

If customer remains hostile after attempts, escalate to manager.

---

### Product Return/Exchange Beyond Policy

**When to Escalate to Manager**:
- [ ] Customer requests refund after 30-day window
- [ ] Customer wants return without restocking fee (policy conflict)
- [ ] Customer damaged product, wants replacement
- [ ] Special circumstance (medical emergency, deployed military, etc.)

**Escalation Target**: manager@hotrodan.com  
**Tag**: `[RETURNS - POLICY EXCEPTION]`  
**Response Time**: <4 hours

**Include in Escalation**:
- Customer purchase history (first-time or repeat?)
- Reason for policy exception request
- Customer lifetime value (if available)
- Your recommendation (approve/deny with reasoning)

---

### Competitor or Industry Inquiry

**When to Escalate to Manager**:
- [ ] Suspected competitor posing as customer
- [ ] Request for wholesale pricing or dealer terms
- [ ] Media or journalist inquiry
- [ ] Request for proprietary technical information

**Escalation Target**: manager@hotrodan.com  
**Tag**: `[BUSINESS INQUIRY]`  
**Response Time**: <2 hours

**Do Not**:
- ❌ Share internal pricing structures
- ❌ Share supplier information
- ❌ Discuss future product plans
- ❌ Provide proprietary technical data

**Safe Response While Escalating**:
```
Thank you for your inquiry. I've forwarded your request to our business development team. Someone will reach out to you within [timeframe] to discuss this further.
```

---

## 📞 Escalation Contact Directory

### Technical Support
- **Email**: technical@hotrodan.com
- **Phone**: (555) 123-4567 ext. 102
- **Slack**: #technical-support
- **Hours**: Monday-Friday 8am-6pm EST
- **After Hours**: Email only, P0 issues call main line

### Manager
- **Email**: manager@hotrodan.com
- **Phone**: (555) 123-4567 ext. 100
- **Slack**: Direct message @manager
- **Hours**: Monday-Friday 7am-7pm EST
- **After Hours**: P0 issues only, call main line

### Engineering (Product Defects Only)
- **Email**: engineering@hotrodan.com
- **Slack**: #engineering-escalations
- **Use For**: Manufacturing defects, product failures, safety concerns
- **Response Time**: <24 hours

---

## 📈 Escalation Metrics & Tracking

### Operator Escalation Dashboard

**Track Your Escalations** (monthly review):
- **Escalation Rate**: % of tickets escalated
- **Escalation Reasons**: Safety, complexity, policy, etc.
- **False Escalations**: Issues that shouldn't have been escalated
- **Learning Opportunities**: What could you have handled?

**Goal**: Reduce escalation rate over time through training and experience.

### Team Escalation Trends

**Manager Reviews** (weekly):
- Which playbook gaps cause most escalations?
- Are escalations decreasing as operators gain experience?
- Are response times meeting targets?
- Are escalations properly documented?

**Continuous Improvement**:
- Add FAQ entries for repeated escalations
- Update playbooks to cover escalation topics
- Provide additional training on high-escalation areas

---

## ✅ Escalation Quality Checklist

### Before You Escalate, Confirm:

**Documentation Complete**:
- [ ] Ticket ID and customer contact info
- [ ] Customer setup details (vehicle, engine, HP)
- [ ] All troubleshooting steps attempted and documented
- [ ] Photos attached (if applicable)
- [ ] Playbooks referenced
- [ ] Clear reason for escalation

**Customer Notified**:
- [ ] Customer knows you're escalating
- [ ] Customer knows expected response time
- [ ] Customer has your contact for follow-up

**Proper Routing**:
- [ ] Correct escalation target (Technical, Manager, Engineering)
- [ ] Correct priority tag (P0, P1, P2)
- [ ] Correct category tag (Sizing, Fuel System, Safety, etc.)

**Follow-Up Plan**:
- [ ] Calendar reminder to check escalation response
- [ ] Plan to follow up with customer
- [ ] Ticket flagged for closure verification

---

## 🎓 Escalation Training Scenarios

### Practice Scenario 1: Safety Issue

**Customer Says**: *"I installed AN fittings on my fuel line and now I smell fuel really strong in the garage. The fitting near my exhaust header looks wet."*

**Your Action**:
1. ✅ **Immediately advise**: "Please don't start the vehicle. Safety is our top priority."
2. ✅ **Escalate**: P0 - Critical to technical@hotrodan.com
3. ✅ **Document**: Fuel leak near heat source, immediate fire risk
4. ✅ **Customer notification**: "I'm getting our technical team on this right away. Expect a call within 30 minutes. In the meantime, keep the vehicle off and ensure good ventilation."

**Why P0**: Fuel leak near ignition source = fire risk = immediate escalation

---

### Practice Scenario 2: Complex Sizing Question

**Customer Says**: *"I'm building a twin-turbo LQ9 with a ProCharger P-1X. Targeting 950 HP on pump gas with E85 option. What size AN fuel lines do I need?"*

**Your Action**:
1. ✅ **Acknowledge complexity**: "That's an impressive build! This requires expert fuel system design."
2. ✅ **Escalate**: P1 - Urgent to technical@hotrodan.com with tag `[SIZING - ADVANCED]`
3. ✅ **Document**: High-HP forced induction, dual fuel compatibility (pump gas + E85)
4. ✅ **Customer notification**: "Our technical team specializes in forced induction fuel systems. You'll hear back within 2 hours with a complete fuel system recommendation including line sizes, pump specs, and regulator setup."

**Why P1**: Exceeds playbook HP guidelines (>800 HP), forced induction, dual fuel setup

---

### Practice Scenario 3: Frustration Escalation

**Customer Says**: *"This is the third fitting I've ordered and they all leak! You guys sold me the wrong stuff and now I've wasted $200 and a weekend. I want a refund!"*

**Your Action**:
1. ✅ **De-escalate first**: "I'm really sorry you've had this experience. Let's figure out what's going on so we can get this solved today."
2. ✅ **Troubleshoot**: Walk through leak diagnosis (likely installation issue or wrong fitting type)
3. ✅ **If customer remains hostile**: Escalate to manager@hotrodan.com with tag `[CUSTOMER SERVICE]`
4. ✅ **Document**: Customer purchase history, troubleshooting attempts, customer skill level assessment

**When to Escalate**: After de-escalation attempts, if customer demands manager or refund beyond policy

---

## 📚 Related Documentation

### Internal Playbooks
- `01-an-fittings-product-knowledge.md` - Product sizing basics
- `02-an-fittings-troubleshooting.md` - Troubleshooting procedures (includes original escalation criteria)
- `03-fuel-system-common-issues.md` - Fuel system diagnosis
- `README.md` - Operator certification levels

### Internal Processes
- `docs/directions/support.md` - Support agent responsibilities
- `docs/runbooks/cx_escalations.md` - Chatwoot escalation workflows
- `docs/policies/support_sla.md` - Service level agreements

---

## 🔄 Document Maintenance

**Review Frequency**: Monthly  
**Owner**: Support Agent  
**Next Review**: November 12, 2025

**Update Triggers**:
- New product lines (requires new escalation criteria)
- Changes to technical team structure
- Repeated escalations for same issue (add to playbooks)
- Operator feedback on unclear escalation guidance

---

**Last Updated**: October 12, 2025  
**Document Owner**: Support Agent  
**Questions?** Post in #support-hot-rod-an or contact technical@hotrodan.com

---

## Quick Reference Card (Print & Keep at Desk)

```
┌─────────────────────────────────────────────┐
│     TECHNICAL ESCALATION QUICK GUIDE        │
├─────────────────────────────────────────────┤
│ P0 - CRITICAL (<30 min)                     │
│ • Safety issues (fire, leak, injury)        │
│ • Product defects                           │
│ → technical@hotrodan.com [P0 - CRITICAL]    │
├─────────────────────────────────────────────┤
│ P1 - URGENT (<2 hrs)                        │
│ • Complex system design (800+ HP)           │
│ • Forced induction                          │
│ • Alcohol fuels                             │
│ → technical@hotrodan.com [P1 - URGENT]      │
├─────────────────────────────────────────────┤
│ P2 - NORMAL (<4 hrs)                        │
│ • Beyond playbook scope                     │
│ • Requires expert knowledge                 │
│ • Non-standard application                  │
│ → technical@hotrodan.com [P2 - TECHNICAL]   │
├─────────────────────────────────────────────┤
│ CUSTOMER SERVICE                            │
│ • Angry customer (after de-escalation)      │
│ • Policy exceptions                         │
│ → manager@hotrodan.com [CUSTOMER SERVICE]   │
└─────────────────────────────────────────────┘
```

**Remember**: Escalate early on safety. Troubleshoot thoroughly before escalating complexity.


