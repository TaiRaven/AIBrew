---
phase: 4
slug: brew-log-core
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-05
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `@servicenow/sdk build` (SDK compile + schema validation) — no Jest/Vitest in project |
| **Config file** | Managed by SDK — no separate test config |
| **Quick run command** | `npx @servicenow/sdk build` |
| **Full suite command** | `npx @servicenow/sdk build && npx @servicenow/sdk install` |
| **Estimated runtime** | ~30–60 seconds (build); ~2–3 minutes (build + install) |

No unit test framework exists in this project. All functional validation is manual UAT on the live instance. This is consistent with Phase 1–3 validation patterns.

---

## Sampling Rate

- **After every task commit:** Run `npx @servicenow/sdk build`
- **After every plan wave:** Run `npx @servicenow/sdk build && npx @servicenow/sdk install`
- **Before `/gsd-verify-work`:** Full UAT checklist with non-admin `aibrew_user` account must be complete
- **Max feedback latency:** ~60 seconds for build; live instance check immediately after install

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|--------|
| 04-01-01 | 01 | 1 | BREW-01/BREW-06 (schema) | T-brew_log-create | grind_size is IntegerColumn not StringColumn | build | `npx @servicenow/sdk build` | ⬜ pending |
| 04-01-02 | 01 | 1 | PLAT-02 (ACLs) | T-brew_log-acl | aibrew_user role on all 4 ACLs; no wildcard roles | build + deploy | `npx @servicenow/sdk build && npx @servicenow/sdk install` | ⬜ pending |
| 04-01-03 | 01 | 1 | PLAT-02 | T-brew_log-acl | Non-admin read/write/create/delete tested | manual | aibrew_user account UAT | ⬜ pending |
| 04-02-01 | 02 | 1 | BREW-01 (nav entry) | — | N/A | build | `npx @servicenow/sdk build` | ⬜ pending |
| 04-02-02 | 02 | 1 | BREW-01 (nav entry) | — | N/A | manual | Brew tab navigates to BrewView placeholder | ⬜ pending |
| 04-03-01 | 03 | 2 | BREW-01 (method chips) | — | method value sent as ChoiceColumn key not display label | build + manual | `npx @servicenow/sdk build`; 7 chips render at 390px | ⬜ pending |
| 04-03-02 | 03 | 2 | BREW-05 (bean picker) | T-sysid-injection | sysId validated before URL interpolation | build + manual | `npx @servicenow/sdk build`; beans load from active list | ⬜ pending |
| 04-03-03 | 03 | 2 | BREW-06 (dose/water/grind) | — | N/A | manual | Values persist in form state and saved on record | ⬜ pending |
| 04-03-04 | 03 | 2 | BREW-07 (live ratio) | — | ratio NOT stored as column | manual | Ratio label updates on every dose/water keystroke | ⬜ pending |
| 04-03-05 | 03 | 2 | BREW-04 (timer) | — | interval cleared on unmount (no phantom updates) | manual | Timer counts up; Stop freezes; navigate away resets | ⬜ pending |
| 04-03-06 | 03 | 2 | PLAT-03 (≤6 above fold) | — | N/A | manual | ≤6 fields visible at 390px width without scrolling | ⬜ pending |
| 04-04-01 | 04 | 3 | BREW-02 (preset auto-fill) | — | bean NOT populated from preset (bean-agnostic) | manual | Pick preset → method/equipment/dose/water/grind fill; bean unchanged | ⬜ pending |
| 04-04-02 | 04 | 3 | BREW-03 (use last) | — | recipe sysId NOT copied from last brew | manual | Use last → method/bean/dose/water/grind fill; timer/rating/notes blank | ⬜ pending |
| 04-04-03 | 04 | 3 | BREW-08 (rating) | — | rating is optional (nullable); deselect works | manual | Tap rating; re-tap deselects; submit without rating succeeds | ⬜ pending |
| 04-04-04 | 04 | 3 | BREW-09 (taste notes) | — | N/A | manual | Notes textarea saves to brew_log.taste_notes | ⬜ pending |
| 04-04-05 | 04 | 3 | BREW-01 (submit) | T-csrf | X-UserToken g_ck header present on POST | manual | Submit brew; record appears in brew_log table; inventory decrements | ⬜ pending |
| 04-05-01 | 05 | 4 | RECIPE-01 (save-as-preset) | — | bean and taste_notes NOT copied to preset | manual | Save as preset → recipe record has no bean field; RecipeSection shows new preset | ⬜ pending |
| 04-05-02 | 05 | 4 | All UAT | T-acl-non-admin | Non-admin submit succeeds; non-role user gets 403 | manual | Full UAT checklist with aibrew_user account | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

