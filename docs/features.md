# Features

## Routes

| Route | Page | Roles (minimum) |
|-------|------|-----------------|
| `/` | Landing | Public |
| `/login` | Sign in | Public |
| `/dashboard` | Overview, stats, charts | All authenticated |
| `/citizens` | Citizen list (search, pagination) | Village Staff+ |
| `/citizens/[id]` | Citizen profile | Village Staff+ |
| `/citizens/register` | Register new citizen | Village Staff+ |
| `/residency` | Residency verification queue | Village Chief+ |
| `/land` | Land parcel records | Village Staff+ |
| `/animals` | Animal registry | Village Staff+ |
| `/documents` | Document requests and approval | Village Staff+ |
| `/disputes` | Dispute cases | Village Staff+ |
| `/reports` | District/village statistics | Village Chief+ |
| `/notifications` | User notifications | All authenticated |
| `/users` | Staff user list | Administrator |
| `/audit-logs` | System audit trail | District Officer, Administrator |
| `/settings` | System settings (read-only UI) | Administrator |

Role shorthand: Village Staff+ means `village_staff`, `village_chief`, `district_officer`, or `administrator`.

## Module behavior

### Dashboard

- Summary cards (citizens, documents, land, animals, disputes, pending approvals)
- Charts (citizen growth, document/dispute trends)
- Recent activity feed
- Quick actions and pending request highlights

### Citizens

- **List:** Search, pagination, status badges
- **Profile:** Full citizen record with linked data
- **Register:** Form with Zod validation; assigns a Village Chief by location; persists via `citizenService.registerCitizen`
- **Residency:** Chiefs verify or reject pending residency requests

### Land, animals, disputes

- Read-heavy tables with search and pagination
- Repository `create` methods exist for land, animals, and disputes; UI create flows are not yet built

### Documents

- List document requests
- Approve documents (mutation wired to Supabase)

### Reports

- Aggregated statistics reusing dashboard data
- Bar charts for cross-module metrics

### Notifications

- Lists notifications for the signed-in user from the `notifications` table

### Users and audit logs

- **Users:** Read-only staff listing from `profiles`
- **Audit logs:** Read-only audit trail

### Settings

- Displays app name, country, and notification toggles (UI placeholders, not persisted)

## UI patterns

Every data page implements:

- **Skeleton** loading (no spinner-only pages)
- **Empty** state when no records match
- **Error** state with retry
- **Success** content when data loads

Tables support **search** and **pagination**. Sort parameters exist in `useTableParams` and some Supabase queries; column sort UI is not wired on all tables.

## Lesotho data

Geography constants live in `src/constants/lesotho.ts`:

- 10 districts
- Community councils per district
- Villages per council (e.g. Masianokeng, Ha Tsolo, Ha Ramokoatsi)

Seed data in `supabase/migrations/20260622000000_vdarvs_initial.sql` uses Lesotho names and realistic village addresses.

## Forms

- React Hook Form + Zod for client validation
- Toast feedback via Sonner
- Server-side validation via Supabase RLS and Postgres constraints (not Next.js Server Actions)
