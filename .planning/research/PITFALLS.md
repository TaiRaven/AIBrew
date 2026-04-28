# Pitfalls Research — AIBrew

**Domain:** Mobile coffee brew logging, ServiceNow Fluent scoped app
**Researched:** 2026-04-28
**Confidence note:** WebSearch, WebFetch, and Bash tool execution were blocked during this research session. Findings are drawn from training knowledge (cutoff August 2025) covering ServiceNow Fluent/now-sdk, scoped app development patterns, and personal logging app UX analysis. Platform pitfalls are MEDIUM confidence; domain pitfalls are MEDIUM–HIGH based on well-documented UX anti-patterns in the personal logging app category.

---

## Domain Pitfalls (Coffee App)

### Pitfall D1: The "Log Everything" Form Trap
**What goes wrong:** The initial brew log form expands to 12+ fields because every variable feels important. At the counter, mid-brew, the user abandons it after two sessions.
**Why it happens:** Developers model for completeness; users need speed. The counter moment is the worst possible context for a long form — timer is running, hands may be wet, attention is split.
**Consequences:** App goes unused. No data = no patterns. The core value proposition ("log in under 60 seconds") collapses.
**Prevention:**
- Enforce a "required at log time" vs "optional / fill later" split in the data model from day one.
- Required: method, bean, dose, water weight, rating. Optional: grind size (pre-filled from recipe), taste notes (fill after drinking).
- Design the happy path as: select recipe preset → confirm or tweak one value → submit. Target 3–4 taps.
**Detection:** If the new brew form has more than 6 visible fields in its default state, you're heading here.

---

### Pitfall D2: Rigid Schema for Grind Size
**What goes wrong:** Grind size is stored as a free-text string ("medium-fine", "17 clicks", "800µm"). Queries and pattern analysis become string comparisons that can never be meaningful.
**Why it happens:** Grind size is inherently grinder-specific and unitless without context. Developers defer the modelling problem by using a string.
**Consequences:** Pattern analysis across sessions is impossible. Two records with "medium" and "medium-fine" are unrelated to the system even if the user means the same thing. Filtering by grind is useless.
**Prevention:**
- Store grind size as an integer (click count or numeric setting) relative to a specific grinder (equipment record).
- Each equipment record should carry a grind range (min/max) so the UI can render a slider instead of free text.
- Accept that grind size is only comparable within the same grinder — model accordingly.
**Detection:** Any grind size field typed as String/Text in the table definition is a warning sign.

---

### Pitfall D3: Pattern Analysis Users Want vs What Gets Built
**What goes wrong:** Developer builds a dashboard of averages (average rating per method, average dose per bean). User opens it, sees numbers, learns nothing actionable.
**Why it happens:** Averages are easy to compute. What users actually want is: "What combination of variables produced my best results?" and "Is my consistency getting better or worse?"
**Consequences:** Pattern analysis feature goes unused; user reverts to just logging without reviewing.
**What users actually want (from comparable personal logging app research):**
1. "My last 5 espressos with Ethiopian beans were all rated 4+ — what did they have in common?" (intersection analysis, not average)
2. "My score trend over the last 30 days" (time-series consistency, not point-in-time stats)
3. "Which variable changed on my two worst sessions this week?" (anomaly detection relative to their own baseline)
**Prevention:**
- Design the data model to support session-over-session comparison from the start: every brew record must have a reference to the recipe used (not just copied field values).
- Defer advanced analytics to a later phase; deliver "recent sessions by rating" first to validate what insight the user actually reaches for.
- Avoid building aggregate stats until you have at least 20 real brew records to query — fabricated demo data will mislead design decisions.
**Detection:** If pattern analysis is planned before 20+ real brews exist, it will be built for a dataset that doesn't reflect real usage.

---

