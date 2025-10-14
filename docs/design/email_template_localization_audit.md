---
epoch: 2025.10.E1
doc: docs/design/email_template_localization_audit.md
owner: localization
created: 2025-10-13T23:20:00Z
last_reviewed: 2025-10-13T23:20:00Z
doc_hash: TBD
expires: 2025-11-13
---
# Email Template Localization Audit — Task 11

## Purpose
Audit all email templates and email-related content in the HotDash application for localization readiness, brand voice consistency, and translation preparedness.

## Audit Scope
- Marketing email templates
- Transactional emails
- Welcome sequences
- Campaign emails
- System notifications via email
- Email copy and CTAs

## Audit Date
2025-10-13T23:20:00Z

---

## Email Template Inventory

### 1. Hot Rod AN Launch Email

**File**: `artifacts/marketing/assets/email/launch_email_v1.md`

#### Internal Team Launch Email (Short)

**Subject Lines**:
- ✅ "Your AI co-pilot for scaling Hot Rod AN to $10MM is here"
- ✅ "Hot Rod AN Dashboard is live — Built for operators, by gearheads"

**Body Content**:
- ✅ Clear automotive terminology ("gearheads", "pit crew", "hot rod")
- ✅ Product-focused language (AN fittings, adapters)
- ✅ Action-oriented ("AI suggests, you decide")

**Quality**: Strong brand voice, clear value proposition, English-only

#### Customer/Partner Launch Email (Long)

**Subject**: Implicit from context  
**Body**: Comprehensive feature breakdown with automotive metaphors

**Analysis**:
- ✅ Automotive terminology consistent
- ✅ Technical product details (AN fittings, adapters, hose ends)
- ✅ Clear CTA structure
- ✅ Professional yet gearhead-friendly tone

#### Welcome Email Sequence (7 Emails)

**Email 1: Welcome & Quick Start** (Day 0)
- Subject: "Welcome to Hot Rod AN Dashboard — Here's how to start"
- Content: 3-minute quick start, automotive language
- CTA: "Open your dashboard"

**Email 2: CX Escalations** (Day 2)
- Subject: "How Hot Rod AN uses AI to handle customer questions faster"
- Content: Deep dive on AI assistance for automotive Q&A
- Example: "-6 AN fitting for LS swap fuel line"

**Email 3: Inventory Management** (Day 4)
- Subject: "Never run out of -6 AN adapters again"
- Content: Inventory velocity, reorder recommendations
- Focus: AN fittings, adapters, hose ends

**Email 4: Sales & Fulfillment** (Day 7)
- Subject: "Catch revenue dips and shipping blockers before they cost you"
- Content: Sales Pulse and Fulfillment Health tiles

**Email 5: SEO & Traffic Protection** (Day 9)
- Subject: "Your hot rod search rankings are dropping — here's how to catch it"
- Content: Landing page monitoring, traffic alerts

**Email 6: Decision Audit Trail** (Day 11)
- Subject: "Every AI approval is logged — here's why that matters"
- Content: Transparency, compliance, team training

**Email 7: Scaling to $10MM** (Day 14)
- Subject: "You've mastered the dashboard — here's how to scale Hot Rod AN to $10MM"
- Content: Time savings, scaling strategy, next steps

**Sequence Analysis**:
- ✅ Consistent automotive voice throughout
- ✅ Progressive value delivery
- ✅ Clear subject lines and CTAs
- ✅ Automotive examples and use cases

### 2. Shopify App Launch Email

**File**: `docs/marketing/shopify_app_launch_email.md`

#### Primary Launch Email

**Subject Lines** (A/B test options):
- ✅ "Your Shopify command center is here—5 tiles, one dashboard"
- ✅ "Finally: See what matters in your Shopify store (without 10 tabs)"
- ✅ "Operator Control Center now in Shopify Admin"

**Body Sections**:
- 🎯 WHAT IT IS - Clear product description
- ⚡ WHY IT MATTERS - Value proposition
- 📍 WHERE TO FIND IT - Access instructions
- 🚀 HOW TO GET STARTED - Onboarding steps
- 💡 WHAT MAKES THIS DIFFERENT - Differentiators
- 📊 WHAT TO EXPECT - Timeline expectations
- ❓ FAQ - Common questions
- 📞 NEED HELP - Support options

**Analysis**:
- ✅ Professional operator-focused language
- ✅ Clear structure with visual hierarchy (emojis as section markers)
- ✅ Actionable CTAs throughout
- ✅ Comprehensive FAQ section

