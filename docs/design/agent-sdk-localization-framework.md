# Agent SDK Localization Framework

**Version:** 1.0.0  
**Owner:** Localization  
**Created:** 2025-10-13  
**Purpose:** Framework for future multi-language support in Agent SDK and HotDash

---

## Overview

This framework prepares the Agent SDK and HotDash dashboard for future multi-language support. While currently English-only, this document ensures we can scale to French, Spanish, and other languages efficiently.

**Current Status**: English-only (launch requirement)  
**Future Goal**: Multi-language support (FR, ES, DE by Year 2)

---

## 1. Localization Strategy

### Phase 1: English-Only Foundation (Current)
**Status**: ✅ COMPLETE
- All strings in English
- Consistent terminology
- Professional voice and tone
- Quality standards established

### Phase 2: i18n Readiness (3-6 months)
**Goals**:
- Extract all hardcoded strings
- Implement i18n framework (react-i18next)
- Create translation files structure
- Establish translation workflow

### Phase 3: French Expansion (6-12 months)
**Goals**:
- Full French translation
- French-specific automotive terminology
- Localized content guidelines
- French customer support capability

### Phase 4: Multi-Language Scale (Year 2+)
**Goals**:
- Spanish, German, Italian support
- Regional customization (CA vs FR French)
- Automated translation workflows
- Localization quality automation

---

## 2. String Extraction Process

### Current State Audit

**Hardcoded strings locations** (from recent audits):
1. `app/components/` - UI components
2. `app/routes/` - Route components
3. `app/copy/hot-rodan-strings.ts` - Centralized copy (GOOD!)
4. `docs/AgentSDKopenAI.md` - Documentation
5. `app/prompts/agent-sdk/` - Agent system prompts

### String Categories

**1. UI Labels & Buttons**
- Button text: "Approve", "Reject", "View Details"
- Navigation: "Dashboard", "Approval Queue"
- Status labels: "All systems ready", "Engine trouble"

**2. Messages & Notifications**
- Success: "Full speed ahead! Reply sent to customer."
- Error: "Engine trouble - unable to load data."
- Empty states: "No pending approvals."

**3. Agent System Prompts**
- Instructions: "You are the Triage Agent..."
- Guidelines: "Always look up order first"
- Examples: "I can help you with..."

**4. Documentation**
- Headings, descriptions, instructions
- Error messages in code examples
- Comments and annotations

### Extraction Strategy

**Phase 1: Centralized Constants** (Recommended first step)
```typescript
// BEFORE (Hardcoded):
<Button>Approve</Button>

// AFTER (Centralized):
import { HOT_ROD_ACTIONS } from '~/copy/hot-rodan-strings';
<Button>{HOT_ROD_ACTIONS.approve}</Button>
```

**Phase 2: i18n Implementation**
```typescript
// With react-i18next:
import { useTranslation } from 'react-i18next';

function ApprovalCard() {
  const { t } = useTranslation();
  
  return <Button>{t('actions.approve')}</Button>;
}
```

**Phase 3: Translation Files**
```json
// locales/en/translation.json
{
  "actions": {
    "approve": "Approve",
    "reject": "Reject",
    "viewDetails": "View Details"
  },
  "status": {
    "allSystemsReady": "All systems ready",
    "engineTrouble": "Engine trouble"
  }
}

// locales/fr/translation.json
{
  "actions": {
    "approve": "Approuver",
    "reject": "Rejeter",
    "viewDetails": "Voir détails"
  },
  "status": {
    "allSystemsReady": "Tous les systèmes prêts",
    "engineTrouble": "Problème mécanique"
  }
}
```

---

## 3. Translation Workflow

### Workflow Overview

```
1. String Extraction
   ↓
2. Translation Memory Check (reuse existing translations)
   ↓
3. Human Translation + Review
   ↓
4. Quality Assurance
   ↓
5. Integration & Testing
   ↓
6. Deployment
```

### Roles & Responsibilities

**Localization Team**:
- Extract strings needing translation
- Manage translation files
- Quality assurance
- Integration testing

**Translators** (External or in-house):
- Translate strings with context
- Maintain brand voice in target language
- Provide cultural adaptation suggestions

