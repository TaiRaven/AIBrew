# Roadmap: AIBrew

## Overview

AIBrew is built in six phases that follow the data dependency order of the app's six scoped tables. Phase 1 lays the platform foundation and the first two reference catalogs (roasters and equipment) so every later phase has something to reference. Phase 2 adds beans and inventory, completing the catalog layer. Phase 3 adds recipe presets, which unlock the brew form's preset picker. Phase 4 delivers the core brew logging form — the app's primary value — along with the in-page timer, auto-fill, ratio display, and mobile optimisation. Phase 5 surfaces brew history and edit/delete actions. Phase 6 closes the loop with analytics views built on the aggregated data that only becomes meaningful after real brews exist.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: App Foundation** - SDK init, scoped app, ACLs, navigator, roaster and equipment catalogs (Complete 2026-04-30)
- [x] **Phase 2: Bean Catalog & Inventory** - Bean type records, purchase ledger, computed stock, low-stock badge (Complete 2026-05-01)
- [x] **Phase 3: Recipe Presets** - Recipe table, preset list UI, save-from-brew action (Complete 2026-05-05)
- [x] **Phase 4: Brew Log Core** - BrewLog table, brew logging form with timer, presets, ratio, rating, mobile layout (Complete 2026-05-06)
- [ ] **Phase 5: Brew History & Management** - Brew history list, edit and delete on past brews
- [ ] **Phase 6: Analytics** - Scripted REST aggregations, rating trend, avg by bean, avg by method

## Phase Details

### Phase 1: App Foundation
**Goal**: The scoped app exists on the instance, is reachable from the navigator, and the roaster and equipment catalogs are fully functional
**Depends on**: Nothing (first phase)
**Requirements**: PLAT-01, PLAT-02, CAT-01, CAT-02, CAT-03, CAT-07, CAT-08, CAT-09
**Success Criteria** (what must be TRUE):
  1. User can open AIBrew from the ServiceNow application navigator without error
  2. User can create, view, edit, and archive a roaster record
  3. User can create, view, edit, and archive an equipment record (grinder or brewer)
  4. Archived roasters and equipment no longer appear in active picker lists
  5. A non-admin user with the app role can read and write app data; a user without the role cannot
**Plans**: 6 plans
Plans:
- [x] 01-PLAN-01.md — SDK init: capture real scope prefix, scaffold project, install dependencies
- [x] 01-PLAN-02.md — Fluent artifacts: Roaster + Equipment tables, role, ACLs, navigator module, UiPage
- [x] 01-PLAN-03.md — React client foundation: index.html (polyfill D-06), utils, AppShell, TopNav
- [x] 01-PLAN-04.md — HomeView tile grid and full Roaster catalog section (list, create, edit, archive)
- [x] 01-PLAN-05.md — Equipment catalog section (list, create, edit, archive with type chip)
- [x] 01-PLAN-06.md — Deploy to instance and verify all Phase 1 criteria with non-admin test user
**UI hint**: yes

### Phase 2: Bean Catalog & Inventory
**Goal**: Users can manage their bean collection and see accurate, live remaining-stock figures derived from the purchase ledger
**Depends on**: Phase 1
**Requirements**: CAT-04, CAT-05, CAT-06, INV-01, INV-02, INV-03, INV-04
**Success Criteria** (what must be TRUE):
  1. User can create, view, edit, and archive a bean type record linked to a roaster
  2. User can log a bean purchase (grams and date) against a bean type record
  3. Remaining stock (g) on the bean detail page reflects current purchases minus brews logged for that bean
  4. A low-stock badge appears on beans with less than 50 g remaining
  5. User can view a chronological inventory history for a bean showing all purchases and brew depletions
**Plans**: 5 plans
Plans:
- [x] 02-01-PLAN.md — Fluent table definitions: bean + bean_purchase tables, 8 ACLs, index.now.ts exports
- [x] 02-02-PLAN.md — Scripted REST API + Script Include: stock endpoint, GlideAggregate handler
- [x] 02-03-PLAN.md — BeanSection.tsx list view: pantry/empty tabs, card grid, stock bars, create modal
- [x] 02-04-PLAN.md — BeanSection.tsx detail view: RecordProvider form, stock bar, Add Beans form, purchase history
- [x] 02-05-PLAN.md — CatalogView wiring, deploy, and human UAT
**UI hint**: yes

### Phase 3: Recipe Presets
**Goal**: Users can save, browse, edit, and delete named recipe presets that pre-fill the brew log form
**Depends on**: Phase 2
**Requirements**: RECIPE-01, RECIPE-02
**Success Criteria** (what must be TRUE):
  1. After logging a brew, user can save the current form values as a named preset (RECIPE-01 — DEFERRED to Phase 4)
  2. User can view all saved presets in a dedicated management screen
  3. User can edit a preset's name and values, and archive a preset, from that screen
