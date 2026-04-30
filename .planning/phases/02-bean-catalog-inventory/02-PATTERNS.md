# Phase 2: Bean Catalog & Inventory — Pattern Map

**Mapped:** 2026-04-30
**Files analyzed:** 10 (6 new + 2 new server files + 1 new React component + 1 edited React component + 1 edited Fluent index)
**Analogs found:** 9 / 10 (1 file — ScriptInclude artifact — has no codebase analog; use RESEARCH.md Pattern 4)

---

## File Classification

| New / Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---------------------|------|-----------|----------------|---------------|
| `src/fluent/tables/bean.now.ts` | model | CRUD | `src/fluent/tables/equipment.now.ts` | exact (adds ReferenceColumn + DateColumn) |
| `src/fluent/tables/bean-purchase.now.ts` | model | CRUD | `src/fluent/tables/roaster.now.ts` | role-match (ledger vs catalog) |
| `src/fluent/acls/bean-acls.now.ts` | middleware | request-response | `src/fluent/acls/roaster-acls.now.ts` | exact |
| `src/fluent/acls/bean-purchase-acls.now.ts` | middleware | request-response | `src/fluent/acls/equipment-acls.now.ts` | exact |
| `src/fluent/scripted-rest/bean-stock-api.now.ts` | config | request-response | none in codebase | no analog |
| `src/fluent/script-includes/bean-stock-helper.now.ts` | config | request-response | none in codebase | no analog |
| `src/server/bean-stock-handler.ts` | service | request-response | none in codebase | no analog |
| `src/server/script-includes/BeanStockHelper.server.js` | service | batch/transform | none in codebase | no analog |
| `src/client/components/BeanSection.tsx` | component | CRUD + request-response | `src/client/components/RoasterSection.tsx` | exact (extend with stock bar + sub-form) |
| `src/client/components/CatalogView.tsx` (edit) | component | request-response | self | self-edit |
| `src/fluent/index.now.ts` (edit) | config | — | self | self-edit |

---

## Pattern Assignments

### `src/fluent/tables/bean.now.ts` (model, CRUD)

**Analog:** `src/fluent/tables/equipment.now.ts` (ChoiceColumn pattern) + `src/fluent/tables/roaster.now.ts` (base structure)

**Imports pattern** (`equipment.now.ts` lines 1–3, extended):
```typescript
import '@servicenow/sdk/global'
import { Table, StringColumn, BooleanColumn, ChoiceColumn, ReferenceColumn, DateColumn } from '@servicenow/sdk/core'
```

**ChoiceColumn pattern** (`equipment.now.ts` lines 10–18):
```typescript
type: ChoiceColumn({
  label: 'Type',
  mandatory: true,
  choices: {
    grinder: { label: 'Grinder' },
    brewer:  { label: 'Brewer' },
  },
}),
```
Copy this pattern for `roast_level` — replace keys/labels with: `light`, `medium_light`, `medium`, `medium_dark`, `dark`, `extra_dark`.

**Base Table structure** (`roaster.now.ts` lines 4–14):
```typescript
export const x_664529_aibrew_roaster = Table({
  name: 'x_664529_aibrew_roaster',
  label: 'Roaster',
  display: 'name',
  schema: {
    name:    StringColumn({ label: 'Name', mandatory: true, maxLength: 100 }),
    website: UrlColumn({ label: 'Website' }),
    notes:   StringColumn({ label: 'Notes', maxLength: 1000 }),
    active:  BooleanColumn({ label: 'Active', default: true }),
  },
})
```
Apply the same `name` / `label` / `display: 'name'` / `active: BooleanColumn({ default: true })` structure. Replace website/notes with `origin`, `roast_level`, `roast_date`, `roaster`.

**New columns to add (no codebase analog — use RESEARCH.md Pattern 1):**
- `ReferenceColumn({ label: 'Roaster', referenceTable: 'x_664529_aibrew_roaster', mandatory: true })` — import `x_664529_aibrew_roaster` from `'./roaster.now'`
- `DateColumn({ label: 'Roast Date' })`

---

### `src/fluent/tables/bean-purchase.now.ts` (model, CRUD)

**Analog:** `src/fluent/tables/roaster.now.ts` (base structure)

**Imports pattern** (`roaster.now.ts` lines 1–2, extended for ledger):
```typescript
import '@servicenow/sdk/global'
import { Table, IntegerColumn, DateColumn, BooleanColumn, ReferenceColumn } from '@servicenow/sdk/core'
```

