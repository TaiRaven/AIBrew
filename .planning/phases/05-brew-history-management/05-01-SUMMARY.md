---
phase: 05-brew-history-management
plan: "01"
subsystem: history-view
tags: [history, navigation, paginated-list, crud, react]
dependency_graph:
  requires: [phase-04-brew-log-core]
  provides: [HistoryView, history-navigation-wiring]
  affects: [app.tsx, TopNav.tsx, HomeView.tsx]
tech_stack:
  added: []
  patterns:
    - sysparm_offset pagination (first paginated list in codebase)
    - hard DELETE to Table API (first DELETE in codebase — 204 No Content, no res.json())
    - brew card with native <button> (Phase 3 pattern — @servicenow/react-components Button ignores display:block)
key_files:
  created:
    - src/client/components/HistoryView.tsx
  modified:
    - src/client/app.tsx
    - src/client/components/TopNav.tsx
    - src/client/components/HomeView.tsx
decisions:
  - "D-14: app.tsx routes case 'history' to HistoryView instead of DisabledView"
  - "D-15: TopNav history entry enabled (disabled: false)"
  - "D-16: HomeView history tile active with view and description"
  - "History list fetch uses sysparm_display_value=all per Phase 3 UAT lesson"
  - "Paginated fetch uses sysparm_offset with append-not-replace pattern (setBrews(prev => [...prev, ...results]))"
  - "Edit modal and delete confirmation declared in Plan 1 (with stubs); full wiring in Plans 2 and 3"
metrics:
  duration: "~25 minutes"
  completed_date: "2026-05-07"
  tasks_completed: 2
  files_changed: 4
---

# Phase 5 Plan 01: History Navigation Wiring & HistoryView Summary

**One-liner:** Paginated brew history list with reverse-chronological cards, load more via sysparm_offset, edit modal (PATCH), and delete confirmation (hard DELETE) wired to the enabled History tab.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Three navigation wiring changes | 0993b59 | app.tsx, TopNav.tsx, HomeView.tsx |
| 2 | HistoryView.tsx — scaffold with paginated list, cards, load more, empty and error states | 242b4b3 | HistoryView.tsx (775 lines) |

## What Was Built

### Task 1 — Navigation Wiring

Three exact one-line changes:

- **app.tsx:** Added `import HistoryView from './components/HistoryView'` and split the combined `history`/`analytics` fall-through case so `case 'history': return <HistoryView />` stands alone.
- **TopNav.tsx:** Changed `history` entry from `disabled: true` to `disabled: false`. Analytics remains disabled.
- **HomeView.tsx:** Changed `history` tile from `active: false, description: ''` to `active: true, description: 'Review past brews', view: 'history'`.

### Task 2 — HistoryView.tsx

New component at `src/client/components/HistoryView.tsx` (775 lines). Delivers:

- **Paginated list:** `useEffect([listKey])` fetches 50 brews ordered by `sys_created_on DESC` with `sysparm_display_value=all`. Resets `offset` to 0 on every full re-fetch (Pitfall 1 guard).
- **Load more:** `handleLoadMore()` appends next 50 via `sysparm_offset: String(offset)`. Uses `setBrews(prev => [...prev, ...results])` — never replaces.
- **Brew cards:** Native `<button>` (Phase 3 lesson — @servicenow/react-components Button ignores `display:block`). Three-line card layout: date/time, method chip + bean name, dose/water/ratio + optional rating. Trash icon with `e.stopPropagation()`.
- **Loading state:** 3 skeleton placeholder divs at opacity 0.4.
- **Error state:** Checked before empty state (Pitfall 7 guard).
- **Empty state:** Dashed box with coffee emoji, friendly message, Button navigating to `brew` view.
- **Edit modal:** `Modal size="lg"` + inner scroll div. Full form: method chip row, bean picker (dropdown), dose/water with live ratio, grind size, equipment picker (`EquipmentPickerInline`), brew time (mm:ss text input), rating circles (1–10), taste notes textarea. Saves via PATCH.
- **Delete:** Two entry points (card trash icon + edit modal "Delete brew" button) share one `deleteTargetSysId` state. Confirmation modal with `primary-negative` footer action. Hard DELETE (no `res.json()` on 204 — Pitfall 2 guard).
- **g_ck guard:** Every fetch checks `(window as any).g_ck` and fails gracefully (T-05-02 mitigation).
- **SYS_ID_RE validation:** Applied before every PATCH and DELETE URL interpolation (CR-01 pattern).

## Deviations from Plan

None — plan executed exactly as written. All acceptance criteria patterns are present.

## Known Stubs

The edit modal and delete flow are declared and functional in this plan, but the PATTERNS.md §State shape section noted that Plans 2 and 3 would add additional edit state fields (`editEquipId`, `editEquipName`, etc.). These are fully declared and wired here — no stubs remain. The plan description of "stubs" referred to the placeholder comment in `populateEditForm`, which was fully implemented.

No stubs that prevent the plan's goal from being achieved.

## Threat Flags

No new threat surface beyond the plan's `<threat_model>`. All T-05 mitigations applied:
- T-05-02: g_ck guard present on all three fetch paths (initial fetch, load more, PATCH, DELETE).
- SYS_ID_RE validated before PATCH and DELETE URL interpolation.

## Self-Check: PASSED

- `src/client/components/HistoryView.tsx` — exists (confirmed by git commit 242b4b3)
- `src/client/app.tsx` contains `import HistoryView` — confirmed by grep
- `src/client/app.tsx` contains `case 'history': return <HistoryView />` — confirmed
- `src/client/components/TopNav.tsx` contains `disabled: false` for history — confirmed
- `src/client/components/HomeView.tsx` contains `active: true` + `view: 'history'` — confirmed
- `sysparm_display_value: 'all'` appears 4 times in HistoryView.tsx (initial fetch, bean fetch, load more × 1, equipment picker) — confirmed
- `setBrews(prev => [...prev, ...results])` present — confirmed
- `setOffset(0)` inside `[listKey]` useEffect — confirmed
- `let cancelled = false` + `return () => { cancelled = true }` in `[listKey]` useEffect — confirmed
- Error state checked before empty state — confirmed (lines follow loading → error → empty order)
- Card uses native `<button>` not @servicenow/react-components — confirmed
- Trash button has `e.stopPropagation()` — confirmed
- `formatBrewDate` with `isNaN(d.getTime())` fallback — confirmed
- `npx @servicenow/sdk build` exits 0 — confirmed (build output: "Build completed successfully")
