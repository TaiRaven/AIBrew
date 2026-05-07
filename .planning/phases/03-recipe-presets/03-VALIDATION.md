---
phase: 3
slug: recipe-presets
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-01
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no jest/vitest/pytest config found; SDK build is the compile-time gate |
| **Config file** | None — Wave 0 has no gaps (existing SDK build + manual UAT covers all requirements) |
| **Quick run command** | `npx @servicenow/sdk build` |
| **Full suite command** | `npx @servicenow/sdk build && npx @servicenow/sdk install` |
| **Estimated runtime** | ~30–60 seconds (build) + ~60 seconds (install) |

---

## Sampling Rate

- **After every task commit:** Run `npx @servicenow/sdk build`
- **After every plan wave:** Run `npx @servicenow/sdk build && npx @servicenow/sdk install`
- **Before `/gsd-verify-work`:** Full suite (build + install) must pass; human UAT against all RECIPE-02 success criteria must be complete
- **Max feedback latency:** ~90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-T1 | 01 | 1 | RECIPE-02 | T-SysId-Injection | SysId validated with `/^[0-9a-f]{32}$/i` before PATCH | manual | `npx @servicenow/sdk build` | ❌ W0 | ⬜ pending |
| 03-01-T2 | 01 | 1 | RECIPE-02 | T-ACL-Gaps | recipe table has 4 ACLs (read/write/create/delete) for aibrew_user | manual | `npx @servicenow/sdk build` | ❌ W0 | ⬜ pending |
| 03-02-T1 | 02 | 1 | RECIPE-02 | — | Active presets appear in list; archived do not | manual-UAT | `npx @servicenow/sdk build` | ❌ W0 | ⬜ pending |
| 03-02-T2 | 02 | 1 | RECIPE-02 | — | "New Preset" modal saves and list refreshes | manual-UAT | `npx @servicenow/sdk build` | ❌ W0 | ⬜ pending |
| 03-02-T3 | 02 | 2 | RECIPE-02 | — | Edit preset saves changes; ratio recomputes | manual-UAT | `npx @servicenow/sdk build` | ❌ W0 | ⬜ pending |
| 03-02-T4 | 02 | 2 | RECIPE-02 | — | Archive sets active=false; record disappears | manual-UAT | `npx @servicenow/sdk build` | ❌ W0 | ⬜ pending |
| 03-03-T1 | 03 | 2 | RECIPE-02 | T-ACL-Gaps | Non-admin aibrew_user can CRUD presets; unauthenticated cannot | manual-UAT | `npx @servicenow/sdk build && npx @servicenow/sdk install` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure (SDK build + manual UAT) covers all phase requirements. No test framework installation needed.

*"Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Active presets appear in list; archived do not | RECIPE-02 | No automated test framework | Open app, create 2 presets, archive 1, confirm only 1 shows in list |
| "New Preset" modal saves record and list refreshes | RECIPE-02 | UI interaction | Tap "New Preset", fill fields, save, confirm card appears in list without reload |
| Edit preset updates record | RECIPE-02 | UI interaction | Tap preset card, edit name/method, save, confirm changes persist on re-open |
| Archive confirmation hides preset | RECIPE-02 | UI interaction | Tap "Archive" in detail view, confirm modal, confirm preset gone from list |
| Ratio displays as `water / dose` to 1 d.p. | RECIPE-02 | UI render | Create preset with dose=18g, water=300g, confirm card shows `1:16.7` |
| Non-admin user CRUD works; no-role user is blocked | RECIPE-02 | ACL enforcement | Log in as non-admin aibrew_user: CRUD works. Log in as user without role: no access |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
