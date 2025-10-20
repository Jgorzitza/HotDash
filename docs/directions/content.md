# Content Direction v5.0

**Owner**: Manager  
**Effective**: 2025-10-20T20:00Z  
**Version**: 5.0  
**Status**: ACTIVE — Option A Content Templates

---

## Objective

**Create content TEMPLATES for agents to use** (not actual content - agents create that post-launch)

**Primary Reference**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan — LOCKED)

**Your Role**: Microcopy, templates, content guidelines for UI and agents

---

## Current Status

**Completed** (from feedback 2025-10-20):
- ✅ 4 microcopy guides created (2,505 lines)
- ✅ Ready to support Option A phases

---

## Phase-Specific Tasks

### PHASE 2: Modal Microcopy (Already Complete ✅)

**Status**: Engineer can use existing microcopy for enhanced modals

---

## Day 1 Tasks (START NOW - 5h) — ALL MICROCOPY UPFRONT

**Strategy**: Create ALL microcopy NOW → Engineer never waits for copy

### CONTENT-001: Notification Message Templates (2h) — DAY 1

**Create**: `docs/specs/microcopy-notifications.md`

**Toast Messages**:
```
Success:
- "Action approved and executed"
- "Settings saved successfully"
- "Feedback submitted"

Error:
- "Approval failed. Please try again."
- "Connection lost. Check your internet."
- "Unable to save settings."

Info:
- "3 new approvals need review"
- "Queue refreshed"
- "Performance update available"
```

**Banner Messages**:
```
Queue Backlog (>10 pending):
- "You have 12 pending approvals. Review queue?"
- CTA: "View Queue"

Performance (<70% approval rate):
- "Approval rate dropped to 65%. Check queue health?"
- CTA: "View Metrics"

System Health:
- "Chatwoot service degraded. Some features unavailable."
- CTA: "Check Status"
```

**Browser Notification Text**:
```
New Approval:
- Title: "New approval needed"
- Body: "Customer reply waiting for your review"

Critical Alert:
- Title: "Urgent: Queue backlog"
- Body: "10+ approvals pending review"
```

---

### CONTENT-002: Settings Page Microcopy (1h) — DAY 1

**Create**: `docs/specs/microcopy-settings-page.md`

**Tab Labels**:
- Dashboard
- Appearance  
- Notifications
- Integrations

**Section Headers, Help Text, Button Labels**:
- "Customize your dashboard"
- "Choose which tiles to display"
- "Reset to default layout"
- "Select your preferred theme"
- "Enable desktop notifications"

---

### CONTENT-003: Social Post Templates (2h) — DAY 1

**Create**: `app/fixtures/content/social-post-templates.json`

**Templates** (agents use these to draft posts):

```json
{
  "product_launch": {
    "platforms": ["facebook", "instagram", "twitter"],
    "template": "🔥 NEW: {product_name} is here! {brief_description} Shop now: {shop_url}",
    "variations": [
      "Introducing {product_name}! {selling_point_1}. Available now.",
      "Ready for this? {product_name} just dropped. {selling_point_2}."
    ],
    "hashtags": ["#NewArrival", "#HotRodan", "#ShopNow"],
    "best_times": ["9am", "12pm", "6pm"]
  },
  "sale_announcement": {
    "platforms": ["facebook", "instagram", "twitter", "linkedin"],
    "template": "💥 SALE: {discount_pct}% off {category}! Use code {promo_code} at checkout.",
    "variations": [
      "{discount_pct}% off sale starts NOW! Limited time on {category}.",
      "Flash sale alert! Save {discount_pct}% on {product_name}."
    ]
  },
  "restock_alert": {
    "platforms": ["instagram", "twitter"],
    "template": "✨ BACK IN STOCK: {product_name}! Get yours before they're gone again.",
    "variations": [
      "{product_name} is BACK! Limited quantities available.",
      "You asked, we restocked! {product_name} available now."
    ]
  }
}
```

