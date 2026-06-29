# VDARVS Documentation

Village Digital Administrative Records & Verification System: a production-quality prototype for Lesotho local government village administration.

## Quick links

| Doc | Description |
|-----|-------------|
| [Overview](./overview.md) | Project context, users, and administrative hierarchy |
| [Getting started](./getting-started.md) | Local setup, env vars, and first run |
| [Architecture](./architecture.md) | Four-layer design, folder structure, data flow |
| [Features](./features.md) | Routes, modules, and what each screen does |
| [Auth & RBAC](./auth-and-rbac.md) | Supabase Auth, roles, and route protection |
| [Demo flow](./demo-flow.md) | Who approves what, manual demo, and E2E test |
| [Supabase](./supabase.md) | Database schema, migrations, seed data, RLS |
| [Deployment](./deployment.md) | Vercel, GitHub, and environment configuration |
| [Roadmap](./roadmap.md) | Remaining work and suggested next steps |

## Live environments

| Environment | URL |
|-------------|-----|
| Production | https://vdarvs-ebon.vercel.app |
| GitHub | https://github.com/litebohop/vdarvs |
| Supabase dashboard | https://supabase.com/dashboard/project/yymmbolnwwjjqkfmsqnw |
| Vercel dashboard | https://vercel.com/litebohop11/vdarvs |

## Stack (summary)

Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack React Query, Supabase (Auth + PostgreSQL), Drizzle ORM schemas, React Hook Form + Zod, Vercel.
