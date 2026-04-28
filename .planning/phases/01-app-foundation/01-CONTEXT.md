# Phase 1: App Foundation - Context

**Gathered:** 2026-04-28
**Status:** Ready for planning

<domain>
## Phase Boundary

The scoped app exists on the instance, is reachable from the ServiceNow navigator, ACLs protect all app data, and the roaster and equipment catalogs are fully functional (create, view, edit, archive). This is the foundation every later phase builds on — no brew logging, beans, or inventory in this phase.

</domain>

<decisions>
## Implementation Decisions

### Navigator entry
- **D-01:** Single "AIBrew" module in the ServiceNow application navigator — one entry point that opens the home/landing page. No separate navigator modules per catalog section.

### Phase 1 home screen
- **D-02:** Home screen shows placeholder tiles/cards for all app sections. In Phase 1, Roasters and Equipment tiles are active/clickable; all others (Beans, Brew Log, Recipes, History, Analytics) are present but greyed out or absent. The home screen grows naturally as subsequent phases complete — no rework required.

### In-app navigation shell
- **D-03:** Top navigation tabs form the persistent app shell, built in Phase 1 and carried through all 6 phases.
- **D-04:** Five tabs: **Home** / **Brew** / **Catalog** / **History** / **Analytics**
  - *Home* — dashboard / quick-start tile
  - *Brew* — log a brew (Phase 4)
  - *Catalog* — beans, roasters, equipment, recipes grouped under one tab
  - *History* — past brews (Phase 5)
  - *Analytics* — rating trends, averages (Phase 6)
  - In Phase 1, only Home and the Catalog sub-sections for Roasters + Equipment are active.

### SPA routing
- **D-05:** URLSearchParams SPA routing per CLAUDE.md: `?view=list`, `?view=detail&id=<sysId>`, `?view=create` on every UI page. Each entity (Roaster, Equipment) is a single UI page with internal view switching.

### Polyfill and iframe detection
- **D-06:** Every `index.html` includes the inline Array.from polyfill (no CDATA wrappers — confirmed Jelly bug). Every page includes Polaris iframe detection. Non-negotiable per CLAUDE.md.

### Claude's Discretion
- ACL role design: single role (`x_<scope>_aibrew_user`) granting read/write to all app tables is appropriate for a single-user app; no separate read/write roles needed unless a specific concern arises during planning.
- Scope prefix handling: `sdk init` runs as the first plan task; the real scope prefix is used throughout all remaining tasks in Phase 1. Never hardcode a placeholder that must be substituted manually.
- Roaster and Equipment list layout: card-based or row-based list, field selection — open to planner's judgment consistent with mobile-first constraints.
- Exact tab icons, label casing, and empty-state copy for greyed-out Phase 1 tabs.

</decisions>

<specifics>
## Specific Ideas

- The home screen should feel like a launchpad: you can see what the full app will do, but today only Roasters and Equipment work. Greyed-out tiles (not hidden) signal that more is coming.
- No preference on home screen tile layout (grid vs list) — planner decides.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and requirements
- `.planning/ROADMAP.md` §Phase 1 — Goal, requirements list, success criteria
- `.planning/REQUIREMENTS.md` — PLAT-01, PLAT-02, CAT-01, CAT-02, CAT-03, CAT-07, CAT-08, CAT-09 (the full requirement specs for this phase)

### Architecture and patterns
- `.planning/research/ARCHITECTURE.md` — Navigation pattern (SPA routing), component boundaries, ACL scoping, ScriptInclude/BusinessRule layer separation
- `CLAUDE.md` (project root) — Array.from polyfill rule, Polaris iframe detection, SPA routing pattern, scoped-only constraint, table build order

### Platform constraints
- `CLAUDE.md` §Key Constraints — Fluent/now-sdk only, scoped app, React 18.2.0 + @servicenow/react-components, Zurich release
- `CLAUDE.md` §Critical Pitfalls — ACL testing with non-admin user, SDK deploy replaces rule

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet — this is Phase 1, the codebase is empty. All patterns established here become the baseline.

### Established Patterns
- SPA routing via URLSearchParams is the mandated pattern (CLAUDE.md). Roaster and Equipment pages must implement this first, so all subsequent phases inherit the pattern.
- Top nav tab shell built in Phase 1 is the integration point for every future phase — keep it extensible (adding a tab should not require reworking existing tabs).

### Integration Points
- The navigator module created in Phase 1 is the entry point for all users. Every future phase's UI is a tab or sub-page within the shell built here.
- ACLs created in Phase 1 protect all six tables eventually. Plan the role structure to cover future tables, not just the two in Phase 1.

</code_context>

<deferred>
## Deferred Ideas

- None — discussion stayed within Phase 1 scope.

</deferred>

---

*Phase: 01-app-foundation*
*Context gathered: 2026-04-28*
