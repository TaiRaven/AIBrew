# Phase 6: Analytics - Context

**Gathered:** 2026-05-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 6 delivers three read-only analytics views built on aggregated brew log data: a rating trend chart (score by brew date), average rating ranked by bean type, and average rating ranked by brew method. The analytics view is the final piece of the app — it closes the loop by surfacing patterns from the data accumulated in Phases 1–5.

This phase does NOT include: filtering by date range, bean, or method (RPT-05 — deferred to v2); raw brew history (RPT-01 — delivered in Phase 5); or any write operations.

</domain>

<decisions>
## Implementation Decisions

### Chart Rendering
- **D-01:** All charts are custom SVG — no third-party charting library. Zero new dependencies; full control; guaranteed to render inside the ServiceNow Polaris iframe.
- **D-02:** Rating trend chart uses a connected SVG polyline with filled circle dots at each brew point — shows trend direction clearly.
- **D-03:** Avg-by-bean and avg-by-method charts use horizontal bars (not vertical columns) — bean/method names as row labels on the left, bars extending right. Works better on mobile-width screens with longer names.

### View Structure
- **D-04:** Single scrollable page — all three chart sections stacked vertically: Rating Trend → Avg by Bean → Avg by Method. No sub-tabs. Consistent with how HistoryView works.
- **D-05:** Rating trend shows the **last 30 rated brews** (ordered by brew date ascending). Not all-time; capped for consistent chart density.
- **D-06:** Section headings use the existing `sectionHeadingStyle` pattern from HistoryView.tsx: `aibrew-font-disp`, 20px, weight 600, `var(--aibrew-ink)`. No new heading treatment.

### API Design
- **D-07:** One combined Scripted REST endpoint: `GET /api/x_664529_aibrew/analytics/summary` returning a single JSON body with three arrays: `trend` (date + rating per brew), `by_bean` (name + avg + count), `by_method` (method + avg + count). One network call on page load.
- **D-08:** Unrated brews (rating = 0 or null) are **excluded** from all aggregations. Only brews where `rating >= 1` are included. Unrated brews would skew averages and don't represent the user's actual assessment.
- **D-09:** The analytics handler uses **GlideRecord scan + JS-side averaging** — not GlideAggregate AVG. Although `rating` is an IntegerColumn (which GlideAggregate SUM handles correctly for `purchases.grams`), the Phase 5 DecimalColumn aggregate bug established a general distrust of server-side aggregation in this scope. GlideRecord scan is the proven safe path at home-brew data volumes.
- **D-10:** Avg-by-bean and avg-by-method results are sorted **highest avg first** (descending) on the server side before returning.

### Empty / Sparse State
- **D-11:** Each chart section independently renders either the chart or a per-section placeholder — not a single page-level lockout. If the user has no rated brews for beans but has rated method brews, each section shows its own state.
- **D-12:** Placeholder text per section: e.g. `"No rated brews yet — rate a brew to see your trend."` Consistent with the empty-state pattern in BeanSection (pantry tab empty state).
- **D-13:** Rating trend chart requires **at least 2 rated brews** to render the connected line. With 0 or 1 data point, show the placeholder instead of a single isolated dot or empty axes.
- **D-14:** Avg-by-bean and avg-by-method charts render as soon as there is **at least 1 rated brew** in the respective category (a single bar is meaningful).

### Claude's Discretion
- Chart axis labels (whether to show date labels on x-axis, number of tick marks): Claude to decide based on SVG space available at phone width.
- Bar chart color: use `var(--aibrew-accent)` for bars, consistent with existing accent usage in the app.
- Exact padding/margin between sections: match HistoryView section spacing.
- The `count` field in `by_bean`/`by_method` response: show as a subtitle below the bar label (e.g., "8 brews") to give context to the average.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Requirements
- `.planning/ROADMAP.md` §"Phase 6: Analytics" — Goal, success criteria (RPT-02, RPT-03, RPT-04), UI hint
- `.planning/REQUIREMENTS.md` §"Analytics & Reporting" — RPT-02, RPT-03, RPT-04 requirement text

### Server-Side Pattern (Scripted REST)
- `src/fluent/scripted-rest/bean-stock-api.now.ts` — canonical Fluent `RestApi()` definition; new analytics API must follow this pattern
- `src/server/bean-stock-handler.ts` — canonical TypeScript handler; includes GlideRecord scan workaround with comment explaining DecimalColumn aggregate bug (D-09 context)
- `src/fluent/index.now.ts` — must export new analytics API and handler

### Client-Side Patterns
- `src/client/components/HistoryView.tsx` — sectionHeadingStyle, labelStyle, data-fetching pattern (`useState` + `useEffect` + `fetch`), empty-state pattern
- `src/client/app.tsx` — analytics view already routed at `case 'analytics'` (currently `<DisabledView>`); this plan replaces that with `<AnalyticsView />`
- `src/client/components/TopNav.tsx` — analytics tab already defined as `disabled: true`; must be changed to `disabled: false`
- `src/client/components/HomeView.tsx` — analytics tile set as `active: false`; must be updated to `active: true` with `view: 'analytics'`

### Critical Pitfall
- `.planning/STATE.md` §"Decisions (Phase 5 — Plan 04, UAT bug fixes)" — GlideAggregate SUM broken on DecimalColumn; GlideRecord scan is the required workaround. Rating is IntegerColumn but GlideRecord scan is mandated by D-09.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `sectionHeadingStyle` in HistoryView.tsx — reuse directly for chart section headings (D-06)
- `display()` / `value()` field helpers in `src/client/utils/fields.ts` — may be needed if bean name comes from a reference field in the aggregation response
- `navigateToView` in `src/client/utils/navigate.ts` — not needed in AnalyticsView (read-only, no navigation)
- `SYS_ID_RE` validation pattern — not needed (no write operations in this phase)

### Established Patterns
- Scripted REST: Fluent `RestApi()` definition file + separate TypeScript handler file (not inline) — analytics handler follows this split
- Client fetch: plain `fetch()` with `X-UserToken: g_ck` header + `useState`/`useEffect` — no React Query, no special hooks
- Empty state: conditional render — if data array is empty, render a styled `<div>` with message text; otherwise render the chart
- `@servicenow/react-components` has no chart components — custom SVG is the only viable path without adding a new dependency

### Integration Points
- `app.tsx:75` — `case 'analytics': return <DisabledView view={view} />` → replace with `<AnalyticsView />`
- `TopNav.tsx:10` — `{ id: 'analytics', label: 'Analytics', disabled: true }` → change `disabled` to `false`
- `HomeView.tsx:21` — analytics tile with `active: false` → update to `active: true, view: 'analytics', description: 'Your brew patterns'`
- `src/fluent/index.now.ts` — must export new analytics REST API artifact

</code_context>

<specifics>
## Specific Ideas

- User confirmed the ASCII mockup: Rating Trend with connected polyline, horizontal bars for bean/method ranking with name + bar + avg score on the right
- User confirmed "last 30 brews" specifically (not all-time) for the trend chart
- "No rated brews yet — rate a brew to see your trend." is the direction for empty-state copy (exact wording up to Claude)

</specifics>

<deferred>
## Deferred Ideas

- RPT-05: Filter analytics by date range, bean, or method — explicitly v2 (in ROADMAP.md deferred items)
- RPT-06: Grind size + dose correlation with ratings — v2 (in REQUIREMENTS.md v2 section)
- Interactive chart interactions (hover to see exact value, tap a bar to filter history) — out of scope for v1

</deferred>

---

*Phase: 6-Analytics*
*Context gathered: 2026-05-07*
