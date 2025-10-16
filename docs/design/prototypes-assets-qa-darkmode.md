# Prototypes, Assets, QA, Dark Mode

**File:** `docs/design/prototypes-assets-qa-darkmode.md`  
**Owner:** Designer  
**Version:** 1.0  
**Date:** 2025-10-15  
**Status:** Complete  
**Purpose:** High-fidelity prototypes, export assets pipeline, screenshot baselines, dark mode tokens, design QA checklist

---

## 1. High-Fidelity Prototypes (Figma)

### 1.1 Purpose
Create interactive prototypes for user testing and stakeholder review.

### 1.2 Prototype Scope

**Phase 1 (Current):**
- Dashboard with 7 tiles
- Approvals queue list
- Approval card detail view

**Phase 2 (Future):**
- Approvals drawer (full HITL workflow)
- Grading interface
- Evidence tabs
- Settings pages

### 1.3 Figma File Structure

```
HotDash Design System
├── 🎨 Design Tokens
│   ├── Colors
│   ├── Typography
│   ├── Spacing
│   └── Shadows
├── 🧩 Components
│   ├── TileCard
│   ├── ApprovalCard
│   ├── Badge
│   ├── Button
│   └── Modal
├── 📱 Screens
│   ├── Dashboard
│   ├── Approvals Queue
│   └── Approval Detail
└── 🔗 Prototypes
    ├── User Flow 1: Approve Action
    ├── User Flow 2: Reject Action
    └── User Flow 3: View Evidence
```

### 1.4 Prototype Interactions

**Dashboard:**
- Click tile → View details modal
- Hover tile → Show hover state
- Click "View details" → Navigate to detail page

**Approvals Queue:**
- Click approval card → Open drawer
- Click "Approve" → Show grading modal → Success toast
- Click "Reject" → Show confirmation → Success toast

**Approval Drawer:**
- Click evidence tab → Switch tab content
- Click "Edit risk" → Show editable field
- Click "Close" → Close drawer, return focus

### 1.5 Prototype Delivery

**Format:** Figma prototype link  
**Access:** View-only for stakeholders, edit for design team  
**Updates:** Version history in Figma  
**Handoff:** Use Figma Dev Mode for engineer specs

---

## 2. Export Assets Pipeline

### 2.1 Asset Types

**Icons:**
- Format: SVG
- Size: 16px, 20px, 24px, 32px
- Color: Inherit from parent (currentColor)
- Export: Polaris icons (no custom export needed)

**Illustrations:**
- Format: SVG (preferred) or PNG
- Size: 1x, 2x, 3x for raster
- Usage: Empty states, error states
- Source: Shopify Polaris illustrations

**Logos:**
- Format: SVG (preferred) or PNG
- Sizes: 32px, 64px, 128px, 256px
- Variants: Full color, monochrome, white
- Usage: App header, favicon

**Screenshots:**
- Format: PNG
- Size: Actual screen size
- Usage: Documentation, marketing
- Tool: Browser DevTools, Percy

### 2.2 Export Process

**From Figma:**
1. Select asset
2. Export settings → SVG or PNG
3. Scale: 1x, 2x, 3x (for PNG)
4. Export to `public/assets/`

**From Code:**
1. Use Polaris icons (no export needed)
2. Custom icons: Inline SVG in components
3. Illustrations: Import from Polaris

### 2.3 Asset Organization

```
public/
├── assets/
│   ├── icons/
│   │   ├── favicon.svg
│   │   └── logo.svg
│   ├── illustrations/
│   │   ├── empty-state-orders.svg
│   │   └── error-state-network.svg
│   └── screenshots/
│       ├── dashboard.png
│       └── approvals.png
```

### 2.4 Asset Optimization

**SVG:**
- Minify with SVGO
- Remove unnecessary metadata
- Optimize paths
- Use currentColor for fill/stroke

**PNG:**
- Compress with TinyPNG
- Use appropriate bit depth
- Remove EXIF data

**Lazy Loading:**
```tsx
<img 
  src="/assets/illustrations/empty-state.svg" 
  loading="lazy"
  alt="No orders yet"
/>
```

---

## 3. Screenshot Baselines for UI Diffs

### 3.1 Purpose
Capture baseline screenshots for visual regression testing.

### 3.2 Tools

**Percy (Recommended):**
- Automated visual testing
- CI/CD integration
- Diff highlighting
- Browser matrix

**Chromatic (Alternative):**
- Storybook integration
- Component-level testing
- Snapshot comparison

**Manual (Fallback):**
- Browser DevTools screenshots
- Store in `tests/screenshots/baseline/`

### 3.3 Screenshot Coverage

