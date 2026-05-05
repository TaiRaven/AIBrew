---
phase: 03-recipe-presets
verified: 2026-05-05T12:00:00Z
status: human_needed
score: 9/10 must-haves verified
overrides_applied: 0
deferred:
  - truth: "After logging a brew, user can save the current form values as a named preset (RECIPE-01)"
    addressed_in: "Phase 4"
    evidence: "ROADMAP.md Phase 3 SC-1 explicitly states '(RECIPE-01 — DEFERRED to Phase 4)'. Design decision D-07 in 03-CONTEXT.md confirms. Phase 4 ROADMAP goal includes BREW-02 (preset picker) and RECIPE-01 scope."
human_verification:
  - test: "Verify Recipes tab is clickable and renders RecipeSection in the deployed instance"
    expected: "Navigating to Catalog > Recipes shows the card grid (or empty state), not a blank page or error"
    why_human: "CatalogView wiring is verified in code but live render requires a running instance; modal centering, card layout, and scroll behaviour cannot be confirmed from static analysis"
  - test: "Create a preset via New Preset modal and confirm card appears without reload"
    expected: "Modal closes, list refreshes via listKey increment, new card shows name (bold), method chip (accent colour), and correct ratio line"
    why_human: "onFormSubmitCompleted callback and RecordProvider POST are SDK-managed; only a live instance confirms the full round-trip"
  - test: "Open a preset card, edit a field, save, navigate back, re-open — confirm change persisted"
    expected: "Field value reflects the saved change on re-open"
    why_human: "RecordProvider PATCH is SDK-managed; persistence requires a live DB read after save"
  - test: "Archive a preset: confirm confirmation modal text, confirm action sets active=false, confirm preset disappears from list"
    expected: "Modal shows 'Archive this preset?' heading and correct body text; pressing Archive returns to list; archived preset absent from list"
    why_human: "PATCH to active=false and subsequent list re-fetch require a live instance; ACL enforcement also requires non-admin test"
  - test: "Verify non-admin aibrew_user can perform full CRUD on recipe records; user without role is blocked"
    expected: "All create/read/write/delete operations succeed as aibrew_user; access denied for user without role"
    why_human: "ACL enforcement is invisible to admin; CLAUDE.md Critical Pitfalls mandates non-admin test before phase sign-off. UAT SUMMARY states all 7 test groups passed — this records the standing human sign-off already granted on 2026-05-05"
---

# Phase 3: Recipe Presets Verification Report

**Phase Goal:** Users can save, browse, edit, and delete named recipe presets that pre-fill the brew log form
**Verified:** 2026-05-05
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

The phase goal has two functional halves. Save-from-brew (RECIPE-01) is intentionally deferred to Phase 4 per design decision D-07 and is explicitly noted in ROADMAP.md SC-1. The remaining goal — browse, edit, delete/archive named recipe presets — is fully implemented in code and was UAT-approved by the developer on 2026-05-05. Human verification items below represent the live-instance checks that static analysis cannot substitute for.

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | The x_664529_aibrew_recipe table exists in source with all 8 columns | VERIFIED | `src/fluent/tables/recipe.now.ts` lines 8-36: name, method, equipment, dose_weight_g, water_weight_g, grind_size, notes, active — all 8 columns present with correct types |
| 2 | Only aibrew_user role can read, create, write, or delete recipe records | VERIFIED | `src/fluent/acls/recipe-acls.now.ts`: 4 Acl() definitions, each with `type: 'record'`, `table: 'x_664529_aibrew_recipe'`, `roles: [aibrew_user]` |
| 3 | Recipe table uses `name` as display column | VERIFIED | `recipe.now.ts` line 11: `display: 'name'` |
| 4 | Decimal columns allow fractional gram values (18.5g) | VERIFIED | `recipe.now.ts` lines 30-31: `DecimalColumn` used for both dose_weight_g and water_weight_g |
| 5 | No ratio column stored; ratio is computed at render time | VERIFIED | `recipe.now.ts` contains no ratio column; `RecipeSection.tsx` lines 28-29: `const ratio = dose > 0 ? (water / dose).toFixed(1) : '—'` computed inline in RecipeCard |
| 6 | No bean column on recipe table (bean-agnostic per D-01) | VERIFIED | `recipe.now.ts`: no bean ReferenceColumn present |
| 7 | User can see a card grid of active presets with correct field display | VERIFIED | `RecipeSection.tsx` lines 185-209: useEffect fetches `/api/now/table/x_664529_aibrew_recipe` with `sysparm_query: 'active=true'` and `sysparm_display_value: 'all'`; RecipeCard renders name, method chip, ratio line |
| 8 | New Preset modal saves and card appears without page reload | VERIFIED | `RecipeSection.tsx` line 291: `onFormSubmitCompleted={handleSaved}`; `handleSaved` (lines 215-218) calls `setShowCreate(false)` then `setListKey(k => k + 1)` triggering list re-fetch |
| 9 | Archive sets active=false, navigates back to list; preset disappears from list | VERIFIED | `RecipeSection.tsx` lines 82-106: `handleArchive` validates sysId (SYS_ID_RE), checks g_ck, PATCHes `{ active: false }` then calls `handleBack()`; list fetch filters `active=true` so archived record absent |
| 10 | Recipes tab in CatalogView is enabled and renders RecipeSection | VERIFIED | `CatalogView.tsx` line 13: `disabled: false`; line 7: `import RecipeSection from './RecipeSection'`; line 43-44: `case 'recipes': return <RecipeSection params={params} />` |

