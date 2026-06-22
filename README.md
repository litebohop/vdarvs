# VDARVS

Village Digital Administrative Records & Verification System

A production-quality prototype for Lesotho local government administration.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS** + **shadcn/ui**
- **TanStack React Query** for data fetching
- **Supabase** (Auth + PostgreSQL) with **Drizzle ORM** schemas
- **React Hook Form** + **Zod** for forms

## Architecture

Four-layer data flow designed for easy backend swap:

```
UI Components → Hooks (React Query) → Service Layer → Repository → Supabase/PostgreSQL
```

- **Pages** only compose feature components
- **Components** only consume hooks
- **Hooks** call services via React Query
- **Services** contain business logic
- **Repositories** handle data access (mock or Supabase)

## Getting Started

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase

Connected to project `cjzbikhvmhxmjjqfddyn` (eu-central-1).

- Dashboard: https://supabase.com/dashboard/project/cjzbikhvmhxmjjqfddyn
- Schema migrations live in `supabase/migrations/`
- Credentials in `.env.local` (not committed)

When `NEXT_PUBLIC_SUPABASE_URL` is set and `NEXT_PUBLIC_USE_MOCK_DATA` is not `true`, repositories read/write from PostgreSQL via the Supabase client.

To fall back to in-memory mock data:

```bash
NEXT_PUBLIC_USE_MOCK_DATA=true pnpm dev
```

**Note:** RLS is enabled with open prototype policies (anon read/write). Tighten these when Supabase Auth is wired up.


### Demo Login

Use quick demo accounts on the login page, or sign in as Village Chief:

- Email: `chief.masianokeng@vdarvs.gov.ls`
- Role: Village Chief

## Project Structure

```
src/
  app/              # Next.js routes
  components/       # Shared UI (layout, shared)
  features/         # Feature modules (citizens, animals, land, ...)
  lib/
    repositories/   # Data access layer
    services/       # Business logic
    supabase/       # Supabase clients
    mock-data/      # Lesotho prototype data
  providers/        # React Query, Auth, Theme
  types/            # Shared TypeScript types
  constants/        # Roles, navigation, Lesotho geography
drizzle/schema/     # PostgreSQL schema (Drizzle ORM)
```

## Roles (RBAC)

- Citizen
- Village Staff
- Village Chief
- District Officer
- Administrator

Routes are protected via middleware and role-based navigation.

## Scripts

```bash
pnpm dev          # Development server
pnpm build        # Production build
pnpm lint         # ESLint
pnpm db:generate  # Generate Drizzle migrations
```
