# Phase 6: Analytics - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-07
**Phase:** 6-Analytics
**Areas discussed:** Chart rendering, View structure, API design, Empty / sparse state

---

## Chart Rendering

### Chart library / approach

| Option | Description | Selected |
|--------|-------------|----------|
| Custom SVG | Hand-rolled SVG shapes — full control, zero dependencies, always works in ServiceNow iframe | ✓ |
| CSS div bars | Percentage-width divs for ranking charts; SVG only for trend line | |
| Add Recharts | Popular React chart library, ~150KB bundle addition, iframe compatibility unverified | |

**User's choice:** Custom SVG
**Notes:** User accepted the recommendation — zero-dependency path. No concerns about hand-rolling SVG.

---

### Trend chart style

| Option | Description | Selected |
|--------|-------------|----------|
| Connected line + dots | SVG polyline connecting data points with filled circles at each brew | ✓ |
| Dots only | Scatter-plot style — avoids misleading lines when data is sparse | |

**User's choice:** Connected line + dots
**Notes:** User accepted the recommendation.

---

### Bar chart orientation

| Option | Description | Selected |
|--------|-------------|----------|
| Horizontal bars | Names as row labels on left, bars extend right — better for mobile | ✓ |
| Vertical bars | Classic column chart — labels along bottom, can get crowded on phone width | |

**User's choice:** Horizontal bars
**Notes:** User accepted the recommendation without hesitation.

---

## View Structure

### Chart layout

| Option | Description | Selected |
|--------|-------------|----------|
| Single scrollable page | Three sections stacked: Trend → Avg by Bean → Avg by Method | ✓ |
| Tabbed within analytics | Sub-tabs per chart, one chart visible at a time | |

**User's choice:** Single scrollable page
**Notes:** Consistent with how HistoryView works.

---

### Trend chart time span

| Option | Description | Selected |
|--------|-------------|----------|
| All time | Every brew ever logged | |
| Last 30 brews | Cap at 30 most recent rated brews | ✓ |
| You decide | Claude picks simplest to implement | |

**User's choice:** Last 30 brews
**Notes:** User overrode the recommendation (all-time) in favour of capped density.

---

### Section heading style

| Option | Description | Selected |
|--------|-------------|----------|
| Match existing style | aibrew-font-disp, 20px, weight 600 — same as HistoryView/BrewView | ✓ |
| More prominent | Larger (24px) for report-like feel | |

**User's choice:** Match existing style

---

## API Design

### Endpoint structure

| Option | Description | Selected |
|--------|-------------|----------|
| One combined endpoint | GET /analytics/summary returns all three datasets in one call | ✓ |
| Three separate endpoints | One per chart — mirrors bean-stock-api pattern, 3 network calls | |

**User's choice:** One combined endpoint
**Notes:** Simplicity preferred over modularity here.

---

### Unrated brews in averages

| Option | Description | Selected |
|--------|-------------|----------|
| Exclude unrated brews | Only rating >= 1 included — prevents downward skew | ✓ |
| Include all brews | All brews counted, unrated treated as 0 | |

**User's choice:** Exclude unrated brews
**Notes:** User agreed unrated brews would skew averages misleadingly.

---

### Server-side aggregation method

| Option | Description | Selected |
|--------|-------------|----------|
| GlideRecord scan + JS avg | Safe path — proven pattern from Phase 5 fix | ✓ |
| GlideAggregate AVG | More server-efficient; rating is IntegerColumn so AVG should work | |

**User's choice:** GlideRecord scan + JS avg
**Notes:** User preferred the safe path despite GlideAggregate working on IntegerColumn. Phase 5 aggregate bug established caution.

---

## Empty / Sparse State

### Zero-data state

| Option | Description | Selected |
|--------|-------------|----------|
| Per-section informative placeholder | Each chart section renders heading + message when no data | ✓ |
| Single page-level placeholder | One message for the whole analytics view | |
| Show partial charts | Render whatever data exists, even with 1 brew | |

**User's choice:** Per-section informative placeholder
**Notes:** Consistent with BeanSection empty-pantry pattern.

---

### Trend chart minimum data threshold

| Option | Description | Selected |
|--------|-------------|----------|
| 2+ brews | Need 2 points to draw a meaningful line — 1 brew shows placeholder | ✓ |
| 1 brew | Render as soon as any data exists | |
| You decide | Claude picks whatever feels right | |

**User's choice:** 2+ brews
**Notes:** User agreed a single isolated dot on a line chart isn't useful.

---

## Claude's Discretion

- Axis labels (date tick marks, count) — Claude decides based on phone-width SVG constraints
- Bar fill colour — use `var(--aibrew-accent)` (consistent with app accent usage)
- Inter-section padding/margin — match HistoryView spacing
- Brew count display in ranking charts (e.g., "8 brews" subtitle) — show as context for the average

## Deferred Ideas

- RPT-05: Filter analytics by date range, bean, or method — v2 (already in ROADMAP deferred)
- RPT-06: Grind size + dose correlation — v2
- Interactive chart interactions (hover/tap for exact value, tap bar to filter history) — not in v1 scope
