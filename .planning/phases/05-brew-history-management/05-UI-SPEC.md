# Phase 5: Brew History & Management — UI Design Contract

**Source:** Derived from `/design/mobile.jsx` (MobJournal, MobDashboard) + `/design/subpages2.jsx` + CONTEXT.md decisions
**Date:** 2026-05-07
**Status:** Ready for planning

---

## Design Language (established — maintain throughout)

| Token | Usage |
|-------|-------|
| `var(--ink)` | Primary text, borders, active states |
| `var(--ink-3)` | Muted/secondary text |
| `var(--ink-4)` | Dashed dividers |
| `var(--paper)` | Card and modal backgrounds |
| `var(--paper-2)` | Slightly off-white fills |
| `var(--accent)` | Destructive/alert actions (delete button) |
| `2px solid var(--ink)` | All card borders |
| `.box.pad` | Standard elevated card |

---

## 1. HistoryView — Page Structure

**Route:** `?view=history` (top-level view, not inside CatalogView)
**TopNav tab:** "History" — currently `disabled: true`, becomes `disabled: false`
**HomeView tile:** "History" — currently `active: false`, becomes `active: true`, add description "Review past brews"

### Layout

Full-width scrollable list, same padding/structure as BrewView and CatalogView:

```
[StatusBar / TopNav — shared]
─────────────────────────────────────────────
[Page heading: "Brew History" h2 + brew count chip]
[Brew card list — reverse-chronological, 50 per load]
[Load more button — if 50 returned]
─────────────────────────────────────────────
padding: 12–16px sides, paddingBottom: 90px (above fixed nav if present)
```

### Page Heading

```
Row jc-sb ai-c:
  left: h2 "Brew History"
  right: chip showing total loaded count e.g. "12 brews"
```

---

## 2. Brew Card (per D-02, D-03)

Each brew entry is a **full elevated card** — `.box.pad` with `borderRadius` irregular (design aesthetic), `border: 2px solid var(--ink)`.

Primary reference: `MobJournal` entries in `/design/mobile.jsx` (line 540) + `MobDashboard` "Recent" rows (line 162). The card elevates those patterns to a full card layout.

### Card Layout

```
┌─────────────────────────────────────────────┐
│  May 6 · 08:14          [🗑 trash icon btn]  │  ← header row
│  Espresso  •  Ethiopia Yirgacheffe           │  ← method chip + bean name
│  18g • 40g • 1:2.2          ★ 8/10          │  ← measurements + rating
└─────────────────────────────────────────────┘
```

**Line 1 — header row** (`row jc-sb ai-c`):
- Left: date + time string — `fontSize: 12px`, `color: var(--ink-3)` — e.g. `May 6 · 08:14`
  - Source: `sys_created_on` display value (from `sysparm_display_value=all`)
  - Fallback if parse fails: raw display_value string
- Right: trash icon button — small `<button>` (NOT `@servicenow/react-components Button`), `fontSize: 14px`, `color: var(--ink-3)`, no border, `background: transparent`, `padding: 4px`
  - Icon: `🗑` or equivalent trash symbol — tapping opens delete confirmation modal (D-11)

**Line 2 — method + bean** (`row ai-c g8`):
- Method chip: `background: var(--aibrew-accent)`, `color: #fff`, `borderRadius: 8px`, `padding: 2px 8px`, `fontSize: 11px`, `fontWeight: 600` — display value of method field
- Bean name: `fontSize: 13px`, `fontWeight: 600` — display value of bean reference field

**Line 3 — measurements + rating** (`row jc-sb ai-c`):
- Left: `${dose}g • ${water}g • 1:${ratio}` — `fontSize: 12px`, `color: var(--ink-3)`
  - Ratio: `(water / dose).toFixed(1)` — show `—` if dose is 0 or null
- Right: rating — `★ ${rating}/10`, `fontSize: 12px` — hide entirely if rating is null/0 (D-03 discretion)

**Card tap area:** The entire card (except the trash button) is tappable → opens edit modal (D-05).
Use a `<button>` wrapper with `display: block` (NOT `@servicenow/react-components Button` — Phase 3 lesson: ignores flex/column style).

### Card Spacing

