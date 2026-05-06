---
phase: 4
plan: "04-04"
title: "Below-Fold Fields + Submit Handler + Confirmation Banner"
subsystem: brew-log-form
tags: [brew-log, submit, rating, taste-notes, equipment, confirmation]
dependency_graph:
  requires: [04-03]
  provides: [handleSubmit, below-fold-fields, confirmation-banner, EquipmentPickerInline]
  affects: [BrewView.tsx]
tech_stack:
  added: []
  patterns:
    - g_ck CSRF guard before any fetch POST (ASVS L1 V3)
    - Integer null coercion for IntegerColumn fields (grind_size, brew_time_seconds, rating)
    - Native button rating widget (tap-to-select, re-tap-to-deselect)
    - EquipmentPickerInline helper component above main export with React.useState/useEffect
    - showConfirmation in-place banner (no route change on submit)
    - submittedBrew capture for 04-05 save-as-preset (bean+taste_notes excluded per D-17)
key_files:
  created: []
  modified:
    - src/client/components/BrewView.tsx
decisions:
  - "EquipmentPickerInline declared above BrewView export — uses React.useState/useEffect (not destructured useState) since it is outside the main component scope but within the same file"
  - "Rating widget uses native <button> elements (not @servicenow/react-components Button) — Phase 3 lesson: Button ignores border-radius: 50% in circle layout"
  - "handleSubmit placed between resetForm and return() — all state consumed by the handler was declared in 04-03, no new state added in this plan"
  - "recipe field sent as selectedPresetSysId || null — null when Use last used (D-09 compliant)"
metrics:
  duration: "~25 minutes"
  completed: "2026-05-06"
  tasks_completed: 3
  files_modified: 1
---

# Phase 4 Plan 04: Below-Fold Fields + Submit Handler + Confirmation Banner

**One-liner:** Complete brew submit flow with g_ck CSRF guard, integer-safe POST body, 10-button rating widget, taste-notes textarea, EquipmentPickerInline helper, and in-place showConfirmation banner — all wired into BrewView.tsx which grows from 515 to 748 lines.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 04-04-01 | Add handleSubmit handler to BrewView.tsx | 7aff4f0 | src/client/components/BrewView.tsx |
| 04-04-02 | Replace below-fold placeholder with rating, taste notes, equipment, Save Brew + confirmation banner | 8e3c851 | src/client/components/BrewView.tsx |
| 04-04-03 | Smoke test on live instance (build + install verified; UI steps documented) | (see below) | — |

## What Was Built

### handleSubmit (Task 04-04-01)

- **Validation gate:** method and bean are required before POST; inline error shown if missing.
- **g_ck CSRF guard:** `const g_ck = (window as any).g_ck; if (!g_ck) { setError(...); return }` — returns early if session token missing. Matches BeanSection.tsx handleAddBeans pattern exactly.
- **POST body type safety:**
  - `grind_size`: `typeof grindSize === 'number' ? grindSize : null` (IntegerColumn — never a string)
  - `brew_time_seconds`: `elapsed > 0 ? elapsed : null` (IntegerColumn — null if timer not used)
  - `rating`: `rating || null` (state is `number | null` — never coerced through string)
  - `taste_notes`: `tasteNotes.trim() || null` (trimmed string or null)
  - `recipe`: `selectedPresetSysId || null` (null when "Use last" — D-09 compliant)
- **On success:** `setSubmittedBrew(...)` captures method/equipment/dose/water/grind for 04-05 save-as-preset (bean and taste_notes explicitly excluded per D-17). `setListKey(k => k + 1)` hooks Phase 5 history refresh. `setShowConfirmation(true)` shows banner without any route change.

### Below-fold UI (Task 04-04-02)

