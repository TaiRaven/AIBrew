# Architecture Research — AIBrew

**Domain:** Mobile-first ServiceNow scoped app — coffee brew logging  
**Researched:** 2026-04-28  
**Platform:** ServiceNow Fluent (now-sdk 4.6.0), Zurich release  
**Confidence:** MEDIUM — grounded in confirmed developer experience (deployed Beans UI page 2026-04-27), published SDK metadata type list, and established ServiceNow scoped-app patterns. SDK CLI topic list unavailable at research time; flag any topic for `npx @servicenow/sdk explain <topic>` verification before implementation.

---

## Domain Model

Six core entities. Three are pure reference/catalog data (Roaster, Equipment, Recipe). Two are transactional (BrewLog, BeanStock). One is a junction of several others (BrewLog is the hub).

### Entities

| Entity | Table name (scoped) | Type | Key fields |
|--------|--------------------|----|-----------|
| **Roaster** | `x_<scope>_roaster` | Reference catalog | name, location, website, notes |
| **Bean** | `x_<scope>_bean` | Catalog + inventory root | name, roaster (ref), origin, process, roast_level, roast_date, purchase_date, purchased_grams |
| **Equipment** | `x_<scope>_equipment` | Reference catalog | name, type (grinder/brewer), brand, notes |
| **Recipe** | `x_<scope>_recipe` | Reusable preset | name, method, bean (optional ref), dose_grams, water_grams, grind_size, water_temp, notes |
| **BrewLog** | `x_<scope>_brew_log` | Transactional — the core record | bean (ref), equipment_grinder (ref), equipment_brewer (ref), recipe (optional ref), dose_grams, water_grams, grind_size, water_temp, brew_time_sec, yield_grams, taste_notes, rating (1–5), logged_at |
| **BeanStock** | Computed — no separate table | Virtual/calculated | remaining_grams = bean.purchased_grams − SUM(brew_log.dose_grams WHERE bean = this bean) |

### Design decisions

**BeanStock is not a table — it is a calculated field pattern.** Maintaining a separate stock table introduces a two-record update on every brew log, which creates a race condition and forces transactional integrity beyond what scoped Business Rules can guarantee cleanly. Instead:

- `bean.purchased_grams` stores the total grams ever purchased for that bean (user updates manually when they buy more)
- A **GlideAggregate query** on `brew_log.dose_grams` grouped by `bean` provides consumed grams on demand
- A **Script Include** (`BeanStockCalculator`) exposes `getRemainingGrams(beanSysId)` for use by Business Rules and UI pages
- Low-stock threshold (e.g., < 50 g) is evaluated by this Script Include and returned alongside remaining grams

**Equipment split.** The Equipment table covers both grinders and brewers via a `type` field (Choice: grinder/brewer). A single BrewLog references two equipment records — one for each slot. This avoids two separate tables for what is the same entity shape. The UI can filter the reference field pickers by type.

**Recipe as an optional preset.** A Recipe record stores default values. When a user selects a Recipe when logging a brew, the UI pre-fills dose, grind, water, temp fields — but the BrewLog stores its own copy of all those values. The Recipe is stored as a reference on the BrewLog for traceability ("logged from recipe X") but is not required. Changing a Recipe after logging does not alter past BrewLog records.

---

## Table Relationship Diagram

```
ROASTER
  |
  | 1:N (one roaster, many beans)
  v
BEAN ──────────────────────────────────────────────────────────────────
  |                                                                   |
  | 1:N (one bean, many brew logs)                                    | 1:N (optional — recipe may pre-select a bean)
  v                                                                   v
BREW_LOG ◄─────── RECIPE (optional — "logged from preset")      RECIPE
  |   |
  |   | N:1 (one brewer per log)
  |   └─────────────────────────► EQUIPMENT (type=brewer)
  |
  | N:1 (one grinder per log)
  └──────────────────────────────► EQUIPMENT (type=grinder)


BEAN ──► [GlideAggregate on BREW_LOG.dose_grams] ──► remaining_grams
         (computed by BeanStockCalculator Script Include)
```

