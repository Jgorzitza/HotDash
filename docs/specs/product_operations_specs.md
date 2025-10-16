# Product Operations Specifications

**Document Type:** Operational Specifications  
**Owner:** Product Agent  
**Version:** 1.0  
**Date:** 2025-10-15  
**Scope:** Backlog items 8-25 (User roles, NFRs, Telemetry, Project plan, Roadmap, Changelog, UX writing, Design tokens, Demo, UAT, Launch comms, Support, Risk, Rollback templates, Success metrics, Feedback loop, Issue templates, Allowed paths)

---

## 8. User Roles & Permissions Spec

### Roles
**CEO (Owner):**
- Full access to all features
- Can approve/reject all approvals
- Can view all data
- Can modify settings

**Future Operator (Limited):**
- View dashboard (read-only)
- Approve/reject CX approvals only
- Cannot modify settings
- Cannot approve inventory/growth actions

### Permissions Matrix
| Feature | CEO | Operator |
|---------|-----|----------|
| View Dashboard | ✅ | ✅ |
| View Approvals | ✅ | ✅ (CX only) |
| Approve CX | ✅ | ✅ |
| Approve Inventory | ✅ | ❌ |
| Approve Growth | ✅ | ❌ |
| Modify Settings | ✅ | ❌ |
| View Analytics | ✅ | ✅ |

### Implementation
- Shopify app authentication (OAuth)
- Role stored in Supabase `users` table
- RLS policies enforce permissions
- UI hides unauthorized features

---

## 9. NFRs (Non-Functional Requirements)

### Performance
- **Dashboard load time:** P95 <3 seconds
- **API response time:** P95 <500ms
- **Tile refresh:** <1 second
- **Concurrent users:** Support 10 users (future)

### Reliability
- **Uptime:** ≥99.9% (30-day rolling)
- **Error rate:** <0.5%
- **Data accuracy:** 100% vs source systems
- **Backup frequency:** Daily (Supabase auto-backup)

### Security
- **Authentication:** Shopify OAuth required
- **Authorization:** RLS policies in Supabase
- **Secrets:** No secrets in code (Gitleaks enforced)
- **HTTPS:** Required for all connections
- **Data encryption:** At rest and in transit

### Scalability
- **Data volume:** Support 100K products, 10K orders/day
- **Approvals:** Support 100 approvals/day
- **Storage:** 100GB Supabase limit (monitor usage)

### Accessibility
- **WCAG 2.1 AA:** Full compliance
- **Keyboard navigation:** All features accessible
- **Screen reader:** VoiceOver/NVDA compatible
- **Color contrast:** 4.5:1 (normal), 3:1 (large/interactive)

### Maintainability
- **Code coverage:** ≥80% for critical paths
- **Documentation:** All features documented
- **Runbooks:** Incident response procedures
- **Monitoring:** Prometheus + Grafana + Sentry

---

## 10. Telemetry Definitions (Events + KPIs)

### Events to Track
**Dashboard Events:**
- `dashboard_loaded` - Dashboard page loaded
- `tile_clicked` - User clicked a tile (properties: tile_name)
- `tile_viewed` - Tile came into viewport
- `dashboard_refreshed` - User manually refreshed

**Approval Events:**
- `approval_viewed` - User viewed approval details
- `approval_approved` - User approved approval (properties: agent, tool, risk_level)
- `approval_rejected` - User rejected approval
- `approval_graded` - User graded approval (properties: tone, accuracy, policy)

**Error Events:**
- `error_occurred` - Any error (properties: error_type, error_message, stack_trace)
- `api_error` - API call failed (properties: endpoint, status_code)

### KPIs to Track
**Performance KPIs:**
- Dashboard load time (P50, P95, P99)
- API response time (P50, P95, P99)
- Error rate (%)
- Uptime (%)

**Usage KPIs:**
- Daily active users
- Sessions per day
- Page views per session
- Time on dashboard (avg, median)
- Approvals processed per day

**Quality KPIs:**
- AI draft rate (%)
- Approval latency (median, P95)
- Grade averages (tone, accuracy, policy)
- Data accuracy (%)

