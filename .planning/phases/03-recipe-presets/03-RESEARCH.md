# Phase 3: Recipe Presets — Research

**Researched:** 2026-05-01
**Domain:** ServiceNow Fluent/now-sdk table definition + React 18.2 catalog UI (extending existing Phase 1/2 patterns)
**Confidence:** HIGH — all findings are verified against the codebase and official SDK docs

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Recipe preset is bean-agnostic — stores recipe variables only, no bean reference. Bean is selected separately at brew-time.
- **D-02:** Preset fields: `name` (string, required), `method` (ChoiceColumn: pour over / espresso / French press / AeroPress / moka pot / cold brew / other), `equipment` (ReferenceColumn → `x_664529_aibrew_equipment`), `dose_weight_g` (DecimalColumn), `water_weight_g` (DecimalColumn), `grind_size` (IntegerColumn — per-grinder integer), `notes` (MultiLineTextColumn, optional).
- **D-03:** Brew ratio is NOT stored — computed at display time as `water_weight_g / dose_weight_g`.
- **D-04:** Soft-delete with `active` BooleanColumn — consistent with all other catalog entities.
- **D-05:** Archive action uses Modal confirmation (same pattern as roasters/beans/equipment). No "archived" tab — archived presets simply disappear from the list.
- **D-06:** Phase 3 ships a "New Preset" button that opens a create modal — same pattern as Roaster/Bean create (Modal → `RecordProvider sysId="-1"` + `FormActionBar` + `FormColumnLayout`).
- **D-07:** Save-from-brew (RECIPE-01) is deferred to Phase 4.

### Claude's Discretion

- Exact ChoiceColumn string keys for `method` — follow BREW-01 method list.
- Visual styling of method chip on card — use `var(--aibrew-accent)`.
- ACL structure — single `aibrew_user` role (read/write/create/delete), consistent with all other ACL patterns.
- Field ordering on the create/edit form — name first, then method, equipment, dose, water, grind size, notes.
- Empty state copy for the preset list before any presets are created.

### Deferred Ideas (OUT OF SCOPE)

- **RECIPE-01** (save-from-brew) — Phase 4.
- **BREW-02** (preset picker in brew log form) — Phase 4 concern; recipe schema built here is the contract Phase 4 depends on.
- **RECIPE-03** (prompt to update preset after brew drift) — v2.
- **RECIPE-04** (filter/browse presets by bean or method) — v2.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| RECIPE-01 | User can save current brew form values as a named preset immediately after logging | DEFERRED to Phase 4 per D-07 — not in scope this phase |
| RECIPE-02 | User can view, edit, and delete saved recipe presets from a dedicated preset management screen | Fully covered: `RecipeSection` component with list/detail/create/archive pattern, Table API fetch, `RecordProvider` edit form, Modal archive |
</phase_requirements>

---

## Summary

Phase 3 is a well-scoped catalog extension. The work is almost entirely a replication of the established Phase 1/2 `RoasterSection` pattern into a new `RecipeSection` component, plus a new Fluent table definition (`x_664529_aibrew_recipe`) and its four ACLs. There are no novel architectural decisions to make — every pattern is already proven in the codebase.

The only genuinely new element in the UI layer is the preset **card design**: instead of a stock-progress bar (beans) or simple name/website row (roasters), each preset card shows preset name + method chip + dose/water/ratio inline (`18g • 300g  1:16.7`). The ratio is computed from `water_weight_g / dose_weight_g` at render time; it is never stored.

The table definition introduces two column types not previously used in this project: `DecimalColumn` (for `dose_weight_g` and `water_weight_g`) and `MultiLineTextColumn` (for `notes`). Both are verified in the SDK. All other column types (`StringColumn`, `ChoiceColumn`, `ReferenceColumn`, `IntegerColumn`, `BooleanColumn`) already appear in the codebase.