Reference direction: BREW_LOG holds the reference fields. Parent tables (Bean, Equipment, Recipe) have no foreign key pointing downward — querying "all brews for bean X" uses `GlideRecord` with `addQuery('bean', beanSysId)` on BREW_LOG.

---

## Recommended Build Order

Dependencies cascade upward — reference targets must exist before referencing tables can be created. UI pages should follow their data tables.

### Phase 1 — Foundation tables (no dependencies)

1. **Roaster table** — no references to other app tables
2. **Equipment table** — no references to other app tables

These are pure reference data. Scaffold table + a minimal UI list page per table so the user can seed data before it is needed.

### Phase 2 — Bean catalog (depends on Roaster)

3. **Bean table** — references Roaster
4. **BeanStockCalculator Script Include** — can be written as soon as Bean table exists; no BrewLog needed yet (returns 0 consumed if no logs exist)
5. **Bean list UI page** + **Bean form UI page** — includes a "remaining stock" display field driven by BeanStockCalculator

### Phase 3 — Equipment and Recipe presets (depends on Bean, Equipment)

6. **Recipe table** — references Bean (optional) and is standalone otherwise
7. **Recipe list UI page** + **Recipe form UI page**

### Phase 4 — BrewLog (depends on Bean, Equipment, Recipe)

8. **BrewLog table** — references Bean, Equipment (×2), Recipe (optional)
9. **BrewLog Business Rule (after insert)** — triggers BeanStockCalculator invalidation / low-stock check; sends notification if stock is low
10. **BrewLog form UI page** — the primary interaction; most complex UI in the app
11. **BrewLog list UI page** — history view

### Phase 5 — Pattern analysis

12. **Analytics UI page** — reads BrewLog via GlideAggregate; no new tables required

Build order summary:

```
Roaster → Bean → BeanStockCalculator SI
Equipment →
Recipe (optional Bean ref) →
BrewLog table + Business Rule →
UI pages (list + form per entity) →
Analytics page
```

---

## Component Boundaries

ServiceNow Fluent (now-sdk) separates concerns into three layers. The key constraint: **scoped apps cannot use global server-side JavaScript**; all server logic must be declared within the app scope.

### Layer 1 — Metadata declarations (TypeScript/Fluent DSL)

Defined in source files that the SDK compiles and deploys to the instance. These are not runtime code — they are configuration that becomes platform records.

| Artifact | Fluent metadata type | What it defines |
|----------|---------------------|----------------|
| Table schema | `Table` | Fields, field types, labels, reference constraints |
| Business Rule | `BusinessRule` | Server-side triggers (before/after insert/update/delete) |
| Script Include | `ScriptInclude` | Reusable server-side class/function libraries |
| ACL | `Acl` | Record and field-level access control |
| Client Script | `ClientScript` | Catalog-form client logic (less relevant here) |

### Layer 2 — UI Pages (React/now-sdk component model)

Each page is a Fluent `UIPage` artifact. Confirmed pattern from the developer's prior BrewAI Beans page work:

- `src/client/index.html` — entry point; React mounts here. **Omit CDATA markers from the Array.from polyfill** (Jelly mangles them — confirmed bug, see developer memory).
- React components declared in the page bundle handle rendering, user interaction, and state
- Pages communicate with the server exclusively through **ServiceNow's REST Table API** (`/api/now/table/<table>`) or **Scripted REST APIs** declared within the scope

### Layer 3 — Server-side execution context

Business Rules and Script Includes run in the ServiceNow server-side JavaScript engine (Rhino/GraalVM depending on instance version). Key rules:

- **Script Includes must be `Accessible from: This application scope only`** — never set them callable from all scopes without deliberate reason
- **Business Rules are synchronous** — after-insert rules are the right hook for inventory side-effects (dose deducted after the record is committed)
- **No async server-side** — long aggregations must be pulled client-side via REST, not computed inside a Business Rule triggered per-request

### Component boundary diagram

