# Requirements: AIBrew

**Defined:** 2026-04-28
**Core Value:** Log a complete brew in under 60 seconds from the counter, so every session gets captured and nothing is lost.

## v1 Requirements

### Brew Logging

- [ ] **BREW-01**: User can log a brew session by selecting a brew method (pour over, espresso, French press, AeroPress, moka pot, cold brew, other) and brew type
- [ ] **BREW-02**: User can select a saved recipe preset to pre-fill the brew log form
- [ ] **BREW-03**: User can auto-fill the brew form with values from the most recent brew when no preset is selected
- [ ] **BREW-04**: User can start, stop, and record brew time using an in-page stopwatch timer during the logging session
- [ ] **BREW-05**: User can select a bean from the catalog when logging a brew
- [ ] **BREW-06**: User can enter dose weight (g), water/yield weight (g), and grind size (integer scoped to selected grinder)
- [ ] **BREW-07**: User sees brew ratio (water ÷ dose) calculated and displayed live on the logging form — not stored as a field
- [ ] **BREW-08**: User can rate a brew on a 1–10 scale when logging
- [ ] **BREW-09**: User can add free-text taste notes to a brew log entry
- [ ] **BREW-10**: User can edit a previously logged brew session
- [ ] **BREW-11**: User can delete a previously logged brew session

### Recipe Presets

- [ ] **RECIPE-01**: User can save the current brew form values as a named recipe preset immediately after logging
- [ ] **RECIPE-02**: User can view, edit, and delete saved recipe presets from a dedicated preset management screen

### Catalog — Roasters

- [ ] **CAT-01**: User can create a roaster record with name, website, and notes
- [ ] **CAT-02**: User can view and edit roaster records
- [ ] **CAT-03**: User can archive a roaster (soft-delete) — archived roasters no longer appear in active lists but brew log references are preserved

### Catalog — Beans

- [ ] **CAT-04**: User can create a bean type record linked to a roaster, with name, origin, roast level, and roast date
- [ ] **CAT-05**: User can view and edit bean type records
- [ ] **CAT-06**: User can archive a bean type — archived beans no longer appear in active pickers but brew log references are preserved

### Catalog — Equipment

- [ ] **CAT-07**: User can create an equipment record (name, type: grinder or brewer)
- [ ] **CAT-08**: User can view and edit equipment records
- [ ] **CAT-09**: User can archive equipment — archived items no longer appear in active pickers but brew log references are preserved

### Inventory

- [ ] **INV-01**: User can log a bean purchase (grams and date) linked to a bean type record
- [ ] **INV-02**: User can view remaining stock (g) on the bean detail page — computed live as sum of purchases minus sum of logged dose weights for that bean
- [ ] **INV-03**: A low-stock badge appears on a bean when remaining stock falls below 50g
- [ ] **INV-04**: User can view a chronological inventory history for a bean showing all purchases and brews with their gram amounts

### Analytics & Reporting

- [ ] **RPT-01**: User can view a reverse-chronological brew history list with inline edit and delete actions
- [ ] **RPT-02**: User can view their rating trend over time (score by date) to assess brewing consistency
- [ ] **RPT-03**: User can view average rating grouped by bean type to identify best-performing beans
- [ ] **RPT-04**: User can view average rating grouped by brew method to identify best-performing methods

### Platform & Infrastructure

- [ ] **PLAT-01**: App is accessible from the ServiceNow application navigator as a scoped application module
- [ ] **PLAT-02**: All custom tables are protected by scoped ACLs — only users with the app role can read or write app data
- [ ] **PLAT-03**: All UI pages are optimised for mobile (phone-width) form factor; brew log form shows ≤6 fields without scrolling

---

## v2 Requirements

### Recipe Intelligence

- **RECIPE-03**: App prompts user to update a recipe preset when a logged brew differs from the preset that was used as a starting point
- **RECIPE-04**: User can browse presets filtered by bean or brew method

### Inventory

- **INV-05**: User can configure a custom low-stock threshold per bean (instead of fixed 50g)
- **INV-06**: User can record purchase price per bag and see cost-per-cup metrics

### Brew Timer

- **BREW-12**: Brew timer continues counting when the phone screen turns off (requires platform feasibility investigation)

### Analytics

- **RPT-05**: User can filter brew history and analytics by date range, bean, or method
- **RPT-06**: User can see which grind size + dose combination correlates with the highest ratings for a given bean

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| User accounts / login | Single-user app; authentication adds friction with no benefit |
| Multi-user support | Home use only; no sharing or collaboration needed |
| Social features (public profiles, sharing brews) | Out of concept — personal logging tool |
| Bluetooth scale integration | Platform limitation; over-complicates the counter workflow |
| AI tasting note suggestions | Nice-to-have but conflicts with the 60-second goal; consider v3+ |
| Native ServiceNow reporting | Not mobile-optimised; cannot be embedded in a Fluent page |
| Commercial / café features | Home use only by design |
| Email / push notifications | No alert infrastructure needed for single-user personal tool |
| Brew water temperature logging | Deferred — adds form fields without enough v1 value |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PLAT-01 | Phase 1 | Pending |
| PLAT-02 | Phase 1 | Pending |
| CAT-01 | Phase 1 | Pending |
| CAT-02 | Phase 1 | Pending |
| CAT-03 | Phase 1 | Pending |
| CAT-07 | Phase 1 | Pending |
| CAT-08 | Phase 1 | Pending |
| CAT-09 | Phase 1 | Pending |
| CAT-04 | Phase 2 | Pending |
| CAT-05 | Phase 2 | Pending |
| CAT-06 | Phase 2 | Pending |
| INV-01 | Phase 2 | Pending |
| INV-02 | Phase 2 | Pending |
| INV-03 | Phase 2 | Pending |
| INV-04 | Phase 2 | Pending |
| RECIPE-01 | Phase 3 | Pending |
| RECIPE-02 | Phase 3 | Pending |
| BREW-01 | Phase 4 | Pending |
| BREW-02 | Phase 4 | Pending |
| BREW-03 | Phase 4 | Pending |
| BREW-04 | Phase 4 | Pending |
| BREW-05 | Phase 4 | Pending |
| BREW-06 | Phase 4 | Pending |
| BREW-07 | Phase 4 | Pending |
| BREW-08 | Phase 4 | Pending |
| BREW-09 | Phase 4 | Pending |
| PLAT-03 | Phase 4 | Pending |
| BREW-10 | Phase 5 | Pending |
| BREW-11 | Phase 5 | Pending |
| RPT-01 | Phase 5 | Pending |
| RPT-02 | Phase 6 | Pending |
| RPT-03 | Phase 6 | Pending |
| RPT-04 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 33 total
- Mapped to phases: 33/33
- Unmapped: 0

---
*Requirements defined: 2026-04-28*
*Last updated: 2026-04-28 after roadmap creation*
