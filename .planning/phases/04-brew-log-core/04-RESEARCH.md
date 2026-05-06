# Phase 4: Brew Log Core - Research

**Researched:** 2026-05-05
**Domain:** ServiceNow Fluent/now-sdk — hub table creation, custom React form, stopwatch timer, preset auto-fill
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Brew logging at `?view=brew` as a dedicated full-screen view. `app.tsx` DisabledView for `brew` replaced with `<BrewView />`.
- **D-02:** TopNav "Brew" tab set `disabled: false`. HomeView "Brew Log" tile set `active: true`, `view: 'brew'`, description added.
- **D-03:** Primary layer (above the fold): method chip row, bean picker, dose+water row with live ratio, grind size, timer. Exactly 5 items — satisfies PLAT-03 ≤6.
- **D-04:** Below the fold: rating (10 tap targets), taste notes textarea, equipment picker, Save Brew button.
- **D-05:** Preset strip sits above the form, outside the 6-field budget — it is a compact banner row.
- **D-06:** Method is a horizontal scrollable chip row with 7 choices: espresso, pour over, AeroPress, French press, moka pot, cold brew, other. Same ChoiceColumn values as `x_664529_aibrew_recipe.method`.
- **D-07:** Collapsible preset strip default state: `📎 No preset  ▾ Pick one  Use last`. Expand shows scrollable list. Strip shows active preset label with `×` to clear.
- **D-08:** Auto-fill is user-invoked only. Form opens blank. "Use last" provides the shortcut. Hidden if no brews exist.
- **D-09:** "Use last" copies: method, bean, dose_weight_g, water_weight_g, grind_size. Does NOT copy: brew_time_seconds, rating, taste_notes.
- **D-10:** Selecting a preset fills: method, equipment, dose_weight_g, water_weight_g, grind_size. Bean NOT touched (presets are bean-agnostic).
- **D-11:** Equipment picker below the fold. Auto-populated from selected preset's equipment reference. Grind size shows equipment name as sub-label.
- **D-12:** Live stopwatch — `0:00` counting up. Controls: Start / Stop. Tap stopped display allows manual time entry.
- **D-13:** Timer state lives in React component state only. Navigate away resets timer.
- **D-14:** `brew_time_seconds` stored as IntegerColumn (nullable). Display format: `mm:ss`.
- **D-15:** Rating: 10 tap targets (`○ 1 ... ○ 10`). Below the fold. Tap selected number to deselect (optional).
- **D-16:** Post-submit confirmation: `Brew saved! ✓` with `[ Save as preset ]` and `[ Done ]` actions.
- **D-17:** "Save as preset" modal: required `name` input + read-only display of method, equipment, dose, water, grind. Bean and taste_notes NOT copied.
- **D-18:** After Done or after saving preset, BrewView resets to blank form state.
- **D-19:** brew_log table columns: method (ChoiceColumn), bean (ReferenceColumn → bean), equipment (ReferenceColumn → equipment), dose_weight_g (DecimalColumn), water_weight_g (DecimalColumn), grind_size (IntegerColumn — NEVER string), brew_time_seconds (IntegerColumn nullable), rating (IntegerColumn 1–10 nullable), taste_notes (StringColumn optional), recipe (ReferenceColumn → recipe optional). `sys_created_on` used as brew timestamp.
- **D-20:** 4 ACLs (read/write/create/delete), type `record`, roles `[aibrew_user]`.

### Claude's Discretion

- Bean picker: standard select/dropdown, same `display()`/`value()` helper pattern. Fetch active beans with `sysparm_query=active=true`.
- Ratio display: inline label `1:16.7` style, computed as `(water / dose).toFixed(1)`.
- Empty state: hide "▾ Pick one" when no active presets; hide "Use last" when no brews exist.
- "Save Brew" button: accent colour, full-width.
- Required fields for submit: method and bean minimum. Toast/inline error if missing.
- `recipe` reference on brew_log: populated when user picks a preset from the strip. NOT set when using "Use last".

### Deferred Ideas (OUT OF SCOPE)

- Brew history list (BREW-10/11, RPT-01) — Phase 5.
- Screen-off timer persistence (BREW-12) — v2.
- Recipe reference on brew_log when using "last brew" — v2.
- Required field validation details beyond method + bean minimum.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BREW-01 | Log brew by selecting method (7 choices) | D-06 method chip row; ChoiceColumn locked values from recipe.now.ts |
| BREW-02 | Select saved recipe preset to pre-fill form | D-07/D-10 collapsible preset strip; same fetch as RecipeSection |
| BREW-03 | Auto-fill from most recent brew | D-08/D-09 "Use last" button; Table API fetch ordered by sys_created_on DESC LIMIT 1 |
| BREW-04 | Stopwatch timer with start/stop | D-12/D-13 React component state; useRef for interval, useState for seconds |
| BREW-05 | Select bean from catalog | D-11 and Claude's Discretion; fetch active beans with sysparm_display_value=all |
| BREW-06 | Dose weight, water weight, grind size inputs | D-03/D-11; DecimalColumn for weights, IntegerColumn for grind |
| BREW-07 | Live brew ratio display (not stored) | D-03; computed `(water/dose).toFixed(1)` on every dose/water change |
| BREW-08 | 1–10 rating | D-15; 10 native `<button>` tap targets, below the fold |
| BREW-09 | Free-text taste notes | D-04; StringColumn/textarea below the fold |
| PLAT-03 | ≤6 fields above the fold, mobile-optimised | D-03 5-item primary layer |
| RECIPE-01 | Save current brew as named preset post-submit | D-16/D-17; POST to recipe table with modal name input |
</phase_requirements>

---

## Summary

Phase 4 delivers the core brew logging capability — the primary value of the app. It introduces the `x_664529_aibrew_brew_log` table (the hub table referencing all prior tables), enables the Brew tab in navigation, and builds `BrewView.tsx`: a single full-screen React component with a mobile-first custom form. The form is NOT RecordProvider-based — it uses direct Table API POST because the custom interactions (chip selection, timer state, preset auto-fill, computed ratio, custom rating widget) are incompatible with the FormColumnLayout render model.

