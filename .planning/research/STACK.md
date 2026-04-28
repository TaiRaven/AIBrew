# Stack Research — AIBrew

## Recommended Data Model

Five physical tables in scope `x_snc_aibrew` (or user-chosen scope prefix):

| Table name | Purpose |
|---|---|
| `x_snc_aibrew_roaster` | Roaster catalog (name, website, notes) |
| `x_snc_aibrew_bean` | Bean catalog (name, origin, roast level, roast date, reference to roaster) |
| `x_snc_aibrew_equipment` | Grinders and brewers (name, type choice field) |
| `x_snc_aibrew_recipe` | Saved presets (name, method, dose, water, grind size, reference to bean + equipment) |
| `x_snc_aibrew_brew_log` | Core log entry (references bean, equipment×2, recipe; dose, water, grind, time, notes, rating) |
| `x_snc_aibrew_bean_purchase` | Inventory ledger (reference to bean, grams purchased, purchase date) |

**Inventory design — ledger, not counter.** Do NOT store `current_stock_grams` as a mutable column. Instead:
- `bean_purchase` records accumulate total purchased grams
- Each `brew_log` row has `dose_grams` (grams consumed)
- Remaining stock = `SUM(bean_purchase.grams)` − `SUM(brew_log.dose_grams WHERE bean = X)`, computed live via `GlideAggregate` in a ScriptInclude

This makes inventory correct-by-construction. Deleting or editing a brew automatically corrects the balance.

### Column Types to Import

```typescript
import {
  Table, StringColumn, IntegerColumn, DecimalColumn, FloatColumn,
  ReferenceColumn, DateColumn, ChoiceColumn, BooleanColumn,
  DurationColumn, MultiLineTextColumn
} from '@servicenow/sdk/core'
```

Key choices per table:
- Roast level → `ChoiceColumn` with values: `light`, `medium_light`, `medium`, `medium_dark`, `dark`
- Brew method → `ChoiceColumn`: `pour_over`, `espresso`, `french_press`, `aeropress`, `moka_pot`, `cold_brew`, `other`
- Equipment type → `ChoiceColumn`: `grinder`, `brewer`
- Rating → `IntegerColumn` with `min: 1, max: 10`
- Grind size → `IntegerColumn` (unitless; relative to grinder)
- Dose / water / grams purchased → `DecimalColumn`
- Brew time → `DurationColumn`
- Taste notes → `MultiLineTextColumn`

## UI Component Recommendations

**Framework:** React 18.2.0 + `@servicenow/react-components`. Never use raw HTML elements.

| Use case | Component |
|---|---|
| List of brew logs / beans / equipment | `NowRecordListConnected` |
| View / edit any single record | `RecordProvider` + `FormColumnLayout` + `FormActionBar` |
| Create new record | `RecordProvider sysId="-1"` + `FormColumnLayout` |
| Buttons | `Button`, `ButtonIconic` |
| Modals (dirty-state warnings, confirms) | `Modal` |
| Tabs within a single view | `Tabs` + `Tab` |
| Cards / panels | `Card`, `CardHeader` |
| Dropdown pickers (non-record) | `Select` |

**Navigation:** URLSearchParams SPA pattern — `?view=list`, `?view=detail&id=<sysId>`, `?view=create`. Each logical view gets its own URL. Listen to `popstate` for browser back/forward.

**Polaris iframe detection (always implement):**
```javascript
if (window.self !== window.top) {
  window.CustomEvent.fireTop("magellanNavigator.permalink.set", { relativePath, title })
} else {
  window.history.pushState({}, "", path)
  document.title = title
}
```

**Array.from polyfill (every index.html, inline, before module script):** The `//` and `//]]>` CDATA wrappers are required in ServiceNow HTML pages to prevent Jelly mangling `<` and `&&` operators. Omitting them causes a blank page.

**Mobile UX priorities:** Tap targets ≥ 44px; use `@servicenow/react-components` defaults (they meet this). Favour vertical stacked layouts over side-by-side grids for phone width. Quick-log form: 6 fields max visible without scroll.

## SDK Skills & Build Pipeline

```bash
# One-time setup
npx @servicenow/sdk init --appName "AIBrew" --packageName "aibrew" --scopeName "x_snc_aibrew" --template base
npm install

# Auth
npx now-sdk auth --add <instance-url> --type basic

# Development loop
npx @servicenow/sdk build      # compile + validate fluent
npx @servicenow/sdk install    # push to instance
```

