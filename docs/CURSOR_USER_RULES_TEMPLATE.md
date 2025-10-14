# Cursor User Rules Template

**Purpose**: Personal AI preferences that apply across ALL your projects  
**Location**: Cursor Settings → Features → Rules for AI  
**Scope**: User-level (not committed to Git)

---

## 📋 How to Set Up User Rules

### Step 1: Open Cursor Settings

1. Click **Cursor** menu (top left)
2. Select **Settings**
3. Navigate to **Features** → **Rules for AI**

### Step 2: Add Your Personal Rules

Copy the template below and customize to your preferences.

---

## 🎯 User Rules Template (Customize As Needed)

```markdown
# Personal Coding Preferences

## Communication Style
- Use clear, concise explanations
- Prefer technical accuracy over brevity
- Include relevant documentation links
- Always cite sources when referencing external information

## Code Style Preferences
- Prefer TypeScript strict mode
- Use functional components over class components (React)
- Prefer const over let when possible
- Use descriptive variable names (no single letters except loop indices)
- Add JSDoc comments for complex functions

## Testing Preferences
- Write tests alongside implementation (TDD when appropriate)
- Prefer integration tests over unit tests for business logic
- Mock external dependencies consistently
- Include edge cases and error scenarios

## Security Mindset
- Treat all user input as untrusted
- Always validate and sanitize
- Use environment variables for secrets
- Follow principle of least privilege

## Documentation Preferences
- Include inline comments for complex logic
- Update README when adding features
- Document breaking changes clearly
- Include usage examples in function docs

## Accessibility Requirements
- Ensure keyboard navigation works
- Include ARIA labels where appropriate
- Maintain color contrast ratios
- Test with screen readers for critical features

## Performance Considerations
- Profile before optimizing
- Prefer readability over micro-optimizations
- Cache expensive computations
- Lazy load when appropriate
```

---

## 🔧 Example User Rules (Pick What You Like)

### For Managers/Leaders:

```markdown
# Management Preferences

- Prioritize team productivity over individual efficiency
- Always ask "how will this scale?" before implementing
- Prefer established patterns over novel solutions
- Document decisions with reasoning (ADRs)
- Consider maintenance burden in design choices
```

### For Security-Focused Users:

```markdown
# Security-First Approach

- Threat model every new feature
- Always use parameterized queries (no string concatenation)
- Implement rate limiting by default
- Log security-relevant events
- Assume breach mindset in design
```

### For Performance-Focused Users:

```markdown
# Performance Priority

- Measure before optimizing (use profiler)
- Consider memory usage in data structure choices
- Prefer streaming over loading all at once
- Cache aggressively but invalidate correctly
- Monitor production metrics continuously
```

### For Accessibility Champions:

```markdown
# Accessibility First

- Test with keyboard only (no mouse)
- Verify screen reader compatibility
- Ensure 4.5:1 contrast ratio minimum
- Include focus indicators
- Support user preference for reduced motion
```

---

## 🎨 Hot Rod AN / CEO-Specific Preferences (Example)

```markdown
# Hot Rod AN Operator Mindset

## Brand Voice
- Use automotive/gearhead terminology when appropriate
- "Operator control center" not "dashboard"
- "Gearhead-friendly" tone in UI copy
- Professional but approachable

## Business Context
- Always consider ROI and operator efficiency
- Prioritize features that save operator time
- Think "what would a car shop operator need?"
- Balance automation with human oversight

## Decision-Making
- "AI suggests, you approve" principle
- No fully automated actions without human approval
- Transparency in AI recommendations
- Clear undo/rollback capabilities

## Evidence-First Culture
- "Evidence or no merge"
- Show metrics for every claim
- Before/after comparisons required
- Real data over assumptions
```

---

## 🔄 How User Rules and Project Rules Work Together

### Hierarchy:

1. **Project Rules** (`.cursorrules` in repo)
   - Applies to: Everyone on the project
   - Contains: Project-specific standards, tools, processes
   - Committed to: Git (shared)

2. **User Rules** (in Cursor settings)
   - Applies to: Just you, across all projects
   - Contains: Personal preferences, style, workflows
   - Committed to: Nothing (personal)

### When They Conflict:

- **Project rules take precedence** for project-specific requirements
- **User rules apply** for personal style preferences
- Example: Project requires MCP tools (enforced), you prefer detailed comments (your choice)

---

## 📊 Recommended User Rules for HotDash Team

### For All Team Members:

```markdown
# HotDash Team Standards

## MCP Awareness
- Always check if MCP tool exists before using CLI
- Verify React Router 7 patterns with Context7 MCP
- Validate Shopify queries with Shopify MCP
- When in doubt, grep the codebase first

## Evidence Culture
- Include evidence paths in all work logs
- Screenshot critical flows
- Log metrics before/after changes
- Document decisions with reasoning

## Security Paranoia
- Treat all secrets as highly sensitive
- Redact before logging
- Reference vault paths, never hardcode
- Zero tolerance for committed secrets
```

---

## 🚀 Getting Started

### Step 1: Choose Your Template

Pick from the examples above or create your own.

### Step 2: Add to Cursor

1. Open Cursor Settings
2. Go to Features → Rules for AI
3. Paste your rules
4. Save

### Step 3: Test

Start a new chat in Cursor and ask:
> "What are my personal coding preferences?"

The AI should reference your user rules.

---

## 🔧 Maintaining Your User Rules

### Monthly Review:

- Are your preferences still current?
- Have you discovered new patterns you like?
- Are there new tools to add?
- Remove outdated preferences

### When Starting New Projects:

- Review if user rules conflict with project rules
- Adapt personal preferences to project standards
- Document any conflicts for team discussion

### Sharing with Team (Optional):

- Post your user rules template in team docs
- Help new members set up their preferences
- Build consensus on shared preferences
- Convert common preferences to project rules

---

## 📖 Reference Links

**Cursor Documentation:**
- [User Rules](https://cursor.com/docs/context/rules#user-rules) - Official docs
- [Project Rules](https://cursor.com/docs/context/rules#project-rules) - How they differ

**HotDash Documentation:**
- `.cursorrules` - Project rules (in repo root)
- `docs/CURSOR_RULES_IMPLEMENTATION.md` - Implementation guide
- `docs/NORTH_STAR.md` - Project mission and principles

---

## ✅ User Rules Checklist

Before finalizing your user rules:

- [ ] Rules reflect your actual preferences (not aspirational)
- [ ] Rules don't conflict with HotDash project rules
- [ ] Rules are specific enough to be actionable
- [ ] Rules include examples where helpful
- [ ] Rules are organized by category
- [ ] Rules are reviewed and updated monthly

---

**Status**: Template ready for customization  
**Next Step**: Copy template to Cursor Settings → Features → Rules for AI  
**Maintenance**: Review monthly, update as needed  

---

**Remember**: User rules are personal. They should enhance your productivity without conflicting with project standards. Start small, add rules as you discover preferences, and update regularly.