**Primary recommendation:** Copy `RoasterSection.tsx` verbatim as `RecipeSection.tsx`, then adapt the card rendering and archive copy. Write `recipe.now.ts` and `recipe-acls.now.ts` following the exact pattern of `bean.now.ts` / `bean-acls.now.ts`. Wire CatalogView and index.now.ts last.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Recipe table schema | Fluent (build-time) | — | `Table()` in `src/fluent/tables/recipe.now.ts` — defines ServiceNow sys_db_object |
| ACL enforcement | Fluent (build-time) + ServiceNow runtime | — | `Acl()` in `src/fluent/acls/recipe-acls.now.ts` — evaluated server-side per request |
| Preset list fetch | Frontend (React client) | ServiceNow Table API | `useEffect` + `fetch /api/now/table/x_664529_aibrew_recipe?sysparm_query=active=true` |
| Preset create (modal form) | Frontend (React client) | ServiceNow Table API (via RecordProvider) | `RecordProvider sysId="-1"` + `FormActionBar` — save is handled by the SDK adapter |
| Preset edit (detail view) | Frontend (React client) | ServiceNow Table API (via RecordProvider) | `RecordProvider sysId={sysId}` + `FormColumnLayout` — same pattern as Roaster detail |
| Archive (soft-delete) | Frontend (React client) | ServiceNow Table API | PATCH `active: false` — same pattern as all other catalog entities |
| Ratio computation | Frontend (React client) | — | `(water_weight_g / dose_weight_g).toFixed(1)` at render time — never stored |
| SPA routing | Frontend (React client) | — | `navigateToView('catalog', { section: 'recipes', id: sysId })` — existing utility |
| CatalogView wiring | Frontend (React client) | — | `SUB_NAV` disabled → false, `renderSection` case added |

---

## Standard Stack

### Core (all verified in codebase)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@servicenow/sdk/core` | 4.6.x | `Table`, `Acl`, column type functions | Official Fluent SDK — only sanctioned table/ACL definition method |
| `@servicenow/react-components/Button` | Zurich | All interactive controls | Required by CLAUDE.md — no raw `<button>` for catalog actions |
| `@servicenow/react-components/Modal` | Zurich | Create modal + archive confirmation | Established pattern from Phase 1/2 |
| `@servicenow/react-components/RecordContext` | Zurich | `RecordProvider` for create + edit | Correct save mechanism; `FormActionBar` inside it handles persistence |
| `@servicenow/react-components/FormColumnLayout` | Zurich | Field layout in create/edit forms | Auto-renders fields based on table schema |
| `@servicenow/react-components/FormActionBar` | Zurich | Save/Cancel buttons inside `RecordProvider` | `onFormSubmitCompleted` callback fires reliably post-save |
| React 18.2.0 | 18.2.0 | Component framework | Project requirement (CLAUDE.md) |

### Column Types Required for Recipe Table

| SDK Function | Import | Purpose | Status in Project |
|---|---|---|---|
| `StringColumn` | `@servicenow/sdk/core` | `name` field (mandatory, max 100) | Already used — roaster, bean, equipment |
| `ChoiceColumn` | `@servicenow/sdk/core` | `method` dropdown | Already used — bean.roast_level, equipment.type |
| `ReferenceColumn` | `@servicenow/sdk/core` | `equipment` foreign key | Already used — bean.roaster, bean_purchase.bean |
| `DecimalColumn` | `@servicenow/sdk/core` | `dose_weight_g`, `water_weight_g` | **NEW to project** — verified in SDK docs |
| `IntegerColumn` | `@servicenow/sdk/core` | `grind_size` | Already used — bean_purchase.grams |
| `MultiLineTextColumn` | `@servicenow/sdk/core` | `notes` optional annotation | **NEW to project** — verified in SDK docs |
| `BooleanColumn` | `@servicenow/sdk/core` | `active` soft-delete flag | Already used — all tables |

