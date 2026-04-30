---
phase: 2
slug: bean-catalog-inventory
status: ready
source: C:\Users\William.Wood\BrewAI\design (BeansPage, BeanProfilePage, InventoryPage in subpages2.jsx / subpages.jsx)
created: 2026-04-30
---

# Phase 2 — UI Design Contract

> Derived from the wireframe design files in `C:\Users\William.Wood\BrewAI\design`.
> Relevant artboards: **Beans · profiles + add**, **Bean profile · detail**, **Inventory · full bean list**.
> Design system: sketchy low-fi (warm off-white `#fbf8f2`, ink `#1d1a17`, accent `#c2410c`).
> Implementation target: React 18.2.0 + `@servicenow/react-components`, Fluent/now-sdk, Zurich release.

---

## 1. Design System Tokens

These are the CSS custom properties already established in Phase 1. Phase 2 must reuse them exactly:

| Token | Value | Usage |
|-------|-------|-------|
| `--aibrew-bg` | warm off-white | page/card backgrounds |
| `--aibrew-ink` | `#1d1a17` | primary text, borders |
| `--aibrew-ink-3` | muted variant | secondary text, labels |
| `--aibrew-ink-5` | faint variant | progress bar track |
| `--aibrew-accent` | `#c2410c` (warm orange-red) | primary actions, accent chips, low-stock highlight |
| `--aibrew-destructive` | destructive red | stock bar fill when low-stock (`remaining_g < 50`) |
| `--aibrew-font-body` | system stack | body text |
| `--aibrew-paper-2` | paper variant | table header fills, soft section backgrounds |

No new CSS variables are introduced in Phase 2.

---

## 2. Screens for Phase 2

Phase 2 adds two new views accessible from `CatalogView` via the `beans` sub-tab:

| View ID | Route query | Design artboard |
|---------|------------|-----------------|
| Bean list (tab) | `?view=catalog&section=beans` | "Beans · profiles + add" |
| Bean detail | `?view=catalog&section=beans&id=<sysId>` | "Bean profile · detail" |

The existing `CatalogView` Inventory entry point (`?view=catalog&section=inventory`) is **out of scope for Phase 2** — the design's full inventory table is a separate view that may be planned in a later phase. Phase 2 inventory management lives on the bean detail page only.

---

## 3. Bean List View

**Design source:** `BeansPage` in `subpages2.jsx`

### 3.1 Page Header

```
← back     Beans  ·  bean profiles, separate from physical bags
                                              [search…]  [all roasters ▾]  [+ New bean]
```

- Header bar: 18px vertical padding, `2px solid var(--aibrew-ink)` bottom border
- Breadcrumb: `← back` (tiny muted) + `Beans` (h2)
- Right side: search input (180px, muted) + "all roasters" filter chip + `+ New bean` button (accent/primary style)

### 3.2 Tab Bar ("In pantry" / "Empty bags")

Sourced from CONTEXT.md D-01. The design's card grid covers all beans; Phase 2 adds a tab switcher above the grid using the same `Button + borderBottom` pattern from `CatalogView.tsx` SUB_NAV:

```
[In pantry]   [Empty bags]
```

- Default tab: "In pantry" (remaining_g > 0)
- "Empty bags" tab: beans with remaining_g ≤ 0
- Tab state: local React state `activeTab: 'pantry' | 'empty'`
- Both tabs share the same fetched array — partitioned client-side

### 3.3 Card Grid Layout

**Design:** 2-column card grid (`display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px`).

Each bean card:

```
┌──────────────────────────────────────────────────────┐
│  [bean swatch ●]   Kenya AA                [2 bags▸] │
│  72×72 circle      by Gardelli · Nyeri, Kenya        │
│                    [washed]  [SL28/SL34]             │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│  on shelf          avg rating   tasting notes        │
│  142g              ★★★★☆        floral  currant  tea │
│  1 inventory                                         │
│                                                      │
│  [inventory bags strip — bag#1 35% · bag#2 78%]     │
│  [+ bag]                                             │
│                                              [open →]│
└──────────────────────────────────────────────────────┘
```

**Card internals:**

