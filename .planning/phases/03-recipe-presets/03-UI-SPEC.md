# Phase 3: Recipe Presets — UI Design Contract

**Source:** Derived from `/design/` wireframes (variations.jsx, subpages2.jsx, mobile.jsx) + CONTEXT.md decisions
**Date:** 2026-05-01
**Status:** Ready for planning

---

## Design Language (from `/design/` wireframes)

The existing app uses the hand-drawn aesthetic established across Variation A/B and the Roasters/Beans pages. The following CSS tokens are already in use and must be maintained:

| Token | Usage |
|-------|-------|
| `var(--ink)` | Primary text, borders, active states |
| `var(--ink-3)` | Muted/secondary text |
| `var(--ink-4)` | Dashed dividers |
| `var(--paper)` | Card and modal backgrounds |
| `var(--paper-2)` | Slightly off-white fills, sidebar/rail bg |
| `var(--accent)` | Low-stock badges, action highlights |
| `var(--aibrew-accent)` | Method chip background (existing convention from BeanSection) |
| `2px solid var(--ink)` | All card and box borders |
| `.box.pad` | Standard card class — `border: 2px solid var(--ink)`, `border-radius` slightly irregular |

---

## 1. Recipe List View (`?view=catalog&section=recipes`)

### Layout

Card grid, 2 columns, matching BeanSection's grid pattern:
```
gridTemplateColumns: 'repeat(2, 1fr)'
gap: 14px
```

### Preset Card (per D-08)

Each card contains:
1. **Preset name** — primary, `fontWeight: 700`, `fontSize: 15px` (larger than metadata)
2. **Method chip** — inline tag below name, `background: var(--aibrew-accent)`, `color: #fff`, `borderRadius: 8px`, `padding: 2px 8px`, `fontSize: 12px`, `fontWeight: 600`
3. **Dose · Water · Ratio line** — `${dose}g • ${water}g  1:${ratio}` in `fontSize: 13px`, `color: var(--ink-3)` (muted). Ratio computed as `(water / dose).toFixed(1)`. If dose = 0, show `—`.

Equipment is **not** shown on the list card (per D-08 — only name, method chip, ratio). Equipment appears in the detail view only.

Card tap/click → navigate to detail view (`?view=catalog&section=recipes&id=<sysId>`).

### "New Preset" Button

Position: top-right of the section header, consistent with other catalog sections.
Label: `+ New Preset`
Tap → open create modal.

### Empty State

Matches the dashed placeholder pattern from the design:
```
Dashed border box, centered content:
  Large "+" character (hand-display font)
  "No presets yet"
  Subtext: "Create one to pre-fill the brew form"
```

### No Archived Tab (per D-05)

Archived presets vanish from the list. No "Archived" tab or filter. Flat single list of active records only.

---

## 2. Create Modal (per D-06)

### Structure

Matches `NewRoasterModal` from the design — full-screen overlay + centered modal card:
```
position: absolute, left: 50%, top: 50%, transform: translate(-50%, -50%)
width: ~580px (desktop), full-width on mobile
background: var(--paper)
boxShadow: 6px 8px 0 rgba(0,0,0,.15)
border: 2px solid var(--ink)
```

### Header

```
Row: left = "New Preset" (h2)   right = esc / close
```

### Field Order (per Claude's Discretion in CONTEXT.md)

1. Name * (required)
2. Method (ChoiceColumn dropdown — rendered by FormColumnLayout via RecordProvider)
3. Equipment (reference picker)
4. Dose weight (g)
5. Water weight (g)
6. Grind size
7. Notes (multiline, optional)

Implementation: `RecordProvider sysId="-1"` + `FormColumnLayout` + `FormActionBar` inside the modal. Fields are auto-rendered from the table schema — no custom inputs needed.

### Footer Actions

```
Row jc-sb:
  left: [Cancel]
  right: [Save Preset]   (accent style)
```

Uses `FormActionBar` — save handled by RecordProvider SDK adapter.
`onFormSubmitCompleted` → close modal + increment `listKey` to refresh list.

---

## 3. Detail / Edit View (`?view=catalog&section=recipes&id=<sysId>`)

### Header

```
Row jc-sb ai-c:
  left: [← Recipes]  /  [Preset Name]
  right: [Archive] button
```

### Body

