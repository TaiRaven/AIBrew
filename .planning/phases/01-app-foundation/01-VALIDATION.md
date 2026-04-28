---
phase: 1
slug: app-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-28
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `npx @servicenow/sdk build` (compile) + manual smoke tests on instance |
| **Config file** | None local — no local test runner; ATF tests are optional for Phase 1 |
| **Quick run command** | `npx @servicenow/sdk build` |
| **Full suite command** | `npx @servicenow/sdk build && npx @servicenow/sdk install` + manual smoke |
| **Estimated runtime** | ~30 seconds compile; manual smoke ~10 min |

---

## Sampling Rate

- **After every task commit:** Run `npx @servicenow/sdk build`
- **After every plan wave:** Run `npx @servicenow/sdk install` then manual smoke tests on instance
- **Before `/gsd-verify-work`:** All 8 requirements verified with non-admin test user
- **Max feedback latency:** 30 seconds (compile gate)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 1-sdk-init | TBD | 1 | PLAT-01 | — | Real scope prefix used, no placeholder | Manual | `npx @servicenow/sdk build` | ❌ W0 | ⬜ pending |
| 1-tables | TBD | 1 | PLAT-02, CAT-01, CAT-07 | T-1-01 | ACL role on every table | Build | `npx @servicenow/sdk build` | ❌ W0 | ⬜ pending |
| 1-acls | TBD | 1 | PLAT-02 | T-1-01 | Non-admin blocked without role | Manual ACL | `npx @servicenow/sdk build` | ❌ W0 | ⬜ pending |
| 1-navigator | TBD | 2 | PLAT-01 | — | Module opens correct UiPage | Manual smoke | `npx @servicenow/sdk build` | ❌ W0 | ⬜ pending |
| 1-home-ui | TBD | 2 | D-01, D-02, D-04 | — | Inactive tabs present but greyed | Manual smoke | `npx @servicenow/sdk build` | ❌ W0 | ⬜ pending |
| 1-roaster-ui | TBD | 2 | CAT-01, CAT-02, CAT-03 | — | Archive hides from list; preserves record | Manual smoke | `npx @servicenow/sdk build` | ❌ W0 | ⬜ pending |
| 1-equipment-ui | TBD | 2 | CAT-07, CAT-08, CAT-09 | — | Archive hides from list; preserves record | Manual smoke | `npx @servicenow/sdk build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- No existing test infrastructure (greenfield project). ATF test records are optional for Phase 1.
- Primary gate is manual non-admin smoke testing per PLAT-02.
- Every task uses `npx @servicenow/sdk build` as the compile-time automated gate.

*Wave 0 note: No stub files needed — compile validation is the automated baseline.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Navigator module opens AIBrew | PLAT-01 | Requires live ServiceNow instance | Log in as non-admin, find AIBrew in navigator, click — page loads without error |
| Non-admin with role can CRUD; without role cannot | PLAT-02 | Requires test user account setup | Create user with only `x_<scope>_aibrew.user` role; verify create/read/edit on roaster/equipment; remove role and verify access denied |
| Create, view, edit, archive roaster | CAT-01, CAT-02, CAT-03 | Instance UI interaction | Create roaster, verify in list; edit name, save; archive — verify gone from list, still in table |
| Create, view, edit, archive equipment | CAT-07, CAT-08, CAT-09 | Instance UI interaction | Same pattern as roaster; verify both type choices (grinder/brewer) |
| Archived records preserve brew log references | CAT-03, CAT-09 | Referential integrity check | Archive a roaster; confirm any future brew logs can still reference it via sys_id |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify (build gate) or manual test instructions
- [ ] Sampling continuity: `npx @servicenow/sdk build` runs after every task commit
- [ ] Wave 0 note acknowledged: no stubs required for greenfield Phase 1
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s (compile gate)
- [ ] `nyquist_compliant: true` set in frontmatter after all manual tests pass

**Approval:** pending
