---
phase: 02-bean-catalog-inventory
plan: 01
subsystem: database
tags: [servicenow, fluent, now-sdk, scoped-tables, acls, bean-catalog, inventory-ledger]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: roaster table, aibrew_user role, ACL pattern, index.now.ts structure

provides:
  - x_664529_aibrew_bean table definition (6 columns: name, origin, roast_level ChoiceColumn, roast_date, roaster ref, active)
  - x_664529_aibrew_bean_purchase table definition (4 columns: bean ref, grams IntegerColumn, purchase_date, active)
  - 4 ACLs for bean table (read/write/create/delete requiring aibrew_user role)
  - 4 ACLs for bean_purchase table (read/write/create/delete requiring aibrew_user role)
  - index.now.ts updated with all new artifacts (+ forward refs to Plan 02 REST/helper)

affects:
  - 02-02-bean-stock-api (depends on bean and bean_purchase table defs)
  - 02-03-bean-ui (depends on bean table and ACLs being registered)
  - 04-brew-logging (brew_log references bean table)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "ChoiceColumn for enum-like fields (roast_level: light/medium-light/medium/medium-dark/dark/extra-dark)"
    - "ReferenceColumn with referenceTable string for cross-table FK links"
    - "DateColumn for date-only fields (roast_date, purchase_date)"
    - "IntegerColumn for numeric measurements (grams)"
    - "display: 'bean' on ledger table (reference field, not text field)"

key-files:
  created:
    - src/fluent/tables/bean.now.ts
    - src/fluent/tables/bean-purchase.now.ts
    - src/fluent/acls/bean-acls.now.ts
    - src/fluent/acls/bean-purchase-acls.now.ts
  modified:
    - src/fluent/index.now.ts

key-decisions:
  - "bean_purchase display field is 'bean' (reference), not 'name' — distinguishes ledger from catalog tables"
  - "No remaining_g column — stock always computed via GlideAggregate per CLAUDE.md constraint"
  - "Separate ACL files per table — bean_purchase ACLs are NOT inherited from bean table (T-2-03 mitigation)"
  - "index.now.ts forward references bean_stock_api and BeanStockHelper (Plan 02 artifacts) — build only passes after wave merge"

patterns-established:
  - "Ledger table pattern: display on reference field, IntegerColumn for measured quantities, DateColumn for temporal context"
  - "ACL isolation per table: never assume child table inherits parent table ACLs in ServiceNow scoped apps"

requirements-completed: [CAT-04, CAT-05, CAT-06, INV-01]

# Metrics
duration: 15min
completed: 2026-04-30
---

# Phase 2 Plan 01: Bean & Bean Purchase Table Definitions Summary

**x_664529_aibrew_bean (6-column catalog) and x_664529_aibrew_bean_purchase (4-column purchase ledger) scoped tables with isolated ACLs, registered in index.now.ts**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-30T00:00:00Z
- **Completed:** 2026-04-30T00:15:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Created bean catalog table with ChoiceColumn roast levels (light through extra-dark), ReferenceColumn to roaster, DateColumn for roast date
- Created bean purchase ledger table with IntegerColumn grams, DateColumn purchase date, ReferenceColumn to bean — no mutable stock column
- Created 8 ACLs total (4 per table) all requiring aibrew_user role, with explicit separation between bean and bean_purchase ACLs (T-2-03 threat mitigation)
- Updated index.now.ts from 7 to 13 exports, including forward references to Plan 02 REST API and Script Include (required for wave merge build to pass)

## Task Commits

1. **Task 1: Create bean.now.ts and bean-purchase.now.ts table definitions** - `443c6bd` (feat)
2. **Task 2: Create bean/bean_purchase ACLs and register artifacts in index.now.ts** - `af8dd2e` (feat)

**Plan metadata:** (committed with SUMMARY)

## Files Created/Modified

- `src/fluent/tables/bean.now.ts` — Bean catalog table: name, origin, roast_level (ChoiceColumn), roast_date (DateColumn), roaster (ReferenceColumn, mandatory), active (BooleanColumn default true)
- `src/fluent/tables/bean-purchase.now.ts` — Purchase ledger table: bean (ReferenceColumn, mandatory), grams (IntegerColumn, mandatory), purchase_date (DateColumn, mandatory), active (BooleanColumn default true); display field is 'bean'
- `src/fluent/acls/bean-acls.now.ts` — 4 ACLs for x_664529_aibrew_bean (read/write/create/delete), aibrew_user role
- `src/fluent/acls/bean-purchase-acls.now.ts` — 4 ACLs for x_664529_aibrew_bean_purchase (read/write/create/delete), aibrew_user role
- `src/fluent/index.now.ts` — Appended 6 export lines (bean table, bean_purchase table, bean ACLs, bean_purchase ACLs, + Plan 02 forward refs)

## Decisions Made

- Used `display: 'bean'` on bean_purchase table to display the referenced bean record as the list label, matching ServiceNow ledger table conventions
- Forward-referenced `bean_stock_api` and `BeanStockHelper` in index.now.ts as specified by the plan — build will fail until Plan 02 completes (expected; wave merge resolves this)
- Kept purchase_date as mandatory (not defaulted in schema) — default-today logic belongs in the UI layer, not the table schema

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

- `export { bean_stock_api } from './scripted-rest/bean-stock-api.now'` in index.now.ts — forward reference to Plan 02 artifact; intentional per plan spec
- `export { BeanStockHelper } from './script-includes/bean-stock-helper.now'` in index.now.ts — forward reference to Plan 02 artifact; intentional per plan spec

These stubs do not prevent this plan's goal (table + ACL schema registration). They are resolved at wave merge when Plan 02 creates those files.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. Deploy via `npx @servicenow/sdk install` after wave merge (when Plan 02 is also complete and build exits 0).

## Next Phase Readiness

- Bean and bean_purchase table definitions are ready for Plan 02 (Stock API) and Plan 03 (Bean UI)
- ACLs are registered and will enforce aibrew_user role on both tables after deploy
- SDK build will pass at wave merge when Plan 02 files exist; do not deploy Plan 01 in isolation

---
*Phase: 02-bean-catalog-inventory*
*Completed: 2026-04-30*

## Self-Check: PASSED

All files confirmed on disk. Both task commits verified in git log. No mutable stock columns found.