`RecordProvider sysId={sysId}` with `FormColumnLayout` — full schema rendered for edit.
`FormActionBar` at bottom: [Cancel] [Save changes]

### Archive Action

"Archive" button (top-right) → opens confirmation modal.

**Archive confirmation modal:**
```
Title: "Archive this preset?"
Body: "Archived presets won't appear in the brew form or this list."
Footer: [Cancel]  [Archive]  (Archive is accent/destructive style)
```

On confirm: PATCH `{ active: false }` → navigate back to list (`?view=catalog&section=recipes`).
SysId validated with `/^[0-9a-f]{32}$/i` before PATCH URL construction.

No "archived" view — once archived, the preset is gone from all lists (per D-05).

---

## 4. CatalogView Tab Integration

The "Recipes" tab in the CatalogView SUB_NAV is currently `disabled: true`. Phase 3 enables it:

```
Before: { id: 'recipes', label: 'Recipes', disabled: true }
After:  { id: 'recipes', label: 'Recipes', disabled: false }
```

Tab position: 4th tab after Roasters / Equipment / Beans (matching navigation order from design Variation A/B sidebars where Recipes appears last).

---

## 5. Mobile Patterns (from `/design/mobile.jsx`)

RecipeSection follows the same mobile patterns as MobRoasters and MobBeans:

| Element | Mobile Treatment |
|---------|-----------------|
| Card grid | Single column (width ≤ 400px), matching MobRoasters/MobBeans row cards |
| Card | `.box.pad` with 12px padding, `fontWeight: 600` for name |
| Method chip | Same accent chip style, `fontSize: 10px` on mobile |
| Ratio line | Below chip, `fontSize: 11px`, muted |
| Header action | `+ New` in top-right of MobHeader (accent color, small) |
| Create modal | Full-width bottom-anchored sheet on mobile (matches MobQuickLog sheet pattern) — not a centered modal |

---

## 6. Interaction States

| State | Treatment |
|-------|-----------|
| Loading | Cards replaced with placeholder boxes (`.box` with height 80px, reduced opacity) |
| Error | Single `.box.pad` error message with retry text, consistent with BeanSection error pattern |
| Empty | Dashed placeholder card (see §1 Empty State) |
| Archive in-progress | Disable archive button, show loading indicator in modal footer |

---

## 7. Information Architecture

RecipeSection lives inside CatalogView under the "Recipes" tab. URL pattern:

| View | URL |
|------|-----|
| Recipe list | `?view=catalog&section=recipes` |
| Recipe detail/edit | `?view=catalog&section=recipes&id=<sysId>` |
| Create (modal overlay on list) | `?view=catalog&section=recipes` + modal state |

`navigateToView('catalog', { section: 'recipes' })` and `navigateToView('catalog', { section: 'recipes', id: sysId })` via existing `navigate.ts` utility.

---

## 8. Design Decisions Carried Forward from CONTEXT.md

| Decision | UI implication |
|----------|---------------|
| D-01: Bean-agnostic preset | No bean picker in the create/edit form |
| D-03: Ratio computed, not stored | Card shows computed ratio; no `ratio` field in the form |
| D-04: Soft-delete with `active` | Archive action sets `active: false`; no hard delete UI |
| D-05: No archived tab | Flat list of active records only |
| D-08: Card spec | Name (primary) + method chip + dose/water/ratio line |
| D-09: No tabs | No "in use" / "archived" tabs — single flat list |

---

## Acceptance Criteria (UI)

- [ ] Recipes tab in CatalogView is enabled and navigates to RecipeSection
- [ ] Recipe list shows cards with name (large), method chip (accent color), dose·water·ratio line
- [ ] Ratio computed as `water / dose` to 1 d.p.; shows `—` if dose is 0
- [ ] "New Preset" button opens create modal; save closes modal and card appears in list
- [ ] Tapping a card navigates to detail view showing all fields editable
- [ ] Archive button in detail view triggers confirmation modal; confirming removes preset from list
- [ ] No archived tab visible anywhere
- [ ] Empty state shows dashed placeholder with "+" and copy
- [ ] Mobile: single-column card layout; create uses bottom-sheet style

---

*Phase: 3-recipe-presets*
*UI-SPEC derived from: /design/ wireframes + CONTEXT.md decisions*
*Created: 2026-05-01*
