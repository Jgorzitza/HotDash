# Engineer Direction v5.4

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
git branch --show-current  # Verify: should show manager-reopen-20251020
```

**Owner**: Manager  
**Effective**: 2025-10-21T03:55Z  
**Version**: 5.4  
**Status**: ACTIVE — Phase 6 Settings & Personalization

---

## Objective

**Build Phase 6: Settings & Personalization (10h, 8 tasks)**

**Context**: Phases 1-5 COMPLETE ✅ (verified feedback/engineer/2025-10-21.md). Now implementing Settings page with drag/drop, theme selector, and personalization features per PROJECT_PLAN.md Phase 6.

---

## MANDATORY MCP USAGE (BEFORE ANY CODING)

**YOU MUST call Context7 MCP BEFORE writing ANY code. Training data is outdated.**

### Required MCP Calls:

**1. @dnd-kit (for ENG-014 - Drag & Drop)**:
```bash
mcp_context7_resolve-library-id("@dnd-kit/core")
mcp_context7_get-library-docs("/dnd-kit/core", "sortable drag drop React")
```
**Why**: Tile reordering requires @dnd-kit library. MUST pull docs for correct hooks, components, patterns.

**2. React Router 7 (for settings routes)**:
```bash
mcp_context7_get-library-docs("/websites/reactrouter", "routes loaders actions forms")
```
**Why**: Settings page needs proper route setup, form handling, loader patterns.

**3. Shopify Polaris (for UI components)**:
```bash
mcp_context7_get-library-docs("/websites/polaris-react_shopify", "Form Select Toggle Layout")
```
**Why**: Settings UI uses Polaris Form, Select, Toggle components. Must use correct Polaris patterns.

**4. TypeScript (for type safety)**:
```bash
mcp_context7_get-library-docs("/microsoft/TypeScript", "async await types interfaces")
```
**Why**: Type-safe user preferences, drag/drop handlers.

### Log Evidence Format:
```md
## HH:MM - Context7: @dnd-kit/core
- Topic: Sortable drag and drop for React
- Key Learning: [specific pattern/hook discovered]
- Applied to: ENG-014 tile reordering implementation
```

**VIOLATION CONSEQUENCE**: If you code without MCP evidence, Manager REJECTS your PR immediately.

---

## ACTIVE TASKS (Phase 6 - 10h)

### ENG-014: Drag & Drop Tile Reorder (3h) - START NOW

**Requirements**:
- Users can drag tiles to reorder dashboard
- Save order to `user_preferences.tile_order` (JSON array)
- Persist across sessions (load from DB on mount)
- Smooth animations using @dnd-kit library

**Implementation**:

**File**: `app/routes/app._index.tsx` (update existing)
- Add @dnd-kit imports: `useSensor`, `useSensors`, `PointerSensor`, `DndContext`, `closestCenter`
- Add `SortableContext` wrapper around tiles
- Add drag end handler to save order
- Call API route to persist: `POST /api/preferences/tile-order`

**File**: `app/components/tiles/SortableTile.tsx` (new)
- Wrapper component using `useSortable` hook
- Handle drag events
- Apply transform CSS for smooth animation

**File**: `app/routes/api.preferences.tile-order.ts` (new)
- POST action to save tile order
- Update `user_preferences.tile_order` in Supabase
- Return 200 on success

**MCP Required**: Pull @dnd-kit docs BEFORE coding

**Acceptance**:
- [ ] Tiles can be dragged and dropped
- [ ] Order persists after refresh
- [ ] Smooth animations (no jank)
- [ ] Works with all 8 tiles
- [ ] Mobile touch support
- [ ] Context7 evidence logged

**Time**: 3 hours

---

### ENG-015: Tile Visibility Toggles (2h)

**Requirements**:
- Settings page with checkbox list for all 8 tiles
- Show/hide tiles based on preferences
- Save to `user_preferences.visible_tiles` (string array)
- Default: all visible

**Implementation**:

**File**: `app/routes/settings.tsx` (new)
- Settings page route
- Tabs: Dashboard, Appearance, Notifications, Account
- Dashboard tab has tile visibility checkboxes

**File**: `app/components/settings/TileVisibilitySettings.tsx` (new)
- Polaris CheckboxGroup for all 8 tiles
- Submit button saves preferences
- Calls `POST /api/preferences/visible-tiles`

**File**: `app/routes/api.preferences.visible-tiles.ts` (new)
- POST action to save visible tiles array
- Update `user_preferences.visible_tiles`

**Update**: `app/routes/app._index.tsx`
- Load visible_tiles from user_preferences
- Filter tiles based on preferences
- Show "No tiles visible" if all hidden

**MCP Required**: Pull React Router 7 + Polaris docs BEFORE coding

**Acceptance**:
- [ ] Settings page accessible at /settings
- [ ] Checkbox list shows all 8 tiles
- [ ] Unchecking hides tile on dashboard
- [ ] Preferences persist across sessions
- [ ] Context7 evidence logged

**Time**: 2 hours

---

### ENG-016: Theme Selector (2h)

**Requirements**:
- Light/Dark/Auto theme options
- Use Polaris theme tokens
- Save to `user_preferences.theme` (enum: light, dark, auto)
- Apply theme immediately (no page refresh)

**Implementation**:

**File**: `app/components/settings/ThemeSettings.tsx` (new)
- Polaris RadioButton group: Light, Dark, Auto
- Auto = system preference (prefers-color-scheme)
- onChange saves immediately

**File**: `app/routes/api.preferences.theme.ts` (new)
- POST action to save theme preference
- Validate: light, dark, auto only

**File**: `app/root.tsx` (update)
- Add theme provider context
- Load theme from user_preferences on mount
- Apply Polaris theme tokens based on selection
- Listen to system preference changes if auto

**MCP Required**: Pull Polaris docs for theme tokens BEFORE coding

**Acceptance**:
- [ ] Theme selector in Settings > Appearance
- [ ] Light/Dark/Auto options working
- [ ] Auto follows system preference
- [ ] Theme applies immediately
- [ ] Preference persists
- [ ] Context7 evidence logged

**Time**: 2 hours

---

### ENG-017: Default View Persistence (1h)

**Requirements**:
- Remember grid vs list view preference
- Save to `user_preferences.default_view`
- Apply on dashboard load

**Implementation**:

**File**: `app/routes/app._index.tsx` (update)
- Add view toggle button (Grid/List icons)
- Load default_view from user_preferences
- onChange saves to API
- Apply CSS classes based on view

**File**: `app/routes/api.preferences.default-view.ts` (new)
- POST action to save view preference
- Validate: grid or list only

**Acceptance**:
- [ ] View toggle button on dashboard
- [ ] Grid/List views render differently
- [ ] Default view loads from preferences
- [ ] Preference persists

**Time**: 1 hour

---

### ENG-018 to ENG-022: Settings Page (4 tabs) (2h)

**Requirements**:
- Settings page with 4 tabs: Dashboard, Appearance, Notifications, Account
- Each tab has relevant settings grouped
- Polaris layout and components

**Implementation**:

**File**: `app/routes/settings.tsx` (expand from ENG-015)
- Polaris Tabs component with 4 tabs
- Dashboard: Tile visibility, default view, auto-refresh toggle
- Appearance: Theme, density (compact/comfortable)
- Notifications: Desktop permissions, notification types, sound toggle
- Account: Email, name, logout button

**Files**: Create components
- `app/components/settings/DashboardSettings.tsx`
- `app/components/settings/AppearanceSettings.tsx`
- `app/components/settings/NotificationSettings.tsx`
- `app/components/settings/AccountSettings.tsx`

**MCP Required**: Pull Polaris Tabs component docs BEFORE coding

**Acceptance**:
- [ ] Settings page has 4 working tabs
- [ ] Each tab content renders correctly
- [ ] Tab navigation works (URL updates)
- [ ] Mobile responsive
- [ ] Context7 evidence logged

**Time**: 2 hours

---

## Work Protocol

**1. MCP Tools** (MANDATORY BEFORE CODING):
- @dnd-kit: Drag/drop patterns
- React Router 7: Route setup, loaders, actions
- Polaris: Form, Toggle, RadioButton, Tabs, Checkbox
- TypeScript: Types for preferences

**2. Coordinate with**:
- **Data**: user_preferences table ✅ (already exists with tile_order, visible_tiles, theme, default_view columns)
- **Designer**: Will validate after Phase 6 complete (DES-009)
- **QA**: Will test after implementation (QA-002)

**3. Reporting (Every 2 hours in feedback/engineer/2025-10-21.md)**:
```md
## YYYY-MM-DDTHH:MM:SSZ — Engineer: Phase 6 Progress

