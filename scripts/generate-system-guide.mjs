/**
 * Capture VDARVS screenshots and build a PDF system guide.
 * Usage: node scripts/generate-system-guide.mjs
 */
import { chromium } from "playwright";
import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "docs", "system-guide");
const SHOTS_DIR = join(OUT_DIR, "screenshots");
const PDF_PATH = join(OUT_DIR, "VDARVS-System-Guide.pdf");
const HTML_PATH = join(OUT_DIR, "guide.html");

const BASE_URL = process.env.BASE_URL || "https://vdarvs-ebon.vercel.app";
const PASSWORD = "Vdarvs2026!";

const ACCOUNTS = {
  citizen: "citizen@example.ls",
  chief: "chief.masianokeng@vdarvs.gov.ls",
  staff: "staff.masianokeng@vdarvs.gov.ls",
  district: "district.maseru@vdarvs.gov.ls",
  admin: "admin@vdarvs.gov.ls",
};

async function goto(page, path) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await page.goto(`${BASE_URL}${path}`, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      await page.waitForTimeout(1200);
      return;
    } catch (error) {
      if (attempt === 3) throw error;
      await page.waitForTimeout(2000);
    }
  }
}

async function login(page, email) {
  await goto(page, "/login");
  await page.fill("#email", email);
  await page.fill("#password", PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: 45000 });
  await page.waitForTimeout(1500);
}

async function logout(page) {
  await page.getByRole("button", { name: "Log out" }).click();
  await page.waitForURL(/\/login/, { timeout: 15000 });
  await page.waitForTimeout(800);
}

async function shot(page, name, fullPage = false) {
  const file = join(SHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage });
  return file;
}

async function captureAll(page) {
  const captured = [];

  await goto(page, "/");
  captured.push({ id: "01-landing", file: await shot(page, "01-landing", true) });

  await goto(page, "/login");
  captured.push({ id: "02-login", file: await shot(page, "02-login") });

  await goto(page, "/signup");
  captured.push({ id: "03-signup", file: await shot(page, "03-signup") });

  await login(page, ACCOUNTS.citizen);
  await goto(page, "/dashboard");
  captured.push({
    id: "04-citizen-dashboard",
    file: await shot(page, "04-citizen-dashboard", true),
  });
  await goto(page, "/onboarding");
  captured.push({
    id: "05-citizen-onboarding",
    file: await shot(page, "05-citizen-onboarding", true),
  });
  await goto(page, "/documents");
  captured.push({
    id: "06-citizen-documents",
    file: await shot(page, "06-citizen-documents", true),
  });
  await goto(page, "/disputes");
  captured.push({
    id: "07-citizen-disputes",
    file: await shot(page, "07-citizen-disputes", true),
  });
  await goto(page, "/notifications");
  captured.push({
    id: "08-citizen-notifications",
    file: await shot(page, "08-citizen-notifications", true),
  });
  await logout(page);

  await login(page, ACCOUNTS.chief);
  await goto(page, "/dashboard");
  captured.push({
    id: "09-chief-dashboard",
    file: await shot(page, "09-chief-dashboard", true),
  });
  await goto(page, "/residency");
  captured.push({
    id: "10-chief-residency",
    file: await shot(page, "10-chief-residency", true),
  });
  await goto(page, "/documents");
  captured.push({
    id: "11-chief-documents",
    file: await shot(page, "11-chief-documents", true),
  });
  await goto(page, "/disputes");
  captured.push({
    id: "12-chief-disputes",
    file: await shot(page, "12-chief-disputes", true),
  });
  await goto(page, "/animals");
  captured.push({
    id: "13-chief-animals",
    file: await shot(page, "13-chief-animals", true),
  });
  await goto(page, "/land");
  captured.push({
    id: "14-chief-land",
    file: await shot(page, "14-chief-land", true),
  });
  await logout(page);

  await login(page, ACCOUNTS.staff);
  await goto(page, "/citizens");
  captured.push({
    id: "15-staff-citizens",
    file: await shot(page, "15-staff-citizens", true),
  });
  await goto(page, "/citizens/register");
  captured.push({
    id: "16-staff-register-citizen",
    file: await shot(page, "16-staff-register-citizen", true),
  });
  await goto(page, "/animals/register");
  captured.push({
    id: "17-staff-register-animal",
    file: await shot(page, "17-staff-register-animal", true),
  });
  await goto(page, "/land/register");
  captured.push({
    id: "18-staff-register-land",
    file: await shot(page, "18-staff-register-land", true),
  });
  await logout(page);

  await login(page, ACCOUNTS.district);
  await goto(page, "/reports");
  captured.push({
    id: "19-district-reports",
    file: await shot(page, "19-district-reports", true),
  });
  await goto(page, "/audit-logs");
  captured.push({
    id: "20-district-audit-logs",
    file: await shot(page, "20-district-audit-logs", true),
  });
  await logout(page);

  await login(page, ACCOUNTS.admin);
  await goto(page, "/dashboard");
  captured.push({
    id: "21-admin-dashboard",
    file: await shot(page, "21-admin-dashboard", true),
  });
  await goto(page, "/role-requests");
  captured.push({
    id: "22-admin-role-requests",
    file: await shot(page, "22-admin-role-requests", true),
  });
  await goto(page, "/users");
  captured.push({
    id: "23-admin-users",
    file: await shot(page, "23-admin-users", true),
  });

  return captured;
}

