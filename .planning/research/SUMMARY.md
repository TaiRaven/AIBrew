# Research Summary — AIBrew

## Recommended Stack

- **ServiceNow Fluent (now-sdk >= 4.6.0) on Zurich** — the only viable UI layer for this scoped app; pin the SDK version to the Zurich-compatible release before first `npm install`
- **React 18.2.0 + @servicenow/react-components** — all interactive elements must use SDK components, never raw HTML inputs; this is what makes mobile tap targets and form patterns work correctly
- **Six scoped tables** (`roaster`, `bean`, `equipment`, `recipe`, `brew_log`, `bean_purchase`) — bean inventory is a ledger derived from `bean_purchase` and `brew_log.dose_grams` records, never a mutable stock column
- **Scripted REST API + BeanStockCalculator Script Include** — the Table API cannot aggregate; a single `/api/x_<scope>/stock/bean/:sysId` endpoint backed by a GlideAggregate Script Include is required for inventory display and low-stock alerts
- **URLSearchParams SPA navigation** — `?view=list`, `?view=detail&id=<sysId>`, `?view=create`; always use this pattern, never hash routing; include Polaris iframe detection on every page

---

## Table Stakes Features

These must ship in v1 for the app to be useful. Absence makes the app feel broken.

- New brew log with: method selection, bean picker (linked to catalog), dose (g), water/yield weight (g), grind size (integer linked to equipment record), brew time, rating (1-10), taste notes
- Calculated brew ratio displayed live (water / dose) — never stored as a field
- Brew history list — reverse-chronological, with edit and delete on every entry
- Bean catalog — name, roaster, roast level, roast date, linked to roaster record
- Equipment catalog — grinders and brewers in one table, separated by a type Choice field
- Saved recipe presets — pre-fill the brew form; auto-populate last-used values when no recipe is selected
- Bean inventory — remaining grams computed from purchase ledger minus logged dose sum; low-stock warning badge
- Soft-delete (active boolean) on all catalog tables — never hard-delete reference records that brew logs point to

---

## Architecture in One Page

**Entities and relationships:**

```
ROASTER (1) -> (N) BEAN -> (N) BEAN_PURCHASE
                                    |
                              (N) BREW_LOG
                                    |
EQUIPMENT (grinder/brewer) ---------+
RECIPE (optional preset) -----------+
```

BrewLog is the hub: it holds reference fields for bean_purchase, equipment_grinder, equipment_brewer, and optionally recipe. All analysis and inventory figures are derived from BREW_LOG rows — no mutable computed columns anywhere.

**Build order (dependency order):**
1. Roaster table + list UI
2. Equipment table + list UI
3. Bean table + BeanStockCalculator Script Include + bean list/form UI
4. Recipe table + list/form UI
5. BrewLog table + Business Rule (after insert, low-stock check) + form UI + history list UI
6. Analytics UI page (reads BrewLog via Scripted REST; defer until 20+ real brews exist)

**Layer boundaries:**
- React UI pages call Table API for CRUD; call Scripted REST API for aggregated/computed data
- Business Rules and Script Includes run server-side, enforce all data integrity rules
- No business logic in React component actionHandlers — client is view-only

**Key component boundary:** A single AppShell React component (header, nav, layout) is shared across all UI pages via the build bundle. All entity pages use list + form page pairs with URLSearchParams routing.

---

## Critical Pitfalls to Avoid

1. **Form overload kills logging** — Keep the default brew log form to 6 visible fields maximum; progressive disclosure hides optional fields. If the happy path (recipe -> tweak -> submit) takes more than 4 taps, restart the design.

2. **Grind size must be an integer linked to an equipment record** — Never store it as a string. It is only meaningful relative to a specific grinder. Getting this wrong at schema time requires migrating all existing records.

3. **Never store a mutable stock column** — Inventory correctness depends on computing remaining grams as SUM(bean_purchase.grams) - SUM(brew_log.dose_grams WHERE bean = X). Any current_stock_grams field written by a trigger will diverge when brews are edited or deleted.

4. **Bean purchase is a separate record from bean type** — Buying a new bag of the same bean is a new bean_purchase row, not an edit to the bean record. Updating roast date in place corrupts all historical brew records that referenced the old purchase. Design this correctly before building any catalog UI.

5. **Test with a non-admin account before every phase sign-off** — Scoped app ACL gaps and cross-scope access failures are invisible to an admin user and only surface for normal users. Define a custom role (x_aibrew.user) and ACLs for every custom table before first deploy.

**Runners-up worth flagging:**
- SDK deploy is a replace, not a merge — never edit SDK-managed artifacts directly on the instance
- Set browser device simulation to iPhone SE (375px) from day one; never design in desktop width
- Pin now-sdk version in package.json before npm install; verify Zurich compatibility before upgrading

---

## Open Questions for Planning

These need decisions before detailed phase planning can proceed.

1. **Bean data model depth** — Is the 3-table model (roaster / bean_type / bean_purchase) the right v1 scope, or is a simpler 2-table model (roaster / bean with one purchase tracked) acceptable initially? The 3-table model is architecturally correct but adds UI surface area.

2. **Brew timer in v1?** — A built-in stopwatch is a differentiator, but running a timer while the phone screen is off in a ServiceNow Fluent context needs a feasibility spike. Decision needed: include a basic in-page timer, defer to v2, or skip entirely.

3. **Inventory threshold** — What gram threshold triggers a low-stock warning? Hardcoded (e.g., 50 g) or user-configurable per bean? A user preference table adds scope; a hardcoded constant is a known limitation.

4. **Analytics phase gate** — Pattern analysis is only useful after ~20 real brews. Should the Analytics page be built in a later phase behind a data gate, or scaffolded as an empty state from day one to validate the UI structure early?

5. **Scope prefix** — The x_snc_aibrew prefix used in research is a placeholder. The actual prefix is assigned by sdk init based on the instance company code. All table names must be confirmed after initialization before any code that references table names is written.

6. **Recipe update flow** — When a user logs a brew that differs from a preset, should the app prompt "update this recipe?" Deciding the answer before building the recipe and brew log forms avoids a retrofit.