### Relevant Fluent artifact types

| Artifact | SDK import | Use |
|---|---|---|
| `Table` | `@servicenow/sdk/core` | Define tables + columns |
| `BusinessRule` | `@servicenow/sdk/core` | Server trigger on brew insert (low-stock flag) |
| `ScriptInclude` | `@servicenow/sdk/core` | `BeanStockCalculator` server library |
| `UiPage` | `@servicenow/sdk/core` | Each custom React page |
| `ApplicationMenu` | `@servicenow/sdk/core` | App navigator entry |
| `RestApi` | `@servicenow/sdk/core` | Scripted REST endpoints for computed stock + analytics |
| `Acl` | `@servicenow/sdk/core` | Table-level access control (verify with non-admin user) |
| `Role` | `@servicenow/sdk/core` | Custom app role |
| `Record` | `@servicenow/sdk/core` | Seed / demo data |

**Project structure:**
```
src/
  fluent/
    tables/
      roaster.now.ts
      bean.now.ts
      equipment.now.ts
      recipe.now.ts
      brew-log.now.ts
      bean-purchase.now.ts
    business-rules/
      brew-log-deduct-stock.now.ts
    script-includes/
      bean-stock-calculator.now.ts
    rest-apis/
      aibrew-api.now.ts
    ui-pages/
      brew-log-page.now.ts
      bean-page.now.ts
      ...
    roles/
      aibrew-user.now.ts
    acls/
      ...
  server/
    bean-stock-calculator.js
    analytics.js
  client/
    index.html
    main.tsx
    app.tsx
    utils/fields.ts
    components/
    services/
```

**Node.js requirement:** 20+ (LTS). Check with `node --version` before starting.

**SDK version:** `@servicenow/sdk` ≥ 4.6.0 required for `explain` command. Run `npx @servicenow/sdk --version` to confirm. SDK 4.2+ required for UI Pages.

## Platform Features Available from a Scoped Fluent App

| Feature | Available | Notes |
|---|---|---|
| Custom React UI Pages | ✓ | Primary UI layer for AIBrew |
| GlideRecord / GlideAggregate in server scripts | ✓ | Used for stock computation |
| Scripted REST API | ✓ | Bridge for computed/aggregate data the Table API can't serve |
| Email notifications | ✓ | Usable for low-stock alerts if desired |
| Business Rules (before/after/async) | ✓ | Post-brew inventory flag |
| Automated Test Framework | ✓ | Server-side test coverage |
| Native ServiceNow reporting | Partial | Not mobile-optimised; can't embed in Fluent page — use in-app React charts instead |
| Flows / Flow Designer | ✓ | Optional for complex automations; overkill for v1 |
| AI / LLM (sn_generative_ai.LLMClient) | ✓ | Available if AI tasting notes are desired later |

## What NOT to Use

| Pattern | Why |
|---|---|
| Service Portal / Jelly / UI Builder | This is a Fluent app; those are different paradigms |
| Global scope | All artifacts must be scoped |
| Raw `<button>`, `<input>`, `<select>` in React | Use `@servicenow/react-components` equivalents |
| Hash-based routing (`#/path`) | Always use URLSearchParams |
| Manual `fetch()` + `.map()` for record lists | Use `NowRecordListConnected` |
| Standalone `<input>` for ServiceNow record fields | Use `RecordProvider` + `FormColumnLayout` |
| Mutable stock counter column | Use ledger sum — see Inventory design above |
| Webpack / Vite build configs | SDK handles the build system |
| CSS Modules or `@import` in CSS | ESM `import "./file.css"` only |

## Confidence Notes

- Table API, BusinessRule, and UiPage patterns: **HIGH** — directly confirmed from SDK docs in this session
- ScriptInclude + GlideAggregate in scoped context on Zurich: **MEDIUM** — standard platform capability but not directly SDK-doc-confirmed; verify with `npx @servicenow/sdk explain scriptinclude-api`
- RestApi (Scripted REST) Fluent declaration syntax: **MEDIUM** — verify with `npx @servicenow/sdk explain restapi-api` before implementing
- Scope prefix: `x_snc_aibrew` is a placeholder — must match what `sdk init` assigns based on instance company code (`glide.appcreator.company.code`)