| Element | Design source | Implementation note |
|---------|--------------|---------------------|
| Bean swatch circle | `radial-gradient(circle at 35% 35%, {roastColor}, #1d1a17)` 72×72px | Color chosen by roast level: light → `#7a4a22`, medium → `#5a2e1a`, dark → `#3a2516` |
| Name + roaster line | `h3` fontSize 22, `tiny muted` for roaster+origin | From bean record fields |
| Process / variety chips | `chip` class | Optional — show only if populated. Phase 2 schema has no process/variety columns; omit these chips in Phase 2 |
| "N bags" chip | accent chip if bags > 0, plain chip at 60% opacity + "archived" if bags = 0 | Bag count = inventory records with active=true |
| Stock section: "on shelf" | `big` font (24px) for gram amount, `tiny muted` for inventory count | From Scripted REST `/v1/stock/{sysId}` → `remaining_g` |
| Avg rating | `Stars` component (★☆ based on avg of brew ratings) | Phase 2: no brews yet — show "—" or omit stars if no brew data |
| Tasting notes | `chip` elements | Phase 2 schema has no tasting notes column on bean; omit in Phase 2 |
| Inventory bags strip | `BeanBag` fill icon + `tiny` date/grams | Show the 2 most recent active inventory bags. Fetch from `bean_purchase` table per bean (or defer to detail page click — see note below) |
| `+ bag` chip | dashed border chip | Opens "Add Beans" flow — navigates to bean detail with add-bag intent |
| `open profile →` | `chip` right-aligned | Navigates to bean detail view |

**Phase 2 simplification:** The full card from the design requires per-bean inventory sub-queries on the list view (N+1 calls). For Phase 2, show only the stock figures (from the stock REST endpoint) and suppress tasting notes / process / variety chips (not in Phase 2 schema). The inventory bag strip (BeanBag icons) on the list card is **deferred** — show only the gram total + a "N bag(s)" count text. The full bag strip renders only on the detail page.

**Low-stock badge on cards:** If `remaining_g < 50 && remaining_g > 0`, show a `⚠ Low stock` badge in accent/destructive color on the card (inline with the gram display, right side).

### 3.4 "New bean" button / empty tile

- Last slot in the grid (spanning full width / 2 columns): dashed-border tile with `+` symbol and "New bean profile" text + primary button
- Clicking any of these opens the create modal (D-08)

### 3.5 Create Modal (D-08)

**Design source:** `NewRoasterModal` pattern (same structure, adapted for bean fields).

```
┌────────────────────────────────────────────────┐
│ add bean                                  [esc] │
│ New bean                                        │
│                                                 │
│ Name *  [                              ]        │
│ Origin  [                              ]        │
│ Roast level  [Light ▾]  Roast date  [   ]       │
│ Roaster *  [select roaster ▾]                   │
│                                                 │
│ Notes  [                              ]         │
│                                                 │
│ [cancel]                     [Save bean]        │
└────────────────────────────────────────────────┘
```

- Component: `Modal` with footer actions `[cancel, Save bean]`
- Inside: `RecordProvider sysId="-1"` + `FormColumnLayout` + `FormActionBar`
- Fields: `name` (required), `origin`, `roast_level` (ChoiceColumn picker), `roast_date` (date), `roaster` (reference)
- After save: close modal, increment `listKey` to refresh bean list (D-08 / listKey pattern from Phase 1)

### 3.6 Archive flow (D-09)

Same as Phase 1 roaster/equipment archive:
- "Archive" button in bean detail header → `Modal` confirmation dialog
- On confirm: PATCH `{ active: false }` to Table API
- After archive: navigate back to bean list, increment listKey
- Archived beans are hidden from both "In pantry" and "Empty bags" tabs (soft-delete, not a stock state)

---

## 4. Bean Detail View

**Design source:** `BeanProfilePage` in `subpages2.jsx`

Layout: **2-column grid** — left 1/3 (profile card) + right 2/3 (inventory + history).

### 4.1 Header

```
← Beans  /  Kenya AA
                        [edit]  [archive]  [+ new bag of this bean]
```

