---
epoch: 2025.10.E1
doc: feedback/ai.md
owner: ai
last_reviewed: 2025-10-09
doc_hash: TBD
expires: 2025-10-06
---
# AI Agent — Daily Feedback & Regression Report

## Direction Sync — 2025-10-09
- Reviewed the refreshed sprint focus (dry-run AI kit, daily `npm run ai:regression`, pilot readiness brief) and confirmed requirements in `docs/directions/ai.md`.
- Blocked from execution: currently covering integrations duties only and still lack Supabase credentials (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`) plus approval to shift focus; request dedicated AI agent or resource reassignment before work can start.

## 2025-10-09 Sprint Execution
- Drafted dry-run kit outline identifying the top CX Escalations and Sales Pulse scenarios; awaiting enablement confirmations before generating annotated samples (`docs/enablement/job_aids/ai_samples/` placeholder ready).
- Queued today’s `npm run ai:regression` run but cannot execute until mock datasets + Supabase decision log access land; flagged dependency on data/reliability for credentials and fixtures.
- Began assembling pilot readiness brief sections (guardrails, kill switch behavior, Supabase logging) but blocked on missing Supabase secrets and monitoring evidence; will resume once reliability delivers.
- Authored first-pass CX Escalations and Sales Pulse sample drafts for the dry run kit (`docs/enablement/job_aids/ai_samples/cx_escalations_training_samples.md`, `docs/enablement/job_aids/ai_samples/sales_pulse_training_samples.md`) so enablement/support can review copy while we await staging data.

## 2025-10-08 — Sprint Focus Activation
- Catalogued the four operator dry run scenarios from `docs/runbooks/operator_training_agenda.md` to scope annotated AI outputs for `docs/enablement/job_aids/ai_samples/` per `docs/directions/ai.md:26`-`docs/directions/ai.md:28`.
- Drafted run notes for the next `npm run ai:regression` execution (target 2025-10-09) and outlined BLEU/ROUGE capture steps; still blocked on Supabase creds + evaluation fixtures but work-in-progress documented in this log.
- Sketched pilot readiness brief sections (guardrails, kill-switch behavior, Supabase logging dependencies) so once telemetry and legal inputs land we can circulate ahead of the M1/M2 checkpoint per `docs/directions/ai.md:29`.

## Summary — 2025-10-08

### Direction Acknowledgment
- Reviewed docs/directions/ai.md on 2025-10-08; aligned on dry-run kit deliverables, daily regression hygiene, and pilot readiness brief scope.

### Blockers / Requests
- Supabase credentials still pending; need manager to provide `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` so decision logs persist beyond fallback.
- QA storage decision for prompt regression artifacts (`artifacts/ai/prompt-regression-*.json`) outstanding; waiting on guidance.
- Feature flag `FEATURE_AI_ESCALATIONS` remains off until above dependencies resolved; will coordinate once inputs land.

## 2025-10-08 Sprint Execution
- Assembled scenario list for the operator dry-run AI kit (pulled from `docs/runbooks/operator_training_agenda.md` Agenda §3); drafting annotated CX Escalations/Sales Pulse outputs for enablement review.
- Ran `npm run ai:regression` locally to validate harness; execution blocked at Supabase logging step due to missing credentials, captured error logs for handoff once secrets arrive.
- Created pilot readiness brief outline covering guardrails, kill switch behavior, Supabase logging dependencies, and go/no-go criteria; awaiting reliability/compliance feedback before filling evidence links.

## Summary — 2025-10-05

### Deliverables Completed
- **Prompt Directory Structure**: Created `app/prompts/` with CHANGELOG.md for version tracking
- **Feedback Process**: Established daily feedback reporting structure (this file)
- **Direction Review**: Analyzed project structure, Memory interfaces, and existing template system

### Current Status
- Reviewed existing Chatwoot templates in `app/services/chatwoot/templates.ts` (3 reply templates)
- Identified Memory logging interface (`packages/memory/index.ts`) with `DecisionLog` and `Fact` types
- No AI recommendation logging implemented yet (templates are hardcoded, not AI-generated)
- No prompt evaluation framework in place (BLEU/ROUGE)
- No mock datasets for regression testing

### Blockers / Risks
- **No AI-generated content yet**: Current templates are static; need to implement actual AI generation for copy/replies/anomaly summaries
- **Missing evaluation framework**: BLEU/ROUGE scoring system not implemented
- **No mock datasets**: Need representative conversation/anomaly data for prompt regression testing
- **Memory logging not integrated**: AI outputs not being logged to packages/memory with scope `build`

---

## Daily Regression Results

### Status: No Regressions Run Yet

**Reason**: Evaluation framework and mock datasets pending implementation

### Baseline Metrics (To Be Established)

#### Chatwoot Reply Generation
- BLEU score threshold: TBD (target >0.4 for template matching)
- ROUGE-L threshold: TBD (target >0.6 for content overlap)
- Qualitative criteria: Tone appropriateness, no hallucinated order details, action clarity

#### Anomaly Summarization
- BLEU score threshold: TBD
- ROUGE-L threshold: TBD
- Qualitative criteria: Accurate severity assessment, no false urgency, actionable recommendations

---

## Hallucination / Bias Flags

### Status: None Identified

_This section will track any hallucination or bias risks detected in AI outputs_

### Monitoring Process
1. Manual review of all AI-generated outputs during development
2. Automated keyword scanning for prohibited content (customer PII, pricing promises, inventory commitments)
3. Comparison against source data (Memory facts) to detect fabrication
4. Bias testing across customer demographics (name-based, language-based)

---

## Evidence Links

### Infrastructure
- Prompt changelog: `app/prompts/CHANGELOG.md`
- Memory interface: `packages/memory/index.ts:4-28`
- Existing templates: `app/services/chatwoot/templates.ts`

### Pending Implementation
- AI recommendation logging service (packages/memory integration)
- Prompt library for Chatwoot replies (`app/prompts/chatwoot/`)
- Anomaly summary prompts (`app/prompts/anomaly/`)
- Mock datasets for regression testing
- BLEU/ROUGE evaluation utilities

---

## Next Actions

Per `docs/directions/ai.md` requirements:

1. **Implement AI Recommendation Logging**
   - Create service to log every AI output (template variant, brief, insight) to packages/memory
   - Scope: `build`
   - Include: inputs, outputs, timestamp, prompt version

2. **Create Chatwoot Reply Prompt Library**
   - Convert static templates to AI-generated variants
   - Add evaluation metrics (BLEU/ROUGE baselines)
   - Ingest latest facts from Memory before generation
   - Version under `app/prompts/chatwoot/`

3. **Implement Anomaly Summary Prompts**
   - Create prompts for dashboard fact summarization
   - Include severity assessment, trend detection, recommended actions
   - Version under `app/prompts/anomaly/`

4. **Build Evaluation Framework**
   - Implement BLEU/ROUGE scoring utilities
   - Create mock datasets (conversation examples, anomaly scenarios)
   - Set up daily regression test script

5. **Establish Guardrails**
   - Route all AI outputs through engineer-owned approval flows
   - No direct production writes
   - Add hallucination detection (PII, fabricated data, over-commitment)

---

## Coordination with Other Agents

### Questions for Manager
1. **AI Generation Scope**: Should AI generate Chatwoot reply templates now, or wait until M3 (Ops Automation, Week 3)?
2. **Evaluation Thresholds**: What BLEU/ROUGE thresholds are acceptable for v1 launch?
3. **Approval Flow Integration**: Confirm AI outputs should route through engineer's approval action system?

### Dependencies
- **Data Agent**: Need mock datasets for prompt regression (conversation examples, anomaly scenarios)
- **Engineer**: Need approval flow integration for AI-generated recommendations
- **Product**: Need guidance on tone/style for AI-generated copy

### Collaboration Notes
- **Designer**: AI-generated copy must match copy deck tone (professional but approachable)
- **QA**: Prompt regression tests should integrate with existing Vitest framework

---

## Compliance with AI Directions

Per `docs/directions/ai.md`:

- ⏳ **Copy generation, templated replies, anomaly summaries**: Not implemented yet
- ⏳ **Ingest latest facts from Memory**: Memory interface identified but not integrated
- ❌ **Log every AI recommendation**: No logging implemented
- ✅ **Guardrails (no direct production writes)**: Noted; will route through approval flows
- ✅ **Prompt libraries versioned**: Directory structure and CHANGELOG created
- ❌ **Daily prompt regression**: Framework not implemented
- ⏳ **Flag hallucination/bias risks**: Monitoring process defined but no outputs to monitor yet

---

## Recommendations

### Immediate Priorities (This Week)
1. Implement AI recommendation logging service first (enables tracking for all future work)
2. Create Chatwoot reply generation prompts with Memory integration
3. Build BLEU/ROUGE evaluation utilities
4. Coordinate with data agent for mock datasets

### Risk Mitigation
1. **Hallucination Prevention**: All AI outputs must cite source facts from Memory; reject outputs with uncited claims
2. **Bias Testing**: Test prompts with diverse customer names, languages, issue types
3. **Fallback Strategy**: If AI generation fails, use existing static templates from `app/services/chatwoot/templates.ts`
4. **Approval Mandate**: Never bypass engineer-owned approval flows; log denial reasons

### Future Enhancements (Post-v1)
1. Multi-language support beyond EN/FR
2. Sentiment-aware reply generation
3. Predictive anomaly detection (vs threshold-based)
4. Operator feedback loop (thumbs up/down on AI suggestions)

## Governance Acknowledgment — 2025-10-06
- Reviewed docs/directions/README.md and docs/directions/ai.md; acknowledge manager-only ownership and Supabase secret policy.
