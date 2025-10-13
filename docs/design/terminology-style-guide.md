# HotDash Terminology & Style Guide

**Version:** 1.0.0  
**Owner:** Localization  
**Created:** 2025-10-13  
**Purpose:** Standardize terminology and writing style across all HotDash content

---

## Overview

This guide ensures consistent terminology and professional writing style across:
- Product UI (dashboard, tiles, components)
- Documentation (runbooks, guides, READMEs)
- Agent prompts and responses
- Marketing and support materials

**Companion Document**: `docs/GLOSSARY.md` (technical term definitions)

---

## 1. Approved Terminology

### Product & Features

**✅ APPROVED - Use These:**

| Term | Context | Example |
|------|---------|---------|
| **Operator Control Center** | Full product name | "Welcome to the Operator Control Center" |
| **Hot Dash** | Short product name | "Hot Dash dashboard" |
| **Dashboard** | Generic reference | "View your dashboard" |
| **Tile** | Dashboard card component | "The Sales Pulse tile shows revenue" |
| **Approval Queue** | Feature name | "Navigate to the Approval Queue" |
| **Action** | Recommended task | "Review this recommended action" |
| **Agent** | AI assistant | "The Order Support agent can help" |

**❌ PROHIBITED - Don't Use These:**

| Don't Say | Say Instead | Why |
|-----------|-------------|-----|
| "Widget" | "Tile" | Inconsistent terminology |
| "Bot" | "Agent" | Less professional |
| "Dashboard thing" | "Dashboard tile" | Vague |
| "AI thingy" | "AI agent" | Unprofessional |
| "App" | "Dashboard" or "Hot Dash" | Ambiguous |

---

### Automotive-Themed Terms

**✅ APPROVED - Use These:**

| Term | When to Use | Example |
|------|-------------|---------|
| **All systems ready** | Healthy status | "All systems ready - no issues detected" |
| **Engine trouble** | Errors only | "Engine trouble - unable to load data" |
| **Full speed ahead** | Success messages | "Full speed ahead! Changes saved." |
| **Tune-up** | Configuration needed | "Tune-up required to enable this feature" |
| **Performance** | Metrics, optimization | "Track performance metrics" |
| **Boost** | Improvements | "Boost your conversion rate" |
| **Optimize** | Make better | "Optimize this product page" |

**❌ PROHIBITED - Don't Use These:**

| Don't Say | Why | Say Instead |
|-----------|-----|-------------|
| "Vroom" | Too informal | "Full speed ahead" |
| "Rev up" | Cliché | "Accelerate" or "Boost" |
| "Floor it" | Slang | "Maximize" or "Optimize" |
| "In the driver's seat" | Overused metaphor | "In control" |
| "Shift gears" | Mixed metaphor | "Change focus" |
| "Brake" / "Braking" | Confusing | "Pause" or "Stop" |

**Usage Rule**: Maximum 1-2 automotive terms per screen/message

---

### Technical Terms

**✅ APPROVED - Consistent Usage:**

| Term | Usage | Don't Use |
|------|-------|-----------|
| **GraphQL** | Always capitalize | "Graphql", "graphql" |
| **API** | Always uppercase | "Api", "api" |
| **OAuth** | Capitalize correctly | "Oauth", "oAuth" |
| **Shopify** | Always this spelling | "shopify" |
| **Supabase** | Always this spelling | "SupaBase", "supabase" |
| **React Router** | Two words, capitalize both | "ReactRouter", "react-router" |
| **MCP** | Always uppercase | "Mcp", "mcp" |

**Technical Abbreviations - Write Out First Time:**
- "Row-Level Security (RLS)"
- "Service Level Agreement (SLA)"
- "Search Engine Optimization (SEO)"
- "Customer Experience (CX)"

---

### Customer-Facing Terms

**✅ APPROVED:**

| Term | Context | Notes |
|------|---------|-------|
| **Customer** | External users | Not "user" in support context |
| **Operator** | Dashboard user | Hot Rod AN staff |
| **Order** | Purchase | Not "transaction" |
| **Product** | Item for sale | Not "item" or "SKU" in customer context |
| **Shipping** | Delivery | Not "fulfillment" in customer context |
| **Return** | Send back | Not "RMA" with customers |

