# Launch Content Brief

Date: 2025-10-19
Owner: content agent
Status: Approved — CEO (self) tone review completed

## Engagement Metrics (Launch KPI Set)

- Engagement Rate = (likes + comments + shares + saves) / impressions × 100
- Click-Through Rate = clicks / impressions × 100
- Conversion Rate = conversions / clicks × 100

Sources:

- See docs/specs/content_tracking.md for interface definitions and formulas

## KPI Targets (Launch)

Measurement Window: first 14 days post-publish (UTC) per post; weekly rollup for dashboard.

Targets:

- Instagram Engagement Rate ≥ 4.0%
- TikTok Engagement Rate ≥ 5.0%
- Facebook Engagement Rate ≥ 2.0%
- Click-Through Rate (all platforms) ≥ 1.2%
- Conversion Rate (site traffic from social) ≥ 2.0% (post-click)

Operational Notes:

- Zero-division guardrails apply (see formulas in content_tracking spec).
- Use platform saves where available (IG/TikTok) in ER numerator.
- Attribution: last non-direct click from social to on-site event (future GA4 correlation).

## Metrics Sources

- Tracking library: app/lib/content/tracking.ts (formulas + placeholders)
- Spec: docs/specs/content_tracking.md (data structures, formulas)
- Data (future): Publer adapter, Supabase storage, GA4 correlation

## Evidence & Data Sources

- Dashboard: planned tile for content performance (Milestone M6)
- GA4: correlation for conversion tracking (future)
- Supabase: content posts + performance history (future)

## Copy QA Checklist (CEO/Marketing Review Required)

### Brand Voice & Tone

- [ ] Clear, concise copy; action-first language
- [ ] Brand voice: friendly, direct, helpful (hot rod enthusiast peer, not salesperson)
- [ ] Avoid industry jargon unless explaining it; emphasize user outcome
- [ ] Conversational but authoritative - "we build/restore together" tone
- [ ] Include compelling CTA where appropriate

### Content Accuracy

- [ ] Product specs verified against inventory/supplier data
- [ ] Pricing matches current Shopify catalog
- [ ] Claims backed by evidence (GA4, competitor research, supplier quotes)
- [ ] Timeline/availability dates are realistic and confirmed
- [ ] Links/URLs tested and functional

### SEO & Discoverability

- [ ] Primary keyword in headline/first 100 characters
- [ ] Meta description 120-155 characters, includes CTA
- [ ] Alt text for all images (descriptive, includes product name)
- [ ] Internal links to related products/content where relevant
- [ ] Schema markup planned for product launches (JSON-LD)

### HITL Approval Gates

- [ ] Customer-facing copy reviewed by CEO before publish
- [ ] Product claims verified by Product agent
- [ ] Pricing/promotion approved by Manager
- [ ] Social post drafts staged in Publer (not auto-published)
- [ ] Email copy tested for deliverability (future: Chatwoot integration)

### Platform-Specific Guidelines

**Shopify Product Listings**

- Title: 60 chars max, front-load product type
- Description: Benefits before features, 3-5 bullet points
- Tags: Include year range (1950s/1960s/1970s), part type, brand compatibility

**Social Posts (Instagram/Facebook/TikTok)**

- Hook in first 5 words
- Include 1-2 relevant hashtags (not spammy)
- CTA in caption or first comment
- Image/video: High-quality, shows product in context (on car, in use)

**Blog Posts**

- H1 = primary keyword + benefit
- Subheadings every 200-300 words
- 1-2 images per 500 words
- Conclusion includes related products/CTA

### Microcopy Standards

**Buttons**

- Primary CTA: "Shop [Product Type]" or "Pre-Order Now"
- Secondary CTA: "Learn More" or "See Details"
- Urgency: "Limited Stock" or "First 50 Units" (only if true)

**Error Messages**

- Out of stock: "Currently unavailable - [Join waitlist / Check back [date]]"
- Form errors: "Please add [specific field]" (not generic "Error")

**Success Messages**

- Order confirmation: "You're all set! Order #[number] confirmed"
- Newsletter signup: "Welcome! Check your email for [benefit]"

**Navigation/Labels**

- "Shop by Era" not "Categories"
- "Restoration Projects" not "Blog"
- "Build Gallery" not "Photos"

Review Status: APPROVED by CEO (self) on 2025-10-19

---

## CX Workflow (Customer Reply Drafting)

**Last Updated**: 2025-10-19

### Overview

AI-Customer agent provides production-safe customer reply drafting with Human-In-The-Loop (HITL) approval, grading, and learning signal collection for Chatwoot conversations.

### Workflow Steps

