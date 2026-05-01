---
plan: 02-05
phase: 02-bean-catalog-inventory
status: complete
completed: 2026-05-01
---

# Plan 02-05 Summary: CatalogView Integration, Deploy & Human UAT

## What Was Built

CatalogView.tsx Beans tab was already wired by Plan 03. This plan covered deployment and human UAT sign-off, plus three UAT-discovered bug fixes deployed in the same session.

## Commits

- `6ae916d` fix(02-05): unwrap Scripted REST result envelope in stock fetch — remaining_g was always 0
- `c952091` fix(02-05): show bean name on cards, green/red stock bar colors

## UAT Results

All 5 phase success criteria verified by human UAT with non-admin test user:

1. ✓ User can create, view, edit, and archive a bean type record linked to a roaster
2. ✓ User can log a bean purchase (grams and date) against a bean type record
3. ✓ Remaining stock (g) on the bean detail page reflects current purchases
4. ✓ Low-stock badge appears on beans with less than 50 g remaining
5. ✓ Chronological inventory history shows all purchases per bean

## Bugs Fixed During UAT

1. **Stock values always showing 0** — ServiceNow Scripted REST APIs wrap `response.setBody()` in a `{ result: ... }` envelope. The UI was reading `data.remaining_g` directly instead of `data.result.remaining_g`. Fixed with `data.result ?? data` fallback in both list and detail stock fetches.

2. **Bean name not displaying on list cards** — Table API returns plain string fields (not `{ value, display_value }` objects) without `sysparm_display_value=all`. Fixed by adding raw string fallback in BeanCard field accessors.

3. **Stock bar wrong colour** — `--aibrew-accent` is orange (`#c2410c`), not green. Replaced with explicit `#16a34a` (green) for normal stock and `#b91c1c` (red) for low stock in both `StockBar` component and inline detail bar.

## Self-Check: PASSED

- All 5 success criteria verified
- SDK build exits 0
- Deployed to dev203275.service-now.com
- UAT approved by human tester