```
BROWSER (mobile)
  │
  │  React UI Page (UIPage artifact)
  │  - renders list / form
  │  - calls REST API for data
  │  - calls Scripted REST API for computed data (stock levels)
  │
  ▼ REST
SERVICENOW PLATFORM
  │
  ├── Table API  (/api/now/table/x_<scope>_brew_log)
  │     reads/writes BrewLog, Bean, Equipment, Recipe, Roaster
  │
  ├── Scripted REST API  (/api/x_<scope>/stock/bean/:sysId)
  │     calls BeanStockCalculator.getRemainingGrams()
  │     returns { remaining_grams, low_stock: true/false }
  │
  ├── Business Rules (server, after insert on brew_log)
  │     - calls BeanStockCalculator
  │     - creates a notification or sets a flag if low stock
  │
  └── Script Includes (BeanStockCalculator)
        - GlideAggregate query: SUM(dose_grams) WHERE bean = X
        - Stateless; called by both Business Rule and Scripted REST API
```

**Why a Scripted REST API for stock, not just Table API?** The Table API cannot perform aggregate queries. The UI needs `remaining_grams` when displaying the Bean list and Bean detail — a Scripted REST API backed by BeanStockCalculator delivers this as a single endpoint, avoiding multiple client-side fetches and arithmetic.

---

## Data Flow: Brew → Inventory Depletion

ServiceNow does not have a native "computed field that aggregates child records" — that pattern requires explicit implementation. The recommended approach avoids a denormalized stock counter (which would need careful locking) in favor of on-demand aggregation.

### Step-by-step flow

```
1. User fills BrewLog form in mobile UI
   - Selects bean, grinder, brewer, dose_grams, etc.

2. UI POSTs to /api/now/table/x_<scope>_brew_log
   - Standard Table API insert

3. Platform executes Business Rule (after insert, on brew_log)
   - Calls BeanStockCalculator.getRemainingGrams(brew_log.bean)
   - GlideAggregate: SELECT SUM(dose_grams) FROM brew_log WHERE bean = X
   - Computes remaining = bean.purchased_grams - consumed
   - If remaining < threshold → sets bean.low_stock_flag = true (field update)
   - No separate stock-deduction record needed

4. UI refreshes Bean detail / stock display
   - Calls /api/x_<scope>/stock/bean/:sysId
   - Returns live remaining_grams from same BeanStockCalculator logic
```

### Why not a trigger that writes to a StockLedger table?

A ledger approach (each brew creates a debit record) is auditable but adds complexity: the UI must aggregate ledger entries to show current stock, and race conditions arise if two brews are inserted simultaneously (rare for a solo app, but still structurally wrong). For a single-user app, on-demand GlideAggregate is simpler, correct, and requires no additional tables.

### Bean restock flow

When the user buys more beans:

```
User updates Bean record → sets purchased_grams += new_purchase_amount
  (or replaces with total lifetime grams purchased)
Remaining = purchased_grams - SUM(brew_log.dose_grams) recalculates automatically
No Business Rule needed — computed on read
```

Recommend storing `purchased_grams` as a lifetime total (ever purchased), not current stock. This means the user only adds new purchases; the system always derives remaining from the immutable brew log history.

### Low-stock flag

Options:

1. **Computed on read** (preferred) — Scripted REST API returns `low_stock: true` when remaining < threshold. No flag stored on Bean. Always accurate. UI shows warning badge.
2. **Stored flag** (simpler for filtering/reporting) — Business Rule sets `bean.low_stock = true` after each brew insert. Slightly stale (only recalculated on brew events, not on restock unless a Business Rule runs on Bean update too).

Recommendation: compute on read for accuracy. If a "low stock beans" filtered list view is needed, a Business Rule on bean update + brew insert that maintains the flag is acceptable as a performance optimisation.

---

## Reporting Architecture

### In-app reporting via Fluent UI pages (recommended for MVP)

ServiceNow's native reporting engine (Reports, Dashboards, Performance Analytics) is powerful but:
- Requires navigating out of the scoped app UI into platform UI
- Not mobile-optimised
- Requires the user to have `report_admin` or specific reporting roles
- Cannot be embedded in a Fluent UI Page without iframes or Service Portal widgets (neither applies here)

