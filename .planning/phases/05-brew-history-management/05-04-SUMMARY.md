---
phase: 05-brew-history-management
plan: "04"
subsystem: deploy-and-uat
tags: [uat, deploy, inventory-bug, glide-aggregate, decimal-column]
dependency_graph:
  requires:
    - phase: 05-01
      provides: HistoryView.tsx, navigation wiring (TopNav, HomeView)
    - phase: 05-02
      provides: edit modal fully wired (handleEditSave, populateEditForm)
    - phase: 05-03
      provides: delete flow (handleDelete, confirmation modal, both entry points)
  provides:
    - Phase 5 deployed and verified on the live instance
    - Two production bug fixes for bean inventory computation
  affects: [Phase 6 — Analytics depends on accurate brew_log + stock data]
tech-stack:
  added: []
  patterns:
    - "GlideRecord scan + JS sum as workaround for unreliable GlideAggregate.SUM on DecimalColumn"
    - "Diagnostic-style endpoint probing: temporarily expose intermediate counts in API response for live debugging"
key-files:
  created:
    - .planning/phases/05-brew-history-management/05-04-SUMMARY.md
  modified:
    - .planning/ROADMAP.md
    - .planning/STATE.md
    - src/server/bean-stock-handler.ts
key-decisions:
  - "GlideAggregate.addAggregate('SUM', 'dose_weight_g') returns 0 on DecimalColumn fields in scoped apps even when records exist with non-null values — confirmed via diagnostic probe. Workaround: GlideRecord scan with JS-side sum."
  - "Phase 2's commented-out brew depletion query was a hidden TODO that survived two phases. Phase boundary reviews should grep for 'Phase X+' or 'TODO' comments referencing future phase numbers."
  - "Inline diagnostic endpoint probing (returning intermediate counts in API response) is highly effective for debugging server-side aggregation issues without instance log access."
requirements-completed:
  - BREW-10
  - BREW-11
  - RPT-01
duration: ~90min (deploy 5min + UAT 30min + bug fix iterations 55min)
completed: "2026-05-07"
---

# Phase 5 Plan 04: Deploy + UAT Summary

## Outcome

Phase 5 (Brew History & Management) deployed to https://dev203275.service-now.com and **APPROVED** by human UAT with the non-admin `aibrew_user` account. All 25 functional UAT steps passed across BREW-10, BREW-11, and RPT-01.

## Tasks

| # | Task | Status |
|---|------|--------|
| 1 | Build and deploy Phase 5 | ✓ Complete |
| 2 | Full UAT — non-admin aibrew_user (BREW-10, BREW-11, RPT-01) | ✓ Approved |
| 3 | Mark Phase 5 complete in ROADMAP.md | ✓ Complete |

## What was built

Plan 04 itself produced no source changes — it deployed and verified the work from Plans 01-03:

- **HistoryView.tsx** (775 lines) — paginated brew history list, edit modal, delete confirmation
- **Three navigation wires** — app.tsx routes `?view=history`, TopNav History tab enabled, HomeView History tile active
- All `npx @servicenow/sdk build` checks passed; deploy completed without error.

## UAT-discovered production bugs (fixed during UAT)

The bean inventory stock figure was not updating after brew submissions or deletions — RPT-01 step 20 / BREW-11 step 20 / and brew submission flow all failed initially. Two layered bugs were diagnosed and fixed during UAT:

### Bug 1 — Brew depletion query commented out (commit `83a3697`)

**Root cause:** `src/server/bean-stock-handler.ts` had the `GlideAggregate` query for brew depletion commented out with a `// Phase 4+: subtract brew depletions` note. This was intentionally deferred during Phase 2 since the `brew_log` table didn't exist yet. With `totalUsed = 0` hardcoded, the stock endpoint always returned `purchases` with no deductions.