The form architecture follows a clear two-layer layout: 5 interactive controls above the fold (method chips, bean picker, dose/water/ratio row, grind size, timer) and optional enrichment fields below (rating, taste notes, equipment override). The collapsible preset strip sits above the form entirely, outside the field count. This satisfies PLAT-03 without compromise.

All implementation patterns have been verified from the existing codebase (Phases 1–3). No new libraries are required. The only new Fluent artifacts are `brew_log.now.ts` and `brew-log-acls.now.ts` — both follow the exact same patterns as recipe.now.ts and recipe-acls.now.ts. RECIPE-01 (save-as-preset) is wired here and requires one direct Table API POST to the existing recipe table.

**Primary recommendation:** Build in 5 plans: (1) Fluent table + ACLs + deploy, (2) BrewView scaffold + navigation wiring, (3) Form core (chip row, bean picker, dose/water/ratio, grind, timer), (4) Below-fold fields + submit handler + confirmation banner, (5) RECIPE-01 save-as-preset modal + UAT.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| brew_log table schema | Fluent/SDK | — | Scoped table definition — SDK-managed artifact |
| brew_log ACLs | Fluent/SDK | — | Security enforcement at platform layer |
| Navigation wiring (app.tsx, TopNav, HomeView) | Frontend (React) | — | SPA routing changes — client only |
| Brew form UI + state | Frontend (React) | — | All custom interactions live in component state |
| Preset list fetch | Frontend (React) → Table API | — | Same GET pattern as RecipeSection list |
| Bean list fetch | Frontend (React) → Table API | — | Same GET pattern as BeanSection list |
| "Use last" fetch | Frontend (React) → Table API | — | Single GET ordered by sys_created_on DESC LIMIT 1 |
| Brew submit | Frontend (React) → Table API | — | Direct POST to brew_log table |
| Save-as-preset submit | Frontend (React) → Table API | — | Direct POST to recipe table |
| Inventory depletion | Scripted REST (existing) | — | Already reads brew_log.dose_weight_g via GlideAggregate — no change needed |
| Timer logic | Frontend (React) | — | Component state only; useRef + useEffect |
| Ratio computation | Frontend (React) | — | Render-time calculation; never stored |

---

## Standard Stack

### Core (all verified from existing codebase)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@servicenow/sdk/core` | ≥4.6.0 | Table, ChoiceColumn, IntegerColumn, DecimalColumn, ReferenceColumn, StringColumn, Acl | SDK-managed artifact authoring — required for all Fluent artifacts |
| `@servicenow/react-components/Button` | Zurich | Primary action buttons, tab items | Only component library permitted; consistent with all prior phases |
| `@servicenow/react-components/Modal` | Zurich | Save-as-preset modal, error dialogs | Consistent with Phase 1–3 modal pattern |
| `react` | 18.2.0 | Component state (useState, useEffect, useRef, useCallback) | CLAUDE.md constraint — React 18.2.0 locked |

[VERIFIED: codebase — src/fluent/tables/recipe.now.ts, src/client/components/RecipeSection.tsx]

### Explicitly NOT Used for BrewView Form

| Pattern | Reason |
|---------|--------|
| `RecordProvider` + `FormColumnLayout` | Incompatible with chip selection, timer state, preset auto-fill, and custom rating widget — too much custom state to delegate to the form renderer |
| `FormActionBar` | Only useful inside RecordProvider context |

[VERIFIED: codebase — Context.md code_context note "FormActionBar save inside RecordProvider: for any RecordProvider-based form. BrewView's brew log create uses direct fetch POST"]

**Note:** RecordProvider IS still used in the save-as-preset modal if the recipe name input is a simple text field — but given that we need to control which fields are sent, a direct POST is simpler and consistent with the brew submit pattern.

---

## Architecture Patterns

### System Architecture Diagram

```
User taps "Brew" tab (TopNav) or "Brew Log" tile (HomeView)
          |
          v
  app.tsx renderContent() → case 'brew': <BrewView params={params} />
          |
          +── On mount: fetch presets (GET /api/now/table/recipe?active=true)
          |             fetch recent brew (GET /api/now/table/brew_log?ORDERBYDESC sys_created_on&LIMIT 1)
          |             fetch active beans (GET /api/now/table/bean?active=true)
          |
          v
  BrewView layout:
  ┌─────────────────────────────────┐
  │  Preset strip (collapsible)     │  ← state: presets[], selectedPreset, expanded
  ├─────────────────────────────────┤
  │  Method chip row (scrollable)   │  ← state: method string
  │  Bean picker (select)           │  ← state: beanSysId string
  │  Dose | Ratio | Water           │  ← state: doseG, waterG (ratio computed)
  │  Grind size + equipment label   │  ← state: grindSize, equipment from preset
  │  Timer display + Start/Stop     │  ← state: running, elapsed, intervalRef
  ├─────────────────────────────────┤  (fold line)
  │  Rating (10 tap targets)        │  ← state: rating nullable int
  │  Taste notes textarea           │  ← state: tasteNotes string
  │  Equipment picker (override)    │  ← state: equipmentSysId
  │  [Save Brew] button (full-width)│
  └─────────────────────────────────┘
          |
          | onSubmit: validate method + bean, POST to brew_log table
          v
  Post-submit confirmation banner:
  "Brew saved! ✓   [ Save as preset ]   [ Done ]"
          |
          +── Done → reset form state
          |
          +── Save as preset → open Modal
                    |
                    | name input + read-only field summary
                    | onSave: POST to recipe table
                    v
              Reset form state (D-18)
```

### Recommended Project Structure

```
src/
├── fluent/
│   ├── tables/
│   │   └── brew-log.now.ts        # new — hub table
│   ├── acls/
│   │   └── brew-log-acls.now.ts   # new — 4 ACLs
│   └── index.now.ts               # updated — add brew_log exports
└── client/
    └── components/
        └── BrewView.tsx           # new — full-screen brew form
    (TopNav.tsx, HomeView.tsx, app.tsx — small updates only)
```