**Base Table structure** (`roaster.now.ts` lines 4–14) — same skeleton, different schema:
```typescript
export const x_664529_aibrew_bean_purchase = Table({
  name: 'x_664529_aibrew_bean_purchase',
  label: 'Bean Purchase',
  display: 'bean',          // reference field used as display value
  schema: {
    // ... columns ...
    active: BooleanColumn({ label: 'Active', default: true }),
  },
})
```
Import `x_664529_aibrew_bean` from `'./bean.now'` for the ReferenceColumn. The `display: 'bean'` (not `'name'`) distinguishes this ledger table from the catalog tables.

---

### `src/fluent/acls/bean-acls.now.ts` (middleware, request-response)

**Analog:** `src/fluent/acls/roaster-acls.now.ts` — exact copy with table name and export names changed.

**Full file pattern** (`roaster-acls.now.ts` lines 1–35):
```typescript
import '@servicenow/sdk/global'
import { Acl } from '@servicenow/sdk/core'
import { aibrew_user } from '../roles/aibrew-user.now'

export const roaster_read = Acl({
  $id: Now.ID['roaster_read'],
  type: 'record',
  table: 'x_664529_aibrew_roaster',
  operation: 'read',
  roles: [aibrew_user],
})

export const roaster_write = Acl({
  $id: Now.ID['roaster_write'],
  type: 'record',
  table: 'x_664529_aibrew_roaster',
  operation: 'write',
  roles: [aibrew_user],
})

export const roaster_create = Acl({
  $id: Now.ID['roaster_create'],
  type: 'record',
  table: 'x_664529_aibrew_roaster',
  operation: 'create',
  roles: [aibrew_user],
})

export const roaster_delete = Acl({
  $id: Now.ID['roaster_delete'],
  type: 'record',
  table: 'x_664529_aibrew_roaster',
  operation: 'delete',
  roles: [aibrew_user],
})
```

**Substitutions for `bean-acls.now.ts`:**
- `roaster_read` → `bean_read`, `roaster_write` → `bean_write`, `roaster_create` → `bean_create`, `roaster_delete` → `bean_delete`
- `Now.ID['roaster_read']` → `Now.ID['bean_read']` (and so on for each)
- `table: 'x_664529_aibrew_roaster'` → `table: 'x_664529_aibrew_bean'`

---

### `src/fluent/acls/bean-purchase-acls.now.ts` (middleware, request-response)

**Analog:** `src/fluent/acls/equipment-acls.now.ts` — exact copy, same substitution pattern.

**Full file pattern** (`equipment-acls.now.ts` lines 1–35):
```typescript
import '@servicenow/sdk/global'
import { Acl } from '@servicenow/sdk/core'
import { aibrew_user } from '../roles/aibrew-user.now'

export const equipment_read = Acl({
  $id: Now.ID['equipment_read'],
  type: 'record',
  table: 'x_664529_aibrew_equipment',
  operation: 'read',
  roles: [aibrew_user],
})
// ... write / create / delete follow identical pattern
```

**Substitutions for `bean-purchase-acls.now.ts`:**
- `equipment_read` → `bean_purchase_read`, etc.
- `Now.ID['equipment_read']` → `Now.ID['bean_purchase_read']`, etc.
- `table: 'x_664529_aibrew_equipment'` → `table: 'x_664529_aibrew_bean_purchase'`

---

### `src/fluent/scripted-rest/bean-stock-api.now.ts` (config, request-response)

**Analog:** None in codebase. Use RESEARCH.md Pattern 3 verbatim.

Key points from RESEARCH.md Pattern 3:
- Import: `import { RestApi } from '@servicenow/sdk/core'`
- Import the handler: `import { process } from '../../server/bean-stock-handler'`
- `serviceId: 'stock'` produces URI prefix `/api/x_664529_aibrew/v1/stock/`
- Route must carry `version: 1` to match the `versions` array
- Route `path: '/{bean_sys_id}'` — path parameter name must match what `request.pathParams` uses in the handler
- `authentication: true, authorization: true` on the route

---

### `src/fluent/script-includes/bean-stock-helper.now.ts` (config, request-response)

**Analog:** None in codebase. Use RESEARCH.md Pattern 4 verbatim.

Key points from RESEARCH.md Pattern 4:
- Import: `import { ScriptInclude } from '@servicenow/sdk/core'`
- `apiName: 'x_664529_aibrew.BeanStockHelper'` — scope prefix dot class name
- `script: Now.include('../../server/script-includes/BeanStockHelper.server.js')`
- `name`, `$id` key, and `apiName` last segment must all be `BeanStockHelper` exactly

