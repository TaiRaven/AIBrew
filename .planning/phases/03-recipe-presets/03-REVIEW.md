---
phase: 03-recipe-presets
reviewed: 2026-05-05T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - src/fluent/tables/recipe.now.ts
  - src/fluent/acls/recipe-acls.now.ts
  - src/fluent/index.now.ts
  - src/client/components/RecipeSection.tsx
  - src/client/components/CatalogView.tsx
findings:
  critical: 3
  warning: 4
  info: 2
  total: 9
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-05-05
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Phase 3 delivers the recipe preset schema (Fluent table + ACLs), index re-export, and two React components (RecipeSection and CatalogView). The schema and ACL files are structurally sound and consistent with prior phases. The React implementation has three blockers and four warnings that must be resolved before this ships.

The most serious issues are: (1) the archive PATCH silently re-navigates away even when the fetch throws, discarding the error state before the user can read it; (2) `handleRowClick` passes an unvalidated `id` string from the API response directly into the URL — bypassing the SYS_ID_RE guard that protects the detail view's archive path; and (3) the `recipe.now.ts` table schema is missing a `bean` reference column, which means a recipe cannot record which bean it uses, making the preset functionally incomplete against the stated architecture.

---

## Critical Issues

### CR-01: Archive catch block clears modal before user can read the error

**File:** `src/client/components/RecipeSection.tsx:102-105`

**Issue:** In `handleArchive`, the `catch` block calls `setShowArchive(false)` before `setArchiveError(...)`. This closes the confirmation modal immediately on failure and then sets the error state on the now-hidden modal background. The `archiveError` div renders *outside* the modal (line 119), so it does appear, but the sequence is wrong: the modal disappears first, then the error state is applied. More critically, the identical pattern in `RoasterSection.tsx` and `EquipmentSection.tsx` (established prior phases) always calls `setShowArchive(false)` inside the catch too — meaning a network error produces a dismissed modal with a brief flash of error text that is immediately replaced by navigation back. In `RecipeSection.tsx` specifically there is *no* navigation call in the catch block (unlike RoasterSection), so the error does remain visible, but the modal-close-before-error-display ordering is still broken.

The deeper bug: when `res.ok` is false the code `throw new Error(...)` is caught by the same catch block which calls `setShowArchive(false)` — so a 403 or 404 from ServiceNow produces a silently dismissed modal with no HTTP status communicated to the user.

**Fix:**
```tsx
} catch {
  // Do NOT close the modal — let user retry or cancel
  setArchiveError("Couldn't archive — try again in a moment.")
}
```
Remove `setShowArchive(false)` from the catch path entirely. The user can dismiss manually via the Cancel button.

---

### CR-02: `handleRowClick` passes API-sourced `id` into the URL without SYS_ID_RE validation

**File:** `src/client/components/RecipeSection.tsx:211-213`

**Issue:** `handleRowClick` receives a `sysId` string extracted from `r.sys_id` in the list, which originates from the Table API response. This value is passed directly to `navigateToView` (and thus `window.history.pushState`) without testing against `SYS_ID_RE`. The export `RecipeSection` entry point (line 309) does validate `params.get('id')` before rendering `RecipeDetailView`, so the *render* is protected — but the URL can contain an arbitrary string injected by a malformed API response, which:

1. Corrupts the browser history state object (the id is embedded in the pushState data).
2. Is inconsistent with the project's stated pattern ("SYS_ID_RE validation before URL interpolation") and the threat model in `03-VALIDATION.md` (T-SysId-Injection).

The `sys_id` extractor on line 260 also falls through to the raw API string if `r.sys_id` is not an object — meaning a non-object API value is used as-is.

**Fix:**
```tsx
const handleRowClick = (sysId: string) => {
  if (!SYS_ID_RE.test(sysId)) return   // drop malformed API data silently
  navigateToView('catalog', { section: 'recipes', id: sysId }, 'AIBrew — Recipe')
}
```
Apply the same guard to the `id` extractor at line 260:
```tsx
const id = typeof r.sys_id === 'object' ? value(r.sys_id) : r.sys_id
if (!SYS_ID_RE.test(id)) return null   // skip malformed records
return <RecipeCard key={id} record={r} onClick={() => handleRowClick(id)} />
```

