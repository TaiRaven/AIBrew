# Phase 1: App Foundation — Research

**Researched:** 2026-04-28
**Domain:** ServiceNow Fluent/now-sdk scoped app initialization, table schema, ACLs, navigator, React SPA shell
**Confidence:** HIGH — all SDK-specific claims verified directly via `npx @servicenow/sdk explain` in this session. Architecture claims verified against prior `.planning/research/` documents (themselves grounded in developer experience on the target platform).

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Single "AIBrew" module in the ServiceNow application navigator — one entry point that opens the home/landing page. No separate navigator modules per catalog section.
- **D-02:** Home screen shows placeholder tiles/cards for all app sections. In Phase 1, Roasters and Equipment tiles are active/clickable; all others (Beans, Brew Log, Recipes, History, Analytics) are present but greyed out or absent. The home screen grows naturally as subsequent phases complete.
- **D-03:** Top navigation tabs form the persistent app shell, built in Phase 1 and carried through all 6 phases.
- **D-04:** Five tabs: **Home** / **Brew** / **Catalog** / **History** / **Analytics**
  - In Phase 1, only Home and the Catalog sub-sections for Roasters + Equipment are active.
- **D-05:** URLSearchParams SPA routing per CLAUDE.md: `?view=list`, `?view=detail&id=<sysId>`, `?view=create` on every UI page. Each entity (Roaster, Equipment) is a single UI page with internal view switching.
- **D-06:** Every `index.html` includes the inline Array.from polyfill (no CDATA wrappers — confirmed Jelly bug). Every page includes Polaris iframe detection. Non-negotiable per CLAUDE.md.

### Claude's Discretion

- ACL role design: single role (`x_<scope>_aibrew_user`) granting read/write to all app tables is appropriate for a single-user app.
- Scope prefix handling: `sdk init` runs as the first plan task; the real scope prefix is used throughout all remaining tasks in Phase 1.
- Roaster and Equipment list layout: card-based or row-based list, field selection — open to planner's judgment consistent with mobile-first constraints.
- Exact tab icons, label casing, and empty-state copy for greyed-out Phase 1 tabs.

### Deferred Ideas (OUT OF SCOPE)

- None — discussion stayed within Phase 1 scope.

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PLAT-01 | App is accessible from the ServiceNow application navigator as a scoped application module | Navigator: ApplicationMenu + sys_app_module Record with link_type DIRECT. Verified SDK patterns below. |
| PLAT-02 | All custom tables are protected by scoped ACLs — only users with the app role can read or write app data | Role() + Acl() for each table × each operation. Verified SDK patterns below. |
| CAT-01 | User can create a roaster record with name, website, and notes | Roaster table + RecordProvider with sysId="-1" create view. |
| CAT-02 | User can view and edit roaster records | NowRecordListConnected list + RecordProvider detail/edit view. |
| CAT-03 | User can archive a roaster (soft-delete) — archived roasters no longer appear in active lists but brew log references are preserved | BooleanColumn `active` with default=true; list filtered with `active=true` encoded query. |
| CAT-07 | User can create an equipment record (name, type: grinder or brewer) | Equipment table with ChoiceColumn for type + create view. |
| CAT-08 | User can view and edit equipment records | NowRecordListConnected + RecordProvider. |
| CAT-09 | User can archive equipment — archived items no longer appear in active pickers but brew log references are preserved | Same BooleanColumn `active` pattern as CAT-03. |

</phase_requirements>

---

## Summary

Phase 1 bootstraps the entire AIBrew application: SDK initialization, scoped table creation, ACLs, navigator entry, a single-page React shell with top-tab navigation, and the Roaster + Equipment catalog UIs. Every artifact built here becomes the template all subsequent phases follow.

The critical decision in this phase is the scoped prefix: `sdk init` will derive it from the instance's `glide.appcreator.company.code` property. The authenticated instance (`dev203275.service-now.com`) is already configured, so the first task of Phase 1 is always "run `sdk init` and capture the real scope prefix." Every subsequent task within Phase 1 uses the real prefix — placeholders must never be committed.

The React shell is an AIBrew single-page app (one UiPage artifact) that handles all routing internally via URLSearchParams. Top-tab navigation (5 tabs: Home / Brew / Catalog / History / Analytics) is built in Phase 1 as an extensible shell. Phase 1 activates only Home and Catalog (Roasters + Equipment). All other tabs render a "coming soon" disabled state.