**Developers**:
- Implement i18n framework
- Extract hardcoded strings
- Integrate translation files
- Test localized builds

**QA Team**:
- Test all languages
- Verify UI doesn't break with longer text
- Check for missing translations
- Validate cultural appropriateness

---

## 4. i18n Readiness Checklist

### Code Readiness

**✅ Ready:**
- [ ] All user-facing strings extracted to constants
- [ ] No hardcoded strings in UI components
- [ ] i18n framework installed (react-i18next)
- [ ] Translation file structure created
- [ ] Language switching mechanism implemented
- [ ] Locale detection working (browser, user pref)

**✅ Testing:**
- [ ] Pseudo-localization working (test for UI breakage)
- [ ] All strings pass through i18n system
- [ ] No missing translation keys
- [ ] Fallback to English works correctly
- [ ] Date/time/number formatting locale-aware

**✅ Content:**
- [ ] Translation files for all target languages
- [ ] Automotive terminology translated appropriately
- [ ] Brand voice maintained in translations
- [ ] Cultural adaptations identified and implemented

### Infrastructure Readiness

**✅ Translation Management:**
- [ ] Translation memory system configured
- [ ] Translation workflow documented
- [ ] Translator access provisioned
- [ ] Quality assurance process established

**✅ Deployment:**
- [ ] Language files included in build
- [ ] CDN configured for language assets
- [ ] Language selection persisted (user preference)
- [ ] SEO configured for multi-language (hreflang tags)

---

## 5. Automotive Terminology Translation Guidelines

### Translation Challenges

**Automotive metaphors don't always translate well:**

**English**: "Engine trouble - unable to load data"  
**Literal French**: "Problème de moteur - impossible de charger les données"  
**Better French**: "Problème technique - impossible de charger les données" (technical problem)

**English**: "Full speed ahead! Reply sent."  
**Literal French**: "Pleine vitesse! Réponse envoyée."  
**Better French**: "Parfait! Réponse envoyée." (perfect)

### Translation Principles

**1. Maintain Professional Tone**
- Don't translate automotive metaphors literally if they sound cheesy
- Adapt to cultural context (what sounds professional in target language?)
- Maintain operator-to-operator professionalism

**2. Keep Technical Terms Consistent**
- AN fitting: Keep as "AN fitting" (industry standard)
- SKU: Keep as "SKU" (universal)
- API, SDK, GraphQL: Keep in English (tech standards)

**3. Adapt Metaphors When Needed**
- "All systems ready" → "Tous les systèmes prêts" (works in FR)
- "Engine trouble" → "Problème technique" (technical problem)
- "Full speed ahead" → "Parfait" or "Terminé" (perfect/complete)

### Language-Specific Guidelines

**French (FR)**:
- Formal "vous" for operators (professional context)
- Automotive terms: "Système", "Performance", "Optimiser"
- Technical terms: Keep many in English (API, GraphQL, SDK)
- Date format: DD/MM/YYYY

**Spanish (ES)**:
- Formal "usted" for operators
- Automotive terms: "Sistema", "Rendimiento", "Optimizar"
- Technical terms: Keep many in English
- Date format: DD/MM/YYYY

**German (DE)**:
- Formal "Sie" for operators
- Compound words: "Systemstatus", "Leistungsanalyse"
- Technical terms: Mix of English and German
- Date format: DD.MM.YYYY

---

## 6. Agent Prompt Localization

### Challenge: Localizing AI System Prompts

**English Triage Agent Prompt**:
```
You are the Triage Agent for HotDash customer support. Your job is to quickly 
understand what the customer needs and hand off to the appropriate specialist agent.
```

**French Translation**:
```
Vous êtes l'Agent de Triage pour le support client HotDash. Votre rôle est de 
comprendre rapidement ce dont le client a besoin et de transférer vers l'agent 
spécialiste approprié.
```

### Prompt Translation Principles

**1. Maintain AI Effectiveness**
- Translated prompts must produce same quality outputs
- Test extensively with native speakers
- May need language-specific examples