No new test framework required. Existing `npx @servicenow/sdk build` covers all automated validation for this phase.

*Existing infrastructure covers all automated phase requirements. All functional behaviors require manual UAT on live instance.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Method chip row — 7 chips scroll, tap selects/deselects | BREW-01 | No automated UI test framework in project | Open BrewView at 390px width; verify 7 method chips in horizontal scroll row; tap each to select; re-tap to deselect |
| Live ratio updates on dose/water change | BREW-07 | Render-time computation; no unit tests | Enter dose 18, water 300; verify label shows `1:16.7`; change water to 360; verify label updates to `1:20.0` |
| Timer runs, stops, resets on navigate | BREW-04 | Component state; no test framework | Start timer; verify increment; Stop; verify value frozen; navigate to Catalog and back; verify timer reset to 0:00 |
| Preset auto-fill fills correct fields only | BREW-02 | Complex state interaction | Select preset; verify method/equipment/dose/water/grind fill; verify bean picker unchanged |
| "Use last" hidden before first brew | BREW-03 | State-dependent UI visibility | On fresh instance (no brew records): verify "Use last" button not visible in preset strip |
| ≤6 fields above fold at 390px | PLAT-03 | Visual layout check | Open BrewView in Chrome DevTools at 390px width; count visible interactive fields above scroll point; must be ≤6 |
| Inventory depletes after brew submit | INV-02 (Phase 2 integration) | Cross-phase integration | Log brew with bean X (50g dose); navigate to BeanSection; verify stock bar decremented by 50g |
| Save-as-preset excludes bean and taste_notes | RECIPE-01 | Field exclusion logic | Submit brew with bean selected and taste notes; tap "Save as preset"; save; navigate to RecipeSection; verify new preset has no bean field and no taste_notes |
| Non-admin user can submit brew | PLAT-02 | ACL correctness; invisible to admin | Log out admin; log in as aibrew_user; submit a brew; verify success (no 403) |

---

## Threat Map (ASVS L1)

| Threat | STRIDE | Mitigation | Verified By |
|--------|--------|------------|-------------|
| sysId path injection in brew_log/recipe URLs | Tampering | `SYS_ID_RE.test(id)` before any URL interpolation | Code review in plan 04-04 |
| CSRF / unauthorized POST | Spoofing | `X-UserToken: g_ck` header on all mutating fetches; g_ck guard returns early if missing | Code review in plan 04-04 |
| Missing ACL → non-admin 403 on brew create | Elevation of Privilege | 4 ACLs (read/write/create/delete) with `[aibrew_user]` role | UAT 04-05-02 with non-admin account |
| Storing computed ratio as column | Data Integrity | ratio never stored; BREW-07 locked; no ratio column in schema | Schema review in 04-01-01 |
| grind_size stored as string (type mismatch) | Integrity | IntegerColumn enforced in brew-log.now.ts; SDK build validates | Build: 04-01-01 |

---

## Validation Sign-Off

- [ ] All tasks have automated build verification or documented manual UAT steps
- [ ] Sampling continuity: `npx @servicenow/sdk build` after every task (build tasks); manual UAT after every plan
- [ ] Wave 0: no new framework required — existing SDK build covers automated needs
- [ ] No watch-mode flags (SDK build is one-shot, not watch mode)
- [ ] Feedback latency: ~60s for build check; live instance check after install
- [ ] `nyquist_compliant: true` — set after UAT sign-off

**Approval:** pending
