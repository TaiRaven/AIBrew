---
phase: 03-recipe-presets
plan: "01"
subsystem: database
tags: [servicenow, fluent, sdk, table-definition, acl, recipe]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: aibrew_user role, equipment table (x_664529_aibrew_equipment) referenced by recipe
provides:
  - x_664529_aibrew_recipe table definition with 8 columns (bean-agnostic preset schema)
  - 4 record-level ACLs for recipe table (read/write/create/delete, aibrew_user only)
  - recipe exports registered in index.now.ts
affects:
  - 03-02 (RecipeSection UI component reads this table)
  - 03-03 (CatalogView wiring depends on RecipeSection)
  - 04 (brew log preset picker depends on field names: name, method, equipment, dose_weight_g, water_weight_g, grind_size)

# Tech tracking
tech-stack:
  added:
    - DecimalColumn (new to project — used for dose_weight_g, water_weight_g)
    - MultiLineTextColumn (new to project — used for notes)
  patterns:
    - Table() + 4 Acl() pattern consistent with all prior catalog entities

key-files:
  created:
    - src/fluent/tables/recipe.now.ts
    - src/fluent/acls/recipe-acls.now.ts
  modified:
    - src/fluent/index.now.ts

key-decisions:
  - "Recipe table is bean-agnostic per D-01 — no bean ReferenceColumn; bean paired at brew-time in Phase 4"
  - "Brew ratio (water/dose) is NOT stored — computed at render time per D-03"
  - "Field names locked as Phase 4 schema contract: name, method, equipment, dose_weight_g, water_weight_g, grind_size, notes, active"

patterns-established:
  - "DecimalColumn for fractional gram weights — allows 18.5g input without error"
  - "MultiLineTextColumn for preset notes — distinct from brew taste_notes in brew log"

requirements-completed:
  - RECIPE-02  # schema prerequisite; UI/management screen in plans 02-03

# Metrics
duration: 2min
completed: 2026-05-05
---

# Phase 3 Plan 01: Recipe Table Schema and ACLs Summary

**x_664529_aibrew_recipe Fluent table definition (8 columns, DecimalColumn + MultiLineTextColumn) with 4 record-level ACLs gating all operations to aibrew_user — bean-agnostic preset schema contract for Phase 4**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-05-05T08:07:20Z
- **Completed:** 2026-05-05T08:09:19Z
- **Tasks:** 2 (code complete; deploy pending instance availability — see Auth Gate below)
- **Files modified:** 3

## Accomplishments
- Created `recipe.now.ts` with all 8 schema fields using exact locked field names (Phase 4 contract)
- Introduced `DecimalColumn` and `MultiLineTextColumn` — two SDK column types new to this project
- Created `recipe-acls.now.ts` with 4 record-level ACLs, each restricted to `aibrew_user` role
- Registered both artifacts in `index.now.ts`
- `npx @servicenow/sdk build` passes clean

## Task Commits

Each task was committed atomically:

1. **Task 1: Create recipe.now.ts table definition** - `6d273c3` (feat)
2. **Task 2: Create recipe-acls.now.ts and register exports** - `bccbc4f` (feat)

**Plan metadata:** pending final metadata commit

## Files Created/Modified
- `src/fluent/tables/recipe.now.ts` — x_664529_aibrew_recipe table: 8 columns with DecimalColumn, MultiLineTextColumn, ChoiceColumn (7 brew methods), ReferenceColumn to equipment, display: 'name'
- `src/fluent/acls/recipe-acls.now.ts` — 4 ACLs (read/write/create/delete), type: 'record', table: x_664529_aibrew_recipe, roles: [aibrew_user]
- `src/fluent/index.now.ts` — 2 new export lines for recipe table and recipe ACLs

## Decisions Made
- Followed all locked decisions from D-01 through D-07 exactly; no new decisions required
- Equipment display_value resolved automatically by Table API v2 — no dot-notation needed in list fetch

## Deviations from Plan

None — plan executed exactly as written. All file content matches the plan specification verbatim.

## Auth Gate: sdk install

**Encountered during:** Task 2 (deploy step)
**What automation did:** Built successfully (`npx @servicenow/sdk build` exits 0). Ran `npx @servicenow/sdk install` — received HTTP 200 with HTML response body, indicating the developer instance at https://dev203275.service-now.com is hibernated or the `claude_automation` credentials are stale.
**Status:** Code complete and build-verified. Deploy blocked on instance availability.
**To resume:** Wake the developer instance (visit the URL in a browser to trigger wake-up), then run:
```
npx @servicenow/sdk install
```
If credentials are stale, re-add them first:
```
npx @servicenow/sdk auth --add https://dev203275.service-now.com --type basic
```

## Known Stubs

None — this plan creates only Fluent server-side artifacts (table + ACLs). No UI components with placeholder data.

## Threat Flags

None — all threat mitigations in the plan's threat model are implemented:
- T-03-01: Four Acl() definitions cover read/write/create/delete with aibrew_user role only
- T-03-02: SDK-managed ACLs replaced on every sdk install (no drift risk)

## Self-Check

| Check | Result |
|-------|--------|
| src/fluent/tables/recipe.now.ts exists | FOUND |
| src/fluent/acls/recipe-acls.now.ts exists | FOUND |
| index.now.ts contains recipe exports | FOUND |
| Commit 6d273c3 exists | FOUND |
| Commit bccbc4f exists | FOUND |
| npx @servicenow/sdk build exits 0 | PASSED |
| DecimalColumn in recipe.now.ts | FOUND |
| MultiLineTextColumn in recipe.now.ts | FOUND |
| display: 'name' in recipe.now.ts | FOUND |
| No ratio column | CONFIRMED |
| No bean column | CONFIRMED |

## Self-Check: PASSED

## Next Phase Readiness
- Plan 03-02 (RecipeSection UI component) can begin immediately — the table definition is the only prerequisite for building the UI
- Deploy to instance should be completed before Plan 03-04 UAT; the table must exist on the instance for end-to-end testing
- Field names are locked — do not rename after this plan deploys

---
*Phase: 03-recipe-presets*
*Completed: 2026-05-05*
