# Phase 5: Brew History & Management — Pattern Map

**Mapped:** 2026-05-07
**Files analyzed:** 4 (1 new, 3 modified)
**Analogs found:** 4 / 4

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/client/components/HistoryView.tsx` | component | CRUD (paginated fetch, PATCH, DELETE) | `src/client/components/RecipeSection.tsx` + `BrewView.tsx` + `RoasterSection.tsx` | composite-exact |
| `src/client/app.tsx` | router/entry | request-response | self (line 72-73) | exact — 1-line change |
| `src/client/components/TopNav.tsx` | component | — | self (line 9) | exact — 1-line change |
| `src/client/components/HomeView.tsx` | component | — | self (line 20) | exact — 1-line change |

---

## Pattern Assignments

### `src/client/components/HistoryView.tsx` (component, CRUD)

This is the only new file. It is a composite of four existing analogs:

| Concern | Analog |
|---|---|
| List fetch + cancelled-fetch guard + error/empty state | `RecipeSection.tsx` `RecipeListView` |
| Card layout (native `<button>` with elevated box style) | `RecipeSection.tsx` `RecipeCard` |
| PATCH + listKey refresh | `RecipeSection.tsx` `RecipeListView.handleSaved` |
| Confirmation modal (footerActions, onFooterActionClicked) | `RoasterSection.tsx` `RoasterDetailView` |
| Edit form fields (method chips, bean picker, dose/water, grind, equipment, rating circles, taste notes) | `BrewView.tsx` lines 541–786 |
| Scalar/object guard for pre-population | `BrewView.tsx` `applyLastBrew` (lines 272–284) |
| Hard DELETE (no existing example) | ServiceNow Table API standard REST — see Pattern 2 |
| `sysparm_offset` pagination (no existing example) | Extension of RecipeSection fetch — see Pattern 1 |

---

#### Imports pattern
**Source:** `src/client/components/RecipeSection.tsx` lines 1–8 + `BrewView.tsx` lines 1–4

```typescript
import React, { useState, useEffect } from 'react'
import { Button } from '@servicenow/react-components/Button'
import { Modal } from '@servicenow/react-components/Modal'
import { display, value } from '../utils/fields'
import { navigateToView } from '../utils/navigate'
```

Note: No `RecordProvider`, `FormColumnLayout`, or `FormActionBar` — the edit form is custom-controlled (D-06). `navigateToView` is needed for the empty-state "Go to Brew" button only.

---

#### Table constant + sysId guard pattern
**Source:** `src/client/components/BrewView.tsx` lines 7–10

```typescript
const BREW_LOG_TABLE = 'x_664529_aibrew_brew_log'
const SYS_ID_RE      = /^[0-9a-f]{32}$/i
```

---

#### Style constants pattern
**Source:** `src/client/components/BrewView.tsx` lines 24–52

```typescript
const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--aibrew-font-disp)',
  fontSize: '20px',
  fontWeight: 600,
  color: 'var(--aibrew-ink)',
  margin: '0 0 var(--sp-md) 0',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--aibrew-font-body)',
  fontSize: '14px',
  fontWeight: 600,
  color: 'var(--aibrew-ink)',
  marginBottom: '4px',
  display: 'block',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  border: '1px solid var(--aibrew-ink-4)',
  borderRadius: '4px',
  fontFamily: 'var(--aibrew-font-body)',
  fontSize: '16px',
  minHeight: '44px',
  boxSizing: 'border-box',
  background: 'var(--aibrew-paper)',
  color: 'var(--aibrew-ink)',
}

const modalHeadingStyle = {
  fontFamily: 'var(--aibrew-font-disp)',
  fontSize: '20px',
  fontWeight: 600,
  color: 'var(--aibrew-ink)',
  margin: '0 0 var(--sp-md) 0',
}
const bodyStyle = {
  fontFamily: 'var(--aibrew-font-body)',
  fontSize: '16px',
  color: 'var(--aibrew-ink)',
  padding: 'var(--sp-sm) 0',
}
```

---

#### METHOD_CHOICES constant pattern
**Source:** `src/client/components/BrewView.tsx` lines 13–21

```typescript
const METHOD_CHOICES = [
  { value: 'espresso',     label: 'Espresso' },
  { value: 'pour_over',    label: 'Pour Over' },
  { value: 'aeropress',    label: 'AeroPress' },
  { value: 'french_press', label: 'French Press' },
  { value: 'moka_pot',     label: 'Moka Pot' },
  { value: 'cold_brew',    label: 'Cold Brew' },
  { value: 'other',        label: 'Other' },
]
```

Copy verbatim — these must match `brew-log.now.ts` ChoiceColumn choices exactly.

---

#### formatTime + parseBrewTime pattern
**Source:** `src/client/components/BrewView.tsx` lines 55–56 (formatTime) + lines 658–666 (manual input onBlur — parse logic)

```typescript
// 88 → "1:28"
const formatTime = (s: number): string =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

