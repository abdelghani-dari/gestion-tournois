import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import pg from "pg";

const apiBase = (process.env.E2E_API_URL ?? "http://backend:8000/api").replace(/\/+$/, "");
const password = "password";
const { Client } = pg;

function uniqueEmail() {
  return `e2e-login-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

async function routeApiToBackend(page: Page) {
  await page.route("http://localhost:8000/api/**", async (route) => {
    const requestUrl = new URL(route.request().url());
    const path = requestUrl.pathname.replace(/^\/api/, "");

    await route.continue({
      url: `${apiBase}${path}${requestUrl.search}`,
    });
  });
}

async function registerUser(request: APIRequestContext, email: string) {
  const response = await request.post(`${apiBase}/register`, {
    data: {
      name: "E2E Login User",
      email,
      password,
      password_confirmation: password,
    },
  });

  expect(response.status()).toBe(201);
}

async function activateRegisteredUser(email: string) {
  // Registration creates pending users; this activates only the E2E user without relying on seeded accounts.
  const client = new Client({
    host: process.env.E2E_DB_HOST ?? "postgres",
    port: Number(process.env.E2E_DB_PORT ?? 5432),
    database: process.env.E2E_DB_DATABASE ?? "gestion_tournois",
    user: process.env.E2E_DB_USERNAME ?? "postgres",
    password: process.env.E2E_DB_PASSWORD ?? "postgres",
  });

  await client.connect();

  try {
    const result = await client.query(
      "UPDATE users SET account_status = 'active', approved_at = NOW() WHERE email = $1 RETURNING id",
      [email],
    );

    expect(result.rowCount).toBe(1);
  } finally {
    await client.end();
  }
}

test("login flow works from frontend to backend", async ({ page, request }) => {
  const email = uniqueEmail();

  await registerUser(request, email);
  await activateRegisteredUser(email);
  await routeApiToBackend(page);

  await page.goto("/login");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: /se connecter/i }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  await expect(page.getByText("Mes tournois", { exact: true })).toBeVisible({ timeout: 15_000 });

  const token = await page.evaluate(() => window.localStorage.getItem("auth_token"));
  expect(token).toBeTruthy();
});
