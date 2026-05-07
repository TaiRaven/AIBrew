# Phase 6: Analytics - Pattern Map

**Mapped:** 2026-05-07
**Files analyzed:** 7 (3 new, 4 modified)
**Analogs found:** 7 / 7

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/client/components/AnalyticsView.tsx` | component | request-response | `src/client/components/HistoryView.tsx` | exact |
| `src/fluent/scripted-rest/analytics-api.now.ts` | config (REST definition) | request-response | `src/fluent/scripted-rest/bean-stock-api.now.ts` | exact |
| `src/server/analytics-handler.ts` | service | request-response | `src/server/bean-stock-handler.ts` | exact |
| `src/fluent/index.now.ts` (modify) | config (barrel export) | n/a | itself (line 12) | exact |
| `src/client/app.tsx` (modify) | component (router) | request-response | itself (line 74–75) | exact |
| `src/client/components/TopNav.tsx` (modify) | component | n/a | itself (line 10) | exact |
| `src/client/components/HomeView.tsx` (modify) | component | n/a | itself (line 21) | exact |

---

## Pattern Assignments

### `src/fluent/scripted-rest/analytics-api.now.ts` (config, request-response)

**Analog:** `src/fluent/scripted-rest/bean-stock-api.now.ts` (full file, 25 lines)

**Full file to replicate** (lines 1–25):
```typescript
import '@servicenow/sdk/global'
import { RestApi } from '@servicenow/sdk/core'
import { process } from '../../server/bean-stock-handler'