### Pattern 1: Direct Table API POST for brew_log submit

**What:** After form validation, serialize form state to JSON and POST directly to the Table API. No RecordProvider.
**When to use:** Any form with custom UI widgets that cannot be delegated to FormColumnLayout.

```typescript
// Source: verified pattern from BeanSection.tsx handleAddBeans()
const handleSubmit = async () => {
  if (!method) { setError('Select a brew method.'); return }
  if (!beanSysId) { setError('Select a bean.'); return }
  const g_ck = (window as any).g_ck
  if (!g_ck) { setError('Session token not available — please reload.'); return }
  setSubmitting(true)
  setError('')
  try {
    const body: Record<string, unknown> = {
      method,
      bean: beanSysId,
      dose_weight_g: doseG || null,
      water_weight_g: waterG || null,
      grind_size: grindSize || null,
      brew_time_seconds: elapsed > 0 ? elapsed : null,
      rating: rating || null,
      taste_notes: tasteNotes.trim() || null,
      equipment: equipmentSysId || null,
      recipe: selectedPresetSysId || null,
    }
    const res = await fetch(`/api/now/table/x_664529_aibrew_brew_log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-UserToken': g_ck },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    setSubmittedSysId(data.result?.sys_id?.value ?? data.result?.sys_id ?? '')
    setShowConfirmation(true)
  } catch {
    setError("Couldn't save brew — try again.")
  } finally {
    setSubmitting(false)
  }
}
```

[VERIFIED: codebase — BeanSection.tsx handleAddBeans, RecipeSection.tsx archive handler]

### Pattern 2: Stopwatch Timer with useRef + useEffect

**What:** React component stopwatch. `intervalRef` holds the setInterval handle so it can be cleared. `elapsed` state counts seconds. `running` state controls Start/Stop label.
**When to use:** Any in-page timer that must be scoped to component lifetime only (D-13).

```typescript
// Source: standard React pattern [ASSUMED — not from existing codebase, but canonical React]
const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
const [elapsed, setElapsed] = useState(0)
const [running, setRunning] = useState(false)

// Cleanup on unmount — prevents memory leak / phantom ticks after navigate away
useEffect(() => {
  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }
}, [])

const handleStart = () => {
  if (running) return
  setRunning(true)
  intervalRef.current = setInterval(() => {
    setElapsed(s => s + 1)
  }, 1000)
}

const handleStop = () => {
  if (!running) return
  setRunning(false)
  if (intervalRef.current) {
    clearInterval(intervalRef.current)
    intervalRef.current = null
  }
}

// Format helper
const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
```

Key correctness point: `clearInterval` in the `useEffect` cleanup covers the navigate-away case. The `running` state being false after Stop ensures no double-interval if Start is tapped again.

[ASSUMED for the useRef/useEffect cleanup idiom — widely canonical React 18 practice]

### Pattern 3: Horizontal Scrollable Chip Row

**What:** Method selection using native `<div>` with `overflowX: auto` and `<button>` children. No @servicenow/react-components chip component exists (confirmed by checking all available component imports in existing codebase — no Chip, Tag, or Toggle is imported anywhere).
**When to use:** Any multi-value single-select row that must scroll on mobile.

```typescript
// Source: adapted from RecipeCard method chip pattern in RecipeSection.tsx
// Native <button> required (Phase 3 lesson: Button component ignores flex-direction column on style prop)
const METHOD_CHOICES = [
  { value: 'espresso',     label: 'Espresso' },
  { value: 'pour_over',    label: 'Pour Over' },
  { value: 'aeropress',    label: 'AeroPress' },
  { value: 'french_press', label: 'French Press' },
  { value: 'moka_pot',     label: 'Moka Pot' },
  { value: 'cold_brew',    label: 'Cold Brew' },
  { value: 'other',        label: 'Other' },
]

<div style={{ display: 'flex', overflowX: 'auto', gap: '8px', padding: '4px 0' }}>
  {METHOD_CHOICES.map(m => (
    <button
      key={m.value}
      onClick={() => setMethod(method === m.value ? '' : m.value)}
      style={{
        flexShrink: 0,
        padding: '6px 14px',
        borderRadius: '16px',
        border: method === m.value ? '2px solid var(--aibrew-accent)' : '2px solid var(--aibrew-ink-4)',
        background: method === m.value ? 'var(--aibrew-accent)' : 'transparent',
        color: method === m.value ? '#fff' : 'var(--aibrew-ink)',
        fontFamily: 'var(--aibrew-font-body)',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        minHeight: '44px',  // mobile tap target
      }}
    >
      {m.label}
    </button>
  ))}
</div>
```

**Critical:** ChoiceColumn values in brew_log.now.ts MUST match recipe.now.ts exactly: `pour_over`, `espresso`, `french_press`, `aeropress`, `moka_pot`, `cold_brew`, `other`. [VERIFIED: src/fluent/tables/recipe.now.ts]

### Pattern 4: Bean Picker (select dropdown)

**What:** Native `<select>` element with beans fetched from Table API. `sysparm_display_value=all` required for `display()`/`value()` helpers (Phase 3 lesson).
**When to use:** Reference field picker in a custom form.

```typescript
// Source: adapted from Phase 3 lesson in STATE.md + RecipeSection fetch pattern
const [beans, setBeans] = useState<any[]>([])

useEffect(() => {
  const g_ck = (window as any).g_ck
  const params = new URLSearchParams({
    sysparm_query: 'active=true',
    sysparm_fields: 'sys_id,name',
    sysparm_display_value: 'all',
    sysparm_limit: '100',
  })
  fetch(`/api/now/table/x_664529_aibrew_bean?${params}`, {
    headers: { Accept: 'application/json', ...(g_ck ? { 'X-UserToken': g_ck } : {}) },
  })
    .then(r => r.json())
    .then(data => setBeans(data.result || []))
    .catch(() => setBeans([]))
}, [])

