# Getting Started

## Prerequisites

- Node.js 20+ (Vercel uses Node 24.x in production)
- [pnpm](https://pnpm.io/) 9 or 10
- A Supabase project with the VDARVS schema applied (see [Supabase](./supabase.md))
- Supabase Auth users linked to `profiles` rows for login

## Install

```bash
pnpm install
cp .env.example .env.local
```

## Environment variables

Edit `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://yymmbolnwwjjqkfmsqnw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>

# Optional: Drizzle CLI / direct Postgres access
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

Get keys from the [Supabase dashboard](https://supabase.com/dashboard/project/yymmbolnwwjjqkfmsqnw/settings/api).

Never commit `.env.local` or database passwords.

## Run locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build and lint

```bash
pnpm build    # Production build (Turbopack)
pnpm lint     # ESLint
pnpm start    # Serve production build locally
```

## Drizzle (optional)

Schema lives in `drizzle/schema/`. Migrations for the live database are managed in `supabase/migrations/`.

```bash
pnpm db:generate   # Generate Drizzle migration files
pnpm db:push       # Push schema to DATABASE_URL
pnpm db:studio     # Open Drizzle Studio
```

## Sign in

Login uses **Supabase Auth** (`signInWithPassword`). After sign-in, the app loads the user's role from the `profiles` table.

Create users in Supabase Auth (Dashboard → Authentication → Users), then ensure a matching row exists in `profiles` with the correct `role`. See [Auth & RBAC](./auth-and-rbac.md) for role values and seed account examples.

## Project scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Run built app |
| `pnpm lint` | ESLint |
| `pnpm db:generate` | Drizzle: generate migrations |
| `pnpm db:push` | Drizzle: push to database |
| `pnpm db:studio` | Drizzle Studio UI |
