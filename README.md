# Map Gallery

[![License](https://img.shields.io/github/license/syntony666/map-gallery)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Hono](https://img.shields.io/badge/Hono-4-E36002?logo=hono&logoColor=white)](https://hono.dev)

A personal photo gallery organized by geography — photos are grouped by area on an interactive map of Taiwan, with collections, a paginated photo grid, and photo management. npm workspaces monorepo: `apps/web` is a React SPA, `apps/api` is a small REST API backed by SQLite, `packages/shared` carries the shared types.

## Features

- Interactive Taiwan map (Leaflet) — hover labels and popups to browse areas
- Photo grid per area with pagination, batch selection, and manage toolbars
- Collections — group photos into named sets within each area (many-to-many)
- Photo detail viewer and editor with collection tagging
- Area covers and descriptions

## Stack

- **Web** — React 19, Vite, Tailwind CSS 4, React Router, Leaflet / react-leaflet
- **API** — Hono on Node.js, Drizzle ORM, better-sqlite3
- **Repo** — npm workspaces, shared TypeScript types in `packages/shared`

## Usage

```bash
npm install         # install workspaces
npm run init        # migrate DB + seed areas + build all workspaces

npm run dev         # web on :5173 (proxies /api) + api on :8787

# production-style: API serves the built SPA on :8787
npm run prepare:production && npm start
```

Other commands:

```bash
npm run build          # build all workspaces
npm run typecheck      # typecheck all workspaces
npm run db:seed:dev    # load demo photos/collections for local dev
npm run lint --workspace=@map-gallery/web
```

SQLite data lives in `apps/api/data/`; migrations are managed by drizzle-kit (`apps/api/drizzle/`).