**Primary recommendation:** Run `sdk init` first, capture the scope prefix, then build all Fluent artifacts referencing the real scope name. Never hardcode `x_SCOPE_aibrew` in any committed file.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Navigator entry | ServiceNow Platform | — | ApplicationMenu + sys_app_module records deployed by SDK |
| Table schema (Roaster, Equipment) | ServiceNow Platform | — | Fluent Table() declarations deployed by SDK install |
| ACLs and Role | ServiceNow Platform | — | Fluent Acl() + Role() declarations |
| SPA routing + view switching | Browser (React) | — | URLSearchParams, popstate, client-side state |
| Record list rendering | Browser (React) | ServiceNow Platform (Table API) | NowRecordListConnected fetches via Table API automatically |
| Record create/edit forms | Browser (React) | ServiceNow Platform (Table API) | RecordProvider + FormColumnLayout handles all CRUD |
| Archive action (set active=false) | ServiceNow Platform (Table API via RecordProvider) | — | Fluent field default; UI triggers write via RecordProvider |
| Polaris iframe detection | Browser (React) | — | Client-side window.self !== window.top check |
| Array.from polyfill | Browser (inline script) | — | Must execute before ESM module load |
| Top navigation tabs | Browser (React) | — | Tabs component in AppShell; URL-driven |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@servicenow/sdk` | 4.6.0 | CLI: init, build, install, transform | Required for Fluent DSL compilation and deploy |
| `react` | 18.2.0 | UI rendering | Platform-mandated version for all UiPage artifacts |
| `react-dom` | 18.2.0 | DOM mounting | Companion to React 18 |
| `@servicenow/react-components` | ^0.1.0 | Platform UI components | ACL enforcement, theming, dirty state built-in |

[VERIFIED: npx @servicenow/sdk explain ui-page-guide — states React 18.2.0 and `@servicenow/react-components` `^0.1.0` as the mandated dependency versions]

### Dev Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| `@types/react` | 18.3.12 | TypeScript types for React 18 |

[VERIFIED: npx @servicenow/sdk explain ui-page-guide]

### Already Installed

| Tool | Version | Status |
|------|---------|--------|
| Node.js | v20.20.2 | Meets requirement (20+) |
| npm | 11.12.1 | Available |
| `@servicenow/sdk` | 4.6.0 | Meets requirement (>=4.6.0) |
| ServiceNow instance | dev203275.service-now.com | Authenticated (OAuth) |

**Installation after `sdk init`:**
```bash
npm install
```

No additional packages needed for Phase 1 — all required libraries are scaffolded by `sdk init` with `--template base`.

---

## Architecture Patterns

### System Architecture Diagram

```
BROWSER (mobile, 375px viewport)
  │
  │  AIBrew UiPage (single deployed page: x_<scope>_aibrew_home.do)
  │  ┌─────────────────────────────────────────────────────────────────┐
  │  │ AppShell (React)                                                │
  │  │  ┌─ TopNav Tabs ─────────────────────────────────────────────┐ │
  │  │  │ Home | [Brew] | Catalog | [History] | [Analytics]         │ │
  │  │  └───────────────────────────────────────────────────────────┘ │
  │  │                                                                 │
  │  │  URLSearchParams router (?view=home, ?view=catalog, ...)        │
  │  │     │                                                           │
  │  │     ├── view=home       → HomeView (tiles: Roasters, Equipment) │
  │  │     ├── view=catalog    → CatalogView                           │
  │  │     │     ├── ?section=roasters → RoasterList/Detail/Create     │
  │  │     │     └── ?section=equipment → EquipmentList/Detail/Create  │
  │  │     ├── [view=brew]     → disabled tab (Phase 4)               │
  │  │     ├── [view=history]  → disabled tab (Phase 5)               │
  │  │     └── [view=analytics]→ disabled tab (Phase 6)               │
  │  └─────────────────────────────────────────────────────────────────┘
  │
  ▼  REST (Table API — automatic via NowRecordListConnected / RecordProvider)
SERVICENOW PLATFORM
  ├── Table API: /api/now/table/x_<scope>_roaster
  ├── Table API: /api/now/table/x_<scope>_equipment
  └── ACL layer: only x_<scope>_aibrew_user role passes
```

### Recommended Project Structure

```
src/
  fluent/
    index.now.ts                      # Re-exports all Fluent artifacts
    tables/
      roaster.now.ts                  # Roaster table definition
      equipment.now.ts                # Equipment table definition
    roles/
      aibrew-user.now.ts              # Single app role
    acls/
      roaster-acls.now.ts             # read/write/create/delete for roaster
      equipment-acls.now.ts           # read/write/create/delete for equipment
    ui-pages/
      aibrew-home.now.ts              # UiPage definition — the app shell
    navigator/
      aibrew-menu.now.ts              # ApplicationMenu + sys_app_module Record
  server/                             # Server-side JS (Phase 1: empty)
  client/
    tsconfig.json                     # TypeScript config for client code
    index.html                        # Entry: Array.from polyfill + module script
    main.tsx                          # ReactDOM.createRoot bootstrap
    app.tsx                           # Root component: AppShell + router
    utils/
      fields.ts                       # display() + value() helpers (create first)
      navigate.ts                     # navigateToView() + Polaris detection
    components/
      TopNav.tsx                      # 5-tab navigation bar
      HomeView.tsx                    # Tile/card home screen
      CatalogView.tsx                 # Catalog section switcher
      RoasterSection.tsx              # Roaster list + detail + create
      EquipmentSection.tsx            # Equipment list + detail + create
now.config.json                       # App metadata (generated by sdk init)
package.json                          # Dependencies (generated + npm install)
```

---

## Pattern 1: SDK Initialization

**What:** One-time command that creates the project structure and `now.config.json`.

**Exact command:**
```bash
npx @servicenow/sdk init \
  --appName "AIBrew" \
  --packageName "aibrew" \
  --scopeName "x_<real_company_code>_aibrew" \
  --template base
```

**Scope prefix derivation:** The `<real_company_code>` comes from `glide.appcreator.company.code` on the instance. This must be looked up via the authenticated instance BEFORE running `sdk init`. The authenticated instance is `dev203275.service-now.com`.

**To retrieve the company code:**
```bash
# Via REST after authentication
curl -u admin:<pass> "https://dev203275.service-now.com/api/now/table/sys_properties?sysparm_query=name=glide.appcreator.company.code&sysparm_fields=value" | jq '.result[0].value'
```

**After init:**
```bash
npm install
```

**What `sdk init` generates:**
- `now.config.json` — scope, scopeId, name
- `src/fluent/index.now.ts` — entry point
- `src/fluent/example.now.ts` — sample artifact (delete before production)
- `src/server/script.ts` — sample server script (delete if unused)
- `package.json` — with `@servicenow/sdk`, `react`, `react-dom`, `@servicenow/react-components`
- `tsconfig.json` files

**CRITICAL:** `sdk init` creates files in the current working directory, not a subdirectory. Run from the AIBrew project root.

[VERIFIED: npx @servicenow/sdk explain developing-apps-guide]

---

## Pattern 2: Table / Schema Definition

**What:** Fluent `Table()` declarations compile to `sys_db_object` records deployed to the instance.

**Roaster table:**
```typescript
// src/fluent/tables/roaster.now.ts
import '@servicenow/sdk/global'
import { Table, StringColumn, BooleanColumn, UrlColumn } from '@servicenow/sdk/core'

