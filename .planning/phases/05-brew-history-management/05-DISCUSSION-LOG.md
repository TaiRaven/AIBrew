# Phase 5: Brew History & Management - Discussion Log

**Date:** 2026-05-07
**Mode:** Default (interactive)
**Areas discussed:** History card layout, Edit flow, Delete placement

---

## Area 1: History Card Layout

**Q1: What fields to show on each brew card?**
Options: Date+method+bean+rating / Date+method+bean+ratio+rating / Date+method+bean+rating+notes snippet
**Selected:** Date + method + bean + ratio + rating
Notes: User wants dose/water/ratio inline so recipe variables are visible at a glance without opening.

**Q2: Card style — full elevated card or compact list rows?**
Options: Full card (elevated box) / Compact list rows
**Selected:** Full card (elevated box)
Notes: Consistent with recipe/bean/equipment card style throughout the app.

**Q3: How many brews to load?**
Options: All brews / 50 most recent with "Load more"
**Selected:** 50 most recent with "Load more"
Notes: User prefers pagination over loading all records.

---

## Area 2: Edit Flow

**Q1: Where does the edit form open?**
Options: Full-screen view (?view=history&id=X) / Modal over the list
**Selected:** Modal over the list
Notes: Keeps context of the history list visible; consistent with catalog edit patterns.

**Q2: What form approach in the edit modal?**
Options: Custom form (method chips, rating circles, native inputs) / RecordProvider + FormActionBar
**Selected:** Custom form — method chips, rating circles, native inputs
Notes: Best mobile UX; reuses BrewView field components. Timer becomes an editable mm:ss text input in edit mode.

**Q3: Include all editable brew fields?**
Options: Yes, all editable fields / Core fields only
**Selected:** Yes, all editable fields (method, bean, equipment, dose, water, grind, timer as text, rating, notes). Recipe reference field omitted — historical artifact.

**Q4: How is the edit saved?**
Options: PATCH via Table API / RecordProvider + FormActionBar
**Selected:** PATCH via Table API
Notes: Consistent with archive pattern; no RecordProvider overhead.

---

## Area 3: Delete Placement

**Q1: Where does delete appear?**
Options: Inside edit modal only / Trash icon on card / Both
**Selected:** Both — trash icon on card + Delete button in edit modal
Notes: Two entry points for convenience; trash icon on card, red destructive button in edit modal.

**Q2: Confirmation required?**
Options: Yes — confirmation modal / No — immediate delete
**Selected:** Yes — confirmation modal required
Notes: "Delete this brew? This cannot be undone." Prevents accidental deletes on mobile.

---

## Claude's Discretion Items

- Empty state copy and layout when no brews exist
- Date/time formatting ("May 6 · 08:14" style)
- Trash icon placement on card (top-right or bottom-right)
- Loading/spinner state
- Error handling on failed fetch

---

## Deferred Ideas

- Filter history by date/bean/method (RPT-05) — v2
- Brew history mini-list on bean detail page — Phase 5 gap-closure or v2
- Analytics (RPT-02/03/04) — Phase 6