<select
  value={beanSysId}
  onChange={e => setBeanSysId(e.target.value)}
  style={{ width: '100%', padding: '10px', fontSize: '16px', fontFamily: 'var(--aibrew-font-body)', minHeight: '44px' }}
>
  <option value="">— Select bean —</option>
  {beans.map(b => {
    const id = typeof b.sys_id === 'object' ? value(b.sys_id) : b.sys_id
    const name = display(b.name) || value(b.name) || ''
    return <option key={id} value={id}>{name}</option>
  })}
</select>
```

[VERIFIED: Pattern from RecipeSection.tsx (sysparm_display_value=all, sys_id object handling)]

### Pattern 5: Rating Widget (10 tap targets)

**What:** 10 native `<button>` elements rendered from an array. Selected state from comparison to rating state. Tap selected to deselect.

```typescript
// Source: no existing analog in codebase — follows Phase 3 lesson for custom card layouts
<div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
    <button
      key={n}
      onClick={() => setRating(rating === n ? null : n)}
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: rating === n ? '2px solid var(--aibrew-accent)' : '2px solid var(--aibrew-ink-4)',
        background: rating === n ? 'var(--aibrew-accent)' : 'transparent',
        color: rating === n ? '#fff' : 'var(--aibrew-ink)',
        fontFamily: 'var(--aibrew-font-body)',
        fontSize: '15px',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      {n}
    </button>
  ))}
</div>
```

[VERIFIED: Phase 3 lesson — native `<button>` for custom interactive card layouts]

### Pattern 6: "Use last" fetch

**What:** Fetch the most recent brew_log record ordered by sys_created_on DESC, limit 1. Copy fields per D-09.

```typescript
// Source: adapted from RecipeSection list fetch pattern
const fetchLastBrew = async () => {
  const g_ck = (window as any).g_ck
  const params = new URLSearchParams({
    sysparm_query: 'ORDERBYDESCsys_created_on',
    sysparm_fields: 'sys_id,method,bean,dose_weight_g,water_weight_g,grind_size',
    sysparm_display_value: 'all',
    sysparm_limit: '1',
  })
  const res = await fetch(`/api/now/table/x_664529_aibrew_brew_log?${params}`, {
    headers: { Accept: 'application/json', ...(g_ck ? { 'X-UserToken': g_ck } : {}) },
  })
  const data = await res.json()
  return (data.result || [])[0] ?? null
}
```

For "Use last" to work on first load, fetch this at mount time alongside beans and presets. If no records returned, hide the "Use last" button.

[VERIFIED: fetch pattern from RecipeSection.tsx; sysparm_query ORDERBY syntax from BeanSection.tsx purchase history fetch]

### Pattern 7: Preset Strip (collapsible banner)

**What:** A row above the method chips. Controlled by `presetExpanded` boolean state and `selectedPreset` state.

```typescript
// State
const [presetExpanded, setPresetExpanded] = useState(false)
const [selectedPreset, setSelectedPreset] = useState<any | null>(null)

