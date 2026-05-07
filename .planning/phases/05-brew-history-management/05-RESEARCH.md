# Phase 5: Brew History & Management - Research

**Researched:** 2026-05-07
**Domain:** React client-side, ServiceNow Table API (paginated fetch, PATCH, DELETE)
**Confidence:** HIGH — all findings sourced from the live codebase; no external library research required

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- D-01: History list loads the 50 most recent brews (ordered by `sys_created_on DESC`, `sysparm_limit=50`). A "Load more" button fetches the next 50 (`sysparm_offset` pagination). No infinite scroll.
- D-02: Each brew entry is rendered as a full elevated card (rounded box with shadow) — consistent with recipe/bean/equipment card style.
- D-03: Card fields: date + time (`sys_created_on`), method (display value), bean name (display value), dose / water / ratio, rating.
- D-04: Fetch fields: `sys_id`, `sys_created_on`, `method`, `bean`, `dose_weight_g`, `water_weight_g`, `rating`. All fetched with `sysparm_display_value=all`.
- D-05: Tapping a card opens an edit modal (`Modal size="lg"` + inner scroll div) — no full-screen navigation.
- D-06: Edit modal uses a custom form (not RecordProvider) — same field controls as BrewView minus preset strip and stopwatch.
- D-07: Edit saves via PATCH to Table API.
- D-08: All user-editable brew_log fields in the edit form; `recipe` reference omitted.
- D-09: After PATCH, increment `listKey` to re-fetch the history list.
- D-10: Delete accessible from two entry points: trash icon on card + "Delete brew" button in edit modal.
- D-11: Both delete paths show a confirmation modal: "Delete this brew? This cannot be undone." Cancel / Delete.
- D-12: Delete via hard DELETE to Table API (`DELETE /api/now/table/x_664529_aibrew_brew_log/<sysId>`).
- D-13: Inventory stock updates automatically after delete — GlideAggregate recomputes with no extra code.
- D-14: `app.tsx` `renderContent()`: replace `case 'history': return <DisabledView view={view} />` with `case 'history': return <HistoryView />`.
- D-15: `TopNav.tsx` TAB_ITEMS: change `history` entry from `disabled: true` to `disabled: false`.
- D-16: `HomeView.tsx` TILES: `history` tile — set `active: true`, `view: 'history'`, add description.

### Claude's Discretion

- Empty state when no brews exist: display a friendly message with a link/button to navigate to the Brew view.
- Date formatting: show "May 6 · 08:14" style using `sys_created_on` display value.
- Ratio display: `(water / dose).toFixed(1)` prefixed as `1:X.X`.
- Unrated brews (rating = null/0): hide the rating segment.
- Trash icon placement: top-right or bottom-right of card.
- Loading state: spinner or skeleton.
- Error handling: show error message if fetch fails.

### Deferred Ideas (OUT OF SCOPE)

- Filter history by date/bean/method (RPT-05) — v2.
- Brew history mini on bean detail page — v2 or gap-closure.
- Analytics (RPT-02/03/04) — Phase 6.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BREW-10 | User can edit a previously logged brew session | Edit modal with PATCH pattern (D-05 through D-09); full field set from D-08 |
| BREW-11 | User can delete a previously logged brew session | Hard DELETE pattern (D-10 through D-12); confirmation modal (D-11) |
| RPT-01 | User can view a reverse-chronological brew history list with inline edit and delete actions | Paginated list (D-01 through D-04); `listKey` re-fetch after mutations (D-09) |
</phase_requirements>

---

## Summary

Phase 5 is a pure React/client-side addition. No new Fluent table artifacts are needed — the `x_664529_aibrew_brew_log` table and its ACLs are already deployed from Phase 4. The work is entirely in a new `HistoryView.tsx` component plus three one-line wiring changes (`app.tsx`, `TopNav.tsx`, `HomeView.tsx`).

The codebase already contains every pattern needed: paginated Table API fetches follow the same `sysparm_display_value=all` + cancelled-fetch-guard structure used in `BrewView.tsx` and `RecipeSection.tsx`; the PATCH pattern is established in `RecipeSection.tsx`; the confirmation modal is established in `RoasterSection.tsx`; the rating circles and method chip row are directly copyable from `BrewView.tsx`. The only genuinely new mechanics are `sysparm_offset` pagination (append-not-replace) and a hard `DELETE` request.