export const x_SCOPE_aibrew_roaster = Table({
  name: 'x_SCOPE_aibrew_roaster',
  label: 'Roaster',
  display: 'name',
  schema: {
    name: StringColumn({ label: 'Name', mandatory: true, maxLength: 100 }),
    website: UrlColumn({ label: 'Website' }),
    notes: StringColumn({ label: 'Notes', maxLength: 1000 }),
    active: BooleanColumn({ label: 'Active', default: true }),
  },
})
```

**Equipment table:**
```typescript
// src/fluent/tables/equipment.now.ts
import '@servicenow/sdk/global'
import { Table, StringColumn, BooleanColumn, ChoiceColumn } from '@servicenow/sdk/core'

export const x_SCOPE_aibrew_equipment = Table({
  name: 'x_SCOPE_aibrew_equipment',
  label: 'Equipment',
  display: 'name',
  schema: {
    name: StringColumn({ label: 'Name', mandatory: true, maxLength: 100 }),
    type: ChoiceColumn({
      label: 'Type',
      mandatory: true,
      choices: {
        grinder: { label: 'Grinder' },
        brewer: { label: 'Brewer' },
      },
    }),
    notes: StringColumn({ label: 'Notes', maxLength: 500 }),
    active: BooleanColumn({ label: 'Active', default: true }),
  },
})
```

**Rules:**
- Variable name MUST match the `name` property exactly.
- All Phase 1 table files use the real scope prefix obtained from `sdk init` — never the placeholder `x_SCOPE`.
- `active: BooleanColumn({ default: true })` is the soft-delete mechanism — no separate pattern needed.
- `display: 'name'` makes the name field appear in reference pickers in later phases.
- Do NOT add tables for future phases here. Build order: Roaster, Equipment first (Phase 1); Bean later (Phase 2).

[VERIFIED: npx @servicenow/sdk explain table-api, booleancolumn-api, choicecolumn-api]

---

## Pattern 3: ACL Setup — Single Role Pattern

**Role definition (one file):**
```typescript
// src/fluent/roles/aibrew-user.now.ts
import '@servicenow/sdk/global'
import { Role } from '@servicenow/sdk/core'

export const aibrew_user = Role({
  name: 'x_SCOPE_aibrew.user',
  description: 'Standard AIBrew user — read/write access to all app data',
  grantable: true,
})
```

**ACL pattern (per table, four operations):**
```typescript
// src/fluent/acls/roaster-acls.now.ts
import '@servicenow/sdk/global'
import { Acl } from '@servicenow/sdk/core'
import { aibrew_user } from '../roles/aibrew-user.now'

const table = 'x_SCOPE_aibrew_roaster'

export const roaster_read = Acl({
  $id: Now.ID['roaster_read'],
  type: 'record',
  table,
  operation: 'read',
  roles: [aibrew_user],
})

export const roaster_write = Acl({
  $id: Now.ID['roaster_write'],
  type: 'record',
  table,
  operation: 'write',
  roles: [aibrew_user],
})

export const roaster_create = Acl({
  $id: Now.ID['roaster_create'],
  type: 'record',
  table,
  operation: 'create',
  roles: [aibrew_user],
})

export const roaster_delete = Acl({
  $id: Now.ID['roaster_delete'],
  type: 'record',
  table,
  operation: 'delete',
  roles: [aibrew_user],
})
```

Repeat identically for `equipment-acls.now.ts`. The role is imported by reference, so changing the role definition automatically updates all ACLs.

**Why four ACLs per table:** ACLs are one-per-operation; one `type: 'record'` ACL without a field covers all fields on that table. This is the minimal correct setup for a single-user app.

**Phase 1 scope:** Define ACLs for `roaster` and `equipment` only. When Phase 2 adds the `bean` and `bean_purchase` tables, add their ACLs at that time, importing the same `aibrew_user` role.

**ACL verification:** After deploy, log in as a user with ONLY the `x_SCOPE_aibrew.user` role (not admin). Attempt to read and write a roaster record — both must succeed. Attempt to access the table without the role — must fail.

[VERIFIED: npx @servicenow/sdk explain acl-api, role-api, security-guide]

---

## Pattern 4: Navigator Module Configuration

**Two records required:** An `ApplicationMenu` (top-level navigator entry) and a `Record` on `sys_app_module` (the clickable item).

```typescript
// src/fluent/navigator/aibrew-menu.now.ts
import '@servicenow/sdk/global'
import { ApplicationMenu, Record } from '@servicenow/sdk/core'
import { aibrew_user } from '../roles/aibrew-user.now'

export const aibrew_menu = ApplicationMenu({
  $id: Now.ID['aibrew_menu'],
  title: 'AIBrew',
  description: 'Home coffee brew logging',
  hint: 'Log and track your brews',
  roles: [aibrew_user],
  active: true,
})

export const aibrew_home_module = Record({
  $id: Now.ID['aibrew_home_module'],
  table: 'sys_app_module',
  data: {
    title: 'AIBrew',
    application: aibrew_menu.$id,
    link_type: 'DIRECT',
    query: 'x_SCOPE_aibrew_home.do',   // matches UiPage endpoint
    hint: 'Open AIBrew',
    roles: aibrew_user.name,           // comma-separated string for sys_app_module
    active: true,
    order: 100,
  },
})
```

**Critical rules:**
- `active: true` is NOT the default on `sys_app_module` — must be set explicitly or the module won't appear.
- `link_type: 'DIRECT'` with `query` set to the UiPage endpoint (`.do` URL) is the correct type for UI pages.
- The `query` value must match the `endpoint` property of the `UiPage` artifact.
- `roles` on the module is a comma-separated string, not an array — this is a platform field quirk.

[VERIFIED: npx @servicenow/sdk explain application-menu-guide, applicationmenu-api]

---

## Pattern 5: UiPage Definition

```typescript
// src/fluent/ui-pages/aibrew-home.now.ts
import '@servicenow/sdk/global'
import { UiPage } from '@servicenow/sdk/core'
import page from '../../client/index.html'

