---
plan: "01-PLAN-06"
phase: 1
wave: 4
status: complete
completed: "2026-04-30"
---

# Summary: Deploy + Human Verification

## What Was Built

Phase 1 deployed to **dev203275.service-now.com** and all 5 success criteria verified by a non-admin test user.

**Deploy:**
- `npx @servicenow/sdk build` exits 0, no TypeScript errors
- `npx @servicenow/sdk install` exits 0, app live at `x_664529_aibrew_home.do`

**Bug fixes applied during UAT:**
1. `Modal` footer action events fire as `e.detail.payload.action` — fixed archive modal handler (was reading `e.detail.action`, label never matched)
2. Create modals had no Save button — added `FormActionBar` inside `RecordProvider` with `onFormSubmitCompleted` to close modal after save
3. `NowRecordListConnected` has no `query`/`filter` prop — `key="active=true"` was a static React key with no filtering effect. Replaced both Roaster and Equipment list views with direct Table API fetches using `sysparm_query=active=true`; added `listKey` state to trigger re-fetch after record creation

## Deviations

- `FormActionBar` used instead of a custom Save button — no programmatic `gForm.save()` API exists in the Fluent adapter; `FormActionBar` is the documented save mechanism
- List views replaced with custom Table API fetch components instead of `NowRecordListConnected` — the SDK component exposes no filter/query prop

## Key Files

### modified
- `src/client/components/RoasterSection.tsx` — custom fetch list (active=true filter + refresh), archive event fix, FormActionBar for create
- `src/client/components/EquipmentSection.tsx` — same fixes mirrored

## Human Verification Results

| Test Block | Criteria | Result |
|---|---|---|
| Block 1 — Navigator | PLAT-01 | ✓ Pass |
| Block 2 — Roaster CRUD | CAT-01, CAT-02, CAT-03 | ✓ Pass (after fixes) |
| Block 3 — Equipment CRUD | CAT-07, CAT-08, CAT-09 | ✓ Pass (after fixes) |
| Block 4 — Archived records filter | CAT-03, CAT-09 | ✓ Pass (after fixes) |
| Block 5 — ACL (non-admin user) | PLAT-02 | ✓ Pass |
| Block 6 — App shell behaviours | — | ✓ Pass |

## Self-Check: PASSED

- `npx @servicenow/sdk install` exits 0 — app deployed to dev203275.service-now.com
- AIBrew navigator entry visible and clickable for users with the app role
- Roaster CRUD (create, view, edit, archive) works end-to-end
- Equipment CRUD (create, view, edit, archive) works end-to-end
- Archived records do not appear in active list views — confirmed on live instance
- Non-admin user with x_664529_aibrew.user role can read and write app tables
- User without the app role receives 403 on direct Table API access