**EquipmentPickerInline:** Helper component declared above `export default function BrewView`. Uses `React.useState`/`React.useEffect` (not destructured, since it's outside the main component). On mount: fetches `x_664529_aibrew_equipment?sysparm_query=active=true&sysparm_display_value=all`. Uses `display()`/`value()` from `../utils/fields` for field access. Renders a native `<select>` styled with full-width, minHeight 44px.

**Rating widget (D-15/BREW-08):** 10 native `<button>` circles in a flexWrap row. Each circle: 40×40px, border-radius 50%. Tap selects (accent fill), re-tap deselects (transparent). State: `number | null`.

**Taste notes (BREW-09):** `<textarea>` rows=3, maxLength=500, resize:vertical. Value bound to `tasteNotes` state.

**Equipment picker:** Renders `EquipmentPickerInline` with `value={equipmentSysId}` and `onChange` that updates both `equipmentSysId` and `equipmentName` (display name used for grind sub-label above the fold).

**Save Brew button:** `@servicenow/react-components Button`, variant="primary", full-width (width: 100%), minHeight: 44px. Shows "Saving…" when `submitting` is true.

**Confirmation banner (D-16):** Added as a sibling block BEFORE the `{!showConfirmation && (` form wrapper. Shows "Brew saved! ✓" with two buttons: "Save as preset" (`setShowSavePreset(true)` — wired to 04-05) and "Done" (`resetForm()`).

### Smoke Test (Task 04-04-03)

`npx @servicenow/sdk build` — exit 0 (Build completed successfully, 317,972 bytes bundle)
`npx @servicenow/sdk install` — exit 0 (Installation completed to dev203275.service-now.com)

The following steps cannot be automated from this agent and require manual UI verification:

1. Navigate to `?view=brew` — form opens blank
2. Select method chip (e.g. Espresso) — chip highlights with accent border + fill
3. Select a bean from the picker
4. Enter dose 18g, water 300g — ratio shows "1:16.7"
5. Enter grind size 20
6. Start timer, let run 5 seconds, stop — shows "0:05"
7. Scroll below fold — rating circles (10), taste notes textarea, equipment picker, Save Brew button visible
8. Select rating 7 — circle fills accent
9. Enter taste notes "Bright and clean"
10. Tap Save Brew — button shows "Saving…" then confirmation banner "Brew saved! ✓" appears
11. Banner shows "Save as preset" and "Done" buttons
12. Check BeanSection — selected bean's stock bar decremented by 18g (GlideAggregate auto-reads dose_weight_g from brew_log)
13. Tap Done — form resets to blank; "Use last" visible in preset strip

Expected brew_log record: method=espresso, bean=\<sysId\>, dose_weight_g=18, water_weight_g=300, grind_size=20, brew_time_seconds=5, rating=7, taste_notes="Bright and clean", recipe=null (no preset selected)

## Acceptance Criteria Verified

- `handleSubmit` present in BrewView.tsx: yes (line 316)
- `X-UserToken: g_ck` header on POST: yes (line 351)
- `setShowConfirmation(true)` after POST success: yes (line 369)
- `selectedPresetSysId || null` for recipe field: yes (line 344)
- `brew_time_seconds: elapsed > 0 ? elapsed : null`: yes (line 340)
- `Array.from({ length: 10 }` rating widget: yes (line 672)
- `setRating(rating === n ? null : n)` tap-to-deselect: yes (line 675)
- `<textarea` with tasteNotes value: yes (lines 700-701)
- "Save Brew" / "Saving…" button text: yes (line 741)
- `showConfirmation` — 3 occurrences (state declaration, banner condition, !showConfirmation form guard): yes
- "Brew saved! ✓" in banner: yes (line 390)
- "Save as preset" in banner: yes (line 398)
- `EquipmentPickerInline` declared above BrewView: yes (line 59)
- `EquipmentPickerInline` used in form JSX: yes (line 724)
- `npx @servicenow/sdk build` exits 0: yes
- `npx @servicenow/sdk install` exits 0: yes (deployed to dev203275.service-now.com)

## Deviations from Plan

None — plan executed exactly as written. The `tasteNotes`+`textarea` acceptance check (`grep "tasteNotes" ... | grep "textarea"`) returns no match because they are on adjacent lines rather than the same line — this is a grep artifact, not a code issue. The textarea renders `value={tasteNotes}` correctly on line 701 inside the `<textarea>` element opened on line 700.

## Known Stubs

None introduced in this plan. The "Save as preset" button sets `showSavePreset(true)` but the modal UI for that flow is plan 04-05's responsibility (the state variable `showSavePreset` was pre-declared in 04-03). This is intentional and tracked in the plan sequence.

## Threat Flags

No new security-relevant surface beyond the plan's threat model. The POST to `x_664529_aibrew_brew_log` follows the same g_ck guard pattern as all prior mutating fetches. The `EquipmentPickerInline` fetch is a scoped read with no user-controlled filter injection (query is hardcoded to `active=true`).

## Self-Check: PASSED

- src/client/components/BrewView.tsx: FOUND (748 lines)
- Commit 7aff4f0: FOUND (feat(04-04): add handleSubmit handler to BrewView with g_ck guard and brew POST)
- Commit 8e3c851: FOUND (feat(04-04): add below-fold fields, EquipmentPickerInline, and confirmation banner)
- SDK build: PASSED (Build completed successfully)
- SDK install: PASSED (Installation completed to dev203275.service-now.com)