[VERIFIED: npx @servicenow/sdk explain decimalcolumn-api --format=raw]
[VERIFIED: npx @servicenow/sdk explain multilinetextcolumn-api --format=raw]
[VERIFIED: npx @servicenow/sdk explain choicecolumn-api --format=raw]
[VERIFIED: npx @servicenow/sdk explain referencecolumn-api --format=raw]
[VERIFIED: npx @servicenow/sdk explain integercolumn-api --format=raw]

**Installation:** No new packages required. All dependencies are already installed from Phases 1 and 2.

---

## Architecture Patterns

### System Architecture Diagram

```
User taps "Recipes" tab in CatalogView
        |
        v
CatalogView (SUB_NAV disabled:true → false)
        |
        +--> RecipeSection (params: URLSearchParams)
                |
                +-- params.get('id') is null
                |       |
                |       v
                |   RecipeListView
                |       |--- useEffect → GET /api/now/table/x_664529_aibrew_recipe
                |       |                    ?sysparm_query=active=true
                |       |                    &sysparm_fields=sys_id,name,method,equipment,
                |       |                                    dose_weight_g,water_weight_g,grind_size
                |       |                    &sysparm_limit=50
                |       |--- renders PresetCard[] (name + method chip + ratio inline)
                |       |--- "New Preset" button → showCreate=true
                |       |--- Modal (size="lg") → RecordProvider sysId="-1"
                |                                   → FormActionBar → POST to Table API
                |                                   → onFormSubmitCompleted → setListKey+1
                |
                +-- params.get('id') === <32-hex sysId>
                        |
                        v
                    RecipeDetailView
                        |--- RecordProvider sysId={sysId} → FormColumnLayout (edit in-place)
                        |--- FormActionBar (save) → PATCH via SDK adapter
                        |--- "Archive" button → showArchive=true
                        |--- Modal (archive confirm) → PATCH active:false → navigateToView back
```

### Recommended Project Structure

```
src/
├── client/
│   └── components/
│       └── RecipeSection.tsx        # New — list/detail/create/archive for presets
├── fluent/
│   ├── tables/
│   │   └── recipe.now.ts            # New — x_664529_aibrew_recipe table definition
│   ├── acls/
│   │   └── recipe-acls.now.ts       # New — 4 ACLs (read/write/create/delete)
│   └── index.now.ts                 # Modify — add recipe table + ACL exports
└── client/
    └── components/
        └── CatalogView.tsx          # Modify — enable recipes tab, add RecipeSection case
```

### Pattern 1: Fluent Table Definition (recipe.now.ts)

**What:** Declares the `x_664529_aibrew_recipe` ServiceNow table with all columns.
**When to use:** Phase 3 — must be deployed before any UI can fetch/create records.

```typescript
// Source: verified pattern from src/fluent/tables/bean.now.ts
// [VERIFIED: codebase — bean.now.ts, equipment.now.ts]
import '@servicenow/sdk/global'
import {
  Table, StringColumn, BooleanColumn, ChoiceColumn,
  ReferenceColumn, IntegerColumn, DecimalColumn, MultiLineTextColumn,
} from '@servicenow/sdk/core'
import { x_664529_aibrew_equipment } from './equipment.now'

export const x_664529_aibrew_recipe = Table({
  name: 'x_664529_aibrew_recipe',
  label: 'Recipe Preset',
  display: 'name',
  schema: {
    name:           StringColumn({ label: 'Name', mandatory: true, maxLength: 100 }),
    method:         ChoiceColumn({
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
    equipment:      ReferenceColumn({
                      label: 'Equipment',
                      referenceTable: x_664529_aibrew_equipment.name,
                    }),
    dose_weight_g:  DecimalColumn({ label: 'Dose (g)' }),
    water_weight_g: DecimalColumn({ label: 'Water (g)' }),
    grind_size:     IntegerColumn({ label: 'Grind Size' }),
    notes:          MultiLineTextColumn({ label: 'Notes', maxLength: 1000 }),
    active:         BooleanColumn({ label: 'Active', default: true }),
  },
})
```

### Pattern 2: ACL Definition (recipe-acls.now.ts)

