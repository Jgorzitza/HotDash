---
epoch: 2025.10.E1
doc: docs/enablement/async_training_snippets.md
owner: enablement
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-18
---
# Asynchronous Training Snippets — Loom Script Outlines

## Overview
**Purpose:** Enable self-paced operator training while staging access is blocked  
**Format:** 5-7 minute Loom recordings with downloadable scripts  
**Target Audience:** Operators, support staff, enablement facilitators  
**Status:** ✅ **PUBLISH-READY** - Scripts complete, ready for recording

**Distribution Plan:** Store completed Loom links in this document, share via `customer.support@hotrodan.com` and `#occ-enablement`

---

## Module 1: Operator Control Center Overview & Architecture
**Duration:** 6 minutes  
**Recording Focus:** High-level architecture and value proposition

### Loom Script Outline

**[0:00-0:30] Introduction & Context**
```
Hi team! This is [Recorder Name] from Enablement. Today we're covering the Operator Control Center architecture and value proposition. This training will help you understand the big picture before we dive into specific workflows.

Since staging access is temporarily limited, we'll use slides and mockups, but the concepts transfer directly to the live system.
```

**[0:30-2:00] OCC Value Proposition**
```
The Operator Control Center solves three core problems:
1. Tab fatigue - jumping between Shopify, Chatwoot, and analytics
2. Decision blindness - not knowing who approved what, when
3. Reactive operations - finding problems after customers complain

[SLIDE: Dashboard mockup]
OCC gives you one view into CX escalations, sales performance, inventory alerts, and SEO trends. Every action you take gets logged for audit compliance.

Key principle: Everything requires operator approval. The AI suggests, you decide.
```

**[2:00-3:30] Chatwoot-on-Supabase Architecture**
```
[SLIDE: Architecture diagram]
Here's what happens behind the scenes:

1. Data flows from Shopify Admin API and Chatwoot to Supabase every 15 minutes
2. When you approve a CX reply, it writes to Supabase first, then syncs to Chatwoot
3. All decision logs, conversation history, and audit trails live in Supabase
4. The new Chatwoot instance runs on Fly.io for better performance, but data stays in Supabase for compliance

This means faster modal load times - typically under 200ms - and complete audit trails.
```

**[3:30-5:00] Session Token & Authentication Flow**
```
[SLIDE: Authentication flow]
Authentication happens automatically through Shopify's embed token system:

1. You access OCC through Shopify Admin → Apps → HotDash
2. Shopify provides an embed token that authenticates your session
3. Modals open seamlessly without additional login steps
4. If you see "Authentication Required", refresh your Shopify Admin tab and try again

Never access OCC directly by URL - always go through Shopify Admin to ensure proper authentication.
```

**[5:00-5:30] Support & Escalation**
```
[SLIDE: Escalation contacts]
For any issues or questions:
- Technical problems: customer.support@hotrodan.com
- Emergency outages: #occ-reliability channel
- Training questions: Your enablement lead

The new support inbox routes through Chatwoot-on-Supabase, so responses will be faster than our old system.
```

**[5:30-6:00] Next Steps**
```
This foundation sets you up for the hands-on modules covering CX Escalations and Sales Pulse workflows. 

Questions? Drop them in #occ-enablement or email customer.support@hotrodan.com.

Next up: Module 2 - CX Escalations Deep Dive. See you there!
```

**Recording Assets Needed:**
- [ ] Dashboard mockup slide
- [ ] Architecture diagram slide  
- [ ] Authentication flow diagram
- [ ] Contact information slide

---

## Module 2: CX Escalations Workflow Deep Dive
**Duration:** 7 minutes  
**Recording Focus:** Step-by-step modal workflow and decision making

### Loom Script Outline

**[0:00-0:30] Module Introduction**
```
Welcome to CX Escalations training! I'm [Name] from Enablement.

This module covers the most critical operator workflow: triaging SLA-breached conversations and approving AI-suggested replies. We'll walk through real scenarios and decision points.
```

**[0:30-2:00] CX Escalations Modal Walkthrough**
```
[SCREEN: Mockup of CX Escalations tile]
The CX Escalations tile shows conversations that have breached your SLA - default is 60 minutes.

Each row shows:
- Customer name and status
- How long the breach has been active  
- Last message preview

[SCREEN: Modal mockup]
Click any row to open the modal. Here you see:
- Full conversation context (last 3-5 messages)
- AI-suggested reply with customer name interpolation
- Three action buttons: Approve & Send, Escalate, Mark Resolved
```

