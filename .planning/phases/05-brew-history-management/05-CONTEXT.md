# Phase 5: Brew History & Management - Context

**Gathered:** 2026-05-07
**Status:** Ready for planning

<domain>
## Phase Boundary

The `?view=history` route (already scaffolded in `app.tsx` as a `DisabledView`) is replaced with a real `HistoryView` component. The TopNav "History" tab (`disabled: true`) is enabled. The view delivers a reverse-chronological list of all brew_log records with full card layout, plus edit and delete actions on each entry (BREW-10, BREW-11, RPT-01).

No new Fluent table artifacts are needed — this phase is entirely a React/client-side addition over the existing `x_664529_aibrew_brew_log` table from Phase 4.

This phase does NOT build analytics (Phase 6).

</domain>

<decisions>
## Implementation Decisions

### History List

- **D-01:** History list loads the **50 most recent brews** (ordered by `sys_created_on DESC`, `sysparm_limit=50`). A **"Load more" button** fetches the next 50 (`sysparm_offset` pagination). No infinite scroll — explicit user action.
- **D-02:** Each brew entry is rendered as a **full elevated card** (rounded box with shadow) — consistent with recipe/bean/equipment card style throughout the app.
- **D-03:** Each card displays: **date + time** (from `sys_created_on`), **method** (display value), **bean name** (display value of reference), **dose / water / ratio** (e.g. `18g • 40g • 1:2.2`), and **rating** (e.g. `★ 8/10`). Taste notes and equipment are NOT shown on the card — available in edit form.
- **D-04:** Fetch fields for the list: `sys_id`, `sys_created_on`, `method`, `bean`, `dose_weight_g`, `water_weight_g`, `rating`. All fetched with `sysparm_display_value=all` (Phase 3 UAT requirement).

### Edit Flow

- **D-05:** Tapping a brew card opens an **edit modal** (`Modal size="lg"` + inner scroll div) over the history list — no full-screen navigation. Consistent with how catalog entities are edited (RoasterSection, RecipeSection modal patterns).
- **D-06:** The edit modal uses a **custom form** (not RecordProvider + FormActionBar) — same field controls as BrewView: method chip row, bean picker (dropdown), dose/water inputs with live ratio, grind size, equipment picker, brew time as a plain mm:ss text input (no stopwatch — just editable), rating circles (1–10), taste notes textarea.
- **D-07:** Edit saves via **PATCH to Table API** (`PATCH /api/now/table/x_664529_aibrew_brew_log/<sysId>`). Same pattern as the archive PATCH (`JSON.stringify({ active: false })`), applied to the edited field set.
- **D-08:** Edit form includes **all user-editable brew_log fields**: `method`, `bean`, `equipment`, `dose_weight_g`, `water_weight_g`, `grind_size`, `brew_time_seconds` (editable as mm:ss text), `rating`, `taste_notes`. The `recipe` reference field (which preset was used as the starting point) is **omitted** from edit — it is a historical artifact and not meaningful to change.
- **D-09:** After a successful PATCH, the edit modal closes and the history list **re-fetches** (increment a `listKey` state, same pattern as post-create refreshes in RecipeSection).

### Delete

- **D-10:** Delete is accessible from **two entry points**:
  1. A **trash icon button** directly on each history card (visible at all times on the card)
  2. A **"Delete brew" button** (destructive/red) at the bottom of the edit modal
- **D-11:** Both delete paths show a **confirmation modal** before executing: "Delete this brew? This cannot be undone." with Cancel / Delete actions. Prevents accidental deletes on mobile.
- **D-12:** Delete executes via **DELETE to Table API** (`DELETE /api/now/table/x_664529_aibrew_brew_log/<sysId>`). Hard delete — brew_log records are not soft-deleted (no `active` column on brew_log).
- **D-13:** **Inventory stock updates automatically** after delete — the existing GlideAggregate stock endpoint sums `dose_weight_g` across all brew_log records for a given bean. Deleting a brew_log record removes its contribution from the sum with no additional code required.

### Navigation & Wiring

