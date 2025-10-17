# Module 1: Operator Control Center Overview & Architecture

**Duration:** 6 minutes  
**Objective:** Understand OCC architecture, value proposition, and Chatwoot-on-Supabase integration  
**Prerequisites:** Basic familiarity with Shopify Admin and customer support workflows

## Learning Outcomes

After completing this module, operators will:

- Understand the OCC value proposition and core problems it solves
- Know the Chatwoot-on-Supabase architecture and data flow
- Understand session token authentication requirements
- Know escalation paths for technical issues

## Script Outline

### [0:00-0:30] Introduction & Context

```
Hi team! This is [Recorder Name] from Enablement. Today we're covering the
Operator Control Center architecture and value proposition. This training will
help you understand the big picture before we dive into specific workflows.

Since staging access is temporarily limited, we'll use slides and mockups, but
the concepts transfer directly to the live system.
```

### [0:30-2:00] OCC Value Proposition

```
The Operator Control Center solves three core problems:
1. Tab fatigue - jumping between Shopify, Chatwoot, and analytics
2. Decision blindness - not knowing who approved what, when
3. Reactive operations - finding problems after customers complain

[SLIDE: Dashboard mockup]
OCC gives you one view into CX escalations, sales performance, inventory alerts,
and SEO trends. Every action you take gets logged for audit compliance.

Key principle: Everything requires operator approval. The AI suggests, you decide.
```

### [2:00-3:30] Chatwoot-on-Supabase Architecture

```
[SLIDE: Architecture diagram]
Here's what happens behind the scenes:

1. Data flows from Shopify Admin API and Chatwoot to Supabase every 15 minutes
2. When you approve a CX reply, it writes to Supabase first, then syncs to Chatwoot
3. All decision logs, conversation history, and audit trails live in Supabase
4. The new Chatwoot instance runs on Fly.io for better performance, but data
   stays in Supabase for compliance

This means faster modal load times - typically under 200ms - and complete audit trails.
```

### [3:30-5:00] Session Token & Authentication Flow

```
[SLIDE: Authentication flow]
Authentication happens automatically through Shopify's embed token system:

1. You access OCC through Shopify Admin → Apps → HotDash
2. Shopify provides an embed token that authenticates your session
3. Modals open seamlessly without additional login steps
4. If you see "Authentication Required", refresh your Shopify Admin tab and try again

Never access OCC directly by URL - always go through Shopify Admin to ensure
proper authentication.
```

### [5:00-5:30] Support & Escalation

```
[SLIDE: Escalation contacts]
For any issues or questions:
- Technical problems: customer.support@hotrodan.com
- Emergency outages: #occ-reliability channel
- Training questions: Your enablement lead

The new support inbox routes through Chatwoot-on-Supabase, so responses will be
faster than our old system.
```

### [5:30-6:00] Next Steps

```
This foundation sets you up for the hands-on modules covering CX Escalations and
Sales Pulse workflows.

Questions? Drop them in #occ-enablement or email customer.support@hotrodan.com.

Next up: Module 2 - CX Escalations Deep Dive. See you there!
```

## Demo Steps

1. Show dashboard mockup with tile layout explanation
2. Walk through architecture diagram highlighting Supabase persistence
3. Demonstrate session token flow (simulated)
4. Show escalation contact information

## Required Assets

- [ ] Dashboard mockup slide
- [ ] Architecture diagram slide
- [ ] Authentication flow diagram
- [ ] Contact information slide

## References

- **Architecture Details:** `docs/enablement/job_aids/cx_escalations_modal.md`
- **Session Token Workflow:** `staging/distribution/chatwoot_supabase_session_token_packet/README.md`
- **Support Escalation:** `customer.support@hotrodan.com`

## Success Criteria

- Operators can explain the three core problems OCC solves
- Operators understand data flows through Supabase
- Operators know to access OCC only through Shopify Admin
- Operators know escalation paths for technical issues

---

**Recording Status:** ⏳ Ready for Loom recording  
**Review Required:** Support lead approval before publication  
**Distribution:** Team access only with 30-day expiration
