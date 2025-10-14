# Translation Readiness Checklist

## Growth Features - i18n Preparation

### Actions API (/api/actions/*)

**Status**: ✅ READY FOR TRANSLATION

**Externalized Strings**:
- app/locales/en/actions.json (English)
- app/locales/fr/actions.json (French - pending CEO approval)

**Next Steps**:
1. CEO review French translations
2. Approve for production use
3. Add Spanish (es) translations
4. Add German (de) translations

### Training Modules (/training/*)

**Status**: ✅ READY FOR TRANSLATION

**Externalized Strings**:
- app/locales/en/training.json (English)
- app/locales/fr/training.json (French - pending CEO approval)

**Next Steps**:
1. CEO review French translations
2. Test training flow in French
3. Add Spanish/German translations
4. Implement locale switcher in training UI

### Agent Response Templates

**Status**: ✅ READY FOR TRANSLATION

**Externalized Strings**:
- app/locales/en/agent-responses.json (English)
- app/locales/fr/agent-responses.json (French - pending CEO approval)

**Implementation**:
- app/services/chatwoot/templates.i18n.ts (multi-language templates)
- app/services/chatwoot/ceo-approval.ts (approval workflow)

### Content Generation Schemas

**Status**: ⚠️  NEEDS LOCALE PARAMETER

**Current**:
- Schemas defined in app/services/content/templates/content-schemas.ts
- No locale field in schemas

**Recommended Changes**:
```typescript
export const BlogPostSchema = z.object({
  // ... existing fields
  locale: z.enum(['en', 'fr', 'es', 'de']).default('en'),
  translatedFrom: z.string().optional(), // Original post ID if translation
});
```

## Translation Priority

### Phase 1: Core Features (Week 1)
- [ ] Agent response templates → French
- [ ] Action messages → French
- [ ] Error messages → French
- CEO approval required for all

### Phase 2: Training (Week 2)
- [ ] Training module strings → French
- [ ] Certification copy → French
- [ ] Help text → French
- CEO approval required

### Phase 3: Content Generation (Week 3)
- [ ] Add locale parameter to schemas
- [ ] Test French content generation
- [ ] Validate CEO approval flow
- [ ] QA French outputs

### Phase 4: Expansion (Week 4+)
- [ ] Spanish translations
- [ ] German translations
- [ ] Additional languages as needed

## CEO Approval Queue (Current)

**Pending Review**:
1. Agent responses (3 templates) - French
2. Action messages (7 message types) - French
3. Training module (20+ strings) - French

**Total Pending**: ~30 translations for CEO review

## Implementation Checklist

**Code Changes Needed**:
- [ ] Import locale files in components
- [ ] Add i18n helper functions
- [ ] Implement locale detection
- [ ] Build locale switcher UI
- [ ] Add fallback to English
- [ ] Test all features in French
- [ ] Update TypeScript types

**Documentation Updates**:
- [x] Brand voice by locale
- [x] CEO approval workflow
- [x] i18n audit report
- [x] Translation readiness checklist

**Testing Requirements**:
- [ ] Unit tests for locale fallback
- [ ] E2E tests in French
- [ ] CEO approval flow testing
- [ ] Variable interpolation QA

---

**Created**: 2025-10-14
**Owner**: Localization
**Status**: Ready for CEO Review