**Working On**: ENG-014 (Drag & Drop Tile Reorder)
**Progress**: 60% - @dnd-kit integrated, drag working, persist pending

**Evidence**:
- Files: app/routes/app._index.tsx (+45 lines), app/components/tiles/SortableTile.tsx (new, 67 lines)
- MCP: Context7 @dnd-kit/core pulled - learned useSortable hook pattern
- Build: TypeScript passing, no errors
- Test: Manual drag test working

**Blockers**: None
**Next**: Complete persist to user_preferences, test on mobile
```

---

## Definition of Done (Phase 6)

**Each Task**:
- [ ] MCP Context7 docs pulled BEFORE coding (evidence logged)
- [ ] Code implements requirements exactly
- [ ] TypeScript compiling without errors
- [ ] Manual testing completed
- [ ] Responsive (mobile + desktop)
- [ ] Polaris design patterns followed

**Phase 6 Complete**:
- [ ] All 8 tasks (ENG-014 to ENG-022) complete
- [ ] Settings page fully functional
- [ ] All preferences persist across sessions
- [ ] Designer validation passed (DES-009)
- [ ] QA tests passing (QA-002)
- [ ] CEO Checkpoint 5 approved

---

## Critical Reminders

**DO**:
- ✅ Call Context7 MCP BEFORE every task
- ✅ Log MCP evidence in feedback
- ✅ Test on mobile (touch events for drag/drop)
- ✅ Follow Polaris design patterns
- ✅ Coordinate with Designer after completion

**DO NOT**:
- ❌ Code without MCP evidence (immediate PR rejection)
- ❌ Use @remix-run imports (React Router 7 only)
- ❌ Skip responsive testing
- ❌ Break existing Phases 1-5 features
- ❌ Commit without testing

---

## Timeline

**Hours 1-3**: ENG-014 (Drag/Drop) - MOST COMPLEX, START FIRST  
**Hours 4-5**: ENG-015 (Visibility toggles)  
**Hours 6-7**: ENG-016 (Theme selector)  
**Hour 8**: ENG-017 (Default view)  
**Hours 9-10**: ENG-018-022 (Settings page tabs)

**Total**: 10 hours Phase 6 work

**After Phase 6**: Designer validation (DES-009), then CEO Checkpoint 5

---

## Quick Reference

**Plan**: `docs/manager/PROJECT_PLAN.md` (Phase 6 details lines 1451-1519)  
**Task Assignments**: `feedback/manager/TASK_ASSIGNMENTS_2025-10-21.md`  
**Feedback**: `feedback/engineer/2025-10-21.md`  
**User Preferences Schema**: `prisma/schema.prisma` (UserPreference model)

---

**START WITH**: ENG-014 (Drag & Drop) - Pull @dnd-kit docs NOW, then code

---

## Credential & Blocker Protocol

### If You Need Credentials:
1. ✅ Check vault/occ/ directory first
2. ❌ If missing: Report in feedback, move to next task
3. ✅ Never wait idle

### If You Hit a Blocker:

**Before reporting**:
1. ✅ Pulled Context7 docs for the library?
2. ✅ Inspected existing codebase patterns?
3. ✅ Reviewed RULES.md sections?
4. ✅ Tried 3+ solutions?

**If still blocked**:
```md
## HH:MM - Blocker Report
**Blocked On**: [specific issue]
**What I Tried**: [3+ attempts with details]
**MCP Docs Pulled**: [Context7 libraries consulted]
**Asking Manager**: [specific question]
**Moving To**: ENG-[next-task] (don't wait idle)
```

**Key Principle**: NEVER sit idle. If blocked on one task → start next task immediately.

---

**NO MORE STANDBY - ACTIVE WORK ASSIGNED**
