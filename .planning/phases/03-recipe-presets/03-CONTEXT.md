# Phase 3: Recipe Presets - Context

**Gathered:** 2026-05-01
**Status:** Ready for planning

<domain>
## Phase Boundary

A new `x_664529_aibrew_recipe` table stores named recipe presets. The Recipes sub-tab in CatalogView is enabled. Users can create, view, edit, and archive (soft-delete) presets from a dedicated management screen in Catalog > Recipes. A manual "New Preset" form is provided so presets can be created before the brew log form exists (Phase 4). The "save-from-brew" action (RECIPE-01) is wired in Phase 4, not here.

This phase does NOT build brew logging (Phase 4). Presets in Phase 3 have no brew log references — they are standalone configuration records.

</domain>

<decisions>
## Implementation Decisions

### Preset Schema
- **D-01:** Recipe preset is **bean-agnostic** — it stores recipe variables only, not a bean reference. The bean is selected separately at brew-time. This makes presets reusable across different beans.
- **D-02:** Preset fields: `name` (string, required), `method` (ChoiceColumn: pour over / espresso / French press / AeroPress / moka pot / cold brew / other), `equipment` (reference to `x_664529_aibrew_equipment`), `dose_weight_g` (decimal/float), `water_weight_g` (decimal/float), `grind_size` (IntegerColumn — per-grinder integer, scoped to the equipment reference), `notes` (string, optional free-text annotation for the preset itself — distinct from brew taste notes).
- **D-03:** Brew ratio is NOT stored — it is computed from `water_weight_g / dose_weight_g` at display time, same as the live ratio on the brew form.

### Archive (Soft-Delete)
- **D-04:** Presets use **archive (soft-delete)** with an `active` BooleanColumn — consistent with roasters, equipment, and beans. Archived presets no longer appear in the active list or the brew form picker (Phase 4). Historical consistency with the rest of the app.
- **D-05:** Archive action uses the standard Modal confirmation pattern (same as other catalog entities). No "Empty" tab — archived presets simply disappear from the list (unlike beans which have the "Empty bags" tab for depleted stock).

### Create Flow (Phase 3)
- **D-06:** Phase 3 ships a **"New Preset" button** in Catalog > Recipes that opens a create modal — same pattern as Roaster/Bean create (Modal → `RecordProvider sysId="-1"` + `FormActionBar` + `FormColumnLayout`). Users can create presets manually without the brew log form.
- **D-07:** **Save-from-brew (RECIPE-01)** — the action to save current brew form values as a preset immediately after logging — is deferred to Phase 4 where the brew log form is built. Phase 3 only needs manual preset creation.

