# Phase 4: Brew Log Core — Pattern Map

**Mapped:** 2026-05-05
**Files analyzed:** 8 (3 new, 5 modified)
**Analogs found:** 8 / 8

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/fluent/tables/brew-log.now.ts` | model (Fluent table) | CRUD | `src/fluent/tables/recipe.now.ts` | exact |
| `src/fluent/acls/brew-log-acls.now.ts` | config (Fluent ACL) | request-response | `src/fluent/acls/recipe-acls.now.ts` | exact |
| `src/fluent/index.now.ts` | config (barrel export) | — | `src/fluent/index.now.ts` (self) | mutation point |
| `src/client/components/BrewView.tsx` | component | request-response + event-driven | `src/client/components/BeanSection.tsx` (direct POST) + `src/client/components/RecipeSection.tsx` (fetch + modal) | role-match (no exact analog — BrewView is NOT RecordProvider-based) |
| `src/client/app.tsx` | config (router) | request-response | `src/client/app.tsx` (self) | mutation point |
| `src/client/components/TopNav.tsx` | component (nav) | event-driven | `src/client/components/TopNav.tsx` (self) | mutation point |
| `src/client/components/HomeView.tsx` | component (nav) | event-driven | `src/client/components/HomeView.tsx` (self) | mutation point |

---

## Pattern Assignments

### `src/fluent/tables/brew-log.now.ts` (new — Fluent table definition)

**Analog:** `src/fluent/tables/recipe.now.ts` (lines 1–36)

**Critical divergence:** brew-log adds columns that recipe does not have (`bean`, `recipe` reference, `brew_time_seconds`, `rating`, `taste_notes`, `water_weight_g`). `display` field must be `'sys_created_on'` (no natural name column). `MultiLineTextColumn` is NOT used here — taste_notes uses `StringColumn` per D-19.

**Imports pattern** (from recipe.now.ts lines 1–6 — replicate exactly, extend column type list):
```typescript
import '@servicenow/sdk/global'
import {
  Table, StringColumn, ChoiceColumn, ReferenceColumn,
  IntegerColumn, DecimalColumn,
} from '@servicenow/sdk/core'
import { x_664529_aibrew_bean }      from './bean.now'
import { x_664529_aibrew_equipment } from './equipment.now'
import { x_664529_aibrew_recipe }    from './recipe.now'
```
Note: `BooleanColumn` and `MultiLineTextColumn` are NOT needed. `x_664529_aibrew_bean` and `x_664529_aibrew_recipe` are new imports that recipe.now.ts does not have.

**Table wrapper pattern** (from recipe.now.ts lines 8–11):
```typescript
export const x_664529_aibrew_brew_log = Table({
  name: 'x_664529_aibrew_brew_log',
  label: 'Brew Log',
  display: 'sys_created_on',   // ← differs from recipe which uses 'name'
  schema: { ... },
})
```

**ChoiceColumn pattern — MUST copy verbatim** (from recipe.now.ts lines 14–25):
```typescript
method: ChoiceColumn({
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
```
These exact string keys (`pour_over`, `espresso`, etc.) must match what the chip row uses in BrewView.tsx.

**ReferenceColumn pattern** (from recipe.now.ts lines 26–29):
```typescript
equipment: ReferenceColumn({
  label: 'Equipment',
  referenceTable: x_664529_aibrew_equipment.name,
}),
```
Apply same pattern for `bean` (→ `x_664529_aibrew_bean.name`) and `recipe` (→ `x_664529_aibrew_recipe.name`).

**DecimalColumn + IntegerColumn pattern** (from recipe.now.ts lines 30–32):
```typescript
dose_weight_g:  DecimalColumn({ label: 'Dose (g)' }),
water_weight_g: DecimalColumn({ label: 'Water (g)' }),
grind_size:     IntegerColumn({ label: 'Grind Size' }),  // NEVER StringColumn
```
Additional IntegerColumns for brew_log: `brew_time_seconds: IntegerColumn({ label: 'Brew Time (s)' })` and `rating: IntegerColumn({ label: 'Rating', min: 1, max: 10 })`.

**StringColumn pattern** (from recipe.now.ts line 33 — but use StringColumn not MultiLineTextColumn):
```typescript
taste_notes: StringColumn({ label: 'Taste Notes', maxLength: 500 }),
```

---

### `src/fluent/acls/brew-log-acls.now.ts` (new — Fluent ACLs)

**Analog:** `src/fluent/acls/recipe-acls.now.ts` (lines 1–35 — copy entire file, swap table name)

**Imports pattern** (from recipe-acls.now.ts lines 1–3):
```typescript
import '@servicenow/sdk/global'
import { Acl } from '@servicenow/sdk/core'
import { aibrew_user } from '../roles/aibrew-user.now'
```

**ACL block pattern** (from recipe-acls.now.ts lines 5–35 — replicate all 4, swap names):
```typescript
export const brew_log_read = Acl({
  $id: Now.ID['brew_log_read'],
  type: 'record',
  table: 'x_664529_aibrew_brew_log',
  operation: 'read',
  roles: [aibrew_user],
})

export const brew_log_write = Acl({
  $id: Now.ID['brew_log_write'],
  type: 'record',
  table: 'x_664529_aibrew_brew_log',
  operation: 'write',
  roles: [aibrew_user],
})

export const brew_log_create = Acl({
  $id: Now.ID['brew_log_create'],
  type: 'record',
  table: 'x_664529_aibrew_brew_log',
  operation: 'create',
  roles: [aibrew_user],
})

export const brew_log_delete = Acl({
  $id: Now.ID['brew_log_delete'],
  type: 'record',
  table: 'x_664529_aibrew_brew_log',
  operation: 'delete',
  roles: [aibrew_user],
})
```
Exact structural copy — only the export names and `$id` keys and `table` string differ from recipe-acls.now.ts.

---

### `src/fluent/index.now.ts` (modified — add 2 export lines)

**Analog:** `src/fluent/index.now.ts` lines 14–15 (existing recipe exports, directly above insertion point)

**Current tail** (lines 14–15):
```typescript
export { x_664529_aibrew_recipe } from './tables/recipe.now'
export { recipe_read, recipe_write, recipe_create, recipe_delete } from './acls/recipe-acls.now'
```

**Lines to append** (follow same pattern exactly):
```typescript
export { x_664529_aibrew_brew_log } from './tables/brew-log.now'
export { brew_log_read, brew_log_write, brew_log_create, brew_log_delete } from './acls/brew-log-acls.now'
```
No other changes to index.now.ts.

---

### `src/client/components/BrewView.tsx` (new — full-screen brew form)

**Primary analog:** `src/client/components/BeanSection.tsx` — direct Table API POST pattern (lines 94–118), g_ck guard, `cancelled` flag in useEffect, error state.

**Secondary analog:** `src/client/components/RecipeSection.tsx` — fetch pattern with `sysparm_display_value=all` (lines 185–208), `listKey` state, `RecipeCard` native `<button>` layout, Modal `size="lg"`, footer event dispatch pattern (lines 146–163).

**CRITICAL DIVERGENCE — BrewView does NOT use RecordProvider/FormColumnLayout/FormActionBar.** All form state is plain React `useState`. This is the fundamental difference from every other section. The form submits via direct `fetch` POST, identical to `handleAddBeans` in BeanSection.tsx.

**Imports pattern** (combine from BeanSection.tsx lines 1–8 and RecipeSection.tsx lines 1–8):
```typescript
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@servicenow/react-components/Button'
import { Modal } from '@servicenow/react-components/Modal'
import { display, value } from '../utils/fields'
```
`RecordProvider`, `FormColumnLayout`, `FormActionBar` are explicitly NOT imported. `useRef` is added (not in analogs) for timer interval handle.

**Constants pattern** (from RecipeSection.tsx lines 10–11 and BeanSection.tsx lines 9–13):
```typescript
const BREW_LOG_TABLE = 'x_664529_aibrew_brew_log'
const RECIPE_TABLE   = 'x_664529_aibrew_recipe'
const BEAN_TABLE     = 'x_664529_aibrew_bean'
const SYS_ID_RE = /^[0-9a-f]{32}$/i

const modalHeadingStyle = {
  fontFamily: 'var(--aibrew-font-disp)',
  fontSize: '20px',
  fontWeight: 600,
  color: 'var(--aibrew-ink)',
  margin: '0 0 var(--sp-md) 0',
}
```

**Component signature** (from RecipeSection.tsx line 307 — same props pattern):
```typescript
export default function BrewView({ params }: { params: URLSearchParams }) { ... }
```

**On-mount fetch pattern** (from RecipeSection.tsx lines 185–208 — `cancelled` flag + `sysparm_display_value=all`):
```typescript
useEffect(() => {
  let cancelled = false
  const g_ck = (window as any).g_ck
  const beanParams = new URLSearchParams({
    sysparm_query: 'active=true',
    sysparm_fields: 'sys_id,name',
    sysparm_display_value: 'all',
    sysparm_limit: '100',
  })
  fetch(`/api/now/table/${BEAN_TABLE}?${beanParams}`, {
    headers: { Accept: 'application/json', ...(g_ck ? { 'X-UserToken': g_ck } : {}) },
  })
    .then(r => r.json())
    .then(data => { if (!cancelled) setBeans(data.result || []) })
    .catch(() => { if (!cancelled) setBeans([]) })
  return () => { cancelled = true }
}, [])
```
Same pattern repeated for preset fetch (recipe table, `active=true`, fields: `sys_id,name,method,equipment,dose_weight_g,water_weight_g,grind_size`) and last-brew fetch (brew_log table, `ORDERBYDESCsys_created_on`, limit 1).

**ORDERBY syntax** (from BeanSection.tsx line 80 — `ORDERBYDESCpurchase_date` — apply same pattern):
```typescript
sysparm_query: 'ORDERBYDESCsys_created_on',
sysparm_limit: '1',
```

**Direct POST submit pattern** (from BeanSection.tsx lines 94–118):
```typescript
const handleSubmit = async () => {
  if (!method) { setError('Select a brew method.'); return }
  if (!beanSysId) { setError('Select a bean.'); return }
  const g_ck = (window as any).g_ck
  if (!g_ck) { setError('Session token not available — please reload.'); return }
  setSubmitting(true)
  setError('')
  try {
    const res = await fetch(`/api/now/table/${BREW_LOG_TABLE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-UserToken': g_ck },
      body: JSON.stringify({ /* form state fields */ }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    // setShowConfirmation(true)
  } catch {
    setError("Couldn't save brew — try again.")
  } finally {
    setSubmitting(false)
  }
}
```

**Timer useRef + useEffect pattern** (no codebase analog — canonical React 18):
```typescript
const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
const [elapsed, setElapsed] = useState(0)
const [running, setRunning] = useState(false)

useEffect(() => {
  return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
}, [])

const handleStart = () => {
  if (running) return
  setRunning(true)
  intervalRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
}

const handleStop = () => {
  if (!running) return
  setRunning(false)
  if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
}

const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
```
The `useEffect` cleanup with empty deps array covers navigate-away. Store handle in `useRef` not a local variable.

**Method chip row pattern** (from RecipeSection.tsx RecipeCard method badge — adapted to scrollable chip row; native `<button>` not `Button` component — Phase 3 lesson):
```typescript
// Native <button> required — @servicenow/react-components Button ignores flex-direction column
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
        minHeight: '44px',
      }}
    >
      {m.label}
    </button>
  ))}
</div>
```

**sys_id extraction pattern** (from RecipeSection.tsx line 260 and BeanSection.tsx line 617):
```typescript
const id = typeof r.sys_id === 'object' ? value(r.sys_id) : r.sys_id
```
Apply this pattern whenever extracting sysId from any Table API response record.

**Modal pattern** (from RecipeSection.tsx lines 280–301 and BeanSection.tsx lines 818–844):
```typescript
<Modal
  size="lg"
  opened={showSavePreset}
  onOpenedSet={(e: CustomEvent) => { if (!e.detail?.value) setShowSavePreset(false) }}
>
  <div style={{ width: '100%', maxHeight: '70vh', overflowY: 'auto' }}>
    <h2 style={modalHeadingStyle}>Save as Preset</h2>
    {/* name input + read-only summary */}
    <div style={{ marginTop: 'var(--sp-sm)' }}>
      <Button onClicked={() => setShowSavePreset(false)} variant="secondary">Cancel</Button>
    </div>
  </div>
</Modal>
```
No `footerActions` prop — cancel is a Button inside the modal body (same as RecipeSection's create modal, not the archive modal).

**Native input element pattern** (from BeanSection.tsx lines 312–341 — documented exception):
```typescript
// NOTE: native <input> elements — @servicenow/react-components has no number/text input primitive.
// Using RecordProvider for a custom form is architecturally inappropriate (RESEARCH.md §Standard Stack).
<input
  type="number"
  value={doseG || ''}
  onChange={e => setDoseG(parseFloat(e.target.value) || 0)}
  style={{
    width: '100%',
    padding: '10px',
    border: '1px solid var(--aibrew-ink)',
    borderRadius: '4px',
    fontFamily: 'var(--aibrew-font-body)',
    fontSize: '16px',
    minHeight: '44px',
  }}
/>
```

**listKey increment after submit** (from RecipeSection.tsx line 217 — sets up Phase 5 history refresh):
```typescript
const [listKey, setListKey] = useState(0)
// After successful submit:
setListKey(k => k + 1)
```

**Error display pattern** (from BeanSection.tsx lines 352–356 and RecipeSection.tsx lines 230–234):
```typescript
{error && (
  <div style={{ color: 'var(--aibrew-destructive)', fontFamily: 'var(--aibrew-font-body)', fontSize: '16px', marginBottom: 'var(--sp-sm)' }}>
    {error}
  </div>
)}
```

**Primary action Button pattern** (from RecipeSection.tsx line 273):
```typescript
<Button onClicked={handleSubmit} variant="primary" style={{ minHeight: '44px', width: '100%', opacity: submitting ? 0.6 : 1, pointerEvents: submitting ? 'none' : 'auto' }}>
  {submitting ? 'Saving…' : 'Save Brew'}
</Button>
```

---

### `src/client/app.tsx` (modified — add BrewView import + route case)

**Analog:** `src/client/app.tsx` lines 1–5 (imports) and lines 62–75 (`renderContent` switch)

**Current import block** (lines 1–5):
```typescript
import React, { useState, useEffect, useCallback } from 'react'
import TopNav from './components/TopNav'
import HomeView from './components/HomeView'
import CatalogView from './components/CatalogView'
import { getViewParams, navigateToView } from './utils/navigate'
```
**Add one import line** after CatalogView:
```typescript
import BrewView from './components/BrewView'
```

**Current renderContent switch** (lines 63–75):
```typescript
function renderContent() {
  switch (view) {
    case 'home':    return <HomeView />
    case 'catalog': return <CatalogView params={params} />
    case 'brew':
    case 'history':
    case 'analytics':
      return <DisabledView view={view} />
    default:        return null
  }
}
```
**Change `case 'brew'`** — split it off from the fall-through block:
```typescript
case 'brew':    return <BrewView params={params} />
case 'history':
case 'analytics':
  return <DisabledView view={view} />
```
`params` is already in scope from `useState<URLSearchParams>(getViewParams)` — exact same props pattern as `<CatalogView params={params} />` (line 67).

---

### `src/client/components/TopNav.tsx` (modified — enable brew tab)

**Analog:** `src/client/components/TopNav.tsx` lines 5–11 (TAB_ITEMS array)

**Current TAB_ITEMS** (lines 5–11):
```typescript
const TAB_ITEMS = [
  { id: 'home',      label: 'Home',      disabled: false },
  { id: 'brew',      label: 'Brew',      disabled: true  },   // ← change this
  { id: 'catalog',   label: 'Catalog',   disabled: false },
  { id: 'history',   label: 'History',   disabled: true  },
  { id: 'analytics', label: 'Analytics', disabled: true  },
]
```
**Single change:** `brew` entry: `disabled: true` → `disabled: false`. No other changes.

---

### `src/client/components/HomeView.tsx` (modified — enable brew tile)

**Analog:** `src/client/components/HomeView.tsx` lines 14–22 (TILES array)

**Current TILES** (lines 14–22):
```typescript
const TILES: Tile[] = [
  { id: 'roasters',  label: 'Roasters',  description: 'Your roasters',      active: true,  view: 'catalog', section: 'roasters'  },
  { id: 'equipment', label: 'Equipment', description: 'Grinders & brewers', active: true,  view: 'catalog', section: 'equipment' },
  { id: 'beans',     label: 'Beans',     description: '',                    active: false },
  { id: 'brew',      label: 'Brew Log',  description: '',                    active: false },  // ← change this
  { id: 'recipes',   label: 'Recipes',   description: '',                    active: false },
  { id: 'history',   label: 'History',   description: '',                    active: false },
  { id: 'analytics', label: 'Analytics', description: '',                    active: false },
]
```
**Single change:** `brew` tile:
```typescript
{ id: 'brew', label: 'Brew Log', description: 'Log your session', active: true, view: 'brew' },
```
`active: true`, `view: 'brew'`, `description: 'Log your session'`. No `section` property needed (brew view has no sub-sections). Note: `Tile` interface (line 5–11) already has `view?: string` and `section?: string` as optional — no interface change needed.

---

## Shared Patterns

### g_ck Guard (Session Token)
**Source:** `src/client/components/BeanSection.tsx` lines 97 and 125
**Apply to:** Every mutating fetch in BrewView (handleSubmit, handleSaveAsPreset)
```typescript
const g_ck = (window as any).g_ck
if (!g_ck) { setError('Session token not available — please reload.'); return }
```
Also included on read fetches as optional header: `...(g_ck ? { 'X-UserToken': g_ck } : {})`

### sysId Validation Before URL Interpolation
**Source:** `src/client/components/BeanSection.tsx` line 123 and `src/client/components/RecipeSection.tsx` line 84
**Apply to:** Any fetch that interpolates a sysId into a URL path (e.g. PATCH/GET by id)
```typescript
const SYS_ID_RE = /^[0-9a-f]{32}$/i
if (!SYS_ID_RE.test(sysId)) { setError('Invalid record identifier.'); return }
```

### Cancelled Flag in useEffect Fetches
**Source:** `src/client/components/RecipeSection.tsx` lines 186–209 and `src/client/components/BeanSection.tsx` lines 60–72
**Apply to:** All on-mount and key-driven fetches in BrewView
```typescript
useEffect(() => {
  let cancelled = false
  // ... fetch chain
  .then(data => { if (!cancelled) setState(data.result || []) })
  .catch(() => { if (!cancelled) setState([]) })
  return () => { cancelled = true }
}, [dependency])
```

### sysparm_display_value=all on Reference Field Fetches
**Source:** `src/client/components/RecipeSection.tsx` line 193 (Phase 3 UAT lesson)
**Apply to:** Every Table API fetch in BrewView that uses `display()` or `value()` helpers
```typescript
sysparm_display_value: 'all',
```
Without this, `display(b.name)` returns empty string. Apply to bean fetch, preset fetch, last-brew fetch.

### CSS Variables and Font Conventions
**Source:** All existing components — consistent across `BeanSection.tsx`, `RecipeSection.tsx`, `HomeView.tsx`
**Apply to:** All inline styles in BrewView
- `fontFamily: 'var(--aibrew-font-body)'` — body text, labels, inputs
- `fontFamily: 'var(--aibrew-font-disp)'` — headings
- `color: 'var(--aibrew-ink)'` — primary text
- `color: 'var(--aibrew-ink-3)'` — secondary/muted text
- `color: 'var(--aibrew-destructive)'` — error text
- `background: 'var(--aibrew-accent)'` — selected/active state, primary actions
- `minHeight: '44px'` — mobile tap target minimum on all interactive elements

### Native `<button>` for Custom Card/Chip Layouts
**Source:** `src/client/components/RecipeSection.tsx` lines 32–71 (RecipeCard) and `src/client/components/BeanSection.tsx` lines 514–578 (BeanCard)
**Apply to:** Method chip row, preset picker cards, rating circles in BrewView
**Reason:** `@servicenow/react-components Button` ignores `display: block`, `flex-direction: column` on its `style` prop — Phase 3 lesson (STATE.md). Native `<button>` is the only option for custom card/chip/circle layouts.

### Modal Event Dispatch Pattern
**Source:** `src/client/components/RecipeSection.tsx` lines 146–163 (archive modal) and `src/client/components/BeanSection.tsx` lines 399–413
**Apply to:** Any Modal with footerActions in BrewView (if footerActions variant chosen for save-as-preset)
```typescript
onFooterActionClicked={(e: CustomEvent) => {
  if (e.detail?.payload?.action?.label === 'Save') handleSaveAsPreset()
  else setShowSavePreset(false)
}}
onOpenedSet={(e: CustomEvent) => { if (!e.detail?.value) setShowSavePreset(false) }}
```
Alternative: use Button inside modal body (no footerActions) — matches RecipeSection create modal pattern at lines 280–301.

### display() / value() Field Helpers
**Source:** `src/client/utils/fields.ts` lines 3–4
**Apply to:** All Table API response field reads in BrewView
```typescript
import { display, value } from '../utils/fields'
// display(field) → field?.display_value ?? ''
// value(field)   → field?.value ?? ''
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| Timer logic in `BrewView.tsx` | component state | event-driven | No setInterval-based timer exists anywhere in the codebase — canonical React useRef pattern applied |
| Rating widget in `BrewView.tsx` | component | event-driven | No 1–10 rating widget exists in the codebase — 10 native `<button>` elements following Phase 3 native button lesson |
| Preset strip in `BrewView.tsx` | component | event-driven | No collapsible banner strip exists — built from first principles using React state + inline styles following existing button/layout conventions |
| Post-submit confirmation banner | component state | — | No in-place confirmation flow exists — built with `showConfirmation` boolean state replacing form render |

---

## Metadata

**Analog search scope:** `src/fluent/tables/`, `src/fluent/acls/`, `src/fluent/roles/`, `src/fluent/index.now.ts`, `src/client/components/`, `src/client/utils/`, `src/client/app.tsx`
**Files read:** 10 (recipe.now.ts, recipe-acls.now.ts, index.now.ts, RecipeSection.tsx, BeanSection.tsx, app.tsx, TopNav.tsx, HomeView.tsx, fields.ts, navigate.ts, aibrew-user.now.ts)
**Pattern extraction date:** 2026-05-05