**❌ PROHIBITED (Customer-Facing):**
- "End user" (say "customer")
- "Ticket" (say "conversation" or "inquiry")
- "Case" (say "order" or "request")
- Internal codes without explanation

---

## 2. Writing Style Guide

### Voice & Tone

**Brand Voice: Professional Operator**
- Operator-to-operator communication
- Technically competent
- Efficient and direct
- Solution-oriented

**Tone Guidelines:**

**✅ Professional**
```
Good: "Your order shipped yesterday and will arrive October 14."
Bad: "Hey! Your stuff is coming tomorrow lol"
```

**✅ Direct**
```
Good: "Error: Database connection failed. Check your credentials."
Bad: "Well, it seems like maybe there might be an issue with the database..."
```

**✅ Helpful**
```
Good: "To fix this, update your API key in Settings > Integrations."
Bad: "Something is wrong. Figure it out."
```

---

### Grammar & Mechanics

**Capitalization:**
- **Sentence case** for headings (not Title Case)
- **Product names**: Capitalize (Hot Dash, Operator Control Center)
- **Features**: Capitalize (Approval Queue, Sales Pulse tile)
- **Technical terms**: Follow standard capitalization (GraphQL, API, OAuth)

**Punctuation:**
- **One space** after periods
- **Serial comma** (Oxford comma): "orders, shipping, and returns"
- **No trailing punctuation** in headings
- **Periods in complete sentences**, even in lists

**Numbers:**
- **Spell out** zero through nine: "five tiles", "three agents"
- **Use numerals** for 10+: "15 orders", "100 products"
- **Use numerals** for measurements: "2 hours", "5 MB"
- **Use commas** in large numbers: "1,000 products"

**Abbreviations:**
- **First use**: Write out with abbreviation: "Customer Experience (CX)"
- **Subsequent**: Use abbreviation: "CX metrics"
- **Common tech**: Can use without writing out (API, URL, SEO)

---

### Formatting

**Lists:**
- Use **parallel structure** (all start same way)
- **Complete sentences** = periods
- **Fragments** = no periods
- **Ordered lists** for steps (1, 2, 3)
- **Unordered lists** for features (bullets)

**Code:**
- **Inline code**: Use backticks for `file names`, `commands`, `variables`
- **Code blocks**: Use triple backticks with language
- **Constants**: ALL_CAPS_WITH_UNDERSCORES
- **Functions**: camelCase

**Links:**
- **Descriptive text**: "See the [installation guide](link)"
- **Not generic**: Avoid "click here", "read more"
- **Action-oriented**: "Install Hot Dash", "Configure API"

---

### Content Structure

**Documentation:**
1. **Overview** (what is this?)
2. **Prerequisites** (what do you need?)
3. **Steps** (how to do it)
4. **Examples** (show me)
5. **Troubleshooting** (common issues)

**UI Messages:**
1. **What happened** (immediate answer)
2. **Why** (brief explanation if helpful)
3. **What to do** (clear next step)

**Error Messages:**
1. **What failed** ("Engine trouble - unable to load data")
2. **Why/context** ("Connection to database lost")
3. **How to fix** ("Check your internet connection and try again")

---

## 3. Prohibited Terms

### Terms to Avoid

**❌ Informal/Slang:**
- "Stuff", "thing", "thingy"
- "Gonna", "wanna", "gotta"
- "LOL", "OMG", any internet slang
- "Hack", "ninja", "rockstar" (overused tech terms)

**❌ Vague:**
- "Soon", "later" (be specific: "within 24 hours")
- "A few", "several" (use numbers: "3-5")
- "Might", "maybe" (be definitive or say "may")
- "Stuff like that" (be specific)

**❌ Jargon (Without Explanation):**
- "Leverage" (use "use")
- "Utilize" (use "use")
- "Touch base" (say "discuss" or "meet")
- "Circle back" (say "follow up")
- "Deep dive" (say "detailed analysis")

**❌ Passive Voice (When Possible):**
- "The error was encountered" → "We encountered an error"
- "The order will be shipped" → "We'll ship your order"
- "It is recommended" → "We recommend"

---

## 4. Consistency Rules

### Terminology Consistency

**Pick ONE term and use consistently:**

**For "Recommended Action":**
- ✅ Use: "Action" or "Recommendation"
- ❌ Don't mix: "Action", "Task", "Todo", "Suggestion" interchangeably

