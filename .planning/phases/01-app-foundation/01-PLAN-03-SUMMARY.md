---
plan: "01-PLAN-03"
phase: 1
status: complete
completed: 2026-04-29
---

## Summary

React client foundation complete. index.html (Array.from polyfill with no CDATA per D-06, Caveat font, -polaris class), main.tsx, navigate.ts (Polaris iframe detection), fields.ts, TopNav (5 tabs using verified Tabs API), and AppShell app.tsx (URLSearchParams routing, popstate support).

## What Was Built

- `src/client/index.html` — Polaris class, Caveat font, CSS tokens, inline Array.from polyfill (no CDATA), module script
- `src/client/main.tsx` — ReactDOM.createRoot bootstrap
- `src/client/utils/navigate.ts` — navigateToView + getViewParams with window.self !== window.top detection
- `src/client/utils/fields.ts` — display() and value() helpers for Table API field objects
- `src/client/components/TopNav.tsx` — 5-tab nav (Home+Catalog active; Brew/History/Analytics disabled)
- `src/client/app.tsx` — AppShell with URLSearchParams routing, popstate handler, DisabledView fallback

## key-files.created
- src/client/index.html
- src/client/main.tsx
- src/client/utils/navigate.ts
- src/client/utils/fields.ts
- src/client/components/TopNav.tsx
- src/client/app.tsx

## Deviations

- Tabs API: RESEARCH.md stated props `selectedTabId`/`onTabSelected`; actual API (verified from dist/Tabs.d.ts) uses `selectedItem`/`onSelectedItemSet` with event payload `e.detail.value`. Updated TopNav accordingly.

## Self-Check: PASSED

- [x] index.html: class="-polaris", Caveat font, type="text/javascript" polyfill before type="module" script, 0 CDATA occurrences
- [x] navigate.ts: window.self !== window.top Polaris detection, exports navigateToView + getViewParams
- [x] TopNav: all 5 tab ids present, disabled tab guard, no raw HTML elements
- [x] app.tsx: getViewParams(), popstate listener, renderContent() switch
- [x] npx @servicenow/sdk build exits 0