### Preset List Card Design
- **D-08:** Each preset card in the list shows: **preset name** (primary, larger text) + **method chip** (e.g. "V60", "Espresso") + **dose and water weights + computed ratio** (e.g. `18g • 300g  1:16.7`). This is enough to identify a preset at a glance without opening it.
- **D-09:** No tabs (unlike bean list's "In pantry" / "Empty bags") — presets are a flat list of active records. Archived presets are not shown anywhere in the list.

### Claude's Discretion
- Exact ChoiceColumn values for `method` — follow the brew method list from REQUIREMENTS.md BREW-01 (pour over, espresso, French press, AeroPress, moka pot, cold brew, other).
- Visual styling of the method chip on the card — use `var(--aibrew-accent)` consistent with other tags in the app.
- ACL structure — single `aibrew_user` role (read/write/create/delete), consistent with all other Phase 1 ACL patterns.
- Field ordering on the create/edit form — name first, then method, equipment, dose, water, grind size, notes.
- Empty state copy for the preset list before any presets are created.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and requirements
- `.planning/ROADMAP.md` §Phase 3 — Goal, requirements list (RECIPE-01, RECIPE-02), success criteria
- `.planning/REQUIREMENTS.md` — RECIPE-01, RECIPE-02 (full requirement specs); also BREW-02 (preset picker in brew form — Phase 4 concern, but informs schema design)

### Patterns to replicate (Phase 1 + 2)
- `src/client/components/RoasterSection.tsx` — Canonical list/detail/create/archive pattern. RecipeSection must match this structure.
- `src/client/components/BeanSection.tsx` — Second reference, especially for card layout (stock bar → replace with ratio display for presets).
- `src/client/components/CatalogView.tsx` — SUB_NAV array: `recipes` entry is currently `disabled: true`. Must be set to `disabled: false`; `RecipeSection` imported and wired in `renderSection()`.
- `src/client/utils/navigate.ts` — `navigateToView`, `getViewParams` for SPA routing.
- `src/client/utils/fields.ts` — `display`, `value` helpers for Table API field access.

### Fluent artifact patterns (must replicate)
- `src/fluent/tables/roaster.now.ts` — Table definition pattern (columns, BooleanColumn active, etc.).
- `src/fluent/acls/roaster-acls.now.ts` — ACL pattern (4 ACLs: read/write/create/delete, type: 'record', roles: [aibrew_user]).
- `src/fluent/roles/aibrew-user.now.ts` — Role import used in all ACLs.
- `src/fluent/index.now.ts` — All new artifacts must be exported here.

### Project constraints
- `CLAUDE.md` §Key Constraints — Fluent/now-sdk only, scoped app, React 18.2.0 + @servicenow/react-components, Zurich release.
- `CLAUDE.md` §Critical Pitfalls — Grind size schema MUST be IntegerColumn linked to equipment record (not a plain string). ACL testing with non-admin user before sign-off.
- `CLAUDE.md` §Architecture — Scope prefix `x_664529_aibrew`. Table build order.

### No external specs
No additional ADRs or external specs beyond the above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `RoasterSection.tsx`: List/detail/create/archive component — copy as the starting point for `RecipeSection.tsx`. Replace the archive logic with the same PATCH `active: false` pattern.
- `BeanSection.tsx`: Reference for card layout with inline computed display (stock bar → ratio display for presets).
- `src/client/utils/navigate.ts` (`navigateToView`, `getViewParams`): URL routing — use `?view=catalog&section=recipes&id=<sysId>` pattern.
- `src/client/utils/fields.ts` (`display`, `value`): Table API field helper for fetched recipe fields.
- Inline style constants from Phase 1/2 (`modalHeadingStyle`, `bodyStyle`) — reuse or centralise.

### Established Patterns
- **Table API fetch pattern**: `useEffect` with `cancelled` flag, `sysparm_query=active=true`, `sysparm_fields`, `sysparm_limit`, conditional `X-UserToken: g_ck` header. Must replicate exactly.
- **SysId validation**: `const SYS_ID_RE = /^[0-9a-f]{32}$/i` + early return before any PATCH/DELETE.
- **g_ck guard**: Read `(window as any).g_ck`; if falsy, set error and return before fetch.
- **listKey refresh**: Increment `listKey` state after create/archive to trigger list re-fetch.
- **Archive PATCH**: `JSON.stringify({ active: false })` — boolean, not string.
- **Modal footer event**: `e.detail?.payload?.action?.label` (not `e.detail.action`).
- **FormActionBar save**: Use `FormActionBar` inside `RecordProvider` for save; no programmatic `gForm.save()`.

### Integration Points
- `CatalogView.tsx` SUB_NAV: set `recipes` entry to `disabled: false`, add `import RecipeSection from './RecipeSection'`, add `case 'recipes'` to `renderSection()`.
- `src/fluent/index.now.ts`: export new recipe table and its ACLs.
- Phase 4 will add: preset picker on brew log form (BREW-02) + save-from-brew action (RECIPE-01). The recipe table schema built here is the contract Phase 4 depends on — don't change field names after Phase 3 deploys.

</code_context>

<specifics>
## Specific Ideas

- Preset list card layout (confirmed by user): preset name (larger, primary) + method chip + dose/water/ratio inline: `18g • 300g  1:16.7`. The ratio is computed (`water / dose`), not stored.
- "New Preset" is the action label for creating a preset manually in Phase 3.
- Archived presets disappear from the list entirely (no "archived" tab — unlike beans).
- The `notes` field on a preset is for annotating the preset itself (e.g., "works best with light roasts"), completely separate from brew `taste_notes` on the brew log.

</specifics>

<deferred>
## Deferred Ideas

- **Save-from-brew (RECIPE-01)** — wiring the "save as preset" action after submitting a brew log is deferred to Phase 4, where the brew log form is built.
- **Preset picker in brew log form (BREW-02)** — Phase 4 concern; the recipe table schema built here is the contract it depends on.
- **Prompt to update preset after brew drift (RECIPE-03)** — v2 requirement, noted in STATE.md deferred items.
- **Filter/browse presets by bean or method (RECIPE-04)** — v2 requirement.

</deferred>

---

*Phase: 3-recipe-presets*
*Context gathered: 2026-05-01*
