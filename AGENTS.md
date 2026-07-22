# Agents — Control de Gastos

## Stack

- React 18 + TypeScript + Vite 5
- Tailwind CSS 3 with custom design tokens in `tailwind.config.js`
- Axios for HTTP (JWT auth via `localStorage`)
- PWA via `vite-plugin-pwa`

## Commands

```bash
npm run dev      # Vite dev server (proxies /api to http://api:4000)
npm run build    # tsc -b && vite build (type-checks before building)
npm run lint     # eslint . (ts + tsx files)
npm run preview  # preview production build locally
```

No test framework is configured. There is no `test` or `typecheck` script — `tsc -b` runs only as part of `build`.

## Architecture

- `src/api/` — API client layer; axios instance at `src/api/axios.ts` reads `VITE_API_URL` (default `http://localhost:4000/api`)
- `src/context/` — React context providers: `AuthContext`, `BudgetContext`, `CategoriesContext`
- `src/hooks/` — custom hooks wrapping context consumers
- `src/components/` — UI components; shared layout in `src/components/Commun/`
- `src/types/` — shared TypeScript types
- `src/data/` — seed/static data (default categories)

## Backend

The frontend expects a separate API server on port 4000. The Vite proxy and nginx config both route `/api` requests to `http://api:4000`. This repo contains only the frontend — the backend lives elsewhere.

## Environment

`.env` sets `VITE_API_URL=http://localhost:4000/api`. Vite env vars are prefixed with `VITE_` and accessed via `import.meta.env`.

## Auth

JWT stored in `localStorage` as `auth_token`. Axios interceptor attaches it automatically. On 401, both `auth_token` and `auth_user` are cleared and the page reloads.

## Docker

- `Dockerfile.dev` — dev server with hot reload (`node:22-alpine` + pnpm)
- `Dockerfile` — multi-stage build: pnpm build → nginx runner; sets `VITE_API_URL=/api` at build time
- `nginx.conf` — serves SPA and proxies `/api/` to `http://api:4000/api/`
- No `docker-compose.yml` exists — run containers manually or add your own.
- Docker images use pnpm; local dev uses npm (both lockfiles are present).

## Conventions

- UI text is in Spanish
- Components use functional style with hooks
- Expense and FixedExpense are the two core domain types (`src/types/index.ts`)