async function toDataUri(filePath) {
  const buf = await readFile(filePath);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

function figure(title, imageId, images) {
  const src = images[imageId];
  if (!src) return "";
  return `<figure class="shot"><img src="${src}" alt="${title}" /><figcaption>${title}</figcaption></figure>`;
}

function section(title, bodyHtml, imageId, images) {
  return `<section class="block"><h2>${title}</h2>${bodyHtml}${figure(title, imageId, images)}</section>`;
}

async function buildHtml(images) {
  const generated = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>VDARVS System Guide</title>
  <style>
    @page { size: A4; margin: 18mm 16mm; }
    * { box-sizing: border-box; }
    body {
      font-family: Helvetica, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.55;
      color: #1a1a1a;
      margin: 0;
    }
    .cover {
      page-break-after: always;
      min-height: 90vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 24mm 8mm;
      background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
      color: #fff;
    }
    .cover h1 { font-size: 28pt; margin: 0 0 12px; line-height: 1.2; }
    .cover p { font-size: 12pt; opacity: 0.92; max-width: 520px; }
    .cover .meta { margin-top: 32px; font-size: 10pt; opacity: 0.85; }
    h2 {
      font-size: 16pt;
      color: #1e3a5f;
      border-bottom: 2px solid #2d5a87;
      padding-bottom: 6px;
      margin-top: 0;
      page-break-after: avoid;
    }
    h3 { font-size: 12pt; color: #333; margin-top: 18px; page-break-after: avoid; }
    .block { page-break-inside: avoid; margin-bottom: 22px; }
    .toc { page-break-after: always; }
    .toc li { margin: 6px 0; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 10pt; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; vertical-align: top; }
    th { background: #eef3f8; }
    ol, ul { padding-left: 20px; }
    li { margin: 4px 0; }
    .note {
      background: #f0f6fc;
      border-left: 4px solid #2d5a87;
      padding: 10px 14px;
      margin: 12px 0;
      font-size: 10pt;
    }
    .flow {
      background: #f8f8f8;
      border: 1px solid #ddd;
      padding: 12px 16px;
      font-family: ui-monospace, monospace;
      font-size: 9pt;
      white-space: pre-wrap;
      margin: 12px 0;
    }
    figure.shot { margin: 16px 0; page-break-inside: avoid; }
    figure.shot img {
      width: 100%;
      max-height: 420px;
      object-fit: contain;
      object-position: top left;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: #fafafa;
    }
    figcaption {
      font-size: 9pt;
      color: #555;
      margin-top: 6px;
      font-style: italic;
    }
    .page-break { page-break-before: always; }
    code { background: #f0f0f0; padding: 1px 4px; border-radius: 3px; font-size: 9pt; }
  </style>
</head>
<body>
  <div class="cover">
    <h1>VDARVS System Guide</h1>
    <p>Village Digital Administrative Records and Verification System. Complete user guide with roles, workflows, and application screenshots for Lesotho village administration.</p>
    <div class="meta">
      <p><strong>Application URL:</strong> ${BASE_URL}</p>
      <p><strong>Generated:</strong> ${generated}</p>
      <p><strong>Demo password (all accounts):</strong> Vdarvs2026!</p>
    </div>
  </div>

  <div class="toc block">
    <h2>Contents</h2>
    <ol>
      <li>System overview</li>
      <li>User roles and demo accounts</li>
      <li>Getting started</li>
      <li>Core workflow: citizen to chief approval</li>
      <li>Citizen features</li>
      <li>Village chief features</li>
      <li>Village staff features</li>
      <li>District officer features</li>
      <li>Administrator features</li>
      <li>Notifications and audit trail</li>
    </ol>
  </div>

  ${section(
    "1. System overview",
    `<p>VDARVS digitizes village administration in Lesotho: citizen registration, residency verification, official documents, disputes, animal and land records, and staff access control.</p>
    <p>Each user signs in with email and password. The sidebar shows only pages their role can access. Approvals for residency, documents, disputes, animals, and land are performed by the <strong>village chief</strong>, not the administrator.</p>`,
    "01-landing",
    images,
  )}

  ${section(
    "2. User roles and demo accounts",
    `<table>
      <tr><th>Role</th><th>Email</th><th>Main responsibilities</th></tr>
      <tr><td>Citizen</td><td><code>citizen@example.ls</code></td><td>Onboarding, document requests, file disputes</td></tr>
      <tr><td>Village chief</td><td><code>chief.masianokeng@vdarvs.gov.ls</code></td><td>Verify residency, approve documents, resolve disputes, approve animals/land</td></tr>
      <tr><td>Village staff</td><td><code>staff.masianokeng@vdarvs.gov.ls</code></td><td>Register citizens, animals, and land</td></tr>
      <tr><td>District officer</td><td><code>district.maseru@vdarvs.gov.ls</code></td><td>Reports, audit logs, backup residency verification</td></tr>
      <tr><td>Administrator</td><td><code>admin@vdarvs.gov.ls</code></td><td>Approve role access requests only</td></tr>
    </table>
    <div class="note">The administrator does <strong>not</strong> verify citizenship or approve documents. Use the village chief account for those tasks.</div>`,
    "02-login",
    images,
  )}

  <div class="page-break"></div>

  ${section(
    "3. Getting started",
    `<h3>3.1 Sign in</h3>
    <ol>
      <li>Open <strong>${BASE_URL}/login</strong>.</li>
      <li>Enter email and password <code>Vdarvs2026!</code>.</li>
      <li>Click <strong>Sign in</strong>. You are redirected to the dashboard.</li>
    </ol>
    <h3>3.2 New citizen signup</h3>
    <ol>
      <li>From the landing page, click <strong>Sign up</strong>.</li>
      <li>Create an account (default role: citizen).</li>
      <li>Complete <strong>Onboarding</strong> to register in your village.</li>
    </ol>`,
    "03-signup",
    images,
  )}

  ${section(
    "4. Core workflow (citizen to chief)",
    `<div class="flow">1. Citizen → Onboarding → Submit citizen application
2. Village chief → Residency Verification → Verify
3. Citizen → Documents → Request document
4. Village chief → Documents → Approve
5. Citizen → Notifications → sees approval</div>
    <h3>Step 1: Citizen application</h3>
    <ol>
      <li>Sign in as <code>citizen@example.ls</code>.</li>
      <li>Go to <strong>Onboarding</strong> → <strong>Apply as citizen</strong>.</li>
      <li>Fill the form (Masianokeng / Maseru defaults work).</li>
      <li>Click <strong>Submit citizen application</strong>.</li>
    </ol>`,
    "05-citizen-onboarding",
    images,
  )}

  ${section(
    "Step 2: Chief verifies residency",
    `<ol>
      <li>Sign in as <code>chief.masianokeng@vdarvs.gov.ls</code>.</li>
      <li>Open <strong>Residency Verification</strong>.</li>
      <li>Click <strong>Verify</strong> on the pending citizen.</li>
      <li>Citizen receives a notification.</li>
    </ol>`,
    "10-chief-residency",
    images,
  )}

  ${section(
    "Steps 3 and 4: Document requests",
    `<h3>Citizen requests</h3>
    <ol>
      <li>Citizen → <strong>Documents</strong> → <strong>Request document</strong>.</li>
      <li>Choose type, enter title, submit.</li>
    </ol>
    <h3>Chief approves</h3>
    <ol>
      <li>Chief → <strong>Documents</strong> → <strong>Approve</strong> or <strong>Reject</strong>.</li>
    </ol>`,
    "06-citizen-documents",
    images,
  )}

  ${figure("Chief documents view", "11-chief-documents", images)}

  <div class="page-break"></div>

  ${section(
    "5. Citizen features",
    `<ul>
      <li><strong>Dashboard</strong> — residency status, counts, workflow guide.</li>
      <li><strong>Documents</strong> — request and track certificates.</li>
      <li><strong>Disputes</strong> — file cases for chief mediation.</li>
      <li><strong>Notifications</strong> — updates on your requests.</li>
    </ul>`,
    "04-citizen-dashboard",
    images,
  )}

  ${figure("Citizen disputes", "07-citizen-disputes", images)}
  ${figure("Citizen notifications", "08-citizen-notifications", images)}

  ${section(
    "6. Village chief features",
    `<ul>
      <li><strong>Residency Verification</strong> — verify new citizens.</li>
      <li><strong>Documents</strong> — approve or reject requests.</li>
      <li><strong>Disputes</strong> — Resolve or Dismiss.</li>
      <li><strong>Animals / Land</strong> — approve staff registrations.</li>
    </ul>`,
    "09-chief-dashboard",
    images,
  )}

  ${figure("Chief disputes", "12-chief-disputes", images)}
  ${figure("Chief animals", "13-chief-animals", images)}
  ${figure("Chief land", "14-chief-land", images)}

  <div class="page-break"></div>

  ${section(
    "7. Village staff features",
    `<ol>
      <li><strong>Citizens → Register citizen</strong> — sends record to chief queue.</li>
      <li><strong>Animals → Register animal</strong> — chief approves.</li>
      <li><strong>Land → Register land</strong> — chief approves.</li>
    </ol>`,
    "15-staff-citizens",
    images,
  )}

  ${figure("Register citizen form", "16-staff-register-citizen", images)}
  ${figure("Register animal form", "17-staff-register-animal", images)}
  ${figure("Register land form", "18-staff-register-land", images)}

  ${section(
    "8. District officer features",
    `<ul>
      <li><strong>Reports</strong> — district statistics.</li>
      <li><strong>Audit Logs</strong> — system action history.</li>
    </ul>`,
    "19-district-reports",
    images,
  )}

  ${figure("Audit logs", "20-district-audit-logs", images)}

  ${section(
    "9. Administrator features",
    `<ol>
      <li>Review <strong>Role Requests</strong> when users request staff access.</li>
      <li>Approve or reject. User role updates in the database.</li>
      <li><strong>Staff Accounts</strong> is read-only.</li>
    </ol>`,
    "21-admin-dashboard",
    images,
  )}

  ${figure("Role requests", "22-admin-role-requests", images)}
  ${figure("Staff accounts", "23-admin-users", images)}

  ${section(
    "10. Notifications and audit trail",
    `<p>Approvals create citizen notifications and audit log entries. Chiefs get notified on new applications, documents, and disputes. Administrators get notified on role requests.</p>
    <p>Automated test: <code>pnpm test:e2e</code>. See <code>docs/demo-flow.md</code>.</p>`,
    "",
    images,
  )}

</body>
</html>`;

  await writeFile(HTML_PATH, html, "utf8");
}

async function main() {
  console.log("Generating VDARVS system guide...");
  console.log(`Target: ${BASE_URL}`);

  await mkdir(SHOTS_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  let captured;
  try {
    captured = await captureAll(page);
    console.log(`Captured ${captured.length} screenshots`);
  } finally {
    await browser.close();
  }

  const images = {};
  for (const { id, file } of captured) {
    images[id] = await toDataUri(file);
  }

  await buildHtml(images);

  const pdfBrowser = await chromium.launch({ headless: true });
  const pdfPage = await pdfBrowser.newPage();
  await pdfPage.goto(`file://${HTML_PATH}`, { waitUntil: "load" });
  await pdfPage.pdf({
    path: PDF_PATH,
    format: "A4",
    printBackground: true,
    margin: { top: "12mm", bottom: "14mm", left: "12mm", right: "12mm" },
  });
  await pdfBrowser.close();

  console.log(`HTML: ${HTML_PATH}`);
  console.log(`PDF:  ${PDF_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