```
marginBottom: 10px per card
padding: 12px inside card
```

---

## 3. Empty State

Shown when no brew_log records exist. Matches dashed placeholder pattern from design:

```
.box.pad.dashed — centered content:
  Large "☕" or "—" character
  "No brews yet"
  Subtext: "Start logging from the Brew tab"
  [→ Brew] button (small, accent color) — navigates to ?view=brew
```

---

## 4. Loading State

While fetching: show 3 placeholder `.box` cards with reduced opacity (0.4) and `height: 72px`. Same pattern as BeanSection loading placeholder.

---

## 5. Error State

If fetch fails: single `.box.pad` with error text, consistent with BeanSection error pattern:
```
"Could not load brew history. Check your connection."
```
No empty-looking list — error must be distinguishable from "no records".

---

## 6. "Load More" Button (per D-01)

Shown below the card list when exactly 50 records were returned (i.e., there may be more):

```
Full-width <button>:
  "Load more brews"
  fontSize: 13px, color: var(--ink-3)
  border: 1.4px dashed var(--ink-4), borderRadius: 6px
  padding: 10px
  marginTop: 8px
```

Hidden (not rendered) when fewer than 50 records are returned — no more pages to load.
While loading the next page: button shows "Loading…" and is disabled.

---

## 7. Edit Modal (per D-05, D-06, D-08)

Opens over the history list — `Modal size="lg"` + inner `overflowY: auto` div. Same modal pattern as RecipeSection and RoasterSection.

### Modal Header

```
Row jc-sb ai-c:
  left: "Edit brew" (h3, fontSize: 18px)
  right: close button (×, tiny muted)
```

### Edit Form — Field Order

All fields editable (D-08). Omit `recipe` reference (historical artifact, not meaningful to change):

1. **Method** — horizontal chip row (same as BrewView method chips) — pre-selected chip highlighted
2. **Bean** — dropdown `<select>` or custom picker, pre-populated with current bean
3. **Dose (g) / Water (g)** — side-by-side inputs in a row, with live ratio inline (same as BrewView)
4. **Grind size** — integer input, pre-populated
5. **Equipment** — dropdown `<select>`, pre-populated
6. **Brew time** — plain text input showing `mm:ss` format (e.g., `1:28` for 88s) — no stopwatch (D-06)
7. **Rating** — 10 tap-circles row (same inline JSX as BrewView), pre-selected
8. **Taste notes** — `<textarea>`, pre-populated

### Edit Form Pre-population

Use the scalar/object guard for all reference fields (Phase 4 lesson):
```ts
typeof field === 'object' ? value(field) : String(field ?? '')
```

### Modal Footer

```
Row jc-sb ai-c:
  left: [Delete brew] — destructive, color: var(--accent), fontSize: 13px — opens delete confirmation
  right: [Cancel]  [Save changes] (accent)
```

Footer events fire as `e.detail?.payload?.action?.label` (established Modal pattern).
"Save changes" → PATCH, close modal, increment listKey.
"Cancel" → close modal with no changes.

---

## 8. Delete Confirmation Modal (per D-11)

Shown from both the card trash icon and the edit modal "Delete brew" button.
A second modal stacked over the edit modal (or the history list if from card directly).

```
Modal size="sm" (smaller than edit modal):

  Header: "Delete brew?"
  Body: "This cannot be undone."
  Footer:
    [Cancel]  [Delete]
    Delete = accent/destructive style (color: var(--accent))
```

Footer events: `e.detail?.payload?.action?.label === 'Delete'` → execute DELETE, close both modals, decrement listKey to re-fetch.
`'Cancel'` → close confirmation modal only; return to previous state.

---

## 9. Mobile Patterns (primary target — ≤400px)

History view is designed mobile-first. From `MobJournal` and `MobDashboard`:

| Element | Mobile Treatment |
|---------|-----------------|
| Page heading | h2 + count chip, `fontSize: 20px` |
| Brew card | Full width `.box.pad`, `padding: 12px` |
| Method chip | `fontSize: 10px`, `padding: 1px 6px` |
| Trash icon | Top-right of card, `fontSize: 14px`, easily tappable (min 32×32px tap area) |
| Edit modal | Full-height `Modal size="lg"` with inner scroll — same as BrewView form on mobile |
| Delete confirmation | Centered small modal — NOT full-screen |
| "Load more" button | Full-width, `padding: 12px`, easy to tap |