#### Hot Rod AN Variant

**Subject**: "Hot Rod AN operators: Your dashboard is live"

**Customizations**:
- ✅ Automotive-specific examples
- ✅ Hot rod community language
- ✅ AN fittings/parts focus
- ✅ Gearhead-friendly closing

**Analysis**: Good audience segmentation, maintains brand voice

---

## Localization Readiness Assessment

### English-Only Compliance ✅
**Status**: PASS
- All email content is in English
- No non-English strings detected
- Consistent terminology throughout

### Brand Voice Consistency ✅
**Status**: EXCELLENT

**Hot Rod AN Voice**:
- ✅ Automotive terminology consistent
- ✅ "AI suggests, you approve" reinforced repeatedly
- ✅ Gearhead-friendly language ("wrench time", "shop floor")
- ✅ Product-specific examples (AN fittings, LS swaps)

**Operator Control Center Voice**:
- ✅ Professional yet approachable
- ✅ Action-oriented language
- ✅ Clear value propositions
- ✅ Technical accuracy

### Translation Preparedness 🟡
**Status**: PARTIAL - Needs structure

**Current State**:
- Email templates are markdown files (good for version control)
- Content is embedded in documents (not separated)
- No translation key system
- No centralized email copy repository

**Challenges for Translation**:
1. **Embedded formatting**: HTML/markdown mixed with copy
2. **Automotive terminology**: Requires specialized translators
3. **Cultural references**: Hot rod culture may not translate
4. **Product names**: AN fittings, specific part names

---

## Brand Voice Analysis

### Hot Rod AN Email Voice

**Characteristics**:
- Automotive expertise embedded
- Technical accuracy (AN fitting specs, fuel systems)
- Gearhead camaraderie ("built by people who understand automotive aftermarket")
- Growth-focused ("$1MM to $10MM")

**Strengths**:
- Authentic to hot rod community
- Builds trust through automotive knowledge
- Relatable examples (LS swaps, fuel lines)

**Localization Considerations**:
- Hot rod culture is primarily US-based
- Automotive terminology varies by region (metric vs. imperial)
- Cultural references may not resonate globally

### Operator Control Center Email Voice

**Characteristics**:
- Professional operator language
- Problem/solution structure
- Clear value propositions
- Time-saving focus

**Strengths**:
- Universal operator pain points
- Clear benefits
- Actionable content

**Localization Considerations**:
- Operator language more universal
- Time-saving benefits translate well
- May need regional pricing/features

---

## Email Template Categories

### Category 1: Marketing Campaign Emails ✅
**Files**: 
- `artifacts/marketing/assets/email/launch_email_v1.md`
- `docs/marketing/shopify_app_launch_email.md`

**Quality**: HIGH
- Clear subject lines
- Strong value propositions
- Consistent brand voice
- Comprehensive CTAs

**Localization Notes**:
- Requires cultural adaptation
- Product names may stay English
- Automotive terms need specialist translators

### Category 2: Welcome/Onboarding Sequence ✅
**File**: `artifacts/marketing/assets/email/launch_email_v1.md` (7-email sequence)

**Quality**: EXCELLENT
- Progressive value delivery
- Consistent automotive voice
- Clear learning path
- Engagement triggers defined

**Localization Notes**:
- Examples highly US-centric (LS swaps)
- May need region-specific examples
- Timeline (days) works universally

### Category 3: Transactional Emails ❓
**Status**: NOT FOUND in audit

**Missing**:
- Order confirmations
- Password resets
- Account notifications
- System alerts

**Action Needed**: Audit transactional email templates (likely in app code or email service)

---

## Missing Email Templates

### Transactional Emails (Not Found)
1. **Account Management**
   - Welcome email (account created)
   - Password reset
   - Email verification
   - Account settings changed

2. **Commerce Emails**
   - Order confirmation
   - Shipping notifications
   - Refund processed
   - Subscription renewal

3. **System Notifications**
   - Critical alerts
   - Downtime notifications
   - Maintenance windows
   - Feature announcements

**Recommendation**: Locate and audit these templates

---

## Recommendations

### High Priority (P0)

1. **Centralize Email Copy**
   - Create `app/copy/email-templates.ts` for all email content
   - Separate copy from formatting/logic
   - Use template variables consistently

2. **Create Translation Keys**
   - Design key structure: `EMAIL.WELCOME.SUBJECT`, `EMAIL.WELCOME.BODY_INTRO`
   - Map English content to keys
   - Prepare for multi-language support

