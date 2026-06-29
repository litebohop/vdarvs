# Demo flow guide

This document describes the **complete VDARVS workflow**: who does what, how to demo it manually, and how to re-run the automated browser test.

**Production URL:** https://vdarvs-ebon.vercel.app  
**Demo password (all seeded accounts):** `Vdarvs2026!`

---

## Who does what

| Role | Email | Approves / acts on |
|------|-------|-------------------|
| **Citizen** | `citizen@example.ls` | Onboarding, document requests, disputes |
| **Village chief** | `chief.masianokeng@vdarvs.gov.ls` | Residency verification, documents, disputes, animals, land |
| **Village staff** | `staff.masianokeng@vdarvs.gov.ls` | Register citizens, animals, land (no approvals) |
| **District officer** | `district.maseru@vdarvs.gov.ls` | Reports, audit logs, backup residency verification |
| **Administrator** | `admin@vdarvs.gov.ls` | Role requests only (not citizenship or documents) |

The **administrator does not verify citizenship or approve documents**. Those actions belong to the **village chief**.

---

## Core flow (citizen → chief)

```text
1. Citizen signs in → Onboarding → Submit citizen application
         ↓
2. Village chief → Residency Verification → Verify
         ↓ (citizen gets notification)
3. Citizen → Documents → Request document
         ↓
4. Village chief → Documents → Approve
         ↓ (citizen gets notification)
5. Citizen → Documents / Notifications → sees approved status
```

### Step 1: Citizen application

1. Sign in as `citizen@example.ls`.
2. Open **Onboarding** (or follow the dashboard prompt).
3. Tab **Apply as citizen**, fill the form (Masianokeng / Maseru defaults are fine).
4. Click **Submit citizen application**.
5. Dashboard shows **Waiting for residency verification** and names the village chief.

### Step 2: Chief verifies residency

1. Sign out. Sign in as `chief.masianokeng@vdarvs.gov.ls`.
2. Open **Residency Verification**.
3. Click **Verify** on the pending citizen.
4. Citizen receives a **Residency verified** notification.

### Step 3: Citizen requests a document

1. Sign in as `citizen@example.ls`.
2. Open **Documents**.
3. Banner explains that the village chief approves requests.
4. Click **Request document**, enter a title, click **Submit request**.

### Step 4: Chief approves the document

1. Sign in as `chief.masianokeng@vdarvs.gov.ls`.
2. Open **Documents**.
3. Click **Approve** on the pending row.
4. Citizen receives a **Document approved** notification.

---

## Extended flows

### Staff registers a citizen

1. Sign in as `staff.masianokeng@vdarvs.gov.ls`.
2. **Citizens → Register citizen** (creates a residency queue item).
3. Chief verifies on **Residency Verification**.

### Staff registers animals or land

1. Staff: **Animals → Register animal** or **Land → Register land**.
2. Chief: open the same page and **Approve** or **Reject** pending rows.

### Disputes

1. Citizen (or staff on behalf of a citizen): **Disputes → File dispute**.
2. Chief: **Disputes → Resolve** or **Dismiss**.

### Administrator (staff access only)

1. Sign in as `admin@vdarvs.gov.ls`.
2. **Role Requests → Approve** or **Reject** (when someone requested staff/chief/district access on onboarding).
3. Do **not** use admin for residency or documents.

---

## Automated E2E test

A Playwright script runs the core flow in a real browser against production and checks the database after each step.

### Prerequisites

- `.env.local` with `DATABASE_URL` (for DB assertions)
- Chromium for Playwright: `pnpm exec playwright install chromium`

### Run

```bash
pnpm test:e2e
```

Optional: test another URL:

```bash
BASE_URL=http://localhost:3000 pnpm test:e2e
```

### What it verifies

| Step | Browser | Database |
|------|---------|----------|
| Citizen onboarding | Pending banner on dashboard | `residency_requests.status = pending` |
| Chief verify | Success toast | `citizens.verification_status = verified` |
| Citizen document request | Success toast | `documents.status = pending` |
| Chief approve | Success toast | `documents.status = approved` |
| Notification | — | Citizen has "Document approved" notification |

### Last verified run

- **Date:** 2026-06-29
- **Target:** https://vdarvs-ebon.vercel.app
- **Result:** All steps **PASS** (browser + DB)
- **Script:** `scripts/e2e-demo-flow.mjs`

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| Admin sees no residency queue | Admin cannot verify citizenship | Sign in as **chief**, not admin |
| Document stays pending | Only chief can approve | Sign in as `chief.masianokeng@vdarvs.gov.ls` |
| Citizen cannot request documents | No citizen profile | Complete **Onboarding** first |
| Empty lists after demo reset | Seed data was cleared | Run the flow again from step 1 |

---

## Related docs

- [Auth & RBAC](./auth-and-rbac.md)
- [Features](./features.md)
