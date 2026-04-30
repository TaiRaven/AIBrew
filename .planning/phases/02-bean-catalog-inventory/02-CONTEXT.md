# Phase 2: Bean Catalog & Inventory - Context

**Gathered:** 2026-04-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Two new scoped tables: `x_664529_aibrew_bean` (bean types linked to roasters) and `x_664529_aibrew_bean_purchase` (purchase ledger). A Scripted REST endpoint backed by a Script Include computes remaining stock per bean (sum of purchases minus sum of future brew dose weights). The Beans sub-tab in CatalogView is enabled. Bean list and detail UI match the Phase 1 Roaster/Equipment pattern, extended with stock visualisation.

This phase does NOT build brew logging (Phase 4). In Phase 2, remaining stock = total purchased grams only (no deductions yet). The Scripted REST schema is designed from the start to subtract brew dose weights once Phase 4 exists.

</domain>

<decisions>
## Implementation Decisions

### Bean List View
- **D-01:** Bean list has two tabs: **"In pantry"** (remaining > 0) and **"Empty bags"** (remaining ≤ 0). The default tab is "In pantry".
- **D-02:** Each bean list row shows: **name**, **roaster name**, **origin**, and a **stock progress bar** (visual, not just text). Low-stock badge (≤ 50 g remaining) shown inline on the row.
- **D-03:** Progress bar format in the list row: compact bar + `133g / 250g` label. The denominator is total grams ever purchased for that bean; numerator is total purchased minus total used in brews (0 in Phase 2).

### Bean Detail View
- **D-04:** Bean detail follows the Phase 1 pattern: `RecordProvider + FormColumnLayout` for the bean type fields (name, origin, roast level, roast date, roaster reference).
- **D-05:** Below the bean form, a **stock progress bar** is displayed prominently: `133g / 250g` numerical format alongside the visual bar. Low-stock badge appears here too when ≤ 50 g.
- **D-06:** Below the stock bar, an **"Add Beans"** section provides a mini inline form for logging a new bag purchase. Fields: **grams** (required, number) and **purchase date** (required, default today). This is the purchase logging action — "Add Beans" not "Add purchase" or "Log bag".
- **D-07:** Below the "Add Beans" form, a **purchase history list** shows all individual purchase records chronologically (newest first): date + grams per row. This satisfies INV-04 for Phase 2 (brew depletions will appear here once Phase 4 is built).

### Create / Archive Flow
- **D-08:** Creating a new bean type uses the standard create modal (same pattern as Roaster/Equipment): "New bean" button on the list → Modal → `RecordProvider sysId="-1"` + `FormActionBar` + `FormColumnLayout`. Fields: name, origin, roast level, roast date, roaster reference.
- **D-09:** Archiving a bean follows the same Modal confirmation + PATCH `active: false` pattern. Archived beans move to "Empty bags" tab if they had stock, and disappear from both tabs once archived — archive is a soft-delete, not a stock state.

### Stock Computation
- **D-10:** Computed stock is fetched from a **Scripted REST API** endpoint (e.g., `/api/x_664529_aibrew/v1/stock/<bean_sysId>`). The endpoint uses GlideAggregate to SUM `bean_purchase.grams` and (Phase 4+) SUM `brew_log.dose_weight_g` for the given bean. Never a stored column.
- **D-11:** **Low-stock threshold: 50 g** (hardcoded, matches INV-03 requirement). No user-configurable threshold in Phase 2.

### Claude's Discretion
- Exact roast level choices for the ChoiceColumn (e.g., light / medium-light / medium / medium-dark / dark / extra-dark) — follow coffee industry convention.
- Visual styling of the progress bar (colour at normal vs low-stock state) — use `--aibrew-accent` for normal, `--aibrew-destructive` for ≤ 50 g.
- Stock API response shape — keep it simple: `{ remaining_g, total_purchased_g }`.
- Pagination/limit for purchase history list — cap at 20 most recent purchases (sufficient for Phase 2; pagination deferred).
- Whether to show a spinner while stock loads vs optimistic empty state — show a loading skeleton on the stock bar.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 1 patterns (must replicate)
- `src/client/components/RoasterSection.tsx` — Canonical list/detail/create/archive pattern. Bean section must match this structure.
- `src/client/components/EquipmentSection.tsx` — Second reference for the same pattern (cross-check if RoasterSection differs).
- `src/client/components/CatalogView.tsx` — SUB_NAV array: Beans tab is currently `disabled: true`. Must be set to `disabled: false` and BeanSection imported/wired.