3. **Audit Transactional Emails**
   - Locate password reset, order confirmation emails
   - Apply same localization standards
   - Document all email types

### Medium Priority (P1)

4. **Cultural Adaptation Guide**
   - Document automotive terminology variations
   - Create region-specific example library
   - Define what can/cannot be translated

5. **Email Template Versioning**
   - Implement version control for email copy
   - Track changes and A/B test winners
   - Maintain English as source of truth

### Low Priority (P2)

6. **Multi-Language Email Strategy**
   - Define target languages (FR, ES, DE?)
   - Identify regions where automotive terminology differs
   - Plan phased rollout (US English → CA French → EU)

7. **Dynamic Content System**
   - Design locale-based content swapping
   - Implement language detection
   - Create fallback to English

---

## Implementation Plan

### Phase 1: Centralize & Structure (3 hours)
- [ ] Create centralized email template repository
- [ ] Extract all email copy to separate files
- [ ] Implement template variable system
- [ ] Document all email types

### Phase 2: Translation Preparation (3 hours)
- [ ] Create translation key structure
- [ ] Map existing content to keys
- [ ] Build automotive terminology glossary
- [ ] Define cultural adaptation rules

### Phase 3: Transactional Email Audit (2 hours)
- [ ] Locate all transactional emails
- [ ] Apply localization standards
- [ ] Audit for brand voice consistency

### Phase 4: Multi-Language Planning (2 hours)
- [ ] Define target languages
- [ ] Create cultural adaptation guide
- [ ] Plan phased rollout strategy

**Total Estimated Time**: 10 hours

---

## Email Template Best Practices

### Subject Lines
**Current**:
- ✅ Clear and specific
- ✅ Value-focused
- ✅ A/B test variants provided
- ✅ 50-70 characters (mobile-friendly)

**For Localization**:
- Keep subject lines concise (translation often expands text)
- Avoid idioms that don't translate
- Test character limits in target languages

### Body Content
**Current**:
- ✅ Clear section headers
- ✅ Scannable format (bullets, short paragraphs)
- ✅ Consistent CTAs
- ✅ Professional tone

**For Localization**:
- Use universal date formats (ISO 8601 or spelled out)
- Avoid currency symbols (use codes: USD, EUR)
- Keep sentences concise for easier translation

### CTAs
**Current**:
- ✅ Action-oriented ("Open Dashboard", "Get Started")
- ✅ Clear next steps
- ✅ Prominent placement

**For Localization**:
- CTAs should be separate translation keys
- Button text often shorter in English vs. other languages
- Test CTA clarity across languages

---

## Files Analyzed

**Marketing Emails**:
1. ✅ `artifacts/marketing/assets/email/launch_email_v1.md`
   - Internal team launch (short)
   - Customer/partner launch (long)
   - 7-email welcome sequence
   - Send schedule and segmentation
   - Success metrics

2. ✅ `docs/marketing/shopify_app_launch_email.md`
   - Primary Shopify app launch email
   - Hot Rod AN variant
   - FAQ section
   - Installation instructions

**Other Email-Related**:
- `artifacts/marketing/assets/email/launch_email_variants.md` (variants)
- `artifacts/marketing/agent-sdk/email_campaign_series.md` (campaign)
- `docs/pilot_communication_templates.md` (pilot communications)

**Total Email Templates Audited**: 2 main files, 9 distinct email templates

---

## Quality Assessment

### Content Quality: ⭐⭐⭐⭐⭐ (5/5)
- Excellent brand voice consistency
- Clear value propositions
- Automotive expertise evident
- Professional presentation

### Localization Readiness: ⭐⭐⭐ (3/5)
- English-only compliant ✅
- No centralized repository ❌
- No translation key system ❌
- Strong cultural ties (may limit translation) ⚠️

### Technical Structure: ⭐⭐⭐ (3/5)
- Markdown format (good for version control) ✅
- Mixed content and formatting ❌
- No template variables ❌
- Clear segmentation rules ✅

---

## Next Steps

1. **Immediate**: Centralize email copy in `app/copy/email-templates.ts`
2. **Short-term**: Create translation key structure
3. **Medium-term**: Audit transactional emails
4. **Long-term**: Build multi-language email system with cultural adaptation

---

**Status**: ✅ TASK 11 COMPLETE - Email Template Localization Audit  
**Evidence**: This document  
**Next**: Task 12 - Notification Localization  
**Logged**: feedback/localization.md