// "1:28" or "88" → 88 seconds
const parseBrewTime = (input: string): number => {
  const parts = input.split(':')
  if (parts.length === 2) {
    return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0)
  }
  return parseInt(input, 10) || 0
}
```

---

#### State shape pattern (paginated list)
**Source:** `src/client/components/RecipeSection.tsx` lines 170–174 (base list state) + RESEARCH.md Pattern 1

```typescript
const PAGE_SIZE = 50

const [brews, setBrews]             = useState<any[]>([])
const [offset, setOffset]           = useState(0)
const [hasMore, setHasMore]         = useState(false)
const [loading, setLoading]         = useState(true)
const [loadingMore, setLoadingMore] = useState(false)
const [listKey, setListKey]         = useState(0)
const [error, setError]             = useState<string | null>(null)

// Edit modal state
const [editBrew, setEditBrew]       = useState<any | null>(null)  // null = modal closed
const [editMethod, setEditMethod]   = useState('')
const [editBeanId, setEditBeanId]   = useState('')
const [editEquipId, setEditEquipId] = useState('')
const [editEquipName, setEditEquipName] = useState('')
const [editDoseG, setEditDoseG]     = useState<number | ''>('')
const [editWaterG, setEditWaterG]   = useState<number | ''>('')
const [editGrindSize, setEditGrindSize] = useState<number | ''>('')
const [editBrewTime, setEditBrewTime]   = useState('')  // mm:ss string
const [editRating, setEditRating]   = useState<number | null>(null)
const [editTasteNotes, setEditTasteNotes] = useState('')
const [editError, setEditError]     = useState('')

// Delete confirmation state
const [deleteTargetSysId, setDeleteTargetSysId] = useState<string | null>(null)
const [deleteError, setDeleteError] = useState('')