### Pitfall D4: Inventory Negative Stock and Deletion Cascade
**What goes wrong:** A brew is deleted (user made a logging mistake). The inventory auto-deduct already fired. Now the bean shows more grams consumed than the corrected log count would imply — stock goes negative or is permanently inaccurate.
**Why it happens:** Auto-deduction is designed as a one-way trigger (insert → deduct). No compensating transaction on delete or update.
**Consequences:** Bean inventory figures become untrustworthy. User stops relying on low-stock alerts because the numbers are wrong.
**Prevention:**
- Model inventory as a ledger, not a balance: every brew record carries the grams consumed at log time; current stock is always computed as `purchased - sum(consumed)`. Never store a mutable "current_grams" field that gets updated in place.
- Deletion or correction of a brew record automatically corrects the derived stock because the sum re-computes.
- A brew "edit" that changes dose must re-derive the consumed figure; if stored as a ledger entry, this is just updating one row.
**Detection:** Any table design with a `current_stock_grams` field that is written by a brew-insert trigger (rather than computed from brew records) will hit this.

---

### Pitfall D5: Bean "Roast Date" Drift and Stale Inventory Records
**What goes wrong:** The user buys a new bag of the same bean from the same roaster. The existing bean catalog record is reused, and the roast date is updated in place. All historical brews now reference a bean record whose roast date is wrong for those sessions.
**Why it happens:** Users treat the bean catalog as "beans I have" not "beans I have ever had." The temporal dimension is invisible until you try to analyse whether fresher roast dates correlate with better ratings.
**Consequences:** Any roast-date-based analysis is corrupted. Pattern analysis answers "what did my current beans look like" not "what did I actually brew with."
**Prevention:**
- Each purchase of a bean is a new record (purchase event) linked to a bean type (roaster + origin + process). The bean type record is immutable; the purchase record carries roast date and quantity.
- Think of it as: `bean_type` (stable) → `bean_purchase` (roast date, grams bought, date purchased) → `brew_session` (references the purchase).
- This is the correct 3-table model, and it is also the right inventory model (stock lives on the purchase record, not the type record).
**Detection:** If a single bean record holds both the roast date and the running stock total, this pitfall is already baked in.

---

### Pitfall D6: Equipment Deletion Breaking Historical Brews
**What goes wrong:** User retires a grinder, deletes it from the equipment catalog. All brew records that referenced it now have a broken foreign key. Filtering "all brews made with grinder X" returns nothing or errors.
**Why it happens:** Equipment feels like a configuration list; the instinct is to clean it up when it's no longer used.
**Consequences:** Historical brew data is silently corrupted. Pattern analysis that includes equipment as a variable becomes unreliable.
**Prevention:**
- Equipment records should never be hard-deleted. Add an `active` boolean; inactive equipment is hidden from the "new brew" picker but still exists for historical record integrity.
- The same pattern applies to roasters and bean types.
**Detection:** Any "delete" action on catalog/reference records with no soft-delete mechanism is a red flag.

---

## Platform Pitfalls (ServiceNow Fluent)

### Pitfall P1: Writing Business Logic in Client-Side Fluent Components
**What goes wrong:** Inventory deduction logic, grind range validation, or rating computations are written as JavaScript inside Fluent UI component state handlers. They work in the browser but cannot be called from any other context (API, scheduled jobs, future integrations).
**Why it happens:** Client-side is the path of least resistance in a Fluent app — the data is already loaded, the component handles the event.
**Consequences:** When a server-side trigger is needed (e.g., a future "log brew via Siri Shortcut" or a scheduled low-stock notification), the logic must be re-implemented. Two divergent implementations of the same rule will produce inconsistent data.
**Prevention:**
- All write operations that affect data integrity (inventory deduction, recipe snapshot on brew log) must live in a scoped Server Script or Business Rule, not in component JavaScript.
- Fluent components dispatch actions; server-side scripts enforce rules. Treat the client as view-only for business logic.
**Detection:** If the component's `actionHandlers` directly computes and writes derived values to multiple tables, the logic has leaked to the client.

---

### Pitfall P2: Scoped App Cross-Scope Table Access Failures
**What goes wrong:** The app tries to read from a ServiceNow base table (e.g., `sys_user`, `cmdb_ci`) or a table in another scoped app without an explicit cross-scope access policy. The query silently returns no rows or throws an access error that surfaces as an empty UI component.
**Why it happens:** Scoped apps have an implicit "deny" posture for cross-scope reads unless the owning scope grants explicit access. This is invisible during development if the developer's user has admin rights (admin bypasses scope checks by default).
**Consequences:** The app works for the developer and fails for a normal user. This class of bug is hard to reproduce without switching to a non-admin account to test.
**Prevention:**
- For AIBrew (single user, solo developer) this is lower risk, but the pattern still applies: never assume admin-time test results reflect runtime behaviour.
- All tables the app reads/writes should be tables owned by the app's scope. Avoid reading `sys_user` for user lookup; for a single-user app this is unnecessary anyway.
- Test with a non-admin account before declaring any feature complete.
**Detection:** Features that work in developer testing but produce empty results or 403s for a test non-admin account are cross-scope access failures.