- Breadcrumb: `← Beans` (tiny muted) + `/` + bean name (h2)
- Right actions: `edit` btn (sm), `archive` btn (sm), `+ new bag of this bean` btn (accent)

### 4.2 Left column — Profile card

```
┌─────────────────────────────────┐
│  [bean swatch ●]  Kenya AA      │
│  88×88 circle     by Gardelli   │
│                   Nyeri, Kenya  │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│  roast level    light           │
│  roast date     2026-04-10      │
│  roaster        Gardelli →      │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│  origin         Nyeri, Kenya    │
└─────────────────────────────────┘
```

- Component: `RecordProvider` (table=bean, sysId) + `FormColumnLayout` + `FormActionBar`
- Fields rendered: name, origin, roast_level, roast_date, roaster reference
- Roast level shown as human label (ChoiceColumn display value)
- Roaster reference shows `.display_value` with optional arrow link chip

### 4.3 Right column — KPI strip

4 stat boxes in a row (matching BeanProfilePage "on shelf / total ever / avg rating / cost/brew"):

| Box | Phase 2 value | Source |
|-----|--------------|--------|
| on shelf | `{remaining_g}g` + "across N bag(s)" | Scripted REST stock endpoint |
| total ever purchased | `{total_purchased_g}g` | Scripted REST stock endpoint |
| avg rating | "—" (no brews yet) | Phase 4 will populate |
| cost / brew | omit (INV-06 is v2) | Deferred |

**Phase 2:** Show only 3 KPI boxes: "on shelf", "total ever", and a placeholder "avg rating: —". Cost/brew is v2.

### 4.4 Right column — Stock progress bar (D-05)

Below KPI strip, **before** the inventory section:

```
[ ████████░░░░░░ ]   133g / 250g   ⚠ Low stock
```

- Visual bar: `<div>` with child `<div>` width = `(remaining_g / total_purchased_g) * 100%`
- Track color: `var(--aibrew-ink-5)`, fill color: `var(--aibrew-accent)` (normal) or `var(--aibrew-destructive)` (low-stock)
- Label: `{remaining_g}g / {total_purchased_g}g` (D-03 format)
- Low-stock badge: if `remaining_g < 50 && remaining_g > 0`: red/accent badge `⚠ Low stock` (D-05)
- Loading skeleton: pulse animation while stock is loading (D-05 / Research Pattern 8)

### 4.5 Right column — Inventory (purchase bags)

**Design source:** BeanProfilePage "Inventory · pantry" section.

```
Inventory · pantry                        [multiple bags can share this profile]

[BeanBag]  [active]   roasted Apr 10 · 12d    [████░░░░]   142 / 400g   ---
[BeanBag]  [finished] roasted Mar 12 · 41d    [░░░░░░░░]     0 / 400g   ---

[+ add new bag of {bean name}]
```

Each row:
- `BeanBag` fill icon: fill = `remaining_g / total_g` for that bag
- Status chip: "active" (sel style) if bag has remaining > 0, "finished" if 0
- Date + age label: purchase_date + "Nd ago" derived age
- Progress bar: `<div>` bar showing that bag's fill level
- Gram label: `{remaining_g} / {total_g}g` — **in Phase 2**, remaining = bag grams (no brew deductions yet), so show `{grams}g / {grams}g` for 100% fill
- `⋯` menu chip (future: edit/delete bag; Phase 2: render chip but non-functional)
- "add new bag" button at bottom → scrolls to / shows the "Add Beans" inline form (D-06)