---

### `src/server/bean-stock-handler.ts` (service, request-response)

**Analog:** None in codebase. Use RESEARCH.md Pattern 5.

Key points:
- Import only from `@servicenow/glide`: `import { gs } from '@servicenow/glide'`
- Path param access: `request.pathParams.bean_sys_id`
- SysId validation before any use: `!/^[0-9a-f]{32}$/i.test(beanSysId)` → `response.setStatus(400)`
- Script Include call: `new (global as any).BeanStockHelper()` (A1 assumption — verify at build time)
- Error handling: `gs.error(...)` + `response.setStatus(500)` in catch

---

### `src/server/script-includes/BeanStockHelper.server.js` (service, batch/transform)

**Analog:** None in codebase. Use RESEARCH.md Pattern 4 (server JS portion) verbatim.

Key rules:
- `var` declarations only — no `const`, `let`, `class`
- `Class.create()` with `.prototype` — no ES6 class syntax
- `type: 'BeanStockHelper'` at bottom of prototype — must match exactly
- Do NOT import Glide APIs — `GlideAggregate`, `GlideRecord`, `gs` are auto-available
- Phase 4 stub: leave commented-out brew deduction block as shown in RESEARCH.md Pattern 4

---

### `src/client/components/BeanSection.tsx` (component, CRUD + request-response)

**Analog:** `src/client/components/RoasterSection.tsx` — copy as starting template, extend with stock bar and inline sub-form.

**Imports pattern** (`RoasterSection.tsx` lines 1–8) — copy exactly, add no new imports for Phase 2:
```typescript
import React, { useState, useEffect } from 'react'
import { Button } from '@servicenow/react-components/Button'
import { Modal } from '@servicenow/react-components/Modal'
import { RecordProvider } from '@servicenow/react-components/RecordContext'
import { FormColumnLayout } from '@servicenow/react-components/FormColumnLayout'
import { FormActionBar } from '@servicenow/react-components/FormActionBar'
import { navigateToView } from '../utils/navigate'
```

**Constants block** (`RoasterSection.tsx` lines 9–13):
```typescript
const ROASTER_TABLE = 'x_664529_aibrew_roaster'
const SYS_ID_RE = /^[0-9a-f]{32}$/i

const modalHeadingStyle = { fontFamily: 'var(--aibrew-font-disp)', fontSize: '20px', fontWeight: 600, color: 'var(--aibrew-ink)', margin: '0 0 var(--sp-md) 0' }
const bodyStyle = { fontFamily: 'var(--aibrew-font-body)', fontSize: '16px', color: 'var(--aibrew-ink)', padding: 'var(--sp-sm) 0' }
```
Change `ROASTER_TABLE` to `BEAN_TABLE = 'x_664529_aibrew_bean'`. Add `BEAN_PURCHASE_TABLE = 'x_664529_aibrew_bean_purchase'`. Keep `SYS_ID_RE` and style constants identical.

**Table API list fetch pattern** (`RoasterSection.tsx` lines 85–103):
```typescript
useEffect(() => {
  let cancelled = false
  setLoading(true)
  setError(null)
  const g_ck = (window as any).g_ck
  const params = new URLSearchParams({
    sysparm_query: 'active=true',
    sysparm_fields: 'sys_id,name,website,notes',
    sysparm_limit: '50',
  })
  fetch(`/api/now/table/${ROASTER_TABLE}?${params}`, {
    headers: { Accept: 'application/json', ...(g_ck ? { 'X-UserToken': g_ck } : {}) },
  })
    .then(r => r.json())
    .then(data => { if (!cancelled) setRecords(data.result || []) })
    .catch(() => { if (!cancelled) { setRecords([]); setError('Could not load records — tap to retry.') } })
    .finally(() => { if (!cancelled) setLoading(false) })
  return () => { cancelled = true }
}, [listKey])
```
For beans: change `sysparm_fields` to `'sys_id,name,origin,roaster.display_value'` and `sysparm_limit` to `'100'`. Add a second parallel `Promise.all()` fan-out for stock fetches after the bean list resolves (see RESEARCH.md Pitfall 1 — use `Promise.all()` not sequential calls).

**listKey refresh after create** (`RoasterSection.tsx` lines 109–112):
```typescript
const handleSaved = () => {
  setShowCreate(false)
  setListKey(k => k + 1)
}
```
Copy exactly. Also add `setStockKey(k => k + 1)` in `handleSaved` to refresh list-view stock bars.

