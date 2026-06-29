# VDARVS System Guide (PDF)

Generated user manual with screenshots and step-by-step workflows.

## Files

| File | Description |
|------|-------------|
| [VDARVS-System-Guide.pdf](./VDARVS-System-Guide.pdf) | Full system guide (PDF) |
| [guide.html](./guide.html) | Same content as HTML (for editing/regeneration) |
| [screenshots/](./screenshots/) | 23 PNG captures from the live app |

## Regenerate

```bash
pnpm docs:guide-pdf
```

Optional local URL:

```bash
BASE_URL=http://localhost:3000 pnpm docs:guide-pdf
```

Screenshots are taken from production by default (`https://vdarvs-ebon.vercel.app`).

## Contents

1. System overview
2. Roles and demo accounts
3. Sign in and onboarding
4. Core citizen → chief workflow
5. Citizen, chief, staff, district, and admin features
6. Notifications and audit trail

Demo password for all accounts: `Vdarvs2026!`
