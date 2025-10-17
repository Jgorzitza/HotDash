# Knowledge Base Pilot Preparation Checklist

**Version**: 1.0
**Date**: October 11, 2025
**Owner**: Product Agent (For Support Agent to Execute)
**Purpose**: Ensure KB is ready for pilot launch
**Evidence**: 50-item checklist organized by priority

---

## Critical KB Articles (Must Have by Oct 27)

### Shipping & Tracking (32% of inquiries)

- [ ] **Shipping Policy v2.1** (current version, verified accurate)
- [ ] **Standard Shipping Times** (domestic, by carrier)
- [ ] **International Shipping** (countries we ship to, times, costs)
- [ ] **Tracking Number Help** (how to track, what statuses mean)
- [ ] **Lost Package Procedure** (when to file claim, how we help)
- [ ] **Delayed Shipment Policy** (what we do when orders are late)

**Test**: Ask AI "Where is my order?" → Should retrieve shipping policy + tracking guide

---

### Returns & Refunds (12% of inquiries)

- [ ] **Return Policy v3.0** (30-day window, conditions, restocking fee)
- [ ] **How to Start a Return** (step-by-step process, return label)
- [ ] **Refund Timeline** (5-7 business days after we receive item)
- [ ] **Refund Exceptions** (final sale items, damaged by customer)
- [ ] **Exchange Process** (swap for different size/color)

**Test**: Ask AI "How do I return this?" → Should retrieve return policy + process

---

### Product Information (11% of inquiries)

- [ ] **Product Specifications** (top 20 products with detailed specs)
- [ ] **Product Care Instructions** (how to clean, maintain, store)
- [ ] **Warranty Information** (what's covered, how long, how to claim)
- [ ] **Compatibility** (what works with what)
- [ ] **Size Guides** (for clothing/shoes if applicable)

**Test**: Ask AI "Is this waterproof?" → Should retrieve product specs

---

### Account & Login (6% of inquiries)

- [ ] **Password Reset** (how to reset, troubleshooting)
- [ ] **Account Creation** (how to create account, benefits)
- [ ] **Update Account Info** (change email, address, payment)
- [ ] **Privacy & Data** (what we store, how to delete account)

**Test**: Ask AI "I forgot my password" → Should retrieve password reset guide

---

### Payment & Billing (8% of inquiries)

- [ ] **Accepted Payment Methods** (credit cards, PayPal, etc.)
- [ ] **Payment Failed** (common reasons, how to fix)
- [ ] **Billing Questions** (why was I charged X?, invoice help)
- [ ] **Discount Codes** (how to apply, current promotions)

**Test**: Ask AI "Why was my payment declined?" → Should retrieve payment troubleshooting

---

### General FAQs (varies)

- [ ] **Business Hours** (when we're available for support)
- [ ] **Contact Information** (email, chat, phone if applicable)
- [ ] **About HotDash** (who we are, mission)
- [ ] **Shipping Cutoff Times** (order by X for same-day shipping)
- [ ] **Holiday Schedule** (Black Friday, Christmas closures)

---

## KB Quality Checklist

**For Each Article**:

- [ ] **Current**: Information is up-to-date (check version, last updated date)
- [ ] **Accurate**: Reviewed by someone who knows the policy
- [ ] **Clear**: Written in simple language, no jargon
- [ ] **Complete**: Answers the full question, not just part
- [ ] **Scannable**: Uses headers, bullets, bold for key info
- [ ] **Examples**: Includes real examples when helpful

**Format for AI**:

```markdown
# Return Policy

**Version**: 3.0
**Last Updated**: October 1, 2025
**Applies To**: All orders

## Return Window

You can return items within **30 days** of delivery.

## Conditions

- Item must be unused and in original packaging
- Include original tags and receipt
- Some items are final sale (marked on product page)

## How to Return

1. Log in to your account
2. Go to Orders → Select order → Request Return
3. Print return label
4. Ship back within 7 days

## Refund Timeline

- We process refunds within **5-7 business days** after receiving item
- Refund goes to original payment method
- Email confirmation sent when processed

## Questions?

Contact support@hotdash.com or chat with us!
```

---

## Testing Instructions (For Support Agent)

**How to Test KB Coverage**:

1. Take sample customer messages from last 30 days
2. Run them through LlamaIndex query
3. Check: Did it retrieve the right article?
4. Check: Is the article helpful and complete?
5. If no good results: Create missing article

**Target**: >85% of common inquiries have relevant KB article

**Tool**: Test environment at `http://localhost:8005/test-query`

---

## KB Gaps to Fill (From Workflow Analysis)

**Top 10 inquiries with NO KB article** (create these first):

1. "When will my order arrive?" → Create "Expected Delivery Times" article
2. "Can I change my order?" → Create "Order Modification Policy"
3. "Do you ship to [country]?" → Create "International Shipping Countries" list
4. "What's your phone number?" → Create "Contact Us" article
5. "Is this in stock?" → Create "Inventory Status" guide (or integrate with Inventory API)
6. "How do I track my package?" → Create "Package Tracking Guide"
7. "What if item is damaged?" → Create "Damaged Item Policy"
8. "Can I get expedited shipping?" → Create "Shipping Upgrade Options"
9. "Do you price match?" → Create "Price Match Policy"
10. "How do I leave a review?" → Create "Product Reviews Guide"

**Priority**: Create 1-2 articles per day leading up to pilot

---

## Version Control

**Why it matters**: Policies change, KB must stay current

**Version Format**:

- Shipping Policy v2.1 (Oct 1, 2025)
- Return Policy v3.0 (Sep 15, 2025)

**When to update version**:

- Policy changes (content change = minor version bump)
- Major policy overhaul (major version bump)

**Archive old versions**: Keep for reference, but mark as "Outdated"

---

## Pilot Monitoring (Week 1)

**Daily**: Check "Top 10 queries with no KB results"
**Action**: Create missing articles within 24 hours
**Track**: KB coverage should improve from 75% → 90% during pilot

**Success**: Zero "no KB results" by end of Week 2

---

**Document Path**: `docs/knowledge_base_pilot_preparation.md`  
**Owner**: Product Agent (Supporting Support Agent)  
**Status**: Ready for Support Agent to execute KB audit  
**North Star**: ✅ **Practical checklist that ensures operators have right information**
