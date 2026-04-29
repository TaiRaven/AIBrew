---
plan: "01-PLAN-05"
phase: 1
wave: 3
status: complete
completed: "2026-04-29"
---

# Summary: EquipmentSection

## What Was Built

**EquipmentSection** — Full CRUD for the equipment catalog, mirroring the Roaster pattern:

- **Empty state**: `EquipmentEmptyState` with equipment-specific copy ("No equipment yet", "Add your grinders and brewers so you can track grind size per device.", CTA "Add your first piece of equipment")
- **Detail/edit view**: `EquipmentDetailView` — `RecordProvider sysId={sysId}` + `FormColumnLayout`, back navigation via `Button variant="tertiary"`, archive chip
- **Archive flow**: `Modal` confirmation ("Archive this piece of equipment?") → PATCH `active='false'` → back to list. Error state: "Couldn't archive — try again in a moment."
- **List view**: `EquipmentListView` — `NowRecordListConnected` with `columns="name,type,notes"` and `key="active=true"`, "New equipment" CTA using `Button variant="primary"`
- **Create modal**: `Modal` + `RecordProvider table={EQUIPMENT_TABLE} sysId="-1"` + `FormColumnLayout`

Table name: `x_664529_aibrew_equipment` (real scope prefix from `now.config.json`).

`CatalogView.tsx` was already importing `EquipmentSection` (done together in the same commit as Plan 04).

## Deviations

- Same SDK-version deviations as Plan 04: `Button` instead of `NowButton`, `Modal` instead of `NowModal`, `key="active=true"` instead of `query` prop.
- `EquipmentEmptyState` is defined but the list view doesn't render it conditionally on empty (NowRecordListConnected has built-in empty state handling). The component is available for future use.

## Key Files

### created
- `src/client/components/EquipmentSection.tsx`

### modified
- `src/client/components/CatalogView.tsx` — imports and renders `EquipmentSection` (done in same commit as Plan 04)

## Self-Check: PASSED

- EquipmentSection uses `NowRecordListConnected` with `columns` including `type` — confirmed in source
- Create modal uses `RecordProvider sysId="-1"` inside `Modal`
- Archive uses `Modal` confirmation and PATCH `active='false'` — no hard delete
- Equipment-specific copy "No equipment yet" present — confirmed in source
- All interactive elements use `Button` — no raw HTML `<button>`, `<input>`, `<select>`, `<a>`
- No `x_SCOPE` placeholder — real scope `x_664529_aibrew` used throughout
- `npx @servicenow/sdk build` exits 0 (confirmed)
