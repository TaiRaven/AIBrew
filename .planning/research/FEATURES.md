# Features Research — AIBrew

**Domain:** Personal coffee brew logging, single-user mobile
**Researched:** 2026-04-28
**Confidence note:** WebSearch and WebFetch were unavailable for this session. Findings draw from training knowledge of Brewlog, Coffee Diary, Acaia apps, Barista (by Steuard Jensen), Brewer, and the specialty coffee community's well-documented feature conventions. Confidence is MEDIUM overall — patterns are stable and well-established, but specific UI implementation details should be validated against current App Store listings before building.

---

## Table Stakes

Features users expect. Absence makes an app feel unfinished or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Brew method selection | Every app has this; it gates what other fields are relevant | Low | Espresso, pour over, French press, AeroPress, moka, cold brew, etc. Drives field visibility logic |
| Dose (coffee in, grams) | The foundational brew variable — nothing meaningful without it | Low | Always numeric; should default to last-used value |
| Water/yield weight (grams) | Required to calculate ratio; universally logged | Low | Espresso tracks yield (output); filter tracks water in |
| Brew ratio display | Users want to see ratio, not just raw weights — they think in ratios | Low | Calculated field from dose + water/yield |
| Grind size | Second most important dial; users obsess over it | Low | Freeform number or named scale; no universal standard |
| Brew time | Timer or manual entry; essential for espresso and immersion methods | Medium | Timer integration makes this genuinely useful vs. tedious |
| Bean selection | Which bean was used; links to catalog | Low | Must be a linked pick, not freeform text |
| Taste rating | Star or numeric score — the output variable everything else correlates against | Low | 1–5 or 1–10 scale; no consensus, pick one and stay consistent |
| Taste notes / tasting text | Free-form impressions — sourness, bitterness, balance, aroma | Low | Freeform works; flavor wheel tags are differentiating |
| Date and time | Automatic from system clock; user should never type this | Low | Critical for trend analysis |
| Brew history list | Reverse-chronological list of all logged brews | Low | The primary "proof the app works" screen |
| Edit / delete a logged brew | Users make mistakes; immutable logs are a dealbreaker | Low | Essential but often forgotten in v1 planning |
| Bean catalog (basic) | Name, roaster, roast level — minimum to make bean selection meaningful | Low | Even the simplest apps have this |
| Equipment catalog (basic) | At minimum: grinder and brewer. Without this, grind size has no context | Low | Freeform list is acceptable for v1 |

---

## Differentiators

Features that separate highly-rated apps from mediocre ones. Not universally expected, but clearly valued.

| Feature | Value Proposition | Complexity | Build in v1? |
|---------|-------------------|------------|--------------|
| Saved recipe presets | Fastest possible counter logging — tap a recipe, tweak one variable, save | Medium | YES — core to the 60-second goal |
| Auto-populate from last brew | "Repeat last session" or "use last values for this bean" — reduces entry to only what changed | Low | YES — biggest friction reducer |
| Bean inventory tracking with auto-deduction | Eliminates a separate mental accounting task; rare in coffee apps | Medium | YES — differentiating and already scoped |
| Low stock alert / flag | Closes the loop on inventory; users discover they're out while brewing | Low | YES — low effort, high utility |
| Brew timer built into log flow | Eliminates switching apps mid-brew; keeps all data in one place | Medium | Consider for v1; simple countdown/stopwatch |
| Roast date + days-off-roast tracking | Specialty coffee community cares deeply about freshness windows | Low | YES — adds metadata that matters to target user |
| Pattern analysis: score vs. variable | The stated core goal; charts or tables showing which grind/ratio correlates with best scores | High | Phase 2 — data must exist before analysis is useful |
| Consistency view: score trend over time | Shows improvement or drift; motivating for a home barista | Medium | Phase 2 |
| Flavor wheel / tag-based tasting notes | Structured tasting vocab; faster than freeform; enables cross-brew comparison | Medium | Defer to v2; freeform is fine for v1 |
| Per-bean performance summary | "This bean's best parameters were X" — aggregated from all brews with that bean | Medium | Phase 2 |
| Method-specific field sets | Show bloom time for pour over, pre-infusion for espresso, steep time for French press — not all methods need all fields | Medium | Phase 2 polish, but design for it from day one |
| Water temperature logging | Matters for some methods (AeroPress, pour over) — ignored for espresso | Low | Optional field, low cost to add |
| Photo attachment | Some users want a photo of the puck or bloom; most don't use it | Medium | Anti-feature for v1 (see below) |