1. **Conversation Detection**: Monitor Chatwoot for new/open customer conversations
2. **Draft Generation**: AI generates reply using RAG context from knowledge base
3. **Private Note Creation**: Draft posted as Private Note (internal, visible to agents only)
4. **HITL Approval**: Agent reviews draft, provides grading (tone/accuracy/policy 1-5), approves or rejects
5. **Public Reply**: On approval, draft sent as public customer-facing reply
6. **Learning Signal**: Capture human edits, grading scores, edit distance for supervised learning

### Grading Metadata

All customer reply drafts are graded on a 1-5 scale:

- **Tone** (1-5): Friendly, professional, aligned with brand voice
- **Accuracy** (1-5): Factually correct, addresses customer need
- **Policy** (1-5): Follows company policies and guidelines

Grading data stored in `customer_reply_grading` Supabase table for:

- Quality metrics tracking
- Learning signal collection
- Performance dashboards

### Learning Signals

Learning signals collected from HITL approvals:

- **Edit Distance**: Levenshtein distance between AI draft and human-edited reply
- **Edit Ratio**: Normalized edit distance (0 = identical, 1 = completely different)
- **Grading Scores**: Tone, accuracy, policy ratings
- **Approval Status**: Boolean flag for approved vs rejected drafts
- **RAG Sources**: Knowledge base articles used for draft generation
- **Confidence Score**: AI confidence in draft quality (0-1)

### Quality Metrics

Dashboard tile displays:

- **% AI-Drafted**: Percentage of replies drafted by AI vs manual
- **Quality Score**: Average of tone, accuracy, policy (1-5)
- **Approval Rate**: % of drafts approved without major edits
- **Avg Edit Distance**: Characters changed from AI draft

Target performance:

- ≥ 90% of replies drafted by AI
- Quality scores ≥ 4.5 average
- Approval rate ≥ 85%

### Technical Implementation

- **Draft Generator**: `app/agents/customer/draft-generator.ts`
- **Chatwoot API**: `app/agents/customer/chatwoot-api.ts`
- **Grading Schema**: `app/agents/customer/grading-schema.ts`
- **Learning Signals**: `app/agents/customer/learning-signals.ts`
- **Logger Stub**: `app/agents/customer/logger.stub.ts`
- **Approval UI**: `app/components/CustomerReplyApproval.tsx`
- **Metrics Tile**: `app/components/tiles/CustomerReplyQualityTile.tsx`
- **Database Migration**: `supabase/migrations/20251019084700_create_customer_reply_grading.sql`

### Health Checks

- **Chatwoot Health Script**: `scripts/ops/check-chatwoot-health.mjs`
  - Tests `/rails/health` endpoint (unauthenticated)
  - Tests `/api/v1/accounts/<account_id>` (authenticated with API key)
  - Writes artifacts to `artifacts/ops/chatwoot_health_<timestamp>.json`
  - Run via: `npm run ops:check-chatwoot-health`

### Approval Flow (HITL)

Per `docs/OPERATING_MODEL.md` and `docs/specs/approvals_drawer_spec.md`:

- All customer replies require human approval before sending
- Approvals drawer shows: conversation context, AI draft, evidence, risk assessment
- Grading UI captures quality scores
- Approved drafts sent via Chatwoot API
- Rejected drafts stored with grading for learning

### Future Enhancements

- Automated quality threshold adjustments based on grading trends
- Fine-tuning with supervised learning from graded edits
- Expanded RAG knowledge base integration
- Real-time approval SLA tracking
- A/B testing for different prompting strategies

---

## KPI Targets (FINALIZED - 2025-10-19)

### Platform Targets (14-day post-publish window)

| Platform  | Engagement Rate | Click-Through Rate | Notes                         |
| --------- | --------------- | ------------------ | ----------------------------- |
| Instagram | ≥ 4.0%          | ≥ 1.2%             | Include saves in ER numerator |
| TikTok    | ≥ 5.0%          | ≥ 1.2%             | Higher engagement expected    |
| Facebook  | ≥ 2.0%          | ≥ 1.2%             | Lower typical engagement      |

### Conversion Targets

- **Conversion Rate**: ≥ 2.0% (social click → purchase)
- **Attribution**: Last non-direct click (14-day window)
- **Tracking**: GA4 + UTM parameters + Supabase event logging

### Engagement Metrics Formulas

```typescript
// Engagement Rate
ER = ((likes + comments + shares + saves) / impressions) × 100

// Click-Through Rate
CTR = (clicks / impressions) × 100

// Conversion Rate
CR = (conversions / clicks) × 100

// Zero-division guards
if (impressions === 0) return 0;
if (clicks === 0) return 0;
```