**For "Customer Inquiry":**
- ✅ Use: "Conversation" (in Chatwoot context)
- ❌ Don't mix: "Conversation", "Ticket", "Case", "Thread"

**For "Dashboard Component":**
- ✅ Use: "Tile"
- ❌ Don't mix: "Tile", "Card", "Widget", "Panel"

### Naming Conventions

**Features:**
- Use descriptive names: "Approval Queue" not "Queue"
- Be consistent: "Sales Pulse" not "Sales" sometimes and "Sales Pulse" other times
- Match North Star document exactly

**Buttons:**
- Action verbs: "Approve", "Reject", "Save", "Cancel"
- Not: "OK", "Yes", "No" (too generic)

**Status Labels:**
- Consistent across all components
- Use HOT_ROD_STATUS constants
- Don't mix "OK", "Good", "Healthy", "Ready"

---

## 5. Technical Writing Best Practices

### Documentation Style

**DO:**
- ✅ Start with overview/purpose
- ✅ Use numbered steps for procedures
- ✅ Include code examples
- ✅ Provide expected outputs
- ✅ Add troubleshooting section
- ✅ Use headings for scanability
- ✅ Keep paragraphs short (3-4 sentences max)

**DON'T:**
- ❌ Assume knowledge (define terms)
- ❌ Skip steps (be complete)
- ❌ Use ambiguous language
- ❌ Forget examples
- ❌ Write walls of text

### Code Comments

**DO:**
- ✅ Explain WHY, not WHAT (code shows what)
- ✅ Use complete sentences with periods
- ✅ Update comments when code changes
- ✅ Add context for complex logic

**Example:**
```typescript
// GOOD:
// Using Set for O(1) lookup performance with large datasets
const seenIds = new Set(existingIds);

// BAD:
// make a set
const seenIds = new Set(existingIds);
```

---

## 6. Brand Voice Specific Rules

### Hot Rod AN Voice

**Characteristics:**
- Professional but approachable
- Technically competent
- Efficient (no fluff)
- Subtle automotive DNA

**Examples:**

**✅ On-Brand:**
```
"Optimize your product page for better performance. Expected impact: 
40% visibility increase."
```

**❌ Off-Brand:**
```
"Hey! You should totally fix this page because it's not doing so great and 
like, it could be way better if you just make some changes, you know?"
```

---

### Automotive Metaphor Guidelines

**When to Use:**
- Status messages ("All systems ready")
- Success confirmations ("Full speed ahead")
- Error states ("Engine trouble")
- Action buttons ("Tune-up" for refresh)

**When NOT to Use:**
- Technical documentation (use precise technical language)
- Error logs (use technical terms)
- API responses (use standard HTTP messages)
- Code comments (use clear descriptive language)

**Usage Frequency:**
- **UI screens**: 1-2 automotive terms per screen
- **Messages**: 1 automotive term per message max
- **Documentation**: Sparingly in user-facing docs, never in technical docs

---

## 7. Inclusive Language

### Guidelines

**Use gender-neutral language:**
- ✅ "Operator", "User", "Customer", "Developer"
- ❌ "Guys", "He/she", "Salesman"

**Use person-first language:**
- ✅ "Operators using assistive technology"
- ❌ "Disabled operators"

**Avoid ableist language:**
- ✅ "Blocked", "Not responding"
- ❌ "Crippled", "Lame", "Crazy"

**Avoid unnecessarily gendered terms:**
- ✅ "Staff hours", "Work hours"
- ❌ "Man hours"

---

## 8. Error Message Style

### Error Message Formula

**Structure:**
```
[What happened] - [Brief explanation]. [How to fix].
```

**Examples:**

**✅ Good:**
```
"Engine trouble - database connection failed. Check your credentials and try again."
"Unable to load orders - Shopify API rate limit reached. Please wait 30 seconds."
"Save failed - network connection lost. Check your internet and retry."
```

**❌ Bad:**
```
"Error" (not helpful)
"Something went wrong" (too vague)
"An error occurred while processing your request" (too generic)
```

### Error Message Tone

**Be:**
- Clear about what happened
- Helpful with next steps
- Professional but not robotic
- Specific (not vague)

**Don't:**
- Blame the user
- Use technical jargon
- Be condescending
- Cause panic

---

## 9. Success Message Style

### Success Message Formula

