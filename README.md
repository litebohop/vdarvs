
# VDARVS

**Village Digital Administrative Records & Verification System**

A production-quality prototype for Lesotho local government village administration.

**Production:** https://vdarvs-ebon.vercel.app

## Documentation

Full documentation lives in [`docs/`](./docs/README.md):

- [Overview](./docs/overview.md) · [Getting started](./docs/getting-started.md) · [Architecture](./docs/architecture.md)
- [Features](./docs/features.md) · [Auth & RBAC](./docs/auth-and-rbac.md) · [Supabase](./docs/supabase.md)
- [Deployment](./docs/deployment.md) · [Roadmap](./docs/roadmap.md)

## Quick start

```bash
pnpm install
cp .env.example .env.local   # add Supabase keys
pnpm dev
```

## Stack

Next.js 15 · TypeScript · Tailwind · shadcn/ui · TanStack React Query · Supabase · Drizzle · Vercel

## Architecture

```
UI → Hooks (React Query) → Services → Repositories → Supabase / PostgreSQL
```

Pages compose feature components. Components call hooks only. No direct Supabase access in UI layers.

## Repository

https://github.com/litebohop/vdarvs