**Pages:**
- Dashboard (all tile states)
- Approvals queue (empty, with data, error)
- Approval detail (all sections)

**Components:**
- TileCard (all states)
- ApprovalCard (all states)
- Badge (all tones)
- Button (all variants and states)
- Modal (all sizes)

**States:**
- Default
- Hover
- Focus
- Active
- Disabled
- Loading
- Error
- Empty

**Breakpoints:**
- Mobile (375px)
- Tablet (768px)
- Desktop (1280px)

### 3.4 Percy Configuration

**percy.yml:**
```yaml
version: 2
static:
  include: "**/*.html"
  exclude: "**/node_modules/**"
snapshot:
  widths:
    - 375
    - 768
    - 1280
  min-height: 1024
  percy-css: |
    * { animation: none !important; }
```

**Usage:**
```bash
# Capture baseline
npx percy snapshot public/

# Run in CI
npx percy exec -- npm test
```

### 3.5 Manual Screenshot Process

**Capture:**
1. Open page in browser
2. Set viewport size (375px, 768px, 1280px)
3. Capture screenshot (Cmd+Shift+4 on Mac)
4. Save to `tests/screenshots/baseline/[page]-[breakpoint].png`

**Compare:**
1. Capture new screenshot
2. Use image diff tool (ImageMagick, Pixelmatch)
3. Review differences
4. Update baseline if intentional change

---

## 4. Dark Mode Token Adjustments

### 4.1 Dark Mode Color Palette

**Background:**
```css
@media (prefers-color-scheme: dark) {
  :root {
    --occ-bg-primary: #1a1a1a;
    --occ-bg-secondary: #2a2a2a;
    --occ-bg-hover: #3a3a3a;
  }
}
```

**Text:**
```css
@media (prefers-color-scheme: dark) {
  :root {
    --occ-text-primary: #ffffff;
    --occ-text-secondary: #a0a0a0;
    --occ-text-interactive: #5c9ec7;
  }
}
```

**Border:**
```css
@media (prefers-color-scheme: dark) {
  :root {
    --occ-border-default: #3a3a3a;
    --occ-border-interactive: #5c9ec7;
    --occ-border-focus: #5c9ec7;
  }
}
```

**Status Colors (Adjusted for dark):**
```css
@media (prefers-color-scheme: dark) {
  :root {
    --occ-status-healthy-text: #4ade80;
    --occ-status-healthy-bg: #1a3a2a;
    
    --occ-status-attention-text: #f87171;
    --occ-status-attention-bg: #3a1a1a;
    
    --occ-status-unconfigured-text: #94a3b8;
    --occ-status-unconfigured-bg: #2a2a2a;
  }
}
```

### 4.2 Contrast Verification

**WCAG AA Requirements (Dark Mode):**
- Text: 4.5:1 minimum
- UI components: 3:1 minimum

**Test all color combinations:**
- White text on dark backgrounds
- Status colors on dark backgrounds
- Interactive elements on dark backgrounds

### 4.3 Implementation Strategy

**Phase 1: Automatic (System Preference)**
```css
@media (prefers-color-scheme: dark) {
  /* Dark mode tokens */
}
```

**Phase 2: Manual Toggle (Future)**
```tsx
function ThemeToggle() {
  const [theme, setTheme] = useState('auto');
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  return (
    <Select
      label="Theme"
      options={[
        { label: 'Auto', value: 'auto' },
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
      ]}
      value={theme}
      onChange={setTheme}
    />
  );
}
```

### 4.4 Testing Dark Mode

**Manual:**
1. Enable dark mode in OS settings
2. Refresh app
3. Verify all colors readable
4. Check contrast ratios
5. Test all states

**Automated:**
```typescript
describe('Dark mode', () => {
  it('applies dark mode tokens', () => {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
    
    render(<App />);
    
    expect(document.documentElement).toHaveStyle({
      '--occ-bg-primary': '#1a1a1a',
    });
  });
});
```

---

## 5. Design QA Checklist

### 5.1 Visual QA

**Layout:**
- [ ] All components aligned correctly
- [ ] Spacing consistent (using design tokens)
- [ ] No overlapping elements
- [ ] Responsive at all breakpoints
- [ ] No horizontal scroll

**Typography:**
- [ ] Font sizes correct
- [ ] Font weights correct
- [ ] Line heights comfortable
- [ ] Text readable (contrast)
- [ ] No orphans/widows

**Colors:**
- [ ] Colors match design tokens
- [ ] Contrast ratios meet WCAG AA
- [ ] Status colors consistent
- [ ] Interactive colors correct
- [ ] Dark mode colors readable