---

## Anti-Features for v1

Things that sound useful but add complexity without proportionate early value. Defer or permanently exclude.

| Anti-Feature | Why Avoid in v1 | What to Do Instead |
|--------------|-----------------|-------------------|
| Photo / image attachment | High storage cost, complex UI, rarely viewed after upload, ServiceNow platform not optimised for image storage at this scale | Freeform tasting notes cover the same reflection need |
| Flavor wheel (interactive tasting wheel) | Beautiful when done right; tedious and slow when not — directly conflicts with the 60-second logging goal | Freeform text + optional simple tags in v2 |
| Social / sharing | Already out of scope; worth explicitly flagging as never-v1 | Single-user only |
| Brew timer with step-by-step guidance (blooming, pouring stages) | Becomes a recipe coach app, not a log app — different product entirely | Simple stopwatch if timer is added at all |
| External scale integration (Bluetooth, Acaia, Felicita) | Complex BLE pairing, platform permissions, device-specific bugs; Acaia's own app handles this | Manual weight entry; potential v3 stretch goal |
| Barcode scanning for beans | Specialty roasters don't have standard barcodes; coverage is too thin to be reliable | Manual entry from roaster catalog |
| AI-generated tasting suggestions | Premature — need data first; adds LLM dependency and latency to a speed-critical flow | Run pattern analysis on actual logged data first |
| Cloud sync / backup | Single user, ServiceNow platform persists data natively; adds auth/API surface | Trust the platform; add export in v2 if needed |
| Brew cost calculator | Requires price-per-gram tracking; niche utility for home user | Out of scope |
| Subscription / IAP gating | Not applicable for a personal ServiceNow scoped app | N/A |

---

## Quick-Entry UX Patterns

How top apps handle fast mobile logging. These are the patterns that make or break the 60-second goal.

**Pattern 1: Last-session defaults everywhere**
The single highest-leverage UX decision. On opening a new brew log, pre-fill every field with the values from the most recent brew using the same method (or last brew overall). The user only changes what's different. Brewlog and Coffee Diary both do this. Without it, every brew is a full re-entry.

**Pattern 2: Recipe preset as the entry point**
Instead of "new brew" → blank form, the primary CTA is "start from a recipe." The preset fills in bean, dose, ratio, grind, equipment. User confirms or tweaks. This reduces entry to 1–3 taps for repeat recipes.

**Pattern 3: Progressive disclosure of optional fields**
Show the 5–6 most-used fields first (method, bean, dose, yield, grind, rating). Hide temperature, notes, water quality, etc. behind "more options." Users who want detail can find it; counter users aren't slowed down.

**Pattern 4: Thumb-zone tap targets for numeric fields**
Grind size and weights are adjusted constantly. Stepper buttons (+/–) on large tap targets work better than keyboard-up numeric inputs for small adjustments. Keyboard entry should still be possible for large jumps.

**Pattern 5: Rating at the end, not the start**
Rating a brew you haven't finished is meaningless. The best apps show rating as the final step, often after a "how did it taste?" prompt that also captures notes. This natural ordering also means partially-completed entries (if the app crashes mid-brew) still have useful data.

**Pattern 6: One-tap bean switch**
The most common mid-session change is switching which bean was used. This should be a large, prominent picker — not buried in a form. Opening the bean picker should show the last 3–5 used beans at the top before the full catalog.

**Pattern 7: Immediate save with edit-later**
Don't make the user complete all fields before saving. Save immediately on "done" with whatever is filled in, and allow editing from the history list. This prevents data loss when brewing demands attention.

**Pattern 8: Built-in timer that doesn't block the form**
If a timer is included, it should run in the background while the user fills in other fields — not gate them in a timer screen. A persistent banner showing elapsed time is the right pattern.

---

## Pattern Analysis Patterns

How apps present trends and insights. Based on conventions in Brewlog, Brewer, and specialty coffee community tools.

**What works:**