**2. Cultural Adaptation**
- French customers expect more formal tone
- German customers appreciate thoroughness and precision
- Spanish customers value warmth and personal connection

**3. Technical Clarity**
- Keep tool names in English (shopify_find_orders)
- Keep technical parameters in English
- Translate instructions and guidelines
- Translate examples to target language

### Multilingual Agent Architecture

**Option A: Separate Agents per Language**
```typescript
export const triageAgentEN = new Agent({
  name: 'Triage',
  instructions: loadPrompt('triage-agent-en.md'),
  tools: [...],
});

export const triageAgentFR = new Agent({
  name: 'Triage',
  instructions: loadPrompt('triage-agent-fr.md'),
  tools: [...],
});
```

**Option B: Single Agent with Language Context**
```typescript
export const triageAgent = new Agent({
  name: 'Triage',
  instructions: (language) => loadPrompt(`triage-agent-${language}.md`),
  tools: [...],
});
```

**Recommendation**: Option B (single agent, language-aware prompts)

---

## 7. Translation File Structure

### Recommended Structure

```
locales/
  en/
    common.json          # Shared strings
    dashboard.json       # Dashboard UI
    tiles.json           # Tile components
    approvals.json       # Approval queue
    errors.json          # Error messages
    agents.json          # Agent prompts
  fr/
    common.json
    dashboard.json
    tiles.json
    approvals.json
    errors.json
    agents.json
  es/
    ...
```

### Translation File Format

**Example: dashboard.json (en)**
```json
{
  "title": "Operator Control Center",
  "subtitle": "Hot Rod AN Dashboard",
  "tiles": {
    "cxPulse": {
      "title": "CX Pulse",
      "description": "Customer escalations and SLA tracking"
    },
    "salesPulse": {
      "title": "Sales Pulse",
      "description": "Revenue and order metrics"
    }
  },
  "loading": "Starting engines...",
  "error": "Engine trouble - unable to load dashboard"
}
```

**Example: dashboard.json (fr)**
```json
{
  "title": "Centre de Contrôle Opérateur",
  "subtitle": "Tableau de bord Hot Rod AN",
  "tiles": {
    "cxPulse": {
      "title": "Pouls CX",
      "description": "Escalades clients et suivi SLA"
    },
    "salesPulse": {
      "title": "Pouls Ventes",
      "description": "Métriques de revenus et commandes"
    }
  },
  "loading": "Démarrage des systèmes...",
  "error": "Problème technique - impossible de charger le tableau de bord"
}
```

---

## 8. Implementation Roadmap

### Phase 1: Preparation (1-2 months)

**Week 1-2: String Audit & Extraction**
- Complete inventory of all UI strings
- Extract hardcoded strings to constants
- Centralize in `app/copy/` directory
- Document string contexts

**Week 3-4: i18n Framework Setup**
- Install react-i18next
- Configure language detection
- Set up translation file structure
- Implement language switching

**Week 5-6: Testing**
- Pseudo-localization testing
- UI breakage identification and fixes
- Performance testing with i18n
- Fallback mechanism testing

**Week 7-8: Documentation**
- Translator guidelines
- Developer i18n guidelines
- QA testing guidelines
- Localization workflow documentation

### Phase 2: First Language (2-3 months)

**Month 1: Translation**
- Select translation vendor or in-house translators
- Translate all strings to French
- Review and quality assurance
- Cultural adaptation

**Month 2: Integration & Testing**
- Integrate French translations
- Comprehensive testing
- Fix UI issues
- Performance optimization

**Month 3: Launch**
- Soft launch to French-speaking beta users
- Gather feedback
- Iterate and improve
- Full launch

### Phase 3: Scale (Ongoing)

**Continuous Process:**
- Add new languages quarterly
- Maintain translation quality
- Optimize workflows
- Automate where possible

---

## 9. Translation Memory System

### Purpose

Reuse previous translations to:
- Ensure consistency
- Reduce translation costs
- Speed up translation process
- Maintain brand voice

### Implementation