**What:** Four record-level ACLs protecting the recipe table.
**When to use:** Must be in the same build as the table definition.

```typescript
// Source: exact pattern from src/fluent/acls/bean-acls.now.ts
// [VERIFIED: codebase — bean-acls.now.ts, roaster-acls.now.ts]
import '@servicenow/sdk/global'
import { Acl } from '@servicenow/sdk/core'
import { aibrew_user } from '../roles/aibrew-user.now'

export const recipe_read = Acl({
  $id: Now.ID['recipe_read'],
  type: 'record',
  table: 'x_664529_aibrew_recipe',
  operation: 'read',
  roles: [aibrew_user],
})
// ... write, create, delete follow the same pattern
```

### Pattern 3: Table API Fetch in RecipeListView

**What:** Fetches active recipe records with cancellation guard.
**When to use:** Replaces the stock-API fan-out from BeanListView — recipes have no secondary data fetch.

```typescript
// Source: exact pattern from src/client/components/RoasterSection.tsx
// [VERIFIED: codebase — RoasterSection.tsx lines 85-103]
useEffect(() => {
  let cancelled = false
  setLoading(true)
  setError(null)
  const g_ck = (window as any).g_ck
  const params = new URLSearchParams({
    sysparm_query: 'active=true',
    sysparm_fields: 'sys_id,name,method,equipment,dose_weight_g,water_weight_g,grind_size',
    sysparm_limit: '50',
  })
  fetch(`/api/now/table/${RECIPE_TABLE}?${params}`, {
    headers: { Accept: 'application/json', ...(g_ck ? { 'X-UserToken': g_ck } : {}) },
  })
    .then(r => r.json())
    .then(data => { if (!cancelled) setRecords(data.result || []) })
    .catch(() => { if (!cancelled) { setRecords([]); setError('Could not load presets — tap to retry.') } })
    .finally(() => { if (!cancelled) setLoading(false) })
  return () => { cancelled = true }
}, [listKey])
```

### Pattern 4: Preset Card with Ratio Display

**What:** Inline computed ratio instead of BeanSection's stock bar.
**When to use:** RecipeListView — each card in the grid.

```typescript
// Source: derived from BeanCard pattern + D-08 decision
// [VERIFIED: codebase — BeanSection.tsx BeanCard function]
// ratio: (water_weight_g / dose_weight_g).toFixed(1) — computed, never stored per D-03
const dose = parseFloat(value(record.dose_weight_g)) || 0
const water = parseFloat(value(record.water_weight_g)) || 0
const ratio = dose > 0 ? (water / dose).toFixed(1) : '—'
// Card body: "{dose}g • {water}g  1:{ratio}"
const methodLabel = display(record.method) || value(record.method) || '—'
```

### Pattern 5: CatalogView Wiring

**What:** Enable the recipes tab and connect RecipeSection.
**When to use:** Final wiring step — do after RecipeSection component is complete.

```typescript
// Source: src/client/components/CatalogView.tsx
// [VERIFIED: codebase — CatalogView.tsx lines 8-13, 34-44]

// SUB_NAV change:
{ id: 'recipes', label: 'Recipes', disabled: false }  // was: disabled: true

// renderSection() addition:
case 'recipes':
  return <RecipeSection params={params} />
```

### Anti-Patterns to Avoid