- **Score vs. grind size scatter plot (per bean or per method):** The most actionable chart in the space. Shows the grind size range where scores cluster highest. Requires at least 8–10 brews with a given bean to be meaningful.
- **Score trend line (chronological):** Simple line chart of rating over time. Motivating when improving; useful for spotting drift. Works even with few data points.
- **Bean comparison table:** Side-by-side averages (mean score, mean dose, most common grind) for each bean. Useful once 3+ beans have been logged.
- **Best brew highlight:** "Your best [espresso / pour over] was: [parameters]" — surfaces the single highest-rated session. Easy to build; high perceived value.
- **Consistency metric:** Standard deviation of scores over the last N brews for a given method. Low deviation = consistent. Simple to calculate; compelling to display.

**What doesn't work (avoid):**

- Multi-variable regression charts: Too abstract for most users; requires enough data to be meaningful; hard to explain.
- Automatic suggestions ("try grinding finer"): Requires ML confidence that doesn't exist at personal-use data volumes (typically under 200 brews per year). High chance of bad advice.
- Day-of-week or time-of-day analysis: Sounds interesting; almost never actionable for a home barista with consistent morning routines.
- Raw data export as the "analysis" feature: Users want insight, not a CSV. Export is a utility feature, not an analysis feature.

**Minimum data requirement before analysis is useful:** approximately 15–20 logged brews with consistent bean and method selection. Design the empty state carefully — show a progress prompt ("Log 5 more espresso brews to unlock your first pattern") rather than blank charts.

---

## Feature Complexity Notes

Which features are deceptively complex to implement well.

**Grind size field — simple to build, hard to make useful**
Grind size has no universal scale. "18" means something different on a Comandante, a Baratza Encore, and a Niche Zero. Apps that ignore this produce useless cross-grinder comparisons. The correct approach: store grind size as a number scoped to a specific grinder (from the equipment catalog). This means grind size is only comparable within a single grinder's history. Do this from day one; retrofitting it later requires migrating all existing records.

**Inventory auto-deduction — straightforward logic, complex edge cases**
The basic path (log brew, deduct dose grams from bean's remaining_grams) is simple. Edge cases that emerge: what if remaining_grams goes negative? What if a brew is edited after logging? What if a brew is deleted? What if the user adds more of a bean mid-bag? Each of these needs a defined behaviour, or inventory becomes untrustworthy and users stop using it.

**Recipe presets — easy to create, hard to maintain**
Users create presets eagerly and abandon them quickly if the preset doesn't update when they improve a recipe. The key question: when a user logs a brew that differs from a preset, should they be prompted to update the preset? Most apps ignore this; users end up with stale presets and duplicate entries. Design a clear "update preset from this brew" action.

**Pattern analysis — the data model must be right from day one**
Analysis is not a feature you add later onto an existing data model. If brew records don't consistently capture numeric grind size, numeric dose, numeric yield, and a numeric rating, no meaningful analysis is possible. The logging UI must enforce structured capture of at least these five fields. Freeform text in numeric fields (e.g., "medium-fine") kills analysis. Consider validation at entry time.

**Brew timer integration — more complex than it appears**
A simple stopwatch is easy. A timer that runs while the phone screen is off, survives app background states in a ServiceNow Fluent context, and reliably records the elapsed time requires understanding the platform's background execution model. This is worth a feasibility spike before committing to v1 timer support.

**Method-specific fields — requires conditional form logic**
Espresso needs pre-infusion time and yield weight. Pour over needs bloom time and pour stages. French press needs steep time. If the form shows all fields for all methods, it looks overwhelming. Conditional visibility based on method selection is medium complexity but essential for the app to feel polished. Plan the data schema to accommodate all fields from the start even if the UI only shows relevant ones.

---

## Sources

- Training knowledge of Brewlog (iOS), Coffee Diary (iOS), Barista by Steuard Jensen, Brewer (iOS), Acaia Lunar app feature sets — MEDIUM confidence (stable, well-documented patterns; not verified against current App Store listings due to tool unavailability)
- Specialty coffee community conventions (r/espresso, Home Barista forum, James Hoffmann methodology) — MEDIUM confidence
- General mobile logging app UX patterns — HIGH confidence (widely validated across domains)
- WebSearch and WebFetch unavailable for this session — no live verification performed