No sidebar, no split-pane. Single-column cards stacked vertically.

---

## 10. Navigation Wiring (per D-14, D-15, D-16)

Three one-line changes in existing files:

| File | Change |
|------|--------|
| `src/client/app.tsx` | `case 'history': return <DisabledView view={view} />` → `case 'history': return <HistoryView />` |
| `src/client/components/TopNav.tsx` | `history` tab entry: `disabled: true` → `disabled: false` |
| `src/client/components/HomeView.tsx` | `history` tile: `active: false` → `active: true`, add `view: 'history'`, add description `"Review past brews"` |

---

## 11. Interaction States Summary

| State | Treatment |
|-------|-----------|
| Initial load | 3 placeholder `.box` cards at reduced opacity |
| Records loaded | Full card list |
| Empty (no brews) | Dashed box with "No brews yet" + nav to Brew |
| Fetch error | Error message box (not blank) |
| Load more — loading | Button shows "Loading…", disabled |
| Edit modal open | Modal over list; list scrolling locked |
| Saving edit | "Save changes" button disabled; spinner or text change |
| Edit saved | Modal closes; list re-fetches (listKey++) |
| Delete confirm open | Confirmation modal; edit modal/list behind |
| Delete executing | Both buttons disabled in confirm modal |
| Delete complete | Both modals close; list re-fetches; bean stock updated automatically |

---

## 12. Design Decisions Carried Forward from CONTEXT.md

| Decision | UI implication |
|----------|---------------|
| D-01: 50 brews/page, "Load more" | "Load more" button below list; hidden if < 50 returned |
| D-02: Full elevated card | `.box.pad` per brew, not a compact row |
| D-03: Card shows date/method/bean/dose·water·ratio/rating | No taste notes or equipment on card |
| D-04: `sysparm_display_value=all` | Use `display()` helper for method + bean name — never show raw sys_id |
| D-05: Edit opens Modal overlay | No navigation to separate edit page |
| D-06: Custom edit form | Not RecordProvider/FormActionBar — custom inputs matching BrewView |
| D-10: Two delete entry points | Trash icon on card + "Delete brew" in edit modal footer |
| D-11: Confirmation modal | Never immediate delete — always confirm first |
| D-12: Hard DELETE | No `active` column on brew_log — DELETE from server |
| D-13: Stock auto-updates | No explicit stock refresh needed — GlideAggregate handles it |

---

## Acceptance Criteria (UI)

- [ ] TopNav "History" tab is enabled and navigates to HistoryView
- [ ] HomeView "History" tile is active and links to `?view=history`
- [ ] History list shows brews in reverse-chronological order (newest first)
- [ ] Each card shows: date·time, method chip, bean name, dose·water·ratio line, rating (hidden if null/0), trash icon
- [ ] Tapping card body opens edit modal pre-populated with all brew fields
- [ ] Edit modal has all fields (method chips, bean, dose, water, grind, equipment, brew time as mm:ss, rating circles, taste notes)
- [ ] Save closes modal and list refreshes showing updated values
- [ ] Trash icon on card triggers confirmation modal (NOT immediate delete)
- [ ] "Delete brew" in edit modal footer also triggers confirmation modal
- [ ] Confirmed delete removes card from list; bean stock figure changes on bean detail page
- [ ] Cancel on confirmation modal: record still present, modal dismissed
- [ ] "Load more" button appears after first 50 brews; tapping appends next 50 (does not replace)
- [ ] "Load more" hidden when fewer than 50 brews returned
- [ ] Empty state shows dashed placeholder with nav link to Brew view
- [ ] Error state shows message distinguishable from empty state
- [ ] Mobile: cards full-width, trash icon has adequate tap target (≥32px), modals scroll correctly

---

*Phase: 5-brew-history-management*
*UI-SPEC derived from: /design/mobile.jsx (MobJournal, MobDashboard) + CONTEXT.md decisions*
*Created: 2026-05-07*