- **D-14:** `app.tsx` `renderContent()`: replace `case 'history': return <DisabledView view={view} />` with `case 'history': return <HistoryView />`.
- **D-15:** `TopNav.tsx` TAB_ITEMS: change `history` entry from `disabled: true` to `disabled: false`.
- **D-16:** `HomeView.tsx` "History" tile: set `active: true`, `view: 'history'`, add description (e.g., "Review past brews").

### Claude's Discretion

- Empty state when no brews exist yet: display a friendly message with a link/button to navigate to the Brew view.
- Date formatting: show date + time in a human-readable format (e.g., "May 6 · 08:14") — use `sys_created_on` display value.
- Ratio display: `(water / dose).toFixed(1)` prefixed as `1:X.X` — same formula as BrewView and RecipeSection.
- Unrated brews (rating = null/0): hide the rating segment rather than showing `★ 0/10`.
- Trash icon on card: small icon button, placed at top-right or bottom-right of card to avoid accidental taps during scroll.
- Loading state while fetching: show a spinner or skeleton.
- Error handling: if fetch fails, show an error message (not a blank list).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and requirements
- `.planning/ROADMAP.md` §Phase 5 — Goal, requirements list (BREW-10, BREW-11, RPT-01), success criteria
- `.planning/REQUIREMENTS.md` — BREW-10, BREW-11, RPT-01 (full requirement specs)

### Schema contract from Phase 4
- `.planning/phases/04-brew-log-core/04-CONTEXT.md` §D-19 — `brew_log` table schema (all column names and types); edit form MUST use the same field names
- `src/fluent/tables/brew-log.now.ts` — Deployed brew_log table definition; confirms column names and ChoiceColumn values for `method`

### Patterns to replicate
- `src/client/components/BrewView.tsx` — **Primary reference** for the edit form: method chip row, bean picker, dose/water/grind inputs, equipment picker, rating circles, taste notes. The edit modal reuses these form field patterns (minus the preset strip and live stopwatch).
- `src/client/components/RecipeSection.tsx` — Modal open/close pattern, PATCH + listKey refresh pattern, modal footer event handling (`e.detail?.payload?.action?.label`)
- `src/client/components/RoasterSection.tsx` — Archive/delete confirmation modal pattern; adapt the confirmation dialog for hard-delete of brew_log
- `src/client/app.tsx` — Router: replace `DisabledView` for `history` case with `<HistoryView />`; add `HistoryView` import
- `src/client/components/TopNav.tsx` — Set `history` entry to `disabled: false`
- `src/client/components/HomeView.tsx` — Enable "History" tile: `active: true`, `view: 'history'`, add description
- `src/client/utils/navigate.ts` — `navigateToView`, `getViewParams` for SPA routing
- `src/client/utils/fields.ts` — `display`, `value` helpers; REQUIRED for all Table API responses with `sysparm_display_value=all`

### Established fetch + UI patterns (MUST replicate)
- **`sysparm_display_value=all`** on every Table API fetch — Phase 3 UAT lesson: without this, `display()`/`value()` helpers return empty strings
- **SysId validation**: `const SYS_ID_RE = /^[0-9a-f]{32}$/i` before any PATCH or DELETE URL interpolation
- **g_ck guard**: `const g_ck = (window as any).g_ck` — check before any fetch, set error and return if falsy
- **Modal pattern**: `Modal size="lg"` + inner `overflowY: auto` div; footer events fire as `e.detail?.payload?.action?.label`
- **native `<button>` for card layout**: `@servicenow/react-components Button` ignores `display: block / flex-direction: column` on style prop — use `<button>` with `display: block` for custom card layouts

### Project constraints
- `CLAUDE.md` §Key Constraints — Fluent/now-sdk only, scoped, React 18.2.0 + @servicenow/react-components, Zurich
- `CLAUDE.md` §Critical Pitfalls — Array.from polyfill in index.html; ACL testing with non-admin; SDK deploy replaces