**[2:00-3:30] Decision Framework & Guardrails**
```
Here's your decision framework:

APPROVE & SEND when:
- AI suggestion matches the customer's request
- Tone is appropriate for the situation
- No policy exceptions required

ESCALATE when:
- Customer requests supervisor or manager
- Refund amount exceeds $500
- Policy exception required
- Customer tone indicates dissatisfaction after initial breach

MARK RESOLVED only when:
- Customer already confirmed resolution
- Follow-up plan is documented elsewhere
```

**[3:30-5:00] AI Integration & Editing**
```
[SCREEN: AI suggestion example]
The AI pulls from our knowledge base to suggest replies. Key points:

1. Always verify the customer name is correct
2. Check that promises match our policies
3. Edit the suggestion inline if needed
4. If AI abstains or suggestion is way off, escalate instead

[SCREEN: Editing interface mockup]
You can edit any part of the suggested reply. Common edits:
- Adjusting timeline promises
- Adding specific order details
- Softening or strengthening tone
```

**[5:00-6:00] Decision Logging & Audit Trail**
```
[SCREEN: Decision log example]
Every action creates an audit record:
- Your operator email
- Timestamp  
- Action taken (approve/escalate/resolve)
- Full message payload
- Customer conversation ID

This data syncs to Supabase for compliance reporting. You can export decision logs for analysis, and managers can review approval patterns.
```

**[6:00-6:30] Error Handling & Support**
```
If you see modal errors:
1. Screenshot the error message
2. Note the conversation ID if visible
3. Email customer.support@hotrodan.com with the details
4. Use the escalate option to ensure the customer gets help

Most errors resolve with a Shopify Admin refresh, but we want to track patterns.
```

**[6:30-7:00] Practice & Next Steps**
```
Before the live rehearsal, practice this mental checklist:
1. Read the last 2-3 messages for context
2. Verify AI suggestion matches customer need
3. Check tone and policy compliance  
4. Choose appropriate action
5. Confirm success toast appears

Next: Module 3 covers Sales Pulse workflows. Thanks for watching!
```

**Recording Assets Needed:**
- [ ] CX Escalations tile mockup
- [ ] Modal interface mockup with conversation
- [ ] AI suggestion editing interface
- [ ] Decision log export example

---

## Module 3: Sales Pulse & Cross-Modal Integration
**Duration:** 5 minutes  
**Recording Focus:** Sales monitoring and cross-system decision making

### Loom Script Outline

**[0:00-0:30] Introduction**
```
Hi everyone! This is Sales Pulse training - your window into daily sales health and its connection to customer experience.

Sales Pulse differs from CX Escalations because you're usually creating proactive decisions rather than responding to existing problems.
```

**[0:30-2:00] Sales Pulse Modal Overview**
```
[SCREEN: Sales Pulse tile mockup]
The tile shows:
- Today's revenue vs. 7-day average
- Order count and fulfillment status
- Top performing SKUs

[SCREEN: Modal mockup]
The modal expands this with:
- Detailed revenue trends
- Pending fulfillment list with ages
- Inventory cross-reference for top SKUs
```

**[2:00-3:00] Decision Triggers & Thresholds**
```
Watch for these decision triggers:

Revenue drop >15%: Create follow-up action
Order spike >25%: Notify fulfillment lead for staffing
Fulfillment delays >24h: Page fulfillment manager
Top SKU low stock: Trigger reorder discussion

[SCREEN: KPI thresholds diagram]
These thresholds come from docs/data/kpis.md and are configurable per merchant.
```

**[3:00-4:00] Cross-Modal Data Integration**
```
[SCREEN: Integration flow diagram]
Here's where Sales Pulse connects to CX Escalations:

1. Sales anomaly detected (revenue dip, fulfillment delay)
2. Operator creates decision log entry
3. System checks for related customer conversations
4. If found, auto-generates CX escalation or internal note

This prevents customers from hearing about shipping delays through support tickets instead of proactive communication.
```

**[4:00-4:30] Supabase Decision Logging**
```
[SCREEN: Decision log interface]
Sales Pulse decisions capture:
- Metric anomaly type and threshold
- Operator response chosen
- Cross-team notifications sent
- Follow-up timeline and owner

All decisions sync to the same Supabase audit trail as CX actions.
```

**[4:30-5:00] Wrap-up & Integration**
```
Sales Pulse works best when you think about downstream effects:
- Revenue dips often predict CX volume spikes
- Inventory issues create fulfillment delays
- Fulfillment delays need proactive CX communication

Next step: Live rehearsal where you'll practice both modules together. Questions in #occ-enablement!
```