**Archive PATCH pattern** (`RoasterSection.tsx` lines 23–47):
```typescript
const handleArchive = async () => {
  setArchiveError('')
  if (!SYS_ID_RE.test(sysId)) {
    setArchiveError('Invalid record identifier.')
    return
  }
  const g_ck = (window as any).g_ck
  if (!g_ck) {
    setArchiveError('Session token not available — please reload the page.')
    return
  }
  try {
    const res = await fetch(`/api/now/table/${ROASTER_TABLE}/${sysId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-UserToken': g_ck },
      body: JSON.stringify({ active: false }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    setShowArchive(false)
    handleBack()
  } catch {
    setShowArchive(false)
    setArchiveError("Couldn't archive — try again in a moment.")
  }
}
```
Copy exactly — substitute `ROASTER_TABLE` → `BEAN_TABLE`.

**Modal footer event pattern** (`RoasterSection.tsx` lines 65–70) — critical Phase 1 lesson:
```typescript
onFooterActionClicked={(e: CustomEvent) => {
  if (e.detail?.payload?.action?.label === 'Archive') handleArchive()
  else setShowArchive(false)
}}
onOpenedSet={(e: CustomEvent) => { if (!e.detail?.value) setShowArchive(false) }}
```
Use `e.detail?.payload?.action?.label` — NOT `e.detail?.action?.label` (see STATE.md Phase 1 lesson).

**RecordProvider create modal pattern** (`RoasterSection.tsx` lines 150–160):
```typescript
<RecordProvider
  table={ROASTER_TABLE}
  sysId="-1"
  isReadOnly={false}
  onFormSubmitCompleted={handleSaved}
>
  <div style={{ width: '100%' }}>
    <FormActionBar />
  </div>
  <FormColumnLayout />
</RecordProvider>
```
Copy exactly — substitute `ROASTER_TABLE` → `BEAN_TABLE`. `FormActionBar` must appear before `FormColumnLayout` inside `RecordProvider`.

**Detail view RecordProvider pattern** (`RoasterSection.tsx` lines 53–58):
```typescript
<RecordProvider table={ROASTER_TABLE} sysId={sysId} isReadOnly={false}>
  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--sp-md)' }}>
    <Button onClicked={() => setShowArchive(true)} variant="secondary" style={{ color: 'var(--aibrew-destructive)', border: '1px solid var(--aibrew-destructive)', borderRadius: '16px', padding: '4px 8px', fontSize: '14px', minHeight: '32px', backgroundColor: 'transparent' }}>Archive</Button>
  </div>
  <FormColumnLayout />
</RecordProvider>
```
Copy exactly. The `FormColumnLayout` inside a detail `RecordProvider` uses the existing record's `sysId` (not `"-1"`). Note: detail view does NOT include `FormActionBar` with `sysId="-1"` — that is create-only.

**Back navigation pattern** (`RoasterSection.tsx` line 21):
```typescript
const handleBack = () => navigateToView('catalog', { section: 'roasters' }, 'AIBrew — Roasters')
```
For beans: `navigateToView('catalog', { section: 'beans' }, 'AIBrew — Beans')`

**Row click navigation pattern** (`RoasterSection.tsx` lines 105–107):
```typescript
const handleRowClick = (sysId: string) => {
  navigateToView('catalog', { section: 'roasters', id: sysId }, 'AIBrew — Roaster')
}
```
For beans: `{ section: 'beans', id: sysId }`, title `'AIBrew — Bean'`.

**Export + params routing pattern** (`RoasterSection.tsx` lines 170–175):
```typescript
export default function RoasterSection({ params }: { params: URLSearchParams }) {
  const sysId = params.get('id')
  if (sysId) return <RoasterDetailView sysId={sysId} />
  return <RoasterListView />
}
```
Copy exactly — rename to `BeanSection`, `BeanDetailView`, `BeanListView`.

**New patterns to add on top of RoasterSection template (no codebase analog — use RESEARCH.md):**

- **In pantry / Empty bags tab state** — `useState<'pantry' | 'empty'>('pantry')` + `.filter()` partition of fetched beans array. Tab buttons use same `Button + borderBottom` style as `CatalogView.tsx` lines 51–70.
- **Scripted REST stock fetch** — `useEffect` with `cancelled` flag + `stockKey` dependency. See RESEARCH.md "Scripted REST client fetch" code example. Mirror the same `g_ck` guard + `cancelled` flag pattern from the list fetch above.
- **Stock progress bar** — plain `<div>` with child `<div>` width percentage. See RESEARCH.md Pattern 8. CSS vars: `--aibrew-ink-5` for track, `--aibrew-accent` for normal fill, `--aibrew-destructive` for low-stock fill.
- **"Add Beans" inline form** — controlled `useState` for `grams` + `purchaseDate`. `handleAddBeans` posts to `BEAN_PURCHASE_TABLE`. After success: `setStockKey(k => k + 1)` + `setHistoryKey(k => k + 1)`. See RESEARCH.md Pattern 6.
- **Purchase history list fetch** — same `useEffect + cancelled` pattern as list fetch. `sysparm_query: \`bean=${beanSysId}^ORDERBYDESCpurchase_date\``, `sysparm_limit: '20'`. See RESEARCH.md "Purchase history fetch" code example.