### No external specs beyond the above

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `BrewView.tsx` — Method chip row, bean picker (`display()`/`value()` from Table API), dose/water inputs, grind size input, equipment picker (inline `<select>`), rating circles (tap to select/deselect), taste notes `<textarea>`. The edit form in HistoryView is essentially BrewView's form fields pre-populated from an existing record, with the preset strip and live stopwatch removed.
- `BrewView.tsx` `applyLastBrew()` / `applyPreset()` — Reference for handling the typeof guard on scalar vs object fields: `(typeof f === 'object' ? value(f) : String(f ?? ''))`. Edit form pre-population must use the same guard.
- `RecipeSection.tsx` — Modal open/edit/listKey-refresh cycle; PATCH pattern with `JSON.stringify({...})`.
- `src/client/utils/fields.ts` (`display`, `value`) — Required for all fetched brew_log fields.
- `src/client/utils/navigate.ts` (`navigateToView`, `getViewParams`) — Not used inside HistoryView itself, but wired in `app.tsx` and `HomeView.tsx`.
- Inline style constants (`sectionHeadingStyle`, `labelStyle`, `inputStyle`) defined in BrewView.tsx — reuse or extract to shared constants.

### Established Patterns

- **Paginated fetch with offset**: No existing example in the codebase — this is the first paginated list. Use `sysparm_offset` parameter; "Load more" button appends new records to the existing array rather than replacing it.
- **Hard DELETE**: No existing example (catalog uses PATCH `active: false`). Use `fetch(url, { method: 'DELETE', headers: {...} })`.
- **listKey refresh**: Existing pattern in RecipeSection and BeanSection — increment integer state after create/edit/delete to trigger list re-fetch.
- **Cancelled-fetch guard**: `let cancelled = false` + `return () => { cancelled = true }` in `useEffect` — must be present on all fetches.
- **sys_id scalar/object guard**: `typeof rec.sys_id === 'object' ? value(rec.sys_id) : rec.sys_id` — established in RecipeSection and BrewView.

### Integration Points

- `app.tsx` `renderContent()`: `case 'history'` currently returns `<DisabledView view={view} />` — replace with `<HistoryView />`.
- `TopNav.tsx` TAB_ITEMS: `history` entry is `disabled: true` — change to `false`.
- `HomeView.tsx` TILES: `history` tile — set `active: true`, `view: 'history'`, add description.
- `src/fluent/index.now.ts`: No new artifacts needed for Phase 5 — brew_log table and ACLs already deployed in Phase 4.
- Phase 2 stock endpoint: Deleting a brew_log record automatically reduces the GlideAggregate sum — no changes needed to Phase 2 Scripted REST code.
- Phase 6 (Analytics) will read the same brew_log records that Phase 5 edits/deletes — no integration work needed yet.

</code_context>

<specifics>
## Specific Ideas

- Card layout (user confirmed): date+time top-left, method + bean name on second line, dose/water/ratio + rating on third line. Full elevated card with rounded box + shadow, consistent with existing card components.
- Card visual: `May 6 · 08:14` / `Espresso • Ethiopia Yirgacheffe` / `18g • 40g • 1:2.2  ★ 8/10`
- Delete trash icon lives on the card (top-right or bottom-right), plus a red "Delete brew" button at the bottom of the edit modal — both trigger the same confirmation flow.
- Confirmation modal copy: "Delete this brew? This cannot be undone." with Cancel / Delete actions.
- "Load more" button: appears below the card list after the first 50 are loaded; clicking appends next 50. If fewer than 50 are returned, hide "Load more".

</specifics>

<deferred>
## Deferred Ideas

- **Filter history by date/bean/method (RPT-05)** — v2. History list is unfiltered in Phase 5.
- **Brew history mini on bean detail page** — noted in design mockups (subpages2.jsx). Bean detail (Phase 2) shows inventory history only; a brew sub-list per bean would be Phase 5 gap-closure or v2.
- **Analytics (RPT-02/03/04)** — Phase 6. History list in Phase 5 is the foundation; aggregation views come next.

</deferred>

---

*Phase: 5-brew-history-management*
*Context gathered: 2026-05-07*
