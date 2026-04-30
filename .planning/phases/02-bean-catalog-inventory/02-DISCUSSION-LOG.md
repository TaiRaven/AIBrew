# Phase 2: Bean Catalog & Inventory - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-30
**Phase:** 2-bean-catalog-inventory
**Areas discussed:** Purchase logging placement, Stock display & low-stock badge, Bean list structure, Bean list secondary info, Purchase history location

---

## Purchase Logging Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Separate modal | "New purchase" button opens a full modal form | |
| Inline mini form on bean detail | "Add Beans" section with inline grams + date fields | ✓ |
| Separate purchases sub-tab | Dedicated tab on the bean detail | |

**User's choice:** Inline mini form on the bean detail page, labelled "Add Beans"
**Notes:** The label "Add Beans" (not "Add purchase") was explicitly specified. This matches the mental model of "I bought more beans."

---

## Stock Display & Low-Stock Badge

| Option | Description | Selected |
|--------|-------------|----------|
| Text only | "143g remaining" label | |
| Progress bar + numerical | Visual bar + `133g / 250g` label | ✓ |
| Badge only | Coloured chip showing stock state | |

**User's choice:** Progress bar (visual percentage bar) + `133g / 250g` numerical label + low-stock badge when ≤ 50g.
**Notes:** Denominator (250g) = total grams ever purchased. Numerator (133g) = total purchased minus brews used. Badge appears in both the list row and the bean detail.

---

## Bean List Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Single flat list | All active beans in one list | |
| In pantry / Empty bags tabs | Two tabs splitting beans by stock state | ✓ |
| Filtered dropdown | Single list with filter control | |

**User's choice:** Two tabs — "In pantry" (remaining > 0) and "Empty bags" (remaining ≤ 0). Default tab: "In pantry".
**Notes:** Archived beans do not appear in either tab (archive is a soft-delete, separate from stock depletion).

---

## Bean List Secondary Info

| Option | Description | Selected |
|--------|-------------|----------|
| Name only | Just the bean name per row | |
| Name + roaster | Name and roaster name | |
| Name + roaster + origin + stock | Full row with visual stock indicator | ✓ |

**User's choice:** Name, roaster name, origin, and stock progress bar visualisation in each list row.

---

## Purchase History Location

| Option | Description | Selected |
|--------|-------------|----------|
| Not shown in Phase 2 | Aggregate stock figure only | |
| Below stock bar on bean detail | Scrollable chronological list of purchases | ✓ |
| Separate history tab | Dedicated tab on bean detail | |

**User's choice:** Below the "Add Beans" form on the bean detail page (chronological, newest first).
**Notes:** Brew depletions will appear here once Phase 4 is built. Phase 2 shows purchases only.

---

## Claude's Discretion

- Roast level ChoiceColumn values (follow coffee industry convention)
- Progress bar colour: `--aibrew-accent` at normal stock, `--aibrew-destructive` at ≤ 50g
- Stock API response shape: `{ remaining_g, total_purchased_g }`
- Purchase history capped at 20 records (no pagination in Phase 2)
- Loading skeleton on stock bar while fetching

## Deferred Ideas

- User-configurable low-stock threshold (INV-05) — v2
- Purchase price / cost-per-cup (INV-06) — v2
- Brew depletions in history — Phase 4
- Purchase history pagination — deferred
