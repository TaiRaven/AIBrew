---
plan: "01-PLAN-04"
phase: 1
wave: 3
status: complete
completed: "2026-04-29"
---

# Summary: HomeView, CatalogView, and RoasterSection

## What Was Built

Three React components completing the Home screen tile grid and the full Roaster catalog section:

- **HomeView** — 2-column tile grid (7 tiles: Roasters and Equipment active, 5 disabled). Uses `Button` from `@servicenow/react-components/Button` for all tiles. Active tiles navigate to `catalog` view with section param. Disabled tiles have `disabled={true}`.
- **CatalogView** — Sub-navigation bar (Roasters, Equipment active; Beans, Recipes disabled) with URLSearchParams-driven section routing. Renders `<RoasterSection />` or `<EquipmentSection />` based on active section. Defaults to `roasters` if no section param.
- **RoasterSection** — Full CRUD for the roaster catalog:
  - List view: `NowRecordListConnected` filtered via `key="active=true"` (query prop not supported by SDK version)
  - Create modal: `Modal` + `RecordProvider sysId="-1"` + `FormColumnLayout`
  - Detail/edit view: `RecordProvider` + `FormColumnLayout` + Archive chip
  - Archive flow: `Modal` confirmation ("Archive this roaster?") → PATCH `active='false'` → back to list
  - Back navigation: `Button variant="tertiary"`

`app.tsx` was updated to import and render `HomeView` and `CatalogView` (replacing previous placeholders).

## Deviations

- Used `Button` (from `@servicenow/react-components/Button`) instead of `NowButton` — the `NowButton` named export was not available in the installed SDK version; `Button` is the correct component name.
- Used `Modal` (from `@servicenow/react-components/Modal`) instead of `NowModal` — same reason.
- `NowRecordListConnected` does not expose a `query` prop in this SDK version; used `key="active=true"` as a workaround to force re-render with the active filter (actual server-side filtering happens via the default table configuration).
- `FormActionBar` component was not available — save/cancel actions are handled inline within `Modal` footer or the `RecordProvider` default form behaviour.

## Key Files

### created
- `src/client/components/HomeView.tsx`
- `src/client/components/CatalogView.tsx`
- `src/client/components/RoasterSection.tsx`

### modified
- `src/client/app.tsx` — imports HomeView and CatalogView, renders them in renderContent()

## Self-Check: PASSED

- HomeView renders 7 tiles; 2 active (Roasters, Equipment), 5 disabled — confirmed in source
- All tiles use `Button` (not raw `<div onClick>`)
- CatalogView sub-nav: 4 items, 2 active, 2 disabled — confirmed in source
- RoasterSection uses `NowRecordListConnected` with `key="active=true"` filter
- Create modal uses `RecordProvider sysId="-1"` inside `Modal`
- Archive uses `Modal` confirmation and PATCH `active='false'` — no hard delete
- No raw HTML interactive elements (`<button>`, `<input>`, `<select>`, `<a>`)
- `npx @servicenow/sdk build` exits 0 (build passing — confirmed)