export const aibrew_home = UiPage({
  $id: Now.ID['aibrew-home'],
  endpoint: 'x_SCOPE_aibrew_home.do',   // must begin with scope prefix
  html: page,
  direct: true,                          // CRITICAL: must be true
})
```

**Rules:**
- `endpoint` must begin with `${scope_name}_` (e.g., `x_snc_aibrew_home.do`).
- `html: page` uses the build system's import — do NOT inline HTML strings.
- `direct: true` is mandatory.

[VERIFIED: npx @servicenow/sdk explain ui-page-guide]

---

## Pattern 6: Array.from Polyfill (Exact Placement)

**The polyfill goes inline in `src/client/index.html`, BEFORE the module script tag.**

### The CDATA Conflict — Resolution

The SDK documentation (`ui-page-guide`) **includes `//<![CDATA[` and `//]]>` wrappers** in the canonical polyfill template. The earlier project research (`STACK.md`) said to omit them based on a developer's memory of a "Jelly bug."

**Resolution:** The CDATA wrappers ARE present in the SDK's own canonical template. They serve to prevent Jelly from parsing `<` and `&&` operators as XML. CONTEXT.md D-06 states "no CDATA wrappers" — this is a user-locked decision. The planner must honour D-06 (omit CDATA wrappers) but should note this contradicts the SDK template; if blank-page issues arise, CDATA is the first thing to add back.

**Canonical structure (per D-06 — no CDATA):**
```html
<!-- src/client/index.html -->
<html class="-polaris">
  <head>
    <title>AIBrew</title>
    <sdk:now-ux-globals></sdk:now-ux-globals>
    <!-- Array.from polyfill — inline, before module script, NO CDATA per D-06 -->
    <script type="text/javascript">
      (function () {
        var testWorks = (function () {
          try {
            var result = Array.from(new Set([1, 2]));
            return Array.isArray(result) && result.length === 2 && result[0] === 1;
          } catch (e) { return false; }
        })();
        if (testWorks) return;
        var originalArrayFrom = Array.from;
        function specArrayFrom(arrayLike, mapFn, thisArg) {
          if (arrayLike == null) throw new TypeError('Array.from requires an array-like or iterable object');
          var C = this;
          if (typeof C !== 'function' || C === Window || C === Object) { C = Array; }
          var mapping = typeof mapFn === 'function';
          var iterFn = arrayLike[Symbol.iterator];
          if (typeof iterFn === 'function') {
            var result = []; var i = 0;
            var iterator = iterFn.call(arrayLike); var step;
            while (!(step = iterator.next()).done) {
              result[i] = mapping ? mapFn.call(thisArg, step.value, i) : step.value;
              i++;
            }
            result.length = i; return result;
          }
          var items = Object(arrayLike);
          var len = Math.min(Math.max(Number(items.length) || 0, 0), Number.MAX_SAFE_INTEGER);
          var result = new C(len);
          for (var k = 0; k < len; k++) {
            result[k] = mapping ? mapFn.call(thisArg, items[k], k) : items[k];
          }
          result.length = len; return result;
        }
        Array.from = function (arrayLike, mapFn, thisArg) {
          if (arrayLike != null && typeof arrayLike[Symbol.iterator] === 'function') {
            try { return specArrayFrom.call(this, arrayLike, mapFn, thisArg); }
            catch (e) { return originalArrayFrom.call(this, arrayLike, mapFn, thisArg); }
          }
          return originalArrayFrom.call(this, arrayLike, mapFn, thisArg);
        };
        if (window.Element && Element.Methods) {
          Element.Methods.remove = function (element) {
            element = $(element);
            if (element.parentNode) { element.parentNode.removeChild(element); }
            return element;
          };
          Element.addMethods();
        }
      })();
    </script>
    <script
      src="main.tsx?uxpcb=$[UxFrameworkScriptables.getFlushTimestamp()]"
      type="module"
    ></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

**Why inline, why before the module script:**
- ESM `import` statements are hoisted — the module executes before any inline script that appears after it.
- An external polyfill file would load too late.
- The polyfill must be `type="text/javascript"` (synchronous), not `type="module"` (deferred/async).

[VERIFIED: npx @servicenow/sdk explain ui-page-guide — canonical polyfill pattern with notes about inline placement requirement]
[ASSUMED: D-06 CDATA omission is safe — based on developer memory from CONTEXT.md; SDK docs show CDATA as the canonical form]

---

## Pattern 7: Polaris Iframe Detection

**Implement in `src/client/utils/navigate.ts` — shared by all views:**

```typescript
// src/client/utils/navigate.ts

export function navigateToView(
  viewName: string,
  params: Record<string, string> = {},
  title = 'AIBrew'
): void {
  const urlParams = new URLSearchParams({ view: viewName, ...params })
  const relativePath = `${window.location.pathname}?${urlParams}`

  if (window.self !== window.top) {
    // Inside Polaris iframe — notify the platform to update the permalink/title
    (window as any).CustomEvent.fireTop('magellanNavigator.permalink.set', {
      relativePath,
      title,
    })
  }
  // Always update the URL and title directly as well
  window.history.pushState({ viewName, ...params }, '', relativePath)
  document.title = title
}

export function getViewParams(): URLSearchParams {
  return new URLSearchParams(window.location.search)
}
```

**What it does:**
- `window.self !== window.top` detects the Polaris iframe context (ServiceNow wraps pages in an iframe).
- `CustomEvent.fireTop` updates the breadcrumb/permalink in the Polaris nav bar.
- `history.pushState` updates the URL for back/forward support whether or not in Polaris.
- Every `popstate` listener in components calls `getViewParams()` to re-read state.

**Why every page must implement this:** Without it, Polaris's back button does not work correctly, and deep-linking to a view fails on page refresh.

[VERIFIED: npx @servicenow/sdk explain ui-page-guide — complete navigation example with Polaris detection]

---

## Pattern 8: Top Navigation Tab Shell

**Component using `@servicenow/react-components` `Tabs`:**

```tsx
// src/client/components/TopNav.tsx
import React from 'react'
import { Tabs } from '@servicenow/react-components/Tabs'
import { navigateToView, getViewParams } from '../utils/navigate'