---

### Pitfall P3: Update Set Scope Contamination
**What goes wrong:** A developer makes changes while a global or wrong-scope update set is active. Those changes are captured in the wrong update set and the wrong scope. Deployment to another instance (e.g., production or a colleague's PDI) is incomplete or broken.
**Why it happens:** ServiceNow makes it easy to forget which update set is active. The UI indicator is small and easy to miss, especially when switching contexts.
**Consequences:** Missing artifacts on deployment. Debugging deployment failures is time-consuming and the root cause is non-obvious.
**Prevention:**
- Before any development session, verify the active update set is the correct scoped app update set.
- Use a naming convention that includes the app scope prefix: `x_aibrew_<milestone>_<date>`.
- For now-sdk Fluent apps, the `sdk deploy` command packages the app, but any manually created server-side artifacts (Business Rules, Script Includes) must be in the correct update set.
- Automate: after `sdk init`, immediately create and activate the scoped update set before touching anything else.
**Detection:** If a deploy to a second instance is missing Business Rules or Script Includes that exist on the source, update set scope contamination is the likely cause.

---

### Pitfall P4: now-sdk Build Output Not Matching Instance Expectations (Zurich)
**What goes wrong:** The local `sdk build` succeeds but the deployed app renders incorrectly or specific component APIs are unavailable at runtime on the Zurich instance. Version mismatch between the local SDK and the target instance release.
**Why it happens:** The now-sdk is versioned independently of ServiceNow releases. A newer local SDK may generate output that references APIs only available in later releases, or uses component prop shapes that changed between Washington/Xanadu/Zurich.
**Consequences:** UI breakage that only manifests on the instance, not in local `sdk develop` preview. The local preview runs against a mock server that may be more permissive.
**Prevention:**
- Pin the now-sdk version in `package.json` to the version documented as compatible with Zurich. Do not auto-upgrade SDK dependencies without checking the release compatibility matrix.
- After every `sdk deploy`, do a smoke test on the actual instance — do not rely solely on local preview.
- Check the ServiceNow Developer portal for the Zurich-compatible SDK version before `npm install`.
**Detection:** Components that render in `sdk develop` but are blank or throw console errors on the instance indicate an SDK/instance version mismatch.

---

### Pitfall P5: Mobile UI — Touch Target and Viewport Assumptions
**What goes wrong:** The brew log form is designed against a desktop browser during development. Input fields are too small, tap targets are below 44px, the form requires horizontal scrolling on 375px-wide phones, or a date/time picker opens a modal that overflows the viewport.
**Why it happens:** `sdk develop` defaults to a desktop browser viewport. Developers reach for the browser's device simulation mode inconsistently.
**Consequences:** At the counter moment (the most important UX moment in the entire app), the UI is frustrating. The user abandons the log and the core value proposition fails.
**Prevention:**
- Set the browser device simulation to iPhone SE (375×667) from day one. Never design in desktop width.
- All interactive elements must have a minimum tap target of 44×44px (Apple HIG standard, also Google Material standard).
- Fluent/now-sdk component defaults may not meet this; always inspect and override padding where necessary.
- Avoid modals for the primary brew logging flow. Prefer in-page flows or bottom sheets. Modals are especially bad on mobile because the keyboard pushes them off-screen on small viewports.
- Test with iOS Safari (not just Chrome DevTools) — viewport behaviour, input focus, and keyboard-triggered layout shifts differ meaningfully.
**Detection:** Any form field with height below 44px, or any "new brew" flow that requires a modal before the first field is reached, is a mobile UX failure.

---

### Pitfall P6: Storing Derived Values Instead of Computing Them
**What goes wrong:** "Brew ratio" (water / dose), "days since roast", or "current bean stock" are stored as fields that get written on each brew insert. When source data is corrected, the derived fields are stale and incorrect.
**Why it happens:** Derived fields feel efficient (no re-computation on read), and ServiceNow Business Rules make it easy to write them on insert/update.
**Consequences:** Data integrity violations. A corrected dose does not update the stored ratio. The current stock figure diverges from the ledger sum (see Pitfall D4). Analysis results are wrong.
**Prevention:**
- Do not store any value that can be exactly computed from other fields in the same or related tables.
- Brew ratio: compute in the UI component or in a Display Business Rule — never persist.
- Days since roast: always compute from roast_date at read time — never persist.
- Bean stock: compute as `SUM(brew_session.dose_g WHERE bean_purchase = X)` subtracted from purchase quantity — never maintain a running total.
- The only exception: if a computation is expensive and the source data is immutable (e.g., a statistical aggregate over a completed month), a cached/materialized value is acceptable — but flag it explicitly in comments as a cache, not a source of truth.
**Detection:** Any Business Rule with Action = "insert OR update" that writes a calculated numeric field to another table is a candidate for this pitfall.

---

### Pitfall P7: GlideRecord Query Performance on Mobile Networks
**What goes wrong:** The brew history page issues 4–5 separate GlideRecord queries (sessions, beans, equipment, recipes, roasters) as sequential server-side calls. On a mobile network with 150ms+ RTT, the page takes 3–5 seconds to load.
**Why it happens:** Each related table feels like a natural separate query. The N+1 query pattern (one query for sessions, then one per session to get bean name) emerges naturally without deliberate design against it.
**Consequences:** The history view, which is the second most-used screen after logging, becomes sluggish. Pattern analysis queries on top of this become unusable.
**Prevention:**
- Use dot-walking in GlideRecord to pull related fields in a single query: `gr.bean_purchase.bean_type.name` resolved in one query rather than three.
- For the brew history list, query only the fields needed for the list view (not all fields on every related record).
- Implement pagination from day one — do not load all brew records. ServiceNow's GlideRecord `setLimit` + `chooseWindow` is the mechanism.
- Cache reference data (bean types, equipment) in component state after first load rather than re-fetching on every navigation.
**Detection:** Any list page that issues more than 2 server-side calls before rendering is likely hitting N+1 query problems.

---

### Pitfall P8: now-sdk `sdk deploy` Overwriting Manual Instance Changes
**What goes wrong:** A bug is fixed directly on the ServiceNow instance (editing a Script Include in the platform UI). Then `sdk deploy` runs and overwrites those changes with the last-built version from the local repo. The fix is lost.
**Why it happens:** The now-sdk treats the local codebase as the source of truth. The deploy is not a merge — it is a replace.
**Consequences:** Fixes disappear silently. If the developer doesn't notice before moving on, the bug reappears in production.
**Prevention:**
- Never make code changes directly on the instance for artifacts managed by now-sdk. All code lives in the local repo; the instance is a deployment target, not an editor.
- If an emergency fix must be made on the instance, immediately copy it back to the local repo and commit before running any further SDK commands.
- Establish the rule: local repo = source of truth. Instance = deployed artefact. No exceptions.
**Detection:** If you have ever edited a Script Include or UI script directly in the ServiceNow platform UI for an SDK-managed app, you are at risk of this pitfall.

---

### Pitfall P9: Scoped App ACL Gaps on Custom Tables
**What goes wrong:** Custom tables (brew_session, bean_purchase, etc.) are created in the scoped app but no ACLs are explicitly defined. The app works because the developer's admin role bypasses ACL checks. On a shared PDI or if user roles are tightened, all records become inaccessible.
**Why it happens:** ACL authoring is easy to defer ("I'll add security later"). In a single-user app the risk feels low.
**Consequences:** Even for a single-user app, if the ServiceNow instance enforces role-based access (as most PDIs do by default after a certain release), undefined ACLs can default to deny depending on instance security settings.
**Prevention:**
- For each custom table, explicitly define at minimum: read ACL (role = the app's user role or `public` for a truly single-user context), write ACL (same), and delete ACL (restricted).
- Create a single custom role (e.g., `x_aibrew.user`) and assign it during app setup. All ACLs reference this role.
- Test ACL coverage by logging in as a user with only the custom role (not admin) before any phase is considered complete.
**Detection:** Any custom table with zero ACL records defined in the app scope is an ACL gap.

---

## Prevention Strategies

| Pitfall | Build Phase to Address | Prevention Strategy |
|---------|----------------------|---------------------|
| D1 — Form overload | Phase 1 (brew log MVP) | Enforce "required vs optional" split in first design session; count taps in the happy path before writing a line of code |
| D2 — Grind size as string | Phase 1 (data model) | Define grind size as Integer, linked to equipment record, from table creation |
| D3 — Analytics mismatch | Phase 3+ (pattern analysis) | Build analytics only after 20+ real brews; start with raw session list sorted by rating, not aggregates |
| D4 — Inventory negative stock | Phase 2 (inventory) | Implement ledger model (sum of brew records) from the start; never use a mutable stock field |
| D5 — Roast date drift | Phase 2 (bean catalog) | Design 3-table model (bean_type, bean_purchase, brew_session) before writing any catalog UI |
| D6 — Equipment deletion | Phase 2 (equipment catalog) | Add `active` boolean to all catalog tables in initial schema; wire soft-delete before hard-delete UI |
| P1 — Logic in client | Phase 1 onwards | Establish rule at project start: all writes go through server-side scripts; no business logic in actionHandlers |
| P2 — Cross-scope access | All phases | Test each feature with a non-admin account before marking done |
| P3 — Update set contamination | Phase 1, day 1 | Create and activate scoped update set before first development action; name it with scope prefix |
| P4 — SDK version mismatch | Phase 1, setup | Pin SDK version in package.json on day one; document the Zurich-compatible version |
| P5 — Mobile viewport | All UI phases | Set browser device sim to 375px from day one; test on real device before each phase sign-off |
| P6 — Derived field storage | Phase 1 (data model) | Audit every computed value during schema design; mark as "never persist" in table notes |
| P7 — N+1 queries | Phase 1 (history view) | Design query patterns with dot-walking; add pagination before first history page ships |
| P8 — Deploy overwrites instance edits | All phases | No exceptions rule: never edit SDK-managed code on the instance directly |
| P9 — ACL gaps | Phase 1 (scoped app setup) | Define custom role and ACLs for every custom table before first deploy to shared instance |

---

## Warning Signs

### Red flags visible during design

- New brew form has more than 6 visible fields in its default state → Pitfall D1
- Grind size field is typed as Text/String in the schema → Pitfall D2
- Bean catalog table has a `current_stock_grams` column that gets written by a trigger → Pitfall D4
- Bean catalog stores roast date on the same record as running stock → Pitfall D5
- Equipment catalog has a hard-delete action with no soft-delete mechanism → Pitfall D6
- Any Business Rule writes a computed numeric result to a different table → Pitfall P6

### Red flags visible during development

- The "new brew" happy path requires more than 4 taps on a 375px screen → Pitfall D1 / P5
- GlideRecord queries appear inside Fluent component `actionHandlers` for write operations → Pitfall P1
- The active update set shown in the instance header is "Default" or a global set → Pitfall P3
- The brew history page issues more than 2 GlideRecord calls before rendering → Pitfall P7
- Any Script Include or Business Rule was last modified directly on the instance → Pitfall P8

### Red flags visible during testing

- Feature works for admin user, returns empty results or errors for non-admin → Pitfall P2 / P9
- Correcting a brew record's dose does not correct the displayed bean stock → Pitfall D4 / P6
- Deleting a brew record changes bean stock in an unexpected direction → Pitfall D4
- Historical brews show incorrect bean metadata after updating a bean record → Pitfall D5
- UI renders correctly in `sdk develop` but is blank on the actual Zurich instance → Pitfall P4
- Any interactive element is hard to tap accurately on an iPhone SE → Pitfall P5

---

*Confidence: Domain pitfalls (D1–D6) MEDIUM–HIGH based on documented UX patterns in personal logging apps and coffee-specific community knowledge. Platform pitfalls (P1–P9) MEDIUM based on ServiceNow scoped app development knowledge from training data (August 2025); recommend validating P4 (SDK version) against the current Zurich developer documentation before SDK installation.*
