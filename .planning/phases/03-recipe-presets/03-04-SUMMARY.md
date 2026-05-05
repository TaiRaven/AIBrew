---
phase: 03-recipe-presets
plan: "04"
subsystem: ui
tags: [servicenow, fluent, react, uat, acl]

requires:
  - phase: 03-03
    provides: RecipeSection.tsx full implementation + CatalogView wiring deployed to instance

provides:
  - UAT sign-off for RECIPE-02 (preset list, create, edit, archive)
  - Three UAT bug fixes: card data, modal sizing, card layout
  - Phase 3 human verification complete

affects: [phase-4-brew-log]

tech-stack:
  added: []
  patterns:
    - "sysparm_display_value=all required for display()/value() helpers to read Table API fields correctly"
    - "Use native <button> not @servicenow/react-components Button for custom card layouts — library Button collapses flex-column children to inline"
    - "Modal size='lg' + maxHeight/overflowY on inner div is the correct pattern for tall forms"

key-files:
  created:
    - .planning/phases/03-recipe-presets/03-04-SUMMARY.md
  modified:
    - src/client/components/RecipeSection.tsx

key-decisions:
  - "sysparm_display_value=all added to list fetch — required for display()/value() field helpers; without it fields return plain strings and helpers return empty"
  - "RecipeCard switched to native <button> — @servicenow/react-components Button collapses flex-column children to a single inline line regardless of style prop"
  - "Create modal simplified to Modal size='lg' + scrollable inner div — custom position:absolute inside Modal conflicted with component's own positioning"

patterns-established:
  - "Card components: use native <button display:block> + inner divs for full layout control (BeanCard pattern)"
  - "List fetches: always include sysparm_display_value=all when using display()/value() field helpers"
  - "Create modals: use Modal size prop + overflowY:auto inner div, not custom position:absolute wrapper"

requirements-completed:
  - RECIPE-02

duration: ~45min (UAT + 3 fix/deploy cycles)
completed: 2026-05-05
---

# Phase 3: Recipe Presets UAT Summary

**UAT approved after 3 bug fixes: card data blank (sysparm_display_value), modal overflow (size="lg"), and card text collapsed to one line (native button layout)**

## Performance

- **Duration:** ~45 min (UAT session + fix cycles)
- **Completed:** 2026-05-05
- **Tasks:** 1 (human verification checkpoint)
- **Files modified:** 1

## Accomplishments

- All 7 UAT test groups passed with non-admin `aibrew_user` account
- RECIPE-02 fully verified: preset list, create, edit, archive all functional
- Three UAT-discovered bugs found and fixed before sign-off
- ACL enforcement confirmed: non-admin user can CRUD recipe records

## Task Commits

1. **UAT Fix 1: sysparm_display_value + modal sizing** — `3eab0a4`
2. **UAT Fix 2: RecipeCard native button layout** — `9086654`

## Files Created/Modified

- `src/client/components/RecipeSection.tsx` — 3 targeted fixes applied

## Decisions Made

- `@servicenow/react-components Button` does not honour `display: flex; flex-direction: column` on its style prop — children collapse to inline. Native `<button>` is the correct pattern for custom card layouts (matches Phase 2 BeanCard).
- `sysparm_display_value: 'all'` must be included in any Table API fetch that feeds `display()` / `value()` field helpers. Without it the API returns plain strings and helpers return empty strings.
- Modal `size="lg"` + `overflowY: auto` inner div is the correct create-modal pattern. Custom `position: absolute` inside `<Modal>` fights the component's own positioning.

## Deviations from Plan

### Auto-fixed Issues

**1. sysparm_display_value omitted from list fetch**
- **Found during:** UAT Test 2 (card shows no text after create)
- **Issue:** Table API returned plain strings; `display(record.name)` returned `''` because `.display_value` is undefined on a string
- **Fix:** Added `sysparm_display_value: 'all'` to fetch params; also made field reading more robust with `?? record.name?.value ?? record.name` fallback chain
- **Committed in:** `3eab0a4`

**2. RecipeCard layout collapsed to single line**
- **Found during:** UAT Test 2 (name/method/ratio text ran together)
- **Issue:** `<Button>` component from `@servicenow/react-components` ignores `display: flex; flex-direction: column` on its style prop — renders children inline
- **Fix:** Replaced `<Button>` with native `<button display: block>` + separate `<div>` rows with `marginBottom`, matching the Phase 2 BeanCard established pattern
- **Committed in:** `9086654`

**3. Create modal overflow — form taller than modal window**
- **Found during:** UAT Test 2 (modal fields cut off)
- **Issue:** Inner div used `position: absolute; transform: translate(-50%, -50%)` which conflicted with `<Modal>`'s own positioning; no height cap or scroll
- **Fix:** Added `size="lg"` to `<Modal>` and replaced wrapper with `maxHeight: 70vh; overflowY: auto` — Modal handles centering, inner div handles scroll
- **Committed in:** `3eab0a4`

---

**Total deviations:** 3 auto-fixed (3 UAT-discovered bugs)
**Impact on plan:** All fixes essential for correct rendering. No scope change.

## Issues Encountered

- Instance was hibernated at start of Wave 1 deploy — user manually woke and ran `npx @servicenow/sdk install`

## Next Phase Readiness

- `x_664529_aibrew_recipe` table + field names are locked schema contract for Phase 4 (brew log preset picker)
- `RecipeSection.tsx` patterns established: sysparm_display_value=all, native button cards, Modal size="lg"
- Phase 4 can reference `RECIPE_TABLE = 'x_664529_aibrew_recipe'` and field names: name, method, equipment, dose_weight_g, water_weight_g, grind_size, notes, active

---
*Phase: 03-recipe-presets*
*Completed: 2026-05-05*
