# Phase 3: Recipe Presets - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-01
**Phase:** 3-recipe-presets
**Areas discussed:** Preset fields (schema), Create flow in Phase 3, Delete vs archive, Preset list card design

---

## Preset Fields (Schema)

### Bean reference

| Option | Description | Selected |
|--------|-------------|----------|
| Bean-agnostic | Preset stores method + recipe variables only; bean picked at brew-time | ✓ |
| Bean-specific | Preset stores a bean reference — e.g. "Ethiopian V60" always starts with that bean | |

**User's choice:** Bean-agnostic
**Notes:** Recommended option accepted without modification.

### Recipe depth

| Option | Description | Selected |
|--------|-------------|----------|
| Full recipe | name + method + equipment + dose + water + grind size | ✓ |
| Core ratio only | name + method + dose + water (no equipment or grind size) | |

**User's choice:** Full recipe
**Notes:** Recommended option accepted. Grind size requires equipment reference (per CLAUDE.md critical pitfall — IntegerColumn scoped to grinder).

### Notes field

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — short notes field | Free-text annotation for the preset itself | ✓ |
| No — name only | Preset name is sufficient | |

**User's choice:** Yes — short notes field added.

---

## Create Flow in Phase 3

| Option | Description | Selected |
|--------|-------------|----------|
| Manual create form | Phase 3 ships "New Preset" modal in Catalog > Recipes; save-from-brew wired in Phase 4 | ✓ |
| Management only | Table + list/edit/delete in Phase 3; list empty until Phase 4 save-from-brew | |

**User's choice:** Manual create form
**Notes:** Recommended option accepted. RECIPE-01 (save-from-brew) deferred to Phase 4 by design.

---

## Delete vs Archive

| Option | Description | Selected |
|--------|-------------|----------|
| Hard delete | No active column; safe because brew log copies values not FK reference | |
| Archive (soft-delete) | active BooleanColumn; consistent with roasters/equipment/beans | ✓ |

**User's choice:** Archive (soft-delete)
**Notes:** Initially selected hard delete (recommended), then revised to archive for consistency with the rest of the app. Final decision: `active` BooleanColumn, archive on soft-delete.

---

## Preset List Card Design

| Option | Description | Selected |
|--------|-------------|----------|
| Name + method + ratio | Name (large) + method chip + dose/water/ratio inline | ✓ |
| Name + method only | Cleaner, ratio visible only on detail view | |

**User's choice:** Name + method + ratio (e.g. `18g • 300g  1:16.7`)
**Notes:** Confirmed via visual preview. Ratio is computed at display time (`water / dose`), not stored.

---

## Claude's Discretion

- Exact ChoiceColumn values for `method` — use BREW-01 list from REQUIREMENTS.md.
- Visual styling of method chip on card.
- ACL structure — single `aibrew_user` role consistent with Phase 1 pattern.
- Field ordering on create/edit form (name → method → equipment → dose → water → grind size → notes).
- Empty state copy for the preset list.

## Deferred Ideas

- **Save-from-brew (RECIPE-01)** — deferred to Phase 4 (brew log form doesn't exist in Phase 3).
- **Preset picker in brew log form (BREW-02)** — Phase 4 concern.
- **Prompt to update preset after drift (RECIPE-03)** — v2.
- **Filter by bean or method (RECIPE-04)** — v2.