---

### CR-03: Recipe table schema has no `bean` reference column — preset is architecturally incomplete

**File:** `src/fluent/tables/recipe.now.ts:12-35`

**Issue:** The architecture in `CLAUDE.md` defines `x_<scope>_recipe` as "Saved brew presets" that pre-fill the brew log form. The brew log hub references all other tables. A recipe preset that records method, equipment, dose/water/grind but has no `bean` reference cannot pre-fill the bean field on the brew form. The `03-UI-SPEC.md` §8 explicitly references "D-01: Bean-agnostic preset" as a design decision, but D-01 does not appear in the CONTEXT.md decisions table visible from the planning docs reviewed — it is asserted only in the UI-SPEC itself.

If D-01 is intentional (presets are bean-agnostic by design), the table is correct but the omission is undocumented at the schema level and will confuse future developers. If D-01 is a mistake (the decision was never consciously made), a bean reference column missing from schema time requires a migration.

This is classified BLOCKER because: (a) adding a column to a deployed ServiceNow table after records exist requires a data migration effort; (b) CLAUDE.md explicitly calls out "Getting this wrong at schema time requires migrating all existing records" for the analogous grind-size issue.

**Fix (if D-01 is intentional — no bean on preset):** Add a comment to `recipe.now.ts` explicitly marking the omission as deliberate:
```typescript
// NOTE: No bean reference — presets are intentionally bean-agnostic (D-01).
// A bean is selected fresh on each brew log. See CONTEXT.md § D-01.
```
And document D-01 in the formal CONTEXT.md decisions table, not only in the UI-SPEC.

**Fix (if bean should be on the preset):**
```typescript
import { x_664529_aibrew_bean } from './bean.now'

// inside schema:
bean: ReferenceColumn({
  label: 'Bean',
  referenceTable: x_664529_aibrew_bean.name,
}),
```

---

## Warnings

### WR-01: List fetch does not handle non-OK HTTP responses — silently renders empty state

**File:** `src/client/components/RecipeSection.tsx:196-208`

**Issue:** The fetch chain calls `.then(r => r.json())` without first checking `r.ok`. A 401, 403, or 500 from ServiceNow returns a JSON error body, which is parsed and treated as `data`. `data.result` will be undefined on error bodies, so `data.result || []` silently produces an empty list. The user sees "No presets yet" instead of an error message. The `.catch()` only fires on network-level failures (DNS, connection refused), not on HTTP error status codes.

This is the same pattern already present in `RoasterSection.tsx` and `EquipmentSection.tsx` (established in prior phases), but it is still incorrect and should be fixed here rather than propagated further.

**Fix:**
```tsx
fetch(`/api/now/table/${RECIPE_TABLE}?${params}`, { ... })
  .then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  })
  .then(data => { if (!cancelled) setRecords(data.result || []) })
  .catch(() => {
    if (!cancelled) {
      setRecords([])
      setError('Could not load presets — tap to retry.')
    }
  })
```

---

### WR-02: `RecipeDetailView` renders `<FormActionBar />` before `<FormColumnLayout />` — save bar appears above fields

**File:** `src/client/components/RecipeSection.tsx:142-143`

**Issue:** Inside the `RecordProvider` in `RecipeDetailView`, the render order is:
```tsx
<FormActionBar />
<FormColumnLayout />
```
`FormActionBar` contains the Save/Cancel buttons. Rendering it *above* `FormColumnLayout` places the action buttons before the form fields, which is the opposite of the design spec (§3: "FormActionBar at bottom: [Cancel] [Save changes]") and the pattern used in every other section's create modal (where `FormActionBar` comes first but is inside the modal header row, not the detail view). In `RoasterSection.tsx` and `EquipmentSection.tsx` the detail view omits `FormActionBar` entirely — the recipe detail view is the only one that includes it, and it is positioned incorrectly.

**Fix:** Move `FormActionBar` after `FormColumnLayout`:
```tsx
<RecordProvider table={RECIPE_TABLE} sysId={sysId} isReadOnly={false}>
  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--sp-md)' }}>
    <Button onClicked={() => setShowArchive(true)} ...>Archive</Button>
  </div>
  <FormColumnLayout />
  <FormActionBar />
</RecordProvider>
```

