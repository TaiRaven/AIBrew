---
phase: 4
plan: "04-01"
title: "Fluent Artifacts — brew_log Table + ACLs + Deploy"
status: complete
completed: "2026-05-06"
duration_minutes: 19

subsystem: fluent-artifacts
tags: [table-definition, acl, sdk-deploy, brew-log, hub-table]

dependency_graph:
  requires:
    - src/fluent/tables/bean.now.ts (x_664529_aibrew_bean — ReferenceColumn target)
    - src/fluent/tables/equipment.now.ts (x_664529_aibrew_equipment — ReferenceColumn target)
    - src/fluent/tables/recipe.now.ts (x_664529_aibrew_recipe — ReferenceColumn target + ChoiceColumn contract)
    - src/fluent/roles/aibrew-user.now.ts (aibrew_user — ACL role)
    - src/fluent/index.now.ts (barrel export — updated)
  provides:
    - x_664529_aibrew_brew_log table on ServiceNow instance
    - 4 scoped ACLs (brew_log_read, brew_log_write, brew_log_create, brew_log_delete)
  affects:
    - Phase 2 GlideAggregate stock endpoint (automatically sums dose_weight_g from brew_log)
    - Plan 04-03 (BrewView form core — POSTs to this table)
    - Plan 04-04 (below-fold fields + submit handler — POSTs to this table)

tech_stack:
  added: []
  patterns:
    - Table definition with ChoiceColumn, ReferenceColumn, IntegerColumn, DecimalColumn, StringColumn
    - ACL pattern (type: record, roles: [aibrew_user]) — identical to recipe-acls.now.ts

key_files:
  created:
    - src/fluent/tables/brew-log.now.ts
    - src/fluent/acls/brew-log-acls.now.ts
  modified:
    - src/fluent/index.now.ts

decisions:
  - "grind_size declared as IntegerColumn per CLAUDE.md critical pitfall and D-19 — never StringColumn"
  - "display: sys_created_on used as brew_log has no natural name field (per research open question resolution)"
  - "rating has min:1 max:10 constraints at DB level (D-15); grind_size left unconstrained (grinder steps vary)"
  - "No ratio column — BREW-07 says ratio computed at render time, never stored"
  - "No active BooleanColumn — brew_log records are permanent; archive is Phase 5 (BREW-11)"
  - "ChoiceColumn method keys copied verbatim from recipe.now.ts to lock schema contract"

metrics:
  duration_minutes: 19
  completed: "2026-05-06"
  tasks_completed: 3
  tasks_total: 3
  files_created: 2
  files_modified: 1
---

# Phase 4 Plan 01: Fluent Artifacts — brew_log Table + ACLs + Deploy Summary

Hub table `x_664529_aibrew_brew_log` created with all 10 D-19 columns (grind_size as IntegerColumn, ChoiceColumn method values matching recipe.now.ts exactly), 4 scoped ACLs deployed, barrel index updated — SDK build and install both succeeded.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 04-01-01 | Create brew-log.now.ts | b45e91f | src/fluent/tables/brew-log.now.ts (created) |
| 04-01-02 | Create brew-log-acls.now.ts | bab2451 | src/fluent/acls/brew-log-acls.now.ts (created) |
| 04-01-03 | Update index.now.ts + deploy | 2211941 | src/fluent/index.now.ts (modified) |

## Verification Results

### SDK Build
- `npx @servicenow/sdk build`: **exit 0** — all 3 tasks verified
- No compile errors or TypeScript warnings in Fluent artifacts

### SDK Install
- `npx @servicenow/sdk install`: **exit 0**
- Deployed to: `https://dev203275.service-now.com`
- App record: `sys_id=d4ec676d9a864dbda7cb993a2733c734`

### Schema Verification (build-time checks)

| Check | Result |
|-------|--------|
| grind_size is IntegerColumn | PASS |
| No ratio column | PASS |
| No BooleanColumn (active) | PASS |
| pour_over key present (not "pour over") | PASS |
| french_press key present | PASS |
| x_664529_aibrew_brew_log exported | PASS |

### Instance Verification (required UAT — Plan 04-05)
- [ ] Navigate to `sys_db_object.do?sysparm_query=name=x_664529_aibrew_brew_log` — table record appears
- [ ] Navigate to `sys_security_acl_list.do?sysparm_query=name=x_664529_aibrew_brew_log` — 4 ACL records visible (read, write, create, delete)
- [ ] Confirm `grind_size` column type shows "Integer" in ServiceNow Studio

## Column Summary (D-19 confirmed)

| Column | Type | Notes |
|--------|------|-------|
| method | ChoiceColumn | 7 choices: pour_over, espresso, french_press, aeropress, moka_pot, cold_brew, other |
| bean | ReferenceColumn | → x_664529_aibrew_bean |
| equipment | ReferenceColumn | → x_664529_aibrew_equipment |
| recipe | ReferenceColumn | → x_664529_aibrew_recipe (optional — preset used) |
| dose_weight_g | DecimalColumn | Nullable — optional |
| water_weight_g | DecimalColumn | Nullable — optional |
| grind_size | IntegerColumn | CRITICAL: IntegerColumn, not StringColumn |
| brew_time_seconds | IntegerColumn | Nullable — timer is optional |
| rating | IntegerColumn | min:1, max:10, nullable |
| taste_notes | StringColumn | maxLength:500, optional |

## Deviations from Plan

None — plan executed exactly as written. All 3 tasks completed in order, SDK build passed each time, install succeeded on first attempt.

## Known Stubs

None.

## Threat Flags

None — no new network endpoints or auth paths introduced. The `brew_log` table follows the same ACL pattern as all prior tables in the app (read/write/create/delete with aibrew_user role). The GlideAggregate inventory endpoint already accounts for brew_log records; no schema-level threat surface beyond what was modelled in the plan's threat_model.

## Self-Check: PASSED

Files created:
- src/fluent/tables/brew-log.now.ts: FOUND
- src/fluent/acls/brew-log-acls.now.ts: FOUND

Commits:
- b45e91f: FOUND (feat(04-01): create brew_log table definition)
- bab2451: FOUND (feat(04-01): create brew_log ACLs)
- 2211941: FOUND (feat(04-01): add brew_log exports to barrel index and deploy)