---

### `src/client/components/CatalogView.tsx` (edit — component, request-response)

**Self-edit — 3 changes only.**

**Change 1 — Disable flag** (`CatalogView.tsx` line 10):
```typescript
// Before:
{ id: 'beans', label: 'Beans', disabled: true  },
// After:
{ id: 'beans', label: 'Beans', disabled: false },
```

**Change 2 — Import** (after line 5, existing imports block):
```typescript
import BeanSection from './BeanSection'
```

**Change 3 — renderSection switch** (`CatalogView.tsx` lines 34–42):
```typescript
function renderSection() {
  switch (section) {
    case 'roasters':
      return <RoasterSection params={params} />
    case 'equipment':
      return <EquipmentSection params={params} />
    case 'beans':                              // ADD THIS CASE
      return <BeanSection params={params} />   // ADD THIS LINE
    default:
      return null
  }
}
```

---

### `src/fluent/index.now.ts` (edit — config)

**Self-edit — append 6 exports** (`index.now.ts` current lines 1–7):
```typescript
export { x_664529_aibrew_roaster } from './tables/roaster.now'
export { x_664529_aibrew_equipment } from './tables/equipment.now'
export { aibrew_user } from './roles/aibrew-user.now'
export { roaster_read, roaster_write, roaster_create, roaster_delete } from './acls/roaster-acls.now'
export { equipment_read, equipment_write, equipment_create, equipment_delete } from './acls/equipment-acls.now'
export { aibrew_menu, aibrew_home_module } from './navigator/aibrew-menu.now'
export { aibrew_home } from './ui-pages/aibrew-home.now'
```

**Append after the last existing line:**
```typescript
export { x_664529_aibrew_bean } from './tables/bean.now'
export { x_664529_aibrew_bean_purchase } from './tables/bean-purchase.now'
export { bean_read, bean_write, bean_create, bean_delete } from './acls/bean-acls.now'
export { bean_purchase_read, bean_purchase_write, bean_purchase_create, bean_purchase_delete } from './acls/bean-purchase-acls.now'
export { bean_stock_api } from './scripted-rest/bean-stock-api.now'
export { BeanStockHelper } from './script-includes/bean-stock-helper.now'
```

---

## Shared Patterns

### g_ck Guard (apply to every fetch call in BeanSection.tsx and bean-stock-handler.ts)

**Source:** `src/client/components/RoasterSection.tsx` lines 29–32 (client) and lines 89 (list)
```typescript
const g_ck = (window as any).g_ck
if (!g_ck) {
  setArchiveError('Session token not available — please reload the page.')
  return
}
```
In list fetches, the guard is applied as a conditional header spread: `...(g_ck ? { 'X-UserToken': g_ck } : {})` — this allows unauthenticated reads to proceed (platform handles 401) rather than blocking the fetch entirely.

### SysId Validation (apply before every URL interpolation involving a sysId)

**Source:** `src/client/components/RoasterSection.tsx` lines 10, 25–27
```typescript
const SYS_ID_RE = /^[0-9a-f]{32}$/i
// ...
if (!SYS_ID_RE.test(sysId)) {
  setArchiveError('Invalid record identifier.')
  return
}
```
Apply this before: PATCH calls in `handleArchive`, the Scripted REST fetch URL, the `bean_purchase` POST URL, and the purchase history fetch URL.

### Modal Footer Event Shape (apply to every Modal with footerActions)

**Source:** `src/client/components/RoasterSection.tsx` lines 65–70
```typescript
onFooterActionClicked={(e: CustomEvent) => {
  if (e.detail?.payload?.action?.label === 'Archive') handleArchive()
  else setShowArchive(false)
}}
```
Always use `e.detail?.payload?.action?.label`. Never `e.detail?.action?.label` (wrong — Phase 1 bug).