**Structure:**
```
[Success confirmation]. [What happened]. [Optional: Next step].
```

**Examples:**

**✅ Good:**
```
"Full speed ahead! Your order is ready to ship."
"Changes saved successfully. Your updates are live."
"Approval processed. The agent will send the reply to the customer."
```

**❌ Bad:**
```
"OK" (not informative)
"Success" (too generic)
"Your request has been completed" (passive, vague)
```

---

## 10. Documentation Writing Standards

### Runbook Format

**Standard Structure:**
```markdown
# [Runbook Title]

**Purpose**: [One sentence]
**Applies To**: [Who uses this]
**Time**: [How long it takes]
**Prerequisites**: [What you need]

## Steps

### Step 1: [Action]
[Instructions]
**Checkpoint**: ✅ [Verification]

### Step 2: [Action]
[Instructions]
**Checkpoint**: ✅ [Verification]

## Troubleshooting
[Common issues and fixes]
```

### README Format

**Standard Structure:**
```markdown
# [Project/Feature Name]

[One paragraph overview]

## Quick Start

[Minimal steps to get started]

## Features

- [Feature 1]
- [Feature 2]

## Installation

[Detailed steps]

## Usage

[Examples]

## Documentation

[Links to additional docs]
```

---

## 11. UI Copy Standards

### Button Labels

**DO:**
- ✅ Use action verbs: "Save", "Cancel", "Approve", "Reject"
- ✅ Be specific: "Save Changes" not just "OK"
- ✅ Be consistent: Always "Approve" not sometimes "Accept"

**DON'T:**
- ❌ Use vague labels: "Submit", "OK", "Continue"
- ❌ Mix terminology: "Approve" and "Accept" for same action
- ❌ Use long phrases: "Click here to save your changes"

### Empty States

**Formula:**
```
[Status/Heading]
[Brief explanation or encouragement]
```

**Examples:**

**✅ Good:**
```
All systems ready
No escalations detected. Excellent customer service performance!
```

**❌ Bad:**
```
Nothing here
There's no data to display right now.
```

### Loading States

**Keep brief and reassuring:**
- ✅ "Starting engines..."
- ✅ "Loading latest data..."
- ✅ "Processing..."

**Not:**
- ❌ "Please wait..."
- ❌ "Loading..."
- ❌ "One moment please..."

---

## 12. Agent Prompt Writing Standards

### System Prompt Structure

**Standard Format:**
```markdown
# [Agent Name] System Prompt

**Version:** X.X.X
**Last Updated:** YYYY-MM-DD
**Purpose:** [One sentence]

## Role
[Who the agent is]

## Core Responsibilities
1. [Responsibility 1]
2. [Responsibility 2]

## Your Workflow
### Step 1: [Action]
[Instructions]

### Step 2: [Action]
[Instructions]

## Tools You Have
[Tool descriptions and when to use]

## Example Interactions
[Concrete examples]

## What NOT to Do
[Prohibited actions]

## Tone & Voice
[Voice guidelines]
```

### Prompt Writing Guidelines

**DO:**
- ✅ Be extremely specific about expected behavior
- ✅ Provide concrete examples (not abstract principles)
- ✅ Define clear decision criteria
- ✅ Include edge cases and how to handle them
- ✅ Specify tone and voice explicitly

**DON'T:**
- ❌ Be vague ("be helpful" - how?)
- ❌ Assume AI will infer unstated requirements
- ❌ Skip examples ("you should know what to do")
- ❌ Mix multiple personas in one prompt

---

## 13. Marketing & Support Copy

### Marketing Copy

