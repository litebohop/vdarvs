/**
 * End-to-end demo flow test for VDARVS (browser + DB verification).
 * Usage: node scripts/e2e-demo-flow.mjs
 */
import { chromium } from "playwright";
import postgres from "postgres";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function loadEnv() {
  const envPath = resolve(ROOT, ".env.local");
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

loadEnv();

const BASE_URL = process.env.BASE_URL || "https://vdarvs-ebon.vercel.app";
const PASSWORD = "Vdarvs2026!";
const CITIZEN_EMAIL = "citizen@example.ls";
const CHIEF_EMAIL = "chief.masianokeng@vdarvs.gov.ls";
const TEST_NATIONAL_ID = `E2E-${Date.now()}`;

const results = [];

function step(name, status, detail) {
  results.push({ name, status, detail });
  const icon = status === "pass" ? "PASS" : status === "fail" ? "FAIL" : "INFO";
  console.log(`[${icon}] ${name}${detail ? `: ${detail}` : ""}`);
}

async function goto(page, path) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await page.goto(`${BASE_URL}${path}`, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
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
}

async function logout(page) {
  await page.getByRole("button", { name: "Log out" }).click();
  await page.waitForURL(/\/login/, { timeout: 15000 });
}

async function resetCitizenData(sql) {
  const profile = await sql`
    SELECT id FROM profiles WHERE email = ${CITIZEN_EMAIL} LIMIT 1
  `;
  if (!profile.length) return;

  const citizens = await sql`
    SELECT id FROM citizens WHERE email = ${CITIZEN_EMAIL}
  `;
  for (const row of citizens) {
    await sql`DELETE FROM documents WHERE citizen_id = ${row.id}`;
    await sql`DELETE FROM disputes WHERE complainant_id = ${row.id}`;
    await sql`DELETE FROM residency_requests WHERE citizen_id = ${row.id}`;
    await sql`DELETE FROM citizens WHERE id = ${row.id}`;
  }

  await sql`
    DELETE FROM notifications WHERE user_id = ${profile[0].id}
  `;
}

async function main() {
  const sql = postgres(process.env.DATABASE_URL, { ssl: "require", max: 1 });
  let browser;
  let failed = false;

  try {
    step("Environment", "info", `BASE_URL=${BASE_URL}`);
    await resetCitizenData(sql);
    step("DB reset", "pass", `Cleared prior records for ${CITIZEN_EMAIL}`);

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    // 1. Citizen onboarding
    await login(page, CITIZEN_EMAIL);
    await goto(page, "/onboarding");
    await page.getByRole("tab", { name: "Apply as citizen" }).click();
    await page.locator('input[name="firstName"]').fill("Palesa");
    await page.locator('input[name="lastName"]').fill("Molapo");
    await page.locator('input[name="nationalId"]').fill(TEST_NATIONAL_ID);
    await page.locator('input[name="dateOfBirth"]').fill("1995-03-15");
    await page.locator('input[name="phone"]').fill("+266 5888 5001");
    await page.getByRole("button", { name: "Submit citizen application" }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 45000 });
    await page.getByText("Waiting for residency verification").waitFor({ timeout: 15000 });
    step("Citizen onboarding", "pass", "Application submitted, pending banner visible");
    await logout(page);

    const pendingResidency = await sql`
      SELECT rr.id, rr.status
      FROM residency_requests rr
      JOIN citizens c ON c.id = rr.citizen_id
      WHERE c.email = ${CITIZEN_EMAIL}
      ORDER BY rr.requested_at DESC
      LIMIT 1
    `;
    if (!pendingResidency.length || pendingResidency[0].status !== "pending") {
      throw new Error("Expected pending residency request in database");
    }
    step("DB residency pending", "pass", pendingResidency[0].id);

    // 2. Chief verifies residency
    await login(page, CHIEF_EMAIL);
    await goto(page, "/residency");
    await page.getByRole("button", { name: "Verify" }).first().click();
    await page.getByText("Residency verified successfully").waitFor({ timeout: 15000 });
    step("Chief residency verify", "pass", "Verify clicked, success toast shown");
    await logout(page);

    const verifiedCitizen = await sql`
      SELECT verification_status FROM citizens WHERE email = ${CITIZEN_EMAIL} LIMIT 1
    `;
    if (verifiedCitizen[0]?.verification_status !== "verified") {
      throw new Error(`Citizen not verified: ${verifiedCitizen[0]?.verification_status}`);
    }
    step("DB citizen verified", "pass", verifiedCitizen[0].verification_status);

    // 3. Citizen requests document
    await login(page, CITIZEN_EMAIL);
    await goto(page, "/documents");
    await page.getByText("Who approves your documents?").waitFor({ timeout: 15000 });
    await page.getByRole("button", { name: "Request document" }).click();
    await page.getByPlaceholder("e.g. Residency Certificate for Masianokeng").fill(
      "E2E Residency Certificate Test",
    );
    await page.getByRole("button", { name: "Submit request" }).click();
    await page.getByText("Document request submitted").waitFor({ timeout: 15000 });
    step("Citizen document request", "pass", "Request submitted");
    await logout(page);

    const pendingDoc = await sql`
      SELECT d.id, d.status, d.title FROM documents d
      JOIN citizens c ON c.id = d.citizen_id
      WHERE c.email = ${CITIZEN_EMAIL} AND d.title = 'E2E Residency Certificate Test'
      LIMIT 1
    `;
    if (!pendingDoc.length || pendingDoc[0].status !== "pending") {
      throw new Error("Expected pending document in database");
    }
    step("DB document pending", "pass", pendingDoc[0].id);

    // 4. Chief approves document
    await login(page, CHIEF_EMAIL);
    await goto(page, "/documents");
    await page.getByRole("button", { name: "Approve" }).first().click();
    await page.getByText("Document approved").waitFor({ timeout: 15000 });
    step("Chief document approve", "pass", "Approve clicked, success toast shown");
    await logout(page);

    const approvedDoc = await sql`
      SELECT status FROM documents WHERE id = ${pendingDoc[0].id}
    `;
    if (approvedDoc[0]?.status !== "approved") {
      throw new Error(`Document not approved: ${approvedDoc[0]?.status}`);
    }
    step("DB document approved", "pass", approvedDoc[0].status);

    const citizenProfile = await sql`SELECT id FROM profiles WHERE email = ${CITIZEN_EMAIL}`;
    const citizenNotif = await sql`
      SELECT title FROM notifications
      WHERE user_id = ${citizenProfile[0].id}
      AND title ILIKE '%document%'
      ORDER BY created_at DESC LIMIT 1
    `;
    if (!citizenNotif.length) {
      throw new Error("Citizen did not receive document notification");
    }
    step("Citizen notification", "pass", citizenNotif[0].title);

    step("Full flow", "pass", "All steps completed successfully");
  } catch (error) {
    failed = true;
    step("Full flow", "fail", error.message);
    console.error(error);
  } finally {
    if (browser) await browser.close();
    await sql.end();
  }

  console.log("\n--- Summary ---");
  for (const r of results) {
    console.log(`${r.status.toUpperCase().padEnd(4)} ${r.name}${r.detail ? ` (${r.detail})` : ""}`);
  }

  process.exit(failed ? 1 : 0);
}

main();
