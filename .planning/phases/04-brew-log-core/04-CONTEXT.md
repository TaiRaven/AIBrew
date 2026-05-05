# Phase 4: Brew Log Core - Context

**Gathered:** 2026-05-05
**Status:** Ready for planning

<domain>
## Phase Boundary

A new `x_664529_aibrew_brew_log` table (hub table — references all other tables) is created and deployed. A `BrewView` component at `?view=brew` is built and wired into the app router. The TopNav "Brew" tab and HomeView "Brew Log" tile are enabled. The view delivers the complete brew logging flow: method selection, bean picker, preset picker / auto-fill, dose and water inputs with live ratio, grind size, in-page stopwatch timer, rating, taste notes, equipment picker, and submit. Post-submit: a confirmation banner with an optional "Save as preset" action (RECIPE-01, deferred from Phase 3). Inventory depletion for the logged bean is automatic — the GlideAggregate endpoint already sums `dose_weight_g` across brew_log records per bean; no extra action is needed.

This phase does NOT build brew history (Phase 5) or analytics (Phase 6).

</domain>

<decisions>
## Implementation Decisions

### Navigation & Entry Point
- **D-01:** Brew logging lives at `?view=brew` as a **dedicated full-screen view** — same routing pattern as Catalog. The `app.tsx` `DisabledView` for `brew` is replaced with `<BrewView />`.
- **D-02:** **TopNav "Brew" tab** — set `disabled: false`. **HomeView "Brew Log" tile** — set `active: true`, add `view: 'brew'`, add a description (e.g., "Log your session").

### Form Field Layout (PLAT-03 — ≤6 fields above the fold)
- **D-03:** **Primary layer (above the fold):**
  1. Method chip row (horizontal scrollable — see D-06)
  2. Bean picker (dropdown/select)
  3. Dose + Water inputs in a row, with live ratio inline (e.g., `18g • 300g  1:16.7`)
  4. Grind size integer input
  5. Timer (stopwatch display + Start/Stop controls — counts as one row)
  These are the 5 core brew variables the user sets every session.
- **D-04:** **Below the fold (scrolled):** Rating (10 tap targets, D-10), taste notes (textarea), equipment picker (auto-filled by preset, D-09), Save Brew button.
- **D-05:** **Preset strip** sits above the form, outside the 6-field budget. It is a compact banner row, not a standard form field (see D-07).

### Method Selection
- **D-06:** Method is shown as a **horizontal scrollable chip row** with 7 choices: `espresso`, `pour over`, `AeroPress`, `French press`, `moka pot`, `cold brew`, `other`. First 3–4 chips are visible without scrolling. One tap selects; re-tap deselects. Same ChoiceColumn values as `x_664529_aibrew_recipe.method` (Phase 3 schema contract).

### Preset Strip & Auto-fill
- **D-07:** A **collapsible preset strip** sits above the method chips — outside the 6-field count. Default state: `📎 No preset  ▾ Pick one  Use last`. Tapping "▾ Pick one" expands a scrollable list of active presets. Tapping "Use last" fills the form from the most recent brew. When a preset or "last brew" is active, the strip shows the source label with a `×` to clear.
- **D-08:** **Auto-fill (BREW-03) is user-invoked** — form opens blank. No silent auto-fill on mount. "Use last" button in the strip provides the shortcut. Empty first-brew state: "Use last" is hidden if no brew log records exist yet.
- **D-09:** **"Use last" copies** from the most recent brew: `method`, `bean`, `dose_weight_g`, `water_weight_g`, `grind_size`. Does NOT copy: `brew_time_seconds` (resets to 0:00), `rating` (blank), `taste_notes` (blank).
- **D-10 (BREW-02):** Selecting a **preset** fills: `method`, `equipment`, `dose_weight_g`, `water_weight_g`, `grind_size`. Bean field is NOT touched — presets are bean-agnostic (D-01 from Phase 3 context). The strip shows `📎 Using: <preset name>  ×`.

### Equipment Picker
- **D-11:** Equipment picker lives **below the fold**. It is auto-populated from the selected preset's `equipment` reference (D-10). Users who need to override it manually can scroll. Grind size integer is scoped to the selected equipment — show equipment name as sub-label (e.g., `Grind (Commandante)`).

### Timer (BREW-04)
- **D-12:** **Live stopwatch UI** — display shows `0:00` counting up from Start. Controls: ▶ Start → ■ Stop. Stopped time is the recorded value. Tapping the stopped display allows manual time entry (for users who forgot to start the timer).
- **D-13:** Timer state lives in **React component state only**. Navigating away from `?view=brew` resets the timer. Screen-off persistence remains deferred to v2 (BREW-12).
- **D-14:** `brew_time_seconds` stored as **IntegerColumn** on brew_log. Display format: `mm:ss` (e.g., `1:28` for 88 seconds).