**Plans**: 4 plans
Plans:
- [x] 03-01-PLAN.md — Fluent artifacts: recipe table, 4 ACLs, index.now.ts exports, deploy
- [x] 03-02-PLAN.md — RecipeSection.tsx list view: card grid, create modal
- [x] 03-03-PLAN.md — RecipeSection.tsx detail/edit/archive + CatalogView wiring, deploy
- [x] 03-04-PLAN.md — Human UAT: verify all RECIPE-02 criteria with non-admin test user
**UI hint**: yes

### Phase 4: Brew Log Core
**Goal**: Users can log a complete brew in under 60 seconds from the counter using a mobile-optimised form with timer, preset picker, auto-fill, live ratio, and rating
**Depends on**: Phase 3
**Requirements**: BREW-01, BREW-02, BREW-03, BREW-04, BREW-05, BREW-06, BREW-07, BREW-08, BREW-09, PLAT-03
**Success Criteria** (what must be TRUE):
  1. User can open the brew log form, select a method and bean, enter dose and water weight, and submit — with no more than 6 fields visible by default on a phone-width screen
  2. Brew ratio (water / dose) updates live on the form without requiring a submit
  3. User can tap a saved preset to pre-fill the form, or have the form auto-fill from the most recent brew when no preset is selected
  4. User can start, stop, and record brew time using the in-page stopwatch during the session
  5. User can add a 1–10 rating and free-text taste notes before submitting
**Plans**: 5 plans
Plans:
- [x] 04-01-PLAN.md — Fluent artifacts: brew_log table + ACLs + deploy
- [x] 04-02-PLAN.md — Navigation wiring: BrewView scaffold + app.tsx + TopNav + HomeView
- [x] 04-03-PLAN.md — Form core: method chips, bean picker, dose/water/ratio, grind size, timer
- [x] 04-04-PLAN.md — Below-fold fields + submit handler + confirmation banner
- [x] 04-05-PLAN.md — RECIPE-01 save-as-preset modal + full phase UAT
**UI hint**: yes

### Phase 5: Brew History & Management
**Goal**: Users can review all past brews in reverse-chronological order and correct or remove any entry
**Depends on**: Phase 4
**Requirements**: BREW-10, BREW-11, RPT-01
**Success Criteria** (what must be TRUE):
  1. User can view a reverse-chronological list of all logged brews
  2. User can tap a brew in the history list and edit any of its fields
  3. User can delete a brew from the history list, with the inventory stock figure updating to reflect the removal
**Plans**: 4 plans
Plans:

**Wave 1**
- [ ] 05-01-PLAN.md — Navigation wiring + HistoryView scaffold (list, cards, load more, empty/error states)

**Wave 2** *(blocked on Wave 1 completion)*
- [ ] 05-02-PLAN.md — Edit modal (form fields pre-population, PATCH save, listKey refresh)

**Wave 3** *(blocked on Wave 2 completion)*
- [ ] 05-03-PLAN.md — Delete flow (confirmation modal, hard DELETE, both entry points)

**Wave 4** *(blocked on Wave 3 completion — human UAT checkpoint)*
- [ ] 05-04-PLAN.md — Deploy + full UAT with non-admin aibrew_user account

Cross-cutting constraints:
- SysId validated with `/^[0-9a-f]{32}$/i` before every PATCH/DELETE URL (all plans)
- `g_ck` guard on every mutating fetch (all plans)
- `sysparm_display_value=all` on every Table API fetch (all plans)
- Do NOT call `res.json()` on DELETE 204 No Content response (Plan 03)

**UI hint**: yes

### Phase 6: Analytics
**Goal**: Users can see rating trends and average performance by bean and method to understand what drives their best brews
**Depends on**: Phase 5
**Requirements**: RPT-02, RPT-03, RPT-04
**Success Criteria** (what must be TRUE):
  1. User can view a rating trend chart showing score by brew date
  2. User can view average rating grouped by bean type, ranked highest to lowest
  3. User can view average rating grouped by brew method, ranked highest to lowest
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. App Foundation | 6/6 | Complete | 2026-04-30 |
| 2. Bean Catalog & Inventory | 5/5 | Complete | 2026-05-01 |
| 3. Recipe Presets | 4/4 | Complete | 2026-05-05 |
| 4. Brew Log Core | 5/5 | Complete | 2026-05-06 |
| 5. Brew History & Management | 0/4 | Not started | - |
| 6. Analytics | 0/TBD | Not started | - |