- **Storing brew ratio:** `water_weight_g / dose_weight_g` MUST be computed at render time — never add a `ratio` column to the table (D-03). This is a Phase 4 pitfall too — do not add it to the schema "for convenience."
- **Adding a bean reference:** The recipe table is intentionally bean-agnostic (D-01). Do not add a `bean` ReferenceColumn. Phase 4's brew form is where bean is paired with a preset.
- **Using `NowRecordListConnected` for the list:** This component has no `query`/`filter` prop (confirmed Phase 1 lesson). Always use direct Table API fetch with `sysparm_query=active=true`.
- **Programmatic `gForm.save()`:** Never call this. Use `FormActionBar` inside `RecordProvider`. The `onFormSubmitCompleted` callback is the correct post-save hook (Phase 1 lesson).
- **Modal footer event shape:** Access `e.detail?.payload?.action?.label` — NOT `e.detail.action` (Phase 1 lesson from Modal behaviour).
- **SysId path injection without validation:** Always test `SYS_ID_RE.test(sysId)` before PATCH/DELETE URL construction (CR-01 from Phase 1 code review).
- **g_ck guard omission:** Always read `(window as any).g_ck`; if falsy, set error and return before any fetch (Phase 1 established pattern).
- **Flat list layout when card grid is appropriate:** Presets follow BeanSection's card grid layout, not RoasterSection's flat row list. Use `gridTemplateColumns: 'repeat(2, 1fr)'` for the list.
- **Tabs for archived presets:** D-05 explicitly disallows an "archived" tab. Archived presets simply vanish. Do not add tab state.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form save logic | Custom fetch POST on submit | `RecordProvider` + `FormActionBar` | SDK adapter handles CSRF, response handling, field mapping; `onFormSubmitCompleted` is reliable |
| Field rendering in create/edit | Custom `<input>` elements per field | `FormColumnLayout` inside `RecordProvider` | Auto-renders schema-defined fields; eliminates field-type mismatches |
| Archive confirmation UI | Custom confirm component | `Modal` with `footerActions` | Established pattern; handles accessibility, close-on-backdrop, keyboard events |
| Table-level ACLs | Manual ACL records on instance | `Acl()` in `recipe-acls.now.ts` | SDK-managed; replaces on `sdk install`; instance edits would be overwritten |
| ChoiceColumn display label | Custom label mapping | `display(record.method)` via `fields.ts` helper | Table API returns `{ value, display_value }` — `display()` handles both shapes |

**Key insight:** The Fluent SDK and `@servicenow/react-components` already solve every CRUD concern in this phase. The only custom logic needed is (a) the ratio computation and (b) the card layout styling.

---

## Common Pitfalls

### Pitfall 1: DecimalColumn value shape from Table API

**What goes wrong:** The Table API returns `dose_weight_g` as `{ value: "18", display_value: "18" }` — a string, not a float. Calling `parseFloat` on the whole object returns `NaN`.
**Why it happens:** All Table API field values are returned as objects with `value` and `display_value` keys (same as every other field).
**How to avoid:** Use `parseFloat(value(record.dose_weight_g))` where `value()` is the `src/client/utils/fields.ts` helper that extracts `field?.value ?? ''`. Guard with `|| 0` for cards where weight may be null.
**Warning signs:** Card shows `1:NaN` ratio.

### Pitfall 2: ChoiceColumn method display vs stored value

**What goes wrong:** `record.method` comes back as `{ value: "pour_over", display_value: "Pour Over" }`. Rendering `record.method` directly shows `[object Object]`.
**Why it happens:** Same field object shape as all reference/choice fields.
**How to avoid:** Use `display(record.method)` for the method chip label. Fall back to `value(record.method)` if `display_value` is empty.
**Warning signs:** Method chip shows `[object Object]` or blank.

### Pitfall 3: sysparm_fields with dot-notation for equipment display name

**What goes wrong:** The list view needs to show equipment name on the preset card (for context). But the `equipment` field returns only the sysId unless dot-notation is requested.
**Why it happens:** `sysparm_fields=equipment` returns `{ value: "<sysId>", display_value: "<equipment name>" }` — the display_value IS the equipment name (ServiceNow resolves reference display names automatically in Table API v2).
**How to avoid:** `display(record.equipment)` is sufficient — no dot-notation needed for the display name. This is the same behaviour as `bean.roaster` in BeanSection.
**Warning signs:** Equipment shows as a raw sysId string.

### Pitfall 4: Forgetting `display: 'name'` in Table definition

