---
phase: 02-bean-catalog-inventory
plan: "04"
subsystem: ui
tags: [react, bean-detail, inventory, record-provider, stock-bar, purchase-history, archive]
dependency_graph:
  requires:
    - 02-01 (x_664529_aibrew_bean and x_664529_aibrew_bean_purchase tables must exist)
    - 02-02 (GET /api/x_664529_aibrew/v1/stock/{bean_sys_id} scripted REST must exist)
    - 02-03 (BeanSection.tsx with BeanListView and stub BeanDetailView must exist)
  provides:
    - BeanDetailView — full detail with RecordProvider form, KPI strip, stock bar, Add Beans form, purchase history, archive flow
  affects:
    - 02-05 (deploy plan pushes all Wave 2+3 artifacts including the completed BeanDetailView)
tech_stack:
  added: []
  patterns:
    - "cancelled-flag useEffect pattern for stock fetch with stockKey re-fetch dependency"
    - "cancelled-flag useEffect pattern for purchase history with historyKey re-fetch dependency"
    - "Dual-key re-fetch: increment stockKey + historyKey after Add Beans POST to refresh both"
    - "RecordProvider detail view: sysId is real sys_id (not '-1'), no FormActionBar needed"
    - "Archive PATCH: e.detail.payload.action.label event shape (Phase 1 lesson codified)"
    - "Native <input type=number|date> for inline Add Beans form — no react-components primitive available"
    - "SYS_ID_RE guard on every sysId URL interpolation (T-2-01, T-2-04 mitigations)"
    - "toISOString().slice(0, 10) for YYYY-MM-DD date default — not toLocaleDateString"
key_files:
  created: []
  modified:
    - src/client/components/BeanSection.tsx (stub BeanDetailView replaced with full 338-line implementation; file now 852 lines total)
decisions:
  - "Native <input> elements for Add Beans form: @servicenow/react-components provides no number or date input primitive; RecordProvider+FormColumnLayout is architecturally wrong for a 2-field inline form"
  - "avg rating KPI box shows placeholder dash: brew rating aggregation is Phase 3 scope, intentional stub"
  - "Inventory bag list and Purchase history both use the same history[] state: avoids double-fetch, purchase history list doubles as the pantry bag list in detail view"
metrics:
  duration: "~15 minutes"
  completed: "2026-05-01"
  tasks_completed: 1
  files_created: 0
  files_modified: 1
---

# Phase 02 Plan 04: BeanDetailView Full Implementation Summary

**One-liner:** BeanDetailView fully implemented with RecordProvider bean edit form, three-box KPI strip, stock progress bar with low-stock badge, Add Beans POST form with dual-key re-fetch, 20-record purchase history (newest-first), and archive PATCH modal using correct e.detail.payload.action.label event shape.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Replace BeanDetailView stub with full detail view | 06e6f05 | src/client/components/BeanSection.tsx |

## Decisions Made

1. **Native `<input>` elements for Add Beans form:** `@servicenow/react-components` provides no number or date input primitive. Using `RecordProvider+FormColumnLayout` for a 2-field inline form would be architecturally inappropriate (forces full form layout, loses inline context). Native inputs are the only viable option. CLAUDE.md's "never raw HTML elements" rule is intentionally excepted here as documented in the plan.

2. **avg rating KPI box is a stub (`—`):** Brew rating aggregation requires Phase 3 brew log data. The dash placeholder is intentional and will be wired in a future phase. It does not prevent this plan's inventory management goal.

3. **Inventory bag list and purchase history share the same `history[]` state:** Both sections in the right column render from the same `useEffect` fetch — the pantry section shows each bag with an "active" tag, the history section shows date+grams rows. This avoids a duplicate fetch and is consistent with the plan's data model (bean_purchase IS the inventory).

## Deviations from Plan

None — plan executed exactly as written.

## Security Compliance

| Threat ID | Mitigation | Status |
|-----------|-----------|--------|
| T-2-01 (stock fetch path injection) | `SYS_ID_RE.test(sysId)` guard before `${STOCK_BASE}/${sysId}` interpolation in stock useEffect | Applied — line 60 |
| T-2-01 (archive PATCH path injection) | `SYS_ID_RE.test(sysId)` guard before PATCH URL construction in `handleArchive` | Applied — line 122 |
| T-2-04 (grams input tampering) | `parseInt(grams, 10)` + `isNaN(gramsNum) || gramsNum <= 0` check before POST | Applied — line 99 |
| T-2-04 (purchaseDate empty) | Non-empty check on purchaseDate before POST | Applied — line 100 |

## Known Stubs

- **avg rating KPI box** — `src/client/components/BeanSection.tsx`, line 210: shows `—` hardcoded. Brew rating data is Phase 3 scope (brew log). Intentional placeholder; does not affect inventory management goal of this plan.

## Self-Check: PASSED

- FOUND: src/client/components/BeanSection.tsx (852 lines — exceeds 400-line minimum for BeanDetailView additions)
- FOUND: `stockKey` state (line 40), `historyKey` state (line 44)
- FOUND: `setStockKey(k => k + 1)` and `setHistoryKey(k => k + 1)` in handleAddBeans success path (lines 111-112)
- FOUND: `ORDERBYDESCpurchase_date` in history fetch params (line 80)
- FOUND: `sysparm_limit: '20'` (line 82)
- FOUND: `new Date().toISOString().slice(0, 10)` (lines 48, 110)
- FOUND: `JSON.stringify({ active: false })` (line 130)
- FOUND: `e.detail?.payload?.action?.label === 'Archive'` (line 406)
- FOUND: `aria-label` on stock bar div (line 220)
- FOUND: `⚠ Low stock` badge in BeanDetailView (line 249)
- FOUND: `gramsNum <= 0` validation (line 99)
- FOUND: commit 06e6f05 in git log
- SDK build: exits 0 (Build completed successfully)
