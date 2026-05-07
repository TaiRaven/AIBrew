# AIBrew

A mobile-first ServiceNow scoped app for home coffee brew logging. Log a complete brew in under 60 seconds from the counter.

Built with the [Fluent/now-sdk](https://developer.servicenow.com) framework on the **Zurich release**.

---

## Features

- **Roaster & Equipment catalog** — manage your grinders, brewers, and roaster contacts
- **Bean catalog & inventory** — track bean types, purchases, and live remaining stock (computed from your brew history)
- **Recipe presets** — save named presets to pre-fill the brew form in one tap
- **Brew logging** — log method, bean, dose, water, grind size, brew time (in-page timer), ratio (live), rating, and taste notes
- **Brew history** — reverse-chronological list with edit and delete
- **Analytics** *(in progress)* — rating trend chart, average by bean, average by method

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Platform | ServiceNow (Zurich release, scoped app) |
| Frontend | React 18.2.0 + `@servicenow/react-components` |
| Charts | Custom SVG (no third-party chart library) |
| Backend | Fluent/now-sdk: Scripted REST + Script Includes |
| Build | `@servicenow/sdk` 4.6.0 |

---

## Data Model

Six scoped tables, built in dependency order:

| Table | Purpose |
|-------|---------|
| `x_664529_aibrew_roaster` | Roaster catalog |
| `x_664529_aibrew_equipment` | Grinders and brewers |
| `x_664529_aibrew_bean` | Bean types (linked to roaster) |
| `x_664529_aibrew_bean_purchase` | Purchase ledger (grams per bag) |
| `x_664529_aibrew_recipe` | Saved brew presets |
| `x_664529_aibrew_brew_log` | Brew session records (references all other tables) |

Remaining stock is always **computed** (purchases − brew doses via GlideRecord scan) — never stored as a column.

---

## Project Structure

```
src/
  client/
    components/       # React views (HomeView, BrewView, HistoryView, …)
    utils/            # Shared helpers (field accessors, navigation)
    app.tsx           # SPA router (?view= URLSearchParams)
    index.html        # Entry point (includes Array.from polyfill)
  fluent/
    tables/           # Scoped table definitions
    acls/             # Role-scoped ACLs for each table
    scripted-rest/    # REST API definitions (Fluent RestApi())
    script-includes/  # Server-side helpers
    roles/            # App role definition
    navigator/        # Application menu module
    ui-pages/         # ServiceNow UI Page registrations
    index.now.ts      # Fluent barrel export
  server/
    *-handler.ts      # TypeScript handlers for Scripted REST endpoints
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- `@servicenow/sdk` ≥ 4.6.0 (installed as a dev dependency)
- A ServiceNow Zurich instance with an admin account

### Install

```bash
npm install
```

### Authenticate

```bash
npx now-sdk auth --add <your-instance-url> --type basic
```

### Build & Deploy

```bash
npx @servicenow/sdk build      # compile and validate
npx @servicenow/sdk install    # push to instance
```

### First-Time Setup

If starting from scratch on a new instance, re-initialise the app scaffold first:

```bash
npx @servicenow/sdk init --appName "AIBrew" --packageName "aibrew" --scopeName "x_<scope>" --template base
npm install
```

Replace `<scope>` with your instance's company code (`glide.appcreator.company.code`).

---

## Access

Once deployed, open the app from the ServiceNow application navigator under **AIBrew**. Requires the `x_664529_aibrew.user` role — assign it to any user who should have access.

---

## Notes

- Single-user app — no multi-user support or authentication layer needed
- All UI runs inside the ServiceNow Polaris iframe; every page includes iframe detection
- `GlideAggregate` SUM is broken on `DecimalColumn` fields in scoped apps on this release — all server-side aggregation uses `GlideRecord` scan with JS-side summation