**Characteristics:**
- Benefit-focused (what's in it for them?)
- Active voice
- Specific claims with evidence
- Clear call-to-action

**Example:**
```
✅ Good:
"Reduce operator time from 10 hours to 2 hours per week with AI-assisted approvals. 
Hot Rod AN saved 8 hours weekly in the first month."

❌ Bad:
"Our innovative platform leverages cutting-edge AI to optimize your workflows 
and drive operational excellence."
```

### Support Copy

**Characteristics:**
- Empathetic but efficient
- Solution-focused
- Specific next steps
- Professional tone

**Example:**
```
✅ Good:
"I understand the delay is frustrating. I've expedited your order to overnight 
shipping at no charge. It will arrive tomorrow by 10:30 AM. Tracking: [link]"

❌ Bad:
"We apologize for any inconvenience this may have caused. We will look into this 
matter and get back to you soon."
```

---

## 14. Terminology Evolution Process

### Adding New Terms

**Process:**
1. **Propose**: Document new term with rationale
2. **Review**: Localization team reviews for consistency
3. **Approve**: Manager approves addition
4. **Document**: Add to this guide and GLOSSARY.md
5. **Communicate**: Announce to team
6. **Enforce**: Use consistently going forward

### Deprecating Old Terms

**Process:**
1. **Flag**: Identify outdated or problematic term
2. **Replace**: Define replacement term
3. **Update**: Update all documentation
4. **Communicate**: Announce deprecation
5. **Migration Period**: Allow 30 days for transition
6. **Enforce**: After 30 days, old term is prohibited

### Example Deprecation

**Deprecated**: "Widget" → **New**: "Tile"  
**Rationale**: "Widget" is generic, "Tile" is specific to our dashboard  
**Migration**: 2025-10-13 to 2025-11-13  
**Status**: All new content must use "Tile"

---

## 15. Quality Standards

### Minimum Quality Criteria

**All content must meet:**
- ✅ 0 spelling errors
- ✅ 0 grammar errors
- ✅ Consistent terminology (per this guide)
- ✅ Appropriate tone (per voice guidelines)
- ✅ Clear and actionable (no ambiguity)
- ✅ Professional (business-appropriate)

### Quality Review Process

**Self-Review Checklist:**
- [ ] Read aloud (catches awkward phrasing)
- [ ] Check terminology consistency
- [ ] Verify all terms defined or explained
- [ ] Spell check
- [ ] Grammar check
- [ ] Tone appropriate for audience

**Peer Review:**
- Second set of eyes on all customer-facing content
- Focus on clarity and tone
- Verify terminology consistency

---

## 16. Style Guide Violations

### Common Mistakes

**Mistake 1: Inconsistent Terminology**
```
❌ "The approval queue shows pending approvals and tasks to review"
✅ "The Approval Queue shows pending approvals"
```
(Don't call it "task" if it's an "approval")

**Mistake 2: Passive Voice**
```
❌ "The order will be shipped by our fulfillment team"
✅ "We'll ship your order today"
```

**Mistake 3: Too Many Automotive Terms**
```
❌ "Rev up your engine and shift into high gear to accelerate performance 
and turbocharge your sales velocity!"
✅ "Optimize your product pages to boost sales performance."
```

**Mistake 4: Vague Error Messages**
```
❌ "Error occurred"
✅ "Engine trouble - unable to save changes. Check your connection and try again."
```

---

## 17. Terminology Enforcement

### Automated Checks

**Linter Rules** (future):
- Flag deprecated terms
- Suggest approved alternatives
- Check automotive term frequency
- Verify consistent capitalization

**Manual Review:**
- Weekly scan for new terms
- Monthly terminology audit
- Quarterly style guide updates

### Escalation

**If unsure about terminology:**
1. Check this guide first
2. Check GLOSSARY.md
3. Search existing codebase for precedent
4. Ask localization team
5. Document decision for future

---

## Appendix: Quick Reference

### Approved vs Prohibited Quick List

| Category | ✅ Use | ❌ Avoid |
|----------|---------|----------|
| **Product** | Hot Dash, Dashboard, Tile | App, Widget, Panel |
| **Users** | Operator, Customer | User, End-user, Person |
| **Actions** | Approve, Reject, Save | OK, Accept, Yes/No |
| **Status** | All systems ready, Engine trouble | OK, Error, Failed |
| **Automotive** | Optimize, Boost, Performance | Rev up, Floor it, Vroom |
| **Time** | Within 24 hours, October 14 | Soon, Later, ASAP |

### Writing Quality Checklist

- [ ] 0 spelling errors
- [ ] 0 grammar errors
- [ ] Consistent terminology
- [ ] Appropriate tone
- [ ] Clear and specific
- [ ] Action-oriented
- [ ] Professional
- [ ] Automotive terms (max 1-2 per message)

---

**Document Owner**: Localization  
**Companion**: docs/GLOSSARY.md (term definitions)  
**Review Schedule**: Monthly  
**Last Updated**: 2025-10-13  
**Next Review**: 2025-11-13

