# Model Fine-Tuning Preparation Guide

**Version:** 1.0.0  
**Last Updated:** 2025-10-11

---

## Fine-Tuning Strategy

### When to Fine-Tune

**Criteria:**
- Collected 500+ high-quality training samples
- Approval rate plateaued <85%
- Consistent patterns in corrections
- Cost-benefit analysis favorable

### Data Requirements

**Minimum Dataset:**
- 500 approved samples (min)
- 1000+ samples (ideal)
- Approval rate >90%
- Diverse scenarios covered
- Human-reviewed quality scores

### Data Format

**OpenAI Fine-Tuning JSONL:**
```jsonl
{"messages": [{"role": "system", "content": "You are Order Support..."}, {"role": "user", "content": "Where is my order?"}, {"role": "assistant", "content": "I'd be happy to check..."}]}
```

### Pipeline

**Collection → Filtering → Labeling → Export → Fine-Tune → Evaluation → Deploy**

---

## Data Collection Pipeline

**Sources:**
1. agent_training_samples table (Supabase)
2. Filter: approved=true, quality_reviewed=true
3. Export using training/collector.ts

**Export Command:**
```typescript
await trainingCollector.exportTrainingData({
  outputPath: 'data/training/fine-tune-dataset.jsonl',
  format: 'jsonl',
  filters: {
    approvedOnly: true,
    minQualityScore: 4,
  },
});
```

---

## Labeling Guidelines

**Quality Rubric (1-5 scale):**
- Factuality: Information is accurate
- Helpfulness: Solves customer problem
- Tone: Professional and empathetic
- Policy: Aligns with company policies
- Completeness: Addresses all aspects

**Include Only:**
- Overall rating ≥4
- All rubric scores ≥4
- Human-reviewed and approved
- Representative of desired behavior

---

## A/B Testing Plan

**Test Setup:**
1. Base model (GPT-4)
2. Fine-tuned model (GPT-4-finetuned)
3. Route 50% traffic to each
4. Compare metrics over 14 days

**Success Criteria:**
- Approval rate improvement >5%
- Edit rate reduction >5%
- CSAT improvement >0.2 points
- No increase in policy violations

---

**Status:** Framework ready  
**Timeline:** Month 2-3 (after collecting 500+ samples)