**Recording Assets Needed:**
- [ ] Sales Pulse tile and modal mockups
- [ ] KPI threshold visualization
- [ ] Cross-modal integration flow diagram
- [ ] Decision logging interface

---

## Module 4: Troubleshooting & Support Escalation
**Duration:** 4 minutes  
**Recording Focus:** Common issues and resolution paths

### Loom Script Outline

**[0:00-0:30] Introduction**
```
Final training module: troubleshooting common issues and knowing when to escalate.

Even with great architecture, things can go wrong. This module prepares you to handle problems gracefully and get help fast.
```

**[0:30-1:30] Authentication Issues**
```
[SCREEN: Error state mockups]
Most common issue: "Authentication Required" errors

Resolution steps:
1. Verify you accessed OCC through Shopify Admin (not direct URL)
2. Refresh your Shopify Admin tab and try again
3. Check that you're logged into the correct Shopify store
4. If error persists, screenshot and email customer.support@hotrodan.com

Never try to manually enter tokens or credentials.
```

**[1:30-2:30] Data Freshness & Sync Issues**
```
[SCREEN: Data freshness indicators]
Each tile shows last refresh timestamp. Flag these scenarios:

- Data older than 30 minutes during business hours
- Conversation count mismatches between OCC and Chatwoot
- Sales metrics that don't match Shopify Admin

Quick check: Visit the source system (Shopify Admin, Chatwoot) to compare. If there's a gap, that's a sync issue requiring support escalation.
```

**[2:30-3:30] Modal Load Failures & Performance**
```
[SCREEN: Performance monitoring]
Expected performance:
- Modal load: <200ms
- API responses: <300ms
- Decision logging: <5 seconds

If you experience:
- Modals taking >10 seconds to load
- Frequent timeout errors
- Decision confirmations not appearing

Screenshot the issue, note the time, and escalate immediately. Performance problems often indicate infrastructure issues.
```

**[3:30-4:00] Support Escalation & Evidence**
```
[SCREEN: Escalation template]
When escalating to customer.support@hotrodan.com:

1. Include screenshot of the issue
2. Note exact time and your operator email
3. Mention which scenario you were working on
4. If possible, include conversation/decision ID

Chatwoot-on-Supabase routing means faster response times, but good evidence helps us resolve issues on first contact.

That's it! You're ready for hands-on practice. See you at the rehearsal!
```

**Recording Assets Needed:**
- [ ] Error state screenshots
- [ ] Data freshness indicator mockups  
- [ ] Performance monitoring dashboard
- [ ] Escalation email template

---

## Production & Distribution Plan

### Recording Schedule
**Target Completion:** 2025-10-12 EOD  
**Recording Owner:** Enablement lead  
**Review Required:** Support lead approval before publication

### Recording Checklist (Per Module)
- [ ] Script rehearsal completed
- [ ] All mockup assets prepared  
- [ ] Loom recording completed (<8 minutes each)
- [ ] Closed captions added
- [ ] Video quality check passed
- [ ] Link security verified (team access only)

### Distribution Protocol
1. **Upload & Processing** (T+0)
   - Record via Loom with team access permissions
   - Add closed captions and module titles
   - Generate shareable links with expiration dates

2. **Internal Review** (T+24h)
   - Share with support lead for content validation
   - Test all links and asset accessibility  
   - Confirm alignment with live system architecture

3. **Team Distribution** (T+48h)
   - Email links to all operators and facilitators
   - Post in #occ-enablement with context and expectations
   - Archive links in `feedback/enablement.md` for reference

### Completed Recording Links
**Update this section as recordings are completed:**

- [ ] **Module 1:** OCC Overview & Architecture - [LINK PENDING]
- [ ] **Module 2:** CX Escalations Deep Dive - [LINK PENDING]  
- [ ] **Module 3:** Sales Pulse & Integration - [LINK PENDING]
- [ ] **Module 4:** Troubleshooting & Support - [LINK PENDING]

**Access Control:** Team-only links with 30-day expiration  
**Backup Storage:** Archive MP4 files to `artifacts/training/async_modules/2025-10-11/`

### Success Metrics
- [ ] **Completion Rate:** >80% of operators view all modules before rehearsal
- [ ] **Question Reduction:** <3 architecture questions during live rehearsal  
- [ ] **Preparation Quality:** Operators demonstrate understanding of workflows in practice scenarios

**Review Date:** 2025-10-17 - Assess effectiveness based on rehearsal feedback and update scripts as needed

---

## Change Log
- **2025-10-11T01:45Z:** Initial script outlines created for all four training modules
- **Pending:** Record Loom videos and update with actual links as completed