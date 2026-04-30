---
phase: 01-app-foundation
reviewed: 2026-04-30T00:00:00Z
depth: standard
files_reviewed: 20
files_reviewed_list:
  - now.config.json
  - package.json
  - src/client/app.tsx
  - src/client/components/CatalogView.tsx
  - src/client/components/EquipmentSection.tsx
  - src/client/components/HomeView.tsx
  - src/client/components/RoasterSection.tsx
  - src/client/components/TopNav.tsx
  - src/client/index.html
  - src/client/main.tsx
  - src/client/utils/fields.ts
  - src/client/utils/navigate.ts
  - src/fluent/acls/equipment-acls.now.ts
  - src/fluent/acls/roaster-acls.now.ts
  - src/fluent/generated/keys.ts
  - src/fluent/navigator/aibrew-menu.now.ts
  - src/fluent/roles/aibrew-user.now.ts
  - src/fluent/tables/equipment.now.ts
  - src/fluent/tables/roaster.now.ts
  - src/fluent/ui-pages/aibrew-home.now.ts
findings:
  critical: 4
  warning: 6
  info: 3
  total: 13
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-04-30
**Depth:** standard
**Files Reviewed:** 20
**Status:** issues_found

## Summary

This review covers the complete Phase 1 foundation: two scoped tables (roaster, equipment), their ACLs, a single-page React app with URLSearchParams routing, and a Polaris-compatible UI page. The scope prefix `x_664529_aibrew` is used consistently across all files. The routing architecture (custom `aibrew:navigate` event, `cancelled` flag pattern) is sound.

Four blockers were found: a CSRF token usage pattern that will silently fail in Polaris because `g_ck` is not guaranteed to be populated at call time; a missing `X-UserToken` header on the archive PATCH call path through `RecordProvider`-backed saves (these go through the SDK, which is fine, but the direct fetch calls have a broken fallback); a `sysId` injection risk via URL parameters passed directly to Table API fetch URLs without any validation; and a render-phase navigation side effect that causes React warnings and potentially double history entries. Two lower-severity issues affect reliability: the `handleTabChange` no-op in `App`, and a `listKey` increment that does not debounce rapid clicks.

---

## Critical Issues

### CR-01: `sysId` from URL used unsanitised in Table API fetch URL — path injection risk

**File:** `src/client/components/EquipmentSection.tsx:25` and `src/client/components/RoasterSection.tsx:25`

**Issue:** `sysId` is read directly from `URLSearchParams` (`params.get('id')`) and interpolated into the Table API URL:

```ts
fetch(`/api/now/table/${EQUIPMENT_TABLE}/${sysId}`, { method: 'PATCH', ... })
```

No validation or sanitisation is applied. An attacker (or accidental URL manipulation) can supply a value like `../sys_user/admin` to traverse to a different table. Because the request carries `g_ck` (the session CSRF token), this request runs with full session privileges. The same pattern exists identically in `RoasterSection.tsx`.

**Fix:** Validate that `sysId` matches the ServiceNow sys_id format before use:

```ts
const SYS_ID_RE = /^[0-9a-f]{32}$/i

const handleArchive = async () => {
  if (!SYS_ID_RE.test(sysId)) {
    setArchiveError('Invalid record identifier.')
    return
  }
  // ... rest of handler
}
```

Apply the same guard in `RoasterDetailView.handleArchive`.

---

### CR-02: `g_ck` read at module evaluation time — will be empty string in Polaris on first render

**File:** `src/client/components/EquipmentSection.tsx:27,83` and `src/client/components/RoasterSection.tsx:27,83`

**Issue:** `(window as any).g_ck || ''` is evaluated at the moment each `fetch` call is constructed, which is fine for timing, but the fallback `''` silently sends requests with an empty `X-UserToken`. In a Polaris iframe, `g_ck` may not be populated until the platform has finished initialising. When it is absent the Table API will respond with a 403 (CSRF validation failure), but the code only checks `res.ok` without inspecting the status code or response body — the catch block swallows the error and shows a generic message. More critically, for the list fetch in `useEffect` the error silently sets `records` to `[]`, making the list appear empty rather than showing an auth error.

**Fix:** Fail fast when `g_ck` is not present, and log the HTTP status on failure:

```ts
const g_ck = (window as any).g_ck
if (!g_ck) {
  setArchiveError('Session token not available — please reload the page.')
  return
}

// In the list fetch catch:
.catch((err) => {
  if (!cancelled) {
    setError('Failed to load records. Please reload.')
    setRecords([])
  }
})
```

The list views (`EquipmentListView`, `RoasterListView`) have no `error` state at all — users see an empty list with no indication that a fetch failure occurred.

---

### CR-03: Navigation side effect called inside `renderContent()` during the render phase

**File:** `src/client/app.tsx:71`

**Issue:** The `default` branch of `renderContent()` calls `navigateToView('home', {}, 'AIBrew')` directly inside the render function body:

```ts
default:
  navigateToView('home', {}, 'AIBrew')
  return null
```

`navigateToView` calls `window.history.pushState(...)` and `window.dispatchEvent(new CustomEvent('aibrew:navigate'))`. Mutating browser history and dispatching events that trigger `setState` during a React render is a side effect violation. React 18 Strict Mode (which `main.tsx` enables) double-invokes render functions in development, meaning `pushState` fires twice and the `aibrew:navigate` event fires twice, potentially producing two history entries and two re-renders in production as well (because the custom event listener calls `setParams`).

**Fix:** Move the redirect into a `useEffect`:

```ts
const unknownView = !['home','catalog','brew','history','analytics'].includes(view)

useEffect(() => {
  if (unknownView) navigateToView('home', {}, 'AIBrew')
}, [unknownView])

function renderContent() {
  // remove default branch redirect; return null or <HomeView /> as fallback
  switch (view) {
    case 'home':    return <HomeView />
    case 'catalog': return <CatalogView params={params} />
    ...
    default:        return null
  }
}
```

---

### CR-04: `UiPage` key uses a literal string `'aibrew-home'` that does not match any key in `keys.ts`

**File:** `src/fluent/ui-pages/aibrew-home.now.ts:6`

**Issue:**

```ts
export const aibrew_home = UiPage({
  $id: Now.ID['aibrew-home'],
  ...
})
```

`Now.ID['aibrew-home']` references a key named `aibrew-home` (with a hyphen). The generated `keys.ts` file does not contain any entry with this name. The explicit keys present are `aibrew_home_module` and `aibrew_menu` (underscores). `Now.ID` lookups that resolve to `undefined` cause the SDK to generate a new sys_id on every build, meaning the UI page artifact is re-created on each deploy instead of updating in place. After the first deploy, subsequent installs will accumulate duplicate `x_664529_aibrew_home.do` UI page records on the instance.

**Fix:** Either add `aibrew_home` (underscore) to `keys.ts` and reference it consistently, or change the `$id` to match an existing key:

```ts
// In keys.ts — add to explicit section:
aibrew_home: {
  table: 'sys_ui_page'
  id: '437e9bae7316435cb7de2a11eddd20d3'  // matches composite entry for endpoint x_664529_aibrew_home.do
}

// In aibrew-home.now.ts:
$id: Now.ID['aibrew_home'],
```

---

## Warnings

### WR-01: `handleTabChange` in `App` is a no-op — URL and state can diverge

**File:** `src/client/app.tsx:54-56`

**Issue:**

```ts
const handleTabChange = (_tabId: string) => {
  setParams(getViewParams())
}
```

`TopNav` calls `navigateToView` then immediately calls `onTabChange`. The `navigateToView` call dispatches `aibrew:navigate`, which triggers `handlePopState`, which calls `setParams(getViewParams())`. Then `handleTabChange` also calls `setParams(getViewParams())` — a redundant second `setState` for the same URL. This is harmless today but will cause an extra render on every tab click. More critically, `handleTabChange` ignores the `tabId` argument entirely, so if the event ordering ever changes (e.g. the custom event is processed asynchronously), state can hold stale params.

**Fix:** Remove `handleTabChange` from `TopNav`'s contract and rely solely on the `aibrew:navigate` listener, or restructure `TopNav` to not call `navigateToView` itself and let the parent handle navigation.

---

### WR-02: `CatalogView` `useEffect` with no `params` dependency — stale closure on initial render

**File:** `src/client/components/CatalogView.tsx:21-25`

**Issue:**

```ts
useEffect(() => {
  if (!params.get('section')) {
    navigateToView('catalog', { section: 'roasters' }, 'AIBrew — Catalog')
  }
}, [])
```

The dependency array is empty, meaning this effect captures the `params` value from the first render only. If `params` changes (e.g. via back navigation) before this effect runs (unlikely but possible under concurrent features), it will read stale params. More practically, the ESLint exhaustive-deps rule would flag this, and it represents a pattern that will silently misbehave as the codebase grows.

**Fix:**

```ts
useEffect(() => {
  if (!params.get('section')) {
    navigateToView('catalog', { section: 'roasters' }, 'AIBrew — Catalog')
  }
}, [params])
```

Because `params` is a new `URLSearchParams` object on each `App` render, this is safe — referential stability is not required here.

---

### WR-03: List fetches have no error state — fetch failure silently renders empty list

**File:** `src/client/components/EquipmentSection.tsx:87` and `src/client/components/RoasterSection.tsx:87`

**Issue:** The `.catch()` handler in both list `useEffect`s sets `records` to `[]` but sets no error flag. The UI renders the "No equipment yet" / "No roasters yet" empty-state message, which is indistinguishable from a genuine empty list. A network failure, 403 from missing `g_ck`, or 500 from the instance will show as a false empty state.

**Fix:** Add an `error` state to each list component:

```ts
const [error, setError] = useState<string | null>(null)

// in catch:
.catch(() => { if (!cancelled) { setRecords([]); setError('Could not load records — tap to retry.') } })

// in render:
{error && <div style={{ color: 'var(--aibrew-destructive)', ...}}>{error}</div>}
```

---

### WR-04: Archive PATCH sends `active: 'false'` as a string — may not evaluate correctly

**File:** `src/client/components/EquipmentSection.tsx:29` and `src/client/components/RoasterSection.tsx:29`

**Issue:**

```ts
body: JSON.stringify({ active: 'false' }),
```

The ServiceNow Table API for a `BooleanColumn` expects the boolean value `false`, not the string `"false"`. The Table API does accept `"false"` as a string in some releases but this is undocumented behaviour. The schema in `equipment.now.ts` and `roaster.now.ts` defines `active` as `BooleanColumn`, so the canonical representation is boolean.

**Fix:**

```ts
body: JSON.stringify({ active: false }),
```

---

### WR-05: `EquipmentSection` and `RoasterSection` call `getViewParams()` on every render — not reactive

**File:** `src/client/components/EquipmentSection.tsx:157-158` and `src/client/components/RoasterSection.tsx:157-158`

**Issue:**

```ts
export default function EquipmentSection() {
  const params = getViewParams()
  const sysId = params.get('id')
  ...
}
```

`getViewParams()` reads `window.location.search` directly. This is called once per render. If the URL changes and React does not trigger a re-render of this component (because its parent's props/state haven't changed), `sysId` will be stale. The current architecture dispatches `aibrew:navigate` and the `App` re-renders which does propagate down, so this is safe today. However, `CatalogView` receives `params` as a prop from `App` but `EquipmentSection` ignores it and re-reads from the window — an inconsistency that will cause subtle bugs if the prop-passing pattern is ever relied upon for correctness.

**Fix:** Pass `params` down from `CatalogView` to `EquipmentSection`/`RoasterSection` as a prop rather than re-reading from `window.location`:

```ts
export default function EquipmentSection({ params }: { params: URLSearchParams }) {
  const sysId = params.get('id')
  ...
}
```

---

### WR-06: `Array.from` polyfill references `Window` (capital W) — will throw ReferenceError in strict contexts

**File:** `src/client/index.html:65`

**Issue:**

```js
if (typeof C !== 'function' || C === Window || C === Object) { C = Array; }
```

`Window` (capital W) is not a guaranteed global in all ServiceNow iframe sandbox configurations. In environments where the global object is not `Window` (e.g. some Polaris sandbox contexts), `C === Window` will throw a `ReferenceError: Window is not defined`, which causes the polyfill block to throw silently (the outer IIFE has no try/catch), potentially leaving `Array.from` un-patched. The correct reference is `window.Window` or simply removing the `Window` check (which is not semantically meaningful for this polyfill anyway).

**Fix:** Remove the `C === Window` check entirely — it is not required by the spec-compliant `Array.from` behaviour being implemented:

```js
if (typeof C !== 'function' || C === Object) { C = Array; }
```

---

## Info

### IN-01: `fields.ts` uses `any` parameter type — loses type safety at call sites

**File:** `src/client/utils/fields.ts:3-4`

**Issue:**

```ts
export const display = (field: any): string => field?.display_value ?? ''
export const value   = (field: any): string => field?.value ?? ''
```

Using `any` bypasses TypeScript's type checking at every call site. Define a narrow interface to catch callers passing the wrong object shape.

**Fix:**

```ts
interface SnField { display_value?: string | null; value?: string | null }
export const display = (field: SnField | null | undefined): string => field?.display_value ?? ''
export const value   = (field: SnField | null | undefined): string => field?.value ?? ''
```

---

### IN-02: `@servicenow/react-components` version is `^0.1.0` — wide semver range for an SDK-coupled library

**File:** `package.json:18`

**Issue:** `"@servicenow/react-components": "^0.1.0"` allows any `0.x.y` version. Because this library is tightly coupled to the Fluent/now-sdk version (4.6.0, pinned), a minor bump in `react-components` can break `RecordProvider`, `FormActionBar`, or `Modal` APIs silently.

**Fix:** Pin to an exact version:

```json
"@servicenow/react-components": "0.1.0"
```

---

### IN-03: `aibrew-menu.now.ts` defines module `roles` as a plain string array instead of role reference

**File:** `src/fluent/navigator/aibrew-menu.now.ts:23`

**Issue:**

```ts
roles: ['x_664529_aibrew.user'],
```

The `ApplicationMenu` record uses `roles: [aibrew_user]` (a typed reference) correctly, but the `Record` for `sys_app_module` uses a raw string `'x_664529_aibrew.user'`. This bypasses the SDK's referential integrity tracking — if the role name changes, this string will not be updated automatically.

**Fix:**

```ts
import { aibrew_user } from '../roles/aibrew-user.now'

// in Record data:
roles: [aibrew_user],
```

---

_Reviewed: 2026-04-30_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
