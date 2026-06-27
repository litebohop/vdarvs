# Roadmap

What is done vs what remains relative to the original project plan.

## Completed

- [x] Next.js 15 App Router scaffold with TypeScript and pnpm
- [x] shadcn/ui, Tailwind, Framer Motion, Recharts
- [x] Four-layer architecture (UI → hooks → services → repositories → Supabase)
- [x] All planned routes and dashboard shell
- [x] TanStack React Query with centralized query keys
- [x] Drizzle schema and Supabase SQL migration with Lesotho seed data
- [x] Supabase Auth (email/password) with profile-based roles
- [x] Middleware session refresh and RBAC route guards
- [x] Citizen list, profile, registration (wired to Supabase)
- [x] Residency verify/reject mutations
- [x] Document approval mutation
- [x] Skeleton, empty, and error states on data pages
- [x] Vercel production deployment
- [x] Vercel env vars (Production, Preview, Development)

## In progress / partial

- [ ] **GitHub auto-deploy:** connect `litebohop/vdarvs` in Vercel Git settings if not done yet
- [ ] **New Supabase project:** apply `supabase/migrations/20260622000000_vdarvs_initial.sql` and create Auth users
- [ ] **Table sorting UI:** `useTableParams` supports sort; not all tables expose column headers
- [ ] **Table filters:** status, district, role filters not built in UI

## Not started (planned features)

### Security

- [ ] Replace open RLS prototype policies with role-scoped rules
- [ ] Village-scoped data access for chiefs and staff
- [ ] Audit sensitive mutations server-side

### Write flows (backend exists, UI missing)

- [ ] Animal registration create form
- [ ] Land record create form
- [ ] Dispute filing and resolution UI
- [ ] Document request (create) flow
- [ ] User management CRUD (create/disable staff)

### Workflow

- [ ] Dedicated workflow/approvals module (unified pending queue)
- [ ] Optimistic updates on high-frequency mutations

### Settings and notifications

- [ ] Persist notification preferences
- [ ] Functional settings page (not read-only placeholders)
- [ ] Mark notifications as read

### Infrastructure

- [ ] Server Actions or API routes for additional server-side validation
- [ ] Split Drizzle schema into per-domain files (optional cleanup)
- [ ] E2E tests for critical flows (login, register citizen, verify residency)

## Suggested implementation order

1. Apply Supabase migration and seed Auth users on the new project
2. Connect GitHub to Vercel for automated deploys
3. Tighten RLS policies per role
4. Add create UIs for animals, land, and disputes
5. Build unified approvals/workflow view
6. Harden settings, notifications, and user admin

This order keeps the demo deployable early while moving toward production readiness.