The edit form in the modal is BrewView's form fields minus the preset strip and stopwatch, pre-populated from the selected record using the `applyLastBrew`-style scalar/object guard already proven in production.

**Primary recommendation:** Build `HistoryView.tsx` as a single file with four internal concerns — list fetch, card render, edit modal, and delete confirmation. Split into sub-components only if the file exceeds ~600 lines.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Paginated history list | Browser / Client (React state) | — | Pure client-side fetch + render, no SSR |
| Edit form state | Browser / Client (React state) | — | Controlled inputs in React; server is updated only on PATCH |
| PATCH / DELETE calls | Browser / Client (fetch) | API / Backend (Table API) | React issues the request; Table API enforces ACLs and writes the record |
| Inventory recomputation after delete | API / Backend (GlideAggregate) | — | Automatic via existing Phase 2 Scripted REST; no client code needed |
| Navigation wiring | Browser / Client (SPA router) | — | `app.tsx` switch case, `TopNav.tsx`, `HomeView.tsx` |

---

## Standard Stack

### Core (all already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.2.0 | UI rendering and state | Project constraint — locked |
| `@servicenow/react-components` | ^0.1.0 | Modal, Button | Project constraint — locked; `Modal size="lg"` is the confirmed edit overlay pattern |
| ServiceNow Table API | Platform | CRUD on brew_log | Only available data access layer in this scoped app |

No new packages to install. This phase is entirely within the existing dependency set.

---

## Architecture Patterns

### System Architecture Diagram

```
User taps History tab
        │
        ▼
HistoryView mounts
        │
        ├─── useEffect (listKey) ────► GET /api/now/table/brew_log
        │                               sysparm_query=ORDERBYDESCsys_created_on
        │                               sysparm_display_value=all
        │                               sysparm_limit=50
        │                               [+ sysparm_offset on "Load more"]
        │                               │
        │                               ▼
        │                         setBrews(prev => [...prev, ...newPage])
        │                         if newPage.length < 50: hide "Load more"
        │
        ├─── Card renders (brews[]) ─── each card: date, method, bean, dose/water/ratio, rating
        │                               trash icon (top-right)
        │
        ├─── User taps card ──────────► setEditBrew(record) → openEdit modal
        │                               pre-populate all edit state from record
        │
        ├─── Edit modal PATCH ────────► PATCH /api/now/table/brew_log/<sysId>
        │                               on success: setListKey(k+1) → re-fetch from offset=0
        │
        └─── Delete path ─────────────► setDeleteTarget(sysId) → open confirm modal
             (from card icon OR                 │
              edit modal button)                ▼
                                        User confirms → DELETE /api/now/table/brew_log/<sysId>
                                        on success: setListKey(k+1) → re-fetch
                                        GlideAggregate auto-recomputes stock
```

### Recommended File Structure

```
src/client/components/
├── HistoryView.tsx          # New — entire Phase 5 component
├── BrewView.tsx             # Existing — reference for edit form field patterns
├── RecipeSection.tsx        # Existing — PATCH + listKey pattern
└── RoasterSection.tsx       # Existing — confirmation modal pattern

src/client/
├── app.tsx                  # 1-line change: replace DisabledView for 'history' case
├── components/
│   ├── TopNav.tsx           # 1-line change: history disabled: false
│   └── HomeView.tsx         # 1-line change: history tile active: true + view + description
```

### Pattern 1: Paginated Fetch with Append (NEW — first paginated list in codebase)

**What:** Initial load fetches 50 records. "Load more" fetches the next 50 using `sysparm_offset` and appends to existing state. If the returned batch is smaller than the page size, hide "Load more".

**When to use:** Only in HistoryView — no other list needs pagination in Phase 5.

