# Auth & RBAC

## Authentication

VDARVS uses **Supabase Auth** with email and password sign-in.

| Component | Role |
|-----------|------|
| `src/providers/auth-provider.tsx` | Client session, `login` / `logout`, loads `profiles` |
| `src/lib/supabase/middleware.ts` | Refreshes session cookies on each request |
| `src/middleware.ts` | Auth gate + role checks on protected routes |
| `src/lib/supabase/client.ts` | Browser Supabase client |
| `src/lib/supabase/server.ts` | Server-side Supabase client |

### Sign-in flow

1. User submits email and password on `/login`
2. `supabase.auth.signInWithPassword` runs
3. App fetches `profiles` row by `auth.users.id`
4. Role and display name come from `profiles` (falls back to `citizen` if row missing)

### Sign-out

`supabase.auth.signOut()` clears the session and local user state.

## Roles

Defined in `src/constants/roles.ts` and stored in `profiles.role`:

| Role key | Label |
|----------|-------|
| `citizen` | Citizen |
| `village_staff` | Village Staff |
| `village_chief` | Village Chief |
| `district_officer` | District Officer |
| `administrator` | Administrator |

`hasMinimumRole()` compares roles using a hierarchy array for future use.

## Route protection

`src/middleware.ts` enforces two checks after authentication:

1. User must have a valid Supabase session
2. For restricted paths, `profiles.role` must be in the route allowlist

Public routes: `/`, `/login`.

Navigation items in `src/constants/navigation.ts` are filtered by role so users only see permitted sidebar links.

## Creating users for development

1. **Supabase Auth:** Dashboard → Authentication → Users → Add user (email + password)
2. **Profile row:** Insert into `profiles` with the same `id` as `auth.users.id` and the desired `role`

Example seed profile IDs from the initial migration (use only after applying migration and creating matching Auth users):

| Email | Role | Profile UUID |
|-------|------|--------------|
| `admin@vdarvs.gov.ls` | administrator | `c0000001-0001-4001-8001-000000000001` |
| `chief.masianokeng@vdarvs.gov.ls` | village_chief | `c0000001-0001-4001-8001-000000000002` |
| `staff.masianokeng@vdarvs.gov.ls` | village_staff | `c0000001-0001-4001-8001-000000000003` |
| `district.maseru@vdarvs.gov.ls` | district_officer | `c0000001-0001-4001-8001-000000000004` |
| `citizen@example.ls` | citizen | `c0000001-0001-4001-8001-000000000005` |

Auth users must be created separately with matching UUIDs (or update `profiles.id` after signup to match `auth.users.id`).

## Security notes (prototype)

- RLS policies are currently **open** for prototyping (`USING (true)`). See [Supabase](./supabase.md).
- Tighten RLS to role-based rules before any real government deployment.
- Roles are enforced in middleware and UI, but open RLS means direct API access bypasses those checks until policies are updated.
