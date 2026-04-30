# Phase 2: Bean Catalog & Inventory - Research

**Researched:** 2026-04-30
**Domain:** ServiceNow Fluent/now-sdk — scoped tables, Scripted REST API, Script Include, React 18 + @servicenow/react-components
**Confidence:** HIGH (all critical claims verified via SDK docs or existing codebase)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Bean list has two tabs: "In pantry" (remaining > 0) and "Empty bags" (remaining ≤ 0). Default tab is "In pantry".
- **D-02:** Each bean list row shows: name, roaster name, origin, and a stock progress bar (visual, not just text). Low-stock badge (≤ 50 g remaining) shown inline.
- **D-03:** Progress bar format in the list row: compact bar + `133g / 250g` label. Denominator = total grams ever purchased; numerator = total purchased minus total used in brews (0 in Phase 2).
- **D-04:** Bean detail follows Phase 1 pattern: `RecordProvider + FormColumnLayout` for bean type fields (name, origin, roast level, roast date, roaster reference).
- **D-05:** Below the bean form, stock progress bar displayed prominently: `133g / 250g` numerical format alongside visual bar. Low-stock badge appears here too when ≤ 50 g.
- **D-06:** Below the stock bar, "Add Beans" section provides a mini inline form for logging a new bag purchase. Fields: grams (required, number) and purchase date (required, default today). Action label is "Add Beans".
- **D-07:** Below "Add Beans" form, purchase history list shows all individual purchase records chronologically (newest first): date + grams per row. Cap at 20 most recent.
- **D-08:** Creating a new bean type uses the standard create modal: "New bean" button on list → Modal → `RecordProvider sysId="-1"` + `FormActionBar` + `FormColumnLayout`. Fields: name, origin, roast level, roast date, roaster reference.
- **D-09:** Archiving a bean: Modal confirmation + PATCH `active: false`. Archived beans disappear from both tabs (soft-delete, not a stock state).
- **D-10:** Computed stock from Scripted REST API endpoint: `/api/x_664529_aibrew/v1/stock/<bean_sysId>`. Uses GlideAggregate to SUM `bean_purchase.grams` and (Phase 4+) SUM `brew_log.dose_weight_g`. Never a stored column.
- **D-11:** Low-stock threshold: 50 g (hardcoded). No user-configurable threshold in Phase 2.
- **Scope prefix:** `x_664529_aibrew`
- **Phase boundary:** In Phase 2, remaining stock = total purchased grams only (no brew deductions yet). Scripted REST schema is designed to subtract brew dose weights once Phase 4 exists.

### Claude's Discretion

- Exact roast level choices for ChoiceColumn (e.g., light / medium-light / medium / medium-dark / dark / extra-dark) — follow coffee industry convention.
- Visual styling of the progress bar (colour at normal vs low-stock state) — use `--aibrew-accent` for normal, `--aibrew-destructive` for ≤ 50 g.
- Stock API response shape — keep it simple: `{ remaining_g, total_purchased_g }`.
- Pagination/limit for purchase history list — cap at 20 most recent purchases.
- Whether to show a spinner while stock loads vs optimistic empty state — show a loading skeleton on the stock bar.

### Deferred Ideas (OUT OF SCOPE)

- User-configurable low-stock threshold per bean (INV-05) — v2 requirement.
- Purchase price per bag and cost-per-cup metrics (INV-06) — v2 requirement.
- Brew depletions in inventory history — shown once Phase 4 is built; history shows purchases only in Phase 2.
- Pagination of purchase history — deferred; cap at 20 records for Phase 2.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CAT-04 | User can create a bean type record linked to a roaster, with name, origin, roast level, and roast date | Table definition: ReferenceColumn(roaster), ChoiceColumn(roast_level), DateColumn(roast_date), StringColumn(origin). Create modal pattern identical to Phase 1. |
| CAT-05 | User can view and edit bean type records | Detail view with RecordProvider + FormColumnLayout + FormActionBar — exact Phase 1 pattern. |
| CAT-06 | User can archive a bean type — archived beans no longer appear in active pickers but brew log references are preserved | PATCH active=false, active=true filter on list query. Same pattern as Phase 1. |
| INV-01 | User can log a bean purchase (grams and date) linked to a bean type record | Inline "Add Beans" form on detail view: direct Table API POST to bean_purchase table, not RecordProvider (avoids form layout complexity for a 2-field form). |
| INV-02 | User can view remaining stock (g) on the bean detail page — computed live as sum of purchases minus sum of logged dose weights for that bean | Scripted REST GET `/api/x_664529_aibrew/v1/stock/{bean_sysId}` backed by Script Include using GlideAggregate. React fetch in useEffect, loading skeleton on stock bar. |
| INV-03 | A low-stock badge appears on a bean when remaining stock falls below 50 g | Client-side conditional: if `remaining_g < 50` render badge. Threshold hardcoded at 50. |
| INV-04 | User can view a chronological inventory history for a bean showing all purchases and brews with their gram amounts | Table API fetch on `bean_purchase` table filtered by `bean=<sysId>`, ordered newest first, limit 20. Brew entries: placeholder/empty in Phase 2; schema designed for Phase 4 addition. |
</phase_requirements>

---

## Summary