export const bean_stock_api = RestApi({
  $id: Now.ID['bean_stock_api'],
  name: 'Bean Stock API',
  serviceId: 'stock',
  consumes: 'application/json',
  versions: [
    { $id: Now.ID['bean_stock_api_v1'], version: 1, isDefault: true },
  ],
  routes: [
    {
      $id: Now.ID['bean_stock_get'],
      name: 'get stock',
      method: 'GET',
      path: '/{bean_sys_id}',
      version: 1,
      authentication: true,
      authorization: true,
      script: process,
    },
  ],
})
```

**Adaptations for analytics:**
- Import from `../../server/analytics-handler` (not bean-stock-handler)
- Export name: `analytics_api`
- `$id`: `Now.ID['analytics_api']`
- `name`: `'Analytics API'`
- `serviceId`: `'analytics'`
- Route `$id`: `Now.ID['analytics_summary_get']`
- Route `name`: `'get summary'`
- Route `path`: `'/summary'` (no path param — single summary endpoint per D-07)

---

### `src/server/analytics-handler.ts` (service, request-response)

**Analog:** `src/server/bean-stock-handler.ts` (full file, 43 lines)

**Imports pattern** (line 1):
```typescript
import { GlideRecord, gs } from '@servicenow/glide'
```
Note: Do NOT import `GlideAggregate` — D-09 mandates GlideRecord scan + JS-side averaging. The `gs` import is used only for `gs.error(...)` in the catch block.

**Handler function signature** (lines 3–4):
```typescript
export function process(request: any, response: any) {
  // no pathParams needed — this endpoint takes no URL parameters
```

**GlideRecord scan + JS-side aggregation pattern** (lines 25–32 of analog):
```typescript
// GlideAggregate SUM does not reliably aggregate DecimalColumn values
// (returns 0 in this scope even when records exist with non-null doses).
// Diagnostic confirmed: probe via GlideRecord finds correct sum; aggregate returns 0.
// Workaround: scan via GlideRecord and sum in JS — at home-brew volumes (hundreds
// of records max) the cost is negligible.
const brewScan = new GlideRecord('x_664529_aibrew_brew_log')
brewScan.addQuery('bean', beanSysId)
brewScan.query()
let totalUsed = 0
while (brewScan.next()) {
  const dose = brewScan.getValue('dose_weight_g')
  if (dose) totalUsed += parseFloat(dose)
}
```

**Adapted pattern for analytics** — three GlideRecord scans:
1. Trend scan: query `x_664529_aibrew_brew_log` with `ratingINT>0`, `ORDERBY brew_date ASC` (or `sys_created_on` if no dedicated date field), `setLimit(30)`. Collect `{ date: getValue('sys_created_on'), rating: parseInt(getValue('rating'), 10) }` per record.
2. By-bean scan: same table, `rating>0`, no limit. Build a `Map<beanSysId, { name, sum, count }>` via `getValue('bean')` + `getDisplayValue('bean')`, then compute avg in JS, sort desc.
3. By-method scan: same table, `rating>0`, no limit. Build `Map<method, { sum, count }>` via `getValue('method')`, compute avg in JS, sort desc.

**Error handling + response pattern** (lines 10, 34–42 of analog):
```typescript
try {
  // ... scans ...
  response.setBody({
    remaining_g: totalPurchased - totalUsed,
    total_purchased_g: totalPurchased,
  })
} catch (e) {
  gs.error('BeanStockHelper error: ' + e)
  response.setStatus(500)
  response.setBody({ error: 'Stock computation failed' })
}
```

**Adapted error message:** `gs.error('AnalyticsHandler error: ' + e)` and `{ error: 'Analytics computation failed' }`.

**Response body shape** (D-07):
```typescript
response.setBody({
  trend:     [ /* { date: string, rating: number } */ ],
  by_bean:   [ /* { name: string, avg: number, count: number } */ ],
  by_method: [ /* { method: string, avg: number, count: number } */ ],
})
```

---

### `src/client/components/AnalyticsView.tsx` (component, request-response)

**Analog:** `src/client/components/HistoryView.tsx`

**Imports pattern** (lines 1–5 of analog):
```typescript
import React, { useState, useEffect } from 'react'
```
No `Button`, `Modal`, `display`, `value`, or `navigateToView` needed — analytics view is read-only with no navigation actions and no reference-field resolution (server returns display strings directly).

**Method display map** (lines 13–21 of analog — copy verbatim):
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
Used in AnalyticsView to convert `by_method[].method` keys to display labels (UI-SPEC table, lines 267–276).

**sectionHeadingStyle** (lines 24–30 of analog — copy verbatim):
```typescript
const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: 'var(--aibrew-font-disp)',
  fontSize: '20px',
  fontWeight: 600,
  color: 'var(--aibrew-ink)',
  margin: '0 0 var(--sp-md) 0',
}
```
Applied to "Rating Trend", "Avg by Bean", "Avg by Method" section headings (D-06).

**Data fetch pattern** (lines 173–206 of analog):
```typescript
useEffect(() => {
  let cancelled = false
  setLoading(true)
  setError(null)
  const g_ck = (window as any).g_ck
  if (!g_ck) {
    setError('Session token not available — please reload.')
    setLoading(false)
    return
  }
  fetch(`/api/x_664529_aibrew/analytics/summary`, {
    headers: { Accept: 'application/json', 'X-UserToken': g_ck },
  })
    .then(r => r.json())
    .then(data => {
      if (!cancelled) {
        setData(data)
      }
    })
    .catch(() => { if (!cancelled) setError('Could not load analytics — try again.') })
    .finally(() => { if (!cancelled) setLoading(false) })
  return () => { cancelled = true }
}, [])
```
Note: Scripted REST base path is `/api/x_664529_aibrew/analytics/summary` (serviceId `analytics`, route `/summary`). The `cancelled` flag prevents state updates on unmounted component — keep this pattern.

**State shape** (adapted from HistoryView `loading`/`error`/`brews` state):
```typescript
const [data, setData]       = useState<{ trend: any[], by_bean: any[], by_method: any[] } | null>(null)
const [loading, setLoading] = useState(true)
const [error, setError]     = useState<string | null>(null)
```

**Loading skeleton pattern** (lines 341–357 of analog):
```typescript
if (loading) {
  return (
    <div>
      {[1, 2, 3].map(i => (
        <div
          key={i}
          style={{
            height: '72px',
            background: 'var(--aibrew-ink-5)',
            borderRadius: '6px',
            opacity: 0.4,
            marginBottom: '10px',
          }}
        />
      ))}
    </div>
  )
}
```
Adapt: three skeleton blocks at heights 120px / 80px / 80px. Use `var(--aibrew-ink-4)` at `opacity: 0.15` per UI-SPEC (lines 133–137).

**Error state pattern** (lines 361–373 of analog):
```typescript
if (error) {
  return (
    <div style={{
      padding: 'var(--sp-md)',
      border: '2px solid var(--aibrew-ink)',
      borderRadius: '6px',
      color: 'var(--aibrew-destructive)',
      fontFamily: 'var(--aibrew-font-body)',
    }}>
      {error}
    </div>
  )
}
```
UI-SPEC adds `fontSize: 16px` — include that. Error message is `'Could not load analytics — try again.'`.

**Empty state / placeholder pattern** (lines 375–397 of analog):
```typescript
<div style={{
  border: '2px dashed var(--aibrew-ink-4)',
  borderRadius: '8px',
  padding: 'var(--sp-xl)',
  textAlign: 'center',
  color: 'var(--aibrew-ink-3)',
  fontFamily: 'var(--aibrew-font-body)',
}}>
  <div style={{ fontSize: '16px' }}>No rated brews yet — rate a brew to see your trend.</div>
