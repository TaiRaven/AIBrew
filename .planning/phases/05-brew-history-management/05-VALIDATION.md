---
phase: 5
slug: brew-history-management
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-07
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no automated test framework in project |
| **Config file** | None — no jest/vitest config detected |
| **Quick run command** | Manual smoke test on live ServiceNow instance |
| **Full suite command** | Manual UAT checklist with `aibrew_user` (non-admin) account |
| **Estimated runtime** | ~15 minutes (full UAT) |

No automated test infrastructure exists in this project. All prior phases (1–4) validated via manual UAT against the live instance with a non-admin `aibrew_user` account.

---

## Sampling Rate

- **After every task deploy:** Smoke test the task's specific behaviour on the live instance with `aibrew_user` account
- **After every plan wave:** Repeat smoke tests for all tasks in the wave
- **Before `/gsd-verify-work`:** Full UAT checklist must pass with non-admin user
- **Max feedback latency:** Deploy → smoke test within 5 minutes of each task

---

## Per-Task Verification Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? | Status |
|--------|----------|-----------|-------------------|-------------|--------|
| RPT-01 | History list loads 50 brews in reverse-chronological order | manual smoke | — | N/A | ⬜ pending |
| RPT-01 | "Load more" appends next 50 records (not replaces) | manual smoke | — | N/A | ⬜ pending |
| RPT-01 | Empty state shows friendly message when no brews exist | manual smoke | — | N/A | ⬜ pending |
| RPT-01 | Fetch error shows error message (not blank/empty state) | manual smoke | — | N/A | ⬜ pending |
| BREW-10 | Edit modal opens with all fields pre-populated from selected record | manual smoke | — | N/A | ⬜ pending |
| BREW-10 | PATCH saves changes; history list refreshes to show updated values | manual smoke | — | N/A | ⬜ pending |
| BREW-11 | Trash icon on card triggers confirmation modal (not immediate delete) | manual smoke | — | N/A | ⬜ pending |
| BREW-11 | "Delete brew" in edit modal triggers confirmation modal | manual smoke | — | N/A | ⬜ pending |
| BREW-11 | Confirmed delete removes record; list refreshes; bean stock figure decreases | manual smoke | — | N/A | ⬜ pending |
| BREW-11 | Cancel on confirmation modal: record NOT deleted, modal closes | manual smoke | — | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

None — no test framework to configure. All verification is manual UAT against the live instance.

**Pre-UAT data prerequisite:** Ensure at least 2–3 `brew_log` records exist in the instance before running UAT so pagination, edit, and delete can all be exercised. Use `aibrew_user` account throughout.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| History list loads brews in reverse-chronological order | RPT-01 | No automated test framework | Log in as `aibrew_user`, open History view, verify newest brew appears first |
| "Load more" appends (not replaces) records | RPT-01 | Requires live pagination state | Load page 1, tap "Load more", verify all prior cards still visible plus new ones |
| Edit form pre-populates all fields | BREW-10 | Requires live record data | Tap a brew card, verify edit modal fields match the brew's stored values |
| PATCH persists and list refreshes | BREW-10 | Requires live Table API | Edit a field, save, close modal, verify card shows updated value |
| Delete removes record + stock updates | BREW-11 | Requires GlideAggregate verification | Delete a brew, check bean detail page stock figure decreased by deleted brew's dose_weight_g |
| Confirmation modal prevents accidental delete | BREW-11 | UX gate, no automation | Tap trash icon, tap Cancel, verify record still exists in list |
| Non-admin ACL enforcement | PLAT-02 | Must be non-admin session | Run all verifications as `aibrew_user` (not admin) — admin bypasses ACL checks |

---

## Validation Sign-Off

- [ ] All tasks have manual smoke verification steps in their acceptance criteria
- [ ] Sampling continuity: every task deploy includes at least one smoke test
- [ ] Wave 0: N/A — no test framework
- [ ] No watch-mode flags (N/A)
- [ ] UAT checklist complete with `aibrew_user` (non-admin)
- [ ] `nyquist_compliant: true` set in frontmatter after final sign-off

**Approval:** pending