// Apply preset to form
const applyPreset = (preset: any) => {
  setMethod(value(preset.method) || '')
  setEquipmentSysId(value(preset.equipment) || '')
  setDoseG(parseFloat(value(preset.dose_weight_g) || '0') || 0)
  setWaterG(parseFloat(value(preset.water_weight_g) || '0') || 0)
  setGrindSize(parseInt(value(preset.grind_size) || '0', 10) || 0)
  setSelectedPreset(preset)
  setSelectedPresetSysId(typeof preset.sys_id === 'object' ? value(preset.sys_id) : preset.sys_id)
  setPresetExpanded(false)
}
```

Strip layout: `display: flex, alignItems: center, gap: 8px`. Label area shows preset name if selected, else "No preset". Clear button (`×`) appears when preset active.

[VERIFIED: pattern derived from RecipeSection RecipeCard + collapsible state, D-07 confirmed design]

### Pattern 8: Save-as-preset Modal (RECIPE-01)

**What:** Post-submit modal with a controlled name input and a direct POST to the recipe table.

```typescript
// Source: follows recipe table schema from src/fluent/tables/recipe.now.ts
const handleSaveAsPreset = async () => {
  if (!presetName.trim()) { setPresetNameError('Name is required.'); return }
  const g_ck = (window as any).g_ck
  if (!g_ck) return
  const body = {
    name: presetName.trim(),
    method: submittedBrew.method,
    equipment: submittedBrew.equipment || null,
    dose_weight_g: submittedBrew.dose_weight_g || null,
    water_weight_g: submittedBrew.water_weight_g || null,
    grind_size: submittedBrew.grind_size || null,
    active: true,
  }
  const res = await fetch(`/api/now/table/x_664529_aibrew_recipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-UserToken': g_ck },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  setShowSavePreset(false)
  resetForm()
}
```

[VERIFIED: recipe table field names from src/fluent/tables/recipe.now.ts — name, method, equipment, dose_weight_g, water_weight_g, grind_size, active]

### Pattern 9: Fluent brew_log Table Definition

**What:** New hub table following the exact same pattern as recipe.now.ts.

```typescript
// Source: verified pattern from src/fluent/tables/recipe.now.ts
import '@servicenow/sdk/global'
import {
  Table, StringColumn, ChoiceColumn, ReferenceColumn,
  IntegerColumn, DecimalColumn,
} from '@servicenow/sdk/core'
import { x_664529_aibrew_bean }      from './bean.now'
import { x_664529_aibrew_equipment } from './equipment.now'
import { x_664529_aibrew_recipe }    from './recipe.now'

export const x_664529_aibrew_brew_log = Table({
  name: 'x_664529_aibrew_brew_log',
  label: 'Brew Log',
  display: 'sys_created_on',
  schema: {
    method:           ChoiceColumn({
                        label: 'Method',
                        choices: {
                          pour_over:    { label: 'Pour Over' },
                          espresso:     { label: 'Espresso' },
                          french_press: { label: 'French Press' },
                          aeropress:    { label: 'AeroPress' },
                          moka_pot:     { label: 'Moka Pot' },
                          cold_brew:    { label: 'Cold Brew' },
                          other:        { label: 'Other' },
                        },
                      }),
    bean:             ReferenceColumn({ label: 'Bean',      referenceTable: x_664529_aibrew_bean.name }),
    equipment:        ReferenceColumn({ label: 'Equipment', referenceTable: x_664529_aibrew_equipment.name }),
    recipe:           ReferenceColumn({ label: 'Recipe',    referenceTable: x_664529_aibrew_recipe.name }),
    dose_weight_g:    DecimalColumn({ label: 'Dose (g)' }),
    water_weight_g:   DecimalColumn({ label: 'Water (g)' }),
    grind_size:       IntegerColumn({ label: 'Grind Size' }),    // MUST be IntegerColumn — never StringColumn
    brew_time_seconds: IntegerColumn({ label: 'Brew Time (s)' }),
    rating:           IntegerColumn({ label: 'Rating', min: 1, max: 10 }),
    taste_notes:      StringColumn({ label: 'Taste Notes', maxLength: 500 }),
  },
})
```

[VERIFIED: column types from SDK docs (integercolumn-api, decimalcolumn-api, choicecolumn-api); ChoiceColumn values from recipe.now.ts]

### Pattern 10: brew-log-acls.now.ts

```typescript
// Source: exact copy of recipe-acls.now.ts with table name swapped
import '@servicenow/sdk/global'
import { Acl } from '@servicenow/sdk/core'
import { aibrew_user } from '../roles/aibrew-user.now'

export const brew_log_read   = Acl({ $id: Now.ID['brew_log_read'],   type: 'record', table: 'x_664529_aibrew_brew_log', operation: 'read',   roles: [aibrew_user] })
export const brew_log_write  = Acl({ $id: Now.ID['brew_log_write'],  type: 'record', table: 'x_664529_aibrew_brew_log', operation: 'write',  roles: [aibrew_user] })
export const brew_log_create = Acl({ $id: Now.ID['brew_log_create'], type: 'record', table: 'x_664529_aibrew_brew_log', operation: 'create', roles: [aibrew_user] })
export const brew_log_delete = Acl({ $id: Now.ID['brew_log_delete'], type: 'record', table: 'x_664529_aibrew_brew_log', operation: 'delete', roles: [aibrew_user] })
```

[VERIFIED: pattern from src/fluent/acls/recipe-acls.now.ts]

### Pattern 11: index.now.ts additions

```typescript
// Add to src/fluent/index.now.ts:
export { x_664529_aibrew_brew_log } from './tables/brew-log.now'
export { brew_log_read, brew_log_write, brew_log_create, brew_log_delete } from './acls/brew-log-acls.now'
```

[VERIFIED: pattern from src/fluent/index.now.ts existing exports]

### Pattern 12: app.tsx router update

```typescript
// Replace DisabledView for 'brew' case in renderContent():
import BrewView from './components/BrewView'

// In renderContent():
case 'brew':
  return <BrewView params={params} />
```

[VERIFIED: src/client/app.tsx renderContent() structure]

### Anti-Patterns to Avoid

- **Using RecordProvider for BrewView form:** The form has too many custom interactions. FormColumnLayout renders generic platform fields with no way to inject chip selection, timer state, or custom rating widget.
- **StringColumn for grind_size:** CLAUDE.md critical pitfall. Must be IntegerColumn. Getting this wrong requires migrating all existing brew_log records.
- **Not using sysparm_display_value=all:** Without it, `display()` / `value()` helpers return empty strings for reference field display names. This is the Phase 3 lesson applied here.
- **Starting interval in render (not in event handler or useEffect):** setInterval called in render creates a new interval every render cycle. Only call setInterval inside Start handler.
- **Not clearing interval in useEffect cleanup:** Navigate-away without cleanup causes phantom state updates on unmounted components (React warning + potential memory leak).
- **Storing brew ratio as a column:** BREW-07 explicitly says "not stored". Never add a `ratio` column to brew_log.
- **Not validating sysId before URL interpolation:** CR-01 from Phase 1 code review. Always `SYS_ID_RE.test(id)` before any `fetch(`.../${id}`, ...)`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chip/tag UI component | Custom component library | Native `<button>` with inline styles | Phase 3 confirmed @servicenow/react-components has no Chip component; native button is the pattern |
| Rating widget | Custom package | 10 native `<button>` elements in an array | No star-rating library available; 10 buttons is 8 lines of code |
| Select dropdown for reference fields | Custom autocomplete | Native `<select>` | Matches existing pattern (no autocomplete component visible in imports) |
| Timer formatting | moment.js / date-fns | Inline `Math.floor(s/60)` + padStart | Single 2-line function; no library needed |
| Form submission | FormActionBar / RecordProvider | Direct fetch POST | RecordProvider incompatible with custom form state |

---

## Risks & Pitfalls

### Pitfall 1: grind_size declared as StringColumn

**What goes wrong:** Data stored as string; GlideAggregate math fails; Phase 5 edit form shows text box instead of number picker; migration required for all existing records.
**Why it happens:** Developer sees StringColumn as the "safe" default.
**How to avoid:** `grind_size: IntegerColumn(...)` — this is explicitly called out in CLAUDE.md critical pitfalls and D-19.
**Warning signs:** SDK build passes but runtime form shows text input for grind.

### Pitfall 2: Missing sysparm_display_value=all on bean/preset fetches

**What goes wrong:** `display(b.name)` returns empty string. Bean picker shows blank options. Preset names invisible.
**Why it happens:** Easy to forget the query parameter.
**How to avoid:** Every Table API fetch that uses `display()` or `value()` helpers MUST include `sysparm_display_value: 'all'` in the URLSearchParams. This is the Phase 3 UAT lesson — document it in every fetch in BrewView.
**Warning signs:** Picker renders but all options show empty labels.

### Pitfall 3: Timer setInterval not cleaned up on unmount

**What goes wrong:** User starts timer, navigates away (to Catalog), navigates back. The old interval is still running in the background, causing `setElapsed` calls on an unmounted component — React warning + UI not reflecting true state.
**Why it happens:** useEffect cleanup forgotten or interval stored in a local variable instead of useRef.
**How to avoid:** Store interval handle in `useRef`. Return cleanup function from `useEffect(() => () => clearInterval(...), [])`. This is a canonical React pattern.
**Warning signs:** Console warning "Can't perform state update on unmounted component."

### Pitfall 4: ChoiceColumn method values don't match recipe.method

**What goes wrong:** Preset auto-fill sets `method = 'pour_over'` but brew_log method choices use `'pour over'` (with space). Field saves but display label is blank or wrong.
**Why it happens:** Copy-paste error in ChoiceColumn definition.
**How to avoid:** Copy the exact choices object from `src/fluent/tables/recipe.now.ts` — don't retype them. Verified values: `pour_over`, `espresso`, `french_press`, `aeropress`, `moka_pot`, `cold_brew`, `other`.
**Warning signs:** Preset fills method field but method chip does not highlight after auto-fill.

### Pitfall 5: `recipe` reference on brew_log populated when using "Use last"

**What goes wrong:** "Use last" also copies the `recipe` sysId from the last brew. Next brew appears as if a preset was used when it wasn't. Confuses Phase 5 history display.
**Why it happens:** Developer copies all fields including `recipe` in the "Use last" logic.
**How to avoid:** D-09 explicitly states "Use last" copies only: method, bean, dose_weight_g, water_weight_g, grind_size. The `recipe` field is NOT copied. `selectedPresetSysId` stays null.
**Warning signs:** Post-submit shows "Using: [preset name]" strip label even when user clicked "Use last".

### Pitfall 6: Save-as-preset copies bean or taste_notes

**What goes wrong:** Saved preset contains bean reference or taste notes. Preset becomes bean-specific, violating the bean-agnostic design (Phase 3 D-01).
**Why it happens:** Developer passes the full submittedBrew object to the recipe POST body.
**How to avoid:** D-17 explicitly lists only: name (user input), method, equipment, dose_weight_g, water_weight_g, grind_size. Build the POST body with only these fields.
**Warning signs:** Recipe table record has a bean field populated.

### Pitfall 7: Confirmation banner replaces entire BrewView vs. inline overlay

**What goes wrong:** If BrewView unmounts and remounts on confirmation, timer state / form state is lost. User cannot return to editing after seeing confirmation.
**Why it happens:** Using router navigation to a "success" view rather than component state.
**How to avoid:** `showConfirmation` is a state boolean in BrewView. When true, render the confirmation banner in place of the form (conditional render in same component). Do NOT navigate away.
**Warning signs:** Browser back button appears during confirmation state.

### Pitfall 8: ACL missing causes silent 403 on brew_log create

**What goes wrong:** Non-admin user submits brew. Fetch POST returns HTTP 403. Error shows "Couldn't save brew" but root cause is missing ACL.
**Why it happens:** brew_log ACLs not exported from index.now.ts, or SDK build+install run without verifying ACL deployment.
**How to avoid:** Always test submit with non-admin `aibrew_user` account before UAT sign-off (CLAUDE.md §Critical Pitfalls). Include this in the UAT plan explicitly.
**Warning signs:** Admin user can submit; non-admin user gets error.

### Pitfall 9: "Use last" button visible before first brew

**What goes wrong:** User on first-ever brew session sees "Use last" and taps it. Fetch returns empty array. Form silently does nothing or shows an error.
**Why it happens:** Button not conditionally hidden.
**How to avoid:** On mount, check if `lastBrew` fetch returns a record. If result array is empty, set `lastBrewAvailable = false` and hide the "Use last" button. D-08 locks this behaviour.
**Warning signs:** "Use last" button visible on fresh instance with no brew records.

---

## Validation Architecture

`nyquist_validation` is `true` in `.planning/config.json`. Validation section is required.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `npx @servicenow/sdk build` (SDK compile + schema validation) |
| Config file | Managed by SDK — no separate test config file |
| Quick run command | `npx @servicenow/sdk build` |
| Full validation | `npx @servicenow/sdk build && npx @servicenow/sdk install` then manual UAT |

There is no Jest/Vitest/Playwright test framework in this project. All automated validation is via the SDK build step. Functional correctness requires live instance testing with the deployed app.

### Phase Requirements — Test Map

| Req ID | Behavior | Test Type | Automated Command | Validates? |
|--------|----------|-----------|-------------------|-----------|
| BREW-01 | Method chip row renders 7 choices, tap selects/deselects | Manual (live instance) | — | UAT |
| BREW-02 | Preset picker expands and auto-fills form fields | Manual (live instance) | — | UAT |
| BREW-03 | "Use last" fills form from most recent brew | Manual (live instance) | — | UAT |
| BREW-04 | Timer starts, counts up, stops, value recorded | Manual (live instance) | — | UAT |
| BREW-05 | Bean picker shows active beans, selection recorded | Manual (live instance) | — | UAT |
| BREW-06 | Dose/water/grind inputs accept values | Manual (live instance) | — | UAT |
| BREW-07 | Live ratio updates as dose/water change | Manual (live instance) | — | UAT |
| BREW-08 | 10 rating buttons, tap selects, re-tap deselects | Manual (live instance) | — | UAT |
| BREW-09 | Taste notes text saved on brew record | Manual (live instance) | — | UAT |
| PLAT-03 | ≤6 fields visible above fold on phone-width | Manual (visual, phone or devtools 390px width) | — | UAT |
| RECIPE-01 | Save as preset modal creates recipe record | Manual (live instance) | — | UAT |
| Schema | brew_log.now.ts compiles without errors | `npx @servicenow/sdk build` | Build-time | Auto |
| ACLs | brew-log-acls.now.ts compiles and deploys | `npx @servicenow/sdk build && install` | Build + deploy | Auto |
| Inventory | Submitting a brew depletes bean stock figure | Manual — check BeanSection stock bar after brew | — | UAT |

### Sampling Rate

- **Per task commit:** `npx @servicenow/sdk build` (catches schema errors immediately)
- **Per wave merge:** `npx @servicenow/sdk build && npx @servicenow/sdk install`
- **Phase gate:** Full UAT checklist with non-admin `aibrew_user` account before `/gsd-verify-work`

### Wave 0 Gaps

None — no unit test framework exists in this project and none is planned. All functional validation is manual UAT on live instance. This is consistent with Phase 1–3 validation patterns.

---

## Security Domain

`security_enforcement` is not explicitly `false` in config.json — treating as enabled.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Single-user app, no login |
| V3 Session Management | Partial | `g_ck` guard before every fetch — platform-managed session token |
| V4 Access Control | Yes | `aibrew_user` role ACLs on brew_log table (D-20) |
| V5 Input Validation | Yes | Method + bean required validation before POST; grind_size is IntegerColumn (not string) |
| V6 Cryptography | No | No custom crypto; platform handles session security |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| sysId path injection in brew_log URL | Tampering | `SYS_ID_RE.test(id)` before URL interpolation (CR-01 pattern from Phase 1) |
| CSRF / unauthorized POST | Spoofing | `X-UserToken: g_ck` header on every mutating fetch |
| ACL missing for non-admin | Elevation of Privilege | 4 ACLs (read/write/create/delete) with `aibrew_user` role; UAT verification with non-admin account |
| Storing computed value (ratio) | Tampering/data integrity | BREW-07 + D-03: ratio never stored; always computed at render |

---

## Plan Outline

Suggested breakdown into 5 plans:

### Plan 04-01: Fluent Artifacts — brew_log Table + ACLs + Deploy

**Goal:** `x_664529_aibrew_brew_log` table exists on instance with correct schema and ACLs.

Tasks:
1. Create `src/fluent/tables/brew-log.now.ts` — Table with all D-19 columns (ChoiceColumn method with exact values from recipe.now.ts, ReferenceColumn bean/equipment/recipe, DecimalColumn dose/water, IntegerColumn grind_size/brew_time_seconds/rating, StringColumn taste_notes)
2. Create `src/fluent/acls/brew-log-acls.now.ts` — 4 ACLs (read/write/create/delete), type record, roles [aibrew_user]
3. Update `src/fluent/index.now.ts` — export brew_log table + 4 ACLs
4. `npx @servicenow/sdk build` — verify no compile errors
5. `npx @servicenow/sdk install` — deploy to instance
6. Verify table exists in ServiceNow Studio / sys_db_object

Verification: SDK build passes; table visible on instance; 4 ACL records created.

### Plan 04-02: Navigation Wiring — app.tsx + TopNav + HomeView

**Goal:** Brew tab and Brew Log tile are active and navigate to BrewView placeholder.

Tasks:
1. Create `src/client/components/BrewView.tsx` — scaffold with "BrewView placeholder" content and `params: URLSearchParams` prop
2. Update `src/client/app.tsx` — import BrewView, replace `case 'brew': return <DisabledView view={view} />` with `case 'brew': return <BrewView params={params} />`
3. Update `src/client/components/TopNav.tsx` — change `brew` entry from `disabled: true` to `disabled: false`
4. Update `src/client/components/HomeView.tsx` — change brew tile to `active: true`, `view: 'brew'`, add description `'Log your session'`
5. `npx @servicenow/sdk build && install`
6. Verify: Brew tab is tappable and shows placeholder view

Verification: TopNav "Brew" tab clickable and routes to BrewView; HomeView "Brew Log" tile is active and navigates to `?view=brew`.

### Plan 04-03: Form Core — Method Chips + Bean Picker + Dose/Water/Ratio + Grind + Timer

**Goal:** All above-the-fold form fields are functional. Satisfies BREW-01, BREW-04, BREW-05, BREW-06, BREW-07, PLAT-03.

Tasks:
1. Implement BrewView form state: method, beanSysId, doseG, waterG, grindSize, elapsed, running, beans[], equipmentSysId, error
2. On-mount fetches: active beans (`sysparm_display_value=all`), last brew (ORDERBYDESC sys_created_on LIMIT 1), active presets
3. Method chip row — horizontal scroll, 7 chips, tap selects/deselects, exact ChoiceColumn values
4. Bean picker — native `<select>` from fetched beans
5. Dose and water number inputs in a row; live ratio label between them `(waterG/doseG).toFixed(1)`
6. Grind size integer input with equipment name sub-label (show equipment display_value from selected preset)
7. Timer row: `formatTime(elapsed)` display; Start button (calls handleStart); Stop button (shown when running); tap stopped display to enable manual entry
8. useRef for intervalRef; useEffect cleanup on unmount

Verification: All 5 above-fold controls render and accept input; ratio updates live; timer counts up and stops; SDK build passes.

### Plan 04-04: Below-Fold Fields + Preset Strip + Submit + Confirmation Banner

**Goal:** Complete form is functional. Submit records to brew_log. BREW-02, BREW-03, BREW-08, BREW-09, D-07/D-08/D-09/D-10 all satisfied.

Tasks:
1. Preset strip component (above method chips) — collapsible; "▾ Pick one" expands scrollable preset cards using RecipeCard-style native buttons; "Use last" applies lastBrew fields; strip shows active label with `×`; applyPreset sets method/equipment/dose/water/grind + selectedPresetSysId
2. Rating widget — 10 native `<button>` circles, tap selects/re-tap deselects
3. Taste notes textarea (below rating)
4. Equipment picker `<select>` (below taste notes, pre-filled from preset)
5. "Save Brew" button — accent colour, full-width, minHeight 44px
6. handleSubmit: g_ck guard, validate method + bean, POST to brew_log table, set submittedBrew state + showConfirmation
7. Confirmation banner (replaces form when showConfirmation): "Brew saved! ✓" + `[ Save as preset ]` + `[ Done ]`
8. Done button: calls resetForm() which clears all state, sets showConfirmation false

Verification: Full brew can be logged (method + bean minimum). Confirmation banner appears. Done resets form. Inventory stock figure on BeanSection decrements after brew.

### Plan 04-05: RECIPE-01 Save-as-Preset Modal + UAT

**Goal:** RECIPE-01 fully wired. Full phase UAT with non-admin user.

Tasks:
1. "Save as preset" opens Modal (`size="lg"`) with controlled name text input + read-only field summary (method, equipment, dose_weight_g, water_weight_g, grind_size — no bean, no taste_notes)
2. handleSaveAsPreset: validate name, POST to `x_664529_aibrew_recipe` with locked field set, close modal, resetForm()
3. Error handling in modal (name required, HTTP errors)
4. `npx @servicenow/sdk build && install`
5. UAT checklist (with non-admin `aibrew_user` account):
   - BREW-01: log brew with each method
   - BREW-02: pick preset, verify fields fill (bean NOT touched)
   - BREW-03: "Use last" fills from most recent brew; not available before first brew
   - BREW-04: timer starts, counts, stops, value saved on record
   - BREW-05: bean picker shows active beans only
   - BREW-06: dose/water/grind saved on record
   - BREW-07: ratio live, not in record (verify no ratio column in table)
   - BREW-08: rating 1–10 saved; deselect works; rating absent when not set
   - BREW-09: taste notes saved
   - PLAT-03: ≤6 fields above fold at 390px width
   - RECIPE-01: save-as-preset creates recipe record without bean
   - Inventory: BeanSection stock bar decrements after brew

Verification: All UAT checklist items pass with non-admin user. Phase sign-off.

---

## Environment Availability

Step 2.6 skipped — this phase has no new external service dependencies. All dependencies (ServiceNow instance, Table API, now-sdk CLI) were confirmed available in Phase 1–3.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `useRef` + `useEffect` cleanup is the canonical React 18 pattern for setInterval timers | Pattern 2: Stopwatch Timer | Low — widely standard; if wrong, timer may continue after navigate-away but form reset on re-mount covers D-13 |
| A2 | Native `<select>` is acceptable for bean/equipment pickers (no @servicenow/react-components Select wrapper needed) | Pattern 4: Bean Picker | Low — all prior phases use native elements for custom forms; RecordProvider forms use platform Select, but BrewView is explicitly not RecordProvider-based |
| A3 | `sysparm_query: 'ORDERBYDESCsys_created_on'` is valid Table API syntax for ordering brew_log records | Pattern 6: "Use last" fetch | Low — same pattern used in BeanSection.tsx purchase history fetch with `ORDERBYDESCpurchase_date` [VERIFIED: BeanSection.tsx line 81] |

**All other claims in this research are VERIFIED from the existing codebase or CITED from SDK documentation.**

---

## Open Questions (RESOLVED)

1. **`display` field on brew_log table — `sys_created_on` vs. a computed display value**
   - What we know: `display` on Table config controls what shows in reference fields elsewhere. `recipe.now.ts` uses `display: 'name'`; `bean-purchase.now.ts` uses `display: 'bean'`.
   - What's unclear: brew_log has no single natural name field. Using `sys_created_on` is acceptable for Phase 4 (no other tables reference brew_log yet). Phase 5 (brew history) may render this differently, but it reads records directly via list fetch, not via reference display.
   - Recommendation: Use `display: 'sys_created_on'` for v1. Phase 5 plan can revisit if needed.

2. **grind_size `min` / `max` constraints on IntegerColumn**
   - What we know: SDK `IntegerColumn` supports `min` and `max` options [VERIFIED: integercolumn-api docs].
   - What's unclear: Whether to set `min: 1` on grind_size and rating, or leave unconstrained. Rating is 1–10 per D-15; a `min: 1, max: 10` constraint on the column would enforce this at the DB level.
   - Recommendation: Add `min: 1, max: 10` to `rating` IntegerColumn. Leave `grind_size` unconstrained (grinder step counts vary widely by equipment). This is Claude's discretion — not locked by D-19.

---

## Sources

### Primary (HIGH confidence)
- `src/fluent/tables/recipe.now.ts` — ChoiceColumn method values (locked schema contract for Phase 4)
- `src/fluent/acls/recipe-acls.now.ts` — ACL pattern template
- `src/fluent/index.now.ts` — Export pattern
- `src/client/components/RecipeSection.tsx` — Fetch pattern, sys_id object handling, listKey refresh, RecordProvider create modal
- `src/client/components/BeanSection.tsx` — Direct fetch POST pattern, g_ck guard, PATCH pattern
- `src/client/app.tsx` — Router structure for BrewView integration
- `src/client/components/TopNav.tsx` — Tab items mutation point
- `src/client/components/HomeView.tsx` — TILES mutation point
- `src/client/utils/fields.ts` — display()/value() helpers
- `src/client/utils/navigate.ts` — navigateToView, getViewParams
- `.planning/phases/04-brew-log-core/04-CONTEXT.md` — All locked decisions D-01 through D-20
- SDK docs: `integercolumn-api`, `decimalcolumn-api`, `choicecolumn-api`, `referencecolumn-api`, `stringcolumn-api` [VERIFIED via `npx @servicenow/sdk explain`]

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` — Phase 3 UAT lessons (sysparm_display_value=all, native button for card layouts, Modal size="lg")

### Tertiary (LOW confidence / ASSUMED)
- React 18 useRef + useEffect cleanup pattern for setInterval timers [ASSUMED — canonical React practice, not verified against an authoritative source in this session]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all verified from existing codebase
- Architecture: HIGH — derived directly from D-01 through D-20 locked decisions
- Fluent artifacts: HIGH — direct copy of recipe.now.ts + recipe-acls.now.ts patterns
- React patterns: HIGH for fetch/state/modal (verified from codebase); MEDIUM for timer cleanup (canonical React, assumed)
- Pitfalls: HIGH — grounded in CLAUDE.md critical pitfalls and Phase 3 UAT lessons

**Research date:** 2026-05-05
**Valid until:** 2026-06-05 (30 days — stable SDK and codebase)

---

## RESEARCH COMPLETE