**Spacing:**
- [ ] Padding consistent
- [ ] Margins consistent
- [ ] Gaps consistent
- [ ] Vertical rhythm maintained

**Borders & Shadows:**
- [ ] Border radius consistent
- [ ] Border colors correct
- [ ] Shadows appropriate
- [ ] No missing borders

### 5.2 Interaction QA

**Hover States:**
- [ ] All interactive elements have hover
- [ ] Hover colors correct
- [ ] Cursor changes (pointer, not-allowed, wait)
- [ ] Transitions smooth (150ms)

**Focus States:**
- [ ] All interactive elements have focus
- [ ] Focus indicators visible (2px solid)
- [ ] Focus order logical
- [ ] No focus traps

**Active States:**
- [ ] Buttons have active state
- [ ] Links have active state
- [ ] Inputs have active state

**Disabled States:**
- [ ] Disabled elements styled correctly
- [ ] Cursor: not-allowed
- [ ] Opacity reduced
- [ ] Not keyboard accessible

**Loading States:**
- [ ] Spinners visible
- [ ] Skeleton screens match content
- [ ] Loading text clear
- [ ] aria-busy attribute present

### 5.3 Content QA

**Copy:**
- [ ] No typos
- [ ] Grammar correct
- [ ] Tone appropriate
- [ ] Sentence case used
- [ ] Punctuation correct

**Labels:**
- [ ] All inputs have labels
- [ ] Button labels specific
- [ ] Link text descriptive
- [ ] Alt text provided

**Messages:**
- [ ] Error messages helpful
- [ ] Success messages positive
- [ ] Warning messages clear
- [ ] Info messages informative

### 5.4 Accessibility QA

**Keyboard Navigation:**
- [ ] All interactive elements reachable
- [ ] Tab order logical
- [ ] Enter/Space activate elements
- [ ] Escape closes modals
- [ ] Arrow keys navigate lists/tabs

**Screen Reader:**
- [ ] All images have alt text
- [ ] All icons have labels
- [ ] Headings hierarchical
- [ ] Landmarks present
- [ ] Live regions announce changes

**Color Contrast:**
- [ ] Text: 4.5:1 minimum
- [ ] UI components: 3:1 minimum
- [ ] Status not conveyed by color alone

**Touch Targets:**
- [ ] Mobile: 44x44px minimum
- [ ] Desktop: 36x36px minimum
- [ ] Spacing: 8px minimum

### 5.5 Responsive QA

**Mobile (< 768px):**
- [ ] Single column layout
- [ ] Full width elements
- [ ] Stacked layouts
- [ ] Touch targets adequate
- [ ] No horizontal scroll

**Tablet (768-1023px):**
- [ ] 2 column layout
- [ ] Appropriate spacing
- [ ] Touch targets adequate
- [ ] Readable text

**Desktop (1024px+):**
- [ ] 3-4 column layout
- [ ] Hover states work
- [ ] Keyboard shortcuts visible
- [ ] Optimal line length

### 5.6 Performance QA

**Load Time:**
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] Lighthouse Performance ≥ 90

**Animations:**
- [ ] Smooth (60fps)
- [ ] No jank
- [ ] Reduced motion respected

**Images:**
- [ ] Optimized (compressed)
- [ ] Lazy loaded
- [ ] Appropriate format (SVG, PNG, WebP)

---

## 6. Implementation Checklist

### 6.1 Prototypes
- [ ] Figma file created
- [ ] Components library built
- [ ] Screens designed
- [ ] Interactions added
- [ ] Prototype link shared

### 6.2 Assets
- [ ] Icons exported
- [ ] Illustrations exported
- [ ] Logos exported
- [ ] Assets optimized
- [ ] Assets organized

### 6.3 Screenshots
- [ ] Baseline captured
- [ ] Percy configured
- [ ] CI integration
- [ ] Diff review process

### 6.4 Dark Mode
- [ ] Tokens defined
- [ ] Contrast verified
- [ ] Implementation tested
- [ ] Toggle added (future)

### 6.5 QA
- [ ] Visual QA complete
- [ ] Interaction QA complete
- [ ] Content QA complete
- [ ] Accessibility QA complete
- [ ] Responsive QA complete
- [ ] Performance QA complete

---

## 7. References

- **Figma:** https://www.figma.com/
- **Percy:** https://percy.io/
- **Chromatic:** https://www.chromatic.com/
- **SVGO:** https://github.com/svg/svgo
- **TinyPNG:** https://tinypng.com/
- **Design Tokens:** `docs/design/design-tokens.md`
- **Accessibility:** `docs/design/accessibility.md`
- **WCAG 2.1 AA:** https://www.w3.org/WAI/WCAG21/quickref/

