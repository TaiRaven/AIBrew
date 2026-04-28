# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**AIBrew** is a mobile-first ServiceNow scoped app for home coffee brew logging, built with the Fluent/now-sdk framework on the **Zurich release**. Solo developer, single user, no authentication needed.

**Core value:** Log a complete brew in under 60 seconds from the counter.

Planning docs: `.planning/` — read `ROADMAP.md` and `STATE.md` for current progress.

## Key Constraints

- All code is scoped — never suggest global-scope solutions.
- Frontend is Fluent/now-sdk only (not Jelly, UI Builder, or classic ServiceNow UI).
- UI: React 18.2.0 + `@servicenow/react-components` — never raw HTML elements.
- Target: Zurich release.
- Inventory balance is always **computed** (purchases − brews via GlideAggregate) — never stored as a mutable column.

## Architecture

Six scoped tables (build in this order — each depends on the previous):

| Table | Purpose |
|---|---|
| `x_<scope>_roaster` | Roaster catalog |
| `x_<scope>_equipment` | Grinders and brewers |
| `x_<scope>_bean` | Bean types (linked to roaster) |
| `x_<scope>_bean_purchase` | Purchase ledger (grams per bag buy) |
| `x_<scope>_recipe` | Saved brew presets |
| `x_<scope>_brew_log` | Core brew session records (hub — references all other tables) |

Scope prefix is set by `sdk init` from the instance company code (`glide.appcreator.company.code`). Confirm it before writing any code that references table names.

UI Pages use URLSearchParams SPA routing (`?view=list`, `?view=detail&id=<sysId>`, `?view=create`). Always implement Polaris iframe detection on every page.

Computed stock and analytics data require a Scripted REST API backed by Script Includes — the Table API cannot aggregate.

## Development Commands

Before writing any Fluent/now-sdk code, use the `fluent:now-sdk-explain` skill to look up SDK documentation.

```bash
# List all available SDK documentation topics
npx @servicenow/sdk explain --list --format=raw

# Search for a topic (always peek before reading in full)
npx @servicenow/sdk explain <topic> --list --peek --format=raw
npx @servicenow/sdk explain <topic> --peek --format=raw
npx @servicenow/sdk explain <topic> --format=raw

# One-time app initialisation
npx @servicenow/sdk init --appName "AIBrew" --packageName "aibrew" --scopeName "x_<scope>" --template base
npm install

# Auth
npx now-sdk auth --add <instance-url> --type basic

# Development loop
npx @servicenow/sdk build    # compile + validate
npx @servicenow/sdk install  # push to instance
```

## SDK Setup

Node 20+ and `@servicenow/sdk` ≥ 4.6.0 are required. Run the `fluent:now-sdk-setup` skill if SDK commands fail with environment errors.

## GSD Workflow

This project uses GSD for structured phase-based development.

```
/gsd-discuss-phase <N>   — gather context and clarify approach before planning
/gsd-plan-phase <N>      — create a detailed execution plan for a phase
/gsd-execute-phase <N>   — execute all plans in a phase
/gsd-progress            — check current status
```

**Current state:** See `.planning/STATE.md`
**Next step:** `/gsd-discuss-phase 1`

## Critical Pitfalls

- **Form overload:** Keep the default brew log form to ≤6 visible fields — more kills the 60-second goal.
- **Grind size schema:** Must be an `IntegerColumn` linked to an equipment record, not a plain string. Getting this wrong at schema time requires migrating all existing records.
- **Mutable stock column:** Never store `current_stock_grams`. Always compute from ledger sum.
- **Bean purchase vs bean type:** A new bag purchase is a new `bean_purchase` row, not an edit to the `bean` record. Editing roast date in place corrupts historical brew references.
- **ACL testing:** Always test with a non-admin user before each phase sign-off — ACL gaps are invisible to admin.
- **SDK deploy replaces:** Never edit SDK-managed artifacts directly on the instance.
- **Array.from polyfill:** Every `index.html` needs the inline CDATA-wrapped Array.from polyfill before the module script tag, or the page renders blank.
