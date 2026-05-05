# Phase 4: Brew Log Core - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-05
**Phase:** 4-brew-log-core
**Areas discussed:** Form layout, Preset & auto-fill, Timer design, Save-as-preset flow

---

## Form Layout

### Primary layer (≤6 fields above the fold)

| Option | Description | Selected |
|--------|-------------|----------|
| Method + bean + dose + water + grind + timer | Core brew variables + timer above fold; rating + notes scroll below | ✓ |
| Method + bean + dose + water + rating + notes | Priority on taste capture; timer + grind below fold | |
| Method + bean + dose + water + grind + rating | Rating included in primary; timer + notes below fold | |

**User's choice:** Method + bean + dose/water/ratio + grind + timer above fold. Rating, taste notes, equipment below fold.

### Preset picker placement

| Option | Description | Selected |
|--------|-------------|----------|
| Collapsible strip above the form | Compact banner row outside 6-field budget | ✓ |
| Inline field at top of form | Standard select field — pushes 6-field limit to 7 | |

**User's choice:** Collapsible strip above the form, outside the field count.

### Form entry point

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated full-screen view | Enable TopNav Brew tab + HomeView tile → ?view=brew | ✓ |
| Modal / bottom sheet from Home | Slide-up sheet overlay, same routing | |

**User's choice:** Dedicated full-screen view at `?view=brew`.

### Method chip display

| Option | Description | Selected |
|--------|-------------|----------|
| Horizontal scroll chips | 7 chips in single scrollable row, first 3–4 visible | ✓ |
| Wrapping chip grid | All 7 visible across 2–3 lines, more vertical space | |

**User's choice:** Horizontal scrollable chip row.

---

## Preset & Auto-fill

### Auto-fill (BREW-03) behavior on form open

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-fill silently on open | Fields pre-filled, strip shows "Using last brew" with × | |
| Empty form, user taps "Use last" | Form opens blank; "Use last" in strip populates fields | ✓ |

**User's choice:** Empty form; user-invoked via "Use last" button.

### "Use last" field scope

| Option | Description | Selected |
|--------|-------------|----------|
| All recipe variables + bean, excluding time and rating | Copies method, bean, dose, water, grind; starts fresh on timer/rating/notes | ✓ |
| All fields including previous rating and notes | Copies everything — user must clear rating and notes | |

**User's choice:** method, bean, dose, water, grind. Timer resets to 0:00, rating blank, taste notes blank.

### Bean field when preset selected

| Option | Description | Selected |
|--------|-------------|----------|
| Bean stays unchanged — user picks separately | Consistent with D-01 (bean-agnostic presets) | ✓ |
| Prompt to pick bean after selecting preset | Small nudge post-selection | |

**User's choice:** Bean field unchanged. User picks bean independently.

### Equipment picker placement

| Option | Description | Selected |
|--------|-------------|----------|
| Below the fold, pre-filled by preset | Equipment auto-populated from preset; scroll to override | ✓ |
| Inline above the fold, between bean and dose | Visible primary field; requires expanding 6-field budget | |

**User's choice:** Below the fold, auto-filled by preset.

---

## Timer Design

### Timer interaction type

| Option | Description | Selected |
|--------|-------------|----------|
| Live stopwatch with Start/Stop | 0:00 display counting up; tap stopped display to enter manually | ✓ |
| Simple number entry | Text field for seconds, user types manually | |

**User's choice:** Live stopwatch. ▶ Start → ■ Stop. Tap display when stopped to type manually.

### Timer persistence

| Option | Description | Selected |
|--------|-------------|----------|
| Timer resets on view unmount | React component state only; navigating away resets | ✓ |
| Timer persists via localStorage | Reconstruct elapsed time on mount from saved timestamp | |

**User's choice:** Resets on navigation. Screen-off persistence stays deferred to v2 (BREW-12).

### Rating input widget

| Option | Description | Selected |
|--------|-------------|----------|
| 10 tap targets in a row (1–10) | Numbered circles, one tap selects, re-tap deselects | ✓ |
| Slider 1–10 with live label | Horizontal drag slider | |
| Number stepper (+/-) | Input + increment/decrement buttons | |

**User's choice:** 10 tap targets in a row (○ 1 through ○ 10).

---

## Save-as-preset Flow (RECIPE-01)

### Trigger point

| Option | Description | Selected |
|--------|-------------|----------|
| Post-submit confirmation with optional "Save as preset" | "Brew saved! ✓" + Save as preset + Done buttons | ✓ |
| Button on the form itself (before submit) | "Save as preset" alongside "Save Brew" | |
| From Recipes catalog after the fact | No special brew-form integration | |

**User's choice:** Post-submit confirmation banner with secondary "Save as preset" button.

### After Done

| Option | Description | Selected |
|--------|-------------|----------|
| Form resets to blank / auto-fill state | Clears; "Use last" now available pointing to just-logged brew | ✓ |
| Navigate back to Home | Route to ?view=home | |

**User's choice:** Form resets to blank. "Use last" immediately available.

---

## Claude's Discretion

- Bean picker: standard select/dropdown, same fetch/display pattern as prior sections
- Ratio display: inline with dose/water row, `water/dose` computed, `1:16.7` format
- Empty-preset edge case: hide "Pick one" from strip if no active presets exist; hide "Use last" if no brews exist yet
- "Save Brew" button: accent colour, full-width
- Required fields: method + bean minimum; toast/inline error if missing
- `recipe` sysId populated on brew_log when user picks a preset from strip; NOT set when using "Use last"
- brew_time_seconds: nullable IntegerColumn; displayed as mm:ss

## Deferred Ideas

- Brew history list (Phase 5): brew_log records created here feed Phase 5's reverse-chronological view
- Screen-off timer persistence (BREW-12): v2
- recipe reference population via "Use last": v2 / Phase 5 gap-closure