**What goes wrong:** The `RecordProvider` detail view breadcrumbs and `FormColumnLayout` labels may render the sysId as the record title instead of the preset name.
**Why it happens:** ServiceNow uses the `display` property of the table definition to determine which column is the "display value" for the record.
**How to avoid:** Set `display: 'name'` in `Table({ ... })` — exactly as roaster, equipment, and bean all do.
**Warning signs:** RecordProvider header shows a 32-char hex string instead of the preset name.

### Pitfall 5: Omitting Array.from polyfill in index.html

**What goes wrong:** Page renders blank.
**Why it happens:** The Polaris environment does not have `Array.from` natively; the SDK bundle depends on it.
**How to avoid:** The polyfill is already present in the existing `index.html`. Do not modify `index.html` in Phase 3. This is a green-field page risk only — not applicable here since we are extending the existing single-page app.

### Pitfall 6: Field name collision with Phase 4 schema

**What goes wrong:** Phase 4 will read recipe presets to pre-fill the brew log form (BREW-02). If Phase 3 names fields inconsistently with what Phase 4 expects, Phase 4 will silently load wrong values.
**Why it happens:** The recipe schema built in Phase 3 is the permanent contract — field names cannot be renamed after deployment without data migration.
**How to avoid:** The field names locked in D-02 are: `name`, `method`, `equipment`, `dose_weight_g`, `water_weight_g`, `grind_size`, `notes`, `active`. Use these exact names in the table definition. Do not abbreviate or rename.

---

## Code Examples

### Recipe preset card ratio display

```typescript
// Source: derived from BeanCard (BeanSection.tsx) + D-03, D-08
// [VERIFIED: codebase — fields.ts helpers, BeanSection.tsx card pattern]
function RecipeCard({ record, onClick }: { record: any; onClick: () => void }) {
  const { display, value } = require('../utils/fields')
  const name = display(record.name) || value(record.name) || ''
  const methodLabel = display(record.method) || value(record.method) || '—'
  const dose = parseFloat(value(record.dose_weight_g)) || 0
  const water = parseFloat(value(record.water_weight_g)) || 0
  const ratio = dose > 0 ? (water / dose).toFixed(1) : '—'
  const ratioLine = dose > 0 && water > 0 ? `${dose}g • ${water}g  1:${ratio}` : ''

  return (
    <button onClick={onClick} style={{ /* card styles */ }}>
      <div style={{ fontWeight: 700, fontSize: '15px' }}>{name}</div>
      {methodLabel && (
        <span style={{
          display: 'inline-block',
          background: 'var(--aibrew-accent)',
          color: '#fff',
          borderRadius: '8px',
          padding: '2px 8px',
          fontSize: '12px',
          fontWeight: 600,
          marginTop: '4px',
        }}>
          {methodLabel}
        </span>
      )}
      {ratioLine && (
        <div style={{ fontSize: '13px', color: 'var(--aibrew-ink-3)', marginTop: '4px' }}>
          {ratioLine}
        </div>
      )}
    </button>
  )
}
```

### index.now.ts additions

```typescript
// Source: src/fluent/index.now.ts — extend with 2 new exports
// [VERIFIED: codebase — index.now.ts pattern]
export { x_664529_aibrew_recipe } from './tables/recipe.now'
export { recipe_read, recipe_write, recipe_create, recipe_delete } from './acls/recipe-acls.now'
```

### SysId validation before archive PATCH

```typescript
// Source: RoasterSection.tsx lines 24-35 — exact pattern to copy
// [VERIFIED: codebase]
const SYS_ID_RE = /^[0-9a-f]{32}$/i

const handleArchive = async () => {
  if (!SYS_ID_RE.test(sysId)) { setArchiveError('Invalid record identifier.'); return }
  const g_ck = (window as any).g_ck
  if (!g_ck) { setArchiveError('Session token not available — please reload.'); return }
  const res = await fetch(`/api/now/table/${RECIPE_TABLE}/${sysId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'X-UserToken': g_ck },
    body: JSON.stringify({ active: false }),
  })
  // ...
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `NowRecordListConnected` for filtered lists | Direct Table API fetch with `sysparm_query` | Phase 1 (discovered during UAT) | `NowRecordListConnected` has no filter/query prop — all list fetches must use raw Table API |
| `e.detail.action` for Modal footer events | `e.detail?.payload?.action?.label` | Phase 1 (discovered during UAT) | Wrong path silently ignores confirm clicks |
| Programmatic `gForm.save()` | `FormActionBar` inside `RecordProvider` | Phase 1 (established pattern) | `gForm.save()` not available in Fluent adapter |
| Mutable stock column | GlideAggregate computed value | Architecture (CLAUDE.md) | Applies to inventory only — recipe phase has no computed columns except ratio, which is a UI concern only |