Phase 2 adds two new scoped tables (`x_664529_aibrew_bean` and `x_664529_aibrew_bean_purchase`), a Scripted REST API endpoint for computed stock, a Script Include for the GlideAggregate logic, and the Bean section React component in `CatalogView`. The client architecture is a direct extension of the Phase 1 Roaster/Equipment pattern — the same `RecordProvider + FormColumnLayout + FormActionBar` form pattern, the same Table API fetch loop with `cancelled` flag and `g_ck` guard, and the same PATCH-based archive flow. The only genuinely new code patterns are: (1) the Fluent `RestApi` artifact with a path-parameter route, (2) the `ScriptInclude` artifact backed by a `Now.include()` server JS file, and (3) the client-side stock bar UI rendered from Scripted REST data.

The "In pantry" / "Empty bags" tab split is implemented purely in client state — the list view fetches all active beans with their stock figures from the Scripted REST API (or a bulk endpoint), then partitions them into two arrays based on `remaining_g`. No separate Table API query per tab is needed. The `@servicenow/react-components/Button` tab pattern already used in `CatalogView.tsx`'s SUB_NAV is the right model for the in-pantry/empty-bags switcher within the BeanListView.

The stock progress bar has no dedicated component in `@servicenow/react-components` — it is a plain HTML `<div>` with inline CSS width percentage, styled with CSS custom properties already established in the project. The "Add Beans" inline form is a controlled React form with two fields (number input + date input) submitting via a direct Table API POST, not a `RecordProvider` (a RecordProvider for `bean_purchase` would require the full FormColumnLayout and FormActionBar pattern, which is overkill for a 2-field form and would lose the detail view context). This is the recommended approach for sub-forms that are intentionally minimal.