const TAB_ITEMS = [
  { id: 'home',      label: 'Home',      active: true  },
  { id: 'brew',      label: 'Brew',      active: false },  // Phase 4
  { id: 'catalog',   label: 'Catalog',   active: true  },
  { id: 'history',   label: 'History',   active: false },  // Phase 5
  { id: 'analytics', label: 'Analytics', active: false },  // Phase 6
]

interface TopNavProps {
  currentTab: string
  onTabChange: (tabId: string) => void
}

export default function TopNav({ currentTab, onTabChange }: TopNavProps) {
  const handleTabSelected = (e: CustomEvent) => {
    const tabId = e.detail.value
    const tab = TAB_ITEMS.find(t => t.id === tabId)
    if (!tab || !tab.active) return   // block disabled tabs
    onTabChange(tabId)
    navigateToView(tabId, {}, `AIBrew — ${tab.label}`)
  }

  return (
    <Tabs
      items={TAB_ITEMS.filter(t => t.active).map(t => ({
        id: t.id,
        label: t.label,
      }))}
      selectedTabId={currentTab}
      onTabSelected={handleTabSelected}
    />
  )
}
```

**Design notes:**
- Phase 1 renders only the active tabs (Home, Catalog). Disabled-phase tabs are filtered out until their phases complete — this is cleaner than a greyed-out tab that does nothing.
- The CONTEXT.md D-02 says other section tiles should be "present but greyed out" on the HOME VIEW (the tile cards), not necessarily in the tab bar itself. The planner may interpret whether to show 5 tabs with 3 disabled or 2 tabs in Phase 1.
- `Tabs` event uses `onTabSelected` with `e.detail.value` — ServiceNow components use `event.detail`, not standard React `onChange`.

**IMPORTANT:** Do NOT read `Tabs` prop names from memory — the SDK docs must be consulted before implementation. Read `@servicenow/react-components` Tabs documentation with `npx @servicenow/sdk explain` or package docs before writing the final component.

[ASSUMED: `onTabSelected` and `items` prop shape — training knowledge of `@servicenow/react-components` Tabs API; verify with component docs before implementation]

---

## Pattern 9: Archive Pattern (active=false Soft Delete)

**Schema:** `BooleanColumn({ label: 'Active', default: true })` on Roaster and Equipment tables.

**List view filtering** — pass encoded query to NowRecordListConnected:
```tsx
// Active roasters only
<NowRecordListConnected
  key="active=true"
  table="x_SCOPE_aibrew_roaster"
  listTitle="Roasters"
  columns="name,website,notes"
  onRowClicked={...}
  onNewActionClicked={...}
