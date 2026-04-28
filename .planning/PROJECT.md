# AIBrew

## What This Is

A mobile-first home coffee brew logging app built as a ServiceNow Fluent scoped app. It lets a solo home barista log every brew — method, recipe, bean, grind, and taste notes — while standing at the counter, tracks bean inventory and equipment as catalogs, and surfaces patterns to help improve brewing consistency over time.

## Core Value

Log a complete brew in under 60 seconds from the counter, so every session gets captured and nothing is lost.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Log a brew session: method, brew type, bean used, dose, water weight, grind size, equipment, taste notes, rating
- [ ] Saved recipe presets — tap a saved recipe as a starting point, adjust before logging
- [ ] Bean catalog — list of owned beans with roaster, origin, roast level, roast date
- [ ] Bean inventory management — track grams purchased, grams consumed per brew, flag low stock
- [ ] Roaster catalog — reference list of roasters linked to beans
- [ ] Equipment catalog — grinders and brewers available to select when logging
- [ ] Pattern analysis — correlate recipe variables and bean choices with taste ratings over time
- [ ] Brewing consistency view — track score trends across sessions to see improvement or drift
- [ ] Mobile-first UI — minimal taps, optimised for one-handed use at the counter

### Out of Scope

- Multi-user accounts / sharing — single user only; no auth complexity
- Commercial or café-facing features — home use only
- Social features (sharing brews publicly, following other users)

## Context

- Built on **ServiceNow Fluent (now-sdk)**, Zurich release, as a scoped app
- Solo developer project — no team coordination overhead
- Usage moment is **at the counter while brewing** — mobile form factor, speed is critical
- User wants to understand what drives consistency, not just archive brews
- Inventory depletion should happen automatically as brews are logged (no manual subtraction)

## Constraints

- **Tech stack**: ServiceNow Fluent/now-sdk (Zurich) — all UI is Fluent components, no Jelly or UI Builder
- **Scoped app**: Never use global scope; all artifacts stay within the app scope
- **Single user**: No authentication, login, or multi-tenancy required
- **Mobile-first**: Primary interaction is phone-sized screen at the counter

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| ServiceNow Fluent platform | Developer's primary toolchain; scoped app pattern already established | — Pending |
| Single-user, no auth | Home use only; no value in login friction for a personal tool | — Pending |
| Auto-deduct inventory on brew log | Removes manual step; consumption is a direct consequence of logging | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-28 after initialization*
