# Supabase

## Project

| Field | Value |
|-------|-------|
| Name | `vdarvs` |
| Project ref | `yymmbolnwwjjqkfmsqnw` |
| Region | `eu-central-1` |
| API URL | `https://yymmbolnwwjjqkfmsqnw.supabase.co` |
| Dashboard | https://supabase.com/dashboard/project/yymmbolnwwjjqkfmsqnw |

Local link file: `supabase/project.json`

## Schema

The initial migration is `supabase/migrations/20260622000000_vdarvs_initial.sql`.

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Staff users, roles, village/district assignment |
| `citizens` | Registered citizens and verification status |
| `animals` | Livestock registry (cattle, sheep, goats, etc.) |
| `land_records` | Land parcels and ownership |
| `documents` | Official document requests and approvals |
| `disputes` | Village dispute cases |
| `residency_requests` | Residency verification workflow |
| `notifications` | User notifications |
| `audit_logs` | Administrative audit trail |

### Enums

- `user_role`: citizen, village_staff, village_chief, district_officer, administrator
- `record_status`: draft, pending, under_review, approved, rejected, archived
- `verification_status`: unverified, pending, verified, rejected
- `gender`: male, female, other

### Drizzle

TypeScript schema mirror: `drizzle/schema/index.ts`. Used for type generation and optional Drizzle CLI workflows. Production schema changes should go through `supabase/migrations/`.

## Applying the migration

If the database is empty, apply the migration via:

- **Supabase CLI:** `supabase db push` (with project linked), or
- **Dashboard:** SQL Editor, paste migration contents, or
- **MCP / API:** `apply_migration` through the Supabase integration

The migration includes **seed data**: profiles, citizens, animals, land, documents, disputes, residency requests, notifications, and audit logs with Lesotho-themed content.

## Query layer

Supabase queries live in `src/lib/supabase/queries/`:

| File | Domain |
|------|--------|
| `citizens.ts` | Citizens and residency |
| `animals.ts` | Animal registry |
| `land.ts` | Land records |
| `documents.ts` | Documents |
| `disputes.ts` | Disputes |
| `dashboard.ts` | Stats, notifications, profiles, audit logs |

Mappers in `src/lib/supabase/mappers.ts` convert snake_case DB rows to app entity types.

## Row Level Security

RLS is **enabled** on all tables. Current policies are **prototype-open**:

```sql
-- Example: all roles can read/write everything
CREATE POLICY "prototype_citizens_all" ON citizens
  FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);
```

**Before production:** replace with policies that enforce:

- Village Chiefs see only their village's records
- District Officers see district scope
- Citizens see only their own data
- Administrators retain elevated access

## Environment variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://yymmbolnwwjjqkfmsqnw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>   # optional
DATABASE_URL=<pooled-connection-string>                 # optional, for Drizzle CLI
```

## Auth ↔ profiles link

`profiles.id` must match `auth.users.id`. The app reads role from `profiles` after sign-in. See [Auth & RBAC](./auth-and-rbac.md).