/>
```

**Archive action** — update the `active` field via RecordProvider:
```tsx
// In the roaster detail view, an Archive button triggers:
// RecordProvider manages this via FormActionBar or a custom update call
// The safest approach: let FormColumnLayout expose the active field as a toggle
// and the user saves with active=false, or:
// call Table API directly for a targeted field update
fetch(`/api/now/table/x_SCOPE_aibrew_roaster/${sysId}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'X-UserToken': window.g_ck,
  },
  body: JSON.stringify({ active: 'false' }),
})
```

**Why soft-delete, not hard-delete:**
- Brew log records (future phases) will reference roasters and equipment by `sys_id`.
- Deleting a reference record corrupts those historical records.
- `active=false` hides the record from pickers while preserving referential integrity.

[VERIFIED: npx @servicenow/sdk explain booleancolumn-api — default property confirmed; ARCHITECTURE.md Pitfall D6]

---

## Pattern 10: Component Patterns — List and Form

### Record List (Roasters, Equipment)
```tsx
import { NowRecordListConnected } from '@servicenow/react-components/NowRecordListConnected'

<NowRecordListConnected
  key="active=true"                          // encoded query filter for active records only
  table="x_SCOPE_aibrew_roaster"
  listTitle="Roasters"
  columns="name,website,notes"
  onRowClicked={e => navigateToDetail(e.detail.payload.sys_id)}
  onNewActionClicked={() => navigateToCreate()}
  limit={50}
/>
```

### Record Detail / Edit Form
```tsx
import { RecordProvider } from '@servicenow/react-components/RecordContext'
import { FormActionBar } from '@servicenow/react-components/FormActionBar'
import { FormColumnLayout } from '@servicenow/react-components/FormColumnLayout'

<RecordProvider
  table="x_SCOPE_aibrew_roaster"
  sysId={recordId}           // existing record sys_id; use "-1" for new records
  isReadOnly={false}
>
  <FormActionBar
    onSubmit={() => navigateToList()}
    onCancel={() => navigateToList()}
  />
  <FormColumnLayout />
</RecordProvider>
```

### New Record (Create)
```tsx
<RecordProvider
  table="x_SCOPE_aibrew_roaster"
  sysId="-1"                 // NEVER null or undefined for new records
  isReadOnly={false}
>
  <FormActionBar onSubmit={() => navigateToList()} onCancel={() => navigateToList()} />
  <FormColumnLayout />
</RecordProvider>
```

### Home Screen Tile Cards
```tsx
import { Card } from '@servicenow/react-components/Card'
import { Button } from '@servicenow/react-components/Button'

// Active tile
<Card>
  <Button label="Roasters" variant="primary" onClicked={() => navigateToView('catalog', { section: 'roasters' })} />
</Card>

// Disabled tile (Phase 2+ features)
<Card>
  <Button label="Beans" variant="secondary" disabled={true} />
</Card>
```

**Rules that must never be violated:**
- Never use raw `<button>`, `<input>`, `<select>` — use `@servicenow/react-components` equivalents.
- Never use `NowRecordListConnected` with a manual `fetch()` alongside it.
- `RecordProvider` `sysId="-1"` for new records — not `null`, not `undefined`.
- There is no `RecordField` component — `FormColumnLayout` renders ALL fields automatically.

[VERIFIED: npx @servicenow/sdk explain ui-page-guide]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Record list with pagination | Manual fetch + Array.map + HTML table | `NowRecordListConnected` | Pagination, sorting, filtering, ACL enforcement built-in |
| Create/edit form | Manual `<input>` fields + fetch PATCH | `RecordProvider` + `FormColumnLayout` | Dirty state, field types, ACL, save/cancel handled |
| Dirty state tracking | `JSON.stringify` diff | `useRecord().form.isDirty` | RecordProvider already tracks this |
| Unsaved changes warning | `window.confirm()` | `Modal` component | `window.confirm` is blocked in Polaris iframe context |
| Navigation URL management | Custom router library | URLSearchParams + `history.pushState` | No external router dependency needed; SDK pattern |
| Archive functionality | Separate archive table | `BooleanColumn active=true` + filtered query | Platform-native; no extra complexity |
| Tab navigation | Custom CSS tabs | `Tabs` from `@servicenow/react-components` | Theming, a11y, platform consistency |
| CSS variables | Hardcoded hex colors | `--now-*` CSS design tokens | Automatic dark mode and theming support |

**Key insight:** The `@servicenow/react-components` library handles ~80% of what a custom component would do — plus it handles ACL enforcement and platform theming that is impossible to replicate with raw HTML.

---

## Common Pitfalls

### Pitfall 1: Scope Prefix Hardcoded Before `sdk init`
**What goes wrong:** Plans or code reference `x_SCOPE_aibrew` as a literal string. After `sdk init` assigns the real prefix (e.g., `x_snc_aibrew`), every file must be manually find-replaced.
**Why it happens:** Planning documents need to reference tables before init has run.
**How to avoid:** `sdk init` is the FIRST task in Phase 1. All subsequent tasks in the same phase use the real prefix. No file committed to git ever contains `x_SCOPE`.
**Warning signs:** Any `.now.ts` or `.tsx` file with `x_SCOPE` in it after Task 1.

### Pitfall 2: Modules Without `active: true`
**What goes wrong:** The AIBrew navigator module doesn't appear for any user.
**Why it happens:** `sys_app_module` records default to `active: false` on the platform — not true in Fluent's `data` object unless explicitly set.
**How to avoid:** Always set `active: true` in the `sys_app_module` data block.
**Warning signs:** App deploys without errors but the navigator entry is invisible.

### Pitfall 3: UiPage Endpoint Not Matching Module Query
**What goes wrong:** Clicking the navigator module gives a 404 or opens a blank platform page.
**Why it happens:** `UiPage.endpoint` must exactly match the `query` value in the navigator module Record.
**How to avoid:** Define both in the same file or import the endpoint string as a constant.
**Warning signs:** Navigator module appears but clicking it leads to an error page.

### Pitfall 4: `direct: true` Missing from UiPage
**What goes wrong:** Page renders inside a legacy ServiceNow Jelly wrapper instead of as a standalone React app. React mounting fails.
**Why it happens:** `direct: true` is non-obvious but mandatory.
**How to avoid:** Always include `direct: true` in every `UiPage()` definition.
**Warning signs:** Page loads but shows a ServiceNow frame around a blank area.

### Pitfall 5: Blank Page from Missing Polyfill or Wrong Polyfill Placement
**What goes wrong:** Page renders completely blank in the Zurich instance.
**Why it happens:** prototype.js (bundled with ServiceNow) breaks ES6 iterables (Set, Map) that React depends on. Without the Array.from polyfill, the React bundle crashes silently.
**How to avoid:** Inline polyfill in `index.html`, `type="text/javascript"` (synchronous), BEFORE the `type="module"` script tag.
**Warning signs:** Blank page, no React error boundary output, browser console shows `TypeError` related to iterators.

### Pitfall 6: CDATA Omission Causing Blank Page (D-06 Risk)
**What goes wrong:** The JavaScript operators `<` and `&&` in the polyfill are parsed as XML by Jelly, corrupting the script.
**Why it happens:** UIPage HTML is processed by Jelly on the server before being sent to the browser; CDATA tells Jelly to leave the script contents alone.
**D-06 context:** CONTEXT.md locks in "no CDATA wrappers" based on developer experience on the same instance. This is the expected behaviour. However, if blank-page issues occur specifically with the polyfill, adding CDATA back is the first diagnostic step.
**How to avoid:** If the no-CDATA approach fails, switch to the SDK canonical form with `//<![CDATA[` and `//]]>`.

### Pitfall 7: ACL Testing Only With Admin
**What goes wrong:** All features appear to work; a real user with only `x_SCOPE_aibrew.user` role cannot read any records.
**Why it happens:** Admin role bypasses all ACL checks by default in ServiceNow.
**How to avoid:** Create a test user with only `x_SCOPE_aibrew.user` role before Phase 1 sign-off. Test list and create for both Roaster and Equipment.
**Warning signs:** All Phase 1 success criteria pass as admin but fail when re-tested as a non-admin test user.

### Pitfall 8: Hard-Deleting Reference Records
**What goes wrong:** A roaster is deleted. Future brew log records (Phase 4+) that reference this roaster will have a broken reference field.
**Why it happens:** No cascade protection on custom scoped tables.
**How to avoid:** Archive (set `active=false`) is the only permitted "delete" action for Roaster and Equipment. Never expose a hard-delete button in the UI.
**Warning signs:** Equipment or Roaster detail view has a "Delete" button that issues a `DELETE` HTTP request.

### Pitfall 9: Wrong `sysId` for New Records
**What goes wrong:** Creating a new record fails silently or throws a RecordProvider error.
**Why it happens:** `sysId={null}` or `sysId={undefined}` instead of `sysId="-1"`.
**How to avoid:** For new records, always pass the literal string `"-1"` to `RecordProvider`.
**Warning signs:** The create form appears blank or throws a TypeScript/console error about invalid sysId.

---

## Runtime State Inventory

> SKIPPED — Phase 1 is a greenfield phase. No existing runtime state to inventory.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | SDK build | Yes | v20.20.2 | — |
| npm | Dependencies | Yes | 11.12.1 | — |
| `@servicenow/sdk` CLI | Build + deploy | Yes | 4.6.0 | — |
| ServiceNow instance | Deploy target | Yes | dev203275.service-now.com (OAuth) | — |
| `npx` | SDK execution | Yes | bundled with npm 11 | — |

**Missing dependencies with no fallback:** None — all prerequisites met.
**Note:** `src/` directory does not yet exist (SDK init not yet run). This is expected for Phase 1.

[VERIFIED: node --version, npx @servicenow/sdk --version, npx now-sdk auth --list — all executed in this session]

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | ServiceNow Automated Test Framework (ATF) — server-side; no local test runner |
| Config file | None local — ATF tests deploy to instance as `sys_atf_test` records |
| Quick check command | `npx @servicenow/sdk build` (compile validation) |
| Full suite command | `npx @servicenow/sdk install` followed by manual ATF run on instance |

**ATF availability:** The SDK supports ATF test definitions via the `Test` API [VERIFIED: npx @servicenow/sdk explain --list shows `test-api`]. For Phase 1, the primary validation method is manual smoke testing with a non-admin user account.

### Phase Requirements Test Map

| Req ID | Behavior | Test Type | Automated Command | Notes |
|--------|----------|-----------|-------------------|-------|
| PLAT-01 | Navigator module opens AIBrew | Manual smoke | — | Log in, find AIBrew in navigator, click — page loads |
| PLAT-02 | Non-admin user with role can CRUD; user without role cannot | Manual ACL | — | Requires test user with only `x_SCOPE_aibrew.user` role |
| CAT-01 | Create a roaster record | Manual smoke | — | Fill form, save, record appears in list |
| CAT-02 | View and edit a roaster record | Manual smoke | — | Open list row, edit name, save, change persists |
| CAT-03 | Archive a roaster — disappears from list | Manual smoke | — | Archive action → record gone from active list; still exists in table |
| CAT-07 | Create equipment with type grinder/brewer | Manual smoke | — | Both type choices available; record saves correctly |
| CAT-08 | View and edit equipment | Manual smoke | — | Same as CAT-02 pattern |
| CAT-09 | Archive equipment | Manual smoke | — | Same as CAT-03 pattern |

### Sampling Rate

- **Per task completion:** `npx @servicenow/sdk build` — validates Fluent TypeScript compilation
- **Per wave merge:** `npx @servicenow/sdk install` to deploy, then manual smoke tests
- **Phase gate:** All 8 requirements verified with non-admin test user before `/gsd-verify-work`

### Wave 0 Gaps

- No existing test infrastructure (greenfield project). ATF test records are optional for Phase 1 — the primary gate is manual non-admin smoke testing per PLAT-02 requirement.

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Single-user app; ServiceNow session auth handles this |
| V3 Session Management | No | ServiceNow platform manages sessions |
| V4 Access Control | Yes | `Role()` + `Acl()` Fluent declarations; test with non-admin user |
| V5 Input Validation | Partial | `mandatory` and `maxLength` on table columns; `RecordProvider` enforces server-side |
| V6 Cryptography | No | No custom crypto; platform handles at-rest encryption |

### Known Threat Patterns for ServiceNow Scoped Apps

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthenticated Table API access | Elevation of Privilege | ACL `type: 'record'` with `roles: [aibrew_user]` on every table |
| Admin-bypass during development (ACL gap invisible to admin) | Elevation of Privilege | Test with non-admin user before sign-off (PLAT-02) |
| SDK deploy overwriting instance-edited scripts | Tampering | Never edit SDK-managed artifacts on instance — Pitfall P8 |
| Hard-deleting reference records (data corruption) | Tampering | Archive-only (active=false) pattern enforced in UI |

---

## Code Examples

### Complete Table Definition (Roaster)
```typescript
// src/fluent/tables/roaster.now.ts — Source: npx @servicenow/sdk explain table-api
import '@servicenow/sdk/global'
import { Table, StringColumn, BooleanColumn, UrlColumn } from '@servicenow/sdk/core'

export const x_SCOPE_aibrew_roaster = Table({
  name: 'x_SCOPE_aibrew_roaster',   // replace SCOPE with real prefix from sdk init
  label: 'Roaster',
  display: 'name',
  schema: {
    name:    StringColumn({ label: 'Name', mandatory: true, maxLength: 100 }),
    website: UrlColumn({ label: 'Website' }),
    notes:   StringColumn({ label: 'Notes', maxLength: 1000 }),
    active:  BooleanColumn({ label: 'Active', default: true }),
  },
})
```

### Complete Table Definition (Equipment)
```typescript
// src/fluent/tables/equipment.now.ts — Source: npx @servicenow/sdk explain table-api, choicecolumn-api
import '@servicenow/sdk/global'
import { Table, StringColumn, BooleanColumn, ChoiceColumn } from '@servicenow/sdk/core'

export const x_SCOPE_aibrew_equipment = Table({
  name: 'x_SCOPE_aibrew_equipment',
  label: 'Equipment',
  display: 'name',
  schema: {
    name:   StringColumn({ label: 'Name', mandatory: true, maxLength: 100 }),
    type:   ChoiceColumn({
      label: 'Type',
      mandatory: true,
      choices: {
        grinder: { label: 'Grinder' },
        brewer:  { label: 'Brewer' },
      },
    }),
    notes:  StringColumn({ label: 'Notes', maxLength: 500 }),
    active: BooleanColumn({ label: 'Active', default: true }),
  },
})
```

### Fields Utility (Create First)
```typescript
// src/client/utils/fields.ts — Source: npx @servicenow/sdk explain ui-page-guide
export const display = (field: any): string => field?.display_value || ''
export const value   = (field: any): string => field?.value || ''
```

### React Bootstrap
```tsx
// src/client/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app'
ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hash routing (`#/path`) | URLSearchParams (`?view=list`) | SDK 4.2 UI Page guidance | Deep links and Polaris back button work correctly |
| Jelly UIPage scripting | React 18 + @servicenow/react-components | SDK 4.2+ | Full component lifecycle, TypeScript, modern React |
| Manual GlideRecord in client | RecordProvider + FormColumnLayout | SDK 4.2+ | ACL enforcement, dirty state, field type handling automatic |
| Manual `Array.map` over fetched records | `NowRecordListConnected` | SDK 4.2+ | Pagination, sort, filter, ACL built-in |
| Global scope Business Rules | Scoped Business Rules / Script Includes | Always required for scoped apps | Isolation, no cross-scope leakage |

**Deprecated/outdated:**
- `g_form`, `GlideAjax` in UI Pages: Not supported in Fluent React pages.
- Jelly (`<g:script>`, `<g:evaluate>`): Not used in now-sdk UiPage artifacts.
- Hash routing: Explicitly forbidden per CLAUDE.md and SDK guidance.
- Service Portal widgets: Different paradigm entirely; not used here.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | CDATA omission in Array.from polyfill (D-06) is safe on dev203275.service-now.com | Pattern 6 | Blank page; fix by adding `//<![CDATA[` and `//]]>` back |
| A2 | `Tabs` component from `@servicenow/react-components` accepts `items` array and `onTabSelected` event | Pattern 8 | Component fails to render or events don't fire; fix by reading package docs before implementation |
| A3 | `BooleanColumn({ default: true })` sets `active` to true on new records without extra configuration | Pattern 9 | New roasters/equipment default to inactive; fix by auditing column default in SDK or adding default in UI |
| A4 | `glide.appcreator.company.code` on dev203275 can be read via Table API before `sdk init` | Pattern 1 | Scope prefix unknown until manual lookup; fix by checking instance UI System Properties |

---

## Open Questions (RESOLVED)

1. **Real scope prefix** — RESOLVED in 01-PLAN-01 T01: prefix is retrieved at execution time via `glide.appcreator.company.code` property query before `sdk init` runs. No hardcoded placeholder accepted.

2. **Tabs component prop API** — RESOLVED in 01-PLAN-03 T02: executor must run `npx @servicenow/sdk explain` on the Tabs/react-components API before writing TopNav.tsx. Exact prop names determined at implementation time from live SDK docs.

---

## Project Constraints (from CLAUDE.md)

The following directives from `CLAUDE.md` are binding on all Phase 1 plans:

| Directive | Implication for Phase 1 |
|-----------|------------------------|
| All code is scoped — never suggest global-scope solutions | All Fluent artifacts use scoped table names; no global Business Rules or Script Includes |
| Frontend is Fluent/now-sdk only | UiPage artifact with React 18.2.0 + @servicenow/react-components |
| UI: React 18.2.0 + `@servicenow/react-components` — never raw HTML elements | No `<button>`, `<input>`, `<select>` anywhere in client code |
| Target: Zurich release | Pin SDK to 4.6.0 (confirmed available); do not upgrade without checking Zurich compat |
| Before writing any Fluent/now-sdk code, run `npx @servicenow/sdk explain <topic>` | Every implementation task must begin with the relevant explain call |
| Inventory balance is always computed — never stored as a mutable column | Phase 1 tables (roaster, equipment) have no computed columns; this applies from Phase 2 for bean stock |
| Array.from polyfill: every `index.html` needs it inline, no CDATA (D-06) | Single `index.html` for the Phase 1 UiPage must include the polyfill |
| Polaris iframe detection on every page | `navigateToView()` utility implements `window.self !== window.top` check |
| SPA routing via URLSearchParams | `?view=home`, `?view=catalog`, `?section=roasters`, etc. — no hash routing |
| ACL testing: always test with a non-admin user before each phase sign-off | Phase 1 gate: non-admin test user with only `x_SCOPE_aibrew.user` role passes all scenarios |
| SDK deploy replaces: never edit SDK-managed artifacts directly on the instance | All fixes go to local source files; `sdk install` is the only deploy path |

---

## Sources

### Primary (HIGH confidence)
- `npx @servicenow/sdk explain developing-apps-guide` — SDK init CLI flow, project structure, workflow
- `npx @servicenow/sdk explain ui-page-guide` — UiPage API, React patterns, Array.from polyfill, Polaris detection, navigation
- `npx @servicenow/sdk explain ui-page-patterns-guide` — dirty state, service layer
- `npx @servicenow/sdk explain applicationmenu-api` — ApplicationMenu API
- `npx @servicenow/sdk explain application-menu-guide` — navigator module pattern, link_type values
- `npx @servicenow/sdk explain acl-api` — ACL API
- `npx @servicenow/sdk explain role-api` — Role API
- `npx @servicenow/sdk explain security-guide` — security layering
- `npx @servicenow/sdk explain table-api` — Table API
- `npx @servicenow/sdk explain booleancolumn-api` — BooleanColumn with default
- `npx @servicenow/sdk explain choicecolumn-api` — ChoiceColumn
- `npx @servicenow/sdk explain fluent-overview` — Fluent DSL overview
- `npx @servicenow/sdk explain script-include-guide` — ScriptInclude patterns (Phase 2+)
- `npx @servicenow/sdk explain ui-page-theming-guide` — Horizon design tokens, Polaris class

### Secondary (MEDIUM confidence)
- `.planning/research/ARCHITECTURE.md` — Component boundary model, navigation patterns, confirmed by developer experience 2026-04-27
- `.planning/research/STACK.md` — Column type imports, component mapping
- `.planning/research/PITFALLS.md` — SDK-specific pitfalls P1–P9

### Tertiary (LOW confidence)
- A2 (Tabs component prop names) — training knowledge; needs verification with package docs

---

## Metadata

**Confidence breakdown:**
- SDK init flow: HIGH — verified via explain
- Table/schema patterns: HIGH — verified via explain
- ACL/Role patterns: HIGH — verified via explain
- Navigator module: HIGH — verified via explain
- Array.from polyfill: HIGH for placement; ASSUMED for CDATA omission (D-06 override)
- SPA routing + Polaris detection: HIGH — verified via explain
- Top nav Tabs component: MEDIUM — props unverified; explain list confirms topic exists
- Archive pattern: HIGH — BooleanColumn default verified
- Component patterns: HIGH — NowRecordListConnected and RecordProvider verified

**Research date:** 2026-04-28
**Valid until:** 2026-05-28 (stable platform; no fast-moving dependencies in Phase 1 scope)

---

## RESEARCH COMPLETE