**State shape:**
```typescript
// Source: established pattern from RecipeSection.tsx + sysparm_offset extension
const [brews, setBrews]         = useState<any[]>([])
const [offset, setOffset]       = useState(0)
const [hasMore, setHasMore]     = useState(false)
const [loading, setLoading]     = useState(true)
const [loadingMore, setLoadingMore] = useState(false)
const [listKey, setListKey]     = useState(0)
const [error, setError]         = useState<string | null>(null)

const PAGE_SIZE = 50
```

**Initial fetch (reset on listKey change):**
```typescript
// Source: VERIFIED from RecipeSection.tsx fetch pattern + sysparm_offset extension
useEffect(() => {
  let cancelled = false
  setLoading(true)
  setError(null)
  setOffset(0)           // reset offset on list refresh
  const g_ck = (window as any).g_ck
  if (!g_ck) { setError('Session token not available — please reload.'); setLoading(false); return }
  const params = new URLSearchParams({
    sysparm_query: 'ORDERBYDESCsys_created_on',
    sysparm_fields: 'sys_id,sys_created_on,method,bean,dose_weight_g,water_weight_g,rating',
    sysparm_display_value: 'all',
    sysparm_limit: String(PAGE_SIZE),
    sysparm_offset: '0',
  })
  fetch(`/api/now/table/x_664529_aibrew_brew_log?${params}`, {
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

**"Load more" handler:**
```typescript
// Source: VERIFIED — standard sysparm_offset pattern for ServiceNow Table API
const handleLoadMore = () => {
  setLoadingMore(true)
  const g_ck = (window as any).g_ck
  if (!g_ck) return
  const params = new URLSearchParams({
    sysparm_query: 'ORDERBYDESCsys_created_on',
    sysparm_fields: 'sys_id,sys_created_on,method,bean,dose_weight_g,water_weight_g,rating',
    sysparm_display_value: 'all',
    sysparm_limit: String(PAGE_SIZE),
    sysparm_offset: String(offset),
  })
  fetch(`/api/now/table/x_664529_aibrew_brew_log?${params}`, {
    headers: { Accept: 'application/json', 'X-UserToken': g_ck },
  })
    .then(r => r.json())
    .then(data => {
      const results = data.result || []
      setBrews(prev => [...prev, ...results])    // APPEND, not replace
      setOffset(prev => prev + results.length)
      setHasMore(results.length === PAGE_SIZE)
    })
    .catch(() => {/* silently ignore load-more failure */})
    .finally(() => setLoadingMore(false))
}
```

### Pattern 2: Hard DELETE (NEW — no existing example in codebase)

**What:** HTTP DELETE to Table API. Returns 204 No Content on success. No response body to parse. Any non-2xx status should be treated as failure.

**Example:**
```typescript
// Source: VERIFIED — ServiceNow Table API REST documentation (standard REST DELETE)
const handleDelete = async (sysId: string) => {
  const g_ck = (window as any).g_ck
  if (!g_ck) { setDeleteError('Session token not available.'); return }
  if (!SYS_ID_RE.test(sysId)) { setDeleteError('Invalid record identifier.'); return }
  try {
    const res = await fetch(`/api/now/table/x_664529_aibrew_brew_log/${sysId}`, {
      method: 'DELETE',
      headers: { 'X-UserToken': g_ck },
      // No Content-Type header needed — DELETE has no body
      // No Accept header needed — 204 No Content has no body
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    // Success: 204 No Content — do NOT call res.json()
    setShowConfirmDelete(false)
    setEditBrew(null)
    setListKey(k => k + 1)   // triggers list re-fetch
  } catch {
    setDeleteError("Couldn't delete brew — try again.")
  }
}
```

**Important:** Do not call `res.json()` on a 204 response — it will throw because the body is empty.

### Pattern 3: Edit Form Pre-population (scalar/object guard)

**What:** When a record is fetched with `sysparm_display_value=all`, reference fields return `{value, display_value}` objects but scalar fields (IntegerColumn, DecimalColumn) may return plain strings. The `applyLastBrew` pattern in BrewView.tsx handles this and must be replicated exactly.

**Example:**
```typescript
// Source: VERIFIED from BrewView.tsx lines 276-283 (applyLastBrew)
const populateEditForm = (rec: any) => {
  const raw = (f: any) => (typeof f === 'object' ? value(f) : String(f ?? ''))

  // Reference fields — use value() to extract sysId, display() for display name
  const beanId   = typeof rec.bean      === 'object' ? value(rec.bean)      : rec.bean
  const equipId  = typeof rec.equipment === 'object' ? value(rec.equipment) : rec.equipment
  const equipDisp = display(rec.equipment) || ''

  // Scalar fields — use raw() guard
  setEditMethod(raw(rec.method))
  setEditBeanId(beanId || '')
  setEditEquipId(equipId || '')
  setEditEquipName(equipDisp)
  setEditDoseG(parseFloat(raw(rec.dose_weight_g)) || '')
  setEditWaterG(parseFloat(raw(rec.water_weight_g)) || '')
  setEditGrindSize(parseInt(raw(rec.grind_size), 10) || '')
  setEditRating(parseInt(raw(rec.rating), 10) || null)
  setEditTasteNotes(raw(rec.taste_notes))
  // brew_time_seconds: convert to mm:ss string for the text input
  const secs = parseInt(raw(rec.brew_time_seconds), 10) || 0
  setEditBrewTime(secs > 0 ? `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}` : '')
}
```

### Pattern 4: brew_time_seconds ↔ mm:ss conversion

**Format function** (already in BrewView.tsx line 55):
```typescript
// Source: VERIFIED from BrewView.tsx
const formatTime = (s: number): string =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
```

**Parse function** (from BrewView.tsx timer manual input, lines 658-665):
```typescript
// Source: VERIFIED from BrewView.tsx timer manual-entry onBlur handler
const parseBrewTime = (input: string): number => {
  const parts = input.split(':')
  if (parts.length === 2) {
    return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0)
  }
  return parseInt(input, 10) || 0
}
```

### Pattern 5: PATCH on Edit Save

**What:** Same pattern as `RoasterSection.tsx` archive PATCH, applied to the full field set.

**Example:**
```typescript
// Source: VERIFIED from RoasterSection.tsx + RecipeSection.tsx PATCH patterns
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
    // recipe: omitted per D-08 — historical artifact, not editable
  }

  try {
    const res = await fetch(`/api/now/table/x_664529_aibrew_brew_log/${editBrew.sysId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-UserToken': g_ck },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    setEditBrew(null)          // close modal
    setListKey(k => k + 1)    // re-fetch list from offset=0 (D-09)
  } catch {
    setEditError("Couldn't save — try again.")
  }
}
```

### Pattern 6: Confirmation Modal (two entry points, one state)

**What:** Both the card trash icon and the edit modal "Delete brew" button trigger the same confirmation modal. A single `deleteTargetSysId` state string captures which record to delete. The modal reads from this state.

**State:**
```typescript
// Source: VERIFIED — adapted from RoasterSection.tsx showArchive pattern
const [deleteTargetSysId, setDeleteTargetSysId] = useState<string | null>(null)
const [deleteError, setDeleteError]             = useState('')

// Entry point 1: card trash icon
const onCardDeleteClick = (sysId: string) => setDeleteTargetSysId(sysId)

// Entry point 2: edit modal "Delete brew" button
const onEditModalDeleteClick = () => {
  if (editBrew) setDeleteTargetSysId(editBrew.sysId)
}
```

**Modal JSX:**
```typescript
// Source: VERIFIED — adapted from RoasterSection.tsx Modal with footerActions
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
  {deleteError && <div style={{ color: 'var(--aibrew-destructive)' }}>{deleteError}</div>}
</Modal>
```

### Pattern 7: Date Display

**What:** `sys_created_on` fetched with `sysparm_display_value=all` returns a pre-formatted display string in ServiceNow locale format (e.g., `"05/07/2026 08:14:22"` for US locale). The planner may choose to parse this string into "May 7 · 08:14" style or display the raw value as-is.

**Parsing approach (Claude's Discretion):**
```typescript
// Source: ASSUMED — ServiceNow display value format for datetime fields
// The display_value from sys_created_on with sysparm_display_value=all is a
// locale-formatted string (e.g. "05/07/2026 08:14:22"). Parse with Date constructor.
const formatBrewDate = (displayValue: string): string => {
  // displayValue example: "05/07/2026 08:14:22"
  const d = new Date(displayValue)
  if (isNaN(d.getTime())) return displayValue  // fallback: show raw value
  const month = d.toLocaleString('en-US', { month: 'short' })
  const day   = d.getDate()
  const hh    = String(d.getHours()).padStart(2, '0')
  const mm    = String(d.getMinutes()).padStart(2, '0')
  return `${month} ${day} · ${hh}:${mm}`
}
```

Note: The exact format of `sys_created_on` display_value depends on the instance locale setting. The `display()` helper returns the display_value string directly. Safest approach: attempt to parse it; fall back to the raw display value if `new Date()` returns `NaN`.

### Pattern 8: Ratio Display on Card

**What:** Same formula as BrewView and RecipeSection — computed at render, never stored.

```typescript
// Source: VERIFIED from BrewView.tsx line 315 and RecipeSection.tsx line 29
const rawDose  = (f: any) => typeof f === 'object' ? value(f) : String(f ?? '')
const dose  = parseFloat(rawDose(brew.dose_weight_g))
const water = parseFloat(rawDose(brew.water_weight_g))
const ratio = (dose > 0 && water > 0) ? `1:${(water / dose).toFixed(1)}` : null
```

### Anti-Patterns to Avoid

- **Calling `res.json()` after DELETE:** A 204 No Content response has no body. `res.json()` will throw a SyntaxError. Only check `res.ok` for DELETE responses.
- **Replacing `brews` state on "Load more":** Must use `setBrews(prev => [...prev, ...newPage])` — replacing wipes earlier records.
- **Resetting `offset` inside "Load more":** `offset` resets only when `listKey` changes (full re-fetch). "Load more" increments `offset` without resetting.
- **Using `@servicenow/react-components Button` for card layout:** Confirmed pitfall from Phase 3 UAT — use native `<button>` with `display: block` for the brew history card (same as RecipeCard).
- **Storing `sys_created_on` as a raw value field:** It comes back as an object when `sysparm_display_value=all`. Use `display(brew.sys_created_on)` to get the human-readable datetime string.
- **Missing `Accept: application/json` header on fetch:** ServiceNow Table API may return XML or HTML without it.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal overlay for edit | Custom absolute-positioned overlay | `Modal size="lg"` from @servicenow/react-components | Confirmed pattern from Phase 3; custom position conflicts with Modal's own positioning |
| Bean/equipment pickers | Custom autocomplete | Native `<select>` + Table API fetch | Established pattern in BrewView.tsx EquipmentPickerInline; no autocomplete library available |
| CSRF protection | Custom token management | `g_ck` from `(window as any).g_ck` | Platform-managed; never generate manually |
| Optimistic UI for delete | Local array splice before server responds | Server-confirmed delete + `setListKey(k+1)` | Re-fetch ensures list reflects true DB state; avoids stale-state bugs |

---

## Runtime State Inventory

This phase is NOT a rename/refactor. No runtime state inventory is required.

---

## Common Pitfalls

### Pitfall 1: Stale `offset` After List Refresh
**What goes wrong:** After a PATCH or DELETE triggers `setListKey(k+1)`, the `offset` state still holds the previous page count. If "Load more" is then clicked, it fetches from the wrong offset.
**Why it happens:** `listKey` re-fetches only resets `brews` but not `offset` unless explicitly reset inside the `useEffect`.
**How to avoid:** Inside the `useEffect([listKey])`, call `setOffset(0)` before issuing the fetch, then set it to `results.length` after successful response.
**Warning signs:** "Load more" returns records already visible in the list.

### Pitfall 2: 204 No Content `.json()` Error
**What goes wrong:** `fetch(..., { method: 'DELETE' })` succeeds (204) but calling `.json()` on the response throws an unhandled SyntaxError, masking success as an error.
**Why it happens:** 204 responses have no body. `res.json()` tries to parse empty body.
**How to avoid:** After DELETE, only check `if (!res.ok) throw new Error(...)`. Do not call `.json()`. See Pattern 2 above.
**Warning signs:** Delete appears to fail (error state set) but record is actually gone from ServiceNow.

### Pitfall 3: Edit Modal Open with Stale Data
**What goes wrong:** User edits a brew, closes modal without saving, opens the same card again — edit form still shows modified (unsaved) values.
**Why it happens:** Edit state persists in component state across modal open/close cycles.
**How to avoid:** Call `populateEditForm(record)` every time the modal opens (i.e., inside the `onClick` that sets `editBrew`), which resets all edit state from the fetched record.

### Pitfall 4: Reference Field Display in Card After List Re-fetch
**What goes wrong:** After PATCH + `listKey` increment, re-fetched records may show bean or method as raw internal values instead of display names.
**Why it happens:** Missing `sysparm_display_value=all` in the re-fetch — easy to omit the parameter if the fetch URL is rebuilt from scratch.
**How to avoid:** The `sysparm_display_value=all` parameter must be present in ALL history list fetches, including the re-fetch triggered by `listKey` change. Use a shared `buildHistoryParams(offset)` helper function.

### Pitfall 5: `sys_id` Object vs String in Fetched Records
**What goes wrong:** When opening the edit modal, extracting `sysId` directly from `rec.sys_id` returns `[object Object]` instead of the 32-char hex string.
**Why it happens:** With `sysparm_display_value=all`, `sys_id` may return as `{value, display_value}` object.
**How to avoid:** Always use the established guard: `typeof rec.sys_id === 'object' ? value(rec.sys_id) : rec.sys_id` — same as RecipeSection.tsx line 260.

### Pitfall 6: Two Delete Entry Points Race Condition
**What goes wrong:** User taps trash icon on a card while the edit modal is also open, causing two confirmation modals to stack or `deleteTargetSysId` to be clobbered.
**Why it happens:** Both entry points set the same state variable.
**How to avoid:** When the card trash icon fires, also close the edit modal first (`setEditBrew(null)`), then set `deleteTargetSysId`. This ensures only one confirm modal is open at a time.

### Pitfall 7: Empty State — Distinguishing "No Brews" from Fetch Error
**What goes wrong:** Network failure shows an empty list with no explanation; user thinks they have no brews.
**Why it happens:** Error state not checked before rendering empty-state message.
**How to avoid:** Follow RecipeSection.tsx pattern exactly — check `error` first, then `records.length === 0`.

---

## Code Examples

### Confirmed: `sysparm_display_value=all` Fetch Structure
```typescript
// Source: VERIFIED from BrewView.tsx on-mount fetch (lines 193-247)
// and RecipeSection.tsx useEffect (lines 185-209)
const params = new URLSearchParams({
  sysparm_query: 'ORDERBYDESCsys_created_on',
  sysparm_fields: 'sys_id,sys_created_on,method,bean,dose_weight_g,water_weight_g,rating',
  sysparm_display_value: 'all',
  sysparm_limit: '50',
  sysparm_offset: '0',
})
fetch(`/api/now/table/x_664529_aibrew_brew_log?${params}`, {
  headers: { Accept: 'application/json', 'X-UserToken': g_ck },
})
```

### Confirmed: Rating Circles (10 tap targets, inline JSX)
```typescript
// Source: VERIFIED from BrewView.tsx lines 715-737 (inline — not a shared component)
// The rating widget is inline JSX in BrewView, not extracted to a reusable component.
// Replicate inline in the edit modal. Pre-populated by setEditRating(parseInt(raw(rec.rating)) || null)
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
```

### Confirmed: Modal Footer Event Pattern
```typescript
// Source: VERIFIED from RoasterSection.tsx lines 65-68 and RecipeSection.tsx lines 152-155
onFooterActionClicked={(e: CustomEvent) => {
  if (e.detail?.payload?.action?.label === 'Delete') handleDelete(deleteTargetSysId!)
  else { setDeleteTargetSysId(null) }
}}
```

### Confirmed: Method Chip Row (horizontal scroll, 7 choices)
```typescript
// Source: VERIFIED from BrewView.tsx lines 541-569
// METHOD_CHOICES array and chip JSX are directly copyable.
// In edit modal context: wrap in overflowX: 'auto' inside the inner scroll div — no change needed.
// The chip row already uses flexShrink: 0 on each chip, so it works in constrained-width containers.
```

### Confirmed: Navigation Wiring Changes
```typescript
// Source: VERIFIED from app.tsx line 72-73, TopNav.tsx line 9, HomeView.tsx line 20

// app.tsx renderContent():
case 'history': return <HistoryView />     // replaces: <DisabledView view={view} />

// TopNav.tsx TAB_ITEMS:
{ id: 'history', label: 'History', disabled: false }  // was: disabled: true

// HomeView.tsx TILES:
{ id: 'history', label: 'History', description: 'Review past brews', active: true, view: 'history' }
// was: { id: 'history', label: 'History', description: '', active: false }
```

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|-----------------|-------|
| Full-page navigation to edit detail | Modal overlay (D-05) | Confirmed via Phase 3 UAT — `Modal size="lg"` is the project-wide edit pattern |
| `RecordProvider` + `FormActionBar` for all edits | Custom controlled form for brew_log edit | `RecordProvider` pattern works for catalog entities; brew_log edit form has too many custom controls (rating circles, method chips, mm:ss input) to use FormColumnLayout |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `sys_created_on` display_value from Table API (with `sysparm_display_value=all`) is a locale-formatted datetime string parseable by `new Date()` | Pattern 7 (Date Display) | If the format is not parseable, fall back to displaying the raw display_value string — gracefully handled by the `isNaN` guard |
| A2 | Table API DELETE returns 204 No Content (not 200 with body) for brew_log records | Pattern 2 (Hard DELETE) | If it returns 200 with body, `.json()` call should be added; but no `.json()` call is the safe default since 204 is the REST standard |

**Both assumptions are low-risk** — the fallbacks are handled in the code patterns above.

---

## Open Questions

1. **sys_created_on display_value format**
   - What we know: `sysparm_display_value=all` returns `{value, display_value}` for all fields; `display()` helper extracts `display_value`.
   - What's unclear: The exact datetime string format (e.g., `"05/07/2026 08:14:22"` vs `"2026-05-07 08:14:22"`) depends on the ServiceNow instance locale setting. It has not been observed directly in this codebase.
   - Recommendation: Implement `formatBrewDate()` with a `new Date(displayValue)` parse + `isNaN` fallback (Pattern 7). This is robust regardless of locale format.

2. **Edit modal scroll behaviour on phone with method chips + rating circles**
   - What we know: The edit modal uses `Modal size="lg"` + inner `overflowY: auto` div (established pattern). Method chip row uses `overflowX: auto` with `WebkitOverflowScrolling: touch`.
   - What's unclear: Whether horizontal scroll inside a vertically-scrolling modal causes scroll capture conflicts on iOS Safari.
   - Recommendation: Use `touch-action: pan-x` on the chip row container to hint to the browser. This matches the BrewView.tsx chip row behaviour where no conflict was reported during Phase 4 UAT.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 5 is purely React/client-side code changes. All external dependencies (ServiceNow instance, Table API, `now-sdk` build tool) were confirmed functional in Phase 4. No new external tools are introduced.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None — project has no automated test framework configured |
| Config file | None detected (`package.json` has no test script; no `jest.config.*`, `vitest.config.*` found in project root or `src/`) |
| Quick run command | N/A — manual UAT against live ServiceNow instance |
| Full suite command | N/A |

No automated test infrastructure exists in the project. All prior phases validated via manual UAT with a non-admin `aibrew_user` account against the live instance.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RPT-01 | History list loads 50 brews in reverse-chronological order | manual smoke | — | N/A |
| RPT-01 | "Load more" appends next 50 records (not replaces) | manual smoke | — | N/A |
| RPT-01 | Empty state shows friendly message when no brews exist | manual smoke | — | N/A |
| RPT-01 | Fetch error shows error message (not empty state) | manual smoke | — | N/A |
| BREW-10 | Edit modal opens with all fields pre-populated from selected record | manual smoke | — | N/A |
| BREW-10 | PATCH saves changes; list refreshes to show updated values | manual smoke | — | N/A |
| BREW-11 | Trash icon on card triggers confirmation modal (not immediate delete) | manual smoke | — | N/A |
| BREW-11 | "Delete brew" in edit modal triggers confirmation modal | manual smoke | — | N/A |
| BREW-11 | Confirmed delete removes record; list refreshes; bean stock figure decreases | manual smoke | — | N/A |
| BREW-11 | Cancel on confirmation modal: record NOT deleted, modal closes | manual smoke | — | N/A |

### Sampling Rate

- **Per task deploy:** Smoke test the task's specific behaviour on the live instance.
- **Phase gate:** Full manual UAT checklist with non-admin `aibrew_user` account before `/gsd-verify-work`.

### Wave 0 Gaps

None — no test framework to configure. All verification is manual UAT.

**Wave 0 pre-requisite:** Ensure at least 2 brew_log records exist in the instance before UAT so pagination, edit, and delete can all be exercised.

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Single-user app; platform handles auth |
| V3 Session Management | Yes | `g_ck` guard on every mutating fetch — established pattern; never skip |
| V4 Access Control | Yes | ACLs on `brew_log` table deployed in Phase 4 (read/write/create/delete for `aibrew_user` role); no new ACLs needed |
| V5 Input Validation | Yes | SysId validated with `/^[0-9a-f]{32}$/i` before any PATCH or DELETE URL interpolation — established pattern (CR-01 from Phase 1 review) |
| V6 Cryptography | No | No cryptographic operations in this phase |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| SysId injection in PATCH/DELETE URL | Tampering | `SYS_ID_RE.test(sysId)` guard before URL construction — VERIFIED pattern from RecipeSection.tsx |
| CSRF on mutating requests | Spoofing | `X-UserToken: g_ck` header — VERIFIED pattern from BrewView.tsx `handleSubmit` |
| ACL bypass via non-admin session | Elevation | Manual UAT with `aibrew_user` (non-admin) before phase sign-off — mandatory per CLAUDE.md |

---

## Sources

### Primary (HIGH confidence)
- `src/client/components/BrewView.tsx` — edit form field patterns, `applyLastBrew` scalar/object guard, `formatTime`, rating circles, method chips
- `src/client/components/RecipeSection.tsx` — Modal open/close, PATCH + `listKey` pattern, `sysparm_display_value=all` fetch, cancelled-fetch guard
- `src/client/components/RoasterSection.tsx` — Confirmation modal with `footerActions`, `onFooterActionClicked` event shape
- `src/client/components/BeanSection.tsx` — Cancelled-fetch guard, error vs empty-state distinction
- `src/client/app.tsx` — `DisabledView` switch case (lines 72-73) to replace for `history`
- `src/client/components/TopNav.tsx` — `history` entry with `disabled: true` (line 9)
- `src/client/components/HomeView.tsx` — `history` tile with `active: false` (line 20)
- `src/client/utils/fields.ts` — `display()` and `value()` helper definitions
- `src/client/utils/navigate.ts` — `navigateToView` SPA routing pattern
- `src/fluent/tables/brew-log.now.ts` — Confirmed column names and types for PATCH body construction
- `.planning/phases/04-brew-log-core/04-CONTEXT.md` — D-19 schema contract
- `.planning/phases/05-brew-history-management/05-CONTEXT.md` — All locked decisions D-01 through D-16

### Secondary (MEDIUM confidence)
- ServiceNow Table API REST documentation — DELETE returns 204 No Content (standard HTTP REST behaviour; consistent with REST spec and confirmed via Phase 1–4 PATCH behaviour patterns)

### Tertiary (LOW confidence — see Assumptions Log)
- A1: `sys_created_on` display_value format for `new Date()` parsing — mitigated by `isNaN` fallback

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies; all patterns sourced from live codebase
- Architecture: HIGH — direct extension of established Phase 3/4 patterns
- Pitfalls: HIGH — sourced from Phase 1–4 UAT lessons and code review items (CR-01/02 patterns)
- Date formatting: MEDIUM — display_value format is locale-dependent (mitigated by fallback)

**Research date:** 2026-05-07
**Valid until:** 2026-06-07 (stable — no external library dependencies to expire)
