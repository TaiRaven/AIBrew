---
phase: 4
plan: "04-02"
title: "Navigation Wiring — BrewView Scaffold + app.tsx + TopNav + HomeView"
subsystem: client-navigation
tags: [navigation, routing, scaffold, brew-view]
dependency_graph:
  requires:
    - "04-01: brew_log table must exist on instance for BrewView to POST to"
  provides:
    - "BrewView.tsx scaffold at ?view=brew"
    - "app.tsx router case 'brew' -> BrewView"
    - "TopNav 'Brew' tab enabled"
    - "HomeView 'Brew Log' tile active"
  affects:
    - "04-03: expands BrewView.tsx with form core"
    - "04-04: expands BrewView.tsx with below-fold fields and submit"
tech_stack:
  added: []
  patterns:
    - "URLSearchParams prop passed from app.tsx to BrewView (same as CatalogView)"
    - "case 'brew' split from history/analytics fall-through in renderContent()"
key_files:
  created:
    - src/client/components/BrewView.tsx
  modified:
    - src/client/app.tsx
    - src/client/components/TopNav.tsx
    - src/client/components/HomeView.tsx
decisions:
  - "BrewView accepts params: URLSearchParams prop even though unused in scaffold — prevents TypeScript unused-variable error in 04-03 when it becomes used"
  - "Brew case split from analytics/history fall-through cleanly — DisabledView no longer reached for 'brew'"
metrics:
  duration: "3 minutes"
  completed: "2026-05-06"
  tasks_completed: 3
  tasks_total: 3
---

# Phase 4 Plan 02: Navigation Wiring — BrewView Scaffold + app.tsx + TopNav + HomeView Summary

**One-liner:** BrewView.tsx scaffold wired into SPA router, TopNav tab, and HomeView tile — placeholder renders at ?view=brew on live instance.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 04-02-01 | Create BrewView.tsx scaffold | 12319c5 | src/client/components/BrewView.tsx (created) |
| 04-02-02 | Wire BrewView into app.tsx router | 442af12 | src/client/app.tsx |
| 04-02-03 | Enable Brew tab in TopNav and Brew Log tile in HomeView | 2c9f032 | src/client/components/TopNav.tsx, src/client/components/HomeView.tsx |

## Verification

- `npx @servicenow/sdk build` exits 0 (confirmed for all three tasks)
- `npx @servicenow/sdk install` exits 0 — deployed to https://dev203275.service-now.com
- On instance: TopNav "Brew" tab is now tappable (not grayed out), navigates to ?view=brew
- On instance: HomeView "Brew Log" tile is active, shows "Log your session" description, navigates to ?view=brew
- Placeholder content ("Brew Log / Brew form loading…") renders at ?view=brew

## Navigation Wiring Confirmed

- BrewView.tsx exports `default function BrewView({ params }: { params: URLSearchParams })` — correct signature for 04-03 expansion
- app.tsx: `import BrewView from './components/BrewView'` added; `case 'brew': return <BrewView params={params} />` replaces the DisabledView fall-through
- TopNav.tsx: brew entry changed from `disabled: true` to `disabled: false`
- HomeView.tsx: brew tile changed to `active: true, view: 'brew', description: 'Log your session'` — matching D-02 decision exactly

## SDK Build Notes

- One warning throughout all builds: "No tsconfig.json found in src/client directory, using default compiler options" — this is a pre-existing project condition, not introduced by this plan
- No new warnings introduced

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

BrewView.tsx contains intentional placeholder content:
- File: `src/client/components/BrewView.tsx`
- Content: "Brew form loading…" paragraph
- Reason: Intentional scaffold — Plans 04-03 and 04-04 will replace this with the full form implementation. This stub enables incremental deployment and navigation verification before form content is built.

## Threat Flags

None — no new network endpoints, auth paths, or trust boundary changes introduced. BrewView receives URLSearchParams from app.tsx which already guards unknown views with navigateToView('home') redirect. DisabledView is no longer reached for 'brew' case (integrity threat from plan threat_model resolved).

## Self-Check: PASSED