For a single-user mobile app, **custom analytics UI pages within the Fluent app are the right choice**.

### Recommended in-app analytics components

| View | Data source | Implementation |
|------|------------|----------------|
| Rating trend over time | `brew_log.rating` by `logged_at` | GlideRecord query ordered by date; render as sparkline or simple score list |
| Average rating by bean | GlideAggregate: AVG(rating) GROUP BY bean | Scripted REST API → rendered as ranked bean list |
| Average rating by method/equipment | GlideAggregate: AVG(rating) GROUP BY equipment_brewer | Scripted REST API |
| Dose-to-rating correlation | All brew logs with dose + rating | Client-side scatter plot (simple 2D) or table |
| Consistency score | STDEV(rating) over last N brews | Computed client-side from raw GlideRecord result set |
| Bean consumption rate | SUM(dose_grams) per week/month | GlideAggregate by date range |

### Scripted REST API strategy for analytics

Define a single analytics endpoint in the scope:

```
/api/x_<scope>/analytics/summary
```

Returns a JSON object with all aggregated metrics in one call. This reduces mobile latency (one round-trip vs. five) and keeps the analytics UI page simple: fetch once, render from the response object.

A separate `BrewAnalytics` Script Include computes the summary. It is called only by the Scripted REST API, keeping server logic testable and separated from transport.

### When to use native ServiceNow reporting

Defer to native reporting only if:
- The user wants ad-hoc queries beyond what the analytics page provides
- Export to Excel/PDF is required
- Performance Analytics trend tracking over long periods is needed

These are all out of scope for the MVP. Flag for Phase 5 or later.

---

## Navigation Pattern: List → Form in Mobile Fluent

ServiceNow Fluent UI Pages are independent deployed pages, not a SPA with a built-in router. Navigation between them uses `window.location` or `GlideModal`-style redirects.

### Recommended pattern

Each domain entity gets two UI Pages:

- `x_<scope>_<entity>_list` — list/index view
- `x_<scope>_<entity>_form` — create/edit view

Navigation from list to form:

```javascript
// In list page React component — clicking a record row
window.location.href = `/x_<scope>_<entity>_form.do?sys_id=${record.sys_id}`;

// For new record
window.location.href = `/x_<scope>_<entity>_form.do?new=true`;
```

The form page reads `sys_id` from the URL query string on load. If `sys_id` is absent, it renders in create mode.

### Mobile-first considerations

- Keep navigation linear: list → form → back to list (avoid deep nesting)
- Use a bottom navigation bar or hamburger menu in a shared header component for top-level entity switching (Bean list, Equipment list, Recipe list, Analytics)
- The BrewLog form is the primary entry point — consider making it the landing page or one tap from the home screen
- All list views should support swipe-friendly row heights and touch targets ≥ 44px

### Shared components

Extract a `AppShell` React component (header, nav, layout wrapper) deployed as part of a shared utility page or included via the build bundle. All entity pages import it. This avoids duplicating navigation markup across five+ pages.

---

## Key Architecture Risks and Flags

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| GlideAggregate not available in scoped REST context | LOW — it is a standard server API | Verify with `npx @servicenow/sdk explain ScriptInclude` before implementing BeanStockCalculator |
| Scripted REST API scoping constraints | MEDIUM — scope isolation rules | Read `npx @servicenow/sdk explain ScriptedRestApi` topic before declaring the endpoint |
| React bundle size on mobile | MEDIUM — slow initial load on cellular | Code-split per page; avoid loading analytics bundle on the brew log page |
| Table API field-level ACLs blocking reads | LOW for single-user PDI | If moving to shared instance, add ACLs per field; skip for solo home use |
| `window.location` navigation causes full page reload | KNOWN — acceptable for this app | If perf is poor, investigate ServiceNow's `GlideModal` or a client-side router within a single page |
| CDATA polyfill bug in UIPage index.html | CONFIRMED — documented in developer memory | Omit `//< ![CDATA[` and `//]]>` wrappers from the Array.from polyfill in every new page |