### Fluent artifact patterns (must replicate)
- `src/fluent/tables/roaster.now.ts` — Table definition pattern (columns, BooleanColumn active, etc.).
- `src/fluent/acls/roaster-acls.now.ts` — ACL pattern (4 ACLs: read/write/create/delete, type: 'record', roles: [aibrew_user]).
- `src/fluent/roles/aibrew-user.now.ts` — Role import used in all ACLs.
- `src/fluent/index.now.ts` — All new artifacts must be exported here.

### Project constraints
- `CLAUDE.md` — Critical pitfalls section: mutable stock column is forbidden; computed stock only. Inventory balance is always computed (purchases − brews via GlideAggregate) — never stored.
- `.planning/REQUIREMENTS.md` — CAT-04, CAT-05, CAT-06, INV-01, INV-02, INV-03, INV-04 (the 7 requirements this phase must satisfy).
- `.planning/ROADMAP.md` — Phase 2 goal and success criteria.

### No external specs
No additional ADRs or external specs beyond the above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `RoasterSection.tsx`: List/detail/create/archive component — copy as the starting point for `BeanSection.tsx`. The purchase sub-form and stock bar are additions on top of the detail view.
- `src/client/utils/navigate.ts` (`navigateToView`, `getViewParams`): URL routing — same pattern for beans (`?view=catalog&section=beans&id=<sysId>`).
- `src/client/utils/fields.ts` (`display`, `value`): Table API field helper — use for any fetched bean fields.
- Inline style constants from RoasterSection.tsx (`modalHeadingStyle`, `bodyStyle`) — reuse or centralise.

### Established Patterns
- **Table API fetch pattern**: `useEffect` with `cancelled` flag, `sysparm_query=active=true`, `sysparm_fields`, `sysparm_limit`, conditional `X-UserToken: g_ck` header. Must replicate exactly.
- **SysId validation**: `const SYS_ID_RE = /^[0-9a-f]{32}$/i` + early return with error message before any PATCH call (CR-01 fix — already in both Phase 1 sections).
- **g_ck guard**: Read `(window as any).g_ck`; if falsy, set error and return before fetch (CR-02 fix).
- **listKey refresh**: Increment `listKey` state after create/archive to trigger list re-fetch without full page reload.
- **Archive PATCH**: `JSON.stringify({ active: false })` (boolean, not string — WR-04 fix).

### Integration Points
- `CatalogView.tsx` SUB_NAV: set `beans` entry to `disabled: false`, add `import BeanSection from './BeanSection'`, add `case 'beans'` to `renderSection()`.
- `src/fluent/index.now.ts`: export new bean table, bean_purchase table, and their ACLs.
- Stock Scripted REST endpoint: new file in `src/fluent/scripted-rest/` (or equivalent SDK path) — check SDK docs for the correct directory and artifact type before writing.

</code_context>

<specifics>
## Specific Ideas

- Progress bar label format: `133g / 250g` — the slash-separated gram display was called out explicitly.
- The purchase action is called **"Add Beans"** (not "Add purchase", "Log bag", or "Record purchase").
- Low-stock badge appears in both the **list row** and the **bean detail** header area.
- Purchase history is chronological, newest first, on the bean detail page — below the "Add Beans" form.
- "Empty bags" tab shows fully depleted beans (remaining ≤ 0), not archived ones.

</specifics>

<deferred>
## Deferred Ideas

- **User-configurable low-stock threshold per bean** (INV-05) — v2 requirement, not Phase 2.
- **Purchase price per bag and cost-per-cup metrics** (INV-06) — v2 requirement.
- **Brew depletions in inventory history** — shown once Phase 4 (brew log) is built; the Scripted REST schema is designed for it now, but the history list shows purchases only in Phase 2.
- **Pagination of purchase history** — deferred; cap at 20 records for Phase 2.

</deferred>

---

*Phase: 2-bean-catalog-inventory*
*Context gathered: 2026-04-30*