</div>
```
Apply per-section (D-11, D-12). Omit the emoji and "Start logging" button — analytics is read-only.

**Page container** (line 518 of analog):
```typescript
<div style={{ padding: '12px 16px 90px' }}>
```
Copy exactly — same container padding as HistoryView.

**Section wrapper** (UI-SPEC line 89, no analog exists — author fresh):
```typescript
<div style={{ background: 'var(--aibrew-paper-2)', borderRadius: '8px', padding: 'var(--sp-md)', marginBottom: 'var(--sp-lg)' }}>
```

**TrendChart sub-component** — inline SVG, no analog. Author per UI-SPEC specification:
- `<svg width="100%" height="160" viewBox="0 0 320 160" preserveAspectRatio="none">`
- Inner margins: top=12, right=16, bottom=28, left=28 → chart area x=28..304, y=12..132
- Y pixel formula: `132 - ((rating - 1) / 9) * 120`
- X pixel formula: `28 + (i / (n - 1)) * 276`
- 5 y-axis tick lines at ratings 2, 4, 6, 8, 10
- Up to 5 x-axis date labels at indices 0, floor(n/4), floor(n/2), floor(3n/4), n-1
- Date format: `new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric' })`
- Polyline: stroke `var(--aibrew-accent)`, strokeWidth 2, fill none
- Dots: r=4, fill `var(--aibrew-accent)`, stroke `var(--aibrew-paper)`, strokeWidth 1.5
- Minimum 2 data points to render; show placeholder otherwise

**HorizontalBarChart sub-component** — div-based rows, no analog. Author per UI-SPEC:
- Row: `display: flex; alignItems: center; marginBottom: var(--sp-sm)`
- Name column: `flex: 0 0 40%`, 14px/600, `var(--aibrew-ink)`, ellipsis overflow
- Count subtitle: 12px/400, `var(--aibrew-ink-3)` below name
- Bar column: `flex: 1; margin: 0 var(--sp-sm)`, position relative, track 8px `var(--aibrew-ink-4)` opacity 0.25, fill `var(--aibrew-accent)` at `(avg/10)*100%`
- Score column: `flex: 0 0 48px`, textAlign right, 14px/600
- Minimum 1 data point to render; show placeholder otherwise

---

### `src/fluent/index.now.ts` (modify — add export)

**Current line 12** (exact text):
```typescript
export { bean_stock_api } from './scripted-rest/bean-stock-api.now'
```

**Line to add** (same pattern, append after line 17 or grouped with scripted-rest export at line 12):
```typescript
export { analytics_api } from './scripted-rest/analytics-api.now'
```