**Business KPIs:**
- Time saved (estimated hours/week)
- Stockouts prevented (#)
- Customer satisfaction (CSAT)
- SEO issues resolved (#)

---

## 11. Project Plan Updates (Weekly)

### Weekly Update Template
**Week of [Date]:**

**Completed:**
- [Feature 1] - [Brief description]
- [Feature 2] - [Brief description]

**In Progress:**
- [Feature 3] - [Status, ETA]

**Blocked:**
- [Blocker 1] - [Description, owner]

**Next Week:**
- [Planned work 1]
- [Planned work 2]

**Metrics:**
- Velocity: [X] features shipped
- Quality: [X] bugs introduced
- Performance: [X]s load time

---

## 12. Roadmap (Next 4 Weeks Molecules)

### Week 1-2: Dashboard Launch + Fixes
- Launch dashboard to production
- Fix any critical bugs
- Optimize performance
- Collect CEO feedback

### Week 3-4: Approvals Drawer
- Implement evidence section
- Add grading interface
- Add request changes workflow
- Test and ship

### Week 5-6: Inventory ROP
- Implement ROP calculation
- Add safety stock formula
- Add status buckets
- Generate PO CSV

### Week 7-8: CX HITL Email
- AI draft generation
- Chatwoot integration
- Public reply on approval
- Grading and learning loop

---

## 13. Changelog Policy and Template

### Policy
- **Frequency:** Every release (weekly or as needed)
- **Audience:** CEO, team
- **Format:** Markdown in `CHANGELOG.md`
- **Categories:** Added, Changed, Fixed, Removed, Security

### Template
```markdown
# Changelog

## [Unreleased]

## [1.1.0] - 2025-10-22

### Added
- Approvals Drawer with evidence section
- Grading interface for CX approvals
- Request changes workflow

### Changed
- Improved dashboard load time from 2.5s to 2.0s
- Updated tile refresh interval from 60s to 30s

### Fixed
- Fixed approval badge count mismatch
- Fixed mobile layout on iPhone SE

### Security
- Rotated API keys
- Updated dependencies with security patches
```

---

## 14. UX Writing Guidelines

### Tone
- **Friendly but professional:** "Let's review this approval" not "Approval requires review"
- **Clear and concise:** "Approve" not "Click here to approve this action"
- **Action-oriented:** "View details" not "Details available"

### Voice
- **Active voice:** "You approved this" not "This was approved"
- **Second person:** "Your dashboard" not "The dashboard"
- **Present tense:** "Loading..." not "Will load..."

### Error Messages
- **Explain what happened:** "Dashboard failed to load"
- **Explain why:** "The server is not responding"
- **Explain what to do:** "Try refreshing the page or contact support"

### Success Messages
- **Confirm action:** "Approval approved successfully"
- **Next steps:** "The AI will send the reply now"

### Button Labels
- **Specific:** "Approve Email Reply" not "Approve"
- **Action verbs:** "View Details" not "Details"
- **Short:** 1-3 words max

---

## 15. Review Design Tokens Sign-Off

### Design Tokens (Polaris)
- **Colors:** Use Polaris color tokens (e.g., `--p-color-bg-surface`)
- **Spacing:** Use Polaris spacing scale (e.g., `--p-space-4`)
- **Typography:** Use Polaris text styles (e.g., `TextStyle.bodyMd`)
- **Shadows:** Use Polaris shadow tokens (e.g., `--p-shadow-md`)

### Custom Tokens (If Needed)
- **Brand colors:** Define in CSS variables
- **Custom spacing:** Use Polaris scale as base
- **Custom typography:** Extend Polaris styles

### Sign-Off Checklist
- [ ] All colors use Polaris tokens
- [ ] All spacing uses Polaris scale
- [ ] All typography uses Polaris styles
- [ ] No hardcoded values in components
- [ ] Design tokens documented

---

## 16. Stakeholder Demo Script

### Demo Flow (15 min)
**1. Introduction (2 min)**
- "This is the Hot Rod AN Control Center"
- "It centralizes metrics, inventory, CX, and growth in one place"

**2. Dashboard Tour (5 min)**
- "Here are 7 live tiles showing key metrics"
- Click each tile, explain what it shows
- "All data updates automatically"

**3. Approvals Workflow (5 min)**
- "This is where AI agents ask for permission"
- Open an approval, show evidence
- "You review, approve or reject, and grade the quality"
- Approve an example

**4. Mobile Demo (2 min)**
- "Works on phone and tablet too"
- Show responsive design

**5. Q&A (1 min)**
- "Any questions?"

---

## 17. UAT Plan (Scenarios + Owners)

### Scenario 1: Dashboard Load
**Owner:** CEO
**Steps:**
1. Log into Shopify Admin
2. Navigate to Apps → Hot Rod AN
3. Verify dashboard loads in <3 seconds
4. Verify all 7 tiles show data

**Pass Criteria:** Dashboard loads, all tiles functional

---

### Scenario 2: Approve CX Reply
**Owner:** CEO
**Steps:**
1. Click Approvals Queue tile
2. Click an approval card
3. Review evidence
4. Grade (tone, accuracy, policy)
5. Click Approve

**Pass Criteria:** Approval approved, public reply sent

---

### Scenario 3: Mobile Usage
**Owner:** CEO
**Steps:**
1. Open dashboard on phone
2. Scroll through tiles
3. Tap Approvals
4. Review and approve

**Pass Criteria:** All features work on mobile

---

## 18. Launch Comms Draft

**Subject:** 🚀 Hot Rod AN Control Center - Now Live!

**Body:**
```
Hi Justin,

The Hot Rod AN Control Center is now live!

**What You Get:**
- 7 live dashboard tiles (Revenue, AOV, Returns, Stock Risk, SEO, CX, Approvals)
- Approvals workflow for AI agent actions
- Mobile-responsive design
- <3 second load time

**Access:** [URL]

**Training:** [Link to guides]

**Support:** Slack #support or support@hotrodan.com

Enjoy!
```

---

## 19. Support Playbook Outline

### Common Issues

**Issue: Dashboard not loading**
- **Cause:** Server down, network issue, browser cache
- **Solution:** Refresh, clear cache, check Fly.io status

**Issue: Tile shows error**
- **Cause:** API failure, data sync issue
- **Solution:** Click retry, refresh dashboard, check logs

**Issue: Can't approve**
- **Cause:** Dev mode, validation failed, already processed
- **Solution:** Check environment, check validation, refresh

### Escalation
- Level 1: Product Agent (usage questions)
- Level 2: Manager (technical issues)
- Level 3: CEO (strategic decisions)

---

## 20. Risk Matrix + Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Dashboard down | High | Low | Uptime monitoring, rollback plan |
| Data inaccuracy | High | Medium | Validation scripts, alerts |
| Slow performance | Medium | Medium | Performance monitoring, optimization |
| Security breach | Critical | Low | Gitleaks, push protection, audits |
| User confusion | Medium | Medium | Training, documentation, support |

---

## 21. Rollback Plan Templates

See `docs/specs/rollback_criteria.md` for detailed rollback procedures.

**Quick Rollback:**
```bash
fly secrets set ENABLE_NEW_DASHBOARD=false -a hot-dash
```

---

## 22. Post-Launch Success Metrics

See `docs/specs/monitoring_plan.md` for detailed metrics.

**30-Day Targets:**
- P95 load time <3s
- Uptime ≥99.9%
- CEO uses daily
- ≥10 approvals/week
- CEO satisfaction ≥4.0/5.0

---

## 23. Feedback Loop Plan (Grades/Edits)

**Collect:**
- Approval grades (tone, accuracy, policy)
- CEO edits (diff between draft and final)
- Rejection reasons

**Analyze:**
- Grade trends over time
- Common edit patterns
- Rejection patterns

**Improve:**
- Fine-tune AI on CEO edits
- Update prompts based on feedback
- Adjust suggestion algorithms

---

## 24. Issue Templates Review

### Bug Report Template
```markdown
**Describe the bug:**
[Clear description]

**Steps to reproduce:**
1. [Step 1]
2. [Step 2]

**Expected behavior:**
[What should happen]

**Actual behavior:**
[What actually happened]

**Screenshots:**
[If applicable]

**Environment:**
- Browser: [e.g., Chrome 120]
- Device: [e.g., iPhone 12]
```

### Feature Request Template
```markdown
**Feature description:**
[What feature do you want?]

**Problem it solves:**
[What pain point does this address?]

**Proposed solution:**
[How should it work?]

**Alternatives considered:**
[Other approaches?]
```

---

## 25. Allowed Paths Validation Samples

### Valid Paths
```
docs/specs/dashboard_launch_checklist.md ✅
docs/specs/user_acceptance_criteria.md ✅
feedback/product/2025-10-15.md ✅
```

### Invalid Paths
```
docs/notes.md ❌ (not in allow-list)
app/README.md ❌ (not in allow-list)
random-file.md ❌ (not in allow-list)
```

### Validation Command
```bash
node scripts/policy/check-docs.mjs
```

---

## Document Control

**Version History:**
- 1.0 (2025-10-15): Initial product operations specs by Product Agent

**Review Schedule:**
- Manager: Approve all operational specs
- Engineer: Validate technical specs (NFRs, telemetry)
- CEO: Approve user-facing specs (UX writing, demo, UAT)

**Related Documents:**
- `docs/specs/dashboard_launch_readiness.md` - Launch checklist
- `docs/specs/monitoring_plan.md` - Monitoring and metrics
- `docs/specs/rollback_criteria.md` - Rollback procedures
- `docs/RULES.md` - Documentation policy
- `docs/NORTH_STAR.md` - Product vision