**Fix:** Uncommented the `GlideAggregate` query against `x_664529_aibrew_brew_log` summing `dose_weight_g` filtered by `bean = {sysId}`. Also changed `parseInt` → `parseFloat` since `dose_weight_g` is a `DecimalColumn`.

### Bug 2 — `GlideAggregate.SUM` returns 0 on DecimalColumn (commit `b42911a`)

After Fix 1 deployed, stock STILL didn't update. A diagnostic probe was temporarily added to the endpoint that returned both the production aggregate result AND a parallel `GlideRecord` scan for comparison.

**Diagnostic output (bean `20f0778683e88710be419629feaad30f`, 6 brew records):**

| Path | Records found | Sum of dose |
|------|--------------|-------------|
| `GlideRecord` scan (probe)         | 6 | 64g ✓ |
| `GlideAggregate.SUM` (production)  | 3 | 0g ✗ |

The probe confirmed the brew records had the bean reference correctly populated (all 6 sample values matched). The `GlideAggregate` path was the bug — SUM returned 0 even with records present.

**Fix:** Replaced the brew aggregate with a direct `GlideRecord` scan summing `dose_weight_g` in JS. At home-brew volumes (hundreds of records max) the cost is negligible; at scale a different aggregation strategy would be needed.

**Final handler shape:**

```typescript
const brewScan = new GlideRecord('x_664529_aibrew_brew_log')
brewScan.addQuery('bean', beanSysId)
brewScan.query()
let totalUsed = 0
while (brewScan.next()) {
  const dose = brewScan.getValue('dose_weight_g')
  if (dose) totalUsed += parseFloat(dose)
}
```

## Lessons learned

- **GlideAggregate SUM is unreliable on DecimalColumn fields in scoped apps.** Use `GlideRecord` scan + JS sum unless dataset size makes it impractical. This contradicts the Phase 2 architectural decision to use `GlideAggregate` for inventory — but `GlideAggregate` works fine on `IntegerColumn` (purchases use `grams` IntegerColumn and aggregate correctly). Document for any future decimal aggregations.
- **Cross-phase TODOs survive too long.** The `// Phase 4+:` comment in Phase 2 code went unaddressed through Phase 3 and Phase 4 because nothing forced a review. Phase planning should grep for forward-referencing TODOs in dependent files.
- **Diagnostic-style endpoint probing is effective.** Temporarily extending an API response with intermediate counts (`agg_brew_count`, `probe_brew_count`, `probe_bean_values_sample`) made the bug obvious without needing instance log access. Keep this pattern in the toolkit for future production debugging.
- **Human UAT with non-admin caught what automated checks missed.** This bug would have shipped if Plan 04 hadn't required hands-on testing of the full submit/delete/check-stock loop. Validates the CLAUDE.md requirement that every phase ends with non-admin UAT.

## Commits

- `0993b59` feat(05-01): wire History tab navigation and home tile
- `242b4b3` feat(05-01): add HistoryView with paginated brew list, cards, edit modal, delete confirm
- `2f02389` docs(05-01): complete History navigation wiring + HistoryView plan
- `88c771c` docs(05-02): complete edit modal plan — verified complete from Plan 01 delivery
- `8d1ccf0` feat(05-03): wire delete flow — handleDelete, confirmation modal, both entry points
- `e60a3a8` docs(05-03): complete delete flow plan — BREW-11 verified, both entry points wired
- `83a3697` fix(05): enable brew depletion in bean stock calculation
- `b42911a` fix(05): switch brew dose sum to GlideRecord scan

## Requirements

- ✓ BREW-10 — User can edit any past brew (edit modal, PATCH save, list refresh)
- ✓ BREW-11 — User can delete any past brew (confirmation modal, hard DELETE, stock recovers)
- ✓ RPT-01 — User can view all past brews in reverse-chronological order (paginated cards)

## ACL Gate

Verified: `aibrew_user` (non-admin) can read, edit, and delete brew_log records via the deployed ACLs from Phase 4. No platform-level escalation required.