### cancelled-flag useEffect Pattern (apply to every async useEffect fetch)

**Source:** `src/client/components/RoasterSection.tsx` lines 85–103
```typescript
useEffect(() => {
  let cancelled = false
  // ... fetch ...
  .then(data => { if (!cancelled) setState(data) })
  .catch(() => { if (!cancelled) setError('...') })
  .finally(() => { if (!cancelled) setLoading(false) })
  return () => { cancelled = true }
}, [dependency])
```
Apply to: bean list fetch, per-bean stock fetch, detail stock fetch, purchase history fetch.

### PATCH body must use boolean (apply to every archive PATCH)

**Source:** `src/client/components/RoasterSection.tsx` line 39
```typescript
body: JSON.stringify({ active: false }),  // boolean false — NOT the string "false"
```
This was WR-04 fix from Phase 1. Do not regress.

### ACL file structure (apply to bean-acls.now.ts and bean-purchase-acls.now.ts)

**Source:** `src/fluent/acls/roaster-acls.now.ts` lines 1–35 (full file)

Four exports per file: `{table}_read`, `{table}_write`, `{table}_create`, `{table}_delete`. Each references `Now.ID['{table}_{operation}']`. All use `type: 'record'` and `roles: [aibrew_user]`.

### Role import path (apply to all ACL files)

**Source:** `src/fluent/acls/roaster-acls.now.ts` line 3
```typescript
import { aibrew_user } from '../roles/aibrew-user.now'
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/fluent/scripted-rest/bean-stock-api.now.ts` | config | request-response | No RestApi artifacts exist in codebase yet — use RESEARCH.md Pattern 3 |
| `src/fluent/script-includes/bean-stock-helper.now.ts` | config | request-response | No ScriptInclude artifacts exist in codebase yet — use RESEARCH.md Pattern 4 |
| `src/server/bean-stock-handler.ts` | service | request-response | No server module handlers exist in codebase yet — use RESEARCH.md Pattern 5 |
| `src/server/script-includes/BeanStockHelper.server.js` | service | batch/transform | No server-side JS files exist in codebase yet — use RESEARCH.md Pattern 4 (server JS portion) |

**New directories required before writing these files:**
- `src/fluent/scripted-rest/` (does not exist — verified in RESEARCH.md)
- `src/fluent/script-includes/` (does not exist — verified in RESEARCH.md)
- `src/server/` (does not exist — verified in RESEARCH.md)
- `src/server/script-includes/` (does not exist — verified in RESEARCH.md)

---

## Critical Pitfalls (extracted from Phase 1 lessons + RESEARCH.md)

| Pitfall | Rule | Source |
|---------|------|--------|
| Modal event shape | Use `e.detail?.payload?.action?.label` not `e.detail?.action?.label` | STATE.md Phase 1 + RoasterSection.tsx line 66 |
| Mutable stock column | Never add `remaining_g` as a column — computed only via GlideAggregate | CLAUDE.md Critical Pitfalls |
| PATCH body type | `JSON.stringify({ active: false })` — boolean, not string | RoasterSection.tsx line 39 (WR-04 fix) |
| ScriptInclude naming | `name`, `$id` key, `type:` in prototype, and `apiName` last segment must all equal `BeanStockHelper` | RESEARCH.md Pitfall 3 |
| Date format for purchase_date | Use `new Date().toISOString().slice(0, 10)` for `YYYY-MM-DD` default — never `toLocaleDateString()` | RESEARCH.md Pitfall 5 |
| Stock re-fetch after Add Beans | Increment `stockKey` + `historyKey` state after successful POST to trigger re-fetch | RESEARCH.md Pitfall 4 |
| index.now.ts exports | Every new `.now.ts` artifact must appear in `src/fluent/index.now.ts` or it will not deploy | RESEARCH.md Pitfall 7 |
| bean_purchase ACLs | bean_purchase needs its own 4 ACLs — not inherited from bean table | RESEARCH.md Pitfall 6 |

---

## Metadata

**Analog search scope:** `src/fluent/tables/`, `src/fluent/acls/`, `src/fluent/roles/`, `src/client/components/`
**Files read:** 8 (roaster.now.ts, equipment.now.ts, roaster-acls.now.ts, equipment-acls.now.ts, aibrew-user.now.ts, index.now.ts, RoasterSection.tsx, EquipmentSection.tsx, CatalogView.tsx)
**Pattern extraction date:** 2026-04-30
