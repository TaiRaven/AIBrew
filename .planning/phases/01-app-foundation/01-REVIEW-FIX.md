---
phase: 01-app-foundation
fixed_at: 2026-04-30T08:52:17Z
review_path: .planning/phases/01-app-foundation/01-REVIEW.md
iteration: 1
fix_scope: critical_warning
findings_in_scope: 10
fixed: 10
skipped: 0
status: all_fixed
---

# Phase 01: Code Review Fix Report

**Fixed at:** 2026-04-30T08:52:17Z
**Source review:** `.planning/phases/01-app-foundation/01-REVIEW.md`
**Iteration:** 1

**Summary:**
- Findings in scope: 10 (4 Critical, 6 Warning)
- Fixed: 10
- Skipped: 0

---

## Fixed Issues

### CR-01: sysId used unsanitised in Table API fetch URL

**Files modified:** `src/client/components/EquipmentSection.tsx`, `src/client/components/RoasterSection.tsx`
**Commit:** `061478b` — fix(01): CR-01/CR-02/WR-03/WR-04 sysId validation, g_ck fail-fast, list error state, boolean active
**Applied fix:** Added `const SYS_ID_RE = /^[0-9a-f]{32}$/i` at module level in both files. In `handleArchive`, validate `sysId` against this regex before making the PATCH fetch; if it fails, set `archiveError('Invalid record identifier.')` and return early.

---

### CR-02: `g_ck` read with silent empty-string fallback — 403s swallowed

**Files modified:** `src/client/components/EquipmentSection.tsx`, `src/client/components/RoasterSection.tsx`
**Commit:** `061478b` — fix(01): CR-01/CR-02/WR-03/WR-04 sysId validation, g_ck fail-fast, list error state, boolean active
**Applied fix:** In `handleArchive`, replaced `(window as any).g_ck || ''` with a read-then-guard pattern: read `g_ck` into a local variable and return early with a user-visible message if it is falsy. In `EquipmentListView`/`RoasterListView`, the list fetch now conditionally includes `X-UserToken` only when `g_ck` is present (no silent empty-string header).

---

### CR-03: Navigation side effect called during render phase

**Files modified:** `src/client/app.tsx`
**Commit:** `1f07632` — fix(01): CR-03 move unknown-view redirect from render to useEffect
**Applied fix:** Removed the `navigateToView` call from the `default` branch of `renderContent()`. Added a `knownViews` array and an `isUnknownView` boolean derived from it. Added a `useEffect(() => { if (isUnknownView) navigateToView('home', {}, 'AIBrew') }, [isUnknownView])` so the redirect fires only after render is committed, not during it. The `default` branch of the switch now returns `null` harmlessly.

---

### CR-04: `UiPage` `$id` references undefined key `'aibrew-home'`

**Files modified:** `src/fluent/generated/keys.ts`, `src/fluent/ui-pages/aibrew-home.now.ts`
**Commit:** `55bfee0` — fix(01): CR-04 add aibrew_home explicit key and fix UiPage \$id reference
**Applied fix:** Added `aibrew_home` (underscore) to the `explicit` section of `keys.ts` with `table: 'sys_ui_page'` and the existing `id: '437e9bae7316435cb7de2a11eddd20d3'` (already present in the composite section for the `x_664529_aibrew_home.do` endpoint). Changed `Now.ID['aibrew-home']` to `Now.ID['aibrew_home']` in `aibrew-home.now.ts` so the SDK resolves to the stable known ID on every build.

---

### WR-01: `handleTabChange` in App is a no-op causing extra renders

**Files modified:** `src/client/components/TopNav.tsx`, `src/client/app.tsx`
**Commit:** `a6250e4` — fix(01): WR-01 remove redundant onTabChange callback from TopNav
**Applied fix:** Removed the `onTabChange` prop from `TopNavProps` and `TopNav`'s component signature. Removed the `onTabChange(tabId)` call inside `handleTabClick`. Removed `handleTabChange` from `App` and the `onTabChange={handleTabChange}` JSX attribute. Navigation state is now managed exclusively by the `aibrew:navigate` event listener in `App`.

---

### WR-02: `CatalogView` `useEffect` missing `params` dependency

**Files modified:** `src/client/components/CatalogView.tsx`
**Commit:** `98f9a40` — fix(01): WR-02 add params to CatalogView useEffect dependency array
**Applied fix:** Changed the dependency array from `[]` to `[params]` in the `useEffect` that redirects to the default catalog section, so stale params are never captured in the closure.

---

### WR-03: List fetch failure renders false empty state

**Files modified:** `src/client/components/EquipmentSection.tsx`, `src/client/components/RoasterSection.tsx`
**Commit:** `061478b` — fix(01): CR-01/CR-02/WR-03/WR-04 sysId validation, g_ck fail-fast, list error state, boolean active
**Applied fix:** Added `const [error, setError] = useState<string | null>(null)` to both `EquipmentListView` and `RoasterListView`. The `.catch()` handler now sets both `records([])` and `error('Could not load records — tap to retry.')`. Error state is reset to `null` at the start of each effect run. An error banner is rendered above the list, and the empty-state message is suppressed when an error is present.

---

### WR-04: Archive PATCH sends `active: 'false'` as string

**Files modified:** `src/client/components/EquipmentSection.tsx`, `src/client/components/RoasterSection.tsx`
**Commit:** `061478b` — fix(01): CR-01/CR-02/WR-03/WR-04 sysId validation, g_ck fail-fast, list error state, boolean active
**Applied fix:** Changed `JSON.stringify({ active: 'false' })` to `JSON.stringify({ active: false })` in both `handleArchive` functions so the Table API receives the canonical boolean value for the `BooleanColumn`.

---

### WR-05: `EquipmentSection`/`RoasterSection` re-read params from window instead of using prop

**Files modified:** `src/client/components/EquipmentSection.tsx`, `src/client/components/RoasterSection.tsx`, `src/client/components/CatalogView.tsx`
**Commit:** `daf0643` — fix(01): WR-05 pass params as prop to EquipmentSection and RoasterSection
**Applied fix:** Changed `EquipmentSection` and `RoasterSection` default exports to accept `{ params: URLSearchParams }` as a prop and derive `sysId` from the prop rather than calling `getViewParams()`. Removed `getViewParams` from both imports. Updated `CatalogView.renderSection()` to pass `params={params}` when rendering each section.

---

### WR-06: `Array.from` polyfill references `Window` — ReferenceError in strict sandbox

**Files modified:** `src/client/index.html`
**Commit:** `0124e0a` — fix(01): WR-06 remove C === Window check from Array.from polyfill
**Applied fix:** Removed `C === Window` from the constructor-check condition in the `specArrayFrom` polyfill. The condition is now `typeof C !== 'function' || C === Object`, which is functionally correct and does not reference the potentially-absent `Window` global.

---

## Skipped Issues

None — all 10 in-scope findings were successfully fixed.

---

_Fixed: 2026-04-30T08:52:17Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