### Post Performance Tiers

- **Exceptional**: >150% of target (e.g., IG ER > 6.0%)
- **Above Target**: 100-150% of target (e.g., IG ER 4.0-6.0%)
- **At Target**: 75-100% of target (e.g., IG ER 3.0-4.0%)
- **Below Target**: <75% of target (e.g., IG ER < 3.0%)

### Data Collection Schedule

- **Real-time**: Post publish confirmation (Publer receipt)
- **24 hours**: Initial engagement snapshot
- **7 days**: Mid-window check
- **14 days**: Final performance measurement
- **Weekly rollup**: Aggregate for dashboard tile

## Approvals

- CEO Tone Approval: APPROVED (self) on 2025-10-19
- KPI Targets: FINALIZED on 2025-10-19 (v3.0 direction)

## Implementation Status

### Completed (2025-10-19)

- [x] KPI targets defined and finalized
- [x] Formulas documented (ER, CTR, CR with zero-division guards)
- [x] Copy QA checklist complete with platform-specific guidelines
- [x] **CON-003**: Publer integration stub created
  - Types: `app/adapters/publer/types.ts`
  - Mock client: `app/adapters/publer/client.mock.ts`
  - OAuth docs: `docs/integrations/publer-oauth-setup.md`
  - Feature flag: `PUBLER_LIVE_POSTING_ENABLED = false`
- [x] **CON-004**: Tracking library implemented
  - `app/lib/content/tracking.ts`
  - Functions: calculateEngagementRate, calculateCTR, calculateConversionRate
  - Platform targets, performance tiers
- [x] **CON-005**: Post Drafter Service created
  - `app/services/content/post-drafter.ts`
  - Platform-specific post generation (Instagram/Facebook/TikTok)
  - Tone checking, target metrics calculation
- [x] **CON-006**: Engagement Analyzer implemented
  - `app/services/content/engagement-analyzer.ts`
  - Performance analysis, insights generation, weekly reports
- [x] **CON-007**: Content Approvals Flow wired
  - `app/services/content/approvals-integration.ts`
  - HITL flow, CEO grading, evidence formatting
- [x] **CON-008**: Dashboard tile created
  - `app/components/dashboard/ContentTile.tsx`
  - Displays posts published, avg ER, top performers, pending approvals
- [x] **CON-009**: CEO Tone Checklist validator
  - `app/lib/content/tone-validator.ts`
  - Brand voice rules, CTA analysis, readability scoring

### Integration Flow

```
Idea Pool Fixture (idea-pool.json)
  ↓
Post Drafter Service (generatePostFromFixture)
  ↓
Tone Validator (validateTone) → Auto-check brand voice
  ↓
Approvals Integration (createContentApproval) → HITL stage
  ↓
CEO Reviews in Approvals Drawer
  ↓ (Approve + optional edits)
Approvals Integration (recordApproval) → Capture grades
  ↓
Publer Mock Client (schedulePost) → Mock publish
  ↓
Engagement Analyzer (analyzePostPerformance) → Track metrics
  ↓
Content Dashboard Tile → Display performance
```

### Key Files

**Fixtures & Data:**

- `app/fixtures/content/idea-pool.json` - 3 scenarios (launch, evergreen, wildcard)

**Libraries:**

- `app/lib/content/tracking.ts` - Metrics calculations
- `app/lib/content/tone-validator.ts` - Brand voice validation

**Services:**

- `app/services/content/post-drafter.ts` - Post generation
- `app/services/content/engagement-analyzer.ts` - Performance analysis
- `app/services/content/approvals-integration.ts` - HITL flow

**Adapters:**

- `app/adapters/publer/types.ts` - API type definitions
- `app/adapters/publer/client.mock.ts` - Mock Publer client

**Components:**

- `app/components/dashboard/ContentTile.tsx` - Dashboard tile

**Documentation:**

- `docs/integrations/publer-oauth-setup.md` - OAuth setup guide
- `docs/specs/content_tracking.md` - Metrics spec
- `docs/design/content-coordination.md` - Agent coordination
- `docs/specs/weekly-content-performance-brief.md` - Report template

### Next Steps (Future)

- [ ] Implement Publer OAuth flow (see `docs/integrations/publer-oauth-setup.md`)
- [ ] Create Supabase tables for content approvals and performance
- [ ] Implement real analytics fetching (Publer API + GA4)
- [ ] Build content analytics modal for detailed drill-down
- [ ] Add A/B testing framework for post variations
- [ ] Implement automated posting schedule optimization
- [ ] Create content playbook based on learned patterns