// Bean list for picker (fetched once on mount)
const [beans, setBeans] = useState<any[]>([])
```

---

#### Initial fetch (listKey useEffect) pattern
**Source:** `src/client/components/RecipeSection.tsx` lines 185–209 (structure) + RESEARCH.md Pattern 1

```typescript
useEffect(() => {
  let cancelled = false
  setLoading(true)
  setError(null)
  setOffset(0)          // MUST reset offset on every full re-fetch
  const g_ck = (window as any).g_ck
  if (!g_ck) { setError('Session token not available — please reload.'); setLoading(false); return }
  const params = new URLSearchParams({
    sysparm_query: 'ORDERBYDESCsys_created_on',
    sysparm_fields: 'sys_id,sys_created_on,method,bean,dose_weight_g,water_weight_g,rating',
    sysparm_display_value: 'all',
    sysparm_limit: String(PAGE_SIZE),
    sysparm_offset: '0',
  })
  fetch(`/api/now/table/${BREW_LOG_TABLE}?${params}`, {
    headers: { Accept: 'application/json', 'X-UserToken': g_ck },
  })
    .then(r => r.json())
    .then(data => {
      if (!cancelled) {
        const results = data.result || []
        setBrews(results)
        setOffset(results.length)
        setHasMore(results.length === PAGE_SIZE)
      }
    })
    .catch(() => { if (!cancelled) setError('Could not load history — try again.') })
    .finally(() => { if (!cancelled) setLoading(false) })
  return () => { cancelled = true }
}, [listKey])
```

Key delta from RecipeSection: `sysparm_query: 'ORDERBYDESCsys_created_on'` (not `active=true`), plus `setOffset` tracking and `setHasMore`.

---

#### Load More handler pattern (NEW — no prior example)
**Source:** RESEARCH.md Pattern 1 (ServiceNow Table API `sysparm_offset` standard)

```typescript
const handleLoadMore = () => {
  setLoadingMore(true)
  const g_ck = (window as any).g_ck
  if (!g_ck) return
  const params = new URLSearchParams({
    sysparm_query: 'ORDERBYDESCsys_created_on',
    sysparm_fields: 'sys_id,sys_created_on,method,bean,dose_weight_g,water_weight_g,rating',
    sysparm_display_value: 'all',
    sysparm_limit: String(PAGE_SIZE),
    sysparm_offset: String(offset),   // use current offset state — NOT 0
  })
  fetch(`/api/now/table/${BREW_LOG_TABLE}?${params}`, {
    headers: { Accept: 'application/json', 'X-UserToken': g_ck },
  })
    .then(r => r.json())
    .then(data => {
      const results = data.result || []
      setBrews(prev => [...prev, ...results])    // APPEND — never replace
      setOffset(prev => prev + results.length)
      setHasMore(results.length === PAGE_SIZE)
    })
    .catch(() => { /* silently ignore load-more failure */ })
    .finally(() => setLoadingMore(false))
}
```

---

#### Edit form pre-population pattern (scalar/object guard)
**Source:** `src/client/components/BrewView.tsx` lines 272–284 (`applyLastBrew`)

```typescript
const populateEditForm = (rec: any) => {
  const raw = (f: any) => (typeof f === 'object' ? value(f) : String(f ?? ''))

  setEditBrew({ sysId: typeof rec.sys_id === 'object' ? value(rec.sys_id) : rec.sys_id })
  setEditMethod(raw(rec.method))
  setEditBeanId(typeof rec.bean === 'object' ? value(rec.bean) : rec.bean || '')
  setEditEquipId(typeof rec.equipment === 'object' ? value(rec.equipment) : rec.equipment || '')
  setEditEquipName(display(rec.equipment) || '')
  setEditDoseG(parseFloat(raw(rec.dose_weight_g)) || '')
  setEditWaterG(parseFloat(raw(rec.water_weight_g)) || '')
  setEditGrindSize(parseInt(raw(rec.grind_size), 10) || '')
  setEditRating(parseInt(raw(rec.rating), 10) || null)
  setEditTasteNotes(raw(rec.taste_notes))
  const secs = parseInt(raw(rec.brew_time_seconds), 10) || 0
  setEditBrewTime(secs > 0 ? formatTime(secs) : '')
  setEditError('')
}
```

Call this inside the card `onClick` handler every time the modal opens — ensures stale edit state is never shown (Pitfall 3 from RESEARCH.md).

---

#### PATCH (edit save) pattern
**Source:** `src/client/components/RoasterSection.tsx` lines 23–47 (handleArchive PATCH structure) + `RecipeSection.tsx` lines 215–217 (listKey refresh)

```typescript
const handleEditSave = async () => {
  const g_ck = (window as any).g_ck
  if (!g_ck) { setEditError('Session token not available.'); return }
  if (!editBrew || !SYS_ID_RE.test(editBrew.sysId)) { setEditError('Invalid record.'); return }

  const brewTimeSecs = parseBrewTime(editBrewTime)
  const body: Record<string, unknown> = {
    method:            editMethod || null,
    bean:              editBeanId || null,
    equipment:         editEquipId || null,
    dose_weight_g:     editDoseG !== '' ? editDoseG : null,
    water_weight_g:    editWaterG !== '' ? editWaterG : null,
    grind_size:        editGrindSize !== '' ? editGrindSize : null,
    brew_time_seconds: brewTimeSecs > 0 ? brewTimeSecs : null,
    rating:            editRating || null,
    taste_notes:       editTasteNotes.trim() || null,
    // recipe: omitted per D-08
  }
  try {
    const res = await fetch(`/api/now/table/${BREW_LOG_TABLE}/${editBrew.sysId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-UserToken': g_ck },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    setEditBrew(null)          // close modal
    setListKey(k => k + 1)    // re-fetch list from offset=0
  } catch {
    setEditError("Couldn't save — try again.")
  }
}
```

---

#### Hard DELETE pattern (NEW — no prior example)
**Source:** RESEARCH.md Pattern 2 (ServiceNow Table API standard REST)

```typescript
const handleDelete = async (sysId: string) => {
  const g_ck = (window as any).g_ck
  if (!g_ck) { setDeleteError('Session token not available.'); return }
  if (!SYS_ID_RE.test(sysId)) { setDeleteError('Invalid record identifier.'); return }
  try {
    const res = await fetch(`/api/now/table/${BREW_LOG_TABLE}/${sysId}`, {
      method: 'DELETE',
      headers: { 'X-UserToken': g_ck },
      // No Content-Type — DELETE has no body
      // No Accept — 204 No Content has no body
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    // 204 No Content — do NOT call res.json()
    setDeleteTargetSysId(null)
    setEditBrew(null)
    setListKey(k => k + 1)
  } catch {
    setDeleteError("Couldn't delete brew — try again.")
  }
}
```

---

#### Card layout pattern (native button, elevated box)
**Source:** `src/client/components/RecipeSection.tsx` lines 31–71 (`RecipeCard`)

```typescript
// HistoryView brew card — native <button> required (Phase 3 lesson: @servicenow/react-components
// Button ignores display: block / flex-direction: column on style prop)
<button
  onClick={() => populateEditForm(brew)}   // opens edit modal
  style={{
    display: 'block',
    width: '100%',
    padding: '12px',
    border: '2px solid var(--aibrew-ink)',
    borderRadius: '6px',
    background: 'var(--aibrew-paper)',
    textAlign: 'left',
    boxShadow: '3px 4px 0 rgba(0,0,0,.08)',
    cursor: 'pointer',
    marginBottom: '10px',
    position: 'relative',    // for trash icon absolute positioning
  }}
>
  {/* Line 1: date + time (left) + trash icon (right) */}
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
    <span style={{ fontSize: '12px', color: 'var(--aibrew-ink-3)', fontFamily: 'var(--aibrew-font-body)' }}>
      {formatBrewDate(display(brew.sys_created_on))}
    </span>
    <button
      onClick={e => { e.stopPropagation(); setEditBrew(null); setDeleteTargetSysId(sysId) }}
      style={{ background: 'transparent', border: 'none', color: 'var(--aibrew-ink-3)', fontSize: '14px', padding: '4px', cursor: 'pointer', minWidth: '32px', minHeight: '32px' }}
      aria-label="Delete brew"
    >🗑</button>
  </div>
  {/* Line 2: method chip + bean name */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
    {methodLabel && (
      <span style={{ background: 'var(--aibrew-accent)', color: '#fff', borderRadius: '8px', padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}>
        {methodLabel}
      </span>
    )}
    <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'var(--aibrew-font-body)', color: 'var(--aibrew-ink)' }}>
      {beanName}
    </span>
  </div>
  {/* Line 3: dose • water • ratio  ★ rating */}
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontSize: '12px', color: 'var(--aibrew-ink-3)', fontFamily: 'var(--aibrew-font-body)' }}>
      {dose > 0 ? `${dose}g • ${water}g • 1:${ratio}` : '—'}
    </span>
    {rating > 0 && (
      <span style={{ fontSize: '12px', fontFamily: 'var(--aibrew-font-body)', color: 'var(--aibrew-ink)' }}>
        ★ {rating}/10
      </span>
    )}
  </div>
</button>
```

Note: `e.stopPropagation()` on the trash button prevents the card `onClick` from also firing. `setEditBrew(null)` closes any open edit modal before showing confirm (Pitfall 6 from RESEARCH.md).

---

#### Card field extraction (display/value helpers)
**Source:** `src/client/components/RecipeSection.tsx` lines 24–29 (RecipeCard field extraction) + `src/client/utils/fields.ts`

```typescript
// Inside the card render:
const sysId       = typeof brew.sys_id === 'object' ? value(brew.sys_id) : brew.sys_id
const methodLabel = display(brew.method) || value(brew.method) || ''
const beanName    = display(brew.bean) || ''
const dose        = parseFloat(typeof brew.dose_weight_g === 'object' ? value(brew.dose_weight_g) : String(brew.dose_weight_g ?? '')) || 0
const water       = parseFloat(typeof brew.water_weight_g === 'object' ? value(brew.water_weight_g) : String(brew.water_weight_g ?? '')) || 0
const ratio       = dose > 0 && water > 0 ? (water / dose).toFixed(1) : '—'
const rating      = parseInt(typeof brew.rating === 'object' ? value(brew.rating) : String(brew.rating ?? ''), 10) || 0
```

---

#### Loading state pattern (skeleton placeholders)
**Source:** `src/client/components/RecipeSection.tsx` lines 220–228 (`renderContent` loading branch)

```typescript
if (loading) {
  return (
    <div>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ height: '72px', background: 'var(--aibrew-ink-5)', borderRadius: '6px', opacity: 0.4, marginBottom: '10px' }} />
      ))}
    </div>
  )
}
```

---

#### Error state pattern
**Source:** `src/client/components/RecipeSection.tsx` lines 230–235 (`renderContent` error branch)

```typescript
if (error) {
  return (
    <div style={{ padding: 'var(--sp-md)', border: '2px solid var(--aibrew-ink)', borderRadius: '6px', color: 'var(--aibrew-destructive)', fontFamily: 'var(--aibrew-font-body)' }}>
      {error}
    </div>
  )
}
```

---

#### Empty state pattern (dashed placeholder with nav)
**Source:** `src/client/components/RecipeSection.tsx` lines 237–251 (empty state JSX)

```typescript
if (brews.length === 0) {
  return (
    <div style={{
      border: '2px dashed var(--aibrew-ink-4)',
      borderRadius: '8px',
      padding: 'var(--sp-xl)',
      textAlign: 'center',
      color: 'var(--aibrew-ink-3)',
      fontFamily: 'var(--aibrew-font-body)',
    }}>
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>☕</div>
      <div style={{ fontSize: '16px', fontWeight: 600 }}>No brews yet</div>
      <div style={{ fontSize: '14px', marginTop: '4px' }}>Start logging from the Brew tab</div>
      <Button
        onClicked={() => navigateToView('brew', {}, 'AIBrew — Brew')}
        variant="primary"
        style={{ marginTop: 'var(--sp-md)', minHeight: '44px' }}
      >
        → Brew
      </Button>
    </div>
  )
}
```

---

#### Method chip row pattern (edit modal)
**Source:** `src/client/components/BrewView.tsx` lines 541–570

```typescript
<div style={{ marginBottom: 'var(--sp-md)' }}>
  <span style={labelStyle}>Method</span>
  <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', padding: '4px 0', WebkitOverflowScrolling: 'touch' }}>
    {METHOD_CHOICES.map(m => (
      <button
        key={m.value}
        onClick={() => setEditMethod(editMethod === m.value ? '' : m.value)}
        style={{
          flexShrink: 0,
          padding: '6px 14px',
          borderRadius: '16px',
          border: editMethod === m.value
            ? '2px solid var(--aibrew-accent)'
            : '2px solid var(--aibrew-ink-4)',
          background: editMethod === m.value ? 'var(--aibrew-accent)' : 'transparent',
          color: editMethod === m.value ? '#fff' : 'var(--aibrew-ink)',
          fontFamily: 'var(--aibrew-font-body)',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          minHeight: '44px',
        }}
      >{m.label}</button>
    ))}
  </div>
</div>
```

---

#### Bean picker (edit modal)
**Source:** `src/client/components/BrewView.tsx` lines 572–587

```typescript
<div style={{ marginBottom: 'var(--sp-md)' }}>
  <label style={labelStyle}>Bean</label>
  <select
    value={editBeanId}
    onChange={e => setEditBeanId(e.target.value)}
    style={{ ...inputStyle }}
  >
    <option value="">— Select bean —</option>
    {beans.map(b => {
      const id = typeof b.sys_id === 'object' ? value(b.sys_id) : b.sys_id
      const name = display(b.name) || value(b.name) || ''
      return <option key={id} value={id}>{name}</option>
    })}
  </select>
</div>
```

The `beans` state is populated by a one-time fetch on mount (same pattern as BrewView's bean list fetch — see BrewView.tsx lines 199–213 for the fetch structure).

---

#### Dose / Water / live ratio row (edit modal)
**Source:** `src/client/components/BrewView.tsx` lines 589–630

```typescript
<div style={{ display: 'flex', gap: 'var(--sp-sm)', alignItems: 'flex-end', marginBottom: 'var(--sp-md)' }}>
  <div style={{ flex: 1 }}>
    <label style={labelStyle}>Dose (g)</label>
    <input type="number" min="0" step="0.1" value={editDoseG}
      onChange={e => setEditDoseG(e.target.value === '' ? '' : parseFloat(e.target.value))}
      style={{ ...inputStyle }} placeholder="18" />
  </div>
  <div style={{ padding: '0 var(--sp-xs)', fontFamily: 'var(--aibrew-font-body)', fontSize: '14px',
    color: editRatio ? 'var(--aibrew-ink)' : 'var(--aibrew-ink-4)', fontWeight: 600,
    minWidth: '60px', textAlign: 'center', paddingBottom: '12px' }}>
    {editRatio || '1:—'}
  </div>
  <div style={{ flex: 1 }}>
    <label style={labelStyle}>Water (g)</label>
    <input type="number" min="0" step="1" value={editWaterG}
      onChange={e => setEditWaterG(e.target.value === '' ? '' : parseFloat(e.target.value))}
      style={{ ...inputStyle }} placeholder="300" />
  </div>
</div>
```

Where `editRatio` is computed inline: `(typeof editDoseG === 'number' && editDoseG > 0 && typeof editWaterG === 'number' && editWaterG > 0) ? \`1:${(editWaterG / editDoseG).toFixed(1)}\` : null`

---

#### Rating circles (edit modal)
**Source:** `src/client/components/BrewView.tsx` lines 714–738

```typescript
<div style={{ marginBottom: 'var(--sp-md)' }}>
  <label style={labelStyle}>Rating (optional)</label>
  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
      <button
        key={n}
        onClick={() => setEditRating(editRating === n ? null : n)}
        style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: editRating === n ? '2px solid var(--aibrew-accent)' : '2px solid var(--aibrew-ink-4)',
          background: editRating === n ? 'var(--aibrew-accent)' : 'transparent',
          color: editRating === n ? '#fff' : 'var(--aibrew-ink)',
          fontFamily: 'var(--aibrew-font-body)', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
        }}
      >{n}</button>
    ))}
  </div>
</div>
```

---

#### Taste notes textarea (edit modal)
**Source:** `src/client/components/BrewView.tsx` lines 741–762

```typescript
<div style={{ marginBottom: 'var(--sp-md)' }}>
  <label style={labelStyle}>Taste notes (optional)</label>
  <textarea
    value={editTasteNotes}
    onChange={e => setEditTasteNotes(e.target.value)}
    rows={3}
    maxLength={500}
    placeholder="Bright, fruity, clean finish…"
    style={{ width: '100%', padding: '10px', border: '1px solid var(--aibrew-ink-4)',
      borderRadius: '4px', fontFamily: 'var(--aibrew-font-body)', fontSize: '16px',
      resize: 'vertical', boxSizing: 'border-box', background: 'var(--aibrew-paper)', color: 'var(--aibrew-ink)' }}
  />
</div>
```

---

#### Equipment picker (edit modal)
**Source:** `src/client/components/BrewView.tsx` lines 59–117 (`EquipmentPickerInline`) + lines 764–771 (usage)

The `EquipmentPickerInline` component can be copied verbatim from BrewView.tsx into HistoryView.tsx — it is a self-contained local component that fetches active equipment and renders a `<select>`. Usage in the edit modal:

```typescript
<div style={{ marginBottom: 'var(--sp-md)' }}>
  <label style={labelStyle}>Equipment (optional)</label>
  <EquipmentPickerInline
    value={editEquipId}
    onChange={(id, name) => { setEditEquipId(id); setEditEquipName(name) }}
  />
</div>
```

---

#### Brew time text input (edit modal — no stopwatch)
**Source:** `src/client/components/BrewView.tsx` lines 652–671 (manual input portion only — omit Start/Stop buttons)

```typescript
<div style={{ marginBottom: 'var(--sp-md)' }}>
  <label style={labelStyle}>Brew time (mm:ss)</label>
  <input
    type="text"
    value={editBrewTime}
    onChange={e => setEditBrewTime(e.target.value)}
    style={{ ...inputStyle, width: '120px', fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace', fontSize: '20px' }}
    placeholder="1:28"
  />
</div>
```

`parseBrewTime(editBrewTime)` in handleEditSave converts to integer seconds for the PATCH body.

---

#### Edit modal (Modal size="lg" + inner scroll) pattern
**Source:** `src/client/components/RecipeSection.tsx` lines 280–300 (Modal size="lg" + inner scroll div)

```typescript
<Modal
  size="lg"
  opened={editBrew !== null}
  footerActions={[
    { label: 'Save changes', variant: 'primary' },
    { label: 'Cancel', variant: 'secondary' },
  ]}
  onFooterActionClicked={(e: CustomEvent) => {
    if (e.detail?.payload?.action?.label === 'Save changes') handleEditSave()
    else setEditBrew(null)
  }}
  onOpenedSet={(e: CustomEvent) => { if (!e.detail?.value) setEditBrew(null) }}
>
  <div style={{ width: '100%', maxHeight: '70vh', overflowY: 'auto' }}>
    <h2 style={modalHeadingStyle}>Edit brew</h2>
    {/* "Delete brew" button at top of form footer — destructive */}
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 'var(--sp-md)' }}>
      <button
        onClick={() => { if (editBrew) setDeleteTargetSysId(editBrew.sysId) }}
        style={{ background: 'none', border: 'none', color: 'var(--aibrew-destructive)', fontFamily: 'var(--aibrew-font-body)', fontSize: '13px', cursor: 'pointer', padding: 0 }}
      >
        Delete brew
      </button>
    </div>
    {editError && <div style={{ color: 'var(--aibrew-destructive)', marginBottom: 'var(--sp-sm)', fontFamily: 'var(--aibrew-font-body)' }}>{editError}</div>}
    {/* ... form fields ... */}
  </div>
</Modal>
```

---

#### Delete confirmation modal pattern
**Source:** `src/client/components/RoasterSection.tsx` lines 59–75 (Modal with footerActions + onFooterActionClicked + onOpenedSet)

```typescript
<Modal
  opened={deleteTargetSysId !== null}
  footerActions={[
    { label: 'Delete', variant: 'primary-negative' },
    { label: 'Cancel', variant: 'secondary' },
  ]}
  onFooterActionClicked={(e: CustomEvent) => {
    if (e.detail?.payload?.action?.label === 'Delete') handleDelete(deleteTargetSysId!)
    else { setDeleteTargetSysId(null); setDeleteError('') }
  }}
  onOpenedSet={(e: CustomEvent) => { if (!e.detail?.value) setDeleteTargetSysId(null) }}
>
  <h2 style={modalHeadingStyle}>Delete this brew?</h2>
  <div style={bodyStyle}>This cannot be undone.</div>
  {deleteError && <div style={{ color: 'var(--aibrew-destructive)', fontFamily: 'var(--aibrew-font-body)' }}>{deleteError}</div>}
</Modal>
```

---

#### "Load more" button pattern
**Source:** No direct analog — pattern derived from UI-SPEC §6 and RESEARCH.md Pattern 1

```typescript
{hasMore && (
  <button
    onClick={handleLoadMore}
    disabled={loadingMore}
    style={{
      width: '100%',
      fontSize: '13px',
      color: 'var(--aibrew-ink-3)',
      border: '1.4px dashed var(--aibrew-ink-4)',
      borderRadius: '6px',
      padding: '10px',
      marginTop: '8px',
      background: 'transparent',
      cursor: loadingMore ? 'default' : 'pointer',
      fontFamily: 'var(--aibrew-font-body)',
      opacity: loadingMore ? 0.6 : 1,
    }}
  >
    {loadingMore ? 'Loading…' : 'Load more brews'}
  </button>
)}
```

---

### `src/client/app.tsx` (router, 1-line change)

**Analog:** self — `src/client/app.tsx` lines 71–73

**Exact change** (lines 71–73, current):
```typescript
      case 'history':
      case 'analytics':
        return <DisabledView view={view} />
```

**After change:**
```typescript
      case 'history':
        return <HistoryView />
      case 'analytics':
        return <DisabledView view={view} />
```

**Import to add** (after existing BrewView import, line 5):
```typescript
import HistoryView from './components/HistoryView'
```

---

### `src/client/components/TopNav.tsx` (component, 1-line change)

**Analog:** self — `src/client/components/TopNav.tsx` line 9

**Exact change** (line 9, current):
```typescript
  { id: 'history',   label: 'History',   disabled: true  },
```

**After change:**
```typescript
  { id: 'history',   label: 'History',   disabled: false },
```

---

### `src/client/components/HomeView.tsx` (component, 1-line change)

**Analog:** self — `src/client/components/HomeView.tsx` line 20

**Exact change** (line 20, current):
```typescript
  { id: 'history',   label: 'History',   description: '',                    active: false },
```

**After change:**
```typescript
  { id: 'history',   label: 'History',   description: 'Review past brews',   active: true,  view: 'history' },
```

Pattern reference for `active: true` with `view`: line 18 (`brew` tile) confirms the shape:
```typescript
  { id: 'brew',      label: 'Brew Log',  description: 'Log your session',    active: true,  view: 'brew' },
```

---

## Shared Patterns

### g_ck CSRF guard
**Source:** `src/client/components/BrewView.tsx` lines 325–326 and `RoasterSection.tsx` lines 29–31
**Apply to:** All fetch calls in HistoryView.tsx (initial fetch, load more, PATCH, DELETE)
```typescript
const g_ck = (window as any).g_ck
if (!g_ck) { setError('Session token not available — please reload.'); return }
```

### Cancelled-fetch guard
**Source:** `src/client/components/RecipeSection.tsx` lines 186 + 208 and `BeanSection.tsx` lines 61–71
**Apply to:** All `useEffect` fetches in HistoryView.tsx
```typescript
let cancelled = false
// ... in .then():
if (!cancelled) { /* update state */ }
// ... cleanup:
return () => { cancelled = true }
```

### SysId validation before URL interpolation
**Source:** `src/client/components/RecipeSection.tsx` line 84 and `RoasterSection.tsx` line 25
**Apply to:** `handleEditSave` and `handleDelete` in HistoryView.tsx — before ANY fetch that uses sysId in URL
```typescript
if (!SYS_ID_RE.test(sysId)) { setError('Invalid record identifier.'); return }
```

### `sysparm_display_value=all` on every list fetch
**Source:** `src/client/components/RecipeSection.tsx` line 193 (Phase 3 UAT lesson)
**Apply to:** ALL brew_log Table API fetches (initial + load more) — without this, `display()` and `value()` return empty strings

### Modal footerActions event shape
**Source:** `src/client/components/RoasterSection.tsx` lines 65–68 and `RecipeSection.tsx` lines 152–155
**Apply to:** All `Modal` footerActions in HistoryView.tsx
```typescript
onFooterActionClicked={(e: CustomEvent) => {
  if (e.detail?.payload?.action?.label === 'Save changes') handleEditSave()
  else setEditBrew(null)
}}
```

### `display()` / `value()` helpers
**Source:** `src/client/utils/fields.ts`
```typescript
export const display = (field: any): string => field?.display_value ?? ''
export const value   = (field: any): string => field?.value ?? ''
```
**Apply to:** All reference field extractions in HistoryView.tsx (method, bean, sys_id, sys_created_on)

---

## No Analog Found

| File | Concern | Reason |
|---|---|---|
| `HistoryView.tsx` | `sysparm_offset` pagination | First paginated list in the codebase — use Pattern 1 from RESEARCH.md |
| `HistoryView.tsx` | Hard DELETE | No prior DELETE in codebase (catalog uses PATCH `active: false`) — use Pattern 2 from RESEARCH.md; critical: do NOT call `res.json()` on 204 response |

---

## Critical Anti-Patterns (do not copy)

| Pattern to avoid | Why | Source of lesson |
|---|---|---|
| `@servicenow/react-components Button` for card layout | Ignores `display: block` / `flex-direction: column` on `style` prop | Phase 3 UAT; RecipeCard uses native `<button>` |
| `res.json()` after DELETE | 204 No Content has no body — throws SyntaxError | RESEARCH.md Pitfall 2 |
| `setBrews(results)` in "Load more" | Replaces earlier records | Must use `setBrews(prev => [...prev, ...results])` |
| Omitting `sysparm_display_value=all` from re-fetch | Reference fields return raw IDs | Phase 3 UAT lesson; present in RecipeSection.tsx line 193 |
| Not resetting `offset` inside `useEffect([listKey])` | Stale offset causes "Load more" to return already-visible records | RESEARCH.md Pitfall 1 |
| Opening edit modal without calling `populateEditForm` fresh | Shows stale unsaved values from prior open | RESEARCH.md Pitfall 3 |

---

## Metadata

**Analog search scope:** `src/client/components/`, `src/client/utils/`
**Files read:** BrewView.tsx (889 lines, 4 targeted ranges), RecipeSection.tsx (311 lines), RoasterSection.tsx (175 lines), BeanSection.tsx (855 lines), app.tsx (87 lines), TopNav.tsx (64 lines), HomeView.tsx (81 lines), fields.ts (4 lines), navigate.ts (28 lines)
**Pattern extraction date:** 2026-05-07