**CRITICAL**: These are TEMPLATES - agents fill in {variables} after launch, not Content team

---

### PHASE 12: Social Media Guidelines (1h) — QUEUED

**CONTENT-004**: Agent Social Media Guidelines

**Create**: `docs/specs/social-media-guidelines.md`

**Brand Voice** (for agents to follow):
- Hot Rodan theme (speed, performance, automotive)
- Enthusiastic but professional
- Emoji usage: Moderate (1-2 per post)
- Hashtag limit: 3-5 per post

**Platform Guidelines**:
- **Instagram**: Visual-first, 1-2 paragraphs max, hashtags important
- **Facebook**: Longer form OK, conversation starter questions
- **Twitter**: Brief (280 char), trending hashtags, timely
- **LinkedIn**: Professional tone, business value, industry insights

**Forbidden**:
- Clickbait
- All-caps (except short exclamations)
- Excessive emojis (>3)
- Controversial topics

---

## Work Protocol

**1. MCP Tools** (if needed):
```bash
# For style guides:
mcp_context7_get-library-docs("/websites/mailchimp_content_style_guide", "brand-voice")

# For social best practices:
# Use web_search for current platform guidelines (Context7 may not have)
```

**2. Coordinate**:
- **Engineer**: Provide microcopy when they need it
- **Designer**: Align copy with visual design
- **Integrations**: Review templates for Publer compatibility

**3. Reporting (Every 2 hours)**:
```md
## YYYY-MM-DDTHH:MM:SSZ — Content: Phase N Templates

**Working On**: CONTENT-001 (notification microcopy)
**Progress**: Toast messages complete, banner messages in progress

**Evidence**:
- File: docs/specs/microcopy-notifications.md (187 lines)
- Templates: 12 success, 8 error, 6 info messages
- Reviewed by: Designer (approved tone/length)

**Blockers**: None
**Next**: Complete banner and browser notification text
```

---

## Definition of Done (Each Task)

**Templates**:
- [ ] JSON format (if programmatic)
- [ ] Markdown format (if documentation)
- [ ] All {variables} documented
- [ ] Platform variations included
- [ ] Brand voice consistent (Hot Rodan theme)

**Microcopy**:
- [ ] Concise (no unnecessary words)
- [ ] Actionable (clear next steps)
- [ ] Accessible (plain language, no jargon)
- [ ] Error messages helpful (what to do, not just "error")

**Guidelines**:
- [ ] Clear rules for agents to follow
- [ ] Examples provided
- [ ] Platform-specific advice
- [ ] Brand voice documented

**Evidence**:
- [ ] Files created with line counts
- [ ] Designer review (if visual impact)
- [ ] Feedback updated

---

## Critical Reminders

**DO**:
- ✅ Create TEMPLATES (agents fill in variables)
- ✅ Document brand voice for agents
- ✅ Platform-specific guidelines
- ✅ Keep Hot Rodan theme (speed, performance, automotive)

**DO NOT**:
- ❌ Create actual social posts (agents do that post-launch)
- ❌ Write actual customer replies (agents do that)
- ❌ Fill in template variables (agents do that)
- ❌ Skip brand voice guidelines (agents need clear rules)

---

## Phase Schedule

**Day 1** (5h) — START NOW:
- CONTENT-001: Notification microcopy (2h)
- CONTENT-002: Settings microcopy (1h)
- CONTENT-003: Social templates (2h)

**Result**: ALL microcopy ready upfront → Engineer NEVER waits for copy

**Total**: 5 hours Day 1 (parallel with other agents)

---

## Quick Reference

**Plan**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan)
**Current Work**: Microcopy guides complete (4 files, 2,505 lines)
**Feedback**: `feedback/content/2025-10-20.md`
**Startup**: `docs/runbooks/agent_startup_checklist.md`

---

**START WITH**: Standby mode, ready to provide notification microcopy for Phase 4
