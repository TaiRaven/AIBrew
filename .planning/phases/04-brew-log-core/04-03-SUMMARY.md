---
phase: 4
plan: "04-03"
title: "Form Core — Method Chips, Bean Picker, Dose/Water/Ratio, Grind Size, Timer"
subsystem: brew-log-form
tags: [brew-log, form, timer, preset, ratio]
dependency_graph:
  requires: [04-01, 04-02]
  provides: [above-fold-form, method-chips, bean-picker, live-ratio, timer, preset-strip]
  affects: [BrewView.tsx]
tech_stack:
  added: []
  patterns:
    - useRef setInterval timer with unmount cleanup
    - sysparm_display_value=all on all on-mount Table API fetches
    - cancelled flag pattern for async fetch cleanup
    - native <button> for chip/card rows (not @servicenow/react-components Button)
    - computed ratio never stored (BREW-07)
key_files:
  created: []
  modified:
    - src/client/components/BrewView.tsx
decisions:
  - "Native <button> used for method chips and preset list cards — @servicenow/react-components Button does not work well in flex chip rows (Phase 3 lesson)"
  - "Bean picker is a plain <select> — sufficient for the active bean list, consistent with form simplicity goal"
  - "Timer manual entry parses both mm:ss and plain-seconds formats on blur"
  - "applyPreset leaves beanSysId unchanged — presets are bean-agnostic per Phase 3 D-01"
  - "applyLastBrew does NOT set selectedPresetSysId — Use last is not a preset selection (D-09)"
metrics:
  duration: "~20 minutes"
  completed: "2026-05-06"
  tasks_completed: 2
  files_modified: 1
---

# Phase 4 Plan 03: Form Core — Method Chips, Bean Picker, Dose/Water/Ratio, Grind Size, Timer

**One-liner:** Above-fold brew form with 5 interactive rows — method chip strip, bean select, live dose/water/ratio, integer grind, and useRef stopwatch timer with manual entry — all wired to three on-mount Table API fetches with sysparm_display_value=all.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 04-03-01 | State, fetches, timer logic, stub JSX return | d152a31 | src/client/components/BrewView.tsx |
| 04-03-02 | Full above-fold form JSX | 6ca3e98 | src/client/components/BrewView.tsx |

## What Was Built

### Above-fold form (5 interactive rows — PLAT-03 confirmed)

1. **Method chip row** — 7 native button chips in a horizontally scrollable flex row. Tap selects (accent border + fill), re-tap deselects. Keys match brew-log.now.ts ChoiceColumn choices exactly (espresso, pour_over, aeropress, french_press, moka_pot, cold_brew, other).

2. **Bean picker** — `<select>` element populated from on-mount fetch of active beans. Uses `display(b.name)` for labels and `value(b.sys_id)` for option values. Blank default option.

3. **Dose / live ratio / water row** — Side-by-side number inputs with a live ratio label between them. Ratio is computed on every keystroke (`waterG / doseG`, toFixed(1)), never stored. Shows `1:—` when either field is empty.

4. **Grind size** — `type="number"` with `parseInt(e.target.value, 10)` (IntegerColumn requirement). Label shows equipment name as sub-label when a preset with equipment is active.

5. **Timer** — `useRef<ReturnType<typeof setInterval>>` holds the interval handle. Start counts up, Stop freezes display. Tap the stopped display to enter time manually (mm:ss or plain seconds, parsed on blur). Unmount cleanup useEffect with empty deps array clears the interval on navigate-away.

### Preset strip (above 5 rows, outside 6-field budget)

- Shows "No preset" or "Using: [name]" with a × clear button
- "Pick one" expands a scrollable list of active presets; each card is a native button
- applyPreset fills method, equipment (sysId + display name for grind sub-label), dose, water, grind — leaves bean unchanged
- "Use last" button visible only when lastBrewAvailable is true (hidden on first-ever load, D-08)
- applyLastBrew copies method, bean, dose, water, grind — does not set selectedPresetSysId (D-09)

### On-mount fetches

All three fetches include `sysparm_display_value: 'all'`:
- `/api/now/table/x_664529_aibrew_bean` — active beans, fields: sys_id, name
- `/api/now/table/x_664529_aibrew_recipe` — active presets, fields: sys_id, name, method, equipment, dose_weight_g, water_weight_g, grind_size
- `/api/now/table/x_664529_aibrew_brew_log` — most recent brew (ORDERBYDESCDESC sys_created_on, limit 1), fields: sys_id, method, bean, dose_weight_g, water_weight_g, grind_size

All use the `cancelled` flag pattern to prevent state updates after component unmount.

### Constants added

- `METHOD_CHOICES` — 7 entries matching brew-log.now.ts ChoiceColumn
- `SYS_ID_RE = /^[0-9a-f]{32}$/i` — for sysId validation before POST (used in 04-04)
- `BREW_LOG_TABLE`, `RECIPE_TABLE`, `BEAN_TABLE` — scoped table name constants

### Below-fold state pre-declared

`rating`, `tasteNotes`, `equipmentSysId`, `equipmentName`, `submitting`, `error`, `showConfirmation`, `submittedBrew`, `showSavePreset`, `presetName`, `presetNameError`, `listKey` — all declared in this file for plan 04-04 to extend without merge conflicts.

## Acceptance Criteria Verified

- `METHOD_CHOICES` present: yes
- `intervalRef` present with useRef: yes
- `sysparm_display_value.*all` — 3 occurrences (one per fetch): yes
- `ORDERBYDESCsys_created_on` present: yes
- `clearInterval` — 3 occurrences (cleanup useEffect, handleStop, resetForm): yes
- `applyPreset`, `applyLastBrew`, `resetForm` all present: yes
- `selectedPresetSysId` present: yes
- `METHOD_CHOICES.map` in JSX: yes
- `Select bean` placeholder in select: yes
- `formatTime` used in JSX: yes
- `handleStart`, `handleStop` wired to timer buttons: yes
- `applyLastBrew` wired to Use last button: yes
- `lastBrewAvailable` conditional visibility: yes
- `applyPreset` wired to preset list cards: yes
- `npx @servicenow/sdk build` exits 0: yes
- `npx @servicenow/sdk install` exits 0: yes (deployed to dev203275.service-now.com)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

**Intentional — planned for 04-04:**
- Below-fold fields (rating, taste notes, equipment picker, submit button) replaced by a placeholder div. This is explicitly called out in the plan and the JSX comment. Plan 04-04 depends on 04-03 and replaces this placeholder.

## Threat Flags

No new security-relevant surface introduced beyond what the plan's threat model covers. The three Table API reads are scoped reads with no user-controlled filter injection. `SYS_ID_RE` constant is defined here for 04-04's POST path.

## Self-Check: PASSED

- src/client/components/BrewView.tsx: FOUND (515 lines)
- Commit d152a31: FOUND (feat(04-03): add BrewView state, fetches, timer logic, and stub JSX return)
- Commit 6ca3e98: FOUND (feat(04-03): implement BrewView full above-fold form JSX)
- SDK build: PASSED (Build completed successfully)
- SDK install: PASSED (Installation completed)