The handler (`analytics-handler.ts`) lives in `src/server/` and is imported directly by the API definition file — it does NOT need its own export from `index.now.ts`. Only the `RestApi` artifact (the `.now.ts` file) is exported. This matches the bean-stock pattern exactly: `bean_stock_api` is exported; `process` from `bean-stock-handler.ts` is not.

---

### `src/client/app.tsx` (modify — line 75)

**Current line 75** (exact text):
```typescript
      case 'analytics':
        return <DisabledView view={view} />
```

**Replacement:**
```typescript
      case 'analytics':
        return <AnalyticsView />
```

**Import to add** (after line 6 `import HistoryView`):
```typescript
import AnalyticsView from './components/AnalyticsView'
```

No other changes to app.tsx. `DisabledView` definition (lines 17–28) can remain — it is still used to handle unknown views if any; removing it is out of scope.

---

### `src/client/components/TopNav.tsx` (modify — line 10)

**Current line 10** (exact text):
```typescript
  { id: 'analytics', label: 'Analytics', disabled: true  },
```

**Replacement:**
```typescript
  { id: 'analytics', label: 'Analytics', disabled: false },
```

Single character change. No other modifications to TopNav.tsx.

---

### `src/client/components/HomeView.tsx` (modify — line 21)

**Current line 21** (exact text):
```typescript
  { id: 'analytics', label: 'Analytics', description: '',                    active: false },
```

**Replacement:**
```typescript
  { id: 'analytics', label: 'Analytics', description: 'Your brew patterns', active: true,  view: 'analytics' },
```

The `view` property is required — `TileCard.handleClicked` checks `tile.view` before calling `navigateToView` (HomeView.tsx line 29). Without it the tile click is a no-op.

---

## Shared Patterns

### g_ck Token Guard
**Source:** `src/client/components/HistoryView.tsx` lines 178–183
**Apply to:** `AnalyticsView.tsx` fetch effect
```typescript
const g_ck = (window as any).g_ck
if (!g_ck) {
  setError('Session token not available — please reload.')
  setLoading(false)
  return
}
```

### Cancellation Flag
**Source:** `src/client/components/HistoryView.tsx` lines 174, 198, 203–205
**Apply to:** `AnalyticsView.tsx` fetch effect
```typescript
let cancelled = false
// ... inside .then():
if (!cancelled) { /* set state */ }
// ... inside .catch():
if (!cancelled) setError('...')
// ... inside .finally():
if (!cancelled) setLoading(false)
return () => { cancelled = true }
```

### GlideRecord Scan Workaround Comment
**Source:** `src/server/bean-stock-handler.ts` lines 20–24
**Apply to:** `src/server/analytics-handler.ts` (copy comment verbatim, substituting relevant field names)
```typescript
// GlideAggregate SUM does not reliably aggregate DecimalColumn values
// (returns 0 in this scope even when records exist with non-null doses).
// Diagnostic confirmed: probe via GlideRecord finds correct sum; aggregate returns 0.
// Workaround: scan via GlideRecord and sum in JS — at home-brew volumes (hundreds
// of records max) the cost is negligible.
```

### Error Response Pattern
**Source:** `src/server/bean-stock-handler.ts` lines 38–42
**Apply to:** `src/server/analytics-handler.ts` catch block
```typescript
} catch (e) {
  gs.error('AnalyticsHandler error: ' + e)
  response.setStatus(500)
  response.setBody({ error: 'Analytics computation failed' })
}
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `TrendChart` (inline in AnalyticsView) | component | transform | No SVG chart components exist in the codebase |
| `HorizontalBarChart` (inline in AnalyticsView) | component | transform | No bar chart components exist in the codebase |

Both sub-components must be authored from scratch using the UI-SPEC dimensions (viewBox, margins, pixel formulas, colors) documented above.

---

## Metadata

**Analog search scope:** `src/fluent/scripted-rest/`, `src/server/`, `src/client/components/`, `src/client/app.tsx`, `src/fluent/index.now.ts`
**Files scanned:** 7
**Pattern extraction date:** 2026-05-07
