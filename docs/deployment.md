# Deployment

## Production

| Field | Value |
|-------|-------|
| URL | https://vdarvs-ebon.vercel.app |
| Vercel team | `litebohop11` |
| Project name | `vdarvs` |
| Project ID | `prj_ErKrlMcI2rgeVhkGQH2MQQ9XD9le` |
| Dashboard | https://vercel.com/litebohop11/vdarvs |
| GitHub repo | https://github.com/litebohop/vdarvs |
| Production branch | `main` |

Local link file: `.vercel/project.json`

## Environment variables (Vercel)

Set on **Production**, **Preview**, and **Development**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://yymmbolnwwjjqkfmsqnw.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

Manage via CLI:

```bash
pnpm dlx vercel env ls
pnpm dlx vercel env pull   # Download to .env.local
```

## Manual deploy

```bash
pnpm dlx vercel deploy          # Preview deployment
pnpm dlx vercel deploy --prod   # Production deployment
```

## GitHub auto-deploy

For push-to-deploy on every `git push` to `main`:

1. Open [Git settings](https://vercel.com/litebohop11/vdarvs/settings/git)
2. Connect repository `litebohop/vdarvs`
3. Install/authorize the Vercel GitHub App on the `litebohop` account if prompted
4. Confirm production branch is `main`

After connection:

- Pushes to `main` → production deployment
- Pull requests → preview deployments

CLI alternative (if GitHub App is already installed):

```bash
pnpm dlx vercel git connect https://github.com/litebohop/vdarvs.git
```

## Build settings

Vercel auto-detects Next.js. Defaults:

- **Install:** `pnpm install`
- **Build:** `pnpm run build` (`next build --turbopack`)
- **Node.js:** 24.x

`drizzle.config.ts` and `drizzle/` are excluded from the Next.js typecheck in `tsconfig.json` so builds do not require `drizzle-kit` in production.

## Local vs Vercel CLI account

Ensure the CLI is logged into the correct Vercel account:

```bash
pnpm dlx vercel whoami
pnpm dlx vercel teams ls
```

Expected account: `litebohop` on team `litebohop11`.

## Post-deploy checklist

- [ ] Supabase migration applied (tables and seed data exist)
- [ ] Auth users created and linked to `profiles`
- [ ] Vercel env vars set for all environments
- [ ] GitHub repository connected for auto-deploy
- [ ] Production URL loads and login works