### Rating (BREW-08)
- **D-15:** Rating input is **10 tap targets in a row** (`○ 1  ○ 2  ...  ○ 10`). Located below the fold with taste notes. One tap selects; tapping the selected number deselects (making rating optional).

### Save-as-preset (RECIPE-01)
- **D-16:** After a brew is submitted, show a **post-submit confirmation**: `Brew saved! ✓` with two actions: `[ Save as preset ]` and `[ Done ]`.
- **D-17:** Tapping "Save as preset" opens a Modal with: a required `name` text input + read-only display of the preset fields that will be saved (`method`, `equipment`, `dose_weight_g`, `water_weight_g`, `grind_size`). Bean and `taste_notes` are **not copied** — consistent with the bean-agnostic preset schema (Phase 3 D-01) and the separation between preset notes and brew taste notes.
- **D-18:** After "Done" or after saving a preset, **BrewView resets** to blank form state. "Use last" is now available pointing to the brew just logged.

### brew_log Table Schema
- **D-19:** Columns for `x_664529_aibrew_brew_log`:
  - `method` — ChoiceColumn (same values as recipe.method)
  - `bean` — ReferenceColumn → `x_664529_aibrew_bean`
  - `equipment` — ReferenceColumn → `x_664529_aibrew_equipment`
  - `dose_weight_g` — DecimalColumn
  - `water_weight_g` — DecimalColumn
  - `grind_size` — **IntegerColumn** (scoped to equipment — CLAUDE.md critical pitfall: must NOT be a string)
  - `brew_time_seconds` — IntegerColumn (nullable — timer is optional)
  - `rating` — IntegerColumn (1–10, nullable — rating is optional)
  - `taste_notes` — StringColumn (optional free text)
  - `recipe` — ReferenceColumn → `x_664529_aibrew_recipe` (optional — which preset was used as the starting point; populated via D-16 save-as-preset if user names it, or could be set when user picks a preset at brew time)
  - Standard system fields: `sys_created_on` used as brew timestamp (no separate `brewed_at` column needed for v1)

### ACLs
- **D-20:** 4 ACLs (read / write / create / delete), type `record`, roles: `[aibrew_user]` — identical pattern to all prior tables.

### Claude's Discretion
- Bean picker: standard select/dropdown, same `display()`/`value()` helper pattern as prior sections. Fetches active beans with `sysparm_query=active=true`.
- Ratio display: inline label between dose and water rows, computed as `(water / dose).toFixed(1)`, shows `1:16.7` style.
- Empty state when no presets exist: hide "▾ Pick one" from the strip, show only "Use last" (or both hidden if no brews exist either).
- "Save Brew" button: accent colour, full-width, consistent with other primary action buttons.
- Required fields for submit: method and bean are the minimum — dose, water, grind, timer, rating, notes are all optional. Show a toast/inline error if method or bean is missing.
- `recipe` reference on brew_log: when the user picks a preset from the strip, populate `recipe` with that preset's sysId. When using "last brew", do NOT set `recipe` (unless the last brew itself had a recipe reference).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and requirements
- `.planning/ROADMAP.md` §Phase 4 — Goal, requirements list (BREW-01 through BREW-09, PLAT-03), success criteria
- `.planning/REQUIREMENTS.md` — BREW-01 through BREW-09, PLAT-03 (full requirement specs)

### Schema contract from Phase 3
- `.planning/phases/03-recipe-presets/03-CONTEXT.md` §D-01–D-03 — Recipe schema (bean-agnostic, no ratio column, field list locked), Phase 4 depends on this
- `src/fluent/tables/recipe.now.ts` — Deployed recipe table definition; brew_log must match method ChoiceColumn values exactly

### Patterns to replicate (Phase 1–3)
- `src/client/components/RoasterSection.tsx` — List/detail/create/archive pattern; BrewView submit flow adapts this
- `src/client/components/BeanSection.tsx` — Card grid + stock bar + modal patterns
- `src/client/components/RecipeSection.tsx` — Most recent analog; preset picker in BrewView fetches active recipes the same way RecipeSection lists them
- `src/client/app.tsx` — Router: replace `DisabledView` for `brew` case with `<BrewView params={params} />`; add `BrewView` import
- `src/client/components/TopNav.tsx` — Set `brew` entry to `disabled: false`
- `src/client/components/HomeView.tsx` — Enable "Brew Log" tile: `active: true`, `view: 'brew'`, add description
- `src/client/utils/navigate.ts` — `navigateToView`, `getViewParams` SPA routing
- `src/client/utils/fields.ts` — `display`, `value` helpers for Table API field access

### Fluent artifact patterns (must replicate)
- `src/fluent/tables/roaster.now.ts` — Table definition pattern
- `src/fluent/acls/roaster-acls.now.ts` — ACL pattern (4 ACLs: read/write/create/delete)
- `src/fluent/roles/aibrew-user.now.ts` — Role import
- `src/fluent/index.now.ts` — Export new brew_log table + ACLs here