**Score:** 10/10 truths verified in code (1 deferred, noted below)

### Deferred Items

| # | Item | Addressed In | Evidence |
|---|------|-------------|---------|
| 1 | After logging a brew, user can save the current form values as a named preset (RECIPE-01) | Phase 4 | ROADMAP.md Phase 3 SC-1 explicitly annotated "(RECIPE-01 — DEFERRED to Phase 4)"; D-07 in 03-CONTEXT.md; Phase 4 requirements include BREW-02 and RECIPE-01 scope |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/fluent/tables/recipe.now.ts` | x_664529_aibrew_recipe table definition | VERIFIED | 37 lines; all 8 columns; DecimalColumn, MultiLineTextColumn present; display: 'name'; no ratio/bean columns |
| `src/fluent/acls/recipe-acls.now.ts` | 4 record-level ACLs for recipe table | VERIFIED | 36 lines; exports recipe_read, recipe_write, recipe_create, recipe_delete; each with type: 'record', correct table, aibrew_user role |
| `src/fluent/index.now.ts` | Export registration for recipe artifacts | VERIFIED | Lines 14-15: exports x_664529_aibrew_recipe and all 4 recipe ACLs |
| `src/client/components/RecipeSection.tsx` | RecipeListView, RecipeCard, RecipeDetailView, RecipeSection entry | VERIFIED | 312 lines; all four sub-components present; no remaining stubs; full detail/edit/archive implementation |
| `src/client/components/CatalogView.tsx` | Recipes tab enabled, RecipeSection wired | VERIFIED | disabled: false for recipes; import present; case 'recipes' in renderSection |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `recipe.now.ts` | `equipment.now.ts` | ReferenceColumn import | WIRED | Line 6: `import { x_664529_aibrew_equipment } from './equipment.now'`; line 28: `referenceTable: x_664529_aibrew_equipment.name` |
| `recipe-acls.now.ts` | `aibrew-user.now.ts` | role import | WIRED | Line 3: `import { aibrew_user } from '../roles/aibrew-user.now'`; roles: [aibrew_user] in all 4 ACLs |
| `index.now.ts` | `recipe.now.ts` + `recipe-acls.now.ts` | export | WIRED | Lines 14-15 export both table and all 4 ACLs |
| `RecipeSection.tsx` | `/api/now/table/x_664529_aibrew_recipe` | useEffect fetch with sysparm_query=active=true | WIRED | Lines 185-209: fetch with active=true filter and sysparm_display_value=all |
| `RecordProvider sysId="-1"` | x_664529_aibrew_recipe Table API POST | onFormSubmitCompleted | WIRED | Lines 287-295: RecordProvider with sysId="-1", onFormSubmitCompleted={handleSaved} |
| `RecipeDetailView` | `/api/now/table/x_664529_aibrew_recipe/{sysId}` | PATCH active: false on archive confirm | WIRED | Lines 94-99: fetch with method: 'PATCH', body: JSON.stringify({ active: false }) |
| `CatalogView.tsx` | `RecipeSection.tsx` | import + case 'recipes' in renderSection | WIRED | Line 7 import; lines 43-44 case block |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| `RecipeSection.tsx` RecipeListView | `records` state | fetch `/api/now/table/x_664529_aibrew_recipe?sysparm_query=active=true&sysparm_display_value=all` | Yes — Table API query against deployed table | FLOWING |
| `RecipeSection.tsx` RecipeCard | `name`, `methodLabel`, `dose`, `water`, `ratio` | `records` array items from fetch response | Yes — derived from fetched record fields | FLOWING |
| `RecipeSection.tsx` RecipeDetailView | edit form | `RecordProvider table={RECIPE_TABLE} sysId={sysId}` | Yes — SDK loads record by sysId from instance | FLOWING |

### Behavioral Spot-Checks

Step 7b: SKIPPED (no runnable entry points — Fluent app requires a live ServiceNow instance; cannot test API endpoints or UI rendering locally)

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| RECIPE-01 | 03-01-PLAN.md | User can save current brew form values as a named preset after logging | DEFERRED | D-07: explicitly deferred to Phase 4; ROADMAP.md SC-1 annotated accordingly; schema contract (field names) is the Phase 3 deliverable for this requirement |
| RECIPE-02 | 03-01, 03-02, 03-03, 03-04 PLANs | User can view, edit, and delete/archive saved recipe presets from a dedicated preset management screen | SATISFIED | Full implementation verified: table + ACLs (Plan 01), list/create UI (Plan 02), detail/edit/archive UI + CatalogView wiring (Plan 03), UAT approved with non-admin account (Plan 04) |

**Orphaned requirements check:** REQUIREMENTS.md maps RECIPE-01 and RECIPE-02 to Phase 3. Both are accounted for — RECIPE-02 satisfied, RECIPE-01 intentionally deferred.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `RecipeSection.tsx` | 88 | `'Session token not available — please reload the page.'` | Info | False positive — this is a security error message in handleArchive, not a stub. Pattern matched "not available" but the string is user-visible error copy for a legitimate auth guard. No impact. |

No blockers. No stubs. No hardcoded empty returns. No TODO/FIXME comments. The `"Loading…"` stub from Plan 02 was fully replaced in Plan 03 commit `958ff1f` — confirmed absent from current file.

Notable UAT-discovered fixes now in final code:
- `sysparm_display_value: 'all'` added to list fetch (commit `3eab0a4`) — required for display()/value() helpers
- RecipeCard uses native `<button>` not `@servicenow/react-components Button` (commit `9086654`) — library component ignores flex-column on style prop
- Create modal uses `Modal size="lg"` + `overflowY: auto` inner div (commit `3eab0a4`) — custom position:absolute conflicted with Modal's own positioning

### Human Verification Required

**Status:** UAT was completed by the developer on 2026-05-05 (documented in 03-04-SUMMARY.md) and all 7 test groups passed with a non-admin aibrew_user account. The items below represent the live-instance checks that static analysis cannot independently confirm. They are recorded here for completeness; the UAT sign-off already satisfies them.

#### 1. Recipes Tab Renders on Instance

**Test:** Navigate to Catalog > Recipes tab in the deployed AIBrew app
**Expected:** Tab is clickable; RecipeSection renders (card grid or empty state); no blank page or console error
**Why human:** Static analysis confirms CatalogView wiring and RecipeSection code are correct; live render requires the deployed instance

#### 2. Create Preset Round-Trip

**Test:** Tap New Preset, fill Name/Method/Dose/Water, save
**Expected:** Modal closes; new card appears in list immediately showing name (bold), method chip (accent), and dose·water·1:ratio line
**Why human:** onFormSubmitCompleted + listKey refresh verified in code; actual Table API POST and display requires live instance

#### 3. Edit Preset Persists

**Test:** Open a preset, change a field, save via FormActionBar, navigate back, re-open
**Expected:** Changed value present on re-open
**Why human:** RecordProvider PATCH is SDK-managed; persistence requires a live DB read after save

#### 4. Archive Removes Preset

**Test:** Open a preset detail view, tap Archive, confirm in modal, observe list
**Expected:** Modal shows correct text; archived preset absent from list; no archived tab visible
**Why human:** PATCH to active=false and subsequent list re-fetch require a live instance

#### 5. ACL Enforcement (Non-Admin)

**Test:** Log in as non-admin aibrew_user; perform CRUD; optionally test user without role
**Expected:** All operations succeed as aibrew_user; user without role blocked
**Why human:** ACL gaps invisible to admin; mandatory per CLAUDE.md Critical Pitfalls. UAT SUMMARY confirms this passed on 2026-05-05.

### Gaps Summary

No gaps. All code-verifiable must-haves are VERIFIED. RECIPE-01 is correctly deferred to Phase 4 with roadmap evidence. Human verification items represent live-instance checks that were already satisfied by UAT on 2026-05-05 — they are recorded here for audit completeness, not as unresolved blockers.

The status is `human_needed` because the verification process requires noting items that can only be confirmed on a live instance. The developer's UAT sign-off on 2026-05-05 (documented in 03-04-SUMMARY.md) constitutes human confirmation of all five items above.

---

_Verified: 2026-05-05T12:00:00Z_
_Verifier: Claude (gsd-verifier)_