---

## Assumptions Log

> All claims in this research are verified from the codebase or official SDK documentation. No assumed-only claims.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `display_value` on a `ChoiceColumn` field returned by Table API will contain the human-readable label (e.g. "Pour Over") not just the stored key (e.g. "pour_over") | Pitfall 2, Code Examples | Method chip would show raw key; low risk — same behaviour observed for `roast_level` in bean records | 

**All other claims are VERIFIED against codebase source files or SDK `explain` output.**

---

## Open Questions

1. **Equipment display on preset card (list view)**
   - What we know: Table API v2 automatically resolves reference `display_value` for `ReferenceColumn` fields — `display(record.equipment)` will return the equipment name.
   - What's unclear: Whether Phase 3 should show the equipment name on the list card at all, or only in the detail view. The CONTEXT.md card spec (D-08) does not mention equipment — it lists only name + method chip + dose/water/ratio.
   - Recommendation: Follow D-08 exactly — equipment on the list card is not in spec. Show equipment only in the `RecordProvider` detail form. The planner should confirm this interpretation.

2. **`sysparm_fields` for the list fetch — include `equipment` or not?**
   - What we know: If equipment is not shown on cards (per Open Question 1), fetching it in the list is wasteful. But Phase 4 may pre-cache it.
   - What's unclear: Phase 3 list card spec does not require equipment.
   - Recommendation: Omit `equipment` from `sysparm_fields` in the list fetch. Phase 4 will fetch a full record when pre-filling the brew form anyway.

---

## Environment Availability

Step 2.6: No new external dependencies introduced in Phase 3. All tooling (Node 20, `@servicenow/sdk`, `@servicenow/react-components`) is already verified present from Phases 1 and 2.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js 20+ | SDK build | ✓ | 20.20.2 | — |
| `@servicenow/sdk` ≥ 4.6.0 | Table/ACL definitions, build | ✓ | 4.6.x (in node_modules) | — |
| `@servicenow/react-components` | All UI components | ✓ | Zurich (installed) | — |
| ServiceNow instance (Zurich) | `sdk install` target | ✓ (assumed active) | Zurich | — |

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no `jest.config.*`, `vitest.config.*`, or `pytest.ini` found in project |
| Config file | None — see Wave 0 gaps |
| Quick run command | N/A until framework installed |
| Full suite command | N/A until framework installed |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RECIPE-02 (list) | Active presets appear in the list; archived presets do not | manual-only | — | N/A — no test infra |
| RECIPE-02 (create) | "New Preset" modal saves a record and list refreshes | manual-only | — | N/A |
| RECIPE-02 (edit) | Editing a preset field and saving updates the record | manual-only | — | N/A |
| RECIPE-02 (archive) | Archive confirmation sets `active=false`; record disappears from list | manual-only | — | N/A |
| RECIPE-02 (ratio) | Ratio displayed as `water / dose` to 1 d.p. | manual-only | — | N/A |
| RECIPE-02 (ACL) | Non-admin user can read, create, edit, archive presets | manual-only | — | N/A |

**Justification for manual-only:** This project has no test infrastructure (no framework config, no test files, no test scripts in `package.json`). All validation is via build (`npx @servicenow/sdk build`) + deploy (`npx @servicenow/sdk install`) + human UAT on-instance. This matches the Phase 1 and Phase 2 precedent.