---

### WR-03: `RoasterSection` detail view omits `FormActionBar` — users cannot save edits

**File:** `src/client/components/RoasterSection.tsx:53-58`

**Issue:** This is a pre-existing bug in a non-reviewed file, but it is called out because `RecipeSection.tsx` was modelled after it. `RoasterDetailView` wraps fields in `RecordProvider` with `isReadOnly={false}` but renders only `<FormColumnLayout />` — no `<FormActionBar />`. There is no Save button available in the detail view. Edits are silently discarded on navigation. This is the same omission as `EquipmentSection.tsx` (line 57).

The recipe detail view *does* include `FormActionBar` (WR-02 above), which means recipe edit/save actually works while roaster and equipment edit does not — an inconsistency across phases.

This finding is included because `RecipeSection.tsx` is the reference implementation that the other sections should align to, and a reviewer of Phase 3 needs to know this inconsistency exists.

**Fix:** Add `<FormActionBar />` to `RoasterDetailView` and `EquipmentDetailView` after `<FormColumnLayout />`. This is a separate fix to those files, not to the Phase 3 files.

---

### WR-04: `RoasterSection` entry-point passes unvalidated `sysId` to detail view

**File:** `src/client/components/RoasterSection.tsx:171-174`

**Issue:** `RoasterSection` renders `<RoasterDetailView sysId={sysId} />` when `sysId` is any truthy value from `params.get('id')`. There is no `SYS_ID_RE.test(sysId)` guard at the entry point — unlike `RecipeSection` (line 309) which correctly gates on the regex. This means a URL like `?view=catalog&section=roasters&id=../../../../etc/passwd` renders `RoasterDetailView` with an arbitrary string, which `RecordProvider` then uses to construct a Table API URL. The same pattern exists in `EquipmentSection.tsx` (line 170-174).

Again, a pre-existing issue in non-reviewed files, flagged because `RecipeSection.tsx` fixed this correctly and the inconsistency should be noted.

**Fix:** Apply the same guard as RecipeSection:
```tsx
export default function RoasterSection({ params }: { params: URLSearchParams }) {
  const sysId = params.get('id')
  if (sysId && SYS_ID_RE.test(sysId)) return <RoasterDetailView sysId={sysId} />
  return <RoasterListView />
}
```

---

## Info

### IN-01: `recipe.now.ts` missing `mandatory` on `method` and `equipment` columns — both optional by default

**File:** `src/fluent/tables/recipe.now.ts:14-29`

**Issue:** `method` and `equipment` are defined without `mandatory: true`. A preset with no method and no equipment is technically valid at the schema level. The UI-SPEC implies these are expected to be filled (the card renders the method chip prominently), but an empty record would render a blank card with only the name visible. This may be intentional (all fields optional except name), but it is worth confirming. The `bean.now.ts` marks `roaster` as `mandatory: true` as precedent for reference columns that should always be filled.

**Fix:** If both fields should always be present, add `mandatory: true`:
```typescript
method: ChoiceColumn({ label: 'Method', mandatory: true, choices: { ... } }),
equipment: ReferenceColumn({ label: 'Equipment', mandatory: true, referenceTable: ... }),
```
If optional by design, add a comment to the schema noting the intent.

---

### IN-02: `CatalogView` `useEffect` fires on every render when `params` object reference changes

**File:** `src/client/components/CatalogView.tsx:23-27`

**Issue:** The `useEffect` that redirects to the default section lists `[params]` as its dependency. `params` is a `URLSearchParams` object passed as a prop from `App`. Every time `App` re-renders and recreates `getViewParams()`, a new `URLSearchParams` object is passed even if the URL has not changed, triggering the effect and calling `navigateToView` repeatedly. In practice this adds an extra `history.pushState` on every re-render when no section param is present (the condition `!params.get('section')` guards the call, so it only fires when the user is on `/` or `?view=catalog` with no section). However, on that initial landing, repeated pushState calls clutter the browser history.

**Fix:** Depend on the string value, not the object reference:
```tsx
const section = params.get('section')
useEffect(() => {
  if (!section) {
    navigateToView('catalog', { section: 'roasters' }, 'AIBrew — Catalog')
  }
}, [section])
```

---

_Reviewed: 2026-05-05_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