**Primary recommendation:** Copy `RoasterSection.tsx` as the starting template for `BeanSection.tsx`, add the stock bar and "Add Beans" inline form to the detail view, implement the Scripted REST API using the `RestApi` Fluent artifact with an external module handler (the preferred SDK pattern over inline scripts), and back it with a `ScriptInclude` that performs the GlideAggregate computation.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Bean CRUD (create/view/edit/archive) | Frontend (React) | API (Table API) | RecordProvider + FormColumnLayout handles form rendering; Table API handles persistence — same as Phase 1 |
| Bean list with tab split (pantry / empty) | Frontend (React) | — | Pure client-state partition of fetched array — no server-side query needed |
| Stock computation (GlideAggregate) | API/Backend (Scripted REST + Script Include) | — | GlideAggregate runs server-side only; cannot be replicated in Table API or client |
| Stock display (progress bar, badge) | Frontend (React) | — | Client renders visual from Scripted REST response values |
| Purchase logging ("Add Beans") | Frontend (React) | API (Table API) | Controlled inline form submits direct Table API POST; no RecordProvider needed |
| Purchase history list | Frontend (React) | API (Table API) | Table API fetch on bean_purchase, filtered by bean sysId, ordered newest first |
| ACL enforcement | API (ServiceNow platform) | — | Scoped ACLs on both new tables; same pattern as Phase 1 |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@servicenow/sdk` | 4.6.0 | Fluent DSL — table, ACL, RestApi, ScriptInclude artifacts | Project standard; already installed [VERIFIED: package.json] |
| `@servicenow/glide` | 27.0.5 | Typed Glide API imports for server-side modules | Project standard; already installed [VERIFIED: package.json] |
| `react` | 18.2.0 | UI component runtime | Project standard [VERIFIED: package.json] |
| `@servicenow/react-components` | ^0.1.0 | ServiceNow React UI primitives (Button, Modal, RecordProvider, etc.) | Project standard [VERIFIED: package.json] |

### Fluent Artifact Types Used in Phase 2

| Artifact | SDK Import | File Location Pattern | When Used |
|----------|-----------|----------------------|-----------|
| `Table` | `@servicenow/sdk/core` | `src/fluent/tables/*.now.ts` | Bean and bean_purchase table definitions |
| `Acl` | `@servicenow/sdk/core` | `src/fluent/acls/*.now.ts` | 4 ACLs per table (read/write/create/delete) |
| `RestApi` | `@servicenow/sdk/core` | `src/fluent/scripted-rest/*.now.ts` | Stock computation endpoint |
| `ScriptInclude` | `@servicenow/sdk/core` | `src/fluent/script-includes/*.now.ts` | GlideAggregate stock logic |

**New directory needed:** `src/fluent/scripted-rest/` and `src/fluent/script-includes/` do not yet exist — create them. [VERIFIED: ls of src/fluent/]

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Direct Table API POST for "Add Beans" | RecordProvider sysId="-1" + FormActionBar | RecordProvider shows full FormColumnLayout; 2-field inline form needs controlled state only |
| Scripted REST for stock | Inline GlideAggregate in RestApi route script | SDK guide explicitly recommends module handler over inline scripts for maintainability |
| Client tab state for pantry/empty split | Two separate Table API fetches | Single fetch + client partition avoids N+1 REST calls and is simpler |

---

## Architecture Patterns

### System Architecture Diagram

```
Browser (React)
  │
  ├─ BeanSection (list view)
  │   ├─ Tab state: "In pantry" | "Empty bags"
  │   ├─ Table API GET /api/now/table/x_664529_aibrew_bean (active=true)
  │   │   └─ Returns: sys_id, name, origin, roaster.display_value
  │   ├─ Scripted REST GET /api/x_664529_aibrew/v1/stock/{sysId}  ← per-row
  │   │   └─ Returns: { remaining_g, total_purchased_g }
  │   └─ Renders row: name + roaster + origin + progress bar → click → detail
  │
  ├─ BeanSection (detail view)
  │   ├─ RecordProvider (table=bean, sysId) + FormColumnLayout + FormActionBar
  │   ├─ Scripted REST GET /api/x_664529_aibrew/v1/stock/{sysId}
  │   │   └─ Stock bar: width = remaining_g/total_purchased_g × 100%
  │   │   └─ Low-stock badge: remaining_g < 50
  │   ├─ "Add Beans" inline form (controlled React state)
  │   │   └─ Table API POST /api/now/table/x_664529_aibrew_bean_purchase
  │   │       body: { bean: sysId, grams: N, purchase_date: "YYYY-MM-DD" }
  │   └─ Purchase history list
  │       └─ Table API GET /api/now/table/x_664529_aibrew_bean_purchase
  │           sysparm_query=bean=<sysId>^ORDERBYDESCpurchase_date
  │           sysparm_limit=20
  │
ServiceNow Platform
  │
  ├─ Scripted REST API: x_664529_aibrew / v1 / stock / {bean_sysId}
  │   └─ Route handler module → calls BeanStockHelper script include
  │
  └─ BeanStockHelper (Script Include)
      ├─ GlideAggregate SUM bean_purchase.grams WHERE bean=sysId
      └─ (Phase 4+) GlideAggregate SUM brew_log.dose_weight_g WHERE bean=sysId
          └─ response: { remaining_g, total_purchased_g }
```

### Recommended Project Structure (additions for Phase 2)

```
src/
├── fluent/
│   ├── tables/
│   │   ├── bean.now.ts                    # new
│   │   └── bean-purchase.now.ts           # new
│   ├── acls/
│   │   ├── bean-acls.now.ts               # new (4 ACLs)
│   │   └── bean-purchase-acls.now.ts      # new (4 ACLs)
│   ├── scripted-rest/                     # new directory
│   │   └── bean-stock-api.now.ts          # new
│   ├── script-includes/                   # new directory
│   │   └── bean-stock-helper.now.ts       # new
│   └── index.now.ts                       # extend with new exports
├── server/
│   ├── script-includes/
│   │   └── BeanStockHelper.server.js      # new (GlideAggregate logic)
│   └── bean-stock-handler.ts              # new (RestApi route module)
└── client/
    └── components/
        └── BeanSection.tsx                # new
```

Note: The `src/server/` directory does not yet exist. The SDK guide documents the pattern `src/server/script-includes/` for script include JS files and `src/server/` for module route handlers. [CITED: sdk scripted-rest-api-guide, script-include-guide]

### Pattern 1: Fluent Table with ReferenceColumn and ChoiceColumn

**What:** Bean table with reference to roaster, choice column for roast level, date column for roast date.
**When to use:** Any table needing a foreign key to another scoped table and a constrained picklist.

```typescript
// Source: referencecolumn-api, choicecolumn-api, datecolumn-api (SDK docs)
import '@servicenow/sdk/global'
import { Table, StringColumn, BooleanColumn, ChoiceColumn, ReferenceColumn, DateColumn } from '@servicenow/sdk/core'
import { x_664529_aibrew_roaster } from './roaster.now'

export const x_664529_aibrew_bean = Table({
  name: 'x_664529_aibrew_bean',
  label: 'Bean',
  display: 'name',
  schema: {
    name:        StringColumn({ label: 'Name', mandatory: true, maxLength: 100 }),
    origin:      StringColumn({ label: 'Origin', maxLength: 100 }),
    roast_level: ChoiceColumn({
      label: 'Roast Level',
      choices: {
        light:        { label: 'Light' },
        medium_light: { label: 'Medium-Light' },
        medium:       { label: 'Medium' },
        medium_dark:  { label: 'Medium-Dark' },
        dark:         { label: 'Dark' },
        extra_dark:   { label: 'Extra Dark' },
      },
    }),
    roast_date:  DateColumn({ label: 'Roast Date' }),
    roaster:     ReferenceColumn({ label: 'Roaster', referenceTable: 'x_664529_aibrew_roaster', mandatory: true }),
    active:      BooleanColumn({ label: 'Active', default: true }),
  },
})
```

### Pattern 2: Fluent Table for Purchase Ledger (bean_purchase)

**What:** Lightweight ledger row: reference to bean, integer grams, date of purchase, active flag.
**When to use:** Any ledger/event table that records discrete transactions.

```typescript
// Source: integercolumn-api, datecolumn-api, referencecolumn-api (SDK docs)
import '@servicenow/sdk/global'
import { Table, IntegerColumn, DateColumn, BooleanColumn, ReferenceColumn } from '@servicenow/sdk/core'
import { x_664529_aibrew_bean } from './bean.now'

export const x_664529_aibrew_bean_purchase = Table({
  name: 'x_664529_aibrew_bean_purchase',
  label: 'Bean Purchase',
  display: 'bean',
  schema: {
    bean:          ReferenceColumn({ label: 'Bean', referenceTable: 'x_664529_aibrew_bean', mandatory: true }),
    grams:         IntegerColumn({ label: 'Grams', mandatory: true }),
    purchase_date: DateColumn({ label: 'Purchase Date', mandatory: true }),
    active:        BooleanColumn({ label: 'Active', default: true }),
  },
})
```

### Pattern 3: Scripted REST API with Module Handler

**What:** Fluent `RestApi` artifact with a path-parameter route; handler lives in a separate TS module.
**When to use:** Any server-side aggregation or computation that the Table API cannot perform.

```typescript
// Source: restapi-api, scripted-rest-api-guide (SDK docs)
// File: src/fluent/scripted-rest/bean-stock-api.now.ts
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
    },
  ],
})
```

**Resulting URI:** `/api/x_664529_aibrew/v1/stock/{bean_sys_id}`

The `script` property on the route accepts a function import when using module handlers. [CITED: sdk restapi-api]

### Pattern 4: Script Include with Now.include()

**What:** `ScriptInclude` Fluent artifact pointing to an external `.js` file via `Now.include()`.
**When to use:** Server-side reusable logic using `Class.create()`. ES6 class syntax is not supported for script includes on the platform. Glide APIs (GlideRecord, GlideAggregate, gs) are auto-available — do NOT import them. [CITED: sdk script-include-guide]

```typescript
// Source: scriptinclude-api (SDK docs)
// File: src/fluent/script-includes/bean-stock-helper.now.ts
import '@servicenow/sdk/global'
import { ScriptInclude } from '@servicenow/sdk/core'

export const BeanStockHelper = ScriptInclude({
  $id: Now.ID['BeanStockHelper'],
  name: 'BeanStockHelper',
  active: true,
  apiName: 'x_664529_aibrew.BeanStockHelper',
  script: Now.include('../../server/script-includes/BeanStockHelper.server.js'),
})
```

**Corresponding server JS file (`src/server/script-includes/BeanStockHelper.server.js`):**

```javascript
// Do NOT import Glide APIs — they are auto-available in ScriptInclude context
var BeanStockHelper = Class.create()
BeanStockHelper.prototype = {
  initialize: function() {},

  getStock: function(beanSysId) {
    var purchaseAgg = new GlideAggregate('x_664529_aibrew_bean_purchase')
    purchaseAgg.addAggregate('SUM', 'grams')
    purchaseAgg.addQuery('bean', beanSysId)
    purchaseAgg.query()
    var totalPurchased = 0
    if (purchaseAgg.next()) {
      totalPurchased = parseInt(purchaseAgg.getAggregate('SUM', 'grams') || '0', 10)
    }

    // Phase 4+: subtract brew depletions
    // var brewAgg = new GlideAggregate('x_664529_aibrew_brew_log')
    // brewAgg.addAggregate('SUM', 'dose_weight_g')
    // brewAgg.addQuery('bean', beanSysId)
    // brewAgg.query()
    // var totalUsed = brewAgg.next() ? parseInt(brewAgg.getAggregate('SUM', 'dose_weight_g') || '0', 10) : 0
    var totalUsed = 0

    return { remaining_g: totalPurchased - totalUsed, total_purchased_g: totalPurchased }
  },

  type: 'BeanStockHelper',
}
```

### Pattern 5: RestApi Route Module Handler

**What:** TypeScript module that handles the Scripted REST request, calls the Script Include, and sets the response body. Glide APIs MUST be imported from `@servicenow/glide` in module files. [CITED: sdk module-guide]

```typescript
// Source: module-guide (SDK docs)
// File: src/server/bean-stock-handler.ts
import { gs } from '@servicenow/glide'

export function process(request: any, response: any) {
  const beanSysId = request.pathParams.bean_sys_id
  if (!beanSysId || !/^[0-9a-f]{32}$/i.test(beanSysId)) {
    response.setStatus(400)
    response.setBody({ error: 'Invalid bean_sys_id' })
    return
  }
  try {
    // Script Includes are available globally in server-side module context
    const helper = new (global as any).BeanStockHelper()
    const stock = helper.getStock(beanSysId)
    response.setBody(stock)
  } catch (e) {
    gs.error('BeanStockHelper error: ' + e)
    response.setStatus(500)
    response.setBody({ error: 'Stock computation failed' })
  }
}
```

**Important:** Calling a Script Include from a module requires `(global as any).ClassName()` because Script Includes are not importable via ES module syntax. [ASSUMED — based on platform behaviour; verify if SDK provides a typed import pattern for this]

### Pattern 6: Inline "Add Beans" Form (Controlled React)

**What:** Two-field controlled form on the detail view that POSTs directly to the Table API.
**When to use:** Sub-forms with 2 fields where RecordProvider/FormColumnLayout is excessive.

```tsx
// Source: Phase 1 Table API fetch pattern (VERIFIED: RoasterSection.tsx)
const [grams, setGrams] = useState('')
const [purchaseDate, setPurchaseDate] = useState(todayISO())
const [addError, setAddError] = useState('')
const [addLoading, setAddLoading] = useState(false)

const handleAddBeans = async () => {
  setAddError('')
  const g_ck = (window as any).g_ck
  if (!g_ck) { setAddError('Session token not available.'); return }
  const gramsNum = parseInt(grams, 10)
  if (!grams || isNaN(gramsNum) || gramsNum <= 0) { setAddError('Enter a valid number of grams.'); return }
  if (!purchaseDate) { setAddError('Enter a purchase date.'); return }
  setAddLoading(true)
  try {
    const res = await fetch(`/api/now/table/x_664529_aibrew_bean_purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-UserToken': g_ck },
      body: JSON.stringify({ bean: beanSysId, grams: gramsNum, purchase_date: purchaseDate }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    setGrams('')
    setPurchaseDate(todayISO())
    // Trigger stock and history re-fetch
    setStockKey(k => k + 1)
    setHistoryKey(k => k + 1)
  } catch {
    setAddError("Couldn't save purchase — try again.")
  } finally {
    setAddLoading(false)
  }
}
```

### Pattern 7: Client-Side Tab Split for List View

**What:** State variable tracks active tab; a single fetched array is partitioned via `.filter()`.
**When to use:** Any two-state list where both sets come from the same query.

```tsx
// Source: CatalogView.tsx SUB_NAV pattern (VERIFIED: existing code)
const [activeTab, setActiveTab] = useState<'pantry' | 'empty'>('pantry')

// After fetching all beans + their stock:
const pantryBeans = beansWithStock.filter(b => b.remaining_g > 0)
const emptyBeans  = beansWithStock.filter(b => b.remaining_g <= 0)
const displayed   = activeTab === 'pantry' ? pantryBeans : emptyBeans

// Tab buttons use same Button + borderBottom pattern as CatalogView SUB_NAV
```

**Key decision:** Fetching stock per-bean for the list view requires N Scripted REST calls (one per bean). For Phase 2 with a small personal coffee collection (< 20 beans typically), this is acceptable. A bulk endpoint (POST body with array of sysIds) could be added in a future phase. [ASSUMED — acceptability based on typical single-user collection size]

### Pattern 8: Stock Progress Bar (CSS only, no component)

**What:** A `<div>` with a child `<div>` whose width is a percentage of remaining/total.
**When to use:** `@servicenow/react-components` has no progress bar component. [VERIFIED: package.json lists only Button, Modal, RecordProvider, FormColumnLayout, FormActionBar in usage — no progress component]

```tsx
// Source: Phase 1 CSS variable conventions (VERIFIED: RoasterSection.tsx)
const pct = totalPurchasedG > 0 ? Math.min(100, (remainingG / totalPurchasedG) * 100) : 0
const isLowStock = remainingG < 50 && remainingG > 0
const barColor = isLowStock ? 'var(--aibrew-destructive)' : 'var(--aibrew-accent)'

<div style={{ background: 'var(--aibrew-ink-5)', borderRadius: '4px', height: '8px', width: '100%' }}>
  <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: '4px', transition: 'width 0.3s ease' }} />
</div>
<div style={{ fontFamily: 'var(--aibrew-font-body)', fontSize: '14px', color: 'var(--aibrew-ink-3)', marginTop: '4px' }}>
  {remainingG}g / {totalPurchasedG}g
</div>
{isLowStock && (
  <span style={{ background: 'var(--aibrew-destructive)', color: '#fff', borderRadius: '8px', padding: '2px 8px', fontSize: '12px', fontWeight: 600 }}>
    Low stock
  </span>
)}
```

**Loading skeleton for stock bar:**

```tsx
{stockLoading && (
  <div style={{ background: 'var(--aibrew-ink-5)', borderRadius: '4px', height: '8px', width: '60%', animation: 'pulse 1.5s infinite' }} />
)}
```

### Anti-Patterns to Avoid

- **Storing remaining_g as a column:** CLAUDE.md explicitly forbids this. Computed-only via GlideAggregate.
- **Using `new GlideDateTime()` for today's default date in React:** Use `new Date().toISOString().slice(0, 10)` on the client side to get `YYYY-MM-DD`.
- **Using `gs.nowDateTime()` in server modules:** Not allowed in scoped apps — use `new GlideDateTime().getDisplayValue()` instead. [CITED: sdk module-guide]
- **Importing Glide APIs inside ScriptInclude class files:** They are auto-available in Script Include execution context — importing causes errors. [CITED: sdk script-include-guide]
- **Writing inline scripts in RestApi route:** SDK guide says "Never use inline scripts for complex handlers — import functions from server modules." [CITED: sdk scripted-rest-api-guide]
- **Omitting `active=true` filter on bean list query:** Both tables have `active` column — always include `sysparm_query=active=true` to exclude archived records.
- **Forgetting `version` on RestApi routes when versions array is used:** Routes without a `version` will not be accessible through versioned URIs. [CITED: sdk scripted-rest-api-guide]
- **Using ES6 `class` syntax in Script Include JS files:** Not supported on the platform — must use `Class.create()` with prototype. [CITED: sdk script-include-guide]
- **Omitting the `Array.from` polyfill in index.html:** Every new UiPage `index.html` needs the CDATA-wrapped polyfill before the module script tag or the page renders blank. (Phase 2 extends the existing `aibrew-home` UiPage — no new HTML file needed, polyfill already present.) [VERIFIED: src/client/index.html referenced in CLAUDE.md]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Aggregated stock computation | Custom client-side sum from raw Table API records | Scripted REST + GlideAggregate | Table API cannot aggregate; client-side summation breaks if > sysparm_limit records exist |
| Form save in RecordProvider | Programmatic `gForm.save()` or fetch PATCH | `FormActionBar` inside `RecordProvider` | Platform lesson from Phase 1 UAT: `FormActionBar` is the correct save mechanism |
| Tab UI | Custom CSS tab component | `Button` + `borderBottom` state pattern (from `CatalogView.tsx`) | Already established project pattern; consistent with existing nav |
| Record archive | Hard-delete (DELETE HTTP method) | PATCH `{ active: false }` | Soft-delete preserves historical brew log references (Phase 4 dependency) |
| SysId validation | Ad-hoc string check | `const SYS_ID_RE = /^[0-9a-f]{32}$/i` (CR-01 fix from Phase 1) | Prevents path injection in Table API URLs |

**Key insight:** The GlideAggregate pattern is the only correct solution for inventory totals in ServiceNow — it handles records beyond any `sysparm_limit` and runs server-side, preventing client-side discrepancies.

---

## Common Pitfalls

### Pitfall 1: N+1 Scripted REST Calls for List Stock Bars

**What goes wrong:** Rendering a stock bar on every bean list row triggers one Scripted REST call per bean on mount.
**Why it happens:** The detail view pattern (1 call for 1 bean) works fine; applying it naively to a list multiplies calls.
**How to avoid:** For Phase 2, accept N calls since the collection is small (personal use, typically < 20 beans). Use `Promise.all()` to fan out calls in parallel rather than sequentially. If Phase 2 UAT shows slowness, create a bulk `/api/x_664529_aibrew/v1/stock` POST endpoint.
**Warning signs:** List view takes > 2 seconds to load on a typical instance.

### Pitfall 2: Modal footer event shape (Phase 1 lesson)

**What goes wrong:** `e.detail.action.label` is undefined; Archive handler never fires.
**Why it happens:** The `Modal` component fires `onFooterActionClicked` with `e.detail.payload.action.label`, not `e.detail.action.label`.
**How to avoid:** Always use `e.detail?.payload?.action?.label` to read the clicked footer action label. [VERIFIED: STATE.md Phase 1 lessons]
**Warning signs:** Archive button click has no effect.

### Pitfall 3: ScriptInclude name/class/type mismatch

**What goes wrong:** Script Include fails to instantiate at runtime.
**Why it happens:** The `name` property in the Fluent definition, the `Class.create` variable name, the prototype `type`, and the `apiName` last segment must all match exactly.
**How to avoid:** Use `BeanStockHelper` consistently in all four places. [CITED: sdk script-include-guide]
**Warning signs:** "Could not find script include" errors in the platform log.

### Pitfall 4: Stock showing 0 immediately after "Add Beans"

**What goes wrong:** User submits "Add Beans" form; stock bar still shows 0/old value.
**Why it happens:** The Scripted REST fetch for stock is not re-triggered after the POST.
**How to avoid:** After a successful bean_purchase POST, increment a `stockKey` state variable that is in the `useEffect` dependency array for the stock fetch. Same as `listKey` pattern used in Phase 1.

### Pitfall 5: Date field format mismatch

**What goes wrong:** Table API rejects `purchase_date` value; purchase record not created.
**Why it happens:** ServiceNow Date fields expect `YYYY-MM-DD` format; JavaScript `Date.toLocaleDateString()` returns locale-dependent formats.
**How to avoid:** Always derive today's default with `new Date().toISOString().slice(0, 10)` which reliably produces `YYYY-MM-DD`.

### Pitfall 6: ACLs missing on bean_purchase table

**What goes wrong:** Purchase POST returns 403 for non-admin users.
**Why it happens:** The bean_purchase table needs its own 4 ACLs (read/write/create/delete) — ACLs are not inherited from the parent bean table.
**How to avoid:** Create `bean-purchase-acls.now.ts` alongside `bean-acls.now.ts` and export both from `index.now.ts`. [VERIFIED: Phase 1 pattern — equipment table has its own ACL file]

### Pitfall 7: Forgetting index.now.ts exports

**What goes wrong:** SDK build succeeds but new tables/ACLs/REST API are not deployed to the instance.
**Why it happens:** `src/fluent/index.now.ts` must explicitly export every Fluent artifact.
**How to avoid:** After creating every new `.now.ts` file, add its export to `index.now.ts`. [VERIFIED: existing index.now.ts — roaster, equipment, ACLs, navigator, ui-page all explicitly exported]

---

## Code Examples

### GlideAggregate stock computation (verified SDK pattern)

```javascript
// Source: SDK script-include-guide + standard GlideAggregate platform API
// In BeanStockHelper.server.js — note: no Glide imports needed in ScriptInclude context
var purchaseAgg = new GlideAggregate('x_664529_aibrew_bean_purchase')
purchaseAgg.addAggregate('SUM', 'grams')
purchaseAgg.addQuery('bean', beanSysId)
purchaseAgg.query()
var totalPurchased = 0
if (purchaseAgg.next()) {
  totalPurchased = parseInt(purchaseAgg.getAggregate('SUM', 'grams') || '0', 10)
}
```

### Scripted REST client fetch (React)

```tsx
// Source: Phase 1 Table API fetch pattern (VERIFIED: RoasterSection.tsx)
const [stock, setStock] = useState<{ remaining_g: number; total_purchased_g: number } | null>(null)
const [stockLoading, setStockLoading] = useState(true)
const [stockKey, setStockKey] = useState(0)

useEffect(() => {
  if (!SYS_ID_RE.test(beanSysId)) return
  let cancelled = false
  setStockLoading(true)
  const g_ck = (window as any).g_ck
  fetch(`/api/x_664529_aibrew/v1/stock/${beanSysId}`, {
    headers: { Accept: 'application/json', ...(g_ck ? { 'X-UserToken': g_ck } : {}) },
  })
    .then(r => r.json())
    .then(data => { if (!cancelled) setStock(data) })
    .catch(() => { if (!cancelled) setStock(null) })
    .finally(() => { if (!cancelled) setStockLoading(false) })
  return () => { cancelled = true }
}, [beanSysId, stockKey])
```

### Purchase history fetch

```tsx
// Source: Phase 1 Table API fetch pattern (VERIFIED: RoasterSection.tsx)
const params = new URLSearchParams({
  sysparm_query: `bean=${beanSysId}^ORDERBYDESCpurchase_date`,
  sysparm_fields: 'sys_id,grams,purchase_date',
  sysparm_limit: '20',
})
fetch(`/api/now/table/x_664529_aibrew_bean_purchase?${params}`, {
  headers: { Accept: 'application/json', ...(g_ck ? { 'X-UserToken': g_ck } : {}) },
})
```

### index.now.ts additions

```typescript
// Source: existing src/fluent/index.now.ts (VERIFIED)
export { x_664529_aibrew_bean } from './tables/bean.now'
export { x_664529_aibrew_bean_purchase } from './tables/bean-purchase.now'
export { bean_read, bean_write, bean_create, bean_delete } from './acls/bean-acls.now'
export { bean_purchase_read, bean_purchase_write, bean_purchase_create, bean_purchase_delete } from './acls/bean-purchase-acls.now'
export { bean_stock_api } from './scripted-rest/bean-stock-api.now'
export { BeanStockHelper } from './script-includes/bean-stock-helper.now'
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `NowRecordListConnected` with `query` prop | Direct Table API fetch with `sysparm_query` | Phase 1 UAT | `NowRecordListConnected` has no `query`/`filter` prop — use Table API fetch |
| Inline script strings in RestApi routes | Module handler import (`script: process`) | SDK 4.x | Preferred for maintainability and testability |
| `gForm.save()` for form submission | `FormActionBar` inside `RecordProvider` | Phase 1 UAT | Platform adapter pattern; `gForm.save()` does not work in Fluent |
| `Modal` event `e.detail.action.label` | `e.detail.payload.action.label` | Phase 1 UAT | Correct event shape in `@servicenow/react-components` Modal |

**Deprecated/outdated:**
- `NowRecordListConnected` with filter props: does not have a `query` or `filter` prop in the current SDK — use Table API fetch.
- `global.JSON().decode()` for JSON parsing in server scripts: still works but `JSON.parse()` is cleaner in module context (where it is available as a global).

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Calling a Script Include from a RestApi module handler requires `(global as any).BeanStockHelper()` syntax | Pattern 5 | If SDK provides a typed import, the handler code needs updating; build error would catch it |
| A2 | N+1 Scripted REST calls for list-view stock bars are acceptable for a personal-use collection of < 20 beans | Pitfall 1 | If instance latency is high, list view will feel slow; workaround is `Promise.all()` parallelism (already noted) |
| A3 | `src/server/` directory does not yet exist and needs to be created | Project Structure | If it already exists with a different convention, file placement needs adjustment |

---

## Open Questions

1. **Script Include callable from module handler**
   - What we know: The SDK `module-guide` documents that modules can call Script Includes. The script-include-guide says use `require()` for the bridge pattern. Neither doc shows direct instantiation from a module.
   - What's unclear: Whether `(global as any).BeanStockHelper()` works directly in a RestApi module handler, or whether a `require('./dist/modules/...')` bridge is needed.
   - Recommendation: Implement as a direct `(global as any).BeanStockHelper()` call first. If the build or runtime rejects it, refactor to put the GlideAggregate logic directly in the module handler (avoiding the Script Include entirely — valid since the handler is already server-side).

2. **CatalogView SUB_NAV change**
   - What we know: `CatalogView.tsx` has `beans: disabled: true`. The `renderSection()` switch has no `case 'beans'` branch.
   - What's unclear: No gap — change is straightforward: set `disabled: false`, import `BeanSection`, add `case 'beans'`.
   - Recommendation: Document as a required edit in the plan; no research needed.

---

## Environment Availability

Step 2.6: SKIPPED (Phase 2 extends the existing deployed app; no new external tool dependencies beyond those already verified in Phase 1. Node 20+ and `@servicenow/sdk` 4.6.0 are confirmed present from Phase 1 execution.)

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Manual UAT (no automated test framework configured in project) |
| Config file | None — see Wave 0 note below |
| Quick run command | `npx @servicenow/sdk build` (compile-time validation) |
| Full suite command | `npx @servicenow/sdk build && npx @servicenow/sdk install` (deploy to instance) |

**Wave 0 note:** The project has no automated test framework (no jest/vitest/pytest config detected, no `test/` or `tests/` directories). [VERIFIED: ls of project root] Validation is via SDK build (TypeScript type-check + Fluent schema validation) and human UAT against the deployed instance. This matches Phase 1 precedent.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CAT-04 | Create a bean type record linked to a roaster | Manual UAT | `npx @servicenow/sdk build` (compile) | N/A |
| CAT-05 | View and edit bean type records | Manual UAT | `npx @servicenow/sdk build` | N/A |
| CAT-06 | Archive a bean type; archived beans hidden from pickers | Manual UAT | `npx @servicenow/sdk build` | N/A |
| INV-01 | Log a bean purchase (grams + date) | Manual UAT | `npx @servicenow/sdk build` | N/A |
| INV-02 | View remaining stock on bean detail page (computed live) | Manual UAT | `npx @servicenow/sdk build` | N/A |
| INV-03 | Low-stock badge appears when remaining < 50 g | Manual UAT | `npx @servicenow/sdk build` | N/A |
| INV-04 | View purchase history chronologically on bean detail | Manual UAT | `npx @servicenow/sdk build` | N/A |

### Sampling Rate

- **Per task commit:** `npx @servicenow/sdk build` (TypeScript compile + Fluent schema validation)
- **Per wave merge:** `npx @servicenow/sdk build && npx @servicenow/sdk install` (deploy to instance)
- **Phase gate:** All 5 success criteria verified by human UAT with non-admin test user before `/gsd-verify-work`

### Wave 0 Gaps

No automated test infrastructure to create — project uses manual UAT. SDK `build` is the compile-time gate. The same pattern was validated in Phase 1.

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Single-user app, no auth layer |
| V3 Session Management | No | ServiceNow platform handles sessions |
| V4 Access Control | Yes | Scoped ACLs on all new tables (record-level, role-gated to `aibrew_user`) |
| V5 Input Validation | Yes | SysId regex validation before URL interpolation (CR-01 pattern); grams integer validation before POST |
| V6 Cryptography | No | No cryptographic operations in this phase |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path parameter injection in Scripted REST URL | Tampering | Validate `bean_sys_id` against `/^[0-9a-f]{32}$/i` in both client fetch and server handler before use |
| Unauthorised stock reads via Scripted REST | Elevation of Privilege | `authentication: true, authorization: true` on route; `aibrew_user` role ACL on both tables |
| Missing ACL on bean_purchase | Elevation of Privilege | Create explicit 4 ACLs (read/write/create/delete) for bean_purchase — not inherited from bean |

---

## Sources

### Primary (HIGH confidence)
- `restapi-api` (SDK) — RestApi artifact shape, route properties, URI construction
- `scriptinclude-api` (SDK) — ScriptInclude properties, Now.include() pattern
- `scripted-rest-api-guide` (SDK) — URI path construction, security model, versioning strategy
- `script-include-guide` (SDK) — Class.create pattern, GlideAjax, module bridge, ES5 requirement
- `module-guide` (SDK) — Module imports, Glide API import rules, Script Include class file rules
- `referencecolumn-api` (SDK) — ReferenceColumn config, referenceTable property
- `choicecolumn-api` (SDK) — ChoiceColumn config, choices object literal
- `integercolumn-api` (SDK) — IntegerColumn config
- `datecolumn-api` (SDK) — DateColumn config
- `src/fluent/tables/roaster.now.ts` (codebase) — Table definition pattern to replicate
- `src/fluent/tables/equipment.now.ts` (codebase) — ChoiceColumn usage in project
- `src/fluent/acls/roaster-acls.now.ts` (codebase) — ACL pattern to replicate
- `src/fluent/index.now.ts` (codebase) — Export pattern to extend
- `src/client/components/RoasterSection.tsx` (codebase) — Canonical list/detail/create/archive pattern
- `src/client/components/EquipmentSection.tsx` (codebase) — Second reference for same pattern
- `src/client/components/CatalogView.tsx` (codebase) — SUB_NAV + tab pattern to extend
- `.planning/STATE.md` (codebase) — Phase 1 lessons: Modal event shape, NowRecordListConnected, FormActionBar

### Secondary (MEDIUM confidence)
- `.planning/phases/02-bean-catalog-inventory/02-CONTEXT.md` — User decisions (D-01 through D-11)
- `CLAUDE.md` — Critical pitfall: mutable stock column forbidden; computed-only via GlideAggregate

### Tertiary (LOW confidence)
- A1: `(global as any).BeanStockHelper()` in module handler — assumed; not explicitly shown in SDK docs

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified against package.json; all SDK imports verified via SDK explain
- Architecture: HIGH — all patterns verified against existing codebase or SDK docs
- Pitfalls: HIGH — Pitfalls 1–3 from SDK docs + Phase 1 lessons; Pitfall 4–7 from established project patterns
- Stock computation pattern: HIGH — GlideAggregate is the ServiceNow platform standard for aggregation
- Script Include / Module handler interaction: MEDIUM — approach documented in SDK but exact syntax for calling a Script Include from a module handler is A1 (assumed)

**Research date:** 2026-04-30
**Valid until:** 2026-05-30 (stable platform; SDK 4.6.0 pinned in package.json)