### Sampling Rate

- **Per task commit:** `npx @servicenow/sdk build` (compile-time validation)
- **Per wave merge:** `npx @servicenow/sdk build && npx @servicenow/sdk install` (deploy to instance)
- **Phase gate:** Human UAT against all RECIPE-02 criteria before `/gsd-verify-work`

### Wave 0 Gaps

None — existing infrastructure (SDK build + manual UAT) covers all phase requirements. No test framework installation needed.

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Single-user app; no auth layer |
| V3 Session Management | No | ServiceNow platform handles sessions |
| V4 Access Control | Yes | `Acl()` with `aibrew_user` role on recipe table — 4 operations covered |
| V5 Input Validation | Partial | `SYS_ID_RE` guards sysId before URL injection; `FormColumnLayout` validates schema-defined fields server-side |
| V6 Cryptography | No | No crypto operations in this phase |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| SysId path injection | Tampering | `SYS_ID_RE.test(sysId)` before PATCH URL construction — already in RoasterSection, must copy to RecipeSection |
| Unauthenticated fetch | Elevation of privilege | `g_ck` guard before all mutating fetches — established pattern |
| ACL gaps invisible to admin | Elevation of privilege | Test with non-admin `aibrew_user` account before phase sign-off (CLAUDE.md Critical Pitfall) |

---

## Sources

### Primary (HIGH confidence — verified from codebase)

- `src/client/components/RoasterSection.tsx` — canonical list/detail/create/archive pattern; all fetch, modal, and form patterns taken directly from here
- `src/client/components/BeanSection.tsx` — card grid layout, `display()`/`value()` field helper usage, stock bar → ratio card pattern analogy
- `src/client/components/CatalogView.tsx` — SUB_NAV wiring, `renderSection()` pattern, disabled tab handling
- `src/fluent/tables/bean.now.ts` — `ChoiceColumn`, `ReferenceColumn`, `DateColumn` usage; canonical multi-column table definition
- `src/fluent/tables/bean-purchase.now.ts` — `IntegerColumn`, `ReferenceColumn`, `BooleanColumn` usage
- `src/fluent/acls/bean-acls.now.ts` — 4-ACL pattern with `Now.ID` key naming
- `src/fluent/index.now.ts` — export registration pattern
- `src/client/utils/fields.ts` — `display()` and `value()` helper signatures
- `src/client/utils/navigate.ts` — `navigateToView()`, `getViewParams()` signatures

### Primary (HIGH confidence — verified from SDK)

- `npx @servicenow/sdk explain decimalcolumn-api` — confirms `DecimalColumn` is valid SDK column type
- `npx @servicenow/sdk explain multilinetextcolumn-api` — confirms `MultiLineTextColumn` is valid SDK column type with `maxLength` prop
- `npx @servicenow/sdk explain choicecolumn-api` — confirms `choices` object literal syntax
- `npx @servicenow/sdk explain referencecolumn-api` — confirms `referenceTable` takes the `.name` string, confirms `cascadeRule` optional prop
- `npx @servicenow/sdk explain integercolumn-api` — confirms integer column shape

### Secondary (MEDIUM confidence — from project STATE.md/CONTEXT.md lessons)

- `.planning/STATE.md` §Phase 1 Lessons — Modal event path, NowRecordListConnected limitation, FormActionBar correctness
- `.planning/phases/03-recipe-presets/03-CONTEXT.md` — all locked decisions and canonical reference list

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — all column types verified in SDK, all UI components verified in codebase
- Architecture: HIGH — direct replication of proven Phase 1/2 patterns; no novel architectural decisions
- Pitfalls: HIGH — all from direct codebase analysis or explicitly documented Phase 1 UAT lessons
- Card ratio display: HIGH — trivial JS arithmetic, verified field-value shape from existing BeanSection pattern

**Research date:** 2026-05-01
**Valid until:** 2026-06-01 (SDK docs stable; ServiceNow Zurich release has no imminent changes in scope)