**Translation Memory Database:**
```sql
CREATE TABLE translation_memory (
  id BIGSERIAL PRIMARY KEY,
  source_text TEXT NOT NULL,
  source_language TEXT NOT NULL,
  target_text TEXT NOT NULL,
  target_language TEXT NOT NULL,
  context TEXT,
  domain TEXT, -- 'ui', 'agent', 'docs', 'marketing'
  quality_score INTEGER, -- 1-5
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tm_source ON translation_memory(source_text, source_language, target_language);
```

**Usage:**
1. New string needs translation
2. Check translation memory for exact or similar matches
3. Reuse if high quality (score 4-5)
4. Human review if medium quality (score 3)
5. New translation if no match or low quality

---

## 10. Quality Assurance for Translations

### QA Checklist

**Linguistic Quality:**
- [ ] Grammar correct in target language
- [ ] Spelling correct
- [ ] Punctuation appropriate for language
- [ ] Tone matches source (professional, helpful, etc.)
- [ ] Terminology consistent

**Technical Quality:**
- [ ] Variables/placeholders preserved correctly
- [ ] Formatting maintained (bold, links, etc.)
- [ ] Length appropriate (doesn't break UI)
- [ ] Special characters handled correctly
- [ ] Cultural appropriateness verified

**Functional Quality:**
- [ ] UI renders correctly with translated text
- [ ] No text overflow or truncation
- [ ] Date/time/number formatting correct
- [ ] Language switching works
- [ ] Fallbacks work if translation missing

### Testing Methods

**1. Pseudo-Localization**
```
English: "Approve"
Pseudo: "[!!! Àþþřövé !!!]"
```
Purpose: Test for UI breakage, find hardcoded strings

**2. Native Speaker Review**
- Professional translators review
- Native operator testing
- Cultural appropriateness validation

**3. Automated Testing**
- Check for missing translations
- Verify all keys present
- Test language switching
- Performance testing

---

## 11. Agent SDK Specific Considerations

### Agent Prompt Localization

**Challenges:**
- Prompts are long and complex
- AI performance may vary by language
- Cultural context affects effectiveness
- Technical terms must remain clear

**Strategy:**
1. **Test Extensively**: Each language needs separate testing
2. **Maintain Examples**: Translate examples to target language
3. **Keep Tools English**: Tool names and parameters stay English
4. **Adapt Instructions**: Instructions translated but may need cultural tuning

### Response Template Localization

**Agent Response Templates**:
- All templates from `agent-response-copy-guidelines.md` need translation
- Maintain professional tone in each language
- Cultural adaptation for empathy and formality
- Testing with native speakers required

**Example Localized Template:**

**English:**
```
I found your order #12345! It shipped yesterday via USPS.
Tracking: [link]
Estimated delivery: October 14, 2025
```

**French:**
```
J'ai trouvé votre commande #12345! Elle a été expédiée hier par USPS.
Suivi: [link]
Livraison estimée: 14 octobre 2025
```

**German:**
```
Ich habe Ihre Bestellung #12345 gefunden! Sie wurde gestern per USPS versendet.
Sendungsverfolgung: [link]
Voraussichtliche Lieferung: 14. Oktober 2025
```

---

## 12. Cost Estimation

### Translation Costs

**One-time Translation (Initial):**
- UI strings: ~500 strings × $0.15/word × 5 words avg = $375 per language
- Agent prompts: ~10,000 words × $0.12/word = $1,200 per language
- Documentation: ~50,000 words × $0.10/word = $5,000 per language
- **Total per language**: ~$6,500

**Ongoing Translation (Maintenance):**
- New features: ~100 strings/month × $0.15/word × 5 words = $75/month/language
- Updates: ~20% retranslation/year = ~$1,300/year/language
- **Annual per language**: ~$2,200

### Cost Optimization Strategies

**1. Translation Memory**
- Reuse reduces costs by 30-50%
- Most effective after 2+ languages

**2. Machine Translation + Post-Editing**
- Use for low-sensitivity content
- 60% cost reduction vs human-only
- Requires human review for quality

**3. Community Translation**
- For open-source components
- Free but requires management overhead
- Quality can be inconsistent

**4. Selective Translation**
- Prioritize high-impact strings first
- Phase rollout (UI → Agents → Docs)
- Defer low-priority content

---

## 13. Technical Implementation Guide

### Installing i18n Framework

```bash
# Install react-i18next
npm install react-i18next i18next

# Install additional plugins
npm install i18next-browser-languagedetector
npm install i18next-http-backend
```

### Basic Configuration

```typescript
// app/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: require('./locales/en/translation.json'),
      },
      fr: {
        translation: require('./locales/fr/translation.json'),
      },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
  });

export default i18n;
```

### Usage in Components

```typescript
import { useTranslation } from 'react-i18next';

function TileCard({ title, status }: Props) {
  const { t } = useTranslation();
  
  return (
    <div>
      <h2>{t(title)}</h2>
      <span>{t(`status.${status}`)}</span>
    </div>
  );
}
```

### Language Switching

```typescript
function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  return (
    <select 
      value={i18n.language} 
      onChange={(e) => i18n.changeLanguage(e.target.value)}
    >
      <option value="en">English</option>
      <option value="fr">Français</option>
      <option value="es">Español</option>
    </select>
  );
}
```

---

## 14. String Context Documentation

### Why Context Matters

**Same English word, different translations:**

**"Order" (noun - purchase)**: 
- FR: "Commande"
- ES: "Pedido"

**"Order" (verb - to purchase)**:
- FR: "Commander"
- ES: "Pedir"

**"Order" (noun - sequence)**:
- FR: "Ordre"
- ES: "Orden"

### Providing Context

**Format:**
```json
{
  "key": "order.status",
  "text": "Order",
  "context": "Noun: customer purchase/order in e-commerce context",
  "maxLength": 20,
  "location": "Dashboard > Sales Pulse Tile",
  "example": "Order #12345 is shipped"
}
```

**Benefits:**
- Translators make better decisions
- Consistent translations
- Fewer revisions needed
- Higher quality outcomes

---

## 15. Localization Testing Strategy

### Test Levels

**Level 1: Unit Tests**
- All translation keys have values
- No missing translations
- Formatting preserved

**Level 2: Component Tests**
- UI renders correctly with translated text
- No text overflow
- Responsive design maintained

**Level 3: Integration Tests**
- Language switching works
- User preference persisted
- Fallback to English works
- SEO hreflang tags correct

**Level 4: User Acceptance Tests**
- Native speakers test complete flows
- Cultural appropriateness verified
- Brand voice maintained
- Professional quality confirmed

### Pseudo-Localization

**Purpose**: Find localization issues before translation costs incurred

**Method:**
```
English: "Approve"
Pseudo: "[!!! Àþþřövé !!!]"
```

**What it reveals:**
- Hardcoded strings (they won't change)
- Text truncation issues (longer text breaks UI)
- Missing translation keys
- Encoding issues

---

## 16. Future Enhancements

### Phase 1: Manual Localization
- Translation files managed manually
- Human translators
- Manual QA

### Phase 2: Semi-Automated
- Machine translation + human review
- Translation memory automation
- Automated QA checks

### Phase 3: Fully Automated
- AI translation with context awareness
- Automated quality assurance
- Self-improving translation memory
- Continuous localization (translate as you develop)

---

## Appendix: Quick Reference

### i18n Readiness Score

**Current HotDash Status:**
- String extraction: 60% (hot-rodan-strings.ts exists, but not complete)
- i18n framework: 0% (not installed)
- Translation files: 0% (English only)
- Localization testing: 0% (not implemented)

**To achieve i18n readiness:**
1. Complete string extraction (remaining 40%)
2. Install and configure i18n framework
3. Create translation file structure
4. Implement pseudo-localization testing

**Estimated Effort**: 40-60 hours for full i18n readiness

### Key Resources

**Framework**: react-i18next (most popular for React)  
**Translation Management**: Phrase, Crowdin, or Lokalise  
**Machine Translation**: DeepL API (best for European languages)  
**Testing**: Pseudo-localization, native speaker UAT

---

**Document Owner**: Localization  
**Status**: Planning document for future implementation  
**Next Steps**: When multi-language support approved, use this as implementation guide  
**Last Updated**: 2025-10-13