**Phase 2 bag data:** The `bean_purchase` table has `grams` and `purchase_date`. There is no per-bag "remaining" in Phase 2 (brew deductions don't exist yet). Display each bag as full (100% fill, `{grams}g / {grams}g`). The stock API aggregates all bags — show the aggregate progress bar separately (D-05) above this section.

### 4.6 Right column — "Add Beans" inline form (D-06)

Shown below the inventory bag list. Label: **"Add Beans"** (not "Log purchase" or "New bag").

```
Add Beans
  Grams  [      ]   Purchase date  [ 2026-04-30 ]   [Add Beans]
```

- Two fields: `grams` (number input, required, > 0) + `purchase_date` (date input, default today `YYYY-MM-DD`)
- Submit button: "Add Beans" (accent style)
- Controlled React state (not RecordProvider) — direct Table API POST to `bean_purchase`
- On success: increment `stockKey` + `historyKey` to re-fetch stock bar and purchase list
- Validation: `grams > 0` integer, `purchaseDate` non-empty, `g_ck` guard

### 4.7 Right column — Purchase history (D-07)

Below "Add Beans" form:

```
Purchase history                          28 entries · last Apr 30
──────────────────────────────────────────
  Apr 30  250g
  Apr 17  312g
  Mar 12  400g
  ...
```

- Table API GET on `bean_purchase`, `sysparm_query=bean={sysId}^ORDERBYDESCpurchase_date`, limit 20
- Each row: date (formatted `MMM D`) + gram amount
- "28 entries" count text from total returned (capped at 20 in Phase 2)
- Section header: "Purchase history"

---

## 5. Component Inventory

| Component | New or Reuse | Closest Phase 1 analog |
|-----------|-------------|----------------------|
| `BeanSection.tsx` | New | Copy `RoasterSection.tsx`, extend with stock bar + Add Beans form |
| `BeanCard` (inline in BeanSection) | New | Inline in BeanSection list view |
| `StockBar` (inline in BeanSection) | New | CSS `<div>`, no component exists |
| `AddBeansForm` (inline in BeanSection detail) | New | Controlled form, no analog |
| `PurchaseHistoryList` (inline in BeanSection detail) | New | Table API fetch pattern from RoasterSection |
| `CatalogView.tsx` | Edit | Set `beans` to `disabled: false`, import BeanSection, add `case 'beans'` |

---

## 6. Navigation & Routing

- Bean list: `?view=catalog&section=beans` (no `id`)
- Bean detail: `?view=catalog&section=beans&id={sysId}`
- Create bean: modal overlay on list (no route change)
- Archive: modal overlay on detail, then navigate to list

All routing uses existing `navigateToView` / `getViewParams` utilities from `src/client/utils/navigate.ts`.

---

## 7. Interaction States

| State | Behavior |
|-------|---------|
| Stock loading | Skeleton pulse on stock bar (list card + detail bar) |
| Stock error | Show "—g" placeholder, no crash |
| Empty "In pantry" tab | "No beans in pantry — add your first bean" empty state with `+ New bean` button |
| Empty "Empty bags" tab | "All beans have stock remaining" message |
| Form saving (Add Beans) | Button disabled + "Saving…" label during POST |
| Form error | Inline error text below form (not toast) |
| Create modal saving | `FormActionBar` handles save state via RecordProvider |

---

## 8. Accessibility & Mobile

- All interactive elements have visible focus rings (existing CSS custom property pattern)
- Bean cards: min touch target 44×44px for action chips
- Tab buttons ("In pantry" / "Empty bags"): `role="tab"` pattern
- Stock bar: `aria-label="{remaining_g}g remaining of {total_purchased_g}g total"`
- The app runs in a Polaris iframe — all event wiring must respect the Polaris iframe context (existing pattern from Phase 1)

---

## 9. What's Explicitly Out of Scope for Phase 2

| Design element | Why excluded |
|---------------|-------------|
| Tasting notes chips on bean cards/detail | No schema column in Phase 2 |
| Process / variety fields | Not in Phase 2 table definition |
| Altitude, "best for" fields | Not in Phase 2 table definition |
| Recommended recipe on detail | Phase 3 (Recipe Presets) |
| Brew history charts on detail | Phase 4/5 |
| Cost/brew KPI | INV-06 — v2 deferred |
| Avg rating with data | Phase 4 (brew log) |
| Full inventory table page (InventoryPage design) | Separate future view; Phase 2 inventory lives on detail page |
| Search / filter by roaster on bean list | Deferred post-Phase 2 |
| Stats section | Phase 6 |

---

*Phase: 02-bean-catalog-inventory*
*UI-SPEC created: 2026-04-30 from design files at C:\Users\William.Wood\BrewAI\design*