### Scripted REST (inventory depletion awareness)
- `.planning/phases/02-bean-catalog-inventory/02-RESEARCH.md` — GlideAggregate stock endpoint; brew_log records auto-deduct from bean stock via this endpoint. No extra action needed — just ensure `bean` + `dose_weight_g` columns exist on brew_log.

### Project constraints
- `CLAUDE.md` §Key Constraints — Fluent/now-sdk only, scoped, React 18.2.0 + @servicenow/react-components, Zurich
- `CLAUDE.md` §Critical Pitfalls — **grind_size MUST be IntegerColumn** (not a string); ACL testing with non-admin; Array.from polyfill in index.html; SDK deploy replaces

### No external specs beyond the above

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `RecipeSection.tsx` — Active-preset list fetch: `sysparm_query=active=true&sysparm_fields=sys_id,name,method,equipment,dose_weight_g,water_weight_g,grind_size`. BrewView's preset picker uses this same fetch to populate the "Pick one" list.
- `src/client/utils/fields.ts` (`display`, `value`) — Required for all Table API responses when using `sysparm_display_value=all`.
- `src/client/utils/navigate.ts` (`navigateToView`, `getViewParams`) — SPA routing; BrewView receives `params: URLSearchParams` from `app.tsx`.
- Inline style constants (`modalHeadingStyle`, `bodyStyle`, accent/ink CSS variables) — reuse existing.

### Established Patterns
- **Table API fetch with `sysparm_display_value=all`**: Phase 3 lesson — required when using `display()`/`value()` helpers; without it, fields are plain strings, not `{value, display_value}` objects.
- **SysId validation**: `const SYS_ID_RE = /^[0-9a-f]{32}$/i` before any PATCH/POST URL interpolation.
- **g_ck guard**: Check `(window as any).g_ck` before any fetch; set error and return if falsy.
- **Modal pattern**: `Modal size="lg"` + inner `overflowY: auto` div. Footer events fire as `e.detail?.payload?.action?.label`.
- **FormActionBar save** inside `RecordProvider`: for any RecordProvider-based form. BrewView's brew log create uses `RecordProvider sysId="-1"` + `FormActionBar` + `FormColumnLayout`.
- **native `<button>` for card layout**: Phase 3 lesson — `@servicenow/react-components Button` ignores `display: block/flex-direction: column` on style prop; use `<button>` with `display: block` for custom card layouts (e.g., preset picker cards).
- **listKey refresh**: Increment `listKey` state after submit to enable future history refresh in Phase 5.

### Integration Points
- `app.tsx` `renderContent()`: Add `case 'brew': return <BrewView params={params} />` — replaces `DisabledView`.
- `TopNav.tsx` TAB_ITEMS: change `brew` entry to `disabled: false`.
- `HomeView.tsx` TILES: change `brew` tile to `active: true`, `view: 'brew'`, add description.
- `src/fluent/index.now.ts`: export `brew_log` table + ACLs.
- Phase 5 (Brew History) will render the brew_log records created here in a reverse-chronological list.
- Phase 2 inventory computation: `dose_weight_g` on brew_log is automatically summed by the existing GlideAggregate stock endpoint — no changes needed to Phase 2 code.

</code_context>

<specifics>
## Specific Ideas

- Preset strip layout confirmed by user: `📎 No preset  ▾ Pick one  Use last` — a compact row above the method chips, not a form field.
- Method chips: horizontal scrollable, espresso first (most common for this user based on wireframes), all 7 choices reachable by scrolling.
- Live ratio display: inline between dose and water fields, e.g. `18g • 300g  1:16.7`.
- Timer: `0:28` display format (mm:ss), Start/Stop controls in the same row. Tap stopped display to type manually.
- Rating: 10 numbered circles in a row (`○ 1  ○ 2  ...  ○ 10`), tap to select, re-tap to deselect.
- Post-submit: `Brew saved! ✓` inline banner with `[ Save as preset ]` and `[ Done ]` buttons — replaces the form content until user taps Done.
- Save-as-preset modal: name input + read-only field summary (method, equipment, dose, water, grind) — bean and taste_notes explicitly excluded.
- After Done: form resets to blank with "Use last" immediately available.

</specifics>

<deferred>
## Deferred Ideas

- **Brew history list (BREW-10/11, RPT-01)** — Phase 5. brew_log records created here will feed Phase 5's reverse-chronological list.
- **Screen-off timer persistence (BREW-12)** — v2. Timer resets on navigation for v1.
- **Recipe reference on brew_log when using "last brew"** — deferred to v2 or Phase 5 gap-closure. For v1: `recipe` field is only populated when the user explicitly picks a preset from the strip, not when using "Use last".
- **Required field validation details** — Claude's discretion: method + bean minimum for submit; toast/inline error for missing fields.

</deferred>

---

*Phase: 4-brew-log-core*
*Context gathered: 2026-05-05*
