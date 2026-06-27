# Architecture

## Four-layer data flow

VDARVS uses a strict four-layer architecture so the backend can be swapped or extended without touching the UI.

```
UI Components
      ↓
Custom Hooks (TanStack React Query)
      ↓
Service Layer (business logic)
      ↓
Repository Layer (Supabase queries)
      ↓
PostgreSQL
```

### Example: citizen list

```
CitizenTable
      ↓
useCitizens()
      ↓
citizen.service.ts
      ↓
citizen.repository.ts → supabase/citizen.repository.ts
      ↓
lib/supabase/queries/citizens.ts
      ↓
PostgreSQL (citizens table)
```

## Layer rules

| Layer | Location | May call |
|-------|----------|----------|
| Pages | `src/app/` | Feature components only |
| Components | `src/features/*/components/` | Hooks only |
| Hooks | `src/features/*/hooks/` | Services via React Query |
| Services | `src/lib/services/` | Repositories |
| Repositories | `src/lib/repositories/` | Supabase query modules |
| Queries | `src/lib/supabase/queries/` | Supabase client only |

**Never** call Supabase directly from a page or component. **Never** fetch inside JSX.

## Key directories

```
src/
  app/                    # Next.js App Router routes
  components/
    ui/                   # shadcn/ui primitives
    layout/               # Shell, sidebar, header
    shared/               # Tables, forms, page states
  features/               # Feature modules (components + hooks)
  lib/
    repositories/         # Repository facades + supabase/ impl
    services/             # Domain business logic
    supabase/             # Client, server, middleware, queries
    query-keys.ts         # Centralized React Query keys
    utils/                # Pagination, formatting
  providers/              # Auth, React Query, theme
  types/                  # Shared TypeScript types
  constants/              # Roles, navigation, Lesotho geography
  config/                 # App-wide configuration
drizzle/schema/           # Drizzle ORM schema (TypeScript)
supabase/migrations/      # SQL migrations for Supabase
```

## Feature modules

Each domain has a folder under `src/features/`:

| Module | Hooks | Primary routes |
|--------|-------|----------------|
| `auth` | — | `/`, `/login` |
| `dashboard` | `useDashboard` | `/dashboard`, `/notifications`, `/users`, `/audit-logs`, `/settings` |
| `citizens` | `useCitizens`, `useCitizen`, `useCreateCitizen`, … | `/citizens`, `/citizens/[id]`, `/citizens/register`, `/residency` |
| `animals` | `useAnimals` | `/animals` |
| `land` | `useLand` | `/land` |
| `documents` | `useDocuments` | `/documents` |
| `disputes` | `useDisputes` | `/disputes` |
| `reports` | uses dashboard hooks | `/reports` |

Services and repositories live in `src/lib/` rather than inside each feature folder. Hooks and UI components are colocated per feature.

## React Query

- Query keys are centralized in `src/lib/query-keys.ts`
- Default stale time and GC time are set in `src/config/app.config.ts`
- Mutations invalidate related list and detail queries after success

## Middleware

`src/middleware.ts` combines:

1. **Supabase session refresh** via `updateSession()` (`src/lib/supabase/middleware.ts`)
2. **Authentication gate** (redirect unauthenticated users to `/login`)
3. **RBAC** (load `profiles.role`, enforce per-route allowlists)

## TypeScript and build

- Strict TypeScript throughout
- `drizzle/` and `drizzle.config.ts` are excluded from the Next.js typecheck (see `tsconfig.json`) so production builds do not require `drizzle-kit`
