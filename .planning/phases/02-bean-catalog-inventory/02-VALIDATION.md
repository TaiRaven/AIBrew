---
phase: 2
slug: bean-catalog-inventory
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-30
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual UAT (no automated test framework configured) |
| **Config file** | None — project uses SDK build + human UAT |
| **Quick run command** | `npx @servicenow/sdk build` |
| **Full suite command** | `npx @servicenow/sdk build && npx @servicenow/sdk install` |
| **Estimated runtime** | ~60 seconds (build) + deploy time |

---

## Sampling Rate

- **After every task commit:** Run `npx @servicenow/sdk build`
- **After every plan wave:** Run `npx @servicenow/sdk build && npx @servicenow/sdk install`
- **Before `/gsd-verify-work`:** Full suite must be green + all 5 Phase 2 success criteria verified by human UAT with non-admin test user
- **Max feedback latency:** ~60 seconds (build gate per task)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | CAT-04 | T-2-01 | sysId regex validation before URL | Manual UAT | `npx @servicenow/sdk build` | ❌ W0 | ⬜ pending |
| 2-01-02 | 01 | 1 | CAT-05 | — | N/A | Manual UAT | `npx @servicenow/sdk build` | ❌ W0 | ⬜ pending |
| 2-01-03 | 01 | 1 | CAT-06 | — | active=false PATCH, not DELETE | Manual UAT | `npx @servicenow/sdk build` | ❌ W0 | ⬜ pending |
| 2-02-01 | 02 | 1 | INV-01 | T-2-02 | grams > 0 validation before POST | Manual UAT | `npx @servicenow/sdk build` | ❌ W0 | ⬜ pending |
| 2-02-02 | 02 | 1 | INV-02 | T-2-01 | sysId regex in server handler | Manual UAT | `npx @servicenow/sdk build` | ❌ W0 | ⬜ pending |
| 2-02-03 | 02 | 1 | INV-03 | — | N/A | Manual UAT | `npx @servicenow/sdk build` | ❌ W0 | ⬜ pending |
| 2-02-04 | 02 | 1 | INV-04 | — | N/A | Manual UAT | `npx @servicenow/sdk build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

No automated test infrastructure to create — project uses manual UAT. Existing SDK build infrastructure covers all phase requirements.

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Create bean type linked to roaster | CAT-04 | No test framework; ServiceNow platform required | Open AIBrew → Catalog → Beans → New bean. Fill name, origin, roast level, roast date, roaster. Save. Verify record appears in list. |
| View and edit bean type | CAT-05 | No test framework; platform required | Click a bean in list → verify all fields shown. Edit name → save → verify change persists. |
| Archive bean type | CAT-06 | No test framework; platform required | Click archive on a bean → confirm modal → verify bean no longer appears in list or pickers. |
| Log bean purchase | INV-01 | No test framework; platform required | Open bean detail → Add Beans → enter grams + date → submit. Verify purchase appears in history list below. |
| Remaining stock computed live | INV-02 | GlideAggregate server-side; requires instance | Log a purchase → verify stock bar updates to reflect new total. Verify stock = SUM(purchases). |
| Low-stock badge at < 50 g | INV-03 | Visual rendering; requires instance | Add purchase of exactly 40 g to a bean with no prior purchases → verify low-stock badge appears. Add 20 more g → verify badge disappears. |
| Chronological purchase history | INV-04 | No test framework; platform required | Log 3 purchases on different dates → verify list shows newest first. |
| ACL enforcement (non-admin) | PLAT-02 | Requires non-admin test user | Log in as non-admin user with aibrew_user role → verify full bean CRUD + purchase POST works. Log in without role → verify all operations return 403. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s (SDK build gate)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
